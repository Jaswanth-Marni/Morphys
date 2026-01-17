// Instant loading skeleton for component detail pages
// This shows immediately while the main page.tsx loads

export default function Loading() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section Skeleton */}
            <div className="w-full px-4 md:px-8 pt-24 md:pt-32">
                <div className="max-w-7xl mx-auto">
                    {/* Category/Index Pills */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-6 w-16 rounded-full bg-foreground/5 animate-pulse" />
                        <div className="h-6 w-20 rounded-full bg-foreground/5 animate-pulse" />
                    </div>

                    {/* Title Skeleton */}
                    <div className="h-24 md:h-40 w-3/4 rounded-lg bg-foreground/5 animate-pulse mb-6" />

                    {/* Description Skeleton */}
                    <div className="h-6 w-full max-w-2xl rounded bg-foreground/5 animate-pulse mb-2" />
                    <div className="h-6 w-2/3 max-w-xl rounded bg-foreground/5 animate-pulse mb-6" />

                    {/* Tags Skeleton */}
                    <div className="flex gap-2">
                        <div className="h-6 w-16 rounded-full bg-foreground/5 animate-pulse" />
                        <div className="h-6 w-20 rounded-full bg-foreground/5 animate-pulse" />
                        <div className="h-6 w-14 rounded-full bg-foreground/5 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Sandbox Skeleton */}
            <div className="w-full px-4 md:px-8 mt-12 md:mt-16">
                <div className="max-w-7xl mx-auto">
                    <div className="aspect-[4/3] md:aspect-[16/9] w-full rounded-3xl bg-foreground/5 animate-pulse flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 border-3 border-foreground/10 border-t-foreground/30 rounded-full animate-spin" />
                            <span className="text-sm text-foreground/30">Loading component...</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation Skeleton */}
            <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
                <div className="h-14 w-64 md:w-96 rounded-2xl bg-foreground/5 animate-pulse" />
            </div>
        </div>
    );
}
