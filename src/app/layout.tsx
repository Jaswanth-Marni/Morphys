import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Navbar from "@/components/ui/Navbar";
import { GlassPill, Menu, ScrollToTop, GlobalEdgeBlur } from "@/components/ui";
import { MenuProvider } from "@/context/MenuContext";
import { ShowcaseProvider } from "@/context/ShowcaseContext";
import { NavigationLoadingProvider } from "@/context/NavigationLoadingContext";
import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";
import TransitionProvider from "@/components/ui/TransitionProvider";
import CanvasOverlay from "@/components/ui/CanvasOverlay";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const victoryStriker = localFont({
  src: "../../public/Victory Striker Sans Demo.otf",
  variable: "--font-victory",
});



export const metadata: Metadata = {
  title: "Morphys - Curated Chaos",
  description: "The art of organized chaos in UI. Discover unique and uncommon components.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=satoshi@300,400,500,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${victoryStriker.variable} antialiased`}
        suppressHydrationWarning
      >
        <MenuProvider>
          <ShowcaseProvider>
            <NavigationLoadingProvider>
              <SmoothScrollProvider>
                <TransitionProvider>
                  <ScrollToTop />
                  <Navbar />
                  <GlassPill />
                  <Menu />
                  {children}
                  {/* Infinite Canvas Overlay - rendered as fixed overlay */}
                  <CanvasOverlay />
                  {/* Global Edge Blur - permanent blur on all viewport edges */}
                  <GlobalEdgeBlur />
                </TransitionProvider>
              </SmoothScrollProvider>
            </NavigationLoadingProvider>
          </ShowcaseProvider>
        </MenuProvider>
      </body>
    </html>
  );
}
