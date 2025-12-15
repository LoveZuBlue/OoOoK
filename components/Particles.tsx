import React, { useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getShapePositions, generateTextParticles } from '../constants';
import { ShapeType } from '../types';

interface ParticlesProps {
  shape: ShapeType;
  isScatter: boolean;
  isShaking?: boolean;
}

// --- Shader with Puppy Wiggle & Gift Shake ---
const particleShader = {
  vertexShader: `
    attribute float size;
    attribute vec3 customColor;
    varying vec3 vColor;
    varying vec3 vPos; 
    uniform float uTime;
    uniform float uWobble; // Used for Puppy wobble AND Shake effect
    uniform float uShakeStrength; // Explicit shake control
    
    void main() {
      vColor = customColor;
      vec3 pos = position;
      
      // --- Gift Shake Logic ---
      if (uShakeStrength > 0.0) {
         // Violent random vibration
         float s = uShakeStrength;
         pos.x += sin(uTime * 50.0 + pos.y) * 0.2 * s;
         pos.y += cos(uTime * 45.0 + pos.x) * 0.2 * s;
         pos.z += sin(uTime * 60.0 + pos.z) * 0.2 * s;
      }

      // --- Puppy Animation Logic ---
      if (uWobble > 0.0 && uShakeStrength == 0.0) {
          // Tail Wag (Particles roughly in tail zone: z < -1.5)
          if (pos.z < -0.5 && pos.y < 0.0) {
              float wag = sin(uTime * 8.0) * 0.1 * (abs(pos.z) + 0.5); 
              pos.x += wag;
          }
          // Head Tilt
          if (pos.y > 1.5) {
             float tilt = sin(uTime * 1.5) * 0.03;
             float cx = pos.x * cos(tilt) - pos.y * sin(tilt);
             float cy = pos.x * sin(tilt) + pos.y * cos(tilt);
             pos.x = cx;
             pos.y = cy;
          }
      }
      
      vPos = pos; 
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      gl_PointSize = size * (600.0 / -mvPosition.z);
      
      // Subtle organic pulse
      float pulse = sin(uTime * 1.5 + pos.y) * 0.1 + 0.95;
      gl_PointSize *= pulse;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying vec3 vPos;
    uniform float uTime;
    
    void main() {
      float d = distance(gl_PointCoord, vec2(0.5));
      if (d > 0.5) discard;
      
      float glow = 1.0 - (d * 2.0);
      glow = pow(glow, 2.5); // Sharper glow for crystal effect

      vec3 finalColor = vColor * 1.3; 
      
      // Extra shine for center of particle
      finalColor += vec3(0.2, 0.2, 0.2) * glow;

      gl_FragColor = vec4(finalColor, glow * 0.9);
    }
  `
};

