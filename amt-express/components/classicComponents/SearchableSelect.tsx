'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ChevronDown, X} from 'lucide-react';
import styles from './SearchableSelect.module.css';

export type SearchableSelectOption = {
    id: string;
    label: string;
    description?: string;
};

type CommonProps = {
    options: SearchableSelectOption[];
    placeholder: string;
    searchPlaceholder?: string;
    emptyText?: string;
    helperText?: string;
    disabled?: boolean;
    className?: string;
    maxResults?: number;
};

type SingleProps = CommonProps & {
    multiple?: false;
    value: string;
    onChange: (option: SearchableSelectOption) => void;
    onClear?: () => void;
};

type MultiProps = CommonProps & {
    multiple: true;
    values: string[];
    onChange: (options: SearchableSelectOption[]) => void;
    onClear?: () => void;
};

type Props = SingleProps | MultiProps;

export function SearchableSelect({
    options,
    placeholder,
    searchPlaceholder,
    emptyText,
    helperText,
    disabled = false,
    className,
    maxResults = 8,
    ...rest
}: Props) {
    const {t} = useTranslation();
    
    // Utiliser les traductions comme valeurs par défaut
    const effectiveSearchPlaceholder = searchPlaceholder || t('searchableSelect.typeToSearch', 'Type to search...');
    const effectiveEmptyText = emptyText || t('searchableSelect.noMatchingResult', 'No matching result');
    const isMultiple = rest.multiple === true;
    const selectedOption = useMemo(
        () => !isMultiple ? options.find(option => option.id === rest.value) || null : null,
        [isMultiple, options, rest]
    );

    const selectedOptions = useMemo(
        () => {
            if (isMultiple) {
                return options.filter(option => rest.values.includes(option.id));
            }

            return selectedOption ? [selectedOption] : [];
        },
        [isMultiple, options, rest, selectedOption]
    );
    const singleValue = isMultiple ? '' : rest.value;

    const [query, setQuery] = useState(isMultiple ? '' : selectedOption?.label ?? '');
    const [open, setOpen] = useState(false);
    const blurTimeout = useRef<number | null>(null);

    useEffect(() => {
        setQuery(isMultiple ? '' : selectedOption?.label ?? '');
    }, [isMultiple, selectedOption?.label]);

    useEffect(() => {
        return () => {
            if (blurTimeout.current) {
                window.clearTimeout(blurTimeout.current);
            }
        };
    }, []);

    const filteredOptions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const selectedIds = new Set(selectedOptions.map(option => option.id));

        return options.filter(option => {
            if (isMultiple && selectedIds.has(option.id)) {
                return false;
            }

            if (!normalizedQuery) {
                return true;
            }

            return (
                option.label.toLowerCase().includes(normalizedQuery) ||
                option.description?.toLowerCase().includes(normalizedQuery)
            );
        }).slice(0, maxResults);
    }, [isMultiple, maxResults, options, query, selectedOptions]);

    const handleSelect = (option: SearchableSelectOption) => {
        if (isMultiple) {
            const nextSelected = [...selectedOptions, option];
            rest.onChange(nextSelected);
            setQuery('');
            setOpen(true);
            return;
        }

        rest.onChange(option);
        setQuery(option.label);
        setOpen(false);
    };

    const handleClear = () => {
        if (isMultiple) {
            rest.onClear?.();
            rest.onChange([]);
            setQuery('');
            setOpen(true);
            return;
        }

        setQuery('');
        rest.onClear?.();
        setOpen(true);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();

            if (filteredOptions.length === 1) {
                handleSelect(filteredOptions[0]);
                return;
            }

            const exactMatch = filteredOptions.find(
                option => option.label.toLowerCase() === query.trim().toLowerCase()
            );

            if (exactMatch) {
                handleSelect(exactMatch);
                return;
            }

            if (filteredOptions.length > 0) {
                handleSelect(filteredOptions[0]);
            }
        }

        if (event.key === 'Escape') {
            setOpen(false);
        }

        if (event.key === 'Backspace' && !query && selectedOptions.length > 0) {
            handleClear();
        }
    };

    const handleRemoveChip = (optionId: string) => {
        if (!isMultiple) {
            return;
        }

        const nextSelected = selectedOptions.filter(option => option.id !== optionId);
        rest.onChange(nextSelected);
        setOpen(true);
    };

    return (
        <div className={className ? `${styles.root} ${className}` : styles.root}>
            <div className={isMultiple ? `${styles.shell} ${styles.shellMulti}` : styles.shell}>
                {isMultiple && selectedOptions.map(option => (
                    <button
                        key={option.id}
                        type="button"
                        className={styles.chip}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleRemoveChip(option.id)}
                        title={`Remove ${option.label}`}
                    >
                        <span className={styles.chipLabel}>{option.label}</span>
                        <X className={styles.chipRemoveIcon} />
                    </button>
                ))}

                <input
                    type="text"
                    value={query}
                    disabled={disabled}
                    placeholder={isMultiple ? (selectedOptions.length > 0 ? effectiveSearchPlaceholder : placeholder) : (selectedOption ? effectiveSearchPlaceholder : placeholder)}
                    className={isMultiple ? `${styles.input} ${styles.inputMulti}` : styles.input}
                    onFocus={(event) => {
                        setOpen(true);
                        if (!isMultiple && selectedOption && query === selectedOption.label) {
                            event.currentTarget.select();
                        }
                    }}
                    onBlur={() => {
                        blurTimeout.current = window.setTimeout(() => setOpen(false), 300);
                    }}
                    onChange={(event) => {
                        const nextValue = event.target.value;
                        setQuery(nextValue);
                        setOpen(true);

                        if (!isMultiple && selectedOption && nextValue !== selectedOption.label) {
                            rest.onClear?.();
                        }
                    }}
                    onKeyDown={handleKeyDown}
                />

                {selectedOptions.length > 0 && (
                    <button
                        type="button"
                        className={styles.clearButton}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={handleClear}
                        aria-label={t('searchableSelect.clearSelection', 'Clear selection')}
                    >
                        <X className={styles.iconSmall} />
                    </button>
                )}

                <button
                    type="button"
                    className={styles.caretButton}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setOpen(previous => !previous)}
                    aria-label={t('searchableSelect.toggleSuggestions', 'Toggle suggestions')}
                    disabled={disabled}
                >
                    <ChevronDown className={styles.iconMedium} />
                </button>
            </div>

            {helperText && (
                <p className={styles.helperText}>{helperText}</p>
            )}

            {open && !disabled && (
                <div
                    className={styles.dropdown}
                    onMouseEnter={() => setOpen(true)}
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(option => (
                            <button
                                key={option.id}
                                type="button"
                                className={option.id === singleValue ? `${styles.option} ${styles.optionActive}` : styles.option}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => handleSelect(option)}
                            >
                                <span className={styles.optionLabel}>{option.label}</span>
                                {option.description && (
                                    <span className={styles.optionDescription}>{option.description}</span>
                                )}
                            </button>
                        ))
                    ) : (
                        <p className={styles.emptyText}>{effectiveEmptyText}</p>
                    )}
                </div>
            )}
        </div>
    );
}