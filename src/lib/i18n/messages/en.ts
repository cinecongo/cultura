/**
 * Catalogue anglais. Doit satisfaire exactement `Messages` (clés de `pt.ts`).
 * Registre : anglais britannique, 24 h (`en-GB`).
 */

import type { PluralMessage } from './types';
import type { Messages } from './pt';

export const en = {
  'nav.label': 'Sections',
  'nav.mobile': 'Main navigation',
  'nav.today': 'Today',
  'nav.week': 'This week',

  'language.label': 'Language',
  'language.choose': 'Choose a language',
  'language.pt': 'Português',
  'language.fr': 'Français',
  'language.en': 'English',

  'a11y.skip': 'Skip to content',

  'ruler.label': "Today's programme",

  'home.eyebrow': "Angola's cultural agenda",
  'home.title': 'Today',
  'home.lead': "What's on today, all in one place.",
  'home.empty.title': 'No events today in {city}.',
  'home.empty.action': 'See the full week',

  'week.eyebrow': "Angola's cultural agenda",
  'week.title': 'This week',
  'week.lead': 'The next seven days, city by city.',
  'week.empty.title': 'No events in the next seven days.',
  'week.action': 'Back to today',
  'week.count': {
    one: '{count} event',
    other: '{count} events',
  } satisfies PluralMessage,

  'notfound.title': 'Page not found',
  'notfound.lead': 'This page does not exist or has moved.',

  'error.title': 'Something went wrong',
  'error.lead': 'The page could not be loaded. Please try again.',
  'error.reload': 'Reload the page',

  'meta.home.title': 'Today — Cultura',
  'meta.home.description': "Angola's cultural agenda: what's on today, city by city.",
  'meta.week.title': 'This week — Cultura',
  'meta.week.description': 'Cultural events in Angola over the next seven days.',

  // --- P3.1 : authentication and roles --------------------------------------
  'auth.field.name': 'Name',
  'auth.field.email': 'Email address',
  'auth.field.password': 'Password',
  'auth.field.passwordNew': 'New password',
  'auth.field.passwordConfirm': 'Confirm password',
  'auth.form.requiredLegend': 'Fields marked with * are required.',
  'validation.required': '{field} is required.',
  'validation.emailInvalid': 'Enter a valid email address.',
  'validation.passwordWeak': 'The password is too short. Use at least 12 characters.',
  'validation.passwordMismatch': 'The passwords do not match. Confirm the new password.',
  'validation.termsRequired': 'Accept the terms to create your account.',
  'auth.captcha.label': 'Security check',
  'auth.captcha.error': 'Security verification did not complete. Please try again.',
  'auth.error.generic': 'We could not complete that. Please try again.',
  'auth.error.offline': 'Offline. Try again when you are back online.',
  'auth.error.retry': 'Try again',
  'auth.error.tooManyRequests': {
    one: 'Too many requests. Try again in {count} second.',
    other: 'Too many requests. Try again in {count} seconds.',
  } satisfies PluralMessage,
  'action.back': 'Back',

  'auth.signup.title': 'Create account',
  'auth.signup.lead': "Join Angola's cultural agenda.",
  'auth.signup.benefitsTitle': 'Why publish on Cultura?',
  'auth.signup.benefit1': 'Your event appears in the national agenda, alongside all the others.',
  'auth.signup.benefit2': 'Your profile is found on Google by people who do not know it yet.',
  'auth.signup.benefit3':
    'You have a structured profile, managed by the Cultura team from public sources.',
  'auth.signup.benefit4':
    'You are visible to people who do not already follow you on social media.',
  'auth.signup.terms': 'By creating an account, you accept the terms and the privacy policy.',
  'auth.signup.termsLink': 'Terms and conditions',
  'auth.signup.privacyLink': 'Privacy policy',
  'auth.signup.roleNote':
    'The account created is a member account. To manage a profile, claim your profile.',
  'auth.signup.submit': 'Create account',
  'auth.signup.submitting': 'Creating account…',

  'auth.signin.title': 'Sign in',
  'auth.signin.lead': 'Back to your cultural agenda.',
  'auth.signin.forgot': 'Forgot your password?',
  'auth.signin.submit': 'Sign in',
  'auth.signin.submitting': 'Signing in…',
  'auth.signin.noAccount': "Don't have an account yet?",
  'auth.signin.error.credentials': 'The email address or password is incorrect. Please try again.',
  'auth.signin.error.unverified': 'Confirm your email address before signing in.',

  'auth.verify.title': 'Confirm your email address',
  'auth.verify.sent': 'We sent a link to {email}. Open it to activate your account.',
  'auth.verify.checking': 'Confirming your email address…',
  'auth.verify.success': 'Email confirmed. You can sign in.',
  'auth.link.invalid': 'The link has expired or has already been used. Request another one.',
  'auth.verify.resend.label': "Didn't receive the email?",
  'auth.verify.resend.submit': 'Resend the confirmation link',
  'auth.verify.resend.sent': 'Link resent. Check your email.',
  'auth.verify.resend.wait': {
    one: 'You can request another in {count} second.',
    other: 'You can request another in {count} seconds.',
  } satisfies PluralMessage,

  'auth.reset.title': 'Request a new password',
  'auth.reset.lead': 'Enter the email address for your account.',
  'auth.reset.submit': 'Request a reset link',
  'auth.reset.submitting': 'Requesting the link…',
  'auth.reset.sent': 'We sent a link to {email}. Open it to choose a new password.',
  'auth.password.title': 'Choose a new password',
  'auth.password.hint':
    'At least 12 characters, including an uppercase letter, a lowercase letter and a number.',
  'auth.password.submit': 'Change password',
  'auth.password.submitting': 'Changing password…',
  'auth.password.success': 'Password changed. You can sign in.',

  'auth.guard.checking': 'Checking your session…',
  'auth.guard.signInRequired.title': 'Sign in to continue',
  'auth.guard.signInRequired.lead': 'This page is for people with an account.',
  'auth.guard.forbidden.title': 'You cannot access this page',
  'auth.guard.forbidden.lead':
    'Your account is a member account. To manage a profile, claim your profile.',
  'auth.guard.forbidden.roleLead':
    'Your account cannot access this space. See what you can do in your account.',
  'auth.guard.backHome': 'Back to Today',
  'auth.actor.title': 'Your cultural professional space',
  'auth.actor.lead':
    'Manage your profile, publish your cultural announcements and events, and view your statistics.',
  'auth.admin.title': 'Administration space',
  'auth.admin.lead':
    'Approve cultural announcements and events, handle profile claims and manage cultural professional accounts.',
  'auth.signout.label': 'Sign out',
  'auth.signout.success': 'You have signed out.',
  'auth.account.title': 'Your account',

  // P3.4: account data and deletion.
  'auth.account.data.title': 'Your data',
  'auth.account.data.lead': 'You can save a copy of your data or delete your account.',
  'auth.account.export.submit': 'Export my data',
  'auth.account.export.submitting': 'Preparing your data…',
  'auth.account.export.success': 'Your data is ready. Save the file.',
  'auth.account.export.error': 'We could not prepare your data. Please try again.',
  'auth.account.delete.open': 'Delete my account',
  'auth.account.delete.warning':
    'This action is permanent. Your data and cultural announcements will be deleted and cannot be recovered.',
  'auth.account.delete.confirmPhrase.label': 'Type the phrase below to confirm.',
  'auth.account.delete.confirmPhrase.value': 'DELETE MY ACCOUNT',
  'auth.account.delete.submit': 'Delete account permanently',
  'auth.account.delete.submitting': 'Deleting account…',
  'auth.account.delete.cancel': 'Cancel',
  'auth.account.delete.error.password': 'The password is incorrect. Please try again.',
  'auth.account.delete.error.phrase':
    'The phrase does not match. Enter the phrase shown, exactly as it appears.',
  'auth.account.delete.error.journaled':
    'This account cannot be deleted because it is linked to decisions by the Cultura team. Contact the Cultura team.',

  'email.signature': 'The Cultura team',
  'email.verify.subject': 'Confirm your email address on Cultura',
  'email.verify.body':
    'Confirm your email address to activate your account: {link}\nThe link expires in {minutes} minutes. If you did not request this, ignore this email.\n\n{signature}',
  'email.reset.subject': 'A new password for Cultura',
  'email.reset.body':
    'We received a request to change your password. Choose a new one: {link}\nThe link can be used once and expires in {minutes} minutes. If you did not request this, ignore this email.\n\n{signature}',
  'email.welcome.subject': 'Your Cultura account is active',
  'email.welcome.body':
    'You can now:\n- {benefit1}\n- {benefit2}\n- {benefit3}\n- {benefit4}\n\n{signature}',

  'meta.signup.title': 'Create account — Cultura',
  'meta.signup.description': 'Create your account and follow Angola’s cultural agenda.',
  'meta.signin.title': 'Sign in — Cultura',
  'meta.signin.description': 'Sign in to see your cultural agenda.',
  'meta.verify.title': 'Confirm your email — Cultura',
  'meta.verify.description': 'Confirm your email address to activate your account.',
  'meta.reset.title': 'Request a new password — Cultura',
  'meta.reset.description': 'Request a link to choose a new password.',
  'meta.password.title': 'New password — Cultura',
  'meta.password.description': 'Choose a new password for your account.',
  'meta.account.title': 'Your account — Cultura',
  'meta.account.description':
    'In your account, you can view and export your data, or delete your account.',
  'meta.guard.title': 'Access denied — Cultura',
  'meta.guard.description': 'This page is not available for your account.',
  'meta.actor.title': 'Cultural professional space — Cultura',
  'meta.actor.description':
    'In your cultural professional space: manage your profile and publish cultural announcements and events in Angola.',
  'meta.admin.title': 'Administration space — Cultura',
  'meta.admin.description':
    'In the administration space: approve content, handle profile claims and manage cultural professional accounts.',
} satisfies Messages;
