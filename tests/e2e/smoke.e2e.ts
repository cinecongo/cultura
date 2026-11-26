import { expect, test } from '@playwright/test';

/**
 * Fumée P1.4 : les trois langues existent, la résolution est la bonne, le
 * choix mémorisé l'emporte, la page ne déborde pas à 360 px.
 *
 * Ces tests échouent volontairement si un texte d'interface revient en dur ou
 * si une langue perd son `lang` : ce sont des contrats, pas des décorations.
 */

const PAGES = [
  { path: '/pt', lang: 'pt-AO', title: 'Hoje' },
  { path: '/fr', lang: 'fr', title: "Aujourd'hui" },
  { path: '/en', lang: 'en', title: 'Today' },
  { path: '/pt/semana', lang: 'pt-AO', title: 'Esta semana' },
  { path: '/fr/semaine', lang: 'fr', title: 'Cette semaine' },
  { path: '/en/week', lang: 'en', title: 'This week' },
] as const;

test.describe('les trois langues', () => {
  for (const page of PAGES) {
    test(`${page.path} déclare ${page.lang} et un h1 unique`, async ({ page: browserPage }) => {
      const response = await browserPage.goto(page.path);
      expect(response?.status()).toBe(200);

      await expect(browserPage.locator('html')).toHaveAttribute('lang', page.lang);
      await expect(browserPage.getByRole('heading', { level: 1 })).toHaveText(page.title);
      await expect(browserPage.locator('h1')).toHaveCount(1);
    });
  }
});

test.describe('résolution de langue', () => {
  test('la racine suit la langue du navigateur', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/fr\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('le cookie mémorisé l’emporte sur le navigateur', async ({ page, context, baseURL }) => {
    expect(baseURL).toBeTruthy();
    await context.addCookies([{ name: 'cultura_locale', value: 'pt', url: baseURL as string }]);

    await page.goto('/');
    await expect(page).toHaveURL(/\/pt\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-AO');
  });

  test('le sélecteur change de langue et mémorise le choix', async ({ page, context }) => {
    await page.goto('/fr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

    await page.getByRole('link', { name: 'PT', exact: true }).click();
    await expect(page).toHaveURL(/\/pt\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-AO');

    const cookie = (await context.cookies()).find((item) => item.name === 'cultura_locale');
    expect(cookie?.value).toBe('pt');

    await page.goto('/');
    await expect(page).toHaveURL(/\/pt\/?$/);
  });

  test('une langue inconnue tombe en 404, pas en page vide', async ({ page }) => {
    const response = await page.goto('/de');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('mise en page', () => {
  test('aucun débordement horizontal à 360 px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 720 });

    for (const path of ['/pt', '/fr', '/en']) {
      await page.goto(path);
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth, path).toBeLessThanOrEqual(360);
    }
  });

  test('le lien d’évitement est le premier élément focalisable', async ({ page }) => {
    await page.goto('/fr');
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    await expect(focused).toHaveAttribute('href', '#conteudo');
  });
});

test.describe('design system P1.5', () => {
  test('l’en-tête porte le logotype et l’item actif', async ({ page }) => {
    await page.goto('/fr');

    await expect(page.locator('header img')).toHaveAttribute('src', '/brand/logo.svg');
    await expect(page.getByRole('link', { name: "Aujourd'hui", exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(page.getByRole('link', { name: 'FR', exact: true })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  test('la réglette horaire est rendue sur « Aujourd’hui »', async ({ page }) => {
    await page.goto('/fr');

    const ruler = page.locator('.ruler-track');
    await expect(ruler).toBeVisible();
    await expect(ruler.locator('.ruler-tick')).toHaveCount(15);
    await expect(ruler).toHaveCSS('border-bottom-color', 'rgb(185, 175, 163)');
  });

  test('Archivo est chargée, pas seulement déclarée', async ({ page }) => {
    await page.goto('/fr');

    const state = await page.evaluate(async () => {
      await document.fonts.ready;
      const faces = [...document.fonts].filter(
        (face) => face.family.replace(/["']/g, '') === 'Archivo',
      );
      return {
        declared: faces.length,
        loaded: faces.filter((face) => face.status === 'loaded').length,
      };
    });

    // `document.fonts.check()` seul peut répondre `true` sans fichier : on
    // exige une vraie FontFace Archivo à l'état `loaded` (constat N24).
    expect(state.declared).toBeGreaterThan(0);
    expect(state.loaded).toBeGreaterThan(0);

    const font = await page.request.get('/fonts/archivo-latin.woff2');
    expect(font.status()).toBe(200);
    expect(font.headers()['content-type']).toContain('font');

    await expect(page.locator('body')).toHaveCSS('font-family', /Archivo/);
  });

  test('la barre basse mobile porte les deux sections', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 720 });
    await page.goto('/fr');

    const nav = page.getByRole('navigation', { name: 'Navigation principale' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link')).toHaveCount(2);
    await expect(nav.getByRole('link', { name: "Aujourd'hui" })).toHaveAttribute(
      'aria-current',
      'page',
    );

    await nav.getByRole('link', { name: 'Cette semaine' }).click();
    await expect(page).toHaveURL(/\/fr\/semaine\/?$/);
    await expect(
      page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', {
        name: 'Cette semaine',
      }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('toutes les cibles tactiles font au moins 44 × 44 px', async ({ page }) => {
    for (const width of [360, 1120]) {
      await page.setViewportSize({ width, height: 800 });

      for (const path of ['/fr', '/fr/semaine']) {
        await page.goto(path);
        const links = page.locator('a:visible');
        const count = await links.count();
        expect(count, `${path} @${width}`).toBeGreaterThan(0);

        for (let index = 0; index < count; index += 1) {
          const box = await links.nth(index).boundingBox();
          const label = `${path} @${width} — lien ${index}`;
          expect(box, label).not.toBeNull();
          expect(box?.width ?? 0, `${label} (largeur)`).toBeGreaterThanOrEqual(44);
          expect(box?.height ?? 0, `${label} (hauteur)`).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });
});
