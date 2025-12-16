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

// --- Shader (BRIGHT & GLOWING, NO DARKNESS) ---
const particleShader = {
  vertexShader: `
    attribute float size;
    attribute vec3 customColor;
    varying vec3 vColor;
    varying float vBlink;
    uniform float uTime;
    uniform float uWobble; 
    uniform float uShakeStrength; 
    uniform float uSparkle;
    
    void main() {
      vColor = customColor;
      vec3 pos = position;
      
      // Calculate random blink offset based on position
      vBlink = sin(uTime * 3.0 + pos.x * 10.0 + pos.y * 5.0);

      // --- Gift Shake Logic ---
      if (uShakeStrength > 0.0) {
         float s = uShakeStrength;
         pos.x += sin(uTime * 50.0 + pos.y) * 0.2 * s;
         pos.y += cos(uTime * 45.0 + pos.x) * 0.2 * s;
         pos.z += sin(uTime * 60.0 + pos.z) * 0.2 * s;
      }

      // --- Puppy Animation Logic ---
      if (uWobble > 0.0 && uShakeStrength == 0.0) {
          // Tail Wag only
          if (pos.y < -1.5 && pos.z < -1.5) {
              float wag = sin(uTime * 9.0) * 0.25 * (abs(pos.x) + 0.5); 
              pos.x += wag;
          }
      }
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Base Size
      float baseSize = size * (600.0 / -mvPosition.z);
      gl_PointSize = baseSize;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vBlink;
    uniform float uSparkle;
    
    void main() {
      // Glow Particle
      float d = distance(gl_PointCoord, vec2(0.5));
      if (d > 0.5) discard;
      
      // Softer falloff, higher core brightness
      float glow = 1.0 - (d * 1.8);
      glow = clamp(glow, 0.0, 1.0);
      glow = pow(glow, 1.5); 
      
      float alpha = glow * 0.9;
      
      // Icy Sparkle Effect for Snowflakes
      if (uSparkle > 0.5) {
          float sparkle = smoothstep(0.4, 1.0, vBlink);
          alpha += sparkle * 0.5;
      }

      // High Alpha for visible, energetic particles
      gl_FragColor = vec4(vColor, alpha); 
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

  // --- Color Mapping (Balanced brightness) ---
  const { colors, sizes } = useMemo(() => {
    const count = targetPositions.length / 3;
    const colorArray = new Float32Array(count * 3);
    const sizeArray = new Float32Array(count);

    // DETERMINE BRIGHTNESS MULTIPLIER
    let brightnessMultiplier = 1.0;
    
    if (shape === ShapeType.CAKE || shape === ShapeType.SNOWFLAKE) {
        brightnessMultiplier = 0.45;
    } else if (shape === ShapeType.GIFT_BOX) {
        // Reduced significantly to prevent overexposure
        brightnessMultiplier = 0.20; 
    } else if (shape === ShapeType.PUPPY) {
        brightnessMultiplier = 0.6;
    }

    // SATURN: MAGNIFICENT GOLD (Sand/Bright/Dark Gold)
    const cSaturnBody = new THREE.Color('#F4C430'); // Saffron/Gold
    const cSaturnRing1 = new THREE.Color('#FFD700'); // Pure Gold
    const cSaturnRing2 = new THREE.Color('#DAA520'); // Goldenrod
    const cSaturnRing3 = new THREE.Color('#F0E68C'); // Khaki highlight

    // CAKE
    const cCakeSponge = new THREE.Color('#FFDEAD'); 
    const cCakeFrosting = new THREE.Color('#FF69B4'); 
    const cCakeFlame = new THREE.Color('#FF4500'); 

    // PUPPY
    const cGolden = new THREE.Color('#F4A460'); // Sandy Brown
    const cCream = new THREE.Color('#FAEBD7'); // Antique White
    const cFeature = new THREE.Color('#000000'); // Black Eyes
    
    // GIFT BOX
    const cBoxBody = new THREE.Color('#FF69B4'); 
    const cBoxEdge = new THREE.Color('#FF1493'); 
    const cBoxRibbon = new THREE.Color('#FFFFFF'); 
    
    // SNOWFLAKE
    const cIceCore = new THREE.Color('#F0FFFF'); 
    const cIceOuter = new THREE.Color('#E0FFFF'); 
    const cIceEdge = new THREE.Color('#AFEEEE'); 

    const cPurple = new THREE.Color('#9370DB');
    
    // TEXT
    const cSpaceDeep = new THREE.Color('#8A2BE2'); 
    const cSpaceMid = new THREE.Color('#9400D3'); 
    const cSpaceLight = new THREE.Color('#E6E6FA'); 
    const cStar = new THREE.Color('#FFFFFF'); 

    for (let i = 0; i < count; i++) {
      let c = new THREE.Color('#ffffff');
      let size = 0.12;
      
      const x = targetPositions[i*3];
      const y = targetPositions[i*3+1];
      const z = targetPositions[i*3+2];

      if (shape === ShapeType.SATURN) {
          if (i < 18000) {
             c = cSaturnBody;
             size = 0.16; 
          } else {
             const ringIndex = i - 18000;
             const ringTotal = count - 18000;
             const progress = ringIndex / ringTotal;
             
             if (progress < 0.2) c = cSaturnRing2;
             else if (progress < 0.5) c = cSaturnRing1; 
             else if (progress < 0.8) c = cSaturnRing3;
             else c = cSaturnRing2;
             
             size = 0.10; 
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
          if (r < 0.6) c = new THREE.Color('#FF0000'); // Red
          else c = new THREE.Color('#FF69B4'); // Hot Pink
          size = 0.15;
      } 
      else if (shape === ShapeType.PUPPY) {
          if (i < 750) {
              c = cFeature; 
              size = 0.18; 
          } else {
              if (y > 2.0 && z > 1.0) c = cGolden; 
              else if (i < 16000) c = cGolden;
              else if (i < 29000) c = cCream; // Belly/Chest
              else c = cGolden;
              size = 0.15;
          }
      }
      else if (shape === ShapeType.GIFT_BOX) {
          const boxEnd = 30000;
          if (i < boxEnd) {
             c = Math.random() < 0.3 ? cBoxEdge : cBoxBody;
          } else {
             c = cBoxRibbon;
          }
          size = 0.35; 
      }
      else if (shape === ShapeType.SCROLL) {
          c = new THREE.Color('#F0E68C'); // Light gold for scroll scatter
          size = 0.08;
      }
      else if (shape === ShapeType.SNOWFLAKE) {
          // Color Logic
          const dist = Math.sqrt(x*x + y*y);
          if (dist < 2.0) c = cIceCore;
          else if (dist < 6.0) c = cIceOuter;
          else c = cIceEdge;

          // --- REALISTIC SNOWFLAKE SIZE VARIATION ---
          // Real snow isn't just single points, it's a mix of large crystals and fine dust.
          const rand = Math.random();
          
          if (rand > 0.92) {
              // 8% Large, Glimmering Crystals (The "Hero" particles)
              size = 0.28; 
          } else if (rand > 0.65) {
              // 27% Structural, Medium Particles
              size = 0.16;
          } else {
              // 65% Fine Ice Dust (Creates the volume/fog feel)
              size = 0.04 + Math.random() * 0.08; 
          }
      } 
      else if (shape === ShapeType.TEXT) {
          const r = Math.random();
          if (r < 0.5) c = cSpaceDeep; 
          else if (r < 0.8) c = cSpaceMid; 
          else if (r < 0.95) c = cSpaceLight; 
          else c = cStar; 
          size = 0.14;
      }
      else {
          c = cPurple;
      }

      // APPLY BRIGHTNESS CORRECTION
      if (shape === ShapeType.PUPPY && i < 750) {
          // Black features should NOT be dimmed or brightened (pure black)
          colorArray[i * 3] = 0;
          colorArray[i * 3 + 1] = 0;
          colorArray[i * 3 + 2] = 0;
      } else {
          colorArray[i * 3] = c.r * brightnessMultiplier;
          colorArray[i * 3 + 1] = c.g * brightnessMultiplier;
          colorArray[i * 3 + 2] = c.b * brightnessMultiplier;
      }

      // Final random size variation (unless handled specifically above)
      if (shape !== ShapeType.SNOWFLAKE) {
        if (Math.random() > 0.99) sizeArray[i] = size * 2.5; 
        else sizeArray[i] = size;
      } else {
          // Snowflakes already have size logic applied
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

    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = time;
      shaderRef.current.uniforms.uShakeStrength.value = isShaking ? 1.0 : 0.0;
      shaderRef.current.uniforms.uWobble.value = (shape === ShapeType.PUPPY) ? 1.0 : 0.0;
      shaderRef.current.uniforms.uSparkle.value = (shape === ShapeType.SNOWFLAKE) ? 1.0 : 0.0;
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

      // Mouse Repulsion
      const dx = mouseX - positions[ix];
      const dy = mouseY - positions[iy];
      const distSq = dx*dx + dy*dy;
      const interactionRadius = 5.0; 
      
      if (distSq < interactionRadius * interactionRadius) {
          const dist = Math.sqrt(distSq);
          const force = (interactionRadius - dist) / interactionRadius; 
          const angle = Math.atan2(dy, dx);
          tx -= Math.cos(angle) * force * 2.0;
          ty -= Math.sin(angle) * force * 2.0;
      }

      const lerpFactor = isScatter ? 0.02 : 0.08;
      
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
       pointsRef.current.rotation.x = 0.4; 
       pointsRef.current.rotation.y = 0.0;
       pointsRef.current.rotation.z = 0.2 + shapeElapsed * 0.05; 
    } else if (shape === ShapeType.PUPPY) {
       // Face front initially (0), then gentle sway left/right
       pointsRef.current.rotation.set(0, 0, 0);
       // Oscillate +/- 0.25 radians
       pointsRef.current.rotation.y = Math.sin(shapeElapsed * 0.5) * 0.25;
    } else if (shape === ShapeType.GIFT_BOX) {
       pointsRef.current.rotation.x = 0.2;
       pointsRef.current.rotation.y = shapeElapsed * 0.3;
       pointsRef.current.rotation.z = 0;
    } else if (shape === ShapeType.SCROLL) {
       pointsRef.current.rotation.set(0, 0, 0);
    } else if (shape === ShapeType.SNOWFLAKE) {
       // Slow spin, but start facing camera
       pointsRef.current.rotation.set(0, 0, 0);
       pointsRef.current.rotation.y = shapeElapsed * 0.15;
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
      {/* ADDITIVE BLENDING FOR GLOWING EFFECTS */}
      <shaderMaterial
        ref={shaderRef}
        attach="material"
        args={[particleShader]}
        uniforms={{ 
            uTime: { value: 0 },
            uWobble: { value: 0.0 },
            uShakeStrength: { value: 0.0 },
            uSparkle: { value: 0.0 }
        }}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending} 
      />
    </points>
  );
};

export default Particles;