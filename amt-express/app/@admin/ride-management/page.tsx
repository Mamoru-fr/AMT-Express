'use client'

// Import des dépendances nécessaires
import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    fetchRidesForManagement,
    fetchAvailableDrivers,
    exportRidesToCSV,
    updateRideDetails,
    assignDriverToRide,
    cancelRide,
    deleteRide,
    fetchAllCustomers
} from "@/lib/actions/ridesManagementActions";

import type { RideFilters, RidesManagementData } from "@/lib/services/RidesManagementService";
import { RideStatus, RideWithRelations } from "@/content/database_types/ride";
import {
    Search, Filter, Download, Edit, Trash2, UserPlus, ChevronLeft, ChevronRight, Plus, X, ArrowUpDown
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSessionWithRole } from "@/context/SessionContext";
import { redirect } from "next/navigation";
import { StatusBanner } from "@/components/classicComponents/StatusBanner";

// Import des modals et composants locaux
import { EditRideModal } from "@/components/admin/rideManagement/EditRideModal";
import { AssignDriverModal } from "@/components/admin/rideManagement/AssignDriverModal";
import { DeleteConfirmModal } from "@/components/admin/rideManagement/DeleteConfirmModal";
import { AddRideModal } from "@/components/admin/rideManagement/AddRideModal";
import { ColumnFilter } from "@/components/admin/rideManagement/ColumnFilter";
import { AdvancedSortModal } from "@/components/admin/rideManagement/AdvancedSortModal";
import { AdminNavigationShell } from "@/components/admin/navigation/AdminNavigationShell";
import styles from "@/components/admin/rideManagement/RidesManagementBoard.module.css";

/**
 * RideManagementPage - Page pour gérer toutes les courses de la plateforme
 */
