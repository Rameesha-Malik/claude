<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use App\Models\UserDevice;
use App\Support\FeatureFlags;
use App\Support\NotificationSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

/**
 * Settings > [General|Mail|Appearance|Notifications|Security|Courses|
 * Quizzes|Features] (reference screenshot) -- previously this page was
 * only "Admin & Staff Accounts" + payment method details. Everything new
 * here is stored through the existing Setting key/value store (no new
 * tables needed for most of it -- see Setting::get/set), so each tab is
 * just its own validate-and-set method, and each field takes effect via
 * whatever already reads that Setting key (AppServiceProvider for
 * mail/session, LoginRequest for attempts, CheckMaintenanceMode/
 * CheckStudentActive middleware, Enrollment::activate() for expiry, the
 * student attempt controllers for quiz defaults, FeatureFlags for the
 * toggles).
 */
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
            'general' => [
                'site_name' => Setting::get('site_name'),
                'tagline' => Setting::get('tagline'),
                'support_email' => Setting::get('support_email'),
                'timezone' => Setting::get('timezone', 'UTC'),
                'default_locale' => Setting::get('default_locale', 'en'),
                'header_logo_path' => Setting::get('header_logo_path'),
                'footer_logo_path' => Setting::get('footer_logo_path'),
                'favicon_path' => Setting::get('favicon_path'),
                'email_logo_path' => Setting::get('email_logo_path'),
                'robots_txt' => Setting::get('robots_txt'),
                'llms_txt' => Setting::get('llms_txt'),
                'meta_title' => Setting::get('meta_title'),
                'meta_description' => Setting::get('meta_description'),
                'meta_keywords' => Setting::get('meta_keywords'),
                'og_image_path' => Setting::get('og_image_path'),
                'schema_jsonld' => Setting::get('schema_jsonld'),
                'google_analytics_script' => Setting::get('google_analytics_script'),
                'header_scripts' => Setting::get('header_scripts'),
            ],
            'mail' => [
                'from_address' => Setting::get('mail_from_address'),
                'from_name' => Setting::get('mail_from_name'),
                'host' => Setting::get('mail_host'),
                'port' => Setting::get('mail_port'),
                'username' => Setting::get('mail_username'),
                'password' => Setting::get('mail_password') ? '••••••••' : '',
                'encryption' => Setting::get('mail_encryption', 'tls'),
                'verify_tls' => Setting::get('mail_verify_tls', true),
            ],
            'notifications' => [
                'admin_email' => NotificationSettings::adminEmail(),
                ...collect(NotificationSettings::defaults())->keys()
                    ->mapWithKeys(fn ($k) => [$k => NotificationSettings::enabled($k)])->all(),
            ],
            'security' => [
                'session_lifetime_minutes' => Setting::get('session_lifetime_minutes', 120),
                'max_login_attempts' => Setting::get('max_login_attempts', 5),
                'max_device_login' => Setting::get('max_device_login', 0),
                'restrict_primary_device' => Setting::get('restrict_primary_device', false),
                'require_email_verification' => Setting::get('require_email_verification', false),
                'maintenance_mode' => Setting::get('maintenance_mode', false),
                'deactivated_student_message' => Setting::get(
                    'deactivated_student_message',
                    'Your account has been de-activated. Please contact the administrator for further assistance.',
                ),
            ],
            'courseSettings' => [
                'course_expiry_days' => Setting::get('course_expiry_days'),
            ],
            'quizSettings' => [
                'default_quiz_duration_minutes' => Setting::get('default_quiz_duration_minutes'),
                'default_max_attempts' => Setting::get('default_max_attempts'),
                'default_quiz_rules' => Setting::get('default_quiz_rules'),
                'quiz_retake_limit' => Setting::get('quiz_retake_limit'),
            ],
            'features' => FeatureFlags::all(),
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

    // --- General ---

    public function updateGeneral(Request $request)
    {
        $data = $request->validate([
            'site_name' => 'nullable|string|max:150',
            'tagline' => 'nullable|string|max:255',
            'support_email' => 'nullable|email|max:150',
            'timezone' => 'nullable|string|max:64',
            'default_locale' => 'nullable|string|max:10',
            'robots_txt' => 'nullable|string|max:5000',
            'llms_txt' => 'nullable|string|max:20000',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:500',
            'schema_jsonld' => 'nullable|string|max:10000',
            'google_analytics_script' => 'nullable|string|max:5000',
            'header_scripts' => 'nullable|string|max:5000',
        ]);

        foreach ($data as $key => $value) {
            Setting::set($key, $value);
        }

        return back()->with('success', 'General settings updated.');
    }

    // One endpoint for all 4 logo slots (header/footer/favicon/email) --
    // WebsiteController::updateLogo already does this exact upload/replace
    // dance for the single generic site logo; `slot` just picks which
    // Setting key this upload writes to instead of duplicating the method
    // 4 times.
    public function updateBrandImage(Request $request, string $slot)
    {
        $slots = ['header_logo', 'footer_logo', 'favicon', 'email_logo', 'og_image'];
        abort_unless(in_array($slot, $slots, true), 404);

        $request->validate(['image' => 'required|image|max:2048']);

        $key = "{$slot}_path";
        $old = Setting::get($key);
        $path = $request->file('image')->store('branding', 'public');
        Setting::set($key, $path);

        if ($old) {
            Storage::disk('public')->delete($old);
        }

        return back()->with('success', 'Image updated.');
    }

    // --- Mail ---

    public function updateMail(Request $request)
    {
        $data = $request->validate([
            'from_address' => 'nullable|email|max:150',
            'from_name' => 'nullable|string|max:150',
            'host' => 'nullable|string|max:150',
            'port' => 'nullable|integer|min:1|max:65535',
            'username' => 'nullable|string|max:150',
            'password' => 'nullable|string|max:255',
            'encryption' => 'nullable|in:tls,ssl,',
            'verify_tls' => 'boolean',
        ]);

        foreach ($data as $key => $value) {
            if ($key === 'password' && $value === '••••••••') {
                continue; // unchanged -- the index() response masks the real value
            }
            Setting::set("mail_{$key}", $key === 'verify_tls' ? (bool) $value : $value, $key === 'verify_tls' ? 'boolean' : 'string');
        }

        return back()->with('success', 'Mail settings updated.');
    }

    public function testMail(Request $request)
    {
        $data = $request->validate(['email' => 'required|email']);

        try {
            Mail::raw(
                'This is a test email from your Lion Forces Academy admin panel. If you received this, your SMTP settings are working.',
                fn ($message) => $message->to($data['email'])->subject('Test email — SMTP settings'),
            );
        } catch (\Throwable $e) {
            return back()->with('error', 'Could not send test email: '.$e->getMessage());
        }

        return back()->with('success', "Test email sent to {$data['email']}.");
    }

    // --- Notifications ---

    public function updateNotifications(Request $request)
    {
        $events = array_keys(NotificationSettings::defaults());

        $data = $request->validate([
            'admin_email' => 'nullable|email|max:150',
            ...collect($events)->mapWithKeys(fn ($e) => [$e => 'boolean'])->all(),
        ]);

        Setting::set('notify_admin_email', $data['admin_email'] ?? null);
        foreach ($events as $event) {
            Setting::set("notify_{$event}", (bool) ($data[$event] ?? false), 'boolean');
        }

        return back()->with('success', 'Notification settings updated.');
    }

    // --- Security ---

    public function updateSecurity(Request $request)
    {
        $data = $request->validate([
            'session_lifetime_minutes' => 'required|integer|min:5|max:10080',
            'max_login_attempts' => 'required|integer|min:1|max:50',
            'max_device_login' => 'required|integer|min:0|max:20',
            'restrict_primary_device' => 'boolean',
            'require_email_verification' => 'boolean',
            'maintenance_mode' => 'boolean',
            'deactivated_student_message' => 'nullable|string|max:1000',
        ]);

        Setting::set('session_lifetime_minutes', $data['session_lifetime_minutes']);
        Setting::set('max_login_attempts', $data['max_login_attempts']);
        Setting::set('max_device_login', $data['max_device_login']);
        Setting::set('restrict_primary_device', (bool) ($data['restrict_primary_device'] ?? false), 'boolean');
        Setting::set('require_email_verification', (bool) ($data['require_email_verification'] ?? false), 'boolean');
        Setting::set('maintenance_mode', (bool) ($data['maintenance_mode'] ?? false), 'boolean');
        Setting::set('deactivated_student_message', $data['deactivated_student_message'] ?? null);

        return back()->with('success', 'Security settings updated.');
    }

    // Lets a student log in from a new device again after hitting the
    // device cap -- without this, "restrict to primary device" would
    // permanently lock out anyone who loses/replaces their phone.
    public function resetDevices(Request $request)
    {
        $data = $request->validate(['email' => 'required|email']);

        $student = User::where('email', $data['email'])->where('user_type', 'student')->first();
        abort_unless($student, 404, 'No student found with that email.');

        UserDevice::where('user_id', $student->id)->delete();

        return back()->with('success', "{$student->name}'s registered devices were reset.");
    }

    // --- Courses ---

    public function updateCourses(Request $request)
    {
        $data = $request->validate(['course_expiry_days' => 'nullable|integer|min:1|max:3650']);

        Setting::set('course_expiry_days', $data['course_expiry_days'] ?? null);

        return back()->with('success', 'Course settings updated.');
    }

    // --- Quizzes ---

    public function updateQuizzes(Request $request)
    {
        $data = $request->validate([
            'default_quiz_duration_minutes' => 'nullable|integer|min:1|max:600',
            'default_max_attempts' => 'nullable|integer|min:1|max:100',
            'default_quiz_rules' => 'nullable|string|max:2000',
            'quiz_retake_limit' => 'nullable|integer|min:1|max:100',
        ]);

        foreach ($data as $key => $value) {
            Setting::set($key, $value);
        }

        return back()->with('success', 'Quiz defaults updated.');
    }

    // --- Features ---

    public function updateFeatures(Request $request)
    {
        $data = $request->validate([
            'flashcards' => 'boolean',
            'custom_quiz' => 'boolean',
            'full_test' => 'boolean',
            'notes' => 'boolean',
        ]);

        foreach ($data as $key => $value) {
            Setting::set("feature_{$key}", (bool) $value, 'boolean');
        }

        return back()->with('success', 'Feature toggles updated.');
    }
}
