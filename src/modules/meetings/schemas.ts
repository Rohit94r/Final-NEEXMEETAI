import { z } from "zod";

export const meetingsInsertSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  agentId: z.string().min(1, { message: "Agent is required" }),
  roomId: z.string().optional(),
  scheduledAt: z.string().optional().or(z.date().optional()),
  topic: z.string().optional(),
});

export const meetingsUpdateSchema = meetingsInsertSchema.extend({
  id: z.string().min(1, { message: "Id is required" }),
  status: z.enum(["upcoming", "active", "completed", "processing", "cancelled"]).optional(),
});
