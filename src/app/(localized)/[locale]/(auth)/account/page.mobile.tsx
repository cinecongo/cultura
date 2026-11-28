import { mobileAuthPage } from '@/components/auth/mobile-auth-page';

const page = mobileAuthPage('account', 'account');

export const generateMetadata = page.generateMetadata;
export default page.Page;
