# Aspire Academy — Working Guide (Architecture & Conventions)

This document captures the **working method** for this project: where code lives, how the data flow works, and the rules/conventions to follow when adding new features. Follow it to keep the codebase consistent.

## Tech Stack & Runtime

- **Next.js 16** (App Router) + **Turbopack**
- **React 19** + **TypeScript** (strict)
- **MUI** (Material UI) for components
- **next-intl** for i18n (locales: `ar` / `en`, RTL support)
- Monorepo-side exports via `src/` path alias (`import X from 'src/...'`)

## Environment / Config

- `.env.local` holds:
  - `NEXT_PUBLIC_HOST_API=https://api-staging.aspirekwt.com/api/v1` — **do NOT change**
- `src/config-global.ts` exports `HOST_API`, `COOKIES_KEYS`, `PATH_AFTER_LOGIN`, etc.
- Backend base URL already ends with `/api/v1` → endpoint strings in actions must **NOT** repeat `/api/v1`.

---

## Folder Structure (The Core Rule)

```
src/
  app/[locale]/(dashboard)/<route>/page.tsx   → Next.js page (thin wrapper) -> renders the section view
  app/api/                                  → ❌ DO NOT CREATE / DO NOT USE (this folder is deleted)
  actions/                                  → Server Actions (backend API binding layer)
  sections/<feature>/                       → UI components (view.tsx + dialogs + sub-components)
  types/                                    → TypeScript types (one file per domain)
  utils/                                    → helpers, incl. crud-fetch-api.ts (the HTTP layer)
  routes/paths.ts                           → route path constants
```

### Where does each thing go?

