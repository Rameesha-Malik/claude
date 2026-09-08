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
        $payments = Payment::with(['enrollment.user:id,name,email', 'enrollment.course:id,title'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->search, fn ($q, $s) => $q->whereHas(
                'enrollment.user',
                fn ($u) => $u->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")
            ))
            ->when($request->date_from, fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->date_to, fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only(['status', 'search', 'date_from', 'date_to']),
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
        // Enrollment::activate() also computes the real expiry date from
        // the package's validity_days, not just the active/inactive flag.
        $payment->enrollment->activate();

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
