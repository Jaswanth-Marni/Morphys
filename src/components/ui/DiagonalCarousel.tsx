"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue, animate } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Swiper CSS imports
import "swiper/css";
import "swiper/css/effect-coverflow";
import { uiStyles, type StyleCard } from "@/data/styles";
import { useShowcase } from "@/context/ShowcaseContext";




type DiagonalCarouselProps = {
    autoPlayInterval?: number;
    onUiStyleChange?: (style: StyleCard) => void;
    onImpact?: () => void;
    isInView?: boolean;
    entranceDelay?: number;
    skipEntrance?: boolean;
};

export type CarouselHandle = {
    next: () => void;
    prev: () => void;
    goToStyle: (styleId: string) => void;
};

const DiagonalCarousel = React.forwardRef<CarouselHandle, DiagonalCarouselProps>(
    ({ autoPlayInterval = 4000, onUiStyleChange, onImpact, isInView = true, entranceDelay = 0.5, skipEntrance = false }, ref) => {
        const swiperRef = useRef<SwiperType | null>(null);

        const {
            activeStyleId,
            setActiveStyleId,
            openCanvas,
            isCanvasOpen,
            transitionDirection,
            registerCarouselSync,
            isTransitioning,
        } = useShowcase();

        const [activeIndex, setActiveIndex] = useState(() => {
            // Initialize to the last active style if returning from canvas
            const savedIndex = uiStyles.findIndex(s => s.id === activeStyleId);
            return savedIndex >= 0 ? savedIndex : 0;
        });
        const [hasEntered, setHasEntered] = useState(skipEntrance);
        const [isSpinning, setIsSpinning] = useState(false);
        const [spinComplete, setSpinComplete] = useState(skipEntrance);

        // Physics-based impact springs for side cards
        const leftCardOffset = useSpring(0, { stiffness: 200, damping: 15, mass: 0.8 });
        const rightCardOffset = useSpring(0, { stiffness: 200, damping: 15, mass: 0.8 });
        const centerCardScale = useSpring(1, { stiffness: 300, damping: 12, mass: 0.5 });

        // Carousel depth emergence - starts from behind
        // If skipEntrance is true, start at final values
        const carouselScale = useMotionValue(skipEntrance ? 1 : 0.3);
        const carouselOpacity = useMotionValue(skipEntrance ? 1 : 0);
        const carouselBlur = useMotionValue(skipEntrance ? 0 : 15);

        // Navigate to style on canvas (using overlay, not route)
        const navigateToCanvas = useCallback((styleId: string) => {
            // Stop autoplay
            swiperRef.current?.autoplay?.stop();

            // Open canvas overlay with the selected style
            openCanvas(styleId);
        }, [openCanvas]);

        // Go to specific style - INSTANT version for sync callback
        const goToStyleInstant = useCallback((styleId: string) => {
            const index = uiStyles.findIndex(s => s.id === styleId);
            if (index >= 0 && swiperRef.current) {
                // Use speed 0 for instant jump
                swiperRef.current.slideToLoop(index, 0);
                setActiveIndex(index);
            }
        }, []);

        // Go to specific style (for syncing when returning from canvas)
        const goToStyle = useCallback((styleId: string) => {
            const index = uiStyles.findIndex(s => s.id === styleId);
            if (index >= 0 && swiperRef.current) {
                swiperRef.current.slideToLoop(index, 600);
            }
        }, []);

        // Register carousel sync callback on mount
        useEffect(() => {
            registerCarouselSync(goToStyleInstant);
        }, [registerCarouselSync, goToStyleInstant]);

        // Expose navigation methods to parent
        React.useImperativeHandle(ref, () => ({
            next: () => {
                swiperRef.current?.slideNext();
            },
            prev: () => {
                swiperRef.current?.slidePrev();
            },
            goToStyle,
        }));

        // Restart autoplay when returning from canvas
        useEffect(() => {
            if (transitionDirection === "to-carousel" && !isCanvasOpen) {
                // Restart autoplay after returning
                if (autoPlayInterval > 0) {
                    setTimeout(() => {
                        swiperRef.current?.autoplay?.start();
                    }, 500);
                }
            }
        }, [transitionDirection, isCanvasOpen, autoPlayInterval]);

        // Notify parent of active style change
        useEffect(() => {
            if (onUiStyleChange) {
                onUiStyleChange(uiStyles[activeIndex]);
            }
            // Also sync to context
            setActiveStyleId(uiStyles[activeIndex].id);
        }, [activeIndex, onUiStyleChange, setActiveStyleId]);

        // Main entrance animation sequence
        useEffect(() => {
            if (skipEntrance) {
                // If skipping entrance, ensure autoplay starts if needed
                if (autoPlayInterval > 0 && swiperRef.current) {
                    swiperRef.current.autoplay?.start();
                }
                return;
            }

            if (isInView && !hasEntered) {
                setHasEntered(true);

                // Start entrance after heading animation completes
                const startDelay = entranceDelay * 1000;

                setTimeout(() => {
                    // Emerge from depth (scale up, fade in, unblur) - all start simultaneously
                    animate(carouselOpacity, 1, {
                        duration: 0.5,
                        ease: "easeOut"
                    });

                    animate(carouselBlur, 0, {
                        duration: 0.6,
                        ease: "easeOut"
                    });

                    animate(carouselScale, 1, {
                        type: "spring",
                        stiffness: 120,
                        damping: 14,
                        mass: 0.8,
                        onComplete: () => {
                            // Start full rotation swipe immediately after emergence
                            setIsSpinning(true);
                            spinThroughCards();
                        },
                    });
                }, startDelay);
            }
        }, [isInView, hasEntered, entranceDelay]);

        // Spin through all cards (full rotation) - keeps swiping left until Glassmorphism returns
        const spinThroughCards = () => {
            const swiper = swiperRef.current;
            if (!swiper) return;

            const totalCards = uiStyles.length;
            let currentSpin = 0;
            const baseSpeed = 120; // ms per card at start

            const spinInterval = setInterval(() => {
                currentSpin++;

                // Gradually slow down (easing effect like roulette wheel)
                const progress = currentSpin / totalCards;
                const slowdownFactor = Math.pow(progress, 1.5);
                const currentSpeed = baseSpeed + (slowdownFactor * 200);

                swiper.slideNext(Math.round(currentSpeed));

                // After full rotation, check if we're at Glassmorphism (index 0)
                // If not, continue spinning until we reach it
                if (currentSpin >= totalCards) {
                    clearInterval(spinInterval);

                    // Continue sliding left until we reach Glassmorphism (index 0)
                    const settleOnGlassmorphism = () => {
                        if (swiper.realIndex !== 0) {
                            // Keep sliding left with slowing speed
                            swiper.slideNext(350);
                            setTimeout(settleOnGlassmorphism, 300);
                        } else {
                            // We're at Glassmorphism - trigger impact
                            setTimeout(() => {
                                setIsSpinning(false);
                                setSpinComplete(true);
                                triggerSettleImpact();

                                // Enable autoplay after spin complete
                                if (autoPlayInterval > 0) {
                                    setTimeout(() => {
                                        swiper.autoplay?.start();
                                    }, 800);
                                }
                            }, 300);
                        }
                    };

                    // Small delay then check/settle
                    setTimeout(settleOnGlassmorphism, 200);
                }
            }, baseSpeed);
        };

        // Impact effect when card settles - physics based
        const triggerSettleImpact = () => {
            // Center card: scale pulse
            centerCardScale.set(1.06);
            setTimeout(() => centerCardScale.set(1), 250);

            // Left cards: PUSH outward (away from center)
            leftCardOffset.set(-22);

            // Right cards: PULL inward (towards center, then bounce back)
            rightCardOffset.set(-18);

            // Notify parent of impact
            onImpact?.();

            // Springs will naturally bounce back
        };

        // Trigger impact on every slide change (after initial spin)
        const handleSlideChange = (swiper: SwiperType) => {
            setActiveIndex(swiper.realIndex);

            if (spinComplete && !isSpinning) {
                triggerSlideImpact();
            }
        };

        // Slide change impact - smoother version
        const triggerSlideImpact = () => {
            // Left cards push outward
            leftCardOffset.set(-14);

            // Right cards pull inward slightly
            rightCardOffset.set(-12);

            // Center card subtle pulse
            centerCardScale.set(1.04);
            setTimeout(() => centerCardScale.set(1), 180);

            // Notify parent of impact
            onImpact?.();
        };

        // Handle card click
        const handleCardClick = (style: StyleCard, index: number) => {
            if (isSpinning) return;

            const isActive = index === activeIndex;

            if (isActive) {
                // Navigate to detail canvas overlay
                navigateToCanvas(style.id);
            } else {
                // Slide to this card first
                swiperRef.current?.slideToLoop(index, 400);
            }
        };

        return (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                {/* Carousel Container - Emerges from depth */}
                <motion.div
                    className="w-full max-w-5xl"
                    style={{
                        scale: carouselScale,
                        opacity: carouselOpacity,
                        filter: `blur(${carouselBlur.get()}px)`,
                    }}
                >
                    <motion.div
                        style={{
                            filter: useMotionValue(`blur(${carouselBlur}px)`),
                        }}
                    >
                        <Swiper
                            onSwiper={(swiper) => {
                                swiperRef.current = swiper;
                                // Disable autoplay initially - will be enabled after spin
                                swiper.autoplay?.stop();

                                // If returning from canvas, go to the saved style
                                if (skipEntrance && activeStyleId) {
                                    const targetIndex = uiStyles.findIndex(s => s.id === activeStyleId);
                                    if (targetIndex >= 0) {
                                        swiper.slideToLoop(targetIndex, 0);
                                    }
                                }
                            }}
                            onSlideChange={handleSlideChange}
                            effect="coverflow"
                            grabCursor={!isSpinning}
                            initialSlide={0}
                            centeredSlides={true}
                            loop={true}

                            // Responsive breakpoints
                            breakpoints={{
                                // Mobile: center card takes most space, sides peak in at edges
                                0: {
                                    slidesPerView: 1.25,
                                    spaceBetween: 20,
                                },
                                // Desktop: original wide view
                                768: {
                                    slidesPerView: 2.43,
                                    spaceBetween: 40,
                                }
                            }}
                            allowTouchMove={!isSpinning}
                            autoplay={
                                autoPlayInterval > 0
                                    ? {
                                        delay: autoPlayInterval,
                                        disableOnInteraction: false,
                                    }
                                    : false
                            }
                            coverflowEffect={{
                                rotate: 0,
                                stretch: 0,
                                depth: 100,
                                modifier: 2.5,
                                slideShadows: false,
                            }}
                            modules={[EffectCoverflow, Autoplay]}
                            className="perspective-carousel"
                        >
                            {uiStyles.map((style, index) => {
                                const isActive = index === activeIndex;
                                const totalSlides = uiStyles.length;
                                const relativePos = (index - activeIndex + totalSlides) % totalSlides;
                                const isLeftSide = relativePos > totalSlides / 2;
                                const isRightSide = relativePos > 0 && relativePos <= totalSlides / 2;

                                return (
                                    <SwiperSlide key={style.id} className="!h-[390px] md:!h-[540px]">
                                        <motion.div
                                            className="w-full h-full cursor-pointer"
                                            style={{
                                                x: isActive ? 0 : (isLeftSide ? leftCardOffset : (isRightSide ? rightCardOffset : 0)),
                                                scale: isActive ? centerCardScale : 1,
                                                backfaceVisibility: "hidden",
                                                WebkitBackfaceVisibility: "hidden",
                                                willChange: "transform",
                                            }}
                                            whileHover={!isSpinning ? { scale: 1.02 } : undefined}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            onClick={() => handleCardClick(style, index)}
                                        >
                                            <motion.img
                                                layoutId={
                                                    // Only assign layoutId to the active card during transitions
                                                    // This prevents all carousel images from animating simultaneously
                                                    isActive && isTransitioning && style.id === activeStyleId
                                                        ? `style-image-${style.id}`
                                                        : undefined
                                                }
                                                src={style.image}
                                                alt={style.title}
                                                className="w-full h-full object-cover shadow-2xl"
                                                style={{
                                                    filter: isActive ? "none" : "brightness(0.7)",
                                                    backfaceVisibility: "hidden",
                                                    WebkitBackfaceVisibility: "hidden",
                                                    borderRadius: "0.5rem",
                                                }}
                                                transition={{
                                                    layout: {
                                                        type: "spring",
                                                        stiffness: 150,
                                                        damping: 25,
                                                        mass: 0.8,
                                                    },
                                                }}
                                            />
                                            {/* Click indicator for active card */}
                                            {isActive && spinComplete && (
                                                <motion.div
                                                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                                                >
                                                    <motion.div
                                                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                                                        style={{
                                                            background: "var(--glass-background)",
                                                            backdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
                                                            WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
                                                            border: "1px solid var(--glass-border)",
                                                            fontFamily: "'Clash Display Variable', sans-serif",
                                                            boxShadow: "var(--glass-shadow)",
                                                        }}
                                                        initial={{ y: 10, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.1 }}
                                                    >
                                                        <span>Details</span>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                                        </svg>
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                            {/* Settlement glow pulse */}
                                            {isActive && spinComplete && (
                                                <motion.div
                                                    className="absolute inset-0 pointer-events-none rounded-lg"
                                                    initial={{ opacity: 0 }}
                                                    animate={{
                                                        opacity: [0, 0.5, 0],
                                                    }}
                                                    transition={{
                                                        duration: 0.7,
                                                        ease: "easeOut",
                                                    }}
                                                    style={{
                                                        boxShadow: `0 0 100px 40px ${style.accentColor}`,
                                                    }}
                                                />
                                            )}
                                        </motion.div>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    </motion.div>
                </motion.div>

                {/* Custom CSS for Swiper */}
                <style jsx global>{`
                    .perspective-carousel {
                        padding: 40px 0;
                        padding-bottom: 50px;
                        overflow: visible !important;
                    }
                    
                    .perspective-carousel .swiper-slide {
                        transition: all 0.4s ease;
                    }
                    
                    .perspective-carousel .swiper-slide-active {
                        z-index: 50 !important;
                    }
                    
                    .perspective-carousel .swiper-slide-active img {
                        box-shadow: 
                            0 40px 80px -20px rgba(0, 0, 0, 0.5),
                            0 0 40px rgba(0, 0, 0, 0.2);
                    }
                `}</style>
            </div>
        );
    }
);

DiagonalCarousel.displayName = "DiagonalCarousel";

export { DiagonalCarousel };
