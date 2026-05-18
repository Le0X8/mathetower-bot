import { load } from '@/store.ts';
import { formatDate } from '@/lib/helpers/date.ts';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';

export async function examGet(subject: string) {
  const data = load();
  const value = data['exam+' + subject.toLowerCase()];
  subject = subject.toUpperCase();
  const embed = await buildEmbed(
    `${subject}-Klausurtermine`,
    value ? null : `Keine Klausurtermine für **${subject}** gesetzt.`,
    value?.map((d: Date, i: number) => [
      i === 0 ? 'Ersttermin' : 'Zweittermin',
      formatDate(new Date(d)),
    ]) ?? [],
    null,
  );
  return embed;
}

export async function examList() {
  const data: Record<string, any> = load();
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

  const embed = await buildEmbed(
    'Anstehende Klausuren',
    klausuren.length > 0 ? null : 'Keine Klausuren gesetzt.',
    klausuren,
    null,
  );
  return embed;
}
