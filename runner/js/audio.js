let audioCtx;

export function ensureAudio() {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

export function playSFX(type) {
  ensureAudio();
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain).connect(audioCtx.destination);
  const t = audioCtx.currentTime;

  switch (type) {
    case 'jump':
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.linearRampToValueAtTime(600, t + 0.1);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.15);
      osc.start(t); osc.stop(t + 0.15);
      break;
    case 'death':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.linearRampToValueAtTime(80, t + 0.5);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.6);
      osc.start(t); osc.stop(t + 0.6);
      break;
    case 'nearMiss':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.linearRampToValueAtTime(1800, t + 0.08);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.12);
      osc.start(t); osc.stop(t + 0.12);
      break;
    case 'milestone': {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, t);
      osc.frequency.setValueAtTime(659, t + 0.1);
      osc.frequency.setValueAtTime(784, t + 0.2);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.45);
      osc.start(t); osc.stop(t + 0.45);
      break;
    }
  }
}
