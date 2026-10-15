import * as THREE from 'three';

// Builds an equirectangular planet texture on the JS thread, the way the app
// could colour a planet from its biome/seed without shipping an image.
// Noise is sampled on the unit sphere, so the texture wraps without a seam.

const GRID = 32;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(seed: number) {
  const rand = mulberry32(seed);
  const lattice = new Float32Array(GRID * GRID * GRID);
  for (let i = 0; i < lattice.length; i++) lattice[i] = rand();
  const at = (x: number, y: number, z: number) =>
    lattice[(((x % GRID) + GRID) % GRID) * GRID * GRID + (((y % GRID) + GRID) % GRID) * GRID + (((z % GRID) + GRID) % GRID)];
  const smooth = (t: number) => t * t * (3 - 2 * t);

  return (x: number, y: number, z: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const fx = smooth(x - xi), fy = smooth(y - yi), fz = smooth(z - zi);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    return lerp(
      lerp(lerp(at(xi, yi, zi), at(xi + 1, yi, zi), fx), lerp(at(xi, yi + 1, zi), at(xi + 1, yi + 1, zi), fx), fy),
      lerp(lerp(at(xi, yi, zi + 1), at(xi + 1, yi, zi + 1), fx), lerp(at(xi, yi + 1, zi + 1), at(xi + 1, yi + 1, zi + 1), fx), fy),
      fz,
    );
  };
}

// A palette per biome; heights run from 0 (deep) to 1 (peaks).
export type Biome = 'lush' | 'toxic' | 'frozen';
const PALETTES: Record<Biome, [number, [number, number, number]][]> = {
  lush: [[0, [20, 40, 110]], [0.47, [40, 90, 170]], [0.5, [220, 200, 140]], [0.56, [90, 160, 70]], [0.72, [40, 100, 50]], [0.85, [120, 100, 80]], [1, [245, 245, 250]]],
  toxic: [[0, [40, 20, 60]], [0.45, [90, 40, 110]], [0.5, [160, 200, 40]], [0.65, [200, 230, 60]], [0.8, [120, 140, 30]], [1, [230, 255, 120]]],
  frozen: [[0, [120, 150, 190]], [0.45, [170, 200, 230]], [0.55, [220, 235, 250]], [0.8, [190, 205, 225]], [1, [255, 255, 255]]],
};

function paletteAt(stops: [number, [number, number, number]][], h: number, c: number) {
  for (let i = 1; i < stops.length; i++) {
    if (h <= stops[i][0]) {
      const [h0, c0] = stops[i - 1];
      const [h1, c1] = stops[i];
      return c0[c] + ((c1[c] - c0[c]) * (h - h0)) / (h1 - h0);
    }
  }
  return stops[stops.length - 1][1][c];
}

export function makePlanetTexture(seed: number, biome: Biome, width = 256, height = 128) {
  const noise = makeNoise(seed);
  const stops = PALETTES[biome];
  const data = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y++) {
    const lat = Math.PI / 2 - ((y + 0.5) / height) * Math.PI;
    const cosLat = Math.cos(lat), sinLat = Math.sin(lat);
    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2 - Math.PI;
      const px = cosLat * Math.cos(lon), py = sinLat, pz = cosLat * Math.sin(lon);
      let h = 0, amp = 1, freq = 2;
      for (let o = 0; o < 5; o++) {
        h += noise(px * freq + 17, py * freq + 17, pz * freq + 17) * amp;
        amp /= 2;
        freq *= 2;
      }
      h /= 1.9375;
      // Rows are written bottom-up: DataTexture uploads with flipY = false.
      const i = ((height - 1 - y) * width + x) * 4;
      data[i] = paletteAt(stops, h, 0);
      data[i + 1] = paletteAt(stops, h, 1);
      data[i + 2] = paletteAt(stops, h, 2);
      data[i + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}
