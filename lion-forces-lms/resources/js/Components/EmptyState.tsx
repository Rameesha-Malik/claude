import { ReactNode } from 'react';

interface Props {
    title?: string;
    message?: ReactNode;
    action?: ReactNode;
    children?: ReactNode;
}

/** Shared dashed-border empty-state card, used in place of the same markup
 * copy-pasted across most Admin list pages. */
export default function EmptyState({ title, message, action, children }: Props) {
    return (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center text-text-secondary">
            {children ?? (
                <>
                    {title && <p className="font-bold text-text">{title}</p>}
                    {message && <p className={title ? 'mt-1 text-sm' : 'text-sm'}>{message}</p>}
                    {action && <div className="mt-4">{action}</div>}
                </>
            )}
        </div>
    );
}
