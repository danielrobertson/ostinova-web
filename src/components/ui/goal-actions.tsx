import { Menu } from '@base-ui/react/menu'
import { Archive, ArrowUpRight, MoreHorizontal } from 'lucide-react'

export function GoalActions({ name, canRemove, onOpen, onRemove }: { name: string; canRemove: boolean; onOpen: () => void; onRemove: () => void }) {
  return <Menu.Root>
    <Menu.Trigger className="icon-button row-action" aria-label={`Actions for ${name}`} title="Goal actions"><MoreHorizontal size={17} /></Menu.Trigger>
    <Menu.Portal><Menu.Positioner sideOffset={5} align="end" className="z-50"><Menu.Popup className="user-menu-popup">
      <Menu.Item className="user-menu-item" onClick={onOpen}><ArrowUpRight size={15} />Open goal</Menu.Item>
      <Menu.Separator className="user-menu-separator" />
      <Menu.Item className="user-menu-item" disabled={!canRemove} onClick={onRemove}><Archive size={15} />Remove goal</Menu.Item>
    </Menu.Popup></Menu.Positioner></Menu.Portal>
  </Menu.Root>
}
