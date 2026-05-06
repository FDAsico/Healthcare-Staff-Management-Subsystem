import { Router } from "express";
import authRoutes from "./authRoutes.js";
import staffRoutes from "./staffRoutes.js";
import staffPublicRoutes from "./staffPublicRoutes.js";
import departmentRoutes from "./departmentRoutes.js";
import availabilityRoutes from "./availabilityRoutes.js";
import documentRoutes from "./documentRoutes.js";
import emergencyContactRoutes from "./emergencyContactRoutes.js";
import auditLogRoutes from "./auditLogRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/staff/public", staffPublicRoutes);
router.use("/staff", staffRoutes);
router.use("/departments", departmentRoutes);
router.use("/availability", availabilityRoutes);
router.use("/documents", documentRoutes);
router.use("/emergency-contacts", emergencyContactRoutes);
router.use("/audit-logs", auditLogRoutes);

export default router;