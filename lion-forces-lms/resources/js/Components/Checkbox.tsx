import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-border text-primary shadow-xs focus:outline-none focus:shadow-glow ' +
                className
            }
        />
    );
}
