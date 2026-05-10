export function parseDate(date) {
  if (!date) return new Date('2000-01-01');
  const [day, month, year] = date.split('.').map(Number);
  let d = new Date(year, month, day);
  try {
    d.toISOString();
  } catch {
    d = new Date('2000-01-01');
  }
  return d;
}

export function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth()).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}
