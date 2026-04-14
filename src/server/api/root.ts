import { createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "~/server/api/routers/auth";
import { catalogRouter } from "./routers/catalog";
import { productsRouter } from "./routers/products";
import { s3Router } from "./routers/s3";

export const appRouter = createTRPCRouter({
    auth: authRouter,
    catalog: catalogRouter,
    products: productsRouter,
    s3: s3Router,
});


export type AppRouter = typeof appRouter;
