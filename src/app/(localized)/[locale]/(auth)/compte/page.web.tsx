import { authPage, authPageMetadata } from '@/components/auth/auth-page';

const NAME = 'account' as const;
const SEGMENT = 'compte';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const generateMetadata = authPageMetadata(NAME, SEGMENT);

export default authPage(NAME, SEGMENT);
