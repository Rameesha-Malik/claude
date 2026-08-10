<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $staff = User::where('user_type', 'admin')->with('roles:id,name')->orderBy('name')->get();

        return Inertia::render('Admin/Settings/Index', [
            'staff' => $staff,
            'roles' => Role::whereIn('name', ['owner', 'staff'])->pluck('name'),
            'paymentSettings' => [
                'bank_details' => Setting::get('payment_bank_details'),
                'easypaisa_number' => Setting::get('payment_easypaisa_number'),
                'jazzcash_number' => Setting::get('payment_jazzcash_number'),
            ],
        ]);
    }

    public function storeStaff(Request $request)
    {
        abort_unless($request->user()->hasRole('owner'), 403, 'Only the Owner can manage staff accounts.');

        $data = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', Password::defaults()],
            'role' => 'required|in:owner,staff',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'user_type' => 'admin',
            'email_verified_at' => now(),
        ]);
        $user->assignRole($data['role']);

        return back()->with('success', 'Staff account created.');
    }

    public function updateStaffRole(Request $request, User $staff)
    {
        abort_unless($request->user()->hasRole('owner'), 403, 'Only the Owner can manage staff accounts.');
        abort_unless($staff->user_type === 'admin', 404);

        $data = $request->validate(['role' => 'required|in:owner,staff']);
        $staff->syncRoles([$data['role']]);

        return back()->with('success', 'Role updated.');
    }

    public function toggleStaffActive(Request $request, User $staff)
    {
        abort_unless($request->user()->hasRole('owner'), 403, 'Only the Owner can manage staff accounts.');
        abort_unless($staff->user_type === 'admin', 404);
        abort_if($staff->id === auth()->id(), 403, "You can't deactivate your own account.");

        $staff->update(['is_active' => ! $staff->is_active]);

        return back()->with('success', $staff->is_active ? 'Account reactivated.' : 'Account deactivated.');
    }

    public function updatePaymentSettings(Request $request)
    {
        $data = $request->validate([
            'bank_details' => 'nullable|string|max:1000',
            'easypaisa_number' => 'nullable|string|max:30',
            'jazzcash_number' => 'nullable|string|max:30',
        ]);

        foreach ($data as $key => $value) {
            Setting::set("payment_{$key}", $value);
        }

        return back()->with('success', 'Payment settings updated.');
    }
}