| Concern | Location | Example |
|---|---|---|
| Page/Route | `src/app/[locale]/(dashboard)/<route>/page.tsx` | `src/app/[locale]/(dashboard)/specializations/page.tsx` |
| Backend API binding (server actions) | `src/actions/<domain>.ts` | `src/actions/specializations.ts` |
| UI components | `src/sections/<feature>/view.tsx` + dialogs | `src/sections/specializations/view.tsx` |
| Type definitions | `src/types/<domain>.ts` | `src/types/specialization.ts` |
| HTTP calls to backend | `src/utils/crud-fetch-api.ts` (don't call fetch directly) | `getData/postData/editData/deleteData` |
| Endpoint strings | `src/utils/endpoints.ts` (central registry) | `endpoints.countries.list` |

---

## Data Flow (Important)

```
Page (page.tsx)
   └─> renders
Section View (src/sections/<feature>/view.tsx)
   └─> calls directly (client to server action)
Server Action (src/actions/<domain>.ts)
   └─> calls crud-fetch-api helpers
crud-fetch-api.ts (getData / postData / editData / deleteData)
   └─> FETCH to backend (adds auth token, Accept-Language, base URL)
```

### Key Rules

1. **Client → Server Action directly.** The UI calls the server action directly. **Do NOT create `src/app/api/*` route handlers** — that folder is deleted and not used. Do NOT `fetch('/api/...')` from the client.
2. **`crud-fetch-api.ts` is the only place that talks to the backend.** It is a `'use server'` module. It reads the auth token + locale from `cookies()` and prepends `HOST_API` and endpoint to form the URL.
3. No `fetch` / axios directly in UI components for data. Use server actions.
4. **Filtering, data fetching, and state live inside the Section View** (client component), not in server code.

---

## How to Add a New Feature (Step by Step)

Let's add a CRUD feature for `<Domain>` (example used: **Specializations**).

### 1. Types — `src/types/<domain>.ts`
Create a dedicated types file per domain. Do **NOT** dump domain types into `crud-types.ts` (that file only holds shared/generic types like `ApiSingleResponse<T>`, `ApiResponse<T>`, `RequestOptions`, auth types).

```ts
// src/types/specialization.ts
export type Specialization = {
  id: string;
  nameAr: string;
  nameEn: string;
  fieldId: string;
  field: { id: string; name: string };
  isActive: boolean;
};

export type SpecializationListResponse = {
  items: Specialization[];
  totalCount: number;
};
```

Shared generic types live in `src/types/crud-types.ts`:
```ts
export type ApiSingleResponse<T> = { success: boolean; data?: T; error?: string };
```

### 2. Endpoints — `src/utils/endpoints.ts` (optional but recommended)
Register endpoint paths centrally (relative, WITHOUT `/api/v1`):
```ts
endpoints = {
  specializations: {
    list: '/admin/specializations',
    create: '/admin/specializations',
    details: (id) => `/admin/specializations/${id}`,
    update: (id) => `/admin/specializations/${id}`,
    delete: (id) => `/admin/specializations/${id}`,
  },
};
```
> Endpoints for related resources can live here too (e.g. `fields.list = '/admin/fields'`).

### 3. Server Actions — `src/actions/<domain>.ts`
A `'use server'` module. Each action wraps a `crud-fetch-api` helper in try/catch and returns `ApiSingleResponse<T>`.

```ts
// src/actions/specializations.ts
'use server';

import { getData } from 'src/utils/crud-fetch-api';
import type { ApiSingleResponse } from 'src/types/crud-types';
import type { SpecializationListResponse } from 'src/types/specialization';

export async function getSpecializations(
  params?: { IsActive?: boolean; Filter?: string; SkipCount?: number; MaxResultCount?: number }
): Promise<ApiSingleResponse<SpecializationListResponse>> {
  try {
    const res = await getData<SpecializationListResponse>('/admin/specializations');
    if ('success' in res && res.success) {
      return { success: true, data: res.data };
    }
    const errorMsg = 'error' in res ? (res as { error: string }).error : 'Failed to load';
    return { success: false, error: errorMsg };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to load' };
  }
}
```

**Server action conventions:**
- File starts with `'use server';`
- Every action returns `ApiSingleResponse<T>` (`{ success, data?, error? }`)
- Wrap the call in `try/catch`; return a `{ success: false, error }` object on failure.
- Export actions from `src/actions/index.ts` (barrel export).
- `skipAuth` option is used for public endpoints (e.g. login).

### 4. UI — `src/sections/<domain>/`
Create a folder per feature with:
- `view.tsx` — the main page component (`'use client'`). Holds state, **filters**, data fetching, and calls server actions.
- `new-edit-dialog.tsx` — add/edit form dialog(s).
- `delete-confirm-dialog.tsx` — delete confirmation dialog.

```tsx
// src/sections/specializations/view.tsx  (excerpt)
'use client';
import { getSpecializations } from 'src/actions/specializations';

export default function SpecializationsView() {
  // state, filters, etc.
  const fetchData = async () => {
    const res = await getSpecializations({ SkipCount: 0, MaxResultCount: 1000 });
    if (res.success && res.data) setItems(res.data.items);
  };
  // ...
}
```

**UI conventions:**
- Section views and dialogs are `'use client'` components.
- Use `SharedTable` from `src/components/SharedTable/SharedTable` + `cellAlignment` for tables.
- Use `useToast()` for success/error toasts; `useTranslations('Namespace')` from next-intl for all text.
- **Search inputs should be debounced** (e.g. keep raw input + a debounced value via `setTimeout`/`useRef`, ~400ms), then fetch with the debounced value.
- Add ALL UI string keys to both `messages/en.json` and `messages/ar.json`.

### 5. Page — `src/app/[locale]/(dashboard)/<route>/page.tsx`
A thin server (or client) component that just renders the section view.

```tsx
// src/app/[locale]/(dashboard)/specializations/page.tsx
import SpecializationsView from '@/sections/specializations/view';

export default function SpecializationsPage() {
  return <SpecializationsView />;
}
```

### 6. Sidebar — `src/components/Sidebar.tsx`
Add the new route to the sidebar. Groups use `children`; single items use `path`. Add translation keys under `Sidebar` namespace in both `messages/*.json`.

---

## Existing Reference Files

- **Actions:** `src/actions/auth.ts`, `src/actions/countries.ts`, `src/actions/specializations.ts`
- **Section CRUD pattern:** `src/sections/countries/` (view + dialogs + services)
- **Types:** `src/types/crud-types.ts` (shared), `src/types/specialization.ts` (domain)
- **HTTP layer:** `src/utils/crud-fetch-api.ts`
- **Endpoints registry:** `src/utils/endpoints.ts`
- **i18n:** `messages/en.json`, `messages/ar.json`, `src/i18n/config-locale.ts`

---

## Verification

- Run `npm run build` (or typecheck/lint if provided) before finishing to ensure compilation passes.
- Test the new route at `http://localhost:3000/<locale>/<route>` (e.g. `/ar/specializations`).
