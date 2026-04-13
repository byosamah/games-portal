import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { SAUDI_BONE_MAP } from './config.js';

export default class AssetLoader {
  constructor() {
    this.loader = new GLTFLoader();
    this.cache = new Map();
  }

  async loadAll(manifest, onProgress) {
    const entries = Object.entries(manifest);
    let loaded = 0;
    const promises = entries.map(([key, path]) =>
      new Promise((resolve, reject) => {
        this.loader.load(path,
          (gltf) => { this.cache.set(key, gltf); loaded++; onProgress(loaded / entries.length); resolve(); },
          undefined,
          (err) => { console.warn(`Failed to load ${key}:`, err); loaded++; onProgress(loaded / entries.length); resolve(); }
        );
      })
    );
    await Promise.all(promises);
  }

  getGLTF(key) { return this.cache.get(key); }

  cloneCharacter(key) {
    const gltf = this.cache.get(key);
    if (!gltf) return null;
    const clone = SkeletonUtils.clone(gltf.scene);
    clone.traverse(c => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
        if (Array.isArray(c.material)) {
          c.material = c.material.map(m => m.clone());
        } else if (c.material) {
          c.material = c.material.clone();
        }
      }
    });
    return { scene: clone, animations: gltf.animations };
  }

  cloneStatic(key) {
    const gltf = this.cache.get(key);
    if (!gltf) return null;
    const clone = gltf.scene.clone();
    clone.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
    return clone;
  }

  retargetAnimations(sourceKey, targetKey) {
    const sourceGltf = this.cache.get(sourceKey);
    const targetGltf = this.cache.get(targetKey);
    if (!sourceGltf || !targetGltf) return;

    const retargeted = [];
    for (const clip of sourceGltf.animations) {
      const tracks = [];
      for (const track of clip.tracks) {
        // Track name format: "boneName.property" — use lastIndexOf for bones like "Foot.L"
        const dotIdx = track.name.lastIndexOf('.');
        const boneName = track.name.substring(0, dotIdx);
        const prop = track.name.substring(dotIdx + 1);

        const mapped = SAUDI_BONE_MAP[boneName];
        if (!mapped) continue; // unmapped bones (fingers, weapons, IK) — drop silently

        // Skip position tracks — rest pose positions differ between rigs
        // Only transfer rotation (quaternion) data which is rig-independent
        if (prop === 'position') continue;

        tracks.push(new THREE.KeyframeTrack(
          `${mapped}.${prop}`,
          track.times,
          track.values
        ));
      }
      if (tracks.length > 0) {
        retargeted.push(new THREE.AnimationClip(clip.name, clip.duration, tracks));
      }
    }

    // Merge retargeted clips into target's animation array
    targetGltf.animations = [...targetGltf.animations, ...retargeted];
  }
}
