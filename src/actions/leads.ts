"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getDb } from "@/db"
import { campaignDays, leads } from "@/db/schema"
import { requireUser } from "@/lib/auth"
import { CampaignDayInput, LeadInput, LeadStatusInput } from "./schemas"

const PATH = "/ads-test"

export async function addCampaignDay(formData: FormData): Promise<void> {
  await requireUser()
  const v = CampaignDayInput.parse(Object.fromEntries(formData))
  await getDb()
    .insert(campaignDays)
    .values(v)
    .onConflictDoUpdate({
      target: [campaignDays.campaignId, campaignDays.day],
      set: { spend: v.spend, impressions: v.impressions, clicks: v.clicks, notes: v.notes ?? null },
    })
  revalidatePath(PATH)
}

export async function deleteCampaignDay(id: number): Promise<void> {
  await requireUser()
  await getDb().delete(campaignDays).where(eq(campaignDays.id, id))
  revalidatePath(PATH)
}

export async function addLead(formData: FormData): Promise<void> {
  await requireUser()
  const v = LeadInput.parse(Object.fromEntries(formData))
  await getDb().insert(leads).values(v)
  revalidatePath(PATH)
}

export async function setLeadStatus(formData: FormData): Promise<void> {
  await requireUser()
  const v = LeadStatusInput.parse(Object.fromEntries(formData))
  await getDb().update(leads).set({ status: v.status, nextFollowUp: v.nextFollowUp ?? null }).where(eq(leads.id, v.id))
  revalidatePath(PATH)
}

export async function deleteLead(id: number): Promise<void> {
  await requireUser()
  await getDb().delete(leads).where(eq(leads.id, id))
  revalidatePath(PATH)
}
