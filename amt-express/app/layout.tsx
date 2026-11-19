import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import "./globals.css";
import "@/css/main.css";
import { getSessionWithRole } from "@/lib/auth/session";
import { SessionProvider } from "@/context/SessionContext";
import { I18nProvider } from "@/context/I18nProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister/ServiceWorkerRegister";
import { cookies } from "next/headers";

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
}: Readonly<{
  children: ReactNode;
}>) {
  const { session } = await getSessionWithRole();
  const cookieStore = await cookies();
  const lang = cookieStore.get('preferredLanguage')?.value ?? 'en';

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`antialiased`}>
        <ServiceWorkerRegister />
        <I18nProvider initialLanguage={lang}>
          <SessionProvider session={session}>
            {children}
          </SessionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
