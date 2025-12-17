import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import Particles from './Particles';
import FloatingPetals from './FloatingPetals';
import SolidScroll from './SolidScroll';
import { ShapeType } from '../types';

interface SceneProps {
  currentShape: ShapeType;
  isScatter: boolean;
  isShaking?: boolean;
}

const Scene: React.FC<SceneProps> = ({ currentShape, isScatter, isShaking }) => {
  const isScrollOpen = currentShape === ShapeType.SCROLL;

  return (
    <Canvas
      camera={{ position: [0, 0, 25], fov: 50 }}
      dpr={[1, 2]} 
      className="w-full h-full block"
      gl={{ antialias: true, alpha: false }} 
    >
      <color attach="background" args={['#0b0214']} />
      <fog attach="fog" args={['#18002b', 15, 60]} />
      
      <ambientLight intensity={isScrollOpen ? 0.6 : 0.4} />
      
      <directionalLight position={[10, 10, 10]} intensity={1.5} color="#FFD700" />
      
      {isScrollOpen && (
          <spotLight 
            position={[0, 20, 20]} 
            intensity={4} 
            angle={0.4} 
            penumbra={1} 
            color="#ffffff" 
            castShadow
          />
      )}
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={0.5} />
      
      <Sparkles 
        count={200} 
        scale={20} 
        size={3} 
        speed={0.3} 
        opacity={0.4} 
        color="#ffc4dd" 
      />

      <Particles shape={currentShape} isScatter={isScatter} isShaking={isShaking} />
      
      <SolidScroll isOpen={isScrollOpen} />
      
      <FloatingPetals currentShape={currentShape} isScatter={isScatter} />
      
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={isScrollOpen ? 0.95 : 0.15} 
          luminanceSmoothing={0.9} 
          intensity={isScrollOpen ? 0.15 : 1.2} 
          radius={0.8} 
          mipmapBlur 
        />
        <Vignette eskil={false} offset={0.1} darkness={isScrollOpen ? 0.2 : 0.6} />
      </EffectComposer>

      <OrbitControls 
        enableZoom={!isScrollOpen} 
        enablePan={false} 
        enableRotate={true}
        zoomSpeed={0.5}
        rotateSpeed={0.4} 
        maxDistance={50}
        minDistance={5}
      />
    </Canvas>
  );
};

export default Scene;