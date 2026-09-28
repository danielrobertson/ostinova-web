import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpRight, BookOpen, Check, ChevronRight, CircleHelp, Clock3, GripVertical, ListTodo, Menu, Monitor, Moon, Play, Plus, Square, Sun, Volume2, VolumeX, X } from 'lucide-react'
import { Button } from './components/ui/button'
import { finishSession, initialWorkspace, isWorkspace, reorder, storageKey } from './lib/workspace'
import type { Workspace } from './lib/workspace'

type Theme = 'system' | 'light' | 'dark'
const themeKey = 'ostinova.theme'
const localDate = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
const formatDate = (value: string) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

export function OstinovaApp() {
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace)
  const [ready, setReady] = useState(false)
  const [storageError, setStorageError] = useState('')
  const [view, setView] = useState('today')
  const [theme, setTheme] = useState<Theme>('system')
  const [muted, setMuted] = useState(true)
  const [menu, setMenu] = useState(false)
  const [newProject, setNewProject] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [closing, setClosing] = useState(false)
  const [summary, setSummary] = useState('')
  const [openLoops, setOpenLoops] = useState('')
  const [nextStep, setNextStep] = useState('')
  const [notice, setNotice] = useState('')
  const [dragged, setDragged] = useState<string | null>(null)
  const [now, setNow] = useState(0)
  const projectInput = useRef<HTMLInputElement>(null)
  const summaryInput = useRef<HTMLTextAreaElement>(null)
  const audio = useRef<AudioContext | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed: unknown = JSON.parse(saved)
        if (!isWorkspace(parsed)) throw new Error('invalid workspace')
        setWorkspace(parsed)
      }
      const preference = localStorage.getItem(themeKey)
      if (preference === 'dark' || preference === 'light' || preference === 'system') setTheme(preference)
      setMuted(localStorage.getItem('ostinova.muted') !== 'false')
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
    if (!newProject && !closing) return
    const trigger = document.activeElement as HTMLElement | null
    if (newProject) projectInput.current?.focus()
    if (closing) summaryInput.current?.focus()
    return () => trigger?.focus()
  }, [newProject, closing])
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(''), 4000); return () => clearTimeout(t) }, [notice])
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])

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
  function start(projectId: string, breadcrumbId?: string) {
    if (workspace.active) { setNotice('Finish your current session before starting another.'); return }
    setWorkspace(w => ({ ...w, active: { projectId, breadcrumbId, startedAt: new Date().toISOString() } })); tick()
  }
  function navigate(destination: string) { setView(destination); setMenu(false) }
  const selected = workspace.projects.find(p => p.id === view)
  const activeProject = workspace.projects.find(p => p.id === workspace.active?.projectId)
  const pending = workspace.breadcrumbs.filter(b => !b.completedAt && (!selected || b.projectId === selected.id))
  const completed = workspace.breadcrumbs.filter(b => b.completedAt && (!selected || b.projectId === selected.id))
  const sessions = workspace.sessions.filter(s => !selected || s.projectId === selected.id)
  const days = Array.from({ length: now ? 14 : 0 }, (_, i) => { const d = new Date(now); d.setDate(d.getDate() - 13 + i); return d })
  const elapsed = workspace.active ? Math.max(0, Math.floor((now - Date.parse(workspace.active.startedAt)) / 1000)) : 0
  const clock = `${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`
  const title = selected?.name ?? (view === 'journal' ? 'Journal' : view === 'completed' ? 'Completed' : 'Today')
  const finish = () => {
    setWorkspace(w => finishSession(w, { summary, openLoops, nextStep }, new Date().toISOString(), crypto.randomUUID()))
    setClosing(false); setSummary(''); setOpenLoops(''); setNextStep(''); setNotice('Session saved. Your next step is ready.'); tick()
  }

  return <div className="app-shell">
    <aside inert={newProject || closing} className={`sidebar ${menu ? 'is-open' : ''}`}>
      <a className="brand" href="#" onClick={e => { e.preventDefault(); navigate('today') }}><span className="brand-icon"><Check size={18} /></span>ostinova</a>
      <div className="workspace-label">Personal workspace</div>
      <nav aria-label="Main navigation">
        <button className={`nav-item ${view === 'today' ? 'selected' : ''}`} onClick={() => navigate('today')} aria-current={view === 'today' ? 'page' : undefined}><ListTodo size={18} />Today<span className="nav-count">{workspace.breadcrumbs.filter(b => !b.completedAt).length}</span></button>
        <button className={`nav-item ${view === 'journal' ? 'selected' : ''}`} onClick={() => navigate('journal')} aria-current={view === 'journal' ? 'page' : undefined}><BookOpen size={18} />Journal</button>
        <div className="nav-section"><span>Projects</span><button className="icon-button" aria-label="Add project" onClick={() => setNewProject(true)}><Plus size={15} /></button></div>
        {workspace.projects.map(p => <button key={p.id} className={`nav-item ${view === p.id ? 'selected' : ''}`} onClick={() => navigate(p.id)} aria-current={view === p.id ? 'page' : undefined}><span className="project-dot" style={{ background: p.color }} />{p.name}</button>)}
        <button className="nav-item add-project" onClick={() => setNewProject(true)}><Plus size={17} />New project</button>
        <div className="nav-divider" />
        <button className={`nav-item ${view === 'completed' ? 'selected' : ''}`} onClick={() => navigate('completed')} aria-current={view === 'completed' ? 'page' : undefined}><Check size={18} />Completed<span className="nav-count">{workspace.breadcrumbs.filter(b => b.completedAt).length}</span></button>
      </nav>
      <div className="sidebar-bottom">
        <div className="appearance"><span>Appearance</span><div role="group" aria-label="Appearance">{([{ id: 'light', Icon: Sun }, { id: 'dark', Icon: Moon }, { id: 'system', Icon: Monitor }] as const).map(({ id, Icon }) => <button key={id} className="icon-button" aria-label={`${id[0].toUpperCase() + id.slice(1)} theme`} aria-pressed={theme === id} onClick={() => setTheme(id)}><Icon size={15} /></button>)}</div></div>
        <div className="sidebar-tools"><button className="quiet-button" aria-pressed={!muted} onClick={() => setMuted(v => !v)}>{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}Sound {muted ? 'off' : 'on'}</button><button className="icon-button" aria-label="About this prototype" onClick={() => setNotice('Example projects. Changes save on this device. Cloud sync is not connected yet.')}><CircleHelp size={16} /></button></div>
        <div className="local-label"><span />On this device</div>
      </div>
    </aside>
    {menu && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMenu(false)} />}
    <main className="main" inert={newProject || closing}>
      <header className="topbar"><div><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMenu(true)}><Menu size={20} /></button><span>{title}</span></div><span className="topbar-date">{now ? new Date(now).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : ''}</span></header>
      {storageError && <p className="storage-error" role="alert">{storageError}</p>}
      <div className="workspace-body">
        <div className="primary-pane">
          <div className="page-heading"><div><h1>{title}</h1><p>{view === 'journal' ? 'Your sessions, in your own words.' : view === 'completed' ? 'The steps you have finished.' : selected ? 'Pick up where you left off.' : 'Pick a next step. Make time for it.'}</p></div>{view !== 'journal' && view !== 'completed' && <Button variant="outline" disabled={!ready} onClick={() => setNewProject(true)}><Plus size={15} />Project</Button>}</div>
          {view !== 'journal' && view !== 'completed' && <>
            <section className="activity-section" aria-label="Project activity"><div className="section-heading"><h2>Recent sessions</h2><span>Last 14 days</span></div><div className="activity-grid">
              <div className="activity-label" /><div className="day-labels">{days.map((d, i) => <span key={i}>{i === 0 || i === 13 || d.getDay() === 1 ? d.toLocaleDateString(undefined, { weekday: 'narrow' }) : '·'}</span>)}</div>
              {workspace.projects.filter(p => !selected || p.id === selected.id).map(p => <div className="activity-row" key={p.id}><button className="activity-label" onClick={() => navigate(p.id)}><span className="project-dot" style={{ background: p.color }} />{p.name}</button><div className="day-cells">{days.map((d, i) => { const count = workspace.sessions.filter(s => s.projectId === p.id && localDate(new Date(s.finishedAt)) === localDate(d)).length; return <span key={i} className={`day-cell ${count ? 'filled' : ''} ${i === 13 ? 'current-day' : ''}`} style={count ? { background: p.color } : undefined} role="img" aria-label={`${p.name}, ${d.toLocaleDateString()}: ${count} sessions`} title={`${d.toLocaleDateString()}: ${count} sessions`} /> })}</div></div>)}
            </div><div className="activity-caption"><span>{sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} finished</span><span>No daily target. Come back when you can.</span></div></section>
            <section aria-label="Up next"><div className="section-heading list-heading"><h2>Up next <span>{pending.length}</span></h2><span>From your session breadcrumbs</span></div>
              {pending.length ? pending.map((b, index) => { const p = workspace.projects.find(p => p.id === b.projectId)!; return <div key={b.id} className={`task-row ${dragged === b.id ? 'dragging' : ''}`} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (dragged) setWorkspace(w => reorder(w, dragged, b.id)); setDragged(null) }}>
                <span className="drag-handle" draggable onDragStart={e => { e.dataTransfer.setData('text/plain', b.id); setDragged(b.id) }} onDragEnd={() => setDragged(null)} title="Drag to reorder"><GripVertical size={15} /></span>
                <button className="task-checkbox" disabled={!ready} aria-label={`Complete ${b.text}`} onClick={() => { setWorkspace(w => ({ ...w, breadcrumbs: w.breadcrumbs.map(item => item.id === b.id ? { ...item, completedAt: new Date().toISOString() } : item) })); tick() }} />
                <div className="task-copy"><span>{b.text}</span><button onClick={() => navigate(p.id)}><span className="project-dot" style={{ background: p.color }} />{p.name}</button></div>
                <div className="reorder-controls"><button className="icon-button" aria-label={`Move ${b.text} up`} disabled={index === 0 || !ready} onClick={() => setWorkspace(w => reorder(w, b.id, pending[index - 1].id))}><ArrowUp size={13} /></button><button className="icon-button" aria-label={`Move ${b.text} down`} disabled={index === pending.length - 1 || !ready} onClick={() => setWorkspace(w => reorder(w, b.id, pending[index + 1].id))}><ArrowDown size={13} /></button></div>
                <button className="start-button" disabled={!!workspace.active || !ready} onClick={() => start(p.id, b.id)}><Play size={13} />Start</button>
              </div> }) : <div className="empty-state"><Check size={22} /><h3>No next steps waiting</h3><p>Start a project session. Leave your next step when you finish.</p></div>}
            </section>
            <div className="section-heading project-heading"><h2>Start something else</h2></div><div className="project-starts">{workspace.projects.filter(p => !selected || p.id === selected.id).map(p => <button key={p.id} disabled={!!workspace.active || !ready} onClick={() => start(p.id)}><span className="project-dot" style={{ background: p.color }} />{p.name}<Plus size={14} /></button>)}</div>
          </>}
          {view === 'completed' && <section>{completed.length ? completed.map(b => <div className="task-row completed-row" key={b.id}><button className="task-checkbox checked" aria-label={`Reopen ${b.text}`} onClick={() => setWorkspace(w => ({ ...w, breadcrumbs: w.breadcrumbs.map(item => item.id === b.id ? { ...item, completedAt: null } : item) }))}><Check size={12} /></button><div className="task-copy"><span>{b.text}</span><small>{workspace.projects.find(p => p.id === b.projectId)?.name}</small></div><time>{formatDate(b.completedAt!)}</time></div>) : <div className="empty-state"><Check size={24} /><h3>No completed steps yet</h3><p>Finished breadcrumbs will appear here.</p></div>}</section>}
          {(view === 'journal' || !!selected) && <section className="journal"><div className="section-heading"><h2>Session history</h2><span>{sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}</span></div>{sessions.length ? sessions.map(s => <article className="journal-entry" key={s.id}><div><span className="journal-project">{workspace.projects.find(p => p.id === s.projectId)?.name}</span><time>{formatDate(s.finishedAt)}</time></div><h3>{s.summary}</h3>{s.openLoops && <p>{s.openLoops}</p>}<p className="journal-next"><ArrowUpRight size={14} />{s.nextStep}</p></article>) : <div className="empty-state"><BookOpen size={24} /><h3>Your first session starts the journal</h3><p>What you did and where to begin next, saved together.</p></div>}</section>}
          <p className="prototype-note">Starts with example projects. Your changes stay in this browser.</p>
        </div>
        <aside className="session-pane" aria-label="Session details"><div className="pane-label"><span className={workspace.active ? 'live-dot' : ''} />{workspace.active ? 'In session' : 'Your next session'}</div>
          {workspace.active && activeProject ? <><span className="session-project" style={{ color: activeProject.color }}>{activeProject.name}</span><div className="session-clock" aria-label="Elapsed session time">{clock}</div><p className="session-context">{workspace.breadcrumbs.find(b => b.id === workspace.active?.breadcrumbId)?.text ?? 'Time for your project.'}</p><Button className="finish-button" disabled={!ready} onClick={() => setClosing(true)}><Square size={13} />Finish session</Button><p className="session-hint">Save what you did and leave one next step.</p></> : <><div className="rest-icon"><BookOpen size={28} strokeWidth={1.3} /><span><ArrowUpRight size={13} /></span></div><h2>A place to pick up again.</h2><p>Start with a step from your list, or choose a project below it.</p><div className="session-explainer"><span><Play size={14} />Start a session</span><ChevronRight size={12} /><span><BookOpen size={14} />Leave a breadcrumb</span></div></>}
          <div className="session-total"><Clock3 size={16} /><div><strong>{workspace.sessions.length}</strong><span>{workspace.sessions.length === 1 ? 'session' : 'sessions'} finished, all time</span></div></div>
        </aside>
      </div>
    </main>
    {newProject && <div className="dialog-backdrop" onClick={() => setNewProject(false)}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="project-title" onClick={e => e.stopPropagation()} onKeyDown={trapFocus}><div className="dialog-heading"><h2 id="project-title">New project</h2><button className="icon-button" aria-label="Close new project" onClick={() => setNewProject(false)}><X size={18} /></button></div><p>Something you want to keep working on.</p><form onSubmit={e => { e.preventDefault(); if (!projectName.trim()) return; const id = crypto.randomUUID(); setWorkspace(w => ({ ...w, projects: [...w.projects, { id, name: projectName.trim(), color: '#8b9cf7' }] })); setProjectName(''); setNewProject(false); navigate(id) }}><label>Project name<input ref={projectInput} value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g. Write a short story" required maxLength={100} /></label><div className="dialog-actions"><Button type="button" variant="ghost" onClick={() => setNewProject(false)}>Cancel</Button><Button type="submit" disabled={!ready || !projectName.trim()}>Create project</Button></div></form></section></div>}
    {closing && <div className="dialog-backdrop"><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="finish-title" onKeyDown={trapFocus}><div className="dialog-heading"><h2 id="finish-title">Leave a breadcrumb</h2><button className="icon-button" aria-label="Back to session" onClick={() => setClosing(false)}><X size={18} /></button></div><p>{activeProject?.name} · A few words are enough.</p><form onSubmit={e => { e.preventDefault(); finish() }}><label>What did you do?<textarea ref={summaryInput} value={summary} onChange={e => setSummary(e.target.value)} placeholder="One line about this session" maxLength={500} required rows={2} /></label><label>Anything still on your mind? <span>Optional</span><textarea value={openLoops} onChange={e => setOpenLoops(e.target.value)} placeholder="Put it here for later" maxLength={2000} rows={2} /></label><label>What's the single next step?<input value={nextStep} onChange={e => setNextStep(e.target.value)} placeholder="Make it easy to start again" maxLength={300} required /></label><div className="dialog-actions"><Button type="button" variant="ghost" onClick={() => setClosing(false)}>Keep working</Button><Button type="submit" disabled={!ready || !summary.trim() || !nextStep.trim()}>Save session<ArrowUpRight size={14} /></Button></div></form></section></div>}
    {notice && <div className="toast" role="status">{notice}</div>}
  </div>

  function trapFocus(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === 'Escape') { setNewProject(false); setClosing(false); return }
    if (e.key !== 'Tab') return
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input, textarea, select, [tabindex="0"]'))
    const first = items[0], last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
  }
}
