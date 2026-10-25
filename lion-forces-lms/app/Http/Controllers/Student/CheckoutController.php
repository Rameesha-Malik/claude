<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

// This is the missing half of the manual payment flow: the admin side
// (verify/reject a submitted Payment, activate the Enrollment) already
// existed, but nothing let a student actually create one. See
// Admin\PaymentController for the other half of this loop.
class CheckoutController extends Controller
{
    public function create(Request $request, Course $course): Response
    {
        // Same guard as PublicSiteController::courseDetail() -- a
        // draft/hidden course's page shouldn't be viewable, let alone
        // checked out of, before it's published.
        abort_unless($course->status === 'published', 404);

        // A 'full' enrollment already covers everything a student could
        // buy for this course, so it still blocks the whole checkout page.
        // A 'quiz'-or'tests'-only enrollment only blocks buying that same
        // module again -- the student can still come back here to buy the
        // other one, so existingModules is sent down instead of a single
        // blanket "already enrolled" flag.
        $existing = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->whereIn('status', ['active', 'pending'])
            ->get();

        $fullEnrollment = $existing->firstWhere('module', 'full');
        if ($fullEnrollment) {
            return Inertia::render('Student/Checkout', [
                'alreadyEnrolled' => $fullEnrollment->status,
                'course' => $course->only('title', 'slug'),
            ]);
        }

        $course->load(['packages' => fn ($q) => $q->where('is_active', true)->orderBy('price')]);

        $selectedPackageId = $request->integer('package') ?: null;
        if ($selectedPackageId && ! $course->packages->contains('id', $selectedPackageId)) {
            $selectedPackageId = null; // ignore a package id that isn't actually this course's
        }

        return Inertia::render('Student/Checkout', [
            'course' => $course->only('id', 'title', 'slug', 'base_price'),
            'packages' => $course->packages,
            'selectedPackageId' => $selectedPackageId,
            // module => status, for whichever modules this student already
            // has a pending/active purchase for -- lets the page grey out
            // just those packages instead of blocking the whole checkout.
            'existingModules' => $existing->pluck('status', 'module'),
            'payment' => [
                'bankDetails' => Setting::get('payment_bank_details'),
                'easypaisaNumber' => Setting::get('payment_easypaisa_number'),
                'jazzcashNumber' => Setting::get('payment_jazzcash_number'),
            ],
        ]);
    }

    public function store(Request $request, Course $course)
    {
        abort_unless($course->status === 'published', 404);

        $data = $request->validate([
            'package_id' => 'nullable|exists:course_packages,id',
            'method' => 'required|in:bank_transfer,easypaisa,jazzcash',
            'reference_number' => 'nullable|string|max:100',
            'proof_file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $package = $data['package_id'] ? $course->packages()->find($data['package_id']) : null;
        $module = $package->module ?? 'full';

        // Blocks re-buying the exact module the student is about to pay
        // for (or anything if they already have full access), but not a
        // *different* module of the same course -- someone with Quiz Only
        // can still come back and buy Tests Only separately.
        $alreadyHasModule = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->whereIn('status', ['active', 'pending'])
            ->where(fn ($q) => $q->where('module', 'full')->orWhere('module', $module))
            ->exists();

        if ($alreadyHasModule) {
            return redirect()->route('student.courses')->with('success', 'You already have an enrollment that covers this.');
        }

        $amount = $package->price ?? $course->base_price;

        abort_if($amount === null, 422, 'This course has no price set. Contact us to enroll.');

        $enrollment = Enrollment::create([
            'user_id' => $request->user()->id,
            'course_id' => $course->id,
            'package_id' => $package?->id,
            'module' => $module,
            'status' => 'pending',
        ]);

        Payment::create([
            'enrollment_id' => $enrollment->id,
            'amount' => $amount,
            'method' => $data['method'],
            'status' => 'pending',
            'reference_number' => $data['reference_number'] ?? null,
            'proof_file_path' => $request->file('proof_file')->store('payment-proofs', 'public'),
        ]);

        if (\App\Support\NotificationSettings::enabled('payment_received')) {
            User::notifyAdmins(
                'New payment submitted',
                "{$request->user()->name} submitted a payment of Rs. ".number_format($amount)." for {$course->title}.",
                '/admin/payments',
            );
        }

        return redirect()->route('student.courses')->with('success', 'Payment submitted! We\'ll verify it and activate your course, usually within 1 hour.');
    }
}
