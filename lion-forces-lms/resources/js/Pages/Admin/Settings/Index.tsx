import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, ReactNode, useState } from 'react';
import RichTextArea from '@/Components/RichTextArea';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';

interface Staff { id: number; name: string; email: string; is_active: boolean; roles: { name: string }[] }
interface Props {
    staff: Staff[];
    roles: string[];
    paymentSettings: { bank_details: string | null; easypaisa_number: string | null; jazzcash_number: string | null };
    general: Record<string, string | null>;
    mail: { from_address: string | null; from_name: string | null; host: string | null; port: string | null; username: string | null; password: string; encryption: string; verify_tls: boolean };
    notifications: { admin_email: string | null } & Record<string, boolean>;
    security: {
        session_lifetime_minutes: number; max_login_attempts: number; max_device_login: number;
        restrict_primary_device: boolean; require_email_verification: boolean; maintenance_mode: boolean;
        deactivated_student_message: string;
    };
    courseSettings: { course_expiry_days: number | null };
    quizSettings: { default_quiz_duration_minutes: number | null; default_max_attempts: number | null; default_quiz_rules: string | null; quiz_retake_limit: number | null };
    features: { flashcards: boolean; custom_quiz: boolean; full_test: boolean; notes: boolean };
}

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const btnClass = 'rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';

const TABS = [
    { key: 'access', label: 'Access' },
    { key: 'general', label: 'General' },
    { key: 'mail', label: 'Mail' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'security', label: 'Security' },
    { key: 'courses', label: 'Courses' },
    { key: 'quizzes', label: 'Quizzes' },
    { key: 'features', label: 'Features' },
];

function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-1 font-bold text-text">{title}</h2>
            {description && <p className="mb-4 text-sm text-text-secondary">{description}</p>}
            {children}
        </div>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-text">{label}</label>
            {hint && <p className="mb-1 text-xs text-text-muted">{hint}</p>}
            {children}
        </div>
    );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
    return (
        <label className="flex items-start gap-3 rounded-xl border border-border p-3">
            <input type="checkbox" className="mt-0.5" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <span>
                <span className="block text-sm font-semibold text-text">{label}</span>
                {hint && <span className="block text-xs text-text-secondary">{hint}</span>}
            </span>
        </label>
    );
}

