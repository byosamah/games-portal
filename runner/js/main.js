import { ASSETS, CHARACTERS } from './config.js';
import { State, gameState } from './state.js';
import { dom } from './dom.js';
import { ModelCache } from './model-cache.js';
import { renderer, camera, baseFOV } from './scene.js';
import { createObstaclePool } from './obstacles.js';
import { createGroundTiles, createParallaxLayers, createClouds } from './parallax.js';
import { initCharPreview, animateCharPreview, charNav, confirmCharacter, resizeCharPreview, setupCharSelectListeners } from './char-select.js';
import { setupInput } from './input.js';
import { setupRestartListener } from './game-state-machine.js';
import { animate } from './game-loop.js';

// Set zoomTarget to actual baseFOV now that scene is loaded
gameState.zoomTarget = baseFOV;

// Initialize high score display
dom.highScore.textContent = `BEST: ${gameState.highScore}`;

async function init() {
  const cache = new ModelCache();
  gameState.modelCache = cache;

  // Collect every unique path to load
  const allPaths = [...new Set([
    ASSETS.player, ASSETS.ground, ASSETS.dirt,
    ...ASSETS.enemies,
    ...ASSETS.far, ...ASSETS.mid, ...ASSETS.near,
    ...ASSETS.groundDetail,
    ...CHARACTERS.map(c => c.path),
  ])];

  // Sequential load with progress bar
  let loaded = 0;
  for (const path of allPaths) {
    dom.loadingAsset.textContent = path.split('/').pop();
    await cache.load(path);
    loaded++;
    dom.loadingBar.style.width = `${Math.round(loaded / allPaths.length * 100)}%`;
  }

  // Build world
  createGroundTiles(cache);
  createParallaxLayers(cache);
  createClouds();
  gameState.obstaclePool = createObstaclePool(cache);

  // Wire up input + UI listeners
  setupInput(charNav, confirmCharacter);
  setupCharSelectListeners();
  setupRestartListener();

  // Transition: LOADING → CHAR_SELECT
  dom.loadingScreen.style.display = 'none';
  dom.charSelectScreen.classList.remove('hidden');
  gameState.state = State.CHAR_SELECT;

  initCharPreview();
  animateCharPreview();

  // Start the game loop
  animate();
}

// Resize handler
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  resizeCharPreview();
});

// Boot!
init().catch(err => {
  console.error('Failed to load assets:', err);
  dom.loadingAsset.textContent = 'Error loading — check console';
});
