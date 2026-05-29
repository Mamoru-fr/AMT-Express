'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {ChevronDown, X} from 'lucide-react';
import {cn} from '@/utils/cn';
import styles from './SearchableSelect.module.css';

export type SearchableSelectOption = {
    id: string;
    label: string;
    description?: string;
};

type Props = {
    value: string;
    options: SearchableSelectOption[];
    onChange: (option: SearchableSelectOption) => void;
    onClear?: () => void;
    placeholder: string;
    searchPlaceholder?: string;
    emptyText?: string;
    helperText?: string;
    disabled?: boolean;
    className?: string;
    maxResults?: number;
};

export function SearchableSelect({
    value,
    options,
    onChange,
    onClear,
    placeholder,
    searchPlaceholder = 'Type to search...',
    emptyText = 'No matching result',
    helperText,
    disabled = false,
    className,
    maxResults = 8,
}: Props) {
    const selectedOption = useMemo(
        () => options.find(option => option.id === value) || null,
        [options, value]
    );

    const [query, setQuery] = useState(selectedOption?.label ?? '');
    const [open, setOpen] = useState(false);
    const blurTimeout = useRef<number | null>(null);

    useEffect(() => {
        setQuery(selectedOption?.label ?? '');
    }, [selectedOption?.label]);

    useEffect(() => {
        return () => {
            if (blurTimeout.current) {
                window.clearTimeout(blurTimeout.current);
            }
        };
    }, []);

    const filteredOptions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return options.filter(option => {
            if (!normalizedQuery) {
                return true;
            }

            return (
                option.label.toLowerCase().includes(normalizedQuery) ||
                option.description?.toLowerCase().includes(normalizedQuery)
            );
        }).slice(0, maxResults);
    }, [maxResults, options, query]);

    const handleSelect = (option: SearchableSelectOption) => {
        onChange(option);
        setQuery(option.label);
        setOpen(false);
    };

    const handleClear = () => {
        setQuery('');
        onClear?.();
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

        if (event.key === 'Backspace' && !query && value) {
            handleClear();
        }
    };

    return (
        <div className={cn(styles.root, className)}>
            <div className={styles.shell}>
                <input
                    type="text"
                    value={query}
                    disabled={disabled}
                    placeholder={selectedOption ? searchPlaceholder : placeholder}
                    className={styles.input}
                    onFocus={(event) => {
                        setOpen(true);
                        if (selectedOption && query === selectedOption.label) {
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

                        if (selectedOption && nextValue !== selectedOption.label) {
                            onClear?.();
                        }
                    }}
                    onKeyDown={handleKeyDown}
                />

                {value && (
                    <button
                        type="button"
                        className={styles.clearButton}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={handleClear}
                        aria-label="Clear selection"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}

                <button
                    type="button"
                    className={styles.caretButton}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setOpen(previous => !previous)}
                    aria-label="Toggle suggestions"
                    disabled={disabled}
                >
                    <ChevronDown className="w-4 h-4" />
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
                                className={cn(
                                    styles.option,
                                    option.id === value && styles.optionActive
                                )}
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
                        <p className={styles.emptyText}>{emptyText}</p>
                    )}
                </div>
            )}
        </div>
    );
}