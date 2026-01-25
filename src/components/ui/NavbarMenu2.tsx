"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// PREVIEW COMPONENT (For Component Card)
// ============================================

export function NavbarMenu2Preview() {
    return (
        <div className="w-full h-full flex items-center justify-center p-4 bg-gray-50/50">
            {/* Navbar representation */}
            <div className="w-[180px] h-10 bg-white rounded-full flex items-center justify-between px-4 shadow-sm border border-black/5">
                <span className="font-logo italic font-black text-xs text-black">Morphys</span>
                <div className="flex flex-col gap-[3px]">
                    <div className="w-3 h-0.5 bg-black rounded-full" />
                    <div className="w-3 h-0.5 bg-black rounded-full" />
                </div>
            </div>
        </div>
    );
}

// ============================================
// TYPES & CONFIG
// ============================================

export interface NavbarMenu2Config {
    logoText: string;
    backgroundColor: string;
    textColor: string;
}

export interface NavbarMenu2Props {
    config?: Partial<NavbarMenu2Config>;
}

const defaultConfig: NavbarMenu2Config = {
    logoText: "Morphys",
    backgroundColor: "#ffffff",
    textColor: "#000000",
};

// ============================================
// MAIN COMPONENT
// ============================================

export function NavbarMenu2({ config: userConfig }: NavbarMenu2Props = {}) {
    const config = { ...defaultConfig, ...userConfig };
    const [isOpen, setIsOpen] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // Get container dimensions for expansion
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setContainerSize({ width: rect.width, height: rect.height });
                // Mark as initialized once we have valid dimensions
                if (rect.width > 0 && rect.height > 0) {
                    setHasInitialized(true);
                }
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Toggle menu state
    const toggleMenu = () => setIsOpen(!isOpen);

    // Closed navbar dimensions - responsive
    const isMobile = containerSize.width < 640;
    const closedWidth = isMobile ? containerSize.width - 32 : Math.min(420, containerSize.width - 32);
    const closedHeight = isMobile ? 52 : 56;
    const topOffset = Math.max(20, containerSize.height * 0.15); // 15% from top, minimum 20px
    const navbarPadding = isMobile ? 20 : 24; // Internal padding of navbar

    // Calculate positions
    const closedLeft = (containerSize.width - closedWidth) / 2;
    const closedTop = topOffset;

    // When open, padding should be such that logo stays at same screen position
    // Logo screen X when closed = closedLeft + navbarPadding
    // Logo screen X when open with paddingLeft P = P
    // So P = closedLeft + navbarPadding
    const openPaddingLeft = closedLeft + navbarPadding;
    const openPaddingRight = closedLeft + navbarPadding;

    // Animation transition - buttery smooth spring
    const springTransition = {
        type: "spring" as const,
        stiffness: 80,
        damping: 18,
        mass: 0.8,
    };

    const menuItemVariants = {
        hidden: {
            opacity: 0,
            y: 60,
            filter: "blur(8px)"
        },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 20,
                delay: i * 0.08 + 0.15
            }
        }),
        exit: (i: number) => ({
            opacity: 0,
            y: -30,
            filter: "blur(4px)",
            transition: {
                duration: 0.2,
                delay: (3 - i) * 0.03
            }
        })
    };

    const footerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.5,
                duration: 0.4
            }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.15 }
        }
    };

    const menuItems = ['SERVICES', 'ABOUT', 'ROLES', 'CONTACT'];

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden"
            style={{ backgroundColor: '#e7e5df' }}
        >
            {hasInitialized && (
                <motion.div
                    initial={{
                        width: closedWidth * 0.5,
                        height: closedHeight,
                        left: closedLeft + (closedWidth * 0.25),
                        top: -80,
                        borderRadius: 100,
                        opacity: 0,
                    }}
                    animate={{
                        width: isOpen ? containerSize.width : closedWidth,
                        height: isOpen ? containerSize.height : closedHeight,
                        left: isOpen ? 0 : closedLeft,
                        top: isOpen ? 0 : closedTop,
                        borderRadius: isOpen ? 0 : 100,
                        opacity: 1,
                    }}
                    transition={springTransition}
                    className="absolute flex flex-col overflow-hidden z-50"
                    style={{
                        backgroundColor: config.backgroundColor,
                        color: config.textColor,
                        boxShadow: isOpen
                            ? 'none'
                            : '0 8px 32px -8px rgba(0,0,0,0.12), 0 4px 16px -4px rgba(0,0,0,0.08)',
                    }}
                >
                    {/* Header Bar - Logo and button stay at same screen position */}
                    <motion.div
                        className="flex items-center justify-between shrink-0 w-full"
                        animate={{
                            height: isOpen ? (closedHeight + topOffset) : closedHeight,
                            paddingLeft: isOpen ? openPaddingLeft : navbarPadding,
                            paddingRight: isOpen ? openPaddingRight : navbarPadding,
                            paddingTop: isOpen ? topOffset : 0,
                        }}
                        transition={springTransition}
                    >
                        {/* Logo */}
                        <span className="font-logo italic font-black text-xl md:text-2xl tracking-tight cursor-pointer select-none">
                            {config.logoText}
                        </span>

                        {/* Hamburger / Close Button */}
                        <button
                            onClick={toggleMenu}
                            className="relative z-50 p-2 -mr-2 focus:outline-none"
                        >
                            <div className="flex flex-col gap-[5px] items-center justify-center w-7 h-7">
                                <motion.span
                                    animate={isOpen
                                        ? { rotate: 45, y: 7, width: 24 }
                                        : { rotate: 0, y: 0, width: 20 }
                                    }
                                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                    className="h-[2px] block origin-center"
                                    style={{ backgroundColor: config.textColor }}
                                />
                                <motion.span
                                    animate={isOpen
                                        ? { opacity: 0, scaleX: 0 }
                                        : { opacity: 1, scaleX: 1 }
                                    }
                                    transition={{ duration: 0.2 }}
                                    className="w-5 h-[2px] block"
                                    style={{ backgroundColor: config.textColor }}
                                />
                                <motion.span
                                    animate={isOpen
                                        ? { rotate: -45, y: -7, width: 24 }
                                        : { rotate: 0, y: 0, width: 20 }
                                    }
                                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                    className="h-[2px] block origin-center"
                                    style={{ backgroundColor: config.textColor }}
                                />
                            </div>
                        </button>
                    </motion.div>

                    {/* Expanded Menu Content */}
                    <AnimatePresence mode="wait">
                        {isOpen && (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="flex-1 flex flex-col justify-center items-center relative px-6 md:px-10"
                            >
                                {/* Main Links */}
                                <div className="flex flex-col items-start justify-center gap-1 sm:gap-2 md:gap-4 w-full pl-4 sm:pl-0 sm:items-center">
                                    {menuItems.map((item, i) => (
                                        <motion.div
                                            key={item}
                                            custom={i}
                                            variants={menuItemVariants}
                                            className="overflow-hidden relative group cursor-pointer"
                                        >
                                            <div className="flex items-baseline gap-2 sm:gap-3">
                                                <span
                                                    className="text-[8px] sm:text-[10px] md:text-xs font-mono opacity-40"
                                                    style={{ color: config.textColor }}
                                                >
                                                    /0{i + 1}
                                                </span>
                                                <span
                                                    className="block text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-serif font-normal tracking-tight transition-all duration-300 group-hover:italic"
                                                    style={{ color: config.textColor }}
                                                >
                                                    {item}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Footer Info */}
                                <motion.div
                                    variants={footerVariants}
                                    className="absolute bottom-4 sm:bottom-6 md:bottom-10 left-0 w-full px-4 sm:px-6 md:px-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-4 text-[10px] sm:text-xs md:text-sm font-mono"
                                    style={{ color: config.textColor, opacity: 0.5 }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-base sm:text-lg">✦</span>
                                        <p>Curated Chaos</p>
                                    </div>
                                    <div className="flex gap-4 sm:gap-6 md:gap-8">
                                        <a href="#" className="hover:opacity-100 transition-opacity uppercase tracking-wider">Instagram</a>
                                        <a href="#" className="hover:opacity-100 transition-opacity uppercase tracking-wider">Contact</a>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}

export default NavbarMenu2;
