import { Router } from "express";
import { createSuper, launchSuperScraper, listSupers } from "../controllers/super.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

export const superRouter = Router();

superRouter.get("/", asyncHandler(listSupers));
superRouter.post("/", asyncHandler(authenticate), requireAdmin, asyncHandler(createSuper));
superRouter.post("/:superId/scrape", asyncHandler(launchSuperScraper));
