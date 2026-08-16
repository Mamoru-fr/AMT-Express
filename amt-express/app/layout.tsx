import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import "./globals.css";
import "@/css/main.css";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { getSessionWithRole } from "@/lib/auth/session";
import { SessionProvider } from "@/context/SessionContext";
import { I18nProvider } from "@/context/I18nProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister/ServiceWorkerRegister";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "AMT Express",
  description: "AMT Express - logistics and ride management application",
  generator: "Next.js",
  manifest: "/manifest.webmanifest",
  keywords: ["AMT Express", "ride management", "transport", "pwa", "nextjs"],
  authors: [{ name: "Alexis SANTOS" }],
  applicationName: "AMT Express",
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AMT Express",
  },
  icons: [
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
    { rel: "icon", url: "/icon_192_192.png" },
    { rel: "icon", url: "/icon_512_512.png" },
  ],
};

export const viewport: Viewport = {
  themeColor: "#003366",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
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
  const { isAuthenticated, isAdmin, isDriver, isCustomer } = await getSessionWithRole();

  const activeSlot = !isAuthenticated
    ? authSlot
    : isAdmin
      ? admin
      : isDriver
        ? driver
        : isCustomer
          ? customer
          : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <ServiceWorkerRegister />
          <I18nProvider>
            <SessionProvider session={session}>
              {children}
              {activeSlot}
            </SessionProvider>
          </I18nProvider>
      </body>
    </html>
  );
}
