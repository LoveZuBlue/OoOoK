
import React, { useState, useRef, useEffect } from 'react';
import Scene from './components/Scene';
import UI from './components/UI';
import { ShapeType } from './types';
import { PHRASES } from './constants';

const PHRASE_SEQUENCE = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const CACHE_BUSTER = new Date().getTime(); 

// --- 音乐配置区域 ---
const AUDIO_SOURCES = [
  // 1. 本地文件 (优先)
  "bgm.mp3", 

  // 2. 【主推】更加柔美、慵懒的钢琴曲 (Gentle & Romantic)
  // 节奏舒缓，氛围暧昧，适合深夜读信
  "https://cdn.pixabay.com/audio/2021/11/24/audio_8b5df8e56b.mp3", 

  // 3. 【备选】温暖治愈 (Warm Memory)
  "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",

  // 4. 【备选】静谧深夜 (Quiet Night)
  "https://cdn.pixabay.com/audio/2021/08/09/audio_0eb2660424.mp3",
  
  // 5. Fallback - 经典柔和
  "https://cdn.pixabay.com/audio/2020/09/14/audio_a16568b63e.mp3"
];

const App: React.FC = () => {
  const [currentShape, setCurrentShape] = useState<ShapeType>(ShapeType.TEXT);
  const [isScatter, setIsScatter] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [showPhrase, setShowPhrase] = useState(false);
  
  const [isInteracting, setIsInteracting] = useState(false);
  const [unlockedCount, setUnlockedCount] = useState(0);

  // Updated State: 'forming' indicates particles are gathering, 'present' is ready to click
  const [giftStage, setGiftStage] = useState<'idle' | 'forming' | 'present' | 'shaking' | 'open'>('idle');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [audioStatus, setAudioStatus] = useState<'init' | 'loading' | 'success' | 'error'>('loading');
  
  const sequenceStepRef = useRef(0);

  // --- Audio Logic ---

  // Handle errors (e.g., if source is missing, switch to next url)
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
      // Try to auto-play if ready and not playing (browser might block this, handled by click listener below)
      if (audioRef.current && !isMusicPlaying) {
          audioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => {}); 
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

  // Global listener to unlock audio on first interaction (fixes "I didn't hear it")
  useEffect(() => {
    const unlockAudio = () => {
        if (audioRef.current && !isMusicPlaying && audioStatus === 'success') {
            audioRef.current.play()
                .then(() => setIsMusicPlaying(true))
                .catch((e) => console.log("Autoplay blocked, waiting for next click", e));
        }
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
    };
  }, [audioStatus, isMusicPlaying]);


  // --- Interaction Logic ---

  const handleNextInteraction = () => {
    if (isInteracting) return;
    
    // Double check audio play on button click
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
    
    // Check if we are done with all phrases
    const nextCount = unlockedCount + 1;
    let nextShape: ShapeType;
    let nextPhrase = "";

    if (nextCount > PHRASES.length) {
        // Time for the Gift Box!
        nextShape = ShapeType.GIFT_BOX;
        nextPhrase = "A Surprise for You...";
    } else {
        // Standard Sequence
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
      
      // If we just switched to Gift Box, set stage to FORMING (Button disabled)
      if (nextShape === ShapeType.GIFT_BOX) {
          setGiftStage('forming');
      }

      setTimeout(() => {
        setIsScatter(false);
        // Hide phrase to let UI focus on the object/gift
        setShowPhrase(false);
        setIsInteracting(false);

        // Once scatter is done, if it's the gift, enable the button
        if (nextShape === ShapeType.GIFT_BOX) {
            setGiftStage('present');
        }
      }, 3500); 
    }, 800);
  };

  const handleOpenGift = () => {
      // 1. Start Shaking
      setGiftStage('shaking');
      
      // 2. Wait for shake animation (3 seconds for drama)
      setTimeout(() => {
          // 3. Explode into Scroll
          setIsScatter(true);
          setGiftStage('open');
          setCurrentShape(ShapeType.SCROLL);
          
          setPhrase("Happy Birthday, My Love");
          setShowPhrase(true); // Show final message

          setTimeout(() => {
             setIsScatter(false);
          }, 1500);
      }, 3000);
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
        key={currentSourceIndex} 
        src={AUDIO_SOURCES[currentSourceIndex]}
        loop 
        preload="auto"
        onError={handleAudioError}
        onCanPlay={handleCanPlay}
        crossOrigin="anonymous" 
        volume={0.5} // Slightly softer volume for the 'ambiguous' vibe
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
