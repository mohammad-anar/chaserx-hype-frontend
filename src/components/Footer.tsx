"use client";

import React from "react";
import Link from "next/link";
import { Globe, AtSign } from "lucide-react";

interface FooterProps {
    theme?: "dark" | "light";
}

export default function Footer({ theme = "light" }: FooterProps) {
    return (
        <footer 
            className="relative z-30 py-16 px-4 md:px-8 border-t border-white/5 overflow-hidden transition-colors duration-300 bg-[#4E281F] text-[#FAF6F0]"
        >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="text-center md:text-left">
                    <p className="text-sm text-[#FAF6F0]/80 leading-relaxed font-sans font-light">
                        Crafting aesthetic experiences, one bean at a time.<br />
                        Designed for the modern aficionado.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm font-semibold tracking-wide text-[#FAF6F0]/90">
                    <Link 
                        href="#" 
                        className="transition-colors hover:text-[#C07C4A]"
                    >
                        Privacy Policy
                    </Link>
                    <Link 
                        href="#" 
                        className="transition-colors hover:text-[#C07C4A]"
                    >
                        Terms of Service
                    </Link>
                    <Link 
                        href="#" 
                        className="transition-colors hover:text-[#C07C4A]"
                    >
                        Contact Us
                    </Link>
                </div>

                <div className="flex gap-4">
                    <Link 
                        href="#" 
                        className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center text-[#FAF6F0]/80 hover:text-white hover:border-white transition-all hover:scale-105"
                    >
                        <Globe className="w-4 h-4 stroke-[1.5]" />
                    </Link>
                    <Link 
                        href="#" 
                        className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center text-[#FAF6F0]/80 hover:text-white hover:border-white transition-all hover:scale-105"
                    >
                        <AtSign className="w-4 h-4 stroke-[1.5]" />
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col items-center justify-center relative z-10 text-center">
                <h2 className="font-serif font-bold text-[70px] sm:text-[100px] md:text-[130px] leading-none text-white/10 select-none mb-3">
                    Bean Fien
                </h2>
                <p className="text-[11px] text-[#FAF6F0]/65 font-medium tracking-wide">
                    © 2026 Bean Fien. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
