export const MIN_ADMIN_PASSWORD_LENGTH = 8;

export function isValidAdminPassword(password: string): boolean {
  return password.trim().length >= MIN_ADMIN_PASSWORD_LENGTH;
}
