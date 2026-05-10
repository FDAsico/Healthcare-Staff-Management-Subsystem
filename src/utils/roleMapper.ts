export function mapAdminRoleName(adminRoleName: string): string {
  const map: Record<string, string> = {
    "Staff Management: Admin": "ADMIN",
    "Staff Management: Staff": "STAFF",
  };
  return map[adminRoleName] || "STAFF";
}