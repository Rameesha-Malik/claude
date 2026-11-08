// Small circular initial-letter avatar for a person's name in a table row
// or card -- the same inline pattern Students/Index.tsx already used,
// pulled out now that Payments/Enrollments tables want it too.
export default function AvatarInitial({ name, size = 'h-8 w-8 text-xs' }: { name: string; size?: string }) {
    return (
        <span className={`flex flex-shrink-0 items-center justify-center rounded-full bg-primary-subtle font-bold text-primary ${size}`}>
            {name.charAt(0).toUpperCase()}
        </span>
    );
}
