import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'

export function Layout() {
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()

  // Following a link inside the drawer should dismiss it.
  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-slate-50 via-slate-50 to-sky-50/40">
      <Header onOpenNav={() => setNavOpen(true)} />
      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
