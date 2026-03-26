import { useState, useCallback, useRef } from 'react';
import { geminiClient } from '../services/geminiClient';

// Image cache for AI-generated obstacle sprites
const imageCache = new Map();
// Track generated images per biome to avoid duplicates
const generatedBiomeImages = new Set();

const loadObstacleImage = async (imageData, obstacleType) => {
  const cacheKey = `${obstacleType}_${imageData.slice(0, 50)}`; // Use partial data as key

  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(cacheKey, img);
      console.log(`[IMAGE GEN] ✅ Successfully loaded image for ${obstacleType}`);
      resolve(img);
    };
    img.onerror = () => {
      console.log(`[IMAGE GEN] ❌ Failed to load image for ${obstacleType}`);
      resolve(null); // Resolve with null to indicate fallback to procedural
    };
    img.src = `data:image/png;base64,${imageData}`;
  });
};

// Pre-generate images for upcoming biomes
const preGenerateBiomeImage = async (biome, score) => {
  const biomeKey = `${biome}_${score}`;
  if (generatedBiomeImages.has(biomeKey)) {
    console.log(`[IMAGE GEN] ⏭️ Already generated image for ${biome} at score ${score}`);
    return;
  }

  console.log(`[IMAGE GEN] 🎨 Starting pre-generation for ${biome} biome (score: ${score})`);

  try {
    // Determine which obstacle to generate for this biome
    let obstacleType;
    switch (biome) {
      case 'JUNGLE':
        obstacleType = 'TREE'; // Generate tree for jungle
        break;
      case 'VOLCANIC':
        obstacleType = 'ROCK'; // Generate rock for volcanic
        break;
      case 'TUNDRA':
        obstacleType = 'ICE_SPIKE'; // Generate ice spike for tundra
        break;
      case 'FINAL RUN':
        obstacleType = 'ASTEROID'; // Generate asteroid for final run
        break;
      default:
        console.log(`[IMAGE GEN] ⏭️ No image generation needed for ${biome}`);
        return;
    }

    console.log(`[IMAGE GEN] 🎯 Generating image for ${obstacleType} in ${biome} biome`);

    // Call the image generation API directly
    const response = await fetch('/api/gemini/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ obstacleType, biome, style: 'pixel-art' })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const imageResult = await response.json();
    if (imageResult.success && imageResult.imageData) {
      console.log(`[IMAGE GEN] ✅ Generated image for ${obstacleType} (${imageResult.imageData.length} chars)`);

      // Cache the image data for this biome
      const cacheKey = `${biome}_${obstacleType}`;
      imageCache.set(cacheKey, imageResult.imageData);
      generatedBiomeImages.add(biomeKey);

      console.log(`[IMAGE GEN] 💾 Cached image for ${biome} biome`);
    } else {
      console.log(`[IMAGE GEN] ❌ Image generation failed for ${obstacleType}: ${imageResult.error}`);
    }

  } catch (error) {
    console.log(`[IMAGE GEN] 💥 Error pre-generating image for ${biome}:`, error.message);
  }
};

const createObstacle = (type, x, biome, imageData = null) => {
  const baseObstacle = { id: Date.now() + Math.random() };

  // Check if we have a pre-generated image for this biome and type
  const cacheKey = `${biome}_${type}`;
  const cachedImageData = imageCache.get(cacheKey);

  if (cachedImageData && typeof cachedImageData === 'string') {
    // Load the pre-generated image
    console.log(`[IMAGE GEN] 🎨 Using pre-generated image for ${type} in ${biome}`);
    loadObstacleImage(cachedImageData, type).then(img => {
      if (img) {
        setObstacles(prev => prev.map(obs =>
          obs.id === baseObstacle.id ? { ...obs, image: img } : obs
        ));
        console.log(`[IMAGE GEN] ✅ Applied pre-generated image to ${type}`);
      }
    }).catch(err => {
      console.log(`[IMAGE GEN] ❌ Failed to apply pre-generated image for ${type}:`, err.message);
    });
  } else if (imageData) {
    // Fallback: load from provided imageData (from API response)
    console.log(`[IMAGE GEN] 📥 Loading image from API response for ${type}`);
    loadObstacleImage(imageData, type).then(img => {
      if (img) {
        setObstacles(prev => prev.map(obs =>
          obs.id === baseObstacle.id ? { ...obs, image: img } : obs
        ));
        console.log(`[IMAGE GEN] ✅ Applied API image to ${type}`);
      }
    }).catch(err => {
      console.log(`[IMAGE GEN] ❌ Failed to apply API image for ${type}:`, err.message);
    });
  }

  switch(type) {
    // Badlands obstacles (Ground)
    case 'CACTUS':
    case 'CACTUS_CLUSTER':
      return { ...baseObstacle, type, x, y: 210, width: type === 'CACTUS_CLUSTER' ? 35 : 20, height: 40, sprite: 'cactus' };
    case 'ROCK':
      return { ...baseObstacle, type, x, y: 220, width: 25, height: 30, sprite: 'rock' };

    // Jungle obstacles (Ground)
    case 'TREE':
      return { ...baseObstacle, type, x, y: 190, width: 30, height: 60, sprite: 'tree' };
    case 'VINE':
      return { ...baseObstacle, type, x, y: 200, width: 15, height: 50, sprite: 'vine' };
    case 'LOG':
      return { ...baseObstacle, type, x, y: 230, width: 40, height: 20, sprite: 'log' };

    // Volcano obstacles (Ground)
    case 'LAVA_ROCK':
      return { ...baseObstacle, type, x, y: 215, width: 28, height: 35, sprite: 'lava_rock' };
    case 'FIRE_PIT':
      return { ...baseObstacle, type, x, y: 235, width: 35, height: 15, sprite: 'fire_pit' };
    case 'MAGMA_POOL':
      return { ...baseObstacle, type, x, y: 240, width: 45, height: 10, sprite: 'magma_pool' };

    // Ice obstacles (Ground)
    case 'ICE_SPIKE':
      return { ...baseObstacle, type, x, y: 200, width: 18, height: 50, sprite: 'ice_spike' };
    case 'SNOW_DRIFT':
      return { ...baseObstacle, type, x, y: 225, width: 32, height: 25, sprite: 'snow_drift' };

    // Ocean obstacles (Ground)
    case 'CORAL':
      return { ...baseObstacle, type, x, y: 220, width: 22, height: 30, sprite: 'coral' };
    case 'SEAWEED':
      return { ...baseObstacle, type, x, y: 210, width: 16, height: 40, sprite: 'seaweed' };

    // Space obstacles (Ground)
    case 'COMET':
      return { ...baseObstacle, type, x, y: 235, width: 20, height: 15, sprite: 'comet' };
      
    // Space obstacles (Aerial - MUST DUCK!) Y-bottom aligns exactly at 205
    case 'ASTEROID':
      return { ...baseObstacle, type, x, y: 180, width: 25, height: 25, sprite: 'asteroid' };

    // Flying enemies (Aerial - MUST DUCK!) Y-bottom: 205
    case 'PTERODACTYL':
    case 'MONKEY':
    case 'SHARK':
    case 'ALIEN_POD':
      return { ...baseObstacle, type, x, y: 185, width: 30, height: 20, sprite: 'flying' };

    // Special hazards (Aerial - MUST DUCK!) Y-bottom: 205
    case 'ASH_CLOUD':
      return { ...baseObstacle, type, x, y: 175, width: 40, height: 30, sprite: 'ash_cloud' };
    case 'FROST_CRYSTAL':
      return { ...baseObstacle, type, x, y: 185, width: 20, height: 20, sprite: 'frost_crystal' };
    case 'COSMIC_DUST':
      return { ...baseObstacle, type, x, y: 180, width: 35, height: 25, sprite: 'cosmic_dust' };

    // Special hazards (Ground)
    case 'WAVE':
      return { ...baseObstacle, type, x, y: 235, width: 50, height: 15, sprite: 'wave' };
    case 'AVALANCHE':
      return { ...baseObstacle, type, x, y: 210, width: 60, height: 40, sprite: 'avalanche' };

    default: // Failsafe ground obstacle
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
      // if ((now - lastFetchTimeRef.current) < 3000) console.log('[useObstacles] Throttled (cooldown active)');
      return;
    }

    lastFetchTimeRef.current = now;
    isFetchingWaveRef.current = true;

    // console.log('[useObstacles] Fetching wave, current queue length:', waveQueueRef.current.length);
    lastFetchTimeRef.current = now;
    isFetchingWaveRef.current = true;

    let performance = 'average';
    if (score > 1000 && speed > 10) performance = 'thriving';
    else if (score < 200) performance = 'struggling';

    try {
      const wave = await geminiClient.getObstacleWave(biome, speed, performance);
      if (wave && Array.isArray(wave)) {
        // console.log('[useObstacles] Added wave to queue:', wave);
        waveQueueRef.current.push(...wave);
        // console.log('[useObstacles] Queue size after push:', waveQueueRef.current.length);
      } else {
        // console.warn('[useObstacles] Invalid wave response:', wave);
      }
    } catch(e) {
      // console.error('[useObstacles] Fetch error:', e.message);
    }
    isFetchingWaveRef.current = false;
  }, []);

  const updateObstacles = useCallback((deltaTime, speed, width, difficultyMultiplier, biome, score) => {
    // Pre-generate images for upcoming biomes (100-200 points before threshold)
    if (score >= 300 && score < 400 && !generatedBiomeImages.has(`JUNGLE_${Math.floor(score/100)*100}`)) {
      preGenerateBiomeImage('JUNGLE', Math.floor(score));
    } else if (score >= 1300 && score < 1400 && !generatedBiomeImages.has(`TUNDRA_${Math.floor(score/100)*100}`)) {
      preGenerateBiomeImage('TUNDRA', Math.floor(score));
    } else if (score >= 2800 && score < 2900 && !generatedBiomeImages.has(`VOLCANIC_${Math.floor(score/100)*100}`)) {
      preGenerateBiomeImage('VOLCANIC', Math.floor(score));
    } else if (score >= 4800 && score < 4900 && !generatedBiomeImages.has(`FINAL RUN_${Math.floor(score/100)*100}`)) {
      preGenerateBiomeImage('FINAL RUN', Math.floor(score));
    }

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
           // console.log('[useObstacles] Spawning from queue:', nextInWave);
           spawnTimerRef.current = 0;
           waveQueueRef.current.shift();
           const newObs = createObstacle(nextInWave.type, width, biome, nextInWave.imageData);
           newObs.narrative = nextInWave.narrative;
           filtered.push(newObs);
           // console.log('[useObstacles] Spawned obstacle:', newObs, 'Queue remaining:', waveQueueRef.current.length);
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
