export const MIN_ADMIN_PASSWORD_LENGTH = 12;
export const MAX_ADMIN_PASSWORD_LENGTH = 128;

export function isValidAdminPassword(password: string): boolean {
  return password.length >= MIN_ADMIN_PASSWORD_LENGTH && password.length <= MAX_ADMIN_PASSWORD_LENGTH;
}
