import { formatDate } from '../../helpers/date.ts';

export function examList(data: Record<string, any>) {
  const klausuren = Object.entries(data)
    .filter(([key]) => key.startsWith('exam+'))
    .sort(([, valueA], [, valueB]) => {
      const dateA = Number(new Date(valueA[0]));
      const dateB = Number(new Date(valueB[0]));
      return dateA - dateB;
    })
    .map(([key, value]) => {
      const subject = key.split('+')[1].toUpperCase();
      const [date1, date2] = value.map((d: Date) => formatDate(new Date(d)));
      return `- **${subject}**:\n  - Ersttermin: ${date1}\n  - Zweittermin: ${date2}`;
    })
    .join('\n');
  const txt = klausuren || 'Keine Klausuren gesetzt.';
  return '# Anstehende Klausuren\n' + txt;
}
