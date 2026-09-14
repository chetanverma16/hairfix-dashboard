import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DeleteButton({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action}>
      <Button type="submit" variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" aria-label="Delete">
        <Trash2 className="size-3.5" />
      </Button>
    </form>
  )
}
