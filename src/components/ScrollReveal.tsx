"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    variant?: "fadeIn" | "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "scaleIn";
    duration?: number;
    delay?: number;
    threshold?: number;
    once?: boolean;
}

export default function ScrollReveal({
    children,
    className = "",
    variant = "fadeInUp",
    duration = 0.7,
    delay = 0,
    threshold = 0.05,
    once = true,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Fallback for environment without IntersectionObserver support (e.g. older browsers, SSR)
        if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
            setTimeout(() => {
                setIsVisible(true);
            }, 0);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once && ref.current) {
                        observer.unobserve(ref.current);
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [threshold, once]);

    const getVariantStyles = () => {
        if (isVisible) {
            return "opacity-100 translate-x-0 translate-y-0 scale-100";
        }

        switch (variant) {
            case "fadeIn":
                return "opacity-0";
            case "fadeInUp":
                return "opacity-0 translate-y-8";
            case "fadeInDown":
                return "opacity-0 -translate-y-8";
            case "fadeInLeft":
                return "opacity-0 -translate-x-8";
            case "fadeInRight":
                return "opacity-0 translate-x-8";
            case "scaleIn":
                return "opacity-0 scale-95";
            default:
                return "opacity-0 translate-y-8";
        }
    };

    return (
        <div
            ref={ref}
            className={`transition-all ${className}`}
            style={{
                transitionDuration: `${duration}s`,
                transitionDelay: `${delay}s`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
        >
            <div className={`transition-all duration-inherit delay-inherit ease-inherit ${getVariantStyles()}`}>
                {children}
            </div>
        </div>
    );
}
