import { prisma } from "../db.js";

export async function getAll(query: Record<string, unknown>) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const staffId = query.staffId as string | undefined;

  const where = staffId ? { staff_id: staffId } : {};

  const [data, total] = await prisma.$transaction([
    prisma.emergencyContact.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
      include: { staff: { select: { firstName: true, lastName: true, employeeId: true } } },
    }),
    prisma.emergencyContact.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getById(id: string) {
  return prisma.emergencyContact.findUnique({
    where: { contact_id: id },
    include: { staff: { select: { firstName: true, lastName: true, employeeId: true } } },
  });
}

export async function create(data: Record<string, unknown>) {
  return prisma.emergencyContact.create({
    data: data as any,
    include: { staff: { select: { firstName: true, lastName: true } } },
  });
}

export async function update(id: string, data: Record<string, unknown>) {
  return prisma.emergencyContact.update({
    where: { contact_id: id },
    data,
    include: { staff: { select: { firstName: true, lastName: true } } },
  });
}

export async function remove(id: string) {
  return prisma.emergencyContact.delete({
    where: { contact_id: id },
  });
}