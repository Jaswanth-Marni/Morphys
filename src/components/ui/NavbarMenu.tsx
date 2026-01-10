"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// PREVIEW COMPONENT (For Component Card)
// ============================================

export function NavbarMenuPreview() {
    // Static preview - scaled down to fit in card, matching original component styling
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 md:p-4 relative">
            {/* Scaled-down navbar representation */}
            <div className="w-full max-w-[160px] md:max-w-[180px] flex flex-col items-center gap-1">
                {/* Navbar bar - using rounded-lg for proper rounded corners (not pill) */}
                <div className="w-full h-7 md:h-8 glass-navbar rounded-lg flex items-center justify-between px-2.5 md:px-3">
                    {/* Logo - matches font-heading font-black italic text-white */}
                    <span className="font-heading font-black italic text-[7px] md:text-[8px] tracking-wider text-white">
                        RUN
                    </span>
                    {/* Menu text - matches text-xs font-bold tracking-widest text-white */}
                    <span className="text-[5px] md:text-[6px] font-bold tracking-widest text-white/70 uppercase">
                        CLOSE
                    </span>
                </div>

                {/* Expanded menu representation - using rounded-xl for proper corners */}
                <div className="w-full glass-navbar rounded-xl flex flex-col items-center py-2 md:py-3 gap-0.5 md:gap-1">
                    {/* Menu Items - matches text-red-500 font-heading font-black */}
                    {["HOME", "REGISTER", "TRAINING", "ABOUT"].map((item) => (
                        <span
                            key={item}
                            className="font-heading font-black text-[7px] md:text-[8px] tracking-tighter text-red-500 uppercase"
                        >
                            {item}
                        </span>
                    ))}
                </div>

                {/* Privacy Policy Container - using rounded-md for smaller element */}
                <div className="w-full glass-navbar rounded-md py-1.5 md:py-2 flex justify-between items-center px-2 md:px-3">
                    <span className="text-[4px] md:text-[5px] font-mono uppercase text-white/40">Privacy Policy</span>
                    <span className="text-[4px] md:text-[5px] font-mono uppercase text-white/40">Terms of Use</span>
                </div>

                {/* Theme Toggle Container - using rounded-md for smaller element */}
                <div className="w-full glass-navbar rounded-md grid grid-cols-2 divide-x divide-white/10 overflow-hidden">
                    <div className="py-1.5 md:py-2 flex items-center justify-center gap-1">
                        <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                        </svg>
                        <span className="text-[4px] md:text-[5px] font-bold text-white/40">LIGHT</span>
                    </div>
                    <div className="py-1.5 md:py-2 flex items-center justify-center gap-1">
                        <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                        <span className="text-[4px] md:text-[5px] font-bold text-white/40">DARK</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// TYPES & CONFIG
// ============================================

export interface NavbarMenuConfig {
    logoText: string;
    accentColor: string;
    animationSpeed: number; // 0.5 to 2 multiplier
    borderRadius: number; // in pixels
}

export interface NavbarMenuProps {
    config?: Partial<NavbarMenuConfig>;
}

const defaultConfig: NavbarMenuConfig = {
    logoText: "RUN",
    accentColor: "#ef4444", // red-500
    animationSpeed: 1,
    borderRadius: 32,
};

// ============================================
// MAIN COMPONENT (For Sandbox/Detail page)
// ============================================

export function NavbarMenu({ config: userConfig }: NavbarMenuProps = {}) {
    const [isOpen, setIsOpen] = useState(false);

    // Merge user config with defaults
    const config = { ...defaultConfig, ...userConfig };

    // Calculate animation durations based on speed multiplier
    const baseDuration = 0.4 / config.animationSpeed;
    const staggerDelay = 0.05 / config.animationSpeed;

    // Internal theme state for the menu component
    const [isDarkMode, setIsDarkMode] = useState(true);

    return (
        <div
            className="w-full h-full flex flex-col items-center pt-6 md:pt-16 pb-8 md:pb-10 px-4 md:px-0 relative overflow-hidden"
            style={{
                backgroundImage: 'url(/back5.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Background overlay for better contrast */}
            <div
                className={`absolute inset-0 transition-colors duration-500 ${isDarkMode ? 'bg-black/40' : 'bg-white/30'
                    }`}
            />

            {/* Inner container - full height flex column */}
            <div className="relative flex flex-col items-center w-full md:w-auto h-full z-10">
                {/* Navbar Container - fixed height */}
                <motion.div
                    layout
                    className={`w-full md:w-[420px] h-[64px] shrink-0 flex items-center justify-between px-5 md:px-6 relative z-50 backdrop-blur-xl border transition-colors duration-300 ${isDarkMode
                        ? 'bg-black/40 border-white/10'
                        : 'bg-white/60 border-black/10'
                        }`}
                    style={{ borderRadius: `${config.borderRadius}px` }}
                    initial={false}
                >
                    {/* Logo */}
                    <div className="flex items-center">
                        {/* Using a simple text logo with italic style to simulate movement/speed */}
                        <span className={`font-heading font-black italic text-lg md:text-xl tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                            {config.logoText}
                        </span>
                    </div>

                    {/* Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`text-[10px] md:text-xs font-bold tracking-widest transition-colors uppercase ${isDarkMode
                            ? 'text-white hover:text-white/70'
                            : 'text-gray-900 hover:text-gray-600'
                            }`}
                    >
                        {isOpen ? "CLOSE" : "MENU"}
                    </button>
                </motion.div>

                {/* Dropdown Menu - fills remaining space */}
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {/* Main Menu Container */}
                            <motion.div
                                initial={{ opacity: 0, y: -20, scaleY: 0, filter: "blur(10px)" }}
                                animate={{
                                    opacity: 1,
                                    y: 8,
                                    scaleY: 1,
                                    filter: "blur(0px)",
                                    transition: {
                                        duration: baseDuration,
                                        type: "spring",
                                        bounce: 0
                                    }
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -40,
                                    filter: "blur(10px)",
                                    transition: {
                                        duration: baseDuration * 0.75,
                                        delay: baseDuration * 0.6,
                                        ease: [0.4, 0, 1, 1]
                                    }
                                }}
                                style={{ transformOrigin: 'top', borderRadius: `${config.borderRadius}px` }}
                                className={`w-full md:w-[420px] flex-1 overflow-hidden flex flex-col relative z-40 mt-0 backdrop-blur-xl border transition-colors duration-300 ${isDarkMode
                                        ? 'bg-black/40 border-white/10'
                                        : 'bg-white/60 border-black/10'
                                    }`}
                            >
                                {/* Menu Items - takes remaining space and centers content */}
                                <div className="flex-1 flex flex-col items-center justify-center gap-3 md:gap-4 py-6 md:py-8 w-full">
                                    {["HOME", "REGISTER", "TRAINING", "ABOUT"].map((item, i) => (
                                        <motion.a
                                            key={item}
                                            href="#"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ delay: i * staggerDelay + 0.1, duration: baseDuration * 0.75 }}
                                            className={`font-heading font-black text-6xl md:text-6xl tracking-tighter transition-colors uppercase ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'
                                                }`}
                                            style={{ color: config.accentColor }}
                                        >
                                            {item}
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Privacy Policy Container - appears after main menu expands */}
                            <motion.div
                                initial={{ opacity: 0, y: -30, scaleY: 0 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scaleY: 1,
                                    transition: {
                                        duration: baseDuration * 0.7,
                                        delay: baseDuration * 0.5,
                                        type: "spring",
                                        bounce: 0
                                    }
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -20,
                                    transition: {
                                        duration: baseDuration * 0.5,
                                        delay: baseDuration * 0.2,
                                        ease: [0.4, 0, 1, 1]
                                    }
                                }}
                                style={{ transformOrigin: 'top', borderRadius: `${Math.round(config.borderRadius * 0.625)}px` }}
                                className={`w-full md:w-[420px] mt-4 py-4 md:py-5 px-4 md:px-6 flex justify-between items-center text-[9px] md:text-[10px] font-mono uppercase shrink-0 z-40 backdrop-blur-xl border transition-colors duration-300 ${isDarkMode
                                        ? 'bg-black/40 border-white/10 text-white/40'
                                        : 'bg-white/60 border-black/10 text-gray-500'
                                    }`}
                            >
                                <span className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}>Privacy Policy</span>
                                <span className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}`}>Terms of Use</span>
                            </motion.div>

                            {/* Theme Toggle Container - appears after privacy container */}
                            <motion.div
                                initial={{ opacity: 0, y: -30, scaleY: 0 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scaleY: 1,
                                    transition: {
                                        duration: baseDuration * 0.7,
                                        delay: baseDuration * 0.65,
                                        type: "spring",
                                        bounce: 0
                                    }
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -20,
                                    transition: {
                                        duration: baseDuration * 0.5,
                                        delay: 0,
                                        ease: [0.4, 0, 1, 1]
                                    }
                                }}
                                style={{ transformOrigin: 'top', borderRadius: `${Math.round(config.borderRadius * 0.625)}px` }}
                                className={`w-full md:w-[420px] mt-2 grid grid-cols-2 shrink-0 overflow-hidden z-40 backdrop-blur-xl border transition-colors duration-300 ${isDarkMode
                                        ? 'bg-black/40 border-white/10 divide-white/10'
                                        : 'bg-white/60 border-black/10 divide-black/10'
                                    } divide-x`}
                            >
                                <button
                                    onClick={() => setIsDarkMode(false)}
                                    className={`py-4 md:py-5 text-[9px] md:text-[10px] font-bold transition-colors flex items-center justify-center gap-2 ${!isDarkMode
                                            ? 'text-gray-900 bg-white/30'
                                            : 'text-white/40 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="5" />
                                        <line x1="12" y1="1" x2="12" y2="3" />
                                        <line x1="12" y1="21" x2="12" y2="23" />
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                        <line x1="1" y1="12" x2="3" y2="12" />
                                        <line x1="21" y1="12" x2="23" y2="12" />
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                    </svg>
                                    LIGHT
                                </button>
                                <button
                                    onClick={() => setIsDarkMode(true)}
                                    className={`py-4 md:py-5 text-[9px] md:text-[10px] font-bold transition-colors flex items-center justify-center gap-2 ${isDarkMode
                                            ? 'text-white bg-white/10'
                                            : 'text-gray-400 hover:text-gray-900 hover:bg-black/5'
                                        }`}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    </svg>
                                    DARK
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
