'use client';

import { redirect, useSearchParams } from 'next/navigation';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';
  redirect(`/connections?returnTo=${encodeURIComponent(returnTo)}`);
}
