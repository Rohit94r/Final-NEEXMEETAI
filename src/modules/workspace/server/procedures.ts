import { z } from "zod";
import OpenAI from "openai";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike } from "drizzle-orm";

import { db } from "@/db";
import { decisions, documents, meetings, tasks } from "@/db/schema";
import { hasServerEnv, getRequiredServerEnv } from "@/lib/env";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

let groqClient: OpenAI | null = null;
function getGroqClient() {
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: getRequiredServerEnv("GROQ_API_KEY"),
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return groqClient;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

const tasksRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(z.object({
      status: z.enum(["todo", "in_progress", "done"]).nullish(),
      meetingId: z.string().nullish(),
      search: z.string().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      return db.select().from(tasks).where(
        and(
          eq(tasks.userId, ctx.auth.user.id),
          input.status ? eq(tasks.status, input.status) : undefined,
          input.meetingId ? eq(tasks.meetingId, input.meetingId) : undefined,
          input.search ? ilike(tasks.title, `%${input.search}%`) : undefined,
        ),
      ).orderBy(desc(tasks.createdAt));
    }),

  getByMeeting: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.select().from(tasks).where(
        and(eq(tasks.userId, ctx.auth.user.id), eq(tasks.meetingId, input.meetingId)),
      ).orderBy(desc(tasks.createdAt));
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      description: z.string().nullish(),
      status: z.enum(["todo", "in_progress", "done"]).default("todo"),
      priority: z.enum(["low", "medium", "high"]).default("medium"),
      assigneeName: z.string().nullish(),
      dueDate: z.string().nullish(),
      meetingId: z.string().nullish(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [created] = await db.insert(tasks).values({
        ...input,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        userId: ctx.auth.user.id,
      }).returning();
      return created;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).max(200).optional(),
      description: z.string().nullish(),
      status: z.enum(["todo", "in_progress", "done"]).optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      assigneeName: z.string().nullish(),
      dueDate: z.string().nullish(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, dueDate, ...rest } = input;
      const [updated] = await db.update(tasks)
        .set({ ...rest, dueDate: dueDate ? new Date(dueDate) : null, updatedAt: new Date() })
        .where(and(eq(tasks.id, id), eq(tasks.userId, ctx.auth.user.id)))
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      return updated;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [removed] = await db.delete(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.auth.user.id)))
        .returning();
      if (!removed) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      return removed;
    }),

  extractFromMeeting: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!hasServerEnv("GROQ_API_KEY")) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "GROQ_API_KEY required for AI extraction" });
      }
      const [meeting] = await db.select({ id: meetings.id, summary: meetings.summary })
        .from(meetings)
        .where(and(eq(meetings.id, input.meetingId), eq(meetings.userId, ctx.auth.user.id)));

      if (!meeting?.summary) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Meeting summary is not ready yet" });
      }

      const completion = await getGroqClient().chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `Extract actionable tasks from a meeting summary. Return ONLY a valid JSON array.
Each item: {"title":"string","assigneeName":"string|null","priority":"low|medium|high","dueDate":"ISO string|null"}`,
          },
          { role: "user", content: `Extract tasks:\n\n${meeting.summary}` },
        ],
      });

      const raw = completion.choices[0]?.message?.content?.trim() ?? "[]";
      let extracted: { title: string; assigneeName: string | null; priority: string; dueDate: string | null }[] = [];
      try {
        const match = raw.match(/\[[\s\S]*\]/);
        extracted = match ? JSON.parse(match[0]) : [];
      } catch { extracted = []; }

      if (!extracted.length) return [];

      return db.insert(tasks).values(
        extracted.map((t) => ({
          title: t.title,
          assigneeName: t.assigneeName ?? null,
          priority: (["low", "medium", "high"].includes(t.priority) ? t.priority : "medium") as "low" | "medium" | "high",
          dueDate: t.dueDate ? new Date(t.dueDate) : null,
          meetingId: input.meetingId,
          userId: ctx.auth.user.id,
          status: "todo" as const,
        })),
      ).returning();
    }),
});

