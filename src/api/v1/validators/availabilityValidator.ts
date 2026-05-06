import { Request, Response, NextFunction } from "express";

export function validateUpsertAvailability(req: Request, res: Response, next: NextFunction) {
  const { isAvailable } = req.body;
  if (isAvailable !== undefined && typeof isAvailable !== "boolean") {
    return res.status(400).json({ message: "isAvailable must be a boolean" });
  }
  next();
}

export default { validateUpsertAvailability };