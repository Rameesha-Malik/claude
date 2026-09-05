import { Head, router, useForm } from '@inertiajs/react';
import { ChangeEvent, FormEvent, useState } from 'react';
import RichTextArea from '@/Components/RichTextArea';
import AdminLayout from '@/Layouts/AdminLayout';

interface Settings {
    site_name: string; tagline: string | null; support_email: string | null;
    office_location: string | null; office_hours: string | null;
    whatsapp_number: string | null; whatsapp_enabled: boolean;
    social_facebook: string | null; social_instagram: string | null; social_youtube: string | null;
}
interface Announcement { id?: number; message: string; link_url: string | null; is_active: boolean; expires_at: string | null }
interface HomeSection { id: number; title: string; content: Record<string, any> }
interface StatsItem { id: number; icon: string | null; number: string; label: string }
interface ServiceCard { id: number; icon: string | null; title: string; description: string | null }
interface Faq { id: number; page: string; question: string; answer: string; is_active: boolean }
interface Testimonial { id: number; student_name: string; testimonial_text: string; rating: number | null; is_featured: boolean }
interface Props {
    settings: Settings;
    logoPath: string | null;
    announcement: Announcement | null;
    heroSection: HomeSection;
    ctaSection: HomeSection;
    statsItems: StatsItem[];
    serviceCards: ServiceCard[];
    faqs: Faq[];
    testimonials: Testimonial[];
}

const TABS = ['Settings', 'Home Page', 'Stats', 'Services', 'FAQs', 'Testimonials'] as const;
type Tab = (typeof TABS)[number];

const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium text-text';
const btnClass = 'rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-on-primary hover:bg-primary-hover disabled:opacity-50';
const btnDangerClass = 'rounded-lg border border-danger px-3 py-1.5 text-xs font-bold uppercase text-danger hover:bg-danger-bg';

