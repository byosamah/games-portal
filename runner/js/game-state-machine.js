import { CONFIG } from './config.js';
import { State, gameState } from './state.js';
import { dom } from './dom.js';
import { camera, baseCamPos, baseFOV } from './scene.js';
import { playerEntity, setPlayerAnim } from './player.js';
import { ensureAudio, playSFX } from './audio.js';
import { triggerShake, triggerFlash, setSlowMo } from './effects.js';
import { resetGroundTiles } from './parallax.js';

export function startGame() {
  gameState.state = State.PLAYING;
  gameState.score = 0;
  gameState.displayScore = 0;
  gameState.lastMilestone = 0;
  gameState.currentSpeed = CONFIG.obstacle.speed;
  gameState.playerVY = 0;
  gameState.isGrounded = true;

  if (playerEntity.group) {
    playerEntity.group.position.set(0, 0, 0);
    playerEntity.group.scale.set(1, 1, 1);
  }
  gameState.pScale.x = 1; gameState.pScale.y = 1; gameState.pScale.z = 1;
  setPlayerAnim('Run');

  if (gameState.obstaclePool) gameState.obstaclePool.releaseAll();
  gameState.nearMissUsed.clear();
  gameState.spawnTimer = 0;
  gameState.timeScale.value = 1; gameState.timeScale.target = 1;
  gameState.shake.intensity = 0;
  camera.position.copy(baseCamPos);
  camera.fov = baseFOV;
  camera.updateProjectionMatrix();

  resetGroundTiles();

  dom.startScreen.classList.add('hidden');
  dom.gameOverScreen.classList.add('hidden');
  dom.scoreDisplay.classList.remove('hidden');
  dom.score.textContent = '0';
  ensureAudio();
}

export function triggerGameOver() {
  gameState.state = State.GAME_OVER;
  const finalScore  = Math.floor(gameState.score);
  const isNewRecord = finalScore > gameState.highScore;
  if (isNewRecord) {
    gameState.highScore = finalScore;
    localStorage.setItem('runner-high', String(gameState.highScore));
  }

  playSFX('death');
  triggerShake(0.8);
  triggerFlash('#ffffff', 400);
  setSlowMo(0.15, 600);
  setPlayerAnim('Death', { loop: false });

  gameState.restartReady = false;
  setTimeout(() => {
    dom.finalScore.textContent   = finalScore;
    dom.gameOverBest.textContent = `BEST: ${gameState.highScore}`;
    dom.newRecord.style.display  = isNewRecord ? 'block' : 'none';
    dom.gameOverScreen.classList.remove('hidden');
    dom.scoreDisplay.classList.add('hidden');
  }, 800);
  setTimeout(() => { gameState.restartReady = true; }, 1200);
}

export function setupRestartListener() {
  dom.restartBtn.addEventListener('click', () => {
    if (gameState.restartReady) startGame();
  });
}
