'use client'

import {useSessionWithRole} from "@/context/SessionContext";

export default function Home() {
  const {session} = useSessionWithRole();

  console.log(session);

  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">

      </main>
    </div>
  );
}
