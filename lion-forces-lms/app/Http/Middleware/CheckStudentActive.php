<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * "Deactivated student message" (Settings > Security): "Shown to students
 * whose account has been de-activated. They can still log in but will only
 * see this message and a sign-out option." Applied to the `portal` route
 * group only -- deactivation (User::is_active) already exists (Admin can
 * toggle it on the Students page) but nothing previously enforced it for
 * students; only staff/owner deactivation was enforced (SettingsController).
 */
class CheckStudentActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->is_active) {
            return $next($request);
        }

        return Inertia::render('Student/Deactivated', [
            'message' => Setting::get(
                'deactivated_student_message',
                'Your account has been de-activated. Please contact the administrator for further assistance.',
            ),
        ])->toResponse($request)->setStatusCode(403);
    }
}