const Particles: React.FC<ParticlesProps> = ({ shape, isScatter, isShaking }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const { mouse, viewport, clock } = useThree();

  const shapeStartTimeRef = useRef(0);

  useEffect(() => {
    shapeStartTimeRef.current = clock.getElapsedTime();
  }, [shape, clock]);

  const targetPositions = useMemo(() => {
    if (shape === ShapeType.TEXT) {
      return generateTextParticles("Happy Birthday to Boxhao");
    }
    return getShapePositions(shape);
  }, [shape]);

  const currentPositions = useMemo(() => {
    return new Float32Array(targetPositions.length);
  }, [targetPositions.length]); 

  // --- Color Mapping ---
  const { colors, sizes } = useMemo(() => {
    const count = targetPositions.length / 3;
    const colorArray = new Float32Array(count * 3);
    const sizeArray = new Float32Array(count);

    // Standard Colors
    const cWhite = new THREE.Color('#ffffff');
    
    // SATURN COLORS (More saturated, less messy)
    const cSaturnBody = new THREE.Color('#FFC000'); // Vivid Gold/Amber
    const cSaturnRing1 = new THREE.Color('#FF8C00'); // Dark Orange
    const cSaturnRing2 = new THREE.Color('#FFD700'); // Gold
    const cSaturnRing3 = new THREE.Color('#D2691E'); // Chocolate/Bronze saturated
    const cSaturnShadow = new THREE.Color('#8B4500'); // Deep saturated shadow

    // CAKE COLORS (Higher saturation)
    const cCakeSponge = new THREE.Color('#F0B669'); // Saturated Sponge
    const cCakeFrosting = new THREE.Color('#FF1493'); // Deep Pink
    const cCakeFlame = new THREE.Color('#FF3300'); // Bright Red-Orange

    const cHeartRed = new THREE.Color('#FF0033');
    const cHeartPink = new THREE.Color('#FF1493');
    const cHeartLightPink = new THREE.Color('#FFC0CB');

    // PUPPY COLORS
    const cGolden = new THREE.Color('#f5cc6c'); 
    const cDarkGold = new THREE.Color('#c99834'); 
    const cCream = new THREE.Color('#fff9eb'); 
    const cBlack = new THREE.Color('#0a0a0a'); 
    
    // GIFT BOX COLORS
    const cBoxBody = new THREE.Color(0.35, 0.05, 0.08); // Richer Red
    const cBoxEdge = new THREE.Color(0.60, 0.10, 0.15); // Highlighted Edge
    const cBoxLid = new THREE.Color(0.40, 0.05, 0.10); 
    const cBoxRibbon = new THREE.Color(0.80, 0.60, 0.10); // Bright Gold ribbon
    
    // SCROLL COLORS
    const cPaper = new THREE.Color('#F5E6C4'); // Cream/Beige
    const cPaperEdge = new THREE.Color('#E6CFA0'); // Darker Beige
    const cHandle = new THREE.Color('#3E2723'); // Dark Wood
    const cHandleGold = new THREE.Color('#FFD700'); // Gold Knobs

    // SNOWFLAKE: ICE COLORS (COLD & TRANSPARENT LOOK)
    const cIceCore = new THREE.Color('#FFFFFF');
    const cIceMid = new THREE.Color('#A5F2F3'); // Pale Cyan
    const cIceEdge = new THREE.Color('#00CED1'); // Dark Turquoise
    const cIceClear = new THREE.Color('#F0FFFF'); // Azure

    const cPurple = new THREE.Color('#9370DB');

    for (let i = 0; i < count; i++) {
      let c = new THREE.Color('#ffffff');
      let size = 0.1;

      if (shape === ShapeType.SATURN) {
          if (i < 16000) {
             c = cSaturnBody;
             if (Math.random() < 0.1) c = cSaturnRing3;
             size = 0.18; 
          } else {
             const ringIndex = i - 16000;
             const ringTotal = count - 16000;
             const progress = ringIndex / ringTotal;
             
             if (progress < 0.2) c = cSaturnRing3;
             else if (progress < 0.4) c = cSaturnRing1;
             else if (progress < 0.6) c = cSaturnRing2;
             else if (progress < 0.8) c = cSaturnRing1;
             else c = cSaturnShadow; 
             
             size = 0.12;
          }
      } 
      else if (shape === ShapeType.CAKE) {
          const tier1Limit = 16000;
          const tier2Limit = 26000;
          const frostingLimit = 35000;
          if (i < tier1Limit) c = cCakeSponge;
          else if (i < tier2Limit) c = cCakeSponge;
          else if (i < frostingLimit) c = cCakeFrosting;
          else c = cCakeFlame;
          size = 0.14;
      } 
      else if (shape === ShapeType.HEART) {
          const r = Math.random();
          if (r < 0.6) c = cHeartRed;
          else if (r < 0.9) c = cHeartPink;
          else c = cHeartLightPink;
          size = 0.15 + Math.random() * 0.1;
      } 
      else if (shape === ShapeType.PUPPY) {
          // Simplified puppy color logic
          if (i < 15000) c = cGolden;
          else if (i < 24000) c = cCream;
          else c = cDarkGold;
          size = 0.16;
      }
      else if (shape === ShapeType.GIFT_BOX) {
          const boxEnd = 30000;
          const ribbonEnd = 45000;

          size = 0.40; // High density size

          if (i < boxEnd) {
              // Differentiate Edges if possible (based on position approximation or index)
              // For simplicity, random variation
              if (Math.random() < 0.3) c = cBoxEdge;
              else c = cBoxBody;
          } else if (i < ribbonEnd) {
              c = cBoxRibbon;
              size = 0.45;
          } else {
              // Bow
              c = cBoxRibbon;
              size = 0.45;
          }
      }
      else if (shape === ShapeType.SCROLL) {
          const handleEnd = 15000;
          // Handles
          if (i < handleEnd) {
               // Wood or Gold?
               const y = targetPositions[i*3+1];
               if (Math.abs(y) > 2.5) c = cHandleGold; // Knobs
               else c = cHandle;
               size = 0.25;
          } else {
               // Paper
               if (Math.random() < 0.1) c = cPaperEdge;
               else c = cPaper;
               size = 0.20;
          }
      }
      else if (shape === ShapeType.SNOWFLAKE) {
          // ICE CRYSTAL PALETTE
          const r = Math.random();
          if (r < 0.4) c = cIceCore; // Core White
          else if (r < 0.7) c = cIceMid; // Cyan
          else if (r < 0.9) c = cIceClear; // Translucent
          else c = cIceEdge; // Deep
          
          size = 0.12; // Thicker particles for "volume"
      } 
      else {
          c = Math.random() > 0.5 ? cPurple : cWhite;
          size = 0.13;
      }

      colorArray[i * 3] = c.r;
      colorArray[i * 3 + 1] = c.g;
      colorArray[i * 3 + 2] = c.b;

      // Random "Big" sparkles
      if (Math.random() > 0.99) {
         sizeArray[i] = size * 2.5; 
      } else {
         sizeArray[i] = size;
      }
    }
    return { colors: colorArray, sizes: sizeArray };
  }, [targetPositions.length, shape]);

  // Initial Scatter
  useEffect(() => {
    for(let i=0; i<currentPositions.length; i++) {
        currentPositions[i] = (Math.random() - 0.5) * 150; 
    }
    if(pointsRef.current) {
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  }, []);

  useLayoutEffect(() => {
    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.customColor.needsUpdate = true;
      pointsRef.current.geometry.attributes.size.needsUpdate = true;
    }
  }, [colors, sizes]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const count = positions.length / 3;
    const time = state.clock.getElapsedTime();
    const shapeElapsed = time - shapeStartTimeRef.current;

    // --- Update Shader Uniforms ---
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = time;
      
      // Control Wiggle & Shake
      shaderRef.current.uniforms.uShakeStrength.value = isShaking ? 1.0 : 0.0;
      shaderRef.current.uniforms.uWobble.value = (shape === ShapeType.PUPPY) ? 1.0 : 0.0;
    }

    const mouseX = (mouse.x * viewport.width) / 2;
    const mouseY = (mouse.y * viewport.height) / 2;
    const isTextMode = shape === ShapeType.TEXT;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      let tx = targetPositions[ix];
      let ty = targetPositions[iy];
      let tz = targetPositions[iz];

      const floatSpeed = 0.05; 
      tx += Math.sin(time * 0.2 + ty * 0.4) * 0.05 * floatSpeed;
      ty += Math.cos(time * 0.15 + tx * 0.4) * 0.05 * floatSpeed;
      tz += Math.sin(time * 0.18 + tx * 0.2) * 0.05 * floatSpeed;

      if (!isTextMode) {
        const rotFreq = 0.15; 
        const rotAmp = 0.12; 
        const rotPhase = i * 0.137; 
        tx += Math.cos(time * rotFreq + rotPhase) * rotAmp;
        ty += Math.sin(time * rotFreq + rotPhase) * rotAmp;
      } else {
        tz += Math.sin(time * 1.2 + tx * 0.3) * 0.3;
      }

      if (isScatter) {
        const angle = Math.atan2(ty, tx) + time * 1.5;
        const radius = Math.sqrt(tx*tx + ty*ty) * (3 + Math.sin(time * 2));
        tx = Math.cos(angle) * radius * 2.5;
        ty = Math.sin(angle) * radius * 2.5;
        tz *= 4; 
      }

      // Mouse Interaction
      const dx = mouseX - positions[ix];
      const dy = mouseY - positions[iy];
      const distSq = dx*dx + dy*dy;
      const interactionRadius = 4.0; 
      
      if (distSq < interactionRadius * interactionRadius) {
          const dist = Math.sqrt(distSq);
          const force = (interactionRadius - dist) / interactionRadius; 
          const angle = Math.atan2(dy, dx);
          tx -= Math.cos(angle) * force * 1.5;
          ty -= Math.sin(angle) * force * 1.5;
          tz += force * 1.0; 
      }

      const lerpFactor = isScatter ? 0.02 : 0.05;
      
      positions[ix] += (tx - positions[ix]) * lerpFactor;
      positions[iy] += (ty - positions[iy]) * lerpFactor;
      positions[iz] += (tz - positions[iz]) * lerpFactor;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Global Object Rotation
    if (shape === ShapeType.TEXT) {
       pointsRef.current.rotation.set(0, 0, 0);
       pointsRef.current.lookAt(state.camera.position);
    } else if (shape === ShapeType.SATURN) {
       pointsRef.current.rotation.x = 0.3; 
       pointsRef.current.rotation.y = 0.0;
       pointsRef.current.rotation.z = 0.2 + shapeElapsed * 0.05; 
    } else if (shape === ShapeType.PUPPY) {
       pointsRef.current.rotation.x = 0; 
       pointsRef.current.rotation.z = 0;
       pointsRef.current.rotation.y = Math.sin(shapeElapsed * 0.5) * 0.2; 
    } else if (shape === ShapeType.GIFT_BOX) {
       pointsRef.current.rotation.x = 0.2;
       pointsRef.current.rotation.y = shapeElapsed * 0.3;
       pointsRef.current.rotation.z = 0;
    } else if (shape === ShapeType.SCROLL) {
       pointsRef.current.rotation.x = 0.2; 
       pointsRef.current.rotation.z = 0; // Flat facing
       pointsRef.current.rotation.y = 0; 
    } else if (shape === ShapeType.SNOWFLAKE) {
       pointsRef.current.rotation.x = Math.sin(shapeElapsed * 0.2) * 0.2;
       pointsRef.current.rotation.y = shapeElapsed * 0.1;
       pointsRef.current.rotation.z = Math.sin(shapeElapsed * 0.1) * 0.1;
    } else {
       pointsRef.current.rotation.x = 0;
       pointsRef.current.rotation.z = 0;
       pointsRef.current.rotation.y = shapeElapsed * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={currentPositions.length / 3} array={currentPositions} itemSize={3} />
        <bufferAttribute attach="attributes-customColor" count={colors.length / 3} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        attach="material"
        args={[particleShader]}
        uniforms={{ 
            uTime: { value: 0 },
            uWobble: { value: 0.0 },
            uShakeStrength: { value: 0.0 }
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending} 
      />
    </points>
  );
};

export default Particles;