const sharp = require('sharp');
const fs = require('fs');

async function run() {
  const dir = 'public/images';
  
  try {
    fs.copyFileSync('C:\\Users\\vivpawar\\.gemini\\antigravity\\brain\\cd262351-a379-4173-a356-19a029455108\\media__1774414946425.png', dir + '/main_bg.png');
  } catch (e) {
    console.error("Failed to copy attachment", e);
  }

  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.png')) {     
      const ext = file.split('.').pop();
      const name = file.replace('.' + ext, '');
      const input = `${dir}/${file}`;
      const output = `${dir}/${name}.webp`;
      try {
        await sharp(input)
          .resize({ width: 800, withoutEnlargement: true })
          .webp({ quality: 50 })
          .toFile(output);
        fs.unlinkSync(input);
        console.log(`Compressed ${file} successfully.`);
      } catch (e) {
        fs.writeFileSync('err.txt', e.stack);
      }
    }
  }
}
run();
