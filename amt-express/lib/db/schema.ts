import { pgTable, varchar, timestamp, integer, decimal, boolean, text, pgEnum, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { USER_ROLES } from "@/content/database_types";
import { randomUUID } from "crypto";

// ========== ENUMS ==========
export const userRoleEnum = pgEnum('user_role', USER_ROLES);
export const rideStatusEnum = pgEnum('ride_status', ['pending', 'assigned', 'completed', 'cancelled']);
export const shiftStatusEnum = pgEnum('shift_status', ['planned', 'active', 'completed', 'cancelled']);
export const requestStatusEnum = pgEnum('request_status', ['pending', 'approved', 'rejected']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['unpaid', 'paid', 'cancelled']);

// ========== TABLES ==========

// --- Users
export const users = pgTable("users", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
    role: userRoleEnum("role").notNull(),
    banned: boolean("banned").default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
    latitude: decimal("latitude", { precision: 9, scale: 6 }),
    longitude: decimal("longitude", { precision: 9, scale: 6 }),
    lastLocationUpdate: timestamp("last_location_update"),
}, (table) => [
    index("users_email_idx").on(table.email),
    index("users_role_idx").on(table.role),
]);

// --- Drivers
export const drivers = pgTable("drivers", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "set null" }),
    accountingCode: text("accounting_code"),
    vehicleType: text("vehicle_type"),
    vehiclePlate: text("vehicle_plate").notNull(),
    vehicleModel: text("vehicle_model"),
    vehicleColor: text("vehicle_color"),
    available: boolean("available").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index("drivers_userId_idx").on(table.userId),
]);

// --- Productions
export const productions = pgTable("productions", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    name: text("name").notNull(),
    address: text("address"),
    contactName: text("contact_name"),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index("productions_name_idx").on(table.name),
]);

// --- Projects
export const projects = pgTable("projects", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    name: text("name").notNull(),
    productionId: text("production_id").references(() => productions.id, { onDelete: "set null" }),
    isGeneric: boolean("is_generic").default(false).notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index("projects_productionId_idx").on(table.productionId),
    index("projects_isGeneric_idx").on(table.isGeneric),
]);

// --- Rides
export const rides = pgTable("rides", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    departure: varchar("departure", { length: 255 }).notNull(),
    destination: varchar("destination", { length: 255 }).notNull(),
    departureTime: timestamp("departure_time").notNull(),
    arrivalTime: timestamp("arrival_time"),
    distanceKm: decimal("distance_km", { precision: 6, scale: 2 }),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    status: rideStatusEnum("status").default('pending').notNull(),
    photoUrl: text("photo_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
    driverId: text("driver_id").references(() => drivers.id, { onDelete: "set null" }),
    customerNotes: text("customer_notes"),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    waitingTime: integer("waiting_time").default(0),
}, (table) => [
    index("rides_driverId_idx").on(table.driverId),
    index("rides_projectId_idx").on(table.projectId),
    index("rides_status_idx").on(table.status),
]);

// --- Shift Planning
export const shiftPlanning = pgTable("shift_planning", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    driverId: text("driver_id").references(() => drivers.id, { onDelete: "set null" }).notNull(),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    status: shiftStatusEnum("status").default("planned"),
    projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index("shiftPlanning_driverId_idx").on(table.driverId),
    index("shiftPlanning_projectId_idx").on(table.projectId),
]);

// --- Ride Options
export const rideOptions = pgTable("ride_options", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    name: text("name").notNull(),
    description: text("description"),
    additionalPrice: decimal("additional_price", { precision: 10, scale: 2 }).default("0").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index("rideOptions_name_idx").on(table.name),
]);

// --- Ride Selected Options
export const rideSelectedOptions = pgTable("ride_selected_options", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    rideId: text("ride_id").references(() => rides.id, { onDelete: "set null" }).notNull(),
    optionId: text("option_id").references(() => rideOptions.id, { onDelete: "set null" }).notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    index("rideSelectedOptions_rideId_idx").on(table.rideId),
    index("rideSelectedOptions_optionId_idx").on(table.optionId),
]);

