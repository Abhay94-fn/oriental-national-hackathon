const fs = require('fs');
const path = require('path');

const directoriesToScan = [
  path.join(__dirname, '..', 'app', '(dashboard)'),
  path.join(__dirname, '..', 'app', '(auth)')
];

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      fixImports(fullPath);
    }
  }
}

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace ../../components with ../../../components
  content = content.replace(/['"]\.\.\/\.\.\/components/g, "'../../../components");
  content = content.replace(/['"]\.\.\/\.\.\/store/g, "'../../../store");
  content = content.replace(/['"]\.\.\/\.\.\/lib/g, "'../../../lib");
  content = content.replace(/['"]\.\.\/\.\.\/types/g, "'../../../types");
  
  // Replace ../components with ../../components
  content = content.replace(/['"]\.\.\/components/g, "'../../components");
  content = content.replace(/['"]\.\.\/store/g, "'../../store");
  content = content.replace(/['"]\.\.\/lib/g, "'../../lib");
  content = content.replace(/['"]\.\.\/types/g, "'../../types");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports in: ${filePath}`);
  }
}

for (const dir of directoriesToScan) {
  if (fs.existsSync(dir)) {
    scanDirectory(dir);
  } else {
    console.log(`Directory not found: ${dir}`);
  }
}
