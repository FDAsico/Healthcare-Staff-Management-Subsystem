import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Use DIRECT url for migrations/seed (not the pooled one)
const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_DATABASE_URL not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding...");

  // Departments
  const [cardio, er, pharmacy] = await prisma.$transaction([
    prisma.department.create({ data: { name: "Cardiology", description: "Heart care", location: "Building A, 3F" } }),
    prisma.department.create({ data: { name: "Emergency", description: "24/7 ER", location: "Building A, GF" } }),
    prisma.department.create({ data: { name: "Pharmacy", description: "Medications", location: "Building B, 1F" } }),
  ]);

  // Users
  const adminUser = await prisma.user.create({
    data: { username: "admin_jose", email: "admin@hospital.com", passwordHash: "hash", role: "ADMIN" },
  });

  const drMariaUser = await prisma.user.create({
    data: { username: "dr_maria", email: "maria@hospital.com", passwordHash: "hash", role: "STAFF" },
  });

  const drAntonioUser = await prisma.user.create({
    data: { username: "dr_antonio", email: "antonio@hospital.com", passwordHash: "hash", role: "STAFF" },
  });

  const nurseAnaUser = await prisma.user.create({
    data: { username: "nurse_ana", email: "ana@hospital.com", passwordHash: "hash", role: "STAFF" },
  });

  // Staff
  const maria = await prisma.staff.create({
    data: {
      user_id: drMariaUser.user_id,
      employeeId: "EMP-001",
      firstName: "Maria",
      lastName: "Santos",
      gender: "FEMALE",
      role: "DOCTOR",
      department_id: cardio.department_id,
      specialization: "Cardiology",
      status: "ACTIVE",
    },
  });

  const antonio = await prisma.staff.create({
    data: {
      user_id: drAntonioUser.user_id,
      employeeId: "EMP-002",
      firstName: "Antonio",
      lastName: "Lim",
      gender: "MALE",
      role: "DOCTOR",
      department_id: er.department_id,
      specialization: "Trauma",
      status: "ACTIVE",
    },
  });

  await prisma.staff.create({
    data: {
      user_id: nurseAnaUser.user_id,
      employeeId: "EMP-003",
      firstName: "Ana",
      lastName: "Reyes",
      gender: "FEMALE",
      role: "NURSE",
      department_id: cardio.department_id,
      specialization: "Cardiac Care",
      status: "ACTIVE",
    },
  });

  // Availability
  await prisma.availability.create({
    data: { staff_id: maria.staff_id, isAvailable: true },
  });

  // Schedule
  const today = new Date();
  await prisma.schedule.create({
    data: {
      staff_id: maria.staff_id,
      department_id: cardio.department_id,
      shiftDate: today,
      startTime: new Date(today.setHours(8, 0, 0, 0)),
      endTime: new Date(today.setHours(16, 0, 0, 0)),
      shiftType: "REGULAR",
      status: "SCHEDULED",
    },
  });

  // Leave
  await prisma.leaveRequest.create({
    data: {
      staff_id: maria.staff_id,
      leaveType: "VACATION",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-05"),
      totalDays: 5,
      reason: "Vacation",
      status: "PENDING",
    },
  });

  // Document
  await prisma.staffDocument.create({
    data: {
      staff_id: maria.staff_id,
      documentType: "MEDICAL_LICENSE",
      title: "PRC License",
      issuedBy: "Philippine Medical Association",
      issueDate: new Date("2015-01-01"),
      expiryDate: new Date("2028-01-01"),
      isVerified: true,
    },
  });

  console.log("Done seeding");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });