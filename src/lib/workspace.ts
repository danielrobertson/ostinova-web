export type Project = { id: string; name: string; color: string }
export type Session = { id: string; projectId: string; startedAt: string; finishedAt: string; summary: string; openLoops: string; nextStep: string }
export type Breadcrumb = { id: string; projectId: string; sessionId?: string; text: string; completedAt: string | null }
export type Workspace = { version: 2; projects: Project[]; sessions: Session[]; breadcrumbs: Breadcrumb[]; active: { projectId: string; startedAt: string; breadcrumbId?: string } | null }
export const storageKey = 'ostinova.projects.v2'
export const initialWorkspace: Workspace = {
  version: 2,
  projects: [ { id: 'app', name: 'Build my app', color: '#8b9cf7' }, { id: 'writing', name: 'Short stories', color: '#c6a676' }, { id: 'music', name: 'Learn piano', color: '#82b5a0' } ],
  sessions: [],
  breadcrumbs: [ { id: 'b1', projectId: 'app', text: 'Sketch the first screen', completedAt: null }, { id: 'b2', projectId: 'writing', text: 'Write the opening scene', completedAt: null }, { id: 'b3', projectId: 'music', text: 'Practice the left-hand pattern', completedAt: null } ],
  active: null,
}
export function isWorkspace(value: unknown): value is Workspace {
  if (!value || typeof value !== 'object') return false
  const w = value as Workspace
  if (w.version !== 2 || !Array.isArray(w.projects) || !Array.isArray(w.sessions) || !Array.isArray(w.breadcrumbs)) return false
  const text = (v: unknown) => typeof v === 'string'
  const date = (v: unknown) => text(v) && Number.isFinite(Date.parse(v as string))
  if (!w.projects.every(p => p && text(p.id) && text(p.name) && /^#[0-9a-f]{6}$/i.test(p.color))) return false
  const project = (id: string) => w.projects.some(p => p.id === id)
  return w.sessions.every(s => s && text(s.id) && project(s.projectId) && date(s.startedAt) && date(s.finishedAt) && text(s.summary) && text(s.openLoops) && text(s.nextStep)) &&
    w.breadcrumbs.every(b => b && text(b.id) && project(b.projectId) && text(b.text) && (b.completedAt === null || date(b.completedAt))) &&
    (w.active === null || !!w.active && project(w.active.projectId) && date(w.active.startedAt))
}
export function finishSession(w: Workspace, input: { summary: string; openLoops: string; nextStep: string }, now: string, id: string): Workspace {
  if (!w.active || !input.summary.trim() || !input.nextStep.trim()) return w
  const active = w.active
  const session: Session = { id, projectId: active.projectId, startedAt: active.startedAt, finishedAt: now, summary: input.summary.trim(), openLoops: input.openLoops.trim(), nextStep: input.nextStep.trim() }
  return { ...w, active: null, sessions: [session, ...w.sessions], breadcrumbs: [...w.breadcrumbs.map(b => b.id === active.breadcrumbId ? { ...b, completedAt: now } : b), { id: `breadcrumb-${id}`, projectId: active.projectId, sessionId: id, text: session.nextStep, completedAt: null }] }
}
export function reorder(w: Workspace, source: string, target: string): Workspace {
  const list = [...w.breadcrumbs]
  const from = list.findIndex(b => b.id === source), to = list.findIndex(b => b.id === target)
  if (from < 0 || to < 0 || from === to) return w
  const [item] = list.splice(from, 1)
  list.splice(to, 0, item)
  return { ...w, breadcrumbs: list }
}
