import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameLoop } from '../../hooks/useGameLoop';
import { usePhysics } from '../../hooks/usePhysics';
import { useObstacles } from '../../hooks/useObstacles';
import { DinoSprite } from '../../game/DinoSprite';
import { BiomeManager } from '../../game/BiomeManager';
import { checkCollision } from '../../game/CollisionDetector';
import DinoVoice from '../DinoVoice/DinoVoice.jsx';
import { geminiClient } from '../../services/geminiClient';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { ParticleSystem } from '../../game/ParticleSystem';
import { getSpriteImage, SPRITE_OBSTACLE_LARGE } from '../../assets/sprites';
import { initAudio, playDeath, playMilestone } from '../../game/AudioPlayer';

const INITIAL_SPEED = 6;
const MAX_SPEED = 15;
const ACCELERATION = 0.0001;
let imgCactus = null;

// Render biome-specific obstacles with appropriate colors and shapes
const renderBiomeObstacle = (ctx, obs, biome) => {
  const { x, y, width, height, type, image } = obs;

  // If we have a loaded AI-generated image, use it
  if (image) {
    try {
      ctx.drawImage(image, x, y, width, height);
      return; // Skip procedural rendering
    } catch (error) {
      console.warn('[GameCanvas] Failed to draw AI image for', type, error);
      // Fall through to procedural rendering
    }
  }

  // Fallback to procedural rendering if no image or image failed to load
  // Set colors based on biome and obstacle type
  let fillColor, strokeColor;

  switch (biome.id) {
    case 'BADLANDS':
      fillColor = type.includes('CACTUS') ? '#2D5016' : type === 'ROCK' ? '#8B7355' : '#4A4A4A';
      strokeColor = '#8B4513';
      break;
    case 'JUNGLE':
      fillColor = type === 'TREE' ? '#0F5132' : type === 'VINE' ? '#228B22' : type === 'LOG' ? '#654321' : '#32CD32';
      strokeColor = '#006400';
      break;
    case 'VOLCANIC':
      fillColor = type.includes('LAVA') || type.includes('MAGMA') ? '#FF4500' : type.includes('FIRE') ? '#FFD700' : '#8B0000';
      strokeColor = '#DC143C';
      break;
    case 'TUNDRA':
      fillColor = type.includes('ICE') || type.includes('FROST') ? '#87CEEB' : type.includes('SNOW') ? '#F0F8FF' : '#4682B4';
      strokeColor = '#B0E0E6';
      break;
    case 'FINAL RUN':
      fillColor = type === 'ASTEROID' ? '#696969' : type === 'COMET' ? '#FFD700' : type === 'COSMIC_DUST' ? '#9370DB' : '#4B0082';
      strokeColor = '#DDA0DD';
      break;
    default:
      fillColor = '#8B4513';
      strokeColor = '#654321';
  }

  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;

  // Render different shapes based on obstacle type
  switch (type) {
    case 'TREE':
      // Draw tree shape
      ctx.fillRect(x + width / 2 - 3, y, 6, height * 0.7); // trunk
      ctx.fillRect(x + width / 2 - 8, y + height * 0.3, 16, height * 0.4); // leaves
      ctx.strokeRect(x + width / 2 - 8, y + height * 0.3, 16, height * 0.4);
      break;

    case 'VINE':
      // Draw wavy vine
      ctx.beginPath();
      ctx.moveTo(x, y + height);
      ctx.bezierCurveTo(x + width / 3, y + height / 2, x + 2 * width / 3, y + height / 4, x + width, y);
      ctx.stroke();
      break;

    case 'FIRE_PIT':
    case 'MAGMA_POOL':
      // Draw glowing effect
      ctx.shadowColor = fillColor;
      ctx.shadowBlur = 10;
      ctx.fillRect(x, y, width, height);
      ctx.shadowBlur = 0;
      break;

    case 'ICE_SPIKE':
      // Draw triangular spike
      ctx.beginPath();
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x + width, y + height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'CORAL':
      // Draw coral shape
      ctx.beginPath();
      ctx.moveTo(x + width / 2, y + height);
      ctx.lineTo(x + width / 4, y + height / 2);
      ctx.lineTo(x + width / 2, y);
      ctx.lineTo(x + 3 * width / 4, y + height / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'ASTEROID':
      // Draw irregular asteroid shape
      ctx.beginPath();
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width, y + height / 3);
      ctx.lineTo(x + width * 0.8, y + height);
      ctx.lineTo(x + width / 4, y + height * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'COMET':
      // Draw comet with tail
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      // Draw tail
      ctx.beginPath();
      ctx.moveTo(x, y + height / 2);
      ctx.lineTo(x - width / 2, y + height);
      ctx.lineTo(x - width / 2, y);
      ctx.closePath();
      ctx.fill();
      break;

    default:
      // Default rectangle for other obstacles
      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);
  }
};

