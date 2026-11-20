// Icon set for HomeSection "items" (why_choose_us content on Home, reused
// as the value-grid on About) -- keyed by the `icon` field admins pick per
// item, so this is shared rather than duplicated per page.
export default function WhyChooseIcon({ name, className = 'h-6 w-6' }: { name: string; className?: string }) {
    const paths: Record<string, string> = {
        medal: 'M12 2l2.4 5 5.6.5-4.2 3.7 1.3 5.5L12 13.8 6.9 16.7l1.3-5.5L4 7.5l5.6-.5L12 2zm0 13v7m-3-3l3 3 3-3',
        infinity: 'M8.5 9a3 3 0 100 6 3 3 0 002.3-1.1L12 12l1.2 1.9A3 3 0 1015.5 9a3 3 0 00-2.3 1.1L12 12l-1.2-1.9A3 3 0 008.5 9z',
        chart: 'M4 20V10m6.67 10V4M17.33 20v-7',
        play: 'M12 2a10 10 0 100 20 10 10 0 000-20zm-1.5 6.5l6 3.5-6 3.5v-7z',
        gift: 'M4 9h16v11H4V9zm0 0V7a2 2 0 012-2h12a2 2 0 012 2v2M12 9v11M8 5a2 2 0 114 0c0 1.5-2 4-2 4s-2-2.5-2-4zm4 0a2 2 0 114 0c0 1.5-2 4-2 4s-2-2.5-2-4z',
        headset: 'M4 13a8 8 0 1116 0v4a2 2 0 01-2 2h-1v-6h3M4 17v-4h3v6H5a2 2 0 01-2-2z',
        tag: 'M20.6 12.6L12.6 4.6a2 2 0 00-1.4-.6H5a1 1 0 00-1 1v6.2c0 .5.2 1 .6 1.4l8 8a2 2 0 002.8 0l5.2-5.2a2 2 0 000-2.8zM8 8h.01',
        'shield-check': 'M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4zm-3.2 9.2l2 2 4.4-4.4',
    };
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={paths[name] ?? paths['shield-check']} />
        </svg>
    );
}
