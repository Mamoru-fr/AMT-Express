'use client';

import { useState, useEffect, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Edit2, Check, X, ShieldCheck, ShieldAlert, Calendar, Tag, RefreshCw } from 'lucide-react';

import { useSessionWithRole } from '@/context/SessionContext';
import { updateName, changeEmail, resendVerificationEmail } from '@/lib/actions/customerProfileActions';
import styles from './ProfileSection.module.css';

interface Props {
    showTitle?: boolean;
}

type FeedbackState = { type: 'success' | 'error'; message: string } | null;

export function ProfileSection({ showTitle = true }: Props) {
    const { t } = useTranslation();
    const { session } = useSessionWithRole();
    const user = session?.user;

    // Name editing
    const [editingName, setEditingName] = useState(false);
    const [nameValue, setNameValue] = useState(user?.name || '');
    const [namePending, startNameTransition] = useTransition();
    const [nameFeedback, setNameFeedback] = useState<FeedbackState>(null);

    // Email change
    const [editingEmail, setEditingEmail] = useState(false);
    const [newEmailValue, setNewEmailValue] = useState('');
    const [emailPending, startEmailTransition] = useTransition();
    const [emailFeedback, setEmailFeedback] = useState<FeedbackState>(null);

    // Resend verification
    const [resendPending, startResendTransition] = useTransition();
    const [resendFeedback, setResendFeedback] = useState<FeedbackState>(null);

    useEffect(() => {
        if (user) setNameValue(user.name || '');
    }, [user]);

    function formatDate(date: Date | string) {
        return new Date(date).toLocaleDateString(undefined, {
            day: 'numeric', month: 'long', year: 'numeric',
        });
    }

    function handleCancelName() {
        setNameValue(user?.name || '');
        setEditingName(false);
        setNameFeedback(null);
    }

    function handleSaveName() {
        const fd = new FormData();
        fd.set('name', nameValue);
        startNameTransition(async () => {
            const result = await updateName(fd);
            if (result.success) {
                setNameFeedback({ type: 'success', message: t('profile.nameUpdated') });
                setEditingName(false);
            } else {
                setNameFeedback({ type: 'error', message: result.error || t('profile.updateError') });
            }
        });
    }

    function handleSendEmailChange() {
        if (!newEmailValue.trim()) return;
        const fd = new FormData();
        fd.set('newEmail', newEmailValue.trim());
        startEmailTransition(async () => {
            const result = await changeEmail(fd);
            if (result.success) {
                setEmailFeedback({ type: 'success', message: t('profile.emailChangeSent') });
                setEditingEmail(false);
                setNewEmailValue('');
            } else {
                setEmailFeedback({ type: 'error', message: result.error || t('profile.updateError') });
            }
        });
    }

    function handleResendVerification() {
        if (!user?.email) return;
        startResendTransition(async () => {
            const result = await resendVerificationEmail(user.email);
            if (result.success) {
                setResendFeedback({ type: 'success', message: t('profile.verificationSent') });
            } else {
                setResendFeedback({ type: 'error', message: result.error || t('profile.updateError') });
            }
        });
    }

    return (
        <div className={styles.profileSection}>
            {showTitle && (
                <div className={styles.sectionHeader}>
                    <User className={styles.sectionIcon} />
                    <div className={styles.sectionText}>
                        <h2 className={styles.sectionTitle}>{t('customerNavigation.profile')}</h2>
                        <p className={styles.sectionDescription}>{t('customerNavigation.profileDescription')}</p>
                    </div>
                </div>
            )}

            <div className={styles.profileCard}>
                {/* Avatar + Name */}
                <div className={styles.avatarSection}>
                    <div className={styles.avatar}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {editingName ? (
                        <div className={styles.editRow}>
                            <input
                                type="text"
                                value={nameValue}
                                onChange={(e) => setNameValue(e.target.value)}
                                className={styles.editInput}
                                placeholder={t('profile.namePlaceholder')}
                                disabled={namePending}
                                autoFocus
                            />
                            <div className={styles.inlineActions}>
                                <button onClick={handleSaveName} disabled={namePending} className={styles.iconButtonPrimary} title={t('customerDashboard.save')}>
                                    <Check />
                                </button>
                                <button onClick={handleCancelName} disabled={namePending} className={styles.iconButtonGhost} title={t('customerDashboard.cancel')}>
                                    <X />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.editRow}>
                            <h3 className={styles.profileName}>{user?.name || t('customerNavigation.unknownUser')}</h3>
                            <button onClick={() => { setEditingName(true); setNameFeedback(null); }} className={styles.iconButtonGhost} title={t('customerDashboard.edit')}>
                                <Edit2 />
                            </button>
                        </div>
                    )}
                    {nameFeedback && (
                        <p className={nameFeedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}>
                            {nameFeedback.message}
                        </p>
                    )}
                    <span className={styles.roleBadge}>
                        <Tag className={styles.roleBadgeIcon} />
                        {t(`roles.${user?.role ?? 'customer'}`)}
                    </span>
                </div>

                <div className={styles.divider} />

                {/* Info rows */}
                <div className={styles.infoSection}>
                    {/* Email */}
                    <div className={styles.infoBlock}>
                        <div className={styles.infoRow}>
                            <div className={styles.infoIcon}><Mail /></div>
                            <div className={styles.infoContent}>
                                <span className={styles.infoLabel}>{t('settings.email')}</span>
                                <div className={styles.infoValueRow}>
                                    <span className={styles.infoValue}>{user?.email || '-'}</span>
                                    {user?.emailVerified ? (
                                        <span className={styles.verifiedBadge}>
                                            <ShieldCheck className={styles.verifiedIcon} />
                                            {t('profile.verified')}
                                        </span>
                                    ) : (
                                        <span className={styles.unverifiedBadge}>
                                            <ShieldAlert className={styles.unverifiedIcon} />
                                            {t('profile.unverified')}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => { setEditingEmail(e => !e); setEmailFeedback(null); }}
                                className={styles.iconButtonGhost}
                                title={t('profile.changeEmail')}
                            >
                                <Edit2 />
                            </button>
                        </div>

                        {!user?.emailVerified && (
                            <div className={styles.verificationRow}>
                                <button
                                    onClick={handleResendVerification}
                                    disabled={resendPending}
                                    className={styles.textButton}
                                >
                                    <RefreshCw className={styles.textButtonIcon} />
                                    {resendPending ? t('profile.sending') : t('profile.resendVerification')}
                                </button>
                                {resendFeedback && (
                                    <p className={resendFeedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}>
                                        {resendFeedback.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {editingEmail && (
                            <div className={styles.changeEmailBlock}>
                                <input
                                    type="email"
                                    value={newEmailValue}
                                    onChange={(e) => setNewEmailValue(e.target.value)}
                                    placeholder={t('profile.newEmailPlaceholder')}
                                    className={styles.editInput}
                                    disabled={emailPending}
                                    autoFocus
                                />
                                <div className={styles.editActions}>
                                    <button onClick={() => { setEditingEmail(false); setEmailFeedback(null); setNewEmailValue(''); }} className={styles.cancelButton} disabled={emailPending}>
                                        {t('customerDashboard.cancel')}
                                    </button>
                                    <button onClick={handleSendEmailChange} className={styles.saveButton} disabled={emailPending || !newEmailValue.trim()}>
                                        {emailPending ? t('profile.sending') : t('profile.sendVerification')}
                                    </button>
                                </div>
                                <p className={styles.helperText}>{t('profile.emailChangeHint')}</p>
                                {emailFeedback && (
                                    <p className={emailFeedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}>
                                        {emailFeedback.message}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Member since */}
                    <div className={styles.infoRow}>
                        <div className={styles.infoIcon}><Calendar /></div>
                        <div className={styles.infoContent}>
                            <span className={styles.infoLabel}>{t('profile.memberSince')}</span>
                            <span className={styles.infoValue}>
                                {user?.createdAt ? formatDate(user.createdAt) : '-'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
