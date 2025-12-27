"use client";

import React from "react";
import { motion } from "framer-motion";

type ProgressiveBlurProps = {
    className?: string;
    position?: "top" | "bottom";
    height?: string;
    blurAmount?: string;
};

const ProgressiveBlur = ({
    className = "",
    position = "top",
    height = "100px",
    blurAmount = "2px",
}: ProgressiveBlurProps) => {
    const isTop = position === "top";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className={`pointer-events-none absolute left-0 right-0 w-full select-none z-10 ${className}`}
            style={{
                [isTop ? "top" : "bottom"]: 0,
                height,
                background: isTop
                    ? `linear-gradient(to top, transparent, var(--background))`
                    : `linear-gradient(to bottom, transparent, var(--background))`,
                maskImage: isTop
                    ? `linear-gradient(to bottom, var(--background) 50%, transparent)`
                    : `linear-gradient(to top, var(--background) 50%, transparent)`,
                WebkitBackdropFilter: `blur(${blurAmount})`,
                backdropFilter: `blur(${blurAmount})`,
                WebkitUserSelect: "none",
                userSelect: "none",
            }}
        />
    );
};

export { ProgressiveBlur };
