import { mobileAuthPage } from '@/components/auth/mobile-auth-page';

const page = mobileAuthPage('account', 'conta');

export const generateMetadata = page.generateMetadata;
export default page.Page;
