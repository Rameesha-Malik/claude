<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Admin/Payments/Index', [
            'payments' => Payment::with(['enrollment.user:id,name,email', 'enrollment.course:id,title'])
                ->when($request->status, fn ($q, $s) => $q->where('status', $s))
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'filters' => $request->only(['status']),
        ]);
    }

    public function verify(Request $request, Payment $payment)
    {
        $payment->update([
            'status' => 'verified',
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        // Activating the enrollment is the point of verifying payment —
        // without this the manual bank-transfer/Easypaisa/JazzCash flow
        // never actually grants access after the admin confirms funds.
        $payment->enrollment->update([
            'status' => 'active',
            'activated_at' => $payment->enrollment->activated_at ?? now(),
        ]);

        return back()->with('success', 'Payment verified and enrollment activated.');
    }

    public function reject(Request $request, Payment $payment)
    {
        $payment->update([
            'status' => 'rejected',
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
            'notes' => $request->input('notes'),
        ]);

        return back()->with('success', 'Payment rejected.');
    }
}
