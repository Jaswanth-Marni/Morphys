"use client";

import React from "react";
import { motion } from "framer-motion";

interface Retro3DTextProps {
  /**
   * The text to display
   */
  text?: string;
  /**
   * Font size of the text
   */
  fontSize?: string;
  /**
   * Color of the text face
   */
  frontColor?: string;
  /**
   * Color of the 3D extrusion/shadow
   */
  sideColor?: string;
  /**
   * Background color of the container
   */
  backgroundColor?: string;
  /**
   * Depth of the extrusion in pixels
   */
  depth?: number;
  /**
   * Font family to use
   */
  fontFamily?: string;
  /**
   * Whether to enable hover interaction
   */
  isInteractive?: boolean;
  /**
   * Additional classes for the container
   */
  className?: string;
  /**
   * Letter spacing for the text
   */
  letterSpacing?: string;
}

export const Retro3DText = ({
  text = "MORPHYS",
  fontSize = "8rem",
  frontColor = "#FDF9ED", // Cream/White
  sideColor = "#3B70A2",  // Blue
  backgroundColor = "#FAD3E7", // Pink
  depth = 15,
  fontFamily = "'Thunder', sans-serif",
  isInteractive = true,
  className = "",
  letterSpacing = "0px",
}: Retro3DTextProps) => {
  // Use a fixed number of layers for smooth interpolation
  // We render extra layers for the hover state, but collapse them when not hovered
  const MAX_DEPTH = depth + 10;

  const getShadow = (targetDepth: number) => {
    return Array.from({ length: MAX_DEPTH })
      .map((_, i) => {
        // If the current layer index (i) is within the target depth, place it at i+1
        // Otherwise, clamp it to the targetDepth to stack it behind the last visible layer
        const offset = i < targetDepth ? i + 1 : targetDepth;
        return `${offset}px ${offset}px 0 ${sideColor}`;
      })
      .join(", ");
  };

  return (
    <div
      className={`flex items-center justify-center w-full h-full overflow-hidden ${className}`}
      style={{ backgroundColor }}
    >
      <motion.h1
        initial={{ opacity: 0, scale: 0.8, textShadow: getShadow(0) }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          textShadow: getShadow(depth) 
        }}
        whileHover={isInteractive ? { 
          scale: 1.05, 
          textShadow: getShadow(depth + 5),
          transition: { duration: 0.2, ease: "linear" }
        } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          color: frontColor,
          fontSize: fontSize,
          lineHeight: 0.8,
          fontFamily: fontFamily,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: letterSpacing,
        }}
        className="select-none m-0 p-0 text-center"
      >
        {text}
      </motion.h1>
    </div>
  );
};

export default Retro3DText;
