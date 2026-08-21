'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Edit2 } from 'lucide-react';

// Context
import { useSessionWithRole } from '@/context/SessionContext';

// Styles
import styles from './ProfileSection.module.css';

interface Props {
    showTitle?: boolean;
}

export function ProfileSection({ showTitle = true }: Props) {
    const { t } = useTranslation();
    const { session } = useSessionWithRole();
    const user = session?.user;
    
    // Local state for editable fields
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isEditing, setIsEditing] = useState(false);

    // Update local state when user data changes
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleEditToggle = () => {
        setIsEditing(prev => !prev);
    };

    const handleSave = () => {
        // TODO: Implement save functionality
        // For now, just toggle edit mode
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Reset to original values
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
        setIsEditing(false);
    };

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
                {/* Avatar Section */}
                <div className={styles.avatarSection}>
                    <div className={styles.avatar}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.editInput}
                            placeholder={t('customerDashboard.name')}
                        />
                    ) : (
                        <h3 className={styles.profileName}>
                            {user?.name || t('customerNavigation.unknownUser')}
                        </h3>
                    )}
                    <p className={styles.profileLabel}>{t('customerDashboard.customer')}</p>
                </div>

                {/* Info Section */}
                <div className={styles.infoSection}>
                    <div className={styles.infoRow}>
                        <div className={styles.infoIcon}>
                            <Mail />
                        </div>
                        {isEditing ? (
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.editInput}
                                placeholder={t('customerDashboard.email')}
                            />
                        ) : (
                            <div className={styles.infoContent}>
                                <span className={styles.infoLabel}>{t('settings.email')}</span>
                                <span className={styles.infoValue}>{user?.email || '-'}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.actionsSection}>
                    {isEditing ? (
                        <div className={styles.editActions}>
                            <button 
                                onClick={handleCancel}
                                className={styles.cancelButton}
                            >
                                {t('customerDashboard.cancel')}
                            </button>
                            <button 
                                onClick={handleSave}
                                className={styles.saveButton}
                            >
                                {t('customerDashboard.save')}
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={handleEditToggle}
                            className={styles.editButton}
                        >
                            <Edit2 />
                            <span>{t('customerDashboard.edit')}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
