$content = [System.IO.File]::ReadAllText("demo reference\dino-game-demo-file.html")
$jump = ((($content -split "offline-sound-press")[1]) -split 'src="')[1] -split '"' | Select-Object -First 1
$hit = ((($content -split "offline-sound-hit")[1]) -split 'src="')[1] -split '"' | Select-Object -First 1
$reached = ((($content -split "offline-sound-reached")[1]) -split 'src="')[1] -split '"' | Select-Object -First 1

$out = "export const SOUND_JUMP = `"$jump`";`nexport const SOUND_HIT = `"$hit`";`nexport const SOUND_REACHED = `"$reached`";`n"
[System.IO.File]::WriteAllText("src\assets\sounds.js", $out)
