import Icon from '@/Components/Icon';

// The "✕" modal-close button, repeated as a literal text glyph in ~10
// modals across admin. A plain stroke icon matches every other control
// in the app (none of which are emoji/text glyphs) and renders
// consistently across platforms instead of relying on the system font's
// own "✕" glyph.
export default function CloseButton({ onClick, label = 'Close' }: { onClick: () => void; label?: string }) {
    return (
        <button type="button" onClick={onClick} aria-label={label} className="text-text-muted hover:text-text">
            <Icon d="M6 18L18 6M6 6l12 12" className="h-5 w-5" />
        </button>
    );
}
