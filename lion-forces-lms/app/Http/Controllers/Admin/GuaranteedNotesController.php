<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Faq;
use App\Models\NoteAssignment;
use App\Models\NotePurchase;
use App\Models\NotesBank;
use App\Models\Subject;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Guaranteed Notes" as a sellable product line, built on the NotesBank
 * table: this page owns the full lifecycle (create/edit/delete, plus the
 * commerce columns -- category/type/access/status -- and its own Purchase
 * Requests queue). Content Library used to own note creation/editing
 * separately from this storefront view of the same notes; that split was
 * the only real duplication in the admin -- folded in here as the single
 * place to manage a note, so there's one page, not two.
 */
class GuaranteedNotesController extends Controller
{
    public function index(Request $request): Response
    {
        $notes = NotesBank::with('subject:id,name')
            ->withCount(['purchases' => fn ($q) => $q->where('status', 'verified')])
            ->when($request->search, fn ($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->when($request->subject_id, fn ($q, $s) => $q->where('subject_id', $s))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/GuaranteedNotes/Index', [
            'notes' => $notes,
            'subjects' => Subject::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'subject_id']),
            'stats' => [
                'total' => NotesBank::count(),
                'paid' => NotesBank::where('price', '>', 0)->count(),
                'pending_requests' => NotePurchase::where('status', 'pending')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'subject_id' => 'nullable|exists:subjects,id',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'is_published' => 'boolean',
            'pdf' => 'nullable|file|mimes:pdf|max:20480',
        ]);

        // 'local' disk, not 'public' -- a note's PDF is never reachable by a
        // direct /storage/... URL. Students only ever see it rendered
        // page-by-page through the protected viewer (see
        // PublicSiteController::noteFile()).
        if ($request->hasFile('pdf')) {
            $data['file_path'] = $request->file('pdf')->store('notes-bank', 'local');
        }
        unset($data['pdf']);

        $note = NotesBank::create($data + ['created_by' => $request->user()->id]);
        ActivityLog::record('added', 'Note', $note->id, "Note \"{$note->title}\" was added.");

        return back()->with('success', 'Note added.');
    }

    public function update(Request $request, NotesBank $note)
    {
        $data = $request->validate([
            'subject_id' => 'nullable|exists:subjects,id',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'is_published' => 'boolean',
            'pdf' => 'nullable|file|mimes:pdf|max:20480',
            'remove_pdf' => 'boolean',
        ]);

        if ($request->hasFile('pdf')) {
            if ($note->file_path) {
                Storage::disk('local')->delete($note->file_path);
            }
            $data['file_path'] = $request->file('pdf')->store('notes-bank', 'local');
        } elseif ($data['remove_pdf'] ?? false) {
            if ($note->file_path) {
                Storage::disk('local')->delete($note->file_path);
            }
            $data['file_path'] = null;
        }
        unset($data['pdf'], $data['remove_pdf']);

        $note->update($data);

        ActivityLog::record('edited', 'Note', $note->id, "Note \"{$note->title}\" was updated.");

        return back()->with('success', 'Note updated.');
    }

    public function destroy(NotesBank $note)
    {
        if ($note->file_path) {
            Storage::disk('local')->delete($note->file_path);
        }
        $note->delete();

        return back()->with('success', 'Note removed.');
    }

    public function purchaseRequests(Request $request): Response
    {
        return Inertia::render('Admin/GuaranteedNotes/PurchaseRequests', [
            'purchases' => NotePurchase::with(['user:id,name,email', 'note:id,title'])
                ->when($request->status, fn ($q, $s) => $q->where('status', $s))
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'filters' => $request->only(['status']),
        ]);
    }

    public function verify(Request $request, NotePurchase $purchase)
    {
        $purchase->update([
            'status' => 'verified',
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        // Grants access the same way a package-level "Guaranteed Notes"
        // assignment does -- this student now sees the note wherever
        // personal note assignments are already surfaced.
        NoteAssignment::firstOrCreate([
            'note_id' => $purchase->note_id,
            'assignable_type' => \App\Models\User::class,
            'assignable_id' => $purchase->user_id,
        ]);

        return back()->with('success', 'Purchase verified. Note unlocked for the student.');
    }

    public function reject(Request $request, NotePurchase $purchase)
    {
        $purchase->update([
            'status' => 'rejected',
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        return back()->with('success', 'Purchase rejected.');
    }

    // Testimonials/FAQs assigned to a note, shown on that note's public
    // detail page. Both reuse the site-wide Faq/Testimonial models (scoped
    // by note_id) and WebsiteController's existing store/update/destroy
    // endpoints -- these two index pages are just a note-focused view onto
    // the same data.
    public function testimonials(Request $request): Response
    {
        return Inertia::render('Admin/GuaranteedNotes/Testimonials', [
            'testimonials' => Testimonial::whereNotNull('note_id')->with('note:id,title')->orderBy('order')->get(),
            'notes' => NotesBank::orderBy('title')->get(['id', 'title']),
        ]);
    }

    public function faqs(Request $request): Response
    {
        return Inertia::render('Admin/GuaranteedNotes/Faqs', [
            'faqs' => Faq::whereNotNull('note_id')->with('note:id,title')->orderBy('order')->get(),
            'notes' => NotesBank::orderBy('title')->get(['id', 'title']),
        ]);
    }
}
