// Lightweight component metadata - NO full code included
// This file is fast to load and used for navigation/listings
// Full code is lazy-loaded from componentsData.ts when needed

export interface ComponentMetadata {
    id: string;
    name: string;
    index: number;
    description: string;
    tags: string[];
    category: 'animation' | 'interaction' | 'layout' | 'effect';
    dependencies: string[];
}

export const componentMetadata: ComponentMetadata[] = [
    {
        id: 'flip-grid',
        name: 'Flip Grid',
        index: 1,
        description: 'A grid of flipping cards that create pixel-art style animations.',
        tags: ['animation', 'grid', 'pixel', 'flip', 'retro', '8-bit'],
        category: 'animation',
        dependencies: ['framer-motion', 'react'],
    },
    {
        id: 'ascii-simulation',
        name: 'ASCII Simulation',
        index: 2,
        description: 'A retro-style 3D renderer that projects shapes into ASCII characters.',
        tags: ['ascii', '3d', 'retro', 'terminal', 'simulation', 'code-art'],
        category: 'animation',
        dependencies: ['react'],
    },
    {
        id: 'liquid-morph',
        name: 'Liquid Morph',
        index: 3,
        description: 'A soft, organic blob that subtly morphs and undulates like liquid metal.',
        tags: ['3d', 'interactive', 'fluid', 'webgl', 'organic', 'metal'],
        category: 'animation',
        dependencies: ['@react-three/fiber', '@react-three/drei', 'three'],
    },
    {
        id: 'page-reveal',
        name: 'Page Reveal',
        index: 4,
        description: 'A cinematic page transition with logo blur and split animations.',
        tags: ['animation', 'transition', 'reveal', 'intro', 'page-load'],
        category: 'animation',
        dependencies: ['framer-motion', 'react'],
    },
    {
        id: 'navbar-menu',
        name: 'Navbar Menu',
        index: 5,
        description: 'An animated navigation bar with smooth expand/collapse transitions.',
        tags: ['navigation', 'menu', 'header', 'responsive', 'animation'],
        category: 'layout',
        dependencies: ['framer-motion', 'react'],
    },
    {
        id: 'navbar-menu-2',
        name: 'Navbar Menu 2',
        index: 6,
        description: 'A modern navbar with clean animations and entrance effects.',
        tags: ['navigation', 'menu', 'header', 'minimal', 'animation'],
        category: 'layout',
        dependencies: ['framer-motion', 'react'],
    },
    {
        id: 'spotlight-search',
        name: 'Spotlight Search',
        index: 7,
        description: 'A macOS-inspired spotlight search with smooth morphing animations.',
        tags: ['search', 'spotlight', 'modal', 'input', 'animation'],
        category: 'interaction',
        dependencies: ['framer-motion', 'react'],
    },
    {
        id: 'image-trail-cursor',
        name: 'Image Trail Cursor',
        index: 8,
        description: 'A cursor effect that leaves a trail of fading images.',
        tags: ['cursor', 'trail', 'images', 'effect', 'interactive'],
        category: 'effect',
        dependencies: ['framer-motion', 'react'],
    },
    {
        id: 'reality-lens',
        name: 'Liquid Reveal',
        index: 9,
        description: 'A liquid brush stroke effect that reveals hidden content.',
        tags: ['lens', 'reveal', 'liquid', 'interactive', 'effect'],
        category: 'effect',
        dependencies: ['react'],
    },
    {
        id: 'scroll-to-reveal',
        name: 'Scroll To Reveal',
        index: 10,
        description: 'Text that reveals with opacity based on scroll position.',
        tags: ['scroll', 'reveal', 'text', 'animation', 'opacity'],
        category: 'animation',
        dependencies: ['react'],
    },
    {
        id: 'diffuse-text',
        name: 'Diffuse Text',
        index: 11,
        description: 'Blurred text with a diffuse glow effect.',
        tags: ['text', 'blur', 'diffuse', 'glow', 'effect'],
        category: 'effect',
        dependencies: ['react'],
    },
    {
        id: 'diagonal-focus',
        name: 'Diagonal Carousel',
        index: 12,
        description: 'A diagonal infinite carousel with focus effects.',
        tags: ['carousel', 'diagonal', 'infinite', 'cards', 'animation'],
        category: 'animation',
        dependencies: ['framer-motion', 'react'],
    },
    {
        id: 'notification-stack',
        name: 'Notification Stack',
        index: 13,
        description: 'Stacked notifications with smooth animations.',
        tags: ['notification', 'stack', 'toast', 'alert', 'animation'],
        category: 'interaction',
        dependencies: ['framer-motion', 'react'],
    },
    {
        id: 'text-pressure',
        name: 'Text Pressure',
        index: 14,
        description: 'Variable font weight that responds to cursor pressure.',
        tags: ['text', 'variable-font', 'interactive', 'weight', 'effect'],
        category: 'effect',
        dependencies: ['react'],
    },
    {
        id: 'fluid-height',
        name: 'Fluid Height',
        index: 15,
        description: 'Text with fluid height animation on hover.',
        tags: ['text', 'height', 'animation', 'hover', 'fluid'],
        category: 'animation',
        dependencies: ['react'],
    },
    {
        id: 'text-mirror',
        name: 'Text Mirror',
        index: 16,
        description: 'Text that mirrors and spreads based on cursor position.',
        tags: ['text', 'mirror', 'cursor', 'interactive', 'effect'],
        category: 'effect',
        dependencies: ['react'],
    },
    {
        id: 'step-morph',
        name: 'Step Morph',
        index: 17,
        description: 'Morphing step counter with smooth transitions.',
        tags: ['morph', 'counter', 'steps', 'animation', 'interactive'],
        category: 'interaction',
        dependencies: ['framer-motion', 'react'],
    },
    {
        id: 'center-menu',
        name: 'Center Menu',
        index: 18,
        description: 'A centered menu that expands with smooth animations.',
        tags: ['menu', 'center', 'expand', 'animation', 'navigation'],
        category: 'layout',
        dependencies: ['framer-motion', 'react', 'lucide-react'],
    },
];

// Fast lookup by ID
const metadataMap = new Map(componentMetadata.map(c => [c.id, c]));

export function getComponentMetadata(id: string): ComponentMetadata | undefined {
    return metadataMap.get(id);
}

export function getNextComponent(currentId: string): ComponentMetadata | undefined {
    const current = metadataMap.get(currentId);
    if (!current) return undefined;
    return componentMetadata.find(c => c.index === current.index + 1);
}

export function getPrevComponent(currentId: string): ComponentMetadata | undefined {
    const current = metadataMap.get(currentId);
    if (!current) return undefined;
    return componentMetadata.find(c => c.index === current.index - 1);
}
