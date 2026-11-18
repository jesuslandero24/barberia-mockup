export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidPhone(value: string): boolean {
  return /^3\d{9}$/.test(normalizePhone(value));
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function looksLikeEmail(value: string): boolean {
  return value.includes("@");
}