// --- Ride Customers
export const rideCustomers = pgTable("ride_customers", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    rideId: text("ride_id").references(() => rides.id, { onDelete: "set null" }).notNull(),
    customerId: text("customer_id").references(() => users.id, { onDelete: "set null" }).notNull(),
    rating: integer("rating"),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index("rideCustomers_rideId_idx").on(table.rideId),
    index("rideCustomers_customerId_idx").on(table.customerId),
]);

// --- Assignment Requests
export const assignmentRequests = pgTable("assignment_requests", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    rideId: text("ride_id").references(() => rides.id, { onDelete: "set null" }).notNull(),
    shiftId: text("shift_id").references(() => shiftPlanning.id, { onDelete: "set null" }),
    driverId: text("driver_id").references(() => drivers.id, { onDelete: "set null" }).notNull(),
    status: requestStatusEnum("status").default('pending').notNull(),
    requestedAt: timestamp("requested_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index("assignmentRequests_rideId_idx").on(table.rideId),
    index("assignmentRequests_driverId_idx").on(table.driverId),
]);

// --- Invoices
export const invoices = pgTable("invoices", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    waitingFee: decimal("waiting_fee", { precision: 10, scale: 2 }).default("0").notNull(),
    subTotal: decimal("sub_total", { precision: 10, scale: 2 }).notNull(),
    tax: decimal("tax", { precision: 10, scale: 2 }).default("0").notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    status: invoiceStatusEnum("status").default('unpaid').notNull(),
    invoiceDate: timestamp("invoice_date").defaultNow().notNull(),
    dueDate: timestamp("due_date").notNull(),
    pdfUrl: text("pdf_url"),
    sentViaApp: boolean("sent_via_app").default(false).notNull(),
    appSentAt: timestamp("app_sent_at"),
    remindersSent: integer("reminders_sent").default(0).notNull(),
    lastReminderMessage: text("last_reminder_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index("invoices_status_idx").on(table.status),
]);

// --- Invoice Items
export const invoiceItems = pgTable("invoice_items", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    invoiceId: text("invoice_id").references(() => invoices.id, { onDelete: "cascade" }).notNull(),
    rideId: text("ride_id").references(() => rides.id, { onDelete: "set null" }),
    shiftId: text("shift_id").references(() => shiftPlanning.id, { onDelete: "set null" }),
    description: text("description"),
    quantity: integer("quantity").default(1).notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0.00").notNull(),
    taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index("invoice_items_invoiceId_idx").on(table.invoiceId),
    index("invoice_items_rideId_idx").on(table.rideId),
    index("invoice_items_shiftId_idx").on(table.shiftId),
]);

// --- Notifications
export const notifications = pgTable("notifications", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index("notifications_userId_idx").on(table.userId),
    index("notifications_isRead_idx").on(table.isRead),
]);

// --- Notification Preferences
export const notificationPreferences = pgTable("notification_preferences", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }).notNull(),
    email: boolean("email").default(true).notNull(),
    push: boolean("push").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index("notificationPreferences_userId_idx").on(table.userId),
]);

// --- Activity Logs
export const activityLogs = pgTable("activity_logs", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }).notNull(),
    action: varchar("action", { length: 255 }).notNull(),
    details: text("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    index("activityLogs_userId_idx").on(table.userId),
    index("activityLogs_createdAt_idx").on(table.createdAt),
]);

// --- Auth Tables
export const session = pgTable("session", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "set null" }),
    impersonatedBy: text("impersonated_by"),
}, (table) => [
    index("session_userId_idx").on(table.userId),
    index("session_token_idx").on(table.token),
    index("session_expiresAt_idx").on(table.expiresAt),
]);

export const account = pgTable("account", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "set null" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index("account_userId_idx").on(table.userId),
]);

