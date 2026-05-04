import { Router } from "express";
import * as controller from "../controllers/staffControllers.js";
import {
  validateCreateStaff,
  validateUpdateStaff,
  validateCreateSchedule,
  validateRecordAttendance,
  validateCreateLeave,
  validateReviewLeave,
} from "../validators/staffValidator.js";
import { validateUUID } from "../validators/commonValidator.js";

const router = Router();

router.get("/", controller.getAll);
router.get("/:id", validateUUID("id"), controller.getById);
router.post("/", controller.create);
router.put("/:id", validateUUID("id"), controller.update);
router.delete("/:id", validateUUID("id"), validateUpdateStaff, controller.remove);

router.get("/:id/schedules", validateUUID("id"), controller.getSchedules);
router.post("/:id/schedules", validateUUID("id"), controller.createSchedule);

router.get("/:id/attendance", validateUUID("id"), controller.getAttendance);
router.post("/attendance", validateRecordAttendance, controller.recordAttendance);

router.get("/:id/leaves", validateUUID("id"), controller.getLeaves);
router.post("/:id/leaves", validateUUID("id"), controller.createLeave);

export default router;