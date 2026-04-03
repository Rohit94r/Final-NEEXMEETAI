import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, lte, gte } from "drizzle-orm";
import { format } from "date-fns";

import { db } from "@/db";
import { 
  attendance, 
  attendanceReasons, 
  roomMembers, 
  rooms, 
  user 
} from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { sendPulseNotification } from "@/modules/pulse/server/procedures";

// helper — check room access
async function getRoomAccess(roomId: string, userId: string) {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
  if (!room) return null;
  
  // Check if owner
  if (room.ownerId === userId) {
    return { member: { role: "admin", userId }, room };
  }

  const [member] = await db
    .select()
    .from(roomMembers)
    .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)));

  return member ? { member, room } : null;
}

export const presenceRouter = createTRPCRouter({
  // ─── Mark Attendance ────────────────────────────────────────────────────────
  
  markPresence: protectedProcedure
    .input(z.object({
      roomId: z.string(),
      status: z.enum(["present", "late"]),
      photoUrl: z.string(), // Removed .url() because we send base64 dataURL
      location: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const access = await getRoomAccess(input.roomId, ctx.auth.user.id);
      if (!access) throw new TRPCError({ code: "FORBIDDEN", message: "You don't have access to this room" });

      const today = format(new Date(), "yyyy-MM-dd");

      // Check if already marked
      const [existing] = await db
        .select()
        .from(attendance)
        .where(and(
          eq(attendance.roomId, input.roomId),
          eq(attendance.userId, ctx.auth.user.id),
          eq(attendance.date, today)
        ));

      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Presence already marked for today",
        });
      }

      const [created] = await db
        .insert(attendance)
        .values({
          userId: ctx.auth.user.id,
          roomId: input.roomId,
          date: today,
          status: input.status,
          photoUrl: input.photoUrl,
          location: input.location,
        })
        .returning();

      // Trigger Pulse notification with error handling
      try {
        await sendPulseNotification({
          roomId: input.roomId,
          channelName: "#general",
          content: `📍 **${ctx.auth.user.name}** marked presence at **${format(new Date(), "h:mm a")}** (Status: **${input.status}**)`,
          userId: ctx.auth.user.id,
        });
      } catch (pulseError) {
        console.warn("Failed to send pulse notification for attendance:", pulseError);
        // We still return 'created' because attendance record was successful
      }

      return created;
    }),

  // ─── Get Attendance ──────────────────────────────────────────────────────────

  getByRoom: protectedProcedure
    .input(z.object({ 
      roomId: z.string(),
      date: z.string().optional(), // Format: YYYY-MM-DD
    }))
    .query(async ({ ctx, input }) => {
      const access = await getRoomAccess(input.roomId, ctx.auth.user.id);
      if (!access) throw new TRPCError({ code: "FORBIDDEN" });

      const targetDate = input.date || format(new Date(), "yyyy-MM-dd");

      const result = await db
        .select({
          id: attendance.id,
          status: attendance.status,
          photoUrl: attendance.photoUrl,
          location: attendance.location,
          timestamp: attendance.timestamp,
          user: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
          reason: {
            id: attendanceReasons.id,
            content: attendanceReasons.reason,
            status: attendanceReasons.status,
          }
        })
        .from(attendance)
        .innerJoin(user, eq(attendance.userId, user.id))
        .leftJoin(attendanceReasons, eq(attendanceReasons.attendanceId, attendance.id))
        .where(and(
          eq(attendance.roomId, input.roomId),
          eq(attendance.date, targetDate)
        ))
        .orderBy(desc(attendance.timestamp));

      return result;
    }),

  getCalendar: protectedProcedure
    .input(z.object({
      roomId: z.string(),
      month: z.string(), // Format: YYYY-MM
    }))
    .query(async ({ ctx, input }) => {
      const access = await getRoomAccess(input.roomId, ctx.auth.user.id);
      if (!access) throw new TRPCError({ code: "FORBIDDEN" });

      // Get all attendance for this room in this month
      const results = await db
        .select()
        .from(attendance)
        .where(and(
          eq(attendance.roomId, input.roomId),
          eq(attendance.userId, ctx.auth.user.id),
          // We can use prefix matching for the month date string
          and(
            gte(attendance.date, `${input.month}-01`),
            lte(attendance.date, `${input.month}-31`)
          )
        ));

      return results;
    }),

  // ─── Reasons ───────────────────────────────────────────────────────────────

  submitReason: protectedProcedure
    .input(z.object({
      roomId: z.string(),
      date: z.string(), // Missed date
      reason: z.string().min(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const access = await getRoomAccess(input.roomId, ctx.auth.user.id);
      if (!access) throw new TRPCError({ code: "FORBIDDEN" });

      // First check if an attendance record exists (marked as absent) or create one
      let [att] = await db
        .select()
        .from(attendance)
        .where(and(
          eq(attendance.roomId, input.roomId),
          eq(attendance.userId, ctx.auth.user.id),
          eq(attendance.date, input.date)
        ));

      if (!att) {
         // Create a placeholder attendance record marked as absent
         [att] = await db
           .insert(attendance)
           .values({
             userId: ctx.auth.user.id,
             roomId: input.roomId,
             date: input.date,
             status: "absent",
             photoUrl: "MISSING", // Placeholder
           })
           .returning();
      }

      const [created] = await db
        .insert(attendanceReasons)
        .values({
          attendanceId: att.id,
          reason: input.reason,
          status: "pending",
        })
        .returning();

      // Trigger Pulse notification
      await sendPulseNotification({
        roomId: input.roomId,
        channelName: "#general",
        content: `📝 **${ctx.auth.user.name}** submitted a reason for missing attendance on **${input.date}**`,
        userId: ctx.auth.user.id,
      });

      return created;
    }),

  reviewReason: protectedProcedure
    .input(z.object({
      reasonId: z.string(),
      status: z.enum(["approved", "rejected"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const [reason] = await db
        .select()
        .from(attendanceReasons)
        .innerJoin(attendance, eq(attendanceReasons.attendanceId, attendance.id))
        .where(eq(attendanceReasons.id, input.reasonId));

      if (!reason) throw new TRPCError({ code: "NOT_FOUND" });

      // Check if user is admin of the room
      const access = await getRoomAccess(reason.attendance.roomId, ctx.auth.user.id);
      if (!access || access.member.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can review reasons" });
      }

      const [updated] = await db
        .update(attendanceReasons)
        .set({
          status: input.status,
          reviewedBy: ctx.auth.user.id,
        })
        .where(eq(attendanceReasons.id, input.reasonId))
        .returning();

      return updated;
    }),
});
