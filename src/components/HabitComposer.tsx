import { useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Plus } from 'lucide-react'
import { Button } from './ui/button'
import { HabitSchedulePicker } from './ui/habit-schedule-picker'
import type { Habit, Workspace } from '../lib/workspace'

export function HabitComposer({ setWorkspace, ready, onCreated }: { setWorkspace: Dispatch<SetStateAction<Workspace>>; ready: boolean; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [focused, setFocused] = useState(false)
  const [message, setMessage] = useState('')
  const [schedule, setSchedule] = useState<Habit['schedule']>('daily')
  const [target, setTarget] = useState(3)
  const [weekdays, setWeekdays] = useState([1, 2, 3, 4, 5])
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const valid = ready && !!name.trim()
  return <>
    <form className="habit-composer" data-active={focused || scheduleOpen || undefined} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }} onSubmit={event => {
      event.preventDefault()
      if (!valid) return
      const habit: Habit = { id: crypto.randomUUID(), name: name.trim(), schedule, weekdays, target, checkIns: [] }
      setWorkspace(w => ({ ...w, habits: [...w.habits, habit] }))
      setName(''); setMessage(`Added ${habit.name}.`); onCreated(); input.current?.focus()
    }}>
      <Button type="submit" variant="ghost" className="composer-plus" disabled={!valid} aria-label="Add habit" title="Add habit"><Plus size={18} aria-hidden="true" /></Button>
      <input ref={input} className="habit-composer-input" aria-label="New habit" placeholder="Add a habit…" maxLength={100} value={name} disabled={!ready} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.nativeEvent.isComposing) e.preventDefault() }} />
      <div className="habit-composer-options">
        <HabitSchedulePicker value={{ schedule, target, weekdays }} disabled={!ready} onOpenChange={setScheduleOpen} onChange={value => { setSchedule(value.schedule); setTarget(value.target); setWeekdays(value.weekdays) }} />
      </div>
    </form>
    <span className="sr-only" role="status">{message}</span>
  </>
}
