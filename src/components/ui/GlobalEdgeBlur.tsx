"use client";

/**
 * GlobalEdgeBlur Component
 * A permanent, fixed progressive blur applied to all edges of the viewport.
 * This component stays visible regardless of scroll position and works across all pages.
 * Updated: Removed background tint/opacity, using only backdrop-filter.
 */
const GlobalEdgeBlur = () => {
    return (
        <div className="fixed inset-0 z-[100] pointer-events-none" aria-hidden="true">
            {/* ========== TOP EDGE ========== */}
            {/* Backdrop blur layer */}
            <div
                className="absolute top-0 left-0 right-0"
                style={{
                    height: "100px",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
                }}
            />

            {/* ========== BOTTOM EDGE ========== */}
            {/* Backdrop blur layer */}
            <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                    height: "100px",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)",
                }}
            />

            {/* ========== LEFT EDGE (Desktop Only) ========== */}
            {/* Backdrop blur layer */}
            <div
                className="hidden md:block absolute top-0 bottom-0 left-0"
                style={{
                    width: "60px",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    maskImage: "linear-gradient(to right, black 0%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to right, black 0%, transparent 100%)",
                }}
            />

            {/* ========== RIGHT EDGE (Desktop Only) ========== */}
            {/* Backdrop blur layer */}
            <div
                className="hidden md:block absolute top-0 bottom-0 right-0"
                style={{
                    width: "60px",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    maskImage: "linear-gradient(to left, black 0%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to left, black 0%, transparent 100%)",
                }}
            />
        </div>
    );
};

export { GlobalEdgeBlur };
