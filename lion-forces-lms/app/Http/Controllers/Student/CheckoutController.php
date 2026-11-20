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

        // An enrollment that already grants every module blocks the whole
        // checkout page. A narrower one (Quiz Only, Lectures+Tests, etc.)
        // only blocks re-buying something it already covers -- the student
        // can still come back here for whatever it doesn't, so
        // existingEnrollments is sent down instead of a single blanket
        // "already enrolled" flag.
        $existing = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->whereIn('status', ['active', 'pending'])
            ->get();

        $fullEnrollment = $existing->first(fn ($e) => $this->covers($e->modules ?? [], Enrollment::ALL_MODULES));
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
            // Each existing active/pending enrollment's modules + status --
            // lets the page grey out just the packages those already fully
            // cover, instead of blocking the whole checkout (same "covers"
            // check as store(), below).
            'existingEnrollments' => $existing->map(fn ($e) => ['modules' => $e->modules, 'status' => $e->status])->values(),
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
        $modules = $package->modules ?? Enrollment::ALL_MODULES;

        // Blocks re-buying something the student is about to pay for that
        // an existing enrollment already fully covers (e.g. already have
        // Quiz+Tests, trying to buy Quiz alone again), but not a purchase
        // that still gets them something new -- someone with Quiz Only can
        // still come back and buy Tests Only, or Quiz+Assignments, etc.
        $alreadyCovered = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->whereIn('status', ['active', 'pending'])
            ->get()
            ->contains(fn ($e) => $this->covers($e->modules ?? [], $modules));

        if ($alreadyCovered) {
            return redirect()->route('student.courses')->with('success', 'You already have an enrollment that covers this.');
        }

        $amount = $package->price ?? $course->base_price;

        abort_if($amount === null, 422, 'This course has no price set. Contact us to enroll.');

        $enrollment = Enrollment::create([
            'user_id' => $request->user()->id,
            'course_id' => $course->id,
            'package_id' => $package?->id,
            'modules' => $modules,
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

    // True if everything in $want is already present in $have -- e.g. an
    // existing ["lectures","quiz","tests"] enrollment covers a new
    // ["quiz"] purchase, but not the other way around.
    private function covers(array $have, array $want): bool
    {
        return count(array_diff($want, $have)) === 0;
    }
}
