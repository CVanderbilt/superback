import crypto from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { PublicUser } from "../types/http.js";
import { env } from "../config/env.js";

type AccessTokenPayload = {
  sub: string;
  email: string;
  role: string;
};

const accessTokenOptions: SignOptions = {
  expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"]
};

export function signAccessToken(user: PublicUser) {
  const payload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, accessTokenOptions);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function createRefreshToken() {
  return crypto.randomBytes(48).toString("base64url");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
