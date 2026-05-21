# SummaryVideos — Project Context for AI

## What This Is

SummaryVideos is a Next.js 15 web app that lets users submit public video URLs (YouTube, Vimeo, Twitter) and receive AI-generated summaries, timestamped transcripts, key insights, and mind maps. Credits are consumed per submission. Users can buy credits via a wallet page.

Production URL: https://summaryvideos.com  
API base: configured via `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:5000`)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui pattern, tw-animate-css |
| Icons | `@hugeicons/react` + `@hugeicons/core-free-icons` |
| State (client) | Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) |
| State (server) | TanStack Query v5 (`@tanstack/react-query`) |
| Forms | react-hook-form + @hookform/resolvers |
| HTTP | Axios (with auth interceptor) |
| PDF export | jsPDF v4 |
| Date utils | dayjs |
| Validation schema | @sinclair/typebox |
| Component primitives | Radix UI (Dialog, Accordion, Tabs, Label, Slot) |
| Page transitions | next-view-transitions (View Transitions API) |
| I18n | Custom React context (EN + PT-BR; no routing restructure) |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        # Landing page (public) → redirects to /dashboard if authed
│   ├── layout.tsx                      # Root layout: Inter font, GlobalProvider, AuthDialog
│   ├── globals.css                     # Tailwind v4 @theme tokens + CSS variables (light/dark)
│   ├── error.tsx                       # Error boundary page (auto-redirects home in 8s)
│   ├── not-found.tsx                   # 404 page (auto-redirects home in 5s)
│   ├── auth/callback/page.tsx          # OAuth callback handler (reads ?token= from URL)
│   └── (private)/
│       ├── layout.tsx                  # Private layout (passthrough, no auth guard)
│       ├── dashboard/page.tsx          # Main dashboard: URL form + submissions list + FAQ
│       ├── wallet/page.tsx             # Credits balance + transaction history + buy credits dialog
│       └── submissions/[id]/page.tsx   # Submission detail: Summary / Transcript / Insights tabs
│
├── components/
│   ├── AuthDialog.tsx                  # Login/signup modal (Redux-controlled, custom implementation)
│   ├── layout/
│   │   └── private-header.tsx          # Sticky header: logo, nav, credits, theme toggle, profile dropdown
│   ├── submissions/
│   │   ├── submission-list.tsx         # Filtered + searchable grid of SubmissionCards
│   │   ├── submission-card.tsx         # Card with status badge, thumbnail, polling for in-progress
│   │   ├── submission-header.tsx       # Detail page header: thumbnail, title, status, metadata
│   │   ├── summary-metrics.tsx         # Metric grid (Duration, Topics, Insights, Complexity)
│   │   ├── transcript-view.tsx         # Timestamped transcript list
│   │   └── video-preview.tsx           # Thumbnail + metadata before submission (from oEmbed)
│   ├── insights/
│   │   ├── insights-list.tsx           # Confidence-badged insights with section icons
│   │   └── mind-map.tsx                # Visual tree: root → branches → children
│   ├── faq/
│   │   └── faq-accordion.tsx           # Radix Accordion with markdown-like rendering
│   └── ui/
│       ├── action-buttons.tsx          # Download PDF / Copy / Share button group
│       ├── view-toggle.tsx             # List View / Mind Map switcher
│       ├── breadcrumb.tsx              # Back nav breadcrumb
│       ├── button.tsx                  # shadcn Button (CVA variants)
│       ├── card.tsx                    # shadcn Card
│       ├── custom-select.tsx           # Design-system dropdown (replaces native <select>)
│       ├── dialog.tsx                  # Radix Dialog wrapper
│       ├── reveal.tsx                  # Scroll-triggered reveal wrapper (<Reveal delay={0-5}>)
│       ├── scroll-to-top.tsx           # Fixed scroll-to-top button (appears after 400px scroll)
│       ├── tabs.tsx                    # Radix Tabs wrapper
│       ├── accordion.tsx               # Radix Accordion wrapper
│       ├── badge.tsx                   # Badge (secondary / destructive variants)
│       ├── input.tsx                   # Input field
│       └── label.tsx                   # Form label
│
├── hooks/
│   └── use-intersection.ts             # IntersectionObserver hook for scroll-triggered reveals
│
├── core/
│   ├── store.ts                        # Redux store (auth + dialog reducers)
│   ├── hooks.ts                        # useAppDispatch, useAppSelector typed hooks
│   ├── providers/
│   │   ├── GlobalProvider.tsx          # Redux Provider + QueryProvider + AuthInitializer
│   │   └── QueryProvider.tsx           # TanStack QueryClient with retry logic + devtools
│   └── slices/
│       ├── authSlice.ts                # Auth state: user, token, isAuthenticated; loginUser/signupUser/fetchProfile thunks
│       └── dialogSlice.ts             # Dialog state: isOpen, mode (login|signup)
│
├── lib/
│   ├── utils.ts                        # cn() (clsx+twMerge), formatDuration(seconds→"M:SS")
│   ├── api/
│   │   ├── axios.ts                    # Axios instance with Bearer token interceptor + 401 redirect
│   │   ├── authApi.ts                  # signup, login, getProfile, getOAuthUrl, getCredits, redeemPromoCode, claimGithubCredits, getReferralInfo
│   │   ├── videoInsightApi.ts          # submitVideo, getVideos, getVideo, getVideoStatus
│   │   └── hooks.ts                    # TanStack Query hooks: useVideos, useVideo, useVideoStatus, useSubmitVideo, useCredits, useRedeemPromoCode, useClaimGithubCredits, useReferralInfo
│   ├── i18n/
│   │   ├── index.tsx                   # I18nProvider, useT(), useI18n() hooks; localStorage + browser locale detection
│   │   └── locales/
│   │       ├── en.ts                   # English translations (~120 keys)
│   │       └── pt-br.ts               # Portuguese (Brazil) translations
│   └── utils/
│       ├── date-formatter.ts           # formatSubmissionDate(iso→"Submitted on MMM D, YYYY")
│       ├── video-metadata.ts           # Platform detection + oEmbed fetch (YouTube/Vimeo/Twitter)
│       ├── youtube-metadata.ts         # (legacy) YouTube-specific oEmbed helpers
│       └── export-utils.ts            # downloadAsPDF, copyToClipboard, shareContent (jsPDF)
│
└── types/
    ├── auth.ts                         # User, AuthState, LoginFormData, SignupFormData, AuthDialogState
    ├── submission.ts                   # Submission, Summary, Transcript, Insights, MindMap types
    └── api.ts                          # (placeholder) Video type
