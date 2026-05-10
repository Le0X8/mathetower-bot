export function parseDate(date) {
  if (!date) return new Date('2000-01-01');
  const [hour, part2] = date.split(':');
  if (!hour || !part2) return new Date('2000-01-01');
  const [day, month, year] = part2.split('.').map(Number);
  if (!day || !month || !year) return new Date('2000-01-01');
  let d = new Date(year, month - 1, day, parseInt(hour));
  try {
    d.toISOString();
  } catch {
    d = new Date('2000-01-01');
  }
  return d;
}

export function formatDate(date) {
  const ts = Math.floor(date.getTime() / 1000);
  return `<t:${ts}:f> (<t:${ts}:R>)`;
}
