import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Ostinova — Make room for what matters' },
      { name: 'description', content: 'A considered place to keep your habits and goals moving.' },
    ],
    links: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  }),
  component: Root,
})

function Root() {
  return <Document><Outlet /></Document>
}

function Document({ children }: { children: ReactNode }) {
  return <html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>
}
