import { generateCsrfToken } from '@/lib/middleware/csrfMiddleware';
import ConnectionsPageClient from './ConnectionsPageClient';

export default async function ConnectionsPage() {
    const csrfToken = await generateCsrfToken();

    return <ConnectionsPageClient csrfToken={csrfToken} />;
}