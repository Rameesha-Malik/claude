<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use Inertia\Inertia;
use Inertia\Response;

class ContactInboxController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/ContactInbox/Index', [
            'submissions' => ContactSubmission::latest()->paginate(15),
        ]);
    }

    public function toggleHandled(ContactSubmission $submission)
    {
        $submission->update(['is_handled' => ! $submission->is_handled]);

        return back();
    }
}
