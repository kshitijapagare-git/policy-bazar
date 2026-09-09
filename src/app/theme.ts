/**
 * Design tokens shared by the shell. Tailwind owns component-level styling;
 * this is only for the handful of values referenced from TypeScript.
 */
export const theme = {
  brand: {
    name: 'Insurance Portal',
    accent: 'sky',
  },
  layout: {
    sidebarWidth: '15rem',
    contentMaxWidth: '80rem',
  },
  surface: {
    page: 'bg-slate-50',
    card: 'bg-white ring-1 ring-slate-200',
  },
} as const

export type Theme = typeof theme
