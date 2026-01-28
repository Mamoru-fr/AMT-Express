# Session Usage Guide: Client vs Server Components

## Quick Reference

| Environment | Import From | Functions/Hooks |
|-------------|-------------|----------------|
| **Server Components** | `@/lib/auth/session` | `getSession()`, `getSessionWithRole()`, `isAdmin()`, etc. |
| **Client Components** | `@/context/SessionContext` | `useSession()`, `useSessionWithRole()` |
| **Server Actions** | `@/lib/auth/session` | `requireAuth()`, `requireRole()`, `requireAdmin()` |

---

## Server Components (Async Components)

### Import
```tsx
import { getSessionWithRole, isAdmin } from '@/lib/auth/session';
```

### Basic Usage
```tsx
// app/page.tsx
export default async function Page() {
  const { session, user, role, isAdmin } = await getSessionWithRole();
  
  if (!session) {
    redirect('/login');
  }

  return <div>Welcome, {user.name}</div>;
}
```

### Check Specific Role
```tsx
import { isAdmin, isDriver } from '@/lib/auth/session';

export default async function DashboardPage() {
  const isAdminUser = await isAdmin();
  
  if (isAdminUser) {
    return <AdminPanel />;
  }

  return <CustomerDashboard />;
}
```

### Get Just the Session
```tsx
import { getSession } from '@/lib/auth/session';

export default async function ProfilePage() {
  const session = await getSession();
  
  if (!session) {
    return <LoginPrompt />;
  }

  return <UserProfile user={session.user} />;
}
```

### Multiple Components - Cached!
```tsx
// All these components call getSession() but only 1 DB query happens
export default async function Layout() {
  return (
    <>
      <Header />      {/* Calls getSession() */}
      <Sidebar />     {/* Calls getSession() - uses cache! */}
      <MainContent /> {/* Calls getSession() - uses cache! */}
      <Footer />      {/* Calls getSession() - uses cache! */}
    </>
  );
}
```

---

## Client Components

### Import
```tsx
'use client'

import { useSessionWithRole, useSession } from '@/context/SessionContext';
```

### Basic Usage
```tsx
'use client'

export function ClientComponent() {
  const { session, user, role, isAdmin } = useSessionWithRole();
  
  if (!session) {
    return <div>Please log in</div>;
  }

  return <div>Hello, {user.name}</div>;
}
```

### Just the Session
```tsx
'use client'

export function UserAvatar() {
  const { session } = useSession();
  
  if (!session) return null;

  return <img src={session.user.image} alt={session.user.name} />;
}
```

### Conditional Rendering
```tsx
'use client'

export function AdminButton() {
  const { isAdmin } = useSessionWithRole();
  
  if (!isAdmin) return null;

  return <button>Admin Actions</button>;
}
```

---

## Server Actions

### Require Authentication
```tsx
'use server'

import { requireAuth } from '@/lib/auth/session';

export async function updateProfile(data: FormData) {
  const session = await requireAuth(); // Throws if not logged in
  
  // Proceed with update
  await db.update(users)
    .set({ name: data.get('name') })
    .where(eq(users.id, session.user.id));
  
  return { success: true };
}
```

### Require Specific Role
```tsx
'use server'

import { requireAdmin } from '@/lib/auth/session';

export async function deleteUser(userId: string) {
  await requireAdmin(); // Throws if not admin
  
  await db.delete(users).where(eq(users.id, userId));
  
  return { success: true };
}
```

### Check Role Without Throwing
```tsx
'use server'

import { getSessionWithRole } from '@/lib/auth/session';

export async function getData() {
  const { isAdmin, user } = await getSessionWithRole();
  
  if (isAdmin) {
    // Return all data for admins
    return await db.select().from(data);
  }
  
  // Return only user's data
  return await db.select().from(data).where(eq(data.userId, user?.id));
}
```

---

## Complete Examples

### Example 1: Mixed Server + Client Page

```tsx
// app/dashboard/page.tsx (Server Component)
import { getSessionWithRole } from '@/lib/auth/session';
import { ClientWidget } from './ClientWidget';

export default async function DashboardPage() {
  const { session, isAdmin } = await getSessionWithRole();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user.name}</p>
      
      {/* Pass session to Client Component */}
      <ClientWidget session={session} />
      
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

```tsx
// app/dashboard/ClientWidget.tsx (Client Component)
'use client'

import { useSession } from '@/context/SessionContext';

export function ClientWidget({ session: initialSession }) {
  // Can also use useSession() if needed
  const { session } = useSession();
  
  return <div>Interactive widget for {session?.user.name}</div>;
}
```

### Example 2: Protected Route

```tsx
// app/admin/layout.tsx (Server Component)
import { requireAdmin } from '@/lib/auth/session';

export default async function AdminLayout({ children }) {
  try {
    const session = await requireAdmin();
  } catch {
    redirect('/'); // Redirect if not admin
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      {children}
    </div>
  );
}
```

### Example 3: Conditional UI Based on Role

```tsx
// app/page.tsx (Server Component)
import { getSessionWithRole } from '@/lib/auth/session';

export default async function HomePage() {
  const { isAdmin, isDriver, isCustomer } = await getSessionWithRole();
  
  return (
    <div>
      {isAdmin && <AdminDashboard />}
      {isDriver && <DriverDashboard />}
      {isCustomer && <CustomerDashboard />}
    </div>
  );
}
```

### Example 4: Form with Server Action

```tsx
// app/profile/page.tsx (Server Component)
import { getSession } from '@/lib/auth/session';
import { ProfileForm } from './ProfileForm';

