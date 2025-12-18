import React, { useState, useRef, useEffect } from 'react';
import Scene from './components/Scene';
import UI from './components/UI';
import { ShapeType } from './types';
import { PHRASES } from './constants';

const PHRASE_SEQUENCE = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const App: React.FC = () => {
  const [currentShape, setCurrentShape] = useState<ShapeType>(ShapeType.TEXT);
  const [isScatter, setIsScatter] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [showPhrase, setShowPhrase] = useState(false);
  
  const [isInteracting, setIsInteracting] = useState(false);
  const [unlockedCount, setUnlockedCount] = useState(0);

  const [giftStage, setGiftStage] = useState<'idle' | 'forming' | 'present' | 'shaking' | 'open'>('idle');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [audioStatus, setAudioStatus] = useState<'init' | 'loading' | 'success' | 'error'>('loading');
  
  const sequenceStepRef = useRef(0);

  // --- 音乐配置 ---
  // 这里的 "./bgm.mp3" 指向 public 文件夹下的文件
  // 放在第一位，确保国内访问最快
  const AUDIO_SOURCES = [
    "./bgm.mp3", 
    "https://cdn.pixabay.com/audio/2021/11/24/audio_8b5df8e56b.mp3"
  ];
  
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);

  const handleAudioError = () => {
    console.warn(`Audio source failed: ${AUDIO_SOURCES[currentSourceIndex]}`);
    if (currentSourceIndex < AUDIO_SOURCES.length - 1) {
      setAudioStatus('loading');
      setCurrentSourceIndex(prev => prev + 1);
    } else {
      setAudioStatus('error');
    }
  };

  const handleCanPlay = () => {
    if (audioStatus !== 'success') {
      console.log(`Audio ready: ${AUDIO_SOURCES[currentSourceIndex]}`);
      setAudioStatus('success');
      // Try auto-play
      if (audioRef.current && !isMusicPlaying) {
          audioRef.current.play()
            .then(() => setIsMusicPlaying(true))
            .catch(() => console.log("Autoplay waiting for interaction")); 
      }
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current || audioStatus !== 'success') return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsMusicPlaying(true))
        .catch(e => console.error("Manual play failed:", e));
    }
  };

  // Global unlock for iOS/Chrome
  useEffect(() => {
    const unlockAudio = () => {
        if (audioRef.current && !isMusicPlaying && audioStatus === 'success') {
            audioRef.current.play()
                .then(() => setIsMusicPlaying(true))
                .catch(() => {});
        }
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    return () => {
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
    };
  }, [audioStatus, isMusicPlaying]);

  const handleNextInteraction = () => {
    if (isInteracting) return;
    
    // Ensure music is playing
    if (!isMusicPlaying && audioRef.current && audioStatus === 'success') {
        audioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => {});
    }

    setIsInteracting(true);

    const sequence = [
      ShapeType.TEXT,
      ShapeType.SATURN,
      ShapeType.SNOWFLAKE,
      ShapeType.CAKE, 
      ShapeType.HEART,
      ShapeType.PUPPY 
    ];
    
    const nextCount = unlockedCount + 1;
    let nextShape: ShapeType;
    let nextPhrase = "";

    if (nextCount > PHRASES.length) {
        nextShape = ShapeType.GIFT_BOX;
        nextPhrase = "A Surprise for You...";
    } else {
        const currentIndex = sequence.indexOf(currentShape);
        const nextIndex = (currentIndex + 1) % sequence.length;
        nextShape = sequence[nextIndex];
        
        const currentStep = sequenceStepRef.current;
        const phraseIndex = PHRASE_SEQUENCE[currentStep % PHRASE_SEQUENCE.length];
        nextPhrase = PHRASES[phraseIndex];
    }

    setIsScatter(true);
    
    if (nextCount <= PHRASES.length) {
        sequenceStepRef.current += 1;
    }
    setUnlockedCount(nextCount);
    
    setPhrase(nextPhrase);
    setShowPhrase(true);

    setTimeout(() => {
      setCurrentShape(nextShape);
      
      if (nextShape === ShapeType.GIFT_BOX) {
          setGiftStage('forming');
      }

      setTimeout(() => {
        setIsScatter(false);
        setShowPhrase(false);
        setIsInteracting(false);

        if (nextShape === ShapeType.GIFT_BOX) {
            setGiftStage('present');
        }
      }, 3500); 
    }, 800);
  };

  const handleOpenGift = () => {
      setGiftStage('shaking');
      setTimeout(() => {
          setIsScatter(true);
          setGiftStage('open');
          setCurrentShape(ShapeType.SCROLL);
          setPhrase("Happy Birthday, My Love");
          setShowPhrase(true); 

          setTimeout(() => {
             setIsScatter(false);
          }, 1500);
      }, 3000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden select-none">
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

      <Scene 
        currentShape={currentShape} 
        isScatter={isScatter} 
        isShaking={giftStage === 'shaking'} 
      />
      
      <UI 
        onTriggerNext={handleNextInteraction} 
        phrase={phrase}
        showPhrase={showPhrase}
        onToggleFullscreen={toggleFullscreen}
        isInteracting={isInteracting}
        unlockedCount={Math.min(unlockedCount, PHRASES.length)} 
        totalPhrases={PHRASES.length}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={toggleMusic}
        audioStatus={audioStatus}
        giftStage={giftStage}
        onOpenGift={handleOpenGift}
      />
    </div>
  );
};

export default App;