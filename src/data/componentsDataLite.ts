// Lightweight component data - NO fullCode included
// This file is ~7KB vs ~148KB for the full componentsData.ts
// fullCode is lazy-loaded separately when needed

export interface ComponentDataLite {
    id: string;
    name: string;
    index: number;
    description: string;
    tags: string[];
    category: 'animation' | 'interaction' | 'layout' | 'effect';
    previewConfig?: Record<string, unknown>;
    usage: string;
    dependencies: string[];
    props: {
        name: string;
        type: string;
        default: string;
        description: string;
    }[];
}

export const componentsDataLite: ComponentDataLite[] = [
    {
        id: 'flip-grid',
        name: 'Flip Grid',
        index: 1,
        description: 'A grid of flipping cards that create pixel-art style animations. Perfect for image reveals, text displays, and dynamic backgrounds.',
        tags: ['animation', 'grid', 'pixel', 'flip', 'retro', '8-bit'],
        category: 'animation',
        previewConfig: {
            gridSize: { cols: 8, rows: 6 },
            pattern: 'wave',
            speed: 'normal'
        },
        dependencies: ['framer-motion', 'react'],
        usage: `import { FlipGrid } from '@/components/ui';

// Basic usage
<FlipGrid />

// With custom configuration
<FlipGrid
    config={{
        cols: 12,
        rows: 8,
        pattern: 'wave',
        easing: 'spring',
        speed: 'normal',
        colorFront: '#ffffff',
        colorBack: '#000000',
        interactive: true,
    }}
    autoPlay={true}
    autoPlayInterval={3000}
/>`,
        props: [
            { name: 'config', type: 'Partial<FlipGridConfig>', default: '{}', description: 'Configuration object for grid appearance and behavior' },
            { name: 'autoPlay', type: 'boolean', default: 'true', description: 'Enable automatic pattern cycling' },
            { name: 'autoPlayInterval', type: 'number', default: '3000', description: 'Interval between pattern changes (ms)' },
            { name: 'imageData', type: 'boolean[][]', default: 'undefined', description: '2D array for custom flip patterns' },
            { name: 'onFlipComplete', type: '() => void', default: 'undefined', description: 'Callback when flip animation completes' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes for the grid container' },
        ]
    },
    {
        id: 'ascii-simulation',
        name: 'ASCII Simulation',
        index: 2,
        description: 'A retro-style 3D renderer that projects shapes into ASCII characters.',
        tags: ['ascii', '3d', 'retro', 'terminal', 'simulation', 'code-art'],
        category: 'animation',
        previewConfig: { shape: 'car', scale: 1, speed: 1 },
        dependencies: ['react'],
        usage: `import { AsciiSimulation } from '@/components/ui';

<AsciiSimulation
    config={{
        shape: 'donut',
        scale: 1,
        speed: 1,
        charSet: '.,-~:;=!*#$@',
        color: '#00ff00',
    }}
/>`,
        props: [
            { name: 'config', type: 'AsciiSimulationConfig', default: '{}', description: 'Configuration object for the simulation' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ]
    },
    {
        id: 'liquid-morph',
        name: 'Liquid Morph',
        index: 3,
        description: 'A soft, organic blob that subtly morphs and undulates like liquid metal.',
        tags: ['3d', 'interactive', 'fluid', 'webgl', 'organic', 'metal'],
        category: 'animation',
        previewConfig: { distort: 0.4, speed: 2, color: '#4a9eff' },
        dependencies: ['@react-three/fiber', '@react-three/drei', 'three'],
        usage: `import { LiquidMorph } from '@/components/ui';

<LiquidMorph
    config={{
        distort: 0.4,
        speed: 2,
        color: '#4a9eff',
    }}
/>`,
        props: [
            { name: 'config', type: 'LiquidMorphConfig', default: '{}', description: 'Configuration for the 3D blob' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ]
    },
    {
        id: 'page-reveal',
        name: 'Page Reveal',
        index: 4,
        description: 'A cinematic page transition with logo blur and split animations.',
        tags: ['animation', 'transition', 'reveal', 'intro', 'page-load'],
        category: 'animation',
        previewConfig: { duration: 2.5, logoText: 'MORPHYS' },
        dependencies: ['framer-motion', 'react'],
        usage: `import { PageReveal } from '@/components/ui';

<PageReveal
    config={{
        duration: 2.5,
        logoText: 'YOUR LOGO',
    }}
    onComplete={() => console.log('Reveal complete!')}
/>`,
        props: [
            { name: 'config', type: 'PageRevealConfig', default: '{}', description: 'Configuration for the reveal animation' },
            { name: 'onComplete', type: '() => void', default: 'undefined', description: 'Callback when animation completes' },
        ]
    },
    {
        id: 'navbar-menu',
        name: 'Navbar Menu',
        index: 5,
        description: 'An animated navigation bar with smooth expand/collapse transitions.',
        tags: ['navigation', 'menu', 'header', 'responsive', 'animation'],
        category: 'layout',
        previewConfig: { logoText: 'RUN', accentColor: '#ef4444' },
        dependencies: ['framer-motion', 'react'],
        usage: `import { NavbarMenu } from '@/components/ui';

<NavbarMenu
    config={{
        logoText: 'BRAND',
        accentColor: '#ef4444',
        animationSpeed: 1,
    }}
/>`,
        props: [
            { name: 'config', type: 'NavbarMenuConfig', default: '{}', description: 'Configuration for the navbar' },
        ]
    },
    {
        id: 'navbar-menu-2',
        name: 'Navbar Menu 2',
        index: 6,
        description: 'A modern navbar with clean animations and entrance effects.',
        tags: ['navigation', 'menu', 'header', 'minimal', 'animation'],
        category: 'layout',
        previewConfig: { logoText: 'Morphys' },
        dependencies: ['framer-motion', 'react'],
        usage: `import { NavbarMenu2 } from '@/components/ui';

<NavbarMenu2
    config={{
        logoText: 'Morphys',
        backgroundColor: '#ffffff',
        textColor: '#000000',
    }}
/>`,
        props: [
            { name: 'config', type: 'object', default: '{}', description: 'Configuration for the navbar' },
        ]
    },
    {
        id: 'spotlight-search',
        name: 'Spotlight Search',
        index: 7,
        description: 'A macOS-inspired spotlight search with smooth morphing animations.',
        tags: ['search', 'spotlight', 'modal', 'input', 'animation'],
        category: 'interaction',
        previewConfig: { morphDelay: 800, searchWidth: 600 },
        dependencies: ['framer-motion', 'react'],
        usage: `import SpotlightSearch from '@/components/ui/SpotlightSearch';

<SpotlightSearch
    config={{
        morphDelay: 800,
        searchWidth: 600,
    }}
/>`,
        props: [
            { name: 'config', type: 'object', default: '{}', description: 'Configuration for the search' },
        ]
    },
    {
        id: 'image-trail-cursor',
        name: 'Image Trail Cursor',
        index: 8,
        description: 'A cursor effect that leaves a trail of fading images.',
        tags: ['cursor', 'trail', 'images', 'effect', 'interactive'],
        category: 'effect',
        previewConfig: { size: 150, rotation: true, fadeDuration: 0.6 },
        dependencies: ['framer-motion', 'react'],
        usage: `import ImageTrailCursor from '@/components/ui/ImageTrailCursor';

<ImageTrailCursor
    config={{
        size: 150,
        rotation: true,
        fadeDuration: 0.6,
        distanceThreshold: 40,
    }}
/>`,
        props: [
            { name: 'config', type: 'ImageTrailCursorConfig', default: '{}', description: 'Configuration for the cursor trail' },
            { name: 'containerRef', type: 'RefObject<HTMLElement>', default: 'undefined', description: 'Container to attach the effect' },
        ]
    },
    {
        id: 'reality-lens',
        name: 'Liquid Reveal',
        index: 9,
        description: 'A liquid brush stroke effect that reveals hidden content.',
        tags: ['lens', 'reveal', 'liquid', 'interactive', 'effect'],
        category: 'effect',
        previewConfig: { lensSize: 200 },
        dependencies: ['react'],
        usage: `import { RealityLens } from '@/components/ui';

<RealityLens
    config={{
        lensSize: 200,
    }}
/>`,
        props: [
            { name: 'config', type: 'object', default: '{}', description: 'Configuration for the lens effect' },
        ]
    },
    {
        id: 'scroll-to-reveal',
        name: 'Scroll To Reveal',
        index: 10,
        description: 'Text that reveals with opacity based on scroll position.',
        tags: ['scroll', 'reveal', 'text', 'animation', 'opacity'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['react'],
        usage: `import { ScrollToReveal } from '@/components/ui';

<ScrollToReveal
    text="Your text here..."
    className="text-4xl"
    minOpacity={0.15}
/>`,
        props: [
            { name: 'text', type: 'string', default: "''", description: 'Text to reveal' },
            { name: 'className', type: 'string', default: "''", description: 'CSS classes for styling' },
            { name: 'minOpacity', type: 'number', default: '0.15', description: 'Minimum opacity for unrevealed text' },
        ]
    },
    {
        id: 'diffuse-text',
        name: 'Diffuse Text',
        index: 11,
        description: 'Blurred text with a diffuse glow effect.',
        tags: ['text', 'blur', 'diffuse', 'glow', 'effect'],
        category: 'effect',
        previewConfig: { text: 'MORPHYS', blurLevel: 24 },
        dependencies: ['react'],
        usage: `import { DiffuseText } from '@/components/ui';

<DiffuseText
    config={{
        text: 'MORPHYS',
        blurLevel: 24,
        intensity: 1,
        color: '#ffffff',
    }}
/>`,
        props: [
            { name: 'config', type: 'object', default: '{}', description: 'Configuration for the diffuse effect' },
        ]
    },
    {
        id: 'diagonal-focus',
        name: 'Diagonal Carousel',
        index: 12,
        description: 'A draggable diagonal carousel with infinite scroll and focus depth effects. Cards are arranged at an angle with dynamic scaling and opacity based on position.',
        tags: ['carousel', 'diagonal', 'infinite', 'cards', 'animation', 'draggable'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { DiagonalFocus } from '@/components/ui/DiagonalFocus';

// Basic usage
<DiagonalFocus />

// With custom className
<DiagonalFocus className="h-screen" />`,
        props: [
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes for container' },
        ]
    },
    {
        id: 'notification-stack',
        name: 'Stack Carousel',
        index: 13,
        description: 'A draggable vertical stack of notification cards with smooth spring animations. Features depth-based scaling, draggable scrolling, and a floating scrollbar indicator.',
        tags: ['notification', 'stack', 'toast', 'cards', 'animation', 'draggable'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { NotificationStack } from '@/components/ui/NotificationStack';

// Basic usage
<NotificationStack />

// With custom className
<NotificationStack className="h-screen" />`,
        props: [
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes for container' },
        ]
    },
    {
        id: 'text-pressure',
        name: 'Text Pressure',
        index: 14,
        description: 'Variable font weight that responds to cursor pressure. Text characters dynamically adjust their weight based on cursor proximity.',
        tags: ['text', 'variable-font', 'interactive', 'weight', 'effect'],
        category: 'effect',
        previewConfig: { text: 'MORPHYS' },
        dependencies: ['react'],
        usage: `import { TextPressure } from '@/components/ui/TextPressure';

// Basic usage
<TextPressure text="MORPHYS" />

// With custom configuration
<TextPressure
    text="MORPHYS"
    config={{
        textColor: '#ff0000',
        minFontSize: 48,
    }}
/>`,
        props: [
            { name: 'text', type: 'string', default: "'MORPHYS'", description: 'Text to display' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
            { name: 'textColor', type: 'string', default: "'var(--foreground)'", description: 'Color of the text' },
            { name: 'minFontSize', type: 'number', default: '36', description: 'Minimum font size in pixels' },
            { name: 'config', type: 'object', default: '{}', description: 'Configuration object with text, textColor, minFontSize' },
        ]
    },
    {
        id: 'fluid-height',
        name: 'Fluid Height',
        index: 15,
        description: 'Text with fluid height animation that grows on load and retracts on hover with a smooth neighbor effect.',
        tags: ['text', 'height', 'animation', 'hover', 'fluid'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import FluidHeight from '@/components/ui/FluidHeight';

// Basic usage (displays "MORPHYS" by default)
<FluidHeight />

// With custom styling
<FluidHeight 
    className="text-[5rem]"
    showHint={false}
/>`,
        props: [
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes for text styling' },
            { name: 'containerClassName', type: 'string', default: "''", description: 'CSS classes for container' },
            { name: 'showHint', type: 'boolean', default: 'true', description: 'Show "Hover to retract" hint' },
        ]
    },
    {
        id: 'text-mirror',
        name: 'Text Mirror',
        index: 16,
        description: 'Interactive mirrored text that spreads vertically based on cursor position. Features smooth animations that respond to mouse movement and auto-reset on idle.',
        tags: ['text', 'mirror', 'cursor', 'interactive', 'effect', 'responsive'],
        category: 'effect',
        previewConfig: { text: 'MORPHYS' },
        dependencies: ['react'],
        usage: `import TextMirror from '@/components/ui/TextMirror';

// Basic usage
<TextMirror />

// With custom configuration
<TextMirror
    config={{
        text: 'MORPHYS',
        spread: 30,
        fontSize: 120,
        color: '#ff0000',
        idleTimeout: 5000,
    }}
/>`,
        props: [
            { name: 'config.text', type: 'string', default: "'MORPHYS'", description: 'Text to display and mirror' },
            { name: 'config.spread', type: 'number', default: '30', description: 'Maximum vertical spread in pixels' },
            { name: 'config.fontSize', type: 'number', default: '120', description: 'Font size in pixels' },
            { name: 'config.color', type: 'string', default: 'theme-based', description: 'Text color' },
            { name: 'config.idleTimeout', type: 'number', default: '5000', description: 'Auto-reset timeout in milliseconds' },
        ]
    },
    {
        id: 'step-morph',
        name: 'Step Morph',
        index: 17,
        description: 'Stair-stepped text that expands with smooth weight transitions on hover. Letters are arranged in a diagonal staircase pattern.',
        tags: ['morph', 'text', 'steps', 'animation', 'interactive'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import StepMorph from '@/components/ui/StepMorph';

// Basic usage (displays "MORPHYS" by default)
<StepMorph />

// With custom text and step size
<StepMorph 
    text="HELLO"
    stepSize={20}
    showHint={false}
/>`,
        props: [
            { name: 'text', type: 'string', default: "'MORPHYS'", description: 'Text to display' },
            { name: 'stepSize', type: 'number', default: '28', description: 'Vertical step size between letters in pixels' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes for text' },
            { name: 'showHint', type: 'boolean', default: 'true', description: 'Show "Hover to expand" hint' },
        ]
    },
    {
        id: 'center-menu',
        name: 'Center Menu',
        index: 18,
        description: 'A centered navigation menu that expands smoothly from a compact icon. Features theme toggle, navigation links, and responsive design that adapts between mobile and desktop layouts.',
        tags: ['menu', 'center', 'expand', 'animation', 'navigation', 'responsive'],
        category: 'layout',
        previewConfig: {},
        dependencies: ['framer-motion', 'react', 'lucide-react'],
        usage: `import { CenterMenu } from '@/components/ui/CenterMenu';

// Basic usage
<CenterMenu />

// With custom className
<CenterMenu className="absolute bottom-8" />`,
        props: [
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes for positioning' },
        ]
    },
    {
        id: 'glass-surge',
        name: 'Glass Surge',
        index: 19,
        description: 'An optical distortion effect that applies a smooth, liquid-like surge to text or content on hover. Uses SVG turbulence and displacement maps to create organic bending.',
        tags: ['text', 'glass', 'distortion', 'hover', 'animation', 'svg', 'liquid'],
        category: 'effect',
        previewConfig: { text: 'MORPHYS' },
        dependencies: ['react'],
        usage: `import { GlassSurge } from '@/components/ui';

// Basic Usage
<GlassSurge 
    text="SURGE"
    className="text-6xl font-bold"
/>

// Wrapping Custom Content
<GlassSurge>
    <div className="bg-blue-500 text-white p-4 rounded-lg">
        Hover Me
    </div>
</GlassSurge>`,
        props: [
            { name: 'text', type: 'string', default: "'MORPHYS'", description: 'Text to display (optional if children provided)' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
            { name: 'children', type: 'ReactNode', default: 'undefined', description: 'Content to apply the refraction effect to' },
        ]
    },
    {
        id: 'layered-image-showcase',
        name: 'Layered Image Showcase',
        index: 20,
        description: 'A sophisticated image gallery with staggered letter animations on hover. Features smooth background transitions and customizable accent colors.',
        tags: ['image', 'gallery', 'hover', 'animation', 'reveal', 'text-animation'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { LayeredImageShowcase } from '@/components/ui';

// Basic usage
<LayeredImageShowcase />

// With custom configuration
<LayeredImageShowcase 
    config={{
        title: "MORPHYS",
        accentColor: "#FF3333",
        textColor: "#ffffff"
    }}
/>`,
        props: [
            { name: 'className', type: 'string', default: "'h-screen'", description: 'Additional CSS classes for height/styling' },
            { name: 'config', type: 'object', default: '{}', description: 'Configuration object with title, accentColor, and textColor' },
        ]
    },
];


// Fast lookup by ID
const dataMap = new Map(componentsDataLite.map(c => [c.id, c]));

export function getComponentByIdLite(id: string): ComponentDataLite | undefined {
    return dataMap.get(id);
}

// Re-export type for compatibility
export type { ComponentDataLite as ComponentData };
