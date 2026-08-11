# Frontend Completion — Progress

Last updated: 2026-08-11 · Branch: `figma/lobbycare-implementation`

## Completed fixes

| # | Issue | Fix |
|---|---|---|
| 1 | **Post-auth redirect was broken.** The middleware set `?redirect=<path>`, but `Login`/`Verify` only read `localStorage['auth_redirect']` (written solely by Cart and Checkout). The two mechanisms never met, so signing in from any other protected route fell through to a `/home` default instead of the requested page. | Added `resolvePostAuthRedirect()` in [src/utils/auth.ts](src/utils/auth.ts) — query param wins, localStorage is the fallback, `/` is the default. Consumed in [Login.tsx](src/views/Login.tsx) and [Verify.tsx](src/views/Verify.tsx). |
| 2 | **Redirect was dropped at the `/verify` hop.** Register and the `needActive` login path navigate to `/verify`, losing the query string. | Added `persistPostAuthRedirect()`, called before each `/verify` navigation in [Login.tsx](src/views/Login.tsx) (2 sites) and [Register.tsx](src/views/Register.tsx). |
| 3 | **Open-redirect hardening.** `redirect` is user-supplied and was previously assigned straight to `window.location.href`. | The resolver accepts only same-origin absolute paths; `//evil.com`, absolute URLs, and paths without a leading slash fall back to `/`. |
| 4 | **`/home` default cost an extra hop.** The old fallback pointed at `/home`, which `next.config.ts` 308-redirects to `/`. | Default is now `/`. |

## Files changed

- `src/utils/auth.ts` — added `resolvePostAuthRedirect`, `persistPostAuthRedirect`
- `src/views/Login.tsx` — consume resolver; persist before `/verify` (2 sites)
- `src/views/Verify.tsx` — consume resolver
- `src/views/Register.tsx` — persist before `/verify`

## Flows verified in-browser

| Flow | Result |
|---|---|
| `/cart` guest → `/welcome?redirect=/cart` → sign in → **`/cart`** | ✅ (localStorage empty, proving the query param drives it) |
| `/orders` guest → `/welcome?redirect=/orders` → register → `/verify` → OTP → **`/orders`** | ✅ real API, real OTP, token issued |
| Continue as guest from `/welcome` | ✅ → `/` |
| Authenticated on `/welcome`, `/login`, `/register` | ✅ all → `/account`, no loops |
| Authenticated on `/orders`, `/account` | ✅ accessible |
| Smoke: `/`, `/welcome`, `/login`, `/register`, `/verify`, `/products`, `/categories` | ✅ render, no overflow, no console errors, no failing requests |

## Validation status

| Gate | Result |
|---|---|
| `npm run lint` | ✅ exit 0 — 0 errors, 244 warnings (pre-existing legacy ratchet) |
| `npm run typecheck` | ✅ exit 0 |
| `npm run build` | ✅ exit 0 — compiled successfully |
| `npm test` | ⛔ no test script exists in this project — not run |

## Intentionally left untouched

- **244 ESLint warnings** in legacy files — the ratchet in `eslint.config.mjs` permits these deliberately; new code is held to the full standard.
- **`src/data.ts`** — 148 lines of unrelated mock data (perfumes/watches) imported by nothing. Dead, not on a production path, so not bundled. Left alone rather than deleted as unrelated cleanup.
- **7 `@ts-ignore`s** — all suppress missing type declarations for `input-otp` / `country-code-emoji` in legacy files.
- **Existing pages** — accepted as-is per the working agreement.

## Known issues outside frontend scope

- **`GET /api/v1/general/countries` returns `null`.** The `countries` table has 57 rows, but every row has `status = 0` and the service filters to active rows. The frontend degrades correctly to its three hard-coded defaults (`+965`, `+971`, `+963`), so login/registration still work for the Kuwait market — but the real country list never reaches the UI, and the seeded `+966` demo users cannot sign in through the UI. **Backend fix: seed countries with `status = 1`.**
- A test account (`+965 51030778`) was created in the local dev DB while verifying the OTP flow. Harmless; delete if unwanted.

## Blockers

None.
