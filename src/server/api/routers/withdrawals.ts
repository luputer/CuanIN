import { TRPCError } from "@trpc/server";
import { withdrawalSchema } from "~/lib/validation";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getCreatorBalance, getAdminBalance } from "~/lib/balance";
import { sendWithdrawalPendingEmail } from "~/lib/email";
import { createNotification } from "~/lib/notification";

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
      const payoutAmount = input.amount;
      const platformFee = isAdmin ? 0 : Math.round(payoutAmount * 0.02);
      const transferFee = 4000;
      const totalDeduction = payoutAmount + platformFee + transferFee;

      if (payoutAmount < 10000) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nominal penarikan minimal Rp10.000.",
        });
      }

      const bank = BANK_OPTIONS[input.bank];

      const withdrawal = await ctx.db.$transaction(async (tx) => {
        // Cek saldo
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
            message: `Saldo tidak cukup. Total yang dibutuhkan: Rp${totalDeduction.toLocaleString("id-ID")}`,
          });
        }

        // Buat withdrawal dengan status PENDING
        const newWithdrawal = await tx.withdrawal.create({
          data: {
            userId: ctx.session.user.id,
            amount: totalDeduction,
            feeAmount: platformFee,
            bankCode: bank.channelCode,
            bankName: bank.name,
            accountNumber: input.accountNumber,
            accountHolderName: input.accountHolderName,
            email: ctx.session.user.email ?? "",
            referenceId: `WD-${ctx.session.user.id.slice(0, 5)}-${Date.now()}`,
            status: "PENDING",
          },
        });

        // Debit ledger
        await tx.balanceEntry.create({
          data: {
            userId: ctx.session.user.id,
            amount: -totalDeduction,
            type: isAdmin ? "ADMIN_WITHDRAWAL_REQUESTED" : "WITHDRAWAL_REQUESTED",
            refId: newWithdrawal.id,
            note: `Penarikan ke ${bank.name} (${input.accountNumber}). Bersih: ${payoutAmount}`,
          },
        });

        // Platform fee ke admin (hanya untuk creator)
        if (!isAdmin && platformFee > 0) {
          const admin = await tx.user.findFirst({ where: { role: "ADMIN" } });
          if (admin) {
            await tx.balanceEntry.create({
              data: {
                userId: admin.id,
                amount: platformFee,
                type: "PLATFORM_FEE_EARNED",
                refId: newWithdrawal.id,
                note: `Platform fee (2%) dari penarikan ${ctx.session.user.name ?? "creator"} (${newWithdrawal.id})`,
              },
            });
          }
        }

        // Kirim notifikasi ke creator
        try {
          await createNotification(tx, {
            userId: ctx.session.user.id,
            type: "WITHDRAWAL",
            title: "Penarikan Saldo Diproses",
            message: `Permintaan penarikan saldo Rp${payoutAmount.toLocaleString("id-ID")} ke ${bank.name} sedang diproses oleh admin.`,
            refId: newWithdrawal.id,
          });
        } catch (notifError) {
          console.error("❌ Gagal kirim notifikasi:", notifError);
        }

        // Kirim notifikasi ke semua admin
        try {
          const admins = await tx.user.findMany({ where: { role: "ADMIN" } });
          for (const admin of admins) {
            await createNotification(tx, {
              userId: admin.id,
              type: "WITHDRAWAL",
              title: "Penarikan Saldo Baru",
              message: `${ctx.session.user.name ?? "Kreator"} mengajukan penarikan saldo Rp${payoutAmount.toLocaleString("id-ID")} ke ${bank.name}.`,
              refId: newWithdrawal.id,
            });
          }
        } catch (notifError) {
          console.error("❌ Gagal kirim notifikasi admin:", notifError);
        }

        try {
          await sendWithdrawalPendingEmail({
            email: ctx.session.user.email ?? "",
            amount: totalDeduction,
            feeAmount: platformFee,
            bankName: bank.name,
            accountNumber: input.accountNumber,
            accountHolderName: input.accountHolderName,
          });
        } catch (emailError) {
          console.error("Email gagal dikirim:", emailError);
        }

        return newWithdrawal;
      });

      return withdrawal;
    }),
});