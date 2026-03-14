"use client";

import React, { useEffect, useRef } from "react";

export interface KineticGridProps {
  className?: string;
  gridSize?: number; // Distance between pluses
  plusSize?: number; // Size of the plus icon
  color?: string; // Color of the plus
  influenceRadius?: number; // How far the mouse affects
  forceMultiplier?: number; // How strong the wind is
  damping?: number; // How quickly it slows down (0 to 1)
}

interface PointState {
  x: number;
  y: number;
  angle: number;
  angularVelocity: number;
  scale: number;
  scaleVelocity: number;
  type: 'plus' | 'cross' | 'dot' | 'circle' | 'square' | 'triangle' | 'dash';
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  force: number;
  life: number;
}

export const KineticGrid = ({
  className = "",
  gridSize = 40,
  plusSize = 10,
  color = "currentColor",
  influenceRadius = 400,
  forceMultiplier = 0.0005,
  damping = 0.9,
}: KineticGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking
  const mouse = useRef({ x: -1000, y: -1000, vx: 0, vy: 0 });
  const smoothedMouse = useRef({ x: -1000, y: -1000 });
  const lastMouse = useRef({ x: -1000, y: -1000 });
  const mouseTimeout = useRef<NodeJS.Timeout | null>(null);

  // Grid and Effects state
  const gridState = useRef<PointState[]>([]);
  const ripples = useRef<Ripple[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;

    const getActualColor = () => {
      if (color === "currentColor") {
        const computed = window.getComputedStyle(container);
        return computed.color || "#000000";
      }
      return color;
    };

    let actualColor = getActualColor();

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const dpr = window.devicePixelRatio || 1;
      // Increase canvas size slightly to allow for parallax panning without clipping edges
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      
      actualColor = getActualColor();

      cols = Math.ceil(width / gridSize) + 2;
      rows = Math.ceil(height / gridSize) + 2;

      const offsetX = (width - cols * gridSize) / 2 + gridSize / 2;
      const offsetY = (height - rows * gridSize) / 2 + gridSize / 2;

      const newGrid: PointState[] = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = offsetX + x * gridSize;
          const py = offsetY + y * gridSize;
          
          let type: PointState['type'] = 'plus';
          const rand = Math.random();
          if (rand < 0.15) type = 'dot';
          else if (rand < 0.3) type = 'circle';
          else if (rand < 0.45) type = 'square';
          else if (rand < 0.6) type = 'triangle';
          else if (rand < 0.75) type = 'dash';
          else if (rand < 0.85) type = 'cross';
          else type = 'plus';

          newGrid.push({
            x: px,
            y: py,
            angle: 0,
            angularVelocity: 0,
            scale: 1,
            scaleVelocity: 0,
            type,
          });
        }
      }
      gridState.current = newGrid;
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      if (lastMouse.current.x !== -1000) {
        mouse.current.vx = currentX - lastMouse.current.x;
        mouse.current.vy = currentY - lastMouse.current.y;
      }
      
      mouse.current.x = currentX;
      mouse.current.y = currentY;

      if (smoothedMouse.current.x === -1000) {
        smoothedMouse.current.x = currentX;
        smoothedMouse.current.y = currentY;
      }

      lastMouse.current.x = currentX;
      lastMouse.current.y = currentY;

      if (mouseTimeout.current) clearTimeout(mouseTimeout.current);
      mouseTimeout.current = setTimeout(() => {
        mouse.current.vx = 0;
        mouse.current.vy = 0;
      }, 50);
    };

    const onClick = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        ripples.current.push({
            x: currentX,
            y: currentY,
            radius: 0,
            force: 0.2, // Ripple strength
            life: 1
        });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse for soft tracking
      if (mouse.current.x !== -1000) {
         smoothedMouse.current.x += (mouse.current.x - smoothedMouse.current.x) * 0.1;
         smoothedMouse.current.y += (mouse.current.y - smoothedMouse.current.y) * 0.1;
      }

      // Parallax effect on the canvas wrapper
      if (mouse.current.x !== -1000) {
          const parallaxX = (smoothedMouse.current.x / width - 0.5) * 20;
          const parallaxY = (smoothedMouse.current.y / height - 0.5) * 20;
          canvas.style.transform = `translate(${-parallaxX}px, ${-parallaxY}px) scale(1.05)`;
      } else {
          canvas.style.transform = `translate(0px, 0px) scale(1.05)`;
      }

      // Update ripples
      for (let i = ripples.current.length - 1; i >= 0; i--) {
          const r = ripples.current[i];
          r.radius += 12; // Expansion speed
          r.life -= 0.015; // Fade speed
          if (r.life <= 0) {
              ripples.current.splice(i, 1);
          }
      }

      ctx.strokeStyle = actualColor;
      ctx.fillStyle = actualColor;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";

      gridState.current.forEach((p) => {
        // Spotlight calculations
        const distToSmoothed = Math.sqrt((p.x - smoothedMouse.current.x)**2 + (p.y - smoothedMouse.current.y)**2);
        
        // Base opacity is 0.15, peaks at 1.0 near mouse
        const spotlightFade = mouse.current.x === -1000 ? 0 : Math.max(0, 1 - distToSmoothed / (influenceRadius * 1.5));
        ctx.globalAlpha = 0.15 + (spotlightFade * 0.85);

        // Apply mouse wind force
        const distToMouse = Math.sqrt((p.x - mouse.current.x)**2 + (p.y - mouse.current.y)**2);
        if (distToMouse < influenceRadius && (mouse.current.vx !== 0 || mouse.current.vy !== 0)) {
           const falloff = 1 - (distToMouse / influenceRadius);
           
           const spinTypes = ['plus', 'cross', 'square', 'triangle', 'dash'];
           const typeMultiplier = spinTypes.includes(p.type) ? (p.type === 'cross' ? 1.5 : 1) : 0;
           const torque = (mouse.current.vx + mouse.current.vy) * forceMultiplier * falloff * typeMultiplier;
           p.angularVelocity += torque;
           
           // Slight squeeze effect as mouse passes over
           const speed = Math.sqrt(mouse.current.vx**2 + mouse.current.vy**2);
           p.scaleVelocity -= falloff * 0.005 * Math.min(speed, 20); 
        }

        // Apply Ripple Forces
        ripples.current.forEach(r => {
            const distToRipple = Math.sqrt((p.x - r.x)**2 + (p.y - r.y)**2);
            const ringDist = Math.abs(distToRipple - r.radius);
            if (ringDist < 60 && r.life > 0) {
                const push = (1 - ringDist / 60) * r.force * r.life;
                if (p.type !== 'dot' && p.type !== 'circle') {
                   p.angularVelocity += push * (p.x > r.x ? 1 : -1) * 2; // Spin burst
                }
                p.scaleVelocity += push * 0.5; // Scale burst
            }
        });

        // Spring physics for scale
        p.scaleVelocity += (1 - p.scale) * 0.1; // Spring to target scale 1
        p.scaleVelocity *= 0.8; // Damping
        p.scale += p.scaleVelocity;

        // Spin physics
        p.angularVelocity *= damping;
        p.angle += p.angularVelocity;

        const currentSize = plusSize * Math.max(0.1, p.scale);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        ctx.beginPath();
        if (p.type === 'dot') {
            const dotSize = currentSize * 0.25;
            ctx.arc(0, 0, dotSize, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.type === 'circle') {
            const circleSize = currentSize * 0.4;
            ctx.arc(0, 0, circleSize, 0, Math.PI * 2);
            ctx.stroke();
        } else if (p.type === 'square') {
            const sqSize = currentSize * 0.6;
            ctx.rect(-sqSize / 2, -sqSize / 2, sqSize, sqSize);
            ctx.stroke();
        } else if (p.type === 'triangle') {
            const triSize = currentSize * 0.5;
            ctx.moveTo(0, -triSize);
            ctx.lineTo(triSize * 0.866, triSize * 0.5);
            ctx.lineTo(-triSize * 0.866, triSize * 0.5);
            ctx.closePath();
            ctx.stroke();
        } else if (p.type === 'dash') {
            ctx.moveTo(-currentSize / 2, 0);
            ctx.lineTo(currentSize / 2, 0);
            ctx.stroke();
        } else {
            if (p.type === 'cross') {
               ctx.rotate(Math.PI / 4);
            }
            ctx.moveTo(-currentSize / 2, 0);
            ctx.lineTo(currentSize / 2, 0);
            ctx.moveTo(0, -currentSize / 2);
            ctx.lineTo(0, currentSize / 2);
            ctx.stroke();
        }
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      if (mouseTimeout.current) clearTimeout(mouseTimeout.current);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gridSize, plusSize, color, influenceRadius, forceMultiplier, damping]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full overflow-hidden ${className}`} 
      style={{ minHeight: "100%", minWidth: "100%" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-auto transition-transform duration-300 ease-out" />
    </div>
  );
};

export default KineticGrid;
