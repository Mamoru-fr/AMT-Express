import { useState } from "react";
import { EyeButton } from "../EyeButton";
import { cn } from "@/utils/cn";
import '@/css/components/classicComponents/input.css';

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

    return (
        <div className="inputContainer">
            <input
                className={cn(
                    "input",
                    className
                )}
                placeholder={placeholder}
                type={inputType}
                name={name}
                required={required}
                {...(value !== undefined && { value })}
                {...(onChange && { onChange: (e) => onChange(e.target.value) })}
            />
            <EyeButton
                isPassword={isPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
            />
        </div>
    );
}