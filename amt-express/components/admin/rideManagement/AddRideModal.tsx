'use client'

import {useState} from "react";
import {RideStatus} from "@/content/database_types/ride";
import {X, LayoutGrid, Table as TableIcon, Plus, Trash2, ChevronDown} from "lucide-react";
import {createRide} from "@/lib/actions/ridesManagementActions";

/**
 * Props for the AddRideModal component
 * @property {Array} drivers - List of available drivers that can be assigned to the ride
 * @property {Array} customers - List of customers that can be selected for the ride
 * @property {Function} onClose - Callback function to close the modal
 * @property {Function} onCreate - Callback function to create a new ride with the form data (deprecated for table view)
 */
type AddRideModalProps = {
    drivers: Array<{ id: string; name: string; email: string }>;
    customers: Array<{ id: string; name: string; email: string }>;
    onClose: () => void;
    onCreate: (data: any) => void;
};

/**
 * Type for a single ride entry in table view
 */
type RideEntry = {
    id: string;
    departureTime: string;
    customerIds: string[];
    departure: string;
    destination: string;
    driverId: string;
    price: string;
    status: RideStatus;
};

/**
 * AddRideModal Component
 * Modal form for creating rides with two view modes:
 * - Form View: Traditional form for creating a single ride at a time
 * - Table View: Excel-like inline editing for batch ride creation (desktop only)
 */
