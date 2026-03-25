import { useState, useCallback, useRef } from 'react';
import { geminiClient } from '../services/geminiClient';

const createObstacle = (type, x) => {
  switch(type) {
    case 'PTERODACTYL': return { id: Date.now()+Math.random(), type, x, y: 180, width: 30, height: 20 };
    case 'LAVA': return { id: Date.now()+Math.random(), type, x, y: 230, width: 40, height: 20 };
    case 'ICE': return { id: Date.now()+Math.random(), type, x, y: 210, width: 20, height: 40 };
    default: return { id: Date.now()+Math.random(), type: 'CACTUS', x, y: 210, width: 20, height: 40 };
  }
};

export function useObstacles() {
  const [obstacles, setObstacles] = useState([]);
  const spawnTimerRef = useRef(0);
  const waveQueueRef = useRef([]);
  const isFetchingWaveRef = useRef(false);

  const fetchWave = useCallback(async (biome, speed, score) => {
    if (isFetchingWaveRef.current || waveQueueRef.current.length > 2) return;
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
      
      filtered = filtered.map(obs => ({
        ...obs,
        x: obs.x - (speed * (deltaTime / 16.6))
      }));

      spawnTimerRef.current += deltaTime;

      if (waveQueueRef.current.length > 0) {
        const nextInWave = waveQueueRef.current[0];
        const timingMs = (nextInWave.timing || 1000) * difficultyMultiplier;
        
        if (spawnTimerRef.current > timingMs) {
           spawnTimerRef.current = 0;
           waveQueueRef.current.shift();
           const newObs = createObstacle(nextInWave.type, width);
           newObs.narrative = nextInWave.narrative;
           filtered.push(newObs);
        }
      } else {
        const spawnThreshold = (Math.random() * 1000 + (15000 / speed)) * difficultyMultiplier;
        if (spawnTimerRef.current > spawnThreshold) {
          spawnTimerRef.current = 0;
          filtered.push(createObstacle('CACTUS', width));
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
