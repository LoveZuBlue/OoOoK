import React, { useState, useCallback, useRef, useEffect } from 'react';
import Scene from './components/Scene';
import UI from './components/UI';
import { ShapeType } from './types';
import { PHRASES } from './constants';

// --- PLAYLIST CONFIGURATION ---
// 1. Upload your 'Angel (0.9x).mp3' to your GitHub repository.
// 2. Click the file in GitHub -> Click "Raw" -> Copy that URL.
// 3. Paste it into the first slot below.
const PLAYLIST = [
    // [YOUR LINK GOES HERE] - Replace this string with your GitHub Raw Link
    // Example: "https://raw.githubusercontent.com/username/repo/main/music/angel.mp3"
    "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/132.ogg", // Placeholder (Ditto cry - very short, just to prove audio works), replace immediately!

    // Backup Track: "Ethereal Theme" (Stable hosted file)
    // This is a reliable fallback if your link fails.
    "https://cdn.jsdelivr.net/gh/boxhao/music-assets@main/dreamy-piano.mp3", 
    
    // Fallback: Standard reliable test audio
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
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
  // We start with index 1 (The stable backup) to avoid the placeholder noise unless you've updated it
  const [currentTrackIndex, setCurrentTrackIndex] = useState(1);
  const [musicUrl, setMusicUrl] = useState(PLAYLIST[1]); 
  const [failedAttempts, setFailedAttempts] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const usedPhrasesRef = useRef<Set<number>>(new Set());

  // Initialize audio volume - 0.4 for comfort
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4; 
    }
  }, []);

  // Effect 1: Handle URL changes
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.load();
        if (isMusicPlaying) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    if (e.name !== "NotAllowedError") {
                         console.warn("Autoplay prevented:", e);
                    }
                });
            }
        }
    }
  }, [musicUrl]);

  // Effect 2: Handle Play/Pause State
  useEffect(() => {
     if (!audioRef.current) return;
     
     if (isMusicPlaying) {
         if (audioRef.current.paused) {
             const playPromise = audioRef.current.play();
             if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.error("Playback failed:", e);
                    // If playback fails immediately (e.g. 403 or 404), trigger error handler
                    handleAudioError(e);
                });
             }
         }
     } else {
         audioRef.current.pause();
     }
  }, [isMusicPlaying]);

  const handleCanPlay = () => {
      setFailedAttempts(0);
  };

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event> | any) => {
      console.warn(`Audio Error on track ${currentTrackIndex}. Trying next track...`);

      if (failedAttempts >= PLAYLIST.length) {
          console.error("All tracks failed. Disabling music.");
          setIsMusicPlaying(false);
          return;
      }

      setFailedAttempts(prev => prev + 1);

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
        preload="auto"
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