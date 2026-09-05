import { useRef } from 'react';

interface Props {
    value: string;
    onChange: (value: string) => void;
    rows?: number;
    className?: string;
    placeholder?: string;
}

// Wraps the selected text in `before`/`after` (or inserts a placeholder at
// the cursor if nothing is selected), then restores focus and selection so
// a user can keep typing/formatting without having to re-click the field.
function wrapSelection(el: HTMLTextAreaElement, before: string, after: string, placeholder: string) {
    const { selectionStart, selectionEnd, value } = el;
    const selected = value.slice(selectionStart, selectionEnd) || placeholder;
    const next = value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);

    el.value = next;
    el.focus();
    el.selectionStart = selectionStart + before.length;
    el.selectionEnd = selectionStart + before.length + selected.length;

    return next;
}

// Same idea but for a line-prefix (heading, bullet) rather than a wrap --
// applies to the start of whichever line the cursor/selection is on.
function prefixLine(el: HTMLTextAreaElement, prefix: string) {
    const { selectionStart, value } = el;
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);

    el.value = next;
    el.focus();
    el.selectionStart = el.selectionEnd = selectionStart + prefix.length;

    return next;
}

/**
 * A plain <textarea> with a lightweight formatting toolbar (bold, italic,
 * underline, heading, bullet list) -- client feedback: "add text editor in
 * all places of website where it used to input text like bold italic
 * underline font etc." Deliberately not a full WYSIWYG (no new dependency,
 * no arbitrary-HTML storage/XSS surface): it writes simple markdown-like
 * syntax (**bold**, *italic*, ++underline++, ## Heading, "- " bullets) into
 * the same plain-text field these forms already save, and LiteMarkdown.tsx
 * renders just those patterns back out safely wherever this content is
 * displayed. "Font" wasn't taken literally as a font-family picker -- that
 * would mean storing arbitrary style data for a formatting model built
 * entirely around safe, fixed markdown patterns; happy to add if a specific
 * need for it comes up.
 */
export default function RichTextArea({ value, onChange, rows = 4, className = '', placeholder }: Props) {
    const ref = useRef<HTMLTextAreaElement>(null);

    function apply(fn: (el: HTMLTextAreaElement) => string) {
        if (!ref.current) return;
        onChange(fn(ref.current));
    }

    return (
        <div>
            <div className="mb-1.5 flex gap-1">
                <button type="button" title="Bold" onClick={() => apply((el) => wrapSelection(el, '**', '**', 'bold text'))} className={toolbarBtn}>
                    <strong>B</strong>
                </button>
                <button type="button" title="Italic" onClick={() => apply((el) => wrapSelection(el, '*', '*', 'italic text'))} className={toolbarBtn}>
                    <em>I</em>
                </button>
                <button type="button" title="Underline" onClick={() => apply((el) => wrapSelection(el, '++', '++', 'underlined text'))} className={toolbarBtn}>
                    <span className="underline">U</span>
                </button>
                <button type="button" title="Heading" onClick={() => apply((el) => prefixLine(el, '## '))} className={toolbarBtn}>
                    H
                </button>
                <button type="button" title="Bullet list item" onClick={() => apply((el) => prefixLine(el, '- '))} className={toolbarBtn}>
                    •
                </button>
            </div>
            <textarea
                ref={ref}
                rows={rows}
                placeholder={placeholder}
                className={className}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

const toolbarBtn = 'flex h-7 w-7 items-center justify-center rounded-md border border-border text-xs font-bold text-text-secondary hover:border-primary hover:text-primary';
