import { Request, Response, NextFunction } from "express";

export function validateCreateEmergencyContact(req: Request, res: Response, next: NextFunction) {
  const { staff_id, name, relationship, phone } = req.body;
  if (!staff_id) return res.status(400).json({ message: "Staff ID is required" });
  if (!name || name.trim() === "") return res.status(400).json({ message: "Name is required" });
  if (!relationship || relationship.trim() === "") {
    return res.status(400).json({ message: "Relationship is required" });
  }
  if (!phone || phone.trim() === "") return res.status(400).json({ message: "Phone is required" });
  next();
}

export default { validateCreateEmergencyContact };