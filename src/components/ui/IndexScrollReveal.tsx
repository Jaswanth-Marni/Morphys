"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

export interface ScrollItem {
    id: string;
    index: string;
    title: string;
    description?: string;
    image: string;
    color: string;
}

export interface IndexScrollRevealProps {
    items?: ScrollItem[];
    className?: string;
    title?: string;
    config?: any; // Allow config object for sandbox compatibility
}

const defaultItems: ScrollItem[] = [
    {
        id: "1",
        index: "01",
        title: "Chainsaw Man",
        image: "/desktop/chainsaw-man-the-5120x2880-23013.jpg",
        color: "#f05023" // Orange
    },
    {
        id: "2",
        index: "02",
        title: "Dandadan",
        image: "/desktop/dandadan-evil-eye-5120x2880-22717.jpg",
        color: "#ff004d" // Pink/Red
    },
    {
        id: "3",
        index: "03",
        title: "Demon Slayer",
        image: "/desktop/demon-slayer-3840x2160-23615.jpg",
        color: "#2a52be" // Blue
    },
    {
        id: "4",
        index: "04",
        title: "Gachiakuta",
        image: "/desktop/gachiakuta-3840x2160-22842.jpg",
        color: "#eaff00" // Yellow
    },
    {
        id: "5",
        index: "05",
        title: "Jujutsu Kaisen",
        image: "/desktop/jujutsu-kaisen-3840x2160-19746.jpg",
        color: "#4a00e0" // Purple
    },
    {
        id: "6",
        index: "06",
        title: "Kaiju No. 8",
        image: "/desktop/kaiju-no-8-mission-7680x4320-21963.jpg",
        color: "#00b2ff" // Cyan
    },
    {
        id: "7",
        index: "07",
        title: "One Piece",
        image: "/desktop/one-piece-season-15-3840x2160-22064.jpg",
        color: "#ff0000" // Red
    },
    {
        id: "8",
        index: "08",
        title: "Sakamoto Days",
        image: "/desktop/sakamoto-days-5120x2880-23913.jpg",
        color: "#111111" // Black
    },
    {
        id: "9",
        index: "09",
        title: "Solo Leveling",
        image: "/desktop/solo-leveling-3840x2160-20374.png",
        color: "#3a3a3a" // Dark Gray
    },
    {
        id: "10",
        index: "10",
        title: "Spy x Family",
        image: "/desktop/spy-x-family-season-5120x2880-24443.png",
        color: "#008a00" // Green
    },
    {
        id: "11",
        index: "11",
        title: "To Be Hero X",
        image: "/desktop/to-be-hero-x-anime-3840x2160-22645.jpg",
        color: "#cc00ff" // Purple
    }
];

// Individual Right Side Section
const RightSection = ({ 
    item, 
    setActiveIndex, 
    index,
    root
}: { 
    item: ScrollItem; 
    setActiveIndex: (val: number) => void; 
    index: number;
    root?: React.RefObject<HTMLElement | null>;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { 
        margin: "-50% 0px -50% 0px",
        root: root as React.RefObject<Element>
    });

    useEffect(() => {
        if (isInView) {
            setActiveIndex(index);
        }
    }, [isInView, index, setActiveIndex]);

    return (
        <div 
            ref={ref}
            id={`section-${index}`}
            className="w-full flex flex-col gap-2 md:gap-3 scroll-mt-2 md:scroll-mt-3"
        >
            {/* Title Container - Consistent Gap with images */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                className="w-full shrink-0 flex items-center justify-between rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-12 lg:p-16 overflow-hidden relative border border-white/10"
                style={{ backgroundColor: item.color }}
            >
                <div className="flex justify-between items-center w-full z-10 relative translate-y-0.5">
                    <span className="text-white mix-blend-difference text-lg md:text-3xl font-bold font-mono tracking-tight">
                        {item.index}
                    </span>
                    <h2 className="text-2xl md:text-7xl lg:text-9xl text-white mix-blend-difference font-black font-mono tracking-tighter uppercase leading-none">
                        {item.title}
                    </h2>
                </div>
                {/* Grain Texture */}
                <div className="absolute inset-0 opacity-[0.05] select-none pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
            </motion.div>

            {/* Picture Container */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: 0.1 }}
                className="w-full h-[60vh] md:h-screen rounded-[1.5rem] md:rounded-[2rem] overflow-hidden relative border border-black/5"
            >
                <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                />
            </motion.div>
        </div>
    );
};

