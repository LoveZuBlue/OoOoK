import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import Particles from './Particles';
import { ShapeType } from '../types';

interface SceneProps {
  currentShape: ShapeType;
  isScatter: boolean;
}

const Scene: React.FC<SceneProps> = ({ currentShape, isScatter }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 22], fov: 50 }}
      dpr={[1, 2]} // Support high DPI screens for sharper particles
      className="w-full h-full block"
      gl={{ antialias: false, alpha: false, stencil: false, depth: false }} // Optimization for postprocessing
    >
      {/* 1. Deep Romantic Background Color (Midnight Purple) */}
      <color attach="background" args={['#0b0214']} />
      
      {/* 2. Dreamy Haze/Fog (Soft Pink/Purple fade) */}
      <fog attach="fog" args={['#18002b', 12, 45]} />
      
      {/* Ambient light is minimal, particles emit their own color */}
      <ambientLight intensity={0.2} />
      
      {/* 3. Background Stars - More abundant but subtle */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={0.5} />
      
      {/* 4. Fairy Dust / Magic Sparkles (Floating around the scene) */}
      <Sparkles 
        count={200} 
        scale={20} 
        size={3} 
        speed={0.3} 
        opacity={0.4} 
        color="#ffc4dd" // Light pink sparkles
      />

      {/* Main Particle System */}
      <Particles shape={currentShape} isScatter={isScatter} />
      
      {/* Post Processing for the "Ethereal" Glow */}
      <EffectComposer disableNormalPass>
        {/* Soft, wide bloom for the dreamy effect */}
        <Bloom 
          luminanceThreshold={0.15} 
          luminanceSmoothing={0.9} 
          intensity={1.2} 
          radius={0.8} 
          mipmapBlur 
        />
        {/* Vignette to darken edges and focus on the center (Cinematic look) */}
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
      </EffectComposer>

      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        enableRotate={true}
        zoomSpeed={0.3}
        rotateSpeed={0.3} // Slower rotation for elegance
        autoRotate={false} 
        autoRotateSpeed={0.5} 
        maxDistance={40}
        minDistance={10}
      />
    </Canvas>
  );
};

export default Scene;