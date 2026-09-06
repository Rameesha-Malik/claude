<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Setting;
use App\Models\UserDevice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $this->enforceDeviceRestriction($request);

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    // "Restrict students to primary device only" / "Max device login"
    // (Settings > Security). Off by default -- only students are checked,
    // staff/owner accounts are never restricted. A device is recognized by
    // a long-lived cookie; the first `max_device_login` distinct cookies
    // seen for an account are allowed, any device beyond that is refused
    // at login (the account itself stays intact -- an admin can reset the
    // student's known devices to let a new one in).
    private function enforceDeviceRestriction(LoginRequest $request): void
    {
        $user = Auth::user();

        if ($user->user_type !== 'student' || ! Setting::get('restrict_primary_device', false)) {
            return;
        }

        $deviceToken = $request->cookie('device_token');
        if (! $deviceToken) {
            $deviceToken = Str::random(40);
            Cookie::queue(Cookie::forever('device_token', $deviceToken));
        }

        $known = UserDevice::where('user_id', $user->id)->where('device_token', $deviceToken)->first();

        if ($known) {
            $known->update(['last_seen_at' => now(), 'user_agent' => $request->userAgent()]);

            return;
        }

        $maxDevices = (int) Setting::get('max_device_login', 0);
        $deviceCount = UserDevice::where('user_id', $user->id)->count();

        if ($maxDevices > 0 && $deviceCount >= $maxDevices) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => 'You\'re already signed in on the maximum number of devices allowed for this account. Contact support to reset your device.',
            ]);
        }

        UserDevice::create([
            'user_id' => $user->id,
            'device_token' => $deviceToken,
            'user_agent' => $request->userAgent(),
            'last_seen_at' => now(),
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
