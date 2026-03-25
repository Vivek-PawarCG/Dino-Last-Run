import { useState, useCallback, useRef } from 'react';

const GRAVITY = 0.9;
const JUMP_VELOCITY = -18;
const MIN_JUMP_HEIGHT = -35;

export function usePhysics() {
  const [yPos, setYPos] = useState(0); // 0 is ground, negative is up
  const velocityRef = useRef(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isDucking, setIsDucking] = useState(false);

  const updatePhysics = useCallback(() => {
    setYPos(prevY => {
      let nextY = prevY;
      if (isJumping || prevY < 0) {
        velocityRef.current += GRAVITY;
        nextY = prevY + velocityRef.current;
        
        // Ground collision
        if (nextY >= 0) {
          nextY = 0;
          setIsJumping(false);
          velocityRef.current = 0;
        }
      }
      return nextY;
    });
  }, [isJumping]);

  const jump = useCallback(() => {
    if (!isJumping && yPos === 0) {
      setIsJumping(true);
      velocityRef.current = JUMP_VELOCITY;
      import('../game/AudioPlayer').then(({ playJump }) => playJump());
    }
  }, [isJumping, yPos]);

  const duck = useCallback((state) => {
    if (yPos === 0) {
      setIsDucking(state);
    } else if (state && isJumping) {
      // Fast drop if ducking mid-air
      velocityRef.current += GRAVITY * 4;
    }
  }, [yPos, isJumping]);

  return { yPos, isJumping, isDucking, jump, duck, updatePhysics };
}
