import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface DynamicIconProps {
    name: string;
    className?: string;
    size?: number;
}

export const DynamicIcon = ({ name, className, size = 24 }: DynamicIconProps) => {
    // Normalize name to PascalCase (e.g., 'home' -> 'Home', 'smart-phone' -> 'Smartphone')
    const normalizedName = name
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('');

    const IconComponent = (LucideIcons as any)[normalizedName] as LucideIcon | undefined || (LucideIcons as any)[name] as LucideIcon | undefined;

    if (!IconComponent) {
        return null;
    }

    return <IconComponent className={className} size={size} />;
};
