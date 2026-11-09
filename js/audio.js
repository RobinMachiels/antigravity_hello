/**
 * Web Audio API Retro Sound Synthesizer
 * Provides authentic 8-bit / 16-bit sound effects and an optional festive chiptune music box.
 */

let audioCtx = null;
let isMuted = false;
let musicBoxRunning = false;
let musicTimer = null;

// Initialize or resume audio context
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleMute() {
  isMuted = !isMuted;
  if (isMuted && musicTimer) {
    clearTimeout(musicTimer);
    musicBoxRunning = false;
  }
  return isMuted;
}

export function getMuteState() {
  return isMuted;
}

/**
 * Sound effect when clicking workshop window to toggle lights
 */
export function playWindowSwitchSound(turningOn = true) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Mechanical switch click
  const clickOsc = ctx.createOscillator();
  const clickGain = ctx.createGain();
  clickOsc.type = 'square';
  clickOsc.frequency.setValueAtTime(turningOn ? 440 : 280, now);
  clickOsc.frequency.exponentialRampToValueAtTime(80, now + 0.05);

  clickGain.gain.setValueAtTime(0.18, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  clickOsc.connect(clickGain);
  clickGain.connect(ctx.destination);
  clickOsc.start(now);
  clickOsc.stop(now + 0.05);

  // 2. Magic chime for lights
  const chimeFreqs = turningOn ? [523.25, 659.25, 783.99, 1046.5] : [783.99, 659.25, 523.25];
  chimeFreqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + 0.04 + idx * 0.05);

    gain.gain.setValueAtTime(0, now + 0.04 + idx * 0.05);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.05 + idx * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35 + idx * 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + 0.04 + idx * 0.05);
    osc.stop(now + 0.4 + idx * 0.05);
  });
}

/**
 * Sound effect when clicking on a gift box
 */
export function playPresentSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(330, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.35);
}

/**
 * Festive Retro Chiptune Music Box
 * Plays a soft, cozy 8-bit melody: "Jingle Bells" & "We Wish You a Merry Christmas"
 */
const JINGLE_BELLS_NOTES = [
  // E E E, E E E, E G C D E
  { f: 659.25, d: 200 }, { f: 659.25, d: 200 }, { f: 659.25, d: 400 },
  { f: 659.25, d: 200 }, { f: 659.25, d: 200 }, { f: 659.25, d: 400 },
  { f: 659.25, d: 200 }, { f: 783.99, d: 200 }, { f: 523.25, d: 300 }, { f: 587.33, d: 150 }, { f: 659.25, d: 700 },
  // F F F F, F E E E, E D D E D G
  { f: 698.46, d: 200 }, { f: 698.46, d: 200 }, { f: 698.46, d: 300 }, { f: 698.46, d: 150 },
  { f: 698.46, d: 200 }, { f: 659.25, d: 200 }, { f: 659.25, d: 200 }, { f: 659.25, d: 200 },
  { f: 659.25, d: 200 }, { f: 587.33, d: 200 }, { f: 587.33, d: 200 }, { f: 659.25, d: 200 }, { f: 587.33, d: 400 }, { f: 783.99, d: 400 }
];

export function toggleMusicBox() {
  const ctx = getAudioContext();
  if (!ctx) return false;

  musicBoxRunning = !musicBoxRunning;
  if (!musicBoxRunning) {
    if (musicTimer) clearTimeout(musicTimer);
    return false;
  }

  isMuted = false;
  let noteIndex = 0;

  function playNextNote() {
    if (!musicBoxRunning || isMuted) return;

    const note = JINGLE_BELLS_NOTES[noteIndex];
    noteIndex = (noteIndex + 1) % JINGLE_BELLS_NOTES.length;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Soft chime bell wave
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(note.f, now);

    const durSec = note.d / 1000;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durSec + 0.05);

    musicTimer = setTimeout(playNextNote, note.d + 60);
  }

  playNextNote();
  return true;
}

export function isMusicPlaying() {
  return musicBoxRunning;
}
