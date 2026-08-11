export const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(ADMIN_EMAIL) && email?.trim().toLowerCase() === ADMIN_EMAIL;
}
