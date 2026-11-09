import { ReactNode } from 'react';

interface Props {
    eyebrow?: string;
    title: string;
    description?: ReactNode;
    right?: ReactNode;
}

/** Flat page-header: no gradient wash, no icon-in-circle badge -- client
 * feedback was that the gradient card + icon badge combo reads as a
 * generic AI-dashboard template. A plain bottom border and a muted label
 * line carry the same information without the decoration. */
export default function AdminPageHeader({ eyebrow, title, description, right }: Props) {
    return (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
            <div>
                {eyebrow && <p className="text-xs font-bold uppercase tracking-wide text-primary">{eyebrow}</p>}
                <h1 className={`font-display text-3xl text-text ${eyebrow ? 'mt-1' : ''}`}>{title}</h1>
                {description && <p className="mt-2 max-w-xl text-sm text-text-secondary">{description}</p>}
            </div>
            {right && <div className="flex flex-shrink-0 flex-wrap items-center gap-3">{right}</div>}
        </div>
    );
}
