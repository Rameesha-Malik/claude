// Small line icons for the auth form fields (person/mail/lock/check) --
// kept together since Login/Register/ResetPassword all need the same set.
export function PersonIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <circle cx="10" cy="6.5" r="3.25" />
            <path strokeLinecap="round" d="M3.5 17c0-3.31 2.91-6 6.5-6s6.5 2.69 6.5 6" />
        </svg>
    );
}

export function MailIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.5l7 5.5 7-5.5" />
        </svg>
    );
}

export function LockIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <rect x="4" y="9" width="12" height="8" rx="1.75" />
            <path strokeLinecap="round" d="M6.5 9V6.5a3.5 3.5 0 017 0V9" />
        </svg>
    );
}

export function CheckCircleIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <circle cx="10" cy="10" r="7.25" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 10.2l2 2 4-4.4" />
        </svg>
    );
}
