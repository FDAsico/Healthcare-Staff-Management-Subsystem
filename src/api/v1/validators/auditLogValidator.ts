import { Request, Response, NextFunction } from "express";

export function validateCreateAuditLog(req: Request, res: Response, next: NextFunction) {
  const { action, entity } = req.body;
  if (!action || action.trim() === "") {
    return res.status(400).json({ message: "Action is required" });
  }
  if (!entity || entity.trim() === "") {
    return res.status(400).json({ message: "Entity is required" });
  }
  next();
}

export default { validateCreateAuditLog };