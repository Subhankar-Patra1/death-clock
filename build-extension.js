import fs from 'fs';
import path from 'path';

// Copy manifest.json to dist
fs.copyFileSync('manifest.json', 'dist/manifest.json');

// Copy icons folder if it exists
if (fs.existsSync('icons')) {
  if (!fs.existsSync('dist/icons')) {
    fs.mkdirSync('dist/icons', { recursive: true });
  }
  
  const iconFiles = fs.readdirSync('icons');
  iconFiles.forEach(file => {
    fs.copyFileSync(path.join('icons', file), path.join('dist/icons', file));
  });
}

console.log('Extension files copied to dist folder');