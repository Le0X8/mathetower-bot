import { createHash } from 'node:crypto';

const BASE = 'https://efa.vrr.de/standard/XSLT_DM_REQUEST';
const DORTMUND_UNI_ID = '20000472';

export interface S1Departure {
  trainId: string;
  direction: string | null;
  plannedDeparture: Date;
  actualDeparture: Date;
  delayMinutes: number;
  cancelled: boolean;
}

interface RawDateTime {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}

interface RawDeparture {
  dateTime: RawDateTime;
  realDateTime?: RawDateTime;
  realtimeStatus?: string;
  servingLine: {
    symbol: string;
    direction: string;
    stateless: string;
    trainNum: string;
    delay: string;
  };
  attrs?: { name: string; value: string }[];
}

interface RawResponse {
  departureList?: RawDeparture[];
}

function getBerlinParts(date: Date): {
  day: number;
  month: number;
  year: number;
  hours: number;
  minutes: number;
} {
  const parts = new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  return {
    day: get('day'),
    month: get('month'),
    year: get('year'),
    hours: get('hour'),
    minutes: get('minute'),
  };
}

function parseDateTime(dt: RawDateTime): Date {
  const year = Number(dt.year);
  const month = Number(dt.month);
  const day = Number(dt.day);
  const hour = Number(dt.hour);
  const minute = Number(dt.minute);

  let date = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  const tz = 'Europe/Berlin';

  for (let i = 0; i < 2; i++) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = fmt.formatToParts(date);
    const get = (type: string) =>
      Number(parts.find((p) => p.type === type)?.value);

    const berlinYear = get('year');
    const berlinMonth = get('month');
    const berlinDay = get('day');
    const berlinHour = get('hour');
    const berlinMinute = get('minute');

    const target = Date.UTC(year, month - 1, day, hour, minute, 0);

    const actual = Date.UTC(
      berlinYear,
      berlinMonth - 1,
      berlinDay,
      berlinHour,
      berlinMinute,
      0,
    );

    const diffMinutes = (target - actual) / 60000;

    if (diffMinutes === 0) break;

    date = new Date(date.getTime() + diffMinutes * 60000);
  }

  return date;
}

function buildParams(from: Date): URLSearchParams {
  const b = getBerlinParts(from);
  return new URLSearchParams({
    outputFormat: 'JSON',
    language: 'de',
    stateless: '1',
    coordOutputFormat: 'WGS84[DD.ddddd]',
    coordOutputFormatTail: '7',
    type_dm: 'stop',
    name_dm: DORTMUND_UNI_ID,
    itOptionsActive: '1',
    ptOptionsActive: '1',
    useProxFootSearch: '1',
    useProxFootSearchOrigin: '1',
    useProxFootSearchDestination: '1',
    mergeDep: '1',
    useAllStops: '1',
    mode: 'direct',
    useRealtime: '1',
    deleteAssignedStops_dm: '0',
    limit: '12',
    includedMeans: 'checkbox',
    inclMOT_1: 'on',
    itdDateDay: String(b.day),
    itdDateMonth: String(b.month),
    itdDateYear: String(b.year),
    itdTimeHour: String(b.hours),
    itdTimeMinute: String(b.minutes),
  });
}

export async function getCurrentS1Departures(): Promise<S1Departure[]> {
  const now = new Date();
  const from = new Date(now.getTime() - 60 * 60 * 1000);

  const response = await fetch(`${BASE}?${buildParams(from)}`, {
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (compatible; Java/public-transport-enabler)',
      Connection: 'close',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as RawResponse;
  const departures = data.departureList ?? [];

  return departures
    .filter((d) => d.servingLine.symbol === 'S1')
    .map((d): S1Departure => {
      const planned = parseDateTime(d.dateTime);
      const actual = d.realDateTime ? parseDateTime(d.realDateTime) : planned;
      const delay = Number(d.servingLine.delay ?? 0);
      const cancelled =
        d.realtimeStatus === 'DEPARTURE_CANCELLED' || delay === -9999;
      const delayMinutes = cancelled ? 0 : delay;

      const rawId = `${d.servingLine.stateless}:${d.servingLine.trainNum}`;
      const trainId = createHash('md5').update(rawId).digest('hex');

      return {
        trainId,
        direction: d.servingLine.direction ?? null,
        plannedDeparture: planned,
        actualDeparture: actual,
        delayMinutes,
        cancelled,
      };
    })
    .filter((d) => {
      const t = d.actualDeparture.getTime();
      return t >= from.getTime() && t <= now.getTime();
    });
}
