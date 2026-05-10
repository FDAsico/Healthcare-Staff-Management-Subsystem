import { Request, Response } from "express";
import { getStaffUsersFromAdmin } from "../../../clients/adminClient.js";

// List all users from Admin that belong to Staff subsystem
export async function listStaffUsers(req: Request, res: Response) {
  try {
    const users = await getStaffUsersFromAdmin();
    const pending = users.filter((u) => u.staff_id === null);
    res.json({
      total: users.length,
      pending: pending.length,
      users: pending.map((u) => ({
        user_id: u.user_id,
        username: u.username,
        firstName: u.first_name,
        lastName: u.last_name,
        fullName: `${u.first_name} ${u.last_name}`,
        roleName: u.Role.name,
        status: u.status,
        lastLogin: u.last_login,
        onboarded: u.staff_id !== null,
      })),
    });
  } catch (e) {
    res.status(502).json({ message: e instanceof Error ? e.message : "Admin fetch failed" });
  }
}

/** Get single user (fallback) */
export async function getUser(req: Request, res: Response) {
  try {
    const users = await getStaffUsersFromAdmin();
    const user = users.find((u) => u.user_id === req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      user_id: user.user_id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      roleName: user.Role.name,
      status: user.status,
      staff_id: user.staff_id,
    });
  } catch (e) {
    res.status(502).json({ message: e instanceof Error ? e.message : "Admin fetch failed" });
  }
}