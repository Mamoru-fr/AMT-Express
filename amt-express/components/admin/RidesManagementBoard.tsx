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
    X,
    Plus
} from "lucide-react";
import {useTranslation} from "react-i18next";
import { useSessionWithRole } from "@/context/SessionContext";
import {redirect} from "next/navigation";

export function RidesManagementBoard() {
    const {t} = useTranslation();
    const { session } = useSessionWithRole();
    const [data, setData] = useState<RidesManagementData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<RideFilters>({
        search: '',
        status: 'all',
        sortBy: 'departureTime',
        sortOrder: 'desc',
        page: 1,
        limit: 50
    });

    if (!session || session.user.role !== 'admin') {
        redirect('/');
    }

    // Modal states
    const [addModal, setAddModal] = useState(false);
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

    // Fetch rides on filter change
    useEffect(() => {
        loadRides();
    }, [filters]);

    // Load available drivers and customers
    useEffect(() => {
        fetchAvailableDrivers().then(setAvailableDrivers);
        fetchAllCustomers().then(setAvailableCustomers);
    }, []);

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

    const handleSearch = (search: string) => {
        setFilters(prev => ({...prev, search, page: 1}));
    };

    const handleStatusFilter = (status: RideStatus | 'all') => {
        setFilters(prev => ({...prev, status, page: 1}));
    };

    const handleSort = (sortBy: 'departureTime' | 'clients' | 'departure' | 'destination' | 'driver' | 'price' | 'status') => {
        setFilters(prev => ({
            ...prev,
            sortBy,
            sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({...prev, page}));
    };

    const handleExportCSV = async () => {
        try {
            const csv = await exportRidesToCSV(filters);
            const blob = new Blob([csv], {type: 'text/csv'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rides-export-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export CSV:', error);
            alert('Failed to export CSV');
        }
    };

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

    const handleCancelRide = async (rideId: number) => {
        try {
            await cancelRide(rideId);
            loadRides();
        } catch (error) {
            console.error('Failed to cancel ride:', error);
            alert('Failed to cancel ride');
        }
    };

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
            <div className="max-w-350 mx-auto space-y-6">{/* Header */}
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
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
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

                {/* Add Ride Modal */}
                {addModal && (
                    <AddRideModal
                        drivers={availableDrivers}
                        customers={availableCustomers}
                        onClose={() => setAddModal(false)}
                        onCreate={handleCreateRide}
                    />
                )}

                {/* Edit Modal */}
                {editModal.open && editModal.ride && (
                    <EditRideModal
                        ride={editModal.ride}
                        onClose={() => setEditModal({open: false, ride: null})}
                        onSave={handleEditRide}
                    />
                )}

                {/* Assign Driver Modal */}
                {assignModal.open && assignModal.ride && (
                    <AssignDriverModal
                        ride={assignModal.ride}
                        drivers={availableDrivers}
                        onClose={() => setAssignModal({open: false, ride: null})}
                        onAssign={handleAssignDriver}
                    />
                )}

                {/* Delete Confirmation Modal */}
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

// Edit Ride Modal Component
function EditRideModal({ride, onClose, onSave}: {
    ride: RideWithRelations;
    onClose: () => void;
    onSave: (ride: RideWithRelations, updates: any) => void;
}) {
    const [formData, setFormData] = useState({
        departure: ride.departure,
        destination: ride.destination,
        departureTime: new Date(ride.departureTime).toISOString().slice(0, 16),
        price: ride.price,
        status: ride.status,
        customerNotes: ride.customerNotes || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(ride, {
            ...formData,
            departureTime: new Date(formData.departureTime)
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Edit Ride #{ride.id}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
                        <input
                            type="text"
                            value={formData.departure}
                            onChange={(e) => setFormData({...formData, departure: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                        <input
                            type="text"
                            value={formData.destination}
                            onChange={(e) => setFormData({...formData, destination: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                        <input
                            type="datetime-local"
                            value={formData.departureTime}
                            onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (€)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value as RideStatus})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="pending">Pending</option>
                            <option value="assigned">Assigned</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Notes</label>
                        <textarea
                            value={formData.customerNotes}
                            onChange={(e) => setFormData({...formData, customerNotes: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Assign Driver Modal Component
function AssignDriverModal({ride, drivers, onClose, onAssign}: {
    ride: RideWithRelations;
    drivers: Array<{ id: string; name: string; email: string }>;
    onClose: () => void;
    onAssign: (rideId: number, driverId: string) => void;
}) {
    const [selectedDriver, setSelectedDriver] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedDriver) {
            onAssign(ride.id, selectedDriver);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Assign Driver to Ride #{ride.id}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6"/>
                    </button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600"><strong>From:</strong> {ride.departure}</p>
                    <p className="text-sm text-gray-600"><strong>To:</strong> {ride.destination}</p>
                    <p className="text-sm text-gray-600">
                        <strong>Time:</strong> {new Date(ride.departureTime).toLocaleString('fr-FR')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Driver</label>
                        <select
                            value={selectedDriver}
                            onChange={(e) => setSelectedDriver(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">-- Choose a driver --</option>
                            {drivers.map(driver => (
                                <option key={driver.id} value={driver.id}>
                                    {driver.name} ({driver.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Assign Driver
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Delete Confirmation Modal Component
function DeleteConfirmModal({rideId, onClose, onConfirm}: {
    rideId: number;
    onClose: () => void;
    onConfirm: (rideId: number) => void;
}) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6"/>
                    </button>
                </div>

                <p className="text-gray-700 mb-6">
                    Are you sure you want to delete ride <strong>#{rideId}</strong>? This action cannot be undone.
                </p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(rideId)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Delete Ride
                    </button>
                </div>
            </div>
        </div>
    );
}

// Add Ride Modal Component
function AddRideModal({drivers, customers, onClose, onCreate}: {
    drivers: Array<{ id: string; name: string; email: string }>;
    customers: Array<{ id: string; name: string; email: string }>;
    onClose: () => void;
    onCreate: (data: any) => void;
}) {
    const [formData, setFormData] = useState({
        departureTime: '',
        customerIds: [] as string[],
        departure: '',
        destination: '',
        driverId: '',
        price: '',
        status: 'pending' as RideStatus
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({
            departureTime: new Date(formData.departureTime),
            customerIds: formData.customerIds,
            departure: formData.departure,
            destination: formData.destination,
            driverId: formData.driverId || undefined,
            price: formData.price || undefined,
            status: formData.status
        });
    };

    const handleCustomerToggle = (customerId: string) => {
        setFormData(prev => ({
            ...prev,
            customerIds: prev.customerIds.includes(customerId)
                ? prev.customerIds.filter(id => id !== customerId)
                : [...prev.customerIds, customerId]
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Add New Ride</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date & Hour <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.departureTime}
                            onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Clients <span className="text-red-500">*</span>
                        </label>
                        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                            {customers.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No customers available</p>
                            ) : (
                                customers.map(customer => (
                                    <label key={customer.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={formData.customerIds.includes(customer.id)}
                                            onChange={() => handleCustomerToggle(customer.id)}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{customer.name} ({customer.email})</span>
                                    </label>
                                ))
                            )}
                        </div>
                        {formData.customerIds.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">Please select at least one client</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Departure <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.departure}
                                onChange={(e) => setFormData({...formData, departure: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Paris Gare du Nord"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Arrival <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.destination}
                                onChange={(e) => setFormData({...formData, destination: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., CDG Airport"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Driver <span className="text-gray-500 text-xs">(Optional)</span>
                        </label>
                        <select
                            value={formData.driverId}
                            onChange={(e) => setFormData({...formData, driverId: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- No driver assigned --</option>
                            {drivers.map(driver => (
                                <option key={driver.id} value={driver.id}>
                                    {driver.name} ({driver.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (€) <span className="text-gray-500 text-xs">(Optional)</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value as RideStatus})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="assigned">Assigned</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={formData.customerIds.length === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create Ride
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
