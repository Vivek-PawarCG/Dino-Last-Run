const fs = require('fs');
fs.writeFileSync('error.txt', 'Started');
try {
  const content = fs.readFileSync('demo reference/dino-game-demo-file.html', 'utf8');
  const sJump = content.split('offline-sound-press')[1].split('src="')[1].split('"')[0];
  const sHit = content.split('offline-sound-hit')[1].split('src="')[1].split('"')[0];
  const sReached = content.split('offline-sound-reached')[1].split('src="')[1].split('"')[0];
  
  fs.writeFileSync('src/assets/sounds.js', 'export const SOUND_JUMP = "' + sJump + '";\nexport const SOUND_HIT = "' + sHit + '";\nexport const SOUND_REACHED = "' + sReached + '";\n');
  fs.writeFileSync('error.txt', 'Success!');
} catch(e) {
  fs.writeFileSync('error.txt', e.toString() + '\n' + e.stack);
}
