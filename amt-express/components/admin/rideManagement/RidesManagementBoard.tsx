'use client'

import {useState, useEffect} from "react";
import {
    fetchRidesForManagement,
    updateRideDetails,
    assignDriverToRide,
    cancelRide,
    deleteRide,
    fetchAvailableDrivers,
    exportRidesToCSV,
    createRide,
    fetchAllCustomers,
    RideFilters,
    RidesManagementData
} from "@/lib/actions/ridesManagementActions";
import {RideStatus, RideWithRelations} from "@/content/database_types/ride";
import {
    Search,
    Filter,
    Download,
    Edit,
    Trash2,
    UserPlus,
    ChevronLeft,
    ChevronRight,
    Plus
} from "lucide-react";
import {useTranslation} from "react-i18next";
import {useSessionWithRole} from "@/context/SessionContext";
import {redirect} from "next/navigation";
import {AddRideModal} from "./AddRideModal";
import {EditRideModal} from "./EditRideModal";
import {AssignDriverModal} from "./AssignDriverModal";
import {DeleteConfirmModal} from "./DeleteConfirmModal";

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
    
    // Main data state - stores fetched rides and pagination info
    const [data, setData] = useState<RidesManagementData | null>(null);
    const [loading, setLoading] = useState(true);
    
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

    // Modal visibility states - control which modal is currently open
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState<{ open: boolean; ride: RideWithRelations | null }>({
        open: false,
        ride: null // Stores the ride being edited
    });
    const [assignModal, setAssignModal] = useState<{ open: boolean; ride: RideWithRelations | null }>({
        open: false,
        ride: null // Stores the ride receiving driver assignment
    });
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; rideId: number | null }>({
        open: false,
        rideId: null // Stores the ID of ride to be deleted
    });
    
    // Dropdown data - lists of drivers and customers for form selections
    const [availableDrivers, setAvailableDrivers] = useState<Array<{ id: string; name: string; email: string }>>([]);
    const [availableCustomers, setAvailableCustomers] = useState<Array<{ id: string; name: string; email: string }>>([]);

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
    useEffect(() => {
        fetchAvailableDrivers().then(setAvailableDrivers);
        fetchAllCustomers().then(setAvailableCustomers);
    }, []);

    /**
     * Loads rides from the database with current filter settings
     * Sets loading state during fetch and handles errors gracefully
     */
    const loadRides = async () => {
        setLoading(true);
        try {
            const result = await fetchRidesForManagement(filters);
            setData(result);
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
            const blob = new Blob([csv], {type: 'text/csv'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rides-export-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url); // Clean up memory
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
     * Creates a new ride with provided data from AddRideModal
     * Handles multiple customers, optional driver assignment, and pricing
     * Refreshes ride list after successful creation
     */
    const handleCreateRide = async (data: {
        departureTime: Date;
        customerIds: string[];
        departure: string;
        destination: string;
        driverId?: string;
        price?: string;
        status?: RideStatus;
    }) => {
        try {
            await createRide(data);
            setAddModal(false);
            loadRides();
        } catch (error) {
            console.error('Failed to create ride:', error);
            alert('Failed to create ride');
        }
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
            <div className="w-full py-8 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center text-white">Loading rides...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-8 px-4 md:px-8">
            <div className="max-w-350 mx-auto space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                        {t('ridesManagement.title', 'Ride Management')}
                    </h1>
                    <p className="text-white/90 mt-2 drop-shadow-md">
                        {t('ridesManagement.subtitle', 'Excel-like view to manage all platform rides')}
                    </p>
                </div>

                {/* Filters and Actions Bar */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                            <input
                                type="text"
                                placeholder={t('ridesManagement.searchPlaceholder', 'Search by ID, departure, destination...')}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="text-gray-600 w-5 h-5"/>
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.status}
                                onChange={(e) => handleStatusFilter(e.target.value as RideStatus | 'all')}
                            >
                                <option value="all">{t('ridesManagement.allStatuses', 'All Statuses')}</option>
                                <option value="pending">{t('ridesManagement.pending', 'Pending')}</option>
                                <option value="assigned">{t('ridesManagement.assigned', 'Assigned')}</option>
                                <option value="completed">{t('ridesManagement.completed', 'Completed')}</option>
                                <option value="cancelled">{t('ridesManagement.cancelled', 'Cancelled')}</option>
                            </select>
                        </div>

                        {/* Add Ride Button */}
                        <button
                            onClick={() => setAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5"/>
                            {t('ridesManagement.addRide', 'Add Ride')}
                        </button>

                        {/* Export Button */}
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download className="w-5 h-5"/>
                            {t('ridesManagement.exportCSV', 'Export CSV')}
                        </button>
                    </div>

                    {/* Results count */}
                    <div className="text-sm text-gray-600">
                        {t('ridesManagement.showing', 'Showing')} {data?.rides.length || 0} {t('ridesManagement.of', 'of')} {data?.total || 0} {t('ridesManagement.rides', 'rides')}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort('departureTime')}>
                                    {t('ridesManagement.dateHour', 'Date & Hour')} {filters.sortBy === 'departureTime' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort('clients')}>
                                    {t('ridesManagement.clients', 'Clients')} {filters.sortBy === 'clients' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort('departure')}>
                                    {t('ridesManagement.departure', 'Departure')} {filters.sortBy === 'departure' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort('destination')}>
                                    {t('ridesManagement.arrival', 'Arrival')} {filters.sortBy === 'destination' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort('driver')}>
                                    {t('ridesManagement.driver', 'Driver')} {filters.sortBy === 'driver' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort('price')}>
                                    {t('ridesManagement.price', 'Price (€)')} {filters.sortBy === 'price' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort('status')}>
                                    {t('ridesManagement.status', 'Status')} {filters.sortBy === 'status' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    {t('ridesManagement.actions', 'Actions')}
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {data?.rides.map((ride) => (
                                <tr key={ride.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {new Date(ride.departureTime).toLocaleString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {ride.customers.map(c => c.name).join(', ') || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{ride.departure}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{ride.destination}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {ride.driver?.name || (
                                            <span className="text-gray-400 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">€{ride.price}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                                            {ride.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setEditModal({open: true, ride})}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4"/>
                                            </button>
                                            {!ride.driver && ride.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => setAssignModal({open: true, ride})}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                    title="Assign Driver"
                                                >
                                                    <UserPlus className="w-4 h-4"/>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setDeleteModal({open: true, rideId: ride.id})}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4"/>
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
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Page {data.page} of {data.totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(data.page - 1)}
                                    disabled={data.page === 1}
                                    className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4"/>
                                </button>
                                <button
                                    onClick={() => handlePageChange(data.page + 1)}
                                    disabled={data.page === data.totalPages}
                                    className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4"/>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modals */}
                {addModal && (
                    <AddRideModal
                        drivers={availableDrivers}
                        customers={availableCustomers}
                        onClose={() => setAddModal(false)}
                        onCreate={handleCreateRide}
                    />
                )}

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
    );
}
