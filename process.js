const fs = require('fs');
const path = require('path');
const { removeBackground } = require('@imgly/background-removal-node');

async function processImages() {
  const dir = 'Fotos Profissionais';
  const outDir = 'client/public/assets/hclin';
  const files = fs.readdirSync(dir).filter(f => f.match(/\.(jpg|jpeg|png)$/i) && f !== 'Logo.png');

  for (const file of files) {
    console.log('Processing ' + file + '...');
    try {
      const inputPath = path.join(dir, file);
      const fileUrl = 'file://' + path.resolve(inputPath).replace(/\\\\/g, '/');
      
      const blob = await removeBackground(fileUrl);
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const outName = path.parse(file).name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + '.png';
      const outPath = path.join(outDir, outName);
      
      fs.writeFileSync(outPath, buffer);
      console.log('Saved ' + outName);
    } catch (err) {
      console.error('Failed ' + file + ':', err);
    }
  }
}

processImages().then(() => console.log('Done')).catch(console.error);

