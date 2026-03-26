import React, { useState, useEffect } from 'react';
import IntroStory from '../IntroStory/IntroStory.jsx';
import GameCanvas from '../GameCanvas/GameCanvas.jsx';
import { geminiClient } from '../../services/geminiClient';

const LandscapePrompt = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!isPortrait) return null;
  return (
    <div className="fixed inset-0 z-[999] bg-black flex flex-col justify-center items-center text-white text-center p-8 font-pixel">
      <div className="rotate-90 text-6xl mb-6">
        📱
      </div>
      <h2 className="text-2xl mb-4 text-biome-final-fg">ROTATE DEVICE</h2>
      <p className="text-xs leading-6 text-gray-400">Dino's Last Run requires Landscape mode to sprint and enjoy the scenery!</p>
    </div>
  );
};

const MainMenu = ({ onStart, personality, setPersonality }) => (
  <div className="text-white flex flex-col items-center gap-4 w-full h-full bg-cover bg-center justify-center absolute inset-0" style={{
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/main_bg.webp')`
  }}>
    <h1 className="md:text-7xl text-2xl text-orange-500 pb-2 text-center">DINO'S</h1>
    <h1 className="md:text-7xl text-2xl text-white pb-2 text-center">LAST RUN</h1>
    <h5 className="text-md mt-8 text-white font-bold">Choose Dino's personality:</h5><br />
    <div className="flex flex-wrap justify-center gap-4 md:text-xs -mt-8 text-[10px] font-pixel">
      <button onClick={() => setPersonality('PHILOSOPHIC REX')} className={personality === 'PHILOSOPHIC REX' ? 'text-yellow-400 underline' : 'text-gray-400 hover:text-white'}>PHILOSOPHIC</button>
      <button onClick={() => setPersonality('CHATTY REX')} className={personality === 'CHATTY REX' ? 'text-yellow-400 underline' : 'text-gray-400 hover:text-white'}>CHATTY</button>
      <button onClick={() => setPersonality('EXISTENTIAL')} className={personality === 'EXISTENTIAL' ? 'text-yellow-400 underline' : 'text-gray-400 hover:text-white'}>EXISTENTIAL</button>
    </div>

    <div className="flex flex-wrap justify-center gap-6 mt-6 font-pixel">
      <button onClick={onStart} className="px-8 py-4 bg-white text-black hover:bg-biome-final-fg hover:text-white transition-colors text-sm md:text-lg">START</button>
    </div>
  </div>
);

const DeathScreen = ({ stats, onRestart }) => {
  const [eulogy, setEulogy] = useState('Rex is compiling his final thoughts...');

  useEffect(() => {
    geminiClient.getEulogy(stats).then(setEulogy).catch(() => setEulogy("I ran..."));
  }, [stats]);

  return (
    <div className="text-white flex flex-col items-center justify-center gap-6 w-full h-full bg-cover bg-center p-8 shadow-2xl relative z-20 absolute inset-0" style={{ backgroundImage: "url('/images/main_bg.webp')" }}>
      <div className="absolute inset-0 bg-black/60 z-[-1]" />
      <h2 className="md:text-5xl text-4xl text-biome-final-fg font-pixel animate-pulse">EXTINCT</h2>

      <div className="w-full flex justify-center gap-8 font-pixel md:text-sm text-xs text-red-500">
        <p>SCORE: {stats.score}</p>
        <p>BIOME: {stats.biome}</p>
        <p>TIME: {stats.seconds}s</p>
      </div>

      <p className="md:text-sm text-xs font-pixel leading-6 md:leading-8 text-white text-center mt-2 h-auto max-h-[120px] overflow-hidden max-w-[800px] px-4">"{eulogy}"</p>

      <div className="flex gap-8 mt-6 font-pixel text-yellow-400">
        <button onClick={onRestart} className="hover:text-biome-final-fg md:text-2xl text-xl transition-colors animate-pulse">RUN AGAIN</button>
      </div>
    </div>
  );
};

export default function Main() {
  const [gameState, setGameState] = useState('menu');
  const [lastStats, setLastStats] = useState(null);
  const [personality, setPersonality] = useState('PHILOSOPHIC REX');

  const handleDeath = (score, biome) => {
    setLastStats({ score, biome, nearMisses: 0, obstacleType: 'Unknown', seconds: Math.floor(score / 6) * 10, highScore: 0 });
    setGameState('dead');
  };

  return (
    <div className="w-full h-[100dvh] flex justify-center items-center bg-gray-900 overflow-hidden font-pixel">
      <LandscapePrompt />

      {/* Dynamic responsive internal game container maximizing screen usage */}
      <div className="w-full h-full flex shadow-2xl relative bg-black overflow-hidden">
        {gameState === 'menu' && <MainMenu personality={personality} setPersonality={setPersonality} onStart={() => setGameState('intro')} />}
        {gameState === 'intro' && <IntroStory onComplete={() => setGameState('play')} />}
        {gameState === 'play' && <GameCanvas personality={personality} onDeath={handleDeath} />}
        {gameState === 'dead' && <DeathScreen stats={lastStats} onRestart={() => setGameState('play')} />}
      </div>
    </div>
  );
}
