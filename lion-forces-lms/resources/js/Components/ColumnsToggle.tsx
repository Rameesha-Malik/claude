import { useState } from 'react';

interface Column { key: string; label: string }

// Dropdown checklist to show/hide table columns -- client's reference
// "Project Data Table" had this next to its filters. Visibility choice
// lives in the calling page's own state (not persisted), reset to all-on
// per visit.
export default function ColumnsToggle({
    columns,
    visible,
    onToggle,
}: {
    columns: Column[];
    visible: Record<string, boolean>;
    onToggle: (key: string) => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:border-primary hover:text-primary"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h4v16H4V4zm6 0h4v16h-4V4zm6 0h4v16h-4V4z" />
                </svg>
                Columns
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-border bg-surface py-1.5 shadow-xl">
                        {columns.map((col) => (
                            <label key={col.key} className="flex cursor-pointer items-center gap-2.5 px-4 py-2 text-sm text-text hover:bg-surface-sunken">
                                <input
                                    type="checkbox"
                                    checked={visible[col.key] ?? true}
                                    onChange={() => onToggle(col.key)}
                                    className="rounded border-border text-primary"
                                />
                                {col.label}
                            </label>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
