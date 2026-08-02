# Supabase Auth Integration v2: Anonymous Trial + Optional Post-Purchase Signup

## What this version solves

Instead of forcing login/signup on entry:

1. Every visitor automatically gets an **anonymous account** the moment they arrive (fully invisible to them)
2. Uploading tax documents, running OCR, generating previews — all tied to that anonymous account
3. No forced signup at checkout — Stripe Checkout only needs an email for the receipt (guest checkout)
4. **After a successful payment**, the user is offered the option to "save their account" — they set an
   email + password, and the anonymous account is upgraded in place into a permanent one. Because the
   user id doesn't change, all their prior data is retained automatically — no data migration needed.

## File list / what changed

```
lib/supabase/client.ts          Browser client (unchanged)
lib/supabase/server.ts          Server client (unchanged)
proxy.ts                        Formerly middleware.ts, renamed + logic changed:
                                 no longer blocks unauthenticated users — instead
                                 silently creates an anonymous session
components/auth/LoginForm.tsx   For existing users to log in (e.g. on a new device)
components/auth/CreateAccountForm.tsx
                                 Core component: upgrades the current anonymous
                                 account into a permanent one
app/login/page.tsx              Login page, with a "continue without an account" link
app/account/save/page.tsx       "Save your account" page shown after a successful purchase
app/auth/callback/route.ts      Email verification callback (unchanged)
app/auth/signout/route.ts       Sign out (unchanged)
app/dashboard/page.tsx          Shows different content for anonymous vs permanent users
                                 (demo only — in the real product this should be the
                                 order history / file list page)
.env.local.example              Environment variable template (unchanged)
```

> Note: `AuthForm.tsx` has been deleted, split into `LoginForm.tsx` and `CreateAccountForm.tsx`.

## Steps to replace files on Windows

1. Delete the old `frontend\middleware.ts` (if it's still named that)
   and `frontend\components\auth\AuthForm.tsx`
2. Unzip this package and overwrite/add into `frontend`:
   - `proxy.ts` → `frontend\proxy.ts` (root)
   - `components/auth/LoginForm.tsx` → `frontend\components\auth\LoginForm.tsx`
   - `components/auth/CreateAccountForm.tsx` → `frontend\components\auth\CreateAccountForm.tsx`
   - `app/login/page.tsx` → overwrite
   - `app/account/save/page.tsx` → new folder `frontend\app\account\save\page.tsx`
   - `app/dashboard/page.tsx` → overwrite

## New Supabase Dashboard setting

Authentication → Sign In / Providers → **enable "Anonymous Sign-ins"**

(This is off by default. Once enabled, every visitor gets an anonymous account automatically.
Once you're live and see signs of abuse, consider adding CAPTCHA/rate limiting for anonymous
sign-in — Supabase's docs cover this. No action needed for now.)

## Local test flow

```powershell
cd C:\tmp\downloads\cl0\frontend
npm run dev
```

1. Open `http://localhost:3000/dashboard` directly — no action needed, it should show
   "Welcome, guest" + a "save your account" prompt (confirms the anonymous session was
   created automatically)
2. Click "save your account", go to `/account/save`, fill in email + password, submit
3. Should show "Account saved!"
4. Refresh `/dashboard` — should now show "Welcome, xxx@xxx.com" instead of guest
5. Click "Log Out"
6. Visit `/dashboard` again — should automatically create a **new** anonymous account
   (expected: signing out clears the session, so a fresh visitor identity starts)
7. Go to `/login`, sign in with the email/password from step 2 — should recover the
   account from step 3

## Next steps

1. `/dashboard` is just a placeholder test page — in the real product it should be
   replaced with the actual "upload tax documents / view generated files" page
2. On the Stripe Checkout side, set `success_url` to include `?from=checkout`, redirecting
   to `/account/save?from=checkout` so you can show copy like "Purchase successful — save
   your account to access your files later" based on that param
3. Database tables (tax record uploads, generated files) should just have a foreign key to
   `auth.users.id` — no need to distinguish "anonymous" vs "permanent" since the id doesn't change