export default function RideManagementPage() {
    const { t } = useTranslation();
    const { session } = useSessionWithRole();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentReturnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    // Main data state
    const [data, setData] = useState<RidesManagementData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAdvancedSortModalOpen, setIsAdvancedSortModalOpen] = useState(false);
    const [feedback, setFeedback] = useState<{ tone: 'info' | 'warning' | 'error' | 'success'; message: string } | null>(null);

    type SortRule = {
        column: 'departureTime' | 'clients' | 'departure' | 'destination' | 'driver' | 'price' | 'status';
        direction: 'asc' | 'desc'
    };
    const [sortRules, setSortRules] = useState<SortRule[]>([
        { column: 'departureTime', direction: 'desc' }
    ]);

    const [filters, setFilters] = useState<RideFilters>({
        search: '',
        status: 'all',
        sortBy: 'departureTime',
        sortOrder: 'desc',
        page: 1,
        limit: 50
    });

    const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({
        departureTime: [],
        clients: [],
        departure: [],
        destination: [],
        driver: [],
        price: [],
        status: []
    });

    const getColumnOptions = (
        columnKey: string,
        rides: RideWithRelations[] = []
    ): { value: string; label: string; count: number }[] => {
        if (!data?.rides) return [];
        const currentRides = rides.length > 0 ? rides : data.rides;
        
        switch (columnKey) {
            case 'status':
                const statusCounts: Record<string, number> = {};
                currentRides.forEach(ride => {
                    statusCounts[ride.status] = (statusCounts[ride.status] || 0) + 1;
                });
                return Object.entries(statusCounts).map(([value, count]) => ({
                    value,
                    label: value.charAt(0).toUpperCase() + value.slice(1),
                    count
                }));
            case 'departure':
                const departureCounts: Record<string, number> = {};
                currentRides.forEach(ride => {
                    departureCounts[ride.departure] = (departureCounts[ride.departure] || 0) + 1;
                });
                return Object.entries(departureCounts).map(([value, count]) => ({
                    value,
                    label: value,
                    count
                }));
            case 'destination':
                const destinationCounts: Record<string, number> = {};
                currentRides.forEach(ride => {
                    destinationCounts[ride.destination] = (destinationCounts[ride.destination] || 0) + 1;
                });
                return Object.entries(destinationCounts).map(([value, count]) => ({
                    value,
                    label: value,
                    count
                }));
            case 'driver':
                const driverCounts: Record<string, number> = {};
                currentRides.forEach(ride => {
                    const driverName = ride.driver?.name || 'Unassigned';
                    driverCounts[driverName] = (driverCounts[driverName] || 0) + 1;
                });
                return Object.entries(driverCounts).map(([value, count]) => ({
                    value,
                    label: value,
                    count
                }));
            case 'clients':
                const clientCounts: Record<string, number> = {};
                currentRides.forEach(ride => {
                    ride.customers.forEach(customer => {
                        clientCounts[customer.name] = (clientCounts[customer.name] || 0) + 1;
                    });
                });
                return Object.entries(clientCounts).map(([value, count]) => ({
                    value,
                    label: value,
                    count
                }));
            case 'price':
                const priceCounts: Record<string, number> = {};
                currentRides.forEach(ride => {
                    priceCounts[ride.price] = (priceCounts[ride.price] || 0) + 1;
                });
                return Object.entries(priceCounts).map(([value, count]) => ({
                    value,
                    label: `€${value}`,
                    count
                }));
            case 'departureTime':
                const dateCounts: Record<string, number> = {};
                currentRides.forEach(ride => {
                    const date = new Date(ride.departureTime).toLocaleDateString('fr-FR');
                    dateCounts[date] = (dateCounts[date] || 0) + 1;
                });
                return Object.entries(dateCounts).map(([value, count]) => ({
                    value,
                    label: value,
                    count
                }));
            default:
                return [];
        }
    };

    const handleColumnFilterChange = (column: string, values: string[]) => {
        setColumnFilters(prev => ({
            ...prev,
            [column]: values
        }));
        if (column === 'status') {
            const statusValues = values.length > 0 ? values as RideStatus[] : 'all';
            setFilters(prev => ({...prev, status: statusValues, page: 1}));
        }
    };

    const clearAllColumnFilters = () => {
        setColumnFilters({
            departureTime: [],
            clients: [],
            departure: [],
            destination: [],
            driver: [],
            price: [],
            status: []
        });
        setFilters(prev => ({...prev, status: 'all', page: 1}));
    };

    const hasActiveColumnFilters = Object.values(columnFilters).some(values => values.length > 0);

    const passesColumnFilters = (ride: RideWithRelations): boolean => {
        const activeFilters = Object.entries(columnFilters).filter(([_, values]) => values.length > 0);
        if (activeFilters.length === 0) return true;
        
        for (const [column, values] of activeFilters) {
            switch (column) {
                case 'status':
                    if (!values.includes(ride.status)) return false;
                    break;
                case 'departure':
                    if (!values.includes(ride.departure)) return false;
                    break;
                case 'destination':
                    if (!values.includes(ride.destination)) return false;
                    break;
                case 'driver':
                    const driverName = ride.driver?.name || 'Unassigned';
                    if (!values.includes(driverName)) return false;
                    break;
                case 'clients':
                    const customerNames = ride.customers.map(c => c.name);
                    const hasMatchingCustomer = values.some(value => customerNames.includes(value));
                    if (!hasMatchingCustomer) return false;
                    break;
                case 'price':
                    if (!values.includes(ride.price)) return false;
                    break;
                case 'departureTime':
                    const rideDate = new Date(ride.departureTime).toLocaleDateString('fr-FR');
                    if (!values.includes(rideDate)) return false;
                    break;
            }
        }
        return true;
    };

    const filteredRides = data?.rides.filter(passesColumnFilters) || [];

    const sortedRides = [...filteredRides].sort((a, b) => {
        for (const rule of sortRules) {
            let comparison = 0;
            switch (rule.column) {
                case 'departureTime':
                    comparison = new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
                    break;
                case 'clients':
                    const aClients = a.customers.map(c => c.name).join(', ').toLowerCase();
                    const bClients = b.customers.map(c => c.name).join(', ').toLowerCase();
                    comparison = aClients.localeCompare(bClients);
                    break;
                case 'departure':
                    comparison = (a.departure || '').toLowerCase().localeCompare((b.departure || '').toLowerCase());
                    break;
                case 'destination':
                    comparison = (a.destination || '').toLowerCase().localeCompare((b.destination || '').toLowerCase());
                    break;
                case 'driver':
                    const aDriver = a.driver?.name?.toLowerCase() || '';
                    const bDriver = b.driver?.name?.toLowerCase() || '';
                    comparison = aDriver.localeCompare(bDriver);
                    break;
                case 'price':
                    comparison = parseFloat(a.price || '0') - parseFloat(b.price || '0');
                    break;
                case 'status':
                    comparison = (a.status || '').toLowerCase().localeCompare((b.status || '').toLowerCase());
                    break;
            }
            if (comparison !== 0) {
                return rule.direction === 'asc' ? comparison : -comparison;
            }
        }
        return 0;
    });

    if (!session || session.user.role !== 'admin') {
        redirect('/');
    }

    const [editModal, setEditModal] = useState<{ open: boolean; ride: RideWithRelations | null }>({
        open: false,
        ride: null
    });
    const [assignModal, setAssignModal] = useState<{ open: boolean; ride: RideWithRelations | null }>({
        open: false,
        ride: null
    });
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; rideId: number | null }>({
        open: false,
        rideId: null
    });

    const [availableDrivers, setAvailableDrivers] = useState<Array<{ id: string; name: string; email: string }>>([]);
    const [availableCustomers, setAvailableCustomers] = useState<Array<{ id: string; name: string; email: string }>>([]);

    useEffect(() => {
        loadRides();
    }, [filters]);

    const fetchAvailableDriversAndCustomers = async () => {
        try {
            const driversResponse = await fetchAvailableDrivers();
            if (driversResponse.success) {
                setAvailableDrivers(driversResponse.data);
            }
            const customersResponse = await fetchAllCustomers();
            if (customersResponse.success) {
                setAvailableCustomers(customersResponse.data);
            }
        } catch (error) {
            console.error('Error fetching drivers or customers:', error);
        }
    };

    useEffect(() => {
        fetchAvailableDriversAndCustomers();
    }, []);

    const loadRides = async () => {
        setLoading(true);
        try {
            const result = await fetchRidesForManagement(filters);
            if (!result.success) {
                console.error('Failed to fetch rides:', result.error);
            } else {
                setData(result.data);
            }
        } catch (error) {
            console.error('Failed to load rides:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (search: string) => {
        setFilters(prev => ({ ...prev, search, page: 1 }));
    };

    const handleSort = (sortBy: string) => {
        const typedSortBy = sortBy as 'departureTime' | 'clients' | 'departure' | 'destination' | 'driver' | 'price' | 'status';
        setFilters(prev => {
            const currentSortBy = prev.sortBy || 'departureTime';
            const currentSortOrder = prev.sortOrder || 'desc';
            const newSortOrder = (currentSortBy === typedSortBy && currentSortOrder === 'asc') ? 'desc' : 'asc' as 'asc' | 'desc';
            const newFilters: RideFilters = {
                ...prev,
                sortBy: typedSortBy,
                sortOrder: newSortOrder
            };
            setSortRules([{ column: typedSortBy, direction: newSortOrder }]);
            return newFilters;
        });
    };

    const handleApplyAdvancedSort = (rules: Array<{ column: 'departureTime' | 'clients' | 'departure' | 'destination' | 'driver' | 'price' | 'status'; direction: 'asc' | 'desc' }>) => {
        setSortRules(rules);
        setIsAdvancedSortModalOpen(false);
        if (rules.length > 0) {
            const firstRule = rules[0];
            setFilters(prev => ({
                ...prev,
                sortBy: firstRule.column,
                sortOrder: firstRule.direction,
                page: 1
            }));
        }
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handleExportCSV = async () => {
        try {
            const csv = await exportRidesToCSV(filters);
            if (!csv.success) {
                console.error('Failed to export CSV:', csv.error);
                setFeedback({ tone: 'error', message: csv.error || t('ridesManagement.exportFailed', 'Failed to export CSV') });
            } else {
                const blob = new Blob([csv.data], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `rides-export-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                setFeedback({ tone: 'success', message: t('ridesManagement.exportSuccess', 'CSV exported successfully') });
            }
        } catch (error) {
            console.error('Failed to export CSV:', error);
            setFeedback({ tone: 'error', message: t('ridesManagement.exportFailed', 'Failed to export CSV') });
        }
    };

    const handleEditRide = async (ride: RideWithRelations, updates: any) => {
        try {
            await updateRideDetails(ride.id, updates);
            setEditModal({ open: false, ride: null });
            loadRides();
            setFeedback({ tone: 'success', message: t('ridesManagement.updateSuccess', 'Ride updated successfully') });
        } catch (error) {
            console.error('Failed to update ride:', error);
            setFeedback({ tone: 'error', message: t('ridesManagement.updateFailed', 'Failed to update ride') });
        }
    };

    const handleAssignDriver = async (rideId: number, driverId: string) => {
        try {
            await assignDriverToRide(rideId, driverId);
            setAssignModal({ open: false, ride: null });
            loadRides();
            setFeedback({ tone: 'success', message: t('ridesManagement.assignSuccess', 'Driver assigned successfully') });
        } catch (error) {
            console.error('Failed to assign driver:', error);
            setFeedback({ tone: 'error', message: t('ridesManagement.assignFailed', 'Failed to assign driver') });
        }
    };

    const handleCancelRide = async (rideId: number) => {
        try {
            await cancelRide(rideId);
            loadRides();
            setFeedback({ tone: 'success', message: t('ridesManagement.cancelSuccess', 'Ride cancelled successfully') });
        } catch (error) {
            console.error('Failed to cancel ride:', error);
            setFeedback({ tone: 'error', message: t('ridesManagement.cancelFailed', 'Failed to cancel ride') });
        }
    };

    const handleDeleteRide = async (rideId: number) => {
        try {
            await deleteRide(rideId);
            setDeleteModal({ open: false, rideId: null });
            loadRides();
            setFeedback({ tone: 'success', message: t('ridesManagement.deleteSuccess', 'Ride deleted successfully') });
        } catch (error) {
            console.error('Failed to delete ride:', error);
            setFeedback({ tone: 'error', message: t('ridesManagement.deleteFailed', 'Failed to delete ride') });
        }
    };

    const handleCreateRide = async () => {
        loadRides();
    };

    const getStatusColor = (status: RideStatus) => {
        switch (status) {
            case 'pending':
                return styles.statusPending;
            case 'assigned':
                return styles.statusAssigned;
            case 'completed':
                return styles.statusCompleted;
            case 'cancelled':
                return styles.statusCancelled;
            default:
                return styles.statusDefault;
        }
    };

    if (loading && !data) {
        return (
            <AdminNavigationShell>
                <div className={styles.pageShell}>
                    <div className={styles.pageInner}>
                        <div className={styles.hero}>
                            <div className={styles.title}>{t('ridesManagement.loading')}</div>
                        </div>
                    </div>
                </div>
            </AdminNavigationShell>
        );
    }

    return (
        <AdminNavigationShell>
            <div className={styles.pageShell}>
                <div className={styles.pageInner}>
                    {feedback && (
                        <div className={styles.feedbackWrapper}>
                            <StatusBanner
                                tone={feedback.tone}
                                title={feedback.tone === 'error' ? t('common.error', 'Error') : t('common.status', 'Status')}
                                message={feedback.message}
                            />
                        </div>
                    )}
                    <section className={styles.hero}>
                        <div className={styles.heroTop}>
                            <div>
                                <p className={styles.eyebrow}>{t('adminDashboard.subtitle')}</p>
                                <h1 className={styles.title}>{t('ridesManagement.title')}</h1>
                                <p className={styles.subtitle}>{t('ridesManagement.subtitle')}</p>
                            </div>
                        </div>
                    </section>

                    <section className={styles.controlsCard}>
                        <div className={styles.controlsStack}>
                            <div className={styles.searchRow}>
                                <Search className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder={t('ridesManagement.searchPlaceholder', 'Search by ID, departure, destination...')}
                                    className={styles.searchInput}
                                    value={filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>

                            <div className={styles.toolbarRow}>
                                <div className={styles.actionRow}>
                                    {hasActiveColumnFilters && (
                                        <button
                                            onClick={clearAllColumnFilters}
                                            className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                                            title="Effacer tous les filtres"
                                        >
                                            <X className={styles.buttonIcon} />
                                            <span className={styles.actionLabelDesktop}>Effacer filtres</span>
                                            <span className="sm:hidden">Effacer</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            const defaultRules = [{ column: 'departureTime' as const, direction: 'desc' as const }];
                                            setSortRules(defaultRules);
                                            setFilters(prev => ({
                                                ...prev,
                                                sortBy: 'departureTime',
                                                sortOrder: 'desc',
                                                page: 1
                                            }));
                                        }}
                                        className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                                        title={t('ridesManagement.advancedSort.resetSort')}
                                    >
                                        <X className={styles.buttonIcon} />
                                        <span className={styles.actionLabelDesktop}>{t('ridesManagement.advancedSort.resetSort')}</span>
                                        <span className="sm:hidden">{t('ridesManagement.advancedSort.resetSort')}</span>
                                    </button>

                                    <button
                                        onClick={() => setIsAdvancedSortModalOpen(true)}
                                        className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                                        title={t('ridesManagement.advancedSort.title')}
                                    >
                                        <ArrowUpDown className={styles.buttonIcon} />
                                        <span className={styles.actionLabelDesktop}>{t('ridesManagement.advancedSort.title')}</span>
                                        <span className="sm:hidden">{t('common.sort') || 'Sort'}</span>
                                    </button>

                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className={styles.actionButton}
                                    >
                                        <Plus className={styles.buttonIcon} />
                                        <span className={styles.actionLabelDesktop}>{t('ridesManagement.addRide')}</span>
                                        <span className="sm:hidden">{t('common.create')}</span>
                                    </button>

                                    <button
                                        onClick={handleExportCSV}
                                        className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                                    >
                                        <Download className={styles.buttonIcon} />
                                        <span className={styles.actionLabelDesktop}>{t('ridesManagement.exportCSV')}</span>
                                        <span className="sm:hidden">{t('ridesManagement.exportCSV')}</span>
                                    </button>
                                </div>
                                <div className={styles.resultsLine}>
                                    {t('ridesManagement.showing', 'Showing')} {sortedRides.length} {t('ridesManagement.of', 'of')} {data?.total || 0} {t('ridesManagement.rides', 'rides')}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={styles.tableCard}>
                        <div className={styles.tableHeaderSticky}>
                            <table className={styles.tableRoot}>
                                <thead className={styles.tableHead}>
                                    <tr>
                                        <th className={styles.tableHeadCell}>
                                            <ColumnFilter
                                                columnKey="departureTime"
                                                label={t('ridesManagement.dateHour')}
                                                options={getColumnOptions('departureTime')}
                                                selectedValues={columnFilters.departureTime}
                                                onFilterChange={handleColumnFilterChange}
                                                sortBy={filters.sortBy}
                                                sortOrder={filters.sortOrder}
                                                onSort={handleSort}
                                            />
                                        </th>
                                        <th className={styles.tableHeadCell}>
                                            <ColumnFilter
                                                columnKey="clients"
                                                label={t('ridesManagement.clients')}
                                                options={getColumnOptions('clients')}
                                                selectedValues={columnFilters.clients}
                                                onFilterChange={handleColumnFilterChange}
                                                sortBy={filters.sortBy}
                                                sortOrder={filters.sortOrder}
                                                onSort={handleSort}
                                            />
                                        </th>
                                        <th className={styles.tableHeadCell}>
                                            <ColumnFilter
                                                columnKey="departure"
                                                label={t('ridesManagement.departure')}
                                                options={getColumnOptions('departure')}
                                                selectedValues={columnFilters.departure}
                                                onFilterChange={handleColumnFilterChange}
                                                sortBy={filters.sortBy}
                                                sortOrder={filters.sortOrder}
                                                onSort={handleSort}
                                            />
                                        </th>
                                        <th className={styles.tableHeadCell}>
                                            <ColumnFilter
                                                columnKey="destination"
                                                label={t('ridesManagement.arrival')}
                                                options={getColumnOptions('destination')}
                                                selectedValues={columnFilters.destination}
                                                onFilterChange={handleColumnFilterChange}
                                                sortBy={filters.sortBy}
                                                sortOrder={filters.sortOrder}
                                                onSort={handleSort}
                                            />
                                        </th>
                                        <th className={styles.tableHeadCell}>
                                            <ColumnFilter
                                                columnKey="driver"
                                                label={t('ridesManagement.driver')}
                                                options={getColumnOptions('driver')}
                                                selectedValues={columnFilters.driver}
                                                onFilterChange={handleColumnFilterChange}
                                                sortBy={filters.sortBy}
                                                sortOrder={filters.sortOrder}
                                                onSort={handleSort}
                                            />
                                        </th>
                                        <th className={styles.tableHeadCell}>
                                            <ColumnFilter
                                                columnKey="price"
                                                label={t('ridesManagement.price')}
                                                options={getColumnOptions('price')}
                                                selectedValues={columnFilters.price}
                                                onFilterChange={handleColumnFilterChange}
                                                sortBy={filters.sortBy}
                                                sortOrder={filters.sortOrder}
                                                onSort={handleSort}
                                            />
                                        </th>
                                        <th className={styles.tableHeadCell}>
                                            <ColumnFilter
                                                columnKey="status"
                                                label={t('ridesManagement.status')}
                                                options={getColumnOptions('status')}
                                                selectedValues={columnFilters.status}
                                                onFilterChange={handleColumnFilterChange}
                                                sortBy={filters.sortBy}
                                                sortOrder={filters.sortOrder}
                                                onSort={handleSort}
                                            />
                                        </th>
                                        <th className={`${styles.tableHeadCell} ${styles.tableActionsHead}`}>
                                            {t('ridesManagement.actions')}
                                        </th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <div className={styles.tableScroll}>
                            <table className={styles.tableRoot}>
                                <tbody>
                                    {sortedRides.map((ride) => (
                                        <tr key={ride.id} className={styles.tableBodyRow}>
                                            <td className={styles.tableCell}>
                                                {new Date(ride.departureTime).toLocaleString('fr-FR')}
                                            </td>
                                            <td className={styles.tableCell}>
                                                {ride.customers.map(c => c.name).join(', ') || t('common.optional')}
                                            </td>
                                            <td className={styles.tableCell}>{ride.departure}</td>
                                            <td className={styles.tableCell}>{ride.destination}</td>
                                            <td className={`${styles.tableCell} ${!ride.driver ? styles.tableCellMuted : ''}`}>
                                                {ride.driver?.name || (
                                                    <span>{t('ridesManagement.unassigned')}</span>
                                                )}
                                            </td>
                                            <td className={`${styles.tableCell} ${styles.tablePrice}`}>€{ride.price}</td>
                                            <td className={styles.tableCell}>
                                                <span className={`${styles.statusBadge} ${getStatusColor(ride.status)}`}>
                                                    {ride.status}
                                                </span>
                                            </td>
                                            <td className={`${styles.tableCell} ${styles.tableActionsCell}`}>
                                                <div className={styles.tableActionsGroup}>
                                                    <button
                                                        onClick={() => setEditModal({ open: true, ride })}
                                                        className={styles.tableActionButton}
                                                        title="Edit"
                                                    >
                                                        <Edit className={styles.tableActionIcon} />
                                                    </button>
                                                    {!ride.driver && ride.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => setAssignModal({ open: true, ride })}
                                                            className={styles.tableActionButton}
                                                            title="Assign Driver"
                                                        >
                                                            <UserPlus className={styles.tableActionIcon} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setDeleteModal({ open: true, rideId: ride.id })}
                                                        className={styles.tableActionButton}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className={styles.tableActionIcon} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {data && data.totalPages > 1 && (
                            <div className={styles.paginationBar}>
                                <div className={styles.paginationMeta}>
                                    Page {data.page} of {data.totalPages}
                                </div>
                                <div className={styles.paginationControls}>
                                    <button
                                        onClick={() => handlePageChange(data.page - 1)}
                                        disabled={data.page === 1}
                                        className={styles.paginationButton}
                                    >
                                        <ChevronLeft className={styles.paginationIcon} />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(data.page + 1)}
                                        disabled={data.page === data.totalPages}
                                        className={styles.paginationButton}
                                    >
                                        <ChevronRight className={styles.paginationIcon} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    <AddRideModal
                        isOpen={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        onSuccess={handleCreateRide}
                    />

                    {editModal.open && editModal.ride && (
                        <EditRideModal
                            ride={editModal.ride}
                            onClose={() => setEditModal({ open: false, ride: null })}
                            onSave={handleEditRide}
                        />
                    )}

                    {assignModal.open && assignModal.ride && (
                        <AssignDriverModal
                            ride={assignModal.ride}
                            drivers={availableDrivers}
                            onClose={() => setAssignModal({ open: false, ride: null })}
                            onAssign={handleAssignDriver}
                        />
                    )}

                    {deleteModal.open && deleteModal.rideId && (
                        <DeleteConfirmModal
                            rideId={deleteModal.rideId}
                            onClose={() => setDeleteModal({ open: false, rideId: null })}
                            onConfirm={handleDeleteRide}
                        />
                    )}

                    {isAdvancedSortModalOpen && (
                        <AdvancedSortModal
                            isOpen={isAdvancedSortModalOpen}
                            onClose={() => setIsAdvancedSortModalOpen(false)}
                            currentSortRules={sortRules}
                            onApply={handleApplyAdvancedSort}
                        />
                    )}
                </div>
            </div>
        </AdminNavigationShell>
    );
}

