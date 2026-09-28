import test from 'node:test'
import assert from 'node:assert/strict'
import { finishSession, initialWorkspace, isWorkspace, reorder } from '../src/lib/workspace.ts'

test('close-out preserves history, completes the source and creates one next step', () => {
  const started = { ...structuredClone(initialWorkspace), active: { projectId: 'app', breadcrumbId: 'b1', startedAt: '2026-09-27T10:00:00Z' } }
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
  const started = { ...initialWorkspace, active: { projectId: 'app', startedAt: '2026-09-27T10:00:00Z' } }
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
  assert.equal(isWorkspace({ ...initialWorkspace, projects: [null] }), false)
  assert.equal(isWorkspace({ ...initialWorkspace, active: { projectId: 'missing', startedAt: '2026-09-27T10:00:00Z' } }), false)
  assert.equal(isWorkspace({ ...initialWorkspace, active: { projectId: 'app', startedAt: 'invalid' } }), false)
})
