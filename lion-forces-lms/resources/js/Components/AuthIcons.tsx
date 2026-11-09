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

export function PhoneIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 3.5h2.2l1 3.3-1.6 1.4a9 9 0 004.7 4.7l1.4-1.6 3.3 1v2.2c0 .8-.7 1.5-1.5 1.4-6.1-.5-11-5.4-11.5-11.5-.1-.8.6-1.5 1.4-1.5z" />
        </svg>
    );
}

export function BuildingIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <rect x="4" y="3" width="8.5" height="14" rx="1" />
            <path strokeLinecap="round" d="M12.5 8.5H16a1 1 0 011 1V17h-4.5M6.5 6.5h1.5m-1.5 3h1.5m-1.5 3h1.5" />
        </svg>
    );
}

export function MapPinIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 17.5s5.5-4.9 5.5-9A5.5 5.5 0 004.5 8.5c0 4.1 5.5 9 5.5 9z" />
            <circle cx="10" cy="8.5" r="1.9" />
        </svg>
    );
}

export function FlagIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 17V3.5M5.5 4l6.3-1.2a1 1 0 011.2 1.2l-.7 3.3a1 1 0 001.2 1.2l1-.2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 4v7.5l6.3-1.2a1 1 0 011.2 1.2" />
        </svg>
    );
}

export function PercentIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <circle cx="5.75" cy="5.75" r="2" />
            <circle cx="14.25" cy="14.25" r="2" />
            <path strokeLinecap="round" d="M15 5L5 15" />
        </svg>
    );
}

export function GraduationCapIcon({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 7.5L10 4l7.5 3.5L10 11 2.5 7.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 9v3.5c0 1.1 2 2 4.5 2s4.5-.9 4.5-2V9" />
        </svg>
    );
}