export default async function ProfilePage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  return <ProfileForm user={session.user} />;
}
```

```tsx
// app/profile/ProfileForm.tsx (Client Component)
'use client'

import { updateProfile } from './actions';

export function ProfileForm({ user }) {
  async function handleSubmit(formData: FormData) {
    const result = await updateProfile(formData);
    // Handle result
  }

  return (
    <form action={handleSubmit}>
      <input name="name" defaultValue={user.name} />
      <button type="submit">Save</button>
    </form>
  );
}
```

```tsx
// app/profile/actions.ts (Server Action)
'use server'

import { requireAuth } from '@/lib/auth/session';

export async function updateProfile(data: FormData) {
  const session = await requireAuth();
  
  await db.update(users)
    .set({ name: data.get('name') })
    .where(eq(users.id, session.user.id));
  
  return { success: true };
}
```

---

## API Reference

### Server-Side Functions (`@/lib/auth/session`)

#### `getSession()`
Returns the current session or null.
```tsx
const session = await getSession();
// { user: { id, name, email, role, ... } } | null
```

#### `getSessionWithRole()`
Returns session with role helpers (mirrors `useSessionWithRole`).
```tsx
const { session, user, role, isAdmin, isDriver, isCustomer, isAuthenticated } 
  = await getSessionWithRole();
```

#### `getCurrentUser()`
Returns just the user object or null.
```tsx
const user = await getCurrentUser();
// { id, name, email, role, ... } | null
```

#### `getUserRole()`
Returns the validated role.
```tsx
const role = await getUserRole();
// 'admin' | 'driver' | 'customer'
```

#### `isAdmin()`, `isDriver()`, `isCustomer()`
Quick role checks.
```tsx
const isAdminUser = await isAdmin(); // boolean
```

#### `isAuthenticated()`
Check if user is logged in and not banned.
```tsx
const authenticated = await isAuthenticated(); // boolean
```

#### `requireAuth()`
Throws error if not authenticated (use in Server Actions).
```tsx
const session = await requireAuth();
// Throws: 'Unauthorized: Authentication required'
```

#### `requireRole(role)`
Throws error if user doesn't have specified role.
```tsx
await requireRole('admin');
// Throws: 'Forbidden: Requires admin role'
```

#### `requireAdmin()`, `requireDriver()`
Shortcuts for role requirements.
```tsx
await requireAdmin();
// Throws if not admin
```

---

### Client-Side Hooks (`@/context/SessionContext`)

#### `useSession()`
Returns session object.
```tsx
const { session } = useSession();
// { user: { ... } } | null
```

#### `useSessionWithRole()`
Returns session with role helpers.
```tsx
const { 
  session,      // SessionWithUser | null
  user,         // User | null
  role,         // 'admin' | 'driver' | 'customer'
  isAuthenticated,  // boolean
  isAdmin,      // boolean
  isDriver,     // boolean
  isCustomer    // boolean
} = useSessionWithRole();
```

---

## Performance: How Caching Works

All server functions use React's `cache()`:

```tsx
// First call in a request
const session1 = await getSession(); // DB query happens

// Subsequent calls in same request
const session2 = await getSession(); // Uses cached result!
const session3 = await getSession(); // Uses cached result!

// Different components can all call it
<Header />     // getSession() - executes query
<Sidebar />    // getSession() - uses cache
<MainContent />// getSession() - uses cache
```

**Result**: Multiple function calls, only **1 database query per request**! 🚀

---

## Migration Checklist

### Before (Client Only)
```tsx
'use client'
import { useSessionWithRole } from '@/context/SessionContext';

export function MyComponent() {
  const { isAdmin } = useSessionWithRole();
  return <div>{isAdmin && 'Admin'}</div>;
}
```

### After (Server Component)
```tsx
// Remove 'use client'
import { getSessionWithRole } from '@/lib/auth/session';

export default async function MyComponent() {
  const { isAdmin } = await getSessionWithRole();
  return <div>{isAdmin && 'Admin'}</div>;
}
```

**Changes**:
1. Remove `'use client'` directive
2. Change import from `@/context/SessionContext` to `@/lib/auth/session`
3. Change `useSessionWithRole()` to `await getSessionWithRole()`
4. Make component `async`

---

## Common Patterns

### Pattern 1: Page-Level Auth Check
```tsx
export default async function ProtectedPage() {
  const { session } = await getSessionWithRole();
  if (!session) redirect('/login');
  return <Content />;
}
```

### Pattern 2: Layout-Level Auth
```tsx
export default async function AdminLayout({ children }) {
  await requireAdmin(); // Throws if not admin
  return <div className="admin-layout">{children}</div>;
}
```

### Pattern 3: Role-Based Content
```tsx
export default async function Dashboard() {
  const { isAdmin, isDriver } = await getSessionWithRole();
  
  if (isAdmin) return <AdminDashboard />;
  if (isDriver) return <DriverDashboard />;
  return <CustomerDashboard />;
}
```

### Pattern 4: Server Action Protection
```tsx
'use server'

export async function sensitiveAction() {
  const session = await requireAdmin();
  // Only admins get here
}
```

---

## Summary

✅ **Server Components** → Use `await getSessionWithRole()` from `@/lib/auth/session`  
✅ **Client Components** → Use `useSessionWithRole()` from `@/context/SessionContext`  
✅ **Server Actions** → Use `requireAuth()`, `requireAdmin()` for protection  
✅ **Caching** → Multiple calls = 1 query per request  
✅ **Type Safety** → Same types in both environments  

**You now have a unified session API that works everywhere!** 🎉
