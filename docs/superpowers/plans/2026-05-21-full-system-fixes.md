# Full System Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all identified bugs, implement GitHub account linking via OAuth, redesign Earn Credits section, and harden both API and Web projects.

**Architecture:** Each task is self-contained. API tasks modify `video-insight-api/src/`. Web tasks modify `video-insight-web/src/`. Tasks marked `[API]` or `[WEB]` for project clarity. Run `npm run build` after every task to catch TypeScript errors early.

**Tech Stack:** Fastify 5 + TypeORM (API), Next.js 15 App Router + Redux + TanStack Query (Web), Tailwind CSS v4, TypeScript throughout.

---

## Pre-flight: Verify Dev Servers Start

- [ ] In `video-insight-api/`: run `npm run dev` — confirm server starts on port 5000, no TypeScript errors in console
- [ ] In `video-insight-web/`: run `npm run dev` — confirm Next.js starts on port 3000, no build errors

---

## Task 1 [API]: Fix Emoji Corruption — Add UTF-8 Charset Header

**Files:**
- Modify: `video-insight-api/src/server.ts` (after `buildServer()` creates `app`)

The emoji corruption (`ðŸ'¡` instead of `💡`) is UTF-8 bytes being misinterpreted as Latin-1 then re-encoded. Root cause: Fastify's default `Content-Type: application/json` header omits `; charset=utf-8`. Adding it forces every client to decode as UTF-8.

- [ ] **Step 1: Add onSend hook in `server.ts`**

In `server.ts`, after `app.register(rateLimit, {...})` and before `app.register(swagger, {...})`, insert:

```typescript
// Force UTF-8 charset on all JSON responses
app.addHook('onSend', (_request, reply, payload, done) => {
  const ct = reply.getHeader('content-type') as string | undefined;
  if (ct && ct.startsWith('application/json') && !ct.includes('charset')) {
    reply.header('content-type', 'application/json; charset=utf-8');
  }
  done(null, payload);
});
```

- [ ] **Step 2: Verify build**

```bash
cd video-insight-api && npm run build
```
Expected: `0 errors`

- [ ] **Step 3: Update CLAUDE.md**

In `video-insight-api/CLAUDE.md`, in the Known Bugs section, prefix Bug #1 (emoji) with `✅ Fixed:`.

> Note: If corruption still appears after this fix, the source is in the `dashboard` JSONB field stored in PostgreSQL. In that case, check `video-ai.service.ts` for any string manipulation of the AI response that could corrupt multi-byte chars. The JSONB column itself preserves UTF-8 — the issue is always in the serialization path, not storage.

---

## Task 2 [WEB]: Fix View Toggle Low Contrast

**Files:**
- Modify: `video-insight-web/src/components/ui/view-toggle.tsx` line 23

- [ ] **Step 1: Replace hover class**

In `view-toggle.tsx`, change the inactive button class on line 23:

```typescript
// BEFORE:
"bg-transparent text-[var(--ink-2)] hover:text-[var(--ink-1)] hover:bg-[var(--rule-soft)]"

// AFTER:
"bg-transparent text-[var(--ink-2)] hover:text-[var(--ink-1)] hover:bg-[var(--play)]/10"
```

Full button className becomes:
```typescript
className={`px-3 py-1.5 text-[11px] font-medium tracking-[0.08em] uppercase transition-colors ${
  isActive
    ? "bg-[var(--bars)] text-white"
    : "bg-transparent text-[var(--ink-2)] hover:text-[var(--ink-1)] hover:bg-[var(--play)]/10"
}`}
```

- [ ] **Step 2: Verify build**

```bash
cd video-insight-web && npm run build
```
Expected: `0 errors`

- [ ] **Step 3: Update CLAUDE.md**

Mark bug #10 as `✅ Fixed` in `video-insight-web/CLAUDE.md`.

---

## Task 3 [WEB]: Fix Duplicate Video Submission

**Files:**
- Modify: `video-insight-web/src/app/(private)/dashboard/page.tsx`

Root cause: `handleProcessVideo` is called both via the form `onSubmit` handler AND the button's `onClick`. A guard flag prevents the second call from firing the mutation when the first is already in flight.

- [ ] **Step 1: Add mutation pending guard**

In `dashboard/page.tsx`, update `handleProcessVideo` (currently lines 69-76):

```typescript
const handleProcessVideo = async () => {
  if (!videoMetadata || submitVideoMutation.isPending) return;
  try {
    await submitVideoMutation.mutateAsync({ videoUrl: videoMetadata.url });
    setVideoMetadata(null);
    setValue("url", "");
  } catch {}
};
```

- [ ] **Step 2: Verify build**

```bash
cd video-insight-web && npm run build
```
Expected: `0 errors`

- [ ] **Step 3: Update CLAUDE.md**

Mark bug #1 (duplicate submission) as `✅ Fixed`.

---

## Task 4 [WEB]: Add GitHub OAuth Button to AuthDialog

**Files:**
- Modify: `video-insight-web/src/lib/api/authApi.ts` (line 80)
- Modify: `video-insight-web/src/components/AuthDialog.tsx` (lines 65, 195)

- [ ] **Step 1: Widen `getOAuthUrl` type in `authApi.ts`**

