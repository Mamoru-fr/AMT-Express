'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpDown, X, Plus, Minus, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './AdvancedSortModal.module.css';

// Types pour les colonnes triables
const sortableColumns = [
    { key: 'departureTime', label: 'dateHour' },
    { key: 'clients', label: 'clients' },
    { key: 'departure', label: 'departure' },
    { key: 'destination', label: 'destination' },
    { key: 'driver', label: 'driver' },
    { key: 'price', label: 'price' },
    { key: 'status', label: 'status' },
] as const;

type SortableColumn = 'departureTime' | 'clients' | 'departure' | 'destination' | 'driver' | 'price' | 'status';
type SortDirection = 'asc' | 'desc';

interface SortRule {
    column: SortableColumn;
    direction: SortDirection;
}

interface AdvancedSortModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSortRules: SortRule[];
    onApply: (rules: SortRule[]) => void;
}

export function AdvancedSortModal({
    isOpen,
    onClose,
    currentSortRules,
    onApply
}: AdvancedSortModalProps) {
    const { t } = useTranslation();
    const [sortRules, setSortRules] = useState<SortRule[]>(currentSortRules);

    // Synchroniser avec les règles courantes
    useEffect(() => {
        if (isOpen) {
            setSortRules(currentSortRules);
        }
    }, [isOpen, currentSortRules]);

    const addSortRule = (column: SortableColumn) => {
        // Vérifier si la colonne est déjà dans les règles
        const existingIndex = sortRules.findIndex(r => r.column === column);
        if (existingIndex !== -1) {
            // Si elle existe, on la supprime pour la réajouter en premier
            const newRules = [...sortRules];
            newRules.splice(existingIndex, 1);
            newRules.unshift({ column, direction: 'asc' });
            setSortRules(newRules);
        } else {
            // Sinon, on l'ajoute en premier
            setSortRules([{ column, direction: 'asc' }, ...sortRules]);
        }
    };

    const removeSortRule = (index: number) => {
        const newRules = [...sortRules];
        newRules.splice(index, 1);
        setSortRules(newRules);
    };

    const toggleSortDirection = (index: number) => {
        const newRules = [...sortRules];
        newRules[index].direction = newRules[index].direction === 'asc' ? 'desc' : 'asc';
        setSortRules(newRules);
    };

    const moveRuleUp = (index: number) => {
        if (index > 0) {
            const newRules = [...sortRules];
            [newRules[index], newRules[index - 1]] = [newRules[index - 1], newRules[index]];
            setSortRules(newRules);
        }
    };

    const moveRuleDown = (index: number) => {
        if (index < sortRules.length - 1) {
            const newRules = [...sortRules];
            [newRules[index], newRules[index + 1]] = [newRules[index + 1], newRules[index]];
            setSortRules(newRules);
        }
    };

    // Drag and drop state
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const dragItem = useRef<number | null>(null);

    const handleDragStart = (index: number) => {
        dragItem.current = index;
        setDraggedIndex(index);
    };

    const handleDragEnter = (index: number) => {
        if (dragItem.current === null || dragItem.current === index) return;
        
        const newRules = [...sortRules];
        const draggedRule = newRules[dragItem.current];
        newRules.splice(dragItem.current, 1);
        newRules.splice(index, 0, draggedRule);
        
        setSortRules(newRules);
        dragItem.current = index;
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        dragItem.current = null;
    };

    const handleApply = () => {
        onApply(sortRules);
        onClose();
    };

    const handleReset = () => {
        // Réinitialiser aux règles par défaut (tri par date décroissant)
        const defaultRules: SortRule[] = [{ column: 'departureTime', direction: 'desc' }];
        setSortRules(defaultRules);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>
                        <ArrowUpDown size={18} className={styles.modalIcon} />
                        {t('ridesManagement.advancedSort.title')}
                    </h3>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <p className={styles.description}>
                        {t('ridesManagement.advancedSort.description')}
                    </p>

                    <div className={styles.sortRulesContainer}>
                        <h4 className={styles.sectionTitle}>{t('ridesManagement.advancedSort.activeRulesTitle')}</h4>
                        
                        {sortRules.length === 0 ? (
                            <p className={styles.emptyState}>{t('ridesManagement.advancedSort.noRules')}</p>
                        ) : (
                            <div className={styles.rulesList}>
                                {sortRules.map((rule, index) => (
                                    <div 
                                        key={`${rule.column}-${index}`} 
                                        className={`${styles.sortRule} ${draggedIndex === index ? styles.sortRuleDragging : ''}`}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragEnter={() => handleDragEnter(index)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        <div className={styles.ruleHeader}>
                                            <span className={styles.dragHandle}>
                                                <GripVertical size={14} />
                                            </span>
                                            <span className={styles.ruleNumber}>{index + 1}</span>
                                            <span className={styles.ruleColumn}>
                                                {t(`ridesManagement.${sortableColumns.find(c => c.key === rule.column)?.label || rule.column}`)}
                                            </span>
                                            <button 
                                                className={styles.directionButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleSortDirection(index);
                                                }}
                                            >
                                                {rule.direction === 'asc' ? (
                                                    <ArrowUp size={14} />
                                                ) : (
                                                    <ArrowDown size={14} />
                                                )}
                                            </button>
                                        </div>
                                        <div className={styles.ruleActions}>
                                            <button 
                                                className={styles.actionButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveRuleUp(index);
                                                }}
                                                disabled={index === 0}
                                                title={t('common.moveUp') || 'Monter'}
                                            >
                                                <Plus size={14} />
                                            </button>
                                            <button 
                                                className={styles.actionButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveRuleDown(index);
                                                }}
                                                disabled={index === sortRules.length - 1}
                                                title={t('common.moveDown') || 'Descendre'}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <button 
                                                className={styles.removeButton}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeSortRule(index);
                                                }}
                                                title={t('common.delete') || 'Supprimer'}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.availableColumnsContainer}>
                        <h4 className={styles.sectionTitle}>{t('ridesManagement.advancedSort.addColumnTitle')}</h4>
                        <div className={styles.columnsGrid}>
                            {sortableColumns.map((col) => {
                                const isUsed = sortRules.some(r => r.column === col.key);
                                return (
                                    <button
                                        key={col.key}
                                        className={`${styles.columnButton} ${isUsed ? styles.columnButtonUsed : ''}`}
                                        onClick={() => addSortRule(col.key as SortableColumn)}
                                        disabled={isUsed}
                                    >
                                        <span>{t(`ridesManagement.${col.label}`)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.resetButton} onClick={handleReset}>
                        {t('ridesManagement.advancedSort.reset')}
                    </button>
                    <button className={styles.cancelButton} onClick={onClose}>
                        {t('ridesManagement.advancedSort.cancel')}
                    </button>
                    <button className={styles.applyButton} onClick={handleApply}>
                        {t('ridesManagement.advancedSort.apply')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
