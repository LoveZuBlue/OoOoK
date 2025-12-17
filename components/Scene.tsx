
import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import Particles from './Particles';
import FloatingPetals from './FloatingPetals';
import SolidScroll from './SolidScroll';
import { ShapeType } from '../types';

interface SceneProps {
  currentShape: ShapeType;
  isScatter: boolean;
  isShaking?: boolean;
}

// Custom Shader Material for smooth background transition
const BackgroundShaderMaterial = {
    uniforms: {
        uColor1A: { value: new THREE.Color('#020005') },
        uColor1B: { value: new THREE.Color('#2d1b4e') },
        // UPDATED: Pink tones instead of Purple
        uColor2A: { value: new THREE.Color('#FFF5F7') }, // Very Light Pink / Whiteish
        uColor2B: { value: new THREE.Color('#FFB6C1') }, // Light Pink / Peach
        uProgress: { value: 0 }, 
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor1A;
      uniform vec3 uColor1B;
      uniform vec3 uColor2A;
      uniform vec3 uColor2B;
      uniform float uProgress;
      varying vec2 vUv;

      void main() {
        // Gradient logic: Top (1.0) to Bottom (0.0)
        float y = vUv.y;
        
        vec3 darkGrad = mix(uColor1B, uColor1A, y); // Dark mode
        vec3 lightGrad = mix(uColor2B, uColor2A, y); // Light mode (Romantic Pink)

        vec3 finalColor = mix(darkGrad, lightGrad, uProgress);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
};

const SmoothBackground = ({ isOpen }: { isOpen: boolean }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const shaderRef = useRef<THREE.ShaderMaterial>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.02;
        }
        if (shaderRef.current) {
            // Smoothly interpolate uProgress
            const target = isOpen ? 1.0 : 0.0;
            shaderRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
                shaderRef.current.uniforms.uProgress.value,
                target,
                delta * 1.5 
            );
        }
    });

    return (
        <mesh ref={meshRef} scale={[80, 80, 80]} position={[0, 0, 0]}>
            <sphereGeometry args={[1, 64, 64]} />
            <shaderMaterial 
                ref={shaderRef} 
                args={[BackgroundShaderMaterial]} 
                side={THREE.BackSide} 
                depthWrite={false} 
                toneMapped={false} 
            />
        </mesh>
    );
};

