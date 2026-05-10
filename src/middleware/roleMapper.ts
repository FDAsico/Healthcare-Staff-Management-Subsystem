/** Admin role → Your User.role (subsystem access level) */
export function mapAdminToUserRole(adminRole: string): string {
  const map: Record<string, string> = {
    Admin: "ADMIN",
    Staff: "STAFF",
    Doctor: "STAFF",
    Nurse: "STAFF",
    Pharmacist: "STAFF",
    Patient: "PATIENT",
  };
  return map[adminRole] || "STAFF";
}