import { dom } from './dom.js';
import { gameState } from './state.js';
import { baseFOV } from './scene.js';

export function triggerShake(intensity) { gameState.shake.intensity = intensity; }

export function triggerFlash(color, durationMs = 120) {
  dom.flash.style.background = color;
  dom.flash.style.opacity = '0.6';
  dom.flash.style.transition = 'opacity 0.05s';
  setTimeout(() => {
    dom.flash.style.transition = `opacity ${durationMs}ms`;
    dom.flash.style.opacity = '0';
  }, 30);
}

export function triggerZoom(offset, durationMs = 300) {
  gameState.zoomTarget = baseFOV + offset;
  setTimeout(() => { gameState.zoomTarget = baseFOV; }, durationMs);
}

export function setSlowMo(scale, durationMs) {
  gameState.timeScale.target = scale;
  setTimeout(() => { gameState.timeScale.target = 1; }, durationMs);
}

export function showFloatingText(text, color = '#00ffff') {
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.color = color;
  dom.floatContainer.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

export function setSquash(sx, sy, sz) {
  gameState.pScale.x = sx;
  gameState.pScale.y = sy;
  gameState.pScale.z = sz;
}
