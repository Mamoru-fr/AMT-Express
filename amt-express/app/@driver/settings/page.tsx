'use client';

import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Lock, Globe, Eye, EyeOff } from 'lucide-react';

import { DriverSidebar } from '@/components/driver/navigation/DriverSidebar';
import { LanguageDropdown } from '@/components/LanguageComponents/LanguageDropdown';
import { changePassword } from '@/lib/actions/customerProfileActions';
import styles from '@/components/dashboard/CustomerDashboard.module.css';
import settingsStyles from '@/app/@customer/settings/settings.module.css';

export default function DriverSettingsPage() {
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
        <DriverSidebar>
            <div className={styles.customerDashboard}>
                <div className={styles.customerInner}>
                    <div className={styles.headerBlock}>
                        <div className={styles.titleRow}>
                            <div className={styles.titleIcon}><SettingsIcon /></div>
                            <h1 className={styles.title}>{t('driverNavigation.settings')}</h1>
                        </div>
                        <p className={styles.subtitle}>{t('driverNavigation.settingsDescription')}</p>
                    </div>

                    <section className={settingsStyles.section}>
                        <div className={settingsStyles.sectionHeader}>
                            <Globe className={settingsStyles.sectionIcon} />
                            <div>
                                <h2 className={settingsStyles.sectionTitle}>{t('settings.language')}</h2>
                                <p className={settingsStyles.sectionDesc}>{t('settings.languageDescription')}</p>
                            </div>
                        </div>
                        <div className={settingsStyles.fieldRow}>
                            <LanguageDropdown variant="sidebar" />
                        </div>
                    </section>

                    <section className={settingsStyles.section}>
                        <div className={settingsStyles.sectionHeader}>
                            <Lock className={settingsStyles.sectionIcon} />
                            <div>
                                <h2 className={settingsStyles.sectionTitle}>{t('settings.changePassword')}</h2>
                                <p className={settingsStyles.sectionDesc}>{t('settings.changePasswordDescription')}</p>
                            </div>
                        </div>
                        <form onSubmit={handlePasswordSubmit} className={settingsStyles.form}>
                            <div className={settingsStyles.fieldGroup}>
                                <label className={settingsStyles.label}>{t('settings.currentPassword')}</label>
                                <div className={settingsStyles.passwordWrapper}>
                                    <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={settingsStyles.input} autoComplete="current-password" required disabled={pwPending} />
                                    <button type="button" className={settingsStyles.eyeBtn} onClick={() => setShowCurrent(v => !v)}>
                                        {showCurrent ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                            </div>
                            <div className={settingsStyles.fieldGroup}>
                                <label className={settingsStyles.label}>{t('settings.newPassword')}</label>
                                <div className={settingsStyles.passwordWrapper}>
                                    <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className={settingsStyles.input} autoComplete="new-password" required minLength={8} disabled={pwPending} />
                                    <button type="button" className={settingsStyles.eyeBtn} onClick={() => setShowNew(v => !v)}>
                                        {showNew ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                            </div>
                            <div className={settingsStyles.fieldGroup}>
                                <label className={settingsStyles.label}>{t('settings.confirmPassword')}</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={settingsStyles.input} autoComplete="new-password" required disabled={pwPending} />
                            </div>
                            {pwFeedback && (
                                <p className={pwFeedback.type === 'success' ? settingsStyles.feedbackSuccess : settingsStyles.feedbackError}>
                                    {pwFeedback.message}
                                </p>
                            )}
                            <div className={settingsStyles.formActions}>
                                <button type="submit" className={settingsStyles.submitButton} disabled={pwPending || !currentPassword || !newPassword || !confirmPassword}>
                                    {pwPending ? t('profile.sending') : t('settings.updatePassword')}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </DriverSidebar>
    );
}
