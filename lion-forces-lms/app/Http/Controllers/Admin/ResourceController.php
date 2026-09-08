<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Resource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResourceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Resources/Index', [
            'resources' => Resource::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
            'external_link' => 'nullable|string|max:500',
        ]);

        Resource::create($data + ['is_published' => true]);

        return back()->with('success', 'Resource added.');
    }

    public function update(Request $request, Resource $resource)
    {
        $resource->update($request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
            'external_link' => 'nullable|string|max:500',
            'is_published' => 'boolean',
        ]));

        return back()->with('success', 'Resource updated.');
    }

    public function destroy(Resource $resource)
    {
        $resource->delete();

        return back()->with('success', 'Resource removed.');
    }
}
