'use client'

import {useState, useEffect} from "react";
import {X, MapPin, Clock, Users, DollarSign, FileText, Building, FolderOpen, CheckSquare, AlertTriangle} from "lucide-react";
import {useTranslation} from "react-i18next";
import {createRide, fetchAllCustomers, fetchAvailableDrivers, fetchAllProductions, fetchAllProjects} from "@/lib/actions/ridesManagementActions";
import {RideStatus, OPTIONS, Option} from "@/content/database_types/ride";
import {SearchableSelect} from "@/components/classicComponents/SearchableSelect";
import styles from "./AddRideModal.module.css";

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
    productionId: string | null;
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
    const [customerQuery, setCustomerQuery] = useState('');
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

    const selectedProduction = productions.find(production => production.id === productionId) || null;

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

    const handleCustomerSelect = (customerId: string) => {
        setSelectedCustomers(prev =>
            prev.includes(customerId) ? prev : [...prev, customerId]
        );
        setCustomerQuery('');
    };

    const handleCustomerRemove = (customerId: string) => {
        setSelectedCustomers(prev => prev.filter(id => id !== customerId));
    };

    const selectedCustomerItems = selectedCustomers
        .map(customerId => customers.find(customer => customer.id === customerId))
        .filter((customer): customer is DropdownOption => Boolean(customer));

    const filteredCustomers = customers.filter(customer => {
        const alreadySelected = selectedCustomers.includes(customer.id);
        const query = customerQuery.trim().toLowerCase();

        if (alreadySelected) {
            return false;
        }

        if (!query) {
            return true;
        }

        return customer.name.toLowerCase().includes(query) || customer.email?.toLowerCase().includes(query);
    });

    const customerSuggestions = filteredCustomers.slice(0, 8);

    const handleCustomerQueryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            if (customerSuggestions.length === 1) {
                handleCustomerSelect(customerSuggestions[0].id);
                return;
            }

            const exactMatch = filteredCustomers.find(
                customer => customer.name.toLowerCase() === customerQuery.trim().toLowerCase()
            );

            if (exactMatch) {
                handleCustomerSelect(exactMatch.id);
                return;
            }

            if (customerSuggestions.length > 0) {
                handleCustomerSelect(customerSuggestions[0].id);
            }
        }

        if (e.key === 'Backspace' && !customerQuery && selectedCustomers.length > 0) {
            handleCustomerRemove(selectedCustomers[selectedCustomers.length - 1]);
        }
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
                setCustomerQuery('');
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
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        <CheckSquare className="w-5 h-5" />
                        {t('rideManagement.addRide', 'Add New Ride')}
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className={styles.modalCloseButton}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className={styles.modalContent}>
                    {error && (
                        <div className={styles.errorMessage}>
                            <AlertTriangle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {loadingData ? (
                        <div className={styles.loadingSpinner}>
                            <div className={styles.loadingDot}></div>
                        </div>
                    ) : (
                        <div className={styles.formSection}>
                            {/* Location Section */}
                            <div>
                                <div className={styles.sectionTitle}>
                                    <MapPin className="w-4 h-4 inline" /> {t('rideManagement.location', 'Location')}
                                </div>
                                <div className={styles.formSectionGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <MapPin className="w-4 h-4 text-green-600" />
                                            {t('rideManagement.departure', 'Departure')}
                                            <span className={styles.formLabelRequired}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={departure}
                                            onChange={(e) => setDeparture(e.target.value)}
                                            placeholder="E.g., 123 Main St, Paris"
                                            className={styles.formInput}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <MapPin className="w-4 h-4 text-red-600" />
                                            {t('rideManagement.destination', 'Destination')}
                                            <span className={styles.formLabelRequired}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={destination}
                                            onChange={(e) => setDestination(e.target.value)}
                                            placeholder="E.g., 456 Park Ave, Lyon"
                                            className={styles.formInput}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Time & Details Section */}
                            <div>
                                <div className={styles.sectionTitle}>
                                    <Clock className="w-4 h-4 inline" /> {t('rideManagement.details', 'Ride Details')}
                                </div>
                                <div className={styles.formSectionGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <Clock className="w-4 h-4 text-blue-600" />
                                            {t('rideManagement.departureTime', 'Departure Time')}
                                            <span className={styles.formLabelRequired}>*</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={departureTime}
                                            onChange={(e) => setDepartureTime(e.target.value)}
                                            className={styles.formInput}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
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
                                            className={styles.formInput}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Driver & Customers Section */}
                            <div>
                                <div className={styles.sectionTitle}>
                                    <Users className="w-4 h-4 inline" /> {t('rideManagement.participants', 'Participants')}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        <Users className="w-4 h-4 text-blue-600" />
                                        {t('rideManagement.driver', 'Driver (Optional)')}
                                    </label>
                                    <select
                                        value={driverId}
                                        onChange={(e) => setDriverId(e.target.value)}
                                        className={styles.formSelect}
                                    >
                                        <option value="">{t('rideManagement.selectDriver', 'Select a driver...')}</option>
                                        {drivers.map(driver => (
                                            <option key={driver.id} value={driver.id}>
                                                {driver.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        <Users className="w-4 h-4 text-orange-600" />
                                        {t('rideManagement.customers', 'Customers')}
                                        <span className={styles.formLabelRequired}>*</span>
                                    </label>
                                    <div className={styles.tagDropdownWrap}>
                                        <div className={styles.tagInputShell}>
                                            {selectedCustomerItems.map(customer => (
                                                <button
                                                    key={customer.id}
                                                    type="button"
                                                    className={styles.customerTag}
                                                    onClick={() => handleCustomerRemove(customer.id)}
                                                    title={`Remove ${customer.name}`}
                                                >
                                                    <span>{customer.name}</span>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            ))}
                                            <input
                                                type="text"
                                                value={customerQuery}
                                                onChange={(e) => setCustomerQuery(e.target.value)}
                                                onKeyDown={handleCustomerQueryKeyDown}
                                                placeholder={selectedCustomers.length === 0 ? 'Type a customer name...' : 'Add another customer...'}
                                                className={styles.tagInput}
                                            />
                                        </div>
                                        <div className={styles.tagDropdown}>
                                            {customers.length === 0 ? (
                                                <p className={styles.tagDropdownEmpty}>No customers available</p>
                                            ) : customerSuggestions.length > 0 ? (
                                                customerSuggestions.map(customer => (
                                                    <button
                                                        key={customer.id}
                                                        type="button"
                                                        className={styles.tagDropdownItem}
                                                        onClick={() => handleCustomerSelect(customer.id)}
                                                    >
                                                        <span className={styles.tagDropdownName}>{customer.name}</span>
                                                        {customer.email && (
                                                            <span className={styles.tagDropdownMeta}>{customer.email}</span>
                                                        )}
                                                    </button>
                                                ))
                                            ) : (
                                                <p className={styles.tagDropdownEmpty}>No matching customer</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.tagHintRow}>
                                        <p className={styles.tagHintText}>
                                            Press Enter to add the first match, or click a suggestion.
                                        </p>
                                        <p className={styles.tagHintCount}>
                                            {selectedCustomers.length} selected
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Production & Project */}
                            <div>
                                <div className={styles.sectionTitle}>
                                    <Building className="w-4 h-4 inline" /> {t('rideManagement.production', 'Production Info')}
                                </div>
                                <div className={styles.formSectionGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <Building className="w-4 h-4 text-indigo-600" />
                                            {t('rideManagement.production', 'Production (Optional)')}
                                        </label>
                                        <SearchableSelect
                                            value={productionId}
                                            options={productions.map(production => ({
                                                id: production.id,
                                                label: production.name,
                                                description: 'Production',
                                            }))}
                                            onChange={(production) => {
                                                setProductionId(production.id);
                                                setProjectId('');
                                            }}
                                            onClear={() => {
                                                setProductionId('');
                                                setProjectId('');
                                            }}
                                            placeholder="Type a production name..."
                                            searchPlaceholder="Search to replace production..."
                                            emptyText="No matching production"
                                            helperText="Type to search, then use Enter or click a result."
                                        />
                                        <div className={styles.tagHintRow}>
                                            <p className={styles.tagHintText}>
                                                {selectedProduction ? selectedProduction.name : 'No production selected'}
                                            </p>
                                            <p className={styles.tagHintCount}>
                                                {productionId ? '1 selected' : '0 selected'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <FolderOpen className="w-4 h-4 text-cyan-600" />
                                            {t('rideManagement.project', 'Project (Optional)')}
                                        </label>
                                        <select
                                            value={projectId}
                                            onChange={(e) => setProjectId(e.target.value)}
                                            className={styles.formSelect}
                                            disabled={!productionId}
                                        >
                                            <option value="">{t('rideManagement.selectProject', 'Select a project...')}</option>
                                            {filteredProjects.map(project => (
                                                <option key={project.id} value={project.id}>
                                                    {project.name}
                                                </option>
                                            ))}
                                        </select>
                                        {!productionId && (
                                            <p style={{fontSize: '0.75rem', color: 'var(--app-muted-color)', margin: '0.25rem 0 0 0'}}>
                                                Select a production first
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>
                                    <FileText className="w-4 h-4 text-gray-600" />
                                    {t('rideManagement.notes', 'Customer Notes (Optional)')}
                                </label>
                                <textarea
                                    value={customerNotes}
                                    onChange={(e) => setCustomerNotes(e.target.value)}
                                    placeholder="Add any special instructions..."
                                    rows={3}
                                    className={styles.formInput}
                                    style={{fontFamily: 'inherit', resize: 'none'}}
                                />
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className={styles.modalFooter}>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className={styles.buttonCancel}
                    >
                        {t('common.cancel', 'Cancel')}
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading || loadingData}
                        className={styles.buttonCreate}
                    >
                        {loading ? (
                            <>
                                {t('common.creating', 'Creating...')}
                            </>
                        ) : (
                            <>
                                {t('rideManagement.createRide', 'Create Ride')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
