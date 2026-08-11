import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['selector', '[data-theme="dark"]'],

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
                urdu: ['Noto Nastaliq Urdu', ...defaultTheme.fontFamily.sans],
                display: ['Bebas Neue', 'Anton', ...defaultTheme.fontFamily.sans],
            },
            // Every utility below resolves to resources/css/tokens.css.
            // Never hardcode a hex in a component — extend tokens.css instead.
            colors: {
                canvas: 'var(--color-canvas)',
                surface: {
                    DEFAULT: 'var(--color-surface)',
                    raised: 'var(--color-surface-raised)',
                    sunken: 'var(--color-surface-sunken)',
                    brand: 'var(--color-surface-brand)',
                    inverse: 'var(--color-surface-inverse)',
                },
                text: {
                    DEFAULT: 'var(--color-text)',
                    secondary: 'var(--color-text-secondary)',
                    muted: 'var(--color-text-muted)',
                    brand: 'var(--color-text-brand)',
                    inverse: 'var(--color-text-inverse)',
                },
                border: {
                    DEFAULT: 'var(--color-border)',
                    strong: 'var(--color-border-strong)',
                    brand: 'var(--color-border-brand)',
                },
                primary: {
                    DEFAULT: 'var(--color-primary)',
                    hover: 'var(--color-primary-hover)',
                    active: 'var(--color-primary-active)',
                    subtle: 'var(--color-primary-subtle)',
                    fg: 'var(--color-on-primary)',
                },
                secondary: {
                    DEFAULT: 'var(--color-secondary)',
                    hover: 'var(--color-secondary-hover)',
                    fg: 'var(--color-on-secondary)',
                },
                accent: {
                    DEFAULT: 'var(--color-accent)',
                    hover: 'var(--color-accent-hover)',
                    fg: 'var(--color-on-accent)',
                },
                // Top-level alias so `text-on-primary`/`text-on-secondary`/
                // `text-on-accent` resolve. Without this, those 47+ call
                // sites across the app compile to no CSS rule at all
                // (Tailwind only generates `text-primary-fg` etc. from the
                // nested `fg` keys above) and every button/CTA silently
                // renders with the default dark text color instead of the
                // intended light text on a saturated background.
                on: {
                    primary: 'var(--color-on-primary)',
                    secondary: 'var(--color-on-secondary)',
                    accent: 'var(--color-on-accent)',
                },
                gold: {
                    300: 'var(--gold-300)', 400: 'var(--gold-400)', 500: 'var(--gold-500)',
                    600: 'var(--gold-600)', 700: 'var(--gold-700)',
                },
                success: { DEFAULT: 'var(--color-success)', bg: 'var(--color-success-bg)' },
                warning: { DEFAULT: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
                danger: { DEFAULT: 'var(--color-danger)', bg: 'var(--color-danger-bg)' },
                info: { DEFAULT: 'var(--color-info)', bg: 'var(--color-info-bg)' },
                answer: {
                    correct: 'var(--color-answer-correct)',
                    'correct-bg': 'var(--color-answer-correct-bg)',
                    wrong: 'var(--color-answer-wrong)',
                    'wrong-bg': 'var(--color-answer-wrong-bg)',
                    skipped: 'var(--color-answer-skipped)',
                    'skipped-bg': 'var(--color-answer-skipped-bg)',
                    marked: 'var(--color-answer-marked)',
                    'marked-bg': 'var(--color-answer-marked-bg)',
                },
                deadline: {
                    open: 'var(--color-deadline-open)',
                    soon: 'var(--color-deadline-soon)',
                    closed: 'var(--color-deadline-closed)',
                },
                chart: {
                    1: 'var(--chart-1)', 2: 'var(--chart-2)', 3: 'var(--chart-3)',
                    4: 'var(--chart-4)', 5: 'var(--chart-5)', 6: 'var(--chart-6)',
                },
                // Raw brand ramp — for one-off marketing/gradient work only.
                // Components should reach for the semantic names above.
                teal: {
                    50: 'var(--teal-50)', 100: 'var(--teal-100)', 200: 'var(--teal-200)',
                    300: 'var(--teal-300)', 400: 'var(--teal-400)', 500: 'var(--teal-500)',
                    600: 'var(--teal-600)', 700: 'var(--teal-700)', 800: 'var(--teal-800)',
                    900: 'var(--teal-900)', 950: 'var(--teal-950)',
                },
            },
            borderRadius: {
                sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)',
                xl: 'var(--radius-xl)', '2xl': 'var(--radius-2xl)', full: 'var(--radius-full)',
            },
            boxShadow: {
                xs: 'var(--shadow-xs)', sm: 'var(--shadow-sm)', md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)', xl: 'var(--shadow-xl)', glow: 'var(--shadow-glow)',
            },
            spacing: {
                18: '4.5rem',
            },
            transitionDuration: {
                instant: 'var(--duration-instant)', fast: 'var(--duration-fast)',
                normal: 'var(--duration-normal)', slow: 'var(--duration-slow)',
                slower: 'var(--duration-slower)',
            },
            transitionTimingFunction: {
                out: 'var(--ease-out)', 'in-out': 'var(--ease-in-out)', spring: 'var(--ease-spring)',
            },
            backdropBlur: {
                glass: 'var(--glass-blur)',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
            },
            animation: {
                float: 'float 6s ease-in-out infinite',
            },
            maxWidth: {
                container: 'var(--container-max)',
            },
        },
    },

    plugins: [forms],
};
