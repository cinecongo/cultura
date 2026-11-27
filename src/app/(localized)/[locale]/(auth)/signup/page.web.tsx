import { authPage, authPageMetadata } from '@/components/auth/auth-page';

const NAME = 'signup' as const;
const SEGMENT = 'signup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const generateMetadata = authPageMetadata(NAME, SEGMENT);

export default authPage(NAME, SEGMENT);
