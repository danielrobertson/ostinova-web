import { useState } from 'react'
import { Combobox } from '@base-ui/react/combobox'
import { Check, Target } from 'lucide-react'
import type { Goal } from '../../lib/workspace'

export type GoalChoice = { id: string | null; name: string }
export function GoalPicker({ goals, value, onChange, onOpenChange, disabled }: { goals: Goal[]; value: GoalChoice; onChange: (choice: GoalChoice) => void; disabled: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState('')
  const available = goals.filter(g => !g.archivedAt)
  const term = query.trim()
  const items = [
    { id: '', name: 'Without a goal' },
    ...available.filter(g => g.name.toLowerCase().includes(term.toLowerCase())),
    ...(term && !available.some(g => g.name.toLowerCase() === term.toLowerCase()) ? [{ id: null, name: term }] : []),
  ]
  return <Combobox.Root<GoalChoice> items={items} filter={null} value={value} disabled={disabled} inputValue={query} onInputValueChange={setQuery} itemToStringLabel={item => item.name} isItemEqualToValue={(a, b) => a.id === b.id && a.name === b.name} onOpenChange={open => { setQuery(''); onOpenChange(open) }} onValueChange={choice => { if (choice) onChange(choice) }}>
    <Combobox.Trigger className="habit-goal-trigger" data-assigned={value.id !== '' || undefined} aria-label={`Assign goal: ${value.name}`} title={value.id === '' ? 'Assign a goal' : value.name}><Target size={17} /></Combobox.Trigger>
    <Combobox.Portal><Combobox.Positioner sideOffset={8} align="end" className="z-50">
      <Combobox.Popup className="goal-picker-popup">
        <Combobox.Input aria-label="Find or create a goal" placeholder="Find or create a goal…" maxLength={100} className="goal-picker-input" />
        <Combobox.List className="goal-picker-list">{(item: GoalChoice) => <Combobox.Item key={item.id ?? 'new'} value={item} className="goal-picker-item"><span>{item.id === null ? `Create goal “${item.name}”` : item.name}</span><Combobox.ItemIndicator><Check size={14} /></Combobox.ItemIndicator></Combobox.Item>}</Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner></Combobox.Portal>
  </Combobox.Root>
}
