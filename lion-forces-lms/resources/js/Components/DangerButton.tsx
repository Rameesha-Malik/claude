import { ButtonHTMLAttributes } from 'react';

export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-lg bg-danger px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-fast hover:opacity-90 focus:outline-none focus:shadow-glow ${
                    disabled && 'opacity-50'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
