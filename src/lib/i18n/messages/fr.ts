/**
 * Catalogue français. Doit satisfaire exactement `Messages` (clés de `pt.ts`) :
 * une clé oubliée casse `npm run typecheck` (ADR-002 §1).
 */

import type { PluralMessage } from './types';
import type { Messages } from './pt';

export const fr = {
  'nav.label': 'Sections',
  'nav.mobile': 'Navigation principale',
  'nav.today': "Aujourd'hui",
  'nav.week': 'Cette semaine',

  'language.label': 'Langue',
  'language.choose': 'Choisir la langue',
  'language.pt': 'Português',
  'language.fr': 'Français',
  'language.en': 'English',

  'a11y.skip': 'Aller au contenu',

  'ruler.label': 'Programme du jour',

  'home.eyebrow': "Agenda culturel de l'Angola",
  'home.title': "Aujourd'hui",
  'home.lead': "Ce qui se passe aujourd'hui, au même endroit.",
  'home.empty.title': "Aucun événement aujourd'hui à {city}.",
  'home.empty.action': 'Voir la semaine complète',

  'week.eyebrow': "Agenda culturel de l'Angola",
  'week.title': 'Cette semaine',
  'week.lead': 'Les sept prochains jours, ville par ville.',
  'week.empty.title': 'Aucun événement dans les sept prochains jours.',
  'week.action': "Revenir à aujourd'hui",
  'week.count': {
    one: '{count} événement',
    other: '{count} événements',
  } satisfies PluralMessage,

  'notfound.title': 'Page introuvable',
  'notfound.lead': "Cette page n'existe pas ou a changé d'adresse.",

  'error.title': 'Un problème est survenu',
  'error.lead': "La page n'a pas pu être chargée. Réessayez.",
  'error.reload': 'Recharger la page',

  'meta.home.title': "Aujourd'hui — Cultura",
  'meta.home.description':
    "L'agenda culturel de l'Angola : ce qui se passe aujourd'hui, ville par ville.",
  'meta.week.title': 'Cette semaine — Cultura',
  'meta.week.description': 'Les événements culturels des sept prochains jours en Angola.',

  // --- P3.1 : authentification et rôles -------------------------------------
  'auth.field.name': 'Nom',
  'auth.field.email': 'Adresse email',
  'auth.field.password': 'Mot de passe',
  'auth.field.passwordNew': 'Nouveau mot de passe',
  'auth.field.passwordConfirm': 'Confirmer le mot de passe',
  'auth.form.requiredLegend': 'Les champs marqués d’un * sont obligatoires.',
  'validation.required': '{field} est obligatoire.',
  'validation.emailInvalid': 'Saisissez une adresse email valide.',
  'validation.passwordWeak': 'Le mot de passe est trop court. Utilisez au moins 12 caractères.',
  'validation.passwordMismatch':
    'Les mots de passe ne correspondent pas. Confirmez le nouveau mot de passe.',
  'validation.termsRequired': 'Acceptez les conditions pour créer le compte.',
  'auth.captcha.label': 'Vérification de sécurité',
  'auth.captcha.error': 'La vérification de sécurité n’a pas abouti. Réessayez.',
  'auth.error.generic': 'Impossible de terminer. Réessayez.',
  'auth.error.offline': 'Hors ligne. Réessayez lorsque la connexion revient.',
  'auth.error.retry': 'Réessayer',
  'auth.error.tooManyRequests': {
    one: 'Trop de demandes. Réessayez dans {count} seconde.',
    other: 'Trop de demandes. Réessayez dans {count} secondes.',
  } satisfies PluralMessage,
  'action.back': 'Retour',

  'auth.signup.title': 'Créer un compte',
  'auth.signup.lead': "Rejoignez l'agenda culturel de l'Angola.",
  'auth.signup.benefitsTitle': 'Pourquoi publier sur Cultura ?',
  'auth.signup.benefit1':
    "Votre événement apparaît dans l'agenda national, aux côtés de tous les autres.",
  'auth.signup.benefit2':
    'Votre fiche est trouvée sur Google par des personnes qui ne la connaissent pas encore.',
  'auth.signup.benefit3':
    "Vous disposez d'une fiche structurée, gérée par l'équipe Cultura d'après des sources publiques.",
  'auth.signup.benefit4':
    'Vous êtes visible par des personnes qui ne vous suivent pas déjà sur les réseaux.',
  'auth.signup.terms':
    'En créant le compte, vous acceptez les conditions et la politique de confidentialité.',
  'auth.signup.termsLink': 'Conditions générales',
  'auth.signup.privacyLink': 'Politique de confidentialité',
  'auth.signup.roleNote':
    'Le compte créé est un compte membre. Pour gérer une fiche, revendiquez votre fiche.',
  'auth.signup.submit': 'Créer un compte',
  'auth.signup.submitting': 'Création du compte…',

  'auth.signin.title': 'Se connecter',
  'auth.signin.lead': 'Retrouvez votre agenda culturel.',
  'auth.signin.forgot': 'Mot de passe oublié ?',
  'auth.signin.submit': 'Se connecter',
  'auth.signin.submitting': 'Connexion…',
  'auth.signin.noAccount': "Vous n'avez pas encore de compte ?",
  'auth.signin.error.credentials': "L'adresse email ou le mot de passe est incorrect. Réessayez.",
  'auth.signin.error.unverified': 'Confirmez votre adresse email avant de vous connecter.',

  'auth.verify.title': 'Confirmer votre adresse email',
  'auth.verify.sent':
    'Nous avons envoyé un lien à l’adresse {email}. Ouvrez-le pour activer votre compte.',
  'auth.verify.checking': 'Confirmation de votre adresse email…',
  'auth.verify.success': 'Adresse email confirmée. Vous pouvez vous connecter.',
  'auth.link.invalid': 'Le lien a expiré ou a déjà été utilisé. Demandez-en un autre.',
  'auth.verify.resend.label': "Vous n'avez pas reçu l'email ?",
  'auth.verify.resend.submit': 'Renvoyer le lien de confirmation',
  'auth.verify.resend.sent': 'Lien renvoyé. Consultez vos emails.',
  'auth.verify.resend.wait': {
    one: 'Vous pourrez en demander un autre dans {count} seconde.',
    other: 'Vous pourrez en demander un autre dans {count} secondes.',
  } satisfies PluralMessage,

  'auth.reset.title': 'Demander un nouveau mot de passe',
  'auth.reset.lead': "Saisissez l'adresse email de votre compte.",
  'auth.reset.submit': 'Demander le lien de réinitialisation',
  'auth.reset.submitting': 'Demande du lien…',
  'auth.reset.sent':
    'Nous avons envoyé un lien à l’adresse {email}. Ouvrez-le pour choisir un nouveau mot de passe.',
  'auth.password.title': 'Choisir un nouveau mot de passe',
  'auth.password.hint': 'Au moins 12 caractères, avec une majuscule, une minuscule et un chiffre.',
  'auth.password.submit': 'Modifier le mot de passe',
  'auth.password.submitting': 'Modification du mot de passe…',
  'auth.password.success': 'Mot de passe modifié. Vous pouvez vous connecter.',

  'auth.guard.checking': 'Vérification de votre session…',
  'auth.guard.signInRequired.title': 'Se connecter pour continuer',
  'auth.guard.signInRequired.lead': 'Cette page est réservée aux personnes ayant un compte.',
  'auth.guard.forbidden.title': 'Accès refusé à cette page',
  'auth.guard.forbidden.lead':
    'Votre compte est un compte membre. Pour gérer une fiche, revendiquez votre fiche.',
  'auth.guard.forbidden.roleLead':
    "Votre compte n'a pas accès à cet espace. Découvrez ce que vous pouvez faire dans votre compte.",
  'auth.guard.backHome': "Revenir à la page Aujourd'hui",
  'auth.actor.title': 'Votre espace acteur culturel',
  'auth.actor.lead':
    'Gérez votre fiche, publiez vos annonces culturelles et vos événements, et consultez vos statistiques.',
  'auth.admin.title': 'Espace d’administration',
  'auth.admin.lead':
    'Validez les annonces culturelles et les événements, traitez les revendications de fiches et gérez les comptes d’acteurs culturels.',
  'auth.signout.label': 'Se déconnecter',
  'auth.signout.success': 'Vous êtes déconnecté.',
  'auth.account.title': 'Votre compte',

  'email.signature': 'L’équipe Cultura',
  'email.verify.subject': 'Confirmez votre adresse email sur Cultura',
  'email.verify.body':
    'Confirmez votre adresse email pour activer votre compte : {link}\nLe lien expire dans {minutes} minutes. Si vous n’avez rien demandé, ignorez cet email.\n\n{signature}',
  'email.reset.subject': 'Nouveau mot de passe sur Cultura',
  'email.reset.body':
    'Nous avons reçu une demande de changement de mot de passe. Choisissez-en un nouveau : {link}\nLe lien ne sert qu’une fois et expire dans {minutes} minutes. Si vous n’avez rien demandé, ignorez cet email.\n\n{signature}',
  'email.welcome.subject': 'Compte activé sur Cultura',
  'email.welcome.body':
    'Vous pouvez dès maintenant :\n- {benefit1}\n- {benefit2}\n- {benefit3}\n- {benefit4}\n\n{signature}',

  'meta.signup.title': 'Créer un compte — Cultura',
  'meta.signup.description': "Créez votre compte et suivez l'agenda culturel de l'Angola.",
  'meta.signin.title': 'Se connecter — Cultura',
  'meta.signin.description': 'Connectez-vous pour voir votre agenda culturelle.',
  'meta.verify.title': 'Confirmer votre email — Cultura',
  'meta.verify.description': 'Confirmez votre adresse email pour activer le compte.',
  'meta.reset.title': 'Demander un nouveau mot de passe — Cultura',
  'meta.reset.description': 'Demandez un lien pour choisir un nouveau mot de passe.',
  'meta.password.title': 'Nouveau mot de passe — Cultura',
  'meta.password.description': 'Choisissez un nouveau mot de passe pour votre compte.',
  'meta.guard.title': 'Accès refusé — Cultura',
  'meta.guard.description': "Cette page n'est pas disponible pour votre compte.",
  'meta.actor.title': 'Espace acteur culturel — Cultura',
  'meta.actor.description':
    'Dans votre espace acteur culturel : gérez votre fiche et publiez des annonces culturelles et des événements en Angola.',
  'meta.admin.title': 'Espace d’administration — Cultura',
  'meta.admin.description':
    "Dans l'espace d'administration : validez les contenus, traitez les revendications de fiches et gérez les comptes d'acteurs culturels.",
} satisfies Messages;
