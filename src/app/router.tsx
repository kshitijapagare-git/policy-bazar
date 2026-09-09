import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { DashboardPage } from '@/pages/DashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PolicyListPage } from '@/features/policies/pages/PolicyListPage'
import { PolicyDetailPage } from '@/features/policies/pages/PolicyDetailPage'
import { PolicyFormPage } from '@/features/policies/pages/PolicyFormPage'
import { ClaimListPage } from '@/features/claims/pages/ClaimListPage'
import { ClaimDetailPage } from '@/features/claims/pages/ClaimDetailPage'
import { ClaimFormPage } from '@/features/claims/pages/ClaimFormPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />

        <Route path="policies">
          <Route index element={<PolicyListPage />} />
          <Route path="new" element={<PolicyFormPage />} />
          <Route path=":id" element={<PolicyDetailPage />} />
          <Route path=":id/edit" element={<PolicyFormPage />} />
        </Route>

        <Route path="claims">
          <Route index element={<ClaimListPage />} />
          <Route path="new" element={<ClaimFormPage />} />
          <Route path=":id" element={<ClaimDetailPage />} />
          <Route path=":id/edit" element={<ClaimFormPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
