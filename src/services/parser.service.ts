import { ApiError } from "../utils/errors.js";
import { getSuperById } from "./super.service.js";

export async function parse(superId: string) {
  const superRecord = await getSuperById(superId);

  if (!superRecord) {
    throw new ApiError(404, "Super not found");
  }

  console.log(`Launching parser for super ${superRecord.name} (${superRecord.id})`);
}
