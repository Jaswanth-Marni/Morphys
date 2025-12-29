"use client";

import { InfiniteCanvas } from "./InfiniteCanvas";

/**
 * CanvasOverlay renders the InfiniteCanvas as a fixed overlay.
 * It's controlled by the ShowcaseContext's isCanvasOpen state.
 */
export const CanvasOverlay = () => {
    return <InfiniteCanvas />;
};

export default CanvasOverlay;
