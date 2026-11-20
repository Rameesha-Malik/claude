import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

export interface TabBarItem<T extends string> {
    key: T;
    label: ReactNode;
    href?: string;
}

interface Props<T extends string> {
    tabs: TabBarItem<T>[];
    active: T;
    onChange?: (key: T) => void;
    className?: string;
}

// Plain underline tabs (active tab gets a colored bottom border, inactive
// tabs are muted text, the row sits on one shared baseline) -- replaces
// every pill/rounded-box tab bar across the student portal (My Courses'
// module tabs, Custom Quiz's cross-page tabs, Profile's settings tabs)
// with one shared, consistent style. An item with href navigates as a
// real page Link (Custom Quiz's tabs are separate routes); without one,
// it's a same-page client-side switch (a button calling onChange).
export default function TabBar<T extends string>({ tabs, active, onChange, className = '' }: Props<T>) {
    return (
        <div className={`flex gap-6 overflow-x-auto border-b border-border ${className}`}>
            {tabs.map((t) => {
                const isActive = t.key === active;
                const itemClass = `flex-shrink-0 whitespace-nowrap border-b-2 pb-3 text-sm font-bold uppercase tracking-wide transition-colors duration-fast ${
                    isActive ? 'border-primary text-text' : 'border-transparent text-text-muted hover:text-text'
                }`;
                return t.href ? (
                    <Link key={t.key} href={t.href} className={itemClass}>
                        {t.label}
                    </Link>
                ) : (
                    <button key={t.key} type="button" onClick={() => onChange?.(t.key)} className={itemClass}>
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
}
