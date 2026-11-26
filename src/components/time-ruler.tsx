import type { CSSProperties } from 'react';

import { formatHour, type Locale } from '@/lib/i18n';

/**
 * La réglette horaire (DESIGN.md §6) — l'élément signature du produit.
 *
 * Un axe unique, des graduations à l'heure, un point ocre par événement. Elle
 * n'est affichée qu'une fois par page, en haut de « Hoje ». L'axe reste visible
 * même sans événement : il donne la forme du programme à venir, et c'est un
 * choix produit assumé (la page ne doit pas paraître vide). Dans ce cas il est
 * entièrement `aria-hidden`, car il n'annonce rien d'utile.
 *
 * `hour` est l'heure de Luanda en fraction d'heure (18h30 → 18,5 ; 01h00 du
 * lendemain → 25). La fenêtre s'élargit si un événement sort de 12h–02h, pour
 * qu'aucun point ne soit perdu.
 *
 * Le composant ne peint pas son fond : l'appelant le pose sur l'aplat `ink`
 * (DESIGN.md §6). L'axe est décoratif pour les technologies d'assistance
 * (`aria-hidden`) ; la section porte son nom, et la liste réelle des
 * événements porte le contenu.
 */
export type RulerEvent = {
  readonly id: string;
  /** Heure de Luanda en fraction d'heure, 0 à 29. */
  readonly hour: number;
};

export type TimeRulerProps = {
  readonly locale: Locale;
  /** Nom déjà traduit de la réglette. */
  readonly label: string;
  readonly events: readonly RulerEvent[];
};

const DEFAULT_START = 12;
/** 02h00 du lendemain. */
const DEFAULT_END = 26;
const MAX_DOTS_PER_HOUR = 3;

export function TimeRuler({ locale, label, events }: TimeRulerProps) {
  const eventHours = events.map((event) => event.hour);
  const startHour = Math.min(DEFAULT_START, Math.floor(Math.min(...eventHours)));
  const endHour = Math.max(DEFAULT_END, Math.ceil(Math.max(...eventHours)));
  const span = endHour - startHour;

  const ticks: number[] = [];
  for (let hour = startHour; hour <= endHour; hour += 1) ticks.push(hour);

  const position = (hour: number) => ((hour - startHour) / span) * 100;

  const byHour = new Map<number, RulerEvent[]>();
  for (const event of events) {
    const hour = Math.floor(event.hour);
    const list = byHour.get(hour);
    if (list) list.push(event);
    else byHour.set(hour, [event]);
  }

  return (
    <section
      aria-label={events.length > 0 ? label : undefined}
      aria-hidden={events.length > 0 ? undefined : true}
      className="mt-8"
    >
      <div className="ruler-scroll ruler-fade overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="ruler-track" aria-hidden="true">
            {ticks.map((hour, index) => {
              const major = (hour - startHour) % 2 === 0 || hour === endHour;
              const left = `${position(hour)}%`;
              const edge = hour === startHour ? 'start' : hour === endHour ? 'end' : undefined;

              return (
                <span key={hour}>
                  <span
                    className="ruler-tick"
                    data-major={major}
                    style={{ left, '--i': index } as CSSProperties}
                  />
                  {major ? (
                    <span className="ruler-label" data-edge={edge} style={{ left }}>
                      {formatHour(locale, hour)}
                    </span>
                  ) : null}
                </span>
              );
            })}

            {events.map((event) => {
              const crowded = (byHour.get(Math.floor(event.hour))?.length ?? 0) > MAX_DOTS_PER_HOUR;
              if (crowded) return null;
              return (
                <span
                  key={event.id}
                  className="ruler-dot"
                  style={{ left: `${position(event.hour)}%` }}
                />
              );
            })}

            {[...byHour.entries()].map(([hour, list]) =>
              list.length > MAX_DOTS_PER_HOUR ? (
                <span
                  key={`bar-${hour}`}
                  className="ruler-bar"
                  style={{ left: `${position(hour)}%` }}
                />
              ) : null,
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
