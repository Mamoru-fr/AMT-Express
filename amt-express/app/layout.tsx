import type { Metadata } from "next";
import "./globals.css";
import {auth} from "@/lib/auth/auth";
import {headers} from "next/headers";
import {SessionProvider} from "@/context/SessionContext";
import {I18nProvider} from "@/context/I18nProvider";
import {LanguageDropdown} from "@/components/LanguageComponents/LanguageDropdown";

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
        <I18nProvider>
          <SessionProvider session={session}>
            {children}
            <LanguageDropdown />
          </SessionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
