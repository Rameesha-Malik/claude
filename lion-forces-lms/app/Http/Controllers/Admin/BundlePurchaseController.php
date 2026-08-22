<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BundlePurchase;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

// Mirrors Admin\PaymentController's verify/reject flow, except verifying a
// bundle purchase activates every enrollment it fanned out into (one per
// course in the bundle) instead of a single enrollment.
class BundlePurchaseController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Admin/BundlePurchases/Index', [
            'purchases' => BundlePurchase::with(['user:id,name,email', 'bundle:id,title'])
                ->when($request->status, fn ($q, $s) => $q->where('status', $s))
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'filters' => $request->only(['status']),
        ]);
    }

    public function verify(Request $request, BundlePurchase $purchase)
    {
        $purchase->update([
            'status' => 'verified',
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        $purchase->enrollments()->get()->each(function ($enrollment) {
            $enrollment->update([
                'status' => 'active',
                'activated_at' => $enrollment->activated_at ?? now(),
            ]);
        });

        return back()->with('success', 'Bundle purchase verified — all included courses activated.');
    }

    public function reject(Request $request, BundlePurchase $purchase)
    {
        $purchase->update([
            'status' => 'rejected',
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
            'notes' => $request->input('notes'),
        ]);

        return back()->with('success', 'Bundle purchase rejected.');
    }
}
