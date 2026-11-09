# Deploying this staging build to Railway

This repo's network sandbox can't reach Railway's API directly (its outbound
network policy blocks it), so the deploy has to be driven from your Railway
dashboard instead of by me running commands here. Everything the app needs
(Dockerfile, entrypoint, migrations) is already committed — this is a
15-minute, mostly-clicking setup.

## 1. Create the project

1. Go to [railway.app/new](https://railway.app/new) → **Deploy from GitHub repo**.
2. Pick `Rameesha-Malik/claude`, branch `claude/lion-forces-lms`.
3. Railway will try to auto-detect a builder. Open the new service's
   **Settings** tab and set:
   - **Root Directory**: `lion-forces-lms` (the Laravel app lives in a
     subdirectory of this repo, not the repo root)
   - **Builder**: Dockerfile (should auto-select once it sees
     `lion-forces-lms/railway.json` + `Dockerfile`)

## 2. Add the MySQL database

1. In the same project, click **+ New** → **Database** → **Add MySQL**.
2. Railway provisions it and exposes connection variables automatically
   (`MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`)
   on the MySQL service itself.

## 3. Set environment variables on the app service

Open the app service's **Variables** tab and add these. For the four
`DB_*` ones, use Railway's variable-reference syntax so they always match
whatever the MySQL service currently has (click "Add Reference" or type
the `${{...}}` syntax directly):

```
APP_NAME=Lion Forces Academy
APP_ENV=staging
APP_DEBUG=true
APP_KEY=base64:KPCwuCPdlrb3P5zFJ0JgehoIjqit9x1X+uOwJmQaOT4=
APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}

DB_CONNECTION=mysql
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_DATABASE=${{MySQL.MYSQLDATABASE}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

SESSION_DRIVER=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=local

SEED_ON_BOOT=true
```

Notes:
- `APP_KEY` above is a throwaway key generated for this staging deploy
  only — never reuse it for the client's real production site.
- `APP_URL` needs `https://` in front of whatever Railway assigns; if the
  `${{RAILWAY_PUBLIC_DOMAIN}}` reference doesn't resolve automatically,
  just paste the actual `*.up.railway.app` URL shown on the service's
  **Settings → Networking** tab once it's generated, prefixed with `https://`.
- Leave `SEED_ON_BOOT=true` for the **first** deploy only (it loads the
  demo courses/admin/student accounts). After the first successful
  deploy, delete that variable or set it to `false` — otherwise every
  restart re-runs the seeders and duplicates demo data.

## 4. Generate a public domain

In **Settings → Networking**, click **Generate Domain**. Railway will give
you a `something.up.railway.app` URL — that's the staging link to share.

## 5. Deploy

Railway auto-deploys on every push to `claude/lion-forces-lms` once
connected. To trigger the first build manually, use the **Deploy** button
on the service, or push any commit to the branch.

Build takes a few minutes (PHP extensions + npm build). Watch the
**Deployments** tab for build/runtime logs if anything fails.

## 6. First-login check

Once it's live, sign in with the seeded demo accounts to confirm the
database actually seeded correctly:

- Admin: `admin@lionforcesacademy.com` / `password`
- Student: `student@example.com` / `password`

**Change or remove these before this ever goes near the client's real
Hostinger production** — they're seed data for internal review only.

## Known limitations of this staging setup (fine for review, not for real use)

- **Uploaded files are not persistent.** Lesson videos/avatars/notes PDFs
  go to local disk (`storage/app/public`), which is wiped on every
  redeploy since Railway's filesystem is ephemeral by default. If you
  want uploads to survive redeploys during the review period, add a
  Railway **Volume** mounted at `/app/storage/app/public` in the service's
  Settings → Volumes tab.
- **`php artisan serve` is not a production web server.** It's single-
  threaded and fine for a handful of reviewers clicking around, but this
  Dockerfile is deliberately staging-only — the real Hostinger deploy will
  use PHP-FPM/Apache instead, which is what `public/.user.ini`'s upload
  limits were already written for (the entrypoint re-applies the same
  limits via `-d` flags since `.user.ini` isn't honored by the CLI SAPI
  `artisan serve` uses).
- **Sessions and the database itself are fine across redeploys** —
  `SESSION_DRIVER=database` means sessions live in MySQL, which Railway
  keeps as a separate persistent service untouched by app redeploys. Only
  locally-stored *files* (the Filesystem Disk bullet above) are at risk.
