<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Auth\Middleware\EnsureEmailIsVerified;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * "Require email verification on registration" (Settings > Security).
 * Overrides Laravel's built-in `verified` middleware alias (see
 * bootstrap/app.php) so the enforcement itself is read live from Settings
 * on every request -- toggling it in the admin panel takes effect
 * immediately, with no route-cache staleness concern from conditionally
 * attaching/omitting the middleware at route-registration time instead.
 *
 * Defaults OFF (unlike the reference screenshot's checked default): User
 * previously didn't implement MustVerifyEmail at all, so this middleware
 * was already a silent no-op everywhere -- defaulting this setting to on
 * would instantly lock out every already-registered, never-verified
 * student the moment this ships. An admin who wants it can switch it on
 * deliberately from Settings > Security.
 */
class CheckEmailVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Setting::get('require_email_verification', false)) {
            return $next($request);
        }

        return app(EnsureEmailIsVerified::class)->handle($request, $next);
    }
}
