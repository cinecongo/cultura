<?php

/**
 * Cultura — transport d'emails transactionnels (P3.1, décision du 2026-11-27).
 *
 * Les données arrivent sur STDIN en JSON, jamais dans argv : aucun secret ni
 * jeton dans la ligne de commande, aucun appel shell côté TypeScript.
 * Deux modes :
 *   - bac à sable fichier (développement / e2e) : MAIL_OUTBOX_FILE ;
 *   - SMTP (production) : hôte, port, utilisateur, mot de passe, EMAIL_FROM.
 * Le script n'affiche jamais les valeurs d'environnement, le mot de passe,
 * l'adresse du destinataire ni le contenu du message.
 */

declare(strict_types=1);

const TEMPLATES = ['verify', 'reset', 'welcome'];
const MAX_BODY_BYTES = 20000;
const OUTBOX_TTL_SECONDS = 86400;

function fail(string $code): never
{
    fwrite(STDERR, "mailer: $code\n");
    exit(1);
}

function cleanHeader(string $value): string
{
    // Une adresse ou un objet ne doit jamais contenir de retour à la ligne.
    if (preg_match("/[\r\n\x00]/", $value) === 1) {
        fail('invalid_header');
    }
    return trim($value);
}

function validEmail(string $value): string
{
    $value = cleanHeader($value);
    if ($value === '' || filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
        fail('invalid_recipient');
    }
    return $value;
}

function writeOutbox(string $path, array $message): void
{
    $directory = dirname($path);
    if (!is_dir($directory) || !is_writable($directory)) {
        fail('outbox_directory_missing');
    }

    // Purge bornée : un lien de réinitialisation ne reste pas lisible indéfiniment.
    if (is_file($path)) {
        $kept = [];
        foreach (file($path, FILE_IGNORE_NEW_LINES) ?: [] as $line) {
            $previous = json_decode($line, true);
            if (is_array($previous) && isset($previous['at'])) {
                $age = time() - strtotime((string) $previous['at']);
                if ($age >= 0 && $age < OUTBOX_TTL_SECONDS) {
                    $kept[] = $line;
                }
            }
        }
        file_put_contents($path, $kept === [] ? '' : implode("\n", $kept) . "\n", LOCK_EX);
    }

    $line = json_encode($message, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($line === false || file_put_contents($path, $line . "\n", FILE_APPEND | LOCK_EX) === false) {
        fail('outbox_write_failed');
    }
    @chmod($path, 0600);
}

function smtpCommand($socket, string $command, int $expected): void
{
    if (fwrite($socket, $command . "\r\n") === false) {
        fail('smtp_write_failed');
    }

    // Une réponse SMTP peut être multiligne (EHLO : `250-…` puis `250 …`).
    // On consomme toutes les lignes de continuation avant de rendre la main,
    // sinon `AUTH LOGIN` lirait un `250-…` résiduel et serait refusé.
    for ($i = 0; $i < 32; $i++) {
        $line = fgets($socket, 512);
        if ($line === false || !preg_match('/^' . $expected . '(?:[\s-]|$)/', $line)) {
            fail('smtp_rejected');
        }
        if (!isset($line[3]) || $line[3] !== '-') {
            return;
        }
    }

    fail('smtp_rejected');
}

function sendSmtp(string $from, string $to, string $subject, string $body): void
{
    $host = getenv('MAIL_SMTP_HOST') ?: '';
    $port = (int) (getenv('MAIL_SMTP_PORT') ?: 587);
    $user = getenv('MAIL_SMTP_USER') ?: '';
    $pass = getenv('MAIL_SMTP_PASS') ?: '';
    if ($host === '' || $port < 1 || $port > 65535 || $user === '' || $pass === '') {
        fail('smtp_not_configured');
    }

    // TLS avec vérification du certificat : jamais de contexte "allow self signed".
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
            'crypto_method' => STREAM_CRYPTO_METHOD_TLS_CLIENT,
        ],
    ]);
    $socket = @stream_socket_client(
        'tls://' . $host . ':' . $port,
        $errno,
        $errstr,
        15,
        STREAM_CLIENT_CONNECT,
        $context,
    );
    if ($socket === false) {
        fail('smtp_connect_failed');
    }

    smtpCommand($socket, 'EHLO cultura.local', 250);
    smtpCommand($socket, 'AUTH LOGIN', 334);
    smtpCommand($socket, base64_encode($user), 334);
    smtpCommand($socket, base64_encode($pass), 235);
    smtpCommand($socket, 'MAIL FROM:<' . $from . '>', 250);
    smtpCommand($socket, 'RCPT TO:<' . $to . '>', 250);
    smtpCommand($socket, 'DATA', 354);

    $message = "From: <$from>\r\nTo: <$to>\r\nSubject: $subject\r\n";
    $message .= "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n";
    // Dot-stuffing : un point en début de ligne ne terminated pas le DATA.
    $message .= preg_replace('/^\./m', '..', $body) . "\r\n.\r\n";
    if (strlen($message) > MAX_BODY_BYTES || fwrite($socket, $message) === false) {
        fclose($socket);
        fail('smtp_message_rejected');
    }
    smtpCommand($socket, 'QUIT', 221);
    fclose($socket);
}

$raw = stream_get_contents(STDIN);
if ($raw === false || strlen($raw) > MAX_BODY_BYTES) {
    fail('payload_too_large');
}
$payload = json_decode($raw, true);
if (!is_array($payload)) {
    fail('invalid_payload');
}

$template = (string) ($payload['template'] ?? '');
if (!in_array($template, TEMPLATES, true)) {
    fail('invalid_template');
}
$to = validEmail((string) ($payload['to'] ?? ''));
$subject = cleanHeader((string) ($payload['subject'] ?? ''));
$body = (string) ($payload['body'] ?? '');
if ($subject === '' || $body === '' || strlen($body) > MAX_BODY_BYTES) {
    fail('invalid_content');
}
if (preg_match('/[\x00]/', $body) === 1) {
    fail('invalid_content');
}

$from = validEmail((string) (getenv('EMAIL_FROM') ?: ''));
$outbox = (string) (getenv('MAIL_OUTBOX_FILE') ?: '');
$isProduction = (getenv('APP_ENV') ?: 'development') === 'production';

if ($outbox !== '') {
    // Un bac à sable fichier ne doit jamais être actif en production.
    if ($isProduction) {
        fail('outbox_forbidden_in_production');
    }
    writeOutbox($outbox, [
        'at' => gmdate('c'),
        'template' => $template,
        'to' => $to,
        'subject' => $subject,
        'body' => $body,
    ]);
    fwrite(STDOUT, "ok\n");
    exit(0);
}

sendSmtp($from, $to, $subject, $body);
fwrite(STDOUT, "ok\n");
