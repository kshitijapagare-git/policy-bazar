import { Link } from 'react-router-dom'
import { APP_TITLE } from '@/lib/constants'
import { USE_MOCK } from '@/lib/apiClient'
import { Badge, Icon } from '@/components/ui'

export interface HeaderProps {
  onOpenNav: () => void
}

export function Header({ onOpenNav }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-slate-200/80 bg-white px-3 sm:px-5">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={onOpenNav}
        className="-ml-1 rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden"
      >
        <Icon name="menu" />
      </button>

      <Link
        to="/"
        className="flex min-w-0 items-center gap-2.5 rounded-md text-[0.9375rem] font-semibold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        <span
          aria-hidden="true"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-500 text-xs font-bold text-white"
        >
          IP
        </span>
        <span className="truncate">{APP_TITLE}</span>
      </Link>

      <div className="ml-auto flex items-center gap-2">
        {USE_MOCK && (
          <Badge tone="info" className="hidden sm:inline-flex">
            Mock data
          </Badge>
        )}
      </div>
    </header>
  )
}
