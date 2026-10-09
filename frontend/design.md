# DreamKey CRM — Design System

> **Reference implementation:** `components/website-users/UsersTabContent.tsx`
> All new pages and sections must follow this design system strictly.

---

## 1. Core Principles

- **Dark mode first** — dark is the primary experience; light mode must also work but dark is default.
- **No rounded borders on containers** — Cards, panels, modals, and tables use **sharp/square corners** (zero border-radius). Only 1.5px dot indicators can be circular.
- **No `rounded-*` on any panel, card, modal, table, or button** — this is a non-negotiable rule.
- **Always design the scrollbar** — custom scrollbar styling must be applied wherever scrollable content exists.


---

## 2. Color Palette & Tokens

All colors must come from CSS variables defined in `app/globals.css`. Never hardcode hex values.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--background` | `#FFFFFF` | `#0B0B0B` | Page background |
| `--surface` | `#FFFFFF` | `#111111` | Card / panel background |
| `--surface-secondary` | `#F8F8F6` | `#171717` | Table headers, footer bars |
| `--foreground` | `#171717` | `#F8F8F6` | Primary text, active indicators |
| `--foreground-muted` | `#6B7280` | `#9CA3AF` | Secondary text |
| `--border` | `#E5E7EB` | `#262626` | All borders |
| `--border-subtle` | `#F3F4F6` | `#1C1C1C` | Dividers within surfaces |
| `--color-gold` | `#D4AF37` | `#D4AF37` | Brand accent, highlights |

### Tailwind class equivalents (via `@theme inline`)
- `bg-background`, `bg-surface`, `bg-surface-secondary`
- `text-foreground`, `text-muted-text`
- `border-border`
- `text-gold`, `bg-gold`

---

## 3. Typography

- **Font:** `Inter` (loaded via `next/font`, variable `--font-inter`)
- **Section labels:** `text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text`
- **Data values:** `text-xs font-bold text-foreground`
- **Stat numbers:** `text-2xl sm:text-3xl font-black tabular-nums tracking-tight`
- **Labels/meta:** `text-[10px] text-muted-text font-medium`
- **Table headers:** `text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text`
- **Button labels:** `text-[10px] font-bold uppercase tracking-wider`

---

## 4. Stat Cards

Stat cards sit in a **seamless grid** — no gaps between them, separated only by 1px border lines:

```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-border bg-border overflow-hidden">
  <div className="bg-surface flex flex-col gap-3 px-4 py-4 sm:py-5">
    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-text flex items-center gap-1.5">
      <Icon className="w-3 h-3" style={{ color: iconColor }} />
      LABEL
    </p>
    <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none">VALUE</span>
    <p className="text-[10px] text-muted-text">Sub text</p>
  </div>
</div>
```

- The outer div uses `bg-border` + `gap-px` to create 1px dividers between cells.
- No rounded corners, no shadows.
- Gold accent for primary stat: `style={{ color: 'var(--color-gold)' }}`

---

## 5. Control Bar (Search + Filters)

The control bar is a **single surface block** — no rounded corners. Filters use button pills, not `<select>`.

```tsx
<div className="bg-surface border border-border">
  {/* Search row */}
  <div className="flex items-stretch border-b border-border">
    <div className="relative flex-1">
      <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text" />
      <input className="w-full pl-10 pr-4 py-3 bg-transparent text-xs text-foreground placeholder:text-muted-text/50 focus:outline-none" />
    </div>
    <div className="flex items-center border-l border-border">
      <button className="h-full px-3 flex items-center gap-1.5 text-muted-text hover:text-foreground text-[10px] font-bold uppercase tracking-wider">
        <RefreshCw className="w-3.5 h-3.5" />
        Refresh
      </button>
    </div>
  </div>

  {/* Filter pill row */}
  <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto no-scrollbar">
    <button className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-foreground text-background">Active</button>
    <button className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground">Inactive</button>
    <div className="w-px h-4 bg-border mx-1" />
    {/* more filter groups */}
  </div>
</div>
```

---

## 6. Custom Dropdowns (replacing `<select>`)

**NEVER use `<select>` elements.** Always replace with one of these:

**Option A — Button group pills** (for ≤5 options, inline):
```tsx
{options.map(opt => (
  <button
    key={opt.value}
    onClick={() => setFilter(opt.value)}
    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
      filter === opt.value ? 'bg-foreground text-background' : 'text-muted-text hover:text-foreground'
    }`}
  >
    {opt.label}
  </button>
))}
```

**Option B — Custom dropdown panel** (for sort/many options):
```tsx
<div className="relative">
  <button
    onClick={() => setOpen(!open)}
    className="flex items-center gap-2 px-3 py-2 border border-border text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground transition-colors"
  >
    {currentLabel} <ChevronDown className="w-3 h-3" />
  </button>
  {open && (
    <div className="absolute top-full left-0 mt-px w-48 bg-surface border border-border shadow-lg z-10">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => { setFilter(opt.value); setOpen(false) }}
          className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground hover:bg-surface-secondary transition-colors"
        >
          {opt.label}
        </button>
      ))}
    </div>
  )}
