# Deploying The Digital Room

The site is a stock Next.js build with no API routes, no middleware, and no
environment variables. It deploys on Vercel with zero config changes.

## First deploy (Vercel)

1. Go to https://vercel.com and sign in (GitHub account recommended — the
   repo already lives at `OatMeal152003/The-Digital-Room`).
2. **Add New → Project → Import** `OatMeal152003/The-Digital-Room`.
3. Leave every default as-is:
   - Framework Preset: Next.js
   - Build Command: `next build`
   - Output Directory: (default)
   - Environment Variables: none needed
4. **Deploy.** First build takes ~2–3 minutes (it fetches the Bodoni Moda
   and Geist fonts at build time — this is normal).
5. Open the issued `*.vercel.app` URL.

## Custom domain (optional)

Project → Settings → Domains → add the domain, then point DNS at Vercel
(A `76.76.21.21` or the suggested CNAME). HTTPS is automatic.

## Every update after this

```bash
git add -A
git commit -m "Describe the evening's work"
git push
```

Vercel rebuilds and redeploys `main` automatically. Preview deployments are
created for other branches.

## Post-deploy checklist (do this on the live URL, phone + desktop)

- Title card animates → Enter now → room reveals with the camera gliding in.
- Click the monitor → `digital.room` browser opens, tabs switch, Esc closes.
- Walk through the door → Long Hall → bench → paintings open the glass card
  → camera opens the contact sheet → brass plate walks back.
- Flip the switch beside the door → lamps change, marker retires.
- No console errors (F12 → Console).

## If the build ever fails on Vercel

- Font fetch failure (`next/font/google` needs network at build): re-run the
  build; Vercel retries usually succeed.
- Otherwise compare with local: `npm run build` must pass here first — the
  pre-push ritual is `npx tsc --noEmit`, `npm run build`, banned-words grep.
