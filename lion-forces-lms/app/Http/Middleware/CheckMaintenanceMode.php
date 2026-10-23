<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * "Maintenance mode" (Settings > Security). Distinct from Laravel's own
 * `php artisan down` (which needs shell access to toggle) -- this is a
 * Setting an admin can flip from the UI, checked here on every request.
 * Admins pass through so they can keep working/testing while it's on.
 */
class CheckMaintenanceMode
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Setting::get('maintenance_mode', false)) {
            return $next($request);
        }

        if ($request->user()?->user_type === 'admin') {
            return $next($request);
        }

        // Auth routes stay reachable (both the GET login form and the POST
        // that submits it -- the POST route carries no route name, so this
        // checks the path rather than routeIs()) so an admin can still log
        // in during maintenance; everything else renders the maintenance
        // page.
        if ($request->is('login', 'logout')) {
            return $next($request);
        }

        return Inertia::render('Public/Maintenance')->toResponse($request)->setStatusCode(503);
    }
}
