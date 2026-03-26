import { useState, useCallback, useRef } from 'react';
import { geminiClient } from '../services/geminiClient';

const createObstacle = (rawType, x, biome) => {
  let type = String(rawType || 'CACTUS').toUpperCase().trim();
  const baseObstacle = { id: Date.now() + Math.random() };

  // Strict map enforcing a single-type of obstacle per biome to keep visual logic incredibly clean
  if (biome === 'BADLANDS') type = 'CACTUS';
  if (biome === 'JUNGLE') type = 'TREE';
  if (biome === 'VOLCANIC') type = 'LAVA_ROCK';
  if (biome === 'TUNDRA') type = 'ICE_SPIKE';
  if (biome === 'FINAL RUN') type = 'ASTEROID';

  switch(type) {
    case 'CACTUS':
    case 'CACTUS_CLUSTER': // Handled via the original Cactus Sprite
      return { ...baseObstacle, type, x, y: 210, width: 20, height: 40, sprite: 'cactus' };
    case 'TREE':
      return { ...baseObstacle, type, x, y: 190, width: 30, height: 60, sprite: 'tree' };
    case 'LAVA_ROCK':
      return { ...baseObstacle, type, x, y: 215, width: 28, height: 35, sprite: 'lava_rock' };
    case 'ICE_SPIKE':
      return { ...baseObstacle, type, x, y: 200, width: 18, height: 50, sprite: 'ice_spike' };
    case 'ASTEROID':
      // Must Duck Heights
      return { ...baseObstacle, type, x, y: 180, width: 25, height: 25, sprite: 'asteroid' };
    default: 
      return { ...baseObstacle, type: 'CACTUS', x, y: 210, width: 20, height: 40, sprite: 'cactus' };
  }
};

export function useObstacles() {
  const [obstacles, setObstacles] = useState([]);
  const spawnTimerRef = useRef(0);
  const waveQueueRef = useRef([]);
  const isFetchingWaveRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  const fetchWave = useCallback(async (biome, speed, score) => {
    const now = Date.now();
    // Throttle calls rapidly to protect Gemini Quota
    if (isFetchingWaveRef.current || waveQueueRef.current.length > 2 || (now - lastFetchTimeRef.current) < 3000) return;

    lastFetchTimeRef.current = now;
    isFetchingWaveRef.current = true;

    let performance = 'average';
    if (score > 1000 && speed > 10) performance = 'thriving';
    else if (score < 200) performance = 'struggling';

    try {
      const wave = await geminiClient.getObstacleWave(biome, speed, performance);
      if (wave && Array.isArray(wave)) {
        waveQueueRef.current.push(...wave);
      }
    } catch(e) {}
    isFetchingWaveRef.current = false;
  }, []);

  const updateObstacles = useCallback((deltaTime, speed, width, difficultyMultiplier, biome) => {
    setObstacles(prev => {
      let filtered = prev.filter(obs => obs.x + obs.width > 0);

      filtered = filtered.map(obs => {
        let newY = obs.y;
        if (obs.behavior === 'SINKING') {
          newY += (deltaTime / 16.6) * 0.4;
        }
        return {
          ...obs,
          x: obs.x - (speed * (deltaTime / 16.6)),
          y: newY
        };
      });

      spawnTimerRef.current += deltaTime;

      if (waveQueueRef.current.length > 0) {
        const nextInWave = waveQueueRef.current[0];
        const timingMs = (nextInWave.timing || 1000) * difficultyMultiplier;

        if (spawnTimerRef.current > timingMs) {
           spawnTimerRef.current = 0;
           waveQueueRef.current.shift();
           const newObs = createObstacle(nextInWave.type, width, biome);
           newObs.narrative = nextInWave.narrative;
           newObs.behavior = nextInWave.behavior ? String(nextInWave.behavior).toUpperCase().trim() : 'NORMAL';
           newObs.earthquake = !!nextInWave.earthquake;
           filtered.push(newObs);
        }
      } else {
        const spawnThreshold = (Math.random() * 1000 + (15000 / speed)) * difficultyMultiplier;
        if (spawnTimerRef.current > spawnThreshold) {
          spawnTimerRef.current = 0;
          let offlineType = 'CACTUS';
          if (biome === 'JUNGLE') offlineType = 'TREE';
          if (biome === 'VOLCANIC') offlineType = 'LAVA_ROCK';
          if (biome === 'TUNDRA') offlineType = 'ICE_SPIKE';
          if (biome === 'FINAL RUN') offlineType = 'ASTEROID';
          filtered.push(createObstacle(offlineType, width, biome));
        }
      }

      return filtered;
    });
  }, []);

  const resetObstacles = useCallback(() => {
    setObstacles([]);
    spawnTimerRef.current = 0;
    waveQueueRef.current = [];
    isFetchingWaveRef.current = false;
  }, []);

  return { obstacles, updateObstacles, resetObstacles, fetchWave };
}
