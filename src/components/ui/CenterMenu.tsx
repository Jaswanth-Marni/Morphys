"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, ArrowUpRight } from "lucide-react";

export const CenterMenu = ({ className = "" }: { className?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && document.documentElement.classList.contains('dark')) {
            setIsDarkMode(true);
        }
    }, []);

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const menuItems = [
        { label: "Work", href: "#" },
        { label: "Studio", href: "#" },
        { label: "News", href: "#" },
        { label: "Contact", href: "#" }
    ];

    const socialLinks = [
        { label: "Instagram", href: "#" },
        { label: "Twitter", href: "#" },
        { label: "LinkedIn", href: "#" }
    ];

    // Define theme-based colors directly
    const bgColor = isDarkMode ? "#1f1f1f" : "#e7e5df";
    const textColor = isDarkMode ? "#ffffff" : "#171717";
    const textMuted = isDarkMode ? "#a3a3a3" : "#737373";
    const borderColor = isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.2)";
    const dividerColor = isDarkMode ? "#262626" : "#e5e5e5";
    const dotColor = isDarkMode ? "#ffffff" : "#171717";
    const closeBtnBg = isDarkMode ? "#262626" : "#e5e5e5";
    const toggleBtnBg = isDarkMode ? "#262626" : "#ffffff";
    const toggleBtnBorder = isDarkMode ? "#404040" : "#e5e5e5";

    // Responsive dimensions
    const pillHeight = isMobile ? 48 : 64;
    const pillRadius = isMobile ? 24 : 32;
    const triggerSize = isMobile ? 48 : 64;
    const expandedWidth = isMobile ? 280 : 340;
    const expandedHeight = isMobile ? 340 : 420;
    const expandedRadius = isMobile ? 20 : 24;

    // Menu content component (shared between mobile and desktop)
    const MenuContent = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex flex-col w-full h-full ${isMobile ? 'p-5 pt-5' : 'p-8 pt-20'}`}
        >
            {/* Main Navigation */}
            <nav className="flex flex-col gap-2">
                {menuItems.map((item, idx) => (
                    <motion.a
                        key={item.label}
                        href={item.href}
                        className={`group flex items-center justify-between font-semibold ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        style={{ color: textColor }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                    >
                        <span>{item.label}</span>
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            whileHover={{ opacity: 1, x: 0 }}
                            className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                        >
                            <ArrowUpRight
                                className={isMobile ? 'w-4 h-4' : 'w-6 h-6'}
                                style={{ color: textMuted }}
                            />
                        </motion.span>
                    </motion.a>
                ))}
            </nav>

            {/* Footer: Socials & Theme */}
            <div
                className={`mt-auto flex items-end justify-between ${isMobile ? 'pt-4' : 'pt-8'}`}
                style={{ borderTop: `1px solid ${dividerColor}` }}
            >
                <div className="flex flex-col gap-2">
                    {socialLinks.map((social, idx) => (
                        <motion.a
                            key={social.label}
                            href={social.href}
                            className={`font-medium transition-colors ${isMobile ? 'text-xs' : 'text-sm'}`}
                            style={{ color: textMuted }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + idx * 0.05 }}
                        >
                            {social.label}
                        </motion.a>
                    ))}
                </div>

                {/* Theme Toggle Button */}
                <motion.button
                    type="button"
                    onClick={toggleTheme}
                    className={`group relative rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}`}
                    style={{
                        backgroundColor: toggleBtnBg,
                        border: `1px solid ${toggleBtnBorder}`,
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="relative">
                        {isDarkMode ? (
                            <Sun className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} style={{ color: "#ffffff" }} />
                        ) : (
                            <Moon className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} style={{ color: "#171717" }} />
                        )}
                    </div>
                </motion.button>
            </div>
        </motion.div>
    );

    // Mobile Layout - Pills in row, menu expands centered below
    if (isMobile) {
        return (
            <div className={`w-full min-h-[600px] flex flex-col items-center pt-10 overflow-hidden ${className}`}>
                <div className="relative flex flex-col items-center z-50 font-sans">
                    {/* Top Row: Logo Pill + Trigger */}
                    <div className="flex items-center gap-2">
                        {/* Logo Pill */}
                        <motion.div
                            layout
                            className="flex items-center justify-center px-5 shadow-lg"
                            style={{
                                height: pillHeight,
                                borderRadius: pillRadius,
                                backgroundColor: bgColor,
                                border: `1px solid ${borderColor}`,
                            }}
                        >
                            <span
                                className="text-base font-bold tracking-tight cursor-default"
                                style={{ color: textColor }}
                            >
                                Morphys
                            </span>
                        </motion.div>

                        {/* Trigger Button */}
                        <motion.button
                            className="flex items-center justify-center shadow-lg focus:outline-none"
                            style={{
                                width: triggerSize,
                                height: triggerSize,
                                borderRadius: pillRadius,
                                backgroundColor: bgColor,
                                border: `1px solid ${borderColor}`,
                            }}
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <motion.div
                                animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: dotColor }}
                            />
                            <motion.div
                                className="absolute flex items-center justify-center pointer-events-none"
                                animate={{ scale: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
                                initial={{ scale: 0, opacity: 0 }}
                            >
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: closeBtnBg }}
                                >
                                    <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: dotColor }}
                                    />
                                </div>
                            </motion.div>
                        </motion.button>
                    </div>

                    {/* Expanded Menu - Centered below pills */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                className="absolute shadow-lg overflow-hidden z-40"
                                style={{
                                    backgroundColor: bgColor,
                                    border: `1px solid ${borderColor}`,
                                    top: pillHeight + 8, // Below the pills with gap
                                    left: '50%',
                                    x: '-50%', // Center horizontally
                                }}
                                initial={{
                                    width: triggerSize,
                                    height: triggerSize,
                                    borderRadius: pillRadius,
                                    opacity: 0,
                                    scale: 0.8,
                                }}
                                animate={{
                                    width: expandedWidth,
                                    height: expandedHeight,
                                    borderRadius: expandedRadius,
                                    opacity: 1,
                                    scale: 1,
                                }}
                                exit={{
                                    width: triggerSize,
                                    height: triggerSize,
                                    borderRadius: pillRadius,
                                    opacity: 0,
                                    scale: 0.8,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                }}
                            >
                                <MenuContent />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    // Desktop Layout - Original horizontal expansion
    return (
        <div className={`w-full min-h-[600px] flex flex-col items-center pt-10 overflow-hidden ${className}`}>
            <div className="relative flex items-start gap-4 z-50 font-sans">
                {/* 1. Logo Pill */}
                <motion.div
                    layout
                    className="flex items-center justify-center px-8 shadow-lg"
                    style={{
                        height: pillHeight,
                        borderRadius: pillRadius,
                        backgroundColor: bgColor,
                        border: `1px solid ${borderColor}`,
                    }}
                >
                    <span
                        className="text-xl font-bold tracking-tight cursor-default"
                        style={{ color: textColor }}
                    >
                        Morphys
                    </span>
                </motion.div>

                {/* 2. Trigger Button / Expanding Menu */}
                <div className="relative" style={{ width: triggerSize, height: triggerSize }}>
                    <motion.div
                        layout
                        className="absolute top-0 left-0 shadow-lg overflow-hidden z-50"
                        style={{
                            backgroundColor: bgColor,
                            border: `1px solid ${borderColor}`,
                        }}
                        initial={false}
                        animate={{
                            width: isOpen ? expandedWidth : triggerSize,
                            height: isOpen ? expandedHeight : triggerSize,
                            borderRadius: isOpen ? expandedRadius : pillRadius,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                        }}
                    >
                        {/* The Trigger Button */}
                        <button
                            className="absolute top-0 left-0 z-20 flex items-center justify-center focus:outline-none"
                            style={{ width: triggerSize, height: triggerSize }}
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <motion.div
                                animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: dotColor }}
                            />
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                animate={{ scale: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
                                initial={{ scale: 0, opacity: 0 }}
                            >
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: closeBtnBg }}
                                >
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: dotColor }}
                                    />
                                </div>
                            </motion.div>
                        </button>

                        {/* Expanded Menu Content */}
                        <AnimatePresence>
                            {isOpen && <MenuContent />}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

