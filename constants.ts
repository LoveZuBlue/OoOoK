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

// Increased particle count for a "luxurious" high-end density
const PARTICLE_COUNT = 30000; 

// Helper: Surface Only Distribution (More defined, less foggy)
const getSurfacePoint = (r: number) => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  // Add very slight noise for "fuzzy skin" but keep mostly on surface
  const noise = 1.0 + (Math.random() - 0.5) * 0.05; 
  const rad = r * noise;
  
  const x = rad * Math.sin(phi) * Math.cos(theta);
  const y = rad * Math.sin(phi) * Math.sin(theta);
  const z = rad * Math.cos(phi);
  return { x, y, z };
};

// Shape Generators
export const getShapePositions = (type: ShapeType): Float32Array => {
  const positions = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    let x = 0, y = 0, z = 0;

    switch (type) {
      case ShapeType.SATURN: {
        const r = Math.random();
        
        // 35% Planet Body, 65% Rings for a grander look
        if (r < 0.35) {
          // --- Planet Body ---
          const radius = 3.0; 
          const p = getSurfacePoint(radius);
          x = p.x;
          y = p.y;
          z = p.z;
        } else {
          // --- Rings ---
          const angle = Math.random() * Math.PI * 2;
          
          // Generate precise bands to simulate C, B, A rings and Cassini Division
          const bandType = Math.random();
          let dist = 0;

          if (bandType < 0.15) {
              // C Ring (Inner, faint)
              dist = 4.2 + Math.random() * 1.0;
          } else if (bandType < 0.65) {
              // B Ring (Main, bright, dense)
              dist = 5.4 + Math.random() * 2.2;
          } else if (bandType < 0.70) {
              // Cassini Division (Empty-ish gap)
              // We barely put particles here to create the dark gap look
              if (Math.random() > 0.8) dist = 7.7 + Math.random() * 0.3;
              else dist = 5.4 + Math.random() * 2.2; // Fallback to B ring to keep density high
          } else {
              // A Ring (Outer)
              dist = 8.1 + Math.random() * 1.5;
          }

          // Initial flat disk on XZ plane
          let rx = Math.cos(angle) * dist;
          let rz = Math.sin(angle) * dist;
          // Extremely thin vertical profile for "razor sharp" rings
          let ry = (Math.random() - 0.5) * 0.05; 

          // --- Tilt Logic ---
          // Rotate around X-axis by ~27 degrees
          const tilt = 27 * (Math.PI / 180);
          const ca = Math.cos(tilt);
          const sa = Math.sin(tilt);

          // Apply rotation matrix
          // y' = y*cos - z*sin
          // z' = y*sin + z*cos
          
          let yFinal = ry * ca - rz * sa;
          let zFinal = ry * sa + rz * ca;
          
          x = rx; 
          y = yFinal;
          z = zFinal;
        }
        break;
      }
      case ShapeType.HEART: {
        // Classic Heart Parametric Equation for sharper silhouette
        // x = 16 sin^3(t)
        // y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
        
        const t = Math.random() * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        
        const r = Math.random();
        let scale = 1;
        
        // 50% Shell for crisp definition (Lobes will be very distinct)
        if (r < 0.5) {
             scale = 0.96 + Math.random() * 0.04; // Very thin shell
        } else {
             // Volume: scale down towards center (0,0)
             // Using sqrt keeps density reasonably high near edges, preventing "hollow" look
             scale = Math.sqrt(Math.random()) * 0.95;
        }

        // Apply scale to the 2D heart profile
        x = hx * scale;
        y = hy * scale;

        // Center the heart vertically
        // The formula range is approx [-17, 13]. Midpoint is around -2.
        y += 2.0;

        // Z-Axis Logic (3D Puffiness)
        // Taper thickness: Thicker at the top lobes, thinner at the bottom tip.
        // Normalized Height (0 at bottom, 1 at top)
        const normY = (hy + 17) / 30; 
        
        // Depth profile: ranges from ~2.0 at bottom to ~8.0 at top
        const depth = 2.0 + normY * 6.0; 
        
        // Random Z within the tapered depth, scaled by overall size
        // This gives it a rounded, pillow-like 3D form
        z = (Math.random() - 0.5) * depth * scale;

        // Global Scale to fit scene
        const s = 0.35;
        x *= s;
        y *= s;
        z *= s;
        break;
      }
      case ShapeType.CAKE: {
        // Grand Two-Tier Cake with Frosting and Candles
        const part = Math.random();
        
        if (part < 0.45) { 
           // --- Bottom Tier (Large Cylinder) ---
           const rMax = 4.0;
           const hBase = -2.5;
           const hTop = -0.5;
           
           if (Math.random() > 0.2) {
               // Side Walls
               const angle = Math.random() * Math.PI * 2;
               x = rMax * Math.cos(angle);
               z = rMax * Math.sin(angle);
               y = hBase + Math.random() * (hTop - hBase);
           } else {
               // Surface/Frosting Rim
               const angle = Math.random() * Math.PI * 2;
               const r = rMax * Math.sqrt(Math.random());
               x = r * Math.cos(angle);
               z = r * Math.sin(angle);
               y = hTop; // Top of bottom tier
           }
        } else if (part < 0.8) {
           // --- Top Tier (Smaller Cylinder) ---
           const rMax = 2.5;
           const hBase = -0.5;
           const hTop = 1.2;
           
           if (Math.random() > 0.3) {
               // Walls
               const angle = Math.random() * Math.PI * 2;
               x = rMax * Math.cos(angle);
               z = rMax * Math.sin(angle);
               y = hBase + Math.random() * (hTop - hBase);
           } else {
               // Top Surface
               const angle = Math.random() * Math.PI * 2;
               const r = rMax * Math.sqrt(Math.random());
               x = r * Math.cos(angle);
               z = r * Math.sin(angle);
               y = hTop;
           }
        } else if (part < 0.95) {
           // --- Piping / Frosting Details ---
           // Rings of particles at the edges of tiers
           const angle = Math.random() * Math.PI * 2;
           // Choose distinct rings
           const r = Math.random() > 0.5 ? 4.0 : 2.5; 
           const h = r === 4.0 ? -0.5 : 1.2;
           
           // Add "fluff"
           x = (r + (Math.random()-0.5)*0.2) * Math.cos(angle);
           z = (r + (Math.random()-0.5)*0.2) * Math.sin(angle);
           y = h + (Math.random()-0.5) * 0.2; 
        } else {
           // --- Candles & Flames ---
           // One central large candle or a ring of small ones? Let's do a central cluster.
           const hBase = 1.2;
           const hWick = 2.5;
           
           // Candle Body
           if (Math.random() < 0.7) {
               const r = Math.random() * 0.2; // Thin candle
               const angle = Math.random() * Math.PI * 2;
               x = r * Math.cos(angle);
               z = r * Math.sin(angle);
               y = hBase + Math.random() * (hWick - hBase);
           } else {
               // Flame (Teardrop shape)
               const flameH = Math.random(); // 0 to 1
               const flameW = Math.sin(flameH * Math.PI) * 0.15;
               const angle = Math.random() * Math.PI * 2;
               
               x = flameW * Math.cos(angle);
               z = flameW * Math.sin(angle);
               y = hWick + flameH * 0.6; // Flame height
           }
        }
        break;
      }
      case ShapeType.SNOWFLAKE: {
        const armIndex = Math.floor(Math.random() * 6);
        const armAngle = (armIndex / 6) * Math.PI * 2;
        
        let px = 0, py = 0;
        const r = Math.random();
        
        if (r < 0.2) {
             const d = Math.random() * 1.5;
             const a = Math.random() * Math.PI * 2;
             px = d * Math.cos(a); 
             py = d * Math.sin(a) * 0.9;
        } else if (r < 0.6) {
             px = 1.5 + Math.random() * 6.0;
             py = (Math.random() - 0.5) * 0.15;
        } else {
             const anchor = 2.5 + Math.floor(Math.random() * 3) * 1.8;
             const branchLen = Math.random() * 1.5;
             const side = Math.random() > 0.5 ? 1 : -1;
             const angle = Math.PI / 3;
             px = anchor + Math.cos(angle) * branchLen;
             py = side * Math.sin(angle) * branchLen;
        }

        const ca = Math.cos(armAngle);
        const sa = Math.sin(armAngle);
        x = px * ca - py * sa;
        y = px * sa + py * ca;
        z = (Math.random() - 0.5) * 0.2;
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

// Helper to rasterize text to points
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