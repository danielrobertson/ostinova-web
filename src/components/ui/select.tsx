import { Select as SelectPrimitive } from '@base-ui/react/select'
import { Check, ChevronDown } from 'lucide-react'

type SelectOption = { value: string; label: string }

export function Select({ id, value, onValueChange, options, ariaLabel, compact = false }: {
  id?: string
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  ariaLabel?: string
  compact?: boolean
}) {
  return <SelectPrimitive.Root items={options} value={value} onValueChange={next => onValueChange(next ?? '')}>
    <SelectPrimitive.Trigger id={id} aria-label={ariaLabel} className={`flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background text-left text-foreground outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 data-[popup-open]:border-ring data-[popup-open]:ring-2 data-[popup-open]:ring-ring/50 ${compact ? 'h-8 min-w-24 px-2 text-xs' : 'h-10 px-3 text-sm'}`}>
      <SelectPrimitive.Value className="min-w-0 truncate" />
      <SelectPrimitive.Icon className="shrink-0 text-muted-foreground"><ChevronDown size={15} /></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner sideOffset={4} alignItemWithTrigger={false} className="z-50 max-h-[min(18rem,var(--available-height))] w-[var(--anchor-width)] min-w-40">
        <SelectPrimitive.Popup className="overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none">
          <SelectPrimitive.List className="max-h-64 overflow-y-auto">
            {options.map(option => <SelectPrimitive.Item key={option.value} value={option.value} className="relative flex min-h-9 cursor-default items-center rounded-sm py-2 pr-8 pl-2.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground">
              <SelectPrimitive.ItemText className="min-w-0 truncate">{option.label}</SelectPrimitive.ItemText>
              <SelectPrimitive.ItemIndicator className="absolute right-2 text-primary"><Check size={14} /></SelectPrimitive.ItemIndicator>
            </SelectPrimitive.Item>)}
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  </SelectPrimitive.Root>
}
