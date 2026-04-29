import { Router } from "express";
import {
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
} from "../controllers/staffController.js";
import {
  validateCreateStaff,
  validateUpdateStaff,
  validateCreateSchedule,
  validateRecordAttendance,
  validateCreateLeave,
  validateReviewLeave,
} from "../validators/staffValidator.js";

const router = Router();

// Staff CRUD
router.get("/staff", getAllStaff);
router.post("/staff", validateCreateStaff, createStaff);
router.get("/staff/:id", getStaffById);
router.put("/staff/:id", validateUpdateStaff, updateStaff);
router.delete("/staff/:id", terminateStaff);

// Schedules
router.get("/staff/:id/schedules", getStaffSchedules);
router.post("/staff/:id/schedules", validateCreateSchedule, createSchedule);

// Attendance
router.get("/staff/:id/attendance", getStaffAttendance);
router.post("/attendance", validateRecordAttendance, recordAttendance);

// Leave Requests
router.get("/staff/:id/leaves", getStaffLeaves);
router.post("/staff/:id/leaves", validateCreateLeave, createLeaveRequest);
router.put("/leaves/:leaveId/review", validateReviewLeave, reviewLeaveRequest);

export default router;