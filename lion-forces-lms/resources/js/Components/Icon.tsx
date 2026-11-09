// Generic outline-icon wrapper (Heroicons-style 24x24 stroke paths) --
// was copy-pasted as an identical local `function Icon(...)` in four
// separate files (AdminLayout, StudentLayout, Admin/Dashboard,
// Student/Dashboard); centralized here so every page draws from one
// definition instead of four that could silently drift apart.
export default function Icon({ d, className = 'h-5 w-5' }: { d: string; className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}
