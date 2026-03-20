'use client'

import {useState, useEffect} from "react";
import {X, MapPin, Clock, Users, DollarSign, FileText, Building, FolderOpen, CheckSquare} from "lucide-react";
import {useTranslation} from "react-i18next";
import {createRide, fetchAllCustomers, fetchAvailableDrivers, fetchAllProductions, fetchAllProjects} from "@/lib/actions/ridesManagementActions";
import {RideStatus, OPTIONS, Option} from "@/content/database_types/ride";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
};

type DropdownOption = {
    id: string;
    name: string;
    email?: string;
};

type ProductionOption = {
    id: string;
    name: string;
};

type ProjectOption = {
    id: string;
    name: string;
    productionId: string;
};

export function AddRideModal({isOpen, onClose, onSuccess}: Props) {
    const {t} = useTranslation();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    // Form data
    const [departure, setDeparture] = useState('');
    const [destination, setDestination] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [price, setPrice] = useState('');
    const [status, setStatus] = useState<RideStatus>('pending');
    const [driverId, setDriverId] = useState('');
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
    const [customerNotes, setCustomerNotes] = useState('');
    const [productionId, setProductionId] = useState('');
    const [projectId, setProjectId] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

    // Dropdown data
    const [customers, setCustomers] = useState<DropdownOption[]>([]);
    const [drivers, setDrivers] = useState<DropdownOption[]>([]);
    const [productions, setProductions] = useState<ProductionOption[]>([]);
    const [projects, setProjects] = useState<ProjectOption[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<ProjectOption[]>([]);

    // Error state
    const [error, setError] = useState('');

    // Load dropdown data
    useEffect(() => {
        if (isOpen) {
            loadDropdownData();
        }
    }, [isOpen]);

    // Filter projects based on selected production
    useEffect(() => {
        if (productionId) {
            setFilteredProjects(projects.filter(p => p.productionId === productionId));
            // Reset project if it doesn't belong to the selected production
            if (projectId && !projects.find(p => p.id === projectId && p.productionId === productionId)) {
                setProjectId('');
            }
        } else {
            setFilteredProjects(projects);
        }
    }, [productionId, projects, projectId]);

    const loadDropdownData = async () => {
        setLoadingData(true);
        try {
            const [customersRes, driversRes, productionsRes, projectsRes] = await Promise.all([
                fetchAllCustomers(),
                fetchAvailableDrivers(),
                fetchAllProductions(),
                fetchAllProjects()
            ]);

            if (customersRes.success && customersRes.data) {
                setCustomers(customersRes.data);
            }
            if (driversRes.success && driversRes.data) {
                setDrivers(driversRes.data);
            }
            if (productionsRes.success && productionsRes.data) {
                setProductions(productionsRes.data);
            }
            if (projectsRes.success && projectsRes.data) {
                setProjects(projectsRes.data);
            }
        } catch (err) {
            console.error('Error loading dropdown data:', err);
            setError('Failed to load form data');
        } finally {
            setLoadingData(false);
        }
    };

    const handleCustomerToggle = (customerId: string) => {
        setSelectedCustomers(prev =>
            prev.includes(customerId)
                ? prev.filter(id => id !== customerId)
                : [...prev, customerId]
        );
    };

    const handleOptionToggle = (option: Option) => {
        setSelectedOptions(prev =>
            prev.includes(option)
                ? prev.filter(opt => opt !== option)
                : [...prev, option]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!departure.trim()) {
            setError('Departure is required');
            return;
        }
        if (!destination.trim()) {
            setError('Destination is required');
            return;
        }
        if (!departureTime) {
            setError('Departure time is required');
            return;
        }
        if (selectedCustomers.length === 0) {
            setError('At least one customer is required');
            return;
        }

        const departureDate = new Date(departureTime);
        if (departureDate <= new Date()) {
            setError('Departure time must be in the future');
            return;
        }

        setLoading(true);

        try {
            const result = await createRide({
                departure: departure.trim(),
                destination: destination.trim(),
                departureTime: departureDate,
                price: price || '0',
                status,
                driverId: driverId || undefined,
                customerIds: selectedCustomers,
            });

            if (result.success) {
                // Reset form
                setDeparture('');
                setDestination('');
                setDepartureTime('');
                setPrice('');
                setStatus('pending');
                setDriverId('');
                setSelectedCustomers([]);
                setCustomerNotes('');
                setProductionId('');
                setProjectId('');
                setSelectedOptions([]);
                
                onSuccess?.();
                onClose();
            } else {
                setError(result.error || 'Failed to create ride');
            }
        } catch (err) {
            console.error('Error creating ride:', err);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg z-10">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {t('rideManagement.addRide', 'Add New Ride')}
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    {loadingData ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Location Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="w-4 h-4 text-green-600" />
                                        {t('rideManagement.departure', 'Departure')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={departure}
                                        onChange={(e) => setDeparture(e.target.value)}
                                        placeholder="E.g., 123 Main St, Paris"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="w-4 h-4 text-red-600" />
                                        {t('rideManagement.destination', 'Destination')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        placeholder="E.g., 456 Park Ave, Lyon"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Time and Price Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        {t('rideManagement.departureTime', 'Departure Time')} *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={departureTime}
                                        onChange={(e) => setDepartureTime(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        {t('rideManagement.price', 'Price (€)')}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <CheckSquare className="w-4 h-4 text-purple-600" />
                                        {t('rideManagement.status', 'Status')}
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as RideStatus)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="assigned">Assigned</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            {/* Driver Selection */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Users className="w-4 h-4 text-blue-600" />
                                    {t('rideManagement.driver', 'Driver')} (Optional)
                                </label>
                                <select
                                    value={driverId}
                                    onChange={(e) => setDriverId(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">{t('rideManagement.selectDriver', 'Select a driver')}</option>
                                    {drivers.map(driver => (
                                        <option key={driver.id} value={driver.id}>
                                            {driver.name} ({driver.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Customer Selection */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Users className="w-4 h-4 text-orange-600" />
                                    {t('rideManagement.customers', 'Customers')} *
                                </label>
                                <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                                    {customers.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No customers available</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {customers.map(customer => (
                                                <label
                                                    key={customer.id}
                                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCustomers.includes(customer.id)}
                                                        onChange={() => handleCustomerToggle(customer.id)}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">
                                                        {customer.name} <span className="text-gray-500">({customer.email})</span>
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {selectedCustomers.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {selectedCustomers.length} customer(s) selected
                                    </p>
                                )}
                            </div>

                            {/* Production & Project Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Building className="w-4 h-4 text-indigo-600" />
                                        {t('rideManagement.production', 'Production')} (Optional)
                                    </label>
                                    <select
                                        value={productionId}
                                        onChange={(e) => setProductionId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">{t('rideManagement.selectProduction', 'Select a production')}</option>
                                        {productions.map(production => (
                                            <option key={production.id} value={production.id}>
                                                {production.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <FolderOpen className="w-4 h-4 text-cyan-600" />
                                        {t('rideManagement.project', 'Project')} (Optional)
                                    </label>
                                    <select
                                        value={projectId}
                                        onChange={(e) => setProjectId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={!productionId}
                                    >
                                        <option value="">{t('rideManagement.selectProject', 'Select a project')}</option>
                                        {filteredProjects.map(project => (
                                            <option key={project.id} value={project.id}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                    {!productionId && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Select a production first
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Options Section */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <CheckSquare className="w-4 h-4 text-teal-600" />
                                    {t('rideManagement.options', 'Ride Options')} (Optional)
                                </label>
                                <div className="border border-gray-300 rounded-lg p-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {OPTIONS.map(option => (
                                            <label
                                                key={option}
                                                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOptions.includes(option)}
                                                    onChange={() => handleOptionToggle(option)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700 capitalize">
                                                    {option.replace('_', ' ')}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Notes */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <FileText className="w-4 h-4 text-gray-600" />
                                    {t('rideManagement.notes', 'Customer Notes')} (Optional)
                                </label>
                                <textarea
                                    value={customerNotes}
                                    onChange={(e) => setCustomerNotes(e.target.value)}
                                    placeholder="Add any special instructions or notes..."
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="flex gap-3 justify-end p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg sticky bottom-0">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 font-medium text-gray-700"
                    >
                        {t('common.cancel', 'Cancel')}
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading || loadingData}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                {t('common.creating', 'Creating...')}
                            </>
                        ) : (
                            t('rideManagement.createRide', 'Create Ride')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
