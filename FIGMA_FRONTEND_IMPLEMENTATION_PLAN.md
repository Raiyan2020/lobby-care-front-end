# Figma → Frontend Implementation Plan — LOBBY CARE

**Figma file:** `KO9ZyAbg9LUGEGJ3HDs1PM` — "LOBBY CARE", last modified 2026-08-10
**Design source:** Figma REST API (full document cached locally; 19,190 nodes, 18.5 MB)
**Scope:** LobbyCare tenant layout only (Home1–Home7 left untouched)

| Phase | Status |
|---|---|
| 1 — Discovery / app audit | ✅ Complete |
| 2 — Figma inspection + mapping | ✅ Complete |
| 3 — Foundation (tokens) | ✅ Complete — token layer + Alexandria font + `typecheck` script |
| 4 — Shared layout | ✅ Header rebuilt & verified 1440→360; Footer/SideMenu accepted as-is |
| 5 — Screens | ✅ Complete — 27 existing accepted, 1 missing screen built |
| 6 — Real data | ✅ No API/state changes; all hooks preserved |
| 7 — Responsive | ✅ New screens verified at 1440/1280/1024/768/430/390/360 |
| 8 — Animation | ✅ Motion entrance on Welcome; `prefers-reduced-motion` honoured globally |
| 9 — Browser verification | ✅ 27-route sweep + per-width checks + auth-flow test |
| 10 — Quality gates | ✅ lint 0 errors · typecheck 0 · build passes |

### Working agreement (set by the user, 2026-08-11)

**Existing + functional screens are SKIPPED, not rebuilt.** Pixel-fidelity work applies
only to newly implemented screens. A Figma frame that differs visually from a working
page is *not* a reason to redo that page.

### Known issues resolved

| Issue | Resolution |
|---|---|
| Logo 404 — seeder stored `logo.svg`, disk had `logo.jpeg` | Fixed in `GeneralSettingSeeder` (also `favicon.svg` → `favicon.jpeg`, identical defect). Verified HTTP 200. |
| `npm run lint` fell into an interactive prompt | `eslint` 9 + `eslint-config-next` 15.5.19 added with a flat `eslint.config.mjs`; script is now `eslint .`. Passes with 0 errors. |

---

## 0. Design-source access — what is and isn't available

| Capability | Status |
|---|---|
| Document tree (all node geometry, fills, type, layout) | ✅ full access |
| Image/asset export | ✅ available |
| Published styles / components | ⚠️ **0 published** — nothing in a team library |
| Figma **variables** (`/variables/local`) | ❌ 403 — token lacks `file_variables:read`; endpoint is Enterprise-only |
| **Mobile / tablet frames** | ❌ **none exist** — 26 of 28 frames are 1440px |

**Consequences:**
1. Design tokens below are **derived by frequency analysis of 9,634 real node values**, not read from Figma variables. The values are exact; only Figma's own token *names* are unavailable.
2. **Responsive behaviour must be inferred.** The design is desktop-only, so tablet/mobile reflow follows the design system and standard commerce patterns, per §7 of the brief. This is the single largest source of deviation from "pixel-accurate" and is called out per-screen at review time.

---

## 1. Discovery — Existing Application Audit

### Stack

| Concern | Finding |
|---|---|
| Framework | Next.js **15.5.19**, App Router, React **19.2.7** |
| Language | TypeScript **5.8.3** |
| Styling | **Tailwind CSS v4** — CSS-first `@theme` in [src/index.css](src/index.css) |
| Data | **TanStack Query 5.101** — 14 hooks, provider in [src/app/providers.tsx](src/app/providers.tsx) |
| Forms | **react-hook-form 7.78** + **zod 4.4.3** + `@hookform/resolvers` 5.4 |
| Animation | **motion 12.40** — already used in 13 files |
| Icons / toasts / OTP | lucide-react 0.546 · sonner 2.0.7 · input-otp 1.4.2 |
| Component library | **none** — `components/ui/` holds only `form.tsx`, `input.tsx` |
| Auth | `localStorage` bearer token mirrored to `auth_token` cookie; [middleware.ts](src/middleware.ts) guards 8 protected + 4 guest-only prefixes |
| i18n / RTL | hand-rolled [i18n.ts](src/i18n.ts) (412 lines, ar/en); `dir` toggled on `<html>`; **Arabic is default** |
| API | 13 modules in [src/api/](src/api/) over `fetch` client; `NEXT_PUBLIC_API_BASE_URL` → Laravel 12 `/api/v1` |

### Architectural notes