export default function WebsiteIndex(props: Props) {
    const [tab, setTab] = useState<Tab>('Settings');

    return (
        <AdminLayout header="Website Management">
            <Head title="Website Management" />

            <div className="mb-6 flex flex-wrap gap-2 border-b border-border">
                {TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`border-b-2 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
                            tab === t ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Settings' && <SettingsPanel settings={props.settings} logoPath={props.logoPath} announcement={props.announcement} />}
            {tab === 'Home Page' && <HomePagePanel hero={props.heroSection} cta={props.ctaSection} />}
            {tab === 'Stats' && <StatsPanel items={props.statsItems} />}
            {tab === 'Services' && <ServicesPanel items={props.serviceCards} />}
            {tab === 'FAQs' && <FaqsPanel items={props.faqs} />}
            {tab === 'Testimonials' && <TestimonialsPanel items={props.testimonials} />}
        </AdminLayout>
    );
}

function Panel({ children }: { children: React.ReactNode }) {
    return <div className="max-w-3xl rounded-2xl border border-border bg-surface p-6">{children}</div>;
}

// A failed add/edit submission (validation error, network issue) must never
// fail silently — this is what surfaces it under the form that submitted.
function FormErrors({ errors }: { errors: Record<string, string> }) {
    const messages = Object.values(errors);
    if (messages.length === 0) return null;
    return (
        <div className="w-full text-sm text-danger">
            {messages.map((msg, i) => <div key={i}>{msg}</div>)}
        </div>
    );
}

function LogoPanel({ logoPath }: { logoPath: string | null }) {
    const [preview, setPreview] = useState<string | null>(null);
    const form = useForm<{ logo: File | null }>({ logo: null });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (!form.data.logo) return;
        form.post('/admin/website/logo', {
            forceFormData: true,
            onSuccess: () => {
                form.setData('logo', null);
                setPreview(null);
            },
        });
    }

    function pickFile(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        form.setData('logo', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    return (
        <Panel>
            <h2 className="mb-1 font-bold text-text">Site Logo</h2>
            <p className="mb-4 text-sm text-text-secondary">
                Shown in the header and footer of the public site. Square or wide logos both work — it's scaled to fit each spot automatically.
            </p>
            <div className="mb-4 flex items-center gap-4">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border border-dashed border-border bg-surface-sunken">
                    {preview || logoPath ? (
                        // eslint-disable-next-line jsx-a11y/alt-text
                        <img src={preview ?? `/storage/${logoPath}`} className="h-full w-full rounded-2xl object-contain p-1" />
                    ) : (
                        <span className="text-xs text-text-muted">No logo</span>
                    )}
                </div>
                <form onSubmit={submit} className="flex flex-wrap items-center gap-3">
                    <input type="file" accept="image/*" onChange={pickFile} className="text-sm text-text-secondary" />
                    <button type="submit" disabled={!form.data.logo || form.processing} className={btnClass}>
                        {form.processing ? 'Uploading…' : 'Upload Logo'}
                    </button>
                    {logoPath && (
                        <button
                            type="button"
                            onClick={() => confirm('Remove the current logo?') && router.delete('/admin/website/logo')}
                            className={btnDangerClass}
                        >
                            Remove
                        </button>
                    )}
                </form>
            </div>
            <FormErrors errors={form.errors as Record<string, string>} />
        </Panel>
    );
}

function SettingsPanel({ settings, logoPath, announcement }: { settings: Settings; logoPath: string | null; announcement: Announcement | null }) {
    const settingsForm = useForm({ ...settings });
    const announcementForm = useForm({
        message: announcement?.message ?? '',
        link_url: announcement?.link_url ?? '',
        is_active: announcement?.is_active ?? false,
        expires_at: announcement?.expires_at ?? '',
    });

    function submitSettings(e: FormEvent) {
        e.preventDefault();
        settingsForm.put('/admin/website/settings');
    }

    function submitAnnouncement(e: FormEvent) {
        e.preventDefault();
        announcementForm.put('/admin/website/announcement');
    }

    return (
        <div className="space-y-6">
            <LogoPanel logoPath={logoPath} />

            <Panel>
                <h2 className="mb-4 font-bold text-text">Site Settings</h2>
                <form onSubmit={submitSettings} className="space-y-4">
                    <div>
                        <label className={labelClass}>Site Name</label>
                        <input className={inputClass} value={settingsForm.data.site_name} onChange={(e) => settingsForm.setData('site_name', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Tagline</label>
                        <input className={inputClass} value={settingsForm.data.tagline ?? ''} onChange={(e) => settingsForm.setData('tagline', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Support Email</label>
                            <input className={inputClass} value={settingsForm.data.support_email ?? ''} onChange={(e) => settingsForm.setData('support_email', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>WhatsApp Number</label>
                            <input className={inputClass} value={settingsForm.data.whatsapp_number ?? ''} onChange={(e) => settingsForm.setData('whatsapp_number', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Office Location</label>
                            <input className={inputClass} value={settingsForm.data.office_location ?? ''} onChange={(e) => settingsForm.setData('office_location', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Office Hours</label>
                            <input className={inputClass} value={settingsForm.data.office_hours ?? ''} onChange={(e) => settingsForm.setData('office_hours', e.target.value)} />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-text">
                        <input type="checkbox" checked={settingsForm.data.whatsapp_enabled} onChange={(e) => settingsForm.setData('whatsapp_enabled', e.target.checked)} />
                        Show WhatsApp floating button
                    </label>

                    <div>
                        <h3 className="mb-2 mt-2 text-sm font-bold uppercase tracking-wide text-text-secondary">Social Media Links</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Facebook URL</label>
                                <input
                                    className={inputClass}
                                    placeholder="https://facebook.com/..."
                                    value={settingsForm.data.social_facebook ?? ''}
                                    onChange={(e) => settingsForm.setData('social_facebook', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Instagram URL</label>
                                <input
                                    className={inputClass}
                                    placeholder="https://instagram.com/..."
                                    value={settingsForm.data.social_instagram ?? ''}
                                    onChange={(e) => settingsForm.setData('social_instagram', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>YouTube URL</label>
                                <input
                                    className={inputClass}
                                    placeholder="https://youtube.com/@..."
                                    value={settingsForm.data.social_youtube ?? ''}
                                    onChange={(e) => settingsForm.setData('social_youtube', e.target.value)}
                                />
                            </div>
                        </div>
                        <p className="mt-1.5 text-xs text-text-muted">Leave blank to hide that icon from the site header/footer.</p>
                    </div>

                    <FormErrors errors={settingsForm.errors} />
                    <button type="submit" disabled={settingsForm.processing} className={btnClass}>Save Settings</button>
                </form>
            </Panel>

            <Panel>
                <h2 className="mb-1 font-bold text-text">Announcement Bar</h2>
                <p className="mb-4 text-sm text-text-secondary">Shown at the top of every public page when active.</p>
                <form onSubmit={submitAnnouncement} className="space-y-4">
                    <div>
                        <label className={labelClass}>Message</label>
                        <input className={inputClass} value={announcementForm.data.message} onChange={(e) => announcementForm.setData('message', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Link URL (optional)</label>
                            <input className={inputClass} value={announcementForm.data.link_url ?? ''} onChange={(e) => announcementForm.setData('link_url', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Expires At (optional)</label>
                            <input type="date" className={inputClass} value={announcementForm.data.expires_at ?? ''} onChange={(e) => announcementForm.setData('expires_at', e.target.value)} />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-text">
                        <input type="checkbox" checked={announcementForm.data.is_active} onChange={(e) => announcementForm.setData('is_active', e.target.checked)} />
                        Show announcement bar
                    </label>
                    <button type="submit" disabled={announcementForm.processing} className={btnClass}>Save Announcement</button>
                </form>
            </Panel>
        </div>
    );
}

function HomePagePanel({ hero, cta }: { hero: HomeSection; cta: HomeSection }) {
    const heroForm = useForm({ ...hero.content });
    const ctaForm = useForm({ ...cta.content });

    return (
        <div className="space-y-6">
            <Panel>
                <h2 className="mb-4 font-bold text-text">Hero Section</h2>
                <form
                    onSubmit={(e) => { e.preventDefault(); router.put(`/admin/website/home-sections/${hero.id}`, { content: heroForm.data }); }}
                    className="space-y-4"
                >
                    <div>
                        <label className={labelClass}>Headline</label>
                        <input className={inputClass} value={heroForm.data.headline ?? ''} onChange={(e) => heroForm.setData('headline', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Subheading</label>
                        <RichTextArea rows={2} className={inputClass} value={heroForm.data.subheading ?? ''} onChange={(v) => heroForm.setData('subheading', v)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Primary CTA Text</label>
                            <input className={inputClass} value={heroForm.data.cta_primary_text ?? ''} onChange={(e) => heroForm.setData('cta_primary_text', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Primary CTA Link</label>
                            <input className={inputClass} value={heroForm.data.cta_primary_link ?? ''} onChange={(e) => heroForm.setData('cta_primary_link', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Secondary CTA Text</label>
                            <input className={inputClass} value={heroForm.data.cta_secondary_text ?? ''} onChange={(e) => heroForm.setData('cta_secondary_text', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Secondary CTA Link</label>
                            <input className={inputClass} value={heroForm.data.cta_secondary_link ?? ''} onChange={(e) => heroForm.setData('cta_secondary_link', e.target.value)} />
                        </div>
                    </div>
                    <button type="submit" disabled={heroForm.processing} className={btnClass}>Save Hero</button>
                </form>
            </Panel>

            <Panel>
                <h2 className="mb-4 font-bold text-text">CTA Footer Banner</h2>
                <form
                    onSubmit={(e) => { e.preventDefault(); router.put(`/admin/website/home-sections/${cta.id}`, { content: ctaForm.data }); }}
                    className="space-y-4"
                >
                    <div>
                        <label className={labelClass}>Heading</label>
                        <input className={inputClass} value={ctaForm.data.heading ?? ''} onChange={(e) => ctaForm.setData('heading', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Subheading</label>
                        <input className={inputClass} value={ctaForm.data.subheading ?? ''} onChange={(e) => ctaForm.setData('subheading', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Button Text</label>
                            <input className={inputClass} value={ctaForm.data.button_text ?? ''} onChange={(e) => ctaForm.setData('button_text', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Button Link</label>
                            <input className={inputClass} value={ctaForm.data.button_link ?? ''} onChange={(e) => ctaForm.setData('button_link', e.target.value)} />
                        </div>
                    </div>
                    <button type="submit" disabled={ctaForm.processing} className={btnClass}>Save CTA Banner</button>
                </form>
            </Panel>
        </div>
    );
}

function StatsPanel({ items }: { items: StatsItem[] }) {
    const addForm = useForm({ icon: '', number: '', label: '' });

    return (
        <Panel>
            <h2 className="mb-4 font-bold text-text">Stats Bar</h2>
            <div className="mb-6 space-y-2">
                {items.map((item) => (
                    <EditableRow key={item.id} onDelete={() => router.delete(`/admin/website/stats/${item.id}`)}>
                        <InlineEditFields
                            initial={{ icon: item.icon ?? '', number: item.number, label: item.label }}
                            onSave={(data) => router.put(`/admin/website/stats/${item.id}`, data)}
                            fields={[{ key: 'number', placeholder: 'Number' }, { key: 'label', placeholder: 'Label' }, { key: 'icon', placeholder: 'Icon' }]}
                        />
                    </EditableRow>
                ))}
            </div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Add New</h3>
            <form
                onSubmit={(e) => { e.preventDefault(); addForm.post('/admin/website/stats', { onSuccess: () => addForm.reset() }); }}
                className="flex flex-wrap gap-2"
            >
                <input className={inputClass} placeholder="Number (e.g. 20+)" value={addForm.data.number} onChange={(e) => addForm.setData('number', e.target.value)} />
                <input className={inputClass} placeholder="Label" value={addForm.data.label} onChange={(e) => addForm.setData('label', e.target.value)} />
                <button type="submit" disabled={addForm.processing} className={btnClass}>Add</button>
                <FormErrors errors={addForm.errors} />
            </form>
        </Panel>
    );
}

function ServicesPanel({ items }: { items: ServiceCard[] }) {
    const addForm = useForm({ icon: '', title: '', description: '' });

    return (
        <Panel>
            <h2 className="mb-4 font-bold text-text">Services</h2>
            <div className="mb-6 space-y-2">
                {items.map((item) => (
                    <EditableRow key={item.id} onDelete={() => router.delete(`/admin/website/services/${item.id}`)}>
                        <InlineEditFields
                            initial={{ title: item.title, description: item.description ?? '', icon: item.icon ?? '' }}
                            onSave={(data) => router.put(`/admin/website/services/${item.id}`, data)}
                            fields={[{ key: 'title', placeholder: 'Title' }, { key: 'description', placeholder: 'Description' }]}
                        />
                    </EditableRow>
                ))}
            </div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Add New</h3>
            <form
                onSubmit={(e) => { e.preventDefault(); addForm.post('/admin/website/services', { onSuccess: () => addForm.reset() }); }}
                className="flex flex-wrap gap-2"
            >
                <input className={inputClass} placeholder="Title" value={addForm.data.title} onChange={(e) => addForm.setData('title', e.target.value)} />
                <input className={inputClass} placeholder="Description" value={addForm.data.description} onChange={(e) => addForm.setData('description', e.target.value)} />
                <button type="submit" disabled={addForm.processing} className={btnClass}>Add</button>
                <FormErrors errors={addForm.errors} />
            </form>
        </Panel>
    );
}

function FaqsPanel({ items }: { items: Faq[] }) {
    const addForm = useForm({ page: 'home', question: '', answer: '' });
    const grouped = items.reduce<Record<string, Faq[]>>((acc, f) => {
        (acc[f.page] ??= []).push(f);
        return acc;
    }, {});

    return (
        <Panel>
            <h2 className="mb-4 font-bold text-text">FAQs</h2>
            {Object.entries(grouped).map(([page, faqs]) => (
                <div key={page} className="mb-6">
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">{page.replace('_', ' ')}</h3>
                    <div className="space-y-2">
                        {faqs.map((faq) => (
                            <EditableRow key={faq.id} onDelete={() => router.delete(`/admin/website/faqs/${faq.id}`)}>
                                <InlineEditFields
                                    initial={{ page: faq.page, question: faq.question, answer: faq.answer }}
                                    onSave={(data) => router.put(`/admin/website/faqs/${faq.id}`, data)}
                                    fields={[{ key: 'question', placeholder: 'Question' }, { key: 'answer', placeholder: 'Answer' }]}
                                />
                            </EditableRow>
                        ))}
                    </div>
                </div>
            ))}
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Add New</h3>
            <form
                onSubmit={(e) => { e.preventDefault(); addForm.post('/admin/website/faqs', { onSuccess: () => addForm.reset() }); }}
                className="flex flex-wrap gap-2"
            >
                <select className={inputClass} style={{ width: 140 }} value={addForm.data.page} onChange={(e) => addForm.setData('page', e.target.value)}>
                    {['home', 'contact', 'how_to_buy'].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <input className={inputClass} placeholder="Question" value={addForm.data.question} onChange={(e) => addForm.setData('question', e.target.value)} />
                <input className={inputClass} placeholder="Answer" value={addForm.data.answer} onChange={(e) => addForm.setData('answer', e.target.value)} />
                <button type="submit" disabled={addForm.processing} className={btnClass}>Add</button>
                <FormErrors errors={addForm.errors} />
            </form>
        </Panel>
    );
}

function TestimonialsPanel({ items }: { items: Testimonial[] }) {
    const addForm = useForm({ student_name: '', testimonial_text: '', rating: 5 });

    return (
        <Panel>
            <h2 className="mb-1 font-bold text-text">Testimonials</h2>
            <p className="mb-4 text-sm text-text-secondary">Admin-created real stories only — no student self-submission.</p>
            <div className="mb-6 space-y-2">
                {items.map((item) => (
                    <EditableRow key={item.id} onDelete={() => router.delete(`/admin/website/testimonials/${item.id}`)}>
                        <InlineEditFields
                            initial={{ student_name: item.student_name, testimonial_text: item.testimonial_text }}
                            onSave={(data) => router.put(`/admin/website/testimonials/${item.id}`, data)}
                            fields={[{ key: 'student_name', placeholder: 'Student Name' }, { key: 'testimonial_text', placeholder: 'Testimonial' }]}
                        />
                    </EditableRow>
                ))}
            </div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Add New</h3>
            <form
                onSubmit={(e) => { e.preventDefault(); addForm.post('/admin/website/testimonials', { onSuccess: () => addForm.reset() }); }}
                className="flex flex-wrap gap-2"
            >
                <input className={inputClass} placeholder="Student Name" value={addForm.data.student_name} onChange={(e) => addForm.setData('student_name', e.target.value)} />
                <input className={inputClass} placeholder="Testimonial" value={addForm.data.testimonial_text} onChange={(e) => addForm.setData('testimonial_text', e.target.value)} />
                <button type="submit" disabled={addForm.processing} className={btnClass}>Add</button>
                <FormErrors errors={addForm.errors} />
            </form>
        </Panel>
    );
}

function EditableRow({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
    return (
        <div className="flex items-center gap-2 rounded-lg border border-border p-2">
            <div className="flex-1">{children}</div>
            <button onClick={onDelete} className={btnDangerClass}>Delete</button>
        </div>
    );
}

function InlineEditFields({ initial, fields, onSave }: { initial: Record<string, string>; fields: { key: string; placeholder: string }[]; onSave: (data: Record<string, string>) => void }) {
    const [data, setData] = useState(initial);
    const [dirty, setDirty] = useState(false);

    return (
        <div className="flex flex-wrap items-center gap-2">
            {fields.map((f) => (
                <input
                    key={f.key}
                    className={inputClass}
                    style={{ maxWidth: 220 }}
                    placeholder={f.placeholder}
                    value={data[f.key] ?? ''}
                    onChange={(e) => { setData({ ...data, [f.key]: e.target.value }); setDirty(true); }}
                />
            ))}
            {dirty && (
                <button onClick={() => { onSave(data); setDirty(false); }} className="text-xs font-bold uppercase text-primary hover:underline">
                    Save
                </button>
            )}
        </div>
    );
}
