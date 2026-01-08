import type { Metadata } from "next";
import "./globals.css";
import {auth} from "@/lib/auth/auth";
import {headers} from "next/headers";
import {SessionProvider} from "@/context/SessionContext";

export const metadata: Metadata = {
  title: "AMT Express",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({headers: await headers()});

  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <SessionProvider session={session}>
        {children}
        </SessionProvider>
      </body>
    </html>
  );
}
