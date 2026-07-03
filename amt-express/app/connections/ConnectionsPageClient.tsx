'use client'

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/classicComponents/Input";
import { Button } from "@/components/classicComponents/Button";
import { signin, signup } from "@/lib/actions/signActions";
import { AlertTriangle, Car } from "lucide-react";

type View = 'signin' | 'signup';

type ConnectionsPageClientProps = {
    csrfToken: string;
};

function isView(value: string | null): value is View {
    return value === 'signin' || value === 'signup';
}

function normalizeView(value: string | null): View {
    return isView(value) ? value : 'signin';
}

function SubmitButton({ content }: { content: string }) {
    const { pending } = useFormStatus();

    return <Button content={content} variant="primary" type="submit" disabled={pending} />;
}

export default function ConnectionsPageClient({ csrfToken }: ConnectionsPageClientProps) {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const [view, setView] = useState<View>(() => normalizeView(searchParams.get('view')));
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const error = searchParams.get('error');
        const nextView = normalizeView(searchParams.get('view'));

        setView(nextView);

        if (error && error !== 'true') {
            const decodedError = decodeURIComponent(error);

            if (decodedError.startsWith('errors.')) {
                setErrorMessage(t(decodedError));
            } else {
                const errorKey = `errors.${decodedError}`;
                setErrorMessage(t(errorKey, { defaultValue: decodedError }));
            }
        } else {
            setErrorMessage(null);
        }
    }, [searchParams, t]);

    const handleForgotPassword = () => {
        alert(t('Authentication.PasswordReset', { defaultValue: 'Password reset coming soon' }));
    };

    return (
        <div className="connections-container">
            <div className="connections-header">
                <div className="connections-logo-icon">
                    <Car style={{ width: '50%' }} />
                </div>
                <div className="connections-title-section">
                    <h1 className="connections-title">{t('Authentication.Title')}</h1>
                    <p className="connections-subtitle">{t('Authentication.Subtitle')}</p>
                </div>
            </div>

            <div className="connections-content-wrapper">
                <div className="connections-card">
                    {errorMessage && (
                        <div className="connections-error-message">
                            <AlertTriangle className="connections-error-icon" />
                            <p className="connections-error-text">{errorMessage}</p>
                        </div>
                    )}

                    <form
                        action={signin}
                        className={`connections-form ${view === 'signin' ? '' : 'hidden'}`}
                    >
                        <input type="hidden" name="csrfToken" value={csrfToken} />
                        <Input
                            placeholder={t('Authentication.EmailPlaceholder')}
                            type='email'
                            name='email'
                            required
                        />
                        <Input
                            placeholder={t('Authentication.PasswordPlaceholder')}
                            type='password'
                            name='password'
                            required
                        />
                        <div className="connections-forgot-password-container">
                            <button
                                type="button"
                                className="connections-forgot-password-link"
                                onClick={handleForgotPassword}
                            >
                                {t('Authentication.ForgotPassword', { defaultValue: 'Mot de passe oublié ?' })}
                            </button>
                        </div>
                        <SubmitButton content={t('Authentication.Login.LoginButton')} />
                    </form>

                    <form
                        action={signup}
                        className={`connections-form ${view === 'signup' ? '' : 'hidden'}`}
                    >
                        <input type="hidden" name="csrfToken" value={csrfToken} />
                        <Input
                            placeholder={t('Authentication.NamePlaceholder')}
                            type='text'
                            name='name'
                            required
                        />

                        <div className="connections-warning-message">
                            <AlertTriangle className="connections-warning-icon" />
                            <p className="connections-warning-text">
                                {t('Authentication.NameWarning')}
                            </p>
                        </div>

                        <Input
                            placeholder={t('Authentication.EmailPlaceholder')}
                            type='email'
                            name='email'
                            required
                        />
                        <Input
                            placeholder={t('Authentication.PasswordPlaceholder')}
                            type='password'
                            name='password'
                            required
                        />
                        <Input
                            placeholder={t('Authentication.ConfirmPasswordPlaceholder')}
                            type='password'
                            name='confirmPassword'
                            required
                        />
                        <SubmitButton content={t('Authentication.Register.RegisterButton')} />
                    </form>
                </div>
            </div>

            <div className="connections-toggle-container">
                <p className="connections-toggle-text">
                    {view === 'signin'
                        ? t('Authentication.NoAccount')
                        : t('Authentication.HasAccount')
                    }
                </p>
                <button
                    type="button"
                    className="connections-toggle-link"
                    onClick={() => setView(view === 'signin' ? 'signup' : 'signin')}
                >
                    {view === 'signin'
                        ? t('Authentication.CreateAccount')
                        : t('Authentication.LoginViewButton')
                    }
                </button>
            </div>
        </div>
    );
}
