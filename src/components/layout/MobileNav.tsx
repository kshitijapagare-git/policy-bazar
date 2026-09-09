import { useEffect } from 'react'
import { APP_TITLE } from '@/lib/constants'
import { Icon } from '@/components/ui'
import { SidebarNav } from './Sidebar'

export interface MobileNavProps {
  open: boolean
  onClose: () => void
}

/** Slide-over navigation for viewports below `md`, where the rail is hidden. */
export function MobileNav({ open, onClose }: MobileNavProps) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    // Stop the page behind the drawer from scrolling.
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className="relative flex h-full w-64 max-w-[80%] flex-col bg-white shadow-xl"
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span
              aria-hidden="true"
              className="grid h-7 w-7 place-items-center rounded-md bg-sky-600 text-xs font-bold text-white"
            >
              IP
            </span>
            {APP_TITLE}
          </span>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <SidebarNav onNavigate={onClose} />
      </div>
    </div>
  )
}
