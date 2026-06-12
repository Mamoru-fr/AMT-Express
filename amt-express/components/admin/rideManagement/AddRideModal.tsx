'use client'

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {X, MapPin, Clock, Users, DollarSign, FileText, Building, FolderOpen, CheckSquare, AlertTriangle} from "lucide-react";
import {useTranslation} from "react-i18next";
import {
    createRide,
    fetchAllCustomers,
    fetchAvailableDrivers,
    fetchAllProductions,
    fetchAllProjects
} from "@/lib/actions/ridesManagementActions";
import {RideStatus, OPTIONS} from "@/content/database_types/ride";
import {SearchableSelect} from "@/components/classicComponents/SearchableSelect";
import styles from "./AddRideModal.module.css";

type Props = {
    isOpen: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
    mode?: 'modal' | 'page';
    returnTo?: string;
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

export function AddRideModal({isOpen, onClose = () => {}, onSuccess, mode = 'modal', returnTo}: Props) {
    const {t} = useTranslation();
    const router = useRouter();
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
    const fallbackReturnTo = returnTo || '/admin/ride-management';

    const goBack = () => {
        if (mode === 'page') {
            router.replace(fallbackReturnTo);
            return;
        }

        onClose();
    };

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
                
                if (mode === 'page') {
                    router.replace(fallbackReturnTo);
                    return;
                }

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
            goBack();
        }
    };

    if (!isOpen) return null;

    const isPageMode = mode === 'page';

    return (
        <div className={isPageMode ? styles.pageShell : styles.modalOverlay}>
            <div className={isPageMode ? styles.pageContainer : styles.modalContainer}>
                {isPageMode ? (
                    <div className={styles.pageHeader}>
                        <div className={styles.pageHeaderText}>
                            <div className={styles.pageEyebrow}>Ride management</div>
                            <h1 className={styles.pageTitle}>
                                <CheckSquare className={styles.titleIcon} />
                                {t('rideManagement.addRide', 'Add New Ride')}
                            </h1>
                            <p className={styles.pageSubtitle}>
                                Fill the ride details below, then return to the previous screen automatically.
                            </p>
                        </div>

                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className={styles.pageBackButton}
                            type="button"
                        >
                            <X className={styles.closeIcon} />
                            <span>Back</span>
                        </button>
                    </div>
                ) : (
                    <div className={styles.modalHeader}>
                        <h2 className={styles.modalTitle}>
                            <CheckSquare className={styles.titleIcon} />
                            {t('rideManagement.addRide', 'Add New Ride')}
                        </h2>
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className={styles.modalCloseButton}
                            type="button"
                        >
                            <X className={styles.closeIcon} />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={isPageMode ? styles.pageContent : styles.modalContent}>
                    {error && (
                        <div className={styles.errorMessage}>
                            <AlertTriangle className={styles.alertIcon} />
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
                                    <MapPin className={styles.sectionTitleIcon} /> {t('rideManagement.location', 'Location')}
                                </div>
                                <div className={styles.formSectionGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <MapPin className={styles.formLabelIconGreen} />
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
                                            <MapPin className={styles.formLabelIconRed} />
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
                                    <Clock className={styles.sectionTitleIcon} /> {t('rideManagement.details', 'Ride Details')}
                                </div>
                                <div className={styles.formSectionGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <Clock className={styles.formLabelIconBlue} />
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
                                            <DollarSign className={styles.formLabelIconGreen} />
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
                                    <Users className={styles.sectionTitleIcon} /> {t('rideManagement.participants', 'Participants')}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        <Users className={styles.formLabelIconBlue} />
                                        {t('rideManagement.driver', 'Driver (Optional)')}
                                    </label>
                                    <SearchableSelect
                                        value={driverId}
                                        options={drivers.map(driver => ({
                                            id: driver.id,
                                            label: driver.name,
                                            description: driver.email,
                                        }))}
                                        onChange={(driver) => setDriverId(driver.id)}
                                        onClear={() => setDriverId('')}
                                        placeholder={t('rideManagement.selectDriver', 'Select a driver...')}
                                        searchPlaceholder="Search drivers..."
                                        emptyText="No matching driver"
                                        helperText="Type to search, then use Enter or click a result."
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        <Users className={styles.formLabelIconOrange} />
                                        {t('rideManagement.customers', 'Customers')}
                                        <span className={styles.formLabelRequired}>*</span>
                                    </label>
                                    <SearchableSelect
                                        multiple
                                        values={selectedCustomers}
                                        options={customers.map(customer => ({
                                            id: customer.id,
                                            label: customer.name,
                                            description: customer.email,
                                        }))}
                                        onChange={(selectedOptions) => setSelectedCustomers(selectedOptions.map(option => option.id))}
                                        onClear={() => setSelectedCustomers([])}
                                        placeholder="Type a customer name..."
                                        searchPlaceholder="Add another customer..."
                                        emptyText="No matching customer"
                                        helperText="Press Enter to add the first match, or click a suggestion."
                                    />
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
                                    <Building className={styles.sectionTitleIcon} /> {t('rideManagement.production', 'Production Info')}
                                </div>
                                <div className={styles.formSectionGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <Building className={styles.formLabelIconIndigo} />
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
                                            <FolderOpen className={styles.formLabelIconCyan} />
                                            {t('rideManagement.project', 'Project (Optional)')}
                                        </label>
                                            <SearchableSelect
                                                value={projectId}
                                                options={filteredProjects.map(project => ({
                                                    id: project.id,
                                                    label: project.name,
                                                    description: productions.find(production => production.id === project.productionId)?.name || undefined,
                                                }))}
                                                onChange={(project) => setProjectId(project.id)}
                                                onClear={() => setProjectId('')}
                                                placeholder={t('rideManagement.selectProject', 'Select a project...')}
                                                searchPlaceholder="Search projects..."
                                                emptyText={productionId ? 'No matching project' : 'Select a production first'}
                                                helperText={productionId ? 'Type to search, then use Enter or click a result.' : 'Select a production first'}
                                                disabled={!productionId}
                                            />
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
                                    <FileText className={styles.formLabelIconGray} />
                                    {t('rideManagement.notes', 'Customer Notes (Optional)')}
                                </label>
                                <textarea
                                    value={customerNotes}
                                    onChange={(e) => setCustomerNotes(e.target.value)}
                                    placeholder="Add any special instructions..."
                                    rows={3}
                                    className={`${styles.formInput} ${styles.notesTextarea}`}
                                />
                            </div>
                        </div>
                    )}
                </form>

                <div className={isPageMode ? styles.pageFooter : styles.modalFooter}>
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
