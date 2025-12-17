
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
  const count = 500; 

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // --- Create TRUE ROSE PETAL Shape ---
  const petalGeometry = useMemo(() => {
    // Define a petal silhouette
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.5);
    shape.bezierCurveTo(-0.4, -0.2, -0.5, 0.2, -0.3, 0.5);
    shape.bezierCurveTo(-0.1, 0.7, 0.1, 0.7, 0.3, 0.5);
    shape.bezierCurveTo(0.5, 0.2, 0.4, -0.2, 0, -0.5);

    const geometry = new THREE.ShapeGeometry(shape, 8);
    
    // Add curvature
    const posAttribute = geometry.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
        const x = posAttribute.getX(i);
        const y = posAttribute.getY(i);
        const z = Math.pow(x * 1.5, 2) * 0.4; 
        posAttribute.setZ(i, z);
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  // --- Refined Texture with Veins ---
  const petalTexture = useMemo(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
          // 1. Base Gradient (Lighter, brighter pinks)
          const grd = ctx.createLinearGradient(0, 512, 0, 0);
          grd.addColorStop(0, "#FFC1CC"); // Bubblegum Pink
          grd.addColorStop(1, "#FFE4E1"); // Misty Rose
          ctx.fillStyle = grd;
          ctx.fillRect(0,0,512,512);
          
          // 2. Veins (Subtle lines)
          ctx.strokeStyle = "rgba(255, 105, 180, 0.2)"; 
          ctx.lineWidth = 2;
          ctx.beginPath();
          // Center vein
          ctx.moveTo(256, 512);
          ctx.quadraticCurveTo(256, 256, 256, 0);
          ctx.stroke();
          
          // Side veins
          for (let i=0; i<5; i++) {
              const yStart = 400 - i * 80;
              ctx.beginPath();
              ctx.moveTo(256, yStart);
              ctx.quadraticCurveTo(100, yStart - 50, 0, yStart - 100);
              ctx.stroke();
              
              ctx.beginPath();
              ctx.moveTo(256, yStart);
              ctx.quadraticCurveTo(412, yStart - 50, 512, yStart - 100);
              ctx.stroke();
          }

          // 3. Texture Grain (Sparkle)
          for(let i=0; i<1000; i++) {
              ctx.fillStyle = `rgba(255,255,255,0.3)`;
              ctx.fillRect(Math.random()*512, Math.random()*512, 2, 2);
          }
      }
      return new THREE.CanvasTexture(canvas);
  }, []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 70,
        y: (Math.random() - 0.5) * 60,
        z: (Math.random() - 0.5) * 40 + 5, 
        
        speedY: 0.015 + Math.random() * 0.02,
        speedX: (Math.random() - 0.5) * 0.03,
        swayFreq: 0.5 + Math.random() * 1.5,
        
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        rotSpeedZ: (Math.random() - 0.5) * 0.02,
        
        // Brighter Pink Variations (High Lightness)
        color: new THREE.Color().setHSL(Math.random() * 0.05 + 0.95, 0.8, 0.85), 
        
        scale: 0.6 + Math.random() * 0.4 
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Show in Scroll mode, Gift mode, or during transition/scatter
    const isActive = (currentShape === ShapeType.GIFT_BOX || currentShape === ShapeType.SCROLL);
    const time = state.clock.getElapsedTime();

    particles.forEach((p, i) => {
      p.y -= p.speedY;
      
      p.x += Math.sin(time * p.swayFreq + i) * 0.02 + p.speedX;
      p.z += Math.cos(time * p.swayFreq * 0.7 + i) * 0.01;
      
      if (p.y < -25) {
          p.y = 30;
          p.x = (Math.random() - 0.5) * 70;
      }
      
      dummy.rotation.set(
          time * p.rotSpeedX * 3 + i,
          time * p.rotSpeedY * 3 + i,
          time * p.rotSpeedZ * 3 + i
      );

      dummy.position.set(p.x, p.y, p.z);
      
      // If active, show; otherwise shrink to 0
      const s = isActive ? 1.0 : 0.0;
      
      dummy.scale.set(p.scale * s, p.scale * s, p.scale * s);
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, p.color);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} geometry={petalGeometry}>
      <meshStandardMaterial 
        transparent 
        opacity={0.95} // Restored full opacity
        side={THREE.DoubleSide} 
        map={petalTexture}
        roughness={0.4}
        metalness={0.1}
        emissive="#FFB6C1" 
        emissiveIntensity={0.6} 
        depthWrite={false}
      />
    </instancedMesh>
  );
};

export default FloatingPetals;
