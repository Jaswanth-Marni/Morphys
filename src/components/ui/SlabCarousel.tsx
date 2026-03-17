'use client'

import React, { useRef, useState, useEffect } from 'react'
import { 
    motion, 
    useMotionValue, 
    useTransform, 
    useAnimationFrame,
    MotionValue,
    animate
} from 'framer-motion'

import { cn } from '@/lib/utils'

// ----------------------------------------------------------------------
// Configuration Defaults (overridable via config prop)
// ----------------------------------------------------------------------
const DEFAULT_BASE_WIDTH = 60
const DEFAULT_EXPANDED_WIDTH = 400
const DEFAULT_GAP = 12
const DEFAULT_NEIGHBOR_INFLUENCE = 1.6 
// ----------------------------------------------------------------------

interface ItemData {
    id: number;
    title: string;
    image: string;
    color: string;
}

interface SlabProps {
    item: ItemData;
    index: number;
    scrollIndex: MotionValue<number>;
    baseWidth: number;
    expandedWidth: number;
    gap: number;
    neighborInfluence: number;
    borderRadius: number;
}

const items: ItemData[] = [
    { id: 1, title: 'Chainsaw Man', color: '#ff5f5f', image: '/24/chainsaw-man-the-5120x2880-23013.jpg' },
    { id: 2, title: 'Jujutsu Kaisen', color: '#5fafff', image: '/24/jujutsu kaisen.jpg' },
    { id: 3, title: 'Demon Slayer', color: '#5fffAF', image: '/24/demon-slayer-3840x2160-23615.jpg' },
    { id: 4, title: 'Solo Leveling', color: '#af5fff', image: '/24/solo leveling.jpg' },
    { id: 5, title: 'Spy x Family', color: '#ffaf5f', image: '/24/spyxfamily.jpg' },
    { id: 6, title: 'One Piece', color: '#ff5f5f', image: '/24/onepiece.jpg' },
    { id: 7, title: 'Dandadan', color: '#5fafff', image: '/24/dandadan.jpg' },
    { id: 8, title: 'Kaiju No. 8', color: '#5fffAF', image: '/24/kaiju-no-8-video-1440x2560-20422.jpg' },
    { id: 9, title: 'Sakamoto Days', color: '#af5fff', image: '/24/taro-sakamoto-1440x2560-23904.jpg' },
    { id: 10, title: 'Gachiakuta', color: '#ffaf5f', image: '/24/gachiakuta-season-1-1440x2560-23000.jpg' },
]

const Slab = ({ 
    item, 
    index, 
    scrollIndex,
    baseWidth,
    expandedWidth,
    gap,
    neighborInfluence,
    borderRadius
}: SlabProps) => {
    
    // Direct MotionValue transforms for performance
    const width = useTransform(scrollIndex, (current) => {
        const dist = Math.abs(index - current)
        const activity = Math.exp(-Math.pow(dist / neighborInfluence, 2))
        return baseWidth + (expandedWidth - baseWidth) * activity
    })
    
    const opacity = useTransform(scrollIndex, (current) => {
        const dist = Math.abs(index - current)
        const activity = Math.exp(-Math.pow(dist / neighborInfluence, 2))
        return 0.4 + 0.6 * activity
    })
    
    const zIndex = useTransform(scrollIndex, (current) => {
        const dist = Math.abs(index - current)
        const activity = Math.exp(-Math.pow(dist / neighborInfluence, 2))
        return Math.round(activity * 10)
    })
    
    const saturation = useTransform(scrollIndex, (current) => {
        const dist = Math.abs(index - current)
        const activity = Math.exp(-Math.pow(dist / neighborInfluence, 2))
        // Map 0-1 to grayscale filter value? 
        // We can't interpolate string filters easily with useTransform without a custom mixer
        // So we'll update a CSS variable or just rely on opacity for now for 60fps
        return activity
    })

    return (
        <motion.div
            style={{
                width: width, 
                height: '100%',
                marginRight: gap,
                opacity: opacity,
                zIndex: zIndex,
                borderRadius: borderRadius,
            }}
            className="relative shrink-0 overflow-hidden cursor-pointer group border border-white/10"
        >
             <motion.div className="absolute inset-0">
                 {/* To keep it performant, we just use opacity for the active state/grayscale simulation */}
                 <motion.img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-all duration-500"
                    style={{
                        // Simple performant approach: 
                        // Instead of modifying filter string every frame (expensive),
                        // We use a CSS variable or just let it be fully colored.
                        // User asked to remove blur. 
                        // Let's bring back the grayscale if possible, but cleanly.
                        // We can't pass 'filter' as a MotionValue easily if it contains complex strings.
                        // So we use an overlay for the "inactive" look.
                    }}
                 />
                 
                 {/* Dark overlay that fades out when active */}
                 <motion.div 
                    className="absolute inset-0 bg-black pointer-events-none"
                    style={{ opacity: useTransform(saturation, s => (1 - s) * 0.8) }}
                 />
            </motion.div>
        </motion.div>
    )
}


