import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import "@/css/main.css";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { getSessionWithRole } from "@/lib/auth/session";
import { SessionProvider } from "@/context/SessionContext";
import { I18nProvider } from "@/context/I18nProvider";

export const metadata: Metadata = {
  title: "AMT Express",
  description: "",
};

export default async function RootLayout({
  children,
  admin,
  driver,
  customer,
  auth: authSlot,
}: Readonly<{
  children: ReactNode;
  admin?: ReactNode;
  driver?: ReactNode;
  customer?: ReactNode;
  auth?: ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { isAuthenticated, isAdmin, isDriver } = await getSessionWithRole();

  return (
    <html lang="en">
      <body className={`antialiased`}>
        <I18nProvider>
          <SessionProvider session={session}>
            {/* Afficher le bon slot en fonction du rôle */}
            {!isAuthenticated ? (
              authSlot
            ) : isAdmin ? (
              admin
            ) : isDriver ? (
              driver
            ) : (
              customer
            )}
            {children}
          </SessionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
