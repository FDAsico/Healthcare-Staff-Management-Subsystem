import { prisma } from "../db.js";
import { getStaffUsersFromAdmin, patchStaffIdToAdmin } from "../clients/adminClient.js";
import { mapAdminToUserRole } from "../utils/roleMapper.js";

export async function getAll(query: Record<string, unknown>) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;

  const [data, total] = await prisma.$transaction([
    prisma.staff.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { hiredAt: "desc" },
      include: {
        user: { select: { username: true, email: true, isActive: true } },
        department: true,
      },
    }),
    prisma.staff.count(),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getById(id: string) {
  return prisma.staff.findUnique({
    where: { staff_id: id },
    include: {
      user: { select: { username: true, email: true, isActive: true } },
      department: true,
      availability: true,
      schedules: { orderBy: { shiftDate: "desc" }, take: 10 },
      attendances: { orderBy: { date: "desc" }, take: 10 },
      leaveRequests: { orderBy: { createdAt: "desc" }, take: 10 },
      documents: true,
      emergencyContacts: true,
    },
  });
}

export async function create(data: Record<string, unknown>) {
  const { user_id, ...staffData } = data;

  if (!user_id) {
    throw new Error("user_id is required");
  }

  const adminUsers = await getStaffUsersFromAdmin();
  const adminUser = adminUsers.find((u) => u.user_id === user_id);

  if (!adminUser) {
    throw new Error("User not found in Admin Staff subsystem");
  }

  if (adminUser.staff_id) {
    throw new Error("User already has a staff profile");
  }

  await prisma.user.upsert({
    where: { user_id: adminUser.user_id },
    update: {
      username: adminUser.username,
      role: mapAdminToUserRole(adminUser.Role.name),
      isActive: adminUser.status === "active",
    },
    create: {
      user_id: adminUser.user_id,
      username: adminUser.username,
      email: `${adminUser.username}@hospital.com`, // fallback
      passwordHash: "managed-by-admin",
      role: mapAdminToUserRole(adminUser.Role.name),
      isActive: adminUser.status === "active",
    },
  });

  const staff = await prisma.staff.create({
    data: {
      ...staffData,
      user_id: adminUser.user_id,
      email: (staffData.email as string) || `${adminUser.username}@hospital.com`,
    } as any,
    include: {
      user: { select: { username: true, email: true } },
      department: true,
    },
  });

  await prisma.user.update({
    where: { user_id: adminUser.user_id },
    data: { role: staff.role },
  });


  try {
    await patchStaffIdToAdmin(adminUser.user_id, staff.staff_id);
  } catch (err) {
    console.error(`[ADMIN SYNC FAILED] user_id=${adminUser.user_id}, staff_id=${staff.staff_id}`, err);
  }

  return staff;
}

export async function update(id: string, data: Record<string, unknown>) {
  return prisma.staff.update({
    where: { staff_id: id },
    data,
    include: { user: { select: { username: true, email: true } }, department: true },
  });
}

export async function remove(id: string) {
  return prisma.$transaction(async (tx) => {
    const staff = await tx.staff.update({
      where: { staff_id: id },
      data: { status: "TERMINATED", terminatedAt: new Date() },
    });
    await tx.user.update({
      where: { user_id: staff.user_id },
      data: { isActive: false },
    });
    return staff;
  });
}

export async function getSchedules(staffId: string) {
  return prisma.schedule.findMany({
    where: { staff_id: staffId },
    orderBy: { shiftDate: "desc" },
  });
}

export async function createSchedule(staffId: string, data: Record<string, unknown>) {
  return prisma.schedule.create({
    data: { ...data, staff_id: staffId } as any,
  });
}

export async function getAttendance(staffId: string) {
  return prisma.attendance.findMany({
    where: { staff_id: staffId },
    orderBy: { date: "desc" },
  });
}

export async function recordAttendance(data: Record<string, unknown>) {
  return prisma.attendance.create({ data: data as any });
}

export async function getLeaves(staffId: string) {
  return prisma.leaveRequest.findMany({
    where: { staff_id: staffId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createLeave(staffId: string, data: Record<string, unknown>) {
  const start = new Date(data.startDate as string);
  const end = new Date(data.endDate as string);
  const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;

  return prisma.leaveRequest.create({
    data: {
      ...data,
      staff_id: staffId,
      totalDays,
    } as any,
  });
}