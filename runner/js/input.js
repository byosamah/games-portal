import { State, gameState } from './state.js';
import { dom } from './dom.js';

export function setupInput(charNavFn, confirmCharFn) {
  window.addEventListener('keydown', e => {
    if (e.repeat) return;
    gameState.keys[e.code] = true;
    if (e.code === 'Space') { e.preventDefault(); gameState.jumpQueued = true; }

    if (gameState.state === State.CHAR_SELECT) {
      if (e.code === 'ArrowLeft') charNavFn(-1);
      else if (e.code === 'ArrowRight') charNavFn(1);
      else if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); confirmCharFn(); }
    }
  });

  window.addEventListener('keyup', e => { gameState.keys[e.code] = false; });

  dom.jumpBtn.addEventListener('touchstart', e => {
    e.preventDefault(); gameState.jumpQueued = true;
  }, { passive: false });

  dom.jumpBtn.addEventListener('mousedown', () => { gameState.jumpQueued = true; });
}
