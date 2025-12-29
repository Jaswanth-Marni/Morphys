export type StyleCard = {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    usage: string[];
    principles: string[];
    gradient: string;
    accentColor: string;
    image: string;
};

export const uiStyles: StyleCard[] = [
    {
        id: "glassmorphism",
        title: "Glassmorphism",
        description: "Frosted glass effect with blur and transparency",
        longDescription: "Glassmorphism is a design trend that simulates the look of frosted glass. It emphasizes light and dark mode support, using translucency and background blur to create a sense of depth and hierarchy.",
        usage: [
            "Use mostly for cards, navigation bars, and modals.",
            "Avoid using it for main content backgrounds to maintain readability.",
            "Works best on colorful, abstract backgrounds."
        ],
        principles: [
            "Translucency (Frosted Glass Effect)",
            "Vivid background colors to highlight the blur",
            "Subtle borders to define boundaries",
            "Light shadows to create depth"
        ],
        gradient: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        accentColor: "#FFD700",
        image: "/Glassmophism.jpg",
    },
    {
        id: "neo-brutalism",
        title: "Neo-Brutalism",
        description: "Bold colors, harsh shadows, raw aesthetics",
        longDescription: "Neo-Brutalism merges the raw, unpolished aesthetic of architectural brutalism with modern web design standards. It creates a stark, high-contrast look that stands out from typical clean designs.",
        usage: [
            "Perfect for bold brands, personal portfolios, and creative agencies.",
            "Use high-contrast borders and shadows.",
            "Combine with quirky typography."
        ],
        principles: [
            "High contrast and bold outlines",
            "Clashing colors or monochrome palettes",
            "Raw, unrefined shapes",
            "Distinct, hard shadows (no blur)"
        ],
        gradient: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
        accentColor: "#f472b6",
        image: "/neo brutalism.jpg",
    },
    {
        id: "material-3",
        title: "Material 3",
        description: "Dynamic color, expressive motion, adaptive design",
        longDescription: "Material 3 is Google's latest design system, focusing on personal, adaptive, and expressive experiences. It uses dynamic color extraction from wallpapers and emphasizes smooth motion.",
        usage: [
            "Ideal for Android apps and cross-platform ecosystems.",
            "Use large touch targets and rounded corners.",
            "Leverage the dynamic color system."
        ],
        principles: [
            "Dynamic Color (You Material)",
            "Playful and expressive motion",
            "Standardized layout grids",
            "Accessibility first"
        ],
        gradient: "linear-gradient(135deg, #6750A4 0%, #B69DF8 100%)",
        accentColor: "#D0BCFF",
        image: "/Material 3.png",
    },
    {
        id: "skeuomorphism",
        title: "Skeuomorphism",
        description: "Real-world textures, depth, and tangible interfaces",
        longDescription: "Skeuomorphism mimics real-world objects and textures in the digital space. It aims to make interfaces feel familiar and intuitive by replicating physical counterparts like buttons, switches, and dials.",
        usage: [
            "Great for audio apps, calculators, and tools mimicking physical devices.",
            "Use realistic lighting, shadows, and textures.",
            "Avoid in complex data-heavy applications."
        ],
        principles: [
            "Realism and familiarity",
            "Simulated physical textures (leather, metal, wood)",
            "Depth through highlights and shadows",
            "Analog interactions"
        ],
        gradient: "linear-gradient(135deg, #d4a373 0%, #faedcd 100%)",
        accentColor: "#8c6b45",
        image: "/SKEUOMORPHISM.png",
    },
    {
        id: "neumorphism",
        title: "Neumorphism",
        description: "Soft UI with subtle shadows and highlights",
        longDescription: "Neumorphism (Soft UI) combines flat design with skeuomorphism, creating elements that appear to be extruded from the background. It uses soft shadows and highlights to create a tactile feel.",
        usage: [
            "Effective for dashboards, smart home controls, and simple tools.",
            "Requires careful handling of contrast for accessibility.",
            "Use for toggle switches, sliders, and buttons."
        ],
        principles: [
            "Monochromatic color palettes",
            "Soft, blurred shadows (light and dark)",
            "Elements appear attached to the background",
            "Subtle visual hierarchy"
        ],
        gradient: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
        accentColor: "#a0a0a0",
        image: "/neumorphism.jpg",
    },
    {
        id: "minimalism",
        title: "Minimalism",
        description: "Clean lines, whitespace, typography focus",
        longDescription: "Minimalism focuses on stripping away non-essential elements to highlight content and functionality. It relies on whitespace, typography, and grid systems to create order and elegance.",
        usage: [
            "Suitable for virtually any application, especially content-heavy sites.",
            "Prioritize typography and grid alignment.",
            "Use negative space generously."
        ],
        principles: [
            "Less is more",
            "Focus on functionality",
            "Clean typography and limited color palette",
            "Extensive use of whitespace"
        ],
        gradient: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
        accentColor: "#333333",
        image: "/minimalism.jpg",
    },
    {
        id: "retro",
        title: "Retro",
        description: "Vintage aesthetics, noisy textures, nostalgic vibes",
        longDescription: "Retro design draws inspiration from past decades (80s, 90s). It often features pixel art, noisy textures, neon colors, and glitched effects to evoke nostalgia.",
        usage: [
            "Perfect for gaming sites, music portfolios, and artistic projects.",
            "Use pixel fonts and CRT monitor effects.",
            "Experiment with synthwave color palettes."
        ],
        principles: [
            "Nostalgia-driven visuals",
            "Textures (noise, scanlines, grain)",
            "Vintage typography",
            "Bold, specific color schemes (e.g., vaporwave)"
        ],
        gradient: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
        accentColor: "#ff9966",
        image: "/Retro.jpg",
    },
    {
        id: "pop-art",
        title: "Pop Art",
        description: "Bold outlines, comic style, vibrant patterns",
        longDescription: "Pop Art style is characterized by bold imagery, bright colors, and use of patterns like Ben-Day dots. It mimics the style of comic books and advertising from the mid-20th century.",
        usage: [
            "Use for marketing campaigns, playful brands, and posters.",
            "Incorporate halftone patterns and speech bubbles.",
            "Use thick black outlines."
        ],
        principles: [
            "Vibrant, saturated colors",
            "Ben-Day dots and halftone patterns",
            "Iconic, mass-culture imagery",
            "Irony and wit"
        ],
        gradient: "linear-gradient(135deg, #fff200 0%, #ed1c24 100%)",
        accentColor: "#00aeef",
        image: "/pop art.png",
    },
];
