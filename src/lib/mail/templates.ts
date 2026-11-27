import { t, type Locale } from '@/lib/i18n';

/** Doit rester cohérent avec la durée des jetons Supabase Auth. */
export const TOKEN_TTL_MINUTES = 30;

export type MailContent = { readonly subject: string; readonly body: string };

export function verifyMail(locale: Locale, link: string): MailContent {
  return {
    subject: t(locale, 'email.verify.subject'),
    body: t(locale, 'email.verify.body', {
      link,
      minutes: TOKEN_TTL_MINUTES,
      signature: t(locale, 'email.signature'),
    }),
  };
}

export function resetMail(locale: Locale, link: string): MailContent {
  return {
    subject: t(locale, 'email.reset.subject'),
    body: t(locale, 'email.reset.body', {
      link,
      minutes: TOKEN_TTL_MINUTES,
      signature: t(locale, 'email.signature'),
    }),
  };
}

export function welcomeMail(locale: Locale): MailContent {
  return {
    subject: t(locale, 'email.welcome.subject'),
    body: t(locale, 'email.welcome.body', {
      benefit1: t(locale, 'auth.signup.benefit1'),
      benefit2: t(locale, 'auth.signup.benefit2'),
      benefit3: t(locale, 'auth.signup.benefit3'),
      benefit4: t(locale, 'auth.signup.benefit4'),
      signature: t(locale, 'email.signature'),
    }),
  };
}
