'use client'

import {useState, useEffect} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
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
import type {RideFilters, RidesManagementData} from "@/lib/services/RidesManagementService";
import {RideStatus, RideWithRelations} from "@/content/database_types/ride";
import {Search, Filter, Download, Edit, Trash2, UserPlus, ChevronLeft, ChevronRight, Plus, X, ArrowUpDown} from "lucide-react";
import {useTranslation} from "react-i18next";
import {useSessionWithRole} from "@/context/SessionContext";
import {redirect} from "next/navigation";
import {StatusBanner} from "@/components/classicComponents/StatusBanner";
import {EditRideModal} from "./EditRideModal";
import {AssignDriverModal} from "./AssignDriverModal";
import {DeleteConfirmModal} from "./DeleteConfirmModal";
import {AddRideModal} from "./AddRideModal";
import {ColumnFilter} from "./ColumnFilter";
import {AdvancedSortModal} from "./AdvancedSortModal";
import {AdminSidebar} from "@/components/admin/navigation/AdminSidebar";
import styles from './RidesManagementBoard.module.css';

/**
 * RidesManagementBoard Component
 * Main admin interface for managing all platform rides
 * Features:
 * - Excel-like table view with sorting and filtering
 * - Search functionality across ride details
 * - CRUD operations (Create, Read, Update, Delete)
 * - Driver assignment for unassigned rides
 * - CSV export of filtered ride data
 * - Pagination for large datasets
 */
