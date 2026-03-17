'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShowcaseItem {
  id: number;
  line1: string;
  line2: string;
  image: string;
}

const items: ShowcaseItem[] = [
  {
    id: 1,
    line1: "CHAINSAW",
    line2: "MAN",
    image: "/desktop/chainsaw-man-the-5120x2880-23013.jpg"
  },
  {
    id: 2,
    line1: "JUJUTSU",
    line2: "KAISEN",
    image: "/desktop/jujutsu-kaisen-3840x2160-19746.jpg"
  },
  {
    id: 3,
    line1: "DEMON",
    line2: "SLAYER",
    image: "/desktop/demon-slayer-3840x2160-23615.jpg"
  },
  {
    id: 4,
    line1: "SOLO",
    line2: "LEVELING",
    image: "/desktop/solo-leveling-3840x2160-20374.png"
  },
  {
    id: 5,
    line1: "ONE",
    line2: "PIECE",
    image: "/desktop/one-piece-season-15-3840x2160-22064.jpg"
  },
  {
    id: 6,
    line1: "DANDA",
    line2: "DAN",
    image: "/desktop/dandadan-evil-eye-5120x2880-22717.jpg"
  },
  {
    id: 7,
    line1: "GACHI",
    line2: "AKUTA",
    image: "/desktop/gachiakuta-3840x2160-22842.jpg"
  },
  {
    id: 8,
    line1: "KAIJU",
    line2: "NO. 8",
    image: "/desktop/kaiju-no-8-mission-7680x4320-21963.jpg"
  },
  {
    id: 9,
    line1: "SAKAMOTO",
    line2: "DAYS",
    image: "/desktop/sakamoto-days-5120x2880-23913.jpg"
  },
  {
    id: 10,
    line1: "SPY X",
    line2: "FAMILY",
    image: "/desktop/spy-x-family-season-5120x2880-24443.png"
  },
  {
    id: 11,
    line1: "TO BE",
    line2: "HERO X",
    image: "/desktop/to-be-hero-x-anime-3840x2160-22645.jpg"
  }
];

export const Showcase = ({ className = "h-screen", config = {} }: { className?: string; config?: any }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [direction, setDirection] = useState(1);
  const isAnimatingRef = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const duration = config.speed ?? 1400;

  const nextSlide = useCallback(() => {
    if (isAnimatingRef.current || isExpanded) return;
    isAnimatingRef.current = true;
    setIsAnimating(true);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setTimeout(() => {
      isAnimatingRef.current = false;
      setIsAnimating(false);
    }, duration); 
  }, [isExpanded, duration]);

  const prevSlide = useCallback(() => {
    if (isAnimatingRef.current || isExpanded) return;
    isAnimatingRef.current = true;
    setIsAnimating(true);
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setTimeout(() => {
      isAnimatingRef.current = false;
      setIsAnimating(false);
    }, duration);
  }, [isExpanded, duration]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isAnimatingRef.current || isExpanded) return;
      if (scrollTimeout.current) return;

      if (Math.abs(e.deltaY) < 10) return;

      if (e.deltaY > 0) {
        nextSlide();
      } else if (e.deltaY < 0) {
        prevSlide();
      }

      scrollTimeout.current = setTimeout(() => {
        scrollTimeout.current = null;
      }, 1000);
    };

    window.addEventListener('wheel', handleWheel);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [nextSlide, prevSlide, isExpanded]);

  return (
    <div className={`relative w-full overflow-hidden flex flex-col items-center justify-center font-sans tracking-tight select-none ${className}`} style={{ containerType: "size" }}>
      
      {/* Container for the content */}
      <div className="relative flex flex-col items-center justify-center w-full z-10 h-full">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          {/* We must keep the Slide mounted to animate its internal state seamlessly */}
          <Slide 
             key={items[currentIndex].id} 
             item={items[currentIndex]}
             isExpanded={isExpanded}
             onToggleExpand={() => setIsExpanded(!isExpanded)}
             direction={direction}
             config={config}
          />
        </AnimatePresence>
      </div>
      
      <div className="absolute top-8 right-8 text-neutral-900/30 font-mono text-xs z-60 tracking-widest transition-opacity duration-300 pointer-events-none">
          {isExpanded ? "CLICK IMAGE TO CLOSE" : "SCROLL TO EXPLORE"}
      </div>

    </div>
  );
};

