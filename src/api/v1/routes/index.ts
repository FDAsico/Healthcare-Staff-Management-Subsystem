import { Router } from "express";
import authRoutes from "./authRoutes.js";
import adminProxyRoutes from "./adminProxyRoutes.js";
import staffRoutes from "./staffRoutes.js";
import staffPublicRoutes from "./staffPublicRoutes.js";
import departmentRoutes from "./departmentRoutes.js";
import availabilityRoutes from "./availabilityRoutes.js";
import documentRoutes from "./documentRoutes.js";
import emergencyContactRoutes from "./emergencyContactRoutes.js";
import auditLogRoutes from "./auditLogRoutes.js";
import patientProxyRoutes from "./patientProxyRoutes.js";      // NEW
import inventoryProxyRoutes from "./inventoryProxyRoutes.js";  // NEW

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin-proxy", adminProxyRoutes);
router.use("/staff/public", staffPublicRoutes);
router.use("/staff", staffRoutes);
router.use("/departments", departmentRoutes);
router.use("/availability", availabilityRoutes);
router.use("/documents", documentRoutes);
router.use("/emergency-contacts", emergencyContactRoutes);
router.use("/audit-logs", auditLogRoutes);
router.use("/patient-proxy", patientProxyRoutes);
router.use("/inventory-proxy", inventoryProxyRoutes);

export default router;