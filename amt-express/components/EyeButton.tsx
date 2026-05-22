/**
 * This component is used to create a button that shows or hides the password in a password input field.
 * It uses the Eye and EyeOff icons from the lucide-react library to indicate the current state of the password visibility.
 * The button is only rendered if the input field is of type password.
 */


import { Eye, EyeOff } from "lucide-react";
import '@/css/components/eyeButton.css';

type Props = {
    isPassword: boolean;
    showPassword: boolean;
    setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

export function EyeButton({isPassword, showPassword, setShowPassword}: Props) {
    if (!isPassword) return null;

    return (
        <button
            type="button"
            onMouseUp={() => setShowPassword(false)}
            onMouseDown={() => setShowPassword(true)}
            onMouseLeave={() => setShowPassword(false)}
            onTouchStart={() => setShowPassword(true)}
            onTouchEnd={() => setShowPassword(false)}
            className="eyeButton"
        >
            {showPassword ? (
                <Eye className="w-5 h-5" />
            ) : (
                <EyeOff className="w-5 h-5" />
            )}
        </button>
    );
}