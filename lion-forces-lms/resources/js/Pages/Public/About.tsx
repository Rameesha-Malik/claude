import { Head, Link } from '@inertiajs/react';
import AnimatedCounter from '@/Components/AnimatedCounter';
import GradientMesh from '@/Components/GradientMesh';
import RevealOnScroll from '@/Components/RevealOnScroll';
import SectionKicker from '@/Components/SectionKicker';
import ShieldMark from '@/Components/ShieldMark';
import TiltCard from '@/Components/TiltCard';
import WhyChooseIcon from '@/Components/WhyChooseIcon';
import PublicLayout from '@/Layouts/PublicLayout';
import heroAboutMentorship from '@/assets/hero/about-mentorship.jpg';

interface Instructor { name: string; photo_path: string | null; qualification: string | null; experience: string | null; bio: string | null }
interface StatItem { icon: string | null; number: string; label: string }
interface Props {
    instructors: Instructor[];
    section: { title: string; content: { paragraph?: string; items?: { title: string; description: string; icon?: string }[] } } | null;
    stats: StatItem[];
}

function SparkleIcon({ className = 'h-6 w-6' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
        </svg>
    );
}

// Hand-drawn-style curved arrow, echoing the reference's doodle pointing
// from the headline down toward the CTA.
function DoodleArrow({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 90 90" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={className}>
            <path d="M8 8c2 22 10 45 30 58 14 9 30 8 44-2" strokeDasharray="4 5" />
            <path d="M70 52l14 12-16 6" />
        </svg>
    );
}

