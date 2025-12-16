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

// Helper: Volume Point (Solid sphere)
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
        // GOLDEN RESPLENDENT SATURN
        if (i < 18000) {
           // Body - Dense sphere
           const r = 3.6; 
           const p = getSurfacePoint(r);
           x = p.x; y = p.y; z = p.z;
        } else {
           // Rings - Scattered Stardust Band
           const ringIndex = i - 18000;
           const ringTotal = PARTICLE_COUNT - 18000;
           const progress = ringIndex / ringTotal; 
           
           let dist = 0;
           if (progress < 0.25) dist = 5.2 + Math.random() * 0.8; 
           else if (progress < 0.30) dist = 6.2 + Math.random() * 0.2; 
           else if (progress < 0.85) dist = 6.8 + Math.random() * 2.5; 
           else dist = 9.5 + Math.random() * 0.5;

           const angle = Math.random() * Math.PI * 2;
           x = Math.cos(angle) * dist;
           z = Math.sin(angle) * dist;
           
           // Vertical spread
           const thickness = 0.1 + (Math.random() * 0.3 * (dist / 10)); 
           y = (Math.random() - 0.5) * thickness; 
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
        const randFuzz = (s=1.0) => (Math.random() - 0.5) * 0.3 * s;

        const eyeLeftEnd = 250;
        const eyeRightEnd = 500;
        const noseEnd = 750;
        const headEnd = 16000;
        const bodyEnd = 29000;
        const legsEnd = 46000;

        // 1. FEATURES (Black Particles) 
        if (i < eyeLeftEnd) {
             // Left Eye - Pushed further out for Big Head
             const p = getVolumePoint(0.3);
             x = -1.0 + p.x; y = 3.6 + p.y; z = 3.8 + p.z; 
        } else if (i < eyeRightEnd) {
             // Right Eye
             const p = getVolumePoint(0.3);
             x = 1.0 + p.x; y = 3.6 + p.y; z = 3.8 + p.z;
        } else if (i < noseEnd) {
             // Nose
             const p = getVolumePoint(0.4);
             x = p.x; y = 2.8 + p.y * 0.8; z = 4.2 + p.z; 
        } 
        
        // 2. HEAD - BIGGER (CUTER)
        else if (i < headEnd) {
            // Increased radius from 2.1 to 2.8 for a "Big Head" look
            const p = getVolumePoint(2.8); 
            x = p.x; y = p.y + 3.5; z = p.z + 0.8;

            // Snout
            if (Math.random() > 0.6) {
                const sp = getVolumePoint(1.3);
                x = sp.x * 1.2; 
                y = sp.y * 0.8 + 2.6; 
                z = sp.z + 2.8; 
            }

            // EARS - Adjusted position for bigger head
            if (Math.random() > 0.65) {
                const side = Math.random() > 0.5 ? 1 : -1;
                // Side attachment - Wider
                const ex = side * 2.8; 
                const ey = 3.8; 
                const ez = 0.5;
                
                const u = Math.random(); 
                // Floppy oval shape
                const w = 1.2; 
                const h = 2.4;
                
                x = ex + (Math.random()-0.5) * w;
                y = ey - u * h;
                z = ez + (Math.random()-0.5) * 0.6;
                
                // Curve slightly forward
                z += Math.sin(u * 2) * 0.8;
            }
            x += randFuzz(0.6); y += randFuzz(0.6); z += randFuzz(0.6);

        } else if (i < bodyEnd) {
            // BODY - Smaller relative to head (Chibi style)
            const u = Math.random(); 
            const height = 3.5;
            const topY = 1.2; 
            const yPos = topY - u * height;
            
            const width = 1.6 + u * 1.4; 
            const p = getVolumePoint(width);
            
            x = p.x;
            y = yPos;
            z = p.z * 0.8;

            x += randFuzz(1.0); z += randFuzz(1.0);
        } else if (i < legsEnd) {
            // LEGS
            if (Math.random() < 0.45) {
                 // Front Paws
                 const side = Math.random() > 0.5 ? 1 : -1;
                 const lx = side * 0.9;
                 const ly = -1.0;
                 const lh = 2.5;
                 const u = Math.random();
                 
                 x = lx + (Math.random()-0.5)*0.6;
                 y = ly - u * lh;
                 z = 1.6 + (Math.random()-0.5)*0.6; 
            } else {
                 // Back Haunches
                 const side = Math.random() > 0.5 ? 1 : -1;
                 const p = getVolumePoint(1.4);
                 x = side * 1.9 + p.x;
                 y = -2.5 + p.y;
                 z = 0.0 + p.z;
            }
             x += randFuzz(); z += randFuzz();
        } else {
            // TAIL
            const t = Math.random(); 
            const angle = t * 1.5; 
            const tailLen = 1.8;
            
            const tx = 0;
            const ty = -2.0 + Math.sin(angle) * tailLen;
            const tz = -2.0 - Math.cos(angle) * tailLen;

            const tailThick = 0.35;
            const p = getVolumePoint(tailThick);

            x = tx + p.x;
            y = ty + p.y;
            z = tz + p.z;
            
            x += randFuzz(0.5); 
        }
        break;
      }
      case ShapeType.CAKE: {
        const tier1Limit = 16000;
        const tier2Limit = 26000;
        const frostingLimit = 35000;
        const candleBodyLimit = 40000;
        
        if (i < tier1Limit) {
            const r = 3.5 * Math.sqrt(Math.random());
            const theta = Math.random() * Math.PI * 2;
            const h = 2.0;
            x = r * Math.cos(theta); z = r * Math.sin(theta); y = -2.0 + Math.random() * h;
        } else if (i < tier2Limit) {
            const r = 2.2 * Math.sqrt(Math.random());
            const theta = Math.random() * Math.PI * 2;
            const h = 1.5;
            x = r * Math.cos(theta); z = r * Math.sin(theta); y = 0.0 + Math.random() * h;
        } else if (i < frostingLimit) {
            const isBase = Math.random() > 0.5;
            const rBase = isBase ? 3.5 : 2.2;
            const yBase = isBase ? 0.0 : 1.5;
            const theta = Math.random() * Math.PI * 2;
            const r = rBase + Math.sin(theta * 10) * 0.15 + (Math.random()-0.5)*0.1;
            x = r * Math.cos(theta); z = r * Math.sin(theta); y = yBase + (Math.random()-0.5)*0.15;
        } else if (i < candleBodyLimit) {
            const r = 0.15 * Math.sqrt(Math.random());
            const theta = Math.random() * Math.PI * 2;
            const h = 1.2;
            x = r * Math.cos(theta); z = r * Math.sin(theta); y = 1.5 + Math.random() * h;
        } else {
            const t = Math.random();
            const flameH = 0.6; const flameW = 0.25;
            const yPos = 1.5 + 1.2 + 0.1 + (t * flameH);
            const w = Math.sin(t * Math.PI) * flameW;
            const theta = Math.random() * Math.PI * 2;
            const r = w * Math.sqrt(Math.random());
            x = r * Math.cos(theta); z = r * Math.sin(theta); y = yPos;
        }
        break;
      }
      case ShapeType.SNOWFLAKE: {
        // THICK VOLUMETRIC SNOWFLAKE
        const armIndex = Math.floor((i / PARTICLE_COUNT) * 6);
        
        // Base symmetry angle
        const angle = (armIndex / 6) * Math.PI * 2;
        
        const length = 9.5;
        
        // Increase volume by scattering heavily in Z and local XY
        const typeRand = Math.random();
        
        let u = 0, v = 0, w = 0;

        if (typeRand < 0.40) {
            // Main Arm (Thick Core)
            const t = Math.pow(Math.random(), 0.5); 
            u = t * length;
            // Width tapers
            const width = 0.8 * (1.0 - t); // Thicker width
            v = (Math.random() - 0.5) * width;
            w = (Math.random() - 0.5) * width * 1.5; // Significant Z depth (Volume)
        } else if (typeRand < 0.80) {
            // Branches (Thick V-shape)
            const branchSets = [2.5, 4.5, 6.5]; 
            const chosenBase = branchSets[Math.floor(Math.random() * branchSets.length)];
            
            const maxBranchLen = (length - chosenBase) * 0.7;
            const branchLen = Math.random() * maxBranchLen;
            const branchAngle = Math.PI / 3; 
            const side = Math.random() > 0.5 ? 1 : -1;
            
            const bu = chosenBase + Math.cos(branchAngle) * branchLen;
            const bv = side * Math.sin(branchAngle) * branchLen;
            
            u = bu;
            // Branch thickness
            v = bv + (Math.random()-0.5)*0.3;
            w = (Math.random()-0.5)*0.6; // Thick branches
        } else {
            // Ice Crystal Dust (Volume Filler)
            // Instead of just random dots, creating a "plate" feel
            const t = Math.random();
            const centerU = t * length;
            const spread = 1.2 * (1.0 - t * 0.5);
            
            const hexAngle = Math.random() * Math.PI * 2;
            const hexR = Math.random() * spread;
            
            u = centerU + Math.cos(hexAngle) * hexR;
            v = Math.sin(hexAngle) * hexR;
            w = (Math.random()-0.5) * 0.4;
        }

        // Apply rotation
        const ca = Math.cos(angle);
        const sa = Math.sin(angle);
        
        const px = u * ca - v * sa;
        const py = u * sa + v * ca;
        const pz = w;
        
        // ROTATION TO POINT UP (12 o'clock)
        const rotOffset = Math.PI / 2;
        
        x = px * Math.cos(rotOffset) - py * Math.sin(rotOffset);
        y = px * Math.sin(rotOffset) + py * Math.cos(rotOffset);
        z = pz;
        break;
      }
      case ShapeType.GIFT_BOX: {
         const w = 7.0; const h = 6.0; const d = 7.0;
         const boxEnd = 30000; const ribbonEnd = 45000;
         
         if (i < boxEnd) {
             // Removed the center accumulation logic to make box clean
             const p = getBoxSurfacePoint(w, h, d);
             x = p.x; y = p.y; z = p.z;
         } else if (i < ribbonEnd) {
             const rw = 1.8; const offset = 0.2; 
             const fuzz = (Math.random()-0.5) * 0.2;
             if (Math.random() > 0.5) {
                 x = (Math.random()-0.5) * rw;
                 const pParam = Math.random() * (2*h + 2*d);
                 if (pParam < h) { y = pParam - h/2; z = d/2 + offset; } 
                 else if (pParam < h+d) { y = h/2 + offset; z = d/2 - (pParam-h); } 
                 else if (pParam < 2*h+d) { y = h/2 - (pParam-(h+d)); z = -d/2 - offset; } 
                 else { y = -h/2 - offset; z = -d/2 + (pParam-(2*h+d)); } 
                 x += fuzz;
             } else {
                 z = (Math.random()-0.5) * rw;
                 const pParam = Math.random() * (2*h + 2*w);
                 if (pParam < h) { y = pParam - h/2; x = w/2 + offset; } 
                 else if (pParam < h+w) { y = h/2 + offset; x = w/2 - (pParam-h); } 
                 else if (pParam < 2*h+w) { y = h/2 - (pParam-(h+w)); x = -w/2 - offset; } 
                 else { y = -h/2 - offset; x = -w/2 + (pParam-(2*h+w)); } 
                 z += fuzz;
             }
         } else {
             // SOFT ORGANIC BOW
             const t = (i - ribbonEnd) / (PARTICLE_COUNT - ribbonEnd);
             const angle = t * Math.PI * 4; 
             
             const bowSize = 3.5;
             const loop = Math.sin(2 * angle);
             
             const r = bowSize * loop + (Math.random() * 0.5);
             
             const bx = r * Math.cos(angle);
             const bz = r * Math.sin(angle) * 0.8;
             
             const lift = Math.abs(loop) * 1.5;
             const by = (h/2) + 0.5 + lift;
             
             x = bx + (Math.random()-0.5) * 0.5; 
             y = by + (Math.random()-0.5) * 0.5; 
             z = bz + (Math.random()-0.5) * 0.5;
         }
         break;
      }
      case ShapeType.SCROLL: {
          const r = 16 + Math.random() * 8; 
          const theta = Math.random() * Math.PI * 2;
          x = r * Math.cos(theta);
          y = r * Math.sin(theta) * 0.8; 
          z = -10 + (Math.random()-0.5) * 5; 
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