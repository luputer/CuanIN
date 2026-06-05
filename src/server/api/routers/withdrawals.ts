import { TRPCError } from "@trpc/server";
import { withdrawalSchema } from "~/lib/validation";
import {
  createPayout as createXenditPayout,
  simulatePayoutSuccess,
} from "~/lib/xendit";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getCreatorBalance, getAdminBalance } from "~/lib/balance";

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
      // Model baru: Nominal yang diinput adalah nominal BERSIH yang diterima di bank
      const payoutAmount = input.amount; // Nominal yang dikirim via Xendit
      const platformFee = isAdmin ? 0 : Math.round(payoutAmount * 0.02);
      const xenditFee = 4000;
      
      const totalDeduction = payoutAmount + platformFee + xenditFee;

      if (payoutAmount < 10000) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nominal penarikan (nominal diterima) minimal Rp10.000.",
        });
      }

      const withdrawal = await ctx.db.$transaction(async (tx) => {
        let balanceAvailable = 0;
        
        if (isAdmin) {
          const adminBalance = await getAdminBalance(tx);
          balanceAvailable = adminBalance.balance;
        } else {
          const balance = await getCreatorBalance(tx, ctx.session.user.id);
          balanceAvailable = balance.balance;
        }

        if (totalDeduction > balanceAvailable) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Saldo tidak cukup untuk menutupi nominal tarik + biaya. Total yang dibutuhkan: Rp${totalDeduction.toLocaleString("id-ID")}`,
          });
        }

        const bank = BANK_OPTIONS[input.bank];

        const newWithdrawal = await tx.withdrawal.create({
          data: {
            userId: ctx.session.user.id,
            amount: totalDeduction, // Saldo CuanIN dipotong total (Bersih + Fee)
            feeAmount: platformFee,
            bankCode: bank.channelCode,
            bankName: bank.name,
            accountNumber: input.accountNumber,
            accountHolderName: input.accountHolderName,
            email: ctx.session.user.email ?? "",
            referenceId:
              "TEMP-" +
              ctx.session.user.id.slice(0, 5) +
              "-" +
              Date.now().toString(),
          },
        });

        if (isAdmin) {
          // Catat di ledger admin (debit)
          await tx.balanceEntry.create({
            data: {
              userId: ctx.session.user.id,
              amount: -totalDeduction,
              type: "ADMIN_WITHDRAWAL_REQUESTED",
              refId: newWithdrawal.id,
              note: `Admin withdrawal ke ${bank.name} (${input.accountNumber}). Bersih: ${payoutAmount}`,
            },
          });
        } else {
          // Catat di ledger creator (debit)
          await tx.balanceEntry.create({
            data: {
              userId: ctx.session.user.id,
              amount: -totalDeduction,
              type: "WITHDRAWAL_REQUESTED",
              refId: newWithdrawal.id,
              note: `Penarikan saldo ke ${bank.name} (${input.accountNumber}). Bersih: ${payoutAmount}`,
            },
          });

          // Kasih fee ke Admin pertama yang ketemu
          if (platformFee > 0) {
            const admin = await tx.user.findFirst({ where: { role: "ADMIN" } });
            if (admin) {
              await tx.balanceEntry.create({
                data: {
                  userId: admin.id,
                  amount: platformFee,
                  type: "PLATFORM_FEE_EARNED",
                  refId: newWithdrawal.id,
                  note: `Platform fee (2%) dari penarikan ${ctx.session.user.name || "creator"} (${newWithdrawal.id})`,
                },
              });
            }
          }
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
            (isAdmin ? "Admin " : "") + "Penarikan saldo CuanIN " + bank.name + " - " + withdrawal.id,
        });

        const updated = await ctx.db.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            xenditPayoutId: payout.id,
            referenceId: withdrawal.id,
            status: payout.status === "SUCCEEDED" ? "SUCCEEDED" : payout.status === "REQUESTED" ? "REQUESTED" : "ACCEPTED",
            failureCode: payout.failure_code,
          },
        });

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

        if (isAdmin) {
          updates.push(
            ctx.db.balanceEntry.create({
              data: {
                userId: ctx.session.user.id,
                amount: withdrawal.amount,
                type: "ADMIN_WITHDRAWAL_REQUESTED", // positif = kredit balik
                refId: withdrawal.id,
                note: `Rollback admin withdrawal: ${error instanceof Error ? error.message : "Gagal membuat payout"} — saldo dikembalikan`,
              },
            })
          );
        } else {
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

          if (platformFee > 0) {
            const admin = await ctx.db.user.findFirst({ where: { role: "ADMIN" } });
            if (admin) {
              updates.push(
                ctx.db.balanceEntry.create({
                  data: {
                    userId: admin.id,
                    amount: -platformFee,
                    type: "PLATFORM_FEE_EARNED",
                    refId: withdrawal.id,
                    note: `Rollback platform fee (2%) karena payout gagal: ${withdrawal.id}`,
                  },
                })
              );
            }
          }
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
