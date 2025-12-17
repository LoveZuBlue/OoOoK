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
  
  // Gift interaction props
  giftStage: 'idle' | 'forming' | 'present' | 'shaking' | 'open';
  onOpenGift: () => void;
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
  giftStage,
  onOpenGift
}) => {
  const [opacity, setOpacity] = useState(0);

  // Logic to force hide UI during Scroll stage (giftStage === 'open')
  const shouldHideUI = giftStage === 'open';

  useEffect(() => {
    if (showPhrase && !shouldHideUI) {
      setOpacity(1);
    } else {
      setOpacity(0);
    }
  }, [showPhrase, shouldHideUI]);

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

    return (
      <button 
        onClick={onToggleMusic}
        className="group relative px-4 py-2 overflow-hidden rounded-sm transition-all duration-500"
      >
        <div className={`absolute inset-0 border border-white/10 group-hover:border-pink-300/30 transition-colors duration-500 ${isMusicPlaying ? 'bg-pink-500/10' : 'bg-transparent'}`} />
        {isMusicPlaying && (
             <div className="absolute right-2 bottom-2 w-1 h-1 bg-pink-400 rounded-full animate-ping" />
        )}
        <span className={`relative z-10 text-[9px] uppercase tracking-[0.3em] font-display transition-all duration-300 ${isMusicPlaying ? 'text-pink-200 shadow-[0_0_10px_pink]' : 'text-white/60 group-hover:text-pink-100'}`}>
          {isMusicPlaying ? 'MUSIC: ON' : 'PLAY MUSIC'}
        </span>
      </button>
    );
  };

  // Button logic for Gift Sequence
  const isGiftSequence = giftStage === 'forming' || giftStage === 'present' || giftStage === 'shaking';
  const isGiftReady = giftStage === 'present';
  const isGiftShaking = giftStage === 'shaking';
  const remainingClicks = Math.max(0, totalPhrases - unlockedCount);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10 p-8 md:p-12 overflow-hidden selection:bg-purple-500/30">
      
      {/* ATMOSPHERIC OVERLAY */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-purple-900/20 z-[-1] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="flex flex-col animate-fade-in opacity-80 hover:opacity-100 transition-opacity duration-500">
          <h1 className="text-white/90 text-[10px] md:text-xs tracking-[0.4em] uppercase font-display border-l-2 border-pink-400/50 pl-3 py-1 drop-shadow-[0_0_8px_rgba(255,192,203,0.3)]">
            Boxhao's Galaxy
          </h1>
        </div>
        
        <div className="flex flex-wrap justify-end gap-3 md:gap-4">
           {renderMusicButton()}
          <button 
            onClick={onToggleFullscreen}
            className="group relative px-4 py-2 overflow-hidden rounded-sm transition-all duration-500"
          >
            <div className="absolute inset-0 border border-white/10 group-hover:border-pink-300/30 transition-colors duration-500" />
            <span className="relative z-10 text-white/40 group-hover:text-pink-100 group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] text-[9px] uppercase tracking-[0.3em] font-display transition-all duration-300">
              Fullscreen
            </span>
          </button>
        </div>
      </div>

      {/* --- PHRASE DISPLAY --- */}
      {!shouldHideUI && (
        <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl text-center transition-all duration-1000 ease-out px-4 pointer-events-none z-0"
            style={{ 
            opacity, 
            transform: `translate(-50%, -50%) scale(${showPhrase ? 1 : 0.98}) blur(${showPhrase ? 0 : '8px'})` 
            }}
        >
            {/* Glass Card Container */}
            <div className="relative p-10 md:p-16 rounded-2xl border border-white/5 bg-black/30 backdrop-blur-md shadow-2xl overflow-hidden">
                
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-pink-500/10 to-transparent opacity-50" />
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-purple-500/10 to-transparent opacity-50" />
                
                {/* Main Text */}
                <p className="whitespace-pre-line font-serif italic text-2xl md:text-4xl lg:text-5xl text-white leading-[1.6] md:leading-[1.5] tracking-wide drop-shadow-[0_2px_15px_rgba(255,100,200,0.5)]">
                "{phrase}"
                </p>
                
                {/* Signature / Decorative Line */}
                <div className="mt-10 flex items-center justify-center gap-4 opacity-50">
                <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                <div className="text-pink-200 font-display text-xs">♥</div>
                <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                </div>
            </div>
        </div>
      )}

      {/* --- BOTTOM CONTROLS --- */}
      <div className="flex flex-col items-center gap-6 mb-8 pointer-events-auto z-20">
        
        {/* GIFT BUTTON */}
        {isGiftSequence ? (
            <div className="relative flex items-center justify-center">
                 {/* 1. STATE: PREPARING (FORMING) */}
                 {!isGiftReady && (
                     <div className="flex flex-col items-center gap-3 transition-opacity duration-500 animate-fade-in">
                         <div className="w-12 h-12 rounded-full border border-white/10 border-t-pink-300 animate-spin" />
                     </div>
                 )}

                 {/* 2. STATE: READY / SHAKING */}
                 {isGiftReady && (
                    <button
                        onClick={onOpenGift}
                        className={`group relative transition-all duration-1000 ${isGiftShaking ? 'scale-95' : 'hover:scale-105'} cursor-pointer`}
                    >
                         {/* Multi-layer Aura Glow */}
                         <div className="absolute inset-0 bg-pink-400 blur-[40px] opacity-30 animate-pulse-slow rounded-full" />
                         <div className="absolute inset-0 bg-purple-500 blur-[20px] opacity-20 animate-pulse-fast rounded-full" />
                         
                         {/* Crystal Button - REDUCED SIZE */}
                         <div className={`
                             relative px-12 py-4 rounded-full 
                             bg-white/10 backdrop-blur-md 
                             border border-white/50 
                             shadow-[0_0_20px_rgba(255,255,255,0.4),inset_0_0_15px_rgba(255,255,255,0.2)]
                             group-hover:bg-white/20 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.6)]
                             transition-all duration-500 overflow-hidden
                         `}>
                             {/* Moving Sheen */}
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -skew-x-12 translate-x-[-150%] group-hover:animate-shimmer" />

                             {/* Text - Smaller font size */}
                             <span className={`font-serif italic text-lg tracking-[0.25em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex items-center gap-4
                                ${isGiftShaking ? 'animate-shake' : ''}
                             `}>
                                <span className="text-xs opacity-90 group-hover:rotate-180 transition-transform duration-700">✦</span>
                                OPEN
                                <span className="text-xs opacity-90 group-hover:-rotate-180 transition-transform duration-700">✦</span>
                             </span>
                         </div>
                    </button>
                 )}
            </div>
        ) : (
            // STANDARD BUTTON
            (giftStage === 'idle' && !shouldHideUI) && (
                <div className="flex flex-col items-center gap-5">
                    <button
                    onClick={onTriggerNext}
                    disabled={isInteracting}
                    className={`
                        group relative px-20 py-6
                        transition-all duration-700 ease-out
                        ${isInteracting ? 'cursor-not-allowed opacity-40 grayscale' : 'cursor-pointer hover:scale-[1.02]'}
                    `}
                    >
                        {/* High-end Frosted Glass Background */}
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-full border border-white/10 transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/30" />
                        
                        {/* Inner Gradient Border */}
                        <div className="absolute inset-0 rounded-full opacity-30 bg-gradient-to-r from-transparent via-pink-300/20 to-transparent group-hover:opacity-60 transition-opacity duration-500" />

                        {/* Content */}
                        <span className="relative z-10 flex items-center justify-center gap-6">
                             {/* Only show stars when active */}
                            {!isInteracting && <span className="text-[10px] text-pink-200/70 group-hover:rotate-180 transition-transform duration-700">✦</span>}
                            
                            <span className={`
                            font-display text-sm md:text-base tracking-[0.4em] 
                            transition-all duration-500
                            ${isInteracting ? 'text-white/30' : 'text-pink-50 group-hover:text-white group-hover:tracking-[0.5em] group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]'}
                            `}>
                            {isInteracting ? "DREAMING..." : "MAKE A WISH"}
                            </span>

                            {!isInteracting && <span className="text-[10px] text-pink-200/70 group-hover:-rotate-180 transition-transform duration-700">✦</span>}
                        </span>
                    </button>
                    
                    {/* --- GUIDE HINT (CHINESE) --- */}
                    <div className={`
                         text-pink-100/50 text-[10px] md:text-[11px] font-medium tracking-[0.15em] font-sans
                         transition-all duration-700
                         ${isInteracting ? 'opacity-0 translate-y-2' : 'opacity-100'}
                    `}>
                        {remainingClicks > 0 
                          ? `( 请点击${remainingClicks}次 )` 
                          : "( 宇宙深处传来回响 )"}
                    </div>
                </div>
            )
        )}
      </div>

      {/* Progress Counter - HIDE in Scroll mode */}
      {!shouldHideUI && (
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
      )}
    </div>
  );
};

export default UI;