export const BIOMES = {
  BADLANDS: { id: 'BADLANDS', threshold: 0, bg: '#000000', fg: '#FFFFFF' },
  VOLCANIC: { id: 'VOLCANIC', threshold: 500, bg: '#1A0A00', fg: '#FFD700' },
  JUNGLE: { id: 'JUNGLE', threshold: 1500, bg: '#1A0800', fg: '#7BC950' },
  TUNDRA: { id: 'TUNDRA', threshold: 3000, bg: '#001A33', fg: '#FFFFFF' },
  FINAL: { id: 'FINAL RUN', threshold: 5000, bg: '#000000', fg: '#FF6600' }
};

import { SPRITE_CLOUD, SPRITE_HORIZON, getSpriteImage } from '../assets/sprites';

let imgCloud = null;
let imgHorizon = null;

export class BiomeManager {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.currentBiome = BIOMES.BADLANDS;
    this.bgOffsetCloud = 0; 
    this.bgOffsetHorizon = 0; 
    
    if (typeof window !== 'undefined') {
      if (!imgCloud) imgCloud = getSpriteImage(SPRITE_CLOUD);
      if (!imgHorizon) imgHorizon = getSpriteImage(SPRITE_HORIZON);
    }
  }

  update(score, speed, deltaTime) {
    if (score >= BIOMES.FINAL.threshold) this.currentBiome = BIOMES.FINAL;
    else if (score >= BIOMES.TUNDRA.threshold) this.currentBiome = BIOMES.TUNDRA;
    else if (score >= BIOMES.JUNGLE.threshold) this.currentBiome = BIOMES.JUNGLE;
    else if (score >= BIOMES.VOLCANIC.threshold) this.currentBiome = BIOMES.VOLCANIC;
    else this.currentBiome = BIOMES.BADLANDS;

    const baseMove = speed * (deltaTime / 16.6);
    this.bgOffsetCloud = (this.bgOffsetCloud + baseMove * 0.2) % this.width;
    this.bgOffsetHorizon = (this.bgOffsetHorizon + baseMove * 1.0) % 1200; 
  }

  draw() {
    this.ctx.fillStyle = this.currentBiome.bg;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = this.currentBiome.fg;

    if (imgCloud) {
       for (let i = 0; i < 3; i++) {
           let x = (i * 300) - this.bgOffsetCloud;
           if (x < -100) x += 900;
           this.ctx.drawImage(imgCloud, x, 50 + (i % 2)*20, 46, 14); 
       }
    }

    const groundY = 240;
    
    if (imgHorizon) {
       this.ctx.drawImage(imgHorizon, -this.bgOffsetHorizon, groundY, 1200, 12);
       this.ctx.drawImage(imgHorizon, 1200 - this.bgOffsetHorizon, groundY, 1200, 12);
    } else {
       this.ctx.fillRect(0, groundY+10, this.width, 2);
    }
  }
}
