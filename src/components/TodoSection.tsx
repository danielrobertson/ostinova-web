import { useEffect, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { addTodo, sortedTodos, toggleTodo } from '../lib/workspace'
import type { Workspace } from '../lib/workspace'

export function TodoSection({ workspace, setWorkspace, ready, onCheck }: { workspace: Workspace; setWorkspace: Dispatch<SetStateAction<Workspace>>; ready: boolean; onCheck: () => void }) {
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const [text, setText] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const reducedMotion = useReducedMotion()
  const todos = sortedTodos(workspace)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || target?.closest('input, textarea, [contenteditable="true"], [role="dialog"], [role="menu"]')) return
      if (event.key === 'n' && ready) { event.preventDefault(); input.current?.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [ready])
  return <section aria-label="Todos">
    <form className="habit-composer todo-composer" onSubmit={event => {
      event.preventDefault()
      if (!ready || !text.trim()) return
      const id = crypto.randomUUID(), now = new Date().toISOString()
      setWorkspace(w => addTodo(w, text, now, id))
      setText('')
      setAnnouncement('Todo added.')
    }}>
      <Button type="submit" variant="ghost" size="icon" className="todo-add" aria-label="Add todo" disabled={!ready || !text.trim()}><Plus size={16} /></Button>
      <input ref={input} aria-keyshortcuts="N" aria-label="New todo" className="habit-composer-input" placeholder="Add a todo…" value={text} onChange={event => setText(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && event.nativeEvent.isComposing) event.preventDefault(); if (event.key === 'ArrowDown' && !event.nativeEvent.isComposing) { const first = list.current?.querySelector<HTMLElement>('[role=checkbox]'); if (first) { event.preventDefault(); first.focus() } } }} maxLength={500} disabled={!ready} autoComplete="off" />
    </form>
    <span role="status" className="sr-only">{announcement}</span>
    {!todos.length && <p className="habit-empty">Type a todo above and press Enter.</p>}
    <motion.ul ref={list} onKeyDown={event => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || event.metaKey || event.ctrlKey || event.altKey) return
      const controls = Array.from(list.current?.querySelectorAll<HTMLElement>('[role=checkbox]:not([data-disabled])') ?? [])
      const index = controls.indexOf(document.activeElement as HTMLElement)
      if (index < 0) return
      event.preventDefault()
      if (event.key === 'ArrowUp' && index === 0) { input.current?.focus(); return }
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? controls.length - 1 : Math.min(controls.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1))
      controls[next]?.focus()
    }} className="todo-list" aria-label="Todo items" layout={!reducedMotion}>
      <AnimatePresence initial={false}>
        {todos.map(todo => <motion.li key={todo.id} layout={!reducedMotion} initial={reducedMotion ? false : { opacity: 0, y: -8, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', duration: .28, bounce: 0 }} className={`todo-item ${todo.completedAt ? 'is-completed' : ''}`}>
          <div className="todo-row">
            <Checkbox checked={!!todo.completedAt} disabled={!ready} aria-label={`${todo.completedAt ? 'Reopen' : 'Complete'} ${todo.text}`} onCheckedChange={() => {
              setWorkspace(w => toggleTodo(w, todo.id, new Date().toISOString()))
              setAnnouncement(todo.completedAt ? 'Todo reopened.' : 'Todo completed.')
              if (!todo.completedAt) onCheck()
            }} />
            <span className="todo-text">{todo.text}</span>
          </div>
        </motion.li>)}
      </AnimatePresence>
    </motion.ul>
  </section>
}
