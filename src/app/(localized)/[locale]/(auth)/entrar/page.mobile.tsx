import { mobileAuthPage } from '@/components/auth/mobile-auth-page';

const page = mobileAuthPage('signin', 'entrar');

export const generateMetadata = page.generateMetadata;
export default page.Page;
