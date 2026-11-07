import { useState } from 'react';
import LiteMarkdown from '@/Components/LiteMarkdown';

// Shared accordion row for FAQ lists (Home + Contact) -- single open/close
// state per item, no shared "only one open at a time" behavior since each
// list is short enough that it isn't needed. `dark` switches the text
// colors for use on a dark-glass panel (Contact's hero canvas) instead of
// a plain light card (Home).
export default function FaqAccordionItem({ question, answer, dark = false }: { question: string; answer: string; dark?: boolean }) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button
                className={`flex w-full items-center justify-between px-6 py-5 text-left font-medium ${dark ? 'text-white' : 'text-text'}`}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                {question}
                <svg
                    className={`h-5 w-5 flex-shrink-0 transition-transform duration-fast ${open ? 'rotate-180' : ''} ${dark ? 'text-teal-300' : 'text-text-muted'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && <LiteMarkdown text={answer} className={`px-6 pb-5 text-sm ${dark ? 'text-teal-100' : 'text-text-secondary'}`} />}
        </div>
    );
}
