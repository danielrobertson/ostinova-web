import { forwardRef, useState } from 'react'
import type { HTMLAttributes } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import { SPRING_LAYOUT } from './ease'

// The source component omitted its hover helper. Keep the list semantic and
// animate a background within the hovered item rather than inserting a div in ul.
export const SharedLayoutBg = forwardRef<HTMLElement, HTMLAttributes<HTMLUListElement> & { as: 'ul'; inset?: number; pillClassName?: string; pillContainerClassName?: string }>(function SharedLayoutBg({ children, className, as: _as, inset: _inset, pillClassName: _pill, pillContainerClassName: _container, ...props }, ref) {
  const [position, setPosition] = useState<{ top: number; height: number } | null>(null)
  const reduce = useReducedMotion()
  return <ul {...props} ref={ref as React.Ref<HTMLUListElement>} className={cn('relative isolate', className)} onPointerMove={event => {
    if (event.pointerType === 'touch') return
    const item = (event.target as HTMLElement).closest('li')
    if (item && item.parentElement === event.currentTarget) setPosition({ top: item.offsetTop, height: item.offsetHeight })
  }} onPointerLeave={() => setPosition(null)}>
    <li aria-hidden="true" className="pointer-events-none absolute inset-x-0 -z-10 list-none"><motion.span className="absolute inset-x-0 rounded-xl bg-muted/70" initial={false} animate={{ y: position?.top ?? 0, height: position?.height ?? 36, opacity: position ? 1 : 0 }} transition={reduce ? { duration: 0 } : SPRING_LAYOUT} /></li>
    {children}
  </ul>
})
