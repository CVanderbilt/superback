import type { NextFunction, Request, Response } from "express";
import { findPublicUserById } from "../services/auth.service.js";
import { ApiError } from "../utils/errors.js";
import { verifyAccessToken } from "../utils/token.js";

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authorization = req.header("authorization");
    const [scheme, token] = authorization?.split(" ") ?? [];

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "Missing bearer token");
    }

    const payload = verifyAccessToken(token);
    const user = await findPublicUserById(payload.sub);

    if (!user) {
      throw new ApiError(401, "User no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Invalid access token"));
  }
}
