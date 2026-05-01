import { handlers } from "~/server/auth";

export const runtime = "nodejs";

export const { GET, POST } = handlers;

console.log(process.env.AUTH_URL)
console.log(process.env.NEXTAUTH_URL)