// ─── Decisions ────────────────────────────────────────────────────────────────

const decisionsRouter = createTRPCRouter({
  getMany: protectedProcedure.query(async ({ ctx }) => {
    return db.select().from(decisions)
      .where(eq(decisions.userId, ctx.auth.user.id))
      .orderBy(desc(decisions.createdAt));
  }),

  getByMeeting: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.select().from(decisions).where(
        and(eq(decisions.userId, ctx.auth.user.id), eq(decisions.meetingId, input.meetingId)),
      ).orderBy(desc(decisions.createdAt));
    }),

  create: protectedProcedure
    .input(z.object({
      content: z.string().min(1).max(500),
      context: z.string().nullish(),
      meetingId: z.string().nullish(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [created] = await db.insert(decisions)
        .values({ ...input, userId: ctx.auth.user.id }).returning();
      return created;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [removed] = await db.delete(decisions)
        .where(and(eq(decisions.id, input.id), eq(decisions.userId, ctx.auth.user.id)))
        .returning();
      if (!removed) throw new TRPCError({ code: "NOT_FOUND", message: "Decision not found" });
      return removed;
    }),

  extractFromMeeting: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!hasServerEnv("GROQ_API_KEY")) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "GROQ_API_KEY required" });
      }
      const [meeting] = await db.select({ id: meetings.id, summary: meetings.summary })
        .from(meetings)
        .where(and(eq(meetings.id, input.meetingId), eq(meetings.userId, ctx.auth.user.id)));

      if (!meeting?.summary) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Meeting summary is not ready yet" });
      }

      const completion = await getGroqClient().chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `Extract key decisions from a meeting summary. Return ONLY a valid JSON array.
Each item: {"content":"string","context":"string|null"}`,
          },
          { role: "user", content: `Extract decisions:\n\n${meeting.summary}` },
        ],
      });

      const raw = completion.choices[0]?.message?.content?.trim() ?? "[]";
      let extracted: { content: string; context: string | null }[] = [];
      try {
        const match = raw.match(/\[[\s\S]*\]/);
        extracted = match ? JSON.parse(match[0]) : [];
      } catch { extracted = []; }

      if (!extracted.length) return [];

      return db.insert(decisions).values(
        extracted.map((d) => ({
          content: d.content,
          context: d.context ?? null,
          meetingId: input.meetingId,
          userId: ctx.auth.user.id,
        })),
      ).returning();
    }),
});

// ─── Documents ────────────────────────────────────────────────────────────────

const documentsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(z.object({ search: z.string().nullish() }).optional())
    .query(async ({ ctx, input }) => {
      return db.select().from(documents).where(
        and(
          eq(documents.userId, ctx.auth.user.id),
          input?.search ? ilike(documents.title, `%${input.search}%`) : undefined,
        ),
      ).orderBy(desc(documents.updatedAt));
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [doc] = await db.select().from(documents)
        .where(and(eq(documents.id, input.id), eq(documents.userId, ctx.auth.user.id)));
      if (!doc) throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      return doc;
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      content: z.string().default(""),
      meetingId: z.string().nullish(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [created] = await db.insert(documents)
        .values({ ...input, userId: ctx.auth.user.id }).returning();
      return created;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).max(200).optional(),
      content: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      const [updated] = await db.update(documents)
        .set({ ...rest, updatedAt: new Date() })
        .where(and(eq(documents.id, id), eq(documents.userId, ctx.auth.user.id)))
        .returning();
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      return updated;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [removed] = await db.delete(documents)
        .where(and(eq(documents.id, input.id), eq(documents.userId, ctx.auth.user.id)))
        .returning();
      if (!removed) throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      return removed;
    }),
});

// ─── Export ───────────────────────────────────────────────────────────────────

export const workspaceRouter = createTRPCRouter({
  tasks: tasksRouter,
  decisions: decisionsRouter,
  documents: documentsRouter,
});
