import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logAction } from "../utils/auditLogger.js";

const JWT_SECRET = process.env.JWT_SECRET || "";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: string };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access token required" });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // Admin uses user_id (snake_case), we use userId
    const userId = decoded.user_id || decoded.userId;
    if (!userId || !decoded.role) {
      // Log failed authentication
      logAction({
        action: "FAILED_LOGIN",
        entity: "AUTH",
        newValue: { error: "Invalid token payload" },
        ipAddress: req.ip || req.connection?.remoteAddress,
      });
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = { userId, role: decoded.role };
    next();
  } catch {
    // Log failed authentication
    logAction({
      action: "FAILED_LOGIN",
      entity: "AUTH",
      newValue: { error: "Invalid or expired token" },
      ipAddress: req.ip || req.connection?.remoteAddress,
    });
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function authorize(roles?: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Authentication required" });
    if (roles && roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}