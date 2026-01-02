"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMenu } from "@/context/MenuContext";
import {
    DotPattern,
    Footer,
    ComponentsSwitcher,
    StyleSpecificComponents,
    NormalComponents,
    ProgressiveBlur
} from "@/components/ui";
import { type TabId } from "@/components/ui/ComponentsSwitcher";

export default function ComponentsPage() {
    const [activeTab, setActiveTab] = useState<TabId>("styles");
    const { hasVisitedHome } = useMenu();
    const router = useRouter();

    useEffect(() => {
        if (!hasVisitedHome) {
            router.push("/");
        }
    }, [hasVisitedHome, router]);

    // Don't render content if redirecting (optional optimization, prevents flash)
    if (!hasVisitedHome) return null;

    return (
        <main className="relative min-h-screen pt-32 md:pt-24">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0">
                <DotPattern />
            </div>

            {/* Top Blur - Mobile (Stronger) */}
            <ProgressiveBlur className="block md:hidden" position="top" height="150px" blurAmount="16px" />
            {/* Top Blur - Desktop (Standard) */}
            <ProgressiveBlur className="hidden md:block" position="top" height="150px" blurAmount="8px" />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center gap-8 w-full min-h-[calc(100vh-200px)]">

                {/* Switcher */}
                <div className="sticky top-20 md:top-20 z-50">
                    <ComponentsSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                {/* Content Area */}
                <div className="w-full h-full flex-1">
                    {activeTab === "styles" ? (
                        <StyleSpecificComponents />
                    ) : (
                        <NormalComponents />
                    )}
                </div>
            </div>

            <div className="mt-12 md:mt-0">
                <Footer />
            </div>
        </main >
    );
}
