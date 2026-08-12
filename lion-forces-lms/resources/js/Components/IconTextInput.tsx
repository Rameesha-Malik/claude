import { InputHTMLAttributes, ReactNode } from 'react';
import TextInput from '@/Components/TextInput';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    icon: ReactNode;
    isFocused?: boolean;
}

// TextInput with a left-aligned icon slot -- the auth pages' inputs all
// follow this pattern (person/mail/lock icon inside a rounded field), so
// it's a thin wrapper rather than duplicating the icon-positioning markup
// in every form.
export default function IconTextInput({ icon, className = '', ...props }: Props) {
    return (
        <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">{icon}</span>
            <TextInput {...props} className={`w-full py-3 pl-11 pr-4 ${className}`} />
        </div>
    );
}
