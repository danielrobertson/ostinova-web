import { SquareCheck, ListTodo, Target, X } from 'lucide-react'
import { AnimatedSidebar, AnimatedSidebarClose, AnimatedSidebarContent, AnimatedSidebarHeader, AnimatedSidebarMenu, AnimatedSidebarMenuButton, AnimatedSidebarMenuItem, AnimatedSidebarRail } from './ui/animated-sidebar'
import { UserMenu } from './ui/user-menu'
import type { Theme } from './ui/user-menu'

export function AppSidebar({ view, habitCount, goalCount, todoCount, theme, onThemeChange, navigate, inert }: { view: string; habitCount: number; goalCount: number; todoCount: number; theme: Theme; onThemeChange: (theme: Theme) => void; navigate: (view: string) => void; inert: boolean }) {
  return <AnimatedSidebar ariaLabel="Ostinova navigation" collapsible="icon" inert={inert} className="ostinova-sidebar" panelClassName="bg-sidebar ostinova-sidebar-panel">
    <AnimatedSidebarHeader className="p-3 pb-1">
      <div className="flex min-h-10 items-center gap-1">
        <UserMenu theme={theme} onThemeChange={onThemeChange} />
        <AnimatedSidebarClose className="shrink-0 text-muted-foreground hover:bg-muted md:hidden"><X size={16} /></AnimatedSidebarClose>
      </div>
    </AnimatedSidebarHeader>
    <AnimatedSidebarContent className="px-3 pt-3">
      <nav aria-label="Main navigation"><AnimatedSidebarMenu>
        <AnimatedSidebarMenuItem><AnimatedSidebarMenuButton icon={<ListTodo size={18} />} badge={habitCount} isActive={view === 'habits'} onSelect={() => navigate('habits')}>Habits</AnimatedSidebarMenuButton></AnimatedSidebarMenuItem>
        <AnimatedSidebarMenuItem><AnimatedSidebarMenuButton icon={<Target size={18} />} badge={goalCount} isActive={view !== 'habits' && view !== 'todos'} onSelect={() => navigate('goals')}>Goals</AnimatedSidebarMenuButton></AnimatedSidebarMenuItem>
        <AnimatedSidebarMenuItem><AnimatedSidebarMenuButton icon={<SquareCheck size={18} />} badge={todoCount} isActive={view === 'todos'} onSelect={() => navigate('todos')}>Todo</AnimatedSidebarMenuButton></AnimatedSidebarMenuItem>
      </AnimatedSidebarMenu></nav>
    </AnimatedSidebarContent>
    <AnimatedSidebarRail className="after:hidden" />
  </AnimatedSidebar>
}