```

---

## Routes

| Route | Auth | Description |
|---|---|---|
| `/` | Public | Landing page; auto-redirects to `/dashboard` if authenticated |
| `/dashboard` | Private | URL input form + submissions grid + FAQ |
| `/wallet` | Private | Credits balance, transaction history, buy credits dialog |
| `/submissions/[id]` | Private | Summary / Transcript / Insights tabs for a completed video |
| `/auth/callback` | Public | Handles OAuth redirect with `?token=` param |

> **Note:** The `(private)` route group layout is a passthrough — it has no auth guard. Auth is enforced implicitly by Redux state and the `GlobalProvider` `AuthInitializer`, but there is no middleware-level route protection.

---

## State Architecture

### Redux (global client state)
```
store
├── auth: AuthState
│   ├── user: User | null
│   ├── token: string | null       ← synced to localStorage + cookie
│   ├── isAuthenticated: boolean
│   ├── isLoading: boolean
│   └── error: string | null
└── dialog: AuthDialogState
    ├── isOpen: boolean
    └── mode: 'login' | 'signup'
```

### TanStack Query (server state)
| Query key | Hook | Description |
|---|---|---|
| `["videos"]` | `useVideos` | All user submissions (30s stale) |
| `["video", id]` | `useVideo` | Single video details (60s stale) |
| `["video-status", id]` | `useVideoStatus` | Poll status every 10s while pending/transcribing/downloaded |
| `["credits"]` | `useCredits` | Credits + transaction list (30s stale) |
| `["referral"]` | `useReferralInfo` | Referral code, URL, count, credits earned (5 min stale, no retry) |

---

## API Endpoints

All requests go to `NEXT_PUBLIC_API_BASE_URL`. Auth token added as `Authorization: Bearer <token>` via Axios interceptor. 401 responses clear token and redirect to `/`.

| Method | Path | Description |
|---|---|---|
| POST | `/auth/signup` | Create account; accepts optional `referralCode` in body |
| POST | `/auth/login` | Login → returns `{ user, token }` |
| GET | `/user/profile` | Current user data |
| GET | `/user/referral` | Referral code + URL + stats |
| GET | `/auth/oauth/:provider` | OAuth redirect (`google` \| `discord` \| `github`) |
| GET | `/credits` | Credits balance + paginated transactions |
| POST | `/credits/redeem` | Redeem a promo code → `{ credits, coinsAdded, message }` |
| POST | `/credits/claim/github` | Claim star/fork credits → `{ credits, coinsAdded, message }` |
| POST | `/video` | Submit video URL |
| GET | `/video` | List all user videos |
| GET | `/video/:id` | Get video detail (summary, transcript, insights, mindMap) |
| GET | `/video/:id/status` | Polling endpoint: `{ status, progress? }` |

### Video Statuses
`pending` → `downloaded` → `transcribing` → `completed` | `failed`

---

## Design System

- **Colors:** Tailwind CSS v4 OKLCH tokens via CSS variables in `globals.css`. Primary accent: indigo/purple (`#6366f1`, `#7E1DFD`). Brand gradient: orange→purple (`#F2A240 → #af65ab → #7E1DFD`).
- **Radius:** `--radius: 0.625rem` (base), with `sm/md/lg/xl` scale
- **Typography:** Inter (Google Fonts)
- **Dark mode:** CSS class-based (`.dark`), defined in `globals.css`
- **Spacing/layout:** max-w-7xl containers with px-4 padding, responsive grid layouts
- **Component style:** shadcn/ui pattern — CVA variants, Radix primitives, `cn()` utility

