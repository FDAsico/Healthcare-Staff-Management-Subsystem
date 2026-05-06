import { Request, Response, NextFunction } from "express";

// Each subsystem gets its own key in your .env
const SUBSYSTEM_KEYS: Record<string, string> = {
  admin: process.env.SUBSYSTEM_API_KEY || "",
  patient: process.env.SUBSYSTEM_API_KEY || "",
  predictive: process.env.SUBSYSTEM_API_KEY || "",
  inventory: process.env.SUBSYSTEM_API_KEY || "",
  support: process.env.SUBSYSTEM_API_KEY || "",
  billing: process.env.SUBSYSTEM_API_KEY || "",
};

declare global {
  namespace Express {
    interface Request {
      subsystem?: string; // which subsystem is calling
    }
  }
}

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"] as string;
  
  if (!apiKey) {
    return res.status(401).json({ message: "API key required" });
  }

  // Find which subsystem this key belongs to
  const subsystem = Object.entries(SUBSYSTEM_KEYS).find(
    ([_, key]) => key === apiKey
  )?.[0];

  if (!subsystem) {
    return res.status(401).json({ message: "Invalid API key" });
  }

  req.subsystem = subsystem;
  next();
}