
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface SolidScrollProps {
  isOpen: boolean;
}

// --- Bunny Slider Component (Cartoon Rabbit Head) ---
const BunnySlider = ({ handleRef, visible }: { handleRef: React.RefObject<THREE.Group | null>, visible: boolean }) => {
  const trackHeight = 13; 

  // Materials
  const materials = useMemo(() => ({
    // Matte White Fur (Soft like ceramic/plush)
    whiteFur: new THREE.MeshPhysicalMaterial({ 
        color: '#FFFFFF', 
        roughness: 0.4, 
        metalness: 0.0,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2
    }),
    // Soft Pink for inner ears/nose
    pinkSoft: new THREE.MeshStandardMaterial({ 
        color: '#FFB7C5', // Cherry Blossom Pink
        roughness: 0.5 
    }),
    // Black eyes
    eyes: new THREE.MeshStandardMaterial({
        color: '#000000',
        roughness: 0.1,
        metalness: 0.5
    }),
    // NEW: Blue Scarf Material (Soft Fabric)
    blueScarf: new THREE.MeshStandardMaterial({
        color: '#89CFF0', // Baby Blue
        roughness: 0.9,
        metalness: 0.0,
        flatShading: false
    }),
    // NEW: Darker Blue for Scarf Detail/Shadow
    blueScarfDark: new THREE.MeshStandardMaterial({
        color: '#5CACEE',
        roughness: 0.9
    }),
    // Pink Ornament Material (Glossy) for Track
    pinkOrnament: new THREE.MeshPhysicalMaterial({
        color: '#FF69B4', // HotPink
        roughness: 0.2,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    })
  }), []);

  return (
    <group position={[7.2, 0, 0.5]} visible={visible}>
       {/* 1. Track */}
       <mesh position={[0, 0, -0.2]}>
         <cylinderGeometry args={[0.03, 0.03, trackHeight, 16]} />
         <meshStandardMaterial color="#FFC0CB" transparent opacity={0.4} />
       </mesh>

       {/* Top Ornament - Pink */}
       <mesh position={[0, trackHeight/2 + 0.3, -0.1]} material={materials.pinkOrnament}>
           <sphereGeometry args={[0.3, 32, 32]} />
       </mesh>
       {/* Bottom Ornament - Pink */}
       <mesh position={[0, -trackHeight/2 - 0.3, -0.1]} material={materials.pinkOrnament}>
           <sphereGeometry args={[0.3, 32, 32]} />
       </mesh>

       {/* 2. The Slider Handle: Bunny Head */}
       <group ref={handleRef}>
          {/* Base Group to center the bunny on the handle point */}
          {/* Rotated -0.3 rad (approx 17 deg) around Y to face the camera from the right side */}
          <group rotation={[0, -0.3, 0]} position={[0, 0, 0]}> 
            
            {/* Head */}
            <mesh material={materials.whiteFur}>
                <sphereGeometry args={[0.35, 32, 32]} />
            </mesh>

            {/* Ears */}
            {/* Left Ear */}
            <group position={[-0.2, 0.25, 0]} rotation={[0, 0, 0.3]}>
                <mesh position={[0, 0.3, 0]} material={materials.whiteFur}>
                    <capsuleGeometry args={[0.1, 0.6, 4, 16]} />
                </mesh>
                {/* Inner Pink */}
                <mesh position={[0, 0.25, 0.08]} rotation={[-0.1, 0, 0]} material={materials.pinkSoft}>
                    <capsuleGeometry args={[0.06, 0.4, 4, 16]} />
                </mesh>
            </group>
            {/* Right Ear */}
            <group position={[0.2, 0.25, 0]} rotation={[0, 0, -0.3]}>
                <mesh position={[0, 0.3, 0]} material={materials.whiteFur}>
                    <capsuleGeometry args={[0.1, 0.6, 4, 16]} />
                </mesh>
                {/* Inner Pink */}
                <mesh position={[0, 0.25, 0.08]} rotation={[-0.1, 0, 0]} material={materials.pinkSoft}>
                    <capsuleGeometry args={[0.06, 0.4, 4, 16]} />
                </mesh>
            </group>

            {/* Face */}
            {/* Eyes */}
            <mesh position={[-0.12, 0.05, 0.28]} material={materials.eyes}>
                <sphereGeometry args={[0.04, 16, 16]} />
            </mesh>
            <mesh position={[0.12, 0.05, 0.28]} material={materials.eyes}>
                <sphereGeometry args={[0.04, 16, 16]} />
            </mesh>

            {/* Nose */}
            <mesh position={[0, 0, 0.32]} material={materials.pinkSoft}>
                <sphereGeometry args={[0.035, 16, 16]} />
            </mesh>
            
            {/* Cheeks (Blush) */}
            <mesh position={[-0.18, -0.05, 0.25]} material={materials.pinkSoft}>
                <sphereGeometry args={[0.05, 16, 16]} />
            </mesh>
            <mesh position={[0.18, -0.05, 0.25]} material={materials.pinkSoft}>
                <sphereGeometry args={[0.05, 16, 16]} />
            </mesh>

            {/* --- REFINED BLUE SCARF --- */}
            {/* Main Wrap (Thick & Fluffy) */}
            <mesh position={[0, -0.32, 0]} rotation={[Math.PI/2, 0, 0]} material={materials.blueScarf}>
                <torusGeometry args={[0.21, 0.08, 16, 32]} />
            </mesh>
            
            {/* Scarf Knot & Tails (Hanging to the side) */}
            <group position={[0.12, -0.35, 0.18]} rotation={[0, 0, -0.2]}>
                 {/* The Knot */}
                 <mesh material={materials.blueScarfDark}>
                     <sphereGeometry args={[0.1, 16, 16]} />
                 </mesh>
                 
                 {/* Tail 1 (Longer) */}
                 <mesh position={[0.02, -0.18, 0.02]} rotation={[0.2, 0, -0.1]} material={materials.blueScarf}>
                     <boxGeometry args={[0.14, 0.35, 0.05]} />
                 </mesh>
                 
                 {/* Tail 2 (Shorter/Behind) */}
                 <mesh position={[-0.05, -0.15, -0.02]} rotation={[0, 0, 0.1]} material={materials.blueScarfDark}>
                     <boxGeometry args={[0.12, 0.28, 0.05]} />
                 </mesh>
            </group>

          </group>
       </group>
    </group>
  );
};

