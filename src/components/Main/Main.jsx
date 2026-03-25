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

const MainMenu = ({ onStart, onDiary, personality, setPersonality }) => (
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
      <button onClick={onDiary} className="px-8 py-4 border-2 border-white hover:text-biome-final-fg hover:border-biome-final-fg transition-colors text-sm md:text-lg">DINO'S DIARY</button>
    </div>
  </div>
);

const DeathScreen = ({ stats, onRestart, onDiary }) => {
  const [eulogy, setEulogy] = useState('Rex is compiling his final thoughts...');

  useEffect(() => {
    geminiClient.getEulogy(stats).then(setEulogy).catch(() => setEulogy("I ran..."));
  }, [stats]);

  return (
    <div className="text-white flex flex-col items-center justify-center gap-6 w-full h-full bg-cover bg-center p-8 shadow-2xl relative z-20 absolute inset-0" style={{ backgroundImage: "url('/images/main_bg.webp')" }}>
      <div className="absolute inset-0 bg-black/60 z-[-1]" />
      <h2 className="md:text-5xl text-4xl text-biome-final-fg font-pixel animate-pulse">EXTINCT</h2>

      <div className="w-full flex justify-center gap-8 font-pixel md:text-sm text-xs text-gray-400">
        <p>SCORE: {stats.score}</p>
        <p>BIOME: {stats.biome}</p>
        <p>TIME: {stats.seconds}s</p>
      </div>

      <p className="md:text-sm text-xs font-pixel leading-6 md:leading-8 text-white text-center mt-2 h-auto max-h-[120px] overflow-hidden max-w-[800px] px-4">"{eulogy}"</p>

      <div className="flex gap-8 mt-6 font-pixel">
        <button onClick={onRestart} className="hover:text-biome-final-fg md:text-2xl text-xl transition-colors">RUN AGAIN</button>
        <button onClick={() => onDiary(stats)} className="text-gray-400 hover:text-white md:text-sm text-xs self-end transition-colors mb-1">Save to Diary</button>
      </div>
    </div>
  );
};

const DiaryScreen = ({ onBack }) => {
  const entries = JSON.parse(localStorage.getItem('dino_diary') || '[]');

  return (
    <div className="flex flex-col items-center gap-4 bg-[#f4e4bc] text-black w-full h-full p-8 overflow-y-auto font-pixel absolute inset-0">
      <h2 className="md:text-3xl text-2xl mb-4 text-amber-900 border-b-4 border-amber-900 pb-2">Survival Journal</h2>

      {entries.length === 0 ? (
        <p className="text-sm mt-8">No entries yet...</p>
      ) : (
        <div className="w-full max-w-[800px] flex-col flex gap-4">
          {entries.map((e, i) => (
            <div key={i} className="border-b-2 border-amber-900/20 pb-3">
              <p className="text-[10px] md:text-xs text-amber-800 mb-1">{e.date}</p>
              <p className="text-xs md:text-sm leading-5">"{e.text}"</p>
              <p className="text-[10px] md:text-xs text-gray-500 mt-2 font-bold">Score: {e.score} | Biome: {e.biome}</p>
            </div>
          ))}
        </div>
      )}

      <button onClick={onBack} className="mt-6 bg-black text-white px-8 py-4 hover:bg-amber-900 md:text-sm text-xs">Close</button>
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

  const handleAddToDiary = async (stats) => {
    setGameState('loading');
    try {
      const text = await geminiClient.getJournalEntry(stats);
      const entries = JSON.parse(localStorage.getItem('dino_diary') || '[]');
      entries.unshift({
        date: '65,000,032 BC - The End',
        text,
        score: stats.score,
        biome: stats.biome
      });
      if (entries.length > 20) entries.pop();
      localStorage.setItem('dino_diary', JSON.stringify(entries));
    } catch (e) { }
    setGameState('diary');
  };

  return (
    <div className="w-full h-[100dvh] flex justify-center items-center bg-gray-900 overflow-hidden font-pixel">
      <LandscapePrompt />

      {/* Dynamic responsive internal game container maximizing screen usage */}
      <div className="w-full h-full flex shadow-2xl relative bg-black overflow-hidden">
        {gameState === 'menu' && <MainMenu personality={personality} setPersonality={setPersonality} onStart={() => setGameState('intro')} onDiary={() => setGameState('diary')} />}
        {gameState === 'intro' && <IntroStory onComplete={() => setGameState('play')} />}
        {gameState === 'play' && <GameCanvas personality={personality} onDeath={handleDeath} />}
        {gameState === 'dead' && <DeathScreen stats={lastStats} onRestart={() => setGameState('play')} onDiary={handleAddToDiary} />}
        {gameState === 'diary' && <DiaryScreen onBack={() => setGameState('menu')} />}
        {gameState === 'loading' && <div className="absolute inset-0 bg-black flex justify-center items-center z-50 text-white md:text-2xl text-xl animate-pulse font-pixel">Rex is thinking...</div>}
      </div>
    </div>
  );
}