export function IndexScrollReveal({ items = defaultItems, className = "", title = "MORPHYS" }: IndexScrollRevealProps) {
    const [activeIndex, setActiveIndex] = useState(-1);

    return (
        <div className={`w-full bg-[#f4ece3] text-zinc-900 relative flex flex-row p-2 md:p-3 gap-1.5 md:gap-3 ${className}`}>
            {/* Left Side: Index Navigation */}
            <div className="w-10 md:w-18 lg:w-22 h-[calc(100vh-1rem)] md:h-[calc(100vh-1.5rem)] sticky top-2 md:top-3 flex flex-col gap-1 z-50">
                {items.map((item, index) => {
                    const isActive = activeIndex === index;
                    return (
                        <motion.div
                            key={item.id}
                            className="w-full rounded-2xl md:rounded-3xl relative overflow-hidden cursor-pointer"
                            animate={{
                                flex: isActive ? 12 : 1,
                                backgroundColor: isActive ? item.color : "rgba(0,0,0,0.06)",
                            }}
                            transition={{
                                duration: 0.8,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                            onClick={() => {
                                document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            {/* Content */}
                            <div className="absolute inset-0 p-2 md:p-3 flex items-center justify-center pointer-events-none">
                                <motion.span
                                    animate={{
                                        color: isActive ? "#ffffff" : "#000000",
                                        opacity: isActive ? 1 : 0.4,
                                        scale: isActive ? 2.5 : 1,
                                        rotate: isActive ? 0 : -90
                                    }}
                                    transition={{ duration: 0.6 }}
                                    className="text-[10px] md:text-sm font-black font-mono mix-blend-difference"
                                >
                                    {item.index}
                                </motion.span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Right Side: Main Content area */}
            <div className="flex-1 w-full bg-zinc-900/5 rounded-[2.5rem] border border-black/5 px-2 md:px-3 flex flex-col gap-2 md:gap-3 relative">
                {/* Intro Section */}
                <div className="w-full h-screen flex flex-col items-center justify-center">
                    <div 
                        className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/5 rounded-[2rem] border border-black/5 relative overflow-hidden backdrop-blur-sm"
                        style={{ containerType: 'inline-size' }}
                    >
                         <div className="absolute top-10 left-10 md:top-16 md:left-16 flex flex-col gap-1">
                            <span className="text-[10px] md:text-xs font-bold font-mono uppercase tracking-[0.3em] opacity-40">System</span>
                            <h1 className="text-xl md:text-3xl font-black font-mono leading-none tracking-tighter uppercase whitespace-nowrap">Morphys<br />Archive</h1>
                         </div>
                         <div className="absolute top-10 right-10 md:top-16 md:right-16 text-right">
                            <span className="text-[10px] md:text-xs font-bold font-mono uppercase tracking-[0.3em] opacity-40 italic">Ver 1.0.4</span>
                         </div>
                         
                         <div className="relative z-10 flex flex-col items-center px-4">
                            <h1 className="text-[19cqw] leading-none font-black font-mono tracking-tighter opacity-[0.03] select-none uppercase truncate max-w-full text-center">
                                {title}
                            </h1>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="px-4 py-2 md:px-5 md:py-2.5 bg-white/40 backdrop-blur-md border border-black/5 rounded-full flex items-center gap-2 md:gap-2.5 shadow-[0_4px_10px_rgba(0,0,0,0.03)]"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                                    <span className="text-[9px] md:text-[11px] font-bold font-mono uppercase tracking-[0.2em] text-black/60 whitespace-nowrap">
                                        Interface / Reveal
                                    </span>
                                </motion.div>
                            </div>
                         </div>

                         <div className="absolute bottom-10 md:bottom-16 flex flex-col items-center gap-6">
                            <p className="text-[10px] md:text-xs font-black font-mono uppercase tracking-[0.5em] opacity-40">Begin Exploration</p>
                            <div className="relative w-px h-16 md:h-24 bg-gradient-to-b from-black/20 to-transparent">
                                <motion.div 
                                    animate={{ 
                                        y: [0, 60, 0],
                                        opacity: [0, 1, 0]
                                    }} 
                                    transition={{ 
                                        duration: 2.5, 
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute top-0 left-[-1.5px] w-[4px] h-8 bg-black rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]" 
                                />
                            </div>
                         </div>
                    </div>
                </div>

                {/* Content Sections */}
                {items.map((item, index) => (
                    <RightSection 
                        key={item.id} 
                        item={item} 
                        index={index} 
                        setActiveIndex={setActiveIndex} 
                    />
                ))}
            </div>
        </div>
    );
}

// Sandbox version with internal scroll for component detail pages
export function IndexScrollRevealSandbox({ items: propItems, className = "", title: propTitle, config }: IndexScrollRevealProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(-1);
    
    // Use config if available (from preview page), otherwise props, otherwise defaults
    const items = config?.items || propItems || defaultItems;
    const title = config?.title || propTitle || "MORPHYS";

    // Robust manual scroll handling to bypass global scroll interceptors (like Lenis)
    useEffect(() => {
        const wrapper = wrapperRef.current;
        const container = containerRef.current;
        if (!wrapper || !container) return;

        const handleWheel = (e: WheelEvent) => {
            // Stop this event from reaching Lenis or the main page
            e.preventDefault();
            e.stopPropagation();

            // Manually update scroll position
            // This is the most reliable way to ensure internal scrolling in a sandbox
            container.scrollTop += e.deltaY;
        };

        wrapper.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            wrapper.removeEventListener('wheel', handleWheel);
        };
    }, []);

    return (
        <div 
            ref={wrapperRef}
            className={`w-full h-full overflow-hidden bg-[#f4ece3] text-zinc-900 relative p-2 md:p-3 ${className}`}
        >
            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            <div className="flex w-full h-full relative gap-2 md:gap-3">
                {/* Left Side: Index Navigation */}
                <div className="w-14 md:w-18 lg:w-22 h-full sticky top-0 flex flex-col gap-1 z-50 pointer-events-none">
                    <div className="pointer-events-auto flex flex-col gap-1 w-full h-full">
                        {items.map((item, index) => {
                            const isActive = activeIndex === index;
                            return (
                                <motion.div
                                    key={item.id}
                                    className="w-full rounded-2xl md:rounded-3xl relative overflow-hidden cursor-pointer"
                                    animate={{
                                        flex: isActive ? 12 : 1,
                                        backgroundColor: isActive ? item.color : "rgba(0,0,0,0.06)",
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        ease: [0.22, 1, 0.36, 1]
                                    }}
                                    onClick={() => {
                                        const sections = containerRef.current?.querySelectorAll('.section-item');
                                        if (sections && sections[index + 1]) { // +1 because of intro section
                                            sections[index + 1].scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                >
                                    <div className="absolute inset-0 p-2 md:p-3 flex items-center justify-center pointer-events-none">
                                        <motion.span
                                            animate={{
                                                color: isActive ? "#ffffff" : "#000000",
                                                opacity: isActive ? 1 : 0.4,
                                                scale: isActive ? 2.5 : 1,
                                                rotate: isActive ? 0 : -90
                                            }}
                                            transition={{ duration: 0.6 }}
                                            className="text-[10px] md:text-xs font-black font-mono mix-blend-difference"
                                        >
                                            {item.index}
                                        </motion.span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 h-full relative min-h-0 bg-zinc-900/5 rounded-[2.5rem] border border-black/5 overflow-hidden">
                    <div 
                        ref={containerRef}
                        data-lenis-prevent
                        className="absolute inset-0 h-full w-full overflow-y-auto pt-0 px-0 flex flex-col gap-2 md:gap-3 scrollbar-hide pb-0"
                        style={{ overscrollBehavior: 'contain' }}
                    >
                        {/* Intro Section */}
                        <div className="section-item w-full h-screen flex-shrink-0 flex flex-col items-center justify-center min-h-[500px]">
                        <div 
                            className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/5 rounded-[2.5rem] border border-black/5 relative overflow-hidden backdrop-blur-sm"
                            style={{ containerType: 'inline-size' }}
                        >
                             <div className="absolute top-10 left-10 flex flex-col gap-0.5">
                                <span className="text-[8px] md:text-[10px] font-bold font-mono uppercase tracking-widest opacity-40">Project</span>
                                <h1 className="text-lg md:text-xl font-black font-mono leading-tight tracking-tighter uppercase whitespace-nowrap">Morphys<br />Sandbox</h1>
                             </div>
                             
                             <div className="relative flex flex-col items-center">
                                <h1 className="text-[19cqw] leading-none font-black font-mono tracking-tighter opacity-[0.03] select-none uppercase truncate max-w-full text-center">
                                    {title}
                                </h1>
                                <div className="absolute inset-0 flex items-center justify-center scale-75 md:scale-100">
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="px-4 py-2 bg-white/40 backdrop-blur-md border border-black/5 rounded-full flex items-center gap-2 shadow-[0_4px_10px_rgba(0,0,0,0.02)]"
                                    >
                                        <div className="w-1 h-1 rounded-full bg-black/20" />
                                        <span className="text-[8px] md:text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-black/50">
                                            Component / Preview
                                        </span>
                                    </motion.div>
                                </div>
                             </div>

                             <div className="absolute bottom-10 flex flex-col items-center gap-4">
                                <p className="text-[8px] md:text-[10px] font-bold font-mono uppercase tracking-[0.4em] opacity-40 italic">Swipe to navigate</p>
                                <div className="relative w-px h-12 bg-gradient-to-b from-black/10 to-transparent">
                                    <motion.div 
                                        animate={{ 
                                            y: [0, 48, 0],
                                            opacity: [0, 1, 0]
                                        }} 
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute top-0 left-[-1px] w-[2px] h-6 bg-black opacity-30 rounded-full" 
                                    />
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Content Sections */}
                        {items.map((item, index) => (
                            <div key={item.id} className="section-item shrink-0 w-full min-h-screen">
                                <RightSection 
                                    item={item} 
                                    index={index} 
                                    setActiveIndex={setActiveIndex} 
                                    root={containerRef}
                                />
                            </div>
                        ))}
                    
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IndexScrollReveal;
