import * as THREE from 'three';
import { CONFIG, ASSETS } from './config.js';
import { scene } from './scene.js';
import { normalizeModel, selectSafeAnimation, getMeshOnlyBox } from './model-cache.js';

export class Pool {
  constructor(createFn, size) {
    this.items = Array.from({ length: size }, createFn);
    this.items.forEach(o => { o.visible = false; });
  }
  get()        { return this.items.find(o => !o.visible) || null; }
  release(o)   { o.visible = false; }
  releaseAll() { this.items.forEach(o => { o.visible = false; }); }
  each(fn)     { this.items.forEach(o => { if (o.visible) fn(o); }); }
}

export function createObstaclePool(cache) {
  let enemyIdx = 0;
  return new Pool(() => {
    const path = ASSETS.enemies[enemyIdx % ASSETS.enemies.length];
    enemyIdx++;

    const model = cache.clone(path);
    const h = 1.2 + Math.random() * 0.6;
    normalizeModel(model, h);
    model.rotation.y = -Math.PI / 2;

    const group = new THREE.Group();
    group.add(model);
    scene.add(group);

    const mixer = new THREE.AnimationMixer(model);
    const anims = cache.getAnimations(path);
    const clip  = selectSafeAnimation(anims, ['walk', 'run']);
    if (clip) mixer.clipAction(clip).play();

    group.updateMatrixWorld(true);
    const box  = getMeshOnlyBox(group);
    const size = box.getSize(new THREE.Vector3());

    group.userData.mixer            = mixer;
    group.userData.collisionSize    = size.clone();
    group.userData.collisionCenterY = size.y / 2;

    return group;
  }, CONFIG.obstacle.poolSize);
}
