import { useState } from "react";
import { EyeButton } from "../eyeButton/EyeButton";
import styles from './input.module.css';

type Props = {
    placeholder: string;
    className?: string;
    type: string;
    value?: string;
    onChange?: (value: string) => void;
    name?: string;
    required?: boolean;
};

export function Input({ placeholder, className, type, value, onChange, name, required }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    // Classe supplémentaire pour le conteneur si c'est un password
    const containerClassName = isPassword 
        ? `${styles.inputContainer} ${styles.inputContainerWithIcon}` 
        : styles.inputContainer;

    return (
        <div className={containerClassName}>
            <input
                className={`${styles.input} ${className || ''}`.trim()}
                placeholder={placeholder}
                type={inputType}
                name={name}
                required={required}
                {...(value !== undefined && { value })}
                {...(onChange && { onChange: (e) => onChange(e.target.value) })}
            />
            {isPassword && (
                <EyeButton
                    isPassword={isPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                />
            )}
        </div>
    );
}