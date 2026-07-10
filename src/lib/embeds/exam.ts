import { formatDate } from '@/lib/helpers/date.ts';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import strings from '$strings';

export async function examGet(subject: string) {
  const value = store.get('exam+' + subject.toLowerCase());
  subject = subject.toUpperCase();
  const embed = await buildEmbed(
    strings.exam.dates(subject),
    value ? null : strings.exam.none(subject),
    value?.map((d: Date, i: number) => [
      i === 0 ? strings.exam.first : strings.exam.second,
      formatDate(new Date(d)),
    ]) ?? [],
    null,
  );
  return embed;
}

export async function examList() {
  const klausuren = store
    .entries('exam')
    .sort(([, valueA], [, valueB]) => {
      const dateA = Number(new Date(valueA[0]));
      const dateB = Number(new Date(valueB[0]));
      return dateA - dateB;
    })
    .map(([key, value]) => {
      const subject = key.split('+')[1].toUpperCase();
      const [date1, date2] = value.map((d: Date) => formatDate(new Date(d)));
      return [
        subject,
        `${strings.exam.first}: ${date1}\n${strings.exam.second}: ${date2}`,
      ] as [string, string];
    });

  const embed = await buildEmbed(
    strings.exam.planned,
    klausuren.length > 0 ? null : strings.exam.none(),
    klausuren,
    null,
  );
  return embed;
}