const LETTER_CONTENT = `宝宝，在给你写这封信之前，我时常在脑海里酝酿着很多话想跟你讲，有时又在计较斟酌。这是陪你过的第一个生日，好遗憾没有机会和你一起庆祝，只能选择这个方式来表达了。我嘴巴笨笨的，也不太擅长表达，有100%的情感也可能只能表达出60%的样子。

我知道你最不缺的就是祝福了，每一个爱你的人恨不得在许下的愿望里都把你带上，同时还要期盼世界可以多爱你一点，再多一点。每年的十二月都因为你变得特别，每一年的今天都是属于你的，所以我期待。

时常觉得，你像是冬日旷野中炙热燃烧的篝火，将寒意一寸寸逼至角落。其实我不喜欢冬天，但是你的到来，冬天开始变得有意义。在我早已习惯了克制与疏离的世界里，你是我难得想要一读再读的诗篇。

我爱你便会爱你的一切，爱你的坚强勇敢，爱你的抽象，爱你的破碎，爱你如阳光般的明媚，偶尔看你小嘴刻薄的时候也觉得很可爱。我爱的是你本身，而不是怎样的你，这个世界上没有完美的人，我爱你的每一面，你在我这里值得拥有最好的东西和爱。

在哈尔滨和你一起的那几天超级超级开心，或者说，没有你的哈尔滨其实对我来将并没有太大意义，有你才是最重要的。希望下次见面的日子能快速来临。

此刻我还有好多话想跟你讲，但是塞不下了呜呜呜...

愿无数晶莹的雪花都化作轻盈的信笺，替我将未表达完的爱徐徐落满你的心间。愿所有的凛冽与寒风，都在触碰到你名字的那一刻，化作温柔的雪色。

我祝愿你的新岁，依然被明亮和幸福包围。

我很想你，真的很想你。

生日快乐，何子豪。`;