export function SlabCarousel({ className, config = {} }: { className?: string, config?: any }) {
    
    // Core state in MotionValue
    const scrollIndex = useMotionValue(0)
    const targetScroll = useRef(0)
    
    // We use Framer Motion's built-in drag/pan handlers for robust cross-browser touch/mouse support
    const dragging = useRef(false)
    const velocity = useRef(0)

    // Config with defaults
    const activeItems = config.items || items;
    const MIN_INDEX = 0
    const MAX_INDEX = activeItems.length - 1
    
    // Config Physics
    const FRICTION = config.friction ?? 0.90 
    const ELASTICITY = config.elasticity ?? 0.1
    // We calibrate pixel movement to scroll index movement
    // Higher = heavier drag.
    const DRAG_FACTOR = config.dragFactor ?? 0.003
    
    // Config Layout
    const baseWidth = config.baseWidth ?? DEFAULT_BASE_WIDTH
    const expandedWidth = config.expandedWidth ?? DEFAULT_EXPANDED_WIDTH
    const gap = config.gap ?? DEFAULT_GAP
    const neighborInfluence = config.neighborInfluence ?? DEFAULT_NEIGHBOR_INFLUENCE
    const borderRadius = config.borderRadius ?? 16 // Default to 16px (rounded-2xl)

    // ------------------------------------------------------------------
    // Track Offset
    // ------------------------------------------------------------------
    const trackOffset = useTransform(scrollIndex, (current) => {
        let currentX = 0
        const centers: number[] = []
        for (let i = 0; i < activeItems.length; i++) {
            const dist = Math.abs(i - current)
            const activity = Math.exp(-Math.pow(dist / neighborInfluence, 2))
            const width = baseWidth + (expandedWidth - baseWidth) * activity
            centers.push(currentX + width/2)
            currentX += width + gap
        }
        
        const i1 = Math.floor(current)
        const i2 = Math.ceil(current)
        const ratio = current - i1
        
        const c1 = centers[Math.max(0, Math.min(activeItems.length-1, i1))]
        const c2 = centers[Math.max(0, Math.min(activeItems.length-1, i2))] 
        
        const activeCenter = c1 + (c2 - c1) * ratio
        return -activeCenter 
    })

    // ------------------------------------------------------------------
    // Physics Loop
    // ------------------------------------------------------------------
    useAnimationFrame(() => {
        // If user is holding/dragging, we DON'T apply physics friction/momentum
        // We let the drag input drive the value directly.
        if (!dragging.current) {
            
            // Apply Friction to momentum
            velocity.current *= FRICTION
            
            // Check Bounds & Elasticity
            if (targetScroll.current < MIN_INDEX) {
                 const force = (MIN_INDEX - targetScroll.current) * ELASTICITY
                 velocity.current += force
            } else if (targetScroll.current > MAX_INDEX) {
                 const force = (MAX_INDEX - targetScroll.current) * ELASTICITY
                 velocity.current += force
            }
            
            // Move
            if (Math.abs(velocity.current) > 0.0001) {
                 targetScroll.current += velocity.current
                 
                 // Directly update the MotionValue
                 scrollIndex.set(targetScroll.current)
            }
        }
    })

    // ------------------------------------------------------------------
    // Event Handlers (Framer Motion Pan)
    // ------------------------------------------------------------------
    const onPanStart = () => {
        dragging.current = true
        velocity.current = 0
        // Snap target to current visual value to avoid jumps if physics was moving it
        targetScroll.current = scrollIndex.get()
    }

    const onPan = (_: MouseEvent | TouchEvent | PointerEvent, info: { delta: { x: number } }) => {
        // -delta.x because dragging LEFT (negative) should increase index (move right)
        // Adjust sensitivity with DRAG_FACTOR
        const deltaIndex = -info.delta.x * DRAG_FACTOR
        
        targetScroll.current += deltaIndex
        scrollIndex.set(targetScroll.current)
    }

    const onPanEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: { velocity: { x: number } }) => {
        dragging.current = false
        // Transfer pan velocity to physics velocity
        // Framer gives velocity in px/sec. We need to scale it to our index units.
        // Also invert direction because of scroll direction
        velocity.current = -info.velocity.x * DRAG_FACTOR * 0.012 // Scale down time unit (approx 1/60)
    }

    // Wheel
    const handleWheel = (e: React.WheelEvent) => {
        // e.preventDefault() passive issue again, handled by CSS mostly
        const delta = e.deltaY * DRAG_FACTOR
        targetScroll.current += delta;
        scrollIndex.set(targetScroll.current)
        velocity.current = 0 // Kill momentum on wheel for precise control or add slight?
        // Let's add slight
        velocity.current = delta * 0.5
    }

    return (
        <div 
            className={cn("w-full h-full min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden select-none", className)}
            onWheel={handleWheel} 
            style={{ touchAction: 'none' }}
        >
            {/* 
               We put the Pan handler on a high-level container overlay 
               OR just the main div. Framer's motion.div supports onPan. 
               Let's convert the main div to motion.div
            */}
            <motion.div 
                className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
                onPanStart={onPanStart}
                onPan={onPan}
                onPanEnd={onPanEnd}
                // We add a transparent bg to ensure it captures events everywhere
                style={{ backgroundColor: 'transparent' }}
            />

            <div className="w-full h-125 relative flex items-center overflow-hidden pointer-events-none">
                <motion.div 
                    className="flex items-center h-full absolute left-1/2"
                    style={{ x: trackOffset }}
                >
                    {activeItems.map((item: ItemData, i: number) => (
                        <Slab 
                            key={item.id} 
                            item={item} 
                            index={i} 
                            scrollIndex={scrollIndex} 
                            baseWidth={baseWidth}
                            expandedWidth={expandedWidth}
                            gap={gap}
                            neighborInfluence={neighborInfluence}
                            borderRadius={borderRadius}
                        />
                    ))}
                </motion.div>
            </div>
            
            <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none opacity-30 z-40">
                <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest">
                    Drag or Scroll
                </p>
            </div>
        </div>
    )
}
