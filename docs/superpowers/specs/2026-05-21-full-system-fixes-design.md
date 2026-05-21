# Full System Fixes & Growth Features — Design Spec
**Date:** 2026-05-21  
**Projects:** video-insight-api + video-insight-web  
**Status:** Approved

---

## Scope

This spec covers all identified bugs and missing features across both projects, grouped by theme. Implementation follows the priority order defined at the end.

---

## 1. GitHub Account Linking

### Problem
Users who register via email, Google, or Discord have no `githubUsername` stored. GitHub star/fork credit claims require verified ownership of the GitHub account. Current implementation accepts any `githubUsername` string in the request body — a security hole.

### Design Decision: OAuth Link Flow (Approach A)

**Mechanism:**
- Add `mode=link` support to `GET /auth/oauth/github` via a `state` param
- State param: JWT-signed payload `{ userId, mode: "link" }` — prevents CSRF
- In `GET /auth/callback/github`:
  - If `state.mode === "link"`: update existing user's `githubUsername` + `githubId`, do NOT create a new user
  - If `state.mode === "login"` (default): existing behavior (find-or-create)

**Email deduplication (cross-provider merging):**
- During any OAuth callback (login mode): if the provider returns an email that matches an existing user with a **different** provider → auto-link silently (set `githubUsername`, `githubId` on existing user, no new account)
- If conflict (`githubId` already linked to a different user) → return 409 with clear message

**Frontend:**
- GitHub claim section in wallet checks `user.githubUsername`
- If null → show "Connect GitHub Account" button (triggers `GET /auth/oauth/github?state=<link-token>`)
- After redirect back, query invalidation refreshes user profile
- Remove manual username input entirely; use stored `user.githubUsername` only

**API changes:**
- `GET /auth/oauth/github`: accept optional `link` flag, generate signed `state` param
- `GET /auth/callback/github`: branch on `state.mode`
- `POST /credits/claim/github`: remove `githubUsername` from request body; always use `user.githubUsername`; return 400 if not set

---

## 2. Earn Credits Section (Replaces "Buy Credits")

### Design
Replace the "Buy Credits" dialog and button with a static "Earn Credits" section in the wallet page. No payment UI. Four cards:

**Card 1 — Weekly Restore**
- Copy: "100 credits restored every Sunday"
- Dynamic: "Next restore in X days" (computed from current date)
- Visual: clock/calendar icon, no action button

**Card 2 — Promo Code**
- Input field + "Redeem" button (existing logic, just re-skinned)
- Error/success inline feedback below input

**Card 3 — GitHub**
- If GitHub not connected: prominent "Connect GitHub Account" CTA
- If connected: four claim rows (star web / fork web / star api / fork api)
  - Each row: icon + label + credit amount + [Claim] button or ✓ badge if already claimed
  - Error states: specific messages for 404 ("not found in repo"), 409 ("already claimed"), 429 ("rate limited")

**Card 4 — Refer a Friend**
- Copy: "Earn 5 credits when a friend processes their first video"
- Referral link display (truncated monospace) + Copy button
- Stats: "X referrals · Y credits earned"

---

## 3. Auth — GitHub OAuth Button

Add GitHub as a third OAuth option in `AuthDialog.tsx` alongside Google and Discord.

- Widen `getOAuthUrl` type: `"google" | "discord" | "github"`
- Add GitHub button with GitHub icon, same style as existing OAuth buttons
- No behavior change to login/signup flow — same callback path

---

## 4. Referral URL Param on Signup

When `AuthDialog` opens in `signup` mode, read `?ref=<code>` from `window.location.search` and store it in component state. Pass as `referralCode` in the `POST /auth/signup` body.

- Only read on mount / mode switch to signup
- Clear after successful signup

---

## 5. Bug Fixes (Web)

| Bug | File | Fix |
|---|---|---|
| Emoji corruption in Insights | `insights-list.tsx` | Ensure API `Content-Type: application/json; charset=utf-8`; client-side: decode via `TextDecoder` if needed |
| Wallet pagination fake | `wallet/page.tsx` | Add `page` state, pass `offset = (page-1) * limit` to `useCredits`, wire Prev/Next buttons |
| View toggle low contrast | `view-toggle.tsx:22–23` | Fix hover: `hover:bg-[var(--play)]/10 hover:text-[var(--ink-1)]` |
| Duplicate video submission | `dashboard/page.tsx` | Add `isSubmitting` ref guard or check `mutation.isPending` before firing |
| Hardcoded "Process Video" text | `video-preview.tsx:96` | Replace with `t("dashboard.submit.button")` + add key to both locales |
| Dead code: `setAuthDialogState` | `authSlice.ts:83–85` | Delete |
| Dead code: `exampleSlice.ts` | `exampleSlice.ts` | Delete file + remove from store |
| No feedback on copy/PDF *(verify)* | `action-buttons.tsx` | Verify `copied` state renders correctly |
| PDF export broken | `export-utils.ts` | Audit against actual data shape; fix sections + apply brand colors |

---

## 6. Bug Fixes (API)

| Bug | File | Fix |
|---|---|---|
| Credit estimate hardcoded = 5 | `video-pipeline.service.ts:36` | Compute dynamically: `duration < 600 → 5`, `< 1800 → 8`, `>= 1800 → 12` (credits = f(seconds)) |
| GitHub claim username override | `github-claim.controller.ts:55–84` | Remove `githubUsername` from request body; use `user.githubUsername`; 400 if null |
| Referral uses `ADMIN_GRANT` type | `video-pipeline.service.ts:513` | Add `REFERRAL_REWARD` to `TransactionType` enum; use it in referral grant calls |
| No rate limit on promo redeem | `credit.routes.ts:42–63` | Add `config: { rateLimit: { max: 5, timeWindow: '1 hour' } }` keyed by userId |
| Email not validated on signup | `auth.controller.ts:17` | Add TypeBox `format: 'email'` or regex check |

---

## 7. Route-Level Auth Guard (Web)

Add `src/middleware.ts` with matcher on `/(dashboard|wallet|submissions)(.*)`:
- Read `auth_token` cookie
- If absent: redirect to `/`
- Complements existing Axios 401 interceptor

---

## Priority Order (Implementation Sequence)

| Priority | Item | Projects |
|---|---|---|
| P1 | Fix emoji corruption | API + Web |
| P2 | Fix view toggle contrast | Web |
| P3 | Fix duplicate video submission | Web |
| P4 | Add GitHub OAuth button to AuthDialog | Web |
| P5 | Implement GitHub account link flow (OAuth state param) | API + Web |
| P6 | Remove manual username input; require linked account for claims | API + Web |
| P7 | Fix wallet pagination | Web |
| P8 | Parse `?ref=` param on signup | Web |
| P9 | Earn Credits section (replace Buy Credits) | Web |
| P10 | Fix hardcoded "Process Video" text | Web |
| P11 | Dynamic credit estimation by duration | API |
| P12 | Add `REFERRAL_REWARD` transaction type | API |
| P13 | Rate limit on promo redeem | API |
| P14 | Email validation on signup | API |
| P15 | Add `src/middleware.ts` auth guard | Web |
| P16 | PDF export audit + fix | Web |
| P17 | Remove dead code (`setAuthDialogState`, `exampleSlice`) | Web |

After each item: update CLAUDE.md (mark bug resolved or gap closed), run lint/typecheck, verify in browser.

---

## Tracking Convention

Each completed item gets a ✅ prefix in the relevant CLAUDE.md bug/gap entry. Implementation plan (from writing-plans) carries the task list.
