import { formatDate } from '../../helpers/date.ts';

export function examGet(data: Record<string, any>, subject: string) {
  const value = data['exam+' + subject.toLowerCase()];
  subject = subject.toUpperCase();
  if (!value) return `Keine Klausurtermine für **${subject}** gesetzt.`;
  const [date1, date2] = value.map((d: Date) => formatDate(new Date(d)));
  return `# ${subject}-Klausurtermine\n- Ersttermin: ${date1}\n- Zweittermin: ${date2}`;
}
