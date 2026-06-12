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
import type {RideFilters, RidesManagementData} from "@/lib/actions/ridesManagementActions";
import {RideStatus, RideWithRelations} from "@/content/database_types/ride";
import {Search, Filter, Download, Edit, Trash2, UserPlus, ChevronLeft, ChevronRight, Plus} from "lucide-react";
import {useTranslation} from "react-i18next";
import {useSessionWithRole} from "@/context/SessionContext";
import {redirect} from "next/navigation";
import {EditRideModal} from "./EditRideModal";
import {AssignDriverModal} from "./AssignDriverModal";
import {DeleteConfirmModal} from "./DeleteConfirmModal";
import {AddRideModal} from "./AddRideModal";
import {AdminNavigationShell} from "@/components/admin/navigation/AdminNavigationShell";
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

    // Filter state - controls search, sorting, pagination, and status filtering
    const [filters, setFilters] = useState<RideFilters>({
        search: '',
        status: 'all',
        sortBy: 'departureTime',
        sortOrder: 'desc',
        page: 1,
        limit: 50
    });

    // Security check - redirect non-admin users to home page
    if (!session || session.user.role !== 'admin') {
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
    const [deleteModal, setDeleteModal] = useState<{open: boolean; rideId: number | null}>({
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
     * Filters rides by status (pending, assigned, completed, cancelled, or all)
     * Resets to page 1 when status filter changes
     */
    const handleStatusFilter = (status: RideStatus | 'all') => {
        setFilters(prev => ({...prev, status, page: 1}));
    };

    /**
     * Handles column header clicks to sort the table
     * Toggles between ascending and descending order for the same column
     * Clicking a new column defaults to ascending order
     */
    const handleSort = (sortBy: 'departureTime' | 'clients' | 'departure' | 'destination' | 'driver' | 'price' | 'status') => {
        setFilters(prev => ({
            ...prev,
            sortBy,
            sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
        }));
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
            } else {
                const blob = new Blob([csv.data], {type: 'text/csv'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `rides-export-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url); // Clean up memory
            }
        } catch (error) {
            console.error('Failed to export CSV:', error);
            alert('Failed to export CSV');
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
        } catch (error) {
            console.error('Failed to update ride:', error);
            alert('Failed to update ride');
        }
    };

    /**
     * Assigns a driver to an unassigned ride
     * Updates ride status to 'assigned' and refreshes the list
     */
    const handleAssignDriver = async (rideId: number, driverId: string) => {
        try {
            await assignDriverToRide(rideId, driverId);
            setAssignModal({open: false, ride: null});
            loadRides();
        } catch (error) {
            console.error('Failed to assign driver:', error);
            alert('Failed to assign driver');
        }
    };

    /**
     * Cancels a ride by updating its status
     * Used for rides that need to be cancelled but not deleted
     */
    const handleCancelRide = async (rideId: number) => {
        try {
            await cancelRide(rideId);
            loadRides();
        } catch (error) {
            console.error('Failed to cancel ride:', error);
            alert('Failed to cancel ride');
        }
    };

    /**
     * Permanently deletes a ride from the database
     * Requires confirmation via DeleteConfirmModal
     * Refreshes list after successful deletion
     */
    const handleDeleteRide = async (rideId: number) => {
        try {
            await deleteRide(rideId);
            setDeleteModal({open: false, rideId: null});
            loadRides();
        } catch (error) {
            console.error('Failed to delete ride:', error);
            alert('Failed to delete ride');
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
        <AdminNavigationShell>
            <div className={styles.pageShell}>
            <div className={styles.pageInner}>
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
                                <Filter className={styles.filterIcon} />
                                <select
                                    className={styles.selectInput}
                                    value={filters.status}
                                    onChange={(e) => handleStatusFilter(e.target.value as RideStatus | 'all')}
                                >
                                    <option value="all">{t('ridesManagement.allStatuses')}</option>
                                    <option value="pending">{t('ridesManagement.pending')}</option>
                                    <option value="assigned">{t('ridesManagement.assigned')}</option>
                                    <option value="completed">{t('ridesManagement.completed')}</option>
                                    <option value="cancelled">{t('ridesManagement.cancelled')}</option>
                                </select>

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
                                {t('ridesManagement.showing', 'Showing')} {data?.rides.length || 0} {t('ridesManagement.of', 'of')} {data?.total || 0} {t('ridesManagement.rides', 'rides')}
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.tableCard}>
                    <div className={styles.tableScroll}>
                        <table className={styles.tableRoot}>
                            <thead className={styles.tableHead}>
                                <tr>
                                    <th className={styles.tableHeadCell}
                                        onClick={() => handleSort('departureTime')}>
                                        {t('ridesManagement.dateHour')} {filters.sortBy === 'departureTime' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className={styles.tableHeadCell}
                                        onClick={() => handleSort('clients')}>
                                        {t('ridesManagement.clients')} {filters.sortBy === 'clients' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className={styles.tableHeadCell}
                                        onClick={() => handleSort('departure')}>
                                        {t('ridesManagement.departure')} {filters.sortBy === 'departure' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className={styles.tableHeadCell}
                                        onClick={() => handleSort('destination')}>
                                        {t('ridesManagement.arrival')} {filters.sortBy === 'destination' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className={styles.tableHeadCell}
                                        onClick={() => handleSort('driver')}>
                                        {t('ridesManagement.driver')} {filters.sortBy === 'driver' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className={styles.tableHeadCell}
                                        onClick={() => handleSort('price')}>
                                        {t('ridesManagement.price')} {filters.sortBy === 'price' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className={styles.tableHeadCell}
                                        onClick={() => handleSort('status')}>
                                        {t('ridesManagement.status')} {filters.sortBy === 'status' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className={`${styles.tableHeadCell} ${styles.tableActionsHead}`}>
                                        {t('ridesManagement.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.rides.map((ride) => (
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
            </div>
            </div>
        </AdminNavigationShell>
    );
}
