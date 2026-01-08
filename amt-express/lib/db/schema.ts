import {pgTable, serial, varchar, timestamp, integer, decimal, boolean, text, pgEnum, index, jsonb} from "drizzle-orm/pg-core";
import {relations, sql} from "drizzle-orm";
import {Option, OPTIONS} from "@/content/database_types/ride";
import {VEHICLE_TYPE} from "@/content/database_types/user";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'driver', 'customer']);
export const rideStatusEnum = pgEnum('ride_status', ['pending', 'assigned', 'completed', 'cancelled']);
export const shiftStatus = pgEnum('shift_status', ['planned', 'active', 'completed', 'cancelled']);
export const requestStatusEnum = pgEnum('request_status', ['pending', 'approved', 'rejected']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['unpaid', 'paid', 'cancelled']);
export const optionEnum = pgEnum('option_type', OPTIONS);
export const vehicleTypeEnum = pgEnum('vehicle_type', VEHICLE_TYPE);

// Users Table
export const users = pgTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    role: userRoleEnum("role"),
    banned: boolean("banned").default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
    // Driver-specific fields
    vehicleType: vehicleTypeEnum("vehicle_type"),
    vehiclePlate: text("vehicle_plate"),
    vehicleModel: text("vehicle_model"),
    vehicleColor: text("vehicle_color"),
});

// Table pour les entreprises/productions (ex: studios, sociétés de production)
export const productions = pgTable("productions", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    address: text("address"),
    contactName: text("contact_name"),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table pour les projets (ex: tournages, événements)
export const projects = pgTable("projects", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    productionId: text("production_id").references(() => productions.id).notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});


