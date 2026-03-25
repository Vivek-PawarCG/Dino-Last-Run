export function checkCollision(rect1, rect2, padding = 4) {
  // AABB collision returning boolean
  // padding allows near misses to not trigger death instantly
  return (
    rect1.x < rect2.x + rect2.width - padding &&
    rect1.x + rect1.width > rect2.x + padding &&
    rect1.y < rect2.y + rect2.height - padding &&
    rect1.y + rect1.height > rect2.y + padding
  );
}

export function checkNearMiss(rect1, rect2, missRadius = 15) {
  // Checks if they are extremely close but not colliding
  const isColliding = checkCollision(rect1, rect2, 0); // 0 padding strict check
  if (isColliding) return false;
  
  return (
    rect1.x < rect2.x + rect2.width + missRadius &&
    rect1.x + rect1.width > rect2.x - missRadius &&
    rect1.y < rect2.y + rect2.height + missRadius &&
    rect1.y + rect1.height > rect2.y - missRadius
  );
}
