import { useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Plus } from 'lucide-react'
import { Button } from './ui/button'
import { GoalPicker } from './ui/goal-picker'
import { Select } from './ui/select'
import type { GoalChoice } from './ui/goal-picker'
import { defaultGoalColor } from '../lib/workspace'
import type { Habit, Workspace } from '../lib/workspace'

export function HabitComposer({ workspace, setWorkspace, ready, onCreated }: { workspace: Workspace; setWorkspace: Dispatch<SetStateAction<Workspace>>; ready: boolean; onCreated: (goalId: string | null) => void }) {
  const [name, setName] = useState('')
  const [goal, setGoal] = useState<GoalChoice>({ id: '', name: 'Without a goal' })
  const [focused, setFocused] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [schedule, setSchedule] = useState<Habit['schedule']>('daily')
  const [target, setTarget] = useState(3)
  const input = useRef<HTMLInputElement>(null)
  const valid = ready && !!name.trim()
  return <>
    <form className="habit-composer" data-active={focused || pickerOpen || undefined} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }} onSubmit={event => {
      event.preventDefault()
      if (!valid) return
      const existing = goal.id === null ? workspace.goals.find(g => !g.archivedAt && g.name.toLowerCase() === goal.name.toLowerCase()) : workspace.goals.find(g => !g.archivedAt && g.id === goal.id)
      const goalId = existing?.id ?? (goal.id === null ? crypto.randomUUID() : null)
      if (goal.id && !existing) { setMessage('Choose an available goal.'); return }
      const habit: Habit = { id: crypto.randomUUID(), name: name.trim(), goalId, schedule, weekdays: [1, 2, 3, 4, 5], target, checkIns: [] }
      setWorkspace(w => ({ ...w, goals: goal.id === null && !existing ? [...w.goals, { id: goalId!, name: goal.name, color: defaultGoalColor }] : w.goals, habits: [...w.habits, habit] }))
      if (goalId) setGoal({ id: goalId, name: goal.name })
      setName(''); setMessage(`Added ${habit.name}.`); onCreated(goalId); input.current?.focus()
    }}>
      <Button type="submit" variant="ghost" className="composer-plus" disabled={!valid} aria-label="Add habit" title="Add habit"><Plus size={18} aria-hidden="true" /></Button>
      <input ref={input} className="habit-composer-input" aria-label="New habit" placeholder={goal.id === '' ? 'Add a habit…' : `Add a habit to "${goal.name}"`} maxLength={100} value={name} disabled={!ready} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.nativeEvent.isComposing) e.preventDefault() }} />
      <div className="habit-composer-options">
        <Select ariaLabel="Habit schedule" compact value={schedule} onValueChange={value => setSchedule(value as Habit['schedule'])} options={[{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }]} />
        {schedule === 'weekly' && <Select ariaLabel="Times per week" compact value={String(target)} onValueChange={value => setTarget(Number(value))} options={[1, 2, 3, 4, 5, 6, 7].map(count => ({ value: String(count), label: `${count} ${count === 1 ? 'time' : 'times'}` }))} />}
        <GoalPicker goals={workspace.goals} value={goal} onOpenChange={setPickerOpen} onChange={choice => { setGoal(choice); input.current?.focus() }} disabled={!ready} />
      </div>
    </form>
    <span className="sr-only" role="status">{message}</span>
  </>
}
