import staffService from "../../../services/staffService.js";
import staffMapper from "../../../mapper/staffmapper.js";

export async function getAllStaff(req, res) {
  try {
    const result = await staffService.getAllStaff(req.query);
    const dtoList = staffMapper.toDTOList(result.data);
    res.json({
      data: dtoList,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getStaffById(req, res) {
  try {
    const staff = await staffService.getStaffById(req.params.id);
    const dto = staffMapper.toDetailDTO(staff);
    res.json(dto);
  } catch (error) {
    const status = error.message === "Staff not found" ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
}

export async function createStaff(req, res) {
  try {
    const staff = await staffService.createStaff(req.body);
    const dto = staffMapper.toDTO(staff);
    res.status(201).json(dto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function updateStaff(req, res) {
  try {
    const staff = await staffService.updateStaff(req.params.id, req.body);
    const dto = staffMapper.toDTO(staff);
    res.json(dto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function terminateStaff(req, res) {
  try {
    const staff = await staffService.terminateStaff(req.params.id);
    const dto = staffMapper.toDTO(staff);
    res.json({ message: "Staff terminated successfully", data: dto });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// ─── Schedules ───
export async function getStaffSchedules(req, res) {
  try {
    const schedules = await staffService.getStaffSchedules(
      req.params.id,
      req.query
    );
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createSchedule(req, res) {
  try {
    const schedule = await staffService.createSchedule(req.params.id, req.body);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// ─── Attendance ───
export async function getStaffAttendance(req, res) {
  try {
    const attendance = await staffService.getStaffAttendance(
      req.params.id,
      req.query
    );
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function recordAttendance(req, res) {
  try {
    const record = await staffService.recordAttendance(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// ─── Leaves ───
export async function getStaffLeaves(req, res) {
  try {
    const leaves = await staffService.getStaffLeaves(req.params.id);
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createLeaveRequest(req, res) {
  try {
    const leave = await staffService.createLeaveRequest(req.params.id, req.body);
    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function reviewLeaveRequest(req, res) {
  try {
    const leave = await staffService.reviewLeaveRequest(
      req.params.leaveId,
      req.body
    );
    res.json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export default {
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
};