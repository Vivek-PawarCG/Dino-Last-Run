import { checkCollision } from '../game/CollisionDetector';

describe('CollisionDetector', () => {
  it('detects a simple AABB overlap properly', () => {
    const dino = { x: 50, y: 100, width: 44, height: 47 };
    const obstacle = { x: 60, y: 110, width: 20, height: 40 };
    expect(checkCollision(dino, obstacle)).toBe(true);
  });

  it('ignores objects that are safely separated', () => {
    const dino = { x: 50, y: 100, width: 44, height: 47 };
    const obstacle = { x: 200, y: 100, width: 20, height: 40 };
    expect(checkCollision(dino, obstacle)).toBe(false);
  });
  
  it('accounts for slight boundary tolerance (juice)', () => {
    // Exact edge touch shouldn't kill immediately depending on AABB threshold
    const dino = { x: 50, y: 100, width: 44, height: 47 };
    const obstacle = { x: 94, y: 100, width: 20, height: 40 };
    expect(checkCollision(dino, obstacle)).toBe(false); 
  });
});
