import { embed } from '@/helpers/message.ts';
import { formatDate } from '../../helpers/date.ts';
import { type Message } from 'discord.js';

export function examList(data: Record<string, any>, message: Message<boolean>) {
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
      return [subject, `Ersttermin: ${date1}\nZweittermin: ${date2}`] as [
        string,
        string,
      ];
    });

  embed(
    message,
    'Anstehende Klausuren',
    klausuren.length > 0 ? null : 'Keine Klausuren gesetzt.',
    klausuren,
    null,
  );
}