// Rides Table
export const rides = pgTable("rides", {
    id: serial("id").primaryKey(),
    departure: varchar("departure", {length: 255}).notNull(),
    destination: varchar("destination", {length: 255}).notNull(),
    departureTime: timestamp("departure_time").notNull(),
    arrivalTime: timestamp("arrival_time"),
    distanceKm: decimal("distance_km", {precision: 10, scale: 2}),
    price: decimal("price", {precision: 10, scale: 2}).notNull(),
    status: rideStatusEnum("status").default('pending').notNull(),
    photoUrl: varchar("photo_url", {length: 512}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    driverId: text("driver_id").references(() => users.id, {onDelete: "set null"}),
    customerNotes: text("customer_notes"),
    production: text("production").references(() => productions.id),
    project: text("project").references(() => projects.id),
    waitingTime: integer("waiting_time").default(0), // in minutes
    options: jsonb("options").$type<Option[]>().default([]),
}, (table) => [
    index("rides_driverId_idx").on(table.driverId),
    index("rides_production_idx").on(table.production),
    index("rides_project_idx").on(table.project),
]);

export const shiftPlanning = pgTable("shiftPlanning", {
    id: serial("id").primaryKey(),
    driverId: text("driver_id").references(() => users.id).notNull(),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    status: shiftStatus("status").default("planned"),
    productionId: text("production_id").references(() => productions.id),  // If linked to a production
    projectId: text("project_id").references(() => projects.id),          // If linked to a project
});


// Options Table
export const rideOptions = pgTable("ride_options", {
    id: serial("id").primaryKey(),
    name: optionEnum("name").notNull(),
    description: text("description"),
    additionalPrice: decimal("additional_price", {precision: 10, scale: 2}).default("0").notNull(),
});

// Ride Customers Junction Table (many-to-many)
export const rideCustomers = pgTable("ride_customers", {
    id: serial("id").primaryKey(),
    rideId: integer("ride_id").references(() => rides.id).notNull(),
    customerId: text("customer_id").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ride Selected Options Junction Table
export const rideSelectedOptions = pgTable("rideSelectedOptions", {
    id: serial("id").primaryKey(),
    rideId: integer("ride_id").references(() => rides.id).notNull(),
    optionName: optionEnum("option_name").notNull(),
    price: decimal("price", {precision: 10, scale: 2}).notNull(),  // Prix au moment de la réservation
}, (table) => [
    index("rideSelectedOptions_rideId_idx").on(table.rideId),
]);


// Assignment Requests Table
export const assignmentRequests = pgTable("assignment_requests", {
    id: serial("id").primaryKey(),
    rideId: integer("ride_id").references(() => rides.id).notNull(),
    driverId: text("driver_id").references(() => users.id).notNull(),
    status: requestStatusEnum("status").default('pending').notNull(),
    requestedAt: timestamp("requested_at").defaultNow().notNull(),
});

// Invoices Table
export const invoices = pgTable("invoices", {
    id: serial("id").primaryKey(),
    rideId: integer("ride_id").references(() => rides.id).notNull(),
    waitingFee: decimal("waiting_fee", {precision: 10, scale: 2}).default("0").notNull(),
    subTotal: decimal("sub_total", {precision: 10, scale: 2}).notNull(),
    tax: decimal("tax", {precision: 10, scale: 2}).default("0").notNull(),
    total: decimal("total", {precision: 10, scale: 2}).notNull(),
    status: invoiceStatusEnum("status").default('unpaid').notNull(),
    invoiceDate: timestamp("invoice_date").defaultNow().notNull(),
    dueDate: timestamp("due_date").default(sql`CURRENT_DATE + INTERVAL '30 days'`).notNull(),
    pdfUrl: varchar("pdf_url", {length: 512}),
    sentViaApp: boolean("sent_via_app").default(false).notNull(),
    appSentAt: timestamp("app_sent_at"),
    remindersSent: integer("reminders_sent").default(0).notNull(),
    lastReminderMessage: text("last_reminder_message"),
}, (table) => [
    index("invoices_rideId_idx").on(table.rideId),
]);

// Notifications Table
export const notifications = pgTable("notifications", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ratings Table
export const ratings = pgTable("ratings", {
    id: serial("id").primaryKey(),
    rideId: integer("ride_id").references(() => rides.id).notNull(),
    customerId: text("customer_id").references(() => users.id).notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    index("ratings_rideId_idx").on(table.rideId),
]);

// Notification Preferences Table
export const notificationPreferences = pgTable("notification_preferences", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    email: boolean("email").default(true).notNull(),
    push: boolean("push").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity Logs Table
export const activityLogs = pgTable("activity_logs", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    action: varchar("action", {length: 255}).notNull(),
    details: text("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Auth Tables
export const session = pgTable(
    "session",
    {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token").notNull().unique(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {onDelete: "cascade"}),
        impersonatedBy: text("impersonated_by"),
    },
    (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
    "account",
    {
        id: text("id").primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {onDelete: "cascade"}),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
    "verification",
    {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// Relations
export const usersRelations = relations(users, ({many}) => ({
    rideCustomers: many(rideCustomers),
    ridesAsDriver: many(rides, {relationName: "driverRides"}),
    assignmentRequests: many(assignmentRequests),
    notifications: many(notifications),
    ratings: many(ratings),
    notificationPreferences: many(notificationPreferences),
    activityLogs: many(activityLogs),
}));

export const ridesRelations = relations(rides, ({one, many}) => ({
    rideCustomers: many(rideCustomers),
    driver: one(users, {
        fields: [rides.driverId],
        references: [users.id],
        relationName: "driverRides",
    }),
    assignmentRequests: many(assignmentRequests),
    invoices: many(invoices),
    ratings: many(ratings),
    productions: one(productions, {
        fields: [rides.production],
        references: [productions.id],
    }),
    projects: one(projects, {
        fields: [rides.project],
        references: [projects.id],
    }),
    selectedOptions: many(rideSelectedOptions),
}));

export const rideCustomersRelations = relations(rideCustomers, ({one}) => ({
    ride: one(rides, {
        fields: [rideCustomers.rideId],
        references: [rides.id],
    }),
    customer: one(users, {
        fields: [rideCustomers.customerId],
        references: [users.id],
    }),
}));

export const assignmentRequestsRelations = relations(assignmentRequests, ({one}) => ({
    ride: one(rides, {
        fields: [assignmentRequests.rideId],
        references: [rides.id],
    }),
    driver: one(users, {
        fields: [assignmentRequests.driverId],
        references: [users.id],
    }),
}));

export const invoicesRelations = relations(invoices, ({one}) => ({
    ride: one(rides, {
        fields: [invoices.rideId],
        references: [rides.id],
    }),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));

export const ratingsRelations = relations(ratings, ({one}) => ({
    ride: one(rides, {
        fields: [ratings.rideId],
        references: [rides.id],
    }),
    customer: one(users, {
        fields: [ratings.customerId],
        references: [users.id],
    }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({one}) => ({
    user: one(users, {
        fields: [notificationPreferences.userId],
        references: [users.id],
    }),
}));

export const activityLogsRelations = relations(activityLogs, ({one}) => ({
    user: one(users, {
        fields: [activityLogs.userId],
        references: [users.id],
    }),
}));

export const productionsRelations = relations(productions, ({many}) => ({
    projects: many(projects),
    rides: many(rides),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
    production: one(productions, {
        fields: [projects.productionId],
        references: [productions.id],
    }),
    rides: many(rides),
}));

// Auth Relations
export const userRelations = relations(users, ({many}) => ({
    sessions: many(session),
    accounts: many(account),
}));

export const sessionRelations = relations(session, ({one}) => ({
    user: one(users, {
        fields: [session.userId],
        references: [users.id],
    }),
}));

export const accountRelations = relations(account, ({one}) => ({
    user: one(users, {
        fields: [account.userId],
        references: [users.id],
    }),
}));

export const rideSelectedOptionsRelations = relations(rideSelectedOptions, ({ one }) => ({
  ride: one(rides, {
    fields: [rideSelectedOptions.rideId],
    references: [rides.id],
  }),
}));

export const shiftPlanningRelations = relations(shiftPlanning, ({ one }) => ({
  driver: one(users, {
    fields: [shiftPlanning.driverId],
    references: [users.id],
  }),
  production: one(productions, {
    fields: [shiftPlanning.productionId],
    references: [productions.id],
  }),
  project: one(projects, {
    fields: [shiftPlanning.projectId],
    references: [projects.id],
  }),
}));