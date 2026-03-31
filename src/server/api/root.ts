import { createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "~/server/api/routers/auth";
import { catalogRouter } from "./routers/catalog";

export const appRouter = createTRPCRouter({
    auth: authRouter,
    catalog: catalogRouter,
});

export type AppRouter = typeof appRouter;
