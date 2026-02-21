const fs = require('fs');
const path = require('path');

// Get all JPG files from ids folder
const idsFolder = path.join(__dirname, '..', 'ids');
const files = fs.readdirSync(idsFolder).filter(f => f.endsWith('.jpg'));

// Generate the imageMap object
let imageMapContent = '// Auto-generated image mapping\nconst imageMap: { [key: string]: any } = {\n';

files.forEach(file => {
  imageMapContent += `  '${file}': require('../ids/${file}'),\n`;
});

imageMapContent += '};\n\n';

// Add the getImage function
imageMapContent += `export const getImage = (photoPath: string) => {
  if (!photoPath) return require('../assets/logo.png');
  const filename = photoPath.split('/').pop() || '';
  return imageMap[filename] || require('../assets/logo.png');
};\n`;

// Write to the imageHelper.ts file
const outputPath = path.join(__dirname, '..', 'utils', 'imageHelper.ts');
fs.writeFileSync(outputPath, imageMapContent);

console.log(`Generated imageHelper.ts with ${files.length} images`);
