"use client";

import React from "react";
import { LayoutGroup, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

type TransitionProviderProps = {
    children: React.ReactNode;
};

export const TransitionProvider = ({ children }: TransitionProviderProps) => {
    const pathname = usePathname();

    return (
        <LayoutGroup>
            <AnimatePresence mode="wait">
                <div key={pathname}>
                    {children}
                </div>
            </AnimatePresence>
        </LayoutGroup>
    );
};

export default TransitionProvider;
