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
<DiagonalFocus className="h-full min-h-[500px]" />`,
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
<NotificationStack className="h-full min-h-[500px]" />`,
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
            { name: 'className', type: 'string', default: "'h-full min-h-[500px]'", description: 'Additional CSS classes for height/styling' },
            { name: 'config', type: 'object', default: '{}', description: 'Configuration object with title, accentColor, and textColor' },
        ]
    },
    {
        id: 'impact-text',
        name: 'Loading 1',
        index: 21,
        description: 'A dynamic loading animation with smooth wave-like font weight transitions. Letters morph between thin and bold weights with italic effects in a continuous loop.',
        tags: ['text', 'loading', 'wave', 'animation', 'variable-font', 'weight'],
        category: 'animation',
        previewConfig: {
            text: 'LOADING',
            fontSize: 80
        },
        dependencies: ['framer-motion', 'react'],
        usage: `import { ImpactText } from '@/components/ui';

// Basic usage
<ImpactText />

// Custom configuration
<ImpactText
    text="STARTING"
    config={{
        fontSize: 120,
        color: '#ff0000',
        kerning: 2
    }}
/>`,
        props: [
            { name: 'text', type: 'string', default: "'MORPHYS'", description: 'Text to animate' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
            { name: 'config', type: 'object', default: '{}', description: 'Configuration object' },
        ]
    },
    {
        id: 'reveal-marquee',
        name: 'Reveal Marquee',
        index: 22,
        description: 'An infinite scrolling marquee where words reveal images on hover with smooth parallax effects and weight animations.',
        tags: ['ticker', 'marquee', 'scroll', 'parallax', 'hover', 'reveal', '3d'],
        category: 'animation',
        previewConfig: { speed: 1, parallaxStrength: 30 },
        dependencies: ['framer-motion', 'react'],
        usage: `import { ClothTicker } from '@/components/ui';

// Basic usage
<ClothTicker />

// With custom configuration
<ClothTicker
    config={{
        speed: 2,
        fontSize: '4rem',
        parallaxStrength: 50
    }}
/>`,
        props: [
            { name: 'words', type: 'string[]', default: 'defaultWords', description: 'Array of words to display' },
            { name: 'images', type: 'string[]', default: 'defaultImages', description: 'Array of images to reveal' },
            { name: 'config', type: 'Partial<ClothTickerConfig>', default: '{}', description: 'Configuration object' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ]
    },
    {
        id: 'wave-marquee',
        name: 'Wave Marquee',
        index: 23,
        description: 'A smooth sine-wave marquee of company logos that swing up and down. Features magnetic hover effects, pause-on-hover, and grayscale-to-color transitions.',
        tags: ['marquee', 'wave', 'logos', 'partners', 'animation', 'scroll'],
        category: 'animation',
        previewConfig: { speed: 2, amplitude: 60 },
        dependencies: ['framer-motion', 'react'],
        usage: `import { WaveMarquee } from '@/components/ui';

// Basic usage
<WaveMarquee />

// Custom configuration
<WaveMarquee
    config={{
        speed: 2,
        amplitude: 80,
        wavelength: 200,
        grayscale: true
    }}
/>`,
        props: [
            { name: 'config', type: 'Partial<WaveMarqueeConfig>', default: '{}', description: 'Configuration object' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ]
    },
    {
        id: 'expandable-strips',
        name: 'Expandable Strips',
        index: 24,
        description: 'An interactive image gallery where strips expand on hover. Features smooth layout transitions and dynamic color reveals.',
        tags: ['gallery', 'accordion', 'expand', 'image', 'interaction'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { ExpandableStrips } from '@/components/ui';

// Basic usage
<ExpandableStrips />`,
        props: [
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ]
    },
    {
        id: 'frosted-glass',
        name: 'Frosted Glass Text',
        index: 25,
        description: 'Knockout text that reveals a blurred background image using SVG masking. Ideal for headers and impact text over complex images.',
        tags: ['text', 'glass', 'blur', 'mask', 'svg'],
        category: 'effect',
        previewConfig: { text: 'CURATED CHAOS', blurAmount: 30 },
        dependencies: ['react'],
        usage: `import { FrostedGlass } from '@/components/ui';

// Basic usage
<FrostedGlass />

// Custom configuration
<FrostedGlass
    config={{
        text: "CURATED CHAOS",
        blurAmount: 30,
        fontSize: 300
    }}
/>`,
        props: [
            { name: 'config', type: 'object', default: '{}', description: 'Configuration object' },
            { name: 'containerClassName', type: 'string', default: "''", description: 'Class for the container' },
        ]
    },
    {
        id: 'text-reveal',
        name: 'Text Reveal',
        index: 26,
        description: 'A text animation where letters reveal by rotating from 90 degrees on the Y-axis.',
        tags: ['text', 'reveal', 'rotation', '3d', 'animation'],
        category: 'animation',
        previewConfig: { text: 'MORPHYS', delay: 0.5 },
        dependencies: ['framer-motion', 'react'],
        usage: `import TextReveal from '@/components/ui/TextReveal';

// Basic usage
<TextReveal text="MORPHYS" />

// Custom configuration
<TextReveal
    text="MORPHYS"
    delay={0.5}
    className="text-6xl"
/>`,
        props: [
            { name: 'text', type: 'string', default: "'Text Reveal Animation'", description: 'Text to display' },
            { name: 'delay', type: 'number', default: '0', description: 'Delay before animation starts' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ]
    },
    {
        id: 'text-reveal-2',
        name: 'Text Reveal 2',
        index: 27,
        description: 'A step-wise telescoping text reveal where letters slide out from behind each other.',
        tags: ['text', 'reveal', 'telescope', 'slide', 'animation'],
        category: 'animation',
        previewConfig: { text: 'MORPHYS', delay: 0 },
        dependencies: ['framer-motion', 'react'],
        usage: `import TextReveal2 from '@/components/ui/TextReveal2';

// Basic usage
<TextReveal2 text="MORPHYS" />

// Custom configuration
<TextReveal2
    text="MORPHYS"
    delay={0}
    className="text-6xl"
/>`,
        props: [
            { name: 'text', type: 'string', default: "'MORPHYS'", description: 'Text to display' },
            { name: 'delay', type: 'number', default: '0', description: 'Delay before animation starts' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ]
    },
    {
        id: 'crt-glitch',
        name: 'CRT Glitch',
        index: 28,
        description: 'A realistic CRT TV and VHS glitch effect with static noise, scan lines, RGB chromatic aberration, and random glitch distortions.',
        tags: ['glitch', 'crt', 'vhs', 'retro', 'noise', 'distortion', 'effect'],
        category: 'effect',
        previewConfig: { text: 'GLITCH', noiseIntensity: 0.15, glitchFrequency: 0.3 },
        dependencies: ['framer-motion', 'react'],
        usage: `import { CRTGlitch } from '@/components/ui';

// Basic usage
<CRTGlitch />

// With custom configuration
<CRTGlitch
    config={{
        text: "ERROR 404",
        noiseIntensity: 0.2,
        scanlineIntensity: 0.5,
        rgbShiftIntensity: 0.8,
        glitchFrequency: 0.5,
        colorTint: 'green',
        curvedScreen: true
    }}
/>`,
        props: [
            { name: 'config.text', type: 'string', default: "'MORPHYS'", description: 'Text to display' },
            { name: 'config.noiseIntensity', type: 'number', default: '0.15', description: 'Static noise amount (0-1)' },
            { name: 'config.scanlineIntensity', type: 'number', default: '0.4', description: 'Scan line visibility (0-1)' },
            { name: 'config.rgbShiftIntensity', type: 'number', default: '0.6', description: 'RGB chromatic aberration (0-1)' },
            { name: 'config.glitchFrequency', type: 'number', default: '0.3', description: 'How often glitches occur (0-1)' },
            { name: 'config.flickerIntensity', type: 'number', default: '0.1', description: 'Screen flicker amount (0-1)' },
            { name: 'config.vhsTracking', type: 'boolean', default: 'true', description: 'Enable VHS tracking distortion' },
            { name: 'config.phosphorGlow', type: 'boolean', default: 'true', description: 'Enable CRT phosphor bloom' },
            { name: 'config.curvedScreen', type: 'boolean', default: 'true', description: 'Enable barrel distortion effect' },
            { name: 'config.colorTint', type: "'green' | 'amber' | 'blue' | 'none'", default: "'none'", description: 'Retro monitor color tint' },
            { name: 'config.autoGlitch', type: 'boolean', default: 'true', description: 'Enable automatic random glitches' },
            { name: 'config.hoverTrigger', type: 'boolean', default: 'true', description: 'Trigger glitches on hover' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ]
    },
    {
        id: 'flip-clock',
        name: 'Flip Clock',
        index: 29,
        description: 'A kinetic flip-dot style clock where numbers are formed by a grid of individually flipping pixels, creating a mechanical retro aesthetic. Features rounded matrix numbers and wave-based flip animations.',
        tags: ['clock', 'time', 'flip', 'kinetic', 'retro', 'matrix'],
        category: 'animation',
        previewConfig: { theme: 'dark' },
        dependencies: ['framer-motion', 'react'],
        usage: `import { FlipClock } from '@/components/ui';

// Basic usage
<FlipClock />`,
        props: []
    },
    {
        id: 'gravity',
        name: 'Gravity',
        index: 30,
        description: 'A physics-based layout where UI elements fall, stack, and collide using real-time rigid body physics. Fully interactive: grab, throw, and watch them settle.',
        tags: ['physics', 'matter-js', 'gravity', 'interactive', 'playground', 'collision'],
        category: 'interaction',
        previewConfig: { gravityStrength: 1, wallBounciness: 0.8 },
        dependencies: ['matter-js', 'react', 'framer-motion'],
        usage: `import { Gravity } from '@/components/ui';

// Basic usage
<Gravity />

// Custom configuration
<Gravity
    config={{
        gravityStrength: 2,
        interactive: true,
        debug: false
    }}
/>`,
        props: [
            { name: 'items', type: 'GravityItem[]', default: 'defaultItems', description: 'Array of items to render as physics bodies' },
            { name: 'config', type: 'GravityConfig', default: '{}', description: 'Physics configuration' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ]
    },
    {
        id: 'pixel-simulation',
        name: 'Pixel Simulation',
        index: 31,
        description: 'A voxel-based 3D renderer that visualizes shapes using a grid of dynamic pixels. Features canvas-based rendering with customizable resolution, gap, and color modes.',
        tags: ['pixel', '3d', 'voxel', 'canvas', 'simulation', 'retro'],
        category: 'animation',
        previewConfig: {
            shape: 'car',
            pixelSize: 8,
            gap: 2,
        },
        dependencies: ['react'],
        usage: `import { PixelSimulation } from '@/components/ui';

// Basic usage
<PixelSimulation />

// With custom configuration
<PixelSimulation
    config={{
        shape: 'car',
        pixelSize: 8,
        gap: 2,
        rotationX: 0,
        rotationY: 0,
        colorMode: 'depth',
        color1: '#4F46E5', // Indigo
        color2: '#EC4899', // Pink
        speed: 2,
    }}
    autoPlay={true}
/>`,
        props: [
            { name: 'config', type: 'Partial<PixelSimulationConfig>', default: '{}', description: 'Appearance and behavior configuration' },
            { name: 'autoPlay', type: 'boolean', default: 'true', description: 'Enable automatic rotation' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ]
    },
    {
        id: 'running-outline',
        name: 'Running Outline',
        index: 32,
        description: 'Vertical stack of text that transforms into a running dotted outline loop with an italic style shift on hover.',
        tags: ['text', 'outline', 'animation', 'hover', 'typography', 'svg'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { RunningOutline } from '@/components/ui';

// Basic usage
<RunningOutline />

// With custom word
<RunningOutline
    config={{
        words: [
            { text: "HELLO", font: "font-sans" }
        ],
        color: "#ff0000"
    }}
/>`,
        props: [
            { name: 'config', type: 'RunningOutlineConfig', default: '{}', description: 'Configuration object' },
            { name: 'containerClassName', type: 'string', default: "''", description: 'Class for the container' },
        ]
    },
    {
        id: 'synthwave-lines',
        name: 'Synthwave Lines',
        index: 33,
        description: 'Interactive background lines with arrival impact, wave morphing, and elastic cursor physics. Features a dramatic arrival sequence and smooth elastic interaction.',
        tags: ['background', 'lines', 'physics', 'interactive', 'canvas', 'synthwave'],
        category: 'animation',
        previewConfig: {
            lineCount: 10
        },
        dependencies: ['react'],
        usage: `import { SynthwaveLines } from '@/components/ui';

// Basic usage
<SynthwaveLines />

// Custom configuration
<SynthwaveLines
    config={{
        lineCount: 15,
        color: 'var(--foreground)'
    }}
/>`,
        props: [
            { name: 'config', type: 'Partial<SynthwaveLinesConfig>', default: '{}', description: 'Configuration object' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
    },
    {
        id: 'hover-image-list',
        name: 'Hover Image List',
        index: 34,
        description: 'A minimal list component where hovering over items reveals a following image. Features smooth spring-based cursor tracking and layout based on the user\'s provided screenshot.',
        tags: ['list', 'hover', 'image', 'reveal', 'cursor', 'follow', 'spring', 'framer-motion'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { HoverImageList } from '@/components/ui';

// Basic usage
<HoverImageList />

// With custom items
<HoverImageList
    items={[
        {
            id: 1,
            text: "ITEM 1",
            subtext: "01",
            image: "https://example.com/image.jpg"
        }
    ]}
/>`,
        props: [
            { name: 'items', type: 'HoverImageListItem[]', default: 'defaultItems', description: 'Array of items with text and images' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
    },
    {
        id: 'scroll-skew',
        name: 'Scroll Skew',
        index: 35,
        description: 'A velocity-based scrolling marquee where text direction and slant react to scroll speed. Features smooth physics-based skew deformation using Framer Motion.',
        tags: ['scroll', 'skew', 'text', 'velocity', 'marquee', 'animation', 'typography', 'skew-scroll', 'parallax'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { ScrollSkew } from '@/components/ui';

<ScrollSkew />`,
        props: [
            { name: 'baseVelocity', type: 'number', default: '5', description: 'Base scrolling speed' },
            { name: 'children', type: 'string', default: 'Text', description: 'Text to display' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
    },
    {
        id: 'liquid-reveal',
        name: 'Liquid Reveal',
        index: 36,
        description: 'A WebGL shader component that uses high-frequency sine waves to create a liquid distortion effect, revealing an image on hover or scroll. Features chromatic aberration and smooth physics.',
        tags: ['webgl', 'shader', 'liquid', 'distortion', 'reveal', 'react-three-fiber', '3d'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['@react-three/fiber', '@react-three/drei', 'three', 'react'],
        usage: `import { LiquidReveal } from '@/components/ui';

<LiquidReveal />`,
        props: [
            { name: 'imageUrl', type: 'string', default: 'undefined', description: 'URL of the image to reveal' },
            { name: 'isHovered', type: 'boolean', default: 'false', description: 'Control hover state externally' }
        ]
    },
    {
        id: 'pinned-carousel',
        name: 'Pinned Carousel',
        index: 37,
        description: 'A cinematic horizontal scroll component where large serial numbers and names pin to the left edge while images scroll across. Features multi-layered parallax and smooth chained transitions.',
        tags: ['scroll', 'horizontal', 'pinning', 'parallax', 'animation', 'framer-motion', 'cinematic'],
        category: 'layout',
        previewConfig: {},
        dependencies: ['framer-motion', 'react', 'lucide-react'],
        usage: `import { PinnedCarousel } from '@/components/ui';

<PinnedCarousel />`,
        props: [
            { name: 'config', type: 'object', default: '{}', description: 'Configuration for items and behavior' }
        ]
    },

    {
        id: 'timeline-zoom',
        name: 'Timeline Zoom',
        index: 39,
        description: 'A horizontal timeline that reveals content based on cursor proximity and wave-like pressure interactions.',
        tags: ['timeline', 'zoom', 'navigation', 'reveal', 'wave', 'interaction'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { TimelineZoom } from '@/components/ui';

// Basic usage
<TimelineZoom />`,
        props: [
            { name: 'items', type: 'TimelineItem[]', default: '[]', description: 'Array of timeline items' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ]
    },
    {
        id: 'elastic-scroll',
        name: 'Elastic Scroll',
        index: 39,
        description: 'A velocity-based scroll component where text weight and stretch react to scroll speed, creating elastic typography effects.',
        tags: ['scroll', 'velocity', 'elastic', 'typography', 'variable-font'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { ElasticScroll } from '@/components/ui';

// Basic usage
<ElasticScroll />`,
        props: [
            { name: 'config', type: 'ElasticScrollConfig', default: '{}', description: 'Configuration object' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
        ]
    },
    {
        id: 'diagonal-arrival',
        name: 'Diagonal Arrival',
        index: 40,
        description: 'A draggable, multi-column diagonal carousel with infinite scrolling and smooth entrance animations. Features randomized scroll directions and staggered layouts for a dynamic visual effect.',
        tags: ['carousel', 'infinite', 'scroll', 'random', 'staggered', 'diagonal', 'framer-motion'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import DiagonalArrival from '@/components/ui/DiagonalArrival';

// Basic usage
<DiagonalArrival />`,
        props: []
    },
    {
        id: 'carousel',
        name: 'Carousel',
        index: 41,
        description: 'A full-screen image carousel with smooth transitions, centered controls, and glassmorphism UI elements.',
        tags: ['carousel', 'full-screen', 'gallery', 'slider', 'interaction', 'framer-motion'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react', 'lucide-react'],
        usage: `import Carousel from '@/components/ui/Carousel';

// Basic usage
<Carousel />`,
        props: []
    },
    {
        id: 'carousel-2',
        name: 'Carousel 2',
        index: 42,
        description: 'A neon cyberpunk-style carousel with massive typography and distributed UI layout.',
        tags: ['carousel', 'cyberpunk', 'neon', 'animation', 'typography'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react', 'lucide-react'],
        usage: `import Carousel2 from '@/components/ui/Carousel2';

// Basic usage
<Carousel2 />`,
        props: []
    },
    {
        id: 'carousel-3',
        name: 'Carousel 3',
        index: 43,
        description: 'A curved carousel where the center item is larger, featuring smooth scrolling and looping.',
        tags: ['carousel', 'curved', 'infinite', 'animation', 'framer-motion'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import Carousel3 from '@/components/ui/Carousel3';

// Basic usage
<Carousel3 />`,
        props: []
    },
    {
        id: 'carousel-4',
        name: 'Carousel 4',
        index: 44,
        description: 'A waterfall carousel where items flow from the right edge and drop down into depth.',
        tags: ['carousel', 'waterfall', 'animation', 'framer-motion'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import Carousel4 from '@/components/ui/Carousel4';

// Basic usage
<Carousel4 />`,
        props: []
    },
    {
        id: 'retro-404',
        name: 'Retro 404',
        index: 45,
        description: 'A retro-style 404 error component with glitching neon colors and scanline effects.',
        tags: ['404', 'retro', 'glitch', 'neon', 'error', 'page'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import Retro404 from '@/components/ui/Retro404';

// Basic usage
<Retro404 />`,
        props: []
    },
    {
        id: 'mouse-interaction-1',
        name: 'Mouse Interaction 1',
        index: 46,
        description: 'A highly optimized grid interaction where a trail of boxes follows the cursor with smooth corner smoothing.',
        tags: ['interaction', 'grid', 'trail', 'box', 'canvas', 'performance'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['react'],
        usage: `import MouseInteraction1 from '@/components/ui/MouseInteraction1';\n\n<MouseInteraction1 />`,
        props: []
    },
    {
        id: 'perspective-carousel',
        name: 'Perspective Carousel',
        index: 47,
        description: 'A horizontally scrolling 3D perspective carousel with parallax depth, blur, and smooth inertia.',
        tags: ['carousel', '3d', 'perspective', 'animation', 'gallery', 'framer-motion'],
        category: 'animation',
        previewConfig: {},
        dependencies: ['framer-motion', 'react', 'lucide-react'],
        usage: `import PerspectiveCarousel from '@/components/ui/PerspectiveCarousel';\n\n<PerspectiveCarousel />`,
        props: []
    },
    {
        id: 'full-screen-menu',
        name: 'Full Screen Menu',
        index: 48,
        description: 'A full screen menu matching the reference image.',
        tags: ['menu', 'full-screen', 'layout', 'navigation'],
        category: 'layout',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import FullScreenMenu from '@/components/ui/FullScreenMenu';\n\n<FullScreenMenu />`,
        props: []
    },
    {
        id: 'kinetic-grid',
        name: 'Kinetic Grid',
        index: 49,
        description: 'A grid of plus symbols that react directly to mouse movement, rotating smoothly based on cursor direction.',
        tags: ['background', 'grid', 'physics', 'interactive', 'canvas', 'performance'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['react'],
        usage: `import { KineticGrid } from '@/components/ui';\n\n<KineticGrid />`,
        props: [
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
            { name: 'gridSize', type: 'number', default: '40', description: 'Spacing between plus symbols' },
            { name: 'influenceRadius', type: 'number', default: '400', description: 'Radius of cursor effect' },
        ]
    },
    {
        id: 'chromatic-text',
        name: 'Chromatic Text',
        index: 50,
        description: 'A vibrant, glowing text effect with chromatic aberration and neon blur offsets.',
        tags: ['text', 'chromatic', 'aberration', 'neon', 'glow', 'effect'],
        category: 'effect',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { ChromaticText } from '@/components/ui';\n\n<ChromaticText />`,
        props: [
            { name: 'config', type: 'Partial<ChromaticTextConfig>', default: '{}', description: 'Configuration for colors, blurs and intensity' },
            { name: 'text', type: 'string', default: 'undefined', description: 'The text to display (overrides config.text)' },
            { name: 'className', type: 'string', default: 'undefined', description: 'Additional CSS classes' }
        ]
    },
    {
        id: 'index-scroll-reveal',
        name: 'Index Scroll Reveal',
        index: 51,
        description: 'A layout where index boxes expand according to scroll position on the right, displaying blurred images and numbers smoothly.',
        tags: ['layout', 'scroll', 'reveal', 'index', 'interactive', 'framer-motion'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { IndexScrollReveal } from '@/components/ui';\n\n<IndexScrollReveal />`,
        props: [
            { name: 'items', type: 'ScrollItem[]', default: 'defaultItems', description: 'Array of items to display' },
            { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
    },
    {
        id: 'infinity-brand-scroll',
        name: 'Infinity Brand Scroll',
        index: 52,
        description: 'A 3D infinite looping strip of pictures in a twisted lemniscate shape with smooth scrolling physics.',
        tags: ['3d', 'scroll', 'infinite', 'brand', 'showcase', 'three-js'],
        category: 'interaction',
        previewConfig: { speed: 0.5, radius: 8, weight: 5, impact: 1 },
        dependencies: ['@react-three/fiber', '@react-three/drei', 'three', 'react'],
        usage: `import { InfinityBrandScroll } from '@/components/ui';\n\n<InfinityBrandScroll />`,
        props: [
            { name: 'items', type: 'Array<{image: string}>', default: 'defaultImages', description: 'Array of images to loop' },
            { name: 'speed', type: 'number', default: '0.5', description: 'Base auto-scroll speed' },
            { name: 'radius', type: 'number', default: '8', description: 'Radius of the loop' },
            { name: 'weight', type: 'number', default: '5', description: 'Weight of the scroll physics' },
            { name: 'impact', type: 'number', default: '1', description: 'Strength of the impact/jiggle effect' }
        ]
    },
    {
        id: 'retro-3d-text',
        name: 'Retro 3D Text',
        index: 53,
        description: 'A bold, retro-style 3D block text effect with customizable colors and depth, featuring hover interactions.',
        tags: ['text', '3d', 'retro', 'block', 'shadow', 'effect'],
        category: 'effect',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { Retro3DText } from '@/components/ui';

// Basic usage
<Retro3DText text="RETRO" />

// Custom usage
<Retro3DText 
  text="MORPHYS" 
  frontColor="#FDF9ED" 
  sideColor="#3B70A2" 
  backgroundColor="#FAD3E7" 
  fontSize="8rem" 
/>`,
        props: [
            { name: 'text', type: 'string', default: '"MORPHYS"', description: 'The text content to display' },
            { name: 'frontColor', type: 'string', default: '"#FDF9ED"', description: 'Color of the text face' },
            { name: 'sideColor', type: 'string', default: '"#3B70A2"', description: 'Color of the 3D extrusion' },
            { name: 'backgroundColor', type: 'string', default: '"#FAD3E7"', description: 'Background of the container' },
            { name: 'depth', type: 'number', default: '15', description: 'Depth of the shadow extrusion' },
            { name: 'fontSize', type: 'string', default: '"8rem"', description: 'CSS font size' },
            { name: 'letterSpacing', type: 'string', default: '"0px"', description: 'Letter spacing (CSS value)' },
        ]
    },
    {
        id: 'showcase',
        name: 'Showcase',
        index: 54,
        description: 'A two-line layered showcase component where an image flows between text lines with smooth scroll transitions.',
        tags: ['showcase', 'layered', 'scroll', 'animation', 'gallery', 'framer-motion'],
        category: 'layout',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import Showcase from '@/components/ui/Showcase';

// Basic usage
<Showcase />`,
        props: []
    },
    {
        id: 'slab-carousel',
        name: 'Slab Carousel',
        index: 55,
        description: 'A responsive fisheye carousel where the active item expands significantly, with a smooth neighborhood expansion effect on adjacent items.',
        tags: ['carousel', 'fisheye', 'magnification', 'scroll', 'gallery', 'framer-motion'],
        category: 'interaction',
        previewConfig: {},
        dependencies: ['framer-motion', 'react'],
        usage: `import { SlabCarousel } from '@/components/ui';

// Basic usage
<SlabCarousel />`,
        props: []
    },
];



// Fast lookup by ID
const dataMap = new Map(componentsDataLite.map(c => [c.id, c]));

export function getComponentByIdLite(id: string): ComponentDataLite | undefined {
    return dataMap.get(id);
}

// Re-export type for compatibility
export type { ComponentDataLite as ComponentData };
