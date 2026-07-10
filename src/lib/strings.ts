export default {
  status: {
    failed: 'Aktion fehlgeschlagen.',
  },
  exam: {
    dates: (subject: string) => subject + '-Klausurtermine',
    none: (subject?: string) =>
      subject
        ? `Keine Klausurtermine für **${subject}** gesetzt.`
        : 'Keine Klausuren gesetzt.',
    first: 'Ersttermin',
    second: 'Zweittermin',
    planned: 'Anstehende Klausuren',
  },
};
