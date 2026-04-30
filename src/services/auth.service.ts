import { Prisma, type User } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import type { PublicUser } from "../types/http.js";
import { ApiError } from "../utils/errors.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { createRefreshToken, hashToken, signAccessToken } from "../utils/token.js";

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt
  };
}

function getRefreshExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_IN_DAYS);
  return expiresAt;
}

async function issueTokenPair(user: User) {
  const publicUser = toPublicUser(user);
  const refreshToken = createRefreshToken();

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: getRefreshExpiry()
    }
  });

  return {
    user: publicUser,
    accessToken: signAccessToken(publicUser),
    refreshToken
  };
}

export async function registerUser(input: { email: string; password: string; name?: string }) {
  const email = input.email.toLowerCase().trim();

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: input.name?.trim() || null,
        passwordHash: await hashPassword(input.password)
      }
    });

    return issueTokenPair(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ApiError(409, "A user with this email already exists");
    }

    throw error;
  }
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase().trim() }
  });

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new ApiError(401, "Invalid email or password");
  }

  return issueTokenPair(user);
}

export async function refreshSession(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
    throw new ApiError(401, "Invalid refresh token");
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() }
  });

  return issueTokenPair(storedToken.user);
}

export async function revokeRefreshToken(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: {
      tokenHash: hashToken(refreshToken),
      revokedAt: null
    },
    data: { revokedAt: new Date() }
  });
}

export async function findPublicUserById(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ? toPublicUser(user) : null;
}
