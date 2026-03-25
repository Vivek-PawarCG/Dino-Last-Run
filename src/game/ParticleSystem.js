export class ParticleSystem {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.particles = [];
  }

  update(deltaTime, speed, biomeId) {
    if (Math.random() < 0.2) {
      if (biomeId === 'VOLCANIC') {
        this.particles.push({
          x: Math.random() * this.width,
          y: this.height + 10,
          vx: (Math.random() - 0.5) * 3,
          vy: -Math.random() * 4 - 2,
          life: 1.0,
          color: '#FF6B35'
        });
      } else if (biomeId === 'TUNDRA') {
        this.particles.push({
          x: this.width + 10,
          y: Math.random() * this.height,
          vx: -(Math.random() * 2 + speed),
          vy: Math.random() * 2,
          life: 1.0,
          color: '#FFFFFF'
        });
      } else if (biomeId === 'FINAL RUN') {
      	this.particles.push({
          x: Math.random() * this.width,
          y: -10,
          vx: (Math.random() - 0.5) * 2 - (speed * 0.5),
          vy: Math.random() * 6 + 4,
          life: 1.0,
          color: '#FF0000',
          size: Math.random() * 5 + 2
        });
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx * (deltaTime / 16.6);
      p.y += p.vy * (deltaTime / 16.6);
      p.life -= 0.01 * (deltaTime / 16.6);
      
      if (p.life <= 0 || p.x < -50 || p.y < -50 || p.y > this.height + 50) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    this.particles.forEach(p => {
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      const size = p.size || 3;
      this.ctx.fillRect(p.x, p.y, size, size);
    });
    this.ctx.globalAlpha = 1.0; 
  }
}
