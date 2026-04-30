import type { Request, Response } from "express";
import { z } from "zod";
import { parse } from "../services/parser.service.js";
import { createSuper as createSuperInDb, listSupers as listSupersFromDb } from "../services/super.service.js";

const scrapeParamsSchema = z.object({
  superId: z.string().uuid()
});

const createSuperBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255, "Name is too long"),
  url: z.string().trim().url("A valid URL is required")
});

export async function listSupers(_req: Request, res: Response) {
  const supers = await listSupersFromDb();
  res.json(supers);
}

export async function launchSuperScraper(req: Request, res: Response) {
  const { superId } = scrapeParamsSchema.parse(req.params);
  await parse(superId);
  res.status(202).json({ message: "Scraper launched", superId });
}

export async function createSuper(req: Request, res: Response) {
  const payload = createSuperBodySchema.parse(req.body);
  const created = await createSuperInDb(payload);
  res.status(201).json(created);
}
