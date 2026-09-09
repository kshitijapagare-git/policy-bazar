# Insurance Portal

Frontend-only React app for the `spec.json` in this directory: two entities
(**Policy**, **Claim**) with list / detail / create / edit, pagination, search
and filtering. There is no backend — every entity API ships an in-memory stub
seeded with data, selected by `VITE_USE_MOCK`.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

`.env` already contains:

```
VITE_USE_MOCK=true
VITE_API_BASE_URL=http://localhost:8080/api
```

With `VITE_USE_MOCK=true` the app is fully standalone. Flip it to `false` and
every call in `policyApi` / `claimApi` goes to `VITE_API_BASE_URL` instead, over
the shared `apiClient`; the mock and HTTP paths return the same shapes.

## Verify

```bash
npm test           # 117 unit/component tests (vitest + testing-library)
npm run lint       # eslint, zero warnings
npm run typecheck  # tsc project references
npm run build      # tsc -b && vite build
npm run test:e2e   # playwright — needs `npx playwright install chromium` first
```

## Layout

```
src/
  app/           router, theme tokens
  components/
    layout/      Layout, Header, Sidebar, MobileNav, PageHeader
    ui/          19 shared components, re-exported from ui/index.ts
  features/
    policies/    api/ mocks/ pages/ components/ __tests__/
    claims/      api/ mocks/ pages/ components/ __tests__/
  hooks/         useAsync, useDebounce, useListParams
  lib/           cn, apiClient, mockQuery, formatters, constants
  pages/         DashboardPage, NotFoundPage
  types/         Policy, Claim, ListParams, Paginated
e2e/             playwright smoke specs
```

### Responsive behaviour

The breakpoint that matters is `md` (768px), where the sidebar rail appears.
Below it, `MobileNav` provides a slide-over drawer: `Escape` and the backdrop
close it, background scrolling is locked while it is open, and following a link
dismisses it. Without that drawer the app would be unnavigable on a phone.

Tables collapse to stacked cards under 640px. The markup stays a single
semantic `<table>` at every width — only its `display` changes, and the row
labels come from `content: attr(data-label)` in a pseudo-element. Because that
text is not in the DOM, the accessibility tree and every test query still see
exactly one copy of each value. Columns opt in via the `Column` flags
`primary` (becomes the card title), `numeric` (tabular figures) and
`hideOnMobile`.

### How a list page is wired

`useListParams` owns page / search / sort / filter state and resets the page
whenever the matching set changes. `useDebounce` keeps typing from firing a
request per keystroke. `useAsync` re-runs the loader when those params change
and discards superseded responses. `queryCollection` in `lib/mockQuery.ts`
applies search, filters, sort and pagination in memory so the stub behaves like
a real paginated endpoint.

### The `policyId` relation

`spec.json` declares `policyId` as `many-to-one` onto `policy`. On the frontend
that renders as a dropdown on the claim form, populated by `policyApi.options()`,
and as a resolved label (`POL-1001 — Amelia Hart`) in the claims table and on the
claim detail page. `joinColumn` is required by the spec schema but unused here.

### Search fields

`Claim` declares `search: { fields: ["description"] }`, so claim search matches
descriptions only — searching a claim number returns nothing, which is asserted
in `claimApi.test.ts`. `Policy` declares no search config, so it falls back to
all of its string fields.

## Docker

`Dockerfile` and `nginx.conf` build the static site and serve it with nginx —
static hosting with an SPA fallback, not a backend.

```bash
docker build -t insurance-portal .
docker run -p 8080:80 insurance-portal
```
