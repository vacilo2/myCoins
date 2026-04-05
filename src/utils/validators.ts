export function isValidAmount(value: number): boolean {
  return value > 0 && isFinite(value);
}

export function isValidDescription(value: string): boolean {
  return value.trim().length > 0 && value.trim().length <= 100;
}

export function isValidCategoryName(value: string): boolean {
  return value.trim().length >= 2 && value.trim().length <= 30;
}