- **Route pages are thin wrappers** (~11 lines each) delegating to `src/views/`. The redesign lands in `views/` + `components/`; **routing does not change**.
- **Prior LobbyCare work exists** — [LobbyCareHomeLayout.tsx](src/components/LobbyCareHomeLayout.tsx) (341 lines), [LobbyProductCard.tsx](src/components/lobbycare/LobbyProductCard.tsx) (150 lines). Its `--lc-*` colour tokens are now **verified correct** against Figma (see §2). Its section order also matches the Figma Home frame.
- **Token debt to remove**: ~200 lines of `!important` overrides in `index.css` keyed on escaped arbitrary classes (`.bg-\[\#1a1a1a\]`, `.text-\[\#c5a059\]`).
- **Missing infrastructure**: no `typecheck` script, no test runner, no Playwright config.

---

## 2. Design tokens — derived from 9,634 nodes

### Colour (frequency-ranked)

| Token | Value | Uses | Role |
|---|---|---:|---|
| `--lc-muted` | `#666666` | 1135 | body / secondary text |
| `--lc-white` | `#ffffff` | 797 | surfaces |
| `--lc-ink` | `#1f1f1f` | 543 | primary text |
| `--lc-green` | `#80b446` | 246 | **brand primary** |
| `--lc-muted-soft` | `#8a8a8a` | 211 | tertiary text |
| `--lc-surface` | `#f7f9f4` | 106 | tiles, trust strip, footer |
| `--lc-green-deep` | `#6b9a37` | 73 | hover / active |
| `--lc-green-light` | `#f1f7eb` | 69 | promo panel, soft fills |
| `--lc-border` | `#e8e8e8` | 66 | hairlines |
| `--lc-ink-soft` | `#424842` | 22 | *(new)* |
| `--lc-danger` | `#d93a3a` | 13 | *(new)* errors |
| `--lc-danger-bg` | `#fdecec` | 6 | *(new)* error surface |
| `--lc-green-dark` | `#4a7a35` | 6 | *(new)* |

✅ The eight pre-existing `--lc-*` values are confirmed against the design. ⚠️ `--lc-ink-hero: #163820` in the current CSS **does not appear anywhere** in the file — to be removed.

### Typography — **two families**

`IBM Plex Sans Arabic` (body/UI) and **`Alexandria`** (display/headings). The app currently loads **only IBM Plex Sans Arabic — Alexandria must be added.**

Line-height is a consistent ~1.72 ratio:

| Size | Line-height | Weights seen | Typical use |
|---:|---:|---|---|
| 44px | 55 | 700 | hero display |
| 20px | 34 | 600 | section heading |
| 19px | 32 | 700 | heading |
| 17px | 29 | 600 | subheading |
| 16px | 27 / 22 | 500, 600 | card title |
| 15px | 26 | 400, 500, 600 | **body default** (490 uses) |
| 14px | 24 | 400, 500, 600 | secondary |
| 13px | 22 | 400 | small |
| 12px | 20 | 400, 600 | caption |
| 11px | 19 | 600 (ls 0.28) | overline / badge |

### Spacing, radii, effects

- **Gap scale (4px-based):** 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48 — `8` dominates (545 uses), then `12`, `24`, `16`.
- **Container:** frame 1440 with 80px gutters → **1280px content width**.
- **Radii:** 5, 8, 9, 10, 12, 14, 16, 18, 20, and pill (Figma "fully rounded" sentinel). `10` and `12` dominate.
- **Common paddings:** `6/12/6/12` (badge), `14/20/14/20` (button), `16/16/16/16` (card), `0/16/0/16`, `0/80/0/80` (page gutter).
- **Shadows:** `0 4px 40px rgba(0,0,0,0.08)` (card), `0 1px 2px rgba(0,0,0,0.05)`, `0 1px 3px rgba(0,0,0,0.1)`, plus `0 0 0 1px #80b446` focus ring.

### Shared layout skeleton (identical across all screens)

```
Header        1440×136  = announcement bar 44 + main nav 92
PageHead      1440×~223 (inner pages)
Content       1280 wide, 80px gutters
Footer        1440×424
```

---

## 3. Mapping — Figma frame → application route

28 frames on the **Website** page. Arabic frame names translated.

Classification per the working agreement. Verified by a 27-route browser sweep
(every route returned 200, none broken, no horizontal overflow at 1440) plus
source inspection of the state-only frames.

