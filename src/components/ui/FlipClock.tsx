"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================
// DIGIT PATTERNS (4x6 Grid)
// 1 = Active (Visible Pixel)
// 0 = Inactive (Background)
// Corners are rounded as requested
// ============================================
const DIGIT_PATTERNS: Record<string, number[][]> = {
    '0': [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0]
    ],
    '1': [
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 1]
    ],
    '2': [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 1, 0],
        [0, 1, 0, 0],
        [1, 1, 1, 1]
    ],
    '3': [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0]
    ],
    '4': [
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1]
    ],
    '5': [
        [1, 1, 1, 1],
        [1, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0]
    ],
    '6': [
        [0, 1, 1, 0],
        [1, 0, 0, 0],
        [1, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0]
    ],
    '7': [
        [1, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 0, 1, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
    ],
    '8': [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0]
    ],
    '9': [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 1, 1, 0]
    ]
};

// ============================================
// TYPES
// ============================================
interface FlipPixelProps {
    active: boolean;
    x: number;
    y: number;
}

// ============================================
// SUB-COMPONENT: FLIP PIXEL
// ============================================
const FlipPixel = React.memo(({ active, x, y }: FlipPixelProps) => {
    return (
        <motion.div
            initial={false}
            animate={{
                rotateX: active ? 180 : 0,
            }}
            transition={{
                duration: 0.3, // Faster transition
                ease: [0.4, 0.0, 0.2, 1], // Smooth easing
                // Removed wave delay to prevent sticking
            }}
            style={{
                width: '100%',
                height: '100%',
                borderRadius: '4px',
                position: 'relative',
                transformStyle: 'preserve-3d',
                boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                willChange: 'transform', // Performance optimization
            }}
        >
            {/* Front Face (Inactive/Dark) */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '4px',
                    border: '1px solid #333'
                }}
            />
            {/* Back Face (Active/Bright) */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backfaceVisibility: 'hidden',
                    transform: 'rotateX(180deg)',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                }}
            />
        </motion.div>
    );
});

// ============================================
// MAIN COMPONENT
// ============================================
export function FlipClock() {
    const [timeStr, setTimeStr] = useState("000000"); // HHMMSS

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            const s = now.getSeconds().toString().padStart(2, '0');
            setTimeStr(h + m + s);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Grid Configuration
    // - Digits are 4x6
    // - Fill the screen with flip cards
    // - Time centered vertically
    // - Layout: PAD(1) | H1(4) | sp(1) | H2(4) | colon(2) | M1(4) | sp(1) | M2(4) | colon(2) | S1(4) | sp(1) | S2(4) | PAD(1)
    // - Cols: 37 (to accommodate all digits with spacing)
    // - Rows: Expanded to fill screen (30 rows for more coverage)

    const rows = 30; // Increased for full screen coverage
    const cols = 37;

    const grid = useMemo(() => {
        // Initialize empty grid (all idle/inactive)
        const newGrid = Array(rows).fill(0).map(() => Array(cols).fill(0));

        const insertDigit = (digit: string, startCol: number, startRow: number) => {
            const pattern = DIGIT_PATTERNS[digit];
            if (!pattern) return;
            pattern.forEach((row, r) => {
                row.forEach((val, c) => {
                    if (startRow + r < rows && startCol + c < cols) {
                        newGrid[startRow + r][startCol + c] = val;
                    }
                });
            });
        };

        const [h1, h2, m1, m2, s1, s2] = timeStr.split('');
        // Center the time vertically in the expanded grid
        // Digit height is 6, so center at (30 - 6) / 2 = 12
        const startRow = 12;

        insertDigit(h1, 1, startRow);       // First Hour Digit (col 1-4)
        insertDigit(h2, 6, startRow);       // Second Hour Digit (col 6-9)

        // First Colon (HH:MM) at cols 11-12
        newGrid[startRow + 1][11] = 1;
        newGrid[startRow + 4][11] = 1;
        newGrid[startRow + 1][12] = 1;
        newGrid[startRow + 4][12] = 1;

        insertDigit(m1, 14, startRow);      // First Minute Digit (col 14-17)
        insertDigit(m2, 19, startRow);      // Second Minute Digit (col 19-22)

        // Second Colon (MM:SS) at cols 24-25
        newGrid[startRow + 1][24] = 1;
        newGrid[startRow + 4][24] = 1;
        newGrid[startRow + 1][25] = 1;
        newGrid[startRow + 4][25] = 1;

        insertDigit(s1, 27, startRow);      // First Second Digit (col 27-30)
        insertDigit(s2, 32, startRow);      // Second Second Digit (col 32-35)

        return newGrid;
    }, [timeStr]);

    return (
        <div className="w-full h-full flex items-center justify-center bg-black p-4">
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                    gap: '6px', // Gap between flip cards
                    width: '100%',
                    aspectRatio: `${cols}/${rows}`
                }}
            >
                {grid.map((row, r) => (
                    row.map((isActive, c) => (
                        <FlipPixel
                            key={`${r}-${c}`}
                            active={isActive === 1}
                            x={c}
                            y={r}
                        />
                    ))
                ))}
            </div>
        </div>
    );
}
