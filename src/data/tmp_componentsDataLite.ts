
{
    id: 'timeline-zoom',
        name: 'Timeline Zoom',
            index: 32,
                description: 'A timeline with zoom capabilities.',
                    tags: ['timeline', 'zoom', 'navigation', 'reveal'],
                        category: 'interaction',
                            previewConfig: { },
    dependencies: ['framer-motion', 'react'],
        usage: `import { TimelineZoom } from '@/components/ui';

// Basic usage
<TimelineZoom />`,
            props: [
                { name: 'items', type: 'TimelineItem[]', default: '[]', description: 'Array of timeline items' },
                { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
            ]
},
