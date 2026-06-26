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
  // Récupérer la session pour le SessionProvider et la gestion des slots
  const session = await auth.api.getSession({ headers: await headers() });
  const { isAuthenticated, isAdmin, isDriver } = await getSessionWithRole();

  // Le Proxy gère déjà les redirections pour les utilisateurs non authentifiés
  // ou sans les bons rôles. Ici, on affiche simplement le bon slot.
  return (
    <html lang="fr">
      <body className={`antialiased`}>
        <I18nProvider>
          <SessionProvider session={session}>
            {/* 
              Parallel Routes :
              - @admin : affiché pour /admin/*
              - @driver : affiché pour /driver/*
              - @customer : affiché pour /customer/*
              - @auth : affiché pour /connections
              - children : le contenu de la page de base
              
              Le Proxy gère les redirections et la logique d'authentification.
              Tous les slots sont rendus simultanément, mais seul le contenu du slot actif est affiché.
            */}
            {children}
            {admin}
            {driver}
            {customer}
            {authSlot}
          </SessionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
