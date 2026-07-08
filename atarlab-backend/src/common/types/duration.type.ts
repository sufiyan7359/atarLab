/** A jsonwebtoken-compatible duration literal, e.g. '15m', '7d', '1h'. */
export type Duration = `${number}${'s' | 'm' | 'h' | 'd'}`;
