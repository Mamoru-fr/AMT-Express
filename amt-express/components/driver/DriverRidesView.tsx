'use client'

import {useState, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {RideWithRelations} from "@/content/database_types/ride";
import {
    fetchDriverRidesCount,
    fetchDriverCompletedRides,
    fetchDriverAssignedRides,
    fetchPendingRides
} from "@/lib/actions/ridesViewActions";
import Link from "next/link";
import {Calendar, MapPin, DollarSign, Users, RefreshCw, ExternalLink} from "lucide-react";
import styles from "./DriverRidesView.module.css";

type DriverView = "completed" | "assigned" | "available";

export default function DriverRidesView() {
    const {t} = useTranslation();
    const [activeView, setActiveView] = useState<DriverView>("assigned");
    const [completedRides, setCompletedRides] = useState<RideWithRelations[]>([]);
    const [countCompletedRides, setCountCompletedRides] = useState(0);
    const [assignedRides, setAssignedRides] = useState<RideWithRelations[]>([]);
    const [countAssignedRides, setCountAssignedRides] = useState(0);
    const [availableRides, setAvailableRides] = useState<RideWithRelations[]>([]);
    const [countAvailableRides, setCountAvailableRides] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadRides();
    }, [activeView]);

    async function loadRides() {
        setLoading(true);
        setError(null);

        try {
            const results = await fetchDriverRidesCount();
            if (results.success) {
                setCountCompletedRides(results.data.completed);
                setCountAssignedRides(results.data.pending);
            } else {
                setError(results.error || "Failed to load rides count");
            }

            if (activeView === "completed") {
                const result = await fetchDriverCompletedRides();
                if (result.success) {
                    setCompletedRides(result.data);
                } else {
                    setError(result.error || "Failed to load completed rides");
                }
            } else if (activeView === "assigned") {
                const result = await fetchDriverAssignedRides();
                if (result.success) {
                    setAssignedRides(result.data);
                } else {
                    setError(result.error || "Failed to load assigned rides");
                }
            } else {
                const result = await fetchPendingRides();
                if (result.success) {
                    setAvailableRides(result.data);
                } else {
                    setError(result.error || "Failed to load available rides");
                }
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error("Error loading rides:", err);
        } finally {
            setLoading(false);
        }
    }

    function getCurrentRides(): RideWithRelations[] {
        switch (activeView) {
            case "completed":
                return completedRides;
            case "assigned":
                return assignedRides;
            case "available":
                return availableRides;
        }
    }

    function formatDate(date: Date | string | null) {
        if (!date) return "-";
        return new Date(date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    const statusClass: Record<string, string> = {
        pending: styles.statusPending,
        assigned: styles.statusAssigned,
        completed: styles.statusCompleted,
        cancelled: styles.statusCancelled,
    };

    const rides = getCurrentRides();

    return (
        <div className={styles.container}>
            {/* Tabs + refresh */}
            <div className={styles.tabsContainer}>
                <div className={styles.tabsList}>
                    <button
                        onClick={() => setActiveView("assigned")}
                        className={`${styles.tabButton} ${activeView === "assigned" ? styles.tabButtonActive : ""}`}
                    >
                        {t('driverRides.tabs.assigned', 'Assigned')}
                        {countAssignedRides > 0 && (
                            <span className={`${styles.tabBadge} ${styles.tabBadgeAssigned}`}>
                                {countAssignedRides}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveView("available")}
                        className={`${styles.tabButton} ${activeView === "available" ? styles.tabButtonActive : ""}`}
                    >
                        {t('driverRides.tabs.available', 'Available')}
                        {countAvailableRides > 0 && (
                            <span className={`${styles.tabBadge} ${styles.tabBadgeAvailable}`}>
                                {countAvailableRides}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveView("completed")}
                        className={`${styles.tabButton} ${activeView === "completed" ? styles.tabButtonActive : ""}`}
                    >
                        {t('driverRides.tabs.completed', 'Completed')}
                        {countCompletedRides > 0 && (
                            <span className={`${styles.tabBadge} ${styles.tabBadgeCompleted}`}>
                                {countCompletedRides}
                            </span>
                        )}
                    </button>
                </div>
                <button
                    onClick={loadRides}
                    disabled={loading}
                    className={styles.refreshButton}
                    title={t('driverRides.refresh', 'Refresh')}
                >
                    <RefreshCw className={`${styles.refreshIcon} ${loading ? styles.refreshSpin : ""}`} />
                </button>
            </div>

            {/* Content card */}
            <div className={styles.contentCard}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner} />
                        <p className={styles.loadingText}>{t('driverRides.loading', 'Loading rides...')}</p>
                    </div>
                ) : error ? (
                    <div className={styles.errorContainer}>
                        <p className={styles.errorText}>{error}</p>
                        <button onClick={loadRides} className={styles.errorButton}>
                            {t('driverRides.retry', 'Retry')}
                        </button>
                    </div>
                ) : rides.length === 0 ? (
                    <div className={styles.emptyContainer}>
                        <p className={styles.emptyText}>
                            {activeView === "assigned" && t('driverRides.empty.assigned', 'No assigned rides at the moment.')}
                            {activeView === "available" && t('driverRides.empty.available', 'No available rides right now.')}
                            {activeView === "completed" && t('driverRides.empty.completed', 'No completed rides yet.')}
                        </p>
                    </div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead className={styles.tableHeader}>
                                <tr>
                                    <th className={styles.headerCell}>{t('driverRides.table.rideId', 'Ride ID')}</th>
                                    <th className={styles.headerCell}>{t('driverRides.table.route', 'Route')}</th>
                                    <th className={styles.headerCell}>{t('driverRides.table.departure', 'Departure')}</th>
                                    <th className={styles.headerCell}>{t('driverRides.table.customers', 'Customers')}</th>
                                    <th className={styles.headerCell}>{t('driverRides.table.price', 'Price')}</th>
                                    <th className={styles.headerCell}>
                                        {activeView === "available"
                                            ? t('driverRides.table.action', 'Action')
                                            : t('driverRides.table.status', 'Status')}
                                    </th>
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
                                            <div className={styles.customersCell}>
                                                <Users className={styles.customersIcon} />
                                                {ride.customers && ride.customers.length > 0
                                                    ? ride.customers.map(c => c.name).join(', ')
                                                    : <em>{t('driverRides.table.noCustomers', 'None')}</em>}
                                            </div>
                                        </td>
                                        <td className={styles.tableCell}>
                                            <div className={styles.priceCell}>
                                                <DollarSign className={styles.priceIcon} />
                                                {ride.price ? parseFloat(ride.price).toFixed(2) : "-"}
                                            </div>
                                        </td>
                                        <td className={styles.tableCell}>
                                            {activeView === "available" ? (
                                                <Link href={`/driver-rides/${ride.id}`} className={styles.requestButton}>
                                                    {t('driverRides.table.view', 'View')}
                                                </Link>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <span className={`${styles.statusBadge} ${statusClass[ride.status] ?? styles.statusPending}`}>
                                                        {ride.status}
                                                    </span>
                                                    <Link href={`/driver-rides/${ride.id}`} className={styles.detailLink} title={t('driverRides.table.viewDetail', 'View detail')}>
                                                        <ExternalLink className={styles.detailIcon} />
                                                    </Link>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