export function RidesManagementBoard() {
    const {t} = useTranslation();
    const {session} = useSessionWithRole();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentReturnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    // Main data state - stores fetched rides and pagination info
    const [data, setData] = useState<RidesManagementData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAdvancedSortModalOpen, setIsAdvancedSortModalOpen] = useState(false);
    const [feedback, setFeedback] = useState<{ tone: 'info' | 'warning' | 'error' | 'success'; message: string } | null>(null);

    // Advanced sort state - multi-column sorting with priority
    type SortRule = { column: 'departureTime' | 'clients' | 'departure' | 'destination' | 'driver' | 'price' | 'status'; direction: 'asc' | 'desc' };
    const [sortRules, setSortRules] = useState<SortRule[]>([
        { column: 'departureTime', direction: 'desc' }
    ]);

    // Filter state - controls search, sorting, pagination, and status filtering
    const [filters, setFilters] = useState<RideFilters>({
        search: '',
        status: 'all',
        sortBy: 'departureTime',
        sortOrder: 'desc',
        page: 1,
        limit: 50
    });

    // Column-specific filters (Excel-like multi-select filters)
    const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({
        departureTime: [],
        clients: [],
        departure: [],
        destination: [],
        driver: [],
        price: [],
        status: []
    });

    // Extract unique values for column filters
    const getColumnOptions = (columnKey: string, rides: RideWithRelations[] = []): { value: string; label: string; count: number }[] => {
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
                    const price = ride.price || '0';
                    priceCounts[price] = (priceCounts[price] || 0) + 1;
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

    // Handle column filter change
    const handleColumnFilterChange = (column: string, values: string[]) => {
        setColumnFilters(prev => ({
            ...prev,
            [column]: values
        }));
        
        // Synchronize status column filter with server-side filter
        if (column === 'status') {
            const statusValues = values.length > 0 ? values as RideStatus[] : 'all';
            setFilters(prev => ({...prev, status: statusValues, page: 1}));
        }
    };

    // Clear all column filters
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
        // Also reset server-side status filter
        setFilters(prev => ({...prev, status: 'all', page: 1}));
    };

    // Use server-filtered rides directly
    // Column filters are now applied on the server side
    const filteredRides = data?.rides || [];
    
    // Check if any column filter is active
    const hasActiveColumnFilters = Object.values(columnFilters).some(values => values.length > 0);

    // Apply multi-column sorting with priority
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
            
            // If columns are different, return the comparison with direction
            if (comparison !== 0) {
                return rule.direction === 'asc' ? comparison : -comparison;
            }
            // If equal, continue to next rule
        }
        return 0;
    });

    // Security check - redirect non-admin users to home page
    const { isAdmin } = useSessionWithRole();
    if (!isAdmin) {
        redirect('/');
    }

    const [editModal, setEditModal] = useState<{open: boolean; ride: RideWithRelations | null}>({
        open: false,
        ride: null // Stores the ride being edited
    });
    const [assignModal, setAssignModal] = useState<{open: boolean; ride: RideWithRelations | null}>({
        open: false,
        ride: null // Stores the ride receiving driver assignment
    });
    const [deleteModal, setDeleteModal] = useState<{open: boolean; rideId: string | null}>({
        open: false,
        rideId: null // Stores the ID of ride to be deleted
    });

    // Dropdown data - lists of drivers and customers for form selections
    const [availableDrivers, setAvailableDrivers] = useState<Array<{id: string; name: string; email: string}>>([]);
    const [availableCustomers, setAvailableCustomers] = useState<Array<{id: string; name: string; email: string}>>([]);

    /**
     * Effect: Reload rides whenever filter criteria changes
     * Triggers on search, status filter, sort order, or pagination changes
     */
    useEffect(() => {
        loadRides();
    }, [filters]);

    /**
     * Effect: Load available drivers and customers on component mount
     * These lists populate the dropdowns in Add/Edit/Assign modals
     */
    const fetchAvailableDriversAndCustomers = async () => {
        try {
            const driversResponse = await fetchAvailableDrivers();
            if (driversResponse.success) {
                setAvailableDrivers(driversResponse.data);
            } else {
                console.error('Failed to fetch drivers:', driversResponse.error);
            }

            const customersResponse = await fetchAllCustomers();
            if (customersResponse.success) {
                setAvailableCustomers(customersResponse.data);
            } else {
                console.error('Failed to fetch customers:', customersResponse.error);
            }
        } catch (error) {
            console.error('Error fetching drivers or customers:', error);
        }
    };

    useEffect(() => {
        fetchAvailableDriversAndCustomers();
    }, []);

    /**
     * Loads rides from the database with current filter settings
     * Sets loading state during fetch and handles errors gracefully
     */
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

    /**
     * Updates search filter and resets to page 1
     * Searches across ride ID, departure, destination, and customer names
     */
    const handleSearch = (search: string) => {
        setFilters(prev => ({...prev, search, page: 1}));
    };

    /**
     * Handles column header clicks to sort the table
     * Toggles between ascending and descending order for the same column
     * Clicking a new column defaults to ascending order
     */
    const handleSort = (sortBy: string) => {
        // Update single column sort for server-side filtering
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
            
            // Also update advanced sort rules to sync with simple sort
            setSortRules([{ column: typedSortBy, direction: newSortOrder }]);
            
            return newFilters;
        });
    };

    /**
     * Applies advanced multi-column sorting with priority
     * First rule has highest priority, then second, etc.
     */
    const handleApplyAdvancedSort = (rules: Array<{column: 'departureTime' | 'clients' | 'departure' | 'destination' | 'driver' | 'price' | 'status'; direction: 'asc' | 'desc'}>) => {
        setSortRules(rules);
        setIsAdvancedSortModalOpen(false);
        
        // If there are rules, use the first one for server-side sorting
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

    /**
     * Changes the current page in pagination
     * Used by previous/next page buttons
     */
    const handlePageChange = (page: number) => {
        setFilters(prev => ({...prev, page}));
    };

    /**
     * Exports currently filtered rides to CSV file
     * Creates a downloadable file with date in filename
     * Uses Blob API to trigger browser download
     */
    const handleExportCSV = async () => {
        try {
            const csv = await exportRidesToCSV(filters);
            if (!csv.success) {
                console.error('Failed to export CSV:', csv.error);
                setFeedback({ tone: 'error', message: csv.error || t('ridesManagement.exportFailed', 'Failed to export CSV') });
            } else {
                const blob = new Blob([csv.data], {type: 'text/csv'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `rides-export-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url); // Clean up memory
                setFeedback({ tone: 'success', message: t('ridesManagement.exportSuccess', 'CSV exported successfully') });
            }
        } catch (error) {
            console.error('Failed to export CSV:', error);
            setFeedback({ tone: 'error', message: t('ridesManagement.exportFailed', 'Failed to export CSV') });
        }
    };

    /**
     * Updates ride details with new information from edit modal
     * Closes modal on success and refreshes the ride list
     */
    const handleEditRide = async (ride: RideWithRelations, updates: any) => {
        try {
            await updateRideDetails(ride.id, updates);
            setEditModal({open: false, ride: null});
            loadRides();
            setFeedback({ tone: 'success', message: t('ridesManagement.updateSuccess', 'Ride updated successfully') });
        } catch (error) {
            console.error('Failed to update ride:', error);
            setFeedback({ tone: 'error', message: t('ridesManagement.updateFailed', 'Failed to update ride') });
        }
    };

    /**
     * Assigns a driver to an unassigned ride
     * Updates ride status to 'assigned' and refreshes the list
     */
    const handleAssignDriver = async (rideId: string, driverId: string) => {
        try {
            await assignDriverToRide(rideId, driverId);
            setAssignModal({open: false, ride: null});
            loadRides();
            setFeedback({ tone: 'success', message: t('ridesManagement.assignSuccess', 'Driver assigned successfully') });
        } catch (error) {
            console.error('Failed to assign driver:', error);
            setFeedback({ tone: 'error', message: t('ridesManagement.assignFailed', 'Failed to assign driver') });
        }
    };

    /**
     * Cancels a ride by updating its status
     * Used for rides that need to be cancelled but not deleted
     */
    const handleCancelRide = async (rideId: string) => {
        try {
            await cancelRide(rideId);
            loadRides();
            setFeedback({ tone: 'success', message: t('ridesManagement.cancelSuccess', 'Ride cancelled successfully') });
        } catch (error) {
            console.error('Failed to cancel ride:', error);
            setFeedback({ tone: 'error', message: t('ridesManagement.cancelFailed', 'Failed to cancel ride') });
        }
    };

    /**
     * Permanently deletes a ride from the database
     * Requires confirmation via DeleteConfirmModal
     * Refreshes list after successful deletion
     */
    const handleDeleteRide = async (rideId: string) => {
        try {
            await deleteRide(rideId);
            setDeleteModal({open: false, rideId: null});
            loadRides();
            setFeedback({ tone: 'success', message: t('ridesManagement.deleteSuccess', 'Ride deleted successfully') });
        } catch (error) {
            console.error('Failed to delete ride:', error);
            setFeedback({ tone: 'error', message: t('ridesManagement.deleteFailed', 'Failed to delete ride') });
        }
    };

    /**
     * Called after successful ride creation in AddRideModal
     * Simply reloads the ride list
     */
    const handleCreateRide = async () => {
        loadRides();
    };

    /**
     * Returns Tailwind CSS classes for status badge styling
     * Color codes:
     * - Pending: Yellow (awaiting assignment)
     * - Assigned: Blue (driver assigned, in progress)
     * - Completed: Green (ride finished)
     * - Cancelled: Red (ride cancelled)
     */
    const getStatusColor = (status: RideStatus) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'assigned':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Show loading state while initial data is being fetched
    if (loading && !data) {
        return (
            <div className={styles.pageShell}>
                <div className={styles.pageInner}>
                    <div className={styles.hero}>
                        <div className={styles.title}>{t('ridesManagement.loading')}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AdminSidebar>
            <div className={styles.pageShell}>
            <div className={styles.pageInner}>
                    {feedback && (
                        <StatusBanner
                            tone={feedback.tone}
                            title={feedback.tone === 'error' ? t('common.error', 'Error') : t('common.status', 'Status')}
                            message={feedback.message}
                        />
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
                                                    onClick={() => setEditModal({open: true, ride})}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {!ride.driver && ride.status !== 'cancelled' && (
                                                    <button
                                                        onClick={() => setAssignModal({open: true, ride})}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                        title="Assign Driver"
                                                    >
                                                        <UserPlus className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setDeleteModal({open: true, rideId: ride.id})}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
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
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(data.page + 1)}
                                    disabled={data.page === data.totalPages}
                                        className={styles.paginationButton}
                                >
                                    <ChevronRight className="w-4 h-4" />
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
                        onClose={() => setEditModal({open: false, ride: null})}
                        onSave={handleEditRide}
                    />
                )}

                {assignModal.open && assignModal.ride && (
                    <AssignDriverModal
                        ride={assignModal.ride}
                        drivers={availableDrivers}
                        onClose={() => setAssignModal({open: false, ride: null})}
                        onAssign={handleAssignDriver}
                    />
                )}

                {deleteModal.open && deleteModal.rideId && (
                    <DeleteConfirmModal
                        rideId={deleteModal.rideId}
                        onClose={() => setDeleteModal({open: false, rideId: null})}
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
        </AdminSidebar>
    );
}
