import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, or } from "drizzle-orm";

import { db } from "@/db";
import { agents, decisions, meetings, roomMembers, rooms, tasks, user } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { getOptionalServerEnv } from "@/lib/env";

// helper — check room access (owner or member)
async function getRoomAccess(roomId: string, userId: string) {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
  if (!room) return null;

  if (room.ownerId === userId) return { room, role: "admin" as const };

  const [member] = await db
    .select()
    .from(roomMembers)
    .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)));

  if (!member) return null;
  return { room, role: member.role };
}

export const roomsRouter = createTRPCRouter({
  // ─── Room CRUD ──────────────────────────────────────────────────────────────

  getMany: protectedProcedure.query(async ({ ctx }) => {
    const owned = await db.select().from(rooms).where(eq(rooms.ownerId, ctx.auth.user.id));

    const memberRoomIds = await db
      .select({ roomId: roomMembers.roomId })
      .from(roomMembers)
      .where(eq(roomMembers.userId, ctx.auth.user.id));

    const memberRooms =
      memberRoomIds.length > 0
        ? await db
            .select()
            .from(rooms)
            .where(
              or(...memberRoomIds.map((r) => eq(rooms.id, r.roomId))),
            )
        : [];

    const all = [...owned, ...memberRooms.filter((r) => r.ownerId !== ctx.auth.user.id)];
    return all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const access = await getRoomAccess(input.id, ctx.auth.user.id);
      if (!access) throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });

      const members = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: roomMembers.role,
          joinedAt: roomMembers.createdAt,
        })
        .from(roomMembers)
        .innerJoin(user, eq(roomMembers.userId, user.id))
        .where(eq(roomMembers.roomId, input.id));

      const owner = await db
        .select({ id: user.id, name: user.name, email: user.email, image: user.image })
        .from(user)
        .where(eq(user.id, access.room.ownerId))
        .then((r) => r[0]);

      const defaultAgent = access.room.defaultAgentId
        ? await db
            .select({ id: agents.id, name: agents.name })
            .from(agents)
            .where(eq(agents.id, access.room.defaultAgentId))
            .then((r) => r[0] ?? null)
        : null;

      return {
        ...access.room,
        role: access.role,
        isOwner: access.room.ownerId === ctx.auth.user.id,
        owner,
        defaultAgent,
        members: [
          { ...owner, role: "admin" as const, joinedAt: access.room.createdAt },
          ...members,
        ],
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(300).nullish(),
        isPrivate: z.boolean().default(false),
        defaultAgentId: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [created] = await db
        .insert(rooms)
        .values({ ...input, ownerId: ctx.auth.user.id })
        .returning();
      return created;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(300).nullish(),
        isPrivate: z.boolean().optional(),
        defaultAgentId: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const [updated] = await db
        .update(rooms)
        .set({ ...rest, updatedAt: new Date() })
        .where(and(eq(rooms.id, id), eq(rooms.ownerId, ctx.auth.user.id)))
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      return updated;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [removed] = await db
        .delete(rooms)
        .where(and(eq(rooms.id, input.id), eq(rooms.ownerId, ctx.auth.user.id)))
        .returning();
      if (!removed) throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      return removed;
    }),

  rename: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(rooms)
        .set({ name: input.name, updatedAt: new Date() })
        .where(and(eq(rooms.id, input.id), eq(rooms.ownerId, ctx.auth.user.id)))
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      return updated;
    }),

  toggleStar: protectedProcedure
    .input(z.object({ id: z.string(), isStarred: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(rooms)
        .set({ isStarred: input.isStarred, updatedAt: new Date() })
        .where(and(eq(rooms.id, input.id), eq(rooms.ownerId, ctx.auth.user.id)))
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      return updated;
    }),

  // ─── Members ────────────────────────────────────────────────────────────────

  joinByCode: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [room] = await db.select().from(rooms).where(eq(rooms.inviteCode, input.code));
      if (!room) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid invite code" });

      if (room.ownerId === ctx.auth.user.id) {
        return { roomId: room.id, alreadyMember: true };
      }

      await db
        .insert(roomMembers)
        .values({ roomId: room.id, userId: ctx.auth.user.id, role: "member" })
        .onConflictDoNothing();

      return { roomId: room.id, alreadyMember: false };
    }),

  inviteMember: protectedProcedure
    .input(z.object({ roomId: z.string(), email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const [room] = await db
        .select()
        .from(rooms)
        .where(and(eq(rooms.id, input.roomId), eq(rooms.ownerId, ctx.auth.user.id)));
      if (!room) throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });

      const [invitedUser] = await db.select().from(user).where(eq(user.email, input.email));
      if (!invitedUser) throw new TRPCError({ code: "NOT_FOUND", message: "No account with that email" });
      if (invitedUser.id === ctx.auth.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "You are already the room admin" });

      await db
        .insert(roomMembers)
        .values({ roomId: input.roomId, userId: invitedUser.id, role: "member" })
        .onConflictDoNothing();

      return invitedUser;
    }),

  removeMember: protectedProcedure
    .input(z.object({ roomId: z.string(), memberUserId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [room] = await db
        .select()
        .from(rooms)
        .where(and(eq(rooms.id, input.roomId), eq(rooms.ownerId, ctx.auth.user.id)));
      if (!room) throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });

      const [removed] = await db
        .delete(roomMembers)
        .where(and(eq(roomMembers.roomId, input.roomId), eq(roomMembers.userId, input.memberUserId)))
        .returning();
      if (!removed) throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
      return removed;
    }),

  leaveRoom: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [removed] = await db
        .delete(roomMembers)
        .where(and(eq(roomMembers.roomId, input.roomId), eq(roomMembers.userId, ctx.auth.user.id)))
        .returning();
      if (!removed) throw new TRPCError({ code: "NOT_FOUND", message: "You are not a member of this room" });
      return removed;
    }),

  // ─── Room meeting creation ───────────────────────────────────────────────────

  createMeeting: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        name: z.string().min(1).max(200),
        agentId: z.string().min(1),
        topic: z.string().max(300).nullish(),
        scheduledAt: z.string().min(1), // ISO string from client
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const access = await getRoomAccess(input.roomId, ctx.auth.user.id);
      if (!access) throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
      if (access.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Only room admin can create meetings" });

      // generate unique 4-digit code
      let secretCode = "";
      for (let i = 0; i < 20; i++) {
        const candidate = Math.floor(1000 + Math.random() * 9000).toString();
        const [existing] = await db.select({ id: meetings.id }).from(meetings).where(eq(meetings.secretCode, candidate)).limit(1);
        if (!existing) { secretCode = candidate; break; }
      }
      if (!secretCode) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not generate meeting code" });

      const scheduledDate = new Date(input.scheduledAt);

      const [created] = await db
        .insert(meetings)
        .values({
          name: input.name,
          agentId: input.agentId,
          roomId: input.roomId,
          topic: input.topic ?? null,
          scheduledAt: scheduledDate,
          secretCode,
          userId: ctx.auth.user.id,
        })
        .returning();

      // send email notification to all room members
      const resendKey = getOptionalServerEnv("RESEND_API_KEY");
      if (resendKey) {
        const allMembers = await db
          .select({ email: user.email, name: user.name })
          .from(roomMembers)
          .innerJoin(user, eq(roomMembers.userId, user.id))
          .where(eq(roomMembers.roomId, input.roomId));

        const adminUser = await db
          .select({ email: user.email, name: user.name })
          .from(user)
          .where(eq(user.id, ctx.auth.user.id))
          .then((r) => r[0]);

        const recipients = allMembers.map((m) => m.email);
        if (recipients.length > 0) {
          const dateStr = scheduledDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
          const timeStr = scheduledDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
          const appUrl = getOptionalServerEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000";

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "NeexMeet <onboarding@resend.dev>",
              to: recipients,
              subject: `📅 Meeting Scheduled: ${input.name} — ${dateStr} at ${timeStr}`,
              html: `
                <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
                  <h2 style="margin:0 0 8px">Meeting Scheduled</h2>
                  <p style="color:#555;margin:0 0 20px">You have a new meeting in <strong>${access.room.name}</strong></p>
                  <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
                    <tr><td style="padding:8px 0;color:#888;width:100px">Meeting</td><td style="padding:8px 0;font-weight:600">${input.name}</td></tr>
                    ${input.topic ? `<tr><td style="padding:8px 0;color:#888">Topic</td><td style="padding:8px 0">${input.topic}</td></tr>` : ""}
                    <tr><td style="padding:8px 0;color:#888">Date</td><td style="padding:8px 0">${dateStr}</td></tr>
                    <tr><td style="padding:8px 0;color:#888">Time</td><td style="padding:8px 0">${timeStr}</td></tr>
                    <tr><td style="padding:8px 0;color:#888">Scheduled by</td><td style="padding:8px 0">${adminUser?.name ?? "Admin"}</td></tr>
                  </table>
                  <a href="${appUrl}/meetings/${created.id}" style="display:inline-block;background:#000;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">View Meeting</a>
                </div>
              `,
            }),
          }).catch(() => { /* email failure should not break meeting creation */ });
        }
      }

      return created;
    }),

  // ─── Room content ────────────────────────────────────────────────────────────

  getMeetings: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const access = await getRoomAccess(input.roomId, ctx.auth.user.id);
      if (!access) throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });

      return db
        .select()
        .from(meetings)
        .where(eq(meetings.roomId, input.roomId))
        .orderBy(desc(meetings.createdAt));
    }),

  getTasks: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const access = await getRoomAccess(input.roomId, ctx.auth.user.id);
      if (!access) throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });

      return db
        .select()
        .from(tasks)
        .where(eq(tasks.roomId, input.roomId))
        .orderBy(desc(tasks.createdAt));
    }),

  getDecisions: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const access = await getRoomAccess(input.roomId, ctx.auth.user.id);
      if (!access) throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });

      return db
        .select()
        .from(decisions)
        .where(eq(decisions.roomId, input.roomId))
        .orderBy(desc(decisions.createdAt));
    }),
});
