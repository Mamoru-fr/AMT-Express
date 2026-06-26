import { cn } from "@/utils/cn";
import './button.module.css';

type Props = {
    content: string;
    className?: string;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

export function Button({ content, className, variant = 'primary', onClick, type = 'button', disabled = false }: Props) {
    const variantClass = variant === 'primary' ? 'buttonPrimary' : 'buttonSecondary';
    
    return (
        <button 
            type={type}
            disabled={disabled}
            className={cn(
                'button',
                variantClass,
                className
            )}
            onClick={onClick}
        >
            {content}
        </button>
    );
}