import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { channels, messages, threads, user, roomMembers, rooms } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

// helper — check room access
async function getRoomAccess(roomId: string, userId: string) {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
  if (!room) return null;
  if (room.ownerId === userId) return true;

  const [member] = await db
    .select()
    .from(roomMembers)
    .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)));

  return !!member;
}

// helper — send system notification
export async function sendPulseNotification({
  roomId,
  channelName,
  content,
  userId,
  meetingId,
  taskId,
}: {
  roomId: string;
  channelName: string;
  content: string;
  userId: string;
  meetingId?: string;
  taskId?: string;
}) {
  let [channel] = await db
    .select()
    .from(channels)
    .where(and(eq(channels.roomId, roomId), eq(channels.name, channelName)));

  if (!channel) {
    [channel] = await db
      .insert(channels)
      .values({ roomId, name: channelName })
      .returning();
  }

  return db
    .insert(messages)
    .values({
      channelId: channel.id,
      content: content.trim(),
      userId,
      meetingId,
      taskId,
    })
    .returning();
}

export const pulseRouter = createTRPCRouter({
  // ─── Channels ──────────────────────────────────────────────────────────────

  getByRoom: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const hasAccess = await getRoomAccess(input.roomId, ctx.auth.user.id);
      if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN" });

      const existing = await db
        .select()
        .from(channels)
        .where(eq(channels.roomId, input.roomId))
        .orderBy(desc(channels.createdAt));

      if (existing.length === 0) {
        // Auto-create defaults
        const defaults = ["#general", "#meetings", "#tasks"];
        const created = await Promise.all(
          defaults.map((name) =>
            db.insert(channels).values({ name, roomId: input.roomId }).returning()
          )
        );
        return created.flat().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      return existing;
    }),

  createChannel: protectedProcedure
    .input(z.object({ roomId: z.string(), name: z.string().min(1).max(50) }))
    .mutation(async ({ ctx, input }) => {
      const hasAccess = await getRoomAccess(input.roomId, ctx.auth.user.id);
      if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN" });

      const [created] = await db
        .insert(channels)
        .values({
          name: input.name.startsWith("#") ? input.name : `#${input.name}`,
          roomId: input.roomId,
        })
        .returning();

      return created;
    }),

  // ─── Messages ──────────────────────────────────────────────────────────────

  getByChannel: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ ctx, input }) => {
      // First check if user has access to the room this channel belongs to
      const [channel] = await db.select().from(channels).where(eq(channels.id, input.channelId));
      if (!channel) throw new TRPCError({ code: "NOT_FOUND" });

      const hasAccess = await getRoomAccess(channel.roomId, ctx.auth.user.id);
      if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN" });

      const result = await db
        .select({
          id: messages.id,
          content: messages.content,
          createdAt: messages.createdAt,
          meetingId: messages.meetingId,
          taskId: messages.taskId,
          user: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        })
        .from(messages)
        .innerJoin(user, eq(messages.userId, user.id))
        .where(eq(messages.channelId, input.channelId))
        .orderBy(desc(messages.createdAt));

      return result.reverse(); // Show oldest first for chat flow
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      content: z.string().min(1),
      meetingId: z.string().optional(),
      taskId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [channel] = await db.select().from(channels).where(eq(channels.id, input.channelId));
      if (!channel) throw new TRPCError({ code: "NOT_FOUND" });

      const hasAccess = await getRoomAccess(channel.roomId, ctx.auth.user.id);
      if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN" });

      const [msg] = await db
        .insert(messages)
        .values({
          content: input.content,
          channelId: input.channelId,
          userId: ctx.auth.user.id,
          meetingId: input.meetingId,
          taskId: input.taskId,
        })
        .returning();

      return msg;
    }),

  // ─── Threads ──────────────────────────────────────────────────────────────

  getByMessage: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .query(async ({ input }) => {
      const result = await db
        .select({
          id: threads.id,
          content: threads.content,
          createdAt: threads.createdAt,
          user: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        })
        .from(threads)
        .innerJoin(user, eq(threads.userId, user.id))
        .where(eq(threads.parentMessageId, input.messageId))
        .orderBy(desc(threads.createdAt));

      return result.reverse();
    }),

  reply: protectedProcedure
    .input(z.object({
      messageId: z.string(),
      content: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const [msg] = await db
        .insert(threads)
        .values({
          parentMessageId: input.messageId,
          content: input.content,
          userId: ctx.auth.user.id,
        })
        .returning();

      return msg;
    }),
});
