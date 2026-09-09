import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface CardProps {
  className?: string
  children: ReactNode
}

/** The standard surface: white, hairline border, soft shadow, generous radius. */
export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('rounded-2xl border border-slate-200/80 bg-white shadow-sm', className)}>
      {children}
    </div>
  )
}
