import { Router } from "express";
import { apiKeyAuth } from "../../../middleware/apiKey.js";
import { requireSubsystem } from "../../../middleware/subsystemAuth.js";
import { validateUUID } from "../validators/commonValidator.js";
import { prisma } from "../../../db.js";

const router = Router();
router.use(apiKeyAuth);

// GET /api/v1/staff/public/pms/staff/
router.get(
  "/pms/staff",
  requireSubsystem("pms"),
  async (req, res) => {
    try {
      const { role } = req.query;
      const validRoles = ["DOCTOR", "NURSE", "PHARMACIST"];
      const where: any = { status: "ACTIVE" };

      // Filter by specific role if provided
      if (role) {
        const upperRole = (role as string).toUpperCase();
        if (!validRoles.includes(upperRole)) {
          return res.status(400).json({
            message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
          });
        }
        where.role = upperRole;
      } else {
        // Default: show all patient-facing roles
        where.role = { in: validRoles };
      }

      const staff = await prisma.staff.findMany({
        where,
        orderBy: { lastName: "asc" },
        select: {
          staff_id: true,
          firstName: true,
          lastName: true,
          role: true,
          email: true,
          phone: true,
          department: { select: { name: true, location: true } },
          availability: { select: { isAvailable: true, availableFrom: true, availableUntil: true } },
        },
      });

      res.json({
        data: staff,
        total: staff.length,
        filter: role ? (role as string).toUpperCase() : "ALL",
      });
    } catch (e) {
      res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
    }
  }
);

// GET /api/v1/staff/public/pms/staff/:id/schedules
router.get(
  "/pms/staff/:id/schedules",
  requireSubsystem("pms"),
  validateUUID("id"),
  async (req, res) => {
    try {
      const staff = await prisma.staff.findUnique({
        where: { staff_id: req.params.id as string },
        select: { role: true, firstName: true, lastName: true },
      });

      if (!staff) return res.status(404).json({ message: "Staff not found" });

      const schedules = await prisma.schedule.findMany({
        where: {
          staff_id: req.params.id as string,
          shiftDate: { gte: new Date() },
          status: { in: ["SCHEDULED", "CONFIRMED"] },
        },
        orderBy: { shiftDate: "asc" },
        take: 30,
        select: {
          schedule_id: true,
          shiftDate: true,
          startTime: true,
          endTime: true,
          shiftType: true,
          status: true,
          department: { select: { name: true } },
        },
      });

      res.json({
        staff: {
          staff_id: req.params.id,
          name: `${staff.firstName} ${staff.lastName}`,
          role: staff.role,
        },
        data: schedules,
      });
    } catch (e) {
      res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
    }
  }
);

// GET /api/v1/staff/public/inventory/pharmacists
router.get(
  "/inventory/pharmacists",
  requireSubsystem("inventory"),
  async (req, res) => {
    try {
      const pharmacists = await prisma.staff.findMany({
        where: { role: "PHARMACIST", status: "ACTIVE" },
        select: {
          staff_id: true,
          firstName: true,
          lastName: true,
          employeeId: true,
          email: true,
        },
      });
      res.json({ data: pharmacists, total: pharmacists.length });
    } catch (e) {
      res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
    }
  }
);

// GET /api/v1/staff/public/inventory/verify/:id
router.get(
  "/inventory/verify/:id",
  requireSubsystem("inventory"),
  validateUUID("id"),
  async (req, res) => {
    try {
      const staff = await prisma.staff.findUnique({
        where: { staff_id: req.params.id as string },
        select: { staff_id: true, role: true, status: true, firstName: true, lastName: true },
      });

      const isPharmacist = staff?.role === "PHARMACIST" && staff?.status === "ACTIVE";

      res.json({
        staff_id: req.params.id,
        name: staff ? `${staff.firstName} ${staff.lastName}` : null,
        isPharmacist,
        isActive: staff?.status === "ACTIVE",
      });
    } catch (e) {
      res.status(500).json({ message: e instanceof Error ? e.message : "Error" });
    }
  }
);

router.post(
  "/admin/onboard",
  requireSubsystem("admin"),
  async (req, res) => {
    try {
      const { user_id, ...staffData } = req.body;

      if (!user_id) {
        return res.status(400).json({ message: "user_id is required" });
      }

      const staff = await prisma.staff.create({
        data: { ...staffData, user_id } as any,
        include: {
          user: { select: { username: true, email: true } },
          department: true,
        },
      });

      res.status(201).json(staff);
    } catch (e) {
      res.status(400).json({ message: e instanceof Error ? e.message : "Error" });
    }
  }
);

export default router;