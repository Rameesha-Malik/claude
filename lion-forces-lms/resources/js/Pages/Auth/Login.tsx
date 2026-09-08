import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { LockIcon, MailIcon } from '@/Components/AuthIcons';
import Checkbox from '@/Components/Checkbox';
import IconTextInput from '@/Components/IconTextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout title="Welcome Back" description="Sign in to continue your preparation">
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-success">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
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
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Password" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-primary hover:underline focus:outline-none"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <IconTextInput
                        id="password"
                        type="password"
                        name="password"
                        icon={<LockIcon />}
                        value={data.password}
                        className="mt-1"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <label className="flex items-center">
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        onChange={(e) =>
                            setData(
                                'remember',
                                (e.target.checked || false) as false,
                            )
                        }
                    />
                    <span className="ms-2 text-sm text-text-secondary">
                        Keep me signed in
                    </span>
                </label>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-lg bg-gradient-to-r from-secondary to-primary py-3.5 text-sm font-bold uppercase tracking-wide text-on-primary shadow-lg transition-all duration-normal hover:shadow-xl focus:outline-none focus:shadow-glow disabled:opacity-50"
                >
                    Login
                </button>

                <p className="text-center text-sm text-text-secondary">
                    Don&apos;t have an account?{' '}
                    <Link href={route('register')} className="font-semibold text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
