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
import { authenticate, authorize } from "../../../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/", authorize(["STAFF", "ADMIN", "SUBSYSTEM"]), controller.getAll);
router.get("/:id", authorize(["STAFF", "ADMIN", "SUBSYSTEM"]), validateUUID("id"), controller.getById);
router.post("/", authorize(["ADMIN"]), validateCreateStaff, controller.create);
router.put("/:id", authorize(["ADMIN"]), validateUUID("id"), controller.update);
router.delete("/:id", authorize(["ADMIN"]), validateUUID("id"), validateUpdateStaff, controller.remove);

router.get("/:id/schedules", authorize(["STAFF", "ADMIN"]), validateUUID("id"), controller.getSchedules);
router.post("/:id/schedules", authorize(["ADMIN"]), validateUUID("id"), validateCreateSchedule, controller.createSchedule);

router.get("/:id/attendance", authorize(["STAFF", "ADMIN"]), validateUUID("id"), controller.getAttendance);
router.post("/attendance", authorize(["ADMIN"]), validateRecordAttendance, controller.recordAttendance);

router.get("/:id/leaves", authorize(["STAFF", "ADMIN"]), validateUUID("id"), controller.getLeaves);
router.post("/:id/leaves", authorize(["ADMIN"]), validateUUID("id"), validateCreateLeave, controller.createLeave);

export default router;