import { Request, Response } from "express";
import { subsystemLogin } from "../../../clients/adminClient.js";
import { cacheUserFromAdmin } from "../../../services/userCacheService.js";
import { generateAccessToken } from "../../../utils/auth.js";
import { mapAdminToStaffRole } from "../../../utils/roleMapper.js";
import { prisma } from "../../../db.js";
import { logAction } from "../../../utils/auditLogger.js";
import { sendAuditToAdminSubsystem } from "../../../clients/auditClient.js";

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const adminAuth = await subsystemLogin(username, password);

    const localUser = await cacheUserFromAdmin({
      user_id: adminAuth.user.user_id,
      username: adminAuth.user.username,
      role: adminAuth.user.role,
      status: adminAuth.user.status,
    });

    const accessToken = generateAccessToken(localUser.user_id, localUser.role);

    const staff = await prisma.staff.findUnique({
      where: { user_id: localUser.user_id },
      select: {
        staff_id: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    const suggestedStaffRole = mapAdminToStaffRole(adminAuth.user.role);

    // Audit log successful login (local)
    await logAction({
      action: "LOGIN",
      entity: "AUTH",
      entityId: localUser.user_id,
      performedBy: localUser.user_id,
      newValue: { username: localUser.username, role: staff?.role, staffId: staff?.staff_id },
      ipAddress: req.ip || req.connection?.remoteAddress,
    });

    // Send to admin subsystem audit log
    await sendAuditToAdminSubsystem({
      user_id: localUser.user_id,
      action_type: "LOGIN",
      details: `User ${localUser.username} logged in successfully${staff ? ` as ${staff.role}` : ""}`,
      ip_addr: req.ip || req.connection?.remoteAddress,
    });

    res.json({
      message: "Login successful",
      accessToken,
      user: {
        user_id: localUser.user_id,
        username: localUser.username,
        email: localUser.email,
        role: staff?.role || suggestedStaffRole || "STAFF",
        accessRole: localUser.role,
      },
      staffProfile: staff,
      needsOnboarding: !staff,
    });
  } catch (error) {
    // Audit log failed login (local)
    await logAction({
      action: "FAILED_LOGIN",
      entity: "AUTH",
      newValue: { username: req.body.username, error: error instanceof Error ? error.message : "Invalid credentials" },
      ipAddress: req.ip || req.connection?.remoteAddress,
    });

    // Send to admin subsystem audit log
    await sendAuditToAdminSubsystem({
      user_id: "unknown",
      action_type: "FAILED_LOGIN",
      details: `Failed login attempt for username: ${req.body.username}`,
      ip_addr: req.ip || req.connection?.remoteAddress,
    });

    res.status(401).json({
      message: error instanceof Error ? error.message : "Invalid credentials",
    });
  }
}

export async function me(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { user_id: req.user.userId },
      select: {
        user_id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const staff = await prisma.staff.findUnique({
      where: { user_id: user.user_id },
      select: {
        staff_id: true,
        firstName: true,
        lastName: true,
        role: true,
        department_id: true,
        status: true,
      },
    });

    res.json({
      user: {
        ...user,
        displayRole: staff?.role || user.role,
      },
      staffProfile: staff,
      needsOnboarding: !staff,
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Error" });
  }
}

export async function logout(req: Request, res: Response) {
  // Audit log logout (local)
  if (req.user) {
    await logAction({
      action: "LOGOUT",
      entity: "AUTH",
      entityId: req.user.userId,
      performedBy: req.user.userId,
      ipAddress: req.ip || req.connection?.remoteAddress,
    });

    // Send to admin subsystem audit log
    await sendAuditToAdminSubsystem({
      user_id: req.user.userId,
      action_type: "LOGOUT",
      details: `User ${req.user.userId} logged out`,
      ip_addr: req.ip || req.connection?.remoteAddress,
    });
  }

  res.json({ message: "Logged out successfully" });
}
