import { mobileAuthPage } from '@/components/auth/mobile-auth-page';

const page = mobileAuthPage('account', 'compte');

export const generateMetadata = page.generateMetadata;
export default page.Page;
