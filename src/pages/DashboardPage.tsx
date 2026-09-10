import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, Icon, Spinner, StatusBadge, type IconName } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { cn } from '@/lib/cn'
import { formatCurrency, formatNumber } from '@/lib/formatters'
import { policyApi } from '@/features/policies/api/policyApi'
import { claimApi } from '@/features/claims/api/claimApi'

type Accent = 'sky' | 'emerald' | 'violet' | 'amber'

interface AccentStyle {
  card: string
  icon: string
  chevron: string
}

const ACCENTS: Record<Accent, AccentStyle> = {
  sky: {
    card: 'border-sky-100 bg-gradient-to-br from-white via-white to-sky-50/70',
    icon: 'bg-sky-100/80 text-sky-600',
    chevron: 'text-sky-400',
  },
  emerald: {
    card: 'border-emerald-100 bg-gradient-to-br from-white via-emerald-50/30 to-emerald-50/80',
    icon: 'bg-emerald-100/80 text-emerald-600',
    chevron: 'text-emerald-500',
  },
  violet: {
    card: 'border-violet-100 bg-gradient-to-br from-white via-violet-50/30 to-violet-50/80',
    icon: 'bg-violet-100/80 text-violet-600',
    chevron: 'text-violet-400',
  },
  amber: {
    card: 'border-amber-100 bg-gradient-to-br from-white via-amber-50/40 to-amber-50/90',
    icon: 'bg-amber-100/80 text-amber-600',
    chevron: 'text-amber-500',
  },
}

interface Tile {
  label: string
  value: string
  meta: string
  icon: IconName
  accent: Accent
  to: string
}

export function DashboardPage() {
  const { data, loading } = useAsync(async () => {
    const [policies, claims] = await Promise.all([
      policyApi.list({ page: 1, pageSize: 1000 }),
      claimApi.list({ page: 1, pageSize: 1000 }),
    ])

    return {
      policyCount: policies.total,
      claimCount: claims.total,
      activePolicies: policies.items.filter((policy) => policy.status === 'active').length,
      openClaims: claims.items.filter((claim) =>
        ['submitted', 'under_review'].includes(claim.status),
      ).length,
      premiumTotal: policies.items.reduce((sum, policy) => sum + policy.premium, 0),
      claimTotal: claims.items.reduce((sum, claim) => sum + claim.amount, 0),
      recentClaims: [...claims.items].sort((a, b) => b.id - a.id).slice(0, 5),
    }
  }, [])

  const { data: policyOptions } = useAsync(() => policyApi.options(), [])

  const policyLabels = useMemo(() => {
    const map = new Map<string, string>()
    for (const option of policyOptions ?? []) map.set(option.value, option.label)
    return map
  }, [policyOptions])

  if (loading || !data) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  const activeShare = data.policyCount
    ? Math.round((data.activePolicies / data.policyCount) * 100)
    : 0
  const openShare = data.claimCount ? Math.round((data.openClaims / data.claimCount) * 100) : 0

  const tiles: Tile[] = [
    {
      label: 'Policies',
      value: formatNumber(data.policyCount),
      meta: 'on the book',
      icon: 'shield',
      accent: 'sky',
      to: '/policies',
    },
    {
      label: 'Active policies',
      value: formatNumber(data.activePolicies),
      meta: `${activeShare}% of the book`,
      icon: 'check',
      accent: 'emerald',
      to: '/policies',
    },
    {
      label: 'Premium written',
      value: formatCurrency(data.premiumTotal),
      meta: 'annualised',
      icon: 'money',
      accent: 'violet',
      to: '/policies',
    },
    {
      label: 'Claims',
      value: formatNumber(data.claimCount),
      meta: 'filed to date',
      icon: 'claim',
      accent: 'sky',
      to: '/claims',
    },
    {
      label: 'Open claims',
      value: formatNumber(data.openClaims),
      meta: `${openShare}% awaiting a decision`,
      icon: 'pulse',
      accent: 'amber',
      to: '/claims',
    },
    {
      label: 'Claimed amount',
      value: formatCurrency(data.claimTotal),
      meta: 'across all claims',
      icon: 'money',
      accent: 'violet',
      to: '/claims',
    },
  ]

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A snapshot of the book of business." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((tile) => {
          const accent = ACCENTS[tile.accent]

          return (
            <Link
              key={tile.label}
              to={tile.to}
              className={cn(
                'group relative rounded-2xl border p-5 shadow-sm transition-all',
                'hover:-translate-y-0.5 hover:shadow-md',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600',
                accent.card,
              )}
            >
              <Icon
                name="chevron"
                className={cn(
                  'absolute right-4 top-4 h-4 w-4 transition-transform group-hover:translate-x-0.5',
                  accent.chevron,
                )}
              />

              <div className="flex items-start gap-3.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid h-11 w-11 shrink-0 place-items-center rounded-xl',
                    accent.icon,
                  )}
                >
                  <Icon name={tile.icon} className="h-5 w-5" />
                </span>

                <div className="min-w-0 pr-6">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-slate-500">
                    {tile.label}
                  </p>
                  <p className="numeric mt-0.5 text-2xl font-semibold tracking-tight text-slate-900">
                    {tile.value}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500">{tile.meta}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <Card className="mt-4 overflow-hidden sm:mt-6">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-3.5 sm:px-6">
          <h2 className="text-sm font-semibold text-slate-900">Latest claims</h2>
          <Link
            to="/claims"
            className="rounded text-xs font-medium text-sky-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            View all
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {data.recentClaims.map((claim) => (
            <li
              key={claim.id}
              className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <Link
                    to={`/claims/${claim.id}`}
                    className="rounded text-sm font-medium text-sky-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  >
                    {claim.claimNumber}
                  </Link>
                  <Link
                    to={`/policies/${claim.policyId}`}
                    className="rounded text-xs font-medium text-slate-500 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  >
                    {policyLabels.get(String(claim.policyId)) ?? `#${claim.policyId}`}
                  </Link>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">{claim.description}</p>
              </div>
              <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end sm:gap-4">
                <span className="numeric text-sm font-semibold text-slate-900">
                  {formatCurrency(claim.amount)}
                </span>
                <StatusBadge status={claim.status} />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
