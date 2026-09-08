<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The admin's own alert inbox -- "new payment submitted", "new contact
 * inquiry", etc. (see User::notifyAdmins(), dispatched from
 * CheckoutController/BundleCheckoutController/PublicSiteController).
 * Not to be confused with NotificationController, which is the reverse
 * direction: admin composing a broadcast OUT to students (nav label
 * "Broadcasts").
 */
class AlertController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Admin/Alerts/Index', [
            'notifications' => $request->user()->notifications()->paginate(20),
        ]);
    }

    public function markRead(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return back();
    }

    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }
}
