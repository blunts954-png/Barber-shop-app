/**
 * Validation utilities
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?1?\d{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
}

export function isValidPrice(price: number): boolean {
  return price >= 0 && Number.isFinite(price);
}

export function isValidRating(rating: number): boolean {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
}
