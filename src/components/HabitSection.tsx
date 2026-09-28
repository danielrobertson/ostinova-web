import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Dispatch, SetStateAction } from 'react'
import { Archive, Check, ChevronRight, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Select } from './ui/select'
import { HabitDatePicker } from './ui/habit-date-picker'
import { HabitComposer } from './HabitComposer'
import { dateKey, isDue, toggleHabit, weeklyCount } from '../lib/workspace'
import type { Habit, Workspace } from '../lib/workspace'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
function scheduleLabel(h: Habit) {
  return h.schedule === 'daily' ? 'Daily' : h.schedule === 'weekly' ? `${h.target} ${h.target === 1 ? 'time' : 'times'} per week` : h.weekdays.map(d => weekdays[d]).join(', ')
}
export function HabitSection({ workspace, setWorkspace, goalId, now, ready, onCheck }: {
  workspace: Workspace; setWorkspace: Dispatch<SetStateAction<Workspace>>; goalId?: string; now: number; ready: boolean; onCheck: () => void
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [assignedGoal, setAssignedGoal] = useState('')
  const [schedule, setSchedule] = useState<Habit['schedule']>('daily')
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [target, setTarget] = useState(3)
  const actualToday = new Date(now)
  const date = selectedDate ?? actualToday
  const today = dateKey(date)
  const isToday = today === dateKey(actualToday)
  const dateLabel = isToday ? 'today' : date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
  const headerActions = !goalId && typeof document !== 'undefined' ? document.getElementById('workspace-header-actions') : null
  const habits = workspace.habits.filter(h => !h.archivedAt && (goalId ? h.goalId === goalId : (now && (isDue(h, date) || h.checkIns.includes(today)))))
  function edit(h?: Habit) {
    setEditing(h?.id ?? null); setName(h?.name ?? ''); setAssignedGoal(h ? h.goalId ?? '' : goalId ?? '')
    setSchedule(h?.schedule ?? 'daily'); setDays(h?.weekdays ?? [1, 2, 3, 4, 5]); setTarget(h?.target ?? 3); setOpen(true)
  }
  return <section className="habits-section" aria-label="Repeating habits">
    <div className="section-heading">
      {goalId && <h2>Habits <span>{habits.length}</span></h2>}
      {goalId && <div className="flex items-center gap-2"><Button variant="ghost" disabled={!ready} onClick={() => edit()}><Plus size={14} />Add habit</Button></div>}
    </div>
    {!goalId && headerActions && createPortal(<HabitDatePicker date={date} today={actualToday} disabled={!ready || !now} onChange={value => setSelectedDate(dateKey(value) === dateKey(actualToday) ? null : value)} />, headerActions)}
    {!goalId && <HabitComposer workspace={workspace} setWorkspace={setWorkspace} ready={ready} onCreated={id => {
      setCollapsed(previous => { const next = new Set(previous); next.delete(id ?? 'standalone'); return next })
      setSelectedDate(null)
    }} />}
    {open && <form className="habit-form" onSubmit={e => {
      e.preventDefault()
      if (!name.trim() || assignedGoal !== '' && !workspace.goals.some(g => g.id === assignedGoal && !g.archivedAt) || schedule === 'days' && !days.length) return
      setWorkspace(w => {
        const habit: Habit = { id: editing ?? crypto.randomUUID(), goalId: assignedGoal || null, name: name.trim(), schedule, weekdays: [...days].sort(), target, checkIns: w.habits.find(h => h.id === editing)?.checkIns ?? [] }
        return { ...w, habits: editing ? w.habits.map(h => h.id === editing ? habit : h) : [...w.habits, habit] }
      })
      setOpen(false)
    }}>
      <h3>{editing ? 'Edit habit' : 'New habit'}</h3>
      <label>Habit name<input autoFocus required maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Practice piano for 15 minutes" /></label>
      <div className="habit-form-columns"><div className="habit-field"><label htmlFor="habit-goal">Goal <span className="field-optional">optional</span></label><Select id="habit-goal" value={assignedGoal} onValueChange={setAssignedGoal} options={[{ value: '', label: 'Without a goal' }, ...workspace.goals.filter(g => !g.archivedAt).map(g => ({ value: g.id, label: g.name }))]} /></div>
      <div className="habit-field"><label htmlFor="habit-repeat">Repeat</label><Select id="habit-repeat" value={schedule} onValueChange={value => setSchedule(value as Habit['schedule'])} options={[{ value: 'daily', label: 'Daily' }, { value: 'days', label: 'Selected weekdays' }, { value: 'weekly', label: 'Times per week' }]} /></div></div>
      {schedule === 'days' && <fieldset><legend>Repeat on</legend><div className="weekday-options">{weekdays.map((day, i) => <button key={day} type="button" aria-pressed={days.includes(i)} onClick={() => setDays(previous => previous.includes(i) ? previous.filter(d => d !== i) : [...previous, i])}>{day}</button>)}</div>{!days.length && <p role="status">Choose at least one day.</p>}</fieldset>}
      {schedule === 'weekly' && <div className="habit-field"><label htmlFor="habit-target">Days each week</label><Select id="habit-target" value={String(target)} onValueChange={value => setTarget(Number(value))} options={[1, 2, 3, 4, 5, 6, 7].map(n => ({ value: String(n), label: String(n) }))} /><small>Check in once per day. The week starts on Monday.</small></div>}
      <div className="dialog-actions"><Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={!ready || !name.trim() || schedule === 'days' && !days.length}>{editing ? 'Save habit' : 'Create habit'}</Button></div>
    </form>}
    {(goalId ? workspace.goals.filter(g => g.id === goalId) : [...workspace.goals, { id: null, name: 'Without a goal', color: undefined }]).map(group => {
      const grouped = habits.filter(h => h.goalId === group.id)
      if (!grouped.length) return null
      const groupKey = group.id ?? 'standalone'
      const expanded = !collapsed.has(groupKey)
      const panelId = `habit-group-${groupKey}`
      return <div className="habit-group" key={groupKey}>
        <h3 className="habit-group-heading"><button className="habit-group-toggle" aria-expanded={expanded} aria-controls={panelId} onClick={() => setCollapsed(previous => {
          const next = new Set(previous)
          if (next.has(groupKey)) next.delete(groupKey); else next.add(groupKey)
          return next
        })}>
          <ChevronRight size={15} className="habit-group-chevron" />
          {group.color && <span className="goal-dot" style={{ background: group.color }} />}
          <span className="habit-group-name">{group.name}</span><span className="habit-group-count">{grouped.length}</span>
        </button></h3>
        <div id={panelId} hidden={!expanded}>
          {grouped.map(h => {
            const checked = h.checkIns.includes(today), due = !!now && isDue(h, date)
            return <div className={`habit-row ${checked ? 'is-checked' : ''}`} key={h.id}>
              <button className={`task-checkbox ${checked ? 'checked' : ''}`} aria-label={`${checked ? 'Undo' : 'Complete'} ${h.name} ${dateLabel}`} aria-pressed={checked} disabled={!ready || !now || !checked && !due} onClick={() => { setWorkspace(w => toggleHabit(w, h.id, date)); if (!checked) onCheck() }}>{checked && <Check size={12} />}</button>
              <span className="habit-name">{h.name}</span>
              <span className="habit-schedule">{h.schedule === 'weekly' ? `${weeklyCount(h, date)}/${h.target} ${h.target === 1 ? 'time' : 'times'} ${isToday ? 'this' : 'that'} week` : scheduleLabel(h)}{!due && !checked ? ` · Not scheduled ${dateLabel}` : ''}</span>
              <button className="icon-button habit-edit row-action" aria-label={`Archive ${h.name}`} title="Archive habit" disabled={!ready} onClick={() => setWorkspace(w => ({ ...w, habits: w.habits.map(item => item.id === h.id ? { ...item, archivedAt: new Date().toISOString() } : item) }))}><Archive size={14} /></button>
            </div>
          })}
        </div>
      </div>
    })}
    {!habits.length && <p className="habit-empty">{workspace.habits.some(h => !h.archivedAt && (!goalId || h.goalId === goalId)) ? `No habits scheduled for ${dateLabel}.` : 'Add a habit, on its own or linked to a goal.'}</p>}
    {!goalId && workspace.habits.some(h => h.archivedAt) && <details className="mt-8 text-muted-foreground"><summary className="cursor-pointer text-xs">Archived habits ({workspace.habits.filter(h => h.archivedAt).length})</summary>{workspace.habits.filter(h => h.archivedAt).map(h => <div key={h.id} className="flex items-center gap-3 border-b border-border py-3"><span className="min-w-0 flex-1 break-words text-left text-sm">{h.name}</span><Button variant="ghost" size="sm" disabled={!ready} onClick={() => setWorkspace(w => ({ ...w, habits: w.habits.map(item => item.id === h.id ? { ...item, archivedAt: undefined } : item) }))}>Restore</Button></div>)}</details>}
  </section>
}
