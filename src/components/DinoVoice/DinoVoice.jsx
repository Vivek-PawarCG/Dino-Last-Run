import React, { useState, useEffect, useRef } from 'react';
import { geminiClient } from '../../services/geminiClient';

export default function DinoVoice({ biome, score, nearMiss, skillLevel }) {
  const [text, setText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef(biome);

  useEffect(() => {
    if (biome !== triggerRef.current || nearMiss) {
      triggerRef.current = biome;
      setIsVisible(true);
      setText('');

      geminiClient.streamVoiceLine(
        { biome, score: Math.floor(score), nearMiss: nearMiss || false, skillLevel },
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
