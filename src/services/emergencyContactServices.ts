import { prisma } from "../db.js";
import { logAction } from "../utils/auditLogger.js";

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
  const contact = await prisma.emergencyContact.create({
    data: data as any,
    include: { staff: { select: { firstName: true, lastName: true, staff_id: true } } },
  });

  // Audit log
  await logAction({
    action: "CREATE",
    entity: "EMERGENCY_CONTACT",
    entityId: contact.contact_id,
    newValue: { name: contact.name, relationship: contact.relationship, staffId: contact.staff_id },
  });

  return contact;
}

export async function update(id: string, data: Record<string, unknown>) {
  const contact = await prisma.emergencyContact.update({
    where: { contact_id: id },
    data,
    include: { staff: { select: { firstName: true, lastName: true, staff_id: true } } },
  });

  // Audit log
  await logAction({
    action: "UPDATE",
    entity: "EMERGENCY_CONTACT",
    entityId: id,
    newValue: { name: contact.name, relationship: contact.relationship, staffId: contact.staff_id },
  });

  return contact;
}

export async function remove(id: string) {
  const contact = await prisma.emergencyContact.delete({
    where: { contact_id: id },
  });

  // Audit log
  await logAction({
    action: "DELETE",
    entity: "EMERGENCY_CONTACT",
    entityId: id,
    oldValue: { name: contact.name, relationship: contact.relationship },
  });

  return contact;
}
