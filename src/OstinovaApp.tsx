import { useEffect, useRef, useState } from 'react'
import { PanelLeft } from 'lucide-react'
import { TodoSection } from './components/TodoSection'
import { HabitSection } from './components/HabitSection'
import { AppSidebar } from './components/AppSidebar'
import { AnimatedSidebarProvider, AnimatedSidebarTrigger } from './components/ui/animated-sidebar'
import type { Theme } from './components/ui/user-menu'
import { initialWorkspace, migrateWorkspace, storageKey } from './lib/workspace'
import type { Workspace } from './lib/workspace'

const themeKey = 'ostinova.theme'

export function OstinovaApp() {
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace)
  const [ready, setReady] = useState(false)
  const [storageError, setStorageError] = useState('')
  const [view, setView] = useState('habits')
  const [theme, setTheme] = useState<Theme>('system')
  const [muted, setMuted] = useState(true)
  const [menu, setMenu] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [now, setNow] = useState(0)
  const audio = useRef<AudioContext | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey) ?? localStorage.getItem('ostinova.goals.v3') ?? localStorage.getItem('ostinova.projects.v2')
      if (saved !== null) {
        const parsed: unknown = JSON.parse(saved)
        const migrated = migrateWorkspace(parsed)
        if (!migrated) throw new Error('invalid workspace')
        setWorkspace(migrated)
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
  function navigate(destination: string) { setView(destination); setMenu(false) }

  return <AnimatedSidebarProvider open={!sidebarCollapsed} onOpenChange={setSidebarOpen} openMobile={menu} onOpenMobileChange={setMenu}>
    <AppSidebar todoCount={ready ? workspace.todos.filter(t => !t.completedAt).length : 0} view={view} habitCount={ready ? workspace.habits.filter(h => !h.archivedAt).length : 0} theme={theme} onThemeChange={setTheme} navigate={navigate} />
    <main className="main" inert={menu}>
      <header className="workspace-toolbar"><AnimatedSidebarTrigger className="text-muted-foreground hover:bg-muted" aria-label="Toggle sidebar"><PanelLeft size={17} /></AnimatedSidebarTrigger><span className="workspace-header-divider" aria-hidden="true" /><h1 className="workspace-page-title">{view === 'todos' ? 'Todos' : 'Habits'}</h1><div id="workspace-header-actions" className="workspace-header-actions" /></header>
      {storageError && <p className="storage-error" role="alert">{storageError}</p>}
      <div className="workspace-page-body"><div className="primary-pane">
        {view === 'todos' ? <TodoSection workspace={workspace} setWorkspace={setWorkspace} ready={ready} onCheck={tick} /> : <HabitSection workspace={workspace} setWorkspace={setWorkspace} now={now} ready={ready} onCheck={tick} />}
      </div></div>
    </main>
  </AnimatedSidebarProvider>
}
