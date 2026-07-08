export function toCsv<T extends object>(rows: T[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]) as Array<keyof T>;
  const escape = (value: unknown): string => {
    const str = value === null || value === undefined ? '' : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}
