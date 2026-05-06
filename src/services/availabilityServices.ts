import { prisma } from "../db.js";

export async function getByStaffId(staffId: string) {
  return prisma.availability.findUnique({
    where: { staff_id: staffId },
    include: { staff: { select: { firstName: true, lastName: true, employeeId: true } } },
  });
}

export async function upsert(staffId: string, data: Record<string, unknown>) {
  return prisma.availability.upsert({
    where: { staff_id: staffId },
    update: data,
    create: { ...data, staff_id: staffId } as any,
    include: { staff: { select: { firstName: true, lastName: true } } },
  });
}

export async function removeByStaffId(staffId: string) {
  return prisma.availability.delete({
    where: { staff_id: staffId },
  });
}