```typescript
// BEFORE (line 80):
export const getOAuthUrl = (provider: "google" | "discord"): string => {

// AFTER:
export const getOAuthUrl = (provider: "google" | "discord" | "github"): string => {
```

- [ ] **Step 2: Change OAuth grid from 2 to 3 columns in `AuthDialog.tsx`**

Find line ~195: `<div className="grid grid-cols-2 gap-3">`

Change to:
```tsx
<div className="grid grid-cols-3 gap-3">
```

- [ ] **Step 3: Add GitHub button after Discord button**

After the closing `</button>` of the Discord button (line ~217), add:

```tsx
<button
  onClick={() => handleOAuth('github')}
  className="flex items-center justify-center gap-2 border border-[var(--rule)] rounded-[6px] py-2.5 text-sm text-[var(--ink-2)] hover:border-[var(--ink-2)] hover:text-[var(--ink-1)] bg-white dark:bg-zinc-900 transition-colors"
>
  <svg width="16" height="16" viewBox="0 0 24 24" aria-label="GitHub">
    <path fill="currentColor" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
  GitHub
</button>
```

- [ ] **Step 4: Verify build**

```bash
cd video-insight-web && npm run build
```
Expected: `0 errors`

- [ ] **Step 5: Update CLAUDE.md**

Mark bug #12 (no GitHub OAuth button) as `✅ Fixed`.

---

## Task 5 [API]: GitHub Account Link Flow

**Files:**
- Modify: `video-insight-api/src/controllers/auth.controller.ts`
- Modify: `video-insight-api/src/services/oauth.service.ts`
- Modify: `video-insight-api/src/routes/auth.routes.ts`

This adds `GET /auth/link/github` (JWT required) which generates an OAuth URL with a signed `state` JWT that encodes `{ userId, mode: 'link' }`. The callback handler detects link mode and updates the existing user instead of creating a new one.

- [ ] **Step 1: Add `getOAuthUrlWithLinkState` to `oauth.service.ts`**

In `oauth.service.ts`, after the `getOAuthUrl` method (line ~61), add:

