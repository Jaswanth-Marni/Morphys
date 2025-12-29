import { uiStyles } from "./styles";

// Radial/Organic layout for infinite canvas
// Each style has a position on the 2D canvas world
// The layout is designed to feel organic and exploratory

export type CanvasStylePosition = {
    id: string;
    x: number;  // Percentage from center (-100 to 100 represents viewport widths)
    y: number;  // Percentage from center (-100 to 100 represents viewport heights)
    angle: number; // Rotation angle for subtle visual variety
};

// Golden angle distribution for organic radial layout
// This creates a sunflower-like spiral pattern
const GOLDEN_ANGLE = 137.508; // degrees
const RADIUS_MULTIPLIER = 180; // Controls spacing between sections

export const canvasStylePositions: CanvasStylePosition[] = uiStyles.map((style, index) => {
    if (index === 0) {
        // First item (Glassmorphism) at center
        return {
            id: style.id,
            x: 0,
            y: 0,
            angle: 0,
        };
    }

    // Organic spiral distribution using golden angle
    const angle = index * GOLDEN_ANGLE * (Math.PI / 180);
    const radius = RADIUS_MULTIPLIER * Math.sqrt(index);

    return {
        id: style.id,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        angle: (index * 15) % 360, // Subtle rotation variation
    };
});

// Get position by style ID
export const getStylePosition = (styleId: string): CanvasStylePosition | undefined => {
    return canvasStylePositions.find(pos => pos.id === styleId);
};

// Get nearest style to a given canvas position
export const getNearestStyle = (x: number, y: number): CanvasStylePosition => {
    let nearest = canvasStylePositions[0];
    let minDistance = Infinity;

    for (const pos of canvasStylePositions) {
        const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
        if (distance < minDistance) {
            minDistance = distance;
            nearest = pos;
        }
    }

    return nearest;
};

// Get all adjacent styles within a radius (for edge hints)
export const getAdjacentStyles = (styleId: string, radius: number = 250): CanvasStylePosition[] => {
    const currentPos = getStylePosition(styleId);
    if (!currentPos) return [];

    return canvasStylePositions.filter(pos => {
        if (pos.id === styleId) return false;
        const distance = Math.sqrt(
            Math.pow(currentPos.x - pos.x, 2) +
            Math.pow(currentPos.y - pos.y, 2)
        );
        return distance <= radius;
    });
};

// Canvas world bounds (for reference)
export const CANVAS_BOUNDS = {
    minX: Math.min(...canvasStylePositions.map(p => p.x)) - 100,
    maxX: Math.max(...canvasStylePositions.map(p => p.x)) + 100,
    minY: Math.min(...canvasStylePositions.map(p => p.y)) - 100,
    maxY: Math.max(...canvasStylePositions.map(p => p.y)) + 100,
};
