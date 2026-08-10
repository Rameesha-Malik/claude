import { Head } from '@inertiajs/react';

/**
 * Placeholder — the full Admin Panel (Website Management, Student
 * Management, Course Management, Reports, etc.) is being built next.
 * This exists so admin/owner logins have somewhere to land in the
 * meantime instead of a dangling route.
 */
export default function AdminDashboard() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-canvas text-center">
            <Head title="Admin Dashboard" />
            <div>
                <div className="font-display text-3xl uppercase tracking-wide text-secondary">Admin Panel</div>
                <p className="mt-2 text-text-secondary">Under construction — coming next.</p>
            </div>
        </div>
    );
}
