
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface SolidScrollProps {
  isOpen: boolean;
}

const LETTER_CONTENT = `宝宝，在给你写这封信之前，我时常在脑海里酝酿着很多话想跟你讲，有时又在计较斟酌。这是陪你过的第一个生日，好遗憾没有机会和你一起庆祝，只能选择这个方式来表达了。我嘴巴笨笨的，也不太擅长表达，有100%的情感也可能只能表达出60%的样子。

我知道你最不缺的就是祝福了，每一个爱你的人恨不得在许下的愿望里都把你带上，同时还要期盼世界可以多爱你一点，再多一点。每年的十二月都因为你变得特别，每一年的今天都是属于你的，所以我期待。

时常觉得，你像是冬日旷野中炙热燃烧的篝火，将寒意一寸寸逼至角落。其实我不喜欢冬天，但是你的到来，冬天开始变得有意义。在我早已习惯了克制与疏离的世界里，你是我难得想要一读再读的诗篇。

我爱你便会爱你的一切，爱你的坚强勇敢，爱你的抽象，爱你的破碎，爱你如阳光般的明媚，偶尔看你小嘴刻薄的时候也觉得很可爱。我爱的是你本身，而不是怎样的你，这个世界上没有完美的人，我爱你的每一面，你在我这里值得拥有最好的东西和爱。

在哈尔滨和你一起的那几天超级超级开心，或者说，没有你的哈尔滨其实对我来将并没有太大意义，有你才是最重要的。希望下次见面的日子能快速来临。此刻我还有好多话想跟你讲，但是塞不下了呜呜呜...

愿无数晶莹的雪花都化作轻盈的信笺，替我将未表达完的爱徐徐落满你的心间。愿所有的凛冽与寒风，都在触碰到你名字的那一刻，化作温柔的雪色。

我祝愿你的新岁，依然被明亮和幸福包围。

我很想你，真的很想你。

生日快乐，何子豪。`;

