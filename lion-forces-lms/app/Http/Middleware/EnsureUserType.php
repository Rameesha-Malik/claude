<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gate a route group to a specific user_type ('admin' or 'student').
 * Separate from Spatie's role/permission checks: this is the coarse
 * "which portal" split, permissions handle "which admin screens".
 */
class EnsureUserType
{
    public function handle(Request $request, Closure $next, string $type): Response
    {
        abort_unless($request->user()?->user_type === $type, 403);

        return $next($request);
    }
}
