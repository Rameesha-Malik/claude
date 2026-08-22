<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Bundle;
use App\Models\BundlePurchase;
use App\Models\Enrollment;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

// Mirrors Student\CheckoutController, but one purchase fans out into an
// Enrollment per course in the bundle rather than a single course/package.
class BundleCheckoutController extends Controller
{
    public function create(Request $request, Bundle $bundle): Response
    {
        $bundle->load(['courses' => fn ($q) => $q->orderBy('order')]);
        $courseIds = $bundle->courses->pluck('id');

        // Already enrolled in every course this bundle includes? Don't sell
        // it again. Partial overlap is still allowed through — the
        // enrollment loop below simply skips courses already active.
        $alreadyActiveCount = Enrollment::where('user_id', $request->user()->id)
            ->whereIn('course_id', $courseIds)
            ->where('status', 'active')
            ->count();

        $pendingPurchase = BundlePurchase::where('user_id', $request->user()->id)
            ->where('bundle_id', $bundle->id)
            ->where('status', 'pending')
            ->exists();

        if ($alreadyActiveCount === $courseIds->count()) {
            return Inertia::render('Student/BundleCheckout', ['alreadyEnrolled' => 'active', 'bundle' => $bundle->only('title', 'slug')]);
        }
        if ($pendingPurchase) {
            return Inertia::render('Student/BundleCheckout', ['alreadyEnrolled' => 'pending', 'bundle' => $bundle->only('title', 'slug')]);
        }

        return Inertia::render('Student/BundleCheckout', [
            'bundle' => $bundle->only('id', 'title', 'slug', 'price', 'description'),
            'courses' => $bundle->courses->only(['id', 'title'])->map->only('id', 'title'),
            'payment' => [
                'bankDetails' => Setting::get('payment_bank_details'),
                'easypaisaNumber' => Setting::get('payment_easypaisa_number'),
                'jazzcashNumber' => Setting::get('payment_jazzcash_number'),
            ],
        ]);
    }

    public function store(Request $request, Bundle $bundle)
    {
        $bundle->load('courses:id');

        $data = $request->validate([
            'method' => 'required|in:bank_transfer,easypaisa,jazzcash',
            'reference_number' => 'nullable|string|max:100',
            'proof_file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $purchase = BundlePurchase::create([
            'user_id' => $request->user()->id,
            'bundle_id' => $bundle->id,
            'amount' => $bundle->price,
            'method' => $data['method'],
            'status' => 'pending',
            'reference_number' => $data['reference_number'] ?? null,
            'proof_file_path' => $request->file('proof_file')->store('payment-proofs', 'public'),
        ]);

        foreach ($bundle->courses as $course) {
            $existing = Enrollment::where('user_id', $request->user()->id)
                ->where('course_id', $course->id)
                ->whereIn('status', ['active', 'pending'])
                ->first();

            // Don't create a second pending/active enrollment for a course
            // the student already has through another purchase.
            if ($existing) {
                continue;
            }

            Enrollment::create([
                'user_id' => $request->user()->id,
                'course_id' => $course->id,
                'bundle_purchase_id' => $purchase->id,
                'status' => 'pending',
            ]);
        }

        return redirect()->route('student.courses')->with('success', 'Payment submitted! We\'ll verify it and activate your courses, usually within a day.');
    }
}