const Slide = ({ 
  item, 
  isExpanded, 
  onToggleExpand,
  direction,
  config
}: { 
  item: ShowcaseItem; 
  isExpanded: boolean; 
  onToggleExpand: () => void;
  direction: number;
  config: any;
}) => {
  const cardWidth = config.cardWidth ?? "22cqi";
  const expandedWidth = config.expandedCardWidth ?? "55cqi";
  const fontSize = config.fontSize ?? "22cqi";
  const tilt = config.tilt ?? -10;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full pointer-events-none">
      
      {/* LINE 1 - Z-Index 10: BOTTOM LAYER */}
      <div className={`z-10 relative overflow-hidden mb-[-2.5cqi] pt-4 mix-blend-exclusion transition-opacity duration-500 ${isExpanded ? 'opacity-20' : 'opacity-100'}`}>
        <motion.h1
          initial={{ y: direction > 0 ? "100%" : "-100%" }}
          animate={{ y: "0%" }}
          exit={{ y: direction > 0 ? "-100%" : "100%" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="leading-[0.85] font-black font-thunder text-white pt-6 pb-6 px-4"
          style={{ fontSize }}
        >
          {item.line1}
        </motion.h1>
      </div>

       {/* IMAGE - Z-Index 20: MIDDLE LAYER (SANDWICHED) */}
       {/* When expanded, z-index increases to 50 to cover text */}
      <div className={`absolute flex items-center justify-center w-full h-full pointer-events-auto transition-all duration-500 perspective-[1000px] ${isExpanded ? 'z-50' : 'z-20'}`}>
        <motion.div
           layout
           className="relative aspect-video cursor-pointer shadow-2xl transform-3d"
           onClick={onToggleExpand}
           initial={{ 
             x: direction > 0 ? "100cqi" : "-100cqi",       
             y: direction > 0 ? "100cqh" : "-100cqh",      
             rotate: tilt,
             rotateY: 0,     
             opacity: 1,      
             width: cardWidth,   // Initial small width
             scale: 1,
           }}
           animate={{ 
             x: "0cqi",        // Always centered horizontally
             
             // Y-Axis Flow Logic:
             // Normal: 0vh (Centered)
             // Expanded: -5cqh (Move UP slightly to "flow from bottom")
             y: isExpanded ? "-5cqh" : "0cqh", 
             
             rotate: isExpanded ? 0 : tilt,     // Clear tilt on expand
             rotateY: isExpanded ? 180 : 0,    // Flip on expand (180deg to show "back")
             opacity: 1,
             scale: 1, // We control size purely via width for layout flow
             
             // Expand Width Logic:
             // Normal: 22cqi
             // Expanded: 55cqi (Larger but not full screen)
             width: isExpanded ? expandedWidth : cardWidth 
           }}
           exit={{ 
             x: direction > 0 ? "-100cqi" : "100cqi",     
             y: direction > 0 ? "-100cqh" : "100cqh",     
             rotate: tilt,     
             rotateY: 0,
             opacity: 1,     
             width: cardWidth,  
             scale: 1
           }}
           transition={{ 
             // Main spring transition for the "flow" feel
             type: "spring",
             stiffness: 90,
             damping: 20,
             mass: 1.1,
             // Separate ease for the exit flow if needed, but spring feels best for interactive expanding
           }}
        >
          {/* Front of card */}
           <div className="absolute inset-0 backface-hidden">
              <img
                src={item.image}
                alt={`${item.line1} ${item.line2}`}
                className="w-full h-full object-cover"
              />
           </div>
           {/* Back of card (duplicate image, rotated 180deg to face opposite direction) */}
           <div 
              className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
           >
              <img
                src={item.image}
                alt={`${item.line1} ${item.line2}`}
                className="w-full h-full object-cover"
              />
           </div>
        </motion.div>
      </div>

      {/* LINE 2 - Z-Index 30: TOP LAYER */}
      <div className={`z-30 relative overflow-hidden mt-[-2.5cqi] pb-4 mix-blend-exclusion transition-opacity duration-500 ${isExpanded ? 'opacity-20' : 'opacity-100'}`}>
        <motion.h1
          initial={{ y: direction > 0 ? "100%" : "-100%" }}
          animate={{ y: "0%" }}
          exit={{ y: direction > 0 ? "-100%" : "100%" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="text-[22cqi] leading-[0.85] font-black font-thunder text-white pt-6 pb-6 px-4"
        >
          {item.line2}
        </motion.h1>
      </div>

    </div>
  );
};
