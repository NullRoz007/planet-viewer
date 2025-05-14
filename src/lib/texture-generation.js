import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";
import * as THREE from "three";

// Perlin constants
const FREQ = 64;
const AMP = 1.0;
const PERS = 0.5;
const OCTS = 8;
const Z_SCALE = 100;

/**
 * Generates a Perlin noise-based procedural texture using multiple octaves.
 *
 * @param {number} w - Width of the texture.
 * @param {number} h - Height of the texture.
 * @param {number} seed - Seed value affecting the z-axis of the noise function.
 * @param {(n: number) => [number, number, number, number]} map_noise -
 *        Function mapping a normalized noise value [0,1] to an RGBA array (0–255 per channel).
 *
 * @returns {THREE.DataTexture} A THREE.js DataTexture containing the generated noise pattern.
 *
 * @remarks
 * - The texture uses repeat wrapping and nearest filtering.
 * - Frequency, amplitude, persistence, and octaves can be configured via constants.
 * - Each pixel's color is derived by applying `noise_result` to the computed noise value.
 */
export const perlin_texture = (w, h, seed, map_noise) => {
  const width = w;
  const height = h;

  const data = new Uint8Array(width * height * 4);
  const perlin = new ImprovedNoise();

  let frequency = 1 / FREQ;
  let amplitude = AMP;
  let persistence = PERS;
  let octaves = OCTS;
  let z = seed / Z_SCALE;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let noise = 0;
      let freq = frequency;
      let amp = amplitude;

      for (let o = 0; o < octaves; o++) {
        noise += perlin.noise(x * freq, y * freq, z) * amp;
        freq *= 2;
        amp *= persistence;
      }

      noise = (noise + 1) / 2; // Normalize to [0,1]
      const new_data = map_noise(noise);

      let i = (y * width + x) * 4;
      data[i] = new_data[0];
      data[i + 1] = new_data[1];
      data[i + 2] = new_data[2];
      data[i + 3] = new_data[3];
    }
  }

  const texture = new THREE.DataTexture(data, width, height);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.needsUpdate = true;

  return texture;
};

// kelvin temp to color
export const pl_eqt_to_color = (pl_eqt) => {
  const temp = Math.max(1000, Math.min(10000, pl_eqt)) / 100;
  let red, green, blue;

  // Red
  if (temp <= 66) {
    red = 255;
  } else {
    red = temp - 60;
    red = 329.698727446 * Math.pow(red, -0.1332047592);
    red = Math.min(255, Math.max(0, red));
  }

  // Green
  if (temp <= 66) {
    green = 99.4708025861 * Math.log(temp) - 161.1195681661;
  } else {
    green = temp - 60;
    green = 288.1221695283 * Math.pow(green, -0.0755148492);
  }
  green = Math.min(255, Math.max(0, green));

  // Blue
  if (temp >= 66) {
    blue = 255;
  } else if (temp <= 19) {
    blue = 0;
  } else {
    blue = temp - 10;
    blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
    blue = Math.min(255, Math.max(0, blue));
  }

  return {
    r: Math.round(red),
    g: Math.round(green),
    b: Math.round(blue),
  };
};
