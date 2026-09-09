import type { ReactElement, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

/** Exposes the current pathname so tests can assert on navigation. */
function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

export interface RenderRouteOptions {
  /** Route pattern the element is mounted at, e.g. `/policies/:id`. */
  path?: string
  initialEntries?: string[]
  extraRoutes?: { path: string; element: ReactNode }[]
}

export function renderRoute(element: ReactElement, options: RenderRouteOptions = {}) {
  const { path = '/', initialEntries = ['/'], extraRoutes = [] } = options

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <LocationProbe />
      <Routes>
        <Route path={path} element={element} />
        {extraRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route path="*" element={<div data-testid="elsewhere" />} />
      </Routes>
    </MemoryRouter>,
  )
}
