"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavigationLoadingContextType {
    isLoading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType>({
    isLoading: false,
    startLoading: () => { },
    stopLoading: () => { },
});

export function useNavigationLoading() {
    return useContext(NavigationLoadingContext);
}

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    const startLoading = useCallback(() => setIsLoading(true), []);
    const stopLoading = useCallback(() => setIsLoading(false), []);

    return (
        <NavigationLoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
            {children}

            {/* Full-screen loading overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-3 border-foreground/10 border-t-foreground/50 rounded-full animate-spin" />
                            <span className="text-sm text-foreground/60">Loading component...</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </NavigationLoadingContext.Provider>
    );
}
