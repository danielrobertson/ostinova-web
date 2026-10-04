import test from 'node:test'
import assert from 'node:assert/strict'
import { initialWorkspace, isWorkspace, dateKey, isDue, migrateWorkspace, toggleHabit, weeklyCount } from '../src/lib/workspace.ts'
const habit = { id: 'h', name: 'Practice', schedule: 'daily', weekdays: [1, 3, 5], target: 2, checkIns: [] }
test('daily and selected-day recurrence use local calendar days and allow undo', () => {
  const monday = new Date(2026, 8, 28, 12)
  assert.equal(isDue(habit, monday), true)
  assert.equal(isDue({ ...habit, schedule: 'days' }, monday), true)
  assert.equal(isDue({ ...habit, schedule: 'days' }, new Date(2026, 8, 29)), false)
  const w = { ...initialWorkspace, habits: [habit] }
  const checked = toggleHabit(w, 'h', monday)
  assert.deepEqual(checked.habits[0].checkIns, ['2026-09-28'])
  assert.deepEqual(toggleHabit(checked, 'h', monday).habits[0].checkIns, [])
})
test('weekly targets reset on Monday including year boundaries', () => {
  const h = { ...habit, schedule: 'weekly', checkIns: ['2026-12-28', '2027-01-01'] }
  assert.equal(weeklyCount(h, new Date(2027, 0, 3)), 2)
  assert.equal(isDue(h, new Date(2027, 0, 3)), false)
  assert.equal(weeklyCount(h, new Date(2027, 0, 4)), 0)
  assert.equal(isDue(h, new Date(2027, 0, 4)), true)
  assert.equal(dateKey(new Date(2026, 8, 28)), '2026-09-28')
})
test('past check-ins use the selected local date and preserve later completions', () => {
  const selected = new Date(2026, 8, 28, 12)
  const later = '2026-09-30'
  const w = { ...initialWorkspace, habits: [{ ...habit, schedule: 'weekly', target: 1, checkIns: [later] }] }
  assert.equal(isDue(w.habits[0], selected), true)
  const checked = toggleHabit(w, 'h', selected)
  assert.deepEqual(checked.habits[0].checkIns, [later, '2026-09-28'])
  assert.deepEqual(toggleHabit(checked, 'h', selected).habits[0].checkIns, [later])
  assert.equal(isDue(checked.habits[0], new Date(2026, 8, 29)), false)
  assert.deepEqual(migrateWorkspace(JSON.parse(JSON.stringify(checked))).habits[0].checkIns, [later, '2026-09-28'])
})

import { changeHabitCount, completionCount } from '../src/lib/workspace.ts'
test('daily count supports multiple completions, caps the day, and undoes one at a time', () => {
  const date = new Date(2026, 8, 28)
  let w = { ...initialWorkspace, habits: [{ ...habit, schedule: 'daily-count', target: 2 }] }
  w = changeHabitCount(w, 'h', date, 1)
  assert.equal(completionCount(w.habits[0], date), 1)
  assert.equal(isDue(w.habits[0], date), true)
  w = changeHabitCount(w, 'h', date, 1)
  w = changeHabitCount(w, 'h', date, 1)
  assert.deepEqual(w.habits[0].checkIns, ['2026-09-28', '2026-09-28'])
  assert.equal(isDue(w.habits[0], date), false)
  assert.equal(isDue(w.habits[0], new Date(2026, 8, 29)), true)
  const reload = migrateWorkspace(JSON.parse(JSON.stringify(w)))
  assert.equal(completionCount(reload.habits[0], date), 2)
  w = changeHabitCount(reload, 'h', date, -1)
  assert.equal(completionCount(w.habits[0], date), 1)
  assert.equal(completionCount(changeHabitCount(w, 'h', new Date(2026, 8, 29), -1).habits[0], date), 1)
})
test('weekly completion count accepts two on one day and resets at Monday across years', () => {
  const date = new Date(2027, 0, 3)
  let w = { ...initialWorkspace, habits: [{ ...habit, schedule: 'weekly-count', target: 2 }] }
  w = changeHabitCount(changeHabitCount(w, 'h', date, 1), 'h', date, 1)
  assert.equal(completionCount(w.habits[0], date), 2)
  assert.equal(weeklyCount(w.habits[0], date), 1)
  assert.equal(isDue(w.habits[0], date), false)
  assert.equal(isDue(w.habits[0], new Date(2027, 0, 4)), true)
  assert.equal(completionCount(w.habits[0], new Date(2027, 0, 4)), 0)
  assert.equal(isDue(changeHabitCount(w, 'h', date, -1).habits[0], date), true)
})
test('total completion target finishes across days, prevents overfill, and can reopen', () => {
  const first = new Date(2026, 8, 28), second = new Date(2026, 8, 29)
  let w = { ...initialWorkspace, habits: [{ ...habit, schedule: 'total', target: 2 }] }
  w = changeHabitCount(changeHabitCount(w, 'h', first, 1), 'h', second, 1)
  assert.equal(isDue(w.habits[0], new Date(2027, 0, 1)), false)
  assert.equal(changeHabitCount(w, 'h', first, 1).habits[0].checkIns.length, 2)
  const reopened = changeHabitCount(w, 'h', first, -1)
  assert.deepEqual(reopened.habits[0].checkIns, ['2026-09-29'])
  assert.equal(isDue(reopened.habits[0], first), true)
})
test('count schedules validate bounds and preserve history through schedule edits', () => {
  for (const schedule of ['daily-count', 'weekly-count', 'total']) {
    const h = { ...habit, schedule, target: 12, checkIns: ['2026-09-28', '2026-09-28'] }
    assert.equal(isWorkspace({ ...initialWorkspace, habits: [h] }), true)
    for (const target of [0, -1, 1.5, 10000, NaN]) assert.equal(isWorkspace({ ...initialWorkspace, habits: [{ ...h, target }] }), false)
    const w = { ...initialWorkspace, habits: [{ ...h, schedule: 'daily', target: 3 }] }
    assert.deepEqual(migrateWorkspace(JSON.parse(JSON.stringify(w))).habits[0].checkIns, h.checkIns)
    assert.deepEqual(changeHabitCount(w, 'h', new Date(2026, 8, 28), 1).habits[0].checkIns, h.checkIns)
  }
})