---

## Known Bugs

### 1. ✅ Fixed: Duplicate video submission on URL processing
**File:** `src/app/(private)/dashboard/page.tsx`  
**Issue:** When a user submits a video URL, the API call fires twice, creating two separate video entries in the database.  
**Likely cause:** `useSubmitVideo` mutation triggered more than once — possible double-render or missing guard in the submit handler.  
**Fix:** Added `submitVideoMutation.isPending` guard to `handleProcessVideo` function to prevent re-firing mutations during in-flight requests.

### 2. ✅ Fixed (API-side): Emoji rendering corruption in Insights section
**File:** `src/components/insights/insights-list.tsx`  
**Issue:** `section.icon` from the API is a UTF-8 emoji string (e.g. `💡`) but renders as mojibake (`ðŸ'¡`).  
**Fix:** API now adds `Content-Type: application/json; charset=utf-8` via an `onSend` hook in `server.ts`. Client-side no changes needed.

### 3. ✅ Fixed: Wallet pagination is fake
**File:** `src/app/(private)/wallet/page.tsx`  
**Issue:** Pagination UI is rendered but non-functional. Always shows first N transactions.  
**Fix:** Added `page` state, `ITEMS_PER_PAGE = 20`, updated `useCredits(page, ITEMS_PER_PAGE)` hook signature to pass `limit`/`offset` to the API, and replaced the static "Showing X of Y" line with real Prev/Next pagination buttons.

### 4. Summary metric "Duration: N/A"
**File:** `src/app/(private)/submissions/[id]/page.tsx`  
**Issue:** The API sends `"N/A"` for duration in the metrics array even though `videoData.duration` is a valid number. The header shows correctly via `formatDuration()`. Client should override the API value with `videoData.duration` when available.

### 5. ✅ Fixed: No route-level auth guard
**File:** `src/middleware.ts`  
**Fix:** `src/middleware.ts` added with `PROTECTED_ROUTES` array covering `/dashboard`, `/wallet`, `/submissions`. Checks `auth_token` cookie (with Authorization header fallback), redirects to `/` if absent. Includes security headers and legacy URL redirects.

### 6. ✅ Fixed: `setAuthDialogState` dead code
**File:** `src/core/slices/authSlice.ts`  
**Issue:** Empty reducer superseded by `dialogSlice`. Safe to delete.  
**Fix:** Code was already removed from authSlice.ts (only `logout`, `clearError`, and `setOAuthSession` remain). No references found in codebase.

### 7. ✅ Fixed: `exampleSlice.ts` unused
**File:** `src/core/slices/exampleSlice.ts`  
**Issue:** Not wired into the Redux store. Dead code.  
**Fix:** File never existed in the codebase. store.ts only imports authReducer and dialogReducer. No references to exampleSlice found.

### 8. AuthDialog custom modal instead of Radix Dialog
**File:** `src/components/AuthDialog.tsx`  
**Issue:** Implements its own fixed overlay modal rather than using `src/components/ui/dialog.tsx`. Missing Radix focus trap and ARIA attributes.

### 9. No feedback on copy / PDF download buttons *(may be fixed — verify)*
**File:** `src/components/ui/action-buttons.tsx`  
**Issue:** After clicking "Copy" or "Download PDF", no visual confirmation is shown. Users can't tell if the action succeeded.  
**Note:** Scan found `copied` state + "Copied!" / "Saving…" feedback present at lines 34–40. Verify the UI actually renders it before closing.

