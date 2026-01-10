// 管理者メールアドレス一覧
export const ADMIN_EMAILS = ["takumi@anymindgroup.com"] as const;

// 管理者判定
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email as (typeof ADMIN_EMAILS)[number]);
}