const SceneContent: React.FC<SceneProps> = ({ currentShape, isScatter, isShaking }) => {
    const isScrollOpen = currentShape === ShapeType.SCROLL;
    const { scene } = useThree();
    const controlsRef = useRef<any>(null);
    
    // Light Refs for interpolation
    const ambientRef = useRef<THREE.AmbientLight>(null);
    const dirLightRef = useRef<THREE.DirectionalLight>(null);
    const pointLightRef = useRef<THREE.PointLight>(null);
    const spotLightRef = useRef<THREE.SpotLight>(null);

    // Initial Fog Setup
    useEffect(() => {
        scene.fog = new THREE.Fog('#18002b', 15, 60);
    }, [scene]);

    useFrame((state, delta) => {
        const lerpSpeed = delta * 1.5;

        // 1. Fog Transition
        if (scene.fog) {
            const fog = scene.fog as THREE.Fog;
            // Target colors
            const cDark = new THREE.Color('#18002b');
            const cLight = new THREE.Color('#FFC0CB'); // Pink fog
            
            // Lerp Color
            if (isScrollOpen) fog.color.lerp(cLight, lerpSpeed);
            else fog.color.lerp(cDark, lerpSpeed);

            // Lerp Near/Far
            const targetNear = isScrollOpen ? 20 : 15;
            const targetFar = isScrollOpen ? 90 : 60;
            fog.near = THREE.MathUtils.lerp(fog.near, targetNear, lerpSpeed);
            fog.far = THREE.MathUtils.lerp(fog.far, targetFar, lerpSpeed);
        }

        // 2. Light Intensities
        if (ambientRef.current) {
            const targetInt = isScrollOpen ? 2.5 : 0.4;
            ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, targetInt, lerpSpeed);
        }
        
        if (dirLightRef.current) {
            const targetInt = isScrollOpen ? 2.0 : 1.5;
            dirLightRef.current.intensity = THREE.MathUtils.lerp(dirLightRef.current.intensity, targetInt, lerpSpeed);
        }

        // 3. Scroll Reading Lights (Fade in/out)
        const readingLightTarget = isScrollOpen ? 1 : 0;
        if (pointLightRef.current) {
            pointLightRef.current.intensity = THREE.MathUtils.lerp(pointLightRef.current.intensity, isScrollOpen ? 1.5 : 0, lerpSpeed);
        }
        if (spotLightRef.current) {
            spotLightRef.current.intensity = THREE.MathUtils.lerp(spotLightRef.current.intensity, isScrollOpen ? 5.0 : 0, lerpSpeed);
        }

        // 4. Camera Reset (Fix tilt)
        if (isScrollOpen) {
             const targetPos = new THREE.Vector3(0, 0, 25);
             // Use a slightly faster speed for camera snap so it feels responsive but smooth
             state.camera.position.lerp(targetPos, delta * 2);
             
             if (controlsRef.current) {
                 // Ensure we look at center
                 controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), delta * 2);
                 controlsRef.current.update();
             }
        }
    });

    return (
        <>
            <SmoothBackground isOpen={isScrollOpen} />
            
            <ambientLight ref={ambientRef} intensity={0.4} />
            <directionalLight ref={dirLightRef} position={[10, 10, 10]} intensity={1.5} color="#FFD700" />
            
            {/* Extra "Reading Lights" - Always present but intensity animated */}
            <pointLight ref={pointLightRef} position={[0, 5, 10]} intensity={0} color="#FFF0F5" distance={50} decay={2} />
            <spotLight 
                ref={spotLightRef}
                position={[0, 20, 20]} 
                intensity={0} 
                angle={0.5} 
                penumbra={1} 
                color="#ffffff" 
            />
            
            {/* Stars: Fade out slightly in scroll mode via Fog */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={0.5} />
            
            {/* Sparkles */}
            <Sparkles 
                count={isScrollOpen ? 300 : 200} 
                scale={30} 
                size={isScrollOpen ? 5 : 3} 
                speed={0.3} 
                opacity={isScrollOpen ? 0.6 : 0.4} 
                color={isScrollOpen ? "#FFF" : "#ffc4dd"} 
            />

            <Particles shape={currentShape} isScatter={isScatter} isShaking={isShaking} />
            
            <SolidScroll isOpen={isScrollOpen} />
            
            <FloatingPetals currentShape={currentShape} isScatter={isScatter} />
            
            <EffectComposer disableNormalPass>
                <Bloom 
                    luminanceThreshold={isScrollOpen ? 0.8 : 0.15} 
                    luminanceSmoothing={0.9} 
                    intensity={isScrollOpen ? 0.3 : 1.2} 
                    radius={0.8} 
                    mipmapBlur 
                />
                <Vignette eskil={false} offset={0.1} darkness={isScrollOpen ? 0.2 : 0.6} />
            </EffectComposer>

            <OrbitControls 
                ref={controlsRef}
                enableZoom={!isScrollOpen} 
                enablePan={false} 
                enableRotate={!isScrollOpen} // IMPORTANT: Disable rotation when scroll is open for mobile touch dragging
                zoomSpeed={0.5}
                rotateSpeed={0.4} 
                maxDistance={50}
                minDistance={5}
            />
        </>
    );
};

const Scene: React.FC<SceneProps> = (props) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 25], fov: 50 }}
      dpr={[1, 2]} 
      className="w-full h-full block"
      gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }} 
    >
        <SceneContent {...props} />
    </Canvas>
  );
};

export default Scene;
