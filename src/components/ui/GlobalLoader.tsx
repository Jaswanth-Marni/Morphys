"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function GlobalLoader() {
    return (
        <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/30"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 dark:bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-black/5 dark:border-white/10 shadow-xl flex items-center gap-3"
            >
                <Loader2 className="w-4 h-4 text-foreground animate-spin" />
                <span className="text-sm font-medium tracking-widest uppercase text-foreground">Loading</span>
            </motion.div>
        </motion.div>
    );
}
