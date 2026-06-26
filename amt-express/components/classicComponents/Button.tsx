import { cn } from "@/utils/cn";
import styles from './button.module.css';

type Props = {
    content: string;
    className?: string;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

export function Button({ content, className, variant = 'primary', onClick, type = 'button', disabled = false }: Props) {
    const variantClass = variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary;
    
    return (
        <button 
            type={type}
            disabled={disabled}
            className={cn(
                styles.button,
                variantClass,
                className
            )}
            onClick={onClick}
        >
            {content}
        </button>
    );
}