import { useId, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu'
import { NumberField } from '@base-ui/react/number-field'
import { Toggle } from '@base-ui/react/toggle'
import { ChevronDown, Minus, Plus } from 'lucide-react'
import { Button } from './button'
import type { Habit } from '../../lib/workspace'

type Schedule = Pick<Habit, 'schedule' | 'target' | 'weekdays'>
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const options: { value: Habit['schedule']; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'daily-count', label: 'Times per day' },
  { value: 'weekly-count', label: 'Times per week' },
  { value: 'total', label: 'Total completions' },
  { value: 'days', label: 'Selected weekdays' },
  { value: 'weekly', label: 'Days per week' },
]
export function scheduleLabel(h: Schedule) {
  switch (h.schedule) {
    case 'daily': return 'Daily'
    case 'daily-count': return `${h.target}× per day`
    case 'weekly-count': return `${h.target}× per week`
    case 'total': return `${h.target} completions`
    case 'weekly': return `${h.target} ${h.target === 1 ? 'day' : 'days'} per week`
    case 'days': return h.weekdays.length === 7 ? 'Every day' : h.weekdays.map(d => days[d]).join(', ')
  }
}
export function HabitSchedulePicker({ value, onChange, disabled, onOpenChange }: { value: Schedule; onChange: (value: Schedule) => void; disabled?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const counted = !['daily', 'days'].includes(value.schedule)
  return <DropdownMenu open={open} onOpenChange={next => { setOpen(next); onOpenChange?.(next) }}>
    <DropdownMenuTrigger disabled={disabled} className="habit-schedule-trigger" aria-label={`Habit schedule: ${scheduleLabel(value)}`}>
      <span>{scheduleLabel(value)}</span><ChevronDown size={13} aria-hidden="true" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" sideOffset={8} className="w-64 max-w-[calc(100vw-24px)]">
      <DropdownMenuGroup><DropdownMenuLabel>Repeat</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={value.schedule} onValueChange={schedule => onChange({ ...value, schedule: schedule as Habit['schedule'], target: ['weekly', 'daily', 'days'].includes(schedule) ? Math.min(value.target, 7) : value.target })}>
        {options.map(option => <DropdownMenuRadioItem key={option.value} value={option.value} closeOnClick={false}>{option.label}</DropdownMenuRadioItem>)}
      </DropdownMenuRadioGroup></DropdownMenuGroup>
      {(counted || value.schedule === 'days') && <DropdownMenuSeparator />}
      {counted && <div className="schedule-detail">
        <label id={id}>{value.schedule === 'total' ? 'Completion target' : value.schedule === 'weekly' ? 'Days each week' : value.schedule === 'weekly-count' ? 'Completions each week' : 'Completions each day'}</label>
        <NumberField.Root value={value.target} min={1} max={value.schedule === 'weekly' ? 7 : 9999} step={1} onValueChange={number => { if (number !== null && Number.isInteger(number)) onChange({ ...value, target: number }) }}>
          <NumberField.Group className="schedule-number" onKeyDown={event => { event.stopPropagation(); if (event.key === 'Enter') { event.preventDefault(); setOpen(false); onOpenChange?.(false) } }}><NumberField.Decrement aria-label="Decrease target"><Minus size={14} /></NumberField.Decrement><NumberField.Input aria-labelledby={id} /><NumberField.Increment aria-label="Increase target"><Plus size={14} /></NumberField.Increment></NumberField.Group>
        </NumberField.Root>
        <p>{value.schedule === 'total' ? 'Finishes when you reach your target.' : value.schedule === 'weekly' ? 'One check-in per day. Weeks start Monday.' : value.schedule === 'weekly-count' ? 'Every completion counts. Weeks start Monday.' : 'Every completion counts. Starts fresh each day.'}</p>
      </div>}
      {value.schedule === 'days' && <div className="schedule-detail"><div className="schedule-weekdays" role="group" aria-label="Repeat on">{[1, 2, 3, 4, 5, 6, 0].map(day => <Toggle key={day} pressed={value.weekdays.includes(day)} disabled={value.weekdays.length === 1 && value.weekdays.includes(day)} onPressedChange={pressed => onChange({ ...value, weekdays: pressed ? [...value.weekdays, day].sort() : value.weekdays.filter(d => d !== day) })}>{days[day]}</Toggle>)}</div></div>}
      <Button variant="ghost" className="schedule-done" onClick={() => { setOpen(false); onOpenChange?.(false) }}>Done</Button>
    </DropdownMenuContent>
  </DropdownMenu>
}
