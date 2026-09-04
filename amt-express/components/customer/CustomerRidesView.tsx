'use client'

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { RideWithRelations } from "@/content/database_types/ride";
import { Button } from "@/components/classicComponents/Button";
import {
    fetchCustomerCompletedRides,
    fetchCustomerRequestedRides,
} from "@/lib/actions/ridesViewActions";
import { Calendar, MapPin, User, DollarSign, CheckCircle, Clock, RefreshCw, ExternalLink } from "lucide-react";
import styles from "./CustomerRidesView.module.css";

type CustomerView = "completed" | "pending";

interface Props {
    hideHeader?: boolean;
}

// Cache scoped to component lifetime; survives tab switches
interface RidesCache {
    pending: RideWithRelations[] | null;
    completed: RideWithRelations[] | null;
}

export default function CustomerRidesView({ hideHeader = false }: Props) {
    const { t } = useTranslation();
    const [activeView, setActiveView] = useState<CustomerView>("pending");
    const cache = useRef<RidesCache>({ pending: null, completed: null });
    const [pendingRides, setPendingRides] = useState<RideWithRelations[]>([]);
    const [completedRides, setCompletedRides] = useState<RideWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadAll = useCallback(async (force = false) => {
        setError(null);
        const needsPending = force || cache.current.pending === null;
        const needsCompleted = force || cache.current.completed === null;

        if (!needsPending && !needsCompleted) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [pendingResult, completedResult] = await Promise.all([
                needsPending ? fetchCustomerRequestedRides() : Promise.resolve(null),
                needsCompleted ? fetchCustomerCompletedRides() : Promise.resolve(null),
            ]);

            if (pendingResult) {
                if (pendingResult.success) {
                    cache.current.pending = pendingResult.data;
                    setPendingRides(pendingResult.data);
                } else {
                    setError(pendingResult.error || t('customerRides.errors.failedToLoadPendingRides'));
                }
            }
            if (completedResult) {
                if (completedResult.success) {
                    cache.current.completed = completedResult.data;
                    setCompletedRides(completedResult.data);
                } else {
                    setError(prev => prev || completedResult.error || t('customerRides.errors.failedToLoadCompletedRides'));
                }
            }
        } catch {
            setError(t('customerRides.errors.unexpectedError'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [t]);

    // Seed state from cache on mount without re-fetching if cache is warm
    useEffect(() => {
        if (cache.current.pending !== null) setPendingRides(cache.current.pending);
        if (cache.current.completed !== null) setCompletedRides(cache.current.completed);
        loadAll(false);
    }, [loadAll]);

    async function handleRefresh() {
        cache.current = { pending: null, completed: null };
        setRefreshing(true);
        await loadAll(true);
    }

    function formatDate(date: Date | string | null) {
        if (!date) return "-";
        return new Date(date).toLocaleDateString(undefined, {
            month: "short", day: "numeric", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    }

    const rides = activeView === "completed" ? completedRides : pendingRides;

    const statusClass: Record<string, string> = {
        pending: styles.statusPending,
        assigned: styles.statusAssigned,
        completed: styles.statusCompleted,
        cancelled: styles.statusCancelled,
    };

    function statusLabel(status: string) {
        return t(`ridesManagement.${status}`, { defaultValue: status });
    }

    return (
        <div className={styles.container}>
            {!hideHeader && (
                <div className={styles.header}>
                    <h1 className={styles.headerTitle}>{t('customerRides.title')}</h1>
                    <p className={styles.headerDescription}>{t('customerRides.description')}</p>
                </div>
            )}

            {/* Tabs + refresh */}
            <div className={styles.tabsContainer}>
                <div className={styles.tabsList}>
                    <button
                        onClick={() => setActiveView("pending")}
                        className={`${styles.tabButton} ${activeView === "pending" ? styles.tabButtonActive : ''}`}
                    >
                        {t('customerRides.tabs.pending')}
                        {pendingRides.length > 0 && (
                            <span className={`${styles.tabBadge} ${styles.tabBadgePending}`}>
                                {pendingRides.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveView("completed")}
                        className={`${styles.tabButton} ${activeView === "completed" ? styles.tabButtonActive : ''}`}
                    >
                        {t('customerRides.tabs.completed')}
                        {completedRides.length > 0 && (
                            <span className={`${styles.tabBadge} ${styles.tabBadgeCompleted}`}>
                                {completedRides.length}
                            </span>
                        )}
                    </button>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                    className={styles.refreshButton}
                    title={t('customerRides.refresh')}
                >
                    <RefreshCw className={`${styles.refreshIcon} ${refreshing ? styles.refreshSpin : ''}`} />
                </button>
            </div>

            {/* Content */}
            <div className={styles.contentCard}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner} />
                        <p className={styles.loadingText}>{t('customerRides.loading')}</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorContainer}>
                        <p className={styles.errorText}>{error}</p>
                        <Button variant="secondary" onClick={handleRefresh}>
                            {t('customerRides.retry')}
                        </Button>
                    </div>
                ) : rides.length === 0 ? (
                    <div className={styles.emptyContainer}>
                        <p className={styles.emptyText}>
                            {activeView === "pending"
                                ? t('customerRides.empty.pending')
                                : t('customerRides.empty.completed')}
                        </p>
                    </div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead className={styles.tableHeader}>
                                <tr className={styles.headerRow}>
                                    <th className={styles.headerCell}>{t('customerRides.table.rideId')}</th>
                                    <th className={styles.headerCell}>{t('customerRides.table.route')}</th>
                                    <th className={styles.headerCell}>{t('customerRides.table.departureTime')}</th>
                                    <th className={styles.headerCell}>{t('customerRides.table.driver')}</th>
                                    <th className={styles.headerCell}>{t('customerRides.table.price')}</th>
                                    <th className={styles.headerCell}>{t('customerRides.table.status')}</th>
                                    <th className={styles.headerCell} />
                                </tr>
                            </thead>
                            <tbody className={styles.tableBody}>
                                {rides.map((ride) => (
                                    <tr key={ride.id} className={styles.tableRow}>
                                        <td className={styles.tableCell}>
                                            <span className={styles.rideId}>#{ride.id.slice(0, 8)}</span>
                                        </td>
                                        <td className={styles.tableCell}>
                                            <div className={styles.routeCell}>
                                                <div className={styles.routeRow}>
                                                    <MapPin className={`${styles.routeIcon} ${styles.routeIconFrom}`} />
                                                    <span className={styles.routeTextFrom}>{ride.departure}</span>
                                                </div>
                                                <div className={styles.routeRow}>
                                                    <MapPin className={`${styles.routeIcon} ${styles.routeIconTo}`} />
                                                    <span className={styles.routeTextTo}>{ride.destination}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={styles.tableCell}>
                                            <div className={styles.dateCell}>
                                                <Calendar className={styles.dateIcon} />
                                                {formatDate(ride.departureTime)}
                                            </div>
                                        </td>
                                        <td className={styles.tableCell}>
                                            {ride.driver ? (
                                                <div className={styles.driverCell}>
                                                    <User className={styles.driverIcon} />
                                                    <span className={styles.driverName}>{ride.driver.name}</span>
                                                </div>
                                            ) : (
                                                <span className={styles.driverNotAssigned}>{t('customerRides.table.notAssigned')}</span>
                                            )}
                                        </td>
                                        <td className={styles.tableCell}>
                                            <div className={styles.priceCell}>
                                                <DollarSign className={styles.priceIcon} />
                                                {ride.price ? parseFloat(ride.price).toFixed(2) : "-"}
                                            </div>
                                        </td>
                                        <td className={styles.tableCell}>
                                            <span className={`${styles.statusBadge} ${statusClass[ride.status] ?? styles.statusPending}`}>
                                                {statusLabel(ride.status)}
                                            </span>
                                        </td>
                                        <td className={styles.tableCell}>
                                            <Link href={`/rides/${ride.id}`} className={styles.detailLink} title={t('customerRides.viewDetail')}>
                                                <ExternalLink className={styles.detailIcon} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {!hideHeader && !loading && !error && (
                <div className={styles.summaryContainer}>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryContent}>
                            <p className={styles.summaryLabel}>{t('customerRides.summary.pendingRides')}</p>
                            <p className={styles.summaryValue}>{pendingRides.length}</p>
                        </div>
                        <Clock className={`${styles.summaryIcon} ${styles.summaryIconPending}`} />
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryContent}>
                            <p className={styles.summaryLabel}>{t('customerRides.summary.completedRides')}</p>
                            <p className={styles.summaryValue}>{completedRides.length}</p>
                        </div>
                        <CheckCircle className={`${styles.summaryIcon} ${styles.summaryIconCompleted}`} />
                    </div>
                </div>
            )}
        </div>
    );
}
