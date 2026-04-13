import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

export class ModelCache {
  constructor() { this.loader = new GLTFLoader(); this.cache = new Map(); }

  async load(path) {
    if (this.cache.has(path)) return this.cache.get(path);
    return new Promise((resolve, reject) => {
      this.loader.load(path, gltf => {
        gltf.scene.traverse(c => {
          if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
        });
        const entry = { scene: gltf.scene, animations: gltf.animations };
        this.cache.set(path, entry);
        resolve(entry);
      }, undefined, reject);
    });
  }

  clone(path) {
    const c = this.cache.get(path);
    if (!c) throw new Error(`Not cached: ${path}`);
    return c.animations?.length > 0
      ? SkeletonUtils.clone(c.scene)
      : c.scene.clone();
  }

  getAnimations(path) { return this.cache.get(path)?.animations || []; }
}

// CRITICAL: traverse only isMesh children for bounds
// Box3.setFromObject includes armature bones → model floats
export function getMeshOnlyBox(root, target = new THREE.Box3()) {
  target.makeEmpty();
  root.updateMatrixWorld(true);
  root.traverse(c => {
    if (c.isMesh && c.geometry) {
      c.geometry.computeBoundingBox();
      const b = c.geometry.boundingBox.clone();
      b.applyMatrix4(c.matrixWorld);
      target.union(b);
    }
  });
  if (target.isEmpty()) target.setFromObject(root);
  return target;
}

// Scale model to targetHeight, anchor feet at y=0
export function normalizeModel(model, targetHeight) {
  model.position.set(0, 0, 0);
  model.rotation.set(0, 0, 0);
  model.updateMatrixWorld(true);

  const box = new THREE.Box3();
  model.traverse(c => {
    if (c.isMesh && c.geometry) {
      c.geometry.computeBoundingBox();
      const b = c.geometry.boundingBox.clone();
      b.applyMatrix4(c.matrixWorld);
      box.union(b);
    }
  });
  if (box.isEmpty()) box.setFromObject(model);

  const size = box.getSize(new THREE.Vector3());
  if (size.y > 0) model.scale.setScalar(targetHeight / size.y);
  model.updateMatrixWorld(true);

  const sb = new THREE.Box3();
  model.traverse(c => {
    if (c.isMesh && c.geometry) {
      const b = c.geometry.boundingBox.clone();
      b.applyMatrix4(c.matrixWorld);
      sb.union(b);
    }
  });
  if (sb.isEmpty()) sb.setFromObject(model);
  model.position.y = -sb.min.y;
  return model;
}

// Filter out death/die/dead clips, pick preferred type
export function selectSafeAnimation(anims, preferred = ['walk', 'run', 'idle']) {
  const safe = anims.filter(a => {
    const n = a.name.toLowerCase();
    return !n.includes('death') && !n.includes('die') && !n.includes('dead');
  });
  for (const p of preferred) {
    const m = safe.find(a => a.name.toLowerCase().includes(p));
    if (m) return m;
  }
  return safe[0] || anims[0];
}
