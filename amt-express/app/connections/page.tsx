import { generateCsrfToken } from '@/lib/middleware/csrfMiddleware';
import ConnectionsPageClient from './ConnectionsPageClient';

// Force dynamic rendering for this page as it requires cookies access
export const dynamic = 'force-dynamic';

export default async function ConnectionsPage() {
    const csrfToken = await generateCsrfToken();

    return <ConnectionsPageClient csrfToken={csrfToken} />;
}