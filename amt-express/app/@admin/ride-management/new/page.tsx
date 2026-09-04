'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {AlertTriangle, Building, CheckSquare, Clock, DollarSign, FileText, FolderOpen, MapPin, Users, X} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useSessionWithRole} from '@/context/SessionContext';
import { Button } from '@/components/classicComponents/Button';
import {
    createRide,
    fetchAllCustomers,
    fetchAvailableDrivers,
    fetchAllProductions,
    fetchAllProjects
} from '@/lib/actions/ridesManagementActions';
import {RideStatus} from '@/content/database_types/ride';
import {SearchableSelect} from '@/components/classicComponents/SearchableSelect';
import {RoleSidebar} from '@/components/shared/RoleSidebar';
import styles from '@/components/admin/rideManagement/AddRideModal.module.css';

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

export default function NewRidePage() {
    const {t} = useTranslation();
    const { isAdmin, isAuthenticated } = useSessionWithRole();
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo') || '/ride-management';

    useEffect(() => {
        if (isAuthenticated && !isAdmin) router.replace('/');
    }, [isAuthenticated, isAdmin, router]);

    if (!isAdmin) return null;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');

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

    const [customers, setCustomers] = useState<DropdownOption[]>([]);
    const [drivers, setDrivers] = useState<DropdownOption[]>([]);
    const [productions, setProductions] = useState<ProductionOption[]>([]);
    const [projects, setProjects] = useState<ProjectOption[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<ProjectOption[]>([]);

    useEffect(() => {
        loadDropdownData();
    }, []);

    useEffect(() => {
        if (productionId) {
            setFilteredProjects(projects.filter(project => project.productionId === productionId));
            if (projectId && !projects.find(project => project.id === projectId && project.productionId === productionId)) {
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
                fetchAllProjects(),
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
        } catch (requestError) {
            console.error('Error loading dropdown data:', requestError);
            setError('Failed to load form data');
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

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
            // Convert price to number for the schema
            const priceNumber = price ? parseFloat(price) : undefined;
            
            const result = await createRide({
                departure: departure.trim(),
                destination: destination.trim(),
                departureTime: departureDate,
                price: priceNumber,
                status,
                driverId: driverId || undefined,
                customerIds: selectedCustomers,
            });

            if (result.success) {
                router.replace(returnTo);
                return;
            }

            setError(result.error || 'Failed to create ride');
        } catch (requestError) {
            console.error('Error creating ride:', requestError);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (!loading) {
            router.replace(returnTo);
        }
    };

    return (
        <RoleSidebar>
            <div className={styles.pageShell}>
                <div className={styles.pageContainer}>
                <div className={styles.pageHeader}>
                    <div className={styles.pageHeaderText}>
                        <div className={styles.pageEyebrow}>{t('ridesManagement.title')}</div>
                        <h1 className={styles.pageTitle}>
                            <CheckSquare className={styles.titleIcon} />
                            {t('ridesManagement.addRide')}
                        </h1>
                        <p className={styles.pageSubtitle}>
                            {t('ridesManagement.addRideSubtitle')}
                        </p>
                    </div>

                    <Link
                        href={returnTo}
                        className={styles.pageBackButton}
                        aria-disabled={loading}
                        onClick={(event) => {
                            if (loading) {
                                event.preventDefault();
                            }
                        }}
                    >
                        <X className={styles.closeIcon} />
                        <span>{t('common.cancel')}</span>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className={styles.pageContent}>
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
                            <div>
                                <div className={styles.sectionTitle}>
                                    <MapPin className={styles.sectionTitleIcon} /> {t('ridesManagement.location')}
                                </div>
                                <div className={styles.formSectionGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <MapPin className={styles.formLabelIconGreen} />
                                            {t('ridesManagement.departure')}
                                            <span className={styles.formLabelRequired}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={departure}
                                            onChange={(e) => setDeparture(e.target.value)}
                                            placeholder={t('ridesManagement.departurePlaceholder', 'E.g., 123 Main St, Paris')}
                                            className={styles.formInput}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <MapPin className={styles.formLabelIconRed} />
                                            {t('ridesManagement.destination')}
                                            <span className={styles.formLabelRequired}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={destination}
                                            onChange={(e) => setDestination(e.target.value)}
                                            placeholder={t('ridesManagement.destinationPlaceholder')}
                                            className={styles.formInput}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className={styles.sectionTitle}>
                                    <Clock className={styles.sectionTitleIcon} /> {t('ridesManagement.details')}
                                </div>
                                <div className={styles.formSectionGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <Clock className={styles.formLabelIconBlue} />
                                            {t('ridesManagement.departureTime')}
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
                                            {t('ridesManagement.price')}
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            placeholder={t('ridesManagement.pricePlaceholder')}
                                            className={styles.formInput}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className={styles.sectionTitle}>
                                    <Users className={styles.sectionTitleIcon} /> {t('ridesManagement.participants', 'Participants')}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        <Users className={styles.formLabelIconBlue} />
                                        {t('ridesManagement.driver', 'Driver (Optional)')}
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
                                        placeholder={t('ridesManagement.selectDriver', 'Select a driver...')}
                                        searchPlaceholder={t('addRideModal.searchDrivers', 'Search drivers...')}
                                        emptyText={t('addRideModal.noMatchingDriver', 'No matching driver')}
                                        helperText={t('addRideModal.typeToSearchDriver', 'Type to search, then use Enter or click a result.')}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        <Users className={styles.formLabelIconOrange} />
                                        {t('ridesManagement.customers', 'Customers')}
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
                                        placeholder={t('addRideModal.typeCustomerName', 'Type a customer name...')}
                                        searchPlaceholder={t('addRideModal.addAnotherCustomer', 'Add another customer...')}
                                        emptyText={t('addRideModal.noMatchingCustomer', 'No matching customer')}
                                        helperText={t('addRideModal.pressEnterToAdd', 'Press Enter to add the first match, or click a suggestion.')}
                                    />
                                    <div className={styles.tagHintRow}>
                                        <p className={styles.tagHintCount}>
                                            {selectedCustomers.length} {t('ridesManagement.selected', 'selected')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className={styles.sectionTitle}>
                                    <Building className={styles.sectionTitleIcon} /> {t('ridesManagement.productionInfo', 'Production Info')}
                                </div>
                                <div className={styles.formSectionGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <Building className={styles.formLabelIconIndigo} />
                                            {t('ridesManagement.productionOptional', 'Production (Optional)')}
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
                                            placeholder={t('addRideModal.searchProductions', 'Type a production name...')}
                                            searchPlaceholder={t('addRideModal.replaceProduction', 'Search to replace production...')}
                                            emptyText={t('addRideModal.noMatchingProduction', 'No matching production')}
                                            helperText={t('addRideModal.typeToSearchDriver', 'Type to search, then use Enter or click a result.')}
                                        />
                                        <div className={styles.tagHintRow}>
                                            <p className={styles.tagHintText}>
                                                {selectedProduction ? selectedProduction.name : t('ridesManagement.noProductionSelected', 'No production selected')}
                                            </p>
                                            <p className={styles.tagHintCount}>
                                                {productionId ? '1' : '0'} {t('ridesManagement.selected', 'selected')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <FolderOpen className={styles.formLabelIconCyan} />
                                            {t('ridesManagement.projectOptional', 'Project (Optional)')}
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
                                            placeholder={t('ridesManagement.selectProject', 'Select a project...')}
                                            searchPlaceholder={t('addRideModal.searchProjects', 'Search projects...')}
                                            emptyText={productionId ? t('addRideModal.noMatchingProject', 'No matching project') : t('addRideModal.selectProductionFirst', 'Select a production first')}
                                            helperText={productionId ? t('addRideModal.typeToSearchDriver', 'Type to search, then use Enter or click a result.') : t('addRideModal.selectProductionFirst', 'Select a production first')}
                                            disabled={!productionId}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>
                                    <FileText className={styles.formLabelIconGray} />
                                    {t('ridesManagement.notes', 'Customer Notes (Optional)')}
                                </label>
                                <textarea
                                    value={customerNotes}
                                    onChange={(e) => setCustomerNotes(e.target.value)}
                                    placeholder={t('ridesManagement.notesPlaceholder', 'Add any special instructions...')}
                                    rows={3}
                                    className={`${styles.formInput} ${styles.notesTextarea}`}
                                />
                            </div>
                        </div>
                    )}
                </form>

                <div className={styles.pageFooter}>
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button
                        type="submit"
                        isPending={loading || loadingData}
                        pendingText={t('common.creating', 'Creating...')}
                    >
                        {t('ridesManagement.createRide')}
                    </Button>
                </div>
            </div>
            </div>
        </RoleSidebar>
    );
}
