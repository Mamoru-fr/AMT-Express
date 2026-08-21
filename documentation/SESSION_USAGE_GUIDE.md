# Guide d'utilisation des sessions — AMT Express

> Référence rapide pour accéder à la session et au rôle de l'utilisateur selon le contexte (Server Component, Client Component, Server Action).

---

## Référence rapide

| Contexte | Import | Fonctions |
|----------|--------|-----------|
| Server Component | `@/lib/auth/session` | `getSession()`, `getSessionWithRole()`, `isAdmin()`… |
| Client Component | `@/context/SessionContext` | `useSession()`, `useSessionWithRole()` |
| Server Action | `@/lib/auth/session` | `requireAuth()`, `requireRole()`, `requireAdmin()` |

---

## Server Components

### Récupérer la session avec le rôle

```tsx
// app/dashboard/page.tsx
import { getSessionWithRole } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { session, user, isAdmin, isDriver, isCustomer } = await getSessionWithRole();

  if (!session) redirect('/connections');

  return <div>Bonjour, {user.name}</div>;
}
```

### Vérifier un rôle spécifique

```tsx
import { isAdmin } from '@/lib/auth/session';

export default async function AdminPage() {
  const admin = await isAdmin();

  if (!admin) redirect('/');

  return <AdminPanel />;
}
```

### Cache automatique

`getSession()` et `getSessionWithRole()` utilisent le cache de requête de Next.js. Plusieurs composants appelant ces fonctions dans le même rendu ne déclenchent qu'**une seule requête** en base.

```tsx
// Ces 4 composants partagent une seule requête de session
export default async function Layout() {
  return (
    <>
      <Header />      {/* appelle getSession() */}
      <Sidebar />     {/* appelle getSession() — cache */}
      <MainContent /> {/* appelle getSession() — cache */}
      <Footer />      {/* appelle getSession() — cache */}
    </>
  );
}
```

---

## Client Components

```tsx
'use client'

import { useSessionWithRole } from '@/context/SessionContext';

export function UserMenu() {
  const { session, user, isAdmin, isDriver, isCustomer } = useSessionWithRole();

  if (!session) return <LoginButton />;

  return (
    <div>
      <span>{user.name}</span>
      {isAdmin && <AdminLink />}
    </div>
  );
}
```

### Juste la session

```tsx
'use client'

import { useSession } from '@/context/SessionContext';

export function UserAvatar() {
  const { session } = useSession();

  if (!session) return null;

  return <img src={session.user.image ?? '/default-avatar.png'} alt={session.user.name} />;
}
```

> **Important :** Un composant client ne doit **jamais** être la seule protection d'une ressource. La vérification de rôle côté serveur est obligatoire dans la Server Action ou le Server Component correspondant.

---

## Server Actions

### Exiger une authentification

```tsx
'use server'

import { requireAuth } from '@/lib/auth/session';

export async function updateProfile(data: FormData) {
  const session = await requireAuth(); // Lance une erreur si non connecté

  await db.update(users)
    .set({ name: data.get('name') as string })
    .where(eq(users.id, session.user.id));

  return { success: true };
}
```

### Exiger un rôle spécifique

```tsx
'use server'

import { requireAdmin } from '@/lib/auth/session';

export async function deleteUser(userId: string) {
  await requireAdmin(); // Lance une erreur si pas admin

  await db.delete(users).where(eq(users.id, userId));

  return { success: true };
}
```

### Vérifier le rôle sans lever d'exception

```tsx
'use server'

import { getSessionWithRole } from '@/lib/auth/session';

export async function getRides() {
  const { isAdmin, user } = await getSessionWithRole();

  if (isAdmin) {
    return db.select().from(rides); // Toutes les courses
  }

  return db.select().from(rides).where(eq(rides.driverId, user?.id)); // Ses courses uniquement
}
```

---

## Exemple complet : page mixte Server + Client

```tsx
// app/dashboard/page.tsx (Server Component)
import { getSessionWithRole } from '@/lib/auth/session';
import { StatsWidget } from './StatsWidget'; // Client Component

export default async function DashboardPage() {
  const { session, isAdmin } = await getSessionWithRole();

  if (!session) redirect('/connections');

  // Passer les données nécessaires au Client Component via props
  return (
    <main>
      <h1>Tableau de bord</h1>
      <StatsWidget isAdmin={isAdmin} userId={session.user.id} />
    </main>
  );
}
```

```tsx
// StatsWidget.tsx (Client Component)
'use client'

import { useSessionWithRole } from '@/context/SessionContext';

export function StatsWidget({ isAdmin, userId }: { isAdmin: boolean; userId: string }) {
  // useSessionWithRole() peut aussi être utilisé ici pour l'état réactif
  return <div>{isAdmin ? 'Vue admin' : 'Vue utilisateur'}</div>;
}
```

---

## Depannage

| Problème | Cause | Solution |
|----------|-------|----------|
| `session` est `null` côté serveur | Cookie expiré ou absent | Vérifier `BETTER_AUTH_URL` et `BETTER_AUTH_SECRET` |
| `useSession()` retourne `undefined` | Composant hors du `SessionProvider` | Vérifier que `SessionProvider` englobe bien l'arbre dans `layout.tsx` |
| Boucle de redirect infinie | Redirect vers une page qui redirige aussi | Ne pas protéger la page `/connections` avec `requireAuth()` |
| Rôle toujours `customer` après changement | Session mise en cache | Déconnecter et se reconnecter pour actualiser le token |
