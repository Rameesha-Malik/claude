// Line icons for the Contact form fields that AuthIcons doesn't cover
// (phone, subject/tag, message) -- same stroke-based style as AuthIcons so
// IconTextInput looks consistent across auth and contact forms.
export function PhoneIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 3.5h2.7l1.3 3.4-1.7 1.4a9 9 0 004.9 4.9l1.4-1.7 3.4 1.3v2.7c0 .9-.8 1.6-1.7 1.5-6-.6-10.7-5.3-11.3-11.3-.1-.9.6-1.7 1.5-1.7z" />
        </svg>
    );
}

export function TagIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.5h5.5V9L8.4 17.1a1.5 1.5 0 01-2.1 0l-3.4-3.4a1.5 1.5 0 010-2.1L11 3.5z" />
            <circle cx="13.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

export function MessageIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.75A1.75 1.75 0 014.75 3h10.5A1.75 1.75 0 0117 4.75v7A1.75 1.75 0 0115.25 13.5H8l-3.5 3v-3H4.75A1.75 1.75 0 013 11.75v-7z" />
        </svg>
    );
}
