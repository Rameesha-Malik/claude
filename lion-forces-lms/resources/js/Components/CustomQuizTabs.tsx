import { Link } from '@inertiajs/react';

type Tab = 'create' | 'tests' | 'favorites';

const TABS: { key: Tab; label: string; href: string }[] = [
    { key: 'create', label: 'Create Test', href: '/portal/custom-quiz' },
    { key: 'tests', label: 'Tests', href: '/portal/custom-quiz/tests' },
    { key: 'favorites', label: 'Favorites', href: '/portal/favourite-questions' },
];

// Client reference: UWorld's QBank app keeps Create Test / Tests /
// Favorites behind one tab bar inside the QBank itself (not just reachable
// from the outer app's own top-level nav, which also links Favorites
// separately -- the reference does both at once, so this adds the
// in-module bar without removing the existing standalone nav entries).
// Plain full-page <Link> navigation to each tab's own route, not a
// client-side switch -- same pattern this app already uses everywhere
// else for tabbed areas that are really separate pages (e.g. AdminLayout).
export default function CustomQuizTabs({ active }: { active: Tab }) {
    return (
        <div className="mb-6 flex gap-1.5 overflow-x-auto rounded-full border border-border bg-surface p-1.5">
            {TABS.map((t) => (
                <Link
                    key={t.key}
                    href={t.href}
                    className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all duration-fast ${
                        active === t.key ? 'bg-primary text-on-primary shadow-sm' : 'text-text-secondary hover:bg-surface-sunken hover:text-text'
                    }`}
                >
                    {t.label}
                </Link>
            ))}
        </div>
    );
}
