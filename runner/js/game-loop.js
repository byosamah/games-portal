import * as THREE from 'three';
import { CONFIG } from './config.js';
import { State, gameState } from './state.js';
import { dom } from './dom.js';
import { renderer, scene, camera, baseCamPos } from './scene.js';
import { playerEntity, setPlayerAnim } from './player.js';
import { getMeshOnlyBox } from './model-cache.js';
import { playSFX } from './audio.js';
import { triggerZoom, triggerFlash, setSlowMo, showFloatingText, setSquash } from './effects.js';
import { playerBox, obsBox, hitShrink, _center } from './collision.js';
import { startGame, triggerGameOver } from './game-state-machine.js';

const clock = new THREE.Clock();

export function animate() {
  requestAnimationFrame(animate);

  const rawDt = Math.min(clock.getDelta(), 0.05);

  if (gameState.state === State.LOADING || gameState.state === State.CHAR_SELECT) {
    renderer.render(scene, camera);
    return;
  }

  // Smooth time-scale ramp
  gameState.timeScale.value += (gameState.timeScale.target - gameState.timeScale.value) * gameState.timeScale.speed * rawDt;
  const dt = rawDt * gameState.timeScale.value;

  if (playerEntity.mixer) playerEntity.mixer.update(dt);

  /* ── MENU ──────────────────────────────── */
  if (gameState.state === State.MENU) {
    if (playerEntity.group) {
      playerEntity.group.position.y = Math.sin(Date.now() * 0.003) * 0.15;
    }
    if (gameState.jumpQueued) { gameState.jumpQueued = false; startGame(); }
  }

  /* ── PLAYING ───────────────────────────── */
  if (gameState.state === State.PLAYING) {
    // Score accumulation
    gameState.score += CONFIG.score.perSecond * dt;
    const milestone = Math.floor(gameState.score / CONFIG.score.milestoneEvery);
    if (milestone > gameState.lastMilestone) {
      gameState.lastMilestone = milestone;
      playSFX('milestone');
      triggerZoom(-3, 250);
      showFloatingText(`${milestone * CONFIG.score.milestoneEvery}!`, '#ffd700');
    }

    // Difficulty ramp
    gameState.currentSpeed = Math.min(
      CONFIG.obstacle.speed + gameState.score * CONFIG.obstacle.speedRamp,
      CONFIG.obstacle.speedMax
    );

    // Player physics
    if (gameState.jumpQueued && gameState.isGrounded) {
      gameState.jumpQueued = false;
      gameState.playerVY = CONFIG.player.jumpForce;
      gameState.isGrounded = false;
      setSquash(0.7, 1.4, 0.7);
      playSFX('jump');
      setPlayerAnim('Jump', { loop: false });
    } else {
      gameState.jumpQueued = false;
    }

    gameState.playerVY += CONFIG.player.gravity * dt;
    playerEntity.group.position.y += gameState.playerVY * dt;

    if (playerEntity.group.position.y <= 0) {
      playerEntity.group.position.y = 0;
      if (!gameState.isGrounded) {
        gameState.isGrounded = true;
        setSquash(1.3, 0.7, 1.3);
        setPlayerAnim('Run');
      }
      gameState.playerVY = 0;
    }

    // Squash & stretch on GROUP
    playerEntity.group.scale.x += (gameState.pScale.x - playerEntity.group.scale.x) * 8 * rawDt;
    playerEntity.group.scale.y += (gameState.pScale.y - playerEntity.group.scale.y) * 8 * rawDt;
    playerEntity.group.scale.z += (gameState.pScale.z - playerEntity.group.scale.z) * 8 * rawDt;
    gameState.pScale.x += (1 - gameState.pScale.x) * 4 * rawDt;
    gameState.pScale.y += (1 - gameState.pScale.y) * 4 * rawDt;
    gameState.pScale.z += (1 - gameState.pScale.z) * 4 * rawDt;

    // Spawn obstacles
    gameState.spawnTimer -= dt;
    if (gameState.spawnTimer <= 0) {
      const obs = gameState.obstaclePool ? gameState.obstaclePool.get() : null;
      if (obs) {
        obs.position.set(CONFIG.spawn.x, 0, 0);
        obs.visible = true;
        obs.userData.nearMissed = false;
      }
      gameState.spawnTimer = CONFIG.obstacle.minGap + Math.random() * 1.5;
    }

    // Move obstacles + collision
    getMeshOnlyBox(playerEntity.group, playerBox);
    playerBox.min.add(hitShrink);
    playerBox.max.sub(hitShrink);

    if (gameState.obstaclePool) gameState.obstaclePool.each(obs => {
      if (gameState.state !== State.PLAYING) return;

      if (obs.userData.mixer) obs.userData.mixer.update(dt);

      obs.position.x -= gameState.currentSpeed * dt;

      if (obs.position.x < CONFIG.spawn.despawn) {
        gameState.obstaclePool.release(obs);
        gameState.nearMissUsed.delete(obs.id);
        return;
      }

      obs.getWorldPosition(_center);
      _center.y += obs.userData.collisionCenterY;
      obsBox.setFromCenterAndSize(_center, obs.userData.collisionSize);

      if (playerBox.intersectsBox(obsBox)) {
        triggerGameOver();
        return;
      }

      if (!obs.userData.nearMissed && !gameState.nearMissUsed.has(obs.id)) {
        const expanded = playerBox.clone().expandByScalar(CONFIG.nearMiss.threshold);
        if (expanded.intersectsBox(obsBox)) {
          gameState.nearMissUsed.add(obs.id);
          obs.userData.nearMissed = true;
          gameState.score += CONFIG.score.nearMissBonus;
          playSFX('nearMiss');
          triggerFlash('#00ffff', 100);
          setSlowMo(CONFIG.nearMiss.slowMo, CONFIG.nearMiss.durationMs);
          showFloatingText('CLOSE!', '#00ffff');
        }
      }
    });

    // Ground tile scrolling
    const span = gameState.groundTileCount * gameState.groundTileWidth;
    gameState.groundTiles.forEach(tile => {
      tile.position.x -= gameState.currentSpeed * dt;
      if (tile.position.x < -span / 2) tile.position.x += span;
    });

    // Ground strip scrolling
    gameState.groundStrips.forEach(strip => {
      const stripSpan = strip.tileCount * strip.tileWidth;
      strip.tiles.forEach(tile => {
        tile.position.x -= gameState.currentSpeed * strip.speed * dt;
        if (tile.position.x < -stripSpan / 2) tile.position.x += stripSpan;
      });
    });

    // Parallax scroll
    gameState.parallaxLayers.forEach(layer => {
      layer.group.children.forEach(child => {
        child.position.x -= gameState.currentSpeed * layer.speedFactor * dt;
        if (child.position.x < -45) child.position.x += 90;
      });
    });

    // Cloud drift
    if (gameState.cloudGroup) gameState.cloudGroup.children.forEach(cloud => {
      cloud.position.x -= 0.8 * rawDt;
      if (cloud.position.x < -60) cloud.position.x += 120;
    });

    // HUD score
    gameState.displayScore += (gameState.score - gameState.displayScore) * 10 * rawDt;
    if (Math.abs(gameState.score - gameState.displayScore) < 0.5) gameState.displayScore = gameState.score;
    dom.score.textContent = Math.floor(gameState.displayScore);
    dom.highScore.textContent = `BEST: ${gameState.highScore}`;
  }

  /* ── Effects (always update) ───────────── */
  if (gameState.shake.intensity > 0.001) {
    camera.position.x = baseCamPos.x + (Math.random() - 0.5) * gameState.shake.intensity;
    camera.position.y = baseCamPos.y + (Math.random() - 0.5) * gameState.shake.intensity;
    gameState.shake.intensity *= gameState.shake.decay;
  } else {
    camera.position.x = baseCamPos.x;
    camera.position.y = baseCamPos.y;
  }

  camera.fov += (gameState.zoomTarget - camera.fov) * 5 * rawDt;
  camera.updateProjectionMatrix();

  // Restart on Space in GAME_OVER
  if (gameState.state === State.GAME_OVER && gameState.jumpQueued && gameState.restartReady) {
    gameState.jumpQueued = false;
    startGame();
  } else if (gameState.state === State.GAME_OVER) {
    gameState.jumpQueued = false;
  }

  renderer.render(scene, camera);
}
