'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Edit2 } from 'lucide-react';

// Components
import { CustomerSidebar } from '@/components/customer/navigation/CustomerSidebar';

// Context
import { useSessionWithRole } from '@/context/SessionContext';

// Styles
import styles from '@/components/dashboard/CustomerDashboard.module.css';

export default function ProfilePage() {
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
        <CustomerSidebar>
            <div className={styles.customerDashboard}>
                <div className={styles.customerInner}>
                    {/* Header */}
                    <div className={styles.headerBlock}>
                        <div className={styles.titleRow}>
                            <div className={styles.titleIcon}>
                                <User />
                            </div>
                            <h1 className={styles.title}>{t('customerNavigation.profile')}</h1>
                        </div>
                        <p className={styles.subtitle}>{t('customerNavigation.profileDescription')}</p>
                    </div>

                    {/* Profile Content */}
                    <div className={styles.ridesSection}>
                        <div className={styles.sectionHeader}>
                            <User className={styles.sectionIcon} />
                            <div className={styles.sectionText}>
                                <h2 className={styles.sectionTitle}>{t('customerNavigation.profile')}</h2>
                                <p className={styles.sectionDescription}>{t('customerNavigation.profileDescription')}</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                            {/* Profile Card */}
                            <div style={{ 
                                background: 'var(--app-surface)', 
                                borderRadius: '0.75rem',
                                border: '1px solid var(--app-surface-border)',
                                padding: '1.5rem',
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: '1.5rem'
                            }}>
                                {/* Avatar Section */}
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    gap: '1rem',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        width: '4rem',
                                        height: '4rem',
                                        borderRadius: '50%',
                                        background: 'var(--app-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '1.75rem',
                                        fontWeight: '700'
                                    }}>
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            style={{
                                                fontSize: '1.25rem',
                                                fontWeight: '700',
                                                padding: '0.5rem',
                                                border: '1px solid var(--app-surface-border)',
                                                borderRadius: '0.5rem',
                                                background: 'var(--app-surface)',
                                                color: 'var(--app-title-color)'
                                            }}
                                        />
                                    ) : (
                                        <h3 style={{ 
                                            margin: 0,
                                            fontSize: '1.25rem',
                                            fontWeight: '700',
                                            color: 'var(--app-title-color)'
                                        }}>
                                            {user?.name || t('customerNavigation.unknownUser')}
                                        </h3>
                                    )}
                                    <p style={{ 
                                        margin: 0,
                                        color: 'var(--app-muted-color)',
                                        fontSize: '0.875rem'
                                    }}>
                                        {t('customerDashboard.customer')}
                                    </p>
                                </div>

                                {/* Info Section */}
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
                                            <span style={{ color: 'var(--app-text-color)' }}>{user?.email || '-'}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
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
                    </div>
                </div>
            </div>
        </CustomerSidebar>
    );
}
