<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Instructor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InstructorController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Instructors/Index', [
            'instructors' => Instructor::orderBy('order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'qualification' => 'nullable|string|max:255',
            'experience' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:2000',
        ]);

        Instructor::create($data + ['order' => Instructor::max('order') + 1, 'is_active' => true]);

        return back()->with('success', 'Instructor added.');
    }

    public function update(Request $request, Instructor $instructor)
    {
        $instructor->update($request->validate([
            'name' => 'required|string|max:150',
            'qualification' => 'nullable|string|max:255',
            'experience' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:2000',
            'is_active' => 'boolean',
        ]));

        return back()->with('success', 'Instructor updated.');
    }

    public function destroy(Instructor $instructor)
    {
        $instructor->delete();

        return back()->with('success', 'Instructor removed.');
    }
}