const SolidScroll: React.FC<SolidScrollProps> = ({ isOpen }) => {
  const [phase, setPhase] = useState(0);
  const [scrollValue, setScrollValue] = useState(0);
  const scrollRef = useRef(0);
  const { gl } = useThree();

  const groupRef = useRef<THREE.Group>(null);
  const topRollerRef = useRef<THREE.Mesh>(null);
  const bottomRollerRef = useRef<THREE.Mesh>(null);
  const paperRef = useRef<THREE.Mesh>(null);
  
  const sliderHandleRef = useRef<THREE.Group>(null);

  // --- Animation Sequence ---
  useEffect(() => {
    if (isOpen) {
      setPhase(1);
      setScrollValue(0);
      scrollRef.current = 0;
      const t1 = setTimeout(() => setPhase(2), 1000);
      const t2 = setTimeout(() => setPhase(3), 2500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setPhase(0);
    }
  }, [isOpen]);

  // --- Mobile & Mouse Interaction (Drag Canvas) ---
  useEffect(() => {
    // 1. Wheel Interaction
    const handleWheel = (e: WheelEvent) => {
      if (phase !== 3) return;
      e.preventDefault();
      const delta = e.deltaY * 0.0005; 
      scrollRef.current = THREE.MathUtils.clamp(scrollRef.current + delta, 0, 1);
      setScrollValue(scrollRef.current);
    };

    // Shared Drag State
    let startY = 0;
    let isDragging = false;

    // 2. Touch Interaction (Mobile)
    const handleTouchStart = (e: TouchEvent) => { 
        startY = e.touches[0].clientY; 
        isDragging = true;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (phase !== 3 || !isDragging) return;
      // Prevent browser scroll refresh
      if(e.cancelable) e.preventDefault(); 
      
      const currentY = e.touches[0].clientY;
      // Sensitivity: 0.0025 means moving 400px = full scroll.
      const deltaY = (startY - currentY) * 0.0025; 
      
      scrollRef.current = THREE.MathUtils.clamp(scrollRef.current + deltaY, 0, 1);
      setScrollValue(scrollRef.current);
      startY = currentY;
    };

    const handleTouchEnd = () => {
        isDragging = false;
    };

    // 3. Mouse Interaction (Desktop Drag)
    const handleMouseDown = (e: MouseEvent) => {
        if (phase !== 3) return;
        isDragging = true;
        startY = e.clientY;
        gl.domElement.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (phase !== 3 || !isDragging) return;
        e.preventDefault();
        
        const currentY = e.clientY;
        const deltaY = (startY - currentY) * 0.0025;
        
        scrollRef.current = THREE.MathUtils.clamp(scrollRef.current + deltaY, 0, 1);
        setScrollValue(scrollRef.current);
        startY = currentY;
    };

    const handleMouseUp = () => {
        isDragging = false;
        gl.domElement.style.cursor = 'default';
    };

    const canvas = gl.domElement;
    
    // Attach Listeners
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    // Touch
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    
    // Mouse
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove); // Window to catch drag outside
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);

      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [phase, gl]);

  // --- Texture Generation ---
  const scrollTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const w = 1250; 
    const h = 4000; 
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 1. Background: MAX BRIGHTNESS with PINK
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#FFFFFF');    
      grad.addColorStop(0.85, '#FFFFFF'); 
      grad.addColorStop(1, '#FFB6C1');    
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // 2. Patterns
      ctx.fillStyle = 'rgba(255, 182, 193, 0.15)'; 
      for (let py = 0; py < h; py += 120) {
           for (let px = 0; px < w; px += 120) {
               ctx.beginPath();
               const ox = (py % 240 === 0) ? 60 : 0;
               ctx.arc(px + ox, py, 10, 0, Math.PI * 2);
               ctx.fill();
           }
      }

      // 3. Borders 
      const margin = 55;
      ctx.strokeStyle = 'rgba(255, 105, 180, 0.2)'; 
      ctx.lineWidth = 15;
      ctx.setLineDash([20, 15]); 
      ctx.strokeRect(margin, margin, w - margin*2, h - margin*2);
      ctx.setLineDash([]); 

      ctx.strokeStyle = '#DAA520'; 
      ctx.lineWidth = 4;
      ctx.strokeRect(margin + 20, margin + 20, w - (margin*2 + 40), h - (margin*2 + 40));

      // 4. Content
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      ctx.fillStyle = '#C71585'; 
      ctx.font = '700 110px "STKaiti", "KaiTi", serif'; 
      ctx.fillText("见字如面", w/2, 110); 
      
      ctx.beginPath();
      ctx.moveTo(380, 260);
      ctx.lineTo(w-380, 260);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#DB7093'; 
      ctx.stroke();

      ctx.fillStyle = '#2A0A0A'; 
      ctx.font = '600 52px "STKaiti", "KaiTi", serif'; 
      ctx.textAlign = 'left';

      const padding = 140; 
      const maxWidth = w - padding * 2;
      
      let y = 320; 
      const lineHeight = 65; 
      const paraGap = 35;   

      const paragraphs = LETTER_CONTENT.split('\n');
      
      paragraphs.forEach(para => {
        if (!para.trim()) {
           y += paraGap; 
           return;
        }
        
        const chars = para.split('');
        let line = '';
        let isFirstLine = true;
        
        for (let i = 0; i < chars.length; i++) {
           const test = line + chars[i];
           const indent = (isFirstLine) ? 80 : 0; 
           const xOffset = padding + indent;
           const effectiveWidth = maxWidth - indent;

           if (ctx.measureText(test).width > effectiveWidth && i > 0) {
               ctx.fillText(line, xOffset, y);
               line = chars[i];
               y += lineHeight;
               isFirstLine = false;
           } else {
               line = test;
           }
        }
        const indent = (isFirstLine) ? 80 : 0;
        ctx.fillText(line, padding + indent, y);
        y += lineHeight + paraGap; 
      });

      // --- SIGNATURE SECTION ---
      y += 60; 
      ctx.textAlign = 'right'; 
      
      ctx.font = 'italic bold 150px "Times New Roman", "Georgia", serif';
      ctx.fillStyle = '#D63384'; 
      ctx.fillText("J", w - 240, y + 40);

      ctx.save();
      ctx.translate(w - 170, y + 20); 
      ctx.rotate(0.2); 
      ctx.scale(1.2, 1.2); 
      
      ctx.beginPath();
      ctx.fillStyle = '#FF1493'; 
      
      const hx = 0; const hy = 0;
      ctx.moveTo(hx, hy);
      ctx.bezierCurveTo(hx - 25, hy - 25, hx - 50, hy + 0, hx, hy + 40);
      ctx.bezierCurveTo(hx + 50, hy + 0, hx + 25, hy - 25, hx, hy);
      ctx.fill();
      
      ctx.restore();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    tex.flipY = true; 
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  // --- Materials ---
  const materials = useMemo(() => ({
    roller: new THREE.MeshStandardMaterial({
      color: '#FFB6C1', 
      roughness: 0.3,
      metalness: 0.2,   
      emissive: '#FF69B4', 
      emissiveIntensity: 0.4
    }),
    paper: new THREE.MeshBasicMaterial({ 
      map: scrollTexture,
      side: THREE.DoubleSide,
      transparent: true,
      color: '#FFFFFF',
      toneMapped: false 
    }),
    knob: new THREE.MeshPhysicalMaterial({
      color: '#C71585', 
      roughness: 0.2,
      metalness: 0.2,
      clearcoat: 1.0
    })
  }), [scrollTexture]);

  useFrame((state, delta) => {
    // Unroll Animation
    if (phase >= 2) {
        const unrollSpeed = delta * 1.5;
        const limit = 7.8; 
        
        if (topRollerRef.current) {
            topRollerRef.current.position.y = THREE.MathUtils.lerp(topRollerRef.current.position.y, limit, unrollSpeed);
        }
        if (bottomRollerRef.current) {
            bottomRollerRef.current.position.y = THREE.MathUtils.lerp(bottomRollerRef.current.position.y, -limit, unrollSpeed);
        }
        if (paperRef.current) {
            paperRef.current.scale.y = THREE.MathUtils.lerp(paperRef.current.scale.y, limit * 2, unrollSpeed);
        }
    }

    // Texture Scrolling
    if (phase === 3 && scrollTexture) {
         const viewRatio = 0.40; 
         scrollTexture.repeat.set(1, viewRatio);
         
         const targetOffset = (1 - viewRatio) * (1 - scrollValue);
         scrollTexture.offset.y = THREE.MathUtils.lerp(scrollTexture.offset.y, targetOffset, delta * 8);
         
         // Animate Slider Handle
         if (sliderHandleRef.current) {
             const trackH = 13;
             const targetY = (trackH / 2) - (scrollRef.current * trackH);
             sliderHandleRef.current.position.y = THREE.MathUtils.lerp(sliderHandleRef.current.position.y, targetY, delta * 10);
         }
    }
  });

  return (
    <group ref={groupRef} visible={isOpen}>
       <group position={[0, 0, 0]}> {/* Center Group */}
          
          {/* Top Roller */}
          <group ref={topRollerRef} position={[0, 0, 0.1]}>
             <mesh material={materials.roller} rotation={[0, 0, Math.PI/2]}>
                 <cylinderGeometry args={[0.22, 0.22, 12.0, 32]} />
             </mesh>
             <mesh position={[6.1, 0, 0]} material={materials.knob} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.32, 0.32, 0.2, 32]} />
             </mesh>
             <mesh position={[-6.1, 0, 0]} material={materials.knob} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.32, 0.32, 0.2, 32]} />
             </mesh>
             <mesh position={[5.95, 0, 0]} material={materials.roller} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
             </mesh>
             <mesh position={[-5.95, 0, 0]} material={materials.roller} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
             </mesh>
          </group>

          {/* Paper */}
          <mesh ref={paperRef} material={materials.paper} position={[0, 0, 0]} scale={[1, 0, 1]}>
              <planeGeometry args={[11.5, 1]} /> 
          </mesh>

          {/* Bottom Roller */}
          <group ref={bottomRollerRef} position={[0, 0, 0.1]}>
             <mesh material={materials.roller} rotation={[0, 0, Math.PI/2]}>
                 <cylinderGeometry args={[0.22, 0.22, 12.0, 32]} />
             </mesh>
             <mesh position={[6.1, 0, 0]} material={materials.knob} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.32, 0.32, 0.2, 32]} />
             </mesh>
             <mesh position={[-6.1, 0, 0]} material={materials.knob} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.32, 0.32, 0.2, 32]} />
             </mesh>
             <mesh position={[5.95, 0, 0]} material={materials.roller} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
             </mesh>
             <mesh position={[-5.95, 0, 0]} material={materials.roller} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
             </mesh>
          </group>
          
          {/* BUNNY SLIDER */}
          <BunnySlider handleRef={sliderHandleRef} visible={phase === 3} />

       </group>
       
       <pointLight position={[0, 0, 15]} intensity={1.0} distance={25} color="#FFFFFF" />
    </group>
  );
};

export default SolidScroll;
