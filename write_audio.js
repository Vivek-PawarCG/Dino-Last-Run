const fs = require('fs');
const html = fs.readFileSync('demo reference/dino-game-demo-file.html', 'utf8');
const chunks = html.split('id="offline-sound-');
const jump = chunks[1].split('src="')[1].split('"')[0];
const hit = chunks[2].split('src="')[1].split('"')[0];
const reached = chunks[3].split('src="')[1].split('"')[0];
fs.writeFileSync('src/assets/sounds.js', 'export const SOUND_JUMP = "' + jump + '";\nexport const SOUND_HIT = "' + hit + '";\nexport const SOUND_REACHED = "' + reached + '";\n');
