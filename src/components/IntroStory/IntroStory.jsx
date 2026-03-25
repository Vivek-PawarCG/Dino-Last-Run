import React, { useState, useEffect, useRef } from 'react';

const SLIDES = [
  {
    image: 'meteor_in_space.jpg',
    text: "66 million years ago, a shadow fell across the stars. The end was written in fire.",
    anim: 'scale-110 translate-x-2'
  },
  {
    image: 'herds_watching.jpg',
    text: "The sky burned purple. The herds stood frozen, watching their doom approach. They accepted their fate.",
    anim: 'scale-110 -translate-y-4'
  },
  {
    image: 'rex_running.jpg',
    text: "But one refused to accept extinction. Rex didn't look back. There was no time for goodbyes. It was time to RUN.",
    anim: 'scale-125 translate-x-4 animate-pulse'
  }
];

export default function IntroStory({ onComplete }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isFading, setIsFading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const isSpeechFinished = useRef(false);
  const isTextFinished = useRef(false);
  
  useEffect(() => {
    if (slideIndex >= SLIDES.length) {
      onComplete();
      return;
    }

    const currentText = SLIDES[slideIndex].text;
    setDisplayedText('');
    setIsAnimating(true);
    isSpeechFinished.current = false;
    isTextFinished.current = false;

    let transitionTriggered = false;
    const triggerNext = () => {
      if (transitionTriggered) return;
      transitionTriggered = true;
      setIsFading(true);
      setIsAnimating(false);
      setTimeout(() => {
        setSlideIndex(prev => prev + 1);
        setIsFading(false);
      }, 1000);
    };
    
    let hasSpeech = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentText);
      utterance.rate = 1.1; 
      utterance.pitch = 0.5; 
      utterance.onend = () => {
        isSpeechFinished.current = true;
        if (isTextFinished.current) triggerNext();
      };
      
      // Small delay to ensure voices load in some browsers
      setTimeout(() => window.speechSynthesis.speak(utterance), 100);
      hasSpeech = true;
    } else {
      isSpeechFinished.current = true; // Pretend it finished immediately
    }

    let charIndex = 0;
    const typeInterval = setInterval(() => {
      setDisplayedText(currentText.substring(0, charIndex + 1));
      charIndex++;
      if (charIndex === currentText.length) {
        clearInterval(typeInterval);
        isTextFinished.current = true;
        // Wait 2500ms max if speech fails or doesn't trigger onend
        setTimeout(() => {
           if (!isSpeechFinished.current || hasSpeech === false) {
             isSpeechFinished.current = true;
             triggerNext();
           } else if (isSpeechFinished.current) {
             triggerNext();
           }
        }, hasSpeech ? 5000 : 2500); 
      }
    }, 40); 

    return () => clearInterval(typeInterval);
  }, [slideIndex, onComplete]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (slideIndex >= SLIDES.length) return null;

  return (
    <div className={`absolute inset-0 w-full h-full bg-black flex flex-col justify-center items-center font-pixel transition-opacity duration-1000 z-10 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="w-full h-full bg-black flex justify-center items-center relative overflow-hidden">
        
        <div style={{ backgroundImage: `url(/images/${SLIDES[slideIndex].image})` }} 
             className={`absolute w-full h-full bg-contain bg-no-repeat bg-center transition-all duration-[4000ms] ease-linear
                         ${isAnimating ? SLIDES[slideIndex].anim : 'scale-100 translate-x-0 translate-y-0 opacity-50'}`} />
        
        <div className="absolute bottom-12 left-0 w-full text-center px-4 z-10">
          <p className="text-white text-xs md:text-sm bg-black/80 p-2 md:p-3 leading-5 md:leading-6 mx-auto inline-block border border-gray-700 max-w-[90%] md:max-w-[70%]">{displayedText}</p>
        </div>
      </div>
      <button 
        onClick={() => { window.speechSynthesis.cancel(); onComplete(); }} 
        className="absolute bottom-6 right-8 text-gray-500 hover:text-red-500 text-xs md:text-sm z-20 bg-black/50 px-3 py-1"
      >
        SKIP
      </button>
    </div>
  );
}