const SolidScroll: React.FC<SolidScrollProps> = ({ isOpen }) => {
  // Animation State
  // 0: Hidden
  // 1: Appear (Closed Scroll)
  // 2: Unrolling
  // 3: Fully Open (Reading Mode)
  const [phase, setPhase] = useState(0);
  const [scrollValue, setScrollValue] = useState(0);
  const scrollRef = useRef(0);
  const { gl } = useThree();

  const groupRef = useRef<THREE.Group>(null);
  const topRollerRef = useRef<THREE.Mesh>(null);
  const bottomRollerRef = useRef<THREE.Mesh>(null);
  const paperRef = useRef<THREE.Mesh>(null);

  // --- Animation Sequence ---
  useEffect(() => {
    if (isOpen) {
      setPhase(1);
      setScrollValue(0);
      scrollRef.current = 0;

      // Start unrolling after 1 second
      const t1 = setTimeout(() => setPhase(2), 1000);
      // Finished unrolling after 2.5 seconds total
      const t2 = setTimeout(() => setPhase(3), 2500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setPhase(0);
    }
  }, [isOpen]);

  // --- Scroll Interaction ---
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (phase !== 3) return;
      e.preventDefault();
      const delta = e.deltaY * 0.0005; 
      scrollRef.current = THREE.MathUtils.clamp(scrollRef.current + delta, 0, 1);
      setScrollValue(scrollRef.current);
    };

    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const handleTouchMove = (e: TouchEvent) => {
      if (phase !== 3) return;
      const deltaY = (startY - e.touches[0].clientY) * 0.002;
      scrollRef.current = THREE.MathUtils.clamp(scrollRef.current + deltaY, 0, 1);
      setScrollValue(scrollRef.current);
      startY = e.touches[0].clientY;
    };

    const canvas = gl.domElement;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [phase, gl]);

  // --- Premium Cute Texture Generation ---
  const scrollTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    // Width: 1250 (Good resolution)
    const w = 1250; 
    const h = 4500; 
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 1. Background: Bright Warm Pink Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#FFF5F7');   // Lavender Blush (Top)
      grad.addColorStop(1, '#FFC1CC');   // Bubblegum Pink (Bottom)
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // 2. Cute Patterns (Polka Dots & Bows)
      // Polka Dots
      ctx.fillStyle = 'rgba(255, 182, 193, 0.4)'; // Light Pink Dots
      for (let py = 0; py < h; py += 120) {
           for (let px = 0; px < w; px += 120) {
               ctx.beginPath();
               // Offset every other row
               const ox = (py % 240 === 0) ? 60 : 0;
               ctx.arc(px + ox, py, 12, 0, Math.PI * 2);
               ctx.fill();
           }
      }

      // Mini Bows (Cute Print)
      ctx.fillStyle = 'rgba(255, 105, 180, 0.2)'; // Hot Pink Low Opacity
      const drawBow = (bx: number, by: number) => {
           ctx.beginPath();
           ctx.moveTo(bx, by);
           // Left loop
           ctx.bezierCurveTo(bx - 25, by - 25, bx - 25, by + 25, bx, by);
           // Right loop
           ctx.bezierCurveTo(bx + 25, by + 25, bx + 25, by - 25, bx, by);
           ctx.fill();
      };

      // Scatter bows randomly
      for(let i=0; i<60; i++) { 
          drawBow(Math.random() * w, Math.random() * h);
      }

      // 3. Borders (White Lace Effect)
      const margin = 55;
      
      // Lace background
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 15;
      ctx.setLineDash([20, 15]); // Dashed line simulates lace
      ctx.strokeRect(margin, margin, w - margin*2, h - margin*2);
      ctx.setLineDash([]); // Reset

      // Inner Solid Gold Line
      ctx.strokeStyle = '#D4AF37'; 
      ctx.lineWidth = 4;
      ctx.strokeRect(margin + 20, margin + 20, w - (margin*2 + 40), h - (margin*2 + 40));

      // 4. Content
      // Title
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#8B0000'; 
      ctx.font = '700 100px "STKaiti", "KaiTi", serif'; 
      ctx.fillText("见字如面", w/2, 120); 
      
      // Divider
      ctx.beginPath();
      ctx.moveTo(380, 250);
      ctx.lineTo(w-380, 250);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#FF69B4'; 
      ctx.stroke();

      // Body Text
      ctx.fillStyle = '#3E1010'; 
      ctx.font = '600 52px "STKaiti", "KaiTi", serif'; 
      ctx.textAlign = 'left';

      const padding = 140; 
      const maxWidth = w - padding * 2;
      
      // COMPACT LAYOUT SETTINGS
      let y = 300; 
      const lineHeight = 60; 
      const paraGap = 25;   

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

      // --- Elegant Signature Section ---
      y += 60; 
      ctx.textAlign = 'right'; 
      
      // 1. The "J" - Playfair Display Italic (Elegant, High-end)
      ctx.fillStyle = '#8B0000'; 
      ctx.font = 'italic 120px "Playfair Display", serif'; 
      ctx.fillText("J", w - 240, y + 20);
      
      // 2. The Heart - Custom Path (Not a dull unicode symbol)
      // Draw a tilted, stylized heart next to the J
      ctx.save();
      ctx.translate(w - 180, y - 10);
      ctx.rotate(0.2); // Tilted slightly for "stamp" look
      ctx.scale(1.2, 1.2);
      
      ctx.beginPath();
      ctx.fillStyle = '#FF1493';
      const hx = 0; const hy = 0;
      ctx.moveTo(hx, hy);
      ctx.bezierCurveTo(hx - 20, hy - 20, hx - 40, hy + 10, hx, hy + 35);
      ctx.bezierCurveTo(hx + 40, hy + 10, hx + 20, hy - 20, hx, hy);
      ctx.fill();
      ctx.restore();

    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    tex.flipY = true; 
    return tex;
  }, []);

  // --- Materials ---
  const materials = useMemo(() => ({
    roller: new THREE.MeshStandardMaterial({
      color: '#FFC0CB', 
      roughness: 0.3,
      metalness: 0.1,   
      emissive: '#FF69B4', 
      emissiveIntensity: 0.5 
    }),
    paper: new THREE.MeshBasicMaterial({ 
      map: scrollTexture,
      side: THREE.DoubleSide,
      transparent: true,
      color: '#FFFFFF' 
    }),
    knob: new THREE.MeshPhysicalMaterial({
      color: '#FF1493', 
      roughness: 0.2,
      metalness: 0.2,
      clearcoat: 1.0,
      emissive: '#FF1493',
      emissiveIntensity: 0.2
    })
  }), [scrollTexture]);

  useFrame((state, delta) => {
    // Unroll Animation
    if (phase >= 2) {
        const unrollSpeed = delta * 1.5;
        
        // HEIGHT ADJUSTMENT: 
        // Significant reduction for elegance.
        // Old: +/- 7.0 (Total 14).
        // New: +/- 5.5 (Total 11). Compact and refined.
        const limit = 5.5; 
        
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
         // View Ratio logic optimized for shorter physical scroll (11 units height)
         // vs 4500px texture.
         // Needs to be slightly larger than before to fill the frame nicely.
         const viewRatio = 0.28; 
         scrollTexture.repeat.set(1, viewRatio);
         
         const targetOffset = (1 - viewRatio) * (1 - scrollValue);
         scrollTexture.offset.y = THREE.MathUtils.lerp(scrollTexture.offset.y, targetOffset, delta * 8);
    }
  });

  return (
    <group ref={groupRef} visible={isOpen}>
       <group position={[0, 0, 0]}> {/* Center Group */}
          
          {/* Top Roller - Thinner & More Elegant */}
          <group ref={topRollerRef} position={[0, 0, 0.1]}>
             {/* Rod - Radius reduced from 0.35 to 0.22 */}
             <mesh material={materials.roller} rotation={[0, 0, Math.PI/2]}>
                 <cylinderGeometry args={[0.22, 0.22, 13.0, 32]} />
             </mesh>
             {/* Knobs - Radius reduced from 0.5 to 0.32 */}
             <mesh position={[6.6, 0, 0]} material={materials.knob} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.32, 0.32, 0.2, 32]} />
             </mesh>
             <mesh position={[-6.6, 0, 0]} material={materials.knob} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.32, 0.32, 0.2, 32]} />
             </mesh>
             {/* Connectors */}
             <mesh position={[6.45, 0, 0]} material={materials.roller} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
             </mesh>
             <mesh position={[-6.45, 0, 0]} material={materials.roller} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
             </mesh>
          </group>

          {/* Paper (Plane) - Width 11.5 (Elegant ratio) */}
          <mesh ref={paperRef} material={materials.paper} position={[0, 0, 0]} scale={[1, 0, 1]}>
              <planeGeometry args={[11.5, 1]} /> 
          </mesh>

          {/* Bottom Roller */}
          <group ref={bottomRollerRef} position={[0, 0, 0.1]}>
             <mesh material={materials.roller} rotation={[0, 0, Math.PI/2]}>
                 <cylinderGeometry args={[0.22, 0.22, 13.0, 32]} />
             </mesh>
             {/* Knobs */}
             <mesh position={[6.6, 0, 0]} material={materials.knob} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.32, 0.32, 0.2, 32]} />
             </mesh>
             <mesh position={[-6.6, 0, 0]} material={materials.knob} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.32, 0.32, 0.2, 32]} />
             </mesh>
             <mesh position={[6.45, 0, 0]} material={materials.roller} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
             </mesh>
             <mesh position={[-6.45, 0, 0]} material={materials.roller} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
             </mesh>
          </group>

       </group>

       {/* Stronger Light specifically for the scroll */}
       <pointLight position={[0, 0, 12]} intensity={2.5} distance={25} color="#FFF0F5" />
    </group>
  );
};

export default SolidScroll;
