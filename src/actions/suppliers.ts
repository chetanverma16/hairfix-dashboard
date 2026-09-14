"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getDb } from "@/db"
import { supplierSamples } from "@/db/schema"
import { requireUser } from "@/lib/auth"
import { SampleVerdictInput, SupplierSampleInput } from "./schemas"

const PATH = "/samples"

export async function addSample(formData: FormData): Promise<void> {
  await requireUser()
  const v = SupplierSampleInput.parse(Object.fromEntries(formData))
  await getDb().insert(supplierSamples).values(v)
  revalidatePath(PATH)
}

export async function setSampleVerdict(formData: FormData): Promise<void> {
  await requireUser()
  const v = SampleVerdictInput.parse(Object.fromEntries(formData))
  await getDb()
    .update(supplierSamples)
    .set({ verdict: v.verdict, wearTestDays: v.wearTestDays ?? null, receivedOn: v.receivedOn ?? null })
    .where(eq(supplierSamples.id, v.id))
  revalidatePath(PATH)
}

export async function deleteSample(id: number): Promise<void> {
  await requireUser()
  await getDb().delete(supplierSamples).where(eq(supplierSamples.id, id))
  revalidatePath(PATH)
}
