import { env } from "~/env";
import type { NotificationType, PrismaClient } from "../../prisma/generated/prisma";
import Pusher from "pusher";

type TxClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

const pusher = new Pusher({
  appId: env.PUSHER_APP_ID,
  key: env.PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.PUSHER_CLUSTER,
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