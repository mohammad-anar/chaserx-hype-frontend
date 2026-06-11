import React from "react";

interface LogoProps {
    className?: string;
    imgClassName?: string;
}

export default function Logo({ className = "w-11 h-11", imgClassName }: LogoProps) {
    return (
        <div className={`rounded-full overflow-hidden flex items-center justify-center relative ${className}`}>
            <img 
                src="/logo.png" 
                alt="Bean Fien Logo" 
                className={`w-full h-full object-contain rounded-full ${imgClassName || ""}`} 
            />
        </div>
    );
}
