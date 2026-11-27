import { authPage, authPageMetadata } from '@/components/auth/auth-page';

const NAME = 'password' as const;
const SEGMENT = 'modifiermotpasse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const generateMetadata = authPageMetadata(NAME, SEGMENT);

export default authPage(NAME, SEGMENT);
