import { prisma } from "../db/prisma.js";

export type PublicSuper = {
  id: string;
  name: string;
  url: string;
};

type SuperRecord = {
  id: string;
  name: string;
  url: string;
};

function toPublicSuper(superRecord: SuperRecord): PublicSuper {
  return {
    id: superRecord.id,
    name: superRecord.name,
    url: superRecord.url
  };
}

export async function listSupers() {
  const superRecords = await prisma.super.findMany({
    orderBy: { name: "asc" }
  });

  return superRecords.map(toPublicSuper);
}

export async function getSuperById(superId: string) {
  return prisma.super.findUnique({
    where: { id: superId }
  });
}

export async function createSuper(input: { name: string; url: string }) {
  const created = await prisma.super.create({
    data: {
      name: input.name.trim(),
      url: input.url.trim()
    }
  });

  return toPublicSuper(created);
}
