import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
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
      className="w-full h-full block bg-[#050505]"
      gl={{ antialias: false, alpha: false, stencil: false, depth: false }} // Optimization for postprocessing
    >
      {/* Deep dark animated background feeling */}
      <color attach="background" args={['#020204']} />
      <fog attach="fog" args={['#020204', 15, 50]} />
      
      {/* Ambient light is minimal, particles emit their own color */}
      <ambientLight intensity={0.1} />
      
      {/* Background Stars - Subtle and distant */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      
      {/* Main Particle System */}
      <Particles shape={currentShape} isScatter={isScatter} />
      
      {/* Post Processing for the "Ethereal" Glow */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.2} // Only bright particles glow
          luminanceSmoothing={0.9} // Smooth transition
          intensity={1.5} // Strength of the glow
          radius={0.6} // Spread of the glow
          mipmapBlur // High quality blur
        />
      </EffectComposer>

      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        enableRotate={true}
        zoomSpeed={0.3}
        rotateSpeed={0.4}
        autoRotate={false} // Disable autoRotate to allow controlled presentation in Particles.tsx
        autoRotateSpeed={0.5} 
        maxDistance={40}
        minDistance={10}
      />
    </Canvas>
  );
};

export default Scene;