export function mapAdminToUserRole(adminRoleName: string): string {
  const map: Record<string, string> = {
    "Staff Management: Admin": "ADMIN",
    "Staff Management: Staff": "STAFF",
    "Admin": "ADMIN",
    "Doctor": "STAFF",
    "Nurse": "STAFF",
    "Pharmacist": "STAFF",
  };
  return map[adminRoleName] || "STAFF";
}

export function mapAdminToStaffRole(adminRoleName: string): string | null {
  const map: Record<string, string> = {
    "Doctor": "DOCTOR",
    "Nurse": "NURSE",
    "Pharmacist": "PHARMACIST",
    "Admin": "ADMIN",
    "Staff Management: Admin": "ADMIN",
    "Staff Management: Staff": null || "",
  };
  return map[adminRoleName] || null;
}