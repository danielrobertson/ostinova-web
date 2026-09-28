import { useRef, useState } from 'react'
import { Popover } from '@base-ui/react/popover'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { dateKey } from '../../lib/workspace'

export function HabitDatePicker({ date, today, onChange, disabled }: { date: Date; today: Date; onChange: (date: Date) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(date)
  const [cursor, setCursor] = useState(dateKey(date))
  const calendar = useRef<HTMLDivElement>(null)
  const currentKey = dateKey(today), selectedKey = dateKey(date)
  const label = selectedKey === currentKey ? 'Today' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(date.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}) })
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = new Date(first); start.setDate(1 - (first.getDay() + 6) % 7)
  const dates = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  function select(value: Date) { onChange(value); setOpen(false) }
  function move(value: Date, key: string) {
    const next = new Date(value)
    if (key === 'ArrowLeft') next.setDate(next.getDate() - 1)
    else if (key === 'ArrowRight') next.setDate(next.getDate() + 1)
    else if (key === 'ArrowUp') next.setDate(next.getDate() - 7)
    else if (key === 'ArrowDown') next.setDate(next.getDate() + 7)
    else if (key === 'Home') next.setDate(next.getDate() - (next.getDay() + 6) % 7)
    else if (key === 'End') next.setDate(next.getDate() + 6 - (next.getDay() + 6) % 7)
    else return
    if (dateKey(next) > currentKey) return
    setMonth(next); setCursor(dateKey(next))
    requestAnimationFrame(() => calendar.current?.querySelector<HTMLButtonElement>(`[data-date="${dateKey(next)}"]`)?.focus())
  }
  return <Popover.Root open={open} onOpenChange={value => { setOpen(value); if (value) { setMonth(date); setCursor(selectedKey) } }}>
    <Popover.Trigger render={<Button variant="ghost" />} disabled={disabled} aria-label={`Choose habit date: ${label}`}><CalendarDays size={15} />{label}</Popover.Trigger>
    <Popover.Portal><Popover.Positioner align="end" sideOffset={8} className="z-50"><Popover.Popup className="habit-calendar" initialFocus={() => calendar.current?.querySelector<HTMLButtonElement>(`[data-date="${selectedKey}"]`)}>
      <div className="calendar-heading"><Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => { const next = new Date(month.getFullYear(), month.getMonth() - 1, 1); setMonth(next); setCursor(dateKey(next)) }}><ChevronLeft size={16} /></Button><Popover.Title>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Popover.Title><Button variant="ghost" size="icon" aria-label="Next month" disabled={month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth()} onClick={() => { const next = new Date(month.getFullYear(), month.getMonth() + 1, 1); setMonth(next); setCursor(dateKey(next)) }}><ChevronRight size={16} /></Button></div>
      <div className="calendar-weekdays" aria-hidden="true">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => <span key={i}>{day}</span>)}</div>
      <div ref={calendar} className="calendar-days" role="group" aria-label="Choose a date">{dates.map(value => {
        const key = dateKey(value)
        return <Button key={key} variant="ghost" className="calendar-day" data-date={key} data-outside={value.getMonth() !== month.getMonth() || undefined} aria-label={value.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} aria-pressed={key === selectedKey} aria-current={key === currentKey ? 'date' : undefined} disabled={key > currentKey} tabIndex={key === cursor ? 0 : -1} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) { event.preventDefault(); move(value, event.key) } }} onClick={() => select(value)}>{value.getDate()}</Button>
      })}</div>
      <div className="calendar-shortcuts"><Button variant="ghost" onClick={() => { const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1); select(yesterday) }}>Yesterday</Button><Button variant="ghost" onClick={() => select(today)}>Today</Button></div>
    </Popover.Popup></Popover.Positioner></Popover.Portal>
  </Popover.Root>
}
