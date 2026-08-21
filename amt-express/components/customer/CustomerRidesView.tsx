'use client'

/**
 * CustomerRidesView Component
 * 
 * Displays rides for customer users with 2 different views:
 * 1. Completed Rides - Rides the customer has completed
 * 2. Pending Rides - Rides the customer has requested that are not yet completed
 */

import {useState, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {RideWithRelations} from "@/content/database_types/ride";
import {
    fetchCustomerCompletedRides,
    fetchCustomerRequestedRides
} from "@/lib/actions/ridesViewActions";
import {Calendar, MapPin, User, DollarSign, CheckCircle, Clock} from "lucide-react";
import styles from "./CustomerRidesView.module.css";

type CustomerView = "completed" | "pending";

interface Props {
    hideHeader?: boolean;
}

export default function CustomerRidesView({ hideHeader = false }: Props) {
    const {t} = useTranslation();
    const [activeView, setActiveView] = useState<CustomerView>("pending");
    const [completedRides, setCompletedRides] = useState<RideWithRelations[]>([]);
    const [pendingRides, setPendingRides] = useState<RideWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadRides();
    }, [activeView]);

    async function loadRides() {
        setLoading(true);
        setError(null);

        try {
            if (activeView === "completed") {
                const result = await fetchCustomerCompletedRides();
                if (result.success) {
                    setCompletedRides(result.data);
                } else {
                    setError(result.error || t('customerRides.errors.failedToLoadCompletedRides'));
                }
            } else {
                const result = await fetchCustomerRequestedRides();
                if (result.success) {
                    setPendingRides(result.data);
                } else {
                    setError(result.error || t('customerRides.errors.failedToLoadPendingRides'));
                }
            }
        } catch (err) {
            setError(t('customerRides.errors.unexpectedError'));
            console.error("Error loading rides:", err);
        } finally {
            setLoading(false);
        }
    }

    function getCurrentRides(): RideWithRelations[] {
        return activeView === "completed" ? completedRides : pendingRides;
    }

    function formatDate(date: Date | string | null) {
        if (!date) return "-";
        return new Date(date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    const rides = getCurrentRides();

    const statusClassByValue = {
        pending: styles.statusPending,
        assigned: styles.statusAssigned,
        completed: styles.statusCompleted,
        cancelled: styles.statusCancelled,
    };

    function getStatusTranslation(status: string): string {
        const statusTranslations: Record<string, string> = {
            pending: t('ridesManagement.pending'),
            assigned: t('ridesManagement.assigned'),
            completed: t('ridesManagement.completed'),
            cancelled: t('ridesManagement.cancelled'),
        };
        return statusTranslations[status] || status;
    }

    return (
        <div className={styles.container}>
            {!hideHeader && (
                <div className={styles.header}>
                    <h1 className={styles.headerTitle}>{t('customerRides.title')}</h1>
                    <p className={styles.headerDescription}>{t('customerRides.description')}</p>
                </div>
            )}

            {/* Tabs */}
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
            </div>

            {/* Content */}
            <div className={styles.contentCard}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner}></div>
                        <p className={styles.loadingText}>{t('customerRides.loading')}</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorContainer}>
                        <p className={styles.errorText}>{error}</p>
                        <button
                            onClick={loadRides}
                            className={styles.errorButton}
                        >
                            {t('customerRides.retry')}
                        </button>
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
                                </tr>
                            </thead>
                            <tbody className={styles.tableBody}>
                                {rides.map((ride) => (
                                    <tr key={ride.id} className={styles.tableRow}>
                                        <td className={styles.tableCell}>
                                            <span className={styles.rideId}>#{ride.id}</span>
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
                                                {ride.price ? `${parseFloat(ride.price).toFixed(2)}` : "-"}
                                            </div>
                                        </td>
                                        <td className={styles.tableCell}>
                                            <span className={`${styles.statusBadge} ${statusClassByValue[ride.status as keyof typeof statusClassByValue] || styles.statusPending}`}>
                                                {getStatusTranslation(ride.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary Stats - Hidden when used in dashboard */}
            {(!hideHeader && !loading && !error) && (
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