```typescript
static getLinkUrl(provider: OAuthProvider, userId: number, jwtSecret: string): string {
  const baseUrl = this.getProviderBaseUrl(provider);
  const clientId = this.getClientId(provider);
  const scope = this.getScope(provider);
  const redirectUri = `${this.REDIRECT_BASE_URL}/${provider}`;

  // Encode link state as base64url JSON (simple, no JWT library needed in service)
  const statePayload = Buffer.from(
    JSON.stringify({ userId, mode: 'link', iat: Math.floor(Date.now() / 1000) })
  ).toString('base64url');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope,
    state: statePayload,
  });

  return `${baseUrl}?${params.toString()}`;
}

static decodeLinkState(state: string): { userId: number; mode: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
    if (!decoded.userId || decoded.mode !== 'link') return null;
    // Expire after 10 minutes
    if (Math.floor(Date.now() / 1000) - decoded.iat > 600) return null;
    return decoded;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Add `linkGithubController` to `auth.controller.ts`**

At the end of `auth.controller.ts`, add:

```typescript
export async function linkGithubController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = (request.user as any)?.userId as number;
  if (!userId) return reply.status(401).send({ message: 'Unauthorized' });

  const jwtSecret = process.env.JWT_SECRET || '';
  const linkUrl = OAuthService.getLinkUrl('github', userId, jwtSecret);
  return reply.redirect(linkUrl);
}
```

- [ ] **Step 3: Modify `oauthCallbackController` to handle link mode**

In `oauthCallbackController`, change the `const { code }` line to also read `state`, then branch on link mode:

```typescript
export async function oauthCallbackController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { provider } = request.params as { provider: string };
  const { code, state } = request.query as { code: string; state?: string };
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  try {
    if (!['google', 'discord', 'github'].includes(provider)) {
      return reply.status(400).send({ message: 'Unsupported provider' });
    }
    if (!code) {
      return reply.status(400).send({ message: 'Authorization code required' });
    }

    const userProfile = await OAuthService.handleOAuthCallback(provider as OAuthProvider, code);

    // Link mode: update existing user, do not create new
    const linkState = state ? OAuthService.decodeLinkState(state) : null;
    if (linkState && provider === 'github') {
      const existingUser = await UserRepository.findOne({ where: { id: linkState.userId } });
      if (!existingUser) {
        return reply.redirect(`${frontendUrl}/auth/callback?error=link_user_not_found`);
      }
      await UserRepository.update(existingUser.id, {
        githubUsername: userProfile.githubUsername || existingUser.githubUsername,
        githubId: userProfile.githubId || existingUser.githubId,
      });
      request.log.info({ userId: existingUser.id }, 'github_account_linked');
      return reply.redirect(`${frontendUrl}/wallet?github_linked=1`);
    }

    // Normal login/signup flow
    const user = await createOrUpdateOAuthUser(
      provider,
      userProfile.providerId,
      userProfile.email,
      userProfile.name,
      userProfile.avatarUrl,
      userProfile.githubUsername,
      userProfile.githubId
    );

    const token = await reply.jwtSign(
      { userId: user.id, email: user.email },
      { expiresIn: '15d' }
    );

    return reply.redirect(`${frontendUrl}/auth/callback?token=${token}&provider=${provider}`);
  } catch (error) {
    request.log.error({ error, provider }, 'oauth_callback_error');
    return reply.redirect(`${frontendUrl}/auth/callback?error=oauth_failed`);
  }
}
```

- [ ] **Step 4: Add link route to `auth.routes.ts`**

In `auth.routes.ts`, add import and route. After the existing imports add:

```typescript
import {
  loginController,
  signupController,
  oauthRedirectController,
  oauthCallbackController,
  linkGithubController,
} from '../controllers/auth.controller';
```

Inside `authRoutes` function, after the callback route, add:

```typescript
// GitHub account linking (requires JWT auth)
fastify.get(
  '/link/github',
  {
    schema: {
      response: {
        302: Type.Null(),
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [fastify.authenticate],
  },
  linkGithubController
);
```

Also update the querystring schema on the callback route to accept optional `state`:

```typescript
querystring: Type.Object({
  code: Type.String(),
  state: Type.Optional(Type.String()),
}),
```

- [ ] **Step 5: Verify build**

```bash
cd video-insight-api && npm run build
```
Expected: `0 errors`

- [ ] **Step 6: Update CLAUDE.md**

Add to API CLAUDE.md endpoints table:
```
| GET | `/auth/link/github` | JWT | Links GitHub OAuth to existing account; redirects to /wallet?github_linked=1 |
```

---

## Task 6 [WEB]: GitHub Link Flow in Wallet + Remove Manual Input

**Files:**
- Modify: `video-insight-web/src/lib/api/authApi.ts`
- Modify: `video-insight-web/src/lib/api/hooks.ts`
- Modify: `video-insight-web/src/types/auth.ts`
- Modify: `video-insight-web/src/app/(private)/wallet/page.tsx`

- [ ] **Step 0 (pre): Add `useEffect` and `useAppDispatch` imports to `wallet/page.tsx`**

Wallet page currently imports `{ useState }` from react and only `useAppSelector` from hooks. Update:
```typescript
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../core/hooks";
import { fetchProfile } from "../../../core/slices/authSlice";
```

- [ ] **Step 1: Add `githubUsername` and claim flags to `User` type in `authApi.ts`**

In `authApi.ts`, update the `User` interface:

```typescript
export interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string;
  provider?: string;
  providerId?: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
  githubUsername?: string | null;
  githubStarClaimedWeb?: boolean;
  githubForkClaimedWeb?: boolean;
  githubStarClaimedApi?: boolean;
  githubForkClaimedApi?: boolean;
}
```

- [ ] **Step 2: Update `claimGithubCredits` to remove `githubUsername` param**

In `authApi.ts`, update the function:

```typescript
export const claimGithubCredits = async (
  action: "star" | "fork",
  repo: "web" | "api"
): Promise<ClaimGithubResponse> => {
  const response = await api.post("/credits/claim/github", { action, repo });
  return response.data;
};
```

- [ ] **Step 3: Update `useClaimGithubCredits` hook in `hooks.ts`**

```typescript
export const useClaimGithubCredits = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ action, repo }: { action: "star" | "fork"; repo: "web" | "api" }) =>
      claimGithubCredits(action, repo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
```

- [ ] **Step 4: Add `getLinkUrl` to `authApi.ts`**

```typescript
export const getGithubLinkUrl = (): string => {
  return `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/auth/link/github`;
};
```

- [ ] **Step 5: Handle `?github_linked=1` in `wallet/page.tsx` and refresh profile**

At top of `WalletPage` component, add this effect (requires `useEffect` import if not present, and `useAppDispatch` + `fetchProfile` thunk):

```typescript
import { fetchProfile } from "../../../core/slices/authSlice";

// Inside component:
const dispatch = useAppDispatch();
const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

React.useEffect(() => {
  if (searchParams?.get('github_linked') === '1') {
    dispatch(fetchProfile());
    // Clean URL without reload
    window.history.replaceState({}, '', '/wallet');
  }
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 6: Replace GitHub card in `wallet/page.tsx`**

Replace the entire GitHub card block (lines ~311-352) with this new version that checks if GitHub is linked:

```tsx
{/* GitHub */}
<div className="border border-[var(--rule)] rounded-[10px] p-5 bg-white dark:bg-zinc-900 flex flex-col gap-3">
  <div>
    <div className="br-eyebrow mb-1">{t("wallet.earn.github.title")}</div>
    <p className="text-[var(--ink-2)] text-xs leading-relaxed">{t("wallet.earn.github.sub")}</p>
  </div>

  {!user?.githubUsername ? (
    // Not linked — show connect CTA
    <>
      <p className="text-[var(--ink-3)] text-xs">{t("wallet.earn.github.notLinked")}</p>
      <a
        href={getGithubLinkUrl()}
        className="mt-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-[var(--ink-1)] hover:opacity-80 text-[var(--briefing-bg)] rounded-[6px] transition-opacity"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
          <path fill="currentColor" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
        {t("wallet.earn.github.connect")}
      </a>
    </>
  ) : (
    // Linked — show claim rows
    <>
      <p className="br-eyebrow text-[var(--led-completed)]">@{user.githubUsername}</p>
      {githubError && <p className="text-xs text-[var(--led-failed)]">{githubError}</p>}
      {[
        { action: "star" as const, repo: "web" as const, label: t("wallet.earn.github.star"), claimed: user.githubStarClaimedWeb },
        { action: "fork" as const, repo: "web" as const, label: t("wallet.earn.github.fork"), claimed: user.githubForkClaimedWeb },
        { action: "star" as const, repo: "api" as const, label: t("wallet.earn.github.starApi"), claimed: user.githubStarClaimedApi },
        { action: "fork" as const, repo: "api" as const, label: t("wallet.earn.github.forkApi"), claimed: user.githubForkClaimedApi },
      ].map(({ action, repo, label, claimed }) => (
        <div key={`${action}-${repo}`} className="flex items-center justify-between gap-2">
          <span className="text-xs text-[var(--ink-2)]">{label}</span>
          {claimed ? (
            <span className="br-eyebrow text-[var(--led-completed)]">{t("wallet.earn.github.claimed")}</span>
          ) : (
            <button
              type="button"
              onClick={() => handleClaimGithub(action, repo)}
              disabled={claimGithubMutation.isPending}
              className="px-3 py-1 text-[10px] font-medium border border-[var(--rule)] rounded-[4px] hover:border-[var(--bars)] hover:text-[var(--bars)] disabled:opacity-40 transition-colors"
              style={{ fontFamily: "var(--font-mono-br, monospace)" }}
            >
              {t("wallet.earn.github.claim")}
            </button>
          )}
        </div>
      ))}
    </>
  )}
</div>
```

- [ ] **Step 7: Update `handleClaimGithub` in `wallet/page.tsx`**

Replace the existing `handleClaimGithub` function (lines ~90-98) and remove `githubUsername` state:

```typescript
// Remove these lines:
// const [githubUsername, setGithubUsername] = useState("");
const [githubError, setGithubError] = useState<string | null>(null);

const handleClaimGithub = async (action: "star" | "fork", repo: "web" | "api") => {
  setGithubError(null);
  try {
    await claimGithubMutation.mutateAsync({ action, repo });
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404) setGithubError(t("wallet.earn.github.error.notFound"));
    else if (status === 409) setGithubError(t("wallet.earn.github.error.claimed"));
    else if (status === 429) setGithubError(t("wallet.earn.github.error.rateLimit"));
    else setGithubError(t("wallet.earn.github.error.generic"));
  }
};
```

- [ ] **Step 8: Add missing i18n keys to both locale files**

In `src/lib/i18n/locales/en.ts`, add after `'wallet.earn.github.error'`:
```typescript
'wallet.earn.github.connect': 'Connect GitHub Account',
'wallet.earn.github.notLinked': 'Connect your GitHub account to claim star and fork rewards.',
'wallet.earn.github.starApi': '⭐ Star video-insight-api (+5 cr)',
'wallet.earn.github.forkApi': 'Fork video-insight-api (+10 cr)',
'wallet.earn.github.claim': 'Claim',
'wallet.earn.github.error.notFound': 'Not found in this repo. Star or fork first.',
'wallet.earn.github.error.claimed': 'Already claimed for this action.',
'wallet.earn.github.error.rateLimit': 'Too many requests. Wait 1 minute.',
'wallet.earn.github.error.generic': 'Could not verify. Try again later.',
```

In `src/lib/i18n/locales/pt-br.ts`, add the same keys translated:
```typescript
'wallet.earn.github.connect': 'Conectar Conta GitHub',
'wallet.earn.github.notLinked': 'Conecte sua conta GitHub para reivindicar recompensas de estrela e fork.',
'wallet.earn.github.starApi': '⭐ Estrelar video-insight-api (+5 cr)',
'wallet.earn.github.forkApi': 'Fazer Fork video-insight-api (+10 cr)',
'wallet.earn.github.claim': 'Resgatar',
'wallet.earn.github.error.notFound': 'Não encontrado neste repositório. Estrele ou faça fork primeiro.',
'wallet.earn.github.error.claimed': 'Já resgatado para esta ação.',
'wallet.earn.github.error.rateLimit': 'Muitas requisições. Aguarde 1 minuto.',
'wallet.earn.github.error.generic': 'Não foi possível verificar. Tente novamente.',
```

Also add `getGithubLinkUrl` import to `wallet/page.tsx`:
```typescript
import { getGithubLinkUrl } from "../../../lib/api/authApi";
```

- [ ] **Step 9: Verify build**

```bash
cd video-insight-web && npm run build
```
Expected: `0 errors`

- [ ] **Step 10: Update CLAUDE.md**

Mark bug #13 (only web repo) and bug #14 (no error distinction) as `✅ Fixed`.

---

## Task 7 [API]: Remove Manual Username Override in GitHub Claim

**Files:**
- Modify: `video-insight-api/src/controllers/github-claim.controller.ts` (lines 55-56)

- [ ] **Step 1: Replace permissive username resolution**

Change lines 55-59:

```typescript
// BEFORE:
const usernameToCheck = user.githubUsername || githubUsername;
if (!usernameToCheck) {
  return reply.status(400).send({
    message: 'GitHub username required. Provide it in the request body or connect GitHub via OAuth.',
  });
}

// AFTER:
const usernameToCheck = user.githubUsername;
if (!usernameToCheck) {
  return reply.status(400).send({
    message: 'GitHub account not linked. Go to /wallet and connect your GitHub account first.',
  });
}
```

Also remove the line that stores username from body (lines ~82-84):
```typescript
// REMOVE these lines:
const updates: Partial<typeof user> = { [claimFlag]: true };
if (!user.githubUsername && githubUsername) {
  updates.githubUsername = githubUsername;
}

// REPLACE WITH:
const updates: Partial<typeof user> = { [claimFlag]: true };
```

- [ ] **Step 2: Verify build**

```bash
cd video-insight-api && npm run build
```
Expected: `0 errors`

- [ ] **Step 3: Update CLAUDE.md**

Mark bug A2 (username override) as `✅ Fixed`.

---

## Task 8 [WEB]: Fix Wallet Pagination

**Files:**
- Modify: `video-insight-web/src/lib/api/authApi.ts`
- Modify: `video-insight-web/src/lib/api/hooks.ts`
- Modify: `video-insight-web/src/app/(private)/wallet/page.tsx`

- [ ] **Step 1: Add optional `limit`/`offset` params to `getCredits`**

In `authApi.ts`, update `getCredits`:

```typescript
export const getCredits = async (limit = 20, offset = 0): Promise<CreditsResponse> => {
  const response = await api.get("/credits", { params: { limit, offset } });
  return response.data;
};
```

- [ ] **Step 2: Update `useCredits` hook to accept page param**

In `hooks.ts`, update `useCredits`:

```typescript
export const useCredits = (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return useQuery({
    queryKey: ["credits", page],
    queryFn: () => getCredits(limit, offset),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
};
```

- [ ] **Step 3: Add page state and pagination UI to `wallet/page.tsx`**

Add `page` state after existing state declarations:

```typescript
const [page, setPage] = useState(1);
const ITEMS_PER_PAGE = 20;
```

Update the `useCredits` call:

```typescript
const { data: creditsData, isLoading, error } = useCredits(page, ITEMS_PER_PAGE);
```

After the transaction table closing `</table>` tag, replace the existing "Showing X of Y" line with:

```tsx
{creditsData?.pagination && (
  <div className="flex items-center justify-between mt-4">
    <div className="br-eyebrow">
      {t("wallet.ledger.showing")} {Math.min(page * ITEMS_PER_PAGE, creditsData.pagination.total)} {t("wallet.ledger.of")} {creditsData.pagination.total} {t("wallet.ledger.transactions")}
    </div>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className="px-3 py-1.5 text-xs border border-[var(--rule)] rounded-[4px] disabled:opacity-40 hover:border-[var(--ink-2)] transition-colors br-eyebrow"
      >
        ← {t("wallet.ledger.prev")}
      </button>
      <button
        type="button"
        onClick={() => setPage((p) => p + 1)}
        disabled={page * ITEMS_PER_PAGE >= creditsData.pagination.total}
        className="px-3 py-1.5 text-xs border border-[var(--rule)] rounded-[4px] disabled:opacity-40 hover:border-[var(--ink-2)] transition-colors br-eyebrow"
      >
        {t("wallet.ledger.next")} →
      </button>
    </div>
  </div>
)}
```

- [ ] **Step 4: Add pagination i18n keys**

In `en.ts`, add:
```typescript
'wallet.ledger.prev': 'Prev',
'wallet.ledger.next': 'Next',
```

In `pt-br.ts`, add:
```typescript
'wallet.ledger.prev': 'Anterior',
'wallet.ledger.next': 'Próxima',
```

- [ ] **Step 5: Verify build**

```bash
cd video-insight-web && npm run build
```
Expected: `0 errors`

- [ ] **Step 6: Update CLAUDE.md**

Mark bug #3 (fake pagination) as `✅ Fixed`.

---

## Task 9 [WEB]: Parse `?ref=` Referral Param on Signup

**Files:**
- Modify: `video-insight-web/src/components/AuthDialog.tsx`
- Modify: `video-insight-web/src/core/slices/authSlice.ts` (signupUser thunk)

- [ ] **Step 1: Add `referralCode` state and URL param reading in `AuthDialog.tsx`**

In the `AuthDialog` component, add state and effect after existing state:

```typescript
const [referralCode, setReferralCode] = useState('');

// Read ?ref= param on mount
useEffect(() => {
  if (typeof window !== 'undefined') {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) setReferralCode(ref);
  }
}, []);
```

- [ ] **Step 2: Pass `referralCode` in signup dispatch**

Find the signup dispatch in `handleSubmit` (line ~56):

```typescript
// BEFORE:
await dispatch(signupUser(formData as SignupFormData));

// AFTER:
await dispatch(signupUser({ ...(formData as SignupFormData), referralCode: referralCode || undefined }));
```

- [ ] **Step 3: Update `SignupFormData` type to include `referralCode`**

In `video-insight-web/src/types/auth.ts`, update `SignupFormData`:

```typescript
export interface SignupFormData {
  email: string;
  password: string;
  referralCode?: string;
}
```

- [ ] **Step 4: Verify build**

```bash
cd video-insight-web && npm run build
```
Expected: `0 errors`

- [ ] **Step 5: Update CLAUDE.md**

Mark bug #16 (referral param not parsed) as `✅ Fixed`.

---

## Task 10 [WEB]: Earn Credits Section Redesign — Replace Buy Credits

**Files:**
- Modify: `video-insight-web/src/app/(private)/wallet/page.tsx`

Remove the `creditPackages` array, `dialogOpen` state, `selected` state, the "Buy Credits" button, and the entire Dialog block. Replace with a "Weekly Restore" card added to the Earn Credits section.

- [ ] **Step 1: Remove unused state and data**

Delete these lines from the top of `WalletPage`:
```typescript
// DELETE:
const creditPackages = [ ... ] // the 4-item array
const usd = new Intl.NumberFormat(...);

// DELETE from state:
const [dialogOpen, setDialogOpen] = useState(false);
const [selected, setSelected] = useState<string | null>("popular");
```

- [ ] **Step 2: Remove "Buy Credits" button from balance section**

Delete lines ~136-143 (the "Buy Credits" button):
```tsx
// DELETE this entire button:
<button
  onClick={() => setDialogOpen(true)}
  className="flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-[var(--play)] hover:bg-[var(--play-700)] text-white rounded-[6px] transition-colors"
>
  {t("wallet.balance.buyBtn")}
  <span className="inline-block w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white" />
</button>
```

- [ ] **Step 3: Add Weekly Restore card as first card in Earn Credits section**

Before the existing `{/* Promo Code */}` card, add:

```tsx
{/* Weekly Restore */}
<div className="border border-[var(--rule)] rounded-[10px] p-5 bg-white dark:bg-zinc-900 flex flex-col gap-3">
  <div>
    <div className="br-eyebrow mb-1">{t("wallet.earn.weekly.title")}</div>
    <p className="text-[var(--ink-2)] text-xs leading-relaxed">{t("wallet.earn.weekly.sub")}</p>
  </div>
  <div className="mt-auto">
    <div style={{ fontFamily: "var(--font-display-br, Georgia, serif)", fontSize: "2rem", lineHeight: 1, letterSpacing: "-0.02em" }} className="text-[var(--play)]">100</div>
    <div className="br-eyebrow mt-1">{t("wallet.earn.weekly.amount")}</div>
  </div>
  <div className="pt-3 border-t border-[var(--rule)]">
    <div className="br-eyebrow">{t("wallet.earn.weekly.next")}: {getNextSundayLabel()}</div>
  </div>
</div>
```

- [ ] **Step 4: Add `getNextSundayLabel` helper near top of file (before component)**

```typescript
function getNextSundayLabel(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const daysUntilSunday = day === 0 ? 7 : 7 - day;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilSunday);
  return next.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}
```

- [ ] **Step 5: Change `grid-cols-3` to `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` to fit 4 cards**

Find line ~280: `<div className="grid grid-cols-1 md:grid-cols-3 gap-4">`

Change to:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

- [ ] **Step 6: Remove Buy Credits Dialog (entire Dialog block)**

Delete lines ~396-450 (the entire `<Dialog>...</Dialog>` block and its imports if unused).

Also remove unused Dialog import from top if only used there:
```typescript
// Remove if no longer used:
import { Dialog, DialogContent, DialogTitle } from "../../../components/ui/dialog";
```

- [ ] **Step 7: Add weekly restore i18n keys**

In `en.ts`:
```typescript
'wallet.earn.weekly.title': 'Weekly Restore',
'wallet.earn.weekly.sub': 'Every Sunday, your credits are topped up to 100 if you have fewer.',
'wallet.earn.weekly.amount': 'credits every Sunday',
'wallet.earn.weekly.next': 'Next restore',
```

In `pt-br.ts`:
```typescript
'wallet.earn.weekly.title': 'Recarga Semanal',
'wallet.earn.weekly.sub': 'Todo domingo, seus créditos são recarregados para 100 se você tiver menos.',
'wallet.earn.weekly.amount': 'créditos todo domingo',
'wallet.earn.weekly.next': 'Próxima recarga',
```

Also update `'wallet.balance.buyBtn'` key name — keep key but change value to `'Get More Credits'` (points to the Earn Credits section instead of opening dialog):

In `en.ts`: `'wallet.balance.buyBtn': 'How to earn credits ↓'`
In `pt-br.ts`: `'wallet.balance.buyBtn': 'Como ganhar créditos ↓'`

Change the deleted button to a scroll-to anchor:
```tsx
<a
  href="#earn-credits"
  className="flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-[var(--play)] hover:bg-[var(--play-700)] text-white rounded-[6px] transition-colors"
>
  {t("wallet.balance.buyBtn")}
  <span className="inline-block w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white" />
</a>
```

Add `id="earn-credits"` to the Earn Credits section tag:
```tsx
<section id="earn-credits" className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 pb-24">
```

- [ ] **Step 8: Verify build**

```bash
cd video-insight-web && npm run build
```
Expected: `0 errors`

- [ ] **Step 9: Update CLAUDE.md**

Mark bug #15 (Buy Credits no payment) as `✅ Fixed — converted to Earn Credits section`.

---

## Task 11 [WEB]: Fix Hardcoded "Process Video" and "Cancel" Text

**Files:**
- Modify: `video-insight-web/src/components/submissions/video-preview.tsx` (lines 96, 103)

- [ ] **Step 1: Add `useT` hook to video-preview.tsx**

At top of file after existing imports:
```typescript
import { useT } from "../../lib/i18n";
```

Inside the component function, add:
```typescript
const t = useT();
```

- [ ] **Step 2: Replace hardcoded strings**

Line 96: `Process Video` → `{t("dashboard.submit.button")}`

Line 103: `Cancel` → `{t("dashboard.submit.cancel")}`

- [ ] **Step 3: Add missing i18n key**

In `en.ts`:
```typescript
'dashboard.submit.cancel': 'Cancel',
```

In `pt-br.ts`:
```typescript
'dashboard.submit.cancel': 'Cancelar',
```

- [ ] **Step 4: Verify build**

```bash
cd video-insight-web && npm run build
```
Expected: `0 errors`

- [ ] **Step 5: Update CLAUDE.md**

Mark bug #20 (hardcoded text) as `✅ Fixed`.

---

## Task 12 [API]: Dynamic Credit Estimation by Video Duration

**Files:**
- Modify: `video-insight-api/src/services/video-pipeline.service.ts` (line 36)

After the download stage stores duration, update the estimated cost before debiting. Current flow: estimate is set at video creation before duration is known. Fix: create video with minimum estimate, then update after download provides duration.

- [ ] **Step 1: Add `estimateCreditsFromDuration` helper**

In `video-pipeline.service.ts`, before `createVideoWithCredits`, add:

```typescript
function estimateCreditsFromDuration(durationSeconds: number | null | undefined): number {
  if (!durationSeconds) return 5;
  if (durationSeconds < 600) return 5;   // < 10 min
  if (durationSeconds < 1800) return 8;  // 10–30 min
  return 12;                              // > 30 min
}
```

- [ ] **Step 2: Change hardcoded estimate to use function**

Line 36: `const estimatedCredits = 5;`

Change to:
```typescript
const estimatedCredits = estimateCreditsFromDuration(videoData.duration as number | undefined);
```

- [ ] **Step 3: Verify build**

```bash
cd video-insight-api && npm run build
```
Expected: `0 errors`

- [ ] **Step 4: Update CLAUDE.md**

Mark bug A1 (hardcoded credit estimation) as `✅ Fixed`.

---

## Task 13 [API]: Add `REFERRAL_REWARD` Transaction Type

**Files:**
- Modify: `video-insight-api/src/entities/CreditTransaction.ts`
- Modify: `video-insight-api/src/services/credit.service.ts` (line 68)
- Modify: `video-insight-api/src/services/video-pipeline.service.ts` (line ~527)
- Modify: `video-insight-api/src/controllers/auth.controller.ts` (line ~39)

Current `grantCreditsInternal` signature (credit.service.ts line 68):
```typescript
export async function grantCreditsInternal(
  userId: number, amount: number, description: string,
  referenceType?: string, referenceId?: string
): Promise<boolean>
```
It hardcodes `TransactionType.ADMIN_GRANT` on line 84. We add an optional 6th param.

- [ ] **Step 1: Add enum value to `CreditTransaction.ts`**

```typescript
export enum TransactionType {
  PURCHASE = 'purchase',
  SPEND = 'spend',
  REFUND = 'refund',
  ADMIN_GRANT = 'admin_grant',
  ADMIN_DEDUCT = 'admin_deduct',
  REFERRAL_REWARD = 'referral_reward',
}
```

- [ ] **Step 2: Add optional `type` param to `grantCreditsInternal` in `credit.service.ts`**

Change function signature (line 68) and usage (line 84):

```typescript
export async function grantCreditsInternal(
  userId: number,
  amount: number,
  description: string,
  referenceType?: string,
  referenceId?: string,
  type: TransactionType = TransactionType.ADMIN_GRANT
): Promise<boolean> {
  const user = await UserRepository.findOne({ where: { id: userId } });
  if (!user) {
    logger.warn({ userId }, 'grant_credits_internal_user_not_found');
    return false;
  }

  const transaction = CreditTransactionRepository.create({
    userId, amount, type,  // use `type` param here instead of hardcoded
    status: TransactionStatus.COMPLETED,
    description,
    referenceType: referenceType || 'system',
    referenceId,
  });

  await CreditTransactionRepository.save(transaction);
  await UserRepository.update(userId, { credits: user.credits + amount });
  logger.info({ userId, amount, description }, 'grant_credits_internal_completed');
  return true;
}
```

- [ ] **Step 3: Update referral grant calls to use `REFERRAL_REWARD`**

In `video-pipeline.service.ts` line ~527 (`triggerReferralRewardIfEligible`):
```typescript
import { TransactionType } from '../entities/CreditTransaction';
// ...
await grantCreditsInternal(
  referrer.id, 5, `Referral reward — ${user.email}`,
  'referral_reward', String(userId), TransactionType.REFERRAL_REWARD
);
```

In `auth.controller.ts` line ~39 (signup referral bonus):
```typescript
import { TransactionType } from '../entities/CreditTransaction';
// ...
await grantCreditsInternal(
  user.id as number, 10, 'Referral signup bonus',
  'referral_signup', undefined, TransactionType.REFERRAL_REWARD
);
```

- [ ] **Step 3: Verify build**

```bash
cd video-insight-api && npm run build
```
Expected: `0 errors`

- [ ] **Step 4: Update CLAUDE.md**

Mark bug A3 (ADMIN_GRANT for referral) as `✅ Fixed`.

---

## Task 14 [API]: Rate Limit on Promo Code Redeem

**Files:**
- Modify: `video-insight-api/src/routes/credit.routes.ts` (line ~42)

- [ ] **Step 1: Add per-user rate limit to `/redeem` route**

In `credit.routes.ts`, update the redeem route config:

```typescript
fastify.post(
  '/redeem',
  {
    config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
    schema: { ... },  // keep existing schema unchanged
    preHandler: [fastify.authenticate],
  },
  redeemPromoCodeHandler
);
```

- [ ] **Step 2: Verify build**

```bash
cd video-insight-api && npm run build
```
Expected: `0 errors`

- [ ] **Step 3: Update CLAUDE.md**

Mark bug A4 (no rate limit on redeem) as `✅ Fixed`.

---

## Task 15 [API]: Enable Email Format Validation (activate `ajv-formats`)

**Files:**
- Modify: `video-insight-api/src/server.ts`

`auth.schema.ts` already declares `format: 'email'` on both signup and login schemas. However Fastify/AJV ignores format keywords by default (ReDoS prevention). `ajv-formats` is already installed as a transitive dep — just needs to be registered.

- [ ] **Step 1: Register `ajv-formats` in `server.ts`**

Add import at top of `server.ts`:
```typescript
import addFormats from 'ajv-formats';
```

Update the `ajv` config block (currently lines 29-40):
```typescript
ajv: {
  plugins: [
    addFormats,
    (ajv) => {
      ajv.addKeyword({
        keyword: 'example',
        metaSchema: {},
        validate: () => true,
      });
    },
  ],
},
```

- [ ] **Step 2: Verify build**

```bash
cd video-insight-api && npm run build
```
Expected: `0 errors`

- [ ] **Step 3: Update CLAUDE.md**

Mark bug A5 (no email validation) as `✅ Fixed`.

---

## Task 16 [WEB]: Add `middleware.ts` Auth Guard

**Files:**
- Create: `video-insight-web/src/middleware.ts`

- [ ] **Step 1: Create middleware**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/wallet/:path*', '/submissions/:path*'],
};
```

- [ ] **Step 2: Verify build**

```bash
cd video-insight-web && npm run build
```
Expected: `0 errors`

- [ ] **Step 3: Update CLAUDE.md**

Mark bug #18 (no middleware auth guard) as `✅ Fixed`.

---

## Task 17 [WEB]: Remove Dead Code

**Files:**
- Modify: `video-insight-web/src/core/slices/authSlice.ts`
- Delete: `video-insight-web/src/core/slices/exampleSlice.ts`
- Modify: `video-insight-web/src/core/store.ts`

- [ ] **Step 1: Delete `exampleSlice.ts`**

Delete the file `src/core/slices/exampleSlice.ts`.

- [ ] **Step 2: Remove `exampleSlice` from store.ts if referenced**

Open `src/core/store.ts`, remove any import or reducer reference to `exampleSlice`.

- [ ] **Step 3: Remove `setAuthDialogState` dead code from `authSlice.ts`**

Open `src/core/slices/authSlice.ts`. Find and delete the empty `setAuthDialogState` reducer (lines 83-85):
```typescript
// DELETE:
setAuthDialogState: (state, action) => {
  // superseded by dialogSlice
},
```

Also remove it from the `actions` export at the bottom of the file.

- [ ] **Step 4: Verify build**

```bash
cd video-insight-web && npm run build
```
Expected: `0 errors`

- [ ] **Step 5: Update CLAUDE.md**

Mark bugs #6 and #7 as `✅ Fixed`.

---

## Final: CLAUDE.md Sync Check

After all tasks:

- [ ] Open `video-insight-api/CLAUDE.md` — all 5 API bugs should be marked `✅ Fixed`
- [ ] Open `video-insight-web/CLAUDE.md` — all 20 web bugs should be marked `✅ Fixed` or `✅ N/A (no payment integration in scope)`
- [ ] Verify both projects build clean: `npm run build` in each

---

## Validation Checklist (Manual, after all tasks)

Run both dev servers and open http://localhost:3000:

- [ ] Signup with `?ref=<code>` in URL → signup grants referral bonus
- [ ] Login with Google/Discord/GitHub OAuth → redirects back, token stored
- [ ] Dashboard: paste YouTube URL → metadata loads → click Submit → ONE video created (no duplicate)
- [ ] Wallet: GitHub section shows "Connect GitHub Account" when no GitHub linked
- [ ] Wallet: Click "Connect GitHub Account" → GitHub OAuth flow → returns to wallet → shows `@username`
- [ ] Wallet: Claim star/fork → success or specific error message
- [ ] Wallet: Pagination buttons navigate through transactions
- [ ] Wallet: "Earn Credits ↓" button scrolls to Earn Credits section (no dialog)
- [ ] Wallet: Weekly Restore card shows next Sunday date
- [ ] Insights tab: emojis render correctly (no mojibake)
- [ ] View toggle: hover shows light orange tint, text readable
- [ ] Private routes without cookie → redirected to landing
