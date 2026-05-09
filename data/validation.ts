const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneAllowedPattern = /^[0-9+()\s-]+$/;

export function validateEmail(email: string) {
  const normalized = email.trim().toLowerCase();

  if (!normalized) {
    return 'Please enter your email address.';
  }

  if (!emailPattern.test(normalized)) {
    return 'Please enter a valid email address.';
  }

  return '';
}

export function validatePassword(password: string) {
  if (!password) {
    return 'Please enter your password.';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must include both letters and numbers.';
  }

  return '';
}

export function validateLoginPassword(password: string) {
  if (!password) {
    return 'Please enter your password.';
  }

  return '';
}

export function validateName(value: string, label: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return `Please enter your ${label.toLowerCase()}.`;
  }

  if (trimmed.length < 2) {
    return `${label} must be at least 2 characters.`;
  }

  if (!/^[A-Za-zÀ-ỹ\s'-]+$/.test(trimmed)) {
    return `${label} can only include letters, spaces, apostrophes, and hyphens.`;
  }

  return '';
}

export function validateDateOfBirth(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return 'Date of birth must use DD/MM/YYYY.';
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return 'Date of birth is not a valid date.';
  }

  if (date.getTime() > Date.now()) {
    return 'Date of birth cannot be in the future.';
  }

  return '';
}

export function validatePhone(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  const digits = trimmed.replace(/\D/g, '');

  if (!phoneAllowedPattern.test(trimmed) || digits.length < 9 || digits.length > 15) {
    return 'Phone number must contain 9 to 15 digits.';
  }

  return '';
}
