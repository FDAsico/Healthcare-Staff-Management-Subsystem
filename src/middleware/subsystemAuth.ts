import { Request, Response, NextFunction } from "express";

export function requireSubsystem(...allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.subsystem) {
      return res.status(401).json({ message: "Subsystem not identified" });
    }
    if (!allowed.includes(req.subsystem)) {
      return res.status(403).json({
        message: `Endpoint restricted`,
      });
    }
    next();
  };
}