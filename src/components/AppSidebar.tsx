import { SquareCheck, ListTodo, X } from 'lucide-react'
import { AnimatedSidebar, AnimatedSidebarClose, AnimatedSidebarContent, AnimatedSidebarHeader, AnimatedSidebarMenu, AnimatedSidebarMenuButton, AnimatedSidebarMenuItem, AnimatedSidebarRail } from './ui/animated-sidebar'
import { UserMenu } from './ui/user-menu'
import type { Theme } from './ui/user-menu'

export function AppSidebar({ view, habitCount, todoCount, theme, onThemeChange, navigate }: { view: string; habitCount: number; todoCount: number; theme: Theme; onThemeChange: (theme: Theme) => void; navigate: (view: string) => void }) {
  return <AnimatedSidebar ariaLabel="Ostinova navigation" collapsible="icon" className="ostinova-sidebar" panelClassName="bg-sidebar ostinova-sidebar-panel">
    <AnimatedSidebarHeader className="p-3 pb-1">
      <div className="flex min-h-10 items-center gap-1">
        <UserMenu theme={theme} onThemeChange={onThemeChange} />
        <AnimatedSidebarClose className="shrink-0 text-muted-foreground hover:bg-muted md:hidden"><X size={16} /></AnimatedSidebarClose>
      </div>
    </AnimatedSidebarHeader>
    <AnimatedSidebarContent className="px-3 pt-3">
      <nav aria-label="Main navigation"><AnimatedSidebarMenu>
        <AnimatedSidebarMenuItem><AnimatedSidebarMenuButton icon={<ListTodo size={16} />} badge={habitCount} isActive={view === 'habits'} onSelect={() => navigate('habits')}>Habits</AnimatedSidebarMenuButton></AnimatedSidebarMenuItem>
        <AnimatedSidebarMenuItem><AnimatedSidebarMenuButton icon={<SquareCheck size={16} />} badge={todoCount} isActive={view === 'todos'} onSelect={() => navigate('todos')}>Todos</AnimatedSidebarMenuButton></AnimatedSidebarMenuItem>
      </AnimatedSidebarMenu></nav>
    </AnimatedSidebarContent>
    <AnimatedSidebarRail className="after:hidden" />
  </AnimatedSidebar>
}
