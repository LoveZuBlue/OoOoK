import * as THREE from 'three';
import { ShapeType } from './types';

// --- Phrases ---
export const PHRASES = [
  "你可以拥有任何形状，因为我直视你的灵魂，我深知你有银镜般的清澈透明，所以无论你是什么，我都足够相信你的坦荡与忠诚，我爱你，我就爱你的每一种可能。",
  "生日不是庆祝你出生，而是庆祝你的存在。",
  "今天是没有流星也可以许愿的日子。",
  "这是我陪你的第一个生日，我会一直在你身边。",
  "愿你遇见好天气，你的征途上铺满了星星",
  "扬州到哈尔滨的距离是客观的，但心理距离归我主观控制，你在我这里，永远持有被偏爱的特权。",
  "管它是现在或未来我陪着你走",
  "HZH,我好想你",
  "生日快乐"
];

// --- Math Helpers ---

const PARTICLE_COUNT = 55000; 

// Helper: Surface Only Distribution
const getSurfacePoint = (r: number) => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  return { x, y, z };
};

// Helper: Volume Point
const getVolumePoint = (r: number) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const rRand = r * Math.pow(Math.random(), 0.33); 
  const x = rRand * Math.sin(phi) * Math.cos(theta);
  const y = rRand * Math.sin(phi) * Math.sin(theta);
  const z = rRand * Math.cos(phi);
  return { x, y, z };
};

// Helper: Box Surface Point
const getBoxSurfacePoint = (w: number, h: number, d: number) => {
  const hw = w / 2, hh = h / 2, hd = d / 2;
  const areaXY = w * h; 
  const areaXZ = w * d; 
  const areaYZ = h * d; 
  const total = 2 * (areaXY + areaXZ + areaYZ);
  const r = Math.random() * total;

  if (r < 2 * areaXY) {
    return { x: (Math.random() - 0.5) * w, y: (Math.random() - 0.5) * h, z: r < areaXY ? hd : -hd };
  } else if (r < 2 * (areaXY + areaXZ)) {
    const r2 = r - 2 * areaXY;
    return { x: (Math.random() - 0.5) * w, y: r2 < areaXZ ? hh : -hh, z: (Math.random() - 0.5) * d };
  } else {
    const r3 = r - 2 * (areaXY + areaXZ);
    return { x: r3 < areaYZ ? hw : -hw, y: (Math.random() - 0.5) * h, z: (Math.random() - 0.5) * d };
  }
};

