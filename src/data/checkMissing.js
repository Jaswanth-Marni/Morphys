const fs = require('fs');
const content = fs.readFileSync('src/data/componentsData.ts', 'utf8');

// Find all objects in the array
const ids = [];
let currentIndex = content.indexOf('{');
while (currentIndex !== -1) {
    const nextBracket = content.indexOf('{', currentIndex + 1);
    if (nextBracket === -1) break;
    currentIndex = nextBracket;
}

// We can just parse using a simple method: match all ids
const idRegex = /[\t\s\n]*id:\s*['"]([^'"]+)['"]/g;
let match;
const allIds = [];
while ((match = idRegex.exec(content)) !== null) {
    allIds.push(match[1]);
}

const fullCodeRegex = /fullCode:\s*`/g;
const fullCodes = [...content.matchAll(fullCodeRegex)];

console.log('Total IDs found:', allIds.length);
console.log('Total fullCode fields:', fullCodes.length);
console.log('IDs:');
console.log(allIds.slice(0, 10).join(', ') + '...');
