import React, { useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getShapePositions, generateTextParticles } from '../constants';
import { ShapeType } from '../types';

interface ParticlesProps {
  shape: ShapeType;
  isScatter: boolean;
}

// --- High-End Shader for Bloom-Compatible Particles ---
// Improved: Preserves color saturation better while still glowing
// Added: Collision Sparkle Effect via Fragment Shader
const particleShader = {
  vertexShader: `
    attribute float size;
    attribute vec3 customColor;
    varying vec3 vColor;
    varying vec3 vPos; // Pass position for spatial effects
    uniform float uTime;
    
    void main() {
      vColor = customColor;
      vPos = position; 
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      
      // Calculate depth-based size attenuation
      gl_PointSize = size * (600.0 / -mvPosition.z);
      
      // Elegant subtle pulse
      float pulse = sin(uTime * 0.8 + position.x * 2.0) * 0.1 + 0.95;
      gl_PointSize *= pulse;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying vec3 vPos;
    uniform float uTime;
    
    void main() {
      // Distance from center of point
      float d = distance(gl_PointCoord, vec2(0.5));
      if (d > 0.5) discard;
      
      // Glow Calculation:
      float glow = 1.0 - (d * 2.0);
      glow = pow(glow, 2.0); 

      // Base Color
      vec3 finalColor = vColor * 1.4; 
      
      // Core Brightness
      finalColor = mix(finalColor, vec3(1.1), glow * 0.4);

      // --- Collision Sparkle / Interaction Effect ---
      // Simulates particles "interacting" or colliding by checking for
      // constructive interference in a moving 3D noise field.
      // When a particle enters a "hot spot", it emits a burst of light.
      
      float speed = 2.0; // Slower shimmer for dreamier effect
      float scale = 6.0;
      
      // Simple 3D interference pattern
      float noise = sin(vPos.x * scale + uTime * speed) * 
                    cos(vPos.y * scale + uTime * speed * 0.85) * 
                    sin(vPos.z * scale + uTime * speed * 1.15);
      
      // Threshold for the "spark"
      float spark = smoothstep(0.85, 1.0, noise);
      
      // Apply Sparkle: Boost brightness significantly with a warm white tint
      // This creates the illusion of small explosions or collisions
      if (spark > 0.01) {
        finalColor += vec3(1.0, 0.9, 0.8) * spark * 1.0;
      }

      gl_FragColor = vec4(finalColor, glow);
    }
  `
};

