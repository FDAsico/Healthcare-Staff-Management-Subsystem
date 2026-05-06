import { prisma } from "../db.js";

export async function getAll(query: Record<string, unknown>) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;

  const [data, total] = await prisma.$transaction([
    prisma.department.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        staff: {
          select: {
            staff_id: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
          },
        },
      },
    }),
    prisma.department.count(),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getById(id: string) {
  return prisma.department.findUnique({
    where: { department_id: id },
    include: {
      staff: {
        select: {
          staff_id: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          email: true,
          phone: true,
        },
      },
      schedules: { orderBy: { shiftDate: "desc" }, take: 10 },
    },
  });
}

export async function create(data: Record<string, unknown>) {
  return prisma.department.create({
    data: data as any,
  });
}

export async function update(id: string, data: Record<string, unknown>) {
  return prisma.department.update({
    where: { department_id: id },
    data,
  });
}

export async function remove(id: string) {
  return prisma.department.delete({
    where: { department_id: id },
  });
}