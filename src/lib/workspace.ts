export type Habit = { id: string; goalId: string | null; name: string; schedule: 'daily' | 'days' | 'weekly' | 'daily-count' | 'weekly-count' | 'total'; weekdays: number[]; target: number; checkIns: string[]; archivedAt?: string }
export type Goal = { id: string; name: string; color: string; archivedAt?: string }
export type Session = { id: string; goalId: string; startedAt: string; finishedAt: string; summary: string; openLoops: string; nextStep: string }
export type Breadcrumb = { id: string; goalId: string; sessionId?: string; text: string; completedAt: string | null }
export type Todo = { id: string; text: string; createdAt: string; completedAt: string | null }
export type Workspace = { version: 3; todos?: Todo[]; goals: Goal[]; habits: Habit[]; sessions: Session[]; breadcrumbs: Breadcrumb[]; active: { goalId: string; startedAt: string; breadcrumbId?: string } | null }
export const storageKey = 'ostinova.goals.v3'
export const defaultGoalColor = '#155dfb'
export const initialWorkspace: Workspace = {
  version: 3,
  todos: [],
  goals: [ { id: 'app', name: 'Build my app', color: defaultGoalColor }, { id: 'writing', name: 'Short stories', color: '#c6a676' }, { id: 'music', name: 'Learn piano', color: '#82b5a0' } ],
  habits: [],
  sessions: [],
  breadcrumbs: [ { id: 'b1', goalId: 'app', text: 'Sketch the first screen', completedAt: null }, { id: 'b2', goalId: 'writing', text: 'Write the opening scene', completedAt: null }, { id: 'b3', goalId: 'music', text: 'Practice the left-hand pattern', completedAt: null } ],
  active: null,
}
export function isWorkspace(value: unknown): value is Workspace {
  if (!value || typeof value !== 'object') return false
  const w = value as Workspace
  if (w.version !== 3 || !Array.isArray(w.habits) || !Array.isArray(w.goals) || !Array.isArray(w.sessions) || !Array.isArray(w.breadcrumbs)) return false
  const text = (v: unknown) => typeof v === 'string'
  const date = (v: unknown) => text(v) && Number.isFinite(Date.parse(v as string))
  if (!w.goals.every(p => p && text(p.id) && text(p.name) && (p.archivedAt === undefined || date(p.archivedAt)) && /^#[0-9a-f]{6}$/i.test(p.color))) return false
  if (w.todos !== undefined && (!Array.isArray(w.todos) || !w.todos.every(t => t && text(t.id) && text(t.text) && t.text.trim().length > 0 && t.text.length <= 500 && date(t.createdAt) && (t.completedAt === null || date(t.completedAt))))) return false
  const goal = (id: string) => w.goals.some(p => p.id === id)
  return w.habits.every(h => h && text(h.id) && (h.goalId === null || goal(h.goalId)) && text(h.name) && (h.archivedAt === undefined || date(h.archivedAt)) && ['daily', 'days', 'weekly', 'daily-count', 'weekly-count', 'total'].includes(h.schedule) && Array.isArray(h.weekdays) && h.weekdays.every(d => Number.isInteger(d) && d >= 0 && d <= 6) && (h.schedule !== 'days' || h.weekdays.length > 0) && Number.isInteger(h.target) && h.target >= 1 && h.target <= (isCountHabit(h) ? 9999 : 7) && Array.isArray(h.checkIns) && h.checkIns.every(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))) && w.sessions.every(s => s && text(s.id) && goal(s.goalId) && date(s.startedAt) && date(s.finishedAt) && text(s.summary) && text(s.openLoops) && text(s.nextStep)) &&
    w.breadcrumbs.every(b => b && text(b.id) && goal(b.goalId) && text(b.text) && (b.completedAt === null || date(b.completedAt))) &&
    (w.active === null || !!w.active && goal(w.active.goalId) && date(w.active.startedAt))
}
// The old prototype used this purple for every newly created goal. No color picker
// existed, so only this known default is updated; other goal colors are retained.
export function normalizeDefaultGoalColor(w: Workspace): Workspace {
  if (!w.goals.some(g => g.color.toLowerCase() === '#8b9cf7')) return w
  return { ...w, goals: w.goals.map(g => g.color.toLowerCase() === '#8b9cf7' ? { ...g, color: defaultGoalColor } : g) }
}
export function finishSession(w: Workspace, input: { summary: string; openLoops: string; nextStep: string }, now: string, id: string): Workspace {
  if (!w.active || !input.summary.trim() || !input.nextStep.trim()) return w
  const active = w.active
  const session: Session = { id, goalId: active.goalId, startedAt: active.startedAt, finishedAt: now, summary: input.summary.trim(), openLoops: input.openLoops.trim(), nextStep: input.nextStep.trim() }
  return { ...w, active: null, sessions: [session, ...w.sessions], breadcrumbs: [...w.breadcrumbs.map(b => b.id === active.breadcrumbId ? { ...b, completedAt: now } : b), { id: `breadcrumb-${id}`, goalId: active.goalId, sessionId: id, text: session.nextStep, completedAt: null }] }
}
export function reorder(w: Workspace, source: string, target: string): Workspace {
  const list = [...w.breadcrumbs]
  const from = list.findIndex(b => b.id === source), to = list.findIndex(b => b.id === target)
  if (from < 0 || to < 0 || from === to) return w
  const [item] = list.splice(from, 1)
  list.splice(to, 0, item)
  return { ...w, breadcrumbs: list }
}

// Preserve the previous key as a backup; migrate IDs and history without inventing habits.
export function migrateWorkspace(value: unknown): Workspace | null {
  if (isWorkspace(value)) return { ...value, todos: value.todos ?? [] }
  if (!value || typeof value !== 'object' || (value as { version?: unknown }).version !== 2) return null
  const old = value as Record<string, unknown>
  const convert = (v: unknown) => {
    if (!v || typeof v !== 'object') return v
    const { projectId, ...rest } = v as Record<string, unknown>
    return { ...rest, goalId: projectId }
  }
  const migrated = { ...old, version: 3, goals: old.projects, habits: [], sessions: Array.isArray(old.sessions) ? old.sessions.map(convert) : null, breadcrumbs: Array.isArray(old.breadcrumbs) ? old.breadcrumbs.map(convert) : null, active: old.active === null ? null : convert(old.active) }
  if (!isWorkspace(migrated)) return null
  return { version: 3, todos: [], goals: migrated.goals, habits: migrated.habits, sessions: migrated.sessions, breadcrumbs: migrated.breadcrumbs, active: migrated.active }
}
export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function weeklyCount(habit: Habit, date: Date): number {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7)
  const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6)
  return new Set(habit.checkIns.filter(d => d >= dateKey(monday) && d <= dateKey(sunday))).size
}
export function isCountHabit(habit: Habit): boolean {
  return ['daily-count', 'weekly-count', 'total'].includes(habit.schedule)
}
export function completionCount(habit: Habit, date: Date): number {
  if (habit.schedule === 'total') return habit.checkIns.length
  if (habit.schedule === 'weekly-count') {
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7)
    const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6)
    return habit.checkIns.filter(day => day >= dateKey(monday) && day <= dateKey(sunday)).length
  }
  return habit.checkIns.filter(day => day === dateKey(date)).length
}
// Repeated date entries are individual completions. Existing entries still count once.
export function changeHabitCount(w: Workspace, id: string, date: Date, delta: 1 | -1): Workspace {
  const key = dateKey(date)
  return { ...w, habits: w.habits.map(h => {
    if (h.id !== id || h.archivedAt || !isCountHabit(h)) return h
    if (delta === 1) return completionCount(h, date) < h.target ? { ...h, checkIns: [...h.checkIns, key] } : h
    const index = h.checkIns.lastIndexOf(key)
    return index < 0 ? h : { ...h, checkIns: h.checkIns.filter((_, i) => i !== index) }
  }) }
}
export function isDue(habit: Habit, date: Date): boolean {
  if (isCountHabit(habit)) return completionCount(habit, date) < habit.target
  return habit.schedule === 'daily' || (habit.schedule === 'days' ? habit.weekdays.includes(date.getDay()) : weeklyCount({ ...habit, checkIns: habit.checkIns.filter(day => day <= dateKey(date)) }, date) < habit.target)
}
export function toggleHabit(w: Workspace, id: string, date: Date): Workspace {
  const habit = w.habits.find(h => h.id === id)
  if (!habit || habit.archivedAt || isCountHabit(habit)) return w
  const key = dateKey(date)
  return { ...w, habits: w.habits.map(h => h.id === id ? { ...h, checkIns: h.checkIns.includes(key) ? h.checkIns.filter(d => d !== key) : isDue(h, date) ? [...h.checkIns, key] : h.checkIns } : h) }
}

