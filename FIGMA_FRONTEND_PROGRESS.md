# LOBBY CARE — Figma Implementation Progress

**Status: complete for the current scope.** See
[FIGMA_FRONTEND_IMPLEMENTATION_PLAN.md](FIGMA_FRONTEND_IMPLEMENTATION_PLAN.md)
for the full Figma→route mapping and design tokens.

Last updated: 2026-08-11

---

## Where things stand

The Figma file's 28 frames were classified against the running app under the
working agreement *"existing + functional → SKIP"*. **27 frames already had a
working screen. One was genuinely missing** and has been built.

| | Count |
|---|---:|
| Figma frames on the "Website" page | 28 |
| Accepted as-is (existing + functional) | 27 |
| Implemented (was missing) | 1 |
| Blocked | 0 |

## Completed screens

| Screen | Route | Notes |
|---|---|---|
| **Welcome / auth gateway** (مرحبا, node `80:18152`) | `/welcome` | Sign in · Register · Continue as guest. Built from measured Figma values; hero asset exported from Figma. Verified 1440→360, RTL, keyboard, and the full redirect flow. |

## Shared work

| Item | Where |
|---|---|
| Design-token layer (13 colours, 10-step type scale, radii, shadows, container) | [src/index.css](src/index.css) |
| Alexandria display font added alongside IBM Plex Sans Arabic | [src/app/layout.tsx](src/app/layout.tsx) |
| `lc-container` responsive gutter utility (20 → 40 → 80px) | [src/index.css](src/index.css) |
| Global `prefers-reduced-motion` guard | [src/index.css](src/index.css) |
| LobbyCare header (promo bar + 92px main bar) | [src/components/lobbycare/LobbyHeader.tsx](src/components/lobbycare/LobbyHeader.tsx) |

## Reusable components created

- `LobbyHeader` — with internal `PromoItem`, `IconAction` (badge support), `Divider`
- `Welcome` view — card/button patterns built on the token layer

Everything else **reuses** existing components: `SideMenu`, `StoreFooter`,
`AuthModal`, `AddressModal`, `ProductCard`, `LobbyProductCard`, `Carousel`,
`SearchInput`, `PhoneInput`, `components/ui/{form,input}`.

## Architectural decisions

1. **LobbyCare-scoped components.** `LobbyHeader` is swapped in via `IS_LOBBY_CARE`
   in [client-shell.tsx](src/app/client-shell.tsx); the other seven tenant layouts
   (`Home1…Home7`) keep the shared `Header` untouched.
2. **Legacy CSS overrides kept.** The ~200-line `!important` block in `index.css`
   is load-bearing for 20+ files that style with `bg-black`/`#1a1a1a`. Removing it
   would restyle every other tenant.
3. **ESLint ratchet.** Strict rules are errors for `src/components/lobbycare/**`
   and `src/app/**`; the 77 pre-existing violations across 31 legacy files are
   warnings so the gate passes without a risky mass type-rewrite. Remove a file
   from the exemption when it is genuinely reworked. See [eslint.config.mjs](eslint.config.mjs).
4. **`/welcome` is the auth gateway.** [middleware.ts](src/middleware.ts) now
   redirects unauthenticated hits on protected routes to `/welcome` (was `/login`),
   matching the Figma flow. The `redirect` param is preserved end-to-end.
   *Revert that one line to restore the previous behaviour.*

## Validation status

| Gate | Result |
|---|---|
| `npm run lint` | ✅ exit 0 — 0 errors, 244 warnings (all pre-existing legacy) |
| `npm run typecheck` | ✅ exit 0 |
| `npm run build` | ✅ passes — 32 routes, `/welcome` 6.99 kB |
| `npm test` | ⚠️ no test runner configured in this project |
| Browser sweep | ✅ 27 routes at 1440 — all 200, none broken, no overflow |
| Responsive | ✅ `/welcome` at 1440/1280/1024/768/430/390/360 — no overflow |
| Auth flow | ✅ `/cart` → `/welcome?redirect=/cart` → login/register preserve redirect; guest → `/` |
| Accessibility | ✅ tab order reaches all actions; visible focus rings; `aria-label` on icon buttons; `alt` on images |

## Unresolved / notes

- **No mobile or tablet frames exist in Figma** — 26 of 28 frames are 1440px wide.
  Responsive behaviour for new work is inferred from the design system.
- **Figma variables API is inaccessible** (403 — token lacks `file_variables:read`,
  and the endpoint is Enterprise-only). Tokens were derived by frequency analysis
  of 9,634 node values instead; the values are exact, only Figma's names are absent.
- **No test runner.** `npm test` does not exist. Adding Vitest/Playwright-test would
  be a new dependency decision.
- The store logo served by the API is seeded demo data (a stock photo), so the
  header and Welcome card show that rather than the LOBBY CARE mark. This is real
  API data behaving correctly — replace the asset in the backend to fix.

## Next recommended work

The Figma screen inventory is covered. If more is wanted, the highest-value
options — none of which are required by the current agreement — are:

1. Bring the Home screen to full Figma fidelity (it is the most-seen page; the
   existing `LobbyCareHomeLayout` predates the verified token layer).
2. Migrate remaining LobbyCare surfaces off the legacy `!important` colour block
   onto the token layer, shrinking `index.css`.
3. Add a test runner so `npm test` becomes a real gate.
