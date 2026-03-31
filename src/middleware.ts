import NextAuth from "next-auth";
import { authConfig } from "~/server/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
    // Matched paths for the middleware
    matcher: ["/dashboard/:path*", "/sign-in", "/sign-up", "/"],
};