const Particles: React.FC<ParticlesProps> = ({ shape, isScatter }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const { mouse, viewport, clock } = useThree();

  // Track the start time of the current shape to reset rotation
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

  // Create position buffer once, modify in place via useFrame
  const currentPositions = useMemo(() => {
    return new Float32Array(targetPositions.length);
  }, [targetPositions.length]); 

  // --- Premium Distinct Color Palettes ---
  const { colors, sizes } = useMemo(() => {
    const count = targetPositions.length / 3;
    const colorArray = new Float32Array(count * 3);
    const sizeArray = new Float32Array(count);

    // Explicitly distinct palettes for each type
    const palettes: Record<ShapeType, THREE.Color[]> = {
      // Saturn: Unified Elegant Beige/Gold/Soft Pink
      [ShapeType.SATURN]: [
        new THREE.Color('#E6DBAC'), // Soft Beige (Rings)
        new THREE.Color('#E0B0FF'), // Mauve (Dreamy addition)
        new THREE.Color('#F5F5DC')  // Cream (Highlights)
      ],
      // Heart: Updated Brighter Pink/Red Palette for better Bloom
      [ShapeType.HEART]: [
        new THREE.Color('#FF4D4D'), // Bright Red
        new THREE.Color('#FF1493'), // Deep Pink
        new THREE.Color('#FFB6C1')  // Light Pink
      ],
      // Cake: Warm Pastel & Fire
      [ShapeType.CAKE]: [
        new THREE.Color('#F5DEB3'), // Wheat/Cream
        new THREE.Color('#FFB6C1'), // Light Pink Frosting
        new THREE.Color('#FF8C00')  // Dark Orange (Warmth)
      ],
      // Snowflake: Icy Cyan & Purple
      [ShapeType.SNOWFLAKE]: [
        new THREE.Color('#E0FFFF'), // Light Cyan
        new THREE.Color('#E6E6FA'), // Lavender (Dreamy)
        new THREE.Color('#FFFFFF')  // White
      ],
      // Text: NEON PURPLE THEME
      [ShapeType.TEXT]: [
        new THREE.Color('#D800FF'), // Neon Purple
        new THREE.Color('#9370DB'), // Medium Purple
        new THREE.Color('#E6E6FA')  // Lavender
      ],
    };

    const currentPalette = palettes[shape] || palettes[ShapeType.SATURN];

    for (let i = 0; i < count; i++) {
      const r = Math.random();
      let c;

      if (shape === ShapeType.SATURN) {
          if (i < count * 0.35) {
             c = Math.random() > 0.2 ? currentPalette[1] : currentPalette[2];
          } else {
             c = Math.random() > 0.5 ? currentPalette[0] : currentPalette[2];
          }
      } else if (shape === ShapeType.CAKE) {
          if (i > count * 0.95) {
             c = currentPalette[2]; 
          } else if (i > count * 0.8) {
             c = currentPalette[1]; 
          } else {
             c = currentPalette[0]; 
          }
      } else if (shape === ShapeType.HEART) {
          // Use brighter distribution
          if (r < 0.4) c = currentPalette[0]; // Red
          else if (r < 0.8) c = currentPalette[1]; // Deep Pink
          else c = currentPalette[2]; // Light Pink (Highlight)
      } else {
          if (r < 0.5) c = currentPalette[1]; 
          else if (r < 0.8) c = currentPalette[0]; 
          else c = currentPalette[2]; 
      }

      colorArray[i * 3] = c.r;
      colorArray[i * 3 + 1] = c.g;
      colorArray[i * 3 + 2] = c.b;

      // --- SIZES ---
      if (shape === ShapeType.TEXT) {
          sizeArray[i] = 0.12 + Math.random() * 0.04; 
      } else {
          const sRand = Math.random();
          if (sRand > 0.995) {
              sizeArray[i] = Math.random() * 0.25 + 0.15; // Flares
          } else if (sRand > 0.95) {
              sizeArray[i] = Math.random() * 0.1 + 0.08; // Medium
          } else {
              sizeArray[i] = Math.random() * 0.04 + 0.015; // Dust
          }
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

  // FORCE UPDATE
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
    const shapeElapsed = time - shapeStartTimeRef.current; // Time since this shape appeared

    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = time;
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

      // SLOWED DOWN FLOAT SPEED FOR DREAMY VIBE
      const floatSpeed = 0.05; 
      
      tx += Math.sin(time * 0.2 + ty * 0.4) * 0.05 * floatSpeed;
      ty += Math.cos(time * 0.15 + tx * 0.4) * 0.05 * floatSpeed;
      tz += Math.sin(time * 0.18 + tx * 0.2) * 0.05 * floatSpeed;

      if (!isTextMode) {
        // --- Independent Particle Rotation (ONLY for non-text) ---
        const rotFreq = 0.15; 
        const rotAmp = 0.12; 
        const rotPhase = i * 0.137; 
        
        tx += Math.cos(time * rotFreq + rotPhase) * rotAmp;
        ty += Math.sin(time * rotFreq + rotPhase) * rotAmp;
        tz += Math.sin(time * rotFreq * 0.7 + rotPhase) * rotAmp;
      } else {
        // --- Text Wave Effect ---
        tz += Math.sin(time * 1.2 + tx * 0.3) * 0.3;
      }

      if (isScatter) {
        const angle = Math.atan2(ty, tx) + time * 1.5;
        const radius = Math.sqrt(tx*tx + ty*ty) * (3 + Math.sin(time * 2));
        tx = Math.cos(angle) * radius * 2.5;
        ty = Math.sin(angle) * radius * 2.5;
        tz *= 4; 
      }

      const dx = mouseX - positions[ix];
      const dy = mouseY - positions[iy];
      const distSq = dx*dx + dy*dy;
      const interactionRadius = 3.5; 
      
      if (distSq < interactionRadius * interactionRadius) {
          const dist = Math.sqrt(distSq);
          const force = (interactionRadius - dist) / interactionRadius; 
          const angle = Math.atan2(dy, dx);
          
          tx -= Math.cos(angle) * force * 1.2;
          ty -= Math.sin(angle) * force * 1.2;
          tz += force * 0.8; 
      }

      const lerpFactor = isScatter ? 0.02 : 0.06; // Slightly slower lerp for smoothness
      
      positions[ix] += (tx - positions[ix]) * lerpFactor;
      positions[iy] += (ty - positions[iy]) * lerpFactor;
      positions[iz] += (tz - positions[iz]) * lerpFactor;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // --- Global Rotation Logic ---
    if (shape === ShapeType.TEXT) {
       pointsRef.current.lookAt(state.camera.position);
    } else if (shape === ShapeType.SATURN) {
       pointsRef.current.rotation.x = 0.1;
       pointsRef.current.rotation.y = shapeElapsed * 0.04; // Slower rotation
       pointsRef.current.rotation.z = 0.05;
    } else {
       pointsRef.current.rotation.x = 0; 
       const initialY = Math.PI * 0.15; 
       pointsRef.current.rotation.y = initialY + shapeElapsed * 0.06; // Slower rotation
       pointsRef.current.rotation.z = Math.sin(time * 0.08) * 0.03;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={currentPositions.length / 3}
          array={currentPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-customColor"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        attach="material"
        args={[particleShader]}
        uniforms={{
          uTime: { value: 0 }
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending} 
      />
    </points>
  );
};

export default Particles;