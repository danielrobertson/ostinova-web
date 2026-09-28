import test from 'node:test'
import assert from 'node:assert/strict'
import { finishSession, initialWorkspace, isWorkspace, reorder } from '../src/lib/workspace.ts'

test('close-out preserves history, completes the source and creates one next step', () => {
  const started = { ...structuredClone(initialWorkspace), active: { goalId: 'app', breadcrumbId: 'b1', startedAt: '2026-09-27T10:00:00Z' } }
  const result = finishSession(started, { summary: ' Built the screen ', openLoops: ' Test mobile ', nextStep: ' Check keyboard navigation ' }, '2026-09-27T10:30:00Z', 'session-1')
  assert.equal(result.active, null)
  assert.equal(result.sessions[0].summary, 'Built the screen')
  assert.equal(result.breadcrumbs.find(b => b.id === 'b1').completedAt, '2026-09-27T10:30:00Z')
  assert.equal(result.breadcrumbs.at(-1).sessionId, 'session-1')
  assert.equal(result.breadcrumbs.at(-1).text, 'Check keyboard navigation')
  assert.equal(started.sessions.length, 0)
  assert.equal(finishSession(result, { summary: 'Retry', openLoops: '', nextStep: 'Retry' }, '2026-09-27T10:30:01Z', 'session-2'), result)
})
test('blank close-outs retain the active session', () => {
  const started = { ...initialWorkspace, active: { goalId: 'app', startedAt: '2026-09-27T10:00:00Z' } }
  assert.equal(finishSession(started, { summary: ' ', openLoops: '', nextStep: 'next' }, '2026-09-27T10:30:00Z', 'x'), started)
  assert.equal(finishSession(started, { summary: 'work', openLoops: '', nextStep: ' ' }, '2026-09-27T10:30:00Z', 'x'), started)
})
test('reordering preserves every item and leaves the source unchanged', () => {
  const result = reorder(initialWorkspace, 'b3', 'b1')
  assert.deepEqual(result.breadcrumbs.map(b => b.id), ['b3', 'b1', 'b2'])
  assert.equal(initialWorkspace.breadcrumbs[0].id, 'b1')
  assert.equal(reorder(initialWorkspace, 'missing', 'b1'), initialWorkspace)
})
test('stored workspace validation rejects legacy, malformed and orphaned data', () => {
  assert.equal(isWorkspace(initialWorkspace), true)
  assert.equal(isWorkspace({ habits: [], goals: [] }), false)
  assert.equal(isWorkspace({ ...initialWorkspace, goals: [null] }), false)
  assert.equal(isWorkspace({ ...initialWorkspace, active: { goalId: 'missing', startedAt: '2026-09-27T10:00:00Z' } }), false)
  assert.equal(isWorkspace({ ...initialWorkspace, active: { goalId: 'app', startedAt: 'invalid' } }), false)
})

import { dateKey, isDue, migrateWorkspace, toggleHabit, weeklyCount } from '../src/lib/workspace.ts'
const habit = { id: 'h', goalId: 'app', name: 'Practice', schedule: 'daily', weekdays: [1, 3, 5], target: 2, checkIns: [] }
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
test('v2 migration preserves references, active sessions and the original object', () => {
  const old = { version: 2, projects: initialWorkspace.goals, sessions: [{ id: 's', projectId: 'app', startedAt: '2026-09-27T10:00:00Z', finishedAt: '2026-09-27T11:00:00Z', summary: 'Work', openLoops: '', nextStep: 'Next' }], breadcrumbs: [{ id: 'b', projectId: 'app', text: 'Next', completedAt: null }], active: { projectId: 'app', startedAt: '2026-09-28T10:00:00Z', breadcrumbId: 'b' } }
  const migrated = migrateWorkspace(old)
  assert.equal(migrated.version, 3)
  assert.equal(migrated.active.goalId, 'app')
  assert.equal(migrated.sessions[0].goalId, 'app')
  assert.equal(migrated.breadcrumbs[0].id, 'b')
  assert.deepEqual(migrated.habits, [])
  assert.equal(old.active.projectId, 'app')
  assert.equal(migrateWorkspace({ version: 2, projects: [] }), null)
})
test('habits must reference an existing goal and a valid repeat rule', () => {
  assert.equal(isWorkspace({ ...initialWorkspace, habits: [habit] }), true)
  assert.equal(isWorkspace({ ...initialWorkspace, habits: [{ ...habit, goalId: 'missing' }] }), false)
  assert.equal(isWorkspace({ ...initialWorkspace, habits: [{ ...habit, schedule: 'days', weekdays: [] }] }), false)
  assert.equal(isWorkspace({ ...initialWorkspace, habits: [{ ...habit, target: 8 }] }), false)
})

