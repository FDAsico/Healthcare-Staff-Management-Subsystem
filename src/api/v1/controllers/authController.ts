import { Request, Response } from "express";
import { prisma } from "../../../db.js";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/auth.js";

export async function register(req: Request, res: Response) {
  try {
    const { username, email, password, role = "STAFF" } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // Check existing
    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existing) {
      return res.status(409).json({ message: "Username or email already exists" });
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username, email, passwordHash, role },
      select: { user_id: true, username: true, email: true, role: true, createdAt: true },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.user_id, user.role);
    const refreshToken = generateRefreshToken(user.user_id);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        user_id: user.user_id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { lastLogin: new Date() },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.user_id, user.role);
    const refreshToken = generateRefreshToken(user.user_id);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        user_id: user.user_id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Error" });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    // Verify token exists and is valid
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    // Generate new access token
    const accessToken = generateAccessToken(stored.user.user_id, stored.user.role);

    res.json({
      accessToken,
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Error" });
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
        lastLogin: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Error" });
  }
}