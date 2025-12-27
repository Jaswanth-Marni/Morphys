"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue, animate } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Swiper CSS imports
import "swiper/css";
import "swiper/css/effect-coverflow";

type StyleCard = {
    id: number;
    title: string;
    description: string;
    gradient: string;
    accentColor: string;
    image: string;
};

// Sample UI styles to showcase
export const uiStyles: StyleCard[] = [
    {
        id: 1,
        title: "Glassmorphism",
        description: "Frosted glass effect with blur and transparency",
        gradient: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        accentColor: "#60a5fa",
        image: "/Glassmophism.jpg",
    },
    {
        id: 2,
        title: "Neo-Brutalism",
        description: "Bold colors, harsh shadows, raw aesthetics",
        gradient: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
        accentColor: "#ff6b6b",
        image: "/neo brutalism.jpg",
    },
    {
        id: 3,
        title: "Material 3",
        description: "Dynamic color, expressive motion, adaptive design",
        gradient: "linear-gradient(135deg, #6750A4 0%, #B69DF8 100%)",
        accentColor: "#D0BCFF",
        image: "/Material 3.png",
    },
    {
        id: 4,
        title: "Skeuomorphism",
        description: "Real-world textures, depth, and tangible interfaces",
        gradient: "linear-gradient(135deg, #d4a373 0%, #faedcd 100%)",
        accentColor: "#8c6b45",
        image: "/SKEUOMORPHISM.png",
    },
    {
        id: 5,
        title: "Neumorphism",
        description: "Soft UI with subtle shadows and highlights",
        gradient: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
        accentColor: "#a0a0a0",
        image: "/neumorphism.jpg",
    },
    {
        id: 6,
        title: "Minimalism",
        description: "Clean lines, whitespace, typography focus",
        gradient: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
        accentColor: "#333333",
        image: "/minimalism.jpg",
    },
    {
        id: 7,
        title: "Retro",
        description: "Vintage aesthetics, noisy textures, nostalgic vibes",
        gradient: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
        accentColor: "#ff9966",
        image: "/Retro.jpg",
    },
    {
        id: 8,
        title: "Pop Art",
        description: "Bold outlines, comic style, vibrant patterns",
        gradient: "linear-gradient(135deg, #fff200 0%, #ed1c24 100%)",
        accentColor: "#00aeef",
        image: "/pop art.png",
    },
];

type DiagonalCarouselProps = {
    autoPlayInterval?: number;
    onUiStyleChange?: (style: StyleCard) => void;
    onImpact?: () => void;
    isInView?: boolean;
    entranceDelay?: number;
};

export type CarouselHandle = {
    next: () => void;
    prev: () => void;
};

const DiagonalCarousel = React.forwardRef<CarouselHandle, DiagonalCarouselProps>(
    ({ autoPlayInterval = 4000, onUiStyleChange, onImpact, isInView = true, entranceDelay = 0.5 }, ref) => {
        const swiperRef = useRef<SwiperType | null>(null);
        const [activeIndex, setActiveIndex] = useState(0);
        const [hasEntered, setHasEntered] = useState(false);
        const [isSpinning, setIsSpinning] = useState(false);
        const [spinComplete, setSpinComplete] = useState(false);

        // Physics-based impact springs for side cards
        const leftCardOffset = useSpring(0, { stiffness: 200, damping: 15, mass: 0.8 });
        const rightCardOffset = useSpring(0, { stiffness: 200, damping: 15, mass: 0.8 });
        const centerCardScale = useSpring(1, { stiffness: 300, damping: 12, mass: 0.5 });

        // Carousel depth emergence - starts from behind
        const carouselScale = useMotionValue(0.3);
        const carouselOpacity = useMotionValue(0);
        const carouselBlur = useMotionValue(15);

        // Expose navigation methods to parent
        React.useImperativeHandle(ref, () => ({
            next: () => {
                swiperRef.current?.slideNext();
            },
            prev: () => {
                swiperRef.current?.slidePrev();
            },
        }));

        // Notify parent of active style change
        useEffect(() => {
            if (onUiStyleChange) {
                onUiStyleChange(uiStyles[activeIndex]);
            }
        }, [activeIndex, onUiStyleChange]);

        // Main entrance animation sequence
        useEffect(() => {
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
                            }}
                            onSlideChange={handleSlideChange}
                            effect="coverflow"
                            grabCursor={!isSpinning}
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
                            modules={[EffectCoverflow]}
                            className="perspective-carousel"
                        >
                            {uiStyles.map((style, index) => {
                                const isActive = index === activeIndex;
                                const totalSlides = uiStyles.length;
                                const relativePos = (index - activeIndex + totalSlides) % totalSlides;
                                const isLeftSide = relativePos > totalSlides / 2;
                                const isRightSide = relativePos > 0 && relativePos <= totalSlides / 2;

                                return (
                                    <SwiperSlide key={style.id} className="!h-[390px] md:!h-[440px]">
                                        <motion.div
                                            className="w-full h-full"
                                            style={{
                                                x: isActive ? 0 : (isLeftSide ? leftCardOffset : (isRightSide ? rightCardOffset : 0)),
                                                scale: isActive ? centerCardScale : 1,
                                                backfaceVisibility: "hidden",
                                                WebkitBackfaceVisibility: "hidden",
                                                willChange: "transform",
                                            }}
                                            whileHover={!isSpinning ? { scale: 1.02 } : undefined}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        >
                                            <img
                                                src={style.image}
                                                alt={style.title}
                                                className="w-full h-full object-cover shadow-2xl"
                                                style={{
                                                    filter: isActive ? "none" : "brightness(0.7)",
                                                    transition: "filter 0.3s ease",
                                                    backfaceVisibility: "hidden",
                                                    WebkitBackfaceVisibility: "hidden",
                                                }}
                                            />
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
