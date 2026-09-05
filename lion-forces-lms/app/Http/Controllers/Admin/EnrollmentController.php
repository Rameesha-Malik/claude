<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A dedicated "all enrollments" list -- previously an admin could only see
 * enrollments 6-at-a-time on the dashboard's "Recent Enrollments" table, or
 * per-student on the Students page. Nothing let them browse/search/filter
 * every enrollment across every course in one place (e.g. "who's enrolled
 * in PMA Complete Preparation" or "who's expiring soon").
 */
class EnrollmentController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Admin/Enrollments/Index', [
            'enrollments' => Enrollment::with(['user:id,name,email', 'course:id,title', 'package:id,name'])
                ->when($request->status, fn ($q, $s) => $q->where('status', $s))
                ->when($request->search, fn ($q, $s) => $q->whereHas(
                    'user',
                    fn ($u) => $u->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")
                ))
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'filters' => $request->only(['status', 'search']),
        ]);
    }
}
