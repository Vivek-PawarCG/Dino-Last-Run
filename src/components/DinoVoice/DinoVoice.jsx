import React, { useState, useEffect, useRef } from 'react';
import { geminiClient } from '../../services/geminiClient';

export default function DinoVoice({ biome, score, nearMiss, skillLevel }) {
  const [text, setText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef(biome);
  const lastVoiceScoreRef = useRef(0); // Track last voice trigger score
  const nearMissCountRef = useRef(0); // Track near miss count per game
  const gameStartRef = useRef(Date.now()); // Track when game started

  useEffect(() => {
    // Reset near miss counter when score goes back to 0 (new game)
    if (score === 0 && lastVoiceScoreRef.current > 0) {
      nearMissCountRef.current = 0;
      console.log('[DinoVoice] New game started, resetting near miss counter');
    }
    
    // Trigger voice on biome change or near miss (limited to 3 per game)
    const shouldTriggerBiomeChange = biome !== triggerRef.current;
    // Trigger voice every 500 points
    const shouldTriggerScoreMilestone = Math.floor(score / 500) > Math.floor(lastVoiceScoreRef.current / 500);
    // Trigger on near miss but limit to 3 per game
    const shouldTriggerNearMiss = nearMiss && nearMissCountRef.current < 3;
    
    if (shouldTriggerBiomeChange || shouldTriggerNearMiss || shouldTriggerScoreMilestone) {
      if (shouldTriggerNearMiss) {
        nearMissCountRef.current++;
        console.log(`[DinoVoice] Near miss triggered (${nearMissCountRef.current}/3)`);
      }
      
      triggerRef.current = biome;
      lastVoiceScoreRef.current = score;
      setIsVisible(true);
      setText('');

      geminiClient.streamVoiceLine(
        { biome, score: Math.floor(score), nearMiss: shouldTriggerNearMiss || false, skillLevel },
        (chunk) => {
          setText(prev => prev + chunk);
        },
        () => {
          setTimeout(() => setIsVisible(false), 4000);
        }
      );
    }
  }, [biome, nearMiss, score, skillLevel]);

  if (!isVisible && !text) return null;

  return (
    <div className={`absolute top-12 left-1/2 -translate-x-1/2 bg-black/80 border-2 border-white px-4 py-2 transition-opacity duration-300 z-50 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <p className="text-white font-pixel md:text-sm text-[10px] leading-5 max-w-[90vw] md:max-w-[500px] text-center break-words">REX: {text}</p>
    </div>
  );
}
