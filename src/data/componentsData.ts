export const componentsData = [
    {
        id: 1,
        name: "Elastic Scroll",
        description: "A scrollable list with elastic physics effects.",
        fullCode: `"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from "framer-motion";

const items = [
  { id: 1, text: "Ethereal" },
  { id: 2, text: "Luminous" },
  { id: 3, text: "Nebula" },
  { id: 4, text: "Astral" },
  { id: 5, text: "Zenith" },
  { id: 6, text: "Eclipse" },
  { id: 7, text: "Horizon" },
  { id: 8, text: "Mirage" },
  { id: 9, text: "Orbit" },
  { id: 10, text: "Velvet" },
];

const ElasticScroll = () => {
    return (
        <div className="h-full w-full bg-neutral-900 overflow-hidden relative flex flex-col">
            <div className="flex-1 overflow-y-scroll overflow-x-hidden relative perspective-1000">
                <div className="min-h-[150vh] flex flex-col items-center justify-center gap-12 py-20">
                     {items.map((item) => (
                        <div key={item.id} className="text-6xl font-bold text-white/20 hover:text-white transition-colors duration-300 cursor-pointer">
                            {item.text}
                        </div>
                     ))}
                </div>
            </div>
        </div>
    )
}

export default ElasticScroll;`,
    },
    {
        id: 11,
        name: "Diagonal Arrival",
        description: "Diagonal cards with a smooth impact and spread animation.",
        fullCode: `"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

interface CardProps {
  id: number;
  image: string;
}

const cards: CardProps[] = [
  { id: 1, image: "/24/chainsaw-man-the-5120x2880-23013.jpg" },
  { id: 2, image: "/24/dandadan.jpg" },
  { id: 3, image: "/24/demon-slayer-3840x2160-23615.jpg" },
  { id: 4, image: "/24/gachiakuta-season-1-1440x2560-23000.jpg" },
  { id: 5, image: "/24/jujutsu kaisen.jpg" },
  { id: 6, image: "/24/kaiju-no-8-video-1440x2560-20422.jpg" }, // Middle card
  { id: 7, image: "/24/onepiece.jpg" },
  { id: 8, image: "/24/solo leveling.jpg" },
  { id: 9, image: "/24/spyxfamily.jpg" },
  { id: 10, image: "/24/taro-sakamoto-1440x2560-23904.jpg" },
  { id: 11, image: "/24/to-be-hero-x-5k-1440x2560-22857.png" },
];

const DiagonalArrival = ({ config = {} }: { config?: any }) => {
    const angle = config.angle ?? 195;

    return (
        <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
            {/* Preload images */}
            <div className="hidden">
                {cards.map((card) => (
                    <img key={card.id} src={card.image} alt="" />
                ))}
            </div>
            
            <div className="relative w-full h-full flex items-center justify-center">
                {cards.map((card, index) => {
                    // Calculate distance from the middle card (index 5)
                    const distance = index - 5;

                    return (
                        <Card
                            key={card.id}
                            card={card}
                            distance={distance}
                            isCenter={index === 5}
                            angle={angle}
                        />
                    );
                })}
            </div>
        </div>
    );
};

const Card = ({
    card,
    distance,
    isCenter,
    angle,
}: {
    card: CardProps;
    distance: number;
    isCenter: boolean;
    angle: number;
}) => {
    // Convert angle to radians
    const rad = (angle * Math.PI) / 180;
    const spreaddist = 160;

    const variants: Variants = {
        initial: {
            x: 0,
            y: 800,
            opacity: 0,
            scale: 0.5,
            zIndex: isCenter ? 50 : 10,
        },
        arrive: {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: "tween",
                ease: "circOut",
                duration: 0.8,
                delay: isCenter ? 0 : 0.1, 
            },
        },
        spread: (d: number) => ({
            x: d * spreaddist * Math.cos(rad),
            y: d * spreaddist * Math.sin(rad),
            rotate: 0,
            opacity: 1,
            scale: 1,
            zIndex: isCenter ? 50 : 20 - Math.abs(d),
            transition: {
                type: "spring",
                stiffness: 80,
                damping: 20,
                mass: 1,
                delay: isCenter ? 0 : 0.6 + Math.abs(d) * 0.05,
            },
        }),
    };

    return (
        <motion.div
            className={\`absolute w-40 h-56 shadow-lg border border-white/5 overflow-hidden bg-black group\`}
            initial="initial"
            animate={["arrive", "spread"]}
            custom={distance}
            variants={variants}
            style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
        >
            <img
                src={card.image}
                alt=""
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 cursor-pointer"
            />
            <div className="absolute inset-0 bg-black/20 pointer-events-none group-hover:bg-black/0 transition-colors duration-500" />
        </motion.div>
    );
};

export default DiagonalArrival;`,
    },
];
