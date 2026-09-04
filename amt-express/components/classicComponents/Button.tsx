import type { ReactNode } from 'react';
import styles from './button.module.css';

type Props = {
    children?: ReactNode;
    /** Fallback when no children provided */
    content?: string;
    className?: string;
    variant?: 'primary' | 'secondary' | 'danger';
    full?: boolean;
    icon?: ReactNode;
    isPending?: boolean;
    pendingText?: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    'aria-label'?: string;
};

export function Button({
    children,
    content,
    className,
    variant = 'primary',
    full = false,
    icon,
    isPending = false,
    pendingText,
    onClick,
    type = 'button',
    disabled = false,
    'aria-label': ariaLabel,
}: Props) {
    const variantClass =
        variant === 'danger' ? styles.buttonDanger :
        variant === 'secondary' ? styles.buttonSecondary :
        styles.buttonPrimary;

    return (
        <button
            type={type}
            disabled={disabled || isPending}
            className={[styles.button, variantClass, full && styles.buttonFull, className].filter(Boolean).join(' ')}
            onClick={onClick}
            aria-label={ariaLabel}
        >
            {icon && <span className={styles.buttonIcon}>{icon}</span>}
            {isPending && pendingText ? pendingText : (children ?? content)}
        </button>
    );
}
