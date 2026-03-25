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
       imgCactus = getSpriteImage(SPRITE_OBSTACLE_LARGE);
       initAudio();
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
    
    if (Math.random() < 0.02) { 
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
       if (obs.type === 'CACTUS' && imgCactus) {
         ctx.drawImage(imgCactus, 0, 0, 50, 100, obs.x, obs.y, Math.max(obs.width, 25), Math.max(obs.height, 50));
       } else {
         ctx.fillRect(obs.x, obs.y, obs.width, Math.max(obs.height, 10));
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
           ctx.fillRect(obs.x, obs.y, obs.width, Math.max(obs.height, 10));
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
        <p style={{color: biomeManagerRef.current?.currentBiome?.fg}}>BIOME: {biomeName}</p>
      </div>
      <div className="absolute top-4 right-6 md:right-12 text-white font-pixel z-10 text-xs md:text-lg drop-shadow-md">
        <p style={{color: biomeManagerRef.current?.currentBiome?.fg}}>SCORE: {Math.floor(score).toString().padStart(5, '0')}</p>
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
