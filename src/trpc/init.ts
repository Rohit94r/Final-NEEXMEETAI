import { getSessionOrNull } from '@/lib/auth';
import { getEntityCreationAccess } from '@/modules/premium/lib/subscription';
import { initTRPC, TRPCError } from '@trpc/server';
import { headers } from 'next/headers';
import { cache } from 'react';
export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: 'user_123' };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await getSessionOrNull(await headers());

  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }

  return next({ ctx: { ...ctx, auth: session } });
});
export const premiumProcedure = (entity: "meetings" | "agents") =>
  protectedProcedure.use(async ({ ctx, next }) => {
    const access = await getEntityCreationAccess(ctx.auth.user.id, entity);

    if (entity === "meetings" && access.isBlocked) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You have reached the maximum number of free meetings",
      });
    }

    if (entity === "agents" && access.isBlocked) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You have reached the maximum number of free agents",
      });
    }

    return next({ ctx });
  });
