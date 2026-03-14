const fs = require('fs');
const path = require('path');

function toPascalCase(str) {
    return str.replace(/(^\w|-\w)/g, clearAndUpper);
}

function clearAndUpper(text) {
    return text.replace(/-/, "").toUpperCase();
}

// Map any anomalous component IDs directly to their exact filenames
const anomalies = {
    'reveal-marquee': 'ClothTicker',
    'image-trail-cursor': 'ImageTrailCursor', // Ensure exact case matches if needed
    'crt-glitch': 'CRTGlitch',
};

const litePath = path.join(__dirname, '..', 'src', 'data', 'componentsDataLite.ts');
const targetPath = path.join(__dirname, '..', 'src', 'data', 'componentsData.ts');
const uiPath = path.join(__dirname, '..', 'src', 'components', 'ui');

if (!fs.existsSync(litePath)) {
    console.error(`Error: Could not find ${litePath}`);
    process.exit(1);
}

let content = fs.readFileSync(litePath, 'utf8');

const lines = content.split('\n');
let outLines = [];
let currentId = null;

let numInjected = 0;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Change export name and interface typing to loose 'any' for fullCode inclusion without strict compilation errors
    if (line.includes('export const componentsDataLite')) {
        line = line.replace('componentsDataLite: ComponentDataLite[]', 'componentsData: any[]');
    }

    // Add fullCode?: string type to the ComponentDataLite props array if it matches
    if (line.trim() === '}[];' && outLines[outLines.length - 1] && outLines[outLines.length - 1].includes('description: string;')) {
        outLines.push(line);
        outLines.push('    fullCode?: string;');
        continue;
    }

    const idMatch = line.match(/\s+id:\s*['"]([a-zA-Z0-9\-]+)['"]/);
    if (idMatch) {
        currentId = idMatch[1];
    }

    // Look for the end of a component block
    if ((line === '    },' || line === '    }\r' || line === '    }, ' || (line.trim() === '},' && line.startsWith('    }'))) && currentId) {
        let lastLine = outLines[outLines.length - 1];
        if (lastLine && !lastLine.trim().endsWith(',')) {
            lastLine = lastLine.replace(/\r$/, '') + ',\r';
            outLines[outLines.length - 1] = lastLine;
        }

        const compClass = anomalies[currentId] || toPascalCase(currentId);
        let fileContent = '// Component code not found';

        const fPath = path.join(uiPath, `${compClass}.tsx`);
        if (fs.existsSync(fPath)) {
            fileContent = fs.readFileSync(fPath, 'utf8');
            fileContent = fileContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
        } else {
            console.warn(`Warning: Could not find source file for component '${currentId}' at ${fPath}`);
        }

        outLines.push(`        fullCode: \`\n${fileContent}\``);
        outLines.push(line);
        numInjected++;
        currentId = null;
    } else {
        outLines.push(line);
    }
}

// Modify footer exports for the componentsData array logic
let finalCode = outLines.join('\n')
    .replace('new Map(componentsDataLite.map(c => [c.id, c]))', 'new Map<string, any>(componentsData.map(c => [c.id, c]))')
    .replace('export function getComponentByIdLite(id: string): ComponentDataLite | undefined', 'export function getComponentById(id: string): any');

fs.writeFileSync(targetPath, finalCode, 'utf8');
console.log('Successfully synced and injected fullCode into', numInjected, 'components.');
