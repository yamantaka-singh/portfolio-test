const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** @param {number | null} n */
export const compactCount = (n) => (n == null ? '—' : compact.format(n));

/** @param {string} iso */
export const longDate = (iso) => dateFmt.format(new Date(iso));
