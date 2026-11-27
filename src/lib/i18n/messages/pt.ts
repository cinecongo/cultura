/**
 * Catalogue portugais (pt-AO) — **source de vérité du type `Messages`**.
 *
 * Règles (ADR-002 §1) :
 * - clés en anglais, un seul niveau ;
 * - aucune clé construite dynamiquement ;
 * - toute variable est écrite `{nom}`, sans expression ;
 * - toute nouvelle clé est ajoutée dans les trois langues dans le même commit.
 *
 * Vocabulaire : `i18n/GLOSSAIRE.md`. Les textes PT seront relus par un
 * locuteur angolais avant le lancement (Q7, P8.4).
 */

import type { PluralMessage } from './types';

export const pt = {
  'nav.label': 'Secções',
  'nav.mobile': 'Navegação principal',
  'nav.today': 'Hoje',
  'nav.week': 'Esta semana',

  'language.label': 'Idioma',
  'language.choose': 'Escolher idioma',
  'language.pt': 'Português',
  'language.fr': 'Français',
  'language.en': 'English',

  'a11y.skip': 'Saltar para o conteúdo',

  'ruler.label': 'Programa do dia',

  'home.eyebrow': 'Agenda cultural de Angola',
  'home.title': 'Hoje',
  'home.lead': 'O que acontece hoje, num só lugar.',
  'home.empty.title': 'Ainda não há eventos hoje em {city}.',
  'home.empty.action': 'Ver a semana completa',

  'week.eyebrow': 'Agenda cultural de Angola',
  'week.title': 'Esta semana',
  'week.lead': 'Os próximos sete dias, cidade a cidade.',
  'week.empty.title': 'Ainda não há eventos nos próximos sete dias.',
  'week.action': 'Voltar a hoje',
  'week.count': {
    one: '{count} evento',
    other: '{count} eventos',
  } satisfies PluralMessage,

  'notfound.title': 'Página não encontrada',
  'notfound.lead': 'Esta página não existe ou mudou de endereço.',

  'error.title': 'Algo correu mal',
  'error.lead': 'A página não pôde ser carregada. Tente novamente.',
  'error.reload': 'Recarregar a página',

  'meta.home.title': 'Hoje — Cultura',
  'meta.home.description': 'A agenda cultural de Angola: o que acontece hoje, cidade a cidade.',
  'meta.week.title': 'Esta semana — Cultura',
  'meta.week.description': 'Os eventos culturais dos próximos sete dias em Angola.',

  // --- P3.1 : autenticação e papéis -----------------------------------------
  'auth.field.name': 'Nome',
  'auth.field.email': 'Email',
  'auth.field.password': 'Palavra-passe',
  'auth.field.passwordNew': 'Nova palavra-passe',
  'auth.field.passwordConfirm': 'Repetir a palavra-passe',
  'auth.form.requiredLegend': 'Os campos marcados com * são obrigatórios.',
  'validation.required': '{field} é obrigatório.',
  'validation.emailInvalid': 'Escrevam um email válido.',
  'validation.passwordWeak': 'A palavra-passe é demasiado curta. Usem pelo menos 12 caracteres.',
  'validation.passwordMismatch': 'As palavras-passe não coincidem. Repitam a nova palavra-passe.',
  'validation.termsRequired': 'Aceitem os termos para criar a conta.',
  'auth.captcha.label': 'Verificação de segurança',
  'auth.captcha.error': 'A verificação de segurança não correu bem. Tentem novamente.',
  'auth.error.generic': 'Não foi possível concluir. Tentem novamente.',
  'auth.error.offline': 'Sem ligação. Tentem novamente quando tiverem ligação.',
  'auth.error.retry': 'Tentar novamente',
  'auth.error.tooManyRequests': {
    one: 'Demasiados pedidos. Tentem novamente em {count} segundo.',
    other: 'Demasiados pedidos. Tentem novamente em {count} segundos.',
  } satisfies PluralMessage,
  'action.back': 'Voltar',

  'auth.signup.title': 'Criar conta',
  'auth.signup.lead': 'Façam parte da agenda cultural de Angola.',
  'auth.signup.benefitsTitle': 'Porquê publicar na Cultura?',
  'auth.signup.benefit1': 'O vosso evento aparece na agenda nacional, ao lado de todos os outros.',
  'auth.signup.benefit2': 'A vossa fiche é encontrada no Google por quem ainda não a conhece.',
  'auth.signup.benefit3':
    'A vossa fiche é estruturada e gerida pela equipa Cultura a partir de fontes públicas.',
  'auth.signup.benefit4': 'São vistos por quem não os segue nas redes sociais.',
  'auth.signup.terms': 'Ao criar a conta, aceitam os termos e a política de privacidade.',
  'auth.signup.termsLink': 'Termos e condições',
  'auth.signup.privacyLink': 'Política de privacidade',
  'auth.signup.roleNote':
    'A conta criada é de membro. Para gerirem uma fiche, reclamem a vossa fiche.',
  'auth.signup.submit': 'Criar conta',
  'auth.signup.submitting': 'A criar a conta…',

  'auth.signin.title': 'Entrar',
  'auth.signin.lead': 'Voltem à vossa agenda cultural.',
  'auth.signin.forgot': 'Esqueceram-se da palavra-passe?',
  'auth.signin.submit': 'Entrar',
  'auth.signin.submitting': 'A entrar…',
  'auth.signin.noAccount': 'Ainda não têm conta?',
  'auth.signin.error.credentials': 'O email ou a palavra-passe não está correto. Tentem novamente.',
  'auth.signin.error.unverified': 'Confirmem o vosso email antes de entrar.',

  'auth.verify.title': 'Confirmar o seu email',
  'auth.verify.sent': 'Enviámos um link para {email}. Abram-no para ativar a vossa conta.',
  'auth.verify.checking': 'A confirmar o seu email…',
  'auth.verify.success': 'Email confirmado. Já podem entrar.',
  'auth.link.invalid': 'O link expirou ou já foi usado. Peçam outro.',
  'auth.verify.resend.label': 'Não receberam o email?',
  'auth.verify.resend.submit': 'Reenviar o link de confirmação',
  'auth.verify.resend.sent': 'Link reenviado. Vejam o vosso email.',
  'auth.verify.resend.wait': {
    one: 'Podem pedir outro em {count} segundo.',
    other: 'Podem pedir outro em {count} segundos.',
  } satisfies PluralMessage,

  'auth.reset.title': 'Pedir uma nova palavra-passe',
  'auth.reset.lead': 'Escrevam o email da vossa conta.',
  'auth.reset.submit': 'Pedir o link de redefinição',
  'auth.reset.submitting': 'A pedir o link…',
  'auth.reset.sent':
    'Enviámos um link para {email}. Abram-no para escolher uma nova palavra-passe.',
  'auth.password.title': 'Escolher uma nova palavra-passe',
  'auth.password.hint':
    'Pelo menos 12 caracteres, com uma letra maiúscula, uma minúscula e um número.',
  'auth.password.submit': 'Alterar a palavra-passe',
  'auth.password.submitting': 'A alterar a palavra-passe…',
  'auth.password.success': 'Palavra-passe alterada. Já podem entrar.',

  'auth.guard.checking': 'A verificar a sua sessão…',
  'auth.guard.signInRequired.title': 'Entrar para continuar',
  'auth.guard.signInRequired.lead': 'Esta página é só para quem tem conta.',
  'auth.guard.forbidden.title': 'Sem acesso a esta página',
  'auth.guard.forbidden.lead':
    'A vossa conta é de membro. Para gerirem uma fiche, reclamem a vossa fiche.',
  'auth.guard.backHome': 'Voltem para Hoje',
  'auth.signout.label': 'Sair',
  'auth.signout.success': 'Saíram da vossa conta.',
  'auth.account.title': 'A vossa conta',

  'email.signature': 'Equipa Cultura',
  'email.verify.subject': 'Confirmem o vosso email na Cultura',
  'email.verify.body':
    'Confirmem o vosso email para ativar a vossa conta: {link}\nO link expira em {minutes} minutos. Se não pediram isto, ignorem este email.\n\n{signature}',
  'email.reset.subject': 'Nova palavra-passe na Cultura',
  'email.reset.body':
    'Recebemos um pedido para alterar a vossa palavra-passe. Escolham uma nova: {link}\nO link serve uma vez e expira em {minutes} minutos. Se não pediram isto, ignorem este email.\n\n{signature}',
  'email.welcome.subject': 'Conta ativada na Cultura',
  'email.welcome.body':
    'Já podem:\n- {benefit1}\n- {benefit2}\n- {benefit3}\n- {benefit4}\n\n{signature}',

  'meta.signup.title': 'Criar conta — Cultura',
  'meta.signup.description': 'Criem a vossa conta e sigam a agenda cultural de Angola.',
  'meta.signin.title': 'Entrar — Cultura',
  'meta.signin.description': 'Entrem para ver a vossa agenda cultural.',
  'meta.verify.title': 'Confirmar email — Cultura',
  'meta.verify.description': 'Confirmem o vosso email para ativar a conta.',
  'meta.reset.title': 'Pedir nova palavra-passe — Cultura',
  'meta.reset.description': 'Peçam um link para escolher uma nova palavra-passe.',
  'meta.password.title': 'Nova palavra-passe — Cultura',
  'meta.password.description': 'Escolham uma nova palavra-passe para a vossa conta.',
  'meta.guard.title': 'Sem acesso — Cultura',
  'meta.guard.description': 'Esta página não está disponível para a vossa conta.',
};

export type Messages = typeof pt;
