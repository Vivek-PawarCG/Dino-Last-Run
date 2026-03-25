import { SPRITE_TREX, getSpriteImage } from '../assets/sprites';

let img = null;

export class DinoSprite {
  constructor(ctx) {
    this.ctx = ctx;
    this.width = 44;
    this.height = 47;
    // States: 'running', 'jumping', 'ducking', 'dead'
    this.state = 'running';
    this.frame = 0;
    this.frameTimer = 0;
    
    if (!img && typeof window !== 'undefined') {
      img = getSpriteImage(SPRITE_TREX);
    }
  }

  update(deltaTime, state) {
    this.state = state;
    if (this.state === 'running') {
      this.frameTimer += deltaTime;
      if (this.frameTimer > 100) { 
        this.frame = (this.frame === 0) ? 1 : 0;
        this.frameTimer = 0;
      }
    } else {
      this.frame = 0; 
    }
  }

  draw(x, y) {
    if (!img) return;
    
    // Draw 2x sprite scaled down to 44x47
    let sx = 0;
    let sy = 0;
    let sw = 88;
    let sh = 94;
    
    if (this.state === 'running') {
      sx = (this.frame + 2) * 88;
    } else if (this.state === 'dead') {
      sx = 4 * 88;
    } else if (this.state === 'ducking') {
      sx = 6 * 88; 
      sw = 118; // Ducking is wider
    } 

    this.ctx.drawImage(img, sx, sy, sw, sh, x, y, sw/2, sh/2);
  }
  
  getHitbox(x, y) {
    if (this.state === 'ducking') {
      return { x, y: y + 20, width: 59, height: 27 };
    }
    return { x, y, width: 44, height: 47 };
  }
}
