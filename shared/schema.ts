import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Extended user profiles for the dating platform
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  displayName: varchar("display_name").notNull(),
  bio: text("bio"),
  birthDate: timestamp("birth_date"),
  gender: varchar("gender"),
  orientation: varchar("orientation"),
  location: varchar("location"),
  relationshipStyle: varchar("relationship_style").array(),
  practices: varchar("practices").array(),
  values: varchar("values").array(),
  intentions: varchar("intentions").array(),
  isVerified: boolean("is_verified").default(false),
  isVisible: boolean("is_visible").default(true),
  lastActive: timestamp("last_active").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profile photos
export const profilePhotos = pgTable("profile_photos", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  url: varchar("url").notNull(),
  isPrimary: boolean("is_primary").default(false),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Events and workshops
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  location: varchar("location"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  maxParticipants: integer("max_participants"),
  price: decimal("price", { precision: 10, scale: 2 }),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  imageUrl: varchar("image_url"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event registrations
export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status").notNull().default("registered"),
  registeredAt: timestamp("registered_at").defaultNow(),
});

// Messages between users
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at").defaultNow(),
});

// User interactions (likes, blocks, etc.)
export const userInteractions = pgTable("user_interactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  targetUserId: varchar("target_user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'like', 'block', 'report'
  createdAt: timestamp("created_at").defaultNow(),
});

