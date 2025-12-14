import React, { useEffect, useState } from 'react';

interface UIProps {
  onTriggerNext: () => void;
  phrase: string;
  showPhrase: boolean;
  onToggleFullscreen: () => void;
  isInteracting: boolean;
  unlockedCount: number;
  totalPhrases: number;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  audioStatus: 'init' | 'loading' | 'success' | 'error';
}

const UI: React.FC<UIProps> = ({ 
  onTriggerNext, 
  phrase, 
  showPhrase, 
  onToggleFullscreen,
  isInteracting,
  unlockedCount,
  totalPhrases,
  isMusicPlaying,
  onToggleMusic,
  audioStatus,
}) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (showPhrase) {
      setOpacity(1);
    } else {
      setOpacity(0);
    }
  }, [showPhrase]);

  // Helper to render music button state
  const renderMusicButton = () => {
    if (audioStatus === 'loading' || audioStatus === 'init') {
      return (
        <div className="px-4 py-2 border border-white/10 rounded-sm">
          <span className="text-white/40 text-[9px] uppercase tracking-[0.3em] font-display animate-pulse">
            Loading...
          </span>
        </div>
      );
    }

    if (audioStatus === 'error') {
      return (
         <div className="px-4 py-2 border border-white/5 rounded-sm opacity-50">
          <span className="text-white/30 text-[9px] uppercase tracking-[0.3em] font-display">
            Silent Mode
          </span>
        </div>
      );
    }

    // Success state
    return (
      <button 
        onClick={onToggleMusic}
        className="group relative px-4 py-2 overflow-hidden rounded-sm transition-all duration-500"
      >
        <div className={`absolute inset-0 border border-white/10 group-hover:border-pink-300/30 transition-colors duration-500 ${isMusicPlaying ? 'bg-pink-500/10' : 'bg-transparent'}`} />
        
        {/* Animated indicator for playing state */}
        {isMusicPlaying && (
             <div className="absolute right-2 bottom-2 w-1 h-1 bg-pink-400 rounded-full animate-ping" />
        )}

        <span className={`relative z-10 text-[9px] uppercase tracking-[0.3em] font-display transition-all duration-300 ${isMusicPlaying ? 'text-pink-200 shadow-[0_0_10px_pink]' : 'text-white/60 group-hover:text-pink-100'}`}>
          {isMusicPlaying ? 'MUSIC: ON' : 'PLAY MUSIC'}
        </span>
      </button>
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10 p-8 md:p-12 overflow-hidden selection:bg-purple-500/30">
      
      {/* ATMOSPHERIC OVERLAY - Adds a subtle dreamy tint to the corners */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-purple-900/20 z-[-1] pointer-events-none" />

      {/* Header / Top Controls */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="flex flex-col animate-fade-in opacity-80 hover:opacity-100 transition-opacity duration-500">
          <h1 className="text-white/90 text-[10px] md:text-xs tracking-[0.4em] uppercase font-display border-l-2 border-pink-400/50 pl-3 py-1 drop-shadow-[0_0_8px_rgba(255,192,203,0.3)]">
            Boxhao's Galaxy
          </h1>
          <p className="text-purple-200/60 text-[9px] md:text-[10px] font-serif italic mt-1 pl-3 tracking-widest">
            Est. 2024
          </p>
        </div>
        
        <div className="flex flex-wrap justify-end gap-3 md:gap-4">
           {/* Music Status / Toggle */}
           {renderMusicButton()}

          {/* Fullscreen Button */}
          <button 
            onClick={onToggleFullscreen}
            className="group relative px-4 py-2 overflow-hidden rounded-sm transition-all duration-500"
          >
            {/* Subtle Border */}
            <div className="absolute inset-0 border border-white/10 group-hover:border-pink-300/30 transition-colors duration-500" />
            <span className="relative z-10 text-white/40 group-hover:text-pink-100 group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] text-[9px] uppercase tracking-[0.3em] font-display transition-all duration-300">
              Fullscreen
            </span>
          </button>
        </div>
      </div>

      {/* Center Phrase Display - Typography Update */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl text-center transition-all duration-1000 ease-out px-6 pointer-events-none z-0"
        style={{ 
          opacity, 
          transform: `translate(-50%, -50%) scale(${showPhrase ? 1 : 0.98}) blur(${showPhrase ? 0 : '8px'})` 
        }}
      >
        {/* Top Decoration */}
        <div className="mb-6 flex justify-center opacity-60">
           <span className="text-pink-200/80 text-xs tracking-[0.5em] uppercase font-display drop-shadow-lg">Message</span>
        </div>

        {/* Main Text */}
        <p className="font-serif italic text-lg md:text-2xl lg:text-3xl text-white leading-[1.8] tracking-wider drop-shadow-[0_0_15px_rgba(255,100,200,0.4)]">
          "{phrase}"
        </p>
        
        {/* Bottom Decoration */}
        <div className="mt-8 flex items-center justify-center gap-4 opacity-50">
           <div className="w-12 md:w-20 h-[1px] bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
           <div className="w-1.5 h-1.5 bg-pink-200 rotate-45 shadow-[0_0_10px_#ffb6c1]" />
           <div className="w-12 md:w-20 h-[1px] bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
        </div>
      </div>

      {/* Bottom Controls Area */}
      <div className="flex flex-col items-center gap-8 mb-4 pointer-events-auto z-20">
        
        {/* The "High-End" Button - Dreamy Version */}
        <button
          onClick={onTriggerNext}
          disabled={isInteracting}
          className={`
            group relative px-16 py-5 md:px-24 md:py-6 
            transition-all duration-1000 ease-out
            ${isInteracting ? 'cursor-not-allowed opacity-50 grayscale' : 'cursor-pointer hover:scale-[1.02]'}
          `}
        >
          {/* 1. Glass Background with Pink Tint */}
          <div className="absolute inset-0 bg-purple-900/20 backdrop-blur-[3px] rounded-full transition-all duration-500 group-hover:bg-pink-500/10" />
          
          {/* 2. Thin Border Ring (Base) */}
          <div className="absolute inset-0 rounded-full border border-pink-200/10 transition-all duration-500 group-hover:border-pink-300/30" />
          
          {/* 3. Cinematic Glow Line (Top & Bottom) - Expands on Hover */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[1px] bg-gradient-to-r from-transparent via-pink-300/40 to-transparent group-hover:w-3/4 group-hover:via-pink-300/80 transition-all duration-700 ease-in-out" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-[1px] bg-gradient-to-r from-transparent via-pink-300/40 to-transparent group-hover:w-3/4 group-hover:via-pink-300/80 transition-all duration-700 ease-in-out" />

          {/* 4. Ambient Glow underneath (Purple/Pink hint) */}
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-gradient-to-b from-transparent via-transparent to-pink-500/20 transition-opacity duration-1000 blur-xl" />

          {/* Content Wrapper */}
          <span className="relative z-10 flex items-center justify-center gap-6">
            
            {/* Left Star: Subtle & Elegant */}
            <span className={`text-[8px] md:text-[10px] text-pink-200/70 transition-all duration-1000 transform ${isInteracting ? 'animate-spin' : 'group-hover:rotate-180 group-hover:text-white group-hover:scale-125'}`}>
              ✦
            </span>
            
            {/* Text: Ultra Wide Spacing, Serif Display */}
            <span className={`
              font-display text-sm md:text-base tracking-[0.4em] text-pink-100/90 
              group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-500
              ${isInteracting ? 'animate-pulse opacity-70' : 'group-hover:tracking-[0.5em]'}
            `}>
              {isInteracting ? "DREAMING..." : "MAKE A WISH"}
            </span>
            
            {/* Right Star */}
            <span className={`text-[8px] md:text-[10px] text-pink-200/70 transition-all duration-1000 transform ${isInteracting ? 'animate-spin' : 'group-hover:-rotate-180 group-hover:text-white group-hover:scale-125'}`}>
              ✦
            </span>

          </span>
        </button>

        {/* Minimalist Hint Text */}
        <div className={`
            text-pink-100/30 text-[9px] uppercase tracking-[0.3em] font-sans
            transition-all duration-1000
            ${showPhrase ? 'opacity-0 translate-y-2' : 'opacity-100'}
        `}>
           Touch the Stars
        </div>

      </div>

      {/* Progress Counter - Architectural Style */}
      <div 
        className={`absolute bottom-10 right-10 flex flex-col items-end gap-1 pointer-events-none transition-opacity duration-1000 ${unlockedCount > 0 ? 'opacity-60' : 'opacity-0'}`}
      >
         <span className="text-pink-100/80 font-display text-xl tracking-widest drop-shadow-[0_0_5px_rgba(255,192,203,0.3)]">
            {String(unlockedCount).padStart(2, '0')}
         </span>
         <div className="w-full h-[1px] bg-pink-200/20" />
         <span className="text-pink-100/30 font-display text-xs tracking-widest">
            {String(totalPhrases).padStart(2, '0')}
         </span>
      </div>
    </div>
  );
};

export default UI;