### 10. ✅ Fixed: View toggle hover: black background + dark text
**File:** `src/components/ui/view-toggle.tsx`  
**Issue:** The hover state on the inactive view toggle option renders with a black background and dark-colored text, resulting in very low contrast and unreadable text.  
**Fix:** Changed inactive button hover background from `hover:bg-[var(--rule-soft)]` to `hover:bg-[var(--play)]/10` for better contrast.

### 11. PDF export is broken / malformatted
**File:** `src/lib/utils/export-utils.ts`  
**Issue:** PDF output does not use the brand colors or logo, content structure is incorrect (missing sections, wrong layout). Needs full audit against actual data shape (summary, transcript, insights, mind map).

### 12. ✅ Fixed: No GitHub OAuth button in AuthDialog
**File:** `src/components/AuthDialog.tsx`  
**Issue:** The API supports GitHub OAuth (`GET /auth/oauth/github`) but the auth dialog only shows Google and Discord buttons. `getOAuthUrl()` in `authApi.ts` is typed for `"google" | "discord"` only. Users can still link GitHub manually via the wallet claim form.  
**Fix:** Widened `getOAuthUrl` type to include `"github"`, updated `handleOAuth` parameter type, changed grid from 2 to 3 columns, and added GitHub button with SVG icon next to Discord button.

### 13. ✅ Fixed: Wallet GitHub claim targets only web repo
**File:** `src/app/(private)/wallet/page.tsx`, `src/lib/api/authApi.ts`  
**Issue:** The UI only links to `video-insight-web` and sends no `repo` field to the API (API defaults to `"web"`). Users cannot claim credits for starring/forking `video-insight-api` from the frontend.  
**Fix:** Added four claim rows (star/fork × web/api), updated `claimGithubCredits` to accept `repo` param, replaced GitHub OAuth link flow with linked-account detection and CTA.

### 14. ✅ Fixed: No success/error distinction on GitHub claim
**File:** `src/app/(private)/wallet/page.tsx`  
**Issue:** `handleClaimGithub` shows a single generic error string on failure. No distinction between "not found" (404), "already claimed" (409), and "rate limited" (429). No success state shown after claim — the credits update silently via query invalidation.  
**Fix:** `handleClaimGithub` now maps HTTP status codes (404/409/429/other) to distinct i18n error messages. Claimed state is shown per-row via `user.githubStar/ForkClaimedWeb/Api` flags.

### 15. ✅ Fixed — converted to Earn Credits section: "Buy Credits" dialog has no payment integration
**File:** `src/app/(private)/wallet/page.tsx`  
**Issue:** The package selection UI is complete but the "Buy Now" button just closes the dialog. No Stripe or other payment processor is wired.  
**Fix:** Removed `creditPackages` array, `usd` formatter, `dialogOpen`/`selected` state, and the entire Dialog block. Replaced "Buy Credits" button with a smooth-scroll anchor `<a href="#earn-credits">`. Added a "Weekly Restore" informational card as the first card in the Earn Credits section (4-column grid). Added `getNextSundayLabel()` helper. Added i18n keys for weekly restore in both locales.

### 16. ✅ Fixed: Referral URL param not parsed on signup
**File:** `src/components/AuthDialog.tsx`, `src/types/auth.ts`, `src/lib/api/authApi.ts`  
**Issue:** The API accepts `referralCode` in `POST /auth/signup`, but the frontend never reads `?ref=` from the URL when the signup dialog opens. Users who follow a referral link get no referral attribution.  
**Fix:** Added `referralCode` state to `AuthDialog`. Added `useEffect` to read `?ref=` from URL on mount. Updated `SignupFormData` interface to include optional `referralCode`. Updated `SignupData` in authApi to include optional `referralCode`. On signup, payload includes referral code if present in URL.

### 17. ✅ Fixed: `getOAuthUrl` typed for Google/Discord only
**File:** `src/lib/api/authApi.ts` line ~80  
**Issue:** Function signature is `getOAuthUrl(provider: "google" | "discord")` — `"github"` is excluded.  
**Fix:** Widened to `"google" | "discord" | "github"`. Done as part of bug #12 (GitHub OAuth button).

### 18. ✅ Fixed: No `middleware.ts` — private routes unprotected at router level
**Files:** `src/middleware.ts`, `src/app/(private)/layout.tsx`  
**Issue:** Private routes (`/dashboard`, `/wallet`, `/submissions/*`) had no Next.js middleware guard. Auth was enforced only via Redux state + Axios 401 interceptor. Unauthenticated direct-URL access would hit the API before being redirected.  
**Fix:** Added `src/middleware.ts` with `matcher` for `/dashboard/:path*`, `/wallet/:path*`, `/submissions/:path*`; redirects to `/` if no `auth_token` cookie. Also includes legacy URL redirects (trailing slashes, common typos), header-based Bearer token fallback, and security headers (CSP, X-Frame-Options, Referrer-Policy).

