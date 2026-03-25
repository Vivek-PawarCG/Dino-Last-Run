import { useEffect, useRef, useState } from 'react';

export function useVoiceInput(jump, duck, pause) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;
    
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase();
      
      // Jump commands
      if (transcript.includes('jump') || transcript.includes('up') || transcript.includes('hop') || transcript.includes('leap')) {
        jump();
      } 
      // Duck commands
      else if (transcript.includes('duck') || transcript.includes('down') || transcript.includes('crouch') || transcript.includes('hide')) {
        duck(true);
        setTimeout(() => duck(false), 500);
      } 
      // Pause commands
      else if (transcript.includes('pause') || transcript.includes('stop') || transcript.includes('wait')) {
        if (pause) pause();
      }
      // Additional jump variations
      else if (transcript.includes('go up') || transcript.includes('higher') || transcript.includes('fly')) {
        jump();
      }
    };

    recognition.onend = () => {
      if (isListening) recognition.start(); // Keep alive
    };

    recognitionRef.current = recognition;

    if (isListening) recognition.start();
    
    return () => {
      recognition.stop();
    };
  }, [isListening, jump, duck, pause]);

  const toggleVoice = () => setIsListening(!isListening);

  return { isListening, toggleVoice };
}
