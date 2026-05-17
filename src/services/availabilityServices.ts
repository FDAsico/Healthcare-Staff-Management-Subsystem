import { prisma } from "../db.js";
import { logAction } from "../utils/auditLogger.js";

export async function getByStaffId(staffId: string) {
  return prisma.availability.findUnique({
    where: { staff_id: staffId },
    include: { staff: { select: { firstName: true, lastName: true, employeeId: true } } },
  });
}

export async function upsert(staffId: string, data: Record<string, unknown>) {
  const availability = await prisma.availability.upsert({
    where: { staff_id: staffId },
    update: data,
    create: { ...data, staff_id: staffId } as any,
    include: { staff: { select: { firstName: true, lastName: true } } },
  });

  // Audit log
  await logAction({
    action: "UPDATE",
    entity: "AVAILABILITY",
    entityId: staffId,
    newValue: { isAvailable: availability.isAvailable, reason: availability.reason },
  });

  return availability;
}

export async function removeByStaffId(staffId: string) {
  await prisma.availability.delete({
    where: { staff_id: staffId },
  });

  // Audit log
  await logAction({
    action: "DELETE",
    entity: "AVAILABILITY",
    entityId: staffId,
  });
}