test('standalone habits persist and retain check-ins through assignment and removal', () => {
  const standalone = { ...habit, goalId: null }
  const w = { ...structuredClone(initialWorkspace), goals: [], breadcrumbs: [], habits: [standalone] }
  assert.equal(isWorkspace(w), true)
  const checked = toggleHabit(w, 'h', new Date(2026, 8, 28))
  const reloaded = migrateWorkspace(JSON.parse(JSON.stringify(checked)))
  assert.deepEqual(reloaded.habits[0].checkIns, ['2026-09-28'])
  const assigned = { ...reloaded, goals: initialWorkspace.goals, habits: reloaded.habits.map(h => ({ ...h, goalId: 'app' })) }
  assert.equal(isWorkspace(assigned), true)
  const detached = { ...assigned, habits: assigned.habits.map(h => ({ ...h, goalId: null })) }
  assert.equal(isWorkspace(detached), true)
  assert.deepEqual(detached.habits[0].checkIns, ['2026-09-28'])
  assert.deepEqual(toggleHabit(detached, 'h', new Date(2026, 8, 28)).habits[0].checkIns, [])
  assert.equal(isWorkspace({ ...w, habits: [{ ...standalone, goalId: '' }] }), false)
})

import { removeGoal } from '../src/lib/workspace.ts'
test('goal removal preserves history and detaches habits without deleting check-ins', () => {
  const w = { ...structuredClone(initialWorkspace), habits: [{ ...habit, checkIns: ['2026-09-27'] }] }
  const removed = removeGoal(w, 'app', '2026-09-27T12:00:00Z')
  assert.equal(isWorkspace(removed), true)
  assert.equal(removed.goals[0].archivedAt, '2026-09-27T12:00:00Z')
  assert.equal(removed.habits[0].goalId, null)
  assert.deepEqual(removed.habits[0].checkIns, ['2026-09-27'])
  assert.deepEqual(removed.breadcrumbs, w.breadcrumbs)
  assert.deepEqual(removed.sessions, w.sessions)
  assert.equal(migrateWorkspace(JSON.parse(JSON.stringify(removed))).goals[0].archivedAt, removed.goals[0].archivedAt)
  assert.equal(removeGoal(removed, 'app', '2026-09-28T12:00:00Z'), removed)
  const active = { ...w, active: { goalId: 'app', startedAt: '2026-09-27T10:00:00Z' } }
  assert.equal(removeGoal(active, 'app', '2026-09-27T12:00:00Z'), active)
})

import { defaultGoalColor, normalizeDefaultGoalColor } from '../src/lib/workspace.ts'
test('only the old default purple goal color changes to shadcn blue', () => {
  const w = { ...structuredClone(initialWorkspace), goals: [
    { id: 'a', name: 'Old default', color: '#8b9cf7' },
    { id: 'b', name: 'Other color', color: '#c6a676' },
  ] }
  const normalized = normalizeDefaultGoalColor(w)
  assert.deepEqual(normalized.goals.map(g => g.color), [defaultGoalColor, '#c6a676'])
  assert.equal(w.goals[0].color, '#8b9cf7')
  assert.equal(normalizeDefaultGoalColor(normalized), normalized)
})
