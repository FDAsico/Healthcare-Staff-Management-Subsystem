import prisma from "../prisma/client.js";

export async function getAllStaff(filters = {}) {
  const {
    status,
    departmentId,
    role,
    search,
    page = 1,
    limit = 20,
  } = filters;

  const where = {};
  if (status) where.status = status;
  if (departmentId) where.department_id = departmentId;
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { employeeId: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.staff.findMany({
      where,
      skip: (page - 1) * limit,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { user_id: true, username: true, email: true, isActive: true },
        },
        department: true,
        availability: true,
      },
    }),
    prisma.staff.count({ where }),
  ]);

  return {
    data,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  };
}

export async function getStaffById(staffId) {
  const staff = await prisma.staff.findUnique({
    where: { staff_id: staffId },
    include: {
      user: {
        select: {
          user_id: true,
          username: true,
          email: true,
          isActive: true,
          role: true,
        },
      },
      department: true,
      availability: true,
      documents: true,
      emergencyContacts: true,
      schedules: { orderBy: { shiftDate: "desc" }, take: 10 },
      attendances: { orderBy: { date: "desc" }, take: 10 },
      leaveRequests: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!staff) throw new Error("Staff not found");
  return staff;
}

export async function createStaff(data) {
  const { user_id, username, email, passwordHash, userRole, ...staffData } =
    data;

  // Link to existing user
  if (user_id) {
    const existingUser = await prisma.user.findUnique({
      where: { user_id },
      include: { staffProfile: true },
    });
    if (!existingUser) throw new Error("User not found");
    if (existingUser.staffProfile)
      throw new Error("User already has a staff profile");

    return await prisma.staff.create({
      data: {
        ...staffData,
        user_id,
        email: staffData.email || existingUser.email,
      },
      include: {
        user: {
          select: { user_id: true, username: true, email: true, isActive: true },
        },
        department: true,
      },
    });
  }

  // Create User + Staff in a transaction
  if (!username || !email || !passwordHash) {
    throw new Error(
      "Username, email, and passwordHash are required to create a new user"
    );
  }

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: userRole || "STAFF",
        isActive: true,
      },
    });

    const staff = await tx.staff.create({
      data: {
        ...staffData,
        user_id: user.user_id,
        email: staffData.email || user.email,
      },
      include: {
        user: {
          select: { user_id: true, username: true, email: true, isActive: true },
        },
        department: true,
      },
    });

    return staff;
  });
}

export async function updateStaff(staffId, data) {
  const { department_id, ...rest } = data;

  return await prisma.staff.update({
    where: { staff_id: staffId },
    data: {
      ...rest,
      ...(department_id && { department_id }),
      updatedAt: new Date(),
    },
    include: {
      user: {
        select: { user_id: true, username: true, email: true, isActive: true },
      },
      department: true,
    },
  });
}

export async function terminateStaff(staffId) {
  return await prisma.$transaction(async (tx) => {
    const staff = await tx.staff.update({
      where: { staff_id: staffId },
      data: {
        status: "TERMINATED",
        terminatedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { user_id: staff.user_id },
      data: { isActive: false },
    });

    return staff;
  });
}

// ─── Schedules ───
export async function getStaffSchedules(staffId, { startDate, endDate } = {}) {
  const where = { staff_id: staffId };
  if (startDate && endDate) {
    where.shiftDate = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }
  return await prisma.schedule.findMany({
    where,
    orderBy: { shiftDate: "desc" },
    include: { attendances: true },
  });
}

export async function createSchedule(staffId, data) {
  return await prisma.schedule.create({
    data: { ...data, staff_id: staffId },
  });
}

// ─── Attendance ───
export async function getStaffAttendance(staffId, { month, year } = {}) {
  const where = { staff_id: staffId };
  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    where.date = { gte: start, lte: end };
  }
  return await prisma.attendance.findMany({
    where,
    orderBy: { date: "desc" },
  });
}

export async function recordAttendance(data) {
  return await prisma.attendance.create({
    data,
    include: { staff: true, schedule: true },
  });
}

// ─── Leave Requests ───
export async function getStaffLeaves(staffId) {
  return await prisma.leaveRequest.findMany({
    where: { staff_id: staffId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createLeaveRequest(staffId, data) {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const totalDays = (end - start) / (1000 * 60 * 60 * 24) + 1;

  return await prisma.leaveRequest.create({
    data: {
      ...data,
      staff_id: staffId,
      totalDays,
      status: "PENDING",
    },
  });
}

export async function reviewLeaveRequest(leaveId, { status, reviewedBy }) {
  return await prisma.leaveRequest.update({
    where: { leave_id: leaveId },
    data: {
      status,
      reviewedBy,
      reviewedAt: new Date(),
    },
  });
}

export default {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  terminateStaff,
  getStaffSchedules,
  createSchedule,
  getStaffAttendance,
  recordAttendance,
  getStaffLeaves,
  createLeaveRequest,
  reviewLeaveRequest,
};