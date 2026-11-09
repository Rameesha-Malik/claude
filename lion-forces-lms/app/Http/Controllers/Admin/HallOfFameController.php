<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HallOfFame;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HallOfFameController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/HallOfFame/Index', [
            'entries' => HallOfFame::orderBy('order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'achievement_text' => 'required|string|max:1000',
        ]);

        HallOfFame::create($data + ['order' => HallOfFame::max('order') + 1, 'is_active' => true]);

        return back()->with('success', 'Entry added.');
    }

    public function update(Request $request, HallOfFame $hallOfFame)
    {
        $hallOfFame->update($request->validate([
            'name' => 'required|string|max:150',
            'achievement_text' => 'required|string|max:1000',
            'is_active' => 'boolean',
        ]));

        return back()->with('success', 'Entry updated.');
    }

    public function destroy(HallOfFame $hallOfFame)
    {
        $hallOfFame->delete();

        return back()->with('success', 'Entry removed.');
    }
}
