// Simplified shield-and-anchor mark echoing the real Lion Forces Academy
// logo (shield, crescent, anchor) as a single-color glyph that scales
// cleanly at both badge size (navbar) and large decorative size (hero
// placeholder panel), rather than trying to cram the full illustrated
// crest into a tiny icon.
export default function ShieldMark({ className = 'h-5 w-5' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M12 2.5 4.5 5.3v5.9c0 5.2 3.3 8.6 7.5 10.3 4.2-1.7 7.5-5.1 7.5-10.3V5.3L12 2.5Z" opacity={0.18} />
            <path d="M12 1.6 3.6 4.7v6.5c0 5.6 3.6 9.4 8.1 11.2l.3.13.3-.13c4.5-1.8 8.1-5.6 8.1-11.2V4.7L12 1.6Zm0 2.13 6.9 2.58v5.89c0 4.53-2.78 7.63-6.9 9.35-4.12-1.72-6.9-4.82-6.9-9.35V6.31L12 3.73Z" />
            <path d="M12 7c-1.24 0-2.25 1-2.25 2.25 0 .9.53 1.67 1.3 2.03v.47H9.5v1.5h1.55v.75c-1.5.28-2.55 1.4-2.55 2.75h1.5c0-.83.9-1.5 2-1.5s2 .67 2 1.5h1.5c0-1.35-1.05-2.47-2.55-2.75v-.75H15v-1.5h-1.55v-.47c.77-.36 1.3-1.13 1.3-2.03C14.75 8 13.74 7 12.5 7Zm0 1.5c.41 0 .75.34.75.75s-.34.75-.75.75-.75-.34-.75-.75.34-.75.75-.75Z" />
        </svg>
    );
}
