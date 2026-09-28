import { Check, ListTodo, Target, X } from 'lucide-react'
import { AnimatedSidebar, AnimatedSidebarClose, AnimatedSidebarContent, AnimatedSidebarFooter, AnimatedSidebarHeader, AnimatedSidebarMenu, AnimatedSidebarMenuButton, AnimatedSidebarMenuItem, AnimatedSidebarRail } from './ui/animated-sidebar'
import { UserMenu } from './ui/user-menu'
import type { Theme } from './ui/user-menu'

export function AppSidebar({ view, habitCount, goalCount, theme, onThemeChange, navigate, inert }: { view: string; habitCount: number; goalCount: number; theme: Theme; onThemeChange: (theme: Theme) => void; navigate: (view: string) => void; inert: boolean }) {
  return <AnimatedSidebar ariaLabel="Ostinova navigation" collapsible="icon" inert={inert} className="ostinova-sidebar" panelClassName="bg-sidebar">
    <AnimatedSidebarHeader className="p-3 pb-2">
      <div className="flex min-h-11 items-center gap-3 overflow-hidden px-2">
        <a href="#" aria-label="Ostinova home" onClick={event => { event.preventDefault(); navigate('habits') }} className="grid size-7 shrink-0 place-items-center rounded-lg border border-foreground/40 text-foreground"><Check size={18} strokeWidth={1.8} /></a>
        <span className="truncate text-sm font-semibold group-data-[state=collapsed]/sidebar:hidden">ostinova</span>
        <AnimatedSidebarClose className="ml-auto text-muted-foreground hover:bg-muted md:hidden"><X size={16} /></AnimatedSidebarClose>
      </div>
    </AnimatedSidebarHeader>
    <AnimatedSidebarContent className="px-3 pt-3">
      <nav aria-label="Main navigation"><AnimatedSidebarMenu>
        <AnimatedSidebarMenuItem><AnimatedSidebarMenuButton icon={<ListTodo size={18} />} badge={habitCount} isActive={view === 'habits'} onSelect={() => navigate('habits')}>Habits</AnimatedSidebarMenuButton></AnimatedSidebarMenuItem>
        <AnimatedSidebarMenuItem><AnimatedSidebarMenuButton icon={<Target size={18} />} badge={goalCount} isActive={view !== 'habits'} onSelect={() => navigate('goals')}>Goals</AnimatedSidebarMenuButton></AnimatedSidebarMenuItem>
      </AnimatedSidebarMenu></nav>
    </AnimatedSidebarContent>
    <AnimatedSidebarFooter className="border-none p-3"><UserMenu theme={theme} onThemeChange={onThemeChange} /></AnimatedSidebarFooter>
    <AnimatedSidebarRail />
  </AnimatedSidebar>
}
