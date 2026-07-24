'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Bell, Globe, User, Mail, Edit2 } from 'lucide-react';

// Components
import { CustomerSidebar } from '@/components/customer/navigation/CustomerSidebar';
import { LanguageDropdown } from '@/components/LanguageComponents/LanguageDropdown';

// Context
import { useSessionWithRole } from '@/context/SessionContext';

// Styles
import styles from '@/components/dashboard/CustomerDashboard.module.css';

export default function SettingsPage() {
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
        setIsEditing(false);
    };

    const handleCancel = () => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
        setIsEditing(false);
    };

    return (
        <CustomerSidebar>
            <div className={styles.customerDashboard}>
                <div className={styles.customerInner}>
                    {/* Header */}
                    <div className={styles.headerBlock}>
                        <div className={styles.titleRow}>
                            <div className={styles.titleIcon}>
                                <SettingsIcon />
                            </div>
                            <h1 className={styles.title}>{t('customerNavigation.settings')}</h1>
                        </div>
                        <p className={styles.subtitle}>{t('customerNavigation.settingsDescription')}</p>
                    </div>

                    {/* Settings Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Profile Section */}
                        <div className={styles.ridesSection}>
                            <div className={styles.sectionHeader}>
                                <User className={styles.sectionIcon} />
                                <div className={styles.sectionText}>
                                    <h2 className={styles.sectionTitle}>{t('settings.profile')}</h2>
                                    <p className={styles.sectionDescription}>{t('settings.profileDescription')}</p>
                                </div>
                            </div>
                            
                            <div style={{ 
                                background: 'var(--app-surface)', 
                                borderRadius: '0.75rem',
                                border: '1px solid var(--app-surface-border)',
                                padding: '1.5rem',
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: '1.5rem'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    gap: '1rem'
                                }}>
                                    <div style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <div style={{ 
                                            width: '2rem',
                                            height: '2rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'var(--app-surface-subtle)',
                                            borderRadius: '0.5rem'
                                        }}>
                                            <User style={{ width: '1.25rem', height: '1.25rem', color: 'var(--app-muted-color)' }} />
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    border: '1px solid var(--app-surface-border)',
                                                    borderRadius: '0.5rem',
                                                    background: 'var(--app-surface)',
                                                    color: 'var(--app-title-color)'
                                                }}
                                            />
                                        ) : (
                                            <span style={{ color: 'var(--app-text-color)', fontWeight: '500' }}>{t('settings.name')}:</span>
                                        )}
                                        {isEditing ? null : (
                                            <span style={{ color: 'var(--app-muted-color)' }}>{user?.name || '-'}</span>
                                        )}
                                    </div>
                                    
                                    <div style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <div style={{ 
                                            width: '2rem',
                                            height: '2rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'var(--app-surface-subtle)',
                                            borderRadius: '0.5rem'
                                        }}>
                                            <Mail style={{ width: '1.25rem', height: '1.25rem', color: 'var(--app-muted-color)' }} />
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    border: '1px solid var(--app-surface-border)',
                                                    borderRadius: '0.5rem',
                                                    background: 'var(--app-surface)',
                                                    color: 'var(--app-title-color)'
                                                }}
                                            />
                                        ) : (
                                            <>
                                                <span style={{ color: 'var(--app-text-color)', fontWeight: '500' }}>{t('settings.email')}:</span>
                                                <span style={{ color: 'var(--app-muted-color)' }}>{user?.email || '-'}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {isEditing ? (
                                    <div style={{ 
                                        display: 'flex',
                                        gap: '0.75rem',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <button 
                                            onClick={handleCancel}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                border: 'none',
                                                background: 'var(--app-surface-subtle)',
                                                color: 'var(--app-text-color)',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {t('customerDashboard.cancel')}
                                        </button>
                                        <button 
                                            onClick={handleSave}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                border: 'none',
                                                background: 'var(--app-primary)',
                                                color: 'white',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {t('customerDashboard.save')}
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={handleEditToggle}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            alignSelf: 'flex-end',
                                            padding: '0.5rem 1rem',
                                            border: 'none',
                                            background: 'var(--app-surface-subtle)',
                                            color: 'var(--app-text-color)',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <Edit2 style={{ width: '1rem', height: '1rem' }} />
                                        <span>{t('customerDashboard.edit')}</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notifications Section */}
                        <div className={styles.ridesSection}>
                            <div className={styles.sectionHeader}>
                                <Bell className={styles.sectionIcon} />
                                <div className={styles.sectionText}>
                                    <h2 className={styles.sectionTitle}>{t('settings.notifications')}</h2>
                                    <p className={styles.sectionDescription}>{t('settings.notificationsDescription')}</p>
                                </div>
                            </div>
                            
                            <div style={{ 
                                background: 'var(--app-surface)', 
                                borderRadius: '0.75rem',
                                border: '1px solid var(--app-surface-border)',
                                padding: '1rem'
                            }}>
                                <p style={{ color: 'var(--app-muted-color)' }}>{t('settings.notificationsComingSoon')}</p>
                            </div>
                        </div>

                        {/* Language Section */}
                        <div className={styles.ridesSection}>
                            <div className={styles.sectionHeader}>
                                <Globe className={styles.sectionIcon} />
                                <div className={styles.sectionText}>
                                    <h2 className={styles.sectionTitle}>{t('settings.language')}</h2>
                                    <p className={styles.sectionDescription}>{t('settings.languageDescription')}</p>
                                </div>
                            </div>
                            
                            <div style={{ 
                                background: 'var(--app-surface)', 
                                borderRadius: '0.75rem',
                                border: '1px solid var(--app-surface-border)',
                                padding: '1rem'
                            }}>
                                <LanguageDropdown variant="floating" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerSidebar>
    );
}
