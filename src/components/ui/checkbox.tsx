import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { Check } from 'lucide-react'

export function Checkbox({ className = '', ...props }: CheckboxPrimitive.Root.Props) {
  return <CheckboxPrimitive.Root data-slot="checkbox" className={`todo-checkbox ${className}`} {...props}>
    <CheckboxPrimitive.Indicator className="todo-check-indicator"><Check size={12} strokeWidth={2.5} /></CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
}
