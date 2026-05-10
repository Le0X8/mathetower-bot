import { formatDate } from '../../helpers/date.js';

export function examGet(data, subject) {
  const value = data['exam+' + subject.toLowerCase()];
  subject = subject.toUpperCase();
  if (!value) return `Keine Klausurtermine für **${subject}** gesetzt.`;
  const [date1, date2] = value.map((d) => formatDate(new Date(d)));
  return `# ${subject}-Klausurtermine\n- Ersttermin: ${date1}\n- Zweittermin: ${date2}`;
}
