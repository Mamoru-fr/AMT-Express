<h1 style='text-align: center'>AMT Express</h1>
<h2 style='text-align: center'>Technical Architecture & Design Decisions</h2>

<h3 style='text-align: center'>DOCUMENT VERSION 1.0</h3>
<h3 style='text-align: center'>28/01/2026</h3>

---

<details>
<summary>Table of Contents</summary>

- [**1. Project Overview**](#1-project-overview)
- [**2. Technology Stack & Why**](#2-technology-stack--why)
- [**3. Architecture Patterns**](#3-architecture-patterns)
- [**4. Database Design**](#4-database-design)
- [**5. Authentication & Authorization**](#5-authentication--authorization)
- [**6. State Management**](#6-state-management)
- [**7. Data Flow & Server Actions**](#7-data-flow--server-actions)
- [**8. UI/UX Patterns**](#8-uiux-patterns)
- [**9. Internationalization (i18n)**](#9-internationalization-i18n)
- [**10. Code Organization**](#10-code-organization)
- [**11. Error Handling Strategy**](#11-error-handling-strategy)
- [**12. Development Workflow**](#12-development-workflow)
- [**13. How to Modify & Customize**](#13-how-to-modify--customize)
- [**14. Future Improvements**](#14-future-improvements)

</details>

---

## **1. Project Overview**

### **What is AMT Express?**

AMT Express is a transportation management platform for coordinating rides between drivers and customers, with a focus on production/corporate clients. The application handles:

- **Admin Dashboard**: Complete ride management, driver assignment, customer management
- **Driver Dashboard**: View available rides, track earnings, manage availability
- **Customer Features**: Book rides, track in real-time (planned)
- **Invoicing System**: Automated invoice generation and payment tracking
- **Production/Project Management**: Link rides to specific productions/projects for corporate clients

### **Current Implementation Status**

✅ **Completed**:
- Admin ride management (CRUD operations)
- Admin & Driver dashboards with KPIs
- Authentication system with role-based access
- Database schema with all necessary tables
- Internationalization (i18n) framework
- CSV import capability
- Server-side validation with Zod

🚧 **In Progress/Planned**:
- Real-time GPS tracking
- OCR for ticket scanning
- Payment integration (Stripe/PayPal)
- Chat system between drivers and customers
- Mobile responsiveness improvements
- Notification system

---

## **2. Technology Stack & Why**

### **Frontend Framework: Next.js 16.1.1**

**Why Next.js?**
- **Server Components by default**: Better performance, smaller client bundles
- **App Router**: Modern routing with layouts and loading states
- **Server Actions**: Seamless server-side operations without API routes
- **Built-in optimization**: Image optimization, font optimization, automatic code splitting
- **TypeScript support**: First-class TypeScript integration

**Trade-offs**:
- ✅ Faster page loads, better SEO, simpler data fetching
- ❌ Steeper learning curve with Server/Client Components distinction
- ❌ Some libraries don't support Server Components yet

### **Database: Neon PostgreSQL (Serverless)**

**Why Neon?**
- **Serverless**: Pay per usage, auto-scaling, no server management
- **PostgreSQL**: Full SQL power with ACID compliance
- **Branching**: Database branches for development/staging (like Git for databases)
- **Free tier**: Generous limits for development and small apps

**Trade-offs**:
- ✅ Zero ops, automatic backups, modern DX
- ❌ Cold start latency (mitigated with connection pooling)
- ❌ Vendor lock-in (but can export to any PostgreSQL)

**Connection Strategy**:
```typescript
// lib/db/drizzle.ts
import {neon} from "@neondatabase/serverless"; 
const sql = neon(process.env.DATABASE_URL!); // HTTP-based, works in serverless
```

### **ORM: Drizzle ORM 0.45.1**

**Why Drizzle over Prisma?**
- **TypeScript-first**: Schema defined in TypeScript, not a custom DSL
- **Lightweight**: Smaller bundle size, faster query execution
- **SQL-like API**: If you know SQL, you know Drizzle
- **Better for complex queries**: More control over joins and aggregations
- **Excellent TypeScript inference**: Better autocomplete and type safety

**Example**:
```typescript
// Drizzle - TypeScript-first, SQL-like
const result = await db
  .select()
  .from(rides)
  .where(eq(rides.status, 'pending'))
  .leftJoin(users, eq(rides.driverId, users.id));

// Prisma - Custom DSL
const result = await prisma.ride.findMany({
  where: { status: 'pending' },
  include: { driver: true }
});
```

**Trade-offs**:
- ✅ More control, better performance, smaller bundle
- ❌ Less mature ecosystem, fewer third-party tools
- ❌ No visual admin panel (like Prisma Studio)

### **Authentication: Better Auth 1.4.10**

**Why Better Auth over NextAuth.js?**
- **Better TypeScript support**: Fully typed, no `any` types
- **Modern architecture**: Built for Next.js App Router
- **Flexible**: Easy to customize without fighting the framework
- **Admin plugin**: Built-in role management and user banning
- **Database adapter**: Works seamlessly with Drizzle

**Key Features Used**:
```typescript
// lib/auth/auth.ts
export const auth = betterAuth({
    emailAndPassword: { enabled: true },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: { user: schema.users, session: schema.session, ... }
    }),
    plugins: [
        nextCookies(),  // Next.js cookie integration
        admin({ defaultRole: "customer" })  // Role management
    ],
});
```

**Trade-offs**:
- ✅ Better DX, cleaner code, easier customization
- ❌ Smaller community compared to NextAuth.js
- ❌ Fewer third-party integrations

### **Validation: Zod 4.3.5**

**Why Zod?**
- **TypeScript-first**: Schema definition generates TypeScript types
- **Runtime validation**: Validates data at runtime (crucial for user input)
- **Excellent error messages**: Clear validation errors for users
- **Composable**: Easy to create complex validation schemas

**Usage Pattern**:
```typescript
// lib/validations/ride.ts
export const CreateRideSchema = z.object({
  departure: z.string().min(3, "Departure must be at least 3 characters"),
  destination: z.string().min(3),
  departureTime: z.coerce.date().refine((date) => date > new Date(), {
    message: "Departure time must be in the future"
  }),
  customerIds: z.array(z.string()).nonempty(),
});

// In server action
const validatedData = CreateRideSchema.parse(input);
```

### **Styling: Tailwind CSS 4**

**Why Tailwind?**
- **Utility-first**: Fast development, no context switching
- **Consistency**: Design system baked into classes
- **Tree-shaking**: Only used classes in production bundle
- **Responsive design**: Mobile-first breakpoints

**Trade-offs**:
- ✅ Fast prototyping, consistent design, small bundle
- ❌ Long className strings (can be mitigated with components)
- ❌ Learning curve for utility classes

### **Internationalization: react-i18next 16.5.1**

**Why react-i18next?**
- **Industry standard**: Most popular i18n library for React
- **Powerful**: Pluralization, interpolation, context, nesting
- **TypeScript support**: Type-safe translations
- **SSR compatible**: Works with Next.js Server Components (with workarounds)

**Current Setup**:
```typescript
// services/i18next.ts
i18next.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
        en: { translation: en },
        fr: { translation: fr },
    },
});
```

---

## **3. Architecture Patterns**

### **Server-First Architecture**

The app follows a **Server-First** pattern where most logic happens on the server:

```
┌──────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
├──────────────────────────────────────────────────────────────┤
│  • React Client Components ('use client')                    │
│  • UI State (modals, filters, form inputs)                   │
│  • Calls Server Actions                                      │
└────────────────────┬─────────────────────────────────────────┘
                     │ Server Actions (async functions)
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                     SERVER (Next.js)                         │
├──────────────────────────────────────────────────────────────┤
│  • Server Components (default)                               │
│  • Server Actions (lib/actions/*.ts)                         │
│  • Authentication (Better Auth)                              │
│  • Validation (Zod schemas)                                  │
│  • Business Logic                                            │
└────────────────────┬─────────────────────────────────────────┘
                     │ Drizzle ORM
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                     DATABASE (Neon PostgreSQL)               │
└──────────────────────────────────────────────────────────────┘
```

**Benefits**:
- ✅ **Security**: Sensitive logic never exposed to client
- ✅ **Performance**: Smaller client bundles, faster hydration
- ✅ **Simplicity**: No need for REST/GraphQL API layer
- ✅ **Type Safety**: End-to-end TypeScript from DB to UI

### **Feature-Based Component Organization**

Components are organized by feature, not by type:

```
components/
├── admin/
│   └── rideManagement/      # All ride management components together
│       ├── RidesManagementBoard.tsx
│       ├── AddRideModal.tsx
│       ├── EditRideModal.tsx
│       └── AssignDriverModal.tsx
├── dashboard/               # Shared dashboard components
│   ├── AdminDashboard.tsx
│   └── DriverDashboard.tsx
└── classicComponents/       # Reusable UI primitives
    ├── Button.tsx
    └── Input.tsx
```

**Why?**
- ✅ Easier to find related components
- ✅ Better code colocation (components + their logic)
- ✅ Easier to delete features (just remove the folder)

---

## **4. Database Design**

### **Schema Overview**

The database uses **PostgreSQL enums** for type safety and **foreign keys** for data integrity:

```typescript
// Core tables
users               // Admins, drivers, customers
rides               // Main entity - transportation requests
rideCustomers       // Many-to-many: rides ↔ customers
productions         // Corporate clients (e.g., studios)
projects            // Specific events (e.g., film shoots)
invoices            // Billing records
ratings             // Customer feedback on rides
notifications       // In-app notifications
activityLogs        // Audit trail
```

### **Key Design Decisions**

#### **1. User Role Enum**
```typescript
export const userRoleEnum = pgEnum('user_role', ['admin', 'driver', 'customer']);
```

**Why an enum?**
- ✅ Database-level constraint (can't insert invalid roles)
- ✅ Better performance than string comparison
- ✅ Self-documenting schema

**Stored in `users` table**:
```typescript
export const users = pgTable("users", {
    id: text("id").primaryKey(),
    role: userRoleEnum("role"),
    // ... other fields
});
```

#### **2. Ride Status Flow**
```typescript
export const rideStatusEnum = pgEnum('ride_status', 
  ['pending', 'assigned', 'completed', 'cancelled']
);
```

**State machine**:
```mermaid
flowchart LR
A[Pending] --> B[Assigned]
B --> C[Ongoing]
C --> E[Completed]
A --> D[Cancelled]
B --> D[Cancelled]
```

**Why this design?**
- ✅ Clear status transitions
- ✅ Easy to query (e.g., "show all pending rides")
- ✅ Supports business rules (e.g., "can't assign a cancelled ride")

#### **3. Many-to-Many: Rides ↔ Customers**

**Problem**: A ride can have multiple customers (e.g., group booking), but a ride also has a single driver.

**Solution**: Junction table `rideCustomers`:
```typescript
export const rideCustomers = pgTable("ride_customers", {
    id: serial("id").primaryKey(),
    rideId: integer("ride_id").references(() => rides.id).notNull(),
    customerId: text("customer_id").references(() => users.id).notNull(),
});
```

**Why?**
- ✅ Supports multiple customers per ride
- ✅ Maintains referential integrity
- ✅ Easy to query: "Show all rides for customer X"

**Driver assignment is simpler (1:1)**:
```typescript
export const rides = pgTable("rides", {
    driverId: text("driver_id").references(() => users.id),  // Nullable
});
```

#### **4. Production/Project Hierarchy**

**Business need**: Track rides for corporate clients (productions) and their specific events (projects).

**Schema**:
```typescript
productions  (1) ──< (many) projects
     ↑                        ↑
     │                        │
     └──────── rides ─────────┘
```

**Example**:
- Production: "Universal Studios Paris"
- Project: "Film Shoot - Jan 2026"
- Rides: All transportation for crew during that shoot

**Benefits**:
- ✅ Grouped invoicing per production
- ✅ Analytics by client
- ✅ Shift planning tied to projects

#### **5. Options as JSONB**

**Problem**: Rides can have multiple options (VIP, baby seat, etc.) with varying prices.

**Current approach**: JSONB column in `rides` table:
```typescript
export const rides = pgTable("rides", {
    options: jsonb("options").$type<Option[]>().default([]),
});
```

**Why JSONB?**
- ✅ Flexible: Can add new option types without schema migration
- ✅ Fast: PostgreSQL has efficient JSONB indexing
- ✅ Type-safe: TypeScript knows the structure

**Alternative considered**: Separate `rideSelectedOptions` table (also implemented for historical pricing):
```typescript
export const rideSelectedOptions = pgTable("rideSelectedOptions", {
    rideId: integer("ride_id").references(() => rides.id),
    optionName: optionEnum("option_name"),
    price: decimal("price", {precision: 10, scale: 2}),
});
```

**Why both?**
- `options` JSONB: Quick access, embedded in ride queries
- `rideSelectedOptions` table: Historical pricing (option prices can change over time)

#### **6. Soft Deletes vs Hard Deletes**

**Current approach**: Hard deletes (permanent removal).

**Why?**
- ✅ Simpler queries (no `WHERE deleted_at IS NULL` everywhere)
- ✅ RGPD compliance (right to be forgotten)

**Future consideration**: Soft deletes for audit trail (add `deletedAt` timestamp).

---

## **5. Authentication & Authorization**

### **Authentication Flow**

```typescript
// lib/auth/auth.ts
export const auth = betterAuth({
    emailAndPassword: { enabled: true },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.users,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        },
    }),
    plugins: [admin({ defaultRole: "customer" })]
});
```

**How it works**:
1. User signs up → `users` table gets new row with `role: 'customer'`
2. User logs in → `session` table stores session token (httpOnly cookie)
3. Server Components check session: `await auth.api.getSession({ headers })`
4. Client Components use context: `useSession()` hook

### **Session Management**

**Server-side** (in Server Components or Actions):
```typescript
const session = await auth.api.getSession({
    headers: await import("next/headers").then(m => m.headers())
});

if (!session || session.user.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
}
```

**Client-side** (in Client Components):
```tsx
'use client'

import {useSession} from "@/context/SessionContext";

export function MyComponent() {
    const {session} = useSession();
    
    if (session?.user.role === 'admin') {
        // Show admin UI
    }
}
```

### **Role-Based Access Control (RBAC)**

**3 Roles**:
- `admin`: Full access (ride management, user management, reports)
- `driver`: Limited access (own rides, earnings, availability)
- `customer`: Minimal access (book rides, view history)

**Enforcement Layers**:

1. **Database level**: Role stored in `users.role` (enum)
2. **Server Action level**: Check `session.user.role` before any operation
3. **UI level**: Conditional rendering based on role
4. **Route level**: Redirect unauthorized users

**Example**:
```typescript
// lib/actions/ridesManagementActions.ts
export async function deleteRide(rideId: number) {
    const session = await auth.api.getSession({...});
    
    if (!session || session.user.role !== 'admin') {
        return {
            success: false,
            error: 'Unauthorized: Admin access only',
            code: ErrorCodes.UNAUTHORIZED
        };
    }
    
    // Proceed with deletion
}
```

### **Session Context Provider**

**Why a custom context?**

Better Auth provides session data, but we wrap it for:
- **Client-side access**: `useSession()` hook
- **Validated roles**: `useSessionWithRole()` with type guards
- **Development warnings**: Detect invalid roles early

```typescript
// context/SessionContext.tsx
export const useSessionWithRole = () => {
    const {session} = useSession();
    const validatedRole = getValidatedRole(session);  // Type guard
    
    return {
        session,
        role: validatedRole,
        isAdmin: validatedRole === 'admin',
        isDriver: validatedRole === 'driver',
        isCustomer: validatedRole === 'customer',
    };
};
```

**Usage**:
```tsx
const {isAdmin} = useSessionWithRole();

if (isAdmin) {
    return <AdminPanel />;
}
```

---

## **6. State Management**

### **No Global State Library (Yet)**

**Why no Redux/Zustand/Jotai?**
- Most data is **server-owned** (fetched from database)
- Next.js Server Components **eliminate prop drilling** via layout nesting
- Client state is **local and ephemeral** (modal open/close, form inputs)

**Current state management**:

1. **Server State**: Fetched via Server Actions, passed to Client Components
```tsx
// Server Component
export default async function RideManagementPage() {
    const result = await fetchRidesForManagement();
    return <RidesManagementBoard initialData={result.data} />;
}
```

2. **Client State**: React `useState` for UI interactions
```tsx
'use client'

export function RidesManagementBoard() {
    const [filters, setFilters] = useState({ search: '', status: 'all' });
    const [addModal, setAddModal] = useState(false);
    // ...
}
```

3. **Session State**: Context API for auth
```tsx
<SessionProvider session={session}>
    {children}
</SessionProvider>
```

**When to add global state?**
- If you need **cross-component shared state** (e.g., shopping cart)
- If you need **optimistic updates** (update UI before server confirms)
- If you're building **real-time features** (chat, live tracking)

**Recommendation**: Start with **TanStack Query (React Query)** for server state caching before adding Zustand.

---

## **7. Data Flow & Server Actions**

### **Server Actions Pattern**

Server Actions are the **primary way** to interact with the database. No REST API needed.

**Structure**:
```typescript
// lib/actions/ridesManagementActions.ts
'use server'  // ⚠️ Required for Server Actions

export async function fetchRidesForManagement(
    filters: RideFilters = {}
): Promise<ActionResponse<RidesManagementData>> {
    try {
        // 1. Validate session
        const session = await auth.api.getSession({...});
        if (!session || session.user.role !== 'admin') {
            return { success: false, error: 'Unauthorized' };
        }

        // 2. Validate input
        const validatedFilters = RideFiltersSchema.parse(filters);

        // 3. Query database
        const rides = await db.select()...;

        // 4. Return typed response
        return { success: true, data: { rides, total, page, totalPages } };
        
    } catch (error) {
        // 5. Handle errors
        return { success: false, error: 'Database error' };
    }
}
```

### **Standardized Response Type**

All Server Actions return `ActionResponse<T>`:

```typescript
// lib/types/action-response.ts
export type ActionResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string };
```

**Benefits**:
- ✅ **Type safety**: Client knows the shape of success/error
- ✅ **Consistency**: Every action handles errors the same way
- ✅ **Error codes**: Programmatic error handling (`ErrorCodes.UNAUTHORIZED`)

**Usage in components**:
```tsx
const result = await fetchRidesForManagement(filters);

if (!result.success) {
    alert(result.error);  // Type-safe error message
    return;
}

const {rides, total} = result.data;  // Type-safe data access
```

### **Validation Pipeline**

Every Server Action follows this pipeline:

```
1. Authentication  → Is user logged in?
2. Authorization   → Does user have permission?
3. Input Validation → Is data valid? (Zod)
4. Business Logic  → Process the request
5. Database Query  → Execute query (Drizzle)
6. Response        → Return ActionResponse<T>
```

**Example**:
```typescript
export async function createRide(input: unknown) {
    // 1. Auth
    const session = await auth.api.getSession({...});
    if (!session) return { success: false, error: 'Not logged in' };

    // 2. Authz
    if (session.user.role !== 'admin') {
        return { success: false, error: 'Forbidden' };
    }

    // 3. Validation
    const data = CreateRideSchema.parse(input);  // Throws if invalid

    // 4. Business Logic
    const price = data.price || calculatePrice(data.departure, data.destination);

    // 5. Database
    const ride = await db.insert(rides).values({...}).returning();

    // 6. Response
    return { success: true, data: ride };
}
```

### **Pagination & Filtering**

**Pattern used**: Offset-based pagination with server-side filtering.

```typescript
export async function fetchRidesForManagement(filters: RideFilters = {}) {
    const { page = 1, limit = 50, search, status, sortBy, sortOrder } = filters;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions = [];
    if (status !== 'all') conditions.push(eq(rides.status, status));
    if (search) conditions.push(ilike(rides.departure, `%${search}%`));

    // Query with pagination
    const results = await db
        .select()
        .from(rides)
        .where(and(...conditions))
        .orderBy(sortOrder === 'asc' ? asc(rides[sortBy]) : desc(rides[sortBy]))
        .limit(limit)
        .offset(offset);

    // Get total count for pagination UI
    const totalResults = await db
        .select({ count: sql<number>`count(*)` })
        .from(rides)
        .where(and(...conditions));

    const total = Number(totalResults[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return { success: true, data: { rides: results, total, page, totalPages } };
}
```

**Why offset pagination?**
- ✅ Simple to implement and understand
- ✅ Works well for admin interfaces with page numbers
- ❌ Not ideal for infinite scroll (use cursor-based for that)

---

## **8. UI/UX Patterns**

### **Modal Pattern**

Modals are used for all CRUD operations to avoid page navigation.

**State management**:
```tsx
const [editModal, setEditModal] = useState<{
    open: boolean;
    ride: RideWithRelations | null
}>({ open: false, ride: null });

// Open modal with data
<button onClick={() => setEditModal({ open: true, ride: selectedRide })}>
    Edit
</button>

// Modal component
<EditRideModal
    open={editModal.open}
    ride={editModal.ride}
    onClose={() => setEditModal({ open: false, ride: null })}
    onSave={handleSaveRide}
/>
```

**Why this pattern?**
- ✅ No page reloads, better UX
- ✅ Preserves scroll position and filter state
- ✅ Easy to implement with local state

### **Table with Actions Pattern**

Admin tables follow this structure:

```tsx
<table>
  <thead>
    <tr>
      <th onClick={() => handleSort('id')}>ID ↑↓</th>
      <th>Departure</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {rides.map(ride => (
      <tr key={ride.id}>
        <td>{ride.id}</td>
        <td>{ride.departure}</td>
        <td>
          <button onClick={() => handleEdit(ride)}>Edit</button>
          <button onClick={() => handleDelete(ride.id)}>Delete</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

**Features**:
- Sortable columns (click header to sort)
- Inline actions (edit, delete, assign)
- Search bar above table
- Status filter dropdown
- Pagination controls below table

### **Dashboard Card Pattern**

Reusable KPI cards:

```tsx
<DashboardDataCard
    title="Total Rides"
    data={kpis.totalRides}
    icon={Car}
    iconColor="bg-blue-500"
/>
```

**Design**:
- Icon with colored background
- Large number display
- Descriptive title
- Consistent sizing across cards

---

## **9. Internationalization (i18n)**

### **Current Setup**

**Library**: `react-i18next` (industry standard)

**Configuration**:
```typescript
// services/i18next.ts
i18next.use(initReactI18next).init({
    lng: 'en',                    // Default language
    fallbackLng: 'en',            // Fallback if translation missing
    resources: {
        en: { translation: enTranslations },
        fr: { translation: frTranslations },
    },
});
```

**Translation files**:
```json
// locales/en.json
{
  "dashboard.title": "Admin Dashboard",
  "rides.status.pending": "Pending",
  "rides.actions.edit": "Edit Ride"
}
```

**Usage**:
```tsx
import {useTranslation} from "react-i18next";

export function MyComponent() {
    const {t} = useTranslation();
    
    return <h1>{t('dashboard.title')}</h1>;
}
```

### **Language Switcher**

Global component in layout:

```tsx
// layout.tsx
<I18nProvider>
    <SessionProvider session={session}>
        {children}
        <LanguageDropdown />  {/* Fixed position, always visible */}
    </SessionProvider>
</I18nProvider>
```

### **Server Components Limitation**

**Problem**: `react-i18next` is client-side only, but many Next.js components are Server Components.

**Current workaround**: Use `'use client'` directive for components needing translations.

**Future solution**: Use `next-intl` for SSR-compatible translations.

---

## **10. Code Organization**

### **Directory Structure**

```
amt-express/
├── app/                      # Next.js App Router (routes)
│   ├── layout.tsx           # Root layout (auth provider, i18n)
│   ├── page.tsx             # Homepage
│   ├── admin/
│   │   └── ride-management/
│   │       └── page.tsx     # Admin ride management page
│   ├── driver/
│   │   └── dashboard/
│   │       └── page.tsx     # Driver dashboard
│   └── connections/
│       └── page.tsx         # Auth pages (login/signup)
│
├── components/              # React components
│   ├── admin/              # Admin-specific components
│   │   └── rideManagement/
│   ├── dashboard/          # Shared dashboard components
│   ├── classicComponents/  # Reusable UI primitives (Button, Input)
│   └── specificCards/      # Domain-specific cards
│
├── lib/                    # Business logic & utilities
│   ├── actions/           # Server Actions (API layer)
│   │   ├── ridesManagementActions.ts
│   │   ├── adminDashboardActions.ts
│   │   └── driverDashboardActions.ts
│   ├── auth/              # Authentication config
│   │   └── auth.ts
│   ├── db/                # Database layer
│   │   ├── schema.ts      # Drizzle schema
│   │   ├── drizzle.ts     # DB connection
│   │   └── import-csv.ts  # CSV import utility
│   ├── validations/       # Zod schemas
│   │   ├── ride.ts
│   │   └── dashboard.ts
│   └── types/             # TypeScript types
│       └── action-response.ts
│
├── content/                # Type definitions & constants
│   ├── database_types/    # Types matching DB schema
│   │   ├── ride.ts
│   │   ├── user.ts
│   │   └── auth.ts
│   └── Colors.ts          # Color constants
│
├── context/               # React contexts
│   ├── SessionContext.tsx
│   └── I18nProvider.tsx
│
├── services/              # External service configs
│   └── i18next.ts
│
├── locales/               # Translation files
│   ├── en.json
│   └── fr.json
│
├── drizzle/               # Database migrations
│   ├── 0000_fast_kang.sql
│   └── meta/
│
├── test/                  # Tests
│   ├── cn.test.ts
│   └── import-csv.test.ts
│
└── utils/                 # Helper functions
    ├── cn.ts             # Tailwind class merging
    └── isValidUserRole.ts
```

### **Naming Conventions**

| Type | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase | `RidesManagementBoard.tsx` |
| **Server Actions** | camelCase | `fetchRidesForManagement()` |
| **Types/Interfaces** | PascalCase | `RideWithRelations` |
| **Constants** | UPPER_SNAKE_CASE | `ERROR_CODES` |
| **Enums** | PascalCase | `RideStatus` |
| **Database tables** | camelCase | `rideCustomers` |
| **Files** | kebab-case (folders) | `ride-management/` |

### **Import Aliases**

Configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./"]  // Import from root with @/
    }
  }
}
```

**Usage**:
```typescript
import db from "@/lib/db/drizzle";                    // Instead of ../../../../lib/db/drizzle
import {useSession} from "@/context/SessionContext";  // Clean and absolute
```

---

## **11. Error Handling Strategy**

### **Layered Error Handling**

1. **Validation Errors** (Zod): User input errors
2. **Business Logic Errors**: Custom error messages
3. **Database Errors**: SQL errors, constraint violations
4. **Network Errors**: Connection issues (rare with Neon)
5. **Unknown Errors**: Catch-all with generic message

### **ActionResponse Pattern**

All errors are wrapped in standardized response:

```typescript
// Success
return { success: true, data: result };

// Error with code
return { 
    success: false, 
    error: 'Driver not available', 
    code: ErrorCodes.DRIVER_NOT_AVAILABLE 
};
```

**Error codes** (in `lib/types/action-response.ts`):
```typescript
export const ErrorCodes = {
    RIDE_NOT_FOUND: 'RIDE_NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    // ...
} as const;
```

### **Error Display**

**Current**: `alert()` for simplicity (works, but not ideal).

**Future improvement**: Toast notifications with `react-hot-toast` or `sonner`.

```tsx
// Current
if (!result.success) {
    alert(result.error);
    return;
}

// Future
if (!result.success) {
    toast.error(result.error);
    return;
}
```

### **Development Error Logging**

```typescript
// context/SessionContext.tsx
if (process.env.NODE_ENV === 'development' && session?.user?.role) {
    if (!isValidUserRole(session.user.role)) {
        console.warn(`Invalid user role detected: ${session.user.role}`);
    }
}
```

**Why?**
- ✅ Catch bugs early in development
- ✅ No performance impact in production
- ✅ Clear feedback for developers

---

## **12. Development Workflow**

### **Scripts** (in `package.json`)

```json
{
  "scripts": {
    "dev": "next dev",                     // Start dev server
    "build": "next build",                  // Production build
    "start": "next start",                  // Serve production build
    "lint": "eslint",                       // Run linter
    "db:migrate": "drizzle-kit generate && drizzle-kit migrate",  // Apply migrations
    "db:generate": "drizzle-kit generate && drizzle-kit push",    // Generate + push schema
    "db:import-csv": "tsx lib/db/import-csv.ts"  // Import CSV data
  }
}
```

### **Database Workflow**

1. **Modify schema**: Edit `lib/db/schema.ts`
2. **Generate migration**: `npm run db:generate`
3. **Review migration**: Check `drizzle/*.sql` files
4. **Apply to database**: `npm run db:migrate`

**Example**:
```bash
# Add new column to users table
# 1. Edit lib/db/schema.ts
export const users = pgTable("users", {
    // ...
    phoneNumber: text("phone_number"),  // Add this
});

# 2. Generate migration
npm run db:generate

# 3. Check drizzle/0003_new_migration.sql
# 4. Apply
npm run db:migrate
```

### **Environment Variables**

Required in `.env` (not committed to Git):

```env
DATABASE_URL=postgresql://user:pass@host/dbname
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

**Security**:
- ✅ Never commit `.env` to Git (add to `.gitignore`)
- ✅ Use different secrets for dev/staging/production
- ✅ Store production secrets in secure vault (Vercel, AWS Secrets Manager)

### **Running the App**

```bash
# Development
npm run dev  # Runs on http://localhost:3000

# Production build
npm run build
npm start
```

---

## **13. How to Modify & Customize**

### **Change the Database Schema**

**Scenario**: Add a `notes` field to the `rides` table.

**Steps**:

1. **Edit schema**:
```typescript
// lib/db/schema.ts
export const rides = pgTable("rides", {
    // ... existing fields
    notes: text("notes"),  // Add this
});
```

2. **Update TypeScript types**:
```typescript
// content/database_types/ride.ts
export interface Ride {
    // ... existing fields
    notes?: string | null;  // Add this
}
```

3. **Generate and apply migration**:
```bash
npm run db:generate
npm run db:migrate
```

4. **Update forms/components** to use the new field.

### **Add a New Server Action**

**Scenario**: Create a function to mark a ride as "in progress".

**Steps**:

1. **Add function to actions file**:
```typescript
// lib/actions/ridesManagementActions.ts
'use server'

export async function startRide(rideId: number): Promise<ActionResponse<Ride>> {
    try {
        // 1. Auth
        const session = await auth.api.getSession({...});
        if (!session) return { success: false, error: 'Unauthorized' };

        // 2. Validation
        const { rideId: validatedId } = RideIdSchema.parse({ rideId });

        // 3. Database update
        const [updatedRide] = await db
            .update(rides)
            .set({ status: 'in_progress', startedAt: new Date() })
            .where(eq(rides.id, validatedId))
            .returning();

        if (!updatedRide) {
            return { success: false, error: 'Ride not found' };
        }

        return { success: true, data: updatedRide };
    } catch (error) {
        return { success: false, error: 'Failed to start ride' };
    }
}
```

2. **Call from component**:
```tsx
const handleStartRide = async (rideId: number) => {
    const result = await startRide(rideId);
    if (!result.success) {
        alert(result.error);
        return;
    }
    // Refresh data or update UI
};
```

### **Add a New Page/Route**

**Scenario**: Create a settings page at `/admin/settings`.

**Steps**:

1. **Create page file**:
```tsx
// app/admin/settings/page.tsx
export default function SettingsPage() {
    return (
        <div>
            <h1>Settings</h1>
            {/* Your settings UI */}
        </div>
    );
}
```

2. **Add navigation link**:
```tsx
// In your navigation component
<Link href="/admin/settings">Settings</Link>
```

That's it! Next.js App Router automatically creates the route.

### **Change Styling/Theme**

**Scenario**: Change primary color from blue to purple.

**Option 1: Global CSS** (in `app/globals.css`):
```css
:root {
    --primary-color: #9333ea;  /* Purple */
}
```

**Option 2: Tailwind config** (create `tailwind.config.js`):
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#9333ea',
      }
    }
  }
}
```

**Option 3: Content file** (for non-CSS constants):
```typescript
// content/Colors.ts
export const COLORS = {
    primary: '#9333ea',
    secondary: '#ec4899',
    // ...
};
```

### **Switch from Neon to Local PostgreSQL**

**Scenario**: You want to use a local PostgreSQL database instead of Neon.

**Steps**:

1. **Install PostgreSQL locally** (via Homebrew, Docker, etc.)

2. **Update `.env`**:
```env
DATABASE_URL=postgresql://localhost:5432/amt_express
```

3. **Change DB client** (in `lib/db/drizzle.ts`):
```typescript
// OLD (Neon HTTP)
import {neon} from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

// NEW (node-postgres)
import {drizzle} from "drizzle-orm/node-postgres";
import {Pool} from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });
```

4. **Install dependencies**:
```bash
npm install pg
npm install --save-dev @types/pg
npm uninstall @neondatabase/serverless
```

5. **Run migrations**:
```bash
npm run db:migrate
```

### **Replace react-i18next with next-intl**

**Why?** `next-intl` has better SSR support for Next.js.

**Steps** (simplified):

1. **Install**:
```bash
npm install next-intl
npm uninstall react-i18next i18next
```

2. **Create middleware**:
```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en'
});
```

3. **Update layout**:
```tsx
// app/[locale]/layout.tsx
import {NextIntlClientProvider} from 'next-intl';

export default async function LocaleLayout({children, params: {locale}}) {
  const messages = (await import(`../../locales/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
```

4. **Update component usage**:
```tsx
// OLD
import {useTranslation} from "react-i18next";
const {t} = useTranslation();

// NEW
import {useTranslations} from 'next-intl';
const t = useTranslations();
```

---

## **14. Future Improvements**

### **High Priority**

1. **Toast Notifications**
   - Replace `alert()` with `react-hot-toast` or `sonner`
   - Better UX for success/error messages

2. **Form Library**
   - Use `react-hook-form` for complex forms
   - Better validation UI, error handling

3. **Data Fetching Library**
   - Add `TanStack Query` for caching and optimistic updates
   - Reduce unnecessary re-fetches

4. **Testing**
   - Unit tests for utilities (Vitest already installed)
   - Integration tests for Server Actions
   - E2E tests with Playwright

### **Medium Priority**

1. **Real-time Features**
   - WebSockets for live tracking
   - Pusher/Ably for notifications
   - Optimistic UI updates

2. **Mobile App**
   - React Native with shared types
   - Or Progressive Web App (PWA)

3. **Analytics**
   - Plausible or PostHog for usage tracking
   - Revenue forecasting
   - Driver performance metrics

4. **Advanced Search**
   - Full-text search (PostgreSQL `tsvector`)
   - Elasticsearch for complex queries

### **Low Priority (Nice to Have)**

1. **Email Service**
   - Resend or SendGrid for transactional emails
   - Invoice delivery, password resets

2. **File Uploads**
   - Cloudinary or S3 for photos
   - Driver document verification

3. **Admin Panel Enhancements**
   - Drag-and-drop ride assignment
   - Bulk operations (assign multiple rides)
   - Export to Excel (not just CSV)

4. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

---

## **Summary: Key Architectural Decisions**

| Decision | Technology | Why? | Trade-off |
|----------|-----------|------|-----------|
| **Framework** | Next.js 16 (App Router) | SSR, Server Actions, built-in optimizations | Learning curve, some libraries incompatible |
| **Database** | Neon PostgreSQL | Serverless, zero ops, full SQL power | Vendor lock-in, cold starts |
| **ORM** | Drizzle | TypeScript-first, lightweight, SQL-like | Smaller ecosystem vs Prisma |
| **Auth** | Better Auth | Modern, type-safe, flexible | Smaller community vs NextAuth |
| **Validation** | Zod | Runtime safety, TypeScript integration | None (industry standard) |
| **Styling** | Tailwind CSS | Fast dev, consistency, small bundle | Long classNames |
| **i18n** | react-i18next | Industry standard, powerful | No SSR (workaround needed) |
| **State** | React useState + Context | Simple, no extra dependencies | Not suitable for complex global state |
| **API Layer** | Server Actions | No API routes, type-safe, secure | Tied to Next.js |

---

## **Questions for Customization**

Before modifying the app, ask yourself:

1. **Do I prefer a different database?** → Change `lib/db/drizzle.ts` connection
2. **Do I want REST API endpoints?** → Add `app/api/` routes (instead of Server Actions)
3. **Do I prefer a different auth provider?** → Replace Better Auth with Clerk, Supabase, etc.
4. **Do I need global state management?** → Add Zustand or Redux Toolkit
5. **Do I want a different UI library?** → Replace Tailwind with shadcn/ui, MUI, or Chakra
6. **Do I prefer a different ORM?** → Switch to Prisma (change `lib/db/` folder)
7. **Do I need a different validation library?** → Replace Zod with Yup or Joi
8. **Do I want different error handling?** → Modify `ActionResponse` type

---

**This document is a living guide**. Update it as you make architectural changes to keep it aligned with your actual implementation.

**Need help?** Refer to:
- [Functional Specifications](../documents/functionalSpecifications/functionalSpecifications.md)
- [Glossary](../documents/glossary.md)
- Next.js Docs: https://nextjs.org/docs
- Drizzle ORM Docs: https://orm.drizzle.team
- Better Auth Docs: https://better-auth.com
