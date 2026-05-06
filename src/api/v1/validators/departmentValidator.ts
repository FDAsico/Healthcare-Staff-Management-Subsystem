import { Request, Response, NextFunction } from "express";

export function validateCreateDepartment(req: Request, res: Response, next: NextFunction) {
  const { name } = req.body;
  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Department name is required" });
  }
  next();
}

export function validateUpdateDepartment(req: Request, res: Response, next: NextFunction) {
  const { name, isActive } = req.body;
  if (name !== undefined && name.trim() === "") {
    return res.status(400).json({ message: "Department name cannot be empty" });
  }
  if (isActive !== undefined && typeof isActive !== "boolean") {
    return res.status(400).json({ message: "isActive must be a boolean" });
  }
  next();
}

export default {
  validateCreateDepartment,
  validateUpdateDepartment,
};