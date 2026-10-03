import { Menu } from '@base-ui/react/menu'
import { Check, ChevronRight, ChevronDown, Monitor, Moon, Sun, UserRound } from 'lucide-react'

export type Theme = 'system' | 'light' | 'dark'
export function UserMenu({ theme, onThemeChange }: { theme: Theme; onThemeChange: (theme: Theme) => void }) {
  return <Menu.Root>
    <Menu.Trigger className="user-menu-trigger" aria-label="User menu">
      <span className="user-avatar"><UserRound size={16} /></span>
      <span className="user-menu-name">Local workspace</span>
      <ChevronDown size={13} className="user-menu-chevron" />
    </Menu.Trigger>
    <Menu.Portal><Menu.Positioner side="bottom" align="start" sideOffset={8} className="z-50">
      <Menu.Popup className="user-menu-popup">
        <div className="user-menu-heading">Local workspace<span>Saved on this device</span></div>
        <Menu.Separator className="user-menu-separator" />
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger className="user-menu-item" label="Appearance"><Sun size={15} /><span>Appearance</span><ChevronRight size={14} className="user-menu-check" /></Menu.SubmenuTrigger>
          <Menu.Portal><Menu.Positioner side="right" align="start" sideOffset={6} className="z-50">
            <Menu.Popup className="user-menu-popup appearance-submenu">
          <Menu.RadioGroup value={theme} onValueChange={value => onThemeChange(value as Theme)}>
            {([{ value: 'light', label: 'Light', Icon: Sun }, { value: 'dark', label: 'Dark', Icon: Moon }, { value: 'system', label: 'System', Icon: Monitor }] as const).map(({ value, label, Icon }) => <Menu.RadioItem key={value} value={value} className="user-menu-item"><Icon size={15} /><span>{label}</span><Menu.RadioItemIndicator className="user-menu-check"><Check size={14} /></Menu.RadioItemIndicator></Menu.RadioItem>)}
          </Menu.RadioGroup>
            </Menu.Popup>
          </Menu.Positioner></Menu.Portal>
        </Menu.SubmenuRoot>
      </Menu.Popup>
    </Menu.Positioner></Menu.Portal>
  </Menu.Root>
}
