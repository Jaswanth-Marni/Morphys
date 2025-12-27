"use client";

import { useEffect } from "react";

/**
 * ScrollToTop Component
 * Forces the page to scroll to the top when the component mounts (page load/refresh).
 * This ensures users always start at the beginning of the page.
 */
const ScrollToTop = () => {
    useEffect(() => {
        // Disable browser's default scroll restoration to ensure we always start at top
        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }

        // Scroll to top immediately on mount
        window.scrollTo(0, 0);

        // Also handle the case where the browser tries to restore scroll position
        // by using a small timeout to override it
        const timeoutId = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 10);

        return () => clearTimeout(timeoutId);
    }, []);

    return null; // This component doesn't render anything
};

export { ScrollToTop };
