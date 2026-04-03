import { nanoid } from "nanoid";
import { pgTable, text, timestamp, boolean, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
});

export const session = pgTable("session", {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable("account", {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable("verification", {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()),
});

export const agents = pgTable("agents", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  isStarred: boolean("is_starred").notNull().default(false),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  instructions: text("instructions").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const meetingStatus = pgEnum("meeting_status", [
  "upcoming", "active", "completed", "processing", "cancelled",
]);

export const meetingMemberRole = pgEnum("meeting_member_role", ["member"]);
export const meetingMemberStatus = pgEnum("meeting_member_status", ["pending", "approved"]);

export const meetings = pgTable(
  "meetings",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    name: text("name").notNull(),
    secretCode: text("secret_code").notNull(),
    isStarred: boolean("is_starred").notNull().default(false),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    agentId: text("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
    roomId: text("room_id"),
    status: meetingStatus("status").notNull().default("upcoming"),
    scheduledAt: timestamp("scheduled_at"),
    topic: text("topic"),
    startedAt: timestamp("started_at"),
    endedAt: timestamp("ended_at"),
    transcriptUrl: text("transcript_url"),
    recordingUrl: text("recording_url"),
    summary: text("summary"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    meetingSecretCodeIdx: uniqueIndex("meetings_secret_code_idx").on(table.secretCode),
    meetingRoomIdx: uniqueIndex("meetings_room_idx").on(table.roomId, table.id), // composite for speed
  }),
);

export const meetingMembers = pgTable(
  "meeting_members",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    meetingId: text("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    role: meetingMemberRole("role").notNull().default("member"),
    status: meetingMemberStatus("status").notNull().default("approved"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    meetingUserUniqueIdx: uniqueIndex("meeting_members_meeting_user_idx").on(table.meetingId, table.userId),
  }),
);

// ─── Workspace ────────────────────────────────────────────────────────────────

export const taskStatus = pgEnum("task_status", ["todo", "in_progress", "done"]);
export const taskPriority = pgEnum("task_priority", ["low", "medium", "high"]);

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatus("status").notNull().default("todo"),
  priority: taskPriority("priority").notNull().default("medium"),
  assigneeName: text("assignee_name"),
  dueDate: timestamp("due_date"),
  meetingId: text("meeting_id").references(() => meetings.id, { onDelete: "set null" }),
  roomId: text("room_id"),  // FK added after rooms table
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  taskRoomIdx: uniqueIndex("tasks_room_idx").on(table.roomId, table.id),
}));

export const decisions = pgTable("decisions", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  content: text("content").notNull(),
  context: text("context"),
  meetingId: text("meeting_id").references(() => meetings.id, { onDelete: "set null" }),
  roomId: text("room_id"),  // FK added after rooms table
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  decisionRoomIdx: uniqueIndex("decisions_room_idx").on(table.roomId, table.id),
}));

export const documents = pgTable("documents", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  meetingId: text("meeting_id").references(() => meetings.id, { onDelete: "set null" }),
  roomId: text("room_id"),  // FK added after rooms table
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  documentRoomIdx: uniqueIndex("documents_room_idx").on(table.roomId, table.id),
}));

// ─── Rooms ────────────────────────────────────────────────────────────────────

export const roomMemberRole = pgEnum("room_member_role", ["admin", "member"]);
export const attendanceStatus = pgEnum("attendance_status", ["present", "absent", "late"]);
export const reasonStatus = pgEnum("reason_status", ["pending", "approved", "rejected"]);

export const rooms = pgTable("rooms", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  description: text("description"),
  isPrivate: boolean("is_private").notNull().default(false),
  isStarred: boolean("is_starred").notNull().default(false),
  inviteCode: text("invite_code").notNull().$defaultFn(() => nanoid(8)),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  defaultAgentId: text("default_agent_id").references(() => agents.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const roomMembers = pgTable(
  "room_members",
  {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    role: roomMemberRole("role").notNull().default("member"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    roomMemberUniqueIdx: uniqueIndex("room_members_room_user_idx").on(table.roomId, table.userId),
  }),
);

// ─── Pulse (Communication System) ───────────────────────────────────────────

export const channels = pgTable("channels", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  channelRoomIdx: uniqueIndex("channels_room_idx").on(table.roomId, table.id),
}));

export const messages = pgTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  content: text("content").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  channelId: text("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  meetingId: text("meeting_id").references(() => meetings.id, { onDelete: "set null" }),
  taskId: text("task_id").references(() => tasks.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  messageChannelIdx: uniqueIndex("messages_channel_idx").on(table.channelId, table.id),
}));

export const threads = pgTable("threads", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  parentMessageId: text("parent_message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Presence System ─────────────────────────────────────────────────────────

export const attendance = pgTable("attendance", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  status: attendanceStatus("status").notNull(),
  photoUrl: text("photo_url").notNull(),
  location: text("location"), // "Lat, Long" or City
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => ({
  userRoomDateIdx: uniqueIndex("attendance_user_room_date_idx").on(table.userId, table.roomId, table.date),
  attendanceRoomIdx: uniqueIndex("attendance_room_idx").on(table.roomId, table.id),
}));

export const attendanceReasons = pgTable("attendance_reasons", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  attendanceId: text("attendance_id").notNull().references(() => attendance.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  status: reasonStatus("status").notNull().default("pending"),
  reviewedBy: text("reviewed_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