function AccessTab({ staff, roles, paymentSettings }: Pick<Props, 'staff' | 'roles' | 'paymentSettings'>) {
    const { auth } = usePage<PageProps>().props;
    const isOwner = staff.find((s) => s.id === auth.user?.id)?.roles.some((r) => r.name === 'owner') ?? false;
    const addForm = useForm({ name: '', email: '', password: '', role: 'staff' });
    const paymentForm = useForm({ ...paymentSettings });

    return (
        <div className="space-y-6">
            <Card title="Admin & Staff Accounts">
                <div className="mb-4 space-y-2">
                    {staff.map((s) => (
                        <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                            <div>
                                <div className="font-medium text-text">{s.name} {s.id === auth.user?.id && <span className="text-xs text-text-muted">(you)</span>}</div>
                                <div className="text-text-secondary">{s.email}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-bold uppercase text-primary">{s.roles[0]?.name ?? 'staff'}</span>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${s.is_active ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>
                                    {s.is_active ? 'Active' : 'Inactive'}
                                </span>
                                {isOwner && s.id !== auth.user?.id && (
                                    <button onClick={() => router.post(`/admin/settings/staff/${s.id}/toggle-active`)} className="text-xs font-bold uppercase text-danger hover:underline">
                                        {s.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {isOwner ? (
                    <>
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Add Staff Account</h3>
                        <form onSubmit={(e) => { e.preventDefault(); addForm.post('/admin/settings/staff', { onSuccess: () => addForm.reset() }); }} className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <input className={inputClass} placeholder="Name" value={addForm.data.name} onChange={(e) => addForm.setData('name', e.target.value)} />
                                <input className={inputClass} placeholder="Email" value={addForm.data.email} onChange={(e) => addForm.setData('email', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="password" className={inputClass} placeholder="Password" value={addForm.data.password} onChange={(e) => addForm.setData('password', e.target.value)} />
                                <select className={inputClass} value={addForm.data.role} onChange={(e) => addForm.setData('role', e.target.value)}>
                                    {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <button type="submit" disabled={addForm.processing} className={btnClass}>Create Account</button>
                            {Object.values(addForm.errors).map((m, i) => <div key={i} className="text-sm text-danger">{String(m)}</div>)}
                        </form>
                    </>
                ) : (
                    <p className="text-sm text-text-muted">Only the Owner can manage staff accounts.</p>
                )}
            </Card>

            <Card title="Payment Details" description="Shown to students during checkout. Online gateway integration can be added later without changing this screen.">
                <form onSubmit={(e) => { e.preventDefault(); paymentForm.put('/admin/settings/payment'); }} className="space-y-3">
                    <Field label="Bank Transfer Details">
                        <RichTextArea rows={2} className={inputClass} value={paymentForm.data.bank_details ?? ''} onChange={(v) => paymentForm.setData('bank_details', v)} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Easypaisa Number">
                            <input className={inputClass} value={paymentForm.data.easypaisa_number ?? ''} onChange={(e) => paymentForm.setData('easypaisa_number', e.target.value)} />
                        </Field>
                        <Field label="JazzCash Number">
                            <input className={inputClass} value={paymentForm.data.jazzcash_number ?? ''} onChange={(e) => paymentForm.setData('jazzcash_number', e.target.value)} />
                        </Field>
                    </div>
                    <button type="submit" disabled={paymentForm.processing} className={btnClass}>Save Payment Details</button>
                </form>
            </Card>
        </div>
    );
}

function GeneralTab({ general }: { general: Props['general'] }) {
    const form = useForm({
        site_name: general.site_name ?? '', tagline: general.tagline ?? '', support_email: general.support_email ?? '',
        timezone: general.timezone ?? 'UTC', default_locale: general.default_locale ?? 'en',
        robots_txt: general.robots_txt ?? '', llms_txt: general.llms_txt ?? '',
        meta_title: general.meta_title ?? '', meta_description: general.meta_description ?? '', meta_keywords: general.meta_keywords ?? '',
        schema_jsonld: general.schema_jsonld ?? '', google_analytics_script: general.google_analytics_script ?? '', header_scripts: general.header_scripts ?? '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put('/admin/settings/general');
    }

    function uploadSlot(slot: string, file: File | null) {
        if (!file) return;
        router.post(`/admin/settings/brand-image/${slot}`, { image: file }, { forceFormData: true, preserveScroll: true });
    }

    return (
        <div className="space-y-6">
            <Card title="Basic" description="Application name, tagline, and regional settings used across the platform.">
                <form onSubmit={submit} className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Application name" hint="Shown in the header, emails, and browser tab.">
                            <input className={inputClass} value={form.data.site_name} onChange={(e) => form.setData('site_name', e.target.value)} />
                        </Field>
                        <Field label="Tagline" hint="Short phrase under the logo or on the landing page.">
                            <input className={inputClass} value={form.data.tagline} onChange={(e) => form.setData('tagline', e.target.value)} />
                        </Field>
                        <Field label="Support email">
                            <input className={inputClass} value={form.data.support_email} onChange={(e) => form.setData('support_email', e.target.value)} />
                        </Field>
                        <Field label="Timezone">
                            <input className={inputClass} value={form.data.timezone} onChange={(e) => form.setData('timezone', e.target.value)} />
                        </Field>
                        <Field label="Default locale">
                            <input className={inputClass} value={form.data.default_locale} onChange={(e) => form.setData('default_locale', e.target.value)} />
                        </Field>
                    </div>

                    <h3 className="mt-2 text-xs font-bold uppercase tracking-wide text-text-muted">robots.txt & llms.txt</h3>
                    <Field label="robots.txt content" hint="Served at /robots.txt. Leave empty for default (Allow all + Sitemap).">
                        <textarea rows={3} className={inputClass} value={form.data.robots_txt} onChange={(e) => form.setData('robots_txt', e.target.value)} />
                    </Field>
                    <Field label="llms.txt content" hint="Served at /llms.txt. Optional.">
                        <textarea rows={3} className={inputClass} value={form.data.llms_txt} onChange={(e) => form.setData('llms_txt', e.target.value)} />
                    </Field>

                    <h3 className="mt-2 text-xs font-bold uppercase tracking-wide text-text-muted">XML Sitemap</h3>
                    <p className="text-sm text-text-secondary">Generated automatically at <code>/sitemap.xml</code> from published courses and bundles.</p>
                    <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-bold text-primary hover:underline">Open sitemap.xml →</a>

                    <h3 className="mt-2 text-xs font-bold uppercase tracking-wide text-text-muted">SEO</h3>
                    <Field label="Meta title" hint="Default &lt;title&gt; and og:title. Falls back to app name.">
                        <input className={inputClass} value={form.data.meta_title} onChange={(e) => form.setData('meta_title', e.target.value)} />
                    </Field>
                    <Field label="Meta description" hint="Used in search results and og:description.">
                        <textarea rows={2} className={inputClass} value={form.data.meta_description} onChange={(e) => form.setData('meta_description', e.target.value)} />
                    </Field>
                    <Field label="Meta keywords" hint="Comma-separated (optional).">
                        <input className={inputClass} value={form.data.meta_keywords} onChange={(e) => form.setData('meta_keywords', e.target.value)} />
                    </Field>

                    <Field label="Schema (JSON-LD)" hint="Paste JSON-LD for Organization, WebSite, etc. Output in a <script> tag.">
                        <textarea rows={3} className={`${inputClass} font-mono text-xs`} value={form.data.schema_jsonld} onChange={(e) => form.setData('schema_jsonld', e.target.value)} />
                    </Field>
                    <Field label="Google Analytics" hint="Paste the full script tag(s). Inserted in <head>.">
                        <textarea rows={2} className={`${inputClass} font-mono text-xs`} value={form.data.google_analytics_script} onChange={(e) => form.setData('google_analytics_script', e.target.value)} />
                    </Field>
                    <Field label="Header scripts" hint="Other scripts to inject in <head> (e.g. chat widget, pixel).">
                        <textarea rows={2} className={`${inputClass} font-mono text-xs`} value={form.data.header_scripts} onChange={(e) => form.setData('header_scripts', e.target.value)} />
                    </Field>

                    <button type="submit" disabled={form.processing} className={btnClass}>Save General</button>
                </form>
            </Card>

            <Card title="Logos & branding">
                <div className="grid gap-4 sm:grid-cols-2">
                    {[
                        { slot: 'header_logo', label: 'Header logo', path: general.header_logo_path },
                        { slot: 'footer_logo', label: 'Footer logo', path: general.footer_logo_path },
                        { slot: 'favicon', label: 'Favicon', path: general.favicon_path },
                        { slot: 'email_logo', label: 'Email logo', path: general.email_logo_path },
                    ].map((f) => (
                        <div key={f.slot}>
                            <label className="mb-1 block text-sm font-medium text-text">{f.label}</label>
                            {f.path && <p className="mb-1 truncate text-xs text-text-muted">Current: /storage/{f.path}</p>}
                            <input type="file" accept="image/*" onChange={(e) => uploadSlot(f.slot, e.target.files?.[0] ?? null)} className="w-full text-sm" />
                        </div>
                    ))}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-text">Open Graph image</label>
                        {general.og_image_path && <p className="mb-1 truncate text-xs text-text-muted">Current: /storage/{general.og_image_path}</p>}
                        <input type="file" accept="image/*" onChange={(e) => uploadSlot('og_image', e.target.files?.[0] ?? null)} className="w-full text-sm" />
                    </div>
                </div>
            </Card>
        </div>
    );
}

function MailTab({ mail }: { mail: Props['mail'] }) {
    const form = useForm({ ...mail });
    const [testEmail, setTestEmail] = useState('');

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put('/admin/settings/mail');
    }

    return (
        <Card title="Mail / SMTP" description="Outgoing email for enrollment, OTP, and notifications. Configure your SMTP server below.">
            <form onSubmit={submit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="From address" hint="Sender email recipients will see.">
                        <input className={inputClass} value={form.data.from_address ?? ''} onChange={(e) => form.setData('from_address', e.target.value)} />
                    </Field>
                    <Field label="From name" hint="Sender name, e.g. your app or support.">
                        <input className={inputClass} value={form.data.from_name ?? ''} onChange={(e) => form.setData('from_name', e.target.value)} />
                    </Field>
                </div>
                <h3 className="text-sm font-bold text-text">SMTP server</h3>
                <p className="text-xs text-text-muted">Leave host empty to use your server's default mail. Otherwise set host, port, and credentials.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Host"><input className={inputClass} placeholder="smtp.example.com" value={form.data.host ?? ''} onChange={(e) => form.setData('host', e.target.value)} /></Field>
                    <Field label="Port"><input className={inputClass} placeholder="587" value={form.data.port ?? ''} onChange={(e) => form.setData('port', e.target.value)} /></Field>
                    <Field label="Username"><input className={inputClass} value={form.data.username ?? ''} onChange={(e) => form.setData('username', e.target.value)} /></Field>
                    <Field label="Password"><input type="password" className={inputClass} value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} /></Field>
                </div>
                <Field label="Encryption">
                    <select className={inputClass} value={form.data.encryption} onChange={(e) => form.setData('encryption', e.target.value)}>
                        <option value="tls">TLS</option>
                        <option value="ssl">SSL</option>
                        <option value="">None</option>
                    </select>
                </Field>
                <Toggle checked={form.data.verify_tls} onChange={(v) => form.setData('verify_tls', v)} label="Verify TLS/SSL certificate" hint="Leave enabled for security. Turn off only if your host presents a mismatched certificate." />
                <button type="submit" disabled={form.processing} className={btnClass}>Save Mail</button>
            </form>

            <div className="mt-6 border-t border-border pt-4">
                <h3 className="mb-2 text-sm font-bold text-text">Test outgoing email</h3>
                <p className="mb-2 text-xs text-text-muted">Save your settings first, then enter an email address and click Send.</p>
                <div className="flex gap-2">
                    <input className={inputClass} placeholder="you@example.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
                    <button
                        onClick={() => router.post('/admin/settings/mail/test', { email: testEmail })}
                        disabled={!testEmail}
                        className="whitespace-nowrap rounded-lg bg-secondary px-4 py-2 text-sm font-bold uppercase text-on-secondary hover:bg-teal-800 disabled:opacity-50"
                    >
                        Send test email
                    </button>
                </div>
            </div>
        </Card>
    );
}

const NOTIF_EVENTS: { key: string; label: string; hint: string }[] = [
    { key: 'new_enrollment', label: 'New enrollment', hint: 'A student enrolls in a course.' },
    { key: 'new_review', label: 'New review', hint: 'A student submits a course review.' },
    { key: 'new_lecture_question', label: 'New lecture question', hint: 'A student asks a question on a lecture.' },
    { key: 'course_qa_question', label: 'Course Q&A question', hint: 'A student asks a general question in Course Q&A.' },
    { key: 'question_reported', label: 'Question reported', hint: 'A student reports an issue with a question.' },
    { key: 'payment_received', label: 'Payment received', hint: 'A payment or purchase is submitted.' },
    { key: 'quiz_submitted', label: 'Quiz submitted', hint: 'A student submits any quiz/test attempt. (Can be high volume.)' },
];

function NotificationsTab({ notifications }: { notifications: Props['notifications'] }) {
    const form = useForm({
        admin_email: notifications.admin_email ?? '',
        ...Object.fromEntries(NOTIF_EVENTS.map((e) => [e.key, notifications[e.key] ?? false])),
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put('/admin/settings/notifications');
    }

    return (
        <Card title="Notifications" description="Choose when to receive admin alerts (in-app bell + email if configured).">
            <form onSubmit={submit} className="space-y-4">
                <Field label="Notification email" hint="Optional -- admin alerts already appear in the bell inbox for every owner/staff account.">
                    <input className={inputClass} placeholder="admin@example.com" value={form.data.admin_email} onChange={(e) => form.setData('admin_email', e.target.value)} />
                </Field>

                <p className="text-sm font-bold text-text">Trigger notifications when...</p>
                <div className="space-y-2">
                    {NOTIF_EVENTS.map((e) => (
                        <Toggle
                            key={e.key}
                            checked={Boolean((form.data as Record<string, unknown>)[e.key])}
                            onChange={(v) => form.setData(e.key as keyof typeof form.data, v as never)}
                            label={e.label}
                            hint={e.hint}
                        />
                    ))}
                </div>

                <button type="submit" disabled={form.processing} className={btnClass}>Save Notifications</button>
            </form>
        </Card>
    );
}

function SecurityTab({ security }: { security: Props['security'] }) {
    const form = useForm({ ...security });
    const [resetEmail, setResetEmail] = useState('');

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put('/admin/settings/security');
    }

    return (
        <div className="space-y-6">
            <Card title="Security" description="Session length, login attempts, device restrictions, maintenance mode, and the deactivated-student message.">
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Session lifetime (minutes)" hint="How long users stay logged in without activity. 120 = 2 hours.">
                            <input type="number" min={5} className={inputClass} value={form.data.session_lifetime_minutes} onChange={(e) => form.setData('session_lifetime_minutes', Number(e.target.value))} />
                        </Field>
                        <Field label="Max login attempts" hint="Before a temporary lockout.">
                            <input type="number" min={1} className={inputClass} value={form.data.max_login_attempts} onChange={(e) => form.setData('max_login_attempts', Number(e.target.value))} />
                        </Field>
                        <Field label="Max device login (students)" hint="Max number of devices a student can be logged in from at once, when restriction is on below. 0 = unlimited.">
                            <input type="number" min={0} className={inputClass} value={form.data.max_device_login} onChange={(e) => form.setData('max_device_login', Number(e.target.value))} />
                        </Field>
                    </div>

                    <Toggle checked={form.data.restrict_primary_device} onChange={(v) => form.setData('restrict_primary_device', v)} label="Restrict students to primary device only" hint="When enabled, students can only log in from as many devices as set above. Disable to allow login from any device." />
                    <Toggle checked={form.data.require_email_verification} onChange={(v) => form.setData('require_email_verification', v)} label="Require email verification on registration" hint="When enabled, new users must verify their email before accessing the portal." />
                    <Toggle checked={form.data.maintenance_mode} onChange={(v) => form.setData('maintenance_mode', v)} label="Maintenance mode" hint="When enabled, only admins can access the site. Everyone else sees a maintenance message." />

                    <Field label="Deactivated student message" hint="Shown to students whose account has been de-activated. They can still log in but will only see this message and a sign-out option.">
                        <textarea rows={3} className={inputClass} value={form.data.deactivated_student_message} onChange={(e) => form.setData('deactivated_student_message', e.target.value)} />
                    </Field>

                    <button type="submit" disabled={form.processing} className={btnClass}>Save Security</button>
                </form>
            </Card>

            <Card title="Reset a student's registered devices" description="Use this if a student is locked out after losing or replacing their device.">
                <div className="flex gap-2">
                    <input className={inputClass} placeholder="Student email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                    <button
                        onClick={() => {
                            router.post('/admin/settings/students/reset-devices', { email: resetEmail }, { onSuccess: () => setResetEmail('') });
                        }}
                        disabled={!resetEmail}
                        className="whitespace-nowrap rounded-lg bg-secondary px-4 py-2 text-sm font-bold uppercase text-on-secondary hover:bg-teal-800 disabled:opacity-50"
                    >
                        Reset devices
                    </button>
                </div>
                <p className="mt-2 text-xs text-text-muted">Tip: resetting only clears known devices -- the student can then log in from a new one immediately.</p>
            </Card>
        </div>
    );
}

function CoursesTab({ courseSettings }: { courseSettings: Props['courseSettings'] }) {
    const form = useForm({ course_expiry_days: courseSettings.course_expiry_days ?? '' as number | '' });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put('/admin/settings/courses');
    }

    return (
        <Card title="Course access" description="Configure how long students keep access to a course after enrollment. Leave empty for no expiry.">
            <form onSubmit={submit} className="space-y-3">
                <Field label="Courses expire after (days)" hint="Applied when a purchased package has no validity period of its own. Leave empty for unlimited access.">
                    <input type="number" min={1} className={inputClass} placeholder="e.g. 365 or leave empty" value={form.data.course_expiry_days} onChange={(e) => form.setData('course_expiry_days', e.target.value ? Number(e.target.value) : '')} />
                </Field>
                <button type="submit" disabled={form.processing} className={btnClass}>Save course settings</button>
            </form>
        </Card>
    );
}

function QuizzesTab({ quizSettings }: { quizSettings: Props['quizSettings'] }) {
    const form = useForm({
        default_quiz_duration_minutes: quizSettings.default_quiz_duration_minutes ?? '' as number | '',
        default_max_attempts: quizSettings.default_max_attempts ?? '' as number | '',
        default_quiz_rules: quizSettings.default_quiz_rules ?? '',
        quiz_retake_limit: quizSettings.quiz_retake_limit ?? '' as number | '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put('/admin/settings/quizzes');
    }

    return (
        <Card title="Quiz defaults" description="Used when a practice test or mock exam is created without its own time limit, attempt limit, or rules.">
            <form onSubmit={submit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Default quiz time (minutes)" hint="Applied when a test's own time limit is left blank.">
                        <input type="number" min={1} className={inputClass} placeholder="e.g. 30" value={form.data.default_quiz_duration_minutes} onChange={(e) => form.setData('default_quiz_duration_minutes', e.target.value ? Number(e.target.value) : '')} />
                    </Field>
                    <Field label="Default max attempts" hint="Applied when a mock exam's own attempt limit is left blank.">
                        <input type="number" min={1} className={inputClass} placeholder="e.g. 3" value={form.data.default_max_attempts} onChange={(e) => form.setData('default_max_attempts', e.target.value ? Number(e.target.value) : '')} />
                    </Field>
                </div>
                <Field label="Default quiz rules (global)" hint="Shown to students as an Instructions panel when taking a practice test.">
                    <textarea rows={3} className={inputClass} placeholder="e.g. Read each question carefully. No external resources allowed." value={form.data.default_quiz_rules} onChange={(e) => form.setData('default_quiz_rules', e.target.value)} />
                </Field>
                <Field label="Quiz set retake limit (global)" hint="Stored for reference; applied per-test where repeatable tests are configured.">
                    <input type="number" min={1} className={inputClass} placeholder="e.g. 3" value={form.data.quiz_retake_limit} onChange={(e) => form.setData('quiz_retake_limit', e.target.value ? Number(e.target.value) : '')} />
                </Field>
                <button type="submit" disabled={form.processing} className={btnClass}>Save quiz defaults</button>
            </form>
        </Card>
    );
}

const FEATURE_FIELDS: { key: 'flashcards' | 'custom_quiz' | 'full_test' | 'notes'; label: string; hint: string }[] = [
    { key: 'flashcards', label: 'Flashcards', hint: 'Revision flashcards from course topics or flagged questions.' },
    { key: 'custom_quiz', label: 'Custom quiz', hint: 'Students build and take custom quizzes from the question bank. (Toggle only -- not yet built.)' },
    { key: 'full_test', label: 'Full test', hint: 'Full-length mock exams / staged tests / exam-style assessments.' },
    { key: 'notes', label: 'Notes', hint: 'Guaranteed Notes catalog and individual note purchases.' },
];

function FeaturesTab({ features }: { features: Props['features'] }) {
    const form = useForm({ ...features });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put('/admin/settings/features');
    }

    return (
        <Card title="Feature toggles" description="Enable or disable student-facing features globally. When disabled, related menu items and routes are hidden. Per-course overrides (Flashcards/Full test) can still be set on each course's edit page, but only take effect when the global toggle here is also on.">
            <form onSubmit={submit} className="space-y-2">
                {FEATURE_FIELDS.map((f) => (
                    <Toggle key={f.key} checked={form.data[f.key]} onChange={(v) => form.setData(f.key, v)} label={f.label} hint={f.hint} />
                ))}
                <button type="submit" disabled={form.processing} className={btnClass}>Save feature toggles</button>
            </form>
        </Card>
    );
}

export default function SettingsIndex(props: Props) {
    const [tab, setTab] = useState('access');

    return (
        <AdminLayout header="Settings">
            <Head title="Settings" />

            <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`rounded-full px-4 py-2 text-sm font-bold ${tab === t.key ? 'bg-primary text-on-primary' : 'bg-surface text-text-secondary hover:bg-primary-subtle'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'access' && <AccessTab staff={props.staff} roles={props.roles} paymentSettings={props.paymentSettings} />}
            {tab === 'general' && <GeneralTab general={props.general} />}
            {tab === 'mail' && <MailTab mail={props.mail} />}
            {tab === 'notifications' && <NotificationsTab notifications={props.notifications} />}
            {tab === 'security' && <SecurityTab security={props.security} />}
            {tab === 'courses' && <CoursesTab courseSettings={props.courseSettings} />}
            {tab === 'quizzes' && <QuizzesTab quizSettings={props.quizSettings} />}
            {tab === 'features' && <FeaturesTab features={props.features} />}
        </AdminLayout>
    );
}
