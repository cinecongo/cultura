import { mobileAuthPage } from '@/components/auth/mobile-auth-page';

const page = mobileAuthPage('signin', 'signin');

export const generateMetadata = page.generateMetadata;
export default page.Page;
