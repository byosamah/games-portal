import * as THREE from 'three';
import { CONFIG, ASSETS } from './config.js';
import { gameState } from './state.js';
import { scene } from './scene.js';
import { normalizeModel, selectSafeAnimation } from './model-cache.js';

export const playerEntity = {
  group: null, model: null, mixer: null,
  animations: [], currentAction: null,
};

export function setPlayerAnim(name, { loop = true, timeScale = 1 } = {}) {
  const { animations, mixer } = playerEntity;
  if (!mixer || !animations.length) return;

  let clip = animations.find(a => a.name.toLowerCase() === name.toLowerCase());
  if (!clip) clip = animations.find(a => a.name.toLowerCase().includes(name.toLowerCase()));
  if (!clip) {
    const alts = {
      run: ['walk', 'gallop'], idle: ['stand', 'breathe'],
      jump: ['jump_up', 'leap'], death: ['die', 'dead'],
    };
    for (const alt of (alts[name.toLowerCase()] || [])) {
      clip = animations.find(a => a.name.toLowerCase().includes(alt));
      if (clip) break;
    }
  }
  if (!clip) clip = selectSafeAnimation(animations);
  if (!clip) return;

  const action = mixer.clipAction(clip);

  if (playerEntity.currentAction === action) {
    if (!action.isRunning()) action.play();
    return;
  }

  if (playerEntity.currentAction) playerEntity.currentAction.fadeOut(0.15);
  action.reset();
  action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
  action.clampWhenFinished = !loop;
  action.timeScale = timeScale;
  action.fadeIn(0.15).play();
  playerEntity.currentAction = action;
}

export function rebuildPlayer() {
  if (playerEntity.group) {
    scene.remove(playerEntity.group);
    if (playerEntity.mixer) playerEntity.mixer.stopAllAction();
  }

  const cache = gameState.modelCache;
  const playerModel = cache.clone(ASSETS.player);
  normalizeModel(playerModel, CONFIG.player.height);
  playerModel.rotation.y = Math.PI / 2;

  playerEntity.group = new THREE.Group();
  playerEntity.group.add(playerModel);
  playerEntity.model = playerModel;
  playerEntity.mixer = new THREE.AnimationMixer(playerModel);
  playerEntity.animations = cache.getAnimations(ASSETS.player);
  scene.add(playerEntity.group);
  setPlayerAnim('Idle');
}
