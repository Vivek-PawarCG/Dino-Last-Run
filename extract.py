import codecs

with open('demo reference/dino-game-demo-file.html', 'r', encoding='utf-8') as f:
    html = f.read()

j = html.split('<audio id="offline-sound-press"')[1].split('src="')[1].split('"')[0]
h = html.split('<audio id="offline-sound-hit"')[1].split('src="')[1].split('"')[0]
r = html.split('<audio id="offline-sound-reached"')[1].split('src="')[1].split('"')[0]

with codecs.open('src/assets/sounds.js', 'w', encoding='utf-8') as f:
    f.write('export const SOUND_JUMP = "' + j + '";\n')
    f.write('export const SOUND_HIT = "' + h + '";\n')
    f.write('export const SOUND_REACHED = "' + r + '";\n')
