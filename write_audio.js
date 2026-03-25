const fs = require('fs');
const html = fs.readFileSync('demo reference/dino-game-demo-file.html', 'utf8');

const jumpChunk = html.split('<audio id="offline-sound-press"')[1];
const jump = jumpChunk.split('src="')[1].split('"')[0];

const hitChunk = html.split('<audio id="offline-sound-hit"')[1];
const hit = hitChunk.split('src="')[1].split('"')[0];

const reachedChunk = html.split('<audio id="offline-sound-reached"')[1];
const reached = reachedChunk.split('src="')[1].split('"')[0];

fs.writeFileSync('src/assets/sounds.js', 'export const SOUND_JUMP = "' + jump + '";\nexport const SOUND_HIT = "' + hit + '";\nexport const SOUND_REACHED = "' + reached + '";\n');
