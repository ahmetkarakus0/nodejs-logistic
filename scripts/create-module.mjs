#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const moduleName = process.argv[2];

if (!moduleName) {
  console.error(
    '❌ Please provide a module name. Example: node create-module.js customers',
  );
  process.exit(1);
}

const baseDir = path.join(process.cwd(), 'src', 'modules', moduleName);
const files = [
  'controller.ts',
  'service.ts',
  'routes.ts',
  'types.ts',
  'validators.ts',
  'repository.ts',
  'helpers.ts',
];

// Create folder
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// Create files
files.forEach((file) => {
  const fileName = `${moduleName}.${file}`;
  const filePath = path.join(baseDir, fileName);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `// ${fileName} for ${moduleName} module\n`);
    console.log(`✅ Created ${fileName}`);
  } else {
    console.log(`⚠️ Skipped ${fileName} (already exists)`);
  }
});

console.log(`\n🚀 Module "${moduleName}" created successfully!`);
