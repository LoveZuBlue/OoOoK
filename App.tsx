import React, { useState, useCallback, useRef, useEffect } from 'react';
import Scene from './components/Scene';
import UI from './components/UI';
import { ShapeType } from './types';
import { PHRASES } from './constants';

// Playlist: "Ethereal & Dreamy" (Vibe: Angel 0.9x)
// Updated with more reliable CDNs (Mixkit) to prevent "No supported sources" errors.
const PLAYLIST = [
    // 1. "Dreaming Big" (Mixkit) - Very stable, dreamy piano & strings. 
    // Matches the "Angel" slow/emotional vibe perfectly.
    "https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3",
    
    // 2. "Beautiful" (Pixabay) - Warm acoustic/piano, stable backup.
    "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3",

    // 3. "Relaxing Light" (Pixabay) - Soft ambient.
    "https://cdn.pixabay.com/audio/2022/10/05/audio_6861212515.mp3"
];

const App: React.FC = () => {
  const [currentShape, setCurrentShape] = useState<ShapeType>(ShapeType.TEXT);
  const [isScatter, setIsScatter] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [showPhrase, setShowPhrase] = useState(false);
  
  const [isInteracting, setIsInteracting] = useState(false);
  const [unlockedCount, setUnlockedCount] = useState(0);
  
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  // State for music management
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [musicUrl, setMusicUrl] = useState(PLAYLIST[0]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const usedPhrasesRef = useRef<Set<number>>(new Set());

  // Initialize audio volume - Kept at 0.4 (40%) for comfort
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4; 
    }
  }, []);

  // Effect 1: Handle URL changes (Switching tracks)
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.load();
        if (isMusicPlaying) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    // Auto-play policy might block this if no user interaction yet.
                    // We silence this specific warning as it's expected behavior until user clicks.
                    if (e.name !== "NotAllowedError") {
                         console.warn("Autoplay prevented:", e);
                    }
                });
            }
        }
    }
  }, [musicUrl]);

  // Effect 2: Handle Play/Pause State (User Toggle)
  useEffect(() => {
     if (!audioRef.current) return;
     
     if (isMusicPlaying) {
         if (audioRef.current.paused) {
             const playPromise = audioRef.current.play();
             if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.error("Playback failed:", e);
                });
             }
         }
     } else {
         audioRef.current.pause();
     }
  }, [isMusicPlaying]);

  // Handle Successful Load
  const handleCanPlay = () => {
      // Audio loaded successfully, reset error counter
      setFailedAttempts(0);
  };

  // Handle Errors (Fallback Logic)
  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
      const error = audioRef.current?.error;
      console.warn(`Audio Error (Track ${currentTrackIndex}):`, error?.code, error?.message);

      // Prevent infinite loops if all tracks fail
      if (failedAttempts >= PLAYLIST.length) {
          console.error("All tracks failed. Disabling music.");
          setIsMusicPlaying(false);
          return;
      }

      setFailedAttempts(prev => prev + 1);

      // Try next track
      const nextIndex = (currentTrackIndex + 1) % PLAYLIST.length;
      setCurrentTrackIndex(nextIndex);
      setMusicUrl(PLAYLIST[nextIndex]);
  };

  const toggleMusic = useCallback(() => {
     setIsMusicPlaying(prev => !prev);
  }, []);

  const handleMusicUpload = useCallback((file: File) => {
    if (file) {
        const objectUrl = URL.createObjectURL(file);
        setMusicUrl(objectUrl);
        setFailedAttempts(0); 
        setIsMusicPlaying(true); 
    }
  }, []);

  const getRandomPhrase = useCallback(() => {
    let availableIndices = PHRASES.map((_, index) => index).filter(
      (index) => !usedPhrasesRef.current.has(index)
    );

    if (availableIndices.length === 0) {
      usedPhrasesRef.current.clear();
      availableIndices = PHRASES.map((_, index) => index);
    }

    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    usedPhrasesRef.current.add(randomIndex);
    return PHRASES[randomIndex];
  }, []);

  const handleNextInteraction = () => {
    if (isInteracting) return;
    setIsInteracting(true);
    
    // --- FORCE PLAY ON INTERACTION ---
    // User interaction enables audio playback (fixes Autoplay Policy)
    if (!isMusicPlaying) {
        setIsMusicPlaying(true);
    }

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
    const nextPhrase = getRandomPhrase();
    setPhrase(nextPhrase);
    setUnlockedCount(usedPhrasesRef.current.size);
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
      <audio 
        ref={audioRef} 
        loop 
        preload="metadata"
        src={musicUrl}
        onCanPlay={handleCanPlay}
        onError={handleAudioError}
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
        toggleMusic={toggleMusic}
        onUploadMusic={handleMusicUpload}
      />
    </div>
  );
};

export default App;