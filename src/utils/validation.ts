const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;
const MIN_BIRTH_YEAR = 1900;

export function onlyDigits(text: string): string {
  return text.replace(/\D/g, '');
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function formatCpf(text: string): string {
  const digits = onlyDigits(text).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

function cpfCheckDigit(digits: number[]): number {
  const weightStart = digits.length + 1;
  const sum = digits.reduce((total, digit, i) => total + digit * (weightStart - i), 0);
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

export function isValidCpf(text: string): boolean {
  const digits = onlyDigits(text).split('').map(Number);
  if (digits.length !== 11) return false;
  if (digits.every((d) => d === digits[0])) return false;
  const first = cpfCheckDigit(digits.slice(0, 9));
  const second = cpfCheckDigit(digits.slice(0, 10));
  return first === digits[9] && second === digits[10];
}

export function formatDate(text: string): string {
  const digits = onlyDigits(text).slice(0, 8);
  return digits.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
}

export function parseBirthDate(text: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) return null;
  const [, day, month, year] = match.map(Number);
  const date = new Date(year, month - 1, day);
  const isRealDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!isRealDate || year < MIN_BIRTH_YEAR || date > new Date()) return null;
  return date;
}

export type PasswordRules = { length: boolean; letter: boolean; number: boolean };

export function passwordRules(password: string): PasswordRules {
  return {
    length: password.length >= MIN_PASSWORD_LENGTH,
    letter: /[A-Za-zÀ-ÿ]/.test(password),
    number: /\d/.test(password),
  };
}

export function isValidPassword(password: string): boolean {
  const rules = passwordRules(password);
  return rules.length && rules.letter && rules.number;
}
