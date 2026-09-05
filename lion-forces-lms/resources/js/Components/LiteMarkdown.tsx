import { Fragment, ReactNode } from 'react';

// Renders **bold**, "## Heading" / "### Heading" lines, and "- " bullet
// lines from RichTextArea's plain-text output as real React elements --
// never dangerouslySetInnerHTML, so there's no HTML-injection surface even
// though this content comes from an admin-controlled field, not just a
// trusted one. Anything that isn't one of those three patterns renders as
// plain text exactly as typed.
function renderInline(text: string, keyPrefix: string): ReactNode[] {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
        }
        return <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>;
    });
}

export default function LiteMarkdown({ text, className = '' }: { text: string; className?: string }) {
    const lines = text.split('\n');
    const blocks: ReactNode[] = [];
    let bulletBuffer: string[] = [];

    function flushBullets(key: string) {
        if (bulletBuffer.length === 0) return;
        blocks.push(
            <ul key={key} className="my-2 list-disc space-y-1 pl-5">
                {bulletBuffer.map((item, i) => (
                    <li key={i}>{renderInline(item, `${key}-li-${i}`)}</li>
                ))}
            </ul>,
        );
        bulletBuffer = [];
    }

    lines.forEach((line, i) => {
        const heading3 = line.match(/^###\s+(.*)/);
        const heading2 = line.match(/^##\s+(.*)/);
        const bullet = line.match(/^[-*]\s+(.*)/);

        if (bullet) {
            bulletBuffer.push(bullet[1]);
            return;
        }
        flushBullets(`bullets-${i}`);

        if (heading3) {
            blocks.push(<h4 key={i} className="mt-3 text-base font-bold text-text">{renderInline(heading3[1], `h-${i}`)}</h4>);
        } else if (heading2) {
            blocks.push(<h3 key={i} className="mt-4 text-lg font-bold text-text">{renderInline(heading2[1], `h-${i}`)}</h3>);
        } else if (line.trim() === '') {
            blocks.push(<div key={i} className="h-2" />);
        } else {
            blocks.push(<p key={i}>{renderInline(line, `p-${i}`)}</p>);
        }
    });
    flushBullets('bullets-end');

    return <div className={className}>{blocks}</div>;
}
