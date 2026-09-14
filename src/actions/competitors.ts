"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getDb } from "@/db"
import { competitorVisits } from "@/db/schema"
import { requireUser } from "@/lib/auth"
import { CompetitorVisitInput } from "./schemas"

const PATH = "/mystery-shop"

export async function addCompetitorVisit(formData: FormData): Promise<void> {
  await requireUser()
  const v = CompetitorVisitInput.parse(Object.fromEntries(formData))
  await getDb().insert(competitorVisits).values(v)
  revalidatePath(PATH)
}

export async function deleteCompetitorVisit(id: number): Promise<void> {
  await requireUser()
  await getDb().delete(competitorVisits).where(eq(competitorVisits.id, id))
  revalidatePath(PATH)
}
