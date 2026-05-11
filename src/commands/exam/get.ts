import { type Message } from 'discord.js';
import { formatDate } from '../../helpers/date.ts';
import { embed } from '@/helpers/message.ts';

export async function examGet(
  data: Record<string, any>,
  message: Message<boolean>,
  subject: string,
) {
  const value = data['exam+' + subject.toLowerCase()];
  subject = subject.toUpperCase();
  await embed(
    message,
    `${subject}-Klausurtermine`,
    value ? null : `Keine Klausurtermine für **${subject}** gesetzt.`,
    value?.map((d: Date, i: number) => [
      i === 0 ? 'Ersttermin' : 'Zweittermin',
      formatDate(new Date(d)),
    ]) ?? [],
    null,
  );
}
