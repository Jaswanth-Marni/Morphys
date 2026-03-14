import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FullScreenMenu() {
    const [isOpen, setIsOpen] = useState(false);

    const menuVariants: any = {
        initial: { y: "-100%" },
        animate: {
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.76, 0, 0.24, 1],
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        },
        exit: {
            y: "-100%",
            transition: {
                duration: 0.8,
                ease: [0.76, 0, 0.24, 1]
            }
        }
    };

    const itemVariants: any = {
        initial: { y: 50, opacity: 0 },
        animate: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
        exit: { opacity: 0, transition: { duration: 0.2 } }
    };

    return (
        <div style={{ containerType: "inline-size" }} className="relative w-full h-full min-h-[600px] bg-transparent text-[#1a1a1a] overflow-hidden flex flex-col font-sans">
            {/* Minimal Menu Button when closed */}
            <div className={`absolute inset-0 flex justify-center items-center z-0 transition-opacity duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 group hover:opacity-70 transition-opacity"
                >
                    <span className="text-sm md:text-base font-bold tracking-widest uppercase relative before:absolute before:-bottom-1 before:left-0 before:w-full before:h-[1px] before:bg-[#1a1a1a] before:scale-x-0 group-hover:before:scale-x-100 before:transition-transform before:duration-300 before:origin-right group-hover:before:origin-left">
                        MENU
                    </span>
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={menuVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute inset-0 bg-[#acaa9c] text-[#1a1a1a] flex flex-col z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <motion.div variants={itemVariants} className="flex justify-end items-start w-full px-8 py-6 z-10 absolute top-0 left-0 right-0">
                            <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
                                <h1 className="font-sans font-black italic text-5xl md:text-6xl tracking-tighter flex items-start mt-[-0.5rem]">
                                    morphys
                                    <span className="text-xl not-italic font-sans -mt-1 ml-0.5">®</span>
                                </h1>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 group hover:opacity-70 transition-opacity mt-1"
                            >
                                <span className="text-sm md:text-base font-bold tracking-widest uppercase relative before:absolute before:-bottom-1 before:left-0 before:w-full before:h-[1px] before:bg-[#1a1a1a] before:scale-x-0 group-hover:before:scale-x-100 before:transition-transform before:duration-300 before:origin-right group-hover:before:origin-left">
                                    CLOSE
                                </span>
                                <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </motion.div>

                        {/* Main Menu Links Grid */}
                        <div className="flex-1 w-full flex flex-col justify-center px-4 md:px-12 xl:px-24 mt-20 mb-12">
                            <motion.div variants={itemVariants} className="w-full h-px border-t border-dashed border-[#1a1a1a]/40" />

                            <motion.div variants={itemVariants}>
                                <MenuItem text="HOME" align="left" marginTopClass="pt-[31px]" />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <MenuItem text="WORK" align="left" offsetClass="ml-[15%] md:ml-[18%]" />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <MenuItem text="DIRECTORS" align="center" />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <MenuItem text="ABOUT" align="right" offsetClass="mr-[15%] md:mr-[20%]" />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <MenuItem text="NEWS" align="left" />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <MenuItem text="CONTACT" align="center" />
                            </motion.div>
                        </div>

                        {/* Footer */}
                        <motion.div variants={itemVariants} className="flex justify-between items-end w-full px-8 pb-6 z-10 absolute bottom-0 left-0 right-0">
                            <div className="flex flex-col text-[10px] md:text-xs font-bold uppercase tracking-widest gap-1">
                                <span className="italic font-serif font-normal text-black/80 capitalize">(Privacy)</span>
                                <span className="uppercase">PRIVACY POLICY</span>
                            </div>

                            <div className="absolute left-1/2 -translate-x-1/2 bottom-6 text-[11px] md:text-xs font-serif italic text-[#1a1a1a] tracking-wide">
                                2026© Morphys
                            </div>

                            <div className="flex flex-col items-end text-[10px] md:text-xs font-bold tracking-widest gap-1 pr-6 pb-6 md:pb-0">
                                <span className="italic font-serif font-normal text-black/80 capitalize">(Legal)</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MenuItem({
    text,
    align,
    offsetClass = "",
    marginTopClass = "pt-[30px]"
}: {
    text: string;
    align: "left" | "center" | "right";
    offsetClass?: string;
    marginTopClass?: string;
}) {
    let containerClass = "justify-start";
    if (align === "center") containerClass = "justify-center";
    if (align === "right") containerClass = "justify-end";

    return (
        <div className={`w-full flex flex-col group relative overflow-hidden cursor-pointer ${marginTopClass}`}>

            {/* Hover Background - Animates up from bottom */}
            <div className="absolute inset-0 w-full h-full bg-[#1a1a1a] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-0" />

            <div className={`w-full flex ${containerClass} px-2 relative z-10`}>
                <div className={`relative flex items-end ${offsetClass}`}>
                    <span className="font-kugile text-[clamp(35px,9cqi,85px)] leading-[0.7] tracking-tight text-[#1a1a1a] group-hover:text-[#acaa9c] transition-colors duration-500 origin-bottom">
                        {text}
                    </span>
                </div>
            </div>
            {/* Dashed line under each item */}
            <div className="w-full h-px border-t border-dashed border-[#1a1a1a]/40 group-hover:border-[#1a1a1a]/0 transition-colors duration-500 -mt-[10px] relative z-10" />
        </div>
    );
}
