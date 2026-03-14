import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MouseInteraction1Props {
    className?: string;
    boxSize?: number; // Size of each grid box
    trailSize?: number; // Number of boxes in the trail
    gridGap?: number; // Gap between boxes (0 for tightly packed)
    onHoverColor?: string; // High contrast color
    hideGrid?: boolean; // If true, only trail is visible
}

const MouseInteraction1: React.FC<MouseInteraction1Props> = ({
    className = '',
    boxSize = 35,
    trailSize = 5,
    gridGap = 0,
    onHoverColor = '#ffffff', // Default to white
    hideGrid = true,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const trailRef = useRef<{ x: number; y: number }[]>([]);
    const lastMouseRef = useRef<{ x: number; y: number } | null>(null);
    const animationFrameRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let columns = 0;
        let rows = 0;

        const handleResize = () => {
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            ctx.scale(dpr, dpr);

            columns = Math.ceil(rect.width / boxSize);
            rows = Math.ceil(rect.height / boxSize);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        const drawRoundedRect = (
            context: CanvasRenderingContext2D,
            x: number,
            y: number,
            width: number,
            height: number,
            radius: number | { tl: number; tr: number; br: number; bl: number }
        ) => {
            context.beginPath();
            if (typeof radius === 'number') {
                if ('roundRect' in context) {
                    // @ts-ignore
                    context.roundRect(x, y, width, height, radius);
                } else {
                    (context as CanvasRenderingContext2D).rect(x, y, width, height);
                }
            } else {
                // Custom radius per corner
                const { tl, tr, br, bl } = radius;
                context.moveTo(x + tl, y);
                context.lineTo(x + width - tr, y);
                context.quadraticCurveTo(x + width, y, x + width, y + tr);
                context.lineTo(x + width, y + height - br);
                context.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
                context.lineTo(x + bl, y + height);
                context.quadraticCurveTo(x, y + height, x, y + height - bl);
                context.lineTo(x, y + tl);
                context.quadraticCurveTo(x, y, x + tl, y);
            }
            context.closePath();
            context.fill();
        };



        const render = () => {
            ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

            // If we are not hiding grid, we might draw it here, but requirement says "grids not visible"

            ctx.fillStyle = onHoverColor;

            const trail = trailRef.current;

            // Build lookup for neighbors (perf opt)
            const trailSet = new Set(trail.map(p => `${p.x},${p.y}`));
            const hasPoint = (x: number, y: number) => trailSet.has(`${x},${y}`);

            for (let i = 0; i < trail.length; i++) {
                const point = trail[i];
                const { x, y } = point;

                const hasLeft = hasPoint(x - 1, y);
                const hasRight = hasPoint(x + 1, y);
                const hasTop = hasPoint(x, y - 1);
                const hasBottom = hasPoint(x, y + 1);

                const hasTL = hasPoint(x - 1, y - 1);
                const hasTR = hasPoint(x + 1, y - 1);
                const hasBL = hasPoint(x - 1, y + 1);
                const hasBR = hasPoint(x + 1, y + 1);

                const r = 14; // Increased smoothness

                // Outer Corners
                const radius = {
                    tl: (!hasTop && !hasLeft) ? r : 0,
                    tr: (!hasTop && !hasRight) ? r : 0,
                    br: (!hasBottom && !hasRight) ? r : 0,
                    bl: (!hasBottom && !hasLeft) ? r : 0,
                };

                const xPos = Math.round(x * boxSize + (x * gridGap));
                const yPos = Math.round(y * boxSize + (y * gridGap));

                // Increased overlap to 2px to ensure no hairlines on any display
                const overlap = 2;
                drawRoundedRect(
                    ctx,
                    xPos - overlap,
                    yPos - overlap,
                    boxSize + (overlap * 2),
                    boxSize + (overlap * 2),
                    radius
                );

                // Inner Corner Fillets
                // Use quadratic curves to fill the sharp inner corners

                // Top-Left Fillet
                if (hasLeft && hasTop && !hasTL) {
                    ctx.beginPath();
                    ctx.moveTo(xPos - r, yPos);
                    ctx.quadraticCurveTo(xPos, yPos, xPos, yPos - r);
                    ctx.lineTo(xPos, yPos);
                    ctx.closePath();
                    ctx.fill();
                }

                // Top-Right Fillet
                if (hasRight && hasTop && !hasTR) {
                    const vx = xPos + boxSize;
                    const vy = yPos;
                    ctx.beginPath();
                    ctx.moveTo(vx, vy - r);
                    ctx.quadraticCurveTo(vx, vy, vx + r, vy);
                    ctx.lineTo(vx, vy);
                    ctx.closePath();
                    ctx.fill();
                }

                // Bottom-Left Fillet
                if (hasLeft && hasBottom && !hasBL) {
                    const vx = xPos;
                    const vy = yPos + boxSize;
                    ctx.beginPath();
                    ctx.moveTo(vx - r, vy);
                    ctx.quadraticCurveTo(vx, vy, vx, vy + r);
                    ctx.lineTo(vx, vy);
                    ctx.closePath();
                    ctx.fill();
                }

                // Bottom-Right Fillet
                if (hasRight && hasBottom && !hasBR) {
                    const vx = xPos + boxSize;
                    const vy = yPos + boxSize;
                    ctx.beginPath();
                    ctx.moveTo(vx, vy + r);
                    ctx.quadraticCurveTo(vx, vy, vx + r, vy);
                    ctx.lineTo(vx, vy);
                    ctx.closePath();
                    ctx.fill();
                }
            }

            // Fade out logic not strictly requested, "last 5 boxes should be visible" implies constant visibility or instant removal after 5.
            // We are just drawing the array.
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const col = Math.floor(x / (boxSize + gridGap));
            const row = Math.floor(y / (boxSize + gridGap));

            // Use a set or check strictly to avoid duplicates if mouse stays in same box
            const currentPos = { x: col, y: row };

            const trail = trailRef.current;
            const lastPos = trail[trail.length - 1];

            // Interpolate if distance > 1
            if (lastPos) {
                const dx = col - lastPos.x;
                const dy = row - lastPos.y;
                const steps = Math.max(Math.abs(dx), Math.abs(dy));

                if (steps > 0) {
                    for (let i = 1; i <= steps; i++) {
                        const nextX = lastPos.x + Math.round((dx * i) / steps);
                        const nextY = lastPos.y + Math.round((dy * i) / steps);

                        let cur = trail[trail.length - 1];

                        // Enforce 4-connectivity: handle diagonal jumps
                        if (cur.x !== nextX && cur.y !== nextY) {
                            trail.push({ x: nextX, y: cur.y });
                            while (trail.length > trailSize) trail.shift();
                            cur = trail[trail.length - 1];
                        }

                        if (cur.x !== nextX || cur.y !== nextY) {
                            trail.push({ x: nextX, y: nextY });
                            while (trail.length > trailSize) trail.shift();
                        }
                    }
                    lastMouseRef.current = { x: col, y: row };
                    requestAnimationFrame(render);
                }
            } else {
                trail.push(currentPos);
                while (trail.length > trailSize) trail.shift();
                lastMouseRef.current = currentPos;
                requestAnimationFrame(render);
            }
        };

        const handleMouseLeave = () => {
            // Optionally clear trail on leave?
            // trailRef.current = [];
            // requestAnimationFrame(render);
        };

        window.addEventListener('mousemove', handleMouseMove);
        // We attach to window to catch global movement if desired, or container?
        // "when the mouse is hovered" -> Usually implies over the component.
        // I will attach to container.
        // Actually, changing to container for specific interaction.
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('resize', handleResize);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [boxSize, trailSize, gridGap, onHoverColor]);

    return (
        <div
            ref={containerRef}
            className={`w-full h-full relative overflow-hidden bg-black ${className}`}
        >
            <canvas ref={canvasRef} className="block absolute top-0 left-0 hover:cursor-none" />
        </div>
    );
};

export default MouseInteraction1;
