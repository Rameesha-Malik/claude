import TabBar from '@/Components/TabBar';

type Tab = 'create' | 'tests' | 'favorites' | 'browse' | 'progress';

const TABS: { key: Tab; label: string; href: string }[] = [
    { key: 'create', label: 'Create Test', href: '/portal/custom-quiz' },
    { key: 'tests', label: 'Tests', href: '/portal/custom-quiz/tests' },
    { key: 'favorites', label: 'Favorites', href: '/portal/favourite-questions' },
    { key: 'browse', label: 'Browse', href: '/portal/custom-quiz/browse' },
    { key: 'progress', label: 'Progress', href: '/portal/custom-quiz/progress' },
];

// Client reference: UWorld's QBank app keeps Create Test / Tests /
// Favorites / Browse behind one tab bar inside the QBank itself (not just
// reachable from the outer app's own top-level nav, which also links
// Favorites separately -- the reference does both at once, so this adds
// the in-module bar without removing the existing standalone nav entries).
// Each tab navigates as a real page Link to its own route, not a
// client-side switch -- same pattern this app already uses everywhere
// else for tabbed areas that are really separate pages (e.g. AdminLayout).
export default function CustomQuizTabs({ active }: { active: Tab }) {
    return <TabBar tabs={TABS} active={active} className="mb-6" />;
}
