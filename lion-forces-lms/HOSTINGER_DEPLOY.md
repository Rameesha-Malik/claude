# Deploying to Hostinger (test.lionsforcesacademy.com)

Git deployment is disabled on this Hostinger plan, so this uses plain SSH +
git instead of hPanel's one-click Git feature. PHP 8.4 is available on this
site (confirmed in PHP Configuration), so no version workaround is needed
here, unlike this repo's sandboxed review environment.

## 1. Connect via SSH

hPanel → this website → **Advanced → SSH Access** shows the exact
`ssh user@host -p port` command and password/key. Run it in a terminal.

## 2. Clone the repo (first deploy only)

```
cd ~
git clone https://github.com/Rameesha-Malik/claude.git lfa-src
cd lfa-src
git checkout claude/lion-forces-lms
cd lion-forces-lms
pwd
```

Note the full path `pwd` prints — you'll need it in step 4.

## 3. Point this website's document root at `public/`

In hPanel → this website's settings, find **Document Root** and change it
to the path from step 2 plus `/public`, e.g.:

```
/home/u123456789/lfa-src/lion-forces-lms/public
```

(Laravel's `public/` folder is the only part meant to be web-facing — the
rest of the app must sit outside it.)

## 4. Install PHP dependencies

```
composer install --no-dev --optimize-autoloader
```

## 5. Set up the environment file

```
cp .env.example .env
nano .env
```

Fill in / change:
- `APP_ENV=staging`
- `APP_DEBUG=true` (see real errors while reviewing; set to `false` once stable)
- `APP_URL=https://test.lionsforcesacademy.com`
- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` — create a database first at
  hPanel → **Databases → MySQL Databases** if one doesn't exist yet, then
  paste its details here (`DB_HOST` is usually `localhost` on Hostinger)

Save (Ctrl+O, Enter, Ctrl+X in nano), then:

```
php artisan key:generate
```

## 6. Build the frontend assets

```
node -v
```

- **If that prints a version:**
  ```
  npm install
  npm run build
  ```
- **If `node` isn't found:** stop here and tell me — I'll build the assets
  on my side and we'll work out getting the `public/build` folder onto the
  server (a zip upload through File Manager is the fallback).

## 7. Migrate the database (and seed demo data, first deploy only)

```
php artisan migrate --force
php artisan db:seed --force
```

Only run `db:seed` on the very first deploy — it creates demo
courses/accounts and isn't meant to run twice.

## 8. Finish setup

```
php artisan storage:link
php artisan config:cache
php artisan route:cache
chmod -R 775 storage bootstrap/cache
```

## 9. Visit it

`https://test.lionsforcesacademy.com/`

Seeded demo logins (remove/change before anything real goes near this):
- Admin: `admin@lionforcesacademy.com` / `password`
- Student: `student@example.com` / `password`

## Updating later, after this first deploy

```
cd ~/lfa-src
git pull origin claude/lion-forces-lms
cd lion-forces-lms
composer install --no-dev --optimize-autoloader
npm run build          # skip if node isn't available -- see step 6
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

No `db:seed` on repeat deploys -- it would duplicate demo data.
