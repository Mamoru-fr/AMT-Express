'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Calendar, Clock, X, Filter } from 'lucide-react';
import styles from './RideSearchForm.module.css';

interface SearchParams {
    departure?: string;
    destination?: string;
    date?: string;
    minPrice?: string;
    maxPrice?: string;
}

interface Props {
    onSearch: (params: SearchParams) => void;
    onClear?: () => void;
    isLoading?: boolean;
}

export type { SearchParams };

export function RideSearchForm({ onSearch, onClear, isLoading = false }: Props) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<SearchParams>({
        departure: '',
        destination: '',
        date: '',
        minPrice: '',
        maxPrice: ''
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSearch(formData);
    }, [formData, onSearch]);

    const handleClear = useCallback(() => {
        setFormData({
            departure: '',
            destination: '',
            date: '',
            minPrice: '',
            maxPrice: ''
        });
        onSearch({});
    }, [onSearch]);

    const toggleAdvancedFilters = useCallback(() => {
        setShowAdvancedFilters(prev => !prev);
    }, []);

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.mainFilters}>
                {/* Departure */}
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>
                        <MapPin className={styles.filterIcon} />
                        {t('rides.departure')}
                    </label>
                    <input
                        type="text"
                        name="departure"
                        value={formData.departure}
                        onChange={handleChange}
                        placeholder={t('rides.departurePlaceholder')}
                        className={styles.filterInput}
                    />
                </div>

                {/* Destination */}
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>
                        <MapPin className={styles.filterIcon} />
                        {t('rides.destination')}
                    </label>
                    <input
                        type="text"
                        name="destination"
                        value={formData.destination}
                        onChange={handleChange}
                        placeholder={t('rides.destinationPlaceholder')}
                        className={styles.filterInput}
                    />
                </div>

                {/* Date */}
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>
                        <Calendar className={styles.filterIcon} />
                        {t('rides.date')}
                    </label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className={styles.filterInput}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                {/* Search Button */}
                <button
                    type="submit"
                    className={styles.searchButton}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className={styles.loadingSpinner} />
                    ) : (
                        <>
                            <Search className={styles.searchIcon} />
                            {t('rides.searchButton')}
                        </>
                    )}
                </button>
            </div>

            {/* Clear Button */}
            <div className={styles.clearRow}>
                <button
                    type="button"
                    className={styles.clearButton}
                    onClick={() => {
                        handleClear();
                        if (onClear) onClear();
                    }}
                >
                    <X className={styles.clearIcon} />
                    {t('rides.clearButton')}
                </button>

                {/* Advanced Filters Toggle */}
                <button
                    type="button"
                    className={styles.advancedToggle}
                    onClick={toggleAdvancedFilters}
                >
                    <Filter className={styles.advancedIcon} />
                    {t('rides.advancedFilters')}
                </button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
                <div className={styles.advancedFilters}>
                    <div className={styles.advancedRow}>
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>
                                <Clock className={styles.filterIcon} />
                                {t('rides.minPrice')}
                            </label>
                            <div className={styles.priceInputGroup}>
                                <span className={styles.pricePrefix}>€</span>
                                <input
                                    type="number"
                                    name="minPrice"
                                    value={formData.minPrice}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className={styles.priceInput}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>
                                <Clock className={styles.filterIcon} />
                                {t('rides.maxPrice')}
                            </label>
                            <div className={styles.priceInputGroup}>
                                <span className={styles.pricePrefix}>€</span>
                                <input
                                    type="number"
                                    name="maxPrice"
                                    value={formData.maxPrice}
                                    onChange={handleChange}
                                    placeholder="1000"
                                    className={styles.priceInput}
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
