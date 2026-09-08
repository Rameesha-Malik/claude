import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { PageProps } from '@/types';

const inputClass = 'mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:shadow-glow focus:outline-none';

// Client (WhatsApp): profile pic, test center, course, address, mobile
// number, FSc/Matric marks %, graduation GPA -- "not compulsory optional."
// Self-service counterpart to the admin's Student Profile Biodata panel;
// same fields, same all-nullable approach, submitted separately from Name/
// Email above (ProfileUpdateRequest only validates those two) so a bad
// biodata field can't fail an otherwise-valid name/email save or vice versa.
export default function UpdateBiodataForm({ className = '' }: { className?: string }) {
    const user = usePage<PageProps>().props.auth.user!;

    const { data, setData, put, errors, processing, recentlySuccessful } = useForm({
        phone: user.phone ?? '',
        address: user.address ?? '',
        test_center: user.test_center ?? '',
        target_exam_name: user.target_exam_name ?? '',
        matric_marks_percentage: user.matric_marks_percentage ?? '',
        fsc_marks_percentage: user.fsc_marks_percentage ?? '',
        graduation_gpa: user.graduation_gpa ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('profile.biodata.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-bold text-text">Additional Details</h2>
                <p className="mt-1 text-sm text-text-secondary">
                    Optional -- fill in whatever's relevant to you. None of this is required.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="phone" value="Mobile Number" />
                    <input id="phone" className={inputClass} value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                    {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone}</p>}
                </div>
                <div>
                    <InputLabel htmlFor="test_center" value="Test Center" />
                    <input id="test_center" className={inputClass} value={data.test_center} onChange={(e) => setData('test_center', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                    <InputLabel htmlFor="address" value="Address" />
                    <input id="address" className={inputClass} value={data.address} onChange={(e) => setData('address', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                    <InputLabel htmlFor="target_exam_name" value="Course / Target Exam" />
                    <input id="target_exam_name" className={inputClass} value={data.target_exam_name} onChange={(e) => setData('target_exam_name', e.target.value)} placeholder="e.g. PMA Long Course" />
                </div>
                <div>
                    <InputLabel htmlFor="matric" value="Matric Marks %" />
                    <input id="matric" type="number" min={0} max={100} className={inputClass} value={data.matric_marks_percentage} onChange={(e) => setData('matric_marks_percentage', e.target.value)} />
                </div>
                <div>
                    <InputLabel htmlFor="fsc" value="FSc Marks %" />
                    <input id="fsc" type="number" min={0} max={100} className={inputClass} value={data.fsc_marks_percentage} onChange={(e) => setData('fsc_marks_percentage', e.target.value)} />
                </div>
                <div>
                    <InputLabel htmlFor="gpa" value="Graduation GPA (if applicable)" />
                    <input id="gpa" type="number" step="0.01" min={0} max={4} className={inputClass} value={data.graduation_gpa} onChange={(e) => setData('graduation_gpa', e.target.value)} />
                </div>

                <div className="flex items-center gap-4 sm:col-span-2">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-semibold text-success">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
