'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AppWindow, Folder, Layers, File, Command, Sun, Moon } from 'lucide-react';

export interface SpotlightSearchConfig {
    morphDelay: number;
    searchWidth: number;
    springStiffness: number;
    springDamping: number;
}

export interface SpotlightSearchProps {
    config?: Partial<SpotlightSearchConfig>;
}

const defaultConfig: SpotlightSearchConfig = {
    morphDelay: 800,
    searchWidth: 600,
    springStiffness: 400,
    springDamping: 15,
};

export default function SpotlightSearch({ config: userConfig }: SpotlightSearchProps = {}) {
    // Merge provided config with defaults
    const config = { ...defaultConfig, ...userConfig };

    const [isOpen, setIsOpen] = useState(false);
    const [isMorphed, setIsMorphed] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [containerWidth, setContainerWidth] = useState(0);

    // Handle resize - measure container
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };

        // Initial measure
        updateWidth();

        // Listen for window resize
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Helper: Determine if we are in a "compact" (mobile-like) environment
    const isCompact = containerWidth > 0 && containerWidth < 640;

    // Handle Ctrl+K shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (inputRef.current) inputRef.current.focus();
            const timer = setTimeout(() => {
                setIsMorphed(true);
            }, config.morphDelay);
            return () => clearTimeout(timer);
        } else {
            setIsMorphed(false);
        }
    }, [isOpen, config.morphDelay]);

    const toggleSearch = () => setIsOpen(!isOpen);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 }
    };

    const actionButtons = [
        { icon: isDark ? Sun : Moon, label: "Theme", action: () => setIsDark(!isDark) },
        { icon: AppWindow, label: "Apps", action: () => { } },
        { icon: Folder, label: "Finder", action: () => { } },
        { icon: Layers, label: "Stack", action: () => { } },
    ];

    return (
        <div
            ref={containerRef}
            className={`h-full w-full flex flex-col items-center justify-center relative font-sans rounded-xl overflow-hidden ${isDark ? 'dark' : ''}`}
            style={{
                backgroundImage: 'url(/back5.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Dark overlay for contrast */}
            <div className={`absolute inset-0 transition-colors duration-500 ${isDark ? 'bg-black/40 backdrop-blur-[2px]' : 'bg-transparent'}`} />

            {/* Content Container */}
            <div className="z-10 flex flex-col items-center gap-8 text-center px-4">
                <h1 className="text-3xl md:text-4xl font-light tracking-tight text-gray-800 dark:text-gray-100">
                    Spotlight Search
                </h1>
                <div className="bg-white/30 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 px-6 py-2.5 rounded-full shadow-sm max-w-full">
                    <p className="text-gray-800 dark:text-gray-200 font-medium flex flex-wrap justify-center items-center gap-2 text-sm md:text-base">
                        Click the button below or
                        <span className="font-mono text-xs bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded border border-black/5 dark:border-white/5 whitespace-nowrap">
                            Ctrl + K
                        </span>
                    </p>
                </div>
            </div>

            {/* Main Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
                        />

                        {/* Search Container */}
                        <motion.div
                            layout
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={containerVariants}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`relative z-10 flex items-center justify-center p-2 ${isCompact ? 'flex-col gap-4' : 'flex-row'}`}
                        // Constraint max width prevents valid width animation if we hardcode width logic below?
                        // We handle size logic in children.
                        >
                            {/* Search Bar Input Area */}
                            <motion.div
                                layout
                                className={`
                  relative flex items-center overflow-hidden
                  backdrop-blur-xl border
                  shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
                  transition-colors duration-300
                  ${isDark
                                        ? 'bg-black/40 border-white/10'
                                        : 'bg-white/30 border-white/20'
                                    }
                `}
                                style={{
                                    borderRadius: 32,
                                    height: '64px'
                                }}
                                animate={{
                                    // Robust width logic:
                                    // 1. If compact (mobile), always full width minus margins
                                    // 2. If morphed, shrink to 380 (or available space)
                                    // 3. Otherwise default config width (or available space)
                                    width: isCompact
                                        ? Math.max(280, containerWidth - 32)
                                        : isMorphed
                                            ? Math.min(380, containerWidth - 80)
                                            : Math.min(config.searchWidth, containerWidth - 48)
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: config.springStiffness,
                                    damping: config.springDamping,
                                    mass: 0.8
                                }}
                            >
                                <div className="pl-6 pr-4 text-gray-500 dark:text-gray-400 shrink-0">
                                    <Search size={24} strokeWidth={2} />
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Spotlight Search"
                                    className={`w-full h-full bg-transparent border-none outline-none text-xl placeholder-gray-500/70 transition-colors duration-300 ${isDark ? 'text-white dark:placeholder-gray-400/70' : 'text-gray-800'}`}
                                />

                                {/* Right side placeholder that disappears */}
                                <AnimatePresence mode='popLayout'>
                                    {!isMorphed && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute right-6 flex items-center gap-2 text-sm text-gray-500/70 font-medium"
                                        >
                                            <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-md border border-white/20 hidden sm:flex">
                                                <Command size={14} /> K
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Action Buttons (Morphing out) */}
                            {/* Layout Logic: If Compact, buttons are below. If not compact, to the right */}
                            <motion.div
                                layout
                                className={`flex items-center gap-2 md:gap-3 ${isCompact ? 'mt-0 w-auto justify-center' : 'ml-3 h-full'}`}
                            >
                                <AnimatePresence mode='popLayout'>
                                    {isMorphed && actionButtons.map((btn, index) => (
                                        <motion.button
                                            key={btn.label}
                                            onClick={btn.action}
                                            initial={{ scale: 0, opacity: 0, x: -20 }}
                                            animate={{
                                                scale: 1,
                                                opacity: 1,
                                                x: 0,
                                                transition: {
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 15,
                                                    delay: index * 0.05 + 0.1
                                                }
                                            }}
                                            exit={{
                                                scale: 0,
                                                opacity: 0,
                                                x: -20,
                                                transition: { duration: 0.2 }
                                            }}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`
                        w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center
                        backdrop-blur-xl border transition-colors duration-300
                        shadow-lg
                        ${isDark
                                                    ? 'bg-black/40 border-white/10 text-gray-200 hover:bg-white/20'
                                                    : 'bg-white/30 border-white/20 text-gray-700 hover:bg-white/50'
                                                }
                      `}
                                        >
                                            <btn.icon size={isCompact ? 20 : 24} strokeWidth={2} />
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            </motion.div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Trigger Button at Bottom */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 w-full flex justify-center px-4">
                <motion.button
                    onClick={toggleSearch}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
            flex items-center gap-3 px-6 py-3 rounded-full
            backdrop-blur-md border transition-colors duration-300
            shadow-lg hover:shadow-xl
            ${isDark
                            ? 'bg-black/30 border-white/10 text-white'
                            : 'bg-white/30 border-white/20 text-gray-800'
                        }
            font-medium text-sm md:text-base whitespace-nowrap
          `}
                >
                    <Search size={20} />
                    <span>Open Spotlight</span>
                </motion.button>
            </div>

        </div>
    );
}

export function SpotlightSearchPreview() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black rounded-[20px] overflow-hidden">
            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg rounded-full px-4 py-2 flex items-center gap-2 w-[80%]">
                <Search size={16} className="text-gray-500 dark:text-gray-400" />
                <div className="h-2 w-20 bg-gray-400/20 rounded-full" />
            </div>
        </div>
    );
}
