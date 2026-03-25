import { useState, useCallback, useRef } from 'react';
import { geminiClient } from '../services/geminiClient';

// Image cache for AI-generated obstacle sprites
const imageCache = new Map();

const loadObstacleImage = async (imageData, obstacleType) => {
  const cacheKey = `${obstacleType}_${imageData.slice(0, 50)}`; // Use partial data as key
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(cacheKey, img);
      resolve(img);
    };
    img.onerror = () => {
      console.warn(`[useObstacles] Failed to load image for ${obstacleType}`);
      resolve(null); // Resolve with null to indicate fallback to procedural
    };
    img.src = `data:image/png;base64,${imageData}`;
  });
};

const createObstacle = (type, x, imageData = null) => {
  const baseObstacle = { id: Date.now() + Math.random(), imageData };

  // Start loading image asynchronously if provided
  if (imageData) {
    loadObstacleImage(imageData, type).then(img => {
      // Update the obstacle with the loaded image
      setObstacles(prev => prev.map(obs => 
        obs.id === baseObstacle.id ? { ...obs, image: img } : obs
      ));
    }).catch(err => {
      console.warn(`[useObstacles] Failed to load image for ${type}:`, err);
    });
  }

  switch(type) {
    // Badlands obstacles
    case 'CACTUS':
    case 'CACTUS_CLUSTER':
      return { ...baseObstacle, type, x, y: 210, width: type === 'CACTUS_CLUSTER' ? 35 : 20, height: 40, sprite: 'cactus' };

    case 'ROCK':
      return { ...baseObstacle, type, x, y: 220, width: 25, height: 30, sprite: 'rock' };

    // Jungle obstacles
    case 'TREE':
      return { ...baseObstacle, type, x, y: 180, width: 30, height: 60, sprite: 'tree' };

    case 'VINE':
      return { ...baseObstacle, type, x, y: 200, width: 15, height: 50, sprite: 'vine' };

    case 'LOG':
      return { ...baseObstacle, type, x, y: 230, width: 40, height: 20, sprite: 'log' };

    // Volcano obstacles
    case 'LAVA_ROCK':
      return { ...baseObstacle, type, x, y: 215, width: 28, height: 35, sprite: 'lava_rock' };

    case 'FIRE_PIT':
      return { ...baseObstacle, type, x, y: 235, width: 35, height: 15, sprite: 'fire_pit' };

    case 'MAGMA_POOL':
      return { ...baseObstacle, type, x, y: 240, width: 45, height: 10, sprite: 'magma_pool' };

    // Ice obstacles
    case 'ICE_SPIKE':
      return { ...baseObstacle, type, x, y: 200, width: 18, height: 50, sprite: 'ice_spike' };

    case 'SNOW_DRIFT':
      return { ...baseObstacle, type, x, y: 225, width: 32, height: 25, sprite: 'snow_drift' };

    // Ocean obstacles
    case 'CORAL':
      return { ...baseObstacle, type, x, y: 220, width: 22, height: 30, sprite: 'coral' };

    case 'SEAWEED':
      return { ...baseObstacle, type, x, y: 210, width: 16, height: 40, sprite: 'seaweed' };

    // Space obstacles
    case 'ASTEROID':
      return { ...baseObstacle, type, x, y: 190, width: 25, height: 25, sprite: 'asteroid' };

    case 'COMET':
      return { ...baseObstacle, type, x, y: 175, width: 20, height: 15, sprite: 'comet' };

    // Flying enemies
    case 'PTERODACTYL':
    case 'MONKEY':
    case 'SHARK':
    case 'ALIEN_POD':
      return { ...baseObstacle, type, x, y: 180, width: 30, height: 20, sprite: 'flying' };

    // Special hazards
    case 'ASH_CLOUD':
      return { ...baseObstacle, type, x, y: 160, width: 40, height: 30, sprite: 'ash_cloud' };

    case 'FROST_CRYSTAL':
      return { ...baseObstacle, type, x, y: 200, width: 20, height: 20, sprite: 'frost_crystal' };

    case 'WAVE':
      return { ...baseObstacle, type, x, y: 235, width: 50, height: 15, sprite: 'wave' };

    case 'COSMIC_DUST':
      return { ...baseObstacle, type, x, y: 170, width: 35, height: 25, sprite: 'cosmic_dust' };

    case 'AVALANCHE':
      return { ...baseObstacle, type, x, y: 180, width: 60, height: 40, sprite: 'avalanche' };

    default:
      return { ...baseObstacle, type: 'CACTUS', x, y: 210, width: 20, height: 40, sprite: 'cactus' };
  }
};

export function useObstacles() {
  const [obstacles, setObstacles] = useState([]);
  const spawnTimerRef = useRef(0);
  const waveQueueRef = useRef([]);
  const isFetchingWaveRef = useRef(false);
  const lastFetchTimeRef = useRef(0); // Track last fetch time

  const fetchWave = useCallback(async (biome, speed, score) => {
    const now = Date.now();
    // Throttle: only allow fetches every 3 seconds minimum
    if (isFetchingWaveRef.current || waveQueueRef.current.length > 2 || (now - lastFetchTimeRef.current) < 3000) {
      if ((now - lastFetchTimeRef.current) < 3000) console.log('[useObstacles] Throttled (cooldown active)');
      return;
    }
    
    lastFetchTimeRef.current = now;
    isFetchingWaveRef.current = true;
    
    console.log('[useObstacles] Fetching wave, current queue length:', waveQueueRef.current.length);
    lastFetchTimeRef.current = now;
    isFetchingWaveRef.current = true;
    
    let performance = 'average';
    if (score > 1000 && speed > 10) performance = 'thriving';
    else if (score < 200) performance = 'struggling';
    
    try {
      const wave = await geminiClient.getObstacleWave(biome, speed, performance);
      if (wave && Array.isArray(wave)) {
        console.log('[useObstacles] Added wave to queue:', wave);
        waveQueueRef.current.push(...wave);
        console.log('[useObstacles] Queue size after push:', waveQueueRef.current.length);
      } else {
        console.warn('[useObstacles] Invalid wave response:', wave);
      }
    } catch(e) {
      console.error('[useObstacles] Fetch error:', e.message);
    }
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
           console.log('[useObstacles] Spawning from queue:', nextInWave);
           spawnTimerRef.current = 0;
           waveQueueRef.current.shift();
           const newObs = createObstacle(nextInWave.type, width, nextInWave.imageData);
           newObs.narrative = nextInWave.narrative;
           filtered.push(newObs);
           console.log('[useObstacles] Spawned obstacle:', newObs, 'Queue remaining:', waveQueueRef.current.length);
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
