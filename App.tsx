import React, { useState, useRef, useEffect } from 'react';
import Scene from './components/Scene';
import UI from './components/UI';
import { ShapeType } from './types';
import { PHRASES } from './constants';

// Fixed sequence
const PHRASE_SEQUENCE = [2, 1, 0, 4, 6, 5, 7, 8, 3];

// --- AUDIO SOURCES CONFIGURATION ---
// PRODUCTION READY
// Added timestamp to force cache refresh in case of recent renames
const CACHE_BUSTER = new Date().getTime(); 

const AUDIO_SOURCES = [
  // 1. GitHack Development (Most reliable for immediate updates & MIME types)
  `https://raw.githack.com/LoveZuBlue/OoOoK/main/BGM.mp3?v=${CACHE_BUSTER}`,
  // 2. JsDelivr - Main Branch (Fast, but might have 5-10min cache delay)
  `https://cdn.jsdelivr.net/gh/LoveZuBlue/OoOoK@main/BGM.mp3?v=${CACHE_BUSTER}`,
  // 3. Raw GitHub (Fallback, depends on browser strictness)
  `https://raw.githubusercontent.com/LoveZuBlue/OoOoK/main/BGM.mp3?v=${CACHE_BUSTER}`,
  // 4. Guaranteed Safety Net (High quality ambient track from Pixabay)
  "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" 
];

const App: React.FC = () => {
  const [currentShape, setCurrentShape] = useState<ShapeType>(ShapeType.TEXT);
  const [isScatter, setIsScatter] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [showPhrase, setShowPhrase] = useState(false);
  
  const [isInteracting, setIsInteracting] = useState(false);
  const [unlockedCount, setUnlockedCount] = useState(0);
  
  // --- AUDIO LOGIC ---
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  // Status: 'init' -> 'loading' -> 'success' (ready to play) or 'error' (all failed)
  const [audioStatus, setAudioStatus] = useState<'init' | 'loading' | 'success' | 'error'>('loading');
  
  const sequenceStepRef = useRef(0);

  // Handle errors during streaming
  const handleAudioError = () => {
    console.warn(`Audio source failed: ${AUDIO_SOURCES[currentSourceIndex]}`);
    
    if (currentSourceIndex < AUDIO_SOURCES.length - 1) {
      console.log(`Switching to backup source ${currentSourceIndex + 1}...`);
      setAudioStatus('loading');
      setCurrentSourceIndex(prev => prev + 1);
    } else {
      console.error("All audio sources failed.");
      setAudioStatus('error');
    }
  };

  // Called when the browser has loaded enough data to begin playback
  const handleCanPlay = () => {
    if (audioStatus !== 'success') {
      console.log("Audio ready to play!");
      setAudioStatus('success');
    }
  };

  // Toggle Logic
  const toggleMusic = () => {
    if (!audioRef.current || audioStatus !== 'success') return;
    
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsMusicPlaying(true))
          .catch(e => {
            console.error("Manual play prevented:", e.message || "Unknown error");
            setIsMusicPlaying(false);
          });
      }
    }
  };

  // Interaction Handler
  const handleNextInteraction = () => {
    // Attempt Auto-Play on First Interaction
    // We check audioStatus here. If it's success, we play. 
    // If it's still loading, the browser won't play yet, but the user has "blessed" the page with a click.
    if (!isMusicPlaying && audioRef.current && audioStatus === 'success') {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsMusicPlaying(true))
          .catch((e) => console.log("Auto-play blocked:", e.message));
      }
    }

    if (isInteracting) return;
    setIsInteracting(true);

    const sequence = [
      ShapeType.TEXT,
      ShapeType.SATURN,
      ShapeType.SNOWFLAKE,
      ShapeType.CAKE, 
      ShapeType.HEART
    ];
    
    const currentIndex = sequence.indexOf(currentShape);
    const nextIndex = (currentIndex + 1) % sequence.length;
    const nextShape = sequence[nextIndex];

    setIsScatter(true);
    
    const currentStep = sequenceStepRef.current;
    const phraseIndex = PHRASE_SEQUENCE[currentStep % PHRASE_SEQUENCE.length];
    const nextPhrase = PHRASES[phraseIndex];
    
    setPhrase(nextPhrase);
    
    sequenceStepRef.current += 1;
    setUnlockedCount(Math.min(sequenceStepRef.current, PHRASES.length));
    
    setShowPhrase(true);

    setTimeout(() => {
      setCurrentShape(nextShape);
      setTimeout(() => {
        setIsScatter(false);
        setShowPhrase(false);
        setIsInteracting(false);
      }, 3500); 
    }, 800);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      {/* 
         Native HTML5 Audio Element 
         key={currentSourceIndex} forces React to tear down and recreate the tag when source changes,
         ensuring a fresh load attempt.
      */}
      <audio 
        ref={audioRef}
        key={currentSourceIndex} 
        src={AUDIO_SOURCES[currentSourceIndex]}
        loop 
        preload="auto"
        onError={handleAudioError}
        onCanPlay={handleCanPlay}
        crossOrigin="anonymous" 
      />

      <Scene currentShape={currentShape} isScatter={isScatter} />
      
      <UI 
        onTriggerNext={handleNextInteraction} 
        phrase={phrase}
        showPhrase={showPhrase}
        onToggleFullscreen={toggleFullscreen}
        isInteracting={isInteracting}
        unlockedCount={unlockedCount}
        totalPhrases={PHRASES.length}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={toggleMusic}
        audioStatus={audioStatus}
      />
    </div>
  );
};

export default App;