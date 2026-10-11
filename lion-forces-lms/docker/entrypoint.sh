#!/bin/sh
set -e

# Some free/no-database-included hosts (e.g. Render's free tier, which has
# no free managed MySQL) run this same image with DB_CONNECTION=sqlite
# instead of mysql -- Laravel needs the database FILE to already exist
# before `migrate` will touch it, unlike a real DB server which Laravel
# just connects to. Harmless no-op everywhere else (DB_CONNECTION=mysql
# skips this entirely).
if [ "$DB_CONNECTION" = "sqlite" ]; then
    mkdir -p database
    touch database/database.sqlite
fi

# Idempotent -- safe to run on every boot/redeploy. Migrations that already
# ran are skipped by Laravel's migration table, so this never re-runs work.
php artisan config:clear
php artisan migrate --force

# Seeding is opt-in via an env var rather than automatic, because the
# seeders use create() (not firstOrCreate) in places -- running them on
# every restart would duplicate demo data. Set SEED_ON_BOOT=true once for
# the first deploy, then unset it in Railway's Variables tab.
if [ "$SEED_ON_BOOT" = "true" ]; then
    php artisan db:seed --force
fi

php artisan storage:link || true
php artisan config:cache
php artisan route:cache

# public/.user.ini's upload limits are only honored by CGI/FPM SAPIs, not
# the CLI built-in server `artisan serve` uses -- so they're re-applied
# here via -d flags, otherwise lecture video uploads would silently fail
# on staging even though they work in production (Hostinger is FPM-based).
exec php \
    -d upload_max_filesize=550M \
    -d post_max_size=560M \
    -d max_execution_time=300 \
    -d memory_limit=512M \
    artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
