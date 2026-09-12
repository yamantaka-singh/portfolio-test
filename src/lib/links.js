/**
 * @param {string} email
 * @param {string} subject
 */
export function mailtoUrl(email, subject) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(`Invalid email "${email}"`);
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
