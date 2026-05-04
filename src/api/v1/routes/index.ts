import { Router } from "express";
import staffRoutes from "./staffRoutes.js";

const router = Router();

router.use("/staff", staffRoutes);
// router.use("/departments", departmentRoutes);
// router.use("/schedules", scheduleRoutes);

export default router;