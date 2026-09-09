import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { NAV_ITEMS } from '@/lib/constants'
import { Icon } from '@/components/ui'

export interface SidebarNavProps {
  onNavigate?: () => void
}

/** The link list itself, shared by the desktop rail and the mobile drawer. */
export function SidebarNav({ onNavigate }: SidebarNavProps) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600',
              isActive
                ? 'bg-gradient-to-r from-sky-50 to-sky-50/40 text-sky-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-sky-500 transition-opacity',
                  isActive ? 'opacity-100' : 'opacity-0',
                )}
              />
              <Icon
                name={item.icon}
                className={cn('h-5 w-5', isActive ? 'text-sky-600' : 'text-slate-400')}
              />
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 bg-white md:block">
      <div className="sticky top-14 px-1 py-2">
        <SidebarNav />
      </div>
    </aside>
  )
}
