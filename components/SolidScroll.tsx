import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SolidScrollProps {
  isOpen: boolean;
}

const SolidScroll: React.FC<SolidScrollProps> = ({ isOpen }) => {
  const groupRef = useRef<THREE.Group>(null);
  const paperMeshRef = useRef<THREE.Mesh>(null);
  const leftHandleRef = useRef<THREE.Group>(null);
  const rightHandleRef = useRef<THREE.Group>(null);
  const bgSphereRef = useRef<THREE.Mesh>(null);

  const [progress, setProgress] = useState(0);

  // --- PARCHMENT TEXTURE GENERATION (REFINED & BRIGHTER) ---
  const parchmentTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024; 
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 1. Base: Bright Creamy White (High-Class)
      ctx.fillStyle = '#FFFBF5'; 
      ctx.fillRect(0, 0, 1024, 1024);
      
      // 2. Diamond Dust / Pearl Texture
      for (let i = 0; i < 80000; i++) {
        const val = Math.random();
        // Subtle gold/pink speckles instead of brown dirt
        ctx.fillStyle = val > 0.5 ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 192, 203, 0.15)';
        ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
      }
      
      // 3. Silk Fibers
      for (let i = 0; i < 300; i++) {
         ctx.strokeStyle = 'rgba(255, 228, 225, 0.4)'; // Misty Rose fibers
         ctx.lineWidth = 1;
         ctx.beginPath();
         const x = Math.random() * 1024;
         const y = Math.random() * 1024;
         ctx.moveTo(x, y);
         ctx.quadraticCurveTo(
             x + Math.random()*30-15, y + Math.random()*30-15, 
             x + Math.random()*60-30, y + Math.random()*60-30
         );
         ctx.stroke();
      }

      // 4. Soft Halo Edge (Clean, not dirty)
      const grd = ctx.createRadialGradient(512, 512, 300, 512, 512, 800);
      grd.addColorStop(0, 'rgba(255,255,255,0)');
      grd.addColorStop(1, 'rgba(255, 228, 196, 0.2)'); // Bisque fade
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 1024, 1024);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16; 
    return tex;
  }, []);

  // --- MATERIALS (HIGH END & CUTE) ---

  const paperMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: parchmentTexture,
    color: '#FFFFFF', // Pure White Base
    emissive: '#FFFAF0', // FloralWhite
    emissiveIntensity: 0.6, // Higher self-illumination for brightness
    roughness: 0.4,   // Smoother paper, less rough
    metalness: 0.1,   // Slight sheen
    side: THREE.DoubleSide,
  }), [parchmentTexture]);

  const handleMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFB6C1', // LightPink
    roughness: 0.15,  // Polished plastic/gem look
    metalness: 0.4,
    emissive: '#FF69B4', // HotPink glow
    emissiveIntensity: 0.4,
  }), []);

  const knobMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFD700', // Gold
    roughness: 0.05,  // Mirror finish
    metalness: 1.0,   // Real gold look
    emissive: '#FFA500', 
    emissiveIntensity: 0.6,
  }), []);

  // --- BACKGROUND SHADER: "STARLIGHT GLITTER DREAM" ---
  // Upgraded for sparkle, depth, and vibrant colors
  const nebulaMaterial = useMemo(() => new THREE.ShaderMaterial({
      uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0 },
          // Vibrant Palette
          uColorTop: { value: new THREE.Color("#190028") }, // Rich Deep Plum
          uColorBottom: { value: new THREE.Color("#000000") }, // Void
          uCloudColor1: { value: new THREE.Color("#FF00CC") }, // Electric Magenta
          uCloudColor2: { value: new THREE.Color("#00FFFF") }, // Cyan for magical contrast
          uGlitterColor: { value: new THREE.Color("#FFFFFF") }, // Diamond Sparkle
      },
      side: THREE.BackSide, 
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPos;
        void main() {
          vUv = uv;
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        uniform vec3 uColorTop;
        uniform vec3 uColorBottom;
        uniform vec3 uCloudColor1;
        uniform vec3 uCloudColor2;
        uniform vec3 uGlitterColor;
        varying vec2 vUv;
        varying vec3 vPos;

        // --- Noise Functions ---
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 = v - i + dot(i, C.xxx) ;
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy; 
          vec3 x3 = x0 - D.yyy;      
          i = mod289(i);
          vec4 p = permute( permute( permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
          float n_ = 0.142857142857; 
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z); 
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );   
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }

        // Random for glitter
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
            vec3 pos = normalize(vPos);
            vec2 uv = vUv;
            
            // 1. RICH GRADIENT
            // Create a diagonal gradient for more dynamism
            float gradFactor = (uv.y + uv.x * 0.2) * 1.2;
            vec3 bg = mix(uColorBottom, uColorTop, smoothstep(0.0, 1.2, gradFactor));

            // 2. ETHEREAL CLOUDS (Multi-layered FBM)
            float t = uTime * 0.1;
            float n1 = snoise(pos * 2.5 + vec3(t, 0.0, t * 0.2));
            float n2 = snoise(pos * 5.0 - vec3(0.0, t * 0.5, 0.0));
            
            // Softer cloud mixing
            float cloudMask = smoothstep(0.2, 0.9, n1 * 0.5 + n2 * 0.5);
            
            // Iridescent Cloud Colors
            vec3 cMix = mix(uCloudColor2, uCloudColor1, n1 * 0.5 + 0.5);
            // Additive blending for glow
            bg += cMix * cloudMask * 0.3; 

            // 3. GLITTER / FAIRY DUST (The "High-Class Sparkle")
            // Use view position to make glitter twinkle based on angle/movement
            vec2 grid = vPos.xy * 25.0; // High density
            vec2 id = floor(grid);
            
            float r = random(id);
            // Sparkle logic: Only some cells sparkle, and they pulse with time
            float sparkleMask = step(0.96, r); // Top 4% are glitter
            
            float shine = sin(uTime * 10.0 + r * 100.0) * 0.5 + 0.5;
            shine = pow(shine, 4.0); // Sharp blink
            
            // Glitter color (White/Gold)
            bg += uGlitterColor * sparkleMask * shine * 0.8;


            // 4. BOKEH HIGHLIGHTS (Dreamy feel)
            float bokehT = uTime * 0.05;
            float d1 = length(uv - vec2(0.5 + sin(bokehT)*0.3, 0.5 + cos(bokehT)*0.2));
            float b1 = smoothstep(0.6, 0.0, d1);
            bg += uCloudColor1 * b1 * 0.15; // Subtle pink glow in center

            gl_FragColor = vec4(bg, uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false, 
  }), []);

  useFrame((state, delta) => {
    if (isOpen) {
      if (progress < 1) {
         setProgress(p => Math.min(p + delta * 0.8, 1));
      }
    } else {
        if (progress > 0) setProgress(0);
    }

    if (paperMeshRef.current && leftHandleRef.current && rightHandleRef.current) {
        const maxWidth = 16;
        const currentWidth = Math.max(0.2, progress * maxWidth);
        
        // Scale Paper Width (X)
        paperMeshRef.current.scale.set(currentWidth, 8, 1);
        
        const handleOffset = currentWidth / 2;
        leftHandleRef.current.position.x = -handleOffset;
        rightHandleRef.current.position.x = handleOffset;
        
        // Roll rotation (Spin handles)
        const rollAngle = -progress * Math.PI * 6;
        leftHandleRef.current.rotation.y = rollAngle;
        rightHandleRef.current.rotation.y = -rollAngle;
    }
    
    // Animate Nebula
    if (nebulaMaterial) {
        nebulaMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
        nebulaMaterial.uniforms.uOpacity.value = progress; // Fade in with scroll
    }
    
    if (groupRef.current) {
        const t = state.clock.getElapsedTime();
        // Gentle Float
        groupRef.current.position.y = Math.sin(t * 0.5) * 0.2;
        
        // --- FORCE FACE CAMERA ---
        groupRef.current.lookAt(state.camera.position);
    }
  });

  const renderHandle = (side: 'left' | 'right') => (
      <>
         {/* Main Rod */}
         <mesh material={handleMaterial} position={[0,0,0.1]}> 
             <cylinderGeometry args={[0.35, 0.35, 8.5, 32]} />
         </mesh>
         
         {/* Top Knob */}
         <mesh position={[0, 4.35, 0.1]} material={knobMaterial}>
             <sphereGeometry args={[0.6, 32, 32]} />
         </mesh>
         {/* Top Decoration Rings */}
         <mesh position={[0, 4.0, 0.1]} material={knobMaterial} rotation={[Math.PI/2, 0, 0]}>
             <torusGeometry args={[0.35, 0.05, 16, 32]} />
         </mesh>

         {/* Bottom Knob */}
         <mesh position={[0, -4.35, 0.1]} material={knobMaterial}>
             <sphereGeometry args={[0.6, 32, 32]} />
         </mesh>
         {/* Bottom Decoration Rings */}
         <mesh position={[0, -4.0, 0.1]} material={knobMaterial} rotation={[Math.PI/2, 0, 0]}>
             <torusGeometry args={[0.35, 0.05, 16, 32]} />
         </mesh>
      </>
  );

  return (
    <group ref={groupRef} visible={isOpen || progress > 0}>
      
      {/* 360 Degree Nebula Sphere (Large) */}
      <mesh ref={bgSphereRef} material={nebulaMaterial} scale={[1,1,1]}>
         <sphereGeometry args={[45, 64, 64]} />
      </mesh>

      {/* PAPER PLANE */}
      <mesh ref={paperMeshRef} material={paperMaterial} position={[0,0,0]}>
        <planeGeometry args={[1, 1, 64, 64]} />
      </mesh>

      {/* LEFT HANDLE */}
      <group ref={leftHandleRef}>
         {renderHandle('left')}
      </group>

      {/* RIGHT HANDLE */}
      <group ref={rightHandleRef}>
         {renderHandle('right')}
      </group>
      
      {/* High Intensity Lights for Bright Scroll */}
      <pointLight position={[0, 0, 8]} intensity={3.5} color="#FFFACD" distance={30} />
      <pointLight position={[0, 5, 5]} intensity={3.0} color="#FFB6C1" distance={20} />
      {/* Fill Light for Handles */}
      <pointLight position={[0, -5, 5]} intensity={1.5} color="#E6E6FA" distance={20} />
      <ambientLight intensity={1.2} color="#FFFFFF" />
    </group>
  );
};

export default SolidScroll;