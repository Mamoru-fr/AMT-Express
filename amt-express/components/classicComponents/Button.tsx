import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import styles from './button.module.css';

type Props = {
    children?: ReactNode;
    /** Fallback when no children provided */
    content?: string;
    className?: string;
    variant?: 'primary' | 'secondary' | 'danger';
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
            className={cn(styles.button, variantClass, className)}
            onClick={onClick}
            aria-label={ariaLabel}
        >
            {icon && <span className={styles.buttonIcon}>{icon}</span>}
            {isPending && pendingText ? pendingText : (children ?? content)}
        </button>
    );
}
