import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { CheckCircleIcon, LockIcon, MailIcon, PersonIcon } from '@/Components/AuthIcons';
import IconTextInput from '@/Components/IconTextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout title="Create Your Account" description="Start your preparation journey today">
            <Head title="Register" />

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Full Name" />

                    <IconTextInput
                        id="name"
                        name="name"
                        icon={<PersonIcon />}
                        value={data.name}
                        className="mt-1"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <IconTextInput
                        id="email"
                        type="email"
                        name="email"
                        icon={<MailIcon />}
                        value={data.email}
                        className="mt-1"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />

                    <IconTextInput
                        id="password"
                        type="password"
                        name="password"
                        icon={<LockIcon />}
                        value={data.password}
                        className="mt-1"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <IconTextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        icon={<CheckCircleIcon />}
                        value={data.password_confirmation}
                        className="mt-1"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-lg bg-gradient-to-r from-secondary to-primary py-3.5 text-sm font-bold uppercase tracking-wide text-on-primary shadow-lg transition-all duration-normal hover:shadow-xl focus:outline-none focus:shadow-glow disabled:opacity-50"
                >
                    Create Account
                </button>

                <p className="text-center text-sm text-text-secondary">
                    Already have an account?{' '}
                    <Link href={route('login')} className="font-semibold text-primary hover:underline">
                        Sign in
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
