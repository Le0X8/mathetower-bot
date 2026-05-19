import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';

const execFileAsync = promisify(execFile);

const BASE = 'https://int.bahn.de/web/api/reiseloesung/abfahrten';

const DORTMUND_UNI_ID = '8004419';

export interface S1Departure {
  trainId: string;
  direction: string | null;
  plannedDeparture: Date;
  actualDeparture: Date;
  delayMinutes: number;
  cancelled: boolean;
}

interface RawEntry {
  bahnhofsId: string;
  zeit: string;
  ezZeit?: string;
  journeyId: string;
  verkehrmittel: { name: string };
  terminus: string;
  ausfall?: boolean;
  meldungen?: { prioritaet: string; text: string }[];
}

async function fetchDepartures(url: string): Promise<RawEntry[]> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'de',
      'User-Agent': 'mathetower-bot',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as { entries?: RawEntry[] };
  return data.entries ?? [];
}

function hasStopCancelled(messages?: { text: string }[]): boolean {
  if (!messages) return false;

  return messages.some((m) => /halt entfällt/i.test(m.text));
}

function buildTimeWindow() {
  const now = new Date();

  const from = new Date(now.getTime() - 60 * 60 * 1000);
  const to = new Date(now.getTime() + 120 * 60 * 1000);

  return { from, to };
}

export async function getCurrentS1Departures(): Promise<S1Departure[]> {
  const { from, to } = buildTimeWindow();

  const date = nowDateString(from);

  const time = nowTimeString(from);

  const url =
    `${BASE}?ortExtId=${DORTMUND_UNI_ID}` +
    `&zeit=${time}` +
    `&datum=${date}` +
    `&verkehrsmittel[]=SBAHN`;

  const entries = await fetchDepartures(url);

  return entries
    .filter((d) => d.verkehrmittel.name === 'S1')
    .filter((d) => {
      const t = new Date(d.ezZeit ?? d.zeit).getTime();
      return t >= from.getTime() && t <= to.getTime();
    })
    .map((d) => {
      const planned = new Date(d.zeit);
      const actual = d.ezZeit ? new Date(d.ezZeit) : planned;

      const delayMinutes = Math.round(
        (actual.getTime() - planned.getTime()) / 60000,
      );

      const cancelled = d.ausfall === true || hasStopCancelled(d.meldungen);

      return {
        trainId: createHash('md5').update(d.journeyId).digest('hex'),
        direction: d.terminus ?? null,
        plannedDeparture: planned,
        actualDeparture: actual,
        delayMinutes,
        cancelled,
      };
    });
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function nowDateString(d: Date) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function nowTimeString(d: Date) {
  return pad(d.getHours()) + ':' + pad(d.getMinutes());
}
