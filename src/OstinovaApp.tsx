import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpRight, BookOpen, Check, ChevronRight, GripVertical, PanelLeft, Pencil, Play, Plus, Square, Volume2, VolumeX, X } from 'lucide-react'
import { TodoSection } from './components/TodoSection'
import { HabitSection } from './components/HabitSection'
import { Button } from './components/ui/button'
import { AppSidebar } from './components/AppSidebar'
import { AnimatedSidebarProvider, AnimatedSidebarTrigger } from './components/ui/animated-sidebar'
import { GoalActions } from './components/ui/goal-actions'
import type { Theme } from './components/ui/user-menu'
import { defaultGoalColor, finishSession, removeGoal, renameGoal, initialWorkspace, migrateWorkspace, normalizeDefaultGoalColor, reorder, storageKey } from './lib/workspace'
import type { Workspace } from './lib/workspace'

const themeKey = 'ostinova.theme'
const formatDate = (value: string) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

export function OstinovaApp() {
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace)
  const [ready, setReady] = useState(false)
  const [storageError, setStorageError] = useState('')
  const [view, setView] = useState('habits')
  const [theme, setTheme] = useState<Theme>('system')
  const [muted, setMuted] = useState(true)
  const [menu, setMenu] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [newGoal, setNewGoal] = useState(false)
  const [goalName, setGoalName] = useState('')
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [editedGoalName, setEditedGoalName] = useState('')
  const [closing, setClosing] = useState(false)
  const [summary, setSummary] = useState('')
  const [openLoops, setOpenLoops] = useState('')
  const [nextStep, setNextStep] = useState('')
  const [notice, setNotice] = useState('')
  const [dragged, setDragged] = useState<string | null>(null)
  const [now, setNow] = useState(0)
  const goalInput = useRef<HTMLInputElement>(null)
  const editedGoalInput = useRef<HTMLInputElement>(null)
  const summaryInput = useRef<HTMLTextAreaElement>(null)
  const audio = useRef<AudioContext | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey) ?? localStorage.getItem('ostinova.projects.v2')
      if (saved) {
        const parsed: unknown = JSON.parse(saved)
        const migrated = migrateWorkspace(parsed)
        if (!migrated) throw new Error('invalid workspace')
        setWorkspace(normalizeDefaultGoalColor(migrated))
      }
      const preference = localStorage.getItem(themeKey)
      if (preference === 'dark' || preference === 'light' || preference === 'system') setTheme(preference)
      setMuted(localStorage.getItem('ostinova.muted') !== 'false')
      setSidebarCollapsed(localStorage.getItem('ostinova.sidebar.collapsed') === 'true')
      setReady(true)
    } catch { setStorageError('Saved data could not be read. Reload or export your browser data before making changes.') }
  }, [])
  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem(storageKey, JSON.stringify(workspace)); setStorageError('') }
    catch { setStorageError('Changes could not be saved on this device. Keep this tab open and free browser storage.') }
  }, [workspace, ready])
  useEffect(() => {
    if (!ready) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => document.documentElement.classList.toggle('dark', theme === 'dark' || theme === 'system' && media.matches)
    apply()
    try { localStorage.setItem(themeKey, theme) } catch { /* theme still works for this visit */ }
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme, ready])
  useEffect(() => { if (ready) { try { localStorage.setItem('ostinova.muted', String(muted)) } catch { /* preference is in memory */ } } }, [muted, ready])
  useEffect(() => {
    if (!newGoal && !editingGoalId && !closing) return
    const trigger = document.activeElement as HTMLElement | null
    if (newGoal) goalInput.current?.focus()
    if (editingGoalId) { editedGoalInput.current?.focus(); editedGoalInput.current?.select() }
    if (closing) summaryInput.current?.focus()
    return () => trigger?.focus()
  }, [newGoal, editingGoalId, closing])
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(''), 4000); return () => clearTimeout(t) }, [notice])
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])

  function setSidebarOpen(open: boolean) {
    setSidebarCollapsed(!open)
    try { localStorage.setItem('ostinova.sidebar.collapsed', String(!open)) } catch { /* preference remains in memory */ }
  }

  function tick() {
    if (muted) return
    try {
      const ctx = audio.current ?? (audio.current = new AudioContext())
      void ctx.resume()
      const oscillator = ctx.createOscillator(), gain = ctx.createGain()
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(640, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + .08)
      gain.gain.setValueAtTime(.035, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .12)
      oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(); oscillator.stop(ctx.currentTime + .12)
    } catch { /* audio is optional */ }
  }
  function start(goalId: string, breadcrumbId?: string) {
    if (!workspace.goals.some(g => g.id === goalId && !g.archivedAt)) return
    if (workspace.active) { setNotice('Finish your current session before starting another.'); return }
    setWorkspace(w => ({ ...w, active: { goalId, breadcrumbId, startedAt: new Date().toISOString() } })); tick()
  }
  function navigate(destination: string) { setView(destination); setMenu(false) }
  function openGoalRename(goalId: string, name: string) { setEditedGoalName(name); setEditingGoalId(goalId) }
  const selected = workspace.goals.find(p => p.id === view)
  const activeGoal = workspace.goals.find(p => p.id === workspace.active?.goalId)
  const pending = workspace.breadcrumbs.filter(b => !b.completedAt && (!selected || b.goalId === selected.id))
  const completed = workspace.breadcrumbs.filter(b => b.completedAt && (!selected || b.goalId === selected.id))
  const sessions = workspace.sessions.filter(s => !selected || s.goalId === selected.id)
  const elapsed = workspace.active ? Math.max(0, Math.floor((now - Date.parse(workspace.active.startedAt)) / 1000)) : 0
  const clock = `${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`
  const finish = () => {
    setWorkspace(w => finishSession(w, { summary, openLoops, nextStep }, new Date().toISOString(), crypto.randomUUID()))
    setClosing(false); setSummary(''); setOpenLoops(''); setNextStep(''); setNotice('Session saved. Your next step is ready.'); tick()
  }

  return <AnimatedSidebarProvider open={!sidebarCollapsed} onOpenChange={setSidebarOpen} openMobile={menu} onOpenMobileChange={setMenu}>
    <AppSidebar todoCount={ready ? (workspace.todos ?? []).filter(t => !t.completedAt).length : 0} view={view} habitCount={ready ? workspace.habits.filter(h => !h.archivedAt).length : 0} goalCount={ready ? workspace.goals.filter(g => !g.archivedAt).length : 0} theme={theme} onThemeChange={setTheme} navigate={navigate} inert={newGoal || !!editingGoalId || closing} />
    <main className="main" inert={newGoal || !!editingGoalId || closing || menu}>
      <header className="workspace-toolbar"><AnimatedSidebarTrigger className="text-muted-foreground hover:bg-muted" aria-label="Toggle sidebar"><PanelLeft size={17} /></AnimatedSidebarTrigger><span className="workspace-header-divider" aria-hidden="true" />{selected ? <nav className="workspace-breadcrumb" aria-label="Breadcrumb"><button type="button" onClick={() => navigate('goals')}>Goals</button><ChevronRight size={14} className="shrink-0 text-muted-foreground" aria-hidden="true" /><h1 className="workspace-page-title" title={selected.name}>{selected.name}</h1></nav> : <h1 className="workspace-page-title">{view === 'goals' ? 'Goals' : view === 'todos' ? 'Todo' : 'Habits'}</h1>}<div id="workspace-header-actions" className="workspace-header-actions">{view === 'goals' && <Button variant="ghost" size="sm" disabled={!ready} onClick={() => setNewGoal(true)}><Plus size={14} />New goal</Button>}{selected && !selected.archivedAt && <Button variant="ghost" size="icon" aria-label={`Rename ${selected.name}`} title="Rename goal" disabled={!ready} onClick={() => openGoalRename(selected.id, selected.name)}><Pencil size={15} /></Button>}</div></header>
      {storageError && <p className="storage-error" role="alert">{storageError}</p>}
      <div className="workspace-page-body">
        <div className="primary-pane">
          {view === 'todos' && <TodoSection workspace={workspace} setWorkspace={setWorkspace} ready={ready} onCheck={tick} />}
          {view === 'goals' && <section aria-label="Goals">
            {workspace.goals.filter(g => !g.archivedAt).map(g => {
              const habits = workspace.habits.filter(h => h.goalId === g.id && !h.archivedAt)
              const checkIns = habits.reduce((sum, h) => sum + h.checkIns.length, 0)
              const total = workspace.sessions.filter(s => s.goalId === g.id).length
              return <div className="goal-row" key={g.id}>
                <button className="goal-row-main" onClick={() => navigate(g.id)}>
                  <span className="goal-row-name">{g.name}</span>
                  <span className="goal-row-meta"><span>{habits.length} {habits.length === 1 ? 'habit' : 'habits'}</span><span>{checkIns} {checkIns === 1 ? 'check-in' : 'check-ins'}</span><span>{total} {total === 1 ? 'session' : 'sessions'}</span></span>
                </button>
                <GoalActions name={g.name} canRemove={ready && workspace.active?.goalId !== g.id} onOpen={() => navigate(g.id)} onRename={() => openGoalRename(g.id, g.name)} onRemove={() => { setWorkspace(w => removeGoal(w, g.id, new Date().toISOString())); setNotice('Goal removed. Its habits are now standalone. History is kept in Removed goals.') }} />
              </div>

            })}
            {!workspace.goals.some(g => !g.archivedAt) && <p className="habit-empty">Create a goal to give your habits a direction.</p>}
            {workspace.goals.some(g => g.archivedAt) && <details className="mt-8 text-muted-foreground"><summary className="cursor-pointer text-xs">Removed goals</summary>{workspace.goals.filter(g => g.archivedAt).map(g => <div key={g.id} className="flex items-center gap-3 border-b border-border py-3"><button className="min-w-0 flex-1 break-words text-left" onClick={() => navigate(g.id)}>{g.name}</button><Button variant="ghost" size="sm" disabled={!ready} onClick={() => setWorkspace(w => ({ ...w, goals: w.goals.map(item => item.id === g.id ? { ...item, archivedAt: undefined } : item) }))}>Restore</Button></div>)}</details>}
          </section>}
          {(view === 'habits' || selected && !selected.archivedAt) && <HabitSection key={selected?.id ?? 'habits'} workspace={workspace} setWorkspace={setWorkspace} goalId={selected?.id} now={now} ready={ready} onCheck={tick} />}
          {selected && <>
            {selected.archivedAt && <p className="habit-empty">This goal was removed. Its session history is kept here.</p>}
            <div className="mt-8">
            <section aria-label="Up next"><div className="section-heading list-heading"><h2>Up next <span>{pending.length}</span></h2><span>From your session breadcrumbs</span></div>
              {pending.length ? pending.map((b, index) => { const p = workspace.goals.find(p => p.id === b.goalId)!; return <div key={b.id} className={`task-row ${dragged === b.id ? 'dragging' : ''}`} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (dragged) setWorkspace(w => reorder(w, dragged, b.id)); setDragged(null) }}>
                <span className="drag-handle" draggable onDragStart={e => { e.dataTransfer.setData('text/plain', b.id); setDragged(b.id) }} onDragEnd={() => setDragged(null)} title="Drag to reorder"><GripVertical size={15} /></span>
                <button className="task-checkbox" disabled={!ready} aria-label={`Complete ${b.text}`} onClick={() => { setWorkspace(w => ({ ...w, breadcrumbs: w.breadcrumbs.map(item => item.id === b.id ? { ...item, completedAt: new Date().toISOString() } : item) })); tick() }} />
                <div className="task-copy"><span>{b.text}</span><button onClick={() => navigate(p.id)}><span className="goal-dot" style={{ background: p.color }} />{p.name}</button></div>
                <div className="reorder-controls"><button className="icon-button" aria-label={`Move ${b.text} up`} disabled={index === 0 || !ready} onClick={() => setWorkspace(w => reorder(w, b.id, pending[index - 1].id))}><ArrowUp size={13} /></button><button className="icon-button" aria-label={`Move ${b.text} down`} disabled={index === pending.length - 1 || !ready} onClick={() => setWorkspace(w => reorder(w, b.id, pending[index + 1].id))}><ArrowDown size={13} /></button></div>
                <button className="start-button" disabled={!!workspace.active || !ready || !!p.archivedAt} onClick={() => start(p.id, b.id)}><Play size={13} />Start</button>
              </div> }) : <div className="empty-state"><Check size={22} /><h3>No next steps waiting</h3><p>Start a goal session. Leave your next step when you finish.</p></div>}
            </section>
            <div className="section-heading goal-heading"><h2>Session</h2></div><div className="goal-starts">{workspace.goals.filter(p => !p.archivedAt && p.id === selected.id).map(p => <button key={p.id} disabled={!!workspace.active || !ready} onClick={() => start(p.id)}><span className="goal-dot" style={{ background: p.color }} />{p.name}<Plus size={14} /></button>)}</div>
            </div>
          </>}
          {selected && completed.length > 0 && <details key={`completed-${selected.id}`} className="mt-6" open><summary className="cursor-pointer text-sm">Completed steps <span className="ml-2 text-xs text-muted-foreground">{completed.length}</span></summary><section>{completed.length ? completed.map(b => <div className="task-row completed-row" key={b.id}><button className="task-checkbox checked" aria-label={`Reopen ${b.text}`} onClick={() => setWorkspace(w => ({ ...w, breadcrumbs: w.breadcrumbs.map(item => item.id === b.id ? { ...item, completedAt: null } : item) }))}><Check size={12} /></button><div className="task-copy"><span>{b.text}</span><small>{workspace.goals.find(p => p.id === b.goalId)?.name}</small></div><time>{formatDate(b.completedAt!)}</time></div>) : <div className="empty-state"><Check size={24} /><h3>No completed steps yet</h3><p>Finished breadcrumbs will appear here.</p></div>}</section></details>}
          {!!selected && <details key={`log-${selected.id}`} className="mt-6" open><summary className="cursor-pointer text-sm">Log <span className="ml-2 text-xs text-muted-foreground">{sessions.length}</span></summary><section className="journal">{sessions.length ? sessions.map(s => <article className="journal-entry" key={s.id}><div><span className="journal-goal">{workspace.goals.find(p => p.id === s.goalId)?.name}</span><time>{formatDate(s.finishedAt)}</time></div><h3>{s.summary}</h3>{s.openLoops && <p>{s.openLoops}</p>}<p className="journal-next"><ArrowUpRight size={14} />{s.nextStep}</p></article>) : <div className="empty-state"><BookOpen size={24} /><h3>Your first session starts the log</h3><p>What you did and where to begin next, saved together.</p></div>}</section></details>}
        </div>
        {workspace.active && activeGoal && <aside className="border-t border-border px-6 py-4" aria-label="Session details"><div className="flex flex-wrap items-center gap-3"><span className="text-muted-foreground">{activeGoal.name}</span><span className="tabular-nums" aria-label="Elapsed session time">{clock}</span><Button variant="outline" disabled={!ready} onClick={() => setClosing(true)}><Square size={13} />Finish session</Button><Button variant="ghost" size="icon" aria-label={muted ? 'Enable sound' : 'Mute sound'} onClick={() => setMuted(v => !v)}>{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</Button></div></aside>}
      </div>
    </main>
    {newGoal && <div className="dialog-backdrop" onClick={() => setNewGoal(false)}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="goal-title" onClick={e => e.stopPropagation()} onKeyDown={trapFocus}><div className="dialog-heading"><h2 id="goal-title">New goal</h2><button className="icon-button" aria-label="Close new goal" onClick={() => setNewGoal(false)}><X size={18} /></button></div><p>What do you want to achieve?</p><form onSubmit={e => { e.preventDefault(); if (!goalName.trim()) return; const id = crypto.randomUUID(); setWorkspace(w => ({ ...w, goals: [...w.goals, { id, name: goalName.trim(), color: defaultGoalColor }] })); setGoalName(''); setNewGoal(false); navigate(id) }}><label>Goal name<input ref={goalInput} value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="e.g. Write a short story" required maxLength={100} /></label><div className="dialog-actions"><Button type="button" variant="ghost" onClick={() => setNewGoal(false)}>Cancel</Button><Button type="submit" disabled={!ready || !goalName.trim()}>Create goal</Button></div></form></section></div>}
    {editingGoalId && <div className="dialog-backdrop" onClick={() => setEditingGoalId(null)}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="rename-goal-title" onClick={e => e.stopPropagation()} onKeyDown={trapFocus}><div className="dialog-heading"><h2 id="rename-goal-title">Rename goal</h2><button className="icon-button" aria-label="Close rename goal" onClick={() => setEditingGoalId(null)}><X size={18} /></button></div><p>Choose a name for this goal.</p><form onSubmit={e => { e.preventDefault(); if (!editedGoalName.trim()) return; setWorkspace(w => renameGoal(w, editingGoalId, editedGoalName)); setEditingGoalId(null) }}><label>Goal name<input ref={editedGoalInput} value={editedGoalName} onChange={e => setEditedGoalName(e.target.value)} required maxLength={100} /></label><div className="dialog-actions"><Button type="button" variant="ghost" onClick={() => setEditingGoalId(null)}>Cancel</Button><Button type="submit" disabled={!ready || !editedGoalName.trim()}>Save name</Button></div></form></section></div>}
    {closing && <div className="dialog-backdrop"><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="finish-title" onKeyDown={trapFocus}><div className="dialog-heading"><h2 id="finish-title">Leave a breadcrumb</h2><button className="icon-button" aria-label="Back to session" onClick={() => setClosing(false)}><X size={18} /></button></div><p>{activeGoal?.name} · A few words are enough.</p><form onSubmit={e => { e.preventDefault(); finish() }}><label>What did you do?<textarea ref={summaryInput} value={summary} onChange={e => setSummary(e.target.value)} placeholder="One line about this session" maxLength={500} required rows={2} /></label><label>Anything still on your mind? <span>Optional</span><textarea value={openLoops} onChange={e => setOpenLoops(e.target.value)} placeholder="Put it here for later" maxLength={2000} rows={2} /></label><label>What's the single next step?<input value={nextStep} onChange={e => setNextStep(e.target.value)} placeholder="Make it easy to start again" maxLength={300} required /></label><div className="dialog-actions"><Button type="button" variant="ghost" onClick={() => setClosing(false)}>Keep working</Button><Button type="submit" disabled={!ready || !summary.trim() || !nextStep.trim()}>Save session<ArrowUpRight size={14} /></Button></div></form></section></div>}
    {notice && <div className="toast" role="status">{notice}</div>}
  </AnimatedSidebarProvider>

  function trapFocus(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === 'Escape') { setNewGoal(false); setEditingGoalId(null); setClosing(false); return }
    if (e.key !== 'Tab') return
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input, textarea, select, [tabindex="0"]'))
    const first = items[0], last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
  }
}