export function AddRideModal({drivers, customers, onClose, onCreate}: AddRideModalProps) {
    // View toggle: 'form' for traditional form, 'table' for Excel-like view
    const [viewMode, setViewMode] = useState<'form' | 'table'>('form');
    
    // Form state management - stores all ride details for Form View
    const [formData, setFormData] = useState({
        departureTime: '',
        customerIds: [] as string[],
        departure: '',
        destination: '',
        driverId: '',
        price: '',
        status: 'pending' as RideStatus
    });

    // Table view state - stores multiple ride entries
    const [rideEntries, setRideEntries] = useState<RideEntry[]>([
        {
            id: crypto.randomUUID(),
            departureTime: '',
            customerIds: [],
            departure: '',
            destination: '',
            driverId: '',
            price: '',
            status: 'pending'
        }
    ]);

    // Track which customer dropdown is open in table view (stores row ID)
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    
    // Track which driver dropdown is open in table view (stores row ID)
    const [openDriverDropdown, setOpenDriverDropdown] = useState<string | null>(null);
    
    // Track which customer dropdown is open in form view
    const [openFormDropdown, setOpenFormDropdown] = useState(false);
    
    // Track which driver dropdown is open in form view
    const [openFormDriverDropdown, setOpenFormDriverDropdown] = useState(false);
    
    // Search states for form view
    const [clientSearch, setClientSearch] = useState('');
    const [driverSearch, setDriverSearch] = useState('');
    const [highlightedClientIndex, setHighlightedClientIndex] = useState(0);
    const [highlightedDriverIndex, setHighlightedDriverIndex] = useState(0);
    
    // Search states for table view
    const [tableClientSearch, setTableClientSearch] = useState<{[key: string]: string}>({});
    const [tableDriverSearch, setTableDriverSearch] = useState<{[key: string]: string}>({});
    const [tableHighlightedClient, setTableHighlightedClient] = useState<{[key: string]: number}>({});
    const [tableHighlightedDriver, setTableHighlightedDriver] = useState<{[key: string]: number}>({});

    /**
     * Handles form submission in Form View
     * Prevents default form behavior and transforms form data before sending to onCreate callback
     * Converts departureTime string to Date object and handles optional fields (driver, price)
     */
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

    /**
     * Handles table view submission
     * Creates all valid rides in the table at once
     * Filters out incomplete rows and validates required fields before submission
     */
    const handleTableSubmit = async () => {
        // Filter out rows that don't have all required fields
        const validEntries = rideEntries.filter(entry => 
            entry.departureTime && 
            entry.customerIds.length > 0 && 
            entry.departure && 
            entry.destination
        );

        if (validEntries.length === 0) {
            alert('Please fill in at least one complete ride with all required fields (Date, Clients, Departure, Arrival)');
            return;
        }

        try {
            // Create all rides in sequence
            for (const entry of validEntries) {
                await createRide({
                    departureTime: new Date(entry.departureTime),
                    customerIds: entry.customerIds,
                    departure: entry.departure,
                    destination: entry.destination,
                    driverId: entry.driverId || undefined,
                    price: entry.price || undefined,
                    status: entry.status
                });
            }
            
            // Close modal and reload page after all rides are created
            onClose();
            window.location.reload();
        } catch (error) {
            console.error('Failed to create rides:', error);
            alert('Failed to create one or more rides. Please try again.');
        }
    };

    /**
     * Toggles customer selection in the multi-select list (Form View)
     * Adds customer ID if not selected, removes if already selected
     * @param {string} customerId - The ID of the customer to toggle
     */
    const handleCustomerToggle = (customerId: string) => {
        setFormData(prev => ({
            ...prev,
            customerIds: prev.customerIds.includes(customerId)
                ? prev.customerIds.filter(id => id !== customerId)
                : [...prev.customerIds, customerId]
        }));
    };

    /**
     * Adds a new empty row in Table View
     * Creates a new ride entry with default values
     */
    const addTableRow = () => {
        setRideEntries([...rideEntries, {
            id: crypto.randomUUID(),
            departureTime: '',
            customerIds: [],
            departure: '',
            destination: '',
            driverId: '',
            price: '',
            status: 'pending'
        }]);
    };

    /**
     * Removes a row from Table View
     * Ensures at least one row remains in the table
     * @param {string} id - The ID of the row to remove
     */
    const removeTableRow = (id: string) => {
        if (rideEntries.length > 1) {
            setRideEntries(rideEntries.filter(entry => entry.id !== id));
        }
    };

    /**
     * Updates a specific field in a table row
     * @param {string} id - The row ID
     * @param {string} field - The field to update
     * @param {any} value - The new value
     */
    const updateTableEntry = (id: string, field: keyof RideEntry, value: any) => {
        setRideEntries(rideEntries.map(entry => 
            entry.id === id ? {...entry, [field]: value} : entry
        ));
    };

    /**
     * Toggles customer selection for a specific row in Table View
     * Manages multi-select customer checkboxes in table cells
     * @param {string} rowId - The row ID
     * @param {string} customerId - The customer ID to toggle
     */
    const handleTableCustomerToggle = (rowId: string, customerId: string) => {
        setRideEntries(rideEntries.map(entry => {
            if (entry.id === rowId) {
                const newCustomerIds = entry.customerIds.includes(customerId)
                    ? entry.customerIds.filter(id => id !== customerId)
                    : [...entry.customerIds, customerId];
                return {...entry, customerIds: newCustomerIds};
            }
            return entry;
        }));
    };
    
    /**
     * Filters customers based on search query
     */
    const getFilteredCustomers = (search: string) => {
        if (!search) return customers;
        const lower = search.toLowerCase();
        return customers.filter(c => 
            c.name.toLowerCase().includes(lower) || 
            c.email.toLowerCase().includes(lower)
        );
    };
    
    /**
     * Filters drivers based on search query
     */
    const getFilteredDrivers = (search: string) => {
        if (!search) return drivers;
        const lower = search.toLowerCase();
        return drivers.filter(d => 
            d.name.toLowerCase().includes(lower) || 
            d.email.toLowerCase().includes(lower)
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
            <div className={`bg-white rounded-lg shadow-xl w-full p-3 sm:p-4 md:p-6 my-4 sm:my-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto ${viewMode === 'table' ? 'max-w-full sm:max-w-7xl' : 'max-w-full sm:max-w-2xl'}`}>
                {/* Header with View Toggle */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Add New Ride</h3>
                    <div className="flex items-center gap-3">
                        {/* View Mode Toggle (Desktop Only) */}
                        <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setViewMode('form')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                                    viewMode === 'form' 
                                        ? 'bg-white text-blue-600 shadow-sm' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                Form
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                                    viewMode === 'table' 
                                        ? 'bg-white text-blue-600 shadow-sm' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <TableIcon className="w-4 h-4" />
                                Table
                            </button>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6"/>
                        </button>
                    </div>
                </div>

                {/* Form View */}
                {viewMode === 'form' && (
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
                        <div className="relative">
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white min-h-10.5">
                                <div className="flex flex-wrap gap-1 items-center">
                                    {formData.customerIds.map(customerId => {
                                        const customer = customers.find(c => c.id === customerId);
                                        return customer ? (
                                            <span 
                                                key={customerId}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-sm"
                                            >
                                                {customer.name}
                                                <X 
                                                    className="w-3 h-3 cursor-pointer hover:text-blue-900"
                                                    onClick={() => handleCustomerToggle(customerId)}
                                                />
                                            </span>
                                        ) : null;
                                    })}
                                    <input
                                        type="text"
                                        value={clientSearch}
                                        onChange={(e) => {
                                            setClientSearch(e.target.value);
                                            setOpenFormDropdown(true);
                                            setHighlightedClientIndex(0);
                                        }}
                                        onFocus={() => setOpenFormDropdown(true)}
                                        onKeyDown={(e) => {
                                            const filtered = getFilteredCustomers(clientSearch);
                                            if (e.key === 'ArrowDown') {
                                                e.preventDefault();
                                                setHighlightedClientIndex(prev => 
                                                    prev < filtered.length - 1 ? prev + 1 : prev
                                                );
                                            } else if (e.key === 'ArrowUp') {
                                                e.preventDefault();
                                                setHighlightedClientIndex(prev => prev > 0 ? prev - 1 : 0);
                                            } else if (e.key === 'Enter' && filtered.length > 0) {
                                                e.preventDefault();
                                                handleCustomerToggle(filtered[highlightedClientIndex].id);
                                                setClientSearch('');
                                            } else if (e.key === 'Escape') {
                                                setOpenFormDropdown(false);
                                                setClientSearch('');
                                            }
                                        }}
                                        placeholder={formData.customerIds.length === 0 ? "Search clients..." : ""}
                                        className="flex-1 min-w-30 outline-none text-sm"
                                    />
                                </div>
                            </div>
                            
                            {openFormDropdown && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-40" 
                                        onClick={() => {
                                            setOpenFormDropdown(false);
                                            setClientSearch('');
                                        }}
                                    />
                                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {(() => {
                                            const filtered = getFilteredCustomers(clientSearch);
                                            return filtered.length === 0 ? (
                                                <p className="px-3 py-2 text-sm text-gray-500">No customers found</p>
                                            ) : (
                                                <>
                                                    {filtered.map((customer, index) => (
                                                        <label 
                                                            key={customer.id} 
                                                            className={`flex items-center px-3 py-2 cursor-pointer ${
                                                                index === highlightedClientIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                            }`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCustomerToggle(customer.id);
                                                                setClientSearch('');
                                                            }}
                                                            onMouseEnter={() => setHighlightedClientIndex(index)}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.customerIds.includes(customer.id)}
                                                                onChange={() => handleCustomerToggle(customer.id)}
                                                                className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            <span className="text-sm">{customer.name} ({customer.email})</span>
                                                        </label>
                                                    ))}
                                                    <div className="border-t border-gray-200 p-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setOpenFormDropdown(false);
                                                                setClientSearch('');
                                                                alert('Add new client functionality - redirect to client creation page');
                                                            }}
                                                            className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center justify-center gap-1"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            Add New Client
                                                        </button>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </>
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
                        <div className="relative">
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white min-h-10.5">
                                <div className="flex items-center gap-2">
                                    {formData.driverId && (() => {
                                        const driver = drivers.find(d => d.id === formData.driverId);
                                        return driver ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-sm">
                                                {driver.name}
                                                <X 
                                                    className="w-3 h-3 cursor-pointer hover:text-green-900"
                                                    onClick={() => setFormData({...formData, driverId: ''})}
                                                />
                                            </span>
                                        ) : null;
                                    })()}
                                    {!formData.driverId && (
                                        <input
                                            type="text"
                                            value={driverSearch}
                                            onChange={(e) => {
                                                setDriverSearch(e.target.value);
                                                setOpenFormDriverDropdown(true);
                                                setHighlightedDriverIndex(0);
                                            }}
                                            onFocus={() => setOpenFormDriverDropdown(true)}
                                            onKeyDown={(e) => {
                                                const filtered = getFilteredDrivers(driverSearch);
                                                if (e.key === 'ArrowDown') {
                                                    e.preventDefault();
                                                    setHighlightedDriverIndex(prev => 
                                                        prev < filtered.length ? prev + 1 : prev
                                                    );
                                                } else if (e.key === 'ArrowUp') {
                                                    e.preventDefault();
                                                    setHighlightedDriverIndex(prev => prev > 0 ? prev - 1 : 0);
                                                } else if (e.key === 'Enter' && filtered.length > 0) {
                                                    e.preventDefault();
                                                    if (highlightedDriverIndex === 0) {
                                                        setFormData({...formData, driverId: ''});
                                                    } else {
                                                        setFormData({...formData, driverId: filtered[highlightedDriverIndex - 1].id});
                                                    }
                                                    setDriverSearch('');
                                                    setOpenFormDriverDropdown(false);
                                                } else if (e.key === 'Escape') {
                                                    setOpenFormDriverDropdown(false);
                                                    setDriverSearch('');
                                                }
                                            }}
                                            placeholder="Search driver..."
                                            className="flex-1 outline-none text-sm"
                                        />
                                    )}
                                </div>
                            </div>
                            
                            {openFormDriverDropdown && !formData.driverId && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-40" 
                                        onClick={() => {
                                            setOpenFormDriverDropdown(false);
                                            setDriverSearch('');
                                        }}
                                    />
                                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {(() => {
                                            const filtered = getFilteredDrivers(driverSearch);
                                            return (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({...formData, driverId: ''});
                                                            setOpenFormDriverDropdown(false);
                                                            setDriverSearch('');
                                                        }}
                                                        className={`w-full text-left px-3 py-2 text-sm text-gray-700 ${
                                                            highlightedDriverIndex === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                        }`}
                                                        onMouseEnter={() => setHighlightedDriverIndex(0)}
                                                    >
                                                        No driver assigned
                                                    </button>
                                                    {filtered.map((driver, index) => (
                                                        <button
                                                            key={driver.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({...formData, driverId: driver.id});
                                                                setOpenFormDriverDropdown(false);
                                                                setDriverSearch('');
                                                            }}
                                                            className={`w-full text-left px-3 py-2 text-sm ${
                                                                index + 1 === highlightedDriverIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                            }`}
                                                            onMouseEnter={() => setHighlightedDriverIndex(index + 1)}
                                                        >
                                                            {driver.name} ({driver.email})
                                                        </button>
                                                    ))}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </>
                            )}
                        </div>
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
                                className="w-full h-10.5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                )}

                {/* Table View (Desktop Only) */}
                {viewMode === 'table' && (
                <div className="space-y-4">
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm min-h-70">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700 w-40">Date & Time *</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700 w-48">Clients *</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700 w-40">Departure *</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700 w-40">Arrival *</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700 w-44">Driver</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700 w-24">Price (€)</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-700 w-32">Status</th>
                                    <th className="px-3 py-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="align-top">
                                {rideEntries.map((entry) => (
                                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        {/* Date & Time Input */}
                                        <td className="px-3 py-2">
                                            <input
                                                type="datetime-local"
                                                value={entry.departureTime}
                                                onChange={(e) => updateTableEntry(entry.id, 'departureTime', e.target.value)}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </td>

                                        {/* Clients Multi-Select Dropdown */}
                                        <td className="px-3 py-2">
                                            <div className="relative">
                                                <div className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus-within:ring-1 focus-within:ring-blue-500 bg-white min-h-7">
                                                    <div className="flex flex-wrap gap-1 items-center">
                                                        {entry.customerIds.slice(0, 2).map(customerId => {
                                                            const customer = customers.find(c => c.id === customerId);
                                                            return customer ? (
                                                                <span 
                                                                    key={customerId}
                                                                    className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                                                                >
                                                                    {customer.name.split(' ')[0]}
                                                                    <X 
                                                                        className="w-2.5 h-2.5 cursor-pointer hover:text-blue-900"
                                                                        onClick={() => handleTableCustomerToggle(entry.id, customerId)}
                                                                    />
                                                                </span>
                                                            ) : null;
                                                        })}
                                                        {entry.customerIds.length > 2 && (
                                                            <span className="text-xs text-gray-500">+{entry.customerIds.length - 2}</span>
                                                        )}
                                                        <input
                                                            type="text"
                                                            value={tableClientSearch[entry.id] || ''}
                                                            onChange={(e) => {
                                                                setTableClientSearch({...tableClientSearch, [entry.id]: e.target.value});
                                                                setOpenDropdown(entry.id);
                                                                setTableHighlightedClient({...tableHighlightedClient, [entry.id]: 0});
                                                            }}
                                                            onFocus={() => setOpenDropdown(entry.id)}
                                                            onKeyDown={(e) => {
                                                                const filtered = getFilteredCustomers(tableClientSearch[entry.id] || '');
                                                                const currentIndex = tableHighlightedClient[entry.id] || 0;
                                                                if (e.key === 'ArrowDown') {
                                                                    e.preventDefault();
                                                                    setTableHighlightedClient({
                                                                        ...tableHighlightedClient, 
                                                                        [entry.id]: currentIndex < filtered.length - 1 ? currentIndex + 1 : currentIndex
                                                                    });
                                                                } else if (e.key === 'ArrowUp') {
                                                                    e.preventDefault();
                                                                    setTableHighlightedClient({
                                                                        ...tableHighlightedClient,
                                                                        [entry.id]: currentIndex > 0 ? currentIndex - 1 : 0
                                                                    });
                                                                } else if (e.key === 'Enter' && filtered.length > 0) {
                                                                    e.preventDefault();
                                                                    handleTableCustomerToggle(entry.id, filtered[currentIndex].id);
                                                                    setTableClientSearch({...tableClientSearch, [entry.id]: ''});
                                                                } else if (e.key === 'Escape') {
                                                                    setOpenDropdown(null);
                                                                    setTableClientSearch({...tableClientSearch, [entry.id]: ''});
                                                                }
                                                            }}
                                                            placeholder={entry.customerIds.length === 0 ? "Search..." : ""}
                                                            className="flex-1 min-w-15 outline-none text-xs"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                {openDropdown === entry.id && (
                                                    <>
                                                        <div 
                                                            className="fixed inset-0 z-40" 
                                                            onClick={() => {
                                                                setOpenDropdown(null);
                                                                setTableClientSearch({...tableClientSearch, [entry.id]: ''});
                                                            }}
                                                        />
                                                        <div className="absolute left-0 bottom-full mb-1 z-50 w-64 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                            {(() => {
                                                                const filtered = getFilteredCustomers(tableClientSearch[entry.id] || '');
                                                                const currentIndex = tableHighlightedClient[entry.id] || 0;
                                                                return filtered.length === 0 ? (
                                                                    <p className="px-3 py-2 text-sm text-gray-500">No customers found</p>
                                                                ) : (
                                                                    <>
                                                                        {filtered.map((customer, index) => (
                                                                            <label 
                                                                                key={customer.id} 
                                                                                className={`flex items-center px-3 py-2 cursor-pointer ${
                                                                                    index === currentIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                                                }`}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleTableCustomerToggle(entry.id, customer.id);
                                                                                    setTableClientSearch({...tableClientSearch, [entry.id]: ''});
                                                                                }}
                                                                                onMouseEnter={() => setTableHighlightedClient({...tableHighlightedClient, [entry.id]: index})}
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={entry.customerIds.includes(customer.id)}
                                                                                    onChange={() => handleTableCustomerToggle(entry.id, customer.id)}
                                                                                    className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                />
                                                                                <span className="text-sm">{customer.name} ({customer.email})</span>
                                                                            </label>
                                                                        ))}
                                                                        <div className="border-t border-gray-200 p-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setOpenDropdown(null);
                                                                                    setTableClientSearch({...tableClientSearch, [entry.id]: ''});
                                                                                    alert('Add new client functionality - redirect to client creation page');
                                                                                }}
                                                                                className="w-full px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center justify-center gap-1"
                                                                            >
                                                                                <Plus className="w-3 h-3" />
                                                                                Add New Client
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>

                                        {/* Departure Input */}
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={entry.departure}
                                                onChange={(e) => updateTableEntry(entry.id, 'departure', e.target.value)}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="Location"
                                            />
                                        </td>

                                        {/* Arrival Input */}
                                        <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={entry.destination}
                                                onChange={(e) => updateTableEntry(entry.id, 'destination', e.target.value)}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="Location"
                                            />
                                        </td>

                                        {/* Driver Select Dropdown */}
                                        <td className="px-3 py-2 relative">
                                            <div className="relative">
                                                <div className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus-within:ring-1 focus-within:ring-blue-500 bg-white min-h-7">
                                                    <div className="flex items-center gap-1">
                                                        {entry.driverId && (() => {
                                                            const driver = drivers.find(d => d.id === entry.driverId);
                                                            return driver ? (
                                                                <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                                                    {driver.name.split(' ')[0]}
                                                                    <X 
                                                                        className="w-2.5 h-2.5 cursor-pointer hover:text-green-900"
                                                                        onClick={() => updateTableEntry(entry.id, 'driverId', '')}
                                                                    />
                                                                </span>
                                                            ) : null;
                                                        })()}
                                                        {!entry.driverId && (
                                                            <input
                                                                type="text"
                                                                value={tableDriverSearch[entry.id] || ''}
                                                                onChange={(e) => {
                                                                    setTableDriverSearch({...tableDriverSearch, [entry.id]: e.target.value});
                                                                    setOpenDriverDropdown(entry.id);
                                                                    setTableHighlightedDriver({...tableHighlightedDriver, [entry.id]: 0});
                                                                }}
                                                                onFocus={() => setOpenDriverDropdown(entry.id)}
                                                                onKeyDown={(e) => {
                                                                    const filtered = getFilteredDrivers(tableDriverSearch[entry.id] || '');
                                                                    const currentIndex = tableHighlightedDriver[entry.id] || 0;
                                                                    if (e.key === 'ArrowDown') {
                                                                        e.preventDefault();
                                                                        setTableHighlightedDriver({
                                                                            ...tableHighlightedDriver,
                                                                            [entry.id]: currentIndex < filtered.length ? currentIndex + 1 : currentIndex
                                                                        });
                                                                    } else if (e.key === 'ArrowUp') {
                                                                        e.preventDefault();
                                                                        setTableHighlightedDriver({
                                                                            ...tableHighlightedDriver,
                                                                            [entry.id]: currentIndex > 0 ? currentIndex - 1 : 0
                                                                        });
                                                                    } else if (e.key === 'Enter' && filtered.length >= 0) {
                                                                        e.preventDefault();
                                                                        if (currentIndex === 0) {
                                                                            updateTableEntry(entry.id, 'driverId', '');
                                                                        } else {
                                                                            updateTableEntry(entry.id, 'driverId', filtered[currentIndex - 1].id);
                                                                        }
                                                                        setTableDriverSearch({...tableDriverSearch, [entry.id]: ''});
                                                                        setOpenDriverDropdown(null);
                                                                    } else if (e.key === 'Escape') {
                                                                        setOpenDriverDropdown(null);
                                                                        setTableDriverSearch({...tableDriverSearch, [entry.id]: ''});
                                                                    }
                                                                }}
                                                                placeholder="Search..."
                                                                className="flex-1 outline-none text-xs"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {openDriverDropdown === entry.id && !entry.driverId && (
                                                    <>
                                                        <div 
                                                            className="fixed inset-0 z-40" 
                                                            onClick={() => {
                                                                setOpenDriverDropdown(null);
                                                                setTableDriverSearch({...tableDriverSearch, [entry.id]: ''});
                                                            }}
                                                        />
                                                        <div className="absolute left-0 bottom-full mb-1 z-50 w-64 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                            {(() => {
                                                                const filtered = getFilteredDrivers(tableDriverSearch[entry.id] || '');
                                                                const currentIndex = tableHighlightedDriver[entry.id] || 0;
                                                                return (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                updateTableEntry(entry.id, 'driverId', '');
                                                                                setOpenDriverDropdown(null);
                                                                                setTableDriverSearch({...tableDriverSearch, [entry.id]: ''});
                                                                            }}
                                                                            className={`w-full text-left px-3 py-2 text-sm text-gray-700 ${
                                                                                currentIndex === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                                            }`}
                                                                            onMouseEnter={() => setTableHighlightedDriver({...tableHighlightedDriver, [entry.id]: 0})}
                                                                        >
                                                                            None
                                                                        </button>
                                                                        {filtered.map((driver, index) => (
                                                                            <button
                                                                                key={driver.id}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    updateTableEntry(entry.id, 'driverId', driver.id);
                                                                                    setOpenDriverDropdown(null);
                                                                                    setTableDriverSearch({...tableDriverSearch, [entry.id]: ''});
                                                                                }}
                                                                                className={`w-full text-left px-3 py-2 text-sm ${
                                                                                    index + 1 === currentIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                                                }`}
                                                                                onMouseEnter={() => setTableHighlightedDriver({...tableHighlightedDriver, [entry.id]: index + 1})}
                                                                            >
                                                                                {driver.name} ({driver.email})
                                                                            </button>
                                                                        ))}
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>

                                        {/* Price Input */}
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={entry.price}
                                                onChange={(e) => updateTableEntry(entry.id, 'price', e.target.value)}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="0.00"
                                            />
                                        </td>

                                        {/* Status Select */}
                                        <td className="px-3 py-2">
                                            <select
                                                value={entry.status}
                                                onChange={(e) => updateTableEntry(entry.id, 'status', e.target.value as RideStatus)}
                                                className="w-full h-8 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="assigned">Assigned</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>

                                        {/* Delete Row Button */}
                                        <td className="px-3 py-2">
                                            {rideEntries.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTableRow(entry.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                    title="Delete row"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Add Row Button */}
                    <button
                        type="button"
                        onClick={addTableRow}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Row
                    </button>

                    {/* Table View Action Buttons */}
                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleTableSubmit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Create All Rides ({rideEntries.filter(e => e.departureTime && e.customerIds.length > 0 && e.departure && e.destination).length})
                        </button>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}
