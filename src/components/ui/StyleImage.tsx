"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type StyleImageProps = {
    src: string;
    alt: string;
    layoutId: string;
    className?: string;
    priority?: boolean;
};

export const StyleImage = ({ src, alt, layoutId, className = "", priority = false }: StyleImageProps) => {
    return (
        <motion.div
            className={`relative w-full h-full overflow-hidden ${className}`}
            layoutId={layoutId}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
            }}
        >
            <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
                priority={priority}
            />
            {/* Overlay Gradient reused inside motion component to move with it */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 pointer-events-none" />
        </motion.div>
    );
};