// Removal keeps session history and makes habits independent, without losing check-ins.
export function removeGoal(w: Workspace, goalId: string, now: string): Workspace {
  if (w.active?.goalId === goalId || !w.goals.some(g => g.id === goalId && !g.archivedAt)) return w
  return { ...w, goals: w.goals.map(g => g.id === goalId ? { ...g, archivedAt: now } : g), habits: w.habits.map(h => h.goalId === goalId ? { ...h, goalId: null } : h) }
}

export function renameGoal(w: Workspace, goalId: string, name: string): Workspace {
  const trimmed = name.trim()
  if (!trimmed || trimmed.length > 100 || !w.goals.some(g => g.id === goalId && !g.archivedAt && g.name !== trimmed)) return w
  return { ...w, goals: w.goals.map(g => g.id === goalId ? { ...g, name: trimmed } : g) }
}

export function addTodo(w: Workspace, text: string, now: string, id: string): Workspace {
  const trimmed = text.trim()
  if (!trimmed || trimmed.length > 500 || !Number.isFinite(Date.parse(now)) || (w.todos ?? []).some(t => t.id === id)) return w
  return { ...w, todos: [{ id, text: trimmed, createdAt: now, completedAt: null }, ...w.todos ?? []] }
}
export function toggleTodo(w: Workspace, id: string, now: string): Workspace {
  if (!Number.isFinite(Date.parse(now)) || !(w.todos ?? []).some(t => t.id === id)) return w
  return { ...w, todos: (w.todos ?? []).map(t => t.id === id ? { ...t, completedAt: t.completedAt ? null : now } : t) }
}
export function sortedTodos(w: Workspace): Todo[] {
  return [...w.todos ?? []].sort((a, b) => Number(!!a.completedAt) - Number(!!b.completedAt) || Date.parse(b.createdAt) - Date.parse(a.createdAt))
}
