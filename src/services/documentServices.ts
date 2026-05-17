import { prisma } from "../db.js";
import { logAction } from "../utils/auditLogger.js";

export async function getAll(query: Record<string, unknown>) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const staffId = query.staffId as string | undefined;

  const where = staffId ? { staff_id: staffId } : {};

  const [data, total] = await prisma.$transaction([
    prisma.staffDocument.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { staff: { select: { firstName: true, lastName: true, employeeId: true } } },
    }),
    prisma.staffDocument.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getById(id: string) {
  return prisma.staffDocument.findUnique({
    where: { document_id: id },
    include: { staff: { select: { firstName: true, lastName: true, employeeId: true } } },
  });
}

export async function create(data: Record<string, unknown>) {
  const document = await prisma.staffDocument.create({
    data: data as any,
    include: { staff: { select: { firstName: true, lastName: true, staff_id: true } } },
  });

  // Audit log
  await logAction({
    action: "CREATE",
    entity: "DOCUMENT",
    entityId: document.document_id,
    newValue: { documentType: document.documentType, title: document.title, staffId: document.staff_id },
  });

  return document;
}

export async function update(id: string, data: Record<string, unknown>) {
  const document = await prisma.staffDocument.update({
    where: { document_id: id },
    data,
    include: { staff: { select: { firstName: true, lastName: true, staff_id: true } } },
  });

  // Audit log
  await logAction({
    action: "UPDATE",
    entity: "DOCUMENT",
    entityId: id,
    newValue: { documentType: document.documentType, title: document.title, staffId: document.staff_id },
  });

  return document;
}

export async function remove(id: string) {
  const document = await prisma.staffDocument.delete({
    where: { document_id: id },
  });

  // Audit log
  await logAction({
    action: "DELETE",
    entity: "DOCUMENT",
    entityId: id,
    oldValue: { documentType: document.documentType, title: document.title },
  });

  return document;
}
