const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components', 'ui');
const COMPONENT_DATA_PATH = path.join(SRC_DIR, 'data', 'componentsDataLite.ts');
const NORMAL_COMPONENTS_PATH = path.join(SRC_DIR, 'components', 'ui', 'NormalComponents.tsx');
const COMPONENT_NAV_PATH = path.join(SRC_DIR, 'components', 'ui', 'ComponentNavigation.tsx');
const PAGE_PATH = path.join(SRC_DIR, 'app', 'components', '[componentId]', 'page.tsx');

// Helpers
function toPascalCase(str) {
    return str
        .toLowerCase()
        .replace(/(?:^|-)(\w)/g, (_, c) => c.toUpperCase());
}

function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
}

// Main logic
function verifyAndFix() {
    console.log('Starting component verification...');

    // 1. Get list of components from componentsDataLite.ts
    // We assume this is the source of truth for what *should* be in the app
    const dataContent = readFile(COMPONENT_DATA_PATH);
    const idRegex = /id:\s*'([^']+)'/g;
    const components = [];
    let match;
    
    while ((match = idRegex.exec(dataContent)) !== null) {
        components.push({
            id: match[1],
            pascalName: toPascalCase(match[1])
        });
    }

    console.log(`Found ${components.length} components in componentsDataLite.ts`);

    // 2. Fix NormalComponents.tsx
    let normalParams = readFile(NORMAL_COMPONENTS_PATH);
    let normalModified = false;

    // Check imports (heuristic: check if PascalName is in the file)
    // Actually, checking proper registration in the map is better
    
    // Find where the map starts
    const mapStartRegex = /const componentPreviews: Record<string, React.ComponentType> = \{/;
    if (!mapStartRegex.test(normalParams)) {
        console.error('Could not find componentPreviews map in NormalComponents.tsx');
    } else {
        components.forEach(comp => {
            const mapEntryRegex = new RegExp(`'${comp.id}':`);
            if (!mapEntryRegex.test(normalParams)) {
                console.log(`[NormalComponents] Missing registration for ${comp.id}`);
                
                // 1. Add Import if missing
                if (!normalParams.includes(`import { ${comp.pascalName} }`)) {
                    // Try to insert after last import
                    const lastImport = normalParams.lastIndexOf('import ');
                    const endOfImportLine = normalParams.indexOf('\n', lastImport) + 1;
                    
                    // Simple injection: import { Name } from "./Name";
                    // Only if file exists
                    if (fs.existsSync(path.join(COMPONENTS_DIR, `${comp.pascalName}.tsx`))) {
                         normalParams = normalParams.slice(0, endOfImportLine) + `import { ${comp.pascalName} } from "./${comp.pascalName}";\n` + normalParams.slice(endOfImportLine);
                    }
                }

                // 2. Add Preview Component Definition
                // We'll add a default scaled preview before the map
                if (!normalParams.includes(`const ${comp.pascalName}Preview =`)) {
                    const previewCode = `
const ${comp.pascalName}Preview = () => (
    <div className="w-full h-full overflow-hidden relative">
        <div className="absolute inset-0 w-[200%] h-[200%] scale-[0.5] origin-top-left">
            <${comp.pascalName} className="h-full" />
        </div>
    </div>
);
`;
                    const insertIdx = normalParams.indexOf('// Component previews mapping');
                    normalParams = normalParams.slice(0, insertIdx) + previewCode + normalParams.slice(insertIdx);
                }

                // 3. Add to map
                // Find end of map
                const mapStart = normalParams.indexOf('const componentPreviews: Record<string, React.ComponentType> = {');
                const mapEnd = normalParams.indexOf('};', mapStart);
                
                if (mapEnd > -1) {
                    const entry = `    '${comp.id}': ${comp.pascalName}Preview,\n`;
                    normalParams = normalParams.slice(0, mapEnd) + entry + normalParams.slice(mapEnd);
                    normalModified = true;
                }
            }
        });
    }

    if (normalModified) {
        writeFile(NORMAL_COMPONENTS_PATH, normalParams);
        console.log('Updated NormalComponents.tsx');
    }

    // 3. Fix ComponentNavigation.tsx
    let navContent = readFile(COMPONENT_NAV_PATH);
    let navModified = false;

    components.forEach(comp => {
        const mapEntryRegex = new RegExp(`'${comp.id}':`);
        if (!mapEntryRegex.test(navContent)) {
             console.log(`[ComponentNavigation] Missing mapping for ${comp.id}`);
             
             // Find end of map
             const mapStart = navContent.indexOf('const componentModuleMap: Record<string, string> = {');
             const mapEnd = navContent.indexOf('};', mapStart);
             
             if (mapEnd > -1) {
                 const entry = `    '${comp.id}': '${comp.pascalName}',\n`;
                 navContent = navContent.slice(0, mapEnd) + entry + navContent.slice(mapEnd);
                 navModified = true;
             }
        }
    });

    if (navModified) {
        writeFile(COMPONENT_NAV_PATH, navContent);
        console.log('Updated ComponentNavigation.tsx');
    }

    // 4. Fix [componentId]/page.tsx
    let pageContent = readFile(PAGE_PATH);
    let pageModified = false;

    components.forEach(comp => {
         // Check if in registry
         const registryRegex = new RegExp(`'${comp.id}':`);
         if (!registryRegex.test(pageContent)) {
             console.log(`[Page.tsx] Missing registry for ${comp.id}`);

             // 1. Add Dynamic Import
             if (!pageContent.includes(`const ${comp.pascalName} = dynamic`)) {
                 const importStr = `
const ${comp.pascalName} = dynamic(() => import("@/components/ui/${comp.pascalName}").then(mod => ({ default: mod.${comp.pascalName} })), {
    loading: ComponentLoader,
    ssr: false
});
`;
                 // Insert before COMPONENT REGISTRY
                 const registryStart = pageContent.indexOf('// COMPONENT REGISTRY');
                 pageContent = pageContent.slice(0, registryStart) + importStr + pageContent.slice(registryStart);
             }

             // 2. Add to Registry
             const regStart = pageContent.indexOf('const componentRegistry: Record<string,');
             const regEnd = pageContent.indexOf('};', regStart);
             
             if (regEnd > -1) {
                 // Check if we need specific config or default
                 // For now, basic default
                 const entry = `    '${comp.id}': ${comp.pascalName} as React.ComponentType<{ config?: any }>,\n`;
                 pageContent = pageContent.slice(0, regEnd) + entry + pageContent.slice(regEnd);
                 pageModified = true;
             }
         }
    });

    if (pageModified) {
        writeFile(PAGE_PATH, pageContent);
        console.log('Updated [componentId]/page.tsx');
    }
    
    console.log('Verification complete.');
}

verifyAndFix();
