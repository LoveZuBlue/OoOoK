import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ShapeType } from '../types';

interface FloatingPetalsProps {
  currentShape: ShapeType;
  isScatter: boolean;
}

const FloatingPetals: React.FC<FloatingPetalsProps> = ({ currentShape, isScatter }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 400; 

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // --- Create Realistic Petal Shape ---
  const petalGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Start at bottom tip
    shape.moveTo(0, 0);
    // Left curve up
    shape.bezierCurveTo(-0.5, 0.2, -0.6, 0.8, -0.2, 1.2);
    // Top middle dip (heart-like or rose petal top)
    shape.bezierCurveTo(-0.1, 1.3, 0.1, 1.3, 0.2, 1.2);
    // Right curve down
    shape.bezierCurveTo(0.6, 0.8, 0.5, 0.2, 0, 0);

    return new THREE.ShapeGeometry(shape);
  }, []);
  
  // Physics data
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const type = Math.random() > 0.3 ? 'petal' : 'confetti'; 
      temp.push({
        x: (Math.random() - 0.5) * 50,
        y: (Math.random() - 0.5) * 40,
        z: (Math.random() - 0.5) * 30 + 5, 
        
        speedY: 0.01 + Math.random() * 0.03,
        speedX: (Math.random() - 0.5) * 0.02,
        swayFreq: 0.5 + Math.random() * 1.5,
        swayAmp: 0.05 + Math.random() * 0.1,
        
        rotSpeedX: (Math.random() - 0.5) * 0.03,
        rotSpeedY: (Math.random() - 0.5) * 0.03,
        rotSpeedZ: (Math.random() - 0.5) * 0.03,
        
        color: type === 'confetti' 
            ? new THREE.Color().setHSL(Math.random() * 0.15 + 0.1, 0.9, 0.6) // Gold/Amber
            : new THREE.Color().setHSL(Math.random() * 0.05 + 0.9, 0.8, 0.65), // Vibrant Pink
        
        scale: type === 'confetti'
            ? [0.1, 0.6, 0.1] 
            : [0.5 + Math.random()*0.3, 0.5 + Math.random()*0.3, 0.5] 
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const isActive = (currentShape === ShapeType.GIFT_BOX || currentShape === ShapeType.SCROLL);
    const time = state.clock.getElapsedTime();

    particles.forEach((p, i) => {
      // 1. Gravity & Sway
      p.y -= p.speedY;
      p.x += Math.sin(time * p.swayFreq + i) * 0.02 + p.speedX;
      p.z += Math.cos(time * p.swayFreq * 0.7 + i) * 0.01;
      
      // Loop around
      if (p.y < -15) {
          p.y = 20;
          p.x = (Math.random() - 0.5) * 50;
      }
      
      // 2. Tumble Rotation
      dummy.rotation.set(
          time * p.rotSpeedX * 10 + i,
          time * p.rotSpeedY * 10 + i,
          time * p.rotSpeedZ * 10 + i
      );

      dummy.position.set(p.x, p.y, p.z);
      
      // 3. Visibility Scaling
      const s = isActive ? 1.0 : 0.0;
      
      dummy.scale.set(
          p.scale[0] * s,
          p.scale[1] * s,
          p.scale[2] * s
      );
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, p.color);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} geometry={petalGeometry}>
      <meshBasicMaterial 
        transparent 
        opacity={0.9} 
        side={THREE.DoubleSide} 
        depthWrite={false} 
      />
    </instancedMesh>
  );
};

export default FloatingPetals;