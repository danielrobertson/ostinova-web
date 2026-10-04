export type Habit = { id: string; name: string; schedule: 'daily' | 'days' | 'weekly' | 'daily-count' | 'weekly-count' | 'total'; weekdays: number[]; target: number; checkIns: string[]; archivedAt?: string }
export type Todo = { id: string; text: string; createdAt: string; completedAt: string | null }
export type Workspace = { version: 4; todos: Todo[]; habits: Habit[] }
export const storageKey = 'ostinova.workspace.v4'
export const initialWorkspace: Workspace = { version: 4, todos: [], habits: [] }
export function isWorkspace(value: unknown): value is Workspace {
  if (!value || typeof value !== 'object') return false
  const w = value as Workspace
  if (w.version !== 4 || !Array.isArray(w.habits) || !Array.isArray(w.todos)) return false
  const text = (v: unknown) => typeof v === 'string'
  const date = (v: unknown) => text(v) && Number.isFinite(Date.parse(v as string))
  if (!w.todos.every(t => t && text(t.id) && text(t.text) && t.text.trim().length > 0 && t.text.length <= 500 && date(t.createdAt) && (t.completedAt === null || date(t.completedAt)))) return false
  return w.habits.every(h => h && text(h.id) && text(h.name) && (h.archivedAt === undefined || date(h.archivedAt)) && ['daily', 'days', 'weekly', 'daily-count', 'weekly-count', 'total'].includes(h.schedule) && Array.isArray(h.weekdays) && h.weekdays.every(d => Number.isInteger(d) && d >= 0 && d <= 6) && (h.schedule !== 'days' || h.weekdays.length > 0) && Number.isInteger(h.target) && h.target >= 1 && h.target <= (isCountHabit(h) ? 9999 : 7) && Array.isArray(h.checkIns) && h.checkIns.every(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)))
}
// Read legacy data without rewriting it. Retired history stays in the old storage keys.
export function migrateWorkspace(value: unknown): Workspace | null {
  if (isWorkspace(value)) return value
  if (!value || typeof value !== 'object') return null
  const old = value as Record<string, unknown>
  if (old.version !== 2 && old.version !== 3) return null
  if (!Array.isArray(old.version === 2 ? old.projects : old.goals) || !Array.isArray(old.sessions) || !Array.isArray(old.breadcrumbs)) return null
  const habits = old.version === 2 ? [] : Array.isArray(old.habits) ? old.habits.map(h => {
    if (!h || typeof h !== 'object') return h
    const { goalId: _retired, ...habit } = h as Record<string, unknown>
    return habit
  }) : null
  const migrated = { version: 4, habits, todos: old.todos === undefined ? [] : old.todos }
  return isWorkspace(migrated) ? migrated : null
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
