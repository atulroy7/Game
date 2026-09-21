import { useRef, useCallback } from 'react';

const PAD_FREQUENCIES = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];

export function useSound() {
  const ctxRef = useRef(null);

  function ctx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }

  function tone(freq, type, startTime, duration, volume = 0.25, ac) {
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // ✅ Correct – ascending happy arpeggio
  const playCorrect = useCallback(() => {
    const ac = ctx();
    const t  = ac.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 'sine', t + i * 0.07, 0.25, 0.22, ac));
  }, []);

  // ❌ Wrong – low buzz
  const playWrong = useCallback(() => {
    const ac = ctx();
    const t  = ac.currentTime;
    tone(200, 'sawtooth', t,       0.15, 0.3, ac);
    tone(150, 'sawtooth', t + 0.15, 0.2, 0.3, ac);
  }, []);

  // ⏱️ Timeout – descending warn
  const playTimeout = useCallback(() => {
    const ac = ctx();
    const t  = ac.currentTime;
    [600, 450, 300].forEach((f, i) => tone(f, 'triangle', t + i * 0.1, 0.15, 0.2, ac));
  }, []);

  // 🔥 Streak milestone – triumphant fanfare
  const playStreak = useCallback(() => {
    const ac = ctx();
    const t  = ac.currentTime;
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 'sine', t + i * 0.06, 0.3, 0.2, ac));
  }, []);

  // ⚡ Power-up used – whoosh
  const playPowerup = useCallback(() => {
    const ac  = ctx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ac.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.35);
  }, []);

  // 💔 Life lost – sad descend
  const playLifeLost = useCallback(() => {
    const ac = ctx();
    const t  = ac.currentTime;
    [400, 300, 200].forEach((f, i) => tone(f, 'triangle', t + i * 0.12, 0.2, 0.25, ac));
  }, []);

  // ⏱️ Timer tick
  const playTick = useCallback(() => {
    const ac = ctx();
    tone(880, 'sine', ac.currentTime, 0.08, 0.2, ac);
  }, []);

  // 🃏 Card flip click
  const playFlip = useCallback(() => {
    const ac = ctx();
    tone(900, 'sine', ac.currentTime, 0.05, 0.15, ac);
  }, []);

  // ✨ Card match / success chime
  const playMatch = useCallback(() => {
    const ac = ctx();
    const t  = ac.currentTime;
    [659, 880, 1046].forEach((f, i) => tone(f, 'sine', t + i * 0.07, 0.2, 0.2, ac));
  }, []);

  // 🔮 Musical pad tone for Simon/Memory Matrix (pentatonic notes)
  const playPadTone = useCallback((padIndex) => {
    const ac = ctx();
    const freq = PAD_FREQUENCIES[padIndex % PAD_FREQUENCIES.length];
    tone(freq, 'sine', ac.currentTime, 0.35, 0.28, ac);
  }, []);

  // 🚀 Level up fanfare
  const playLevelUp = useCallback(() => {
    const ac = ctx();
    const t  = ac.currentTime;
    [440, 554, 659, 880].forEach((f, i) => tone(f, 'triangle', t + i * 0.08, 0.25, 0.25, ac));
  }, []);

  return {
    playCorrect, playWrong, playTimeout, playStreak,
    playPowerup, playLifeLost, playTick,
    playFlip, playMatch, playPadTone, playLevelUp
  };
}

