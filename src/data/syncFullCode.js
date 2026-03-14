const fs = require('fs');
const path = require('path');

const litePath = path.join(__dirname, 'componentsDataLite.ts');
const targetPath = path.join(__dirname, 'componentsData.ts');
const pagePath = path.join(__dirname, '..', 'app', 'components', '[componentId]', 'page.tsx');
const uiPath = path.join(__dirname, '..', 'components', 'ui');

const pageContent = fs.readFileSync(pagePath, 'utf8');

// Parse dynamic imports from page.tsx to find corresponding file names
const mapping = {};
const dynamicRegex = /const\s+([A-Za-z0-9_]+)\s*=\s*dynamic\(\(\)\s*=>\s*import\(['"]@\/components\/ui\/([^'"]+)['"]\)/g;
let match;
while ((match = dynamicRegex.exec(pageContent)) !== null) {
    const compName = match[1];
    const fileName = match[2];
    mapping[compName] = fileName;
}
// Also parse componentRegistry to map 'id' to compName
const registryMatch = /const\s+componentRegistry[\s\S]*?=\{([\s\S]*?)\};/m.exec(pageContent);
if (registryMatch) {
    const registryBlock = registryMatch[1];
    const regRegex = /['"]?([a-z0-9\-]+)['"]?:\s*([A-Za-z0-9_]+)/g;
    let rm;
    while ((rm = regRegex.exec(registryBlock)) !== null) {
        const id = rm[1];
        const compName = rm[2];
        if (mapping[compName]) {
            mapping[id] = mapping[compName];
        } else {
            mapping[id] = compName; // Fallback
        }
    }
}

// Ensure overrides for any weirdly wrapped ones
mapping['impact-text'] = 'ImpactText';
mapping['text-reveal'] = 'TextReveal';
mapping['text-reveal-2'] = 'TextReveal2';
mapping['crt-glitch'] = 'CRTGlitch';
mapping['scroll-to-reveal'] = 'ScrollToReveal';
mapping['glass-surge'] = 'GlassSurge';
mapping['mouse-interaction-1'] = 'MouseInteraction1';
mapping['perspective-carousel'] = 'PerspectiveCarousel';
mapping['timeline-zoom'] = 'TimelineZoom';
mapping['carousel'] = 'Carousel';
mapping['diagonal-arrival'] = 'DiagonalArrival';

const liteContent = fs.readFileSync(litePath, 'utf8');
const arrayMatch = /export\s+const\s+componentsDataLite[\s\S]*?=\s*(\[[\s\S]*\]);?/m;
const m = arrayMatch.exec(liteContent);
if (!m) {
    console.error('Could not find componentsDataLite array');
    process.exit(1);
}

// Instead of eval, we can just find 'id: "something"' and append fullCode before the closing brace of each object
// Wait, evaluating liteContent is safe since we control it.
// To handle ts extensions, we can use ts-node or just extract it string-based.
// Actually, string-based is safer.

let newComponentsData = `export const componentsData = [\n`;

const idRegex = /{\s*id:\s*['"]([a-z0-9\-]+)['"]([^}]+)}\s*(,?)/g;
// Wait, idRegex with /{[^}]*}/ will fail because `componentsDataLite` objects contain nested objects (like props array).
// Better way: use ts compiler or just run this via tsc.