// Shape Generators
export const getShapePositions = (type: ShapeType): Float32Array => {
  const positions = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    let x = 0, y = 0, z = 0;

    switch (type) {
      case ShapeType.SATURN: {
        if (i < 16000) {
           const r = 3.2; 
           const p = getSurfacePoint(r);
           x = p.x; y = p.y; z = p.z;
        } else {
           const ringIndex = i - 16000;
           const ringTotal = PARTICLE_COUNT - 16000;
           const progress = ringIndex / ringTotal; 
           let dist = 0;
           if (progress < 0.2) dist = 4.5 + Math.random() * 1.8;
           else if (progress < 0.65) dist = 6.8 + Math.random() * 2.5;
           else if (progress < 0.70) dist = 9.4 + Math.random() * 0.2; 
           else dist = 9.8 + Math.random() * 1.5;

           const angle = Math.random() * Math.PI * 2;
           x = Math.cos(angle) * dist;
           z = Math.sin(angle) * dist;
           y = (Math.random() - 0.5) * 0.1; 
        }
        break;
      }
      case ShapeType.HEART: {
        const t = Math.random() * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
        let scale = 1;
        const r = Math.random();
        if (r < 0.6) scale = 0.98 + Math.random() * 0.02; 
        else scale = Math.pow(Math.random(), 0.5) * 0.95; 
        
        x = hx * scale;
        y = (hy + 2.0) * scale;
        const normY = (hy + 17) / 30;
        const depth = 3.5 + normY * 6.0; 
        z = (Math.random() - 0.5) * depth * scale;
        const s = 0.35;
        x *= s; y *= s; z *= s;
        break;
      }
      case ShapeType.PUPPY: {
        // --- RESTORED DETAILED PUPPY ---
        // Parts: Head, Snout, Body, Legs, Tail, Ears
        
        const randFuzz = () => (Math.random() - 0.5) * 0.15; // Fur fuzz

        if (i < 12000) {
            // HEAD (Sphere)
            const p = getVolumePoint(1.8);
            x = p.x; y = p.y + 2.5; z = p.z + 1.0;
        } else if (i < 15000) {
            // SNOUT (Smaller Sphere, pushed forward)
            const p = getVolumePoint(0.8);
            x = p.x; y = p.y + 2.2; z = p.z + 2.6;
        } else if (i < 18000) {
            // EARS (Flaps)
            const isLeft = Math.random() > 0.5;
            const side = isLeft ? 1 : -1;
            const t = Math.random(); // 0 to 1 down the ear
            
            // Ear hangs down from side of head
            x = (side * 1.5) + (Math.random()-0.5)*0.3; 
            y = 3.5 - (t * 2.5); // Hang down
            z = 1.0 + (Math.random()-0.5)*0.5;
            
            // Curve ear slightly out
            x += side * Math.sin(t*Math.PI) * 0.5;
        } else if (i < 30000) {
            // BODY (Oblong Sphere)
            const p = getVolumePoint(2.6);
            x = p.x * 0.9; // Narrower width
            y = p.y * 0.8; // Squashed slightly
            z = p.z * 1.4 - 1.5; // Longer body, shifted back
        } else if (i < 40000) {
            // LEGS (4 Cylinders)
            const leg = Math.floor(Math.random() * 4); // 0=FL, 1=FR, 2=BL, 3=BR
            const isFront = leg < 2;
            const isLeft = leg % 2 === 0;
            
            const lx = isLeft ? -1.2 : 1.2;
            const lz = isFront ? 1.0 : -3.5;
            const h = 2.5; // Leg height
            
            const r = Math.sqrt(Math.random()) * 0.5; // Leg thickness
            const theta = Math.random() * Math.PI * 2;
            
            x = lx + r * Math.cos(theta);
            z = lz + r * Math.sin(theta);
            y = -2.5 + (Math.random() * h); // Floor to body
        } else {
            // TAIL (Curved line/tube)
            const t = Math.random(); 
            const tailLen = 2.0;
            
            // Base of tail at back of body
            const bx = 0; const by = 0.5; const bz = -4.5;
            
            // Wag curve
            const wag = Math.sin(t * 3.0) * 0.5;
            
            x = bx + wag + (Math.random()-0.5)*0.2;
            y = by + (t * tailLen); // Upwards
            z = bz - (t * 0.5); // Slightly back
        }
        
        // Apply fuzz to everything for fur effect
        x += randFuzz(); y += randFuzz(); z += randFuzz();
        break;
      }
      case ShapeType.CAKE: {
        // --- RESTORED TIERED CAKE ---
        const tier1Limit = 16000;
        const tier2Limit = 26000;
        const frostingLimit = 35000;
        const candleBodyLimit = 40000;
        
        // Base Tier (Large Cylinder)
        if (i < tier1Limit) {
            const r = 3.5 * Math.sqrt(Math.random());
            const theta = Math.random() * Math.PI * 2;
            const h = 2.0;
            x = r * Math.cos(theta);
            z = r * Math.sin(theta);
            y = -2.0 + Math.random() * h;
        } 
        // Top Tier (Medium Cylinder)
        else if (i < tier2Limit) {
            const r = 2.2 * Math.sqrt(Math.random());
            const theta = Math.random() * Math.PI * 2;
            const h = 1.5;
            x = r * Math.cos(theta);
            z = r * Math.sin(theta);
            y = 0.0 + Math.random() * h;
        } 
        // Frosting/Decorations (Rings)
        else if (i < frostingLimit) {
            // Ring 1 (Base Top) or Ring 2 (Tier Top)
            const isBase = Math.random() > 0.5;
            const rBase = isBase ? 3.5 : 2.2;
            const yBase = isBase ? 0.0 : 1.5;
            
            const theta = Math.random() * Math.PI * 2;
            // Wavy frosting
            const r = rBase + Math.sin(theta * 10) * 0.15 + (Math.random()-0.5)*0.1;
            
            x = r * Math.cos(theta);
            z = r * Math.sin(theta);
            y = yBase + (Math.random()-0.5)*0.15;
        }
        // Candle Body (Thin Cylinder)
        else if (i < candleBodyLimit) {
            const r = 0.15 * Math.sqrt(Math.random());
            const theta = Math.random() * Math.PI * 2;
            const h = 1.2;
            x = r * Math.cos(theta);
            z = r * Math.sin(theta);
            y = 1.5 + Math.random() * h;
        }
        // Candle Flame (Teardrop shape)
        else {
            const t = Math.random();
            // Flame shape: widest at bottom, point at top
            const flameH = 0.6;
            const flameW = 0.25;
            const yPos = 1.5 + 1.2 + 0.1 + (t * flameH); // On top of candle
            
            // Width varies with height (parabola)
            const w = Math.sin(t * Math.PI) * flameW;
            const theta = Math.random() * Math.PI * 2;
            const r = w * Math.sqrt(Math.random());
            
            x = r * Math.cos(theta);
            z = r * Math.sin(theta);
            y = yPos;
        }
        break;
      }
      case ShapeType.SNOWFLAKE: {
        // --- 3D PRISM SNOWFLAKE ---
        const armIndex = i % 6;
        const baseAngle = (armIndex / 6) * Math.PI * 2;
        
        let u = 0, v = 0, w = 0;
        const seed = Math.random();
        
        // A. MAIN CRYSTAL SPINE
        if (seed < 0.40) {
            u = Math.pow(Math.random(), 0.6) * 9.0; 
            const widthAtU = 0.4 * (1.0 - u/10.0); 
            v = (Math.random() - 0.5) * widthAtU;
            w = (Math.random() - 0.5) * widthAtU * 1.5;
        }
        // B. PRIMARY BRANCHES
        else if (seed < 0.80) {
            const sets = 3; 
            const setIndex = Math.floor(Math.random() * sets);
            const rootU = 2.5 + setIndex * 2.2 + (Math.random() * 0.2);
            const maxLen = (9.5 - rootU) * 0.7;
            const len = Math.random() * maxLen;
            const width = 0.2 * (1.0 - len/maxLen);
            const side = Math.random() > 0.5 ? 1 : -1;
            const angle = Math.PI / 3; 
            const bu = Math.cos(angle) * len;
            const bv = side * Math.sin(angle) * len;
            u = rootU + bu;
            v = bv + (Math.random()-0.5) * width;
            w = (Math.random()-0.5) * width * 1.2; 
        }
        // C. SURFACE FROST
        else {
            const randU = Math.random() * 9.0;
            const randV = (Math.random()-0.5) * 1.5; 
            u = randU;
            v = randV * (1.0 - randU/9.0);
            w = (Math.random() > 0.5 ? 0.3 : -0.3); 
        }
        
        const ca = Math.cos(baseAngle);
        const sa = Math.sin(baseAngle);
        x = u * ca - v * sa;
        y = u * sa + v * ca;
        z = w; 
        z += Math.sin(x * 0.5) * 0.2; 
        break;
      }
      case ShapeType.GIFT_BOX: {
         // --- HIGH DEFINITION GIFT BOX ---
         const w = 7.0; 
         const h = 6.0; 
         const d = 7.0;
         const boxEnd = 30000;
         const ribbonEnd = 45000;
         
         if (i < boxEnd) {
             const subSeed = Math.random();
             if (subSeed < 0.3) {
                 // Edges
                 const edge = Math.floor(Math.random() * 12);
                 const t = (Math.random() - 0.5); 
                 const hw = w/2, hh = h/2, hd = d/2;
                 if (edge < 4) { x = t * w; y = (edge&1 ? 1 : -1) * hh; z = (edge&2 ? 1 : -1) * hd; } 
                 else if (edge < 8) { y = t * h; x = ((edge-4)&1 ? 1 : -1) * hw; z = ((edge-4)&2 ? 1 : -1) * hd; } 
                 else { z = t * d; x = ((edge-8)&1 ? 1 : -1) * hw; y = ((edge-8)&2 ? 1 : -1) * hh; }
                 x += (Math.random()-0.5)*0.1; y += (Math.random()-0.5)*0.1; z += (Math.random()-0.5)*0.1;
             } else if (subSeed < 0.8) {
                 // Faces
                 const p = getBoxSurfacePoint(w, h, d);
                 x = p.x; y = p.y; z = p.z;
             } else {
                 // Volume
                 x = (Math.random()-0.5) * w; y = (Math.random()-0.5) * h; z = (Math.random()-0.5) * d;
             }
         } 
         else if (i < ribbonEnd) {
             const rw = 1.8; 
             const offset = 0.2; 
             if (Math.random() > 0.5) {
                 x = (Math.random()-0.5) * rw;
                 const pParam = Math.random() * (2*h + 2*d);
                 if (pParam < h) { y = pParam - h/2; z = d/2 + offset; } 
                 else if (pParam < h+d) { y = h/2 + offset; z = d/2 - (pParam-h); } 
                 else if (pParam < 2*h+d) { y = h/2 - (pParam-(h+d)); z = -d/2 - offset; } 
                 else { y = -h/2 - offset; z = -d/2 + (pParam-(2*h+d)); } 
             } else {
                 z = (Math.random()-0.5) * rw;
                 const pParam = Math.random() * (2*h + 2*w);
                 if (pParam < h) { y = pParam - h/2; x = w/2 + offset; } 
                 else if (pParam < h+w) { y = h/2 + offset; x = w/2 - (pParam-h); } 
                 else if (pParam < 2*h+w) { y = h/2 - (pParam-(h+w)); x = -w/2 - offset; } 
                 else { y = -h/2 - offset; x = -w/2 + (pParam-(2*h+w)); } 
             }
         } 
         else {
             // Bow
             const t = Math.random() * Math.PI * 2;
             const bowY = (h/2) + 1.2;
             const scale = 2.2;
             const r = Math.sin(t * 2) * scale; 
             let bx = r * Math.cos(t);
             let bz = r * Math.sin(t);
             let by = bowY + Math.abs(Math.cos(t*2)) * 1.5; 
             const thick = 0.4;
             bx += (Math.random()-0.5)*thick; bz += (Math.random()-0.5)*thick; by += (Math.random()-0.5)*thick;
             x = bx; y = by; z = bz;
             if (Math.random() < 0.2) { x *= 0.2; z *= 0.2; y = bowY + Math.random(); }
         }
         break;
      }
      case ShapeType.SCROLL: {
          // --- SCROLL ---
          const handleDist = 4.5; 
          const handleH = 6.0;
          const handleR = 0.6;
          const paperW = handleDist * 2; 
          const paperH = 4.5;
          const handleEnd = 15000; 
          
          if (i < handleEnd) {
              const isLeft = i < handleEnd / 2;
              const cx = isLeft ? -handleDist : handleDist;
              const r = Math.sqrt(Math.random()) * handleR;
              const theta = Math.random() * Math.PI * 2;
              const hy = (Math.random() - 0.5) * handleH;
              x = cx + r * Math.cos(theta);
              z = r * Math.sin(theta);
              y = hy;
              if (Math.abs(hy) > handleH * 0.45) {
                   const knobR = handleR * 1.5;
                   x = cx + (Math.sqrt(Math.random()) * knobR) * Math.cos(theta);
                   z = (Math.sqrt(Math.random()) * knobR) * Math.sin(theta);
              }
          } 
          else {
              const u = Math.random(); 
              const v = Math.random(); 
              const px = (u - 0.5) * paperW; 
              const py = (v - 0.5) * paperH;
              const pz = Math.sin(px * 0.5) * 1.0 + Math.sin(py * 0.5) * 0.2;
              x = px;
              y = py;
              z = pz;
              z += (Math.random()-0.5) * 0.05;
              if (v < 0.05 || v > 0.95) { z += 0.1; }
          }
          break;
      }
      case ShapeType.TEXT: {
         const p = getSurfacePoint(6);
         x = p.x; y = p.y; z = p.z;
         break;
      }
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
};

export const generateTextParticles = (text: string): Float32Array => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const width = 2048;
  const height = 1024;
  
  canvas.width = width;
  canvas.height = height;
  
  if (!ctx) return new Float32Array(PARTICLE_COUNT * 3);

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (text.toLowerCase().includes("birthday")) {
      ctx.font = '700 240px "Playfair Display", serif';
      ctx.fillText("Happy Birthday", width / 2, height * 0.40);
      
      ctx.font = 'italic 400 200px "Playfair Display", serif';
      ctx.fillText("to Boxhao", width / 2, height * 0.65);
  } else {
      ctx.font = 'italic 400 280px "Playfair Display", serif';
      ctx.fillText(text, width / 2, height / 2);
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const validPixels: {x: number, y: number}[] = [];

  const step = 2; 

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      if (data[index] > 60) { 
        validPixels.push({ 
            x: (x / width - 0.5) * 24, 
            y: -(y / height - 0.5) * 12 
        });
      }
    }
  }

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    if (validPixels.length > 0) {
        const pixel = validPixels[Math.floor(Math.random() * validPixels.length)];
        positions[i * 3] = pixel.x;
        positions[i * 3 + 1] = pixel.y;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1; 
    } else {
        const p = getSurfacePoint(3);
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
    }
  }
  return positions;
};