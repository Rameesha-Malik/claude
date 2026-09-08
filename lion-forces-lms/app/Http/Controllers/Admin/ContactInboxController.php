<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactInboxController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Admin/ContactInbox/Index', [
            'submissions' => ContactSubmission::query()
                ->when($request->filter === 'new', fn ($q) => $q->where('is_handled', false))
                ->when($request->filter === 'read', fn ($q) => $q->where('is_handled', true))
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'counts' => [
                'total' => ContactSubmission::count(),
                'new' => ContactSubmission::where('is_handled', false)->count(),
                'read' => ContactSubmission::where('is_handled', true)->count(),
            ],
            'filters' => $request->only(['filter']),
        ]);
    }

    public function toggleHandled(ContactSubmission $submission)
    {
        $submission->update(['is_handled' => ! $submission->is_handled]);

        return back();
    }
}
