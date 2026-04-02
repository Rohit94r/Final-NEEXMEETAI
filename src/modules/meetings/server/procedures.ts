import { z } from "zod";
import JSONL from "jsonl-parse-stringify";
import { TRPCError } from "@trpc/server";
import OpenAI from "openai";
import { and, count, desc, eq, exists, getTableColumns, ilike, inArray, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { agents, meetingMembers, meetings, roomMembers, user } from "@/db/schema";
import { generateAvatarUri } from "@/lib/avatar";
import { getRequiredServerEnv, hasServerEnv } from "@/lib/env";
import { streamVideo } from "@/lib/stream-video";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";

import { MeetingStatus, StreamTranscriptItem } from "../types";
import { meetingsInsertSchema, meetingsUpdateSchema } from "../schemas";
import { streamChat } from "@/lib/stream-chat";

let groqClientInstance: OpenAI | null = null;

function getGroqClient() {
  if (!groqClientInstance) {
    groqClientInstance = new OpenAI({
      apiKey: getRequiredServerEnv("GROQ_API_KEY"),
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  return groqClientInstance;
}

function generateFourDigitMeetingCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function createUniqueMeetingCode() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = generateFourDigitMeetingCode();
    const [existingMeeting] = await db
      .select({ id: meetings.id })
      .from(meetings)
      .where(eq(meetings.secretCode, candidate))
      .limit(1);

    if (!existingMeeting) {
      return candidate;
    }
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Failed to generate a unique meeting code",
  });
}

const buildMeetingAccessCondition = (userId: string) =>
  or(
    eq(meetings.userId, userId),
    exists(
      db
        .select({ id: meetingMembers.id })
        .from(meetingMembers)
        .where(
          and(
            eq(meetingMembers.meetingId, meetings.id),
            eq(meetingMembers.userId, userId),
            eq(meetingMembers.status, "approved"),
          ),
        ),
    ),
    // room members can access all meetings inside their room
    exists(
      db
        .select({ id: roomMembers.id })
        .from(roomMembers)
        .where(
          and(
            eq(roomMembers.roomId, meetings.roomId),
            eq(roomMembers.userId, userId),
          ),
        ),
    ),
  );

async function getAccessibleMeeting(meetingId: string, userId: string) {
  const [existingMeeting] = await db
    .select({
      id: meetings.id,
      name: meetings.name,
      secretCode: meetings.secretCode,
      ownerId: meetings.userId,
      status: meetings.status,
      transcriptUrl: meetings.transcriptUrl,
      roomId: meetings.roomId,
    })
    .from(meetings)
    .leftJoin(
      meetingMembers,
      and(
        eq(meetingMembers.meetingId, meetings.id),
        eq(meetingMembers.userId, userId),
        eq(meetingMembers.status, "approved"),
      ),
    )
    .leftJoin(
      roomMembers,
      and(
        eq(roomMembers.roomId, meetings.roomId),
        eq(roomMembers.userId, userId),
      ),
    )
    .where(
      and(
        eq(meetings.id, meetingId),
        or(
          eq(meetings.userId, userId),
          eq(meetingMembers.userId, userId),
          eq(roomMembers.userId, userId),
        ),
      ),
    );

  if (!existingMeeting) return null;

  return {
    ...existingMeeting,
    isOwner: existingMeeting.ownerId === userId,
  };
}

async function getMeetingJoinState(meetingId: string, userId: string) {
  const [existingMeeting] = await db
    .select({
      id: meetings.id,
      name: meetings.name,
      secretCode: meetings.secretCode,
      ownerId: meetings.userId,
      status: meetings.status,
      transcriptUrl: meetings.transcriptUrl,
    })
    .from(meetings)
    .where(eq(meetings.id, meetingId));

  if (!existingMeeting) {
    return null;
  }

  if (existingMeeting.ownerId === userId) {
    return {
      ...existingMeeting,
      isOwner: true,
      accessState: "owner" as const,
    };
  }

  const [existingMember] = await db
    .select({
      id: meetingMembers.id,
      status: meetingMembers.status,
    })
    .from(meetingMembers)
    .where(
      and(
        eq(meetingMembers.meetingId, meetingId),
        eq(meetingMembers.userId, userId),
      ),
    );

  if (existingMember?.status === "approved") {
    const canEnterCall =
      existingMeeting.status === "upcoming" ||
      existingMeeting.status === "active";

    return {
      ...existingMeeting,
      isOwner: false,
      accessState: canEnterCall
        ? ("approved" as const)
        : ("waiting_for_host" as const),
    };
  }

  if (existingMember?.status === "pending") {
    return {
      ...existingMeeting,
      isOwner: false,
      accessState: "pending" as const,
    };
  }

  return {
    ...existingMeeting,
    isOwner: false,
    accessState:
      existingMeeting.status === "upcoming" || existingMeeting.status === "active"
        ? ("can_request_access" as const)
        : ("blocked" as const),
  };
}

export const meetingsRouter = createTRPCRouter({
  getCallDetails: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const access = await getMeetingJoinState(input.id, ctx.auth.user.id);

      if (!access) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      return {
        id: access.id,
        name: access.name,
        status: access.status,
        secretCode: access.secretCode,
        canManage: access.isOwner,
        accessState: access.accessState,
        canJoin: access.isOwner || access.accessState === "approved",
        aiMode: hasServerEnv("OPENAI_API_KEY")
          ? ("realtime_voice" as const)
          : hasServerEnv("GROQ_API_KEY")
            ? ("groq_assistant" as const)
            : ("disabled" as const),
      };
    }),
  requestJoinAccess: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const access = await getMeetingJoinState(input.meetingId, ctx.auth.user.id);

      if (!access) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      if (access.isOwner) {
        return { status: "owner" as const };
      }

      if (access.accessState === "blocked") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This meeting is no longer accepting new participants",
        });
      }

      if (access.accessState === "approved") {
        return { status: "approved" as const };
      }

      if (access.accessState === "pending") {
        return { status: "pending" as const };
      }

      await db
        .insert(meetingMembers)
        .values({
          meetingId: input.meetingId,
          userId: ctx.auth.user.id,
          status: "pending",
        })
        .onConflictDoNothing();

      console.info("[meetings.requestJoinAccess] Pending join request created", {
        meetingId: input.meetingId,
        userId: ctx.auth.user.id,
      });

      return { status: "pending" as const };
    }),
  joinByCode: protectedProcedure
    .input(
      z.object({
        code: z.string().regex(/^\d{4}$/, "Meeting code must be 4 digits"),
      }),
    )
    .mutation(async ({ input }) => {
      const [existingMeeting] = await db
        .select({
          id: meetings.id,
          status: meetings.status,
        })
        .from(meetings)
        .where(eq(meetings.secretCode, input.code));

      if (!existingMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting code not found",
        });
      }

      if (
        existingMeeting.status === "completed" ||
        existingMeeting.status === "processing" ||
        existingMeeting.status === "cancelled"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This meeting is no longer available to join",
        });
      }

      return {
        meetingId: existingMeeting.id,
      };
    }),
  askLiveAssistant: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
        prompt: z.string().trim().min(2).max(2000),
        history: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string().trim().min(1).max(4000),
            }),
          )
          .max(8)
          .default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const access = await getAccessibleMeeting(input.meetingId, ctx.auth.user.id);

      if (!access) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      if (!hasServerEnv("GROQ_API_KEY")) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "GROQ_API_KEY is missing. Add it to .env.local to enable the meeting assistant.",
        });
      }

      const [meetingWithAgent] = await db
        .select({
          id: meetings.id,
          name: meetings.name,
          status: meetings.status,
          summary: meetings.summary,
          agentName: agents.name,
          agentInstructions: agents.instructions,
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(eq(meetings.id, input.meetingId))
        .limit(1);

      if (!meetingWithAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      const systemPrompt = `
You are a professional in-meeting AI assistant for the meeting "${meetingWithAgent.name}".
Current meeting status: ${meetingWithAgent.status}.
Agent persona: ${meetingWithAgent.agentName}.

Primary behavior:
- Help participants with project questions, meeting doubts, action planning, and concise explanations.
- Be practical, polished, and business-friendly.
- If the user asks about information that is not present in the meeting context, say that clearly and then still try to help with the next best suggestion.
- Keep answers concise but useful.

Agent instructions:
${meetingWithAgent.agentInstructions}

Meeting summary, if available:
${meetingWithAgent.summary ?? "No final summary is available yet because the meeting is still in progress."}
      `.trim();

      const completion = await getGroqClient().chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          ...input.history.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          { role: "user", content: input.prompt },
        ],
      });

      const answer = completion.choices[0]?.message?.content?.trim();

      if (!answer) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "The meeting assistant did not return a response.",
        });
      }

      return { answer };
    }),
  generateChatToken: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
    const access = await getMeetingJoinState(input.meetingId, ctx.auth.user.id);

    if (!access || (!access.isOwner && access.accessState !== "approved")) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Meeting not found",
      });
    }

    const token = streamChat.createToken(ctx.auth.user.id);
    await streamChat.upsertUser({
      id: ctx.auth.user.id,
      role: access.isOwner ? "admin" : "user",
    });

    return token;
  }),
  getTranscript: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const existingMeeting = await getAccessibleMeeting(input.id, ctx.auth.user.id);

      if (!existingMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      if (!existingMeeting.transcriptUrl) {
        return [];
      }

      const transcript = await fetch(existingMeeting.transcriptUrl)
        .then((res) => res.text())
        .then((text) => JSONL.parse<StreamTranscriptItem>(text))
        .catch(() => {
          return [];
        });

      const speakerIds = [
        ...new Set(transcript.map((item) => item.speaker_id)),
      ];

      const userSpeakers = await db
        .select()
        .from(user)
        .where(inArray(user.id, speakerIds))
        .then((users) =>
          users.map((user) => ({
            ...user,
            image:
              user.image ??
              generateAvatarUri({ seed: user.name, variant: "initials" }),
          }))
        );

      const agentSpeakers = await db
        .select()
        .from(agents)
        .where(inArray(agents.id, speakerIds))
        .then((agents) =>
          agents.map((agent) => ({
            ...agent,
            image: generateAvatarUri({
              seed: agent.name,
              variant: "botttsNeutral",
            }),
          }))
        );

      const speakers = [...userSpeakers, ...agentSpeakers];

      const transcriptWithSpeakers = transcript.map((item) => {
        const speaker = speakers.find(
          (speaker) => speaker.id === item.speaker_id
        );

        if (!speaker) {
          return {
            ...item,
            user: {
              name: "Unknown",
              image: generateAvatarUri({
                seed: "Unknown",
                variant: "initials",
              }),
            },
          };
        }

        return {
          ...item,
          user: {
            name: speaker.name,
            image: speaker.image,
          },
        };
      })

      return transcriptWithSpeakers;
    }),
  generateToken: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
    const access = await getMeetingJoinState(input.meetingId, ctx.auth.user.id);

    if (!access || (!access.isOwner && access.accessState !== "approved")) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Meeting not found",
      });
    }

    await streamVideo.upsertUsers([
      {
        id: ctx.auth.user.id,
        name: ctx.auth.user.name,
        role: access.isOwner ? "admin" : "user",
        image: 
          ctx.auth.user.image ??
          generateAvatarUri({ seed: ctx.auth.user.name, variant: "initials" }),
      },
    ]);

    const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour
    const issuedAt = Math.floor(Date.now() / 1000) - 60;

    const token = streamVideo.generateUserToken({
      user_id: ctx.auth.user.id,
      exp: expirationTime,
      validity_in_seconds: issuedAt,
    });

    return token;
  }),
  inviteMember: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existingMeeting] = await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.id, input.meetingId),
            eq(meetings.userId, ctx.auth.user.id),
          ),
        );

      if (!existingMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      const [invitedUser] = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        })
        .from(user)
        .where(eq(user.email, input.email));

      if (!invitedUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User with this email does not have an account yet",
        });
      }

      if (invitedUser.id === ctx.auth.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already the meeting admin",
        });
      }

      const [existingMember] = await db
        .select()
        .from(meetingMembers)
        .where(
          and(
            eq(meetingMembers.meetingId, input.meetingId),
            eq(meetingMembers.userId, invitedUser.id),
          ),
        );

      if (existingMember) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This user has already been invited",
        });
      }

      const [member] = await db
        .insert(meetingMembers)
        .values({
          meetingId: input.meetingId,
          userId: invitedUser.id,
          status: "approved",
        })
        .returning();

      await streamVideo.upsertUsers([
        {
          id: invitedUser.id,
          name: invitedUser.name,
          role: "user",
          image:
            invitedUser.image ??
            generateAvatarUri({ seed: invitedUser.name, variant: "initials" }),
        },
      ]);

      return {
        ...member,
        user: invitedUser,
      };
    }),
  removeMember: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
        memberUserId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existingMeeting] = await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.id, input.meetingId),
            eq(meetings.userId, ctx.auth.user.id),
          ),
        );

      if (!existingMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      const [removedMember] = await db
        .delete(meetingMembers)
        .where(
          and(
            eq(meetingMembers.meetingId, input.meetingId),
            eq(meetingMembers.userId, input.memberUserId),
            eq(meetingMembers.status, "approved"),
          ),
        )
        .returning();

      if (!removedMember) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      return removedMember;
    }),
  leaveMeeting: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [removedMembership] = await db
        .delete(meetingMembers)
        .where(
          and(
            eq(meetingMembers.meetingId, input.meetingId),
            eq(meetingMembers.userId, ctx.auth.user.id),
          ),
        )
        .returning();

      if (!removedMembership) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found in your list",
        });
      }

      return removedMembership;
    }),
  admitMember: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
        memberUserId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existingMeeting] = await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.id, input.meetingId),
            eq(meetings.userId, ctx.auth.user.id),
          ),
        );

      if (!existingMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      const [approvedMember] = await db
        .update(meetingMembers)
        .set({ status: "approved" })
        .where(
          and(
            eq(meetingMembers.meetingId, input.meetingId),
            eq(meetingMembers.userId, input.memberUserId),
            eq(meetingMembers.status, "pending"),
          ),
        )
        .returning();

      if (!approvedMember) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Join request not found",
        });
      }

      const [approvedUser] = await db
        .select({
          id: user.id,
          name: user.name,
          image: user.image,
        })
        .from(user)
        .where(eq(user.id, input.memberUserId));

      if (approvedUser) {
        await streamVideo.upsertUsers([
          {
            id: approvedUser.id,
            name: approvedUser.name,
            role: "user",
            image:
              approvedUser.image ??
              generateAvatarUri({
                seed: approvedUser.name,
                variant: "initials",
              }),
          },
        ]);
      }

      return approvedMember;
    }),
  rejectMember: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
        memberUserId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existingMeeting] = await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.id, input.meetingId),
            eq(meetings.userId, ctx.auth.user.id),
          ),
        );

      if (!existingMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      const [rejectedMember] = await db
        .delete(meetingMembers)
        .where(
          and(
            eq(meetingMembers.meetingId, input.meetingId),
            eq(meetingMembers.userId, input.memberUserId),
            eq(meetingMembers.status, "pending"),
          ),
        )
        .returning();

      if (!rejectedMember) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Join request not found",
        });
      }

      return rejectedMember;
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [removedMeeting] = await db
        .delete(meetings)
        .where(
          and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id),
          )
        )
        .returning();

      if (!removedMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      return removedMeeting;
    }),
  update: protectedProcedure
    .input(meetingsUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const [updatedMeeting] = await db
        .update(meetings)
        .set(input)
        .where(
          and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id),
          )
        )
        .returning();

      if (!updatedMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      return updatedMeeting;
    }),
  toggleStar: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isStarred: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedMeeting] = await db
        .update(meetings)
        .set({
          isStarred: input.isStarred,
        })
        .where(
          and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id),
          ),
        )
        .returning();

      if (!updatedMeeting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meeting not found",
        });
      }

      return updatedMeeting;
    }),
  create: protectedProcedure
    .input(meetingsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const secretCode = await createUniqueMeetingCode();
      const [createdMeeting] = await db
        .insert(meetings)
        .values({
          ...input,
          secretCode,
          userId: ctx.auth.user.id,
        })
        .returning();

      const call = streamVideo.video.call("default", createdMeeting.id);
      await call.create({
        data: {
          created_by_id: ctx.auth.user.id,
          custom: {
            meetingId: createdMeeting.id,
            meetingName: createdMeeting.name
          },
          settings_override: {
            transcription: {
              language: "en",
              mode: "auto-on",
              closed_caption_mode: "auto-on",
            },
            recording: {
              mode: "auto-on",
              quality: "1080p",
            },
          },
        },
      });

      const [existingAgent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, createdMeeting.agentId));

      if (!existingAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      await streamVideo.upsertUsers([
        {
          id: existingAgent.id,
          name: existingAgent.name,
          role: "user",
          image: generateAvatarUri({
            seed: existingAgent.name,
            variant: "botttsNeutral",
          }),
        },
      ]);

      return createdMeeting;
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
    const [existingMeeting] = await db
      .select({
        ...getTableColumns(meetings),
        agent: {
          ...getTableColumns(agents),
        },
        owner: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        isOwner: sql<boolean>`${meetings.userId} = ${ctx.auth.user.id}`.as("isOwner"),
        duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as("duration"),
      })
      .from(meetings)
      .innerJoin(agents, eq(meetings.agentId, agents.id))
      .innerJoin(user, eq(meetings.userId, user.id))
      .where(
        and(
          eq(meetings.id, input.id),
          buildMeetingAccessCondition(ctx.auth.user.id),
        )
      );

    if (!existingMeeting) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
    }

      const members = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: meetingMembers.role,
        joinedAt: meetingMembers.createdAt,
      })
      .from(meetingMembers)
      .innerJoin(user, eq(meetingMembers.userId, user.id))
      .where(
        and(
          eq(meetingMembers.meetingId, input.id),
          eq(meetingMembers.status, "approved"),
        ),
      );

    const pendingRequests = existingMeeting.isOwner
      ? await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            requestedAt: meetingMembers.createdAt,
          })
          .from(meetingMembers)
          .innerJoin(user, eq(meetingMembers.userId, user.id))
          .where(
            and(
              eq(meetingMembers.meetingId, input.id),
              eq(meetingMembers.status, "pending"),
            ),
          )
      : [];

    return {
      ...existingMeeting,
      canManage: existingMeeting.isOwner,
      participants: [
        {
          id: existingMeeting.owner.id,
          name: existingMeeting.owner.name,
          email: existingMeeting.owner.email,
          image: existingMeeting.owner.image,
          role: "admin" as const,
          joinedAt: existingMeeting.createdAt,
        },
        ...members,
      ],
      pendingRequests,
      aiMode: hasServerEnv("OPENAI_API_KEY")
        ? ("realtime_voice" as const)
        : hasServerEnv("GROQ_API_KEY")
          ? ("groq_assistant" as const)
          : ("disabled" as const),
    };
  }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
        agentId: z.string().nullish(),
        status: z
          .enum([
            MeetingStatus.Upcoming,
            MeetingStatus.Active,
            MeetingStatus.Completed,
            MeetingStatus.Processing,
            MeetingStatus.Cancelled,
          ])
          .nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, page, pageSize, status, agentId } = input;

      const data = await db
        .select({
          ...getTableColumns(meetings),
          agent: {
            ...getTableColumns(agents),
          },
          isOwner: sql<boolean>`${meetings.userId} = ${ctx.auth.user.id}`.as("isOwner"),
          duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as("duration"),
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            buildMeetingAccessCondition(ctx.auth.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
            status ? eq(meetings.status, status) : undefined,
            agentId ? eq(meetings.agentId, agentId) : undefined,
          )
        )
        .orderBy(desc(meetings.createdAt), desc(meetings.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize)

      const [total] = await db
        .select({ count: count() })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(
          and(
            buildMeetingAccessCondition(ctx.auth.user.id),
            search ? ilike(meetings.name, `%${search}%`) : undefined,
            status ? eq(meetings.status, status) : undefined,
            agentId ? eq(meetings.agentId, agentId) : undefined,
          )
        );

      const totalPages = Math.ceil(total.count / pageSize);

      return {
        items: data,
        total: total.count,
        totalPages,
      };
    }),
});
