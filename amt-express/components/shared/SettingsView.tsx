'use client';

import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Globe, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/classicComponents/Button';

import { LanguageDropdown } from '@/components/LanguageComponents/LanguageDropdown';
import { changePassword } from '@/lib/actions/customerProfileActions';
import styles from './SettingsView.module.css';

export function SettingsView() {
    const { t } = useTranslation();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [pwPending, startPwTransition] = useTransition();
    const [pwFeedback, setPwFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    function handlePasswordSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPwFeedback(null);

        if (newPassword !== confirmPassword) {
            setPwFeedback({ type: 'error', message: t('settings.passwordMismatch') });
            return;
        }
        if (newPassword.length < 8) {
            setPwFeedback({ type: 'error', message: t('settings.passwordTooShort') });
            return;
        }

        const fd = new FormData();
        fd.set('currentPassword', currentPassword);
        fd.set('newPassword', newPassword);

        startPwTransition(async () => {
            const result = await changePassword(fd);
            if (result.success) {
                setPwFeedback({ type: 'success', message: t('settings.passwordChanged') });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPwFeedback({ type: 'error', message: result.error || t('settings.passwordChangeError') });
            }
        });
    }

    return (
        <>
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <Globe className={styles.sectionIcon} />
                    <div>
                        <h2 className={styles.sectionTitle}>{t('settings.language')}</h2>
                        <p className={styles.sectionDesc}>{t('settings.languageDescription')}</p>
                    </div>
                </div>
                <div className={styles.fieldRow}>
                    <LanguageDropdown variant="sidebar" />
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <Lock className={styles.sectionIcon} />
                    <div>
                        <h2 className={styles.sectionTitle}>{t('settings.changePassword')}</h2>
                        <p className={styles.sectionDesc}>{t('settings.changePasswordDescription')}</p>
                    </div>
                </div>
                <form onSubmit={handlePasswordSubmit} className={styles.form}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>{t('settings.currentPassword')}</label>
                        <div className={styles.passwordWrapper}>
                            <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={styles.input} autoComplete="current-password" required disabled={pwPending} />
                            <button type="button" className={styles.eyeBtn} onClick={() => setShowCurrent(v => !v)}>
                                {showCurrent ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>{t('settings.newPassword')}</label>
                        <div className={styles.passwordWrapper}>
                            <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className={styles.input} autoComplete="new-password" required minLength={8} disabled={pwPending} />
                            <button type="button" className={styles.eyeBtn} onClick={() => setShowNew(v => !v)}>
                                {showNew ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>{t('settings.confirmPassword')}</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={styles.input} autoComplete="new-password" required disabled={pwPending} />
                    </div>
                    {pwFeedback && (
                        <p className={pwFeedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}>
                            {pwFeedback.message}
                        </p>
                    )}
                    <div className={styles.formActions}>
                        <Button type="submit" full disabled={pwPending || !currentPassword || !newPassword || !confirmPassword} isPending={pwPending} pendingText={t('profile.sending')}>
                            {t('settings.updatePassword')}
                        </Button>
                    </div>
                </form>
            </section>
        </>
    );
}
