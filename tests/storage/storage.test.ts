import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

/**
 * Contrôle P2.5 contre le bucket réel (projet courant, sans Docker).
 * La clé de service n'est utilisée que côté test : jamais exposée au client,
 * jamais affichée. Les objets créés sont supprimés en fin de test.
 */
const ENV_FILE = join(process.cwd(), '.env.local');

function loadEnv(): void {
  if (!existsSync(ENV_FILE)) {
    return;
  }
  for (const line of readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && process.env[match[1] as string] === undefined) {
      process.env[match[1] as string] = match[2];
    }
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const BUCKET = 'cultura-media';

// Image WebP 1 × 1 pixel, suffisante pour valider le type MIME accepté.
const WEBP_1PX = Buffer.from('UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA', 'base64');

function serverClient() {
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

describe('Stockage — bucket cultura-media (P2.5)', () => {
  it('bucket privé, limite 10 Mo et MIME limités à WebP/PNG/JPEG/AVIF', async () => {
    const { data, error } = await serverClient().storage.getBucket(BUCKET);
    expect(error).toBeNull();
    expect(data?.public).toBe(false);
    expect(data?.file_size_limit).toBe(10_485_760);
    expect([...(data?.allowed_mime_types ?? [])].sort()).toEqual(
      ['image/avif', 'image/jpeg', 'image/png', 'image/webp'].sort(),
    );
  });

  it('refuse un fichier texte et accepte un WebP, puis nettoie', async () => {
    const client = serverClient();
    const prefix = `tests/verification-${Date.now()}`;
    const txtPath = `${prefix}.txt`;
    const webpPath = `${prefix}.webp`;

    const txt = await client.storage.from(BUCKET).upload(txtPath, Buffer.from('pas une image'), {
      contentType: 'text/plain',
    });
    expect(txt.error).not.toBeNull();

    const webp = await client.storage.from(BUCKET).upload(webpPath, WEBP_1PX, {
      contentType: 'image/webp',
    });
    expect(webp.error).toBeNull();

    const listed = await client.storage.from(BUCKET).list('tests');
    const names = (listed.data ?? []).map((item) => item.name);
    expect(names).not.toContain(txtPath.split('/').at(-1));
    expect(names).toContain(webpPath.split('/').at(-1));

    await client.storage.from(BUCKET).remove([webpPath]);
  });

  it('refuse un upload anonyme (bucket privé, aucune politique publique)', async () => {
    const anon = createClient(url, anonKey, { auth: { persistSession: false } });
    const { error } = await anon.storage
      .from(BUCKET)
      .upload(`tests/anon-${Date.now()}.webp`, WEBP_1PX, { contentType: 'image/webp' });
    expect(error).not.toBeNull();
  });
});