| # | Figma Frame (ar) | English | Node | App Route | Classification |
|--:|---|---|---|---|---|
| 1 | الرئيسية | Home | `5:35` | `/` | SKIPPED — existing implementation accepted |
| 2 | من نحن | About Us | `32:21329` | `/about-us` | SKIPPED — existing implementation accepted |
| 3 | الأقسام | Categories | `15:2813` | `/categories` | SKIPPED — existing implementation accepted |
| 4 | تفاصبل المنتج | Product Details | `19:2368` | `/product/[id]` | SKIPPED — existing implementation accepted |
| 5 | سلة التسوق / بها | Cart — filled | `20:2938` | `/cart` | SKIPPED — existing implementation accepted |
| 6 | سلة التسوق / فارغة | Cart — empty | `29:10045` | `/cart` | SKIPPED — empty state exists (`Cart.tsx:153`) |
| 7 | 2- العنوان | Checkout — Address | `30:15135` | `/checkout` | SKIPPED — existing implementation accepted |
| 8 | اضف عنوان | Add address | `30:15533` | `AddressModal` | SKIPPED — reuses existing modal |
| 9 | 3- الدفع | Checkout — Payment | `30:16063` | `/checkout` | SKIPPED — existing implementation accepted |
| 10 | تم تاكيد | Order confirmed | `30:16433` | `/order-success` | SKIPPED — existing implementation accepted |
| 11 | حسابي | My Account | `32:20021` | `/account` | SKIPPED — existing implementation accepted |
| 12 | حسابي/طلباتي | My Orders | `54:2625` | `/orders` | SKIPPED — existing implementation accepted |
| 13 | عرض التفاصيل | Order detail | `54:893` | `/orders/[id]` | SKIPPED — existing implementation accepted |
| 14 | تفاصيل | Order detail panel | `54:12363` | `/orders/[id]` | SKIPPED — alternate state of #13 |
| 15 | حسابي/العناوين | Addresses | `54:3220` | `/addresses` | SKIPPED — existing implementation accepted |
| 16 | حسابي/المفضلة | Favourites | `54:13538` | `/favorites` | SKIPPED — existing implementation accepted |
| 17 | حسابي/المفضلة | Favourites — empty | `80:19415` | `/favorites` | SKIPPED — empty state exists (`Favorites.tsx:78`) |
| 18 | الشروط والخصوصية 1 | Terms & Privacy | `54:6686` | `/terms-privacy` | SKIPPED — existing implementation accepted |
| 19 | الشروط والخصوصية 2 | Terms & Privacy | `54:7202` | `/terms-privacy` | SKIPPED — alternate state of #18 |
| 20 | سياسة الإرجاع والتبديل | Return & Exchange | `54:8061` | `/return-exchange-policy` | SKIPPED — existing implementation accepted |
| 21 | حسابي/المظهر | Appearance / theme | `54:9779` | `/account` | SKIPPED — light/dark toggle exists in `Account.tsx` (desktop grid + mobile list), applied via `AppContainer.tsx:17` |
| 22 | Panel:margin | Contact panel | `80:19850` | `/contact` | SKIPPED — existing implementation accepted |
| 23 | **مرحبا** | **Welcome / auth gateway** | `80:18152` | **`/welcome`** | ✅ **IMPLEMENTED — was missing** |
| 24 | تسجيل دخول | Login | `80:18297` | `/login` | SKIPPED — existing implementation accepted |
| 25 | App | Login — split variant | `80:20082` | `/login` | SKIPPED — alternate state of #24 |
| 26 | تاكيد ع رقم الجوال | OTP verification | `80:18449` | `/verify` | SKIPPED — existing implementation accepted |
| 27 | انشاء حساب | Register | `80:18597` | `/register` | SKIPPED — existing implementation accepted |
| 28 | تم التحقق بنجاح | Verified success | `80:18757` | `/verify` | SKIPPED — success state exists (`Verify.tsx:48,222`) |

**Result: 27 accepted as-is · 1 implemented.** The application already covered
the Figma design's screen inventory; only the auth gateway was genuinely absent.

### Gaps — routes with **no** Figma frame

These stay on their current UI, restyled to the new token system for consistency:
`/brands` · `/notifications` · `/points` · `/products/[type]` · `/trending-products` · `/coming-soon` · `/order-fail` · `/account/edit` · `/account/change-password` · `/forgot-password` (+ `/verify`, `/reset`)

### New work implied by the design

- **`/account/appearance`** — a theme/appearance screen with no current route.
- **Two empty states** explicitly designed (cart, favourites) that must be built as first-class states.
- **Alexandria** font family must be added alongside IBM Plex Sans Arabic.

---

## 4. Home frame composition (`5:35`, 1440×3903)

| Band | Height | Maps to |
|---|---:|---|
| Header | 136 (44 + 92) | `Header.tsx` |
| Hero | 415 | new `Hero` |
| Category strip | 185 | `CategoryShortcuts` |
| Product section | 714 | `ProductSection` + `LobbyProductCard` |
| Promo banner | 497 | `PromoBanner` (619 copy / 661 image split) |
| Product section | 714 | `ProductSection` |
| Trust strip | 167 | `TrustStrip` |
| App + newsletter | 490 | `AppNewsletter` (628 / 628) |
| Footer | 424 | `StoreFooter.tsx` |

---

## 5. Decisions taken

1. **Scope** — LobbyCare only, per user direction. `Home1…Home7` untouched.
2. **No new UI dependency** — build on existing `components/ui` primitives rather than adding Radix, per the brief's "no unnecessary dependencies". Dialog/menu accessibility implemented manually (focus trap, `aria-modal`, Esc).
3. **Responsive is inferred**, not designed — see §0.
4. **Real data preserved** — every existing TanStack Query hook and `src/api` module stays; no hard-coded content.