// Educational resources
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  content: text("content"),
  type: varchar("type").notNull(), // 'article', 'video', 'podcast', 'guide'
  category: varchar("category").notNull(),
  authorId: varchar("author_id").references(() => users.id),
  imageUrl: varchar("image_url"),
  isPublished: boolean("is_published").default(false),
  readingTime: integer("reading_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Professional profiles for practitioners, coaches, therapists
export const professionalProfiles = pgTable("professional_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessName: varchar("business_name").notNull(),
  description: text("description"),
  specialties: varchar("specialties").array(), // tantra, thérapie de couple, coaching, etc.
  certifications: text("certifications").array(),
  yearsExperience: integer("years_experience"),
  location: varchar("location"),
  website: varchar("website"),
  phone: varchar("phone"),
  professionalEmail: varchar("professional_email"),
  languages: varchar("languages").array(),
  sessionTypes: varchar("session_types").array(), // individuel, couple, groupe, atelier
  pricing: jsonb("pricing"), // structure tarifaire
  availability: jsonb("availability"), // créneaux disponibles
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  verificationDocuments: varchar("verification_documents").array(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalReviews: integer("total_reviews").default(0),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Services offered by professionals
export const professionalServices = pgTable("professional_services", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionalProfiles.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // consultation, atelier, formation, etc.
  duration: integer("duration"), // en minutes
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("EUR"),
  isOnline: boolean("is_online").default(false),
  isInPerson: boolean("is_in_person").default(true),
  maxParticipants: integer("max_participants"),
  requirements: text("requirements"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews for professional services
export const professionalReviews = pgTable("professional_reviews", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionalProfiles.id, { onDelete: "cascade" }),
  clientId: varchar("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  serviceId: integer("service_id").references(() => professionalServices.id, { onDelete: "set null" }),
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title"),
  comment: text("comment"),
  isVerified: boolean("is_verified").default(false), // vérifié si réservation confirmée
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service bookings
export const serviceBookings = pgTable("service_bookings", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => professionalServices.id, { onDelete: "cascade" }),
  professionalId: integer("professional_id").notNull().references(() => professionalProfiles.id, { onDelete: "cascade" }),
  clientId: varchar("client_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("pending"), // pending, confirmed, cancelled, completed
  paymentStatus: varchar("payment_status").default("pending"),
  notes: text("notes"),
  meetingLink: varchar("meeting_link"), // pour les sessions en ligne
  meetingLocation: text("meeting_location"), // pour les sessions en présentiel
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  organizedEvents: many(events),
  eventRegistrations: many(eventRegistrations),
  interactions: many(userInteractions, { relationName: "user" }),
  targetInteractions: many(userInteractions, { relationName: "target" }),
  resources: many(resources),
  professionalProfile: one(professionalProfiles),
  professionalReviews: many(professionalReviews),
  serviceBookings: many(serviceBookings),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  photos: many(profilePhotos),
}));

export const profilePhotosRelations = relations(profilePhotos, ({ one }) => ({
  profile: one(profiles, {
    fields: [profilePhotos.profileId],
    references: [profiles.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  registrations: many(eventRegistrations),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventRegistrations.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

export const userInteractionsRelations = relations(userInteractions, ({ one }) => ({
  user: one(users, {
    fields: [userInteractions.userId],
    references: [users.id],
    relationName: "user",
  }),
  targetUser: one(users, {
    fields: [userInteractions.targetUserId],
    references: [users.id],
    relationName: "target",
  }),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  author: one(users, {
    fields: [resources.authorId],
    references: [users.id],
  }),
}));

// Types and schemas
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  sentAt: true,
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;
export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = typeof eventRegistrations.$inferInsert;

export type UserInteraction = typeof userInteractions.$inferSelect;
export type InsertUserInteraction = typeof userInteractions.$inferInsert;

export type ProfilePhoto = typeof profilePhotos.$inferSelect;
export type InsertProfilePhoto = typeof profilePhotos.$inferInsert;

// Professional types
export type ProfessionalProfile = typeof professionalProfiles.$inferSelect;
export type InsertProfessionalProfile = typeof professionalProfiles.$inferInsert;
export const insertProfessionalProfileSchema = createInsertSchema(professionalProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ProfessionalService = typeof professionalServices.$inferSelect;
export type InsertProfessionalService = typeof professionalServices.$inferInsert;
export const insertProfessionalServiceSchema = createInsertSchema(professionalServices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ProfessionalReview = typeof professionalReviews.$inferSelect;
export type InsertProfessionalReview = typeof professionalReviews.$inferInsert;

export type ServiceBooking = typeof serviceBookings.$inferSelect;
export type InsertServiceBooking = typeof serviceBookings.$inferInsert;

// Forums et communauté
export const forumCategories = pgTable("forum_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  color: varchar("color").default("#8B5CF6"),
  icon: varchar("icon"),
  isPrivate: boolean("is_private").default(false),
  requiresApproval: boolean("requires_approval").default(false),
  moderatorIds: text("moderator_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forumTopics = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => forumCategories.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  tags: text("tags").array(),
  viewCount: integer("view_count").default(0),
  replyCount: integer("reply_count").default(0),
  lastReplyAt: timestamp("last_reply_at"),
  lastReplyById: varchar("last_reply_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull().references(() => forumTopics.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentReplyId: integer("parent_reply_id").references(() => forumReplies.id),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Groupes privés
export const communityGroups = pgTable("community_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  isPrivate: boolean("is_private").default(true),
  requiresApproval: boolean("requires_approval").default(true),
  maxMembers: integer("max_members").default(100),
  currentMembers: integer("current_members").default(0),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  moderatorIds: text("moderator_ids").array(),
  tags: text("tags").array(),
  imageUrl: varchar("image_url"),
  rules: text("rules"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const groupMemberships = pgTable("group_memberships", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => communityGroups.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").default("member"), // member, moderator, admin
  status: varchar("status").default("pending"), // pending, approved, rejected
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Journal personnel et bien-être
export const personalJournals = pgTable("personal_journals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title"),
  content: text("content").notNull(),
  mood: varchar("mood"), // joyful, calm, excited, sad, angry, anxious, etc.
  energy: integer("energy"), // 1-10 scale
  tags: text("tags").array(),
  isPrivate: boolean("is_private").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Système de badges et certifications
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category"), // skill, achievement, participation, etc.
  iconUrl: varchar("icon_url"),
  color: varchar("color").default("#8B5CF6"),
  requirements: text("requirements"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: integer("badge_id").notNull().references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
  isVisible: boolean("is_visible").default(true),
});

// Système de mentorat
export const mentorships = pgTable("mentorships", {
  id: serial("id").primaryKey(),
  mentorId: varchar("mentor_id").notNull().references(() => users.id),
  menteeId: varchar("mentee_id").notNull().references(() => users.id),
  focus: text("focus").array(), // areas of focus
  status: varchar("status").default("active"), // active, paused, completed
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  meetingFrequency: varchar("meeting_frequency"), // weekly, biweekly, monthly
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog communautaire
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: varchar("category"),
  tags: text("tags").array(),
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  imageUrl: varchar("image_url"),
  readingTime: integer("reading_time"), // en minutes
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const blogComments = pgTable("blog_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => blogPosts.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentCommentId: integer("parent_comment_id").references(() => blogComments.id),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Méditations et contenu audio
export const meditationContent = pgTable("meditation_content", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category"), // tantra, mindfulness, breathwork, etc.
  duration: integer("duration"), // en minutes
  difficulty: varchar("difficulty"), // beginner, intermediate, advanced
  instructor: varchar("instructor"),
  audioUrl: varchar("audio_url"),
  transcription: text("transcription"),
  tags: text("tags").array(),
  isPremium: boolean("is_premium").default(false),
  playCount: integer("play_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Défis et exercices relationnels
export const relationshipChallenges = pgTable("relationship_challenges", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category"), // communication, intimacy, trust, etc.
  difficulty: varchar("difficulty"),
  duration: varchar("duration"), // daily, weekly, monthly
  instructions: text("instructions").notNull(),
  tips: text("tips").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  challengeId: integer("challenge_id").notNull().references(() => relationshipChallenges.id),
  status: varchar("status").default("active"), // active, completed, abandoned
  progress: integer("progress").default(0), // percentage
  startDate: timestamp("start_date").defaultNow(),
  completedDate: timestamp("completed_date"),
  notes: text("notes"),
  reflection: text("reflection"),
});

// Premium et abonnements
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("EUR"),
  billingPeriod: varchar("billing_period"), // monthly, yearly, one-time
  features: text("features").array(),
  isActive: boolean("is_active").default(true),
  isPopular: boolean("is_popular").default(false),
  stripeId: varchar("stripe_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  status: varchar("status").default("active"), // active, cancelled, expired
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  autoRenew: boolean("auto_renew").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Système d'affiliation
export const affiliateProgram = pgTable("affiliate_program", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  affiliateCode: varchar("affiliate_code").notNull().unique(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(), // percentage
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0"),
  status: varchar("status").default("active"), // active, suspended, inactive
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const affiliateReferrals = pgTable("affiliate_referrals", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").notNull().references(() => affiliateProgram.id, { onDelete: "cascade" }),
  referredUserId: varchar("referred_user_id").references(() => users.id, { onDelete: "set null" }),
  clickId: varchar("click_id").notNull().unique(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  referrerUrl: text("referrer_url"),
  landingPage: text("landing_page"),
  clickedAt: timestamp("clicked_at").defaultNow(),
  convertedAt: timestamp("converted_at"),
  status: varchar("status").default("pending"), // pending, converted, invalid
});

export const affiliateCommissions = pgTable("affiliate_commissions", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").notNull().references(() => affiliateProgram.id, { onDelete: "cascade" }),
  referralId: integer("referral_id").references(() => affiliateReferrals.id, { onDelete: "set null" }),
  subscriptionId: integer("subscription_id").references(() => userSubscriptions.id, { onDelete: "set null" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  status: varchar("status").default("pending"), // pending, approved, paid, rejected
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentHistory = pgTable("payment_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // subscription, service_booking, commission_payout
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("EUR"),
  status: varchar("status").notNull(), // pending, completed, failed, refunded
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vérification d'identité et sécurité
export const identityVerifications = pgTable("identity_verifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  verificationType: varchar("verification_type"), // photo_id, selfie, phone, etc.
  status: varchar("status").default("pending"), // pending, approved, rejected
  documentUrl: varchar("document_url"),
  notes: text("notes"),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userReports = pgTable("user_reports", {
  id: serial("id").primaryKey(),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  reportedUserId: varchar("reported_user_id").notNull().references(() => users.id),
  reason: varchar("reason").notNull(),
  description: text("description"),
  evidence: text("evidence").array(),
  status: varchar("status").default("open"), // open, investigating, resolved, dismissed
  moderatorId: varchar("moderator_id").references(() => users.id),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Types pour les nouvelles tables
export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumCategory = typeof forumCategories.$inferInsert;

export type ForumTopic = typeof forumTopics.$inferSelect;
export type InsertForumTopic = typeof forumTopics.$inferInsert;

export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = typeof forumReplies.$inferInsert;

export type CommunityGroup = typeof communityGroups.$inferSelect;
export type InsertCommunityGroup = typeof communityGroups.$inferInsert;

export type GroupMembership = typeof groupMemberships.$inferSelect;
export type InsertGroupMembership = typeof groupMemberships.$inferInsert;

export type PersonalJournal = typeof personalJournals.$inferSelect;
export type InsertPersonalJournal = typeof personalJournals.$inferInsert;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

export type Mentorship = typeof mentorships.$inferSelect;
export type InsertMentorship = typeof mentorships.$inferInsert;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

export type BlogComment = typeof blogComments.$inferSelect;
export type InsertBlogComment = typeof blogComments.$inferInsert;

export type MeditationContent = typeof meditationContent.$inferSelect;
export type InsertMeditationContent = typeof meditationContent.$inferInsert;

export type RelationshipChallenge = typeof relationshipChallenges.$inferSelect;
export type InsertRelationshipChallenge = typeof relationshipChallenges.$inferInsert;

export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserChallenge = typeof userChallenges.$inferInsert;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

export type IdentityVerification = typeof identityVerifications.$inferSelect;
export type InsertIdentityVerification = typeof identityVerifications.$inferInsert;

export type UserReport = typeof userReports.$inferSelect;
export type InsertUserReport = typeof userReports.$inferInsert;

export type AffiliateProgram = typeof affiliateProgram.$inferSelect;
export type InsertAffiliateProgram = typeof affiliateProgram.$inferInsert;

export type AffiliateReferral = typeof affiliateReferrals.$inferSelect;
export type InsertAffiliateReferral = typeof affiliateReferrals.$inferInsert;

export type AffiliateCommission = typeof affiliateCommissions.$inferSelect;
export type InsertAffiliateCommission = typeof affiliateCommissions.$inferInsert;

export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type InsertPaymentHistory = typeof paymentHistory.$inferInsert;