</div>
```

---

## 7. Data Tables

```tsx
<div className="bg-surface border border-border overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-border bg-surface-secondary">
          <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text whitespace-nowrap">Column</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        <tr className="hover:bg-surface-secondary transition-colors cursor-pointer group">
          <td className="py-3.5 px-4">...</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

- No rounded corners on table container or cells.
- Row hover: `hover:bg-surface-secondary transition-colors`
- On row hover, name text: `group-hover:text-gold transition-colors`

---

## 8. Avatar / Initials

**Square only** — never `rounded-full`:

```tsx
<div
  className="w-8 h-8 flex items-center justify-center text-white font-black text-xs shrink-0"
  style={{ background: hashColor(item.email) }}
>
  {getInitials(item.name)}
</div>
```

Hash color palette: `['#D4AF37', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']`

---

## 9. Status Indicators

Do **NOT** use rounded pill badges. Use plain text with a 1.5px **square** dot:

```tsx
{/* Active */}
<span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-foreground">
  <span className="w-1.5 h-1.5 bg-foreground" />
  Active
</span>

{/* Inactive / Blocked */}
<span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-muted-text">
  <span className="w-1.5 h-1.5 bg-muted-text" />
  Inactive
</span>
```

---

## 10. Modals

```tsx
<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
  <div className="w-full sm:max-w-2xl bg-surface border border-border shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]">
    {/* Header */}
    <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">...</div>
    {/* Body — scrollable */}
    <div className="overflow-y-auto flex-1 divide-y divide-border">...</div>
    {/* Footer */}
    <div className="px-5 py-4 border-t border-border flex items-center justify-between shrink-0 bg-surface-secondary">...</div>
  </div>
</div>
```

- No `rounded-*` on modal panels.
- Mobile: slides from bottom. Desktop: centered.
- Close button: `w-8 h-8` square icon button, no rounding.

---

## 11. Buttons

| Type | Classes |
|---|---|
| Primary | `px-4 py-2 bg-gold text-background text-[10px] font-bold uppercase tracking-wider hover:bg-primary-hover transition-colors` |
| Secondary | `px-4 py-2 border border-border text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground hover:border-foreground/30 transition-colors` |
| Ghost icon | `w-7 h-7 flex items-center justify-center text-muted-text hover:text-gold hover:bg-gold/10 transition-colors` |
| Destructive text | `text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600` |

No `rounded-*` on any button.

---

## 12. Pagination

```tsx
<div className="px-4 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-secondary">
  <span className="text-[10px] font-medium text-muted-text uppercase tracking-wider">
    Showing <span className="text-foreground font-bold">{count}</span> of <span className="text-foreground font-bold">{total}</span> records
  </span>
  <div className="flex items-center gap-1">
    <button className="w-7 h-7 flex items-center justify-center border border-border text-muted-text hover:text-foreground disabled:opacity-30 transition-colors">
      <ChevronsLeft className="w-3.5 h-3.5" />
    </button>
    <span className="px-3 text-[10px] font-bold text-foreground uppercase tracking-wider">
      {page} / {totalPages}
    </span>
    <button className="w-7 h-7 flex items-center justify-center border border-border text-muted-text hover:text-foreground disabled:opacity-30 transition-colors">
      <ChevronsRight className="w-3.5 h-3.5" />
    </button>
  </div>
</div>
```

---

## 13. Custom Scrollbar (globals.css)

Add these to `app/globals.css`:

```css
/* Thin gold-accent scrollbar for all scrollable areas */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); }
::-webkit-scrollbar-thumb:hover { background: var(--color-gold); }

/* Utility to fully hide scrollbar (e.g., horizontal filter rows) */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

---

## 14. Loading & Empty States

**Loading:**
```tsx
<div className="flex flex-col items-center justify-center min-h-[320px] bg-surface border border-border">
  <Loader2 className="w-6 h-6 animate-spin text-gold mb-3" />
  <p className="text-xs font-medium text-muted-text uppercase tracking-wider">Loading...</p>
</div>
```

**Empty:**
```tsx
<div className="flex flex-col items-center justify-center min-h-[320px] bg-surface border border-border text-center px-4 py-12">
  <div className="w-12 h-12 border border-border flex items-center justify-center mb-4">
    <Icon className="w-5 h-5 text-muted-text" />
  </div>
  <h3 className="font-bold text-sm text-foreground uppercase tracking-wider mb-1">No Records Found</h3>
  <p className="text-xs text-muted-text max-w-xs">...</p>
</div>
```

---

## 15. Breadcrumbs Navigation

The reusable `<Breadcrumb />` component (`components/ui/Breadcrumb.tsx`) standardizes hierarchical navigation across all sub-pages and modules:

```tsx
import { Breadcrumb } from '@/components/ui/Breadcrumb'

