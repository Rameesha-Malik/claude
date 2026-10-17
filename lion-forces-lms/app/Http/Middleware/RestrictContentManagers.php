<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Content managers "can add or edit content in assigned courses. They
 * cannot manage students, enrollments, or settings." This only ever
 * evaluates for accounts that actually hold the 'content_manager' role --
 * owner, staff, and every other admin account pass through untouched, so
 * this can't accidentally lock out real admin access.
 */
class RestrictContentManagers
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->hasRole('content_manager')) {
            abort(403, 'Content managers cannot access this area.');
        }

        return $next($request);
    }
}
