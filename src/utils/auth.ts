import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(userId: string, role: string): string {
  return jwt.sign({ userId, role, type: "access" }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: "refresh" }, JWT_SECRET, {
    expiresIn: "30d",
  });
}

export function verifyAccessToken(token: string): { userId: string; role: string } {
  const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  if (decoded.type !== "access") throw new Error("Invalid token type");
  return { userId: decoded.userId, role: decoded.role };
}

export function verifyRefreshToken(token: string): { userId: string } {
  const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  if (decoded.type !== "refresh") throw new Error("Invalid token type");
  return { userId: decoded.userId };
}