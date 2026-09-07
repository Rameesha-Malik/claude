<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\NotePurchase;
use App\Models\NotesBank;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

// Mirrors Student\CheckoutController's offline-payment flow (bank
// transfer/Easypaisa/JazzCash + proof upload, admin verifies) but against
// a single priced NotesBank item instead of a course enrollment.
class NotePurchaseController extends Controller
{
    public function create(Request $request, NotesBank $note): Response
    {
        abort_unless($note->isPaid() && $note->is_published, 404);

        $alreadyRequested = NotePurchase::where('user_id', $request->user()->id)
            ->where('note_id', $note->id)
            ->whereIn('status', ['pending', 'verified'])
            ->first();

        if ($alreadyRequested) {
            return Inertia::render('Student/NoteCheckout', [
                'note' => $note->only('id', 'title', 'price'),
                'alreadyRequested' => $alreadyRequested->status,
            ]);
        }

        return Inertia::render('Student/NoteCheckout', [
            'note' => $note->only('id', 'title', 'price'),
            'payment' => [
                'bankDetails' => Setting::get('payment_bank_details'),
                'easypaisaNumber' => Setting::get('payment_easypaisa_number'),
                'jazzcashNumber' => Setting::get('payment_jazzcash_number'),
            ],
        ]);
    }

    public function store(Request $request, NotesBank $note)
    {
        abort_unless($note->isPaid() && $note->is_published, 404);

        $alreadyRequested = NotePurchase::where('user_id', $request->user()->id)
            ->where('note_id', $note->id)
            ->whereIn('status', ['pending', 'verified'])
            ->exists();

        if ($alreadyRequested) {
            return redirect()->route('notes')->with('success', 'You already have a purchase request for this note.');
        }

        $data = $request->validate([
            'method' => 'required|in:bank_transfer,easypaisa,jazzcash',
            'reference_number' => 'nullable|string|max:100',
            'proof_file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        NotePurchase::create([
            'user_id' => $request->user()->id,
            'note_id' => $note->id,
            'amount' => $note->price,
            'method' => $data['method'],
            'status' => 'pending',
            'reference_number' => $data['reference_number'] ?? null,
            'proof_file_path' => $request->file('proof_file')->store('note-purchase-proofs', 'public'),
        ]);

        if (\App\Support\NotificationSettings::enabled('payment_received')) {
            User::notifyAdmins(
                'New note purchase submitted',
                "{$request->user()->name} submitted a payment of Rs. ".number_format($note->price)." for \"{$note->title}\".",
                '/admin/guaranteed-notes/purchase-requests',
            );
        }

        return redirect()->route('notes')->with('success', 'Purchase submitted! We\'ll verify it and unlock the note, usually within a day.');
    }
}
