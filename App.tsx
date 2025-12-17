import React, { useState, useRef, useEffect } from 'react';
import Scene from './components/Scene';
import UI from './components/UI';
import { ShapeType } from './types';
import { PHRASES } from './constants';

const PHRASE_SEQUENCE = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const CACHE_BUSTER = new Date().getTime(); 

// --- 音乐配置区域 ---
// 系统会自动按顺序尝试播放。
// 如果你想用自己的音乐，请将文件命名为 "bgm.mp3" 并放入项目的 public 文件夹中。
const AUDIO_SOURCES = [
  // 1. 【优先】本地自定义文件
  // 操作：将你的mp3文件重命名为 bgm.mp3，放入 public 文件夹(或根目录)
  "bgm.mp3", 

  // 2. 【备选】Beautiful Memories (如果本地没有bgm.mp3，会自动播放这首)
  "https://cdn.pixabay.com/audio/2021/11/25/audio_402636657c.mp3",
  
  // 3. 【备选】Rebirth
  "https://cdn.pixabay.com/audio/2020/05/01/audio_16a3f12015.mp3",
  
  // 4. Fallback
  "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" 
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

  // Handle errors (e.g., if local bgm.mp3 is missing, switch to next url)
  const handleAudioError = () => {
    console.warn(`Audio source failed/missing: ${AUDIO_SOURCES[currentSourceIndex]}`);
    if (currentSourceIndex < AUDIO_SOURCES.length - 1) {
      setAudioStatus('loading');
      setCurrentSourceIndex(prev => prev + 1);
    } else {
      setAudioStatus('error');
    }
  };

  const handleCanPlay = () => {
    if (audioStatus !== 'success') {
      console.log(`Audio loaded successfully: ${AUDIO_SOURCES[currentSourceIndex]}`);
      setAudioStatus('success');
    }
  };

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

  const handleNextInteraction = () => {
    // Attempt auto-play on first interaction if not playing
    if (!isMusicPlaying && audioRef.current && audioStatus === 'success') {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsMusicPlaying(true))
          .catch((e) => console.log("Auto-play blocked by browser policy:", e.message));
      }
    }

    if (isInteracting) return;
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