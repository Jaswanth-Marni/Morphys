// Instant loading skeleton for components listing page

export default function Loading() {
    return (
        <div className="min-h-screen bg-background pt-32 md:pt-24">
            {/* Switcher Skeleton */}
            <div className="sticky top-20 md:top-20 z-50 flex justify-center mb-8">
                <div className="h-12 w-48 rounded-full bg-foreground/5 animate-pulse" />
            </div>

            {/* Grid Skeleton */}
            <div className="w-full px-4 md:px-8 pb-12 mt-8 md:mt-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-7xl mx-auto">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div
                            key={i}
                            className="aspect-square w-full rounded-[32px] bg-foreground/5 animate-pulse"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
