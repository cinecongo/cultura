import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { TimeRuler } from '@/components/time-ruler';

/**
 * La réglette est le seul élément « spectaculaire » du produit : elle doit être
 * exacte. Ces tests vérifient la géométrie réelle rendue, pas une intention.
 *
 * Fenêtre par défaut : 12h00 → 02h00 (26). Graduations toutes les heures,
 * libellé toutes les deux heures et à la fin ; un point par événement ; au-delà
 * de trois événements sur la même heure, un trait vertical.
 */

const render = (events: { id: string; hour: number }[]) =>
  renderToStaticMarkup(<TimeRuler locale="pt" label="Programa do dia" events={events} />);

const count = (html: string, pattern: RegExp) => [...html.matchAll(pattern)].length;

describe('TimeRuler', () => {
  it('dessine 15 graduations de 12h à 02h et 8 libellés', () => {
    const html = render([]);

    expect(count(html, /class="ruler-tick"/g)).toBe(15);
    expect(count(html, /data-major="true"/g)).toBe(8);
    expect(html).toContain('12h00');
    expect(html).toContain('02h00');
    expect(count(html, /class="ruler-dot"/g)).toBe(0);
  });

  it('place un point par événement, sans déplacer l’axe', () => {
    const html = render([
      { id: 'a', hour: 18 },
      { id: 'b', hour: 20.5 },
      { id: 'c', hour: 25 },
    ]);

    expect(count(html, /class="ruler-dot"/g)).toBe(3);
    // 18h est à (18-12)/14 = 42,857 %.
    expect(html).toMatch(/ruler-dot" style="left:42\.857/);
  });

  it('remplace les points par un trait au-delà de trois événements sur la même heure', () => {
    const html = render([
      { id: 'a', hour: 19 },
      { id: 'b', hour: 19.25 },
      { id: 'c', hour: 19.5 },
      { id: 'd', hour: 19.75 },
      { id: 'e', hour: 21 },
    ]);

    expect(count(html, /class="ruler-dot"/g)).toBe(1);
    expect(count(html, /class="ruler-bar"/g)).toBe(1);
    expect(html).toMatch(/ruler-bar" style="left:50%/);
  });

  it('élargit la fenêtre plutôt que de perdre un événement', () => {
    const early = render([{ id: 'a', hour: 9 }]);
    expect(count(early, /class="ruler-tick"/g)).toBe(18);
    expect(early).toContain('9h00');

    const late = render([{ id: 'b', hour: 27 }]);
    expect(count(late, /class="ruler-tick"/g)).toBe(16);
    expect(late).toContain('03h00');
  });

  it('traduit les libellés selon la langue', () => {
    const fr = renderToStaticMarkup(
      <TimeRuler locale="fr" label="Programme du jour" events={[]} />,
    );
    const en = renderToStaticMarkup(
      <TimeRuler locale="en" label="Today's programme" events={[]} />,
    );

    expect(fr).toContain('12 h 00');
    expect(en).toContain('12:00');
  });

  it('nomme la section avec des événements et masque tout l’axe sans événement', () => {
    const full = render([{ id: 'a', hour: 18 }]);
    expect(full).toContain('aria-label="Programa do dia"');
    expect(full).toContain('aria-hidden="true"');

    const empty = render([]);
    expect(empty).toContain('aria-hidden="true"');
    expect(empty).not.toContain('aria-label=');
  });
});
