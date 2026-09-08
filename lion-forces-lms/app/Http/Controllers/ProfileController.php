<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            // /profile is reachable by any authenticated user (admin or
            // student) -- picks which portal shell (sidebar/header) wraps
            // the page, same idea as the neutral /dashboard redirect.
            'userType' => $request->user()->user_type,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    // Client (WhatsApp): profile pic, test center, course, address, mobile
    // number, FSc/Matric marks %, graduation GPA -- "not compulsory
    // optional." Self-service counterpart to the admin's Student Profile
    // Biodata panel (same fields, same nullable/no-required-rule
    // approach) so a student can fill these in themselves rather than
    // only an admin being able to. Student-only in the UI (the Profile
    // page is shared with admin/staff accounts, who have no use for
    // exam marks), but not enforced server-side since there's no harm in
    // an admin account technically having these columns set.
    public function updateBiodata(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:500',
            'test_center' => 'nullable|string|max:150',
            'target_exam_name' => 'nullable|string|max:150',
            'matric_marks_percentage' => 'nullable|integer|min:0|max:100',
            'fsc_marks_percentage' => 'nullable|integer|min:0|max:100',
            'graduation_gpa' => 'nullable|numeric|min:0|max:4',
        ]);

        $request->user()->update($data);

        return Redirect::route('profile.edit');
    }

    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate(['avatar' => 'required|image|max:2048']);

        $user = $request->user();
        $old = $user->avatar_path;

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar_path' => $path]);

        if ($old) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($old);
        }

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
