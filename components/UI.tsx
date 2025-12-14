import React, { useEffect, useState, useRef } from 'react';

interface UIProps {
  onTriggerNext: () => void;
  phrase: string;
  showPhrase: boolean;
  onToggleFullscreen: () => void;
  isInteracting: boolean;
  unlockedCount: number;
  totalPhrases: number;
  isMusicPlaying: boolean;
  toggleMusic: () => void;
  onUploadMusic: (file: File) => void;
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
  toggleMusic,
  onUploadMusic
}) => {
  const [opacity, setOpacity] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showPhrase) {
      setOpacity(1);
    } else {
      setOpacity(0);
    }
  }, [showPhrase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadMusic(e.target.files[0]);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10 p-8 md:p-12 overflow-hidden selection:bg-purple-500/30">
      
      {/* Header / Top Controls */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="flex flex-col animate-fade-in opacity-80 hover:opacity-100 transition-opacity duration-500">
          <h1 className="text-white/90 text-[10px] md:text-xs tracking-[0.4em] uppercase font-display border-l-2 border-purple-500/50 pl-3 py-1">
            Boxhao's Galaxy
          </h1>
          <p className="text-white/40 text-[9px] md:text-[10px] font-serif italic mt-1 pl-3 tracking-widest">
            Est. 2024
          </p>
        </div>
        
        <div className="flex gap-4">
           {/* Hidden File Input */}
           <input 
             type="file" 
             ref={fileInputRef} 
             hidden 
             accept="audio/*" 
             onChange={handleFileChange}
           />

          {/* Upload Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="group relative px-4 py-2 overflow-hidden rounded-sm transition-all duration-500 bg-white/5 hover:bg-white/10"
            title="Want the original song? Click to upload MP3"
          >
             <div className="absolute inset-0 border border-white/10 group-hover:border-white/30 transition-colors duration-500" />
             <span className="relative z-10 text-white/40 group-hover:text-white/90 text-[9px] uppercase tracking-[0.2em] font-display flex items-center gap-2">
                <span>♫</span> Upload MP3
             </span>
          </button>

          {/* Music Button */}
          <button 
            onClick={toggleMusic}
            className="group relative px-4 py-2 overflow-hidden rounded-sm transition-all duration-500"
          >
            <div className="absolute inset-0 border border-white/10 group-hover:border-white/30 transition-colors duration-500" />
            <span className={`relative z-10 text-[9px] uppercase tracking-[0.3em] font-display transition-colors duration-300 ${isMusicPlaying ? 'text-white/90' : 'text-white/40 group-hover:text-white/70'}`}>
              {isMusicPlaying ? "Music: On" : "Music: Off"}
            </span>
            {/* Tiny indicator dot */}
            {isMusicPlaying && (
               <span className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_4px_rgba(74,222,128,0.8)]"></span>
            )}
          </button>

          {/* Fullscreen Button */}
          <button 
            onClick={onToggleFullscreen}
            className="group relative px-4 py-2 overflow-hidden rounded-sm transition-all duration-500"
          >
            {/* Subtle Border */}
            <div className="absolute inset-0 border border-white/10 group-hover:border-white/30 transition-colors duration-500" />
            <span className="relative z-10 text-white/40 group-hover:text-white/90 text-[9px] uppercase tracking-[0.3em] font-display transition-colors duration-300">
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
        <div className="mb-6 flex justify-center opacity-50">
           <span className="text-white/60 text-xs tracking-[0.5em] uppercase font-display">Message</span>
        </div>

        {/* Main Text */}
        <p className="font-serif italic text-lg md:text-2xl lg:text-3xl text-white/90 leading-[1.8] tracking-wider drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
          "{phrase}"
        </p>
        
        {/* Bottom Decoration */}
        <div className="mt-8 flex items-center justify-center gap-4 opacity-40">
           <div className="w-12 md:w-20 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
           <div className="w-1.5 h-1.5 bg-white rotate-45 shadow-[0_0_10px_white]" />
           <div className="w-12 md:w-20 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
        </div>
      </div>

      {/* Bottom Controls Area */}
      <div className="flex flex-col items-center gap-8 mb-4 pointer-events-auto z-20">
        
        {/* The "High-End" Button */}
        <button
          onClick={onTriggerNext}
          disabled={isInteracting}
          className={`
            group relative px-16 py-5 md:px-24 md:py-6 
            transition-all duration-700 ease-out
            ${isInteracting ? 'cursor-not-allowed opacity-50 grayscale' : 'cursor-pointer'}
          `}
        >
          {/* 1. Glass Background */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] rounded-full transition-all duration-500 group-hover:bg-white/[0.03]" />
          
          {/* 2. Thin Border Ring (Base) */}
          <div className="absolute inset-0 rounded-full border border-white/10 transition-all duration-500 group-hover:border-white/20 group-hover:scale-[1.02]" />
          
          {/* 3. Cinematic Glow Line (Top & Bottom) - Expands on Hover */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:w-2/3 group-hover:via-white/80 transition-all duration-700 ease-in-out" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:w-2/3 group-hover:via-white/80 transition-all duration-700 ease-in-out" />

          {/* 4. Ambient Glow underneath (Purple/Pink hint) */}
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-gradient-to-b from-transparent via-transparent to-purple-500/10 transition-opacity duration-700 blur-md" />

          {/* Content Wrapper */}
          <span className="relative z-10 flex items-center justify-center gap-6">
            
            {/* Left Star: Subtle & Elegant */}
            <span className={`text-[8px] md:text-[10px] text-purple-200/70 transition-all duration-1000 transform ${isInteracting ? 'animate-spin' : 'group-hover:rotate-180 group-hover:text-white group-hover:scale-110'}`}>
              ✦
            </span>
            
            {/* Text: Ultra Wide Spacing, Serif Display */}
            <span className={`
              font-display text-sm md:text-base tracking-[0.4em] text-white/80 
              group-hover:text-white transition-all duration-500
              ${isInteracting ? 'animate-pulse opacity-70' : 'group-hover:tracking-[0.5em]'}
            `}>
              {isInteracting ? "WISHING..." : "CLICK"}
            </span>
            
            {/* Right Star */}
            <span className={`text-[8px] md:text-[10px] text-purple-200/70 transition-all duration-1000 transform ${isInteracting ? 'animate-spin' : 'group-hover:-rotate-180 group-hover:text-white group-hover:scale-110'}`}>
              ✦
            </span>

          </span>
        </button>

        {/* Minimalist Hint Text */}
        <div className={`
            text-white/20 text-[9px] uppercase tracking-[0.3em] font-sans
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
         <span className="text-white/80 font-display text-xl tracking-widest">
            {String(unlockedCount).padStart(2, '0')}
         </span>
         <div className="w-full h-[1px] bg-white/20" />
         <span className="text-white/30 font-display text-xs tracking-widest">
            {String(totalPhrases).padStart(2, '0')}
         </span>
      </div>
    </div>
  );
};

export default UI;