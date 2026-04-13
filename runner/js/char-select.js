import * as THREE from 'three';
import { CHARACTERS, ASSETS } from './config.js';
import { State, gameState } from './state.js';
import { dom } from './dom.js';
import { normalizeModel, selectSafeAnimation } from './model-cache.js';
import { rebuildPlayer } from './player.js';

const charPreview = {
  renderer: null, scene: null, camera: null,
  platform: null, model: null, mixer: null, rafId: null,
};

export function initCharPreview() {
  const cvs = dom.charPreviewCanvas;
  const size = Math.min(300, window.innerWidth * 0.7);
  cvs.width  = size * window.devicePixelRatio;
  cvs.height = size * window.devicePixelRatio;

  charPreview.renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true });
  charPreview.renderer.setPixelRatio(window.devicePixelRatio);
  charPreview.renderer.setSize(size, size);
  charPreview.renderer.outputColorSpace = THREE.SRGBColorSpace;

  charPreview.scene  = new THREE.Scene();
  charPreview.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  charPreview.camera.position.set(0, 1.5, 4);
  charPreview.camera.lookAt(0, 0.8, 0);

  charPreview.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const keyLight = new THREE.DirectionalLight(0xffeedd, 1.2);
  keyLight.position.set(3, 4, 5);
  charPreview.scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
  fillLight.position.set(-3, 2, 3);
  charPreview.scene.add(fillLight);

  const platGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 32);
  const platMat = new THREE.MeshStandardMaterial({ color: 0x333355, metalness: 0.5, roughness: 0.3 });
  charPreview.platform = new THREE.Mesh(platGeo, platMat);
  charPreview.platform.position.y = -0.05;
  charPreview.scene.add(charPreview.platform);

  // Build dot indicators
  dom.charDots.innerHTML = '';
  for (let i = 0; i < CHARACTERS.length; i++) {
    const dot = document.createElement('span');
    if (i === gameState.charIndex) dot.classList.add('active');
    dom.charDots.appendChild(dot);
  }

  // Restore from localStorage
  const saved = localStorage.getItem('runner-character');
  if (saved) {
    const idx = CHARACTERS.findIndex(c => c.path === saved);
    if (idx >= 0) gameState.charIndex = idx;
  }

  showCharacter(gameState.charIndex);
}

function showCharacter(index) {
  if (charPreview.model) {
    charPreview.scene.remove(charPreview.model);
    if (charPreview.mixer) charPreview.mixer.stopAllAction();
  }

  const cache = gameState.modelCache;
  const char  = CHARACTERS[index];
  const model = cache.clone(char.path);
  normalizeModel(model, 1.5);
  model.rotation.y = 0;

  charPreview.model = model;
  charPreview.scene.add(model);

  const anims    = cache.getAnimations(char.path);
  charPreview.mixer = new THREE.AnimationMixer(model);
  const idleClip = selectSafeAnimation(anims, ['idle', 'stand', 'breathe']);
  if (idleClip) charPreview.mixer.clipAction(idleClip).play();

  dom.charCategory.textContent = char.category.toUpperCase();
  dom.charName.textContent     = char.name;

  const dots = dom.charDots.children;
  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.toggle('active', i === index);
  }
}

const previewClock = new THREE.Clock();

export function animateCharPreview() {
  charPreview.rafId = requestAnimationFrame(animateCharPreview);
  if (!charPreview.renderer) return;
  const dt = previewClock.getDelta();
  if (charPreview.mixer)    charPreview.mixer.update(dt);
  if (charPreview.model)    charPreview.model.rotation.y    += 0.4 * dt;
  if (charPreview.platform) charPreview.platform.rotation.y += 0.4 * dt;
  charPreview.renderer.render(charPreview.scene, charPreview.camera);
}

function disposeCharPreview() {
  if (charPreview.rafId) cancelAnimationFrame(charPreview.rafId);
  if (charPreview.mixer) charPreview.mixer.stopAllAction();
  if (charPreview.renderer) { charPreview.renderer.dispose(); charPreview.renderer = null; }
  charPreview.scene    = null;
  charPreview.camera   = null;
  charPreview.model    = null;
  charPreview.mixer    = null;
  charPreview.platform = null;
}

export function charNav(delta) {
  gameState.charIndex = (gameState.charIndex + delta + CHARACTERS.length) % CHARACTERS.length;
  showCharacter(gameState.charIndex);
}

export function confirmCharacter() {
  if (!charPreview.renderer) return;
  ASSETS.player = CHARACTERS[gameState.charIndex].path;
  localStorage.setItem('runner-character', ASSETS.player);
  gameState.jumpQueued = false;

  disposeCharPreview();
  dom.charSelectScreen.classList.add('hidden');
  rebuildPlayer();
  dom.startScreen.classList.remove('hidden');
  gameState.state = State.MENU;
}

export function resizeCharPreview() {
  if (charPreview.renderer) {
    const size = Math.min(300, window.innerWidth * 0.7);
    charPreview.renderer.setSize(size, size);
  }
}

export function setupCharSelectListeners() {
  dom.charPrevBtn.addEventListener('click', () => charNav(-1));
  dom.charNextBtn.addEventListener('click', () => charNav(1));
  dom.charConfirmBtn.addEventListener('click', () => confirmCharacter());

  let charTouchStartX = 0;
  dom.charPreviewCanvas.addEventListener('touchstart', e => {
    charTouchStartX = e.touches[0].clientX;
  }, { passive: true });
  dom.charPreviewCanvas.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - charTouchStartX;
    if (Math.abs(dx) > 40) charNav(dx < 0 ? 1 : -1);
  }, { passive: true });
}
