import { prisma } from "../db.js";

export async function getAll(query: Record<string, unknown>) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const entity = query.entity as string | undefined;

  const where = entity ? { entity } : {};

  const [data, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { performedAt: "desc" },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getById(id: string) {
  return prisma.auditLog.findUnique({
    where: { log_id: id },
  });
}

export async function create(data: Record<string, unknown>) {
  return prisma.auditLog.create({
    data: data as any,
  });
}

export async function remove(id: string) {
  return prisma.auditLog.delete({
    where: { log_id: id },
  });
}