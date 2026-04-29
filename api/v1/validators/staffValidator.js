const VALID_ROLES = [
  "DOCTOR",
  "NURSE",
  "RECEPTIONIST",
  "PHARMACIST",
  "BILLING_OFFICER",
  "SUPPORT_AGENT",
  "ADMIN",
  "LAB_TECHNICIAN",
  "SURGEON",
  "SPECIALIST",
];

const VALID_STATUSES = [
  "ACTIVE",
  "ON_LEAVE",
  "SUSPENDED",
  "RESIGNED",
  "TERMINATED",
];

const VALID_ATTENDANCE = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "HALF_DAY",
  "ON_LEAVE",
  "EARLY_DEPARTURE",
];

const VALID_LEAVE_TYPES = [
  "SICK",
  "VACATION",
  "EMERGENCY",
  "MATERNITY",
  "PATERNITY",
  "UNPAID",
  "BEREAVEMENT",
  "STUDY",
  "MEDICAL",
];

export function validateCreateStaff(req, res, next) {
  const { firstName, lastName, role, username, email, passwordHash } = req.body;

  if (!firstName || firstName.trim() === "") {
    return res.status(400).json({ message: "First name is required" });
  }
  if (!lastName || lastName.trim() === "") {
    return res.status(400).json({ message: "Last name is required" });
  }
  if (!role || !VALID_ROLES.includes(role)) {
    return res
      .status(400)
      .json({ message: "Valid staff role is required" });
  }

  // Only required if not linking to an existing user
  if (!req.body.user_id) {
    if (!username || username.trim() === "") {
      return res
        .status(400)
        .json({ message: "Username is required when creating a new user" });
    }
    if (!email || email.trim() === "") {
      return res
        .status(400)
        .json({ message: "Email is required when creating a new user" });
    }
    if (!passwordHash || passwordHash.trim() === "") {
      return res
        .status(400)
        .json({ message: "Password hash is required when creating a new user" });
    }
  }

  next();
}

export function validateUpdateStaff(req, res, next) {
  const { role, status } = req.body;
  if (role && !VALID_ROLES.includes(role)) {
    return res.status(400).json({ message: "Invalid staff role" });
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid staff status" });
  }
  next();
}

export function validateCreateSchedule(req, res, next) {
  const { shiftDate, startTime, endTime } = req.body;
  if (!shiftDate)
    return res.status(400).json({ message: "Shift date is required" });
  if (!startTime)
    return res.status(400).json({ message: "Start time is required" });
  if (!endTime)
    return res.status(400).json({ message: "End time is required" });
  next();
}

export function validateRecordAttendance(req, res, next) {
  const { staff_id, date, status } = req.body;
  if (!staff_id)
    return res.status(400).json({ message: "Staff ID is required" });
  if (!date) return res.status(400).json({ message: "Date is required" });
  if (!status || !VALID_ATTENDANCE.includes(status)) {
    return res.status(400).json({ message: "Valid attendance status is required" });
  }
  next();
}

export function validateCreateLeave(req, res, next) {
  const { leaveType, startDate, endDate } = req.body;
  if (!leaveType || !VALID_LEAVE_TYPES.includes(leaveType)) {
    return res.status(400).json({ message: "Valid leave type is required" });
  }
  if (!startDate)
    return res.status(400).json({ message: "Start date is required" });
  if (!endDate)
    return res.status(400).json({ message: "End date is required" });
  next();
}

export function validateReviewLeave(req, res, next) {
  const { status } = req.body;
  if (!status || !["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ message: "Status must be APPROVED or REJECTED" });
  }
  next();
}

export default {
  validateCreateStaff,
  validateUpdateStaff,
  validateCreateSchedule,
  validateRecordAttendance,
  validateCreateLeave,
  validateReviewLeave,
};