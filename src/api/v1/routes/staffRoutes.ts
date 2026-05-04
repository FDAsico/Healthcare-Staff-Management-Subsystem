import { Router } from "express";
import * as controller from "../controllers/staffControllers.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

router.get("/:id/schedules", controller.getSchedules);
router.post("/:id/schedules", controller.createSchedule);

router.get("/:id/attendance", controller.getAttendance);
router.post("/attendance", controller.recordAttendance);

router.get("/:id/leaves", controller.getLeaves);
router.post("/:id/leaves", controller.createLeave);

export default router;