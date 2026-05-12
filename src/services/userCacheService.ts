import { prisma } from "../db.js";
import { mapAdminToUserRole } from "../utils/roleMapper.js";

export async function cacheUserFromAdmin(adminUser: {
  user_id: string;
  username: string;
  role: string;
  status: string;
  email?: string;
}) {
  const userRole = mapAdminToUserRole(adminUser.role);

  return prisma.user.upsert({
    where: { user_id: adminUser.user_id },
    update: {
      username: adminUser.username,
      role: userRole,
      isActive: adminUser.status?.toLowerCase() === "active",
    },
    create: {
      user_id: adminUser.user_id,
      username: adminUser.username,
      email: adminUser.email || `${adminUser.username}@hospital.com`,
      passwordHash: "managed-by-admin",
      role: userRole,
      isActive: adminUser.status?.toLowerCase() === "active",
    },
  });
}