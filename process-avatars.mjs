import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function processImages() {
  const dir = 'Fotos Profissionais';
  const outDir = 'client/public/assets/hclin';
  const files = fs.readdirSync(dir).filter(f => f.match(/\.(jpg|jpeg|png)$/i) && f !== 'Logo.png');

  for (const file of files) {
    console.log('Processing ' + file + '...');
    try {
      const inputPath = path.join(dir, file);
      const outName = path.parse(file).name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + '.webp';
      const outPath = path.join(outDir, outName);
      
      const size = 500;
      const circleSvg = `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" /></svg>`;
      
      await sharp(inputPath)
        .resize(size, size, { fit: 'cover', position: 'top' })
        .composite([{
          input: Buffer.from(circleSvg),
          blend: 'dest-in'
        }])
        .webp({ quality: 90 })
        .toFile(outPath);
        
      console.log('Saved ' + outName);
    } catch (err) {
      console.error('Failed ' + file + ':', err);
    }
  }
}

processImages().then(() => console.log('Done')).catch(console.error);
