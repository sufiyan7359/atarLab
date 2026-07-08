export function toCsv<T extends object>(rows: T[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]) as Array<keyof T>;
  const escape = (value: unknown): string => {
    // This utility's contract is "rows of primitive-like values" (strings, numbers,
    // booleans, Dates) — every current caller only ever passes those, never a plain
    // object without a meaningful toString().
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const str = value === null || value === undefined ? '' : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}
