import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Button } from './components/ui/button'
import {
  ArrowRight, ArrowUpRight, BarChart3, CalendarDays, Check,
  ChevronLeft, ChevronRight, CircleHelp, Compass, Flame, Goal, LayoutGrid,
  Menu, MoreHorizontal, Plus, Sparkles, Target, Trash2, X,
} from 'lucide-react'

type Page = 'today' | 'habits' | 'goals' | 'insights'
type Habit = { id: string; name: string; note: string; category: string; color: string; days: string[] }
type Aim = { id: string; name: string; note: string; target: number; current: number; unit: string; color: string; due: string }
type Store = { habits: Habit[]; goals: Aim[] }
type Dialog = 'habit' | 'goal' | null

const colors = ['#77958b', '#ce8d75', '#a28ab4', '#c7a86a', '#7b9aaa']
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const addDays = (date: Date, amount: number) => { const next = new Date(date); next.setDate(next.getDate() + amount); return next }
const todayKey = () => dateKey(new Date())
const sample: Store = {
  habits: [
    { id: 'h1', name: 'Morning pages', note: 'Write for 10 minutes', category: 'Mind', color: colors[0], days: [-6, -5, -4, -2, -1].map(n => dateKey(addDays(new Date(), n))) },
    { id: 'h2', name: 'Move my body', note: 'Any kind of movement counts', category: 'Health', color: colors[1], days: [-6, -4, -3, -2, -1].map(n => dateKey(addDays(new Date(), n))) },
    { id: 'h3', name: 'Read a little', note: 'At least 15 pages', category: 'Growth', color: colors[2], days: [-5, -4, -2].map(n => dateKey(addDays(new Date(), n))) },
    { id: 'h4', name: 'Evening reset', note: 'Clear my desk and plan tomorrow', category: 'Routine', color: colors[3], days: [-6, -5, -3, -2, -1].map(n => dateKey(addDays(new Date(), n))) },
  ],
  goals: [
    { id: 'g1', name: 'Read 12 books this year', note: 'One good book at a time', target: 12, current: 7, unit: 'books', color: colors[2], due: '' },
    { id: 'g2', name: 'Run 100 kilometers', note: 'Build distance steadily', target: 100, current: 64, unit: 'km', color: colors[0], due: '' },
  ],
}

const nav = [
  { id: 'today', label: 'Today', icon: LayoutGrid },
  { id: 'habits', label: 'Habits', icon: CalendarDays },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
] as const

function streak(days: string[]) {
  const completed = new Set(days)
  let date = new Date()
  if (!completed.has(dateKey(date))) date = addDays(date, -1)
  let count = 0
  while (completed.has(dateKey(date))) { count++; date = addDays(date, -1) }
  return count
}

function pct(goal: Aim) { return Math.min(100, Math.round(goal.current / Math.max(1, goal.target) * 100)) }
function formatDate(date: Date, options: Intl.DateTimeFormatOptions) { return new Intl.DateTimeFormat('en-US', options).format(date) }

