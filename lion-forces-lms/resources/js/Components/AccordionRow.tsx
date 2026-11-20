import { ReactNode, useState } from 'react';
import LiquidButton, { Tone } from '@/Components/LiquidButton';

interface Props {
    icon: ReactNode;
    iconTone?: Tone;
    title: ReactNode;
    pill?: ReactNode;
    subtitle?: ReactNode;
    defaultOpen?: boolean;
    children: ReactNode;
}

// Collapsed-by-default row: icon badge + title + status pill + a chevron
// that expands the full content, so a long list of notes/revision items
// doesn't show every answer-reveal button and note body at once -- only
// the header line a student needs to recognize which item is which.
export default function AccordionRow({ icon, iconTone = 'dark', title, pill, subtitle, defaultOpen = false, children }: Props) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="rounded-[2rem] border border-border bg-surface p-5">
            <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-4 text-left">
                <LiquidButton tone={iconTone} className="h-11 w-11 flex-shrink-0 p-0">
                    {icon}
                </LiquidButton>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-text">{title}</h3>
                        {pill}
                    </div>
                    {subtitle && <p className="mt-0.5 truncate text-sm text-text-muted">{subtitle}</p>}
                </div>
                <span
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface-sunken text-text-muted transition-transform duration-fast"
                    style={{ transform: open ? 'rotate(180deg)' : 'none' }}
                >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 7.5 10 13l5-5.5" />
                    </svg>
                </span>
            </button>

            {open && <div className="mt-4 border-t border-border pt-4">{children}</div>}
        </div>
    );
}
