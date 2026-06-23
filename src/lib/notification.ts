import type { NotificationType, PrismaClient } from "../../prisma/generated/prisma";
import Pusher from "pusher";

type TxClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;




const pusher = new Pusher({
  appId: "2169997",
  key: "3faea90fc4a2235e062f",
  secret: "d89d681066f39074f0e8",
  cluster: "ap2",
  useTLS: true,
});

export async function createNotification(
  db: PrismaClient | TxClient,
  params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    refId?: string | null;
  },
) {
  const notif = await db.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      refId: params.refId ?? null,
    },
  });

  // Trigger Pusher — fire and forget, jangan block
  void pusher.trigger(`user-${params.userId}`, "new-notification", {
    id: notif.id,
    title: notif.title,
    message: notif.message,
    type: notif.type,
    createdAt: notif.createdAt,
  });

  return notif;
}