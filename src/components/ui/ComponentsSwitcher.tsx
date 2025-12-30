"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const tabs = [
    { id: "styles", label: "Style Specific" },
    { id: "normal", label: "Normal" },
] as const;

export type TabId = (typeof tabs)[number]["id"];

interface ComponentsSwitcherProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function ComponentsSwitcher({ activeTab, onTabChange }: ComponentsSwitcherProps) {
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const currentTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "dark";
        setTheme(currentTheme);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "data-theme") {
                    const newTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "dark";
                    setTheme(newTheme);
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, []);

    if (!mounted) return null;

    const isLight = theme === "light";

    return (
        <div className={`relative flex space-x-1 rounded-full p-1 backdrop-blur-md border w-fit mx-auto transition-colors duration-300
            ${isLight
                ? "bg-black/5 border-black/10"
                : "bg-white/5 border-white/10"
            }
        `}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    style={{
                        WebkitTapHighlightColor: "transparent",
                    }}
                    className={`relative z-20 rounded-full px-4 py-1.5 md:px-6 md:py-2 text-xs md:text-sm font-medium transition-colors duration-300 focus:outline-none 
                        ${activeTab === tab.id
                            ? "text-black"
                            : isLight
                                ? "text-black/60 hover:text-black/80"
                                : "text-white/60 hover:text-white/80"
                        }
                    `}
                >
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 z-10 rounded-full bg-white mix-blend-normal shadow-sm"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-20">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
