"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MenuContextType {
    isMenuOpen: boolean;
    showGlassPill: boolean;
    toggleMenu: () => void;
    closeMenu: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showGlassPill, setShowGlassPill] = useState(true);
    const [wasMenuOpen, setWasMenuOpen] = useState(false);

    // Track menu state changes to coordinate GlassPill animation
    useEffect(() => {
        if (isMenuOpen) {
            // Menu opening - GlassPill stays visible (acts as close button)
            setShowGlassPill(true);
            setWasMenuOpen(true);
        } else if (wasMenuOpen) {
            // Menu closing - hide GlassPill, then show it after navbar appears
            setShowGlassPill(false);

            // Wait for navbar to appear (~400ms), then show GlassPill with animation
            const timer = setTimeout(() => {
                setShowGlassPill(true);
            }, 400);

            return () => clearTimeout(timer);
        }
    }, [isMenuOpen, wasMenuOpen]);

    const toggleMenu = () => setIsMenuOpen(prev => !prev);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <MenuContext.Provider value={{ isMenuOpen, showGlassPill, toggleMenu, closeMenu }}>
            {children}
        </MenuContext.Provider>
    );
};

export const useMenu = () => {
    const context = useContext(MenuContext);
    if (context === undefined) {
        throw new Error('useMenu must be used within a MenuProvider');
    }
    return context;
};
