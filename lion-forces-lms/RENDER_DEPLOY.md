# Deploying this staging build to Render (free tier)

Picked over Railway here because the free trial on that account ran out,
and over continuing the Hostinger SSH deploy because that's a lot of
manual steps for a quick look -- better saved for the real production
push once things are settled. Render's free tier needs a card on some
regions but doesn't charge unless you upgrade.

Render has no free managed MySQL (only Postgres), so this uses SQLite
instead -- no separate database service to create or configure at all.
The tradeoff: Render's free tier spins the app down after ~15 minutes of
no traffic and wipes its disk on restart, so the SQLite database (and any
uploaded files) resets periodically. Fine for clicking around and
reviewing; not something to treat as persistent.

## 1. Create the Render account + service

1. Go to [render.com](https://render.com) → sign up (GitHub login is
   easiest, since it also handles repo access in one step).
2. Dashboard → **New +** → **Web Service**.
3. Connect your GitHub account if asked, then pick the
   `Rameesha-Malik/claude` repository.
4. On the configuration screen:
   - **Name**: anything, e.g. `lion-forces-academy-test`
   - **Root Directory**: `lion-forces-lms` (the Laravel app is a
     subdirectory of this repo, not the repo root)
   - **Branch**: `claude/lion-forces-lms`
   - **Runtime**: Render should detect the `Dockerfile` automatically
     once Root Directory is set to `lion-forces-lms` and offer "Docker"
     as the environment -- pick that if it isn't already selected.
   - **Instance Type**: **Free**

## 2. Set environment variables

Still on the service setup page (or under **Environment** after
creating it), add these:

```
APP_NAME=Lion Forces Academy
APP_ENV=staging
APP_DEBUG=true
APP_KEY=base64:KPCwuCPdlrb3P5zFJ0JgehoIjqit9x1X+uOwJmQaOT4=
APP_URL=https://REPLACE-WITH-YOUR-RENDER-URL.onrender.com

DB_CONNECTION=sqlite
DB_DATABASE=/app/database/database.sqlite

SESSION_DRIVER=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=local

SEED_ON_BOOT=true
```

Notes:
- `APP_KEY` above is a throwaway key for this test deploy only -- never
  reuse it for the client's real production site.
- You won't know the real `*.onrender.com` URL until after the first
  deploy finishes (Render assigns it). Deploy once with the placeholder,
  copy the real URL Render shows you, paste it into `APP_URL`, save --
  Render will redeploy automatically when an env var changes.
- Leave `SEED_ON_BOOT=true` for the **first** deploy only (loads demo
  courses/admin/student accounts). After that first successful deploy,
  delete the variable or set it to `false` -- otherwise every restart
  (including the free tier's automatic sleep/wake cycles) re-runs the
  seeders and duplicates demo data.

## 3. Deploy

Click **Create Web Service** (or **Deploy** if you already created it).
Render builds the Docker image and starts the container -- watch the
**Logs** tab for progress. The build takes a few minutes (PHP extensions
+ npm build, same as the Railway image).

## 4. First-login check

Once it's live at your `*.onrender.com` URL, sign in with the seeded
demo accounts to confirm the database actually seeded correctly:

- Admin: `admin@lionforcesacademy.com` / `password`
- Student: `student@example.com` / `password`

**Never reuse these anywhere near the real Hostinger production site.**

## Known limitations of this free-tier setup (fine for a quick look, not for real use)

- **Everything resets on sleep/wake.** The free tier spins the service
  down after ~15 minutes of no traffic. The next visit wakes it back up
  (takes 30-60 seconds) but on a **fresh container** -- the SQLite
  database and any uploaded files from before are gone, and `SEED_ON_BOOT`
  re-runs if it's still set to `true`. Don't rely on data staying between
  review sessions.
- **`php artisan serve` is not a production web server** -- same caveat
  as the Railway doc: fine for a few people clicking around, not for
  real traffic. The real Hostinger deploy uses PHP-FPM instead.
- This is specifically for **review only**. The actual client deploy is
  tracked separately in `HOSTINGER_DEPLOY.md`.
