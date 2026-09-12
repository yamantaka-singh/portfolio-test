/**
 * @param {string} digits country code + number, digits only
 * @param {string} text prefilled message
 */
export function whatsappUrl(digits, text) {
  if (!/^\d{8,15}$/.test(digits)) throw new Error(`WhatsApp number must be 8-15 digits, got "${digits}"`);
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/**
 * @param {string} email
 * @param {string} subject
 */
export function mailtoUrl(email, subject) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(`Invalid email "${email}"`);
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
