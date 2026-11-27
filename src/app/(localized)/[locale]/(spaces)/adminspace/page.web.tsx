import { spacePage, spacePageMetadata } from '@/components/auth/guard-page';

const SPACE = 'adminSpace' as const;
const SEGMENT = 'adminspace';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const generateMetadata = spacePageMetadata(SPACE, SEGMENT);

export default spacePage(SPACE, SEGMENT);
