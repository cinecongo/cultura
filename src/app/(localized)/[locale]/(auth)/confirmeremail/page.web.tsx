import { authPage, authPageMetadata } from '@/components/auth/auth-page';

const NAME = 'verify' as const;
const SEGMENT = 'confirmeremail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const generateMetadata = authPageMetadata(NAME, SEGMENT);

export default authPage(NAME, SEGMENT);
