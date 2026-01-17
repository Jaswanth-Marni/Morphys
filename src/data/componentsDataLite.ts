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
        description: 'A diagonal infinite carousel with focus effects.',
        tags: ['carousel', 'diagonal', 'infinite', 'cards', 'animation'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { DiagonalFocus } from '@/components/ui';

<DiagonalFocus />`,
        props: [
            { name: 'config', type: 'object', default: '{}', description: 'Configuration for the carousel' },
        ]
    },
    {
        id: 'notification-stack',
        name: 'Notification Stack',
        index: 13,
        description: 'Stacked notifications with smooth animations.',
        tags: ['notification', 'stack', 'toast', 'alert', 'animation'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { NotificationStack } from '@/components/ui';

<NotificationStack />`,
        props: [
            { name: 'config', type: 'object', default: '{}', description: 'Configuration for the notifications' },
        ]
    },
    {
        id: 'text-pressure',
        name: 'Text Pressure',
        index: 14,
        description: 'Variable font weight that responds to cursor pressure.',
        tags: ['text', 'variable-font', 'interactive', 'weight', 'effect'],
        category: 'effect',
        previewConfig: { text: 'Morphys', minWeight: 100, maxWeight: 900 },
        dependencies: ['react'],
        usage: `import { TextPressure } from '@/components/ui';

<TextPressure
    text="Morphys"
    config={{
        minWeight: 100,
        maxWeight: 900,
        textColor: '#000000',
    }}
/>`,
        props: [
            { name: 'text', type: 'string', default: "'Morphys'", description: 'Text to display' },
            { name: 'config', type: 'object', default: '{}', description: 'Configuration for the effect' },
        ]
    },
    {
        id: 'fluid-height',
        name: 'Fluid Height',
        index: 15,
        description: 'Text with fluid height animation on hover.',
        tags: ['text', 'height', 'animation', 'hover', 'fluid'],
        category: 'animation',
        previewConfig: { text: 'MORPHYS' },
        dependencies: ['react'],
        usage: `import FluidHeight from '@/components/ui/FluidHeight';

<FluidHeight text="MORPHYS" />`,
        props: [
            { name: 'text', type: 'string', default: "'MORPHYS'", description: 'Text to display' },
        ]
    },
    {
        id: 'text-mirror',
        name: 'Text Mirror',
        index: 16,
        description: 'Text that mirrors and spreads based on cursor position.',
        tags: ['text', 'mirror', 'cursor', 'interactive', 'effect'],
        category: 'effect',
        previewConfig: { text: 'MORPHYS' },
        dependencies: ['react'],
        usage: `import TextMirror from '@/components/ui/TextMirror';

<TextMirror
    config={{
        text: 'MORPHYS',
        spread: 30,
        fontSize: 120,
    }}
/>`,
        props: [
            { name: 'config', type: 'object', default: '{}', description: 'Configuration for the mirror effect' },
        ]
    },
    {
        id: 'step-morph',
        name: 'Step Morph',
        index: 17,
        description: 'Morphing step counter with smooth transitions.',
        tags: ['morph', 'counter', 'steps', 'animation', 'interactive'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import StepMorph from '@/components/ui/StepMorph';

<StepMorph />`,
        props: [
            { name: 'config', type: 'object', default: '{}', description: 'Configuration for the step morph' },
        ]
    },
    {
        id: 'center-menu',
        name: 'Center Menu',
        index: 18,
        description: 'A centered menu that expands with smooth animations.',
        tags: ['menu', 'center', 'expand', 'animation', 'navigation'],
        category: 'layout',
        previewConfig: {},
        dependencies: ['framer-motion', 'react', 'lucide-react'],
        usage: `import { CenterMenu } from '@/components/ui';

<CenterMenu />`,
        props: [
            { name: 'config', type: 'object', default: '{}', description: 'Configuration for the menu' },
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