export const verification = pgTable("verification", {
    id: text("id").primaryKey().$defaultFn(() => randomUUID()),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index("verification_identifier_idx").on(table.identifier),
    index("verification_expiresAt_idx").on(table.expiresAt),
]);

// ========== RELATIONS ==========
export const usersRelations = relations(users, ({ many }) => ({
    drivers: many(drivers),
    rideCustomers: many(rideCustomers),
    notifications: many(notifications),
    notificationPreferences: many(notificationPreferences),
    activityLogs: many(activityLogs),
    sessions: many(session),
    accounts: many(account),
}));

export const driversRelations = relations(drivers, ({ one, many }) => ({
    user: one(users, {
        fields: [drivers.userId],
        references: [users.id],
    }),
    rides: many(rides),
    shiftPlanning: many(shiftPlanning),
    assignmentRequests: many(assignmentRequests),
    invoiceItems: many(invoiceItems),
}));

export const productionsRelations = relations(productions, ({ many }) => ({
    projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
    production: one(productions, {
        fields: [projects.productionId],
        references: [productions.id],
    }),
    rides: many(rides),
    shiftPlanning: many(shiftPlanning),
}));

export const ridesRelations = relations(rides, ({ one, many }) => ({
    driver: one(drivers, {
        fields: [rides.driverId],
        references: [drivers.id],
    }),
    project: one(projects, {
        fields: [rides.projectId],
        references: [projects.id],
    }),
    rideCustomers: many(rideCustomers),
    rideSelectedOptions: many(rideSelectedOptions),
    assignmentRequests: many(assignmentRequests),
    invoiceItems: many(invoiceItems),
}));

export const rideCustomersRelations = relations(rideCustomers, ({ one }) => ({
    ride: one(rides, {
        fields: [rideCustomers.rideId],
        references: [rides.id],
    }),
    customer: one(users, {
        fields: [rideCustomers.customerId],
        references: [users.id],
    }),
}));

export const rideOptionsRelations = relations(rideOptions, ({ many }) => ({
    rideSelectedOptions: many(rideSelectedOptions),
}));

export const rideSelectedOptionsRelations = relations(rideSelectedOptions, ({ one }) => ({
    ride: one(rides, {
        fields: [rideSelectedOptions.rideId],
        references: [rides.id],
    }),
    option: one(rideOptions, {
        fields: [rideSelectedOptions.optionId],
        references: [rideOptions.id],
    }),
}));

export const shiftPlanningRelations = relations(shiftPlanning, ({ one, many }) => ({
    driver: one(drivers, {
        fields: [shiftPlanning.driverId],
        references: [drivers.id],
    }),
    project: one(projects, {
        fields: [shiftPlanning.projectId],
        references: [projects.id],
    }),
    invoiceItems: many(invoiceItems),
}));

export const assignmentRequestsRelations = relations(assignmentRequests, ({ one }) => ({
    ride: one(rides, {
        fields: [assignmentRequests.rideId],
        references: [rides.id],
    }),
    shift: one(shiftPlanning, {
        fields: [assignmentRequests.shiftId],
        references: [shiftPlanning.id],
    }),
    driver: one(drivers, {
        fields: [assignmentRequests.driverId],
        references: [drivers.id],
    }),
}));

export const invoicesRelations = relations(invoices, ({ many }) => ({
    invoiceItems: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
    invoice: one(invoices, {
        fields: [invoiceItems.invoiceId],
        references: [invoices.id],
    }),
    ride: one(rides, {
        fields: [invoiceItems.rideId],
        references: [rides.id],
    }),
    shift: one(shiftPlanning, {
        fields: [invoiceItems.shiftId],
        references: [shiftPlanning.id],
    }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
    user: one(users, {
        fields: [notificationPreferences.userId],
        references: [users.id],
    }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
    user: one(users, {
        fields: [activityLogs.userId],
        references: [users.id],
    }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(users, {
        fields: [session.userId],
        references: [users.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(users, {
        fields: [account.userId],
        references: [users.id],
    }),
}));