export function OstinovaApp() {
  const [data, setData] = useState<Store>(sample)
  const [loaded, setLoaded] = useState(false)
  const [page, setPage] = useState<Page>('today')
  const [dialog, setDialog] = useState<Dialog>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const today = todayKey()
  const done = data.habits.filter(h => h.days.includes(today)).length
  const total = data.habits.length
  const completion = total ? Math.round(done / total * 100) : 0
  const week = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(new Date(), index - 6 + weekOffset * 7)), [weekOffset])
  const completedInPeriod = data.habits.reduce((sum, h) => sum + week.filter(d => h.days.includes(dateKey(d))).length, 0)
  const completedThisWeek = data.habits.reduce((sum, h) => sum + Array.from({ length: 7 }, (_, index) => dateKey(addDays(new Date(), index - 6))).filter(day => h.days.includes(day)).length, 0)
  const allTime = data.habits.reduce((sum, h) => sum + h.days.length, 0)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ostinova.v1')
      if (saved) {
        const parsed = JSON.parse(saved) as Store
        if (Array.isArray(parsed.habits) && Array.isArray(parsed.goals)) setData(parsed)
      }
    } catch { /* keep the starter data if storage is unavailable */ }
    setLoaded(true)
  }, [])
  useEffect(() => { if (loaded) localStorage.setItem('ostinova.v1', JSON.stringify(data)) }, [data, loaded])
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 3500)
    return () => clearTimeout(timer)
  }, [notice])

  const toggleDay = (id: string, day: string) => {
    setData(previous => ({ ...previous, habits: previous.habits.map(h => h.id === id ? { ...h, days: h.days.includes(day) ? h.days.filter(d => d !== day) : [...h.days, day] } : h) }))
  }
  const changeGoal = (id: string, delta: number) => {
    setData(previous => ({ ...previous, goals: previous.goals.map(g => g.id === id ? { ...g, current: Math.max(0, Math.min(g.target, g.current + delta)) } : g) }))
  }
  const remove = (kind: 'habit' | 'goal', id: string) => {
    setData(previous => ({ ...previous, [kind === 'habit' ? 'habits' : 'goals']: previous[kind === 'habit' ? 'habits' : 'goals'].filter(item => item.id !== id) }))
    setActiveMenu(null)
    setNotice(`${kind === 'habit' ? 'Habit' : 'Goal'} deleted`)
  }
  const openDialog = (kind: Dialog, id: string | null = null) => { setEditing(id); setDialog(kind); setActiveMenu(null) }
  const saveHabit = (habit: Habit) => {
    setData(previous => ({ ...previous, habits: editing ? previous.habits.map(h => h.id === editing ? habit : h) : [...previous.habits, habit] }))
    setDialog(null); setNotice(editing ? 'Habit updated' : 'Habit added')
  }
  const saveGoal = (goal: Aim) => {
    setData(previous => ({ ...previous, goals: editing ? previous.goals.map(g => g.id === editing ? goal : g) : [...previous.goals, goal] }))
    setDialog(null); setNotice(editing ? 'Goal updated' : 'Goal added')
  }
  const go = (destination: Page) => { setPage(destination); setMenuOpen(false); setActiveMenu(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const heading = page === 'today' ? 'A little progress, every day.' : page === 'habits' ? 'Your daily practice.' : page === 'goals' ? 'Keep the big picture close.' : 'See how far you’ve come.'
  const eyebrow = page === 'today' ? formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase() : `${page.toUpperCase()} / OSTINOVA`

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <div className="brand" aria-label="Ostinova"><span className="brand-mark"><span /><span /><span /><span /></span><span>ostinova<span className="brand-dot">.</span></span></div>
      <div className="sidebar-label">YOUR SPACE</div>
      <nav className="nav-list" aria-label="Main navigation">
        {nav.map(item => <button key={item.id} onClick={() => go(item.id)} className={`nav-item ${page === item.id ? 'active' : ''}`} aria-current={page === item.id ? 'page' : undefined}><item.icon size={19} strokeWidth={1.8} />{item.label}{page === item.id && <span className="nav-indicator" />}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note"><span className="note-spark"><Sparkles size={17} /></span><strong>Small steps add up.</strong><p>Make space for what matters, one day at a time.</p></div>
        <button className="help-link" onClick={() => setNotice('Your changes save automatically in this browser.')}><CircleHelp size={17} />How it works</button>
        <div className="profile"><div className="avatar">O</div><div><strong>My workspace</strong><span>Personal journal</span></div><MoreHorizontal size={18} /></div>
      </div>
    </aside>
    {menuOpen && <button className="mobile-overlay" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <main className="main">
      <header className="topbar"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={22} /></button><span className="breadcrumb">Workspace <span>/</span> <strong>{nav.find(n => n.id === page)?.label}</strong></span><div className="topbar-right"><span className="today-badge"><span /> YOUR OWN PACE</span><Button className="top-add" onClick={() => openDialog(page === 'goals' ? 'goal' : 'habit')}><Plus size={18} /> New {page === 'goals' ? 'goal' : 'habit'}</Button></div></header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{heading}</h1><p>{page === 'today' ? 'Today is another chance to show up for yourself.' : page === 'habits' ? 'The things you return to become part of who you are.' : page === 'goals' ? 'Give your plans a place to grow.' : 'A clearer view of the work you’ve already done.'}</p></div>{page !== 'today' && page !== 'insights' && <Button className="outline-add" onClick={() => openDialog(page === 'goals' ? 'goal' : 'habit')}><Plus size={17} /> Add {page === 'goals' ? 'goal' : 'habit'}</Button>}</div>

        {page === 'today' && <>
          <section className="hero-grid" aria-label="Today's overview"><div className="hero-card"><div className="hero-top"><span className="hero-overline"><span className="hero-sun">✳</span> TODAY'S FOCUS</span><span className="hero-date">{formatDate(new Date(), { month: 'short', day: 'numeric' })}</span></div><div className="hero-middle"><div><span className="hero-number">{String(done).padStart(2, '0')}<span> / {String(total).padStart(2, '0')}</span></span><h2>Habits completed</h2><p>{done === total && total > 0 ? 'You showed up for everything today.' : `You have ${total - done} ${total - done === 1 ? 'habit' : 'habits'} left to check in on.`}</p></div><div className="hero-orbit" aria-hidden="true"><div className="orbit-one"><div className="orbit-two"><div className="orbit-three"><span>✳</span></div></div></div></div></div><div className="hero-bottom"><div className="hero-track"><span style={{ width: `${completion}%` }} /></div><span>{completion}% COMPLETE</span></div></div>
          <div className="week-card"><div className="card-heading"><div><span className="section-kicker">THE RHYTHM</span><h2>{weekOffset === 0 ? 'Last 7 days' : 'Previous 7 days'}</h2></div><div className="week-controls"><button aria-label="Previous seven days" onClick={() => setWeekOffset(v => v - 1)}><ChevronLeft size={16} /></button><button aria-label="Next seven days" onClick={() => setWeekOffset(v => Math.min(0, v + 1))} disabled={weekOffset === 0}><ChevronRight size={16} /></button></div></div><p className="week-intro">Every mark is a moment you made time.</p><div className="week-days">{week.map(day => { const key = dateKey(day); const isToday = key === today; const count = data.habits.filter(h => h.days.includes(key)).length; return <div className={`week-day ${isToday ? 'is-today' : ''}`} key={key}><span>{formatDate(day, { weekday: 'short' }).slice(0, 2).toUpperCase()}</span><div className={`week-circle ${count ? 'has-progress' : ''}`} style={{ '--day-fill': `${total ? count / total * 100 : 0}%` } as CSSProperties}>{day.getDate()}</div><i className={count ? 'dot-filled' : ''} />{isToday && <span className="today-label">TODAY</span>}</div> })}</div><div className="week-footer"><span><strong>{completedInPeriod}</strong> check-ins in this period</span><ArrowUpRight size={17} /></div></div></section>
          <div className="section-title"><div><span className="section-kicker">ONE DAY AT A TIME</span><h2>Today’s habits <span className="count-pill">{done}/{total}</span></h2></div><button className="text-link" onClick={() => go('habits')}>View all habits <ArrowRight size={16} /></button></div>
          {data.habits.length ? <div className="habit-list">{data.habits.map(h => <HabitRow key={h.id} habit={h} checked={h.days.includes(today)} onToggle={() => toggleDay(h.id, today)} onEdit={() => openDialog('habit', h.id)} onDelete={() => remove('habit', h.id)} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />)}</div> : <Empty title="Start with one small habit" text="Add a habit you want to return to regularly." action="Add a habit" onClick={() => openDialog('habit')} />}
          <div className="section-title goal-section-title"><div><span className="section-kicker">LOOKING AHEAD</span><h2>Goals in motion</h2></div><button className="text-link" onClick={() => go('goals')}>See all goals <ArrowRight size={16} /></button></div>
          {data.goals.length ? <div className="goal-grid">{data.goals.slice(0, 2).map(g => <GoalCard key={g.id} goal={g} onUpdate={d => changeGoal(g.id, d)} onEdit={() => openDialog('goal', g.id)} onDelete={() => remove('goal', g.id)} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />)}</div> : <Empty title="Give yourself something to aim for" text="Set a goal and keep track of each step toward it." action="Add a goal" onClick={() => openDialog('goal')} />}
        </>}

        {page === 'habits' && <><div className="summary-strip"><Stat label="ACTIVE HABITS" value={String(total).padStart(2, '0')} icon={<Compass size={20} />} /><Stat label="DONE TODAY" value={String(done).padStart(2, '0')} icon={<Check size={20} />} /><Stat label="TOTAL CHECK-INS" value={String(allTime).padStart(2, '0')} icon={<Flame size={20} />} /></div><div className="section-title"><div><span className="section-kicker">YOUR PRACTICE</span><h2>All habits</h2></div></div>{data.habits.length ? <div className="habit-list">{data.habits.map(h => <HabitRow key={h.id} habit={h} checked={h.days.includes(today)} onToggle={() => toggleDay(h.id, today)} onEdit={() => openDialog('habit', h.id)} onDelete={() => remove('habit', h.id)} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />)}</div> : <Empty title="Start with one small habit" text="Add a habit you want to return to regularly." action="Add a habit" onClick={() => openDialog('habit')} />}</>}

        {page === 'goals' && <><div className="goals-banner"><div><span className="section-kicker">A NOTE TO YOURSELF</span><h2>Progress has its own pace.</h2><p>Keep your eyes on the direction, and give yourself credit for every step.</p></div><div className="banner-art" aria-hidden="true"><span /><span /><span /></div></div><div className="section-title"><div><span className="section-kicker">WHAT YOU’RE WORKING TOWARD</span><h2>All goals <span className="count-pill">{data.goals.length}</span></h2></div></div>{data.goals.length ? <div className="goal-grid full-goals">{data.goals.map(g => <GoalCard key={g.id} goal={g} onUpdate={d => changeGoal(g.id, d)} onEdit={() => openDialog('goal', g.id)} onDelete={() => remove('goal', g.id)} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />)}</div> : <Empty title="Give yourself something to aim for" text="Set a goal and keep track of each step toward it." action="Add a goal" onClick={() => openDialog('goal')} />}</>}

        {page === 'insights' && <><div className="summary-strip"><Stat label="TOTAL CHECK-INS" value={String(allTime).padStart(2, '0')} icon={<Check size={20} />} /><Stat label="THIS WEEK" value={String(completedThisWeek).padStart(2, '0')} icon={<CalendarDays size={20} />} /><Stat label="GOALS COMPLETED" value={String(data.goals.filter(g => g.current >= g.target).length).padStart(2, '0')} icon={<Goal size={20} />} /></div><div className="insight-grid"><div className="insight-card"><div className="card-heading"><div><span className="section-kicker">CONSISTENCY</span><h2>Habit by habit</h2></div><Flame size={20} /></div>{data.habits.length ? data.habits.map(h => <div className="insight-line" key={h.id}><span className="mini-swatch" style={{ background: h.color }} /><strong>{h.name}</strong><span>{streak(h.days)} day streak</span></div>) : <p className="muted">Add a habit to see your streaks here.</p>}</div><div className="insight-card"><div className="card-heading"><div><span className="section-kicker">GOAL PROGRESS</span><h2>Moving forward</h2></div><Target size={20} /></div>{data.goals.length ? data.goals.map(g => <div className="insight-goal" key={g.id}><div><strong>{g.name}</strong><span>{pct(g)}%</span></div><div className="progress-track"><span style={{ width: `${pct(g)}%`, background: g.color }} /></div></div>) : <p className="muted">Add a goal to see your progress here.</p>}</div></div></>}
        <footer className="footer"><span>OSTINOVA <span>✳</span> MAKE ROOM FOR WHAT MATTERS</span><span>Built for the days that make a life.</span></footer>
      </div>
    </main>
    {dialog === 'habit' && <HabitDialog initial={data.habits.find(h => h.id === editing)} onClose={() => setDialog(null)} onSave={saveHabit} />}
    {dialog === 'goal' && <GoalDialog initial={data.goals.find(g => g.id === editing)} onClose={() => setDialog(null)} onSave={saveGoal} />}
    {notice && <div className="toast" role="status"><Check size={17} />{notice}</div>}
  </div>
}

function Stat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) { return <div className="stat"><div className="stat-icon">{icon}</div><span>{label}</span><strong>{value}</strong></div> }
function Empty({ title, text, action, onClick }: { title: string; text: string; action: string; onClick: () => void }) { return <div className="empty"><div className="empty-icon"><Plus size={23} /></div><h3>{title}</h3><p>{text}</p><button onClick={onClick}><Plus size={16} />{action}</button></div> }

function ItemMenu({ onEdit, onDelete, id, activeMenu, setActiveMenu }: { onEdit: () => void; onDelete: () => void; id: string; activeMenu: string | null; setActiveMenu: (id: string | null) => void }) { return <div className="item-menu-wrap"><button className="item-menu-button" aria-label="More options" aria-expanded={activeMenu === id} onClick={() => setActiveMenu(activeMenu === id ? null : id)}><MoreHorizontal size={20} /></button>{activeMenu === id && <div className="item-menu"><button onClick={onEdit}>Edit</button><button className="delete-action" onClick={onDelete}><Trash2 size={15} />Delete</button></div>}</div> }

function HabitRow({ habit, checked, onToggle, onEdit, onDelete, activeMenu, setActiveMenu }: { habit: Habit; checked: boolean; onToggle: () => void; onEdit: () => void; onDelete: () => void; activeMenu: string | null; setActiveMenu: (id: string | null) => void }) {
  return <div className={`habit-row ${checked ? 'habit-done' : ''}`}><button className="check-button" onClick={onToggle} aria-label={`${checked ? 'Mark incomplete' : 'Complete'} ${habit.name}`} aria-pressed={checked}>{checked && <Check size={19} strokeWidth={2.6} />}</button><div className="habit-icon" style={{ background: `${habit.color}25`, color: habit.color }}><span>✳</span></div><div className="habit-copy"><strong>{habit.name}</strong><span>{habit.note || habit.category}</span></div><span className="habit-category">{habit.category}</span><span className="streak"><Flame size={15} /> {streak(habit.days)} days</span><ItemMenu id={habit.id} onEdit={onEdit} onDelete={onDelete} activeMenu={activeMenu} setActiveMenu={setActiveMenu} /></div>
}

function GoalCard({ goal, onUpdate, onEdit, onDelete, activeMenu, setActiveMenu }: { goal: Aim; onUpdate: (delta: number) => void; onEdit: () => void; onDelete: () => void; activeMenu: string | null; setActiveMenu: (id: string | null) => void }) {
  return <div className="goal-card"><div className="goal-card-top"><div className="goal-icon" style={{ background: `${goal.color}26`, color: goal.color }}><Target size={21} /></div><ItemMenu id={goal.id} onEdit={onEdit} onDelete={onDelete} activeMenu={activeMenu} setActiveMenu={setActiveMenu} /></div><h3>{goal.name}</h3><p>{goal.note || (goal.due ? `Due ${goal.due}` : 'Keep going at your own pace.')}</p><div className="goal-metrics"><strong>{goal.current} <span>/ {goal.target} {goal.unit}</span></strong><span>{pct(goal)}%</span></div><div className="progress-track"><span style={{ width: `${pct(goal)}%`, background: goal.color }} /></div><div className="goal-card-footer"><span>{goal.current >= goal.target ? 'Goal reached' : goal.due ? `Due ${formatDate(new Date(`${goal.due}T12:00:00`), { month: 'short', day: 'numeric' })}` : 'In progress'}</span><div className="stepper"><button aria-label={`Decrease ${goal.name}`} onClick={() => onUpdate(-1)} disabled={goal.current === 0}>−</button><button aria-label={`Increase ${goal.name}`} onClick={() => onUpdate(1)} disabled={goal.current >= goal.target}>+</button></div></div></div>
}

function DialogShell({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: ReactNode }) { return <div className="dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><div className="dialog" role="dialog" aria-modal="true" aria-label={title}><div className="dialog-head"><div><span className="section-kicker">OSTINOVA / YOUR SPACE</span><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-button" aria-label="Close" onClick={onClose}><X size={21} /></button></div>{children}</div></div> }

function HabitDialog({ initial, onClose, onSave }: { initial?: Habit; onClose: () => void; onSave: (habit: Habit) => void }) {
  const [name, setName] = useState(initial?.name || '')
  const [note, setNote] = useState(initial?.note || '')
  const [category, setCategory] = useState(initial?.category || 'Mind')
  const [color, setColor] = useState(initial?.color || colors[0])
  return <DialogShell title={initial ? 'Edit habit' : 'Add a habit'} subtitle="Choose something small enough to return to." onClose={onClose}><form onSubmit={event => { event.preventDefault(); if (name.trim()) onSave({ id: initial?.id || crypto.randomUUID(), name: name.trim(), note: note.trim(), category, color, days: initial?.days || [] }) }}><label>Habit name<input autoFocus required maxLength={60} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Take a short walk" /></label><label>A gentle reminder <span>(optional)</span><input maxLength={100} value={note} onChange={e => setNote(e.target.value)} placeholder="What counts as showing up?" /></label><label>Area<select value={category} onChange={e => setCategory(e.target.value)}><option>Mind</option><option>Health</option><option>Growth</option><option>Routine</option><option>Other</option></select></label><div className="form-label">Color</div><div className="color-options">{colors.map(option => <button type="button" key={option} className={color === option ? 'selected' : ''} style={{ background: option }} onClick={() => setColor(option)} aria-label={`Choose color ${option}`}>{color === option && <Check size={16} />}</button>)}</div><div className="dialog-actions"><button type="button" className="cancel" onClick={onClose}>Cancel</button><button type="submit" className="submit">{initial ? 'Save changes' : 'Add habit'} <ArrowRight size={17} /></button></div></form></DialogShell>
}

function GoalDialog({ initial, onClose, onSave }: { initial?: Aim; onClose: () => void; onSave: (goal: Aim) => void }) {
  const [name, setName] = useState(initial?.name || '')
  const [note, setNote] = useState(initial?.note || '')
  const [target, setTarget] = useState(String(initial?.target || 10))
  const [current, setCurrent] = useState(String(initial?.current || 0))
  const [unit, setUnit] = useState(initial?.unit || 'times')
  const [due, setDue] = useState(initial?.due || '')
  const [color, setColor] = useState(initial?.color || colors[2])
  return <DialogShell title={initial ? 'Edit goal' : 'Add a goal'} subtitle="Name what you’re moving toward." onClose={onClose}><form onSubmit={event => { event.preventDefault(); if (name.trim()) onSave({ id: initial?.id || crypto.randomUUID(), name: name.trim(), note: note.trim(), target: Math.max(1, Number(target) || 1), current: Math.max(0, Math.min(Number(current) || 0, Number(target) || 1)), unit: unit.trim() || 'times', color, due }) }}><label>Goal name<input autoFocus required maxLength={70} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Read 12 books" /></label><label>Why it matters <span>(optional)</span><input maxLength={100} value={note} onChange={e => setNote(e.target.value)} placeholder="A note to your future self" /></label><div className="form-grid"><label>Target<input type="number" required min="1" max="1000000" value={target} onChange={e => setTarget(e.target.value)} /></label><label>Unit<input required maxLength={20} value={unit} onChange={e => setUnit(e.target.value)} placeholder="books" /></label></div><div className="form-grid"><label>Current progress<input type="number" min="0" max="1000000" value={current} onChange={e => setCurrent(e.target.value)} /></label><label>Target date <span>(optional)</span><input type="date" value={due} onChange={e => setDue(e.target.value)} /></label></div><div className="form-label">Color</div><div className="color-options">{colors.map(option => <button type="button" key={option} className={color === option ? 'selected' : ''} style={{ background: option }} onClick={() => setColor(option)} aria-label={`Choose color ${option}`}>{color === option && <Check size={16} />}</button>)}</div><div className="dialog-actions"><button type="button" className="cancel" onClick={onClose}>Cancel</button><button type="submit" className="submit">{initial ? 'Save changes' : 'Add goal'} <ArrowRight size={17} /></button></div></form></DialogShell>
}
