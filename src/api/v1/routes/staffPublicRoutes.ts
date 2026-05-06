import { Router } from "express";
import { apiKeyAuth } from "../../../middleware/apiKey.js";
import { validateUUID } from "../validators/commonValidator.js";
import { prisma } from "../../../db.js";

const router = Router();
router.use(apiKeyAuth);

// GET /api/v1/staff/public/
router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const [data, total] = await prisma.$transaction([
      prisma.staff.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { status: "ACTIVE" },
        orderBy: { lastName: "asc" },
        select: {
          firstName: true,
          lastName: true,
          gender: true,
          dateOfBirth: true,
          phone: true,
          email: true,
          address: true,
        },
      }),
      prisma.staff.count({ where: { status: "ACTIVE" } }),
    ]);

    res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
  }
});


// GET /api/v1/staff/public/:id/profile-for-support
router.get("/:id/profile-for-support", validateUUID("id"), async (req, res) => {
  try {
    const staff = await prisma.staff.findUnique({
      where: { staff_id: req.params.id as string },
      select: {
        firstName: true,
        lastName: true,
        gender: true,
        dateOfBirth: true,
        phone: true,
        email: true,
        address: true,
      },
    });

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    res.json({
      firstName: staff.firstName,
      lastName: staff.lastName,
      gender: staff.gender,
      dateOfBirth: staff.dateOfBirth,
      contact: { phone: staff.phone, email: staff.email },
      address: staff.address,
    });
  } catch (e) {
    res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
  }
});

// GET /api/v1/staff/public/:id/role
router.get("/:id/role", validateUUID("id"), async (req, res) => {
  try {
    const staff = await prisma.staff.findUnique({
      where: { staff_id: req.params.id as string },
      select: { staff_id: true, role: true, status: true, firstName: true, lastName: true },
    });

    if (!staff) return res.status(404).json({ message: "Staff not found" });
    if (staff.status !== "ACTIVE") return res.status(403).json({ message: "Staff is not active" });

    res.json({
      staff_id: staff.staff_id,
      role: staff.role,
      name: `${staff.firstName} ${staff.lastName}`,
      isActive: true,
    });
  } catch (e) {
    res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
  }
});

// GET /api/v1/staff/public/doctors
router.get("/doctors", async (req, res) => {
  try {
    const doctors = await prisma.staff.findMany({
      where: { role: "DOCTOR", status: "ACTIVE" },
      select: {
        staff_id: true,
        firstName: true,
        lastName: true,
        specialization: true,
        department_id: true,
      },
    });
    res.json(doctors);
  } catch (e) {
    res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
  }
});


// POST /api/v1/staff/public/onboard
router.post("/onboard", async (req, res) => {
  try {
    const { user_id, ...staffData } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required from Admin Subsystem" });
    }

    const user = await prisma.user.findUnique({ where: { user_id } });
    if (!user) return res.status(404).json({ message: "User not found in Admin Subsystem" });

    const staff = await prisma.staff.create({
      data: { ...staffData, user_id } as any,
      include: { user: { select: { username: true, email: true, passwordHash: true } } },
    });

    res.status(201).json(staff);
  } catch (e) {
    res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
  }
});

export default router;