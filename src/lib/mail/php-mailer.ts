import 'server-only';

import { spawn } from 'node:child_process';
import { join } from 'node:path';

import { getServerEnv } from '@/lib/env.server';
import type { Locale } from '@/lib/i18n';

export type MailTemplate = 'verify' | 'reset' | 'welcome';

export type MailInput = {
  readonly template: MailTemplate;
  readonly to: string;
  readonly locale: Locale;
  readonly subject: string;
  readonly body: string;
};

/**
 * Le script PHP échoue fermé ; le message renvoyé au client est générique et
 * ne contient ni stderr, ni adresse, ni jeton. Aucun secret n'est passé en
 * argument de commande (`argv`) : tout vient de l'environnement du processus
 * et du STDIN. Aucun shell n'est impliqué.
 */
export class MailDeliveryError extends Error {
  constructor() {
    super("L'envoi du message est indisponible.");
    this.name = 'MailDeliveryError';
  }
}

function runPhp(binary: string, payload: string, env: NodeJS.ProcessEnv): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, [join(process.cwd(), 'scripts', 'mailer.php')], {
      env,
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // stderr est volontairement ignoré : il peut contenir une adresse. On ne
    // conserve aucun texte, aucun code de sortie détaillé côté client.
    child.stderr.resume();
    child.stdout.resume();

    const timer = setTimeout(() => child.kill(), 15_000);
    const finish = (ok: boolean): void => {
      clearTimeout(timer);
      if (ok) resolve();
      else reject(new MailDeliveryError());
    };

    child.once('error', () => finish(false));
    child.once('close', (code) => finish(code === 0));
    child.stdin.once('error', () => finish(false));
    child.stdin.end(payload, 'utf8');
  });
}

export async function sendTransactionalMail(input: MailInput): Promise<void> {
  const env = getServerEnv();
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && !env.MAIL_SMTP_HOST) {
    throw new MailDeliveryError();
  }

  const childEnv: NodeJS.ProcessEnv = {
    ...process.env,
    APP_ENV: isProduction ? 'production' : 'development',
  };
  if (isProduction) {
    // Le bac à sable fichier ne doit jamais exister en production.
    delete childEnv.MAIL_OUTBOX_FILE;
  }

  try {
    await runPhp(
      env.PHP_BINARY ?? 'php',
      JSON.stringify({
        template: input.template,
        to: input.to,
        subject: input.subject,
        body: input.body,
      }),
      childEnv,
    );
  } catch {
    throw new MailDeliveryError();
  }
}