<Breadcrumb
  items={[
    { label: 'Home', href: '/dashboard' },
    { label: 'Brokers' }
  ]}
/>
```

- **Styling:** `text-[10px] font-bold uppercase tracking-wider`
- **Separator:** ChevronRight icon `w-3 h-3 text-muted-text/40`
- **Root segment:** Auto-displays `<Home />` icon if label is `'Home'`
- **Inactive links:** `text-muted-text hover:text-gold transition-colors`
- **Current active page:** `text-foreground` (no link, `aria-current="page"`)

---

## 16. Skeleton Loaders & Page Loaders

The reusable Skeleton components (`components/ui/Skeleton.tsx`, `components/ui/PageSkeleton.tsx`, `components/ui/Loader.tsx`) provide smooth skeleton animations for Next.js route transitions and in-page data loading states.

### Base Component:
```tsx
import { Skeleton } from '@/components/ui/Skeleton'

<Skeleton className="h-4 w-32" />
<Skeleton className="w-8 h-8" />
```
- **Styling:** `animate-pulse bg-muted-text/15 dark:bg-border/80`
- **Zero rounded corners:** sharp rectangular shapes matching the design system
- **Light & Dark Theme:** semantic tokens ensure high contrast in light mode and subtle glow in dark mode

### Composable Skeletons:
- `<BreadcrumbSkeleton count={2} />`
- `<PageHeaderSkeleton hasButton={true} />`
- `<StatsRowSkeleton count={4} />`
- `<ControlBarSkeleton hasFilters={true} />`
- `<TableSkeleton rows={8} columns={6} />`
- `<DashboardOverviewSkeleton />`
- `<PageSkeleton variant="table" | "dashboard" | "custom" />`

### Next.js Route Loaders:
Used automatically in `loading.tsx` files for instant streaming & transitions:
- `app/dashboard/loading.tsx`
- `app/dashboard/brokers/loading.tsx`
- `app/dashboard/website-users/loading.tsx`
- `app/loading.tsx`

---

## 17. Global Navigation Loader

The global navigation loader (`context/NavigationLoaderContext.tsx`) provides immediate, visible feedback when navigating between routes, mitigating SSR route compilation latency:

- **Trigger:** Captures all Next.js `<Link>`, standard `<a>`, and `useRouter().push/replace/back/forward` clicks.
- **Visual Presentation:** Center floating panel with DreamKey logo (`/logorbg.png`, unspun) with 3 bouncing gold dots underneath, over a soft theme-adaptive backdrop blur (`bg-black/40 dark:bg-black/70`).
- **Safety Fallback:** Auto-resets if route transition takes longer than 5 seconds.
- **Provider:** Wrapped globally around `{children}` in `app/layout.tsx`.

---

---

## 18. Do's and Don'ts

| ✅ Do | ❌ Don't |
|---|---|
| Use sharp/square corners everywhere | Use `rounded-*` on cards, modals, buttons, badges |
| Use `bg-surface`, `bg-surface-secondary` tokens | Hardcode `bg-neutral-900` or `bg-white` |
| Use button-group pills for filters | Use `<select>` elements |
| Design custom scrollbars on all scrollable areas | Leave default browser scrollbars |
| Status as plain text + square dot | Use rounded pill badges with bg colors |
| Use `text-[9px]` / `text-[10px]` for labels | Use `text-sm` or larger for metadata labels |
| Use `font-black` + `tabular-nums` for stat numbers | Use regular font weight for numbers |
| Gold = accent only (icons, highlights, hover) | Use gold as a background for large areas |
| Avatar = square div with hashColor background | Use `rounded-full` avatars |
| **Use React Hook Form + Zod for ALL forms** | Use uncontrolled raw inputs or unvalidated manual states |

---

## 19. Forms & Validation Standard (React Hook Form + Zod)

**EVERY form across the entire CRM must use React Hook Form with Zod schema validation.**

### Requirements:
1. **Schema Definition:** Define explicit Zod schemas in `frontend/zod/` (e.g. `broker.ts`, `property.ts`, `auth.ts`).
2. **Hook Initialization:**
   ```tsx
   import { useForm } from 'react-hook-form'
   import { zodResolver } from '@hookform/resolvers/zod'
   import { propertyFormSchema, type PropertyFormValues } from '@/zod/property'

   const form = useForm<PropertyFormValues>({
     resolver: zodResolver(propertyFormSchema),
     defaultValues: { ... },
     mode: 'onTouched',
   })
   const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = form
   ```
3. **Error Styling:**
   - Errored inputs must highlight with `border-red-500 focus:border-red-500`.
   - Error text must display in `text-[10px] text-red-500 mt-1`.
   - Server errors must map back using `handleFormApiError(err, { setError, setBannerError })`.
4. **Fullscreen Maximize / Minimize:**
   - Multi-step or large modals must provide a `<Maximize2 />` / `<Minimize2 />` toggle in the header for comfortable editing.

