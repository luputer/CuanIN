import { createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "~/server/api/routers/auth";
import { catalogRouter } from "./routers/catalog";
import { productsRouter } from "./routers/products";
import { s3Router } from "./routers/s3";
import { formFieldsRouter } from "./routers/formFields";
import { purchasesRouter } from "./routers/purchases";
import { profileRouter } from "./routers/profile";
import { withdrawalsRouter } from "./routers/withdrawals";
import { analyticsRouter } from "./routers/analytics";
import { creatorsRouter } from "./routers/creators";
import { vouchersRouter } from "./routers/vouchers";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  catalog: catalogRouter,
  products: productsRouter,
  s3: s3Router,
  formFields: formFieldsRouter,
  purchases: purchasesRouter,
  profile: profileRouter,
  withdrawals: withdrawalsRouter,
  analytics: analyticsRouter,
  creators: creatorsRouter,
  vouchers: vouchersRouter,
});

export type AppRouter = typeof appRouter;
