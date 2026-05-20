import { initTRPC, TRPCError } from "@trpc/server";
import { type NextRequest } from "next/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export const createTRPCContext = async (opts: { req?: NextRequest }) => {
    const session = await auth();
    return { db, session, ...opts };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError:
                    error.cause instanceof ZodError ? error.cause.flatten() : null,
            },
        };
    },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

/** Public — no auth required */
export const publicProcedure = t.procedure;

/** Protected — must be signed in */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
        ctx: { session: { ...ctx.session, user: ctx.session.user } },
    });
});

/** Admin only — must be signed in as ADMIN */
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
    if (ctx.session?.user?.role !== "ADMIN") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
        ctx: { session: { ...ctx.session, user: ctx.session.user } },
    });
});

/** Creator only — must be signed in as CREATOR */
export const creatorProcedure = t.procedure.use(({ ctx, next }) => {
    if (ctx.session?.user?.role !== "CREATOR") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
        ctx: { session: { ...ctx.session, user: ctx.session.user } },
    });
});
