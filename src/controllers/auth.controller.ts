import type { Request, Response } from "express";
import { z } from "zod";
import {
  loginUser,
  refreshSession,
  registerUser,
  revokeRefreshToken
} from "../services/auth.service.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

export async function register(req: Request, res: Response) {
  const result = await registerUser(registerSchema.parse(req.body));
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const result = await loginUser(loginSchema.parse(req.body));
  res.json(result);
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = refreshSchema.parse(req.body);
  const result = await refreshSession(refreshToken);
  res.json(result);
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = refreshSchema.parse(req.body);
  await revokeRefreshToken(refreshToken);
  res.status(204).send();
}

export function me(req: Request, res: Response) {
  res.json({ user: req.user });
}