### 19. ✅ Fixed: Wallet GitHub claim section only shows web repo
**File:** `src/app/(private)/wallet/page.tsx`  
**Fix:** Done as part of bug #13 — four claim rows now shown (star/fork × web/api). See bug #13 for full details.

### 20. ✅ Fixed: "Process Video" button text hardcoded in `video-preview.tsx`
**File:** `src/components/submissions/video-preview.tsx` line ~96  
**Issue:** Button label is a hardcoded English string, not using the i18n `t()` hook.  
**Fix:** Replaced "Process Video" with `t("dashboard.submit.button")` and "Cancel" with `t("dashboard.submit.cancel")`. Added `useT()` hook import and initialization. Added `dashboard.submit.cancel` key to both en.ts and pt-br.ts locale files.

---

## Data Flow: Video Submission

1. User pastes URL in dashboard input
2. 1s debounce → `getVideoMetadata()` fetches oEmbed data → shows `VideoPreview`
3. User clicks "Process Video" → `useSubmitVideo()` POSTs to `/video`
4. Optimistic update adds card to `["videos"]` cache with status `pending`
5. `SubmissionCard` detects `pending/downloaded/transcribing` → `useVideoStatus` polls every 10s
6. On `completed` → card shows "View Details" link → `/submissions/:id`
7. Submission detail page loads via `useVideo(id)` → renders Summary/Transcript/Insights

---

## Conventions

- All pages are `"use client"` components
- Redux state accessed via `useAppSelector((state: any) => state.auth)` — typed as `any` (tech debt)
- API hooks in `src/lib/api/hooks.ts`, raw API fns in `src/lib/api/videoInsightApi.ts` and `authApi.ts`
- Utility classes always via `cn()` from `src/lib/utils.ts`
- Date formatting via `dayjs` in `date-formatter.ts`
- Duration formatting via `formatDuration(seconds)` in `src/lib/utils.ts`
- PDF/copy/share exports in `src/lib/utils/export-utils.ts`

---

## I18n

Language support is implemented via a lightweight React context — no URL restructuring, no next-intl.

- **Provider:** `src/lib/i18n/index.tsx` — wraps the app in `layout.tsx` via `<I18nProvider>`
- **Hooks:** `useT()` returns the translation function; `useI18n()` returns `{ locale, setLocale }`
- **Locales:** `src/lib/i18n/locales/en.ts` (English) + `pt-br.ts` (Portuguese Brazil)
- **Persistence:** locale stored in `localStorage` under key `locale`; auto-detected from `navigator.language` on first visit
- **Toggle UI:** header and landing page expose a button showing the current locale label (e.g. "EN" when in English); clicking switches and persists

When adding new UI strings, add the key to both locale files before using `t("key")`.

---

## Motion & Animations

All motion is CSS-transition-based — no animation library.

- **Scroll reveals:** `<Reveal delay={0-5}>` (`src/components/ui/reveal.tsx`) wraps any element. Uses `useIntersection` (`src/hooks/use-intersection.ts`) with a 120ms deferred setup to ensure the browser renders `opacity: 0` before the observer fires.
- **CSS classes:** `.reveal-wrap` / `.reveal-item` in `globals.css` handle opacity + translateY transitions. `--stagger: 150ms` drives sequential child animations.
- **Page transitions:** `next-view-transitions` wraps `<html>` in `layout.tsx`; uses the native View Transitions API for cross-page fade.
- **Loaders:** `.bars-loader` and `.logo-bars` are pure CSS keyframe animations defined in `globals.css`.
- **Motion tokens:** `--d-fast`, `--d-normal`, `--d-slow`, `--ease-out` defined in `globals.css`.

To add a reveal to a section, wrap it: `<Reveal delay={1}>...</Reveal>` (delay 0–5 maps to `n * --stagger`).

---

## Development

```bash
npm install
npm run dev        # next dev --turbopack on port 3000
npm run build      # installs @tailwindcss/postcss then next build
npm run lint       # next lint
```

Environment variable: `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000`

> **Security:** jsPDF upgraded to v4.2.1 (critical fix), Next.js at 15.5.18 (security backport). Run `npm audit` after dependency updates — 2 moderate postcss warnings are false positives inside Next.js own bundled `node_modules` and not exploitable.
