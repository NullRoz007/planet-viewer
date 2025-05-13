import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";
import * as THREE from "three";

export const perlin_texture = (w, h, seed, noise_result) => {
  const width = 256;
  const height = 256;

  const data = new Uint8Array(width * height * 4);
  const perlin = new ImprovedNoise();

  let frequency = 1 / 64;
  let amplitude = 1.0;
  let persistence = 0.5;
  let octaves = 8;
  let z = seed / 100;

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
      const new_data = noise_result(noise);

      let i = (y * width + x) * 4;
      data[i] = new_data[0];
      data[i + 1] = new_data[1];
      data[i + 2] = new_data[3];
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
