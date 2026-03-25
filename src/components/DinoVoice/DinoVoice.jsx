import React, { useState, useEffect, useRef } from 'react';
import { geminiClient } from '../../services/geminiClient';

// Pre-generated fallback dialogues for REX when API limit is reached
const FALLBACK_DIALOGUES = {
  // Biome entry warnings
  BIOME_ENTRY: {
    JUNGLE: [
      "Watch your step, the jungle's alive with danger!",
      "Jungle ahead - vines, trees, and things that bite back!",
      "Entering the jungle... nature's not as friendly as it looks.",
      "Jungle biome incoming - stay sharp, stay alive!",
      "The jungle calls... and it's hungry for dino meat!"
    ],
    TUNDRA: [
      "Ice ahead! The cold bites harder than any predator.",
      "Tundra incoming - frost, spikes, and frozen death!",
      "Entering the frozen wastes... don't slip up now.",
      "Tundra biome - where the cold is the real killer!",
      "Ice spikes and snow drifts... this biome's a frozen nightmare!"
    ],
    VOLCANIC: [
      "Lava flows and ash clouds - volcanic hell approaches!",
      "Volcanic biome ahead - heat, rocks, and molten death!",
      "Entering the volcano... the ground itself wants you dead.",
      "Lava rocks and fire pits - this biome burns!",
      "Volcanic terrain incoming... feel the heat!"
    ],
    'FINAL RUN': [
      "The final stretch... asteroids and cosmic horror!",
      "Final run begins - space debris and alien threats!",
      "Entering the endgame... the universe itself opposes you!",
      "Final biome - asteroids, comets, and cosmic dread!",
      "The last run... where even space wants you extinct!"
    ]
  },

  // Score milestones (every 500 points)
  SCORE_MILESTONES: [
    "500 points? You're just getting started, kid.",
    "1000 points already? Impressive... for a mammal.",
    "1500? You're making me look bad out here.",
    "2000 points? Now you're just showing off.",
    "2500? I haven't run this far since the meteor hit.",
    "3000 points? You're either very good... or very lucky.",
    "3500? The old ones would be proud... or jealous.",
    "4000 points? You're rewriting the record books.",
    "4500? Even I didn't think you'd make it this far.",
    "5000+ points? You're not human... you're a dinosaur!"
  ],

  // Near miss responses (limited to 3 per game)
  NEAR_MISS: [
    "That was too close! Even for a T-Rex!",
    "Whoa! That almost ended badly... again.",
    "Close call! My heart's pounding... if I had one.",
    "Nearly bought it! You're testing my nerves here.",
    "That was way too close for comfort!",
    "Almost extinct... again! Watch yourself!",
    "Dangerous! One wrong move and it's game over.",
    "Too close! I felt that one in my bones."
  ],

  // API failure fallbacks
  API_FAILURE: [
    "My connection's spotty... but I'm still running!",
    "AI hive mind offline... but the instinct remains!",
    "Can't reach the network... but I can still roar!",
    "Connection lost... but the survival drive is strong!",
    "Offline mode activated... raw dino power only!"
  ]
};

// Get random dialogue from array
const getRandomDialogue = (array) => array[Math.floor(Math.random() * array.length)];

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
      // console.log('[DinoVoice] New game started, resetting near miss counter');
    }

    // Trigger voice on biome change or near miss (limited to 3 per game)
    const shouldTriggerBiomeChange = biome !== triggerRef.current;
    // Trigger voice every 500 points
    const shouldTriggerScoreMilestone = Math.floor(score / 500) > Math.floor(lastVoiceScoreRef.current / 500);
    // Trigger on near miss but limit to 3 per game
    const shouldTriggerNearMiss = nearMiss && nearMissCountRef.current < 3;

    if (shouldTriggerBiomeChange || shouldTriggerNearMiss || shouldTriggerScoreMilestone) {
      let dialogueText = '';
      let useFallback = false;

      if (shouldTriggerNearMiss) {
        nearMissCountRef.current++;
        dialogueText = getRandomDialogue(FALLBACK_DIALOGUES.NEAR_MISS);
        // console.log(`[DinoVoice] Near miss triggered (${nearMissCountRef.current}/3): ${dialogueText}`);
      } else if (shouldTriggerBiomeChange) {
        // Use biome entry warning
        dialogueText = getRandomDialogue(FALLBACK_DIALOGUES.BIOME_ENTRY[biome] || FALLBACK_DIALOGUES.API_FAILURE);
        // console.log(`[DinoVoice] Biome entry warning for ${biome}: ${dialogueText}`);
      } else if (shouldTriggerScoreMilestone) {
        // Use score milestone dialogue
        const milestoneIndex = Math.floor(score / 500) - 1; // 0-based index
        dialogueText = FALLBACK_DIALOGUES.SCORE_MILESTONES[milestoneIndex] ||
                      FALLBACK_DIALOGUES.SCORE_MILESTONES[FALLBACK_DIALOGUES.SCORE_MILESTONES.length - 1];
        // console.log(`[DinoVoice] Score milestone ${score}: ${dialogueText}`);
      }

      triggerRef.current = biome;
      lastVoiceScoreRef.current = score;
      setIsVisible(true);
      setText(dialogueText); // Start with fallback text

      // Try AI-generated dialogue, but keep fallback if it fails
      (async () => {
        try {
          let aiText = '';
          await geminiClient.streamVoiceLine(
            { biome, score: Math.floor(score), nearMiss: shouldTriggerNearMiss || false, skillLevel },
            (chunk) => {
              aiText += chunk;
              setText(aiText); // Replace fallback with AI text as it streams
            },
            () => {
              setTimeout(() => setIsVisible(false), 4000);
            }
          );
        } catch (error) {
          // console.log('[DinoVoice] AI dialogue failed, keeping fallback text');
          // Keep the fallback text and hide after timeout
          setTimeout(() => setIsVisible(false), 4000);
        }
      })();
    }
  }, [biome, nearMiss, score, skillLevel]);

  if (!isVisible && !text) return null;

  return (
    <div className={`absolute top-12 left-1/2 -translate-x-1/2 bg-black/80 border-2 border-white px-4 py-2 transition-opacity duration-300 z-50 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <p className="text-white font-pixel md:text-sm text-[10px] leading-5 max-w-[90vw] md:max-w-[500px] text-center break-words">REX: {text}</p>
    </div>
  );
}
