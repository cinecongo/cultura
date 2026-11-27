import { authPage, authPageMetadata } from '@/components/auth/auth-page';

const NAME = 'reset' as const;
const SEGMENT = 'resetpassword';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const generateMetadata = authPageMetadata(NAME, SEGMENT);

export default authPage(NAME, SEGMENT);
