// Metadata pour la page ride-management
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Ride Management | AMT Express",
    description: "Manage all platform rides"
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
