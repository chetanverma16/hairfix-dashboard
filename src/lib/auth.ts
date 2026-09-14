// Phase 1: Vercel Authentication gates every request, so the only user is the owner.
// Phase 2 replaces this with a real session lookup. Every Server Action calls it first.
export type User = { id: string; name: string; role: "owner" | "manager" }

export async function requireUser(): Promise<User> {
  return { id: "owner", name: "Chetan", role: "owner" }
}