// The game physics internal resolution is 800x300, 
// we CSS scale it dynamically to stretch across the container.
export default function GameCanvas({ onDeath, personality }) {
  const canvasRef = useRef(null);
  const dinoRef = useRef(null);
  const biomeManagerRef = useRef(null);
  const particleSystemRef = useRef(null);

  const [isRunning, setIsRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [biomeName, setBiomeName] = useState('BADLANDS');
  const [nearMissEvent, setNearMissEvent] = useState(false);

  const difficultyRef = useRef({ spacing: 1.0, speedScale: 1.0 });

  const { yPos, isJumping, isDucking, jump, duck, updatePhysics } = usePhysics();
  const { obstacles, updateObstacles, fetchWave } = useObstacles();
  const { isListening, toggleVoice } = useVoiceInput(jump, duck, () => setIsRunning(prev => !prev));

  useEffect(() => {
    if (!imgCactus && typeof window !== 'undefined') {
      console.log('[GameCanvas] Initializing game...');
      imgCactus = getSpriteImage(SPRITE_OBSTACLE_LARGE);
      initAudio();
      console.log('[GameCanvas] Game initialized, ready for obstacles');
    }
  }, []);

  useEffect(() => {
    const diary = JSON.parse(localStorage.getItem('dino_diary') || '[]');
    const pastScores = diary.slice(0, 3).map(e => e.score);
    if (pastScores.length > 0) {
      geminiClient.getAdaptiveDifficulty(pastScores).then(res => {
        if (res.obstacleSpacingMultiplier) difficultyRef.current.spacing = res.obstacleSpacingMultiplier;
        if (res.speedScalingRate) difficultyRef.current.speedScale = res.speedScalingRate;
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current && !dinoRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      dinoRef.current = new DinoSprite(ctx);
      biomeManagerRef.current = new BiomeManager(ctx, 800, 300);
      particleSystemRef.current = new ParticleSystem(ctx, 800, 300);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
      if (e.code === 'Space' || e.code === 'ArrowUp') jump();
      else if (e.code === 'ArrowDown') duck(true);
    };
    const handleKeyUp = (e) => {
      if (e.code === 'ArrowDown') duck(false);
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [jump, duck]);

  const loop = useCallback((deltaTime) => {
    if (!canvasRef.current || !dinoRef.current || !biomeManagerRef.current || !isRunning) return;

    updatePhysics();

    // Attempt to fetch obstacle wave (throttled to max 1 every 3 seconds in useObstacles hook)
    if (Math.random() < 0.01) {
      console.log('[GameCanvas] Attempting to fetch wave (random 1% chance)');
      fetchWave(biomeManagerRef.current.currentBiome.id, speed, score);
    }

    updateObstacles(deltaTime, speed, 800, difficultyRef.current.spacing, biomeManagerRef.current.currentBiome.id);

    const scoreDelta = (speed * deltaTime) / 400;
    setScore(prev => {
      const newScore = prev + scoreDelta;
      if (Math.floor(newScore) > 0 && Math.floor(newScore) % 100 === 0 && Math.floor(prev) % 100 !== 0) {
        playMilestone();
      }
      return newScore;
    });
    setSpeed(prev => Math.min(prev + (ACCELERATION * difficultyRef.current.speedScale) * deltaTime, MAX_SPEED));

    biomeManagerRef.current.update(score, speed, deltaTime);
    if (biomeManagerRef.current.currentBiome.id !== biomeName) {
      setBiomeName(biomeManagerRef.current.currentBiome.id);
    }

    particleSystemRef.current.update(deltaTime, speed, biomeManagerRef.current.currentBiome.id);

    let dinoState = 'running';
    if (isJumping || yPos < 0) dinoState = 'jumping';
    else if (isDucking) dinoState = 'ducking';
    dinoRef.current.update(deltaTime, dinoState);

    const dinoHitbox = dinoRef.current.getHitbox(50, 250 + yPos - 47);

    let crashed = false;
    let nearMiss = false;

    if (obstacles.length > 0 && Math.random() < 0.005) {
      console.log('[GameCanvas] Obstacles on screen:', obstacles.map(o => ({ type: o.type, x: Math.round(o.x), narrative: o.narrative })));
    }

    for (const obs of obstacles) {
      if (checkCollision(dinoHitbox, obs, 4)) {
        crashed = true;
        break;
      }
      if (obs.x < 50 && obs.x > 30 && yPos < -20) {
        nearMiss = true;
      }
    }

    if (nearMiss && !nearMissEvent) {
      setNearMissEvent(true);
      setTimeout(() => setNearMissEvent(false), 5000);
    }

    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, 800, 300);

    biomeManagerRef.current.draw();
    particleSystemRef.current.draw();

    ctx.fillStyle = biomeManagerRef.current.currentBiome.fg;
    obstacles.forEach(obs => {
      // Render different obstacle types with appropriate visuals
      if (obs.type === 'CACTUS' && imgCactus) {
        // Use existing cactus sprite
        ctx.drawImage(imgCactus, 0, 0, 50, 100, obs.x, obs.y, Math.max(obs.width, 25), Math.max(obs.height, 50));
      } else {
        // Render biome-specific obstacles with colors and shapes
        renderBiomeObstacle(ctx, obs, biomeManagerRef.current.currentBiome);
      }

      if (obs.narrative) {
        ctx.font = '8px "Press Start 2P"';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(obs.narrative, obs.x, obs.y - 12);
        ctx.fillStyle = biomeManagerRef.current.currentBiome.fg;
      }
    });

    dinoRef.current.draw(50, 250 + yPos - 47);

    if (crashed) {
      playDeath();
      setIsRunning(false);
      dinoRef.current.state = 'dead';
      ctx.clearRect(0, 0, 800, 300);
      biomeManagerRef.current.draw();
      particleSystemRef.current.draw();
      ctx.fillStyle = biomeManagerRef.current.currentBiome.fg;
      obstacles.forEach(obs => {
        if (obs.type === 'CACTUS' && imgCactus) {
          ctx.drawImage(imgCactus, 0, 0, 50, 100, obs.x, obs.y, Math.max(obs.width, 25), Math.max(obs.height, 50));
        } else {
          renderBiomeObstacle(ctx, obs, biomeManagerRef.current.currentBiome);
        }
      });
      dinoRef.current.draw(50, 250 + yPos - 47);

      setTimeout(() => {
        onDeath(Math.floor(score), biomeManagerRef.current.currentBiome.id);
      }, 500);
    }
  }, [speed, score, biomeName, updatePhysics, updateObstacles, yPos, isJumping, isDucking, obstacles, onDeath, isRunning, nearMissEvent, fetchWave]);

  useGameLoop(loop, isRunning);

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col items-center select-none outline-none overflow-hidden bg-black"
      tabIndex="0"
      onTouchStart={(e) => { e.preventDefault(); jump(); }}
      onTouchEnd={(e) => { e.preventDefault(); duck(false); }}>

      <div className="absolute top-4 left-6 md:left-12 text-white font-pixel z-10 text-xs md:text-lg drop-shadow-md">
        <p style={{ color: biomeManagerRef.current?.currentBiome?.fg }}>BIOME: {biomeName}</p>
      </div>
      <div className="absolute top-4 right-6 md:right-12 text-white font-pixel z-10 text-xs md:text-lg drop-shadow-md">
        <p style={{ color: biomeManagerRef.current?.currentBiome?.fg }}>SCORE: {Math.floor(score).toString().padStart(5, '0')}</p>
      </div>

      <button onClick={toggleVoice} className={`absolute top-12 left-6 md:left-12 font-pixel md:text-sm text-[10px] z-10 ${isListening ? 'text-green-500 animate-pulse' : 'text-gray-500'}`}>
        MIC {isListening ? 'ON' : 'OFF'}
      </button>

      {/* The canvas keeps 800x300 internal logic but stretches fully across responsive screen */}
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        className="w-full h-full object-contain bg-black border-4 border-gray-800"
        style={{ imageRendering: 'pixelated' }}
      />

      <DinoVoice
        biome={biomeName}
        score={score}
        nearMiss={nearMissEvent}
        skillLevel={personality}
      />
    </div>
  );
}
