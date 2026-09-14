import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Base = { label: string; name: string }

export function Field({ label, name, type = "text", placeholder, required, defaultValue, step, min }: Base & {
  type?: string; placeholder?: string; required?: boolean; defaultValue?: string | number; step?: string | number; min?: number
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name} className="text-xs text-muted-foreground">{label}</Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} required={required} defaultValue={defaultValue} step={step} min={min} />
    </div>
  )
}

// Native select keeps the form a plain server-rendered <form>; the shadcn Select needs client state.
export const nativeSelectClass =
  "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

export function SelectField({ label, name, options, defaultValue }: Base & { options: { value: string; label: string }[]; defaultValue?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name} className="text-xs text-muted-foreground">{label}</Label>
      <select id={name} name={name} defaultValue={defaultValue} className={nativeSelectClass}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

export function TextareaField({ label, name, placeholder }: Base & { placeholder?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name} className="text-xs text-muted-foreground">{label}</Label>
      <Textarea id={name} name={name} placeholder={placeholder} rows={2} />
    </div>
  )
}
