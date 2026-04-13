import { createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "~/server/api/routers/auth";
import { catalogRouter } from "./routers/catalog";
import { productsRouter } from "./routers/products";

export const appRouter = createTRPCRouter({
    auth: authRouter,
    catalog: catalogRouter,
    products: productsRouter,
});


export type AppRouter = typeof appRouter;
