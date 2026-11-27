import { spacePage, spacePageMetadata } from '@/components/auth/guard-page';

const SPACE = 'actorSpace' as const;
const SEGMENT = 'actorspace';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const generateMetadata = spacePageMetadata(SPACE, SEGMENT);

export default spacePage(SPACE, SEGMENT);
