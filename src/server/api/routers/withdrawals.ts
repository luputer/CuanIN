import { TRPCError } from "@trpc/server";
import { withdrawalSchema } from "~/lib/validation";
import {
  createPayout as createXenditPayout,
  simulatePayoutSuccess,
} from "~/lib/xendit";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getCreatorBalance } from "~/lib/balance";

const BANK_OPTIONS = {
  bca: { name: "BCA", channelCode: "ID_BCA" },
  bni: { name: "BNI", channelCode: "ID_BNI" },
  bri: { name: "BRI", channelCode: "ID_BRI" },
  mandiri: { name: "Mandiri", channelCode: "ID_MANDIRI" },
  cimb: { name: "CIMB Niaga", channelCode: "ID_CIMB" },
  bsi: { name: "BSI", channelCode: "ID_BSI" },
} as const;

export const withdrawalsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(withdrawalSchema)
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.session.user.role === "ADMIN";
      // Hitung fee platform 2% + biaya transfer Xendit
      const platformFee = isAdmin ? 0 : Math.round(input.amount * 0.02); // Admin tidak kena fee aplikasi 2%
      const xenditFee = 4000; // Biaya transfer Xendit flat ke bank
      const totalFee = platformFee + xenditFee;
      const payoutAmount = input.amount - totalFee;

      if (payoutAmount < 10000) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nominal penarikan terlalu kecil. Saldo yang diterima (setelah fee) minimal Rp10.000.",
        });
      }

      const withdrawal = await ctx.db.$transaction(async (tx) => {
        let balanceAvailable = 0;
        
        if (isAdmin) {
          const totalIncomeResult = await tx.withdrawal.aggregate({
            where: { status: "SUCCEEDED" },
            _sum: { feeAmount: true },
          });
          const adminWithdrawnResult = await tx.withdrawal.aggregate({
            where: { 
                userId: ctx.session.user.id,
                status: { in: ["PENDING", "ACCEPTED", "REQUESTED", "SUCCEEDED"] }
            },
            _sum: { amount: true },
          });
          const totalIncome = Number(totalIncomeResult._sum.feeAmount ?? 0);
          const adminWithdrawn = Number(adminWithdrawnResult._sum.amount ?? 0);
          balanceAvailable = Math.max(0, totalIncome - adminWithdrawn);
        } else {
          const balance = await getCreatorBalance(tx, ctx.session.user.id);
          balanceAvailable = balance.balance;
        }

        if (input.amount > balanceAvailable) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Jumlah penarikan melebihi saldo tersedia.",
          });
        }

        const bank = BANK_OPTIONS[input.bank];

        const newWithdrawal = await tx.withdrawal.create({
          data: {
            userId: ctx.session.user.id,
            amount: input.amount, // Saldo CuanIN tetap dipotong full (input.amount)
            feeAmount: platformFee,
            bankCode: bank.channelCode,
            bankName: bank.name,
            accountNumber: input.accountNumber,
            accountHolderName: input.accountHolderName,
            email: input.email,
            referenceId:
              "TEMP-" +
              ctx.session.user.id.slice(0, 5) +
              "-" +
              Date.now().toString(),
          },
        });

        if (!isAdmin) {
          // Catat di ledger (debit)
          await tx.balanceEntry.create({
            data: {
              userId: ctx.session.user.id,
              amount: -input.amount,
              type: "WITHDRAWAL_REQUESTED",
              refId: newWithdrawal.id,
              note: `Penarikan saldo ke ${bank.name} (${input.accountNumber})`,
            },
          });
        }

        return newWithdrawal;
      });

      try {
        const bank = BANK_OPTIONS[input.bank];
        const payout = await createXenditPayout({
          referenceId: withdrawal.id,
          amount: payoutAmount, // Nominal bersih yang masuk ke rekening kreator
          channelCode: bank.channelCode,
          accountNumber: input.accountNumber,
          accountHolderName: input.accountHolderName,
          description:
            "Penarikan saldo CuanIN " + bank.name + " - " + withdrawal.id,
        });

        const updated = await ctx.db.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            xenditPayoutId: payout.id,
            referenceId: withdrawal.id,
            status: payout.status === "REQUESTED" ? "REQUESTED" : "ACCEPTED",
            failureCode: payout.failure_code,
          },
        });

        // withdrawalsRouter.ts — hapus bagian ini
        if (process.env.ENABLE_PAYOUT_SIMULATE === "true") {
          setTimeout(() => {
            void simulatePayoutSuccess(payout.id, withdrawal.id).catch((err) =>
              console.error("❌ Simulate payout error:", err),
            );
          }, 3000);
        }
        return updated;
      } catch (error) {
        // Jika gagal buat payout di Xendit, kembalikan saldo di ledger
        const updates: any[] = [
          ctx.db.withdrawal.update({
            where: { id: withdrawal.id },
            data: {
              status: "FAILED",
              failureMessage:
                error instanceof Error ? error.message : "Gagal membuat payout",
            },
          }),
        ];

        if (!isAdmin) {
          updates.push(
            ctx.db.balanceEntry.create({
              data: {
                userId: ctx.session.user.id,
                amount: withdrawal.amount,
                type: "WITHDRAWAL_FAILED",
                refId: withdrawal.id,
                note: `Gagal payout: ${error instanceof Error ? error.message : "Gagal membuat payout"} — saldo dikembalikan`,
              },
            })
          );
        }

        await ctx.db.$transaction(updates);

        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error ? error.message : "Gagal membuat payout",
        });
      }
    }),
});
