# VARC Focus — deploy guide

## What's here
- `public/index.html` — the whole frontend (dashboard, vocab, RC, para-jumble, odd sentence).
- `api/claude.js` — serverless function that calls the Anthropic API. Your API key lives only here, in an environment variable, never in the browser.
- `api/data.js` — serverless function that reads/writes your data (word bank, stats) to Supabase.
- `supabase/schema.sql` — the one table you need in Supabase.
- `public/manifest.json` — makes the site installable on your phone home screen.

You still need to add two icon files: `public/icon-192.png` and `public/icon-512.png` (any square logo/image works — this is optional; without them the site still works, it just won't have a custom home-screen icon).

## Step 1 — Supabase (your database)
1. Go to supabase.com, create a free account and a new project.
2. Open the SQL editor, paste the contents of `supabase/schema.sql`, run it.
3. Go to Project Settings → API. Copy the **Project URL** and the **service_role key** (not the anon key — the service role key is needed since the serverless function writes data server-side).

## Step 2 — Anthropic API key
1. Go to console.anthropic.com, create an API key if you don't have one.
2. Keep it somewhere safe — you'll paste it into Vercel in Step 4, not into any file here.

## Step 3 — Push this to GitHub
```bash
cd cat-varc-app
git init
git add .
git commit -m "initial commit"
```
Create a new empty repo on GitHub, then follow GitHub's instructions to push (`git remote add origin ...`, `git push -u origin main`).

## Step 4 — Deploy on Vercel
1. Go to vercel.com, sign in with GitHub, click "Add New Project", import this repo.
2. Before deploying, add these Environment Variables (Project Settings → Environment Variables):
   - `ANTHROPIC_API_KEY` = your key from Step 2
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_KEY` = your Supabase service_role key
   - `APP_SECRET` = any passphrase you make up (this is what stops a random visitor from using your API key or reading your data — you'll be asked to type this once in the browser and it's remembered after that)
3. Click Deploy. Vercel gives you a live URL (like `cat-varc-app.vercel.app`) automatically — free tier is fine for solo use.

## Step 5 — Install on your phone
Open the Vercel URL in your phone's browser (Chrome/Safari). You should get an "Add to Home Screen" / "Install app" prompt, or find it in the browser's share/menu options. It'll open full-screen like a normal app.

## Step 6 — First run
Open the site. It'll ask for a passphrase — enter the same value you set as `APP_SECRET`. That's stored in your browser so you only enter it once per device.

## Notes
- This has no real user accounts — anyone with your URL *and* your passphrase can use it. Fine for personal use; don't post the live URL publicly with the passphrase attached.
- Each RC passage / vocab lookup costs a small amount of API usage on your Anthropic account. Nothing here rate-limits you against yourself, so keep an eye on usage if you're on a metered API plan.
- To update the site later, just push new commits to GitHub — Vercel redeploys automatically.