export default function About({ instructors, section, stats }: Props) {
    const items = section?.content.items ?? [];

    return (
        <PublicLayout>
            <Head title="About Us" />

            {/* ---------------- Hero — bold split block ---------------- */}
            <section className="mx-auto max-w-container px-4 pt-10 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <RevealOnScroll className="relative overflow-hidden rounded-3xl bg-surface-brand p-8 sm:p-12">
                        <span
                            aria-hidden
                            className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-40 blur-3xl"
                            style={{ backgroundColor: 'var(--teal-300)' }}
                        />
                        <div className="relative">
                            <span className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-secondary shadow-sm">
                                <ShieldMark className="h-3.5 w-3.5 text-primary" /> About Lion Forces Academy
                            </span>

                            <h1 className="mt-6 font-display text-4xl uppercase leading-[1.05] tracking-wide text-secondary sm:text-5xl">
                                Preparing Pakistan&apos;s Next Generation
                                <span className="relative ml-3 inline-flex text-primary">
                                    of Officers
                                    <SparkleIcon className="ml-1.5 mt-1 h-6 w-6 text-primary" />
                                </span>
                            </h1>

                            <p className="mt-5 max-w-lg text-text-secondary">
                                A modern, results-driven learning platform built for Pakistan Armed Forces test
                                preparation — structured training, smart assessments, and performance tracking to
                                help candidates prepare with confidence and clarity.
                            </p>

                            <div className="relative mt-8 flex flex-wrap items-center gap-5">
                                <Link
                                    href="/courses"
                                    className="rounded-full bg-secondary px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-on-secondary shadow-lg transition-all duration-normal ease-spring hover:-translate-y-0.5 hover:bg-teal-800"
                                >
                                    Explore Courses
                                </Link>
                                <div className="hidden items-center gap-2 text-sm font-semibold text-secondary sm:flex">
                                    <DoodleArrow className="h-10 w-10 -translate-y-1 text-secondary/50" />
                                    Meet the Team
                                </div>
                            </div>
                        </div>
                    </RevealOnScroll>

                    {/* floating card stack -- real mentorship photo, same
                        approach as the Home hero photo slot */}
                    <RevealOnScroll staggerMs={110} className="relative hidden min-h-[22rem] lg:block">
                        <div
                            aria-hidden
                            className="absolute right-4 top-4 h-[90%] w-[90%] rounded-[2rem]"
                            style={{
                                backgroundColor: 'var(--color-surface-sunken)',
                                backgroundImage: 'radial-gradient(var(--color-border-strong) 1.5px, transparent 1.5px)',
                                backgroundSize: '14px 14px',
                            }}
                        />
                        <div className="relative h-[90%] w-[90%] overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-secondary via-teal-800 to-teal-950 shadow-2xl">
                            <img
                                src={heroAboutMentorship}
                                alt="A Pakistan armed forces instructor mentoring cadets around a study table"
                                className="h-full w-full object-cover"
                            />
                            {/* subtle brand-color wash, matching the Home hero treatment --
                                inline rgba, not a Tailwind opacity-modified `secondary` utility,
                                since that token is a plain CSS color value, not an alpha-ready
                                channel triplet */}
                            <div
                                aria-hidden
                                className="absolute inset-0"
                                style={{ background: 'linear-gradient(to top, rgba(4, 39, 38, 0.6), rgba(4, 39, 38, 0.05) 55%, transparent 80%)' }}
                            />
                        </div>

                        {instructors[0] && (
                            <div className="absolute -left-4 top-10 w-64 -rotate-3 rounded-2xl border border-border bg-surface p-4 shadow-xl">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
                                        {instructors[0].name.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-text">{instructors[0].name}</p>
                                        <p className="truncate text-xs text-text-muted">{instructors[0].qualification ?? 'Instructor'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {stats[0] && (
                            <div className="absolute -bottom-2 right-0 rotate-2 rounded-2xl bg-secondary px-5 py-4 text-white shadow-xl">
                                <div className="font-display text-2xl text-gold-400">
                                    <AnimatedCounter value={stats[0].number} />
                                </div>
                                <div className="text-xs text-teal-200">{stats[0].label}</div>
                            </div>
                        )}
                    </RevealOnScroll>
                </div>
            </section>

            {/* ---------------- Our Approach — icon-row list, distinct from Home's bento treatment of the same data ---------------- */}
            {items.length > 0 && (
                <section className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-8">
                    <RevealOnScroll className="mx-auto mb-14 max-w-2xl text-center">
                        <SectionKicker>Our Approach</SectionKicker>
                        <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">What Makes Us Different</h2>
                        {section?.content.paragraph && <p className="mt-3 text-text-secondary">{section.content.paragraph}</p>}
                    </RevealOnScroll>

                    <RevealOnScroll className="mx-auto grid max-w-4xl gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
                        {items.map((item, i) => (
                            <div key={i} className="flex items-start gap-4 bg-surface p-6 transition-colors duration-normal hover:bg-primary-subtle">
                                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                                    <WhyChooseIcon name={item.icon ?? 'shield-check'} className="h-5 w-5" />
                                </span>
                                <div>
                                    <h3 className="font-bold text-text">{item.title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </RevealOnScroll>
                </section>
            )}

            {/* ---------------- Impact — dark stat block, real numbers ---------------- */}
            {stats.length > 0 && (
                <section className="relative overflow-hidden bg-gradient-to-br from-secondary to-teal-950 py-20 text-center text-white">
                    <GradientMesh className="opacity-60" />
                    <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <SectionKicker dark>
                            <span className="mx-auto">Our Impact</span>
                        </SectionKicker>
                        <h2 className="font-display text-4xl uppercase tracking-wide sm:text-5xl">Numbers That Speak for Themselves</h2>

                        <RevealOnScroll className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
                            {stats.map((stat, i) => (
                                <div key={i} className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-glass">
                                    <div className="font-display text-4xl text-gold-400">
                                        <AnimatedCounter value={stat.number} />
                                    </div>
                                    <div className="mt-1 text-sm text-teal-200">{stat.label}</div>
                                </div>
                            ))}
                        </RevealOnScroll>
                    </div>
                </section>
            )}

            {/* ---------------- Instructors ---------------- */}
            {instructors.length > 0 && (
                <section className="py-20">
                    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
                        <RevealOnScroll className="mx-auto mb-14 max-w-2xl text-center">
                            <SectionKicker>The Team</SectionKicker>
                            <h2 className="font-display text-4xl uppercase tracking-wide text-text sm:text-5xl">Our Instructors</h2>
                        </RevealOnScroll>

                        <RevealOnScroll className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {instructors.map((instructor, i) => (
                                <TiltCard key={i} max={5} className="rounded-2xl">
                                    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 text-center shadow-sm transition-shadow duration-normal hover:shadow-lg">
                                        {instructor.photo_path ? (
                                            <img
                                                src={`/storage/${instructor.photo_path}`}
                                                alt=""
                                                className="mx-auto h-20 w-20 rounded-full object-cover shadow-sm"
                                            />
                                        ) : (
                                            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-subtle font-display text-2xl text-primary">
                                                {instructor.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                        <h3 className="mt-4 font-bold text-text">{instructor.name}</h3>
                                        {instructor.qualification && (
                                            <p className="mt-0.5 text-sm font-semibold text-primary">{instructor.qualification}</p>
                                        )}
                                        {instructor.experience && (
                                            <p className="mt-1 text-xs uppercase tracking-wide text-text-muted">{instructor.experience}</p>
                                        )}
                                        {instructor.bio && <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">{instructor.bio}</p>}
                                    </div>
                                </TiltCard>
                            ))}
                        </RevealOnScroll>
                    </div>
                </section>
            )}

            {/* ---------------- Closing CTA ---------------- */}
            <section className="mx-auto max-w-container px-4 pb-24 sm:px-6 lg:px-8">
                <RevealOnScroll>
                    <div className="relative overflow-hidden rounded-3xl bg-surface-brand p-10 text-center sm:p-16">
                        <span
                            aria-hidden
                            className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full opacity-40 blur-3xl"
                            style={{ backgroundColor: 'var(--teal-300)' }}
                        />
                        <h2 className="relative font-display text-4xl uppercase tracking-wide text-secondary sm:text-5xl">
                            Start Your Preparation Today
                        </h2>
                        <p className="relative mt-3 text-text-secondary">Join thousands of candidates training with structured, expert-led courses.</p>
                        <div className="relative mt-8 flex flex-wrap justify-center gap-4">
                            <Link
                                href="/courses"
                                className="rounded-full bg-secondary px-8 py-4 text-sm font-bold uppercase tracking-wide text-on-secondary shadow-lg transition-all duration-normal ease-spring hover:-translate-y-0.5 hover:bg-teal-800"
                            >
                                Explore Courses
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-full border-2 border-secondary px-8 py-4 text-sm font-bold uppercase tracking-wide text-secondary transition-all duration-normal hover:-translate-y-0.5 hover:bg-surface"
                            >
                                Create Free Account
                            </Link>
                        </div>
                    </div>
                </RevealOnScroll>
            </section>
        </PublicLayout>
    );
}
