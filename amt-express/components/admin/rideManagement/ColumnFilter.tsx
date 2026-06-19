'use client';

import { useState, useEffect, useRef } from 'react';
import { Filter, ChevronUp, ChevronDown, ArrowUp, ArrowDown, X, CheckSquare, Square } from 'lucide-react';
import styles from './ColumnFilter.module.css';

interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

interface ColumnFilterProps<T extends string = string> {
    columnKey: T;
    label: string;
    options: FilterOption[];
    selectedValues: string[];
    onFilterChange: (column: T, values: string[]) => void;
    sortBy?: T;
    sortOrder?: 'asc' | 'desc';
    onSort?: (column: T) => void;
}

export function ColumnFilter({
    columnKey,
    label,
    options,
    selectedValues,
    onFilterChange,
    sortBy,
    sortOrder,
    onSort
}: ColumnFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [localSelected, setLocalSelected] = useState<string[]>(selectedValues);

    // Synchroniser avec les valeurs sélectionnées externes
    useEffect(() => {
        setLocalSelected(selectedValues);
    }, [selectedValues]);

    // Calculer la position du popup
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPopupPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX
            });
        }
    }, [isOpen]);

    // Fermer le popup quand on clique à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Gérer la touche Escape
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleOption = (value: string) => {
        const newSelected = localSelected.includes(value)
            ? localSelected.filter(v => v !== value)
            : [...localSelected, value];
        setLocalSelected(newSelected);
        onFilterChange(columnKey, newSelected);
    };

    const toggleAll = () => {
        const newSelected = localSelected.length === options.length
            ? []
            : options.map(opt => opt.value);
        setLocalSelected(newSelected);
        onFilterChange(columnKey, newSelected);
    };

    const clearFilters = () => {
        setLocalSelected([]);
        setSearchTerm('');
        onFilterChange(columnKey, []);
        setIsOpen(false);
    };

    const handleSort = (direction: 'asc' | 'desc') => {
        onSort?.(columnKey);
        setIsOpen(false);
    };

    const hasActiveFilters = selectedValues.length > 0;
    const isSorted = sortBy === columnKey;

    return (
        <>
            <button
                ref={buttonRef}
                className={`${styles.filterButton} ${hasActiveFilters ? styles.filterButtonActive : ''} ${isSorted ? styles.filterButtonSorted : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={`Filtrer et trier par ${label}`}
            >
                <Filter size={14} className={styles.filterIcon} />
                <span className={styles.filterLabel}>{label}</span>
                {isSorted && (
                    <span className={styles.sortIndicator}>
                        {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </span>
                )}
                {hasActiveFilters && (
                    <span className={styles.filterBadge}>{selectedValues.length}</span>
                )}
                <span className={styles.chevronIcon}>
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
            </button>

            {isOpen && (
                <div
                    className={styles.popup}
                    ref={popupRef}
                    style={{ top: popupPosition.top, left: popupPosition.left }}
                >
                    <div className={styles.popupContent}>
                        <div className={styles.popupHeader}>
                            <h3 className={styles.popupTitle}>Filtrer par : {label}</h3>
                            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles.searchInput}
                            />
                            {searchTerm && (
                                <button className={styles.clearSearch} onClick={() => setSearchTerm('')}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <div className={styles.sortContainer}>
                            <span className={styles.sortLabel}>Trier :</span>
                            <button
                                className={`${styles.sortButton} ${isSorted && sortOrder === 'asc' ? styles.sortButtonActive : ''}`}
                                onClick={() => handleSort('asc')}
                            >
                                <ArrowUp size={14} />
                                <span>Croissant</span>
                            </button>
                            <button
                                className={`${styles.sortButton} ${isSorted && sortOrder === 'desc' ? styles.sortButtonActive : ''}`}
                                onClick={() => handleSort('desc')}
                            >
                                <ArrowDown size={14} />
                                <span>Décroissant</span>
                            </button>
                        </div>

                        <div className={styles.optionsContainer}>
                            <button className={styles.selectAllButton} onClick={toggleAll}>
                                <span className={styles.checkboxIcon}>
                                    {localSelected.length === options.length ? (
                                        <CheckSquare size={16} />
                                    ) : localSelected.length > 0 ? (
                                        <Square size={16} style={{ opacity: 0.5 }} />
                                    ) : (
                                        <Square size={16} />
                                    )}
                                </span>
                                <span>Tout sélectionner</span>
                            </button>

                            <div className={styles.optionsList}>
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((option) => {
                                        const isSelected = localSelected.includes(option.value);
                                        return (
                                            <button
                                                key={option.value}
                                                className={`${styles.optionItem} ${isSelected ? styles.optionItemSelected : ''}`}
                                                onClick={() => toggleOption(option.value)}
                                            >
                                                <span className={styles.checkboxIcon}>
                                                    {isSelected ? (
                                                        <CheckSquare size={16} />
                                                    ) : (
                                                        <Square size={16} />
                                                    )}
                                                </span>
                                                <span className={styles.optionLabel}>{option.label}</span>
                                                {option.count !== undefined && (
                                                    <span className={styles.optionCount}>{option.count}</span>
                                                )}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className={styles.noResults}>Aucun résultat trouvé</div>
                                )}
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <div className={styles.popupFooter}>
                                <button className={styles.clearButton} onClick={clearFilters}>
                                    <X size={14} />
                                    <span>Effacer les filtres</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