import { addTodo, sortedTodos, toggleTodo } from '../src/lib/workspace.ts'
test('standalone todos keep creation order through completion, undo and reload', () => {
  let w = addTodo(initialWorkspace, ' First todo ', '2026-10-02T10:00:00Z', 't1')
  w = addTodo(w, 'Second todo', '2026-10-02T11:00:00Z', 't2')
  w = addTodo(w, 'Third todo', '2026-10-02T11:00:00Z', 't3')
  assert.deepEqual(sortedTodos(w).map(t => t.id), ['t3', 't2', 't1'])
  w = toggleTodo(w, 't3', '2026-10-02T12:00:00Z')
  assert.deepEqual(sortedTodos(w).map(t => t.id), ['t2', 't1', 't3'])
  const reloaded = migrateWorkspace(JSON.parse(JSON.stringify(w)))
  assert.equal(isWorkspace(reloaded), true)
  assert.deepEqual(sortedTodos(toggleTodo(reloaded, 't3', '2026-10-02T13:00:00Z')).map(t => t.id), ['t3', 't2', 't1'])
  assert.equal(w.todos.find(t => t.id === 't1').text, 'First todo')
  assert.equal(addTodo(w, ' ', '2026-10-02T13:00:00Z', 'blank'), w)
  assert.equal(addTodo(w, 'Duplicate', '2026-10-02T13:00:00Z', 't1'), w)
})
test('migration detaches habits and preserves todos, archives and repeated check-ins without mutating legacy data', () => {
  const old = { version: 3, goals: [{ id: 'g', name: 'Retired' }], habits: [{ ...habit, goalId: 'g', checkIns: ['2026-09-28', '2026-09-28'], archivedAt: '2026-09-29T10:00:00Z' }], todos: [{ id: 't', text: 'Keep', createdAt: '2026-09-28T10:00:00Z', completedAt: null }], sessions: [{ id: 's' }], breadcrumbs: [{ id: 'b' }], active: { goalId: 'g' } }
  const backup = structuredClone(old)
  const migrated = migrateWorkspace(old)
  assert.equal(migrated.version, 4)
  assert.equal('goalId' in migrated.habits[0], false)
  assert.deepEqual(migrated.habits[0].checkIns, old.habits[0].checkIns)
  assert.equal(migrated.habits[0].archivedAt, old.habits[0].archivedAt)
  assert.deepEqual(migrated.todos, old.todos)
  assert.deepEqual(Object.keys(migrated).sort(), ['habits', 'todos', 'version'])
  assert.deepEqual(old, backup)
  assert.deepEqual(migrateWorkspace({ version: 2, projects: [], sessions: [], breadcrumbs: [], active: null }), initialWorkspace)
  const { todos, ...older } = old
  assert.deepEqual(migrateWorkspace(older).todos, [])
  for (const bad of [null, {}, [{ id: 't', text: '', createdAt: 'bad', completedAt: null }]]) assert.equal(migrateWorkspace({ ...old, todos: bad }), null)
  assert.equal(migrateWorkspace({ version: 4, habits: [null], todos: [] }), null)
  assert.equal(migrateWorkspace({ version: 2, projects: [] }), null)
})
