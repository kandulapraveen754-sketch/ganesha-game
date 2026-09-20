/* ==========================================================================
   GANESHA: THE DIVINE ADVENTURE – CHAPTERS 1, 2 & 3
   A Complete 2D Browser Platformer & Action Adventure Game
   ==========================================================================
   TABLE OF CONTENTS:
   1. Audio Synthesizer (Web Audio API - Procedural sound effects)
   2. Input Handling (Keyboard + Mobile Touch controls)
   3. Particle System & Visual Effects
   4. Parallax Background Renderer (All 10+ Mythological Themes)
   5. Game Entities:
      - Player (Young Guardian in Ch1, Lord Ganesha in Ch2/Ch3, Mushika Ride)
      - Rival Racer (Lord Kartikeya on Mayura the Peacock)
      - Enemies & Bosses (Shiva, Vighnasura Phase 1 & 2, Ganas, Asuras, Golems)
      - SpeedBoostPad, FallingRock, WisdomSymbol, PuzzleSwitch, PuzzleGate, DefenseTarget
   6. Level Configurations (All 24 Playable Levels: Chapters 1, 2 & 3)
   7. UI, Race HUD, Countdown & Story Modal Management
   8. Main Game Loop, State Manager & LocalStorage Persistence
   ========================================================================== */

'use strict';

// ==========================================================================
// 👑 DIVINE AVATARS & SKINS PALETTE DEFINITIONS
// ==========================================================================
const DIVINE_SKINS = {
  classic: {
    id: 'classic',
    name: 'Bal Ganesha',
    tag: '🌟 Sacred Form',
    tierClass: 'tier-classic',
    icon: '🪔',
    desc: 'The beloved auspicious form of Lord Ganesha adorned with fragrant flowers, golden pitambara silk, and a celestial modak.',
    perk: 'Aura: Sacred Golden Light & Spark Trail',
    costType: 'free',
    cost: 0,
    palette: {
      skin: '#ffd54f',
      head: '#ffe082',
      cheeks: 'rgba(255, 128, 171, 0.45)',
      earInner: '#f8bbd0',
      dhoti: '#ff9800',
      dhotiHem: '#ffd700',
      dhotiSash: '#ffd700',
      feet: '#ffb300',
      aura: 'rgba(255, 215, 0, 0.25)',
      auraStroke: 'rgba(255, 215, 0, 0.65)',
      crown: '#ffd700',
      crownStroke: '#ff8f00',
      gem: '#d50000',
      necklace: '#ffd700',
      weaponStaff: '#795548',
      weaponHead: '#ffd700',
      weaponStroke: '#ff6f00',
      weaponType: 'axe',
      trailParticleColor: '#ffd700'
    }
  },
  vira: {
    id: 'vira',
    name: 'Vira Ganesha',
    tag: '⚔️ Warrior Form',
    tierClass: 'tier-warrior',
    icon: '⚔️',
    desc: 'The invincible warrior aspect armed with the fiery celestial Parashu axe, ruby battle armlets, and glowing armor.',
    perk: 'Aura: Crimson Flame & Glowing Ember Trail',
    costType: 'coins_or_ch1',
    cost: 500,
    palette: {
      skin: '#ffb74d',
      head: '#ffcc80',
      cheeks: 'rgba(255, 110, 64, 0.5)',
      earInner: '#ffab91',
      dhoti: '#d50000',
      dhotiHem: '#ffab00',
      dhotiSash: '#b71c1c',
      feet: '#e65100',
      aura: 'rgba(255, 87, 34, 0.35)',
      auraStroke: '#ff3d00',
      crown: '#ffab00',
      crownStroke: '#b71c1c',
      gem: '#00e5ff',
      necklace: '#ff9100',
      weaponStaff: '#3e2723',
      weaponHead: '#ff3d00',
      weaponStroke: '#ffd600',
      weaponType: 'flaming_axe',
      trailParticleColor: '#ff5722'
    }
  },
  suvarna: {
    id: 'suvarna',
    name: 'Suvarna Ganesha',
    tag: '👑 Radiant Gold',
    tierClass: 'tier-radiant',
    icon: '👑',
    desc: 'The pure divine golden murti radiating solar brilliance, adorned with celestial emeralds and blessed lotus motes.',
    perk: 'Aura: Suvarna Light & Floating Lotus Petals',
    costType: 'coins_or_day7',
    cost: 1000,
    palette: {
      skin: '#ffe082',
      head: '#fff59d',
      cheeks: 'rgba(255, 238, 88, 0.55)',
      earInner: '#ffe57f',
      dhoti: '#ffd700',
      dhotiHem: '#fff9c4',
      dhotiSash: '#ff8f00',
      feet: '#ffd54f',
      aura: 'rgba(255, 235, 59, 0.45)',
      auraStroke: '#ffffff',
      crown: '#fff59d',
      crownStroke: '#ffd700',
      gem: '#00e676',
      necklace: '#ffffff',
      weaponStaff: '#ffb300',
      weaponHead: '#fff9c4',
      weaponStroke: '#ffd700',
      weaponType: 'lotus_axe',
      trailParticleColor: '#fff59d'
    }
  },
  panchamukha: {
    id: 'panchamukha',
    name: 'Panchamukha Ganesha',
    tag: '🌌 Cosmic Supreme',
    tierClass: 'tier-cosmic',
    icon: '🌌',
    desc: 'The supreme five-element deity channeling Shiva and Shakti with the sacred Trishula and cosmic stardust aura.',
    perk: 'Aura: Cosmic Rainbow Halo & Stardust Trail',
    costType: 'coins_or_stars',
    cost: 2000,
    palette: {
      skin: '#ce93d8',
      head: '#e1bee7',
      cheeks: 'rgba(224, 64, 251, 0.45)',
      earInner: '#f48fb1',
      dhoti: '#7b1fa2',
      dhotiHem: '#e040fb',
      dhotiSash: '#4a148c',
      feet: '#ba68c8',
      aura: 'rgba(171, 71, 188, 0.45)',
      auraStroke: '#00e5ff',
      crown: '#e040fb',
      crownStroke: '#651fff',
      gem: '#ffd700',
      necklace: '#00e5ff',
      weaponStaff: '#4a148c',
      weaponHead: '#00e5ff',
      weaponStroke: '#e040fb',
      weaponType: 'trishul',
      trailParticleColor: '#00e5ff'
    }
  }
};

// ==========================================================================
// 1. AUDIO ENGINE (Multi-Track Background Music + Procedural SFX)
// ==========================================================================
// ==========================================================================
// 1. PROCEDURAL BACKGROUND MUSIC GENERATOR (Web Audio API)
// 60-Second Peaceful, Devotional, Joyful Indian Instrumental Soundtrack
// Instruments: Bansuri Flute, Temple Bells (Ghanti), Tabla, Manjira, Tanpura Drone, Santoor
// Scale: Raga Bhupali / Mohanam (Sacred Pentatonic in D: D, E, F#, A, B)
// 100% Original, No Vocals, No Copyright, Zero External Dependencies, Seamless Loop
// ==========================================================================
class ProceduralBGM {
  constructor(audioEngine) {
    this.engine = audioEngine;
    this.ctx = audioEngine.ctx;
    this.isPlaying = false;
    this.currentStep = 0;

    // 60-Second Master Loop Architecture:
    // 108 BPM, 27 measures of 4/4 = 108 beats = 432 steps (16th notes)
    // 108 beats * (60s / 108 beats) = exactly 60.00 seconds!
    this.tempo = 108;
    this.totalSteps = 432; // 27 bars x 16 steps
    this.stepTime = (60 / this.tempo) / 4; // ~0.138889s
    this.nextNoteTime = 0;
    this.timerID = null;
    this.scheduleAheadTime = 0.16; // 160ms schedule lookahead window
    this.lookahead = 25; // 25ms timer interval

    // Audio Graph Gain Nodes
    this.bgmGain = null;
    this.tanpuraGain = null;
    this.fluteGain = null;
    this.percussionGain = null;
    this.bellGain = null;
    this.santoorGain = null;

    // Drone Nodes
    this.droneNodes = [];
    this.droneLfo = null;
    this.isDroneActive = false;

    // Mood Mode
    this.mode = 'gameplay';

    // Sacred Frequencies (Raga Bhupali in Key of D)
    this.freqs = {
      'D3': 146.83,
      'A3': 220.00,
      'B3': 246.94,
      'D4': 293.66,
      'E4': 329.63,
      'F#4': 369.99,
      'A4': 440.00,
      'B4': 493.88,
      'D5': 587.33,
      'E5': 659.25,
      'F#5': 739.99,
      'A5': 880.00,
      'B5': 987.77,
      'D6': 1174.66
    };

    // 432-Step Devotional Melody Score (Full 60 Seconds)
    this.melodyScore = this.build60sMelodyScore();
  }

  build60sMelodyScore() {
    // 27 measures (108 beats, 432 steps) in Raga Bhupali
    return {
      // --- SECTION 1: Auspicious Dawn & Invocation (Bars 1-6, Steps 0-95) ---
      0:   { note: 'D4', dur: 3.5, vel: 0.70 },
      4:   { note: 'E4', dur: 3.5, vel: 0.75 },
      8:   { note: 'F#4', dur: 7.0, vel: 0.85, vibrato: true },
      16:  { note: 'A4', dur: 3.5, vel: 0.80 },
      20:  { note: 'B4', dur: 3.5, vel: 0.85 },
      24:  { note: 'D5', dur: 7.5, vel: 0.90, vibrato: true },
      32:  { note: 'D5', dur: 3.0, vel: 0.85 },
      36:  { note: 'E5', dur: 3.0, vel: 0.90 },
      40:  { note: 'F#5', dur: 6.5, vel: 0.95, vibrato: true },
      48:  { note: 'E5', dur: 3.0, vel: 0.85 },
      52:  { note: 'D5', dur: 3.0, vel: 0.80 },
      56:  { note: 'B4', dur: 3.5, vel: 0.85 },
      60:  { note: 'A4', dur: 3.5, vel: 0.80 },
      64:  { note: 'F#4', dur: 7.0, vel: 0.85, vibrato: true },
      72:  { note: 'E4', dur: 7.0, vel: 0.80, vibrato: true },
      80:  { note: 'D4', dur: 14.0, vel: 0.88, vibrato: true },

      // --- SECTION 2: Joyful Adventure & Modak Celebration (Bars 7-14, Steps 96-223) ---
      96:  { note: 'F#4', dur: 3.5, vel: 0.82 },
      100: { note: 'A4', dur: 3.5, vel: 0.85 },
      104: { note: 'B4', dur: 3.5, vel: 0.90 },
      108: { note: 'D5', dur: 3.5, vel: 0.95 },
      112: { note: 'E5', dur: 3.5, vel: 0.90 },
      116: { note: 'F#5', dur: 6.0, vel: 0.95, vibrato: true },
      124: { note: 'E5', dur: 2.5, vel: 0.85 },
      127: { note: 'D5', dur: 2.5, vel: 0.82 },
      130: { note: 'B4', dur: 3.5, vel: 0.88 },
      134: { note: 'D5', dur: 3.5, vel: 0.90 },
      138: { note: 'B4', dur: 3.5, vel: 0.85 },
      142: { note: 'A4', dur: 3.5, vel: 0.82 },
      146: { note: 'F#4', dur: 7.0, vel: 0.88, vibrato: true },
      154: { note: 'A4', dur: 5.0, vel: 0.85, vibrato: true },
      160: { note: 'D5', dur: 3.5, vel: 0.90 },
      164: { note: 'E5', dur: 3.5, vel: 0.92 },
      168: { note: 'F#5', dur: 3.5, vel: 0.95 },
      172: { note: 'A5', dur: 7.0, vel: 1.00, vibrato: true }, // Mountain Kailash peak
      180: { note: 'F#5', dur: 3.5, vel: 0.90 },
      184: { note: 'E5', dur: 3.5, vel: 0.85 },
      188: { note: 'D5', dur: 3.5, vel: 0.85 },
      192: { note: 'B4', dur: 3.5, vel: 0.82 },
      196: { note: 'A4', dur: 5.0, vel: 0.85, vibrato: true },
      202: { note: 'B4', dur: 2.5, vel: 0.82 },
      205: { note: 'D5', dur: 6.0, vel: 0.88, vibrato: true },
      212: { note: 'B4', dur: 3.5, vel: 0.82 },
      216: { note: 'A4', dur: 7.0, vel: 0.85, vibrato: true },

      // --- SECTION 3: Sacred Temple Radiance (Bars 15-21, Steps 224-335) ---
      224: { note: 'A4', dur: 3.5, vel: 0.82 },
      228: { note: 'B4', dur: 3.5, vel: 0.85 },
      232: { note: 'D5', dur: 3.5, vel: 0.90 },
      236: { note: 'E5', dur: 3.5, vel: 0.95 },
      240: { note: 'F#5', dur: 7.0, vel: 0.98, vibrato: true },
      248: { note: 'E5', dur: 3.5, vel: 0.88 },
      252: { note: 'D5', dur: 3.5, vel: 0.85 },
      256: { note: 'B4', dur: 3.5, vel: 0.85 },
      260: { note: 'D5', dur: 3.5, vel: 0.90 },
      264: { note: 'E5', dur: 7.0, vel: 0.92, vibrato: true },
      272: { note: 'D5', dur: 7.0, vel: 0.88, vibrato: true },
      280: { note: 'B4', dur: 3.5, vel: 0.85 },
      284: { note: 'A4', dur: 3.5, vel: 0.82 },
      288: { note: 'F#4', dur: 7.0, vel: 0.88, vibrato: true },
      296: { note: 'A4', dur: 7.0, vel: 0.85, vibrato: true },
      304: { note: 'B4', dur: 3.5, vel: 0.88 },
      308: { note: 'D5', dur: 3.5, vel: 0.92 },
      312: { note: 'E5', dur: 3.5, vel: 0.90 },
      316: { note: 'D5', dur: 3.5, vel: 0.85 },
      320: { note: 'B4', dur: 7.0, vel: 0.85, vibrato: true },
      328: { note: 'A4', dur: 7.0, vel: 0.82, vibrato: true },

      // --- SECTION 4: Auspicious Cadence & Seamless Loop Return (Bars 22-27, Steps 336-431) ---
      336: { note: 'F#4', dur: 3.5, vel: 0.85 },
      340: { note: 'E4', dur: 3.5, vel: 0.80 },
      344: { note: 'D4', dur: 3.5, vel: 0.80 },
      348: { note: 'E4', dur: 3.5, vel: 0.82 },
      352: { note: 'F#4', dur: 5.5, vel: 0.85, vibrato: true },
      358: { note: 'A4', dur: 2.5, vel: 0.82 },
      361: { note: 'B4', dur: 5.5, vel: 0.88, vibrato: true },
      368: { note: 'A4', dur: 3.5, vel: 0.82 },
      372: { note: 'F#4', dur: 3.5, vel: 0.85 },
      376: { note: 'E4', dur: 3.5, vel: 0.80 },
      380: { note: 'F#4', dur: 3.5, vel: 0.85 },
      384: { note: 'D4', dur: 18.0, vel: 0.92, vibrato: true }, // Auspicious resting note on Sa
      404: { note: 'E4', dur: 3.5, vel: 0.72 },
      408: { note: 'F#4', dur: 3.5, vel: 0.75 },
      412: { note: 'E4', dur: 3.5, vel: 0.70 },
      416: { note: 'D4', dur: 15.0, vel: 0.88, vibrato: true }  // Loops seamlessly back to step 0
    };
  }

  ensureAudioGraph() {
    if (!this.ctx) {
      this.ctx = this.engine.ctx;
    }
    if (!this.bgmGain && this.ctx) {
      this.bgmGain = this.ctx.createGain();
      const initialGain = (this.engine.musicEnabled && this.engine.volume > 0) ? (this.engine.volume * 0.70) : 0.0001;
      this.bgmGain.gain.setValueAtTime(initialGain, this.ctx.currentTime);
      this.bgmGain.connect(this.engine.masterGain || this.ctx.destination);

      this.tanpuraGain = this.ctx.createGain();
      this.tanpuraGain.gain.setValueAtTime(0.30, this.ctx.currentTime);
      this.tanpuraGain.connect(this.bgmGain);

      this.fluteGain = this.ctx.createGain();
      this.fluteGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.fluteGain.connect(this.bgmGain);

      this.percussionGain = this.ctx.createGain();
      this.percussionGain.gain.setValueAtTime(0.70, this.ctx.currentTime);
      this.percussionGain.connect(this.bgmGain);

      this.bellGain = this.ctx.createGain();
      this.bellGain.gain.setValueAtTime(0.55, this.ctx.currentTime);
      this.bellGain.connect(this.bgmGain);

      this.santoorGain = this.ctx.createGain();
      this.santoorGain.gain.setValueAtTime(0.40, this.ctx.currentTime);
      this.santoorGain.connect(this.bgmGain);
    }
  }

  // --- INSTRUMENT: BANSURI (Divine Bamboo Flute) ---
  playBansuriNote(time, noteName, durSteps, velocity, hasVibrato) {
    if (!this.ctx || !this.fluteGain) return;
    const freq = this.freqs[noteName] || 293.66;
    const dur = durSteps * this.stepTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.002, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, time);
    filter.Q.setValueAtTime(2.0, time);

    const noteGain = this.ctx.createGain();
    const targetAmp = 0.22 * velocity;
    const attackTime = 0.04;
    const releaseTime = Math.min(0.14, dur * 0.3);

    noteGain.gain.setValueAtTime(0.0001, time);
    noteGain.gain.exponentialRampToValueAtTime(targetAmp, time + attackTime);
    noteGain.gain.setValueAtTime(targetAmp, time + Math.max(attackTime, dur - releaseTime));
    noteGain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    if (hasVibrato && dur > 0.38) {
      const vibOsc = this.ctx.createOscillator();
      const vibGain = this.ctx.createGain();
      vibOsc.type = 'sine';
      vibOsc.frequency.setValueAtTime(5.25, time);
      vibGain.gain.setValueAtTime(0.0, time);
      vibGain.gain.setValueAtTime(0.0, time + 0.18);
      vibGain.gain.linearRampToValueAtTime(freq * 0.015, time + 0.42);

      vibOsc.connect(vibGain);
      vibGain.connect(osc1.frequency);
      vibGain.connect(osc2.frequency);
      vibOsc.start(time);
      vibOsc.stop(time + dur + 0.05);
    }

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.fluteGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + dur + 0.05);
    osc2.stop(time + dur + 0.05);
  }

  // --- INSTRUMENT: TEMPLE BELLS (Ghanti) ---
  playTempleBell(time, baseFreq = 880, velocity = 0.55) {
    if (!this.ctx || !this.bellGain) return;
    const modes = [
      { ratio: 1.0,   amp: 0.16 * velocity, decay: 2.2 },
      { ratio: 2.756, amp: 0.11 * velocity, decay: 1.5 },
      { ratio: 5.404, amp: 0.06 * velocity, decay: 0.9 }
    ];

    modes.forEach(mode => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * mode.ratio, time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(mode.amp, time + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + mode.decay);

      osc.connect(gain);
      gain.connect(this.bellGain);

      osc.start(time);
      osc.stop(time + mode.decay + 0.05);
    });
  }

  // --- INSTRUMENT: MANJIRA (Finger Cymbals) ---
  playManjira(time, velocity = 0.40) {
    if (!this.ctx || !this.bellGain) return;
    [3920, 5873].forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f + (idx * 25), time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(0.05 * velocity, time + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);

      osc.connect(gain);
      gain.connect(this.bellGain);

      osc.start(time);
      osc.stop(time + 0.15);
    });
  }

  // --- INSTRUMENT: TABLA BAYAN (Bass "Dha" / "Ghe") ---
  playTablaBayan(time, velocity = 0.65) {
    if (!this.ctx || !this.percussionGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(96, time);
    osc.frequency.exponentialRampToValueAtTime(48, time + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.34 * velocity, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.percussionGain);

    osc.start(time);
    osc.stop(time + 0.26);
  }

  // --- INSTRUMENT: TABLA DAYAN (Treble "Ta" / "Tin" / "Na") ---
  playTablaDayan(time, velocity = 0.50, pitch = 'D4') {
    if (!this.ctx || !this.percussionGain) return;
    const baseFreq = this.freqs[pitch] || 293.66;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 1.38, time);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, time + 0.02);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq, time);
    filter.Q.setValueAtTime(5.0, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.24 * velocity, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.percussionGain);

    osc.start(time);
    osc.stop(time + 0.18);
  }

  // --- INSTRUMENT: SANTOOR ARPEGGIO ---
  playSantoorNote(time, noteName, velocity = 0.35) {
    if (!this.ctx || !this.santoorGain) return;
    const freq = this.freqs[noteName] || 587.33;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.18 * velocity, time + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.2);

    osc.connect(gain);
    gain.connect(this.santoorGain);
    osc.start(time);
    osc.stop(time + 1.25);
  }

  // --- INSTRUMENT: TANPURA SACRED DRONE ---
  startTanpuraDrone() {
    if (this.isDroneActive || !this.ctx || !this.tanpuraGain) return;
    try {
      this.droneNodes = [];
      const droneNotes = [
        { freq: this.freqs['D3'], type: 'sine',     gain: 0.18 },
        { freq: this.freqs['A3'], type: 'triangle', gain: 0.10 },
        { freq: this.freqs['D4'], type: 'sine',     gain: 0.08 }
      ];

      this.droneLfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      this.droneLfo.type = 'sine';
      this.droneLfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      this.droneLfo.connect(lfoGain);
      this.droneLfo.start();

      droneNotes.forEach(cfg => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = cfg.type;
        osc.frequency.setValueAtTime(cfg.freq, this.ctx.currentTime);

        g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        g.gain.linearRampToValueAtTime(cfg.gain, this.ctx.currentTime + 1.2);

        lfoGain.connect(g.gain);
        osc.connect(g);
        g.connect(this.tanpuraGain);

        osc.start();
        this.droneNodes.push({ osc, gain: g });
      });

      this.isDroneActive = true;
    } catch (err) {
      console.warn("Tanpura drone start:", err);
    }
  }

  stopTanpuraDrone() {
    if (!this.isDroneActive) return;
    try {
      const now = this.ctx ? this.ctx.currentTime : 0;
      this.droneNodes.forEach(node => {
        try {
          node.gain.gain.setValueAtTime(node.gain.gain.value, now);
          node.gain.gain.linearRampToValueAtTime(0.0001, now + 0.25);
          node.osc.stop(now + 0.3);
        } catch (_) {}
      });
      if (this.droneLfo) {
        try { this.droneLfo.stop(now + 0.3); } catch (_) {}
      }
    } catch (_) {}
    this.droneNodes = [];
    this.droneLfo = null;
    this.isDroneActive = false;
  }

  // --- SCHEDULING ENGINE ---
  scheduler() {
    if (!this.isPlaying || !this.ctx) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      this.advanceStep();
    }
    this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
  }

  scheduleStep(step, time) {
    // 1. Melody (Bansuri)
    const mel = this.melodyScore[step];
    if (mel) {
      this.playBansuriNote(time, mel.note, mel.dur, mel.vel, mel.vibrato || false);
    }

    // 2. Temple Bells (Ghanti)
    if (step === 0 || step === 96 || step === 224 || step === 352) {
      this.playTempleBell(time, 880, 0.70); // A5 Bell
    } else if (step === 32 || step === 128 || step === 172 || step === 320) {
      this.playTempleBell(time, 1174.66, 0.65); // High D6 Bell
    }

    // 3. Indian Percussion (Tabla & Manjira)
    const isMenu = (this.mode === 'menu');
    const isRace = (this.mode === 'race' || this.mode === 'chapter3');
    const percVol = isMenu ? 0.45 : (isRace ? 0.85 : 0.68);

    const stepInBar = step % 16;
    const mIdx = Math.floor(step / 16);
    const dynamicPerc = (mIdx < 2) ? (percVol * 0.6) : percVol;

    // Tabla Bayan (Bass)
    if (stepInBar === 0) {
      this.playTablaBayan(time, dynamicPerc * 1.0); // "Dha"
      this.playManjira(time, dynamicPerc * 0.85);
    } else if (stepInBar === 6) {
      this.playTablaBayan(time, dynamicPerc * 0.65); // "Ghe"
    } else if (stepInBar === 8) {
      this.playTablaBayan(time, dynamicPerc * 0.85); // "Dha"
      this.playManjira(time, dynamicPerc * 0.80);
    } else if (stepInBar === 12 && isRace) {
      this.playTablaBayan(time, dynamicPerc * 0.70);
    }

    // Tabla Dayan (Treble)
    if (stepInBar === 4) {
      this.playTablaDayan(time, dynamicPerc * 0.75, 'D4'); // "Ta"
    } else if (stepInBar === 10) {
      this.playTablaDayan(time, dynamicPerc * 0.70, 'A4'); // "Tin"
    } else if (stepInBar === 14) {
      this.playTablaDayan(time, dynamicPerc * 0.65, 'D4'); // "Na"
    } else if ((stepInBar === 2 || stepInBar === 8) && isRace) {
      this.playTablaDayan(time, dynamicPerc * 0.55, 'A4');
    }

    // 4. Santoor Plucked Glissandos (Measures 6, 12, 18, 24)
    if (mIdx === 5 || mIdx === 11 || mIdx === 17 || mIdx === 23) {
      const offset = stepInBar - 8;
      const arpNotes = ['D5', 'E5', 'F#5', 'A5', 'D6'];
      if (offset >= 0 && offset < arpNotes.length) {
        this.playSantoorNote(time, arpNotes[offset], 0.38);
      }
    }
  }

  advanceStep() {
    this.currentStep = (this.currentStep + 1) % this.totalSteps;
    this.nextNoteTime += this.stepTime;
  }

  async start() {
    if (this.isPlaying) return;
    if (!this.engine.musicEnabled) return;

    this.ensureAudioGraph();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (_) {}
    }

    this.isPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;

    if (this.bgmGain) {
      const targetVol = this.engine.volume * 0.70;
      this.bgmGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.bgmGain.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 0.4);
    }

    this.startTanpuraDrone();
    this.scheduler();
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.timerID) {
      clearTimeout(this.timerID);
      this.timerID = null;
    }

    if (this.bgmGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
        this.bgmGain.gain.linearRampToValueAtTime(0.0001, now + 0.25);
      } catch (_) {}
    }

    this.stopTanpuraDrone();
  }

  setVolume(vol) {
    if (this.bgmGain && this.ctx) {
      try {
        const targetVol = (this.engine.musicEnabled && vol > 0) ? (vol * 0.70) : 0.0001;
        this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, this.ctx.currentTime);
        this.bgmGain.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 0.1);
      } catch (_) {}
    }
  }

  setMode(newMode) {
    if (this.mode === newMode) return;
    this.mode = newMode;
    if (newMode === 'race' || newMode === 'chapter3') {
      this.tempo = 112;
    } else if (newMode === 'temple' || newMode === 'chapter1') {
      this.tempo = 104;
    } else if (newMode === 'victory') {
      this.tempo = 108;
      if (this.ctx && this.isPlaying) {
        this.playTempleBell(this.ctx.currentTime + 0.05, 1174.66, 0.85);
      }
    } else {
      this.tempo = 108;
    }
    this.stepTime = (60 / this.tempo) / 4;
  }
}

// ==========================================================================
// 2. SOUND ENGINE (Coordinating Web Audio Synth + Audio Element Fallback)
// ==========================================================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.proceduralBgm = null;
    this.bgmPlayer = null;
    this.currentTrackType = 'gameplay';

    // Preferences with LocalStorage persistence
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.volume = 0.80;
    this.isUnlocked = false;

    this.loadAudioPreferences();
    this.initAudioElement();
  }

  get sfxEnabled() {
    return this.soundEnabled;
  }

  set sfxEnabled(v) {
    this.soundEnabled = !!v;
  }

  loadAudioPreferences() {
    this.musicEnabled = true;
    this.soundEnabled = true;
    this.volume = 0.80;
    try {
      const savedMusic = localStorage.getItem('ganesha_music_enabled');
      if (savedMusic !== null) this.musicEnabled = (savedMusic === 'true');

      const savedSound = localStorage.getItem('ganesha_sfx_enabled');
      if (savedSound !== null) this.soundEnabled = (savedSound === 'true');

      const savedVol = localStorage.getItem('ganesha_audio_volume');
      if (savedVol !== null) {
        const v = parseFloat(savedVol);
        if (!isNaN(v) && v >= 0) this.volume = Math.max(0.05, Math.min(1, v));
      }
    } catch (_) {}
  }

  initAudioElement() {
    // Support both ID conventions (bg-music-player and bgMusic)
    let player = document.getElementById('bg-music-player') || document.getElementById('bgMusic');
    if (!player) {
      player = new Audio();
      player.id = 'bg-music-player';
      player.playsInline = true;
      player.setAttribute('playsinline', '');
      player.setAttribute('webkit-playsinline', '');
      document.body.appendChild(player);
    }
    player.loop = true;
    player.preload = 'auto';
    player.volume = this.volume;

    this.bgmPlayer = player;
  }

  getBgmPlayer() {
    if (!this.bgmPlayer) {
      this.initAudioElement();
    }
    return this.bgmPlayer;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.soundEnabled ? this.volume : 0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.ctx && !this.proceduralBgm) {
      this.proceduralBgm = new ProceduralBGM(this);
    }

    this.isUnlocked = true;
    this.updateUI();
  }

  unlock() {
    this.init();
    if (this.musicEnabled) {
      this.ensureMusicPlaying();
    }
  }

  ensureMusicPlaying() {
    this.init();
    if (!this.musicEnabled) return;

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // Guarantee immediate background music via Procedural Web Audio Synthesizer
    if (this.proceduralBgm && !this.proceduralBgm.isPlaying) {
      this.proceduralBgm.start();
    }

    // Also attempt HTML5 audio element if an audio file is available
    const player = this.getBgmPlayer();
    if (player && player.paused) {
      try {
        const playPromise = player.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            // HTML5 player succeeded
            if (this.proceduralBgm && this.proceduralBgm.isPlaying) {
              this.proceduralBgm.setVolume(this.volume * 0.35);
            }
          }).catch(() => {
            // HTML5 failed/404: Procedural synth keeps playing full volume!
            if (this.proceduralBgm && this.proceduralBgm.isPlaying) {
              this.proceduralBgm.setVolume(this.volume);
            }
          });
        }
      } catch (_) {}
    }

    this.updateUI();
    const hint = document.getElementById('menu-tap-hint');
    if (hint) {
      hint.style.opacity = '0';
      hint.style.pointerEvents = 'none';
    }
  }

  playTrack(type, forceRestart = false) {
    this.init();
    this.currentTrackType = type;

    if (!this.musicEnabled) {
      this.stopCurrentMusic();
      return;
    }

    const player = this.getBgmPlayer();

    if (type === 'gameover') {
      if (player && !player.paused) {
        player.volume = this.volume * 0.35;
      }
      if (this.proceduralBgm && this.proceduralBgm.isPlaying) {
        this.proceduralBgm.setVolume(this.volume * 0.35);
      }
      return;
    }

    if (player) {
      player.volume = this.volume;
    }

    // CONTINUOUS PLAYBACK REQUIREMENT ACROSS ALL 24 LEVELS:
    // If music is already playing, DO NOT RESTART OR RESET CURRENT TIME!
    if (!forceRestart) {
      if (player && !player.paused && player.currentTime > 0) {
        return;
      }
      if (this.proceduralBgm && this.proceduralBgm.isPlaying) {
        this.proceduralBgm.setMode(type);
        return;
      }
    }

    this.ensureMusicPlaying();
  }

  stopCurrentMusic() {
    const player = this.getBgmPlayer();
    if (player) {
      try { player.pause(); } catch (_) {}
    }
    if (this.proceduralBgm) {
      this.proceduralBgm.stop();
    }
  }

  toggleMusic() {
    this.init();
    this.musicEnabled = !this.musicEnabled;
    try {
      localStorage.setItem('ganesha_music_enabled', this.musicEnabled);
    } catch (_) {}

    if (this.musicEnabled) {
      this.ensureMusicPlaying();
    } else {
      this.stopCurrentMusic();
    }

    this.updateUI();
    return this.musicEnabled;
  }

  toggleSound() {
    this.init();
    this.soundEnabled = !this.soundEnabled;
    try {
      localStorage.setItem('ganesha_sfx_enabled', this.soundEnabled);
    } catch (_) {}

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.soundEnabled ? this.volume : 0, this.ctx.currentTime);
    }

    this.updateUI();
    return this.soundEnabled;
  }

  toggle() {
    return this.toggleSound();
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    try {
      localStorage.setItem('ganesha_audio_volume', this.volume);
    } catch (_) {}

    const player = this.getBgmPlayer();
    if (player) {
      player.volume = this.volume;
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.soundEnabled ? this.volume : 0, this.ctx.currentTime);
    }

    if (this.proceduralBgm) {
      this.proceduralBgm.setVolume(this.volume);
    }

    this.updateUI();
  }

  updateUI() {
    // 1. HUD Speaker Icon (🔊 ON / 🔇 OFF)
    const btnMusic = document.getElementById('btn-music');
    if (btnMusic) {
      btnMusic.textContent = this.musicEnabled ? '🔊' : '🔇';
      btnMusic.title = this.musicEnabled ? 'Music: ON (Click to Mute)' : 'Music: OFF (Click to Play)';
      btnMusic.setAttribute('aria-label', this.musicEnabled ? 'Music ON' : 'Music OFF');
      if (this.musicEnabled) {
        btnMusic.classList.add('music-active');
        btnMusic.classList.remove('music-muted');
      } else {
        btnMusic.classList.add('music-muted');
        btnMusic.classList.remove('music-active');
      }
    }

    // 2. Mobile Touch Music Button
    const touchMusic = document.getElementById('touch-music');
    if (touchMusic) {
      touchMusic.textContent = this.musicEnabled ? '🔊' : '🔇';
      touchMusic.title = this.musicEnabled ? 'Music: ON' : 'Music: OFF';
    }

    // 3. Main Menu Music Button
    const btnMenuMusic = document.getElementById('btn-menu-music');
    if (btnMenuMusic) {
      btnMenuMusic.innerHTML = `<span id="menu-music-icon">${this.musicEnabled ? '🔊' : '🔇'}</span> Music: <span id="menu-music-status">${this.musicEnabled ? 'ON' : 'OFF'}</span>`;
      btnMenuMusic.title = this.musicEnabled ? 'Music: ON (Click to Mute)' : 'Music: OFF (Click to Play)';
    }

    const menuMusicIcon = document.getElementById('menu-music-icon');
    if (menuMusicIcon) {
      menuMusicIcon.textContent = this.musicEnabled ? '🔊' : '🔇';
    }

    const menuMusicStatus = document.getElementById('menu-music-status');
    if (menuMusicStatus) {
      menuMusicStatus.textContent = this.musicEnabled ? 'ON' : 'OFF';
    }

    // 4. Pause Menu Music Button
    const btnPauseMusic = document.getElementById('btn-pause-music');
    if (btnPauseMusic) {
      btnPauseMusic.innerHTML = `Music: <span id="pause-music-status">${this.musicEnabled ? '🔊 ON' : '🔇 OFF'}</span>`;
    }
    const pauseMusicStatus = document.getElementById('pause-music-status');
    if (pauseMusicStatus) {
      pauseMusicStatus.textContent = this.musicEnabled ? '🔊 ON' : '🔇 OFF';
    }

    // 5. Sound SFX Buttons
    const btnSound = document.getElementById('btn-sound');
    if (btnSound) {
      btnSound.textContent = this.soundEnabled ? '🔔' : '🔕';
      btnSound.title = this.soundEnabled ? 'SFX: ON (Click to Mute)' : 'SFX: OFF (Click to Play)';
    }

    const btnMenuSound = document.getElementById('btn-menu-sound');
    if (btnMenuSound) {
      btnMenuSound.innerHTML = `🔔 SFX: <span id="menu-sound-status">${this.soundEnabled ? 'ON' : 'OFF'}</span>`;
    }

    const pauseSoundStatus = document.getElementById('pause-sound-status');
    if (pauseSoundStatus) {
      pauseSoundStatus.textContent = this.soundEnabled ? '🔔 ON' : '🔕 OFF';
    }

    // 6. Volume Sliders
    const pct = Math.round(this.volume * 100);
    const volSlider = document.getElementById('volume-slider');
    if (volSlider) volSlider.value = pct;

    const pauseVolSlider = document.getElementById('pause-volume-slider');
    if (pauseVolSlider) pauseVolSlider.value = pct;

    const volDisplay = document.getElementById('volume-val-display');
    if (volDisplay) volDisplay.textContent = `${pct}%`;
  }
  playJump() {
    if (!this.soundEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(540, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  playAttack() {
    if (!this.soundEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.13);
  }

  playDivineSkill() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    [528, 660, 792, 1056].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);
      gain.gain.setValueAtTime(0.15, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + i * 0.05);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + 0.7);
    });
  }

  playTrunkBlast() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  playSwitchClick() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playBoost() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.25);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  playCountdownBeep(isGo = false) {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isGo ? 880 : 440, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + (isGo ? 0.35 : 0.15));
    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);
    osc.start(now);
    osc.stop(now + (isGo ? 0.36 : 0.16));
  }

  playHit() {
    if (!this.soundEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.11);
  }

  playCollect() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    [659.25, 880, 1318.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.12, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35 + idx * 0.06);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + 0.4);
    });
  }

  playItemCollect() {
    this.playCollect();
  }

  playCoin() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    [987.77, 1318.51].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.16, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28 + idx * 0.07);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + 0.32 + idx * 0.07);
    });
  }

  playClick() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  playVictory() {
    if (!this.soundEnabled || !this.ctx) return;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    const now = this.ctx.currentTime;
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.1);
      gain.gain.setValueAtTime(0.18, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + i * 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + 1.2);
    });
  }

  playDeepTempleBell() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const baseFreq = 220; // Deep resonant A3
    [1.0, 2.0, 2.76, 4.07, 5.4].forEach((ratio, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * ratio, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35 / (idx + 1), now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2 - idx * 0.4);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 3.3);
    });
  }

  playConchAmbience() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(220, now);
      osc2.frequency.setValueAtTime(330, now);
      
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.linearRampToValueAtTime(800, now + 1.2);
      filter.frequency.linearRampToValueAtTime(350, now + 2.8);
      filter.Q.value = 4.0;
      
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.9);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.9);
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 3.0);
      osc2.stop(now + 3.0);
    } catch (_) {}
  }

  playTitleImpact() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    try {
      // 1. Sub-bass sine sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(36, now + 0.45);
      
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.40, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.95);

      // 2. Resonant noise punch
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.3);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const nFilter = this.ctx.createBiquadFilter();
      nFilter.type = 'lowpass';
      nFilter.frequency.setValueAtTime(350, now);
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.25, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      noise.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(this.masterGain || this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.35);
    } catch (_) {}
  }

  playTitleChime() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    [1046.50, 1318.51, 1567.98, 2093.00].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.001, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.06 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 1.4);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 1.5);
    });
  }

  playTempleBell(baseFreq = 880) {
    if (!this.soundEnabled || !this.ctx) return;
    if (this.bgm && typeof this.bgm.playTempleBell === 'function') {
      this.bgm.playTempleBell(this.ctx.currentTime, baseFreq, 0.85);
      return;
    }
    const now = this.ctx.currentTime;
    [1.0, 2.76, 5.4].forEach((ratio, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * ratio, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2 / (idx + 1), now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5 - idx * 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.6);
    });
  }

  playWaterSplash() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.25);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(180, now + 0.25);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  playKeyUnlock() {
    if (!this.soundEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.05);
      gain.gain.setValueAtTime(0.15, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4 + i * 0.05);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + 0.5);
    });
  }

  playGameOver() {
    if (!this.soundEnabled || !this.ctx) return;
    const notes = [440, 415.3, 392, 349.23];
    const now = this.ctx.currentTime;
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.16);
      gain.gain.setValueAtTime(0.16, now + i * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7 + i * 0.16);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now + i * 0.16);
      osc.stop(now + 1.2);
    });
  }
}

const sounds = new SoundEngine();
window.sounds = sounds;

// First interaction audio unlock (Desktop click / Mobile tap)
const unlockContinuousMusic = () => {
  if (sounds) {
    sounds.init();
    if (sounds.musicEnabled) {
      sounds.ensureMusicPlaying();
    }
  }
};
['click', 'touchstart', 'pointerdown', 'keydown'].forEach(evt => {
  window.addEventListener(evt, unlockContinuousMusic, { passive: true });
});

// ==========================================================================
// 2. INPUT HANDLER (Keyboard + Mobile Touch including 'L')
// ==========================================================================
class InputHandler {
  constructor() {
    this.keys = {
      left: false,
      right: false,
      jump: false,
      attack: false,
      skill: false,
      beam: false,
      pause: false
    };

    this.setupKeyboard();
    this.setupTouch();
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      sounds.init();
      switch (e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          this.keys.left = true;
          break;
        case 'd':
        case 'arrowright':
          this.keys.right = true;
          break;
        case 'w':
        case 'arrowup':
        case ' ':
          this.keys.jump = true;
          break;
        case 'j':
          this.keys.attack = true;
          break;
        case 'k':
          this.keys.skill = true;
          break;
        case 'l':
          this.keys.beam = true;
          break;
        case 'm':
          sounds.toggleMusic();
          break;
        case 'p':
        case 'escape':
          if (typeof game !== 'undefined' && game) game.togglePause();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          this.keys.left = false;
          break;
        case 'd':
        case 'arrowright':
          this.keys.right = false;
          break;
        case 'w':
        case 'arrowup':
        case ' ':
          this.keys.jump = false;
          break;
        case 'j':
          this.keys.attack = false;
          break;
        case 'k':
          this.keys.skill = false;
          break;
        case 'l':
          this.keys.beam = false;
          break;
      }
    });
  }

  setupTouch() {
    // Unlock Web Audio & BGM player on the very first touch/click anywhere
    const unlockAudio = () => {
      sounds.unlock();
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('click', unlockAudio);
    };
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('click', unlockAudio, { passive: true });

    const bindButton = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;

      const onPress = (e) => {
        if (e && e.cancelable) e.preventDefault();
        sounds.init();
        this.keys[key] = true;
        el.classList.add('is-pressed');
        if (typeof game !== 'undefined' && game) game.triggerVibrate(15);
      };

      const onRelease = (e) => {
        if (e && e.cancelable) e.preventDefault();
        this.keys[key] = false;
        el.classList.remove('is-pressed');
      };

      // Modern Pointer Events (Android Chrome, iOS Safari 13+)
      el.addEventListener('pointerdown', (e) => {
        try { el.setPointerCapture(e.pointerId); } catch (_) {}
        onPress(e);
      });
      el.addEventListener('pointerup', onRelease);
      el.addEventListener('pointercancel', onRelease);
      el.addEventListener('pointerleave', (e) => {
        if (!el.hasPointerCapture || !el.hasPointerCapture(e.pointerId)) {
          onRelease(e);
        }
      });

      // Touch events
      el.addEventListener('touchstart', onPress, { passive: false });
      el.addEventListener('touchend', onRelease, { passive: false });
      el.addEventListener('touchcancel', onRelease, { passive: false });

      // Mouse events for desktop browser responsive mode
      el.addEventListener('mousedown', onPress);
      el.addEventListener('mouseup', onRelease);
      el.addEventListener('mouseleave', onRelease);
    };

    bindButton('touch-left', 'left');
    bindButton('touch-right', 'right');
    bindButton('touch-jump', 'jump');
    bindButton('touch-attack', 'attack');
    bindButton('touch-skill', 'skill');
    bindButton('touch-special2', 'beam');

    // Global release safeguard: if touch is cancelled or all touches lifted
    window.addEventListener('touchend', (e) => {
      if (e.touches && e.touches.length === 0) {
        this.keys.left = false;
        this.keys.right = false;
        this.keys.jump = false;
        this.keys.attack = false;
        this.keys.skill = false;
        this.keys.beam = false;
        document.querySelectorAll('.touch-btn').forEach(btn => btn.classList.remove('is-pressed'));
      }
    }, { passive: true });

    window.addEventListener('touchcancel', () => {
      for (const k in this.keys) this.keys[k] = false;
      document.querySelectorAll('.touch-btn').forEach(btn => btn.classList.remove('is-pressed'));
    }, { passive: true });

    window.addEventListener('blur', () => {
      for (const k in this.keys) this.keys[k] = false;
      document.querySelectorAll('.touch-btn').forEach(btn => btn.classList.remove('is-pressed'));
    });
  }
}

// ==========================================================================
// 3. PARTICLE SYSTEM & VISUAL EFFECTS
// ==========================================================================
class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emitSparks(x, y, count = 12, color = '#ffd700') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.03,
        color: color,
        type: 'spark'
      });
    }
  }

  emitLotusPetals(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20, y: y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -1 - Math.random() * 2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        size: 5 + Math.random() * 4,
        alpha: 1, decay: 0.015,
        color: Math.random() > 0.5 ? '#f48fb1' : '#ffd700',
        type: 'petal'
      });
    }
  }

  emitAuraRing(x, y, maxRadius = 90, color = '#ffd700') {
    this.particles.push({
      x: x, y: y, radius: 5, maxRadius: maxRadius,
      growth: 4.5, alpha: 1, decay: 0.04, color: color, type: 'ring'
    });
  }

  emitFloatingText(x, y, text, color = '#ffd700', size = 14) {
    this.particles.push({
      x: x, y: y, text: text,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -1.3,
      size: size,
      alpha: 1,
      decay: 0.018,
      color: color,
      type: 'text'
    });
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.alpha -= p.decay;

      if (p.type === 'spark') {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05;
      } else if (p.type === 'petal') {
        p.x += p.vx + Math.sin(Date.now() * 0.005 + i) * 0.5;
        p.y += p.vy; p.rotation += p.rotSpeed;
      } else if (p.type === 'ring') {
        p.radius += p.growth;
      } else if (p.type === 'text') {
        p.x += p.vx;
        p.y += p.vy;
      }

      if (p.alpha <= 0 || (p.type === 'ring' && p.radius >= p.maxRadius)) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx, cameraX) {
    ctx.save();
    for (const p of this.particles) {
      const screenX = p.x - cameraX;
      ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(screenX, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'petal') {
        ctx.save();
        ctx.translate(screenX, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'text') {
        ctx.font = `bold ${p.size}px 'Philosopher', sans-serif`;
        ctx.fillStyle = p.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 4;
        ctx.fillText(p.text, screenX, p.y);
      }
    }
    ctx.restore();
  }
}

// ==========================================================================
// 4. PARALLAX BACKGROUND & SCENERY RENDERER
// ==========================================================================
class BackgroundRenderer {
  constructor() {
    this.stars = [];
    for (let i = 0; i < 70; i++) {
      this.stars.push({
        x: Math.random() * 960,
        y: Math.random() * 320,
        size: 1 + Math.random() * 2,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }

  draw(ctx, cameraX, theme = 'palace') {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    let skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (theme === 'palace' || theme === 'sacred_circle') {
      skyGrad.addColorStop(0, '#120424');
      skyGrad.addColorStop(0.5, '#2e0e47');
      skyGrad.addColorStop(1, '#ff6f00');
    } else if (theme === 'kailash' || theme === 'mountain_trials') {
      skyGrad.addColorStop(0, '#04081c');
      skyGrad.addColorStop(0.4, '#15244f');
      skyGrad.addColorStop(0.8, '#4a154b');
      skyGrad.addColorStop(1, '#ffd700');
    } else if (theme === 'corrupted_forest') {
      skyGrad.addColorStop(0, '#100224');
      skyGrad.addColorStop(0.5, '#28063b');
      skyGrad.addColorStop(1, '#b71c1c');
    } else if (theme === 'village') {
      skyGrad.addColorStop(0, '#1a052e');
      skyGrad.addColorStop(0.5, '#6a1b9a');
      skyGrad.addColorStop(1, '#ff9100');
    } else if (theme === 'ancient_temple' || theme === 'wisdom_temple') {
      skyGrad.addColorStop(0, '#1f1305');
      skyGrad.addColorStop(0.5, '#4e342e');
      skyGrad.addColorStop(1, '#ffb300');
    } else if (theme === 'divine_kingdom' || theme === 'divine_race_track') {
      skyGrad.addColorStop(0, '#02182b');
      skyGrad.addColorStop(0.4, '#0d47a1');
      skyGrad.addColorStop(0.8, '#ffd700');
      skyGrad.addColorStop(1, '#fffde7');
    } else if (theme === 'fortress') {
      skyGrad.addColorStop(0, '#05010a');
      skyGrad.addColorStop(0.5, '#1a0316');
      skyGrad.addColorStop(1, '#880e4f');
    } else if (theme === 'peacock_realm') {
      skyGrad.addColorStop(0, '#00251a');
      skyGrad.addColorStop(0.4, '#004d40');
      skyGrad.addColorStop(0.8, '#00b0ff');
      skyGrad.addColorStop(1, '#ffd700');
    } else if (theme === 'cosmic_journey') {
      skyGrad.addColorStop(0, '#08001a');
      skyGrad.addColorStop(0.4, '#311b92');
      skyGrad.addColorStop(0.8, '#00e5ff');
      skyGrad.addColorStop(1, '#ffd700');
    } else {
      // Sacred Forest
      skyGrad.addColorStop(0, '#021814');
      skyGrad.addColorStop(0.5, '#0d3d2e');
      skyGrad.addColorStop(1, '#d87b05');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Stars / Celestial Motes
    ctx.save();
    for (const star of this.stars) {
      const alpha = 0.4 + 0.6 * Math.sin(Date.now() * 0.003 + star.twinkle);
      ctx.fillStyle = `rgba(255, 245, 200, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Specific Parallax Layers
    if (theme === 'palace' || theme === 'sacred_circle') {
      this.drawPalaceLayer(ctx, cameraX, w, h);
    } else if (theme === 'kailash' || theme === 'mountain_trials') {
      this.drawKailashLayer(ctx, cameraX, w, h);
    } else if (theme === 'village') {
      this.drawVillageLayer(ctx, cameraX, w, h);
    } else if (theme === 'ancient_temple' || theme === 'wisdom_temple') {
      this.drawTempleLayer(ctx, cameraX, w, h);
    } else if (theme === 'peacock_realm') {
      this.drawPeacockLayer(ctx, cameraX, w, h);
    } else if (theme === 'cosmic_journey') {
      this.drawCosmicLayer(ctx, cameraX, w, h);
    } else if (theme === 'divine_kingdom' || theme === 'divine_race_track') {
      this.drawKingdomLayer(ctx, cameraX, w, h);
    } else if (theme === 'fortress') {
      this.drawFortressLayer(ctx, cameraX, w, h);
    } else {
      this.drawForestLayer(ctx, cameraX, w, h, theme === 'corrupted_forest');
    }
  }

  drawPalaceLayer(ctx, cameraX, w, h) {
    ctx.fillStyle = 'rgba(40, 15, 60, 0.7)';
    const offset1 = -(cameraX * 0.15) % 240;
    for (let x = offset1 - 240; x < w + 240; x += 220) {
      ctx.beginPath();
      ctx.arc(x + 100, 360, 70, Math.PI, 0);
      ctx.rect(x + 30, 360, 140, 120);
      ctx.fill();
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(x + 97, 260, 6, 30);
      ctx.beginPath();
      ctx.arc(x + 100, 255, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(40, 15, 60, 0.7)';
    }

    ctx.fillStyle = 'rgba(85, 30, 105, 0.85)';
    const offset2 = -(cameraX * 0.35) % 300;
    for (let x = offset2 - 300; x < w + 300; x += 280) {
      ctx.fillRect(x + 40, 200, 28, 280);
      ctx.fillStyle = '#ffb300';
      ctx.fillRect(x + 34, 190, 40, 14);
      ctx.fillRect(x + 34, 460, 40, 14);
      ctx.beginPath();
      ctx.arc(x + 150, 230, 12, 0, Math.PI);
      ctx.fill();
      ctx.fillRect(x + 148, 200, 4, 30);
      ctx.fillStyle = 'rgba(85, 30, 105, 0.85)';
    }
  }

  drawKailashLayer(ctx, cameraX, w, h) {
    ctx.fillStyle = 'rgba(25, 35, 75, 0.8)';
    const offset1 = -(cameraX * 0.15) % 400;
    for (let x = offset1 - 400; x < w + 400; x += 350) {
      ctx.beginPath();
      ctx.moveTo(x, 420);
      ctx.lineTo(x + 175, 140);
      ctx.lineTo(x + 350, 420);
      ctx.fill();

      ctx.fillStyle = 'rgba(230, 240, 255, 0.9)';
      ctx.beginPath();
      ctx.moveTo(x + 175, 140);
      ctx.lineTo(x + 120, 220);
      ctx.lineTo(x + 230, 220);
      ctx.fill();
      ctx.fillStyle = 'rgba(25, 35, 75, 0.8)';
    }
  }

  drawPeacockLayer(ctx, cameraX, w, h) {
    // Turquoise hills with peacock plume arches
    ctx.fillStyle = 'rgba(0, 77, 64, 0.7)';
    const offset = -(cameraX * 0.2) % 300;
    for (let x = offset - 300; x < w + 300; x += 260) {
      ctx.beginPath();
      ctx.arc(x + 130, 380, 100, Math.PI, 0);
      ctx.fill();
      // Eye of peacock plume
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(x + 130, 310, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(x + 130, 310, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0, 77, 64, 0.7)';
    }
  }

  drawCosmicLayer(ctx, cameraX, w, h) {
    // Swirling nebula rings & Saturn-like planet
    ctx.save();
    const planetX = ((w - cameraX * 0.1) % (w + 200));
    ctx.fillStyle = '#ab47bc';
    ctx.beginPath();
    ctx.arc(planetX, 120, 45, 0, Math.PI * 2);
    ctx.fill();
    // Planetary ring
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(planetX, 120, 75, 14, -0.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawForestLayer(ctx, cameraX, w, h, isCorrupted = false) {
    ctx.fillStyle = isCorrupted ? 'rgba(35, 10, 45, 0.85)' : 'rgba(10, 45, 30, 0.75)';
    const offset = -(cameraX * 0.25) % 260;
    for (let x = offset - 260; x < w + 260; x += 220) {
      ctx.fillRect(x + 80, 260, 24, 220);
      ctx.beginPath();
      ctx.arc(x + 92, 230, 65, 0, Math.PI * 2);
      ctx.arc(x + 50, 260, 50, 0, Math.PI * 2);
      ctx.arc(x + 135, 255, 50, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawVillageLayer(ctx, cameraX, w, h) {
    ctx.fillStyle = 'rgba(78, 52, 46, 0.85)';
    const offset = -(cameraX * 0.25) % 280;
    for (let x = offset - 280; x < w + 280; x += 240) {
      ctx.fillRect(x + 40, 320, 110, 140);
      ctx.fillStyle = '#d84315';
      ctx.beginPath();
      ctx.moveTo(x + 30, 320);
      ctx.lineTo(x + 95, 260);
      ctx.lineTo(x + 160, 320);
      ctx.fill();
      ctx.fillStyle = 'rgba(78, 52, 46, 0.85)';
    }
  }

  drawTempleLayer(ctx, cameraX, w, h) {
    ctx.fillStyle = 'rgba(62, 39, 35, 0.85)';
    const offset = -(cameraX * 0.2) % 300;
    for (let x = offset - 300; x < w + 300; x += 260) {
      ctx.fillRect(x + 30, 180, 34, 300);
      ctx.fillStyle = '#ffb300';
      ctx.fillRect(x + 24, 165, 46, 16);
      ctx.fillStyle = 'rgba(62, 39, 35, 0.85)';
    }
  }

  drawKingdomLayer(ctx, cameraX, w, h) {
    ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
    const offset = -(cameraX * 0.15) % 280;
    for (let x = offset - 280; x < w + 280; x += 240) {
      ctx.beginPath();
      ctx.moveTo(x + 60, 440);
      ctx.lineTo(x + 110, 160);
      ctx.lineTo(x + 160, 440);
      ctx.fill();
    }
  }

  drawFortressLayer(ctx, cameraX, w, h) {
    ctx.fillStyle = 'rgba(20, 6, 25, 0.9)';
    const offset = -(cameraX * 0.2) % 320;
    for (let x = offset - 320; x < w + 320; x += 280) {
      ctx.fillRect(x + 20, 200, 160, 280);
      ctx.fillStyle = '#b71c1c';
      ctx.fillRect(x + 80, 230, 12, 30);
      ctx.fillStyle = 'rgba(20, 6, 25, 0.9)';
    }
  }
}

// ==========================================================================
// 5. GAME ENTITIES (Player, Kartikeya, Mushika, Enemies, Boosts, Puzzles)
// ==========================================================================
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 56;
    this.vx = 0;
    this.vy = 0;
    this.speed = 4.2;
    this.jumpForce = -11.5;
    this.isGrounded = false;
    this.facing = 1;

    this.maxHealth = 100;
    this.health = 100;
    this.maxEnergy = 100;
    this.energy = 100;
    this.energyRegen = 0.14;

    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 18;
    this.hasHitCurrentAttack = false;
    this.hitEnemiesThisSwing = new Set();
    this.attackHitbox = { x: 0, y: 0, width: 46, height: 46 };

    this.skillCooldown = 0;
    this.invulnerableTimer = 0;
    this.walkCycle = 0;
    this.boostTimer = 0;
    this.divineAuraTimer = 0;
  }

  update(input, platforms, particles) {
    if (game && game.isCountingDown) return;

    if (this.divineAuraTimer > 0) this.divineAuraTimer--;

    if (this.energy < this.maxEnergy) {
      this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegen);
    }

    if (this.skillCooldown > 0) this.skillCooldown--;
    if (this.invulnerableTimer > 0) this.invulnerableTimer--;
    if (this.boostTimer > 0) this.boostTimer--;

    const isRide = game && (game.currentLevelIndex === 10 || game.currentLevelIndex === 17 || game.currentLevelIndex === 22);
    let baseSpeed = isRide ? 6.5 : this.speed;
    if (this.boostTimer > 0) baseSpeed *= 1.4;

    if (input.keys.left) {
      this.vx = -baseSpeed;
      this.facing = -1;
      this.walkCycle += 0.3;
    } else if (input.keys.right) {
      this.vx = baseSpeed;
      this.facing = 1;
      this.walkCycle += 0.3;
    } else {
      this.vx *= 0.7;
      if (Math.abs(this.vx) < 0.2) this.vx = 0;
    }

    // Dynamic Skin Footstep & Movement Particle Trails
    if ((Math.abs(this.vx) > 1.2 || !this.isGrounded) && particles && Math.random() < 0.4) {
      const sKey = (game && game.selectedSkin) || 'classic';
      const sCfg = (game && game.divineSkins && game.divineSkins[sKey]) || DIVINE_SKINS.classic;
      const trailCol = sCfg.palette.trailParticleColor || '#ffd700';
      particles.emitSparks(this.x + this.width / 2 + (Math.random() * 10 - 5), this.y + this.height - 2, 1, trailCol);
    }

    if (input.keys.jump && this.isGrounded) {
      this.vy = isRide ? -12.5 : this.jumpForce;
      this.isGrounded = false;
      sounds.playJump();
      const sKey = (game && game.selectedSkin) || 'classic';
      const sCfg = (game && game.divineSkins && game.divineSkins[sKey]) || DIVINE_SKINS.classic;
      particles.emitSparks(this.x + this.width / 2, this.y + this.height, 6, sCfg.palette.trailParticleColor);
    }

    // Normal Attack (Staff / Battle Axe Strike)
    if (input.keys.attack && !this.isAttacking) {
      this.isAttacking = true;
      this.attackTimer = this.attackDuration;
      this.hasHitCurrentAttack = false;
      this.hitEnemiesThisSwing = new Set();
      sounds.playAttack();
    }

    if (this.isAttacking) {
      this.attackTimer--;
      const reach = this.facing === 1 ? this.x + this.width : this.x - this.attackHitbox.width;
      this.attackHitbox.x = reach;
      this.attackHitbox.y = this.y + 6;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
      }
    }

    // Divine Skill (Prana Shockwave)
    if (input.keys.skill && this.skillCooldown <= 0 && this.energy >= 35) {
      this.energy -= 35;
      this.skillCooldown = 55;
      sounds.playDivineSkill();
      particles.emitAuraRing(this.x + this.width / 2, this.y + this.height / 2, 120, '#ffd700');
      particles.emitLotusPetals(this.x + this.width / 2, this.y + this.height / 2, 10);
      game.triggerDivineShockwave(this.x + this.width / 2, this.y + this.height / 2, 125);
    }

    // Divine Attack: Vakratunda Trunk Blast ('L')
    if (input.keys.beam && this.skillCooldown <= 0 && this.energy >= 40) {
      this.energy -= 40;
      this.skillCooldown = 50;
      sounds.playTrunkBlast();
      game.triggerTrunkBlast(this.x + (this.facing === 1 ? this.width : 0), this.y + 18, this.facing);
    }

    // Gravity
    this.vy += 0.58;
    if (this.vy > 14) this.vy = 14;

    // Movement & Collision
    this.x += this.vx;
    this.checkHorizontalCollisions(platforms);

    this.y += this.vy;
    this.isGrounded = false;
    this.checkVerticalCollisions(platforms);

    // World Bounds
    if (this.y > 600) {
      this.health = 0;
      game.loseLife("Fell into the abyss");
    }
  }

  checkHorizontalCollisions(platforms) {
    for (const p of platforms) {
      if (p.isPassable) continue;
      if (this.x < p.x + p.w && this.x + this.width > p.x &&
          this.y < p.y + p.h && this.y + this.height > p.y) {
        if (this.vx > 0) {
          this.x = p.x - this.width;
          this.vx = 0;
        } else if (this.vx < 0) {
          this.x = p.x + p.w;
          this.vx = 0;
        }
      }
    }
  }

  checkVerticalCollisions(platforms) {
    for (const p of platforms) {
      if (this.x + this.width > p.x && this.x < p.x + p.w) {
        if (p.isOneWay) {
          if (this.vy >= 0 && this.y + this.height >= p.y && this.y + this.height <= p.y + 16 && (this.y + this.height - this.vy) <= p.y + 4) {
            this.y = p.y - this.height;
            this.vy = 0;
            this.isGrounded = true;
          }
        } else {
          if (this.y < p.y + p.h && this.y + this.height > p.y) {
            if (this.vy > 0) {
              this.y = p.y - this.height;
              this.vy = 0;
              this.isGrounded = true;
            } else if (this.vy < 0) {
              this.y = p.y + p.h;
              this.vy = 0;
            }
          }
        }
      }
    }
  }

  takeDamage(amount = 20, source = "Enemy") {
    if (this.invulnerableTimer > 0) return;
    this.health = Math.max(0, this.health - amount);
    this.invulnerableTimer = 40;
    sounds.playHurt();
    particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 8, '#ff5252');
    game.triggerVibrate(60);

    if (this.health <= 0) {
      game.loseLife(source);
    }
  }

  hitHazard() {
    if (this.invulnerableTimer > 0) return;
    this.health = Math.max(0, this.health - 25);
    this.invulnerableTimer = 45;
    game.loseLife("Obstacle");
  }

  draw(ctx, cameraX) {
    const screenX = this.x - cameraX;
    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) return;

    // Active Skin Palette Configuration
    const skinKey = (game && game.selectedSkin) || 'classic';
    const skinCfg = (game && game.divineSkins && game.divineSkins[skinKey]) || DIVINE_SKINS.classic;
    const pal = skinCfg.palette;

    ctx.save();
    ctx.translate(screenX + this.width / 2, this.y + this.height / 2);
    if (this.facing === -1) ctx.scale(-1, 1);

    const isRide = game && (game.currentLevelIndex === 10 || game.currentLevelIndex === 17 || game.currentLevelIndex === 22);

    // Divine Golden / Cosmic / Warrior Aura Ring
    const auraPulse = Math.sin(Date.now() * 0.005) * 3;
    const isAwakened = this.divineAuraTimer > 0;
    const auraRadius = isAwakened ? 42 + Math.sin(Date.now() * 0.008) * 5 : 34 + auraPulse;
    ctx.beginPath();
    ctx.arc(0, -4, auraRadius, 0, Math.PI * 2);
    if (isAwakened) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.42)';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 20;
    } else {
      ctx.fillStyle = this.boostTimer > 0 ? 'rgba(0, 229, 255, 0.35)' : pal.aura;
      ctx.shadowColor = pal.auraStroke;
      ctx.shadowBlur = 8;
    }
    ctx.fill();
    ctx.strokeStyle = isAwakened ? '#ffffff' : pal.auraStroke;
    ctx.lineWidth = isAwakened ? 2.5 : 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (isRide) {
      // Mushika the Divine Mouse Vahana
      ctx.save();
      ctx.translate(0, 16);
      ctx.fillStyle = '#90a4ae';
      ctx.beginPath();
      ctx.ellipse(0, 8, 22, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f48fb1';
      ctx.beginPath();
      ctx.arc(-8, 0, 6, 0, Math.PI * 2);
      ctx.arc(4, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      const pawOffset = Math.sin(this.walkCycle * 2) * 4;
      ctx.fillStyle = '#607d8b';
      ctx.fillRect(-14, 16 + pawOffset, 6, 8);
      ctx.fillRect(8, 16 - pawOffset, 6, 8);
      ctx.strokeStyle = '#f48fb1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-18, 6);
      ctx.quadraticCurveTo(-28, -2, -26, -12);
      ctx.stroke();
      ctx.restore();
    }

    // =========================================================================
    // CUTE, HEROIC & FRIENDLY LORD GANESHA SPRITE (CUSTOM AVATAR & SKIN APPLIED)
    // =========================================================================
    const legOffset = this.isGrounded ? Math.sin(this.walkCycle) * 5 : 0;
    const idleBob = Math.sin(Date.now() * 0.004) * 1.5;

    // Plump Tummy (Lambodara)
    ctx.fillStyle = pal.skin;
    ctx.beginPath();
    ctx.arc(0, 10 + idleBob, 17, 0, Math.PI * 2);
    ctx.fill();

    // Sacred Silk Pitambara Dhoti (Custom Skin)
    ctx.fillStyle = pal.dhoti;
    ctx.beginPath();
    ctx.moveTo(-12, 12 + idleBob);
    ctx.lineTo(12, 12 + idleBob);
    ctx.lineTo(14, 25 + idleBob);
    ctx.lineTo(-14, 25 + idleBob);
    ctx.closePath();
    ctx.fill();

    // Golden Dhoti Hem & Sash
    ctx.fillStyle = pal.dhotiHem;
    ctx.fillRect(-14, 23 + idleBob, 28, 3);
    ctx.fillStyle = pal.dhotiSash;
    ctx.fillRect(-2, 12 + idleBob, 4, 14);

    // Feet / Lotus Steps
    ctx.fillStyle = pal.feet;
    ctx.beginPath();
    ctx.ellipse(-8, 26 + (this.isGrounded ? legOffset : -3) + idleBob, 6, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(8, 26 - (this.isGrounded ? legOffset : 3) + idleBob, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute Round Head
    ctx.fillStyle = pal.head;
    ctx.beginPath();
    ctx.arc(0, -9 + idleBob, 16, 0, Math.PI * 2);
    ctx.fill();

    // Rosy Cheeks
    ctx.fillStyle = pal.cheeks;
    ctx.beginPath();
    ctx.arc(-9, -6 + idleBob, 4, 0, Math.PI * 2);
    ctx.arc(9, -6 + idleBob, 4, 0, Math.PI * 2);
    ctx.fill();

    // Large Elephant Ears (Animated Flapping)
    const earFlap = Math.sin(this.walkCycle * 0.8) * 0.15;
    ctx.save();
    // Left Ear
    ctx.fillStyle = pal.head;
    ctx.beginPath();
    ctx.ellipse(-17, -10 + idleBob, 9, 13, -0.25 + earFlap, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.earInner;
    ctx.beginPath();
    ctx.ellipse(-17, -10 + idleBob, 6, 9, -0.25 + earFlap, 0, Math.PI * 2);
    ctx.fill();

    // Right Ear
    ctx.fillStyle = pal.head;
    ctx.beginPath();
    ctx.ellipse(17, -10 + idleBob, 9, 13, 0.25 - earFlap, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.earInner;
    ctx.beginPath();
    ctx.ellipse(17, -10 + idleBob, 6, 9, 0.25 - earFlap, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Cute Expressive Eyes with Blink Cycle
    const isBlinking = (Math.floor(Date.now() / 3200) % 20 === 0 && Math.floor(Date.now() / 120) % 2 === 0);
    if (isBlinking) {
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-7, -11 + idleBob);
      ctx.lineTo(-3, -11 + idleBob);
      ctx.moveTo(3, -11 + idleBob);
      ctx.lineTo(7, -11 + idleBob);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#3e2723';
      ctx.beginPath();
      ctx.arc(-5, -11 + idleBob, 2.5, 0, Math.PI * 2);
      ctx.arc(5, -11 + idleBob, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-5.8, -12 + idleBob, 1, 0, Math.PI * 2);
      ctx.arc(4.2, -12 + idleBob, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sacred Sandalwood Tilak & Trishul
    ctx.fillStyle = pal.gem || '#d50000';
    ctx.beginPath();
    ctx.arc(0, -17 + idleBob, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.crown;
    ctx.fillRect(-3, -15 + idleBob, 6, 1.5);
    ctx.fillRect(-1, -19 + idleBob, 2, 5);

    // Tusks: Ekadanta & Left complete tusk
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(4, -3 + idleBob);
    ctx.lineTo(9, 2 + idleBob);
    ctx.lineTo(7, 3 + idleBob);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-4, -3 + idleBob);
    ctx.lineTo(-8, 0 + idleBob);
    ctx.lineTo(-6, 1 + idleBob);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = pal.crown;
    ctx.fillRect(-8, -1 + idleBob, 3, 2);

    // Elephant Trunk & Golden Modak
    const trunkSway = Math.sin(this.walkCycle * 0.7) * 4;
    const trunkLift = this.isGrounded ? 0 : -6;
    ctx.strokeStyle = pal.head;
    ctx.lineWidth = 6.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -5 + idleBob);
    ctx.quadraticCurveTo(6 + trunkSway, 6 + trunkLift + idleBob, 14 + trunkSway, 1 + trunkLift + idleBob);
    ctx.stroke();

    // Modak in Trunk Tip
    ctx.fillStyle = '#ffd54f';
    ctx.strokeStyle = '#ff6f00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const mx = 14 + trunkSway;
    const my = -1 + trunkLift + idleBob;
    ctx.moveTo(mx, my - 6);
    ctx.quadraticCurveTo(mx + 6, my + 4, mx, my + 6);
    ctx.quadraticCurveTo(mx - 6, my + 4, mx, my - 6);
    ctx.fill();
    ctx.stroke();

    // Royal Mukut (Crown) with Custom Gems & Gold
    ctx.fillStyle = pal.crown;
    ctx.beginPath();
    ctx.moveTo(-13, -22 + idleBob);
    ctx.lineTo(-8, -34 + idleBob);
    ctx.lineTo(0, -42 + idleBob);
    ctx.lineTo(8, -34 + idleBob);
    ctx.lineTo(13, -22 + idleBob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = pal.crownStroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = pal.gem;
    ctx.beginPath();
    ctx.arc(0, -28 + idleBob, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-1, -29 + idleBob, 1, 0, Math.PI * 2);
    ctx.fill();

    // Golden / Jewel Necklace
    ctx.strokeStyle = pal.necklace;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 5 + idleBob, 10, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Sacred Weapon: Staff / Battle Axe / Trishul
    ctx.save();
    const swing = this.isAttacking ? (this.attackTimer / this.attackDuration) * 1.6 - 0.8 : 0.25;
    ctx.rotate(swing);

    if (pal.weaponType === 'trishul') {
      // Celestial Trishula
      ctx.strokeStyle = pal.weaponStaff;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(10, 16 + idleBob);
      ctx.lineTo(18, -32 + idleBob);
      ctx.stroke();

      // Trident Prongs
      ctx.strokeStyle = pal.weaponHead;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(18, -32 + idleBob);
      ctx.lineTo(18, -44 + idleBob); // Center Prong
      ctx.moveTo(14, -32 + idleBob);
      ctx.quadraticCurveTo(11, -38 + idleBob, 12, -42 + idleBob); // Left Prong
      ctx.moveTo(22, -32 + idleBob);
      ctx.quadraticCurveTo(25, -38 + idleBob, 24, -42 + idleBob); // Right Prong
      ctx.stroke();
    } else {
      // Axe Weapon
      ctx.strokeStyle = pal.weaponStaff;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(10, 12 + idleBob);
      ctx.lineTo(17, -26 + idleBob);
      ctx.stroke();
      ctx.fillStyle = pal.weaponHead;
      ctx.beginPath();
      ctx.arc(19, -22 + idleBob, 10, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
      ctx.strokeStyle = pal.weaponStroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();

    if (this.isAttacking) {
      ctx.strokeStyle = pal.auraStroke || 'rgba(255, 215, 0, 0.85)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(16, 0 + idleBob, 38, -0.7, 0.9);
      ctx.stroke();
    }

    if (this.isCelebrating) {
      ctx.save();
      ctx.fillStyle = '#ffd700';
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨ ॐ ✨', 0, -50);
      ctx.restore();
    }

    ctx.restore();
  }
}

// --- RIVAL RACER: LORD KARTIKEYA ON MAYURA (THE PEACOCK) ---
class RivalRacer {
  constructor(x, y, speed = 5.2, goalX = 3000) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.speed = speed;
    this.goalX = goalX;
    this.width = 50;
    this.height = 56;
    this.wingCycle = 0;
  }

  update(player) {
    if (game && game.isCountingDown) return;

    this.wingCycle += 0.2;
    this.y = this.baseY + Math.sin(this.wingCycle * 0.8) * 8;

    // Intelligent and fair rival AI:
    // If player pulls ahead a lot, Kartikeya accelerates slightly to maintain excitement.
    // If player falls behind, Kartikeya glides gently to ensure player can always win!
    let targetSpeed = this.speed;
    const diff = player.x - this.x;
    if (diff > 250) {
      targetSpeed += 0.6;
    } else if (diff < -150) {
      targetSpeed -= 0.5;
    }
    this.x += targetSpeed;
  }

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    ctx.save();
    ctx.translate(sx + 25, this.y + 28);

    // Peacock (Mayura) Body
    ctx.fillStyle = '#004d40';
    ctx.beginPath();
    ctx.ellipse(0, 10, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Peacock Plumage / Wings (Animated flapping)
    const flap = Math.sin(this.wingCycle) * 12;
    ctx.fillStyle = '#00b0ff';
    ctx.beginPath();
    ctx.moveTo(-10, 8);
    ctx.lineTo(-24, -8 + flap);
    ctx.lineTo(-6, 2);
    ctx.fill();

    // Radiant Peacock Crest & Tail
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.ellipse(-26, 4, 14, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Lord Kartikeya seated atop Mayura
    ctx.fillStyle = '#ffe082';
    ctx.fillRect(-6, -14, 12, 16);
    ctx.beginPath();
    ctx.arc(0, -20, 10, 0, Math.PI * 2);
    ctx.fill();

    // Golden Crown & Vel (Spear of Wisdom)
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(-6, -30);
    ctx.lineTo(0, -40);
    ctx.lineTo(6, -30);
    ctx.fill();

    // Sacred Vel
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(10, 12);
    ctx.lineTo(24, -36);
    ctx.stroke();

    ctx.restore();
  }
}

// --- SPEED BOOST PAD ---
class SpeedBoostPad {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 46;
    this.height = 10;
  }

  update(player, particles) {
    if (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y + player.height >= this.y &&
      player.y + player.height <= this.y + 16
    ) {
      if (player.boostTimer <= 0) {
        player.boostTimer = 45;
        player.vx = player.facing * 9.5;
        sounds.playBoost();
        particles.emitSparks(this.x + 23, this.y, 14, '#00e5ff');
        particles.emitAuraRing(this.x + 23, this.y, 50, '#ffd700');
      }
    }
  }

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    ctx.save();
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(sx, this.y, this.width, this.height);
    // Arrows pointing right
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(sx + 14, this.y + 2);
    ctx.lineTo(sx + 24, this.y + 5);
    ctx.lineTo(sx + 14, this.y + 8);
    ctx.moveTo(sx + 24, this.y + 2);
    ctx.lineTo(sx + 34, this.y + 5);
    ctx.lineTo(sx + 24, this.y + 8);
    ctx.stroke();
    ctx.restore();
  }
}

// --- FALLING ROCK (Level 20) ---
class FallingRock {
  constructor(x, triggerX) {
    this.x = x;
    this.y = -60;
    this.triggerX = triggerX;
    this.vy = 0;
    this.width = 30;
    this.height = 30;
    this.hasTriggered = false;
    this.isFalling = false;
    this.isShattered = false;
    this.warningTimer = 0;
  }

  update(player, particles) {
    if (this.isShattered) return;

    if (!this.hasTriggered && Math.abs(player.x - this.triggerX) < 180) {
      this.hasTriggered = true;
      this.warningTimer = 40;
    }

    if (this.warningTimer > 0) {
      this.warningTimer--;
      if (this.warningTimer === 0) {
        this.isFalling = true;
        this.vy = 2;
      }
    }

    if (this.isFalling) {
      this.vy += 0.45;
      this.y += this.vy;

      if (
        player.x < this.x + this.width &&
        player.x + player.width > this.x &&
        player.y < this.y + this.height &&
        player.y + player.height > this.y
      ) {
        player.takeDamage(20);
        this.isShattered = true;
        particles.emitSparks(this.x + 15, this.y + 15, 12, '#8d6e63');
      }

      if (this.y > 450) {
        this.isShattered = true;
        particles.emitSparks(this.x + 15, this.y + 15, 8, '#795548');
      }
    }
  }

  draw(ctx, cameraX) {
    if (this.isShattered) return;
    const sx = this.x - cameraX;

    if (this.warningTimer > 0 && Math.floor(Date.now() / 120) % 2 === 0) {
      ctx.fillStyle = '#ff1744';
      ctx.font = '22px sans-serif';
      ctx.fillText('⚠️', sx + 4, 180);
    }

    if (this.isFalling) {
      ctx.save();
      ctx.fillStyle = '#5d4037';
      ctx.beginPath();
      ctx.arc(sx + 15, this.y + 15, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }
}

// --- WISDOM SYMBOL (Level 21) ---
class WisdomSymbol {
  constructor(x, y, symbolId, label) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.symbolId = symbolId;
    this.label = label; // 1: 'ॐ', 2: '🔱', 3: '🌺'
    this.width = 28;
    this.height = 28;
    this.isCollected = false;
    this.timer = Math.random() * 10;
  }

  update(player, particles) {
    if (this.isCollected) return;
    this.timer += 0.05;
    this.y = this.baseY + Math.sin(this.timer) * 6;

    if (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    ) {
      game.onCollectWisdomSymbol(this, particles);
    }
  }

  draw(ctx, cameraX) {
    if (this.isCollected) return;
    const sx = this.x - cameraX;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(sx + 14, this.y + 14, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd700';
    ctx.font = '18px serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, sx + 14, this.y + 20);
    ctx.restore();
  }
}

// --- ENEMY CLASS ---
class Enemy {
  constructor(x, y, type = 'asura_grunt', patrolMinX = null, patrolMaxX = null) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.patrolMinX = patrolMinX;
    this.patrolMaxX = patrolMaxX;
    this.width = 34;
    this.height = 42;
    this.vx = -1.2;
    this.vy = 0;
    this.isGrounded = false;
    this.maxHealth = 30;
    this.health = 30;
    this.isAlive = true;
    this.hitTimer = 0;
    this.attackCooldown = 0;
    this.damage = 12;
    this.facing = -1;
    this.animTimer = Math.random() * 100;

    // Archetype stats & dimensions
    if (type === 'asura_grunt') {
      this.maxHealth = 25; this.health = 25; this.damage = 8;
      this.width = 32; this.height = 42; this.vx = -0.9;
    } else if (type === 'asura_scout') {
      this.maxHealth = 32; this.health = 32; this.damage = 10;
      this.width = 34; this.height = 44; this.vx = -1.2;
    } else if (type === 'asura_patrol') {
      this.maxHealth = 38; this.health = 38; this.damage = 12;
      this.width = 36; this.height = 46; this.vx = -1.4;
    } else if (type === 'shadow_beast') {
      this.maxHealth = 30; this.health = 30; this.damage = 15;
      this.width = 40; this.height = 28; this.vx = -1.5;
    } else if (type === 'corrupted_wisp') {
      this.maxHealth = 24; this.health = 24; this.damage = 10;
      this.width = 28; this.height = 28; this.vx = -1.4;
    } else if (type === 'armored_asura') {
      this.maxHealth = 80; this.health = 80; this.damage = 18;
      this.width = 42; this.height = 52; this.vx = -0.85;
    } else if (type === 'dark_sorcerer') {
      this.maxHealth = 55; this.health = 55; this.damage = 16;
      this.width = 34; this.height = 48; this.vx = -1.0;
    } else if (type === 'wisp') {
      this.maxHealth = 20; this.health = 20; this.damage = 8; this.width = 28; this.height = 28;
    } else if (type === 'raider' || type === 'corrupted_asura') {
      this.maxHealth = 35; this.health = 35; this.damage = 14; this.vx = -1.5;
    } else if (type === 'gana') {
      this.maxHealth = 45; this.health = 45; this.damage = 16; this.width = 38; this.height = 48;
    } else if (type === 'miniboss' || type === 'asura_chieftain') {
      this.maxHealth = 150; this.health = 150; this.damage = 22; this.width = 52; this.height = 64; this.vx = -1.0;
    } else if (type === 'temple_golem') {
      this.maxHealth = 140; this.health = 140; this.damage = 20; this.width = 48; this.height = 60; this.vx = -0.9;
    }
  }

  update(player, platforms, particles) {
    if (!this.isAlive) return;
    this.animTimer++;
    if (this.hitTimer > 0) this.hitTimer--;
    if (this.attackCooldown > 0) this.attackCooldown--;

    const distToPlayer = player.x - this.x;
    const absDist = Math.abs(distToPlayer);

    // 1. Movement & AI Behaviors
    if (this.type === 'corrupted_wisp' || this.type === 'wisp') {
      // Sinuous flying wisp
      this.x += this.vx;
      this.y += Math.sin(this.animTimer * 0.05 + this.x * 0.01) * 1.5;
      if (absDist < 260 && player.y > this.y) {
        this.y += 0.8; // Gently swoop down toward player
      }
      if (this.patrolMinX !== null && this.x <= this.patrolMinX) this.vx = Math.abs(this.vx);
      if (this.patrolMaxX !== null && this.x >= this.patrolMaxX) this.vx = -Math.abs(this.vx);
    } else {
      // Ground Enemies
      if (this.type === 'shadow_beast') {
        // High speed predatory sprint when near player
        if (absDist < 340) {
          const runDir = distToPlayer > 0 ? 1 : -1;
          this.vx = runDir * 2.5;
          this.facing = runDir;
        } else if (this.patrolMinX !== null && this.patrolMaxX !== null) {
          if (this.x <= this.patrolMinX) this.vx = 1.3;
          if (this.x >= this.patrolMaxX) this.vx = -1.3;
        }
      } else if (this.type === 'dark_sorcerer') {
        // Keeps tactical distance and fires ranged shockwaves
        if (absDist < 140) {
          this.vx = distToPlayer > 0 ? -1.2 : 1.2; // Back away if too close
        } else if (absDist < 360) {
          this.vx = 0; // Hold ground and cast
          this.facing = distToPlayer > 0 ? 1 : -1;
          if (this.attackCooldown <= 0) {
            this.attackCooldown = 110;
            game.spawnShockwave(this.x + (distToPlayer > 0 ? this.width : -20), this.y + 15, distToPlayer > 0 ? 4.5 : -4.5);
            sounds.playHit();
            particles.emitSparks(this.x + this.width / 2, this.y + 15, 8, '#ab47bc');
          }
        } else {
          if (this.patrolMinX !== null && this.patrolMaxX !== null) {
            if (this.x <= this.patrolMinX) this.vx = 0.9;
            if (this.x >= this.patrolMaxX) this.vx = -0.9;
          }
        }
      } else if (this.type === 'asura_patrol') {
        // Dedicated platform patrolling with boundary reversals
        if (this.patrolMinX !== null && this.x <= this.patrolMinX) {
          this.vx = Math.abs(this.vx || 1.4);
        } else if (this.patrolMaxX !== null && this.x >= this.patrolMaxX) {
          this.vx = -Math.abs(this.vx || 1.4);
        } else if (absDist < 200 && Math.abs(player.y - this.y) < 40) {
          // Alert: speed up towards player on the same platform
          this.vx = (distToPlayer > 0 ? 1 : -1) * 1.8;
        }
      } else {
        // asura_grunt, asura_scout, armored_asura
        if (absDist < 300) {
          const spd = this.type === 'armored_asura' ? 0.9 : (this.type === 'asura_scout' ? 1.3 : 0.9);
          this.vx = (distToPlayer > 0 ? 1 : -1) * spd;
        } else if (this.patrolMinX !== null && this.patrolMaxX !== null) {
          if (this.x <= this.patrolMinX) this.vx = Math.abs(this.vx);
          if (this.x >= this.patrolMaxX) this.vx = -Math.abs(this.vx);
        }
      }

      this.facing = this.vx > 0 ? 1 : -1;

      // Gravity & Platform Collisions
      this.vy += 0.5;
      if (this.vy > 12) this.vy = 12;
      this.x += this.vx;
      this.checkHorizontalCollisions(platforms);
      this.y += this.vy;
      this.checkVerticalCollisions(platforms);
    }

    // 2. Player Touch Damage
    if (this.collidesWith(player) && this.attackCooldown <= 0) {
      player.takeDamage(this.damage);
      this.attackCooldown = 40;
      particles.emitSparks(player.x + player.width / 2, player.y + player.height / 2, 8, '#ff1744');
    }

    if (game && game.defenseTarget && this.collidesWith(game.defenseTarget) && this.attackCooldown <= 0) {
      game.defenseTarget.takeDamage(10, particles);
      this.attackCooldown = 45;
    }
  }

  checkHorizontalCollisions(platforms) {
    for (const plat of platforms) {
      if (plat.isOpen) continue;
      const box = plat.getCollisionBox ? plat.getCollisionBox() : plat;
      if (this.collidesWith(box)) {
        this.vx *= -1;
        this.x += this.vx * 2;
        break;
      }
    }
  }

  checkVerticalCollisions(platforms) {
    for (const plat of platforms) {
      if (plat.isOpen) continue;
      const box = plat.getCollisionBox ? plat.getCollisionBox() : plat;
      if (this.collidesWith(box)) {
        if (this.vy > 0) {
          this.y = box.y - this.height;
          this.vy = 0;
          this.isGrounded = true;
        }
      }
    }
  }

  takeHit(damage, particles) {
    if (this.type === 'armored_asura') {
      damage = Math.max(12, Math.floor(damage * 0.75));
    }
    this.health -= damage;
    this.hitTimer = 10;
    sounds.playHit();
    particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 10, '#ffd700');

    if (this.health <= 0) {
      this.isAlive = false;
      particles.emitLotusPetals(this.x + this.width / 2, this.y + this.height / 2, 10);
      particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 18, '#ff9800');
      game.onEnemyDefeated(this);
    }
  }

  collidesWith(box) {
    return (
      this.x < box.x + box.width &&
      this.x + this.width > box.x &&
      this.y < box.y + box.height &&
      this.y + this.height > box.y
    );
  }

  draw(ctx, cameraX) {
    if (!this.isAlive) return;
    const screenX = this.x - cameraX;

    ctx.save();
    ctx.translate(screenX + this.width / 2, this.y + this.height / 2);
    if (this.hitTimer > 0) ctx.filter = 'brightness(2.5)';

    if (this.type === 'corrupted_wisp' || this.type === 'wisp') {
      // Glowing ethereal wisp with pulsing core
      const glowCol = this.type === 'corrupted_wisp' ? '#e040fb' : '#00e5ff';
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fillStyle = glowCol;
      ctx.shadowColor = glowCol;
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'asura_grunt') {
      // Crimson Imp Grunt with tusks
      ctx.fillStyle = '#b71c1c';
      ctx.fillRect(-10, -16, 20, 32);
      ctx.fillStyle = '#ffd700'; // Eyes
      ctx.fillRect(this.facing > 0 ? 0 : -6, -10, 4, 3);
      ctx.fillStyle = '#fff'; // Tusks
      ctx.fillRect(this.facing > 0 ? 2 : -8, -4, 3, 5);
      // Club
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(this.facing > 0 ? 10 : -14, -8, 4, 20);
    } else if (this.type === 'asura_scout' || this.type === 'raider' || this.type === 'corrupted_asura') {
      // Dark Indigo Scout with red bandana
      ctx.fillStyle = '#283593';
      ctx.fillRect(-12, -18, 24, 36);
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(-12, -20, 24, 6); // Bandana
      ctx.fillStyle = '#ffea00'; // Eyes
      ctx.fillRect(this.facing > 0 ? 0 : -8, -12, 4, 3);
      // Dagger
      ctx.fillStyle = '#b0bec5';
      ctx.fillRect(this.facing > 0 ? 12 : -16, -2, 5, 14);
    } else if (this.type === 'asura_patrol' || this.type === 'gana') {
      // Copper-armored Patrol Guard with spear
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(-13, -19, 26, 38);
      ctx.fillStyle = '#d84315'; // Copper Chestplate
      ctx.fillRect(-11, -13, 22, 18);
      ctx.fillStyle = '#ffd700'; // Horned Helmet
      ctx.fillRect(-12, -23, 24, 6);
      ctx.beginPath();
      ctx.moveTo(-10, -23); ctx.lineTo(-14, -31); ctx.lineTo(-6, -23); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10, -23); ctx.lineTo(14, -31); ctx.lineTo(6, -23); ctx.fill();
      // Spear
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(this.facing > 0 ? 13 : -16, -28, 3, 44);
      ctx.fillStyle = '#cfd8dc';
      ctx.beginPath();
      ctx.moveTo(this.facing > 0 ? 11 : -18, -28);
      ctx.lineTo(this.facing > 0 ? 14.5 : -14.5, -38);
      ctx.lineTo(this.facing > 0 ? 18 : -11, -28);
      ctx.fill();
    } else if (this.type === 'shadow_beast') {
      // Obsidian quadruped with red eyes & shadow claws
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.ellipse(0, 2, 18, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      // Head
      ctx.beginPath();
      ctx.arc(this.facing > 0 ? 14 : -14, -4, 8, 0, Math.PI * 2);
      ctx.fill();
      // Glowing Red Eye
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(this.facing > 0 ? 15 : -19, -6, 4, 3);
      // Shadow Tail
      ctx.strokeStyle = '#6a1b9a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.facing > 0 ? -16 : 16, 2);
      ctx.quadraticCurveTo(this.facing > 0 ? -24 : 24, -8, this.facing > 0 ? -20 : 20, -14);
      ctx.stroke();
    } else if (this.type === 'armored_asura' || this.type === 'temple_golem') {
      // Heavy Stone & Gold Plated Golem Brute
      ctx.fillStyle = '#37474f';
      ctx.fillRect(-18, -24, 36, 48);
      ctx.fillStyle = '#cfd8dc'; // Stone plates
      ctx.fillRect(-15, -18, 30, 24);
      ctx.strokeStyle = '#ffd700'; // Golden runes
      ctx.lineWidth = 2;
      ctx.strokeRect(-15, -18, 30, 24);
      // Spiked Pauldrons
      ctx.fillStyle = '#ff8f00';
      ctx.fillRect(-22, -24, 8, 12);
      ctx.fillRect(14, -24, 8, 12);
      // Red Glowing Visor
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(this.facing > 0 ? -4 : -10, -14, 14, 4);
    } else if (this.type === 'dark_sorcerer') {
      // Mystical Sorcerer with floating glowing staff
      ctx.fillStyle = '#311b92';
      ctx.fillRect(-13, -21, 26, 42);
      // Cowl & Robes
      ctx.fillStyle = '#6a1b9a';
      ctx.fillRect(-11, -11, 22, 28);
      // Eyes
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(this.facing > 0 ? 0 : -8, -14, 4, 4);
      // Mystical Staff with glowing purple crystal
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(this.facing > 0 ? 14 : -17, -26, 3, 44);
      ctx.fillStyle = '#e040fb';
      ctx.shadowColor = '#e040fb';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.facing > 0 ? 15.5 : -15.5, -28, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Generic / miniboss
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(-16, -22, 32, 44);
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(this.facing > 0 ? 0 : -8, -14, 4, 4);
    }

    ctx.restore();

    // Universal Health Bar
    const isSpecial = this.type === 'armored_asura' || this.type === 'dark_sorcerer' || this.type === 'miniboss';
    if (this.health < this.maxHealth || isSpecial) {
      const barW = Math.max(28, this.width);
      const barH = 5;
      const hpPct = Math.max(0, this.health / this.maxHealth);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(screenX + (this.width - barW) / 2 - 1, this.y - 12, barW + 2, barH + 2);
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(screenX + (this.width - barW) / 2, this.y - 11, barW * hpPct, barH);
    }
  }
}

// --- MINI-BOSS: ASURA WARLORD (Chapter 2 Level 16) ---
class AsuraWarlordBoss {
  constructor(x, y, maxHp = 380) {
    this.x = x;
    this.y = y;
    this.width = 68;
    this.height = 86;
    this.maxHealth = maxHp;
    this.health = maxHp;
    this.isAlive = true;
    this.phase = 1;
    this.timer = 0;
    this.hitTimer = 0;
    this.vx = -1.2;
    this.vy = 0;
    this.damage = 22;
    this.hasSummonedMinions = false;
  }

  update(player, particles) {
    if (!this.isAlive) return;
    this.timer++;
    if (this.hitTimer > 0) this.hitTimer--;

    // Phase transitions
    if (this.phase === 1 && this.health <= this.maxHealth * 0.6) {
      this.phase = 2;
      particles.emitAuraRing(this.x + this.width / 2, this.y + this.height / 2, 160, '#ff6f00');
      particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 25, '#ff3d00');
    }
    if (this.phase === 2 && this.health <= this.maxHealth * 0.3) {
      this.phase = 3; // Berserk enraged
      particles.emitAuraRing(this.x + this.width / 2, this.y + this.height / 2, 200, '#d50000');
      particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 35, '#ff1744');
    }

    const distToPlayer = player.x - this.x;
    const facing = distToPlayer > 0 ? 1 : -1;

    // Movement: advances toward player
    const moveSpeed = this.phase === 3 ? 2.2 : (this.phase === 2 ? 1.6 : 1.1);
    this.vx = facing * moveSpeed;
    this.x += this.vx;

    // Boundary constraints within arena
    if (this.x < 360) this.x = 360;
    if (this.x > 1200) this.x = 1200;

    // Attack action intervals
    const attackInterval = this.phase === 3 ? 70 : (this.phase === 2 ? 95 : 125);
    if (this.timer % attackInterval === 40) {
      // Earth Shockwave Slam
      game.spawnShockwave(this.x + (facing > 0 ? this.width : -20), this.y + 40, facing * 4.8);
      sounds.playHit();
      particles.emitSparks(this.x + this.width / 2, this.y + this.height, 16, '#ff6f00');
    } else if (this.timer % attackInterval === 85 && this.phase >= 2) {
      // Dual Shockwaves in phase 3
      if (this.phase === 3) {
        game.spawnShockwave(this.x + this.width, this.y + 40, 5);
        game.spawnShockwave(this.x - 20, this.y + 40, -5);
      }
      particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 14, '#ff3d00');
    }

    // Summon reinforcements once when entering phase 2
    if (this.phase >= 2 && !this.hasSummonedMinions) {
      this.hasSummonedMinions = true;
      game.enemies.push(new Enemy(420, 396, 'asura_scout', 380, 560));
      game.enemies.push(new Enemy(1080, 396, 'asura_scout', 940, 1160));
      particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 25, '#ffd700');
    }

    // Player touch collision
    if (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    ) {
      player.takeDamage(this.damage);
    }
  }

  takeHit(damage, particles) {
    this.health -= damage;
    this.hitTimer = 9;
    sounds.playHit();
    particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 12, '#ffd700');

    if (this.health <= 0) {
      this.isAlive = false;
      particles.emitLotusPetals(this.x + this.width / 2, this.y + this.height / 2, 25);
      particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 35, '#ff9800');
      game.onEnemyDefeated(this);
    }
  }

  draw(ctx, cameraX) {
    if (!this.isAlive) return;
    const sx = this.x - cameraX;
    ctx.save();
    ctx.translate(sx + this.width / 2, this.y + this.height / 2);
    if (this.hitTimer > 0) ctx.filter = 'brightness(2.2)';

    // Aura
    const auraColor = this.phase === 3 ? 'rgba(213, 0, 0, 0.4)' : (this.phase === 2 ? 'rgba(255, 111, 0, 0.35)' : 'rgba(120, 30, 160, 0.25)');
    ctx.fillStyle = auraColor;
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, Math.PI * 2);
    ctx.fill();

    // Body Armor
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(-24, -32, 48, 64);

    // Armor Plates (Golden & Bronze)
    ctx.fillStyle = '#d84315';
    ctx.fillRect(-22, -26, 44, 28);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(-22, -26, 44, 28);

    // Head / Horned Crown
    ctx.fillStyle = '#1a0c06';
    ctx.beginPath();
    ctx.arc(0, -36, 16, 0, Math.PI * 2);
    ctx.fill();

    // Golden Crown & Horns
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(-16, -42);
    ctx.lineTo(-24, -58);
    ctx.lineTo(-8, -46);
    ctx.lineTo(0, -62);
    ctx.lineTo(8, -46);
    ctx.lineTo(24, -58);
    ctx.lineTo(16, -42);
    ctx.closePath();
    ctx.fill();

    // Red Glowing Eyes
    ctx.fillStyle = '#ff1744';
    ctx.fillRect(-8, -38, 5, 4);
    ctx.fillRect(3, -38, 5, 4);

    // Twin Battle Axes
    ctx.fillStyle = '#546e7a';
    ctx.fillRect(-32, -20, 8, 48);
    ctx.fillRect(24, -20, 8, 48);
    ctx.fillStyle = '#cfd8dc';
    // Left Axe Blade
    ctx.beginPath();
    ctx.arc(-36, -10, 14, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    // Right Axe Blade
    ctx.beginPath();
    ctx.arc(36, -10, 14, Math.PI / 2, -Math.PI / 2);
    ctx.fill();

    ctx.restore();

    // Health Bar & Name Banner
    const barW = 100;
    const barH = 8;
    const hpPct = Math.max(0, this.health / this.maxHealth);
    const barX = sx + (this.width - barW) / 2;
    const barY = this.y - 24;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(barX - 2, barY - 14, barW + 4, barH + 18);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX - 2, barY - 14, barW + 4, barH + 18);

    ctx.fillStyle = '#fff9c4';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("👑 ASURA WARLORD", barX + barW / 2, barY - 3);

    ctx.fillStyle = '#b71c1c';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = this.phase === 3 ? '#ff1744' : '#ff9800';
    ctx.fillRect(barX, barY, barW * hpPct, barH);
  }
}

// --- BOSS: LORD SHIVA (Chapter 1 Level 5) ---
class ShivaBoss {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 60;
    this.height = 80;
    this.maxHealth = 260;
    this.health = 260;
    this.isAlive = true;
    this.timer = 0;
    this.hitTimer = 0;
    this.hoverOffset = 0;
  }

  update(player, particles) {
    if (!this.isAlive) return;
    this.timer++;
    if (this.hitTimer > 0) this.hitTimer--;
    this.hoverOffset = Math.sin(this.timer * 0.05) * 8;

    if (this.timer % 150 === 30) {
      sounds.playDivineSkill();
      game.spawnTridentBeam(this.x, this.y + 30, player.x < this.x ? -5 : 5);
      particles.emitSparks(this.x, this.y + 30, 10, '#00e5ff');
    } else if (this.timer % 150 === 90) {
      particles.emitAuraRing(this.x + this.width / 2, this.y + this.height / 2, 140, '#00e5ff');
      if (Math.hypot(player.x - this.x, player.y - this.y) < 140) {
        player.takeDamage(15);
      }
    } else if (this.timer % 150 === 130) {
      particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 20, '#ffd700');
      this.x = player.x < 500 ? 680 : 220;
      particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 20, '#00e5ff');
    }
  }

  takeHit(damage, particles) {
    this.health -= damage;
    this.hitTimer = 8;
    sounds.playHit();
    particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 10, '#00e5ff');
    if (this.health <= 0) {
      this.isAlive = false;
      game.onShivaDuelComplete();
    }
  }

  draw(ctx, cameraX) {
    const screenX = this.x - cameraX;
    const drawY = this.y + this.hoverOffset;

    ctx.save();
    ctx.translate(screenX + this.width / 2, drawY + this.height / 2);
    if (this.hitTimer > 0) ctx.filter = 'brightness(2.2)';

    const auraGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 60);
    auraGrad.addColorStop(0, 'rgba(0, 229, 255, 0.45)');
    auraGrad.addColorStop(0.7, 'rgba(100, 180, 255, 0.2)');
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(-16, -20, 32, 44);
    ctx.fillStyle = '#00b0ff';
    ctx.fillRect(-6, -18, 12, 6);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(10, -42, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b0bec5';
    ctx.beginPath();
    ctx.arc(0, -30, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(22, 24);
    ctx.lineTo(22, -48);
    ctx.stroke();

    ctx.restore();

    const barW = 320;
    const barH = 10;
    const barX = (ctx.canvas.width - barW) / 2;
    const hpPct = Math.max(0, this.health / this.maxHealth);

    ctx.fillStyle = 'rgba(10, 5, 20, 0.8)';
    ctx.fillRect(barX - 4, 45, barW + 8, barH + 6);
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(barX - 4, 45, barW + 8, barH + 6);
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(barX, 48, barW * hpPct, barH);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Philosopher, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Lord Shiva – Divine Trial of Courage', ctx.canvas.width / 2, 40);
  }
}

// --- BOSS: VIGHNASURA (Chapter 2 Levels 15 & 16) ---
class VighnasuraBoss {
  constructor(x, y, maxHp = 350) {
    this.x = x;
    this.y = y;
    this.width = 65;
    this.height = 85;
    this.maxHealth = maxHp;
    this.health = maxHp;
    this.isAlive = true;
    this.phase = 1;
    this.timer = 0;
    this.hitTimer = 0;
  }

  update(player, particles) {
    if (!this.isAlive) return;
    this.timer++;
    if (this.hitTimer > 0) this.hitTimer--;

    if (this.phase === 1 && this.health <= this.maxHealth * 0.5) {
      this.phase = 2;
      particles.emitAuraRing(this.x + this.width / 2, this.y + this.height / 2, 160, '#ff1744');
      particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 25, '#d50000');
    }

    const interval = this.phase === 1 ? 120 : 80;
    if (this.timer % interval === 30) {
      const dir = player.x < this.x ? -1 : 1;
      game.spawnShockwave(this.x, this.y + 35, dir * 5);
      sounds.playHit();
    } else if (this.timer % interval === 75) {
      particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 16, '#9c27b0');
      this.x = player.x < 500 ? 700 : 200;
      particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 16, '#ff1744');
    }

    if (this.phase === 2 && this.timer % 70 === 45) {
      const dir = player.x < this.x ? -1 : 1;
      game.spawnTridentBeam(this.x, this.y + 20, dir * 6);
    }
  }

  takeHit(damage, particles) {
    this.health -= damage;
    this.hitTimer = 8;
    sounds.playHit();
    particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 10, '#d50000');
    if (this.health <= 0) {
      this.isAlive = false;
      game.onVighnasuraDefeated();
    }
  }

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    ctx.save();
    ctx.translate(sx + this.width / 2, this.y + this.height / 2);
    if (this.hitTimer > 0) ctx.filter = 'brightness(2.2)';

    const auraColor = this.phase === 2 ? 'rgba(213, 0, 0, 0.45)' : 'rgba(156, 39, 176, 0.35)';
    ctx.fillStyle = auraColor;
    ctx.beginPath();
    ctx.arc(0, 0, 58, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#212121';
    ctx.fillRect(-22, -25, 44, 55);

    ctx.fillStyle = '#b71c1c';
    ctx.beginPath();
    ctx.moveTo(-18, -35);
    ctx.lineTo(-28, -55);
    ctx.lineTo(-8, -35);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(18, -35);
    ctx.lineTo(28, -55);
    ctx.lineTo(8, -35);
    ctx.fill();

    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.arc(0, -32, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff1744';
    ctx.fillRect(-8, -36, 5, 4);
    ctx.fillRect(3, -36, 5, 4);

    ctx.restore();

    const barW = 340;
    const barH = 10;
    const barX = (ctx.canvas.width - barW) / 2;
    const hpPct = Math.max(0, this.health / this.maxHealth);

    ctx.fillStyle = 'rgba(10, 5, 20, 0.85)';
    ctx.fillRect(barX - 4, 45, barW + 8, barH + 6);
    ctx.strokeStyle = this.phase === 2 ? '#ff1744' : '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX - 4, 45, barW + 8, barH + 6);

    ctx.fillStyle = this.phase === 2 ? '#ff1744' : '#ab47bc';
    ctx.fillRect(barX, 48, barW * hpPct, barH);

    ctx.fillStyle = '#fff';
    ctx.font = '12px Philosopher, sans-serif';
    ctx.textAlign = 'center';
    const phaseLabel = this.phase === 2 ? ' [PHASE 2 - OBSTACLE FRENZY]' : '';
    ctx.fillText(`Vighnasura – The Lord of Obstacles${phaseLabel}`, ctx.canvas.width / 2, 40);
  }
}

// --- PUZZLE SWITCH & STONE GATE ---
class PuzzleSwitch {
  constructor(x, y, targetGateId) {
    this.x = x;
    this.y = y;
    this.width = 44;
    this.height = 12;
    this.targetGateId = targetGateId;
    this.isPressed = false;
  }

  update(player, platforms, particles) {
    if (this.isPressed) return;
    if (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y + player.height >= this.y &&
      player.y + player.height <= this.y + 16
    ) {
      this.isPressed = true;
      sounds.playSwitchClick();
      particles.emitSparks(this.x + 22, this.y, 14, '#00e5ff');
      if (typeof game !== 'undefined' && game) {
        game.lotusSwitchesActive = (game.lotusSwitchesActive || 0) + 1;
        game.openGate(this.targetGateId);
      }
    }
  }

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    ctx.save();
    ctx.fillStyle = this.isPressed ? '#00e5ff' : '#ffd700';
    ctx.fillRect(sx, this.isPressed ? this.y + 6 : this.y, this.width, this.height - (this.isPressed ? 6 : 0));
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, this.isPressed ? this.y + 6 : this.y, this.width, this.height - (this.isPressed ? 6 : 0));
    ctx.restore();
  }
}

class PuzzleGate {
  constructor(x, y, width = 24, height = 120, id = 1) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.id = id;
    this.isOpen = false;
    this.openProgress = 0;
  }

  update() {
    if (this.isOpen && this.openProgress < this.height) {
      this.openProgress += 4;
    }
  }

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    const currentHeight = this.height - this.openProgress;
    if (currentHeight <= 0) return;
    ctx.save();
    ctx.fillStyle = '#455a64';
    ctx.fillRect(sx, this.y, this.width, currentHeight);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, this.y, this.width, currentHeight);
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(sx + 6, this.y + 20, this.width - 12, 8);
    ctx.restore();
  }

  getCollisionBox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: Math.max(0, this.height - this.openProgress)
    };
  }
}

// --- DEFENSE TARGET (Village Gate / Central Crystal) ---
class DefenseTarget {
  constructor(x, y, type = 'village') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = type === 'village' ? 80 : 50;
    this.height = type === 'village' ? 90 : 80;
    this.maxHealth = 100;
    this.health = 100;
    this.hitTimer = 0;
  }

  takeDamage(amt, particles) {
    this.health = Math.max(0, this.health - amt);
    this.hitTimer = 10;
    sounds.playHit();
    particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 8, '#ff1744');
    if (this.health <= 0) {
      game.onDefenseTargetFailed();
    }
  }

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    ctx.save();
    if (this.hitTimer > 0) ctx.filter = 'brightness(2.2)';

    if (this.type === 'village') {
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(sx, this.y + 20, this.width, this.height - 20);
      ctx.fillStyle = '#d84315';
      ctx.beginPath();
      ctx.moveTo(sx - 10, this.y + 20);
      ctx.lineTo(sx + this.width / 2, this.y - 10);
      ctx.lineTo(sx + this.width + 10, this.y + 20);
      ctx.fill();
    } else {
      const pulse = Math.sin(Date.now() * 0.005) * 4;
      ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(sx + 25, this.y + 40, 36 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.moveTo(sx + 25, this.y);
      ctx.lineTo(sx + 45, this.y + 40);
      ctx.lineTo(sx + 25, this.y + 80);
      ctx.lineTo(sx + 5, this.y + 40);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(sx + 25, this.y + 10);
      ctx.lineTo(sx + 35, this.y + 40);
      ctx.lineTo(sx + 25, this.y + 70);
      ctx.lineTo(sx + 15, this.y + 40);
      ctx.fill();
    }
    ctx.restore();
  }
}

// --- PROJECTILE CLASS ---
class Projectile {
  constructor(x, y, vx, vy, type = 'beam', damage = 14) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.type = type;
    this.damage = damage;
    this.width = type === 'shockwave' ? 24 : 20;
    this.height = type === 'shockwave' ? 18 : 10;
    this.isAlive = true;
    this.life = 120;
  }

  update(player, particles) {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    if (this.life <= 0) this.isAlive = false;

    if (
      this.x < player.x + player.width &&
      this.x + this.width > player.x &&
      this.y < player.y + player.height &&
      this.y + this.height > player.y
    ) {
      player.takeDamage(this.damage);
      this.isAlive = false;
      particles.emitSparks(this.x, this.y, 6, '#00e5ff');
    }
  }

  draw(ctx, cameraX) {
    const screenX = this.x - cameraX;
    ctx.save();
    if (this.type === 'beam') {
      ctx.fillStyle = '#00e5ff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 10;
      ctx.fillRect(screenX, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = '#ff9100';
      ctx.beginPath();
      ctx.arc(screenX + 12, this.y + 9, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// --- COLLECTIBLES ---
class Collectible {
  constructor(x, y, type = 'modak') {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.type = type;
    this.width = 24;
    this.height = 24;
    this.isCollected = false;
    this.floatTimer = Math.random() * 10;
  }

  update(player, particles) {
    if (this.isCollected) return;
    this.floatTimer += 0.05;
    this.y = this.baseY + Math.sin(this.floatTimer) * 5;

    if (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    ) {
      this.isCollected = true;
      sounds.playCollect();
      particles.emitSparks(this.x + 12, this.y + 12, 10, '#ffd700');

      if (this.type === 'modak') {
        player.health = Math.min(player.maxHealth, player.health + 20);
        game.addScore(50);
        game.modaksCollected++;
      } else if (this.type === 'coin') {
        game.addScore(20);
        game.coinsCollected++;
      } else if (this.type === 'flower') {
        player.energy = Math.min(player.maxEnergy, player.energy + 25);
        game.addScore(25);
        game.flowersCollected++;
      } else if (this.type === 'star') {
        player.energy = player.maxEnergy;
        game.addScore(100);
        game.starsCollected++;
      } else if (this.type === 'crystal') {
        player.energy = player.maxEnergy;
        game.addScore(150);
        game.crystalsCollected++;
      } else if (this.type === 'lotus_orb') {
        player.energy = player.maxEnergy;
        game.addScore(100);
        game.lotusOrbsCollected++;
      }
    }
  }

  draw(ctx, cameraX) {
    if (this.isCollected) return;
    const screenX = this.x - cameraX;

    ctx.save();
    ctx.translate(screenX + 12, this.y + 12);

    if (this.type === 'modak') {
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.quadraticCurveTo(8, 4, 0, 9);
      ctx.quadraticCurveTo(-8, 4, 0, -9);
      ctx.fill();
      ctx.strokeStyle = '#ffb300';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (this.type === 'coin') {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff6f00';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#ff6f00';
      ctx.font = '10px serif';
      ctx.textAlign = 'center';
      ctx.fillText('ॐ', 0, 3.5);
    } else if (this.type === 'flower') {
      ctx.fillStyle = '#f06292';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.ellipse(Math.cos(a) * 6, Math.sin(a) * 6, 4, 7, a, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'crystal') {
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(8, -2);
      ctx.lineTo(0, 10);
      ctx.lineTo(-8, -2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (this.type === 'star') {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = 10;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f48fb1';
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// --- MOVING PLATFORMS ---
class MovingPlatform {
  constructor(x, y, width, height, moveX = 0, moveY = 0, speed = 0.03) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.moveX = moveX;
    this.moveY = moveY;
    this.speed = speed;
    this.time = Math.random() * Math.PI * 2;
    this.prevX = x;
    this.prevY = y;
    this.dx = 0;
    this.dy = 0;
    this.isMovingPlatform = true;
  }

  update() {
    this.prevX = this.x;
    this.prevY = this.y;
    this.time += this.speed;
    this.x = this.startX + Math.sin(this.time) * this.moveX;
    this.y = this.startY + Math.sin(this.time) * this.moveY;
    this.dx = this.x - this.prevX;
    this.dy = this.y - this.prevY;
  }

  draw(ctx, cameraX, theme) {
    const sx = this.x - cameraX;
    ctx.save();
    if (theme === 'forest' || theme === 'corrupted_forest') {
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(sx, this.y, this.width, this.height);
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(sx, this.y, this.width, 4);
    } else if (theme === 'kailash' || theme === 'cosmic_journey') {
      ctx.fillStyle = '#37474f';
      ctx.fillRect(sx, this.y, this.width, this.height);
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(sx, this.y, this.width, 4);
    } else {
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(sx, this.y, this.width, this.height);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(sx, this.y, this.width, 4);
    }
    // Center jewel / rune
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(sx + this.width / 2, this.y + this.height / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  getCollisionBox() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}

// --- SACRED RIVER HAZARDS (WATER WITH STEPPING STONES) ---
class SacredRiver {
  constructor(x, y, width, height = 70, type = 'temple') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type; // 'temple', 'light', 'sky'
    this.waveTimer = 0;
  }

  update(player, particles) {
    this.waveTimer += 0.05;
    if (
      player.x + 10 < this.x + this.width &&
      player.x + player.width - 10 > this.x &&
      player.y + player.height > this.y + 12 &&
      player.y < this.y + this.height
    ) {
      particles.emitSparks(player.x + player.width / 2, this.y + 10, 14, this.type === 'light' ? '#00e5ff' : '#64b5f6');
      sounds.playWaterSplash();
      game.loseLife("Sacred River");
    }
  }

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    ctx.save();
    let grad = ctx.createLinearGradient(0, this.y, 0, this.y + this.height);
    if (this.type === 'light') {
      grad.addColorStop(0, 'rgba(0, 229, 255, 0.7)');
      grad.addColorStop(1, 'rgba(13, 71, 161, 0.85)');
    } else if (this.type === 'sky') {
      grad.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
      grad.addColorStop(1, 'rgba(123, 31, 162, 0.8)');
    } else {
      grad.addColorStop(0, 'rgba(33, 150, 243, 0.65)');
      grad.addColorStop(1, 'rgba(13, 71, 161, 0.85)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(sx, this.y, this.width, this.height);

    // Animated surface waves
    ctx.strokeStyle = this.type === 'light' ? '#80d8ff' : '#bbdefb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < this.width; i += 16) {
      const waveY = this.y + Math.sin(this.waveTimer + (sx + i) * 0.08) * 3;
      if (i === 0) ctx.moveTo(sx, waveY);
      else ctx.lineTo(sx + i, waveY);
    }
    ctx.stroke();

    // Floating lotus pads
    for (let i = 40; i < this.width - 40; i += 120) {
      const padX = sx + i;
      const padY = this.y + 4 + Math.sin(this.waveTimer * 0.7 + i) * 2;
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.ellipse(padX, padY, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f48fb1';
      ctx.beginPath();
      ctx.arc(padX + 2, padY - 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// --- TEMPLE BELL ---
class TempleBell {
  constructor(x, y, id = 1) {
    this.x = x;
    this.y = y;
    this.width = 36;
    this.height = 48;
    this.id = id;
    this.isRung = false;
    this.swingTimer = 0;
  }

  update(player, particles) {
    if (this.swingTimer > 0) this.swingTimer--;
    const touches = (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    );
    const hitByAttack = (
      player.isAttacking &&
      player.attackHitbox.x < this.x + this.width &&
      player.attackHitbox.x + player.attackHitbox.width > this.x &&
      player.attackHitbox.y < this.y + this.height &&
      player.attackHitbox.y + player.attackHitbox.height > this.y
    );
    if ((touches || hitByAttack) && !this.isRung) {
      this.ring(particles);
    }
  }

  ring(particles) {
    this.isRung = true;
    this.swingTimer = 60;
    sounds.playTempleBell(880 + (this.id * 110));
    particles.emitSparks(this.x + 18, this.y + 24, 16, '#ffd700');
    game.addScore(150);
    game.onBellRung(this.id);
  }

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    ctx.save();
    ctx.translate(sx + 18, this.y);
    const swingAngle = this.swingTimer > 0 ? Math.sin(this.swingTimer * 0.4) * 0.3 * (this.swingTimer / 60) : 0;
    ctx.rotate(swingAngle);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(0, 4);
    ctx.stroke();

    ctx.fillStyle = this.isRung ? '#ffd700' : '#c59b27';
    ctx.beginPath();
    ctx.moveTo(-14, 30);
    ctx.quadraticCurveTo(-12, 6, 0, 4);
    ctx.quadraticCurveTo(12, 6, 14, 30);
    ctx.lineTo(-14, 30);
    ctx.fill();
    ctx.fillRect(-16, 30, 32, 6);

    ctx.fillStyle = '#ff6f00';
    ctx.beginPath();
    ctx.arc(0, 36, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px serif';
    ctx.textAlign = 'center';
    ctx.fillText('ॐ', 0, 22);
    ctx.restore();
  }
}

// --- CLOUD PLATFORMS (CHAPTER 3) ---
class CloudPlatform {
  constructor(x, y, width = 120, height = 24) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.width = width;
    this.height = height;
    this.floatTimer = Math.random() * 10;
  }

  update() {
    this.floatTimer += 0.03;
    this.y = this.baseY + Math.sin(this.floatTimer) * 4;
  }

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.35)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    const r = this.height / 2;
    ctx.arc(sx + r, this.y + r, r, 0, Math.PI * 2);
    ctx.arc(sx + this.width / 3, this.y + r - 6, r + 5, 0, Math.PI * 2);
    ctx.arc(sx + (this.width * 2) / 3, this.y + r - 4, r + 3, 0, Math.PI * 2);
    ctx.arc(sx + this.width - r, this.y + r, r, 0, Math.PI * 2);
    ctx.rect(sx + r, this.y, this.width - 2 * r, this.height);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  getCollisionBox() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}

// --- MAGICAL KEYS ---
class MagicalKey {
  constructor(x, y, keyId = 1) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.keyId = keyId;
    this.width = 24;
    this.height = 24;
    this.isCollected = false;
    this.floatTimer = Math.random() * 10;
  }

  update(player, particles) {
    if (this.isCollected) return;
    this.floatTimer += 0.06;
    this.y = this.baseY + Math.sin(this.floatTimer) * 5;
    if (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    ) {
      this.isCollected = true;
      sounds.playKeyUnlock();
      particles.emitSparks(this.x + 12, this.y + 12, 12, '#ffd700');
      game.addScore(200);
      game.onKeyCollected(this.keyId);
    }
  }

  draw(ctx, cameraX) {
    if (this.isCollected) return;
    const sx = this.x - cameraX;
    ctx.save();
    ctx.translate(sx + 12, this.y + 12);
    ctx.fillStyle = '#ffd700';
    ctx.strokeStyle = '#ff6f00';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-4, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(3, -2, 10, 4);
    ctx.fillRect(9, 2, 4, 4);
    ctx.restore();
  }
}

// --- DIVINE SYMBOLS (LEVEL 23: 5 SACRED SYMBOLS) ---
class DivineSymbol {
  constructor(x, y, symbolId, label = 'ॐ') {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.symbolId = symbolId;
    this.label = label;
    this.width = 34;
    this.height = 34;
    this.isCollected = false;
    this.floatTimer = Math.random() * 10;
  }

  update(player, particles) {
    if (this.isCollected) return;
    this.floatTimer += 0.05;
    this.y = this.baseY + Math.sin(this.floatTimer) * 6;
    if (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    ) {
      this.isCollected = true;
      sounds.playCollect();
      particles.emitAuraRing(this.x + 17, this.y + 17, 70, '#ffd700');
      game.addScore(300);
      game.onDivineSymbolCollected(this.symbolId);
    }
  }

  draw(ctx, cameraX) {
    if (this.isCollected) return;
    const sx = this.x - cameraX;
    ctx.save();
    ctx.translate(sx + 17, this.y + 17);
    ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, 0, 1);
    ctx.restore();
  }
}

// --- OBSTACLE TRAPS (SPIKES, CHAKRAS, THORNS) ---
class ObstacleTrap {
  constructor(x, y, width = 32, height = 24, type = 'spikes') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.animTimer = 0;
  }

  update(player, particles) {
    this.animTimer += 0.08;
    if (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    ) {
      if (player.invulnerableTimer <= 0) {
        player.takeDamage(1);
      }
    }
  }

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    ctx.save();
    if (this.type === 'spikes') {
      ctx.fillStyle = '#b0bec5';
      ctx.strokeStyle = '#37474f';
      ctx.lineWidth = 1;
      const count = Math.max(1, Math.floor(this.width / 12));
      const step = this.width / count;
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.moveTo(sx + i * step, this.y + this.height);
        ctx.lineTo(sx + (i + 0.5) * step, this.y);
        ctx.lineTo(sx + (i + 1) * step, this.y + this.height);
        ctx.fill();
        ctx.stroke();
      }
    } else if (this.type === 'thorns') {
      ctx.fillStyle = '#2e7d32';
      ctx.strokeStyle = '#d84315';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sx + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (this.type === 'chakra') {
      ctx.translate(sx + this.width / 2, this.y + this.height / 2);
      ctx.rotate(this.animTimer);
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff6f00';
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.fillRect(Math.cos(a) * 10 - 2, Math.sin(a) * 10 - 2, 5, 5);
      }
    }
    ctx.restore();
  }
}

// --- FRIENDLY ELEPHANT GUARDIAN (LEVEL 13) ---
class ElephantGuardian {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 60;
    this.height = 70;
    this.isPleased = false;
    this.sway = 0;
  }

  update(player, particles) {
    this.sway += 0.04;
    if (game && game.lotusSwitchesActive >= 3 && !this.isPleased) {
      this.isPleased = true;
      sounds.playCollect();
      particles.emitLotusPetals(this.x + 30, this.y + 30, 20);
    }
  }

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    ctx.save();
    ctx.translate(sx + 30, this.y + 35);
    const bob = Math.sin(this.sway) * 3;

    // Body
    ctx.fillStyle = '#78909c';
    ctx.beginPath();
    ctx.ellipse(0, 5 + bob, 26, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(16, -10 + bob, 15, 0, Math.PI * 2);
    ctx.fill();

    // Ear
    ctx.fillStyle = '#b0bec5';
    ctx.beginPath();
    ctx.ellipse(8, -12 + bob, 8, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.strokeStyle = '#78909c';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(24, -5 + bob);
    ctx.quadraticCurveTo(34, 10 + bob, 30, 20 + bob);
    ctx.stroke();

    // Divine Lotus Garland
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(4, 5 + bob, 14, 0.3, Math.PI - 0.3);
    ctx.stroke();

    if (this.isPleased) {
      ctx.fillStyle = '#ffd700';
      ctx.font = '16px serif';
      ctx.fillText('🌺 Blessings! 🌺', -35, -30);
    }

    ctx.restore();
  }
}

// --- FOREST GUARDIAN BOSS (LEVEL 16 - MULTI-STAGE) ---
class ForestGuardianBoss {
  constructor(x, y, maxHp = 400) {
    this.x = x;
    this.y = y;
    this.width = 75;
    this.height = 95;
    this.maxHealth = maxHp;
    this.health = maxHp;
    this.isAlive = true;
    this.stage = 1;
    this.timer = 0;
    this.hitTimer = 0;
  }

  update(player, particles) {
    if (!this.isAlive) return;
    this.timer++;
    if (this.hitTimer > 0) this.hitTimer--;

    if (this.stage === 1 && this.health <= this.maxHealth * 0.5) {
      this.stage = 2;
      particles.emitAuraRing(this.x + this.width / 2, this.y + this.height / 2, 160, '#00e676');
      particles.emitLotusPetals(this.x + this.width / 2, this.y + this.height / 2, 25);
    }

    const interval = this.stage === 1 ? 110 : 75;
    if (this.timer % interval === 30) {
      const dir = player.x < this.x ? -1 : 1;
      game.spawnShockwave(this.x, this.y + 40, dir * 5);
      sounds.playHit();
    }
  }

  takeHit(damage, particles) {
    this.health -= damage;
    this.hitTimer = 8;
    sounds.playHit();
    particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 10, '#00e676');
    if (this.health <= 0) {
      this.isAlive = false;
      game.onForestGuardianSoothed();
    }
  }

  draw(ctx, cameraX) {
    const sx = this.x - cameraX;
    ctx.save();
    ctx.translate(sx + this.width / 2, this.y + this.height / 2);
    if (this.hitTimer > 0) ctx.filter = 'brightness(2.2)';

    // Ancient Nature Aura
    ctx.fillStyle = this.stage === 2 ? 'rgba(0, 230, 118, 0.4)' : 'rgba(76, 175, 80, 0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, 62, 0, Math.PI * 2);
    ctx.fill();

    // Ancient Treebark Golem
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(-26, -30, 52, 65);
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(0, -35, 20, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Eyes
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-10, -38, 6, 5);
    ctx.fillRect(4, -38, 6, 5);
    ctx.restore();

    // Boss HP Bar
    const barW = 340;
    const barH = 10;
    const barX = (ctx.canvas.width - barW) / 2;
    const hpPct = Math.max(0, this.health / this.maxHealth);

    ctx.fillStyle = 'rgba(10, 5, 20, 0.85)';
    ctx.fillRect(barX - 4, 45, barW + 8, barH + 6);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX - 4, 45, barW + 8, barH + 6);

    ctx.fillStyle = this.stage === 2 ? '#00e676' : '#81c784';
    ctx.fillRect(barX, 48, barW * hpPct, barH);

    ctx.fillStyle = '#fff';
    ctx.font = '12px Philosopher, sans-serif';
    ctx.textAlign = 'center';
    const stageLabel = this.stage === 2 ? ' [STAGE 2 - PURIFYING TRIAL]' : '';
    ctx.fillText(`Ancient Forest Guardian – Trial of Harmony${stageLabel}`, ctx.canvas.width / 2, 40);
  }
}

// --- CHECKPOINT & EXIT ALTAR ---
class ShrineAltar {
  constructor(x, y, isGoal = false) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 54;
    this.isGoal = isGoal;
    this.isLit = false;
  }

  update(player, particles) {
    if (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    ) {
      if (!this.isLit) {
        this.isLit = true;
        sounds.playCollect();
        particles.emitLotusPetals(this.x + 20, this.y + 10, 8);
        if (!this.isGoal) {
          game.setCheckpoint(this.x, this.y - 10);
        }
      }
      if (this.isGoal) {
        game.checkLevelGoalAchieved();
      }
    }
  }

  draw(ctx, cameraX) {
    const screenX = this.x - cameraX;
    ctx.save();
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(screenX, this.y + 30, this.width, 24);

    ctx.fillStyle = '#ff8f00';
    ctx.beginPath();
    ctx.ellipse(screenX + 20, this.y + 26, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.isLit) {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(screenX + 16, this.y + 24);
      ctx.quadraticCurveTo(screenX + 20, this.y + 4, screenX + 20, this.y);
      ctx.quadraticCurveTo(screenX + 24, this.y + 14, screenX + 24, this.y + 24);
      ctx.fill();
    }
    ctx.restore();
  }
}

// ==========================================================================
// 6. LEVEL CONFIGURATIONS (All 24 Playable Levels: Chapters 1, 2 & 3)
// ==========================================================================
const LEVEL_CONFIGS = [
  // =========================================================================
  // 🏛️ CHAPTER 1 — THE SACRED TEMPLE (Levels 1 to 8)
  // =========================================================================
  {
    levelNum: 1, chapter: 1, title: "Temple Entrance", theme: "palace",
    speaker: "Lord Ganesha", avatar: "🐘",
    story: "Lord Ganesha begins his divine journey at the ancient holy temple. Golden pillars rise into the warm morning light as sacred bells echo across the stone steps.",
    mission: "Tutorial: Learn movement and jumping! Collect all 10 golden modaks and reach the temple entrance.",
    tutorialText: "Use [A]/[D] or ◀/▶ to move, [W]/[Space] or ▲ to jump! Collect 10 Modaks.",
    platforms: [
      { x: 0, y: 460, width: 1500, height: 80 },
      { x: 260, y: 380, width: 140, height: 20 },
      { x: 480, y: 320, width: 150, height: 20 },
      { x: 720, y: 380, width: 140, height: 20 },
      { x: 940, y: 320, width: 160, height: 20 },
      { x: 1180, y: 370, width: 140, height: 20 }
    ],
    collectibles: [
      { x: 180, y: 410, type: 'modak' }, { x: 320, y: 330, type: 'modak' },
      { x: 420, y: 410, type: 'modak' }, { x: 540, y: 270, type: 'modak' },
      { x: 660, y: 410, type: 'modak' }, { x: 780, y: 330, type: 'modak' },
      { x: 900, y: 410, type: 'modak' }, { x: 1010, y: 270, type: 'modak' },
      { x: 1120, y: 410, type: 'modak' }, { x: 1240, y: 320, type: 'modak' }
    ],
    enemies: [],
    altars: [{ x: 600, y: 406, isGoal: false }, { x: 1380, y: 406, isGoal: true }],
    goalX: 1380, requiredModaks: 10,
    completionStory: "With joyful steps, Lord Ganesha gathers the 10 golden modaks and steps gracefully through the sacred temple gates."
  },
  {
    levelNum: 2, chapter: 1, title: "Flower Garden", theme: "palace",
    speaker: "Temple Priest", avatar: "🌺",
    story: "Fragrant lotus ponds and marigold gardens surround the temple pavilion. Floating stone platforms drift gently across the flowering courtyard.",
    mission: "Collect sacred flowers and golden modaks, ride moving platforms, avoid small thorn traps, and reach the golden temple bell!",
    tutorialText: "Ride floating moving platforms! Watch out for thorn bushes on the ground.",
    platforms: [
      { x: 0, y: 460, width: 1650, height: 80 },
      { x: 220, y: 370, width: 120, height: 20 },
      { x: 760, y: 360, width: 140, height: 20 },
      { x: 1320, y: 370, width: 150, height: 20 }
    ],
    movingPlatforms: [
      { x: 400, y: 310, width: 130, height: 18, moveX: 90, moveY: 0, speed: 0.025 },
      { x: 980, y: 290, width: 130, height: 18, moveX: 0, moveY: 50, speed: 0.03 }
    ],
    traps: [
      { x: 580, y: 442, width: 32, height: 18, type: 'thorns' },
      { x: 1160, y: 442, width: 32, height: 18, type: 'thorns' }
    ],
    collectibles: [
      { x: 270, y: 320, type: 'modak' }, { x: 450, y: 250, type: 'flower' },
      { x: 660, y: 410, type: 'modak' }, { x: 820, y: 310, type: 'flower' },
      { x: 1040, y: 230, type: 'modak' }, { x: 1250, y: 410, type: 'flower' },
      { x: 1380, y: 320, type: 'modak' }
    ],
    altars: [{ x: 700, y: 406, isGoal: false }, { x: 1520, y: 406, isGoal: true }],
    goalX: 1520,
    completionStory: "The sacred bells chime melodiously as fresh flower garlands adorn Lord Ganesha's golden crown."
  },
  {
    levelNum: 3, chapter: 1, title: "Bell of Blessings", theme: "palace",
    speaker: "Temple Sage", avatar: "🔔",
    story: "Three sacred bronze bells hang in the high courtyard pavilion. Legend says when all three bells ring in harmony, the divine sanctum gates swing wide open.",
    mission: "Activate all 3 temple bells by touching or striking them! Collect coins while dodging small spinning floor traps.",
    tutorialText: "Touch or strike [J] all 3 Temple Bells to unlock the golden blessing gate!",
    platforms: [
      { x: 0, y: 460, width: 1750, height: 80 },
      { x: 260, y: 360, width: 140, height: 20 },
      { x: 540, y: 280, width: 160, height: 20 },
      { x: 840, y: 350, width: 150, height: 20 },
      { x: 1120, y: 280, width: 160, height: 20 },
      { x: 1420, y: 360, width: 150, height: 20 }
    ],
    bells: [
      { x: 320, y: 300, id: 1 },
      { x: 610, y: 220, id: 2 },
      { x: 1190, y: 220, id: 3 }
    ],
    traps: [
      { x: 440, y: 442, width: 30, height: 18, type: 'spikes' },
      { x: 1020, y: 442, width: 30, height: 18, type: 'spikes' }
    ],
    collectibles: [
      { x: 200, y: 410, type: 'coin' }, { x: 480, y: 410, type: 'coin' },
      { x: 740, y: 410, type: 'coin' }, { x: 900, y: 300, type: 'modak' },
      { x: 1320, y: 410, type: 'coin' }, { x: 1480, y: 310, type: 'modak' }
    ],
    altars: [{ x: 780, y: 406, isGoal: false }, { x: 1640, y: 406, isGoal: true }],
    goalX: 1640, requiredBells: 3,
    completionStory: "The three bells resonate with pure divine harmony! Celestial blessing light bathes the entire courtyard."
  },
  {
    levelNum: 4, chapter: 1, title: "Temple Courtyard", theme: "palace",
    speaker: "Courtyard Sentinel", avatar: "🏛️",
    story: "The grand outer courtyard spans towering carved marble pillars and high archways. Moving stone blocks and spinning chakras test your timing.",
    mission: "Traverse the expansive courtyard, leap across pillar gaps, dodge moving obstacles, and gather hidden modaks on high terraces.",
    tutorialText: "Jump across gaps between pillars! Look high above for secret golden modaks.",
    platforms: [
      { x: 0, y: 460, width: 500, height: 80 },
      { x: 580, y: 460, width: 500, height: 80 },
      { x: 1160, y: 460, width: 650, height: 80 },
      { x: 180, y: 360, width: 130, height: 20 },
      { x: 380, y: 290, width: 140, height: 20 },
      { x: 660, y: 360, width: 140, height: 20 },
      { x: 900, y: 280, width: 150, height: 20 },
      { x: 1240, y: 350, width: 140, height: 20 },
      { x: 1460, y: 280, width: 160, height: 20 }
    ],
    traps: [
      { x: 320, y: 442, width: 32, height: 18, type: 'chakra' },
      { x: 800, y: 442, width: 32, height: 18, type: 'chakra' },
      { x: 1380, y: 442, width: 32, height: 18, type: 'spikes' }
    ],
    collectibles: [
      { x: 230, y: 310, type: 'modak' }, { x: 440, y: 240, type: 'modak' },
      { x: 720, y: 310, type: 'modak' }, { x: 960, y: 230, type: 'modak' },
      { x: 1300, y: 300, type: 'modak' }, { x: 1530, y: 230, type: 'modak' }
    ],
    altars: [{ x: 750, y: 406, isGoal: false }, { x: 1680, y: 406, isGoal: true }],
    goalX: 1680,
    completionStory: "Lord Ganesha gracefully bounds across the high terraces, laughing joyfully as golden petals scatter in his wake."
  },
  {
    levelNum: 5, chapter: 1, title: "River Crossing", theme: "palace",
    speaker: "River Sage", avatar: "🌊",
    story: "A sacred flowing river encircles the temple sanctuary. Stepping stones and floating lotus bridges offer the only path across the deep waters.",
    mission: "Cross the sacred river! Leap carefully across stepping stones, wooden bridges, and moving platforms. Avoid falling into the water!",
    tutorialText: "Don't fall into the water! Step on stepping stones and moving lotus platforms.",
    platforms: [
      { x: 0, y: 460, width: 350, height: 80 },
      { x: 420, y: 440, width: 70, height: 40 },  // Stepping Stone 1
      { x: 560, y: 420, width: 80, height: 50 },  // Stepping Stone 2
      { x: 720, y: 400, width: 140, height: 20 }, // Bridge 1
      { x: 1140, y: 420, width: 80, height: 50 }, // Stepping Stone 3
      { x: 1300, y: 460, width: 500, height: 80 } // Main bank
    ],
    rivers: [
      { x: 350, y: 470, width: 950, height: 70, type: 'temple' }
    ],
    movingPlatforms: [
      { x: 920, y: 360, width: 130, height: 18, moveX: 60, moveY: 0, speed: 0.03 }
    ],
    collectibles: [
      { x: 220, y: 410, type: 'flower' }, { x: 450, y: 390, type: 'modak' },
      { x: 590, y: 370, type: 'flower' }, { x: 780, y: 350, type: 'modak' },
      { x: 980, y: 310, type: 'flower' }, { x: 1170, y: 370, type: 'modak' },
      { x: 1440, y: 410, type: 'modak' }
    ],
    altars: [{ x: 770, y: 346, isGoal: false }, { x: 1680, y: 406, isGoal: true }],
    goalX: 1680,
    completionStory: "The holy river ripples with golden light as Lord Ganesha safely steps onto the opposite temple shore."
  },
  {
    levelNum: 6, chapter: 1, title: "Guardian Challenge", theme: "palace",
    speaker: "Temple Stone Golem", avatar: "🛡️",
    story: "An ancient Stone Golem Guardian awakes at the sanctum archway. He raises his heavy stone club, testing Lord Ganesha's courage and combat prowess.",
    mission: "Defeat or bypass the Temple Guardian! Use Staff Strike [J] or Divine Shockwave [K] while protecting your 3 lives.",
    tutorialText: "Guardian Battle! Use [J] to strike and [K] for Divine Aura Shockwave!",
    platforms: [
      { x: 0, y: 460, width: 1600, height: 80 },
      { x: 240, y: 360, width: 150, height: 20 },
      { x: 500, y: 290, width: 180, height: 20 },
      { x: 800, y: 350, width: 160, height: 20 },
      { x: 1100, y: 290, width: 180, height: 20 }
    ],
    enemies: [
      { x: 360, y: 410, type: 'wisp' }, { x: 620, y: 240, type: 'wisp' },
      { x: 920, y: 410, type: 'wisp' }, { x: 1220, y: 390, type: 'temple_golem' }
    ],
    collectibles: [
      { x: 300, y: 310, type: 'modak' }, { x: 570, y: 240, type: 'modak' },
      { x: 870, y: 300, type: 'modak' }, { x: 1170, y: 240, type: 'modak' }
    ],
    altars: [{ x: 700, y: 406, isGoal: false }, { x: 1500, y: 406, isGoal: true }],
    goalX: 1500,
    completionStory: "The Stone Golem bows in deep reverence before the divine wisdom and gentle courage of Lord Ganesha."
  },
  {
    levelNum: 7, chapter: 1, title: "Golden Temple Path", theme: "palace",
    speaker: "Temple Priest", avatar: "✨",
    story: "The grand Golden Colonnade features moving platforms suspended over deep gaps, synchronized traps, and wandering temple sentinels.",
    mission: "Overcome difficult obstacle combinations, ride moving platforms across chasms, and collect secret golden modaks!",
    tutorialText: "Carefully time your jumps across moving platforms! Avoid the spinning spikes.",
    platforms: [
      { x: 0, y: 460, width: 450, height: 80 },
      { x: 620, y: 460, width: 400, height: 80 },
      { x: 1200, y: 460, width: 600, height: 80 },
      { x: 180, y: 360, width: 130, height: 20 },
      { x: 720, y: 350, width: 140, height: 20 },
      { x: 1320, y: 360, width: 150, height: 20 }
    ],
    movingPlatforms: [
      { x: 470, y: 380, width: 120, height: 18, moveX: 60, moveY: 0, speed: 0.03 },
      { x: 1040, y: 370, width: 120, height: 18, moveX: 60, moveY: 0, speed: 0.035 }
    ],
    traps: [
      { x: 300, y: 442, width: 32, height: 18, type: 'spikes' },
      { x: 800, y: 442, width: 32, height: 18, type: 'chakra' },
      { x: 1450, y: 442, width: 32, height: 18, type: 'spikes' }
    ],
    enemies: [
      { x: 320, y: 410, type: 'wisp' }, { x: 780, y: 410, type: 'raider' }, { x: 1380, y: 410, type: 'raider' }
    ],
    collectibles: [
      { x: 230, y: 310, type: 'modak' }, { x: 520, y: 330, type: 'coin' },
      { x: 770, y: 300, type: 'modak' }, { x: 1090, y: 320, type: 'coin' },
      { x: 1380, y: 310, type: 'modak' }, { x: 1580, y: 410, type: 'modak' }
    ],
    altars: [{ x: 740, y: 406, isGoal: false }, { x: 1700, y: 406, isGoal: true }],
    goalX: 1700,
    completionStory: "The Golden Colonnade gives way to the blinding brilliance of the central inner temple sanctum!"
  },
  {
    levelNum: 8, chapter: 1, title: "Temple Blessing", theme: "palace",
    speaker: "Lord Shiva & Parvati", avatar: "🕉️",
    story: "Chapter 1 Finale! Inside the grand supreme temple sanctum, divine lights blaze and celestial flowers rain from the heavens.",
    mission: "Chapter Finale: Gather all 20 special golden modaks across the grand temple arches to unlock Chapter 2!",
    tutorialText: "Collect 20 Golden Modaks to awaken the supreme temple blessing!",
    platforms: [
      { x: 0, y: 460, width: 2000, height: 80 },
      { x: 200, y: 370, width: 140, height: 20 },
      { x: 420, y: 290, width: 160, height: 20 },
      { x: 680, y: 360, width: 150, height: 20 },
      { x: 940, y: 280, width: 160, height: 20 },
      { x: 1200, y: 360, width: 150, height: 20 },
      { x: 1440, y: 280, width: 160, height: 20 },
      { x: 1680, y: 360, width: 150, height: 20 }
    ],
    collectibles: [
      { x: 160, y: 410, type: 'modak' }, { x: 250, y: 320, type: 'modak' },
      { x: 350, y: 410, type: 'modak' }, { x: 470, y: 240, type: 'modak' },
      { x: 580, y: 410, type: 'modak' }, { x: 720, y: 310, type: 'modak' },
      { x: 820, y: 410, type: 'modak' }, { x: 980, y: 230, type: 'modak' },
      { x: 1080, y: 410, type: 'modak' }, { x: 1240, y: 310, type: 'modak' },
      { x: 1340, y: 410, type: 'modak' }, { x: 1490, y: 230, type: 'modak' },
      { x: 1580, y: 410, type: 'modak' }, { x: 1720, y: 310, type: 'modak' },
      { x: 280, y: 220, type: 'modak' }, { x: 520, y: 190, type: 'modak' },
      { x: 790, y: 240, type: 'modak' }, { x: 1040, y: 180, type: 'modak' },
      { x: 1300, y: 240, type: 'modak' }, { x: 1550, y: 180, type: 'modak' }
    ],
    enemies: [
      { x: 500, y: 240, type: 'wisp' }, { x: 1000, y: 230, type: 'wisp' }, { x: 1500, y: 230, type: 'wisp' }
    ],
    altars: [{ x: 950, y: 406, isGoal: false }, { x: 1900, y: 406, isGoal: true }],
    goalX: 1900, requiredModaks: 20,
    completionStory: "✨ CHAPTER 1 COMPLETE! The Temple of Blessings awakens with divine light! Chapter 2: The Divine Battle is now UNLOCKED!"
  },

  // =========================================================================
  // ⚔️ CHAPTER 2 — THE DIVINE BATTLE (Levels 9 to 16)
  // =========================================================================
  {
    levelNum: 9, chapter: 2, title: "The Asura Incursion", theme: "corrupted_forest",
    speaker: "Divine Scout", avatar: "🛡️",
    story: "Dark war banners flutter across the sacred mountain pass. Marauding Asura grunts have breached the perimeter, threatening the sanctity of the realm. Lord Ganesha readies his consecrated Gada (mace) for battle!",
    mission: "The Divine Battle begins! Learn combat: press [J] on PC or [⚔] on mobile to swing your Gada. Defeat 4 Asura grunts, collect modaks and coins, and reach the war shrine!",
    tutorialText: "⚔️ COMBAT TUTORIAL: Press [J] or [⚔] to strike enemies! Touching them deals damage. Defeat all foes!",
    platforms: [
      { x: 0, y: 460, width: 1700, height: 80 },
      { x: 300, y: 370, width: 160, height: 20 },
      { x: 620, y: 330, width: 180, height: 20 },
      { x: 980, y: 360, width: 160, height: 20 },
      { x: 1260, y: 320, width: 160, height: 20 }
    ],
    enemies: [
      { x: 450, y: 410, type: 'asura_grunt' },
      { x: 720, y: 410, type: 'asura_grunt' },
      { x: 1100, y: 410, type: 'asura_grunt' },
      { x: 1380, y: 410, type: 'asura_grunt' }
    ],
    collectibles: [
      { x: 220, y: 410, type: 'modak' }, { x: 380, y: 320, type: 'coin' },
      { x: 710, y: 280, type: 'modak' }, { x: 860, y: 410, type: 'coin' },
      { x: 1060, y: 310, type: 'modak' }, { x: 1340, y: 270, type: 'coin' }
    ],
    altars: [{ x: 750, y: 406, isGoal: false }, { x: 1600, y: 406, isGoal: true }],
    goalX: 1600,
    completionStory: "With mighty sweeps of his golden Gada, Lord Ganesha drives back the first wave of Asura grunts! The holy perimeter holds firm."
  },
  {
    levelNum: 10, chapter: 2, title: "Outpost Skirmish", theme: "corrupted_forest",
    speaker: "Temple Vanguard", avatar: "⚔️",
    story: "Asura scouts have established an ambush outpost across the rocky ravine. Quicker and more aggressive, they strike in coordinated pairs.",
    mission: "Overcome coordinated pairs of agile Asura scouts! Master spacing, time your weapon swings, and clear the rocky outpost.",
    tutorialText: "Fast Asura scouts attack in pairs! Leap over them and strike with timed combos.",
    platforms: [
      { x: 0, y: 460, width: 620, height: 80 },
      { x: 680, y: 460, width: 1150, height: 80 },
      { x: 220, y: 370, width: 140, height: 20 },
      { x: 440, y: 310, width: 160, height: 20 },
      { x: 800, y: 360, width: 150, height: 20 },
      { x: 1040, y: 300, width: 160, height: 20 },
      { x: 1300, y: 360, width: 150, height: 20 }
    ],
    movingPlatforms: [
      { x: 590, y: 400, width: 100, height: 18, moveX: 30, moveY: 0, speed: 0.03 }
    ],
    enemies: [
      { x: 380, y: 410, type: 'asura_scout' },
      { x: 500, y: 410, type: 'asura_scout' },
      { x: 880, y: 410, type: 'asura_scout' },
      { x: 960, y: 410, type: 'asura_scout' },
      { x: 1380, y: 410, type: 'asura_scout' },
      { x: 1480, y: 410, type: 'asura_scout' }
    ],
    collectibles: [
      { x: 280, y: 320, type: 'modak' }, { x: 520, y: 260, type: 'coin' },
      { x: 870, y: 310, type: 'modak' }, { x: 1120, y: 250, type: 'coin' },
      { x: 1370, y: 310, type: 'modak' }, { x: 1560, y: 410, type: 'coin' }
    ],
    altars: [{ x: 800, y: 406, isGoal: false }, { x: 1700, y: 406, isGoal: true }],
    goalX: 1700,
    completionStory: "Lord Ganesha's valor and quick wits outmatch the scout ambush. The mountain outpost is reclaimed for the devas!"
  },
  {
    levelNum: 11, chapter: 2, title: "Patrols of the Ridge", theme: "fortress",
    speaker: "High Ridge Sentinel", avatar: "🛡️",
    story: "Disciplined Asura patrol guards march along the fortified ramparts of the High Ridge, reversing direction at platform edges.",
    mission: "Analyze enemy patrol routes! Wait for the opportune moment, ambush them from above or behind, and break through the defense line.",
    tutorialText: "Patrol enemies pace back and forth within their boundaries. Time your advance between their turns!",
    platforms: [
      { x: 0, y: 460, width: 1900, height: 80 },
      { x: 260, y: 360, width: 220, height: 20 },
      { x: 560, y: 290, width: 240, height: 20 },
      { x: 880, y: 360, width: 220, height: 20 },
      { x: 1180, y: 290, width: 240, height: 20 },
      { x: 1480, y: 360, width: 200, height: 20 }
    ],
    enemies: [
      { x: 300, y: 310, type: 'asura_patrol', patrolMinX: 260, patrolMaxX: 470 },
      { x: 600, y: 240, type: 'asura_patrol', patrolMinX: 560, patrolMaxX: 790 },
      { x: 700, y: 410, type: 'asura_patrol', patrolMinX: 500, patrolMaxX: 850 },
      { x: 1220, y: 240, type: 'asura_patrol', patrolMinX: 1180, patrolMaxX: 1410 },
      { x: 1300, y: 410, type: 'asura_patrol', patrolMinX: 1050, patrolMaxX: 1450 }
    ],
    collectibles: [
      { x: 370, y: 310, type: 'modak' }, { x: 680, y: 240, type: 'coin' },
      { x: 990, y: 310, type: 'modak' }, { x: 1300, y: 240, type: 'coin' },
      { x: 1580, y: 310, type: 'modak' }, { x: 1720, y: 410, type: 'coin' }
    ],
    altars: [{ x: 800, y: 406, isGoal: false }, { x: 1800, y: 406, isGoal: true }],
    goalX: 1800,
    completionStory: "With divine patience and tactical brilliance, Lord Ganesha dismantles each patrol line along the jagged ridge."
  },
  {
    levelNum: 12, chapter: 2, title: "The Shadow Glen", theme: "corrupted_forest",
    speaker: "Elder Hermit", avatar: "🐺",
    story: "A thick miasma blankets the sunken glen, home to ravenous Shadow Beasts. When they catch scent of an intruder, they sprint in ferocious charges!",
    mission: "Survive the sudden lunges of Shadow Beasts! Leap to evade their charging bursts and counter-attack with heavy overhead strikes.",
    tutorialText: "⚠️ DANGER: Shadow Beasts sprint rapidly when close! Jump over their sprint attacks to strike them down.",
    platforms: [
      { x: 0, y: 460, width: 1850, height: 80 },
      { x: 220, y: 370, width: 130, height: 20 },
      { x: 440, y: 300, width: 140, height: 20 },
      { x: 680, y: 370, width: 130, height: 20 },
      { x: 920, y: 300, width: 150, height: 20 },
      { x: 1180, y: 370, width: 140, height: 20 },
      { x: 1420, y: 310, width: 150, height: 20 }
    ],
    enemies: [
      { x: 380, y: 410, type: 'shadow_beast' },
      { x: 580, y: 410, type: 'shadow_beast' },
      { x: 840, y: 410, type: 'asura_scout' },
      { x: 1040, y: 410, type: 'shadow_beast' },
      { x: 1250, y: 410, type: 'shadow_beast' },
      { x: 1480, y: 410, type: 'asura_scout' },
      { x: 1600, y: 410, type: 'shadow_beast' }
    ],
    collectibles: [
      { x: 280, y: 320, type: 'modak' }, { x: 510, y: 250, type: 'coin' },
      { x: 740, y: 320, type: 'modak' }, { x: 990, y: 250, type: 'coin' },
      { x: 1250, y: 320, type: 'modak' }, { x: 1490, y: 260, type: 'coin' }
    ],
    altars: [{ x: 850, y: 406, isGoal: false }, { x: 1720, y: 406, isGoal: true }],
    goalX: 1720,
    completionStory: "Unflinching against the howling shadow beasts, Lord Ganesha calms the beastly frenzy with pure divine authority."
  },
  {
    levelNum: 13, chapter: 2, title: "Assault on Twin Bridges", theme: "fortress",
    speaker: "Fortress Commander", avatar: "🦅",
    story: "Twin fortified wooden bridges cross a bottomless volcanic gorge. Corrupted Wisps hover in the skies above while Asura sentinels guard the narrow planks.",
    mission: "Engage airborne and ground enemies simultaneously! Jump to banish flying Corrupted Wisps before tackling bridge defenders.",
    tutorialText: "Flying Corrupted Wisps strike from above! Leap and swing your Gada in mid-air to dispel them.",
    platforms: [
      { x: 0, y: 460, width: 340, height: 80 },
      { x: 400, y: 430, width: 440, height: 24 },
      { x: 890, y: 460, width: 280, height: 80 },
      { x: 1220, y: 430, width: 440, height: 24 },
      { x: 1710, y: 460, width: 300, height: 80 },
      { x: 480, y: 330, width: 120, height: 18 },
      { x: 680, y: 330, width: 120, height: 18 },
      { x: 1300, y: 330, width: 120, height: 18 },
      { x: 1500, y: 330, width: 120, height: 18 }
    ],
    rivers: [
      { x: 340, y: 510, width: 60, height: 40, type: 'chasm' },
      { x: 840, y: 510, width: 50, height: 40, type: 'chasm' },
      { x: 1170, y: 510, width: 50, height: 40, type: 'chasm' },
      { x: 1660, y: 510, width: 50, height: 40, type: 'chasm' }
    ],
    enemies: [
      { x: 520, y: 250, type: 'corrupted_wisp' },
      { x: 740, y: 220, type: 'corrupted_wisp' },
      { x: 1350, y: 250, type: 'corrupted_wisp' },
      { x: 1540, y: 220, type: 'corrupted_wisp' },
      { x: 550, y: 380, type: 'asura_patrol', patrolMinX: 410, patrolMaxX: 810 },
      { x: 980, y: 410, type: 'asura_scout' },
      { x: 1040, y: 410, type: 'asura_grunt' },
      { x: 1380, y: 380, type: 'asura_patrol', patrolMinX: 1230, patrolMaxX: 1630 }
    ],
    collectibles: [
      { x: 220, y: 410, type: 'modak' }, { x: 540, y: 280, type: 'coin' },
      { x: 740, y: 280, type: 'modak' }, { x: 1020, y: 410, type: 'coin' },
      { x: 1360, y: 280, type: 'modak' }, { x: 1560, y: 280, type: 'coin' }
    ],
    altars: [{ x: 960, y: 406, isGoal: false }, { x: 1850, y: 406, isGoal: true }],
    goalX: 1850,
    completionStory: "Both skies and bridges are cleansed of corrupting shadows as Lord Ganesha's sacred golden glow illuminates the abyss."
  },
  {
    levelNum: 14, chapter: 2, title: "Fortress of Iron Asuras", theme: "fortress",
    speaker: "Palace Sentinel", avatar: "🛡️",
    story: "The monolithic iron fortress gates loom ahead. Clad in impenetrable enchanted black plate, heavy Armored Asuras stand like living walls!",
    mission: "Confront high-defense Armored Asuras! Their armor shrugs off light hits. Land sustained combo strikes and monitor their visible health bars.",
    tutorialText: "Armored Asuras have high health and damage resistance! Keep your distance between strikes and deplete their health bars.",
    platforms: [
      { x: 0, y: 460, width: 1950, height: 80 },
      { x: 260, y: 370, width: 160, height: 20 },
      { x: 520, y: 290, width: 220, height: 20 },
      { x: 860, y: 360, width: 160, height: 20 },
      { x: 1140, y: 290, width: 220, height: 20 },
      { x: 1480, y: 360, width: 180, height: 20 }
    ],
    enemies: [
      { x: 420, y: 405, type: 'armored_asura' },
      { x: 620, y: 240, type: 'asura_patrol', patrolMinX: 530, patrolMaxX: 720 },
      { x: 780, y: 410, type: 'asura_scout' },
      { x: 1040, y: 405, type: 'armored_asura' },
      { x: 1240, y: 240, type: 'asura_patrol', patrolMinX: 1150, patrolMaxX: 1340 },
      { x: 1420, y: 410, type: 'asura_scout' },
      { x: 1600, y: 405, type: 'armored_asura' }
    ],
    collectibles: [
      { x: 200, y: 410, type: 'modak' }, { x: 340, y: 320, type: 'coin' },
      { x: 630, y: 240, type: 'modak' }, { x: 940, y: 310, type: 'coin' },
      { x: 1250, y: 240, type: 'modak' }, { x: 1570, y: 310, type: 'coin' },
      { x: 1750, y: 410, type: 'modak' }
    ],
    altars: [{ x: 900, y: 406, isGoal: false }, { x: 1820, y: 406, isGoal: true }],
    goalX: 1820,
    completionStory: "The colossal iron armor crumbles before Ganesha's divine strength! The fortress gates swing wide open."
  },
  {
    levelNum: 15, chapter: 2, title: "The Crucible of Shadows", theme: "fortress",
    speaker: "High Rishi", avatar: "🔮",
    story: "Within the subterranean magma caldera, sinister Dark Sorcerers chant ancient curses behind elite lines of Armored Champions and Shadow Beasts. The final gauntlet before the throne!",
    mission: "A test of supreme mastery! Evade homing dark sorcery bolts while neutralizing armored warriors and swift beasts across 3 defensive sectors. 2 Mid-level checkpoints aid your march!",
    tutorialText: "Dark Sorcerers cast ranged magic missiles! Dodge or jump over incoming spells and close the distance rapidly.",
    platforms: [
      { x: 0, y: 460, width: 750, height: 80 },
      { x: 800, y: 460, width: 650, height: 80 },
      { x: 1500, y: 460, width: 650, height: 80 },
      { x: 260, y: 370, width: 140, height: 20 },
      { x: 480, y: 290, width: 160, height: 20 },
      { x: 920, y: 370, width: 160, height: 20 },
      { x: 1180, y: 300, width: 180, height: 20 },
      { x: 1600, y: 360, width: 160, height: 20 },
      { x: 1820, y: 290, width: 160, height: 20 }
    ],
    enemies: [
      { x: 380, y: 410, type: 'shadow_beast' },
      { x: 540, y: 240, type: 'dark_sorcerer' },
      { x: 620, y: 405, type: 'armored_asura' },
      { x: 900, y: 410, type: 'shadow_beast' },
      { x: 1040, y: 410, type: 'asura_patrol', patrolMinX: 840, patrolMaxX: 1200 },
      { x: 1260, y: 250, type: 'dark_sorcerer' },
      { x: 1380, y: 405, type: 'armored_asura' },
      { x: 1650, y: 410, type: 'shadow_beast' },
      { x: 1750, y: 410, type: 'asura_patrol', patrolMinX: 1550, patrolMaxX: 1950 }
    ],
    collectibles: [
      { x: 180, y: 410, type: 'modak' }, { x: 330, y: 320, type: 'coin' },
      { x: 560, y: 240, type: 'modak' }, { x: 990, y: 320, type: 'coin' },
      { x: 1270, y: 250, type: 'modak' }, { x: 1680, y: 310, type: 'coin' },
      { x: 1900, y: 240, type: 'modak' }
    ],
    altars: [
      { x: 650, y: 406, isGoal: false },
      { x: 1350, y: 406, isGoal: false },
      { x: 2020, y: 406, isGoal: true }
    ],
    goalX: 2020,
    completionStory: "Through the blazing crucible of dark spells and shadow steel, Lord Ganesha emerges unbroken! The inner sanctum of the Warlord is at hand."
  },
  {
    levelNum: 16, chapter: 2, title: "Clash with the Asura Warlord", theme: "fortress",
    speaker: "Asura Warlord Krodhasura", avatar: "👹",
    story: "Chapter 2 Mini-Boss Finale! Krodhasura, the ferocious Asura Warlord, towers in his throne hall. Wielding a massive obsidian greatsword, he unleashes ground shockwaves, charging cleaves, and summons asura scouts in desperation!",
    mission: "Mini-Boss Battle: Defeat Asura Warlord Krodhasura (380 HP)! Leap over his ground shockwaves, dodge heavy charges, strike during vulnerable recoveries, and purge the darkness to unlock Chapter 3!",
    tutorialText: "⚔️ MINI-BOSS FINALE: Dodge Krodhasura's ground shockwaves and charge attacks! Strike repeatedly with [J]/[⚔] to claim victory!",
    platforms: [
      { x: 0, y: 460, width: 1400, height: 80 },
      { x: 220, y: 360, width: 160, height: 20 },
      { x: 500, y: 280, width: 220, height: 20 },
      { x: 820, y: 360, width: 160, height: 20 },
      { x: 1080, y: 280, width: 180, height: 20 }
    ],
    boss: { x: 950, y: 370, maxHp: 380 },
    bossType: 'asura_warlord',
    collectibles: [
      { x: 290, y: 310, type: 'modak' }, { x: 600, y: 230, type: 'coin' },
      { x: 890, y: 310, type: 'modak' }, { x: 1160, y: 230, type: 'coin' }
    ],
    altars: [{ x: 140, y: 406, isGoal: false }],
    goalX: 9999,
    completionStory: "✨ CHAPTER 2 COMPLETE! Asura Warlord Krodhasura is vanquished! The sacred mountain is saved and celestial gates open! Chapter 3: The Divine Adventure is now UNLOCKED!"
  },

  // =========================================================================
  // ✨ CHAPTER 3 — THE DIVINE ADVENTURE (Levels 17 to 24)
  // =========================================================================
  {
    levelNum: 17, chapter: 3, title: "Cloud Kingdom", theme: "cosmic_journey",
    speaker: "Celestial Guide", avatar: "☁️",
    story: "Welcome to the heavenly celestial realm! Shimmering cloud kingdoms float above starry nebulae and golden planetary rings.",
    mission: "Leap across soft puffy cloud platforms! Falling through clouds loses a life. Collect celestial stars and golden modaks!",
    tutorialText: "Welcome to Chapter 3! Jump across floating clouds. Don't fall into the celestial mist!",
    platforms: [
      { x: 0, y: 460, width: 300, height: 80 },
      { x: 1450, y: 460, width: 400, height: 80 }
    ],
    clouds: [
      { x: 340, y: 390, width: 130, height: 24 },
      { x: 520, y: 320, width: 140, height: 24 },
      { x: 720, y: 370, width: 140, height: 24 },
      { x: 920, y: 300, width: 150, height: 24 },
      { x: 1140, y: 360, width: 140, height: 24 },
      { x: 1320, y: 410, width: 130, height: 24 }
    ],
    collectibles: [
      { x: 200, y: 410, type: 'star' }, { x: 400, y: 340, type: 'modak' },
      { x: 580, y: 270, type: 'star' }, { x: 780, y: 320, type: 'modak' },
      { x: 980, y: 250, type: 'star' }, { x: 1200, y: 310, type: 'modak' },
      { x: 1550, y: 410, type: 'modak' }
    ],
    altars: [{ x: 780, y: 326, isGoal: false }, { x: 1700, y: 406, isGoal: true }],
    goalX: 1700,
    completionStory: "Lord Ganesha dances across the fluffy white clouds, laughing as starlight sparkles beneath his lotus feet."
  },
  {
    levelNum: 18, chapter: 3, title: "Floating Islands", theme: "cosmic_journey",
    speaker: "Starlight Deva", avatar: "🪐",
    story: "Floating celestial islands drift freely through the cosmic expanse. Fast moving platforms bridge the vast abysses between islands.",
    mission: "Navigate multiple floating islands! Time your leaps across moving platforms and clear large heavenly gaps.",
    tutorialText: "Carefully time your jumps across moving platforms over the wide cosmic gaps!",
    platforms: [
      { x: 0, y: 460, width: 350, height: 80 },
      { x: 650, y: 420, width: 320, height: 60 },
      { x: 1300, y: 440, width: 450, height: 80 }
    ],
    movingPlatforms: [
      { x: 380, y: 380, width: 120, height: 18, moveX: 70, moveY: 0, speed: 0.035 },
      { x: 1020, y: 360, width: 120, height: 18, moveX: 70, moveY: 0, speed: 0.04 }
    ],
    clouds: [
      { x: 740, y: 300, width: 140, height: 24 }
    ],
    collectibles: [
      { x: 220, y: 410, type: 'modak' }, { x: 440, y: 330, type: 'star' },
      { x: 720, y: 370, type: 'modak' }, { x: 800, y: 250, type: 'star' },
      { x: 1080, y: 310, type: 'modak' }, { x: 1420, y: 390, type: 'modak' }
    ],
    altars: [{ x: 800, y: 366, isGoal: false }, { x: 1650, y: 386, isGoal: true }],
    goalX: 1650,
    completionStory: "Island by island, Lord Ganesha soars across the heavens toward the grand Celestial Sanctuary."
  },
  {
    levelNum: 19, chapter: 3, title: "Magical Gates", theme: "peacock_realm",
    speaker: "Kartikeya", avatar: "🦚",
    story: "Three glowing gates — Sun Gate, Moon Gate, and Star Gate — guard the passage to the higher cosmic spheres.",
    mission: "Find the hidden celestial keys to unlock the magical gates and uncover the true path onward!",
    tutorialText: "Collect the glowing celestial keys to unlock all 3 Magical Gates!",
    platforms: [
      { x: 0, y: 460, width: 1800, height: 80 },
      { x: 240, y: 360, width: 140, height: 20 },
      { x: 520, y: 280, width: 160, height: 20 },
      { x: 800, y: 350, width: 160, height: 20 },
      { x: 1080, y: 280, width: 160, height: 20 },
      { x: 1360, y: 350, width: 160, height: 20 }
    ],
    keys: [
      { x: 300, y: 310, keyId: 1 },
      { x: 860, y: 300, keyId: 2 },
      { x: 1420, y: 300, keyId: 3 }
    ],
    gates: [
      { x: 660, y: 340, width: 24, height: 120, id: 1 },
      { x: 1220, y: 340, width: 24, height: 120, id: 2 },
      { x: 1560, y: 340, width: 24, height: 120, id: 3 }
    ],
    collectibles: [
      { x: 200, y: 410, type: 'modak' }, { x: 590, y: 230, type: 'star' },
      { x: 960, y: 410, type: 'modak' }, { x: 1140, y: 230, type: 'star' },
      { x: 1480, y: 410, type: 'modak' }
    ],
    altars: [{ x: 740, y: 406, isGoal: false }, { x: 1720, y: 406, isGoal: true }],
    goalX: 1720, requiredKeys: 3,
    completionStory: "The Sun, Moon, and Star gates unlock in radiant synchrony, revealing the glowing Mandakini sky river."
  },
  {
    levelNum: 20, chapter: 3, title: "Divine River", theme: "divine_kingdom",
    speaker: "Goddess Ganga", avatar: "✨",
    story: "The sacred sky river Mandakini flows through the cosmos like a ribbon of liquid starlight and liquid gold.",
    mission: "Ride magical crystal platforms across the flowing sky river, dodge drifting stardust obstacles, and collect divine crystals!",
    tutorialText: "Leap across floating crystal platforms! Collect divine crystals and stay out of the river.",
    platforms: [
      { x: 0, y: 460, width: 320, height: 80 },
      { x: 420, y: 420, width: 90, height: 40 },
      { x: 620, y: 380, width: 140, height: 20 },
      { x: 1180, y: 410, width: 90, height: 40 },
      { x: 1340, y: 460, width: 500, height: 80 }
    ],
    rivers: [
      { x: 320, y: 470, width: 1020, height: 70, type: 'sky' }
    ],
    movingPlatforms: [
      { x: 820, y: 340, width: 130, height: 18, moveX: 80, moveY: 0, speed: 0.035 }
    ],
    collectibles: [
      { x: 220, y: 410, type: 'crystal' }, { x: 460, y: 370, type: 'modak' },
      { x: 680, y: 330, type: 'crystal' }, { x: 880, y: 290, type: 'star' },
      { x: 1220, y: 360, type: 'crystal' }, { x: 1460, y: 410, type: 'modak' }
    ],
    altars: [{ x: 680, y: 326, isGoal: false }, { x: 1720, y: 406, isGoal: true }],
    goalX: 1720,
    completionStory: "Pure celestial waters bathe Ganesha's path in eternal peace as the grand golden palace of the heavens comes into view."
  },
  {
    levelNum: 21, chapter: 3, title: "Temple in the Sky", theme: "divine_kingdom",
    speaker: "Indra", avatar: "🏛️",
    story: "A colossal golden temple floats atop the highest clouds with interconnected sanctums, golden statues, and secret chambers.",
    mission: "Explore the vast heavenly temple, discover keys to unlock sacred chambers, and find secret vaults filled with modaks!",
    tutorialText: "Explore the multi-room Sky Temple! Find keys to open doors and discover hidden modak vaults.",
    platforms: [
      { x: 0, y: 460, width: 1900, height: 80 },
      { x: 220, y: 360, width: 150, height: 20 },
      { x: 480, y: 280, width: 180, height: 20 },
      { x: 760, y: 350, width: 160, height: 20 },
      { x: 1040, y: 270, width: 180, height: 20 },
      { x: 1320, y: 350, width: 160, height: 20 },
      { x: 1560, y: 270, width: 180, height: 20 }
    ],
    keys: [{ x: 560, y: 230, keyId: 1 }],
    gates: [{ x: 1260, y: 340, width: 24, height: 120, id: 1 }],
    collectibles: [
      { x: 280, y: 310, type: 'modak' }, { x: 520, y: 230, type: 'modak' },
      { x: 820, y: 300, type: 'crystal' }, { x: 1100, y: 220, type: 'modak' },
      { x: 1380, y: 300, type: 'modak' }, { x: 1620, y: 220, type: 'star' }
    ],
    altars: [{ x: 840, y: 406, isGoal: false }, { x: 1820, y: 406, isGoal: true }],
    goalX: 1820,
    completionStory: "The heavenly temple chambers resonate with divine conch shells as the Final Trials commence."
  },
  {
    levelNum: 22, chapter: 3, title: "Final Trial", theme: "divine_race_track",
    speaker: "Trimurti Devas", avatar: "⚔️",
    story: "The ultimate trial gauntlet tests every skill mastered across the entire journey: moving platforms, timed spikes, puzzles, and guardians.",
    mission: "Overcome the supreme gauntlet! Combine precision platforming, dodging, and swift reflexes to reach the divine gate.",
    tutorialText: "High Difficulty! Moving platforms, falling stardust, and sentinels combine in this ultimate gauntlet!",
    platforms: [
      { x: 0, y: 460, width: 400, height: 80 },
      { x: 600, y: 460, width: 400, height: 80 },
      { x: 1200, y: 460, width: 700, height: 80 },
      { x: 180, y: 360, width: 140, height: 20 },
      { x: 700, y: 350, width: 140, height: 20 },
      { x: 1300, y: 350, width: 140, height: 20 }
    ],
    movingPlatforms: [
      { x: 430, y: 370, width: 120, height: 18, moveX: 60, moveY: 0, speed: 0.04 },
      { x: 1040, y: 360, width: 120, height: 18, moveX: 60, moveY: 0, speed: 0.04 }
    ],
    traps: [
      { x: 260, y: 442, width: 32, height: 18, type: 'chakra' },
      { x: 800, y: 442, width: 32, height: 18, type: 'chakra' },
      { x: 1450, y: 442, width: 32, height: 18, type: 'spikes' }
    ],
    enemies: [
      { x: 300, y: 410, type: 'wisp' }, { x: 740, y: 410, type: 'gana' }, { x: 1400, y: 410, type: 'gana' }
    ],
    collectibles: [
      { x: 230, y: 310, type: 'modak' }, { x: 750, y: 300, type: 'crystal' },
      { x: 1350, y: 300, type: 'star' }, { x: 1600, y: 410, type: 'modak' }
    ],
    altars: [{ x: 750, y: 406, isGoal: false }, { x: 1800, y: 406, isGoal: true }],
    goalX: 1800,
    completionStory: "Flawlessly conquering the divine gauntlet, Lord Ganesha stands ready before the sacred gates of Mount Kailash."
  },
  {
    levelNum: 23, chapter: 3, title: "Ganesha's Divine Challenge", theme: "divine_kingdom",
    speaker: "Trimurti", avatar: "🕉️",
    story: "A very difficult cosmic trial across a grand celestial arena. Only by collecting the 5 Divine Sacred Symbols can the final gateway open.",
    mission: "Collect all 5 Divine Symbols: 1. ॐ (Om), 2. 🔱 (Trishul), 3. 🌺 (Lotus), 4. 🐚 (Shankha), 5. 🪔 (Diya) to unlock the finale gate!",
    tutorialText: "Collect all 5 Divine Symbols (ॐ, 🔱, 🌺, 🐚, 🪔) to unlock the final gate!",
    platforms: [
      { x: 0, y: 460, width: 2200, height: 80 },
      { x: 240, y: 360, width: 140, height: 20 },
      { x: 500, y: 280, width: 160, height: 20 },
      { x: 780, y: 350, width: 160, height: 20 },
      { x: 1060, y: 270, width: 160, height: 20 },
      { x: 1340, y: 350, width: 160, height: 20 },
      { x: 1620, y: 270, width: 160, height: 20 },
      { x: 1880, y: 350, width: 160, height: 20 }
    ],
    divineSymbols: [
      { x: 300, y: 310, symbolId: 1, label: 'ॐ' },
      { x: 560, y: 230, symbolId: 2, label: '🔱' },
      { x: 840, y: 300, symbolId: 3, label: '🌺' },
      { x: 1120, y: 220, symbolId: 4, label: '🐚' },
      { x: 1400, y: 300, symbolId: 5, label: '🪔' }
    ],
    gates: [
      { x: 1800, y: 340, width: 24, height: 120, id: 55 }
    ],
    collectibles: [
      { x: 400, y: 410, type: 'modak' }, { x: 950, y: 410, type: 'modak' },
      { x: 1500, y: 410, type: 'modak' }, { x: 1980, y: 410, type: 'crystal' }
    ],
    altars: [{ x: 950, y: 406, isGoal: false }, { x: 2100, y: 406, isGoal: true }],
    goalX: 2100, requiredSymbols: 5,
    completionStory: "All 5 Divine Symbols ignite with blinding golden radiance! The final gate opens onto the Supreme Cosmic Throne."
  },
  {
    levelNum: 24, chapter: 3, title: "THE GRAND DIVINE FINALE", theme: "sacred_circle",
    speaker: "Lord Shiva & Parvati", avatar: "🕉️", hasPostCutscene: true,
    story: "THE GRAND FINALE! Before the radiant golden thrones of Lord Shiva and Goddess Parvati, Lord Ganesha completes the ultimate divine journey of devotion, wisdom, and victory.",
    mission: "Grand Finale: Overcome the final obstacle sequence, claim the Supreme Golden Modak, and reach the Throne of Blessings!",
    tutorialText: "The Grand Finale! Collect the Supreme Golden Modak and reach the Throne of Blessings!",
    platforms: [
      { x: 0, y: 460, width: 1600, height: 80 },
      { x: 200, y: 370, width: 150, height: 20 },
      { x: 440, y: 300, width: 160, height: 20 },
      { x: 720, y: 360, width: 160, height: 20 },
      { x: 1000, y: 300, width: 180, height: 20 },
      { x: 1260, y: 360, width: 160, height: 20 }
    ],
    clouds: [
      { x: 340, y: 340, width: 110, height: 24 },
      { x: 620, y: 330, width: 110, height: 24 },
      { x: 900, y: 330, width: 110, height: 24 }
    ],
    collectibles: [
      { x: 260, y: 320, type: 'modak' }, { x: 500, y: 250, type: 'star' },
      { x: 780, y: 310, type: 'crystal' }, { x: 1060, y: 250, type: 'modak' },
      { x: 1320, y: 310, type: 'modak' },
      { x: 1450, y: 410, type: 'modak' } // Supreme Golden Modak
    ],
    altars: [{ x: 1480, y: 406, isGoal: true }],
    goalX: 1480,
    cutsceneDialogue: "Lord Shiva and Mother Parvati shower golden flowers upon Lord Ganesha: 'Beloved son, through your purity, wisdom, courage, and devotion, you have enlightened all three worlds! Henceforth, you shall be worshiped first in all sacred beginnings. Every obstacle shall dissolve before your name.' All the Devas and Ganas chant in joyful ecstasy: 'Ganapati Bappa Morya!'",
    completionStory: "🪔 CONGRATULATIONS! You have completed all 24 levels across all 3 chapters of Ganesha: The Divine Adventure!"
  }
];

// ==========================================================================
// 7. MAIN GAME ENGINE & STATE MANAGER
// ==========================================================================
class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.cutsceneCanvas = document.getElementById('cutsceneCanvas');
    this.cutsceneCtx = this.cutsceneCanvas.getContext('2d');
    this.transformCanvas = document.getElementById('ganeshaTransformCanvas');
    this.transformCtx = this.transformCanvas.getContext('2d');
    this.c2Canvas = document.getElementById('chapter2FinaleCanvas');
    this.c2Ctx = this.c2Canvas ? this.c2Canvas.getContext('2d') : null;
    this.c3Canvas = document.getElementById('chapter3FinaleCanvas');
    this.c3Ctx = this.c3Canvas ? this.c3Canvas.getContext('2d') : null;

    this.input = new InputHandler();
    this.particles = new ParticleSystem();
    this.bg = new BackgroundRenderer();

    this.currentLevelIndex = 0;
    this.unlockedLevels = 1;
    this.activeChapterTab = 1;
    this.score = 0;
    this.levelScore = 0;
    this.lives = 3;
    this.maxLives = 3;
    this.levelStars = {};
    this.levelStartTime = Date.now();
    this.enemiesDefeated = 0;
    this.modaksCollected = 0;
    this.lotusOrbsCollected = 0;
    this.starsCollected = 0;
    this.coinsCollected = 0;
    this.flowersCollected = 0;
    this.crystalsCollected = 0;

    // Puzzle & Mechanics tracking
    this.wisdomCollectedCount = 0;
    this.bellsRungCount = 0;
    this.keysCollected = 0;
    this.divineSymbolsCollected = 0;
    this.lotusSwitchesActive = 0;

    // Countdown state
    this.isCountingDown = false;

    this.cameraX = 0;
    this.checkpoint = { x: 60, y: 380 };
    this.isInMainMenu = true;
    this.isPaused = true;
    this.inModal = false;

    this.player = new Player(60, 380);
    this.platforms = [];
    this.movingPlatforms = [];
    this.rivers = [];
    this.bells = [];
    this.clouds = [];
    this.keys = [];
    this.divineSymbols = [];
    this.traps = [];
    this.elephantGuardian = null;
    this.enemies = [];
    this.boss = null;
    this.rival = null;
    this.boostPads = [];
    this.fallingRocks = [];
    this.wisdomSymbols = [];
    this.projectiles = [];
    this.collectibles = [];
    this.altars = [];
    this.switches = [];
    this.gates = [];
    this.defenseTarget = null;

    // Devotee Profile & Leaderboard
    this.playerName = 'Devotee';
    this.playerAvatar = '🐘';
    this.leaderboardData = [];
    this.welcomeParticlesInitialized = false;
    this.introParticlesInitialized = false;
    this.introFinished = false;
    this.introTimers = [];
    this.vibrationEnabled = true;

    // Daily Divine Reward System (7-Day Calendar)
    this.dailyRewardsList = [
      { day: 1, title: '50 Coins', coins: 50, gems: 0, icon: '⭐', desc: '+50 Sacred Coins added to your treasury!' },
      { day: 2, title: '100 Coins', coins: 100, gems: 0, icon: '⭐', desc: '+100 Sacred Coins added to your treasury!' },
      { day: 3, title: 'Special Reward', coins: 120, gems: 1, icon: '🎁', desc: 'Special Blessing: 120 Coins + 1 Divine Elixir (+150 Score)!' },
      { day: 4, title: '150 Coins', coins: 150, gems: 0, icon: '⭐', desc: '+150 Sacred Coins added to your treasury!' },
      { day: 5, title: '1 Gem', coins: 100, gems: 1, icon: '💎', desc: '+1 Divine Gem (+200 Score) added to your treasury!' },
      { day: 6, title: '250 Coins', coins: 250, gems: 0, icon: '⭐', desc: '+250 Sacred Coins added to your treasury!' },
      { day: 7, title: 'Divine Chest', coins: 500, gems: 2, icon: '👑', desc: '👑 Supreme Divine Blessing: +500 Coins & 2 Celestial Gems!' }
    ];
    this.dailyStreak = 1;
    this.lastClaimDate = null;
    this.claimedDays = [];
    this.rewardTimerInterval = null;

    // Divine Avatars & Skin Customization System
    this.divineSkins = DIVINE_SKINS;
    this.selectedSkin = 'classic';
    this.unlockedSkins = ['classic'];
    this.wardrobePreviewSkin = 'classic';
    this.wardrobePreviewAnimTimer = null;
    this.wardrobeWalkCycle = 0;

    // Load persisted progress, profile, settings, leaderboard & daily rewards
    this.loadProgress();
    this.loadProfile();
    this.loadLeaderboard();
    this.loadSettings();
    this.loadDailyRewards();
    this.loadSkins();

    this.bindUI();
    this.initLevelGrid();
    this.initIntroParticles();
    this.initWelcomeParticles();
    this.initMenuParticles();
    this.updateProfileUI();
    this.updateWelcomeGreeting();
    this.updateDailyRewardUI();
    this.startDailyRewardTimer();
    this.loadLevel(0);

    // Initial screens: show cinematic-intro-screen on first boot, keep others hidden
    const storyModal = document.getElementById('story-modal');
    if (storyModal) storyModal.classList.add('hidden');
    const mainMenu = document.getElementById('main-menu-overlay');
    if (mainMenu) mainMenu.classList.add('hidden');
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) welcomeScreen.classList.add('hidden');

    const introScreen = document.getElementById('cinematic-intro-screen');
    if (introScreen) {
      introScreen.classList.remove('hidden');
      this.playCinematicTitleReveal();
    } else if (welcomeScreen) {
      welcomeScreen.classList.remove('hidden');
    }

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  // Haptic Feedback / Mobile Vibration Helper
  triggerVibrate(pattern = 35) {
    if (this.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (_) {}
    }
  }

  loadSettings() {
    try {
      const vib = localStorage.getItem('ganesha_vibration');
      if (vib !== null) {
        this.vibrationEnabled = vib !== 'false';
      }
    } catch (e) {
      console.warn("Could not load settings:", e);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('ganesha_vibration', this.vibrationEnabled ? 'true' : 'false');
    } catch (e) {
      console.warn("Could not save settings:", e);
    }
  }

  // LocalStorage Persistence
  saveProgress() {
    try {
      const data = {
        unlockedLevels: this.unlockedLevels,
        score: this.score,
        levelStars: this.levelStars
      };
      localStorage.setItem('ganesha_adventure_save', JSON.stringify(data));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }

  loadProgress() {
    try {
      const raw = localStorage.getItem('ganesha_adventure_save');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.unlockedLevels) {
          this.unlockedLevels = Math.max(this.unlockedLevels, data.unlockedLevels);
        }
        if (data.score) {
          this.score = Math.max(this.score, data.score);
        }
        if (data.levelStars) {
          this.levelStars = data.levelStars;
        }
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
  }

  loadProfile() {
    try {
      const savedName = localStorage.getItem('ganesha_player_name');
      const savedAvatar = localStorage.getItem('ganesha_player_avatar');
      if (savedName && savedName.trim()) {
        this.playerName = savedName.trim();
      }
      if (savedAvatar && savedAvatar.trim()) {
        this.playerAvatar = savedAvatar.trim();
      }
    } catch (e) {
      console.warn("Could not load profile from localStorage:", e);
    }
  }

  saveProfile(name, avatar) {
    if (name && name.trim()) {
      this.playerName = name.trim();
    }
    if (avatar && avatar.trim()) {
      this.playerAvatar = avatar.trim();
    }
    try {
      localStorage.setItem('ganesha_player_name', this.playerName);
      localStorage.setItem('ganesha_player_avatar', this.playerAvatar);
    } catch (e) {
      console.warn("Could not save profile to localStorage:", e);
    }
    this.updateProfileUI();
    this.updateProfileDashboardUI();
    this.updateWelcomeGreeting();
    this.recordLeaderboardScore();
  }

  updateWelcomeGreeting() {
    const welcomeGreeting = document.getElementById('welcome-greeting');
    const greetingText = document.getElementById('welcome-greeting-text');
    const hasSavedName = localStorage.getItem('ganesha_player_name');
    if (welcomeGreeting && greetingText) {
      if (hasSavedName && this.playerName && this.playerName !== 'Devotee') {
        welcomeGreeting.classList.remove('hidden');
        greetingText.textContent = `Welcome back, ${this.playerName}! 🙏`;
      } else {
        welcomeGreeting.classList.add('hidden');
      }
    }
  }

  getDivineTitle() {
    if (this.unlockedLevels >= 24) return "👑 Supreme Vinayaka Avatar";
    if (this.unlockedLevels >= 17) return "🌌 Cosmic Kailash Explorer";
    if (this.unlockedLevels >= 9) return "⚔️ Sacred Asura Vanquisher";
    if (this.unlockedLevels >= 5) return "🌺 Kailash Gate Guardian";
    return "🌟 Sacred Devotee";
  }

  getHighestChapterName() {
    if (this.unlockedLevels >= 17) return "Chapter 3: The Divine Adventure";
    if (this.unlockedLevels >= 9) return "Chapter 2: The Divine Battle";
    return "Chapter 1: The Sacred Temple";
  }

  updateProfileUI() {
    const menuName = document.getElementById('menu-player-name');
    if (menuName) menuName.textContent = this.playerName;
    const menuAvatar = document.getElementById('menu-player-avatar');
    if (menuAvatar) menuAvatar.textContent = this.playerAvatar;

    const hudName = document.getElementById('hud-player-name');
    if (hudName) hudName.textContent = this.playerName;
    const hudAvatar = document.getElementById('hud-player-avatar');
    if (hudAvatar) hudAvatar.textContent = this.playerAvatar;

    const bannerName = document.getElementById('banner-player-name');
    if (bannerName) bannerName.textContent = this.playerName;
    const bannerAvatar = document.getElementById('banner-player-avatar');
    if (bannerAvatar) bannerAvatar.textContent = this.playerAvatar;

    const inputName = document.getElementById('player-name-input');
    if (inputName) inputName.value = this.playerName;

    document.querySelectorAll('.avatar-chip').forEach(chip => {
      if (chip.getAttribute('data-avatar') === this.playerAvatar) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  updateProfileDashboardUI() {
    const avatarEl = document.getElementById('dash-avatar-circle');
    if (avatarEl) avatarEl.textContent = this.playerAvatar || '🐘';
    const nameEl = document.getElementById('dash-player-name');
    if (nameEl) nameEl.textContent = this.playerName || 'Devotee';
    const titleEl = document.getElementById('dash-divine-title');
    if (titleEl) titleEl.textContent = this.getDivineTitle();

    const pct = Math.min(100, Math.round((Math.min(24, this.unlockedLevels) / 24) * 100));

    const pctEl = document.getElementById('dash-progress-pct');
    if (pctEl) pctEl.textContent = `${pct}%`;
    const barEl = document.getElementById('dash-progress-bar');
    if (barEl) barEl.style.width = `${Math.max(4, pct)}%`;

    const scoreEl = document.getElementById('dash-total-score');
    if (scoreEl) scoreEl.textContent = this.score.toLocaleString();

    const levelsEl = document.getElementById('dash-levels-completed');
    if (levelsEl) levelsEl.textContent = `${this.unlockedLevels} / 24`;

    let totalStars = 0;
    for (let i = 0; i < 24; i++) {
      if (this.levelStars[i]) totalStars += this.levelStars[i];
    }
    if (totalStars === 0 && this.unlockedLevels > 1) {
      totalStars = (this.unlockedLevels - 1) * 3;
    }
    const starsEl = document.getElementById('dash-stars-earned');
    if (starsEl) starsEl.textContent = `${totalStars} / 72`;

    const currentName = (this.playerName || "Devotee").toLowerCase();
    let playerRank = 1;
    if (this.leaderboardData && this.leaderboardData.length > 0) {
      const foundRankIdx = this.leaderboardData.findIndex(item => item.name.toLowerCase() === currentName);
      if (foundRankIdx >= 0) playerRank = foundRankIdx + 1;
    }
    const rankEl = document.getElementById('dash-leaderboard-rank');
    if (rankEl) rankEl.textContent = `#${playerRank}`;

    const chapEl = document.getElementById('dash-highest-chapter');
    if (chapEl) chapEl.textContent = this.getHighestChapterName();
  }

  openProfileDashboard() {
    sounds.playClick();
    this.updateProfileDashboardUI();
    document.getElementById('settings-modal').classList.add('hidden');
    document.getElementById('player-profile-modal').classList.add('hidden');
    document.getElementById('leaderboard-modal').classList.add('hidden');
    document.getElementById('profile-dashboard-modal').classList.remove('hidden');
    this.inModal = true;
  }

  // ========================================================================
  // 🎁 DAILY DIVINE REWARD SYSTEM LOGIC & PERSISTENCE
  // ========================================================================
  getTodayDateString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getYesterdayDateString() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  loadDailyRewards() {
    try {
      const savedStreak = parseInt(localStorage.getItem('ganesha_daily_streak'), 10);
      if (!isNaN(savedStreak) && savedStreak >= 1 && savedStreak <= 7) {
        this.dailyStreak = savedStreak;
      } else {
        this.dailyStreak = 1;
      }
      this.lastClaimDate = localStorage.getItem('ganesha_last_claim_date') || null;
      const savedClaimed = localStorage.getItem('ganesha_claimed_days');
      if (savedClaimed) {
        this.claimedDays = JSON.parse(savedClaimed) || [];
      } else {
        this.claimedDays = [];
      }

      // Check if streak was broken (missed more than yesterday)
      const today = this.getTodayDateString();
      const yesterday = this.getYesterdayDateString();
      if (this.lastClaimDate && this.lastClaimDate !== today && this.lastClaimDate !== yesterday) {
        // More than 1 day missed: reset streak back to 1 for a fresh cycle
        this.dailyStreak = 1;
        this.claimedDays = [];
        this.saveDailyRewards();
      }
    } catch (e) {
      console.warn("Could not load daily rewards:", e);
    }
  }

  saveDailyRewards() {
    try {
      localStorage.setItem('ganesha_daily_streak', String(this.dailyStreak));
      if (this.lastClaimDate) {
        localStorage.setItem('ganesha_last_claim_date', this.lastClaimDate);
      }
      localStorage.setItem('ganesha_claimed_days', JSON.stringify(this.claimedDays));
    } catch (e) {
      console.warn("Could not save daily rewards:", e);
    }
  }

  isDailyRewardAvailable() {
    const today = this.getTodayDateString();
    return this.lastClaimDate !== today;
  }

  getCurrentRewardDay() {
    return Math.min(7, Math.max(1, this.dailyStreak));
  }

  updateDailyRewardUI() {
    const isAvailable = this.isDailyRewardAvailable();
    const currentDay = this.getCurrentRewardDay();

    // 1. Update Alert Badges on Buttons
    const menuBadge = document.getElementById('menu-reward-badge');
    if (menuBadge) {
      if (isAvailable) menuBadge.classList.remove('hidden');
      else menuBadge.classList.add('hidden');
    }

    // 2. Update 7-Day Grid Cards
    for (let day = 1; day <= 7; day++) {
      const cardEl = document.getElementById(`reward-day-${day}`);
      const statusEl = document.getElementById(`reward-status-${day}`);
      if (!cardEl || !statusEl) continue;

      cardEl.classList.remove('active-today', 'claimed', 'locked');

      if (this.claimedDays.includes(day)) {
        cardEl.classList.add('claimed');
        statusEl.textContent = 'CLAIMED ✓';
      } else if (day === currentDay && isAvailable) {
        cardEl.classList.add('active-today');
        statusEl.textContent = 'CLAIM NOW!';
      } else {
        cardEl.classList.add('locked');
        statusEl.textContent = day < currentDay ? 'EXPIRED' : 'LOCKED';
      }
    }

    // 3. Update Claim Button
    const claimBtn = document.getElementById('btn-claim-daily-reward');
    if (claimBtn) {
      if (isAvailable) {
        claimBtn.disabled = false;
        claimBtn.classList.add('pulse');
        claimBtn.innerHTML = `<span class="btn-icon">🎁</span><span class="btn-text">CLAIM DAY ${currentDay} BLESSING!</span>`;
      } else {
        claimBtn.disabled = true;
        claimBtn.classList.remove('pulse');
        claimBtn.innerHTML = `<span class="btn-icon">✓</span><span class="btn-text">TODAY'S BLESSING CLAIMED</span>`;
      }
    }

    // 4. Update Status Banner
    const banner = document.getElementById('reward-status-banner');
    const timerText = document.getElementById('reward-timer-text');
    if (banner && timerText) {
      if (isAvailable) {
        banner.classList.add('ready');
        timerText.textContent = `Day ${currentDay} Blessing is Ready to Claim! 🙏`;
      } else {
        banner.classList.remove('ready');
        this.updateDailyRewardTimer();
      }
    }
  }

  updateDailyRewardTimer() {
    const isAvailable = this.isDailyRewardAvailable();
    const timerText = document.getElementById('reward-timer-text');
    if (!timerText) return;

    if (isAvailable) {
      const currentDay = this.getCurrentRewardDay();
      timerText.textContent = `Day ${currentDay} Blessing is Ready to Claim! 🙏`;
      return;
    }

    // Compute remaining time until next local midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const diffMs = tomorrow.getTime() - now.getTime();

    if (diffMs <= 0) {
      // Midnight reached!
      this.updateDailyRewardUI();
      return;
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

    timerText.textContent = `Next blessing in: ${hours}h ${mins}m ${secs}s`;
  }

  startDailyRewardTimer() {
    if (this.rewardTimerInterval) clearInterval(this.rewardTimerInterval);
    this.rewardTimerInterval = setInterval(() => {
      this.updateDailyRewardTimer();
    }, 1000);
  }

  openDailyRewardModal() {
    sounds.playClick();
    this.updateDailyRewardUI();
    document.getElementById('settings-modal').classList.add('hidden');
    document.getElementById('player-profile-modal').classList.add('hidden');
    document.getElementById('profile-dashboard-modal').classList.add('hidden');
    document.getElementById('leaderboard-modal').classList.add('hidden');
    document.getElementById('daily-reward-modal').classList.remove('hidden');
    this.inModal = true;
  }

  claimDailyReward() {
    if (!this.isDailyRewardAvailable()) return;

    const currentDay = this.getCurrentRewardDay();
    const reward = this.dailyRewardsList.find(r => r.day === currentDay) || this.dailyRewardsList[0];

    // Mark today as claimed
    const today = this.getTodayDateString();
    this.lastClaimDate = today;
    if (!this.claimedDays.includes(currentDay)) {
      this.claimedDays.push(currentDay);
    }

    // Advance streak for next day (cycles after Day 7)
    if (this.dailyStreak >= 7) {
      this.dailyStreak = 1;
      this.claimedDays = [];
    } else {
      this.dailyStreak += 1;
    }

    // Add reward to player score and coins
    const coinsToAdd = reward.coins || 0;
    const gemsScore = (reward.gems || 0) * 200;
    const totalBonusScore = coinsToAdd + gemsScore;

    this.coins = (this.coins || 0) + coinsToAdd;
    this.score = (this.score || 0) + totalBonusScore;

    this.saveDailyRewards();
    this.saveProgress();
    this.updateHUD();
    this.updateDailyRewardUI();
    this.recordLeaderboardScore();

    // Play Divine Audio & Haptic Feedback
    sounds.playCollect();
    sounds.playTempleBell(1046.50);
    sounds.playTitleChime();
    this.triggerVibrate([40, 60, 80]);

    // Show celebration popup
    this.showRewardCelebration(reward);
  }

  showRewardCelebration(reward) {
    const modal = document.getElementById('reward-celebration-modal');
    if (!modal) return;

    const valEl = document.getElementById('reward-burst-value');
    if (valEl) {
      valEl.textContent = reward.gems > 0 ? `+${reward.coins} Coins & ${reward.gems} Gem!` : `+${reward.coins} Coins!`;
    }

    const descEl = document.getElementById('reward-desc-text');
    if (descEl) {
      descEl.textContent = reward.desc || "Added to your Sacred Treasury!";
    }

    const chestIcon = document.getElementById('chest-icon');
    if (chestIcon) {
      chestIcon.textContent = reward.icon || '🎁';
    }

    modal.classList.remove('hidden');
    this.initRewardParticles();
  }

  initRewardParticles() {
    const canvas = document.getElementById('rewardParticlesCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement.offsetWidth || 400;
    canvas.height = canvas.parentElement.offsetHeight || 300;

    const particles = [];
    const colors = ['#ffd700', '#ff9100', '#00e5ff', '#e040fb', '#ffffff', '#76ff03'];
    const count = 65;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.45,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        radius: Math.random() * 3.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015
      });
    }

    let frame = 0;
    const render = () => {
      const modal = document.getElementById('reward-celebration-modal');
      if (!modal || modal.classList.contains('hidden')) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      for (let p of particles) {
        if (p.alpha <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.alpha -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      frame++;
      if (alive && frame < 120) {
        requestAnimationFrame(render);
      }
    };
    requestAnimationFrame(render);
  }

  // ==========================================================================
  // 🎭 DIVINE AVATARS & WARDROBE SYSTEM METHODS
  // ==========================================================================
  loadSkins() {
    try {
      const savedSkin = localStorage.getItem('ganesha_selected_skin');
      if (savedSkin && this.divineSkins[savedSkin]) {
        this.selectedSkin = savedSkin;
      }
      const savedUnlocked = localStorage.getItem('ganesha_unlocked_skins');
      if (savedUnlocked) {
        this.unlockedSkins = JSON.parse(savedUnlocked) || ['classic'];
      }
      if (!this.unlockedSkins.includes('classic')) {
        this.unlockedSkins.push('classic');
      }
      // Auto unlock check based on progression milestones
      if (this.unlockedLevels >= 9 && !this.unlockedSkins.includes('vira')) {
        this.unlockedSkins.push('vira');
      }
      if (this.claimedDays && this.claimedDays.includes(7) && !this.unlockedSkins.includes('suvarna')) {
        this.unlockedSkins.push('suvarna');
      }
      const totalStars = Object.values(this.levelStars || {}).reduce((a, b) => a + b, 0);
      if (totalStars >= 30 && !this.unlockedSkins.includes('panchamukha')) {
        this.unlockedSkins.push('panchamukha');
      }
    } catch (e) {
      console.warn("Could not load skins:", e);
    }
  }

  saveSkins() {
    try {
      localStorage.setItem('ganesha_selected_skin', this.selectedSkin);
      localStorage.setItem('ganesha_unlocked_skins', JSON.stringify(this.unlockedSkins));
    } catch (e) {
      console.warn("Could not save skins:", e);
    }
  }

  openWardrobeModal() {
    sounds.playClick();
    this.loadSkins();
    this.wardrobePreviewSkin = this.selectedSkin || 'classic';
    this.updateWardrobeUI();

    const hideModalIds = [
      'settings-modal', 'player-profile-modal', 'profile-dashboard-modal',
      'leaderboard-modal', 'daily-reward-modal', 'chapter-select-modal',
      'chapters-index-modal', 'level-select-modal', 'pause-modal', 'game-over-modal'
    ];
    hideModalIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('hidden');
        el.style.display = 'none';
      }
    });

    const modal = document.getElementById('avatar-wardrobe-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
    this.inModal = true;
    this.initWardrobeParticles();
    this.startWardrobePreviewLoop();
  }

  updateWardrobeUI() {
    const activeSkin = this.divineSkins[this.wardrobePreviewSkin] || this.divineSkins.classic;
    const isUnlocked = this.unlockedSkins.includes(this.wardrobePreviewSkin);
    const isEquipped = this.selectedSkin === this.wardrobePreviewSkin;

    // 1. Update Treasury Bar
    const coinsVal = document.getElementById('wardrobe-coins-val');
    if (coinsVal) coinsVal.textContent = this.coins || 0;
    const starsVal = document.getElementById('wardrobe-stars-val');
    const totalStars = Object.values(this.levelStars || {}).reduce((a, b) => a + b, 0);
    if (starsVal) starsVal.textContent = totalStars;
    const gemsVal = document.getElementById('wardrobe-gems-val');
    if (gemsVal) gemsVal.textContent = this.gems || (this.claimedDays ? this.claimedDays.filter(d => d === 5 || d === 7).length : 0);

    // 2. Update Preview Badge, Desc, Perk
    const nameEl = document.getElementById('wardrobe-active-skin-name');
    if (nameEl) nameEl.textContent = activeSkin.name;
    const tagEl = document.getElementById('wardrobe-active-skin-tag');
    if (tagEl) {
      tagEl.textContent = activeSkin.tag;
      tagEl.className = `skin-tier-tag ${activeSkin.tierClass || 'tier-classic'}`;
    }
    const descEl = document.getElementById('wardrobe-active-skin-desc');
    if (descEl) descEl.textContent = activeSkin.desc;
    const perkEl = document.getElementById('wardrobe-active-skin-perk');
    if (perkEl) perkEl.textContent = activeSkin.perk;

    // 3. Update Action Button
    const actionBtn = document.getElementById('btn-wardrobe-action');
    const actionText = document.getElementById('wardrobe-action-text');
    const actionIcon = document.getElementById('wardrobe-action-icon');

    if (actionBtn && actionText) {
      if (isEquipped) {
        actionBtn.disabled = true;
        actionBtn.classList.remove('pulse');
        actionText.textContent = 'EQUIPPED ✓';
        if (actionIcon) actionIcon.textContent = '✓';
      } else if (isUnlocked) {
        actionBtn.disabled = false;
        actionBtn.classList.add('pulse');
        actionText.textContent = 'EQUIP AVATAR';
        if (actionIcon) actionIcon.textContent = '✨';
      } else {
        actionBtn.disabled = false;
        actionBtn.classList.add('pulse');
        if (actionIcon) actionIcon.textContent = '🔓';
        if (activeSkin.costType === 'coins_or_ch1') {
          actionText.textContent = `UNLOCK (500 🪙 or Ch 1)`;
        } else if (activeSkin.costType === 'coins_or_day7') {
          actionText.textContent = `UNLOCK (1000 🪙 or Day 7)`;
        } else if (activeSkin.costType === 'coins_or_stars') {
          actionText.textContent = `UNLOCK (2000 🪙 or 30 ⭐)`;
        } else {
          actionText.textContent = `UNLOCK (🪙 ${activeSkin.cost})`;
        }
      }
    }

    // 4. Update Grid Cards Status
    Object.keys(this.divineSkins).forEach(skinId => {
      const card = document.getElementById(`skin-card-${skinId}`);
      const status = document.getElementById(`skin-status-${skinId}`);
      if (!card || !status) return;

      card.classList.remove('active', 'equipped');
      if (skinId === this.wardrobePreviewSkin) {
        card.classList.add('active');
      }

      if (this.selectedSkin === skinId) {
        card.classList.add('equipped');
        status.textContent = '✓ EQUIPPED';
        status.className = 'skin-card-status equipped';
      } else if (this.unlockedSkins.includes(skinId)) {
        status.textContent = 'UNLOCKED';
        status.className = 'skin-card-status unlocked';
      } else {
        const s = this.divineSkins[skinId];
        status.className = 'skin-card-status';
        if (s.costType === 'coins_or_ch1') status.textContent = '500 🪙 / Ch 1';
        else if (s.costType === 'coins_or_day7') status.textContent = 'Day 7 / 1000 🪙';
        else if (s.costType === 'coins_or_stars') status.textContent = '30 ⭐ / 2000 🪙';
        else status.textContent = `${s.cost} 🪙`;
      }
    });
  }

  selectWardrobeSkin(skinId) {
    if (!this.divineSkins[skinId]) return;
    this.wardrobePreviewSkin = skinId;
    sounds.playClick();
    this.triggerVibrate(20);
    this.updateWardrobeUI();
  }

  handleWardrobeAction() {
    const skinId = this.wardrobePreviewSkin;
    const skin = this.divineSkins[skinId];
    if (!skin) return;

    if (this.unlockedSkins.includes(skinId)) {
      // Equip skin
      this.selectedSkin = skinId;
      this.saveSkins();
      this.updateWardrobeUI();
      sounds.playCollect();
      sounds.playTempleBell(880);
      this.triggerVibrate(40);
    } else {
      // Try to unlock
      const totalStars = Object.values(this.levelStars || {}).reduce((a, b) => a + b, 0);
      let canUnlock = false;
      let costCoins = skin.cost || 0;

      if (skin.costType === 'coins_or_ch1' && (this.unlockedLevels >= 9 || (this.coins && this.coins >= 500))) {
        canUnlock = true;
        if (this.coins >= 500 && this.unlockedLevels < 9) {
          this.coins -= 500;
        }
      } else if (skin.costType === 'coins_or_day7' && ((this.claimedDays && this.claimedDays.includes(7)) || (this.coins && this.coins >= 1000))) {
        canUnlock = true;
        if (this.coins >= 1000 && (!this.claimedDays || !this.claimedDays.includes(7))) {
          this.coins -= 1000;
        }
      } else if (skin.costType === 'coins_or_stars' && (totalStars >= 30 || (this.coins && this.coins >= 2000))) {
        canUnlock = true;
        if (this.coins >= 2000 && totalStars < 30) {
          this.coins -= 2000;
        }
      } else if (this.coins && this.coins >= costCoins) {
        canUnlock = true;
        this.coins -= costCoins;
      }

      if (canUnlock) {
        this.unlockedSkins.push(skinId);
        this.selectedSkin = skinId;
        this.saveSkins();
        this.saveProgress();
        this.updateHUD();
        this.updateWardrobeUI();
        sounds.playTitleChime();
        sounds.playTempleBell(1046.50);
        this.triggerVibrate([50, 70, 100]);
        this.initWardrobeParticles();
      } else {
        sounds.playHurt();
        this.triggerVibrate([20, 30]);
        alert(`Divine Requirement Not Met!\nEarn more Sacred Coins, Stars, or complete Chapters to unlock ${skin.name}!`);
      }
    }
  }

  initWardrobeParticles() {
    const canvas = document.getElementById('wardrobeParticlesCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement.offsetWidth || 700;
    canvas.height = canvas.parentElement.offsetHeight || 500;

    const particles = [];
    const colors = ['#ffd700', '#ff9100', '#00e5ff', '#e040fb', '#ffffff'];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 1.5 - 0.5,
        radius: Math.random() * 2.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    const render = () => {
      const modal = document.getElementById('avatar-wardrobe-modal');
      if (!modal || modal.classList.contains('hidden')) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(render);
    };
    render();
  }

  startWardrobePreviewLoop() {
    const canvas = document.getElementById('wardrobePreviewCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.wardrobePreviewAnimTimer) cancelAnimationFrame(this.wardrobePreviewAnimTimer);

    const renderLoop = () => {
      const modal = document.getElementById('avatar-wardrobe-modal');
      if (!modal || modal.classList.contains('hidden')) return;

      this.wardrobeWalkCycle += 0.05;
      this.drawWardrobePreviewAvatar(ctx, canvas.width, canvas.height);
      this.wardrobePreviewAnimTimer = requestAnimationFrame(renderLoop);
    };
    this.wardrobePreviewAnimTimer = requestAnimationFrame(renderLoop);
  }

  drawWardrobePreviewAvatar(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);

    const skinKey = this.wardrobePreviewSkin || 'classic';
    const skinCfg = this.divineSkins[skinKey] || this.divineSkins.classic;
    const pal = skinCfg.palette;

    ctx.save();
    ctx.translate(width / 2, height * 0.58);

    const idleBob = Math.sin(Date.now() * 0.004) * 2;
    const walkCycle = this.wardrobeWalkCycle;

    // Glowing Aura Ring
    const auraPulse = Math.sin(Date.now() * 0.006) * 4;
    ctx.beginPath();
    ctx.arc(0, -6, 42 + auraPulse, 0, Math.PI * 2);
    ctx.fillStyle = pal.aura;
    ctx.shadowColor = pal.auraStroke;
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.strokeStyle = pal.auraStroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Plump Tummy
    ctx.fillStyle = pal.skin;
    ctx.beginPath();
    ctx.arc(0, 10 + idleBob, 18, 0, Math.PI * 2);
    ctx.fill();

    // Sacred Silk Dhoti
    ctx.fillStyle = pal.dhoti;
    ctx.beginPath();
    ctx.moveTo(-13, 12 + idleBob);
    ctx.lineTo(13, 12 + idleBob);
    ctx.lineTo(15, 26 + idleBob);
    ctx.lineTo(-15, 26 + idleBob);
    ctx.closePath();
    ctx.fill();

    // Golden Dhoti Hem & Sash
    ctx.fillStyle = pal.dhotiHem;
    ctx.fillRect(-15, 24 + idleBob, 30, 3.5);
    ctx.fillStyle = pal.dhotiSash;
    ctx.fillRect(-2.5, 12 + idleBob, 5, 15);

    // Lotus Feet
    ctx.fillStyle = pal.feet;
    ctx.beginPath();
    ctx.ellipse(-9, 28 + idleBob, 6.5, 4.5, 0, 0, Math.PI * 2);
    ctx.ellipse(9, 28 + idleBob, 6.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute Round Head
    ctx.fillStyle = pal.head;
    ctx.beginPath();
    ctx.arc(0, -10 + idleBob, 17, 0, Math.PI * 2);
    ctx.fill();

    // Rosy Cheeks
    ctx.fillStyle = pal.cheeks;
    ctx.beginPath();
    ctx.arc(-10, -7 + idleBob, 4.5, 0, Math.PI * 2);
    ctx.arc(10, -7 + idleBob, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Large Elephant Ears (Animated Flapping)
    const earFlap = Math.sin(walkCycle * 0.8) * 0.15;
    ctx.save();
    // Left Ear
    ctx.fillStyle = pal.head;
    ctx.beginPath();
    ctx.ellipse(-18, -11 + idleBob, 9.5, 14, -0.25 + earFlap, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.earInner;
    ctx.beginPath();
    ctx.ellipse(-18, -11 + idleBob, 6.5, 10, -0.25 + earFlap, 0, Math.PI * 2);
    ctx.fill();

    // Right Ear
    ctx.fillStyle = pal.head;
    ctx.beginPath();
    ctx.ellipse(18, -11 + idleBob, 9.5, 14, 0.25 - earFlap, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.earInner;
    ctx.beginPath();
    ctx.ellipse(18, -11 + idleBob, 6.5, 10, 0.25 - earFlap, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Eyes
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.arc(-5.5, -12 + idleBob, 2.5, 0, Math.PI * 2);
    ctx.arc(5.5, -12 + idleBob, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-6.5, -13 + idleBob, 1, 0, Math.PI * 2);
    ctx.arc(4.5, -13 + idleBob, 1, 0, Math.PI * 2);
    ctx.fill();

    // Tilak
    ctx.fillStyle = pal.gem || '#d50000';
    ctx.beginPath();
    ctx.arc(0, -18 + idleBob, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.crown;
    ctx.fillRect(-3.5, -16 + idleBob, 7, 1.5);
    ctx.fillRect(-1, -20 + idleBob, 2, 5);

    // Tusks
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(4, -4 + idleBob);
    ctx.lineTo(9, 1 + idleBob);
    ctx.lineTo(7, 2 + idleBob);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-4, -4 + idleBob);
    ctx.lineTo(-8, -1 + idleBob);
    ctx.lineTo(-6, 0 + idleBob);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Elephant Trunk & Golden Modak
    const trunkSway = Math.sin(walkCycle * 0.7) * 4;
    ctx.strokeStyle = pal.head;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -6 + idleBob);
    ctx.quadraticCurveTo(6 + trunkSway, 6 + idleBob, 14 + trunkSway, 1 + idleBob);
    ctx.stroke();

    // Modak in Trunk
    ctx.fillStyle = '#ffd54f';
    ctx.strokeStyle = '#ff6f00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const mx = 14 + trunkSway;
    const my = 1 + idleBob;
    ctx.moveTo(mx, my - 6);
    ctx.quadraticCurveTo(mx + 6, my + 4, mx, my + 6);
    ctx.quadraticCurveTo(mx - 6, my + 4, mx, my - 6);
    ctx.fill();
    ctx.stroke();

    // Royal Mukut
    ctx.fillStyle = pal.crown;
    ctx.beginPath();
    ctx.moveTo(-14, -23 + idleBob);
    ctx.lineTo(-8, -36 + idleBob);
    ctx.lineTo(0, -44 + idleBob);
    ctx.lineTo(8, -36 + idleBob);
    ctx.lineTo(14, -23 + idleBob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = pal.crownStroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = pal.gem;
    ctx.beginPath();
    ctx.arc(0, -30 + idleBob, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-1, -31 + idleBob, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Jewel Necklace
    ctx.strokeStyle = pal.necklace;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 5 + idleBob, 11, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Weapon
    ctx.save();
    if (pal.weaponType === 'trishul') {
      ctx.strokeStyle = pal.weaponStaff;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(12, 16 + idleBob);
      ctx.lineTo(20, -34 + idleBob);
      ctx.stroke();

      ctx.strokeStyle = pal.weaponHead;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(20, -34 + idleBob);
      ctx.lineTo(20, -48 + idleBob);
      ctx.moveTo(16, -34 + idleBob);
      ctx.quadraticCurveTo(12, -40 + idleBob, 14, -45 + idleBob);
      ctx.moveTo(24, -34 + idleBob);
      ctx.quadraticCurveTo(28, -40 + idleBob, 26, -45 + idleBob);
      ctx.stroke();
    } else {
      ctx.strokeStyle = pal.weaponStaff;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(12, 12 + idleBob);
      ctx.lineTo(19, -28 + idleBob);
      ctx.stroke();
      ctx.fillStyle = pal.weaponHead;
      ctx.beginPath();
      ctx.arc(21, -24 + idleBob, 11, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
      ctx.strokeStyle = pal.weaponStroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  }

  loadLeaderboard() {
    const defaultLeaderboard = [
      { name: "Sri Rama", avatar: "🕉️", level: 24, stars: 72, score: 35400 },
      { name: "Bhakta Prahlada", avatar: "🌺", level: 24, stars: 70, score: 32800 },
      { name: "Arjuna", avatar: "🏹", level: 22, stars: 64, score: 28500 },
      { name: "Dhruva", avatar: "⭐", level: 20, stars: 58, score: 25200 },
      { name: "Markandeya", avatar: "🔱", level: 18, stars: 52, score: 22400 },
      { name: "Harishchandra", avatar: "🪔", level: 16, stars: 46, score: 19800 },
      { name: "Hanuman", avatar: "🚩", level: 15, stars: 44, score: 18200 },
      { name: "Vibhishana", avatar: "🐚", level: 12, stars: 34, score: 14500 },
      { name: "Shabari", avatar: "🍓", level: 10, stars: 28, score: 11200 },
      { name: "Sudama", avatar: "🌾", level: 8, stars: 22, score: 8600 }
    ];

    try {
      const raw = localStorage.getItem('ganesha_leaderboard');
      if (raw) {
        this.leaderboardData = JSON.parse(raw);
        if (!Array.isArray(this.leaderboardData) || this.leaderboardData.length === 0) {
          this.leaderboardData = defaultLeaderboard;
        }
      } else {
        this.leaderboardData = defaultLeaderboard;
      }
    } catch (e) {
      console.warn("Could not load leaderboard from localStorage:", e);
      this.leaderboardData = defaultLeaderboard;
    }
  }

  saveLeaderboard() {
    try {
      localStorage.setItem('ganesha_leaderboard', JSON.stringify(this.leaderboardData));
    } catch (e) {
      console.warn("Could not save leaderboard to localStorage:", e);
    }
  }

  recordLeaderboardScore() {
    let totalStars = 0;
    for (let i = 0; i < 24; i++) {
      if (this.levelStars[i]) totalStars += this.levelStars[i];
    }
    if (totalStars === 0 && this.unlockedLevels > 1) {
      totalStars = (this.unlockedLevels - 1) * 3;
    }

    if (!this.leaderboardData || !Array.isArray(this.leaderboardData)) {
      this.loadLeaderboard();
    }

    const currentName = this.playerName || "Devotee";
    const existingIndex = this.leaderboardData.findIndex(item => item.name.toLowerCase() === currentName.toLowerCase());

    const playerEntry = {
      name: currentName,
      avatar: this.playerAvatar || "🐘",
      level: Math.min(24, Math.max(1, this.unlockedLevels)),
      stars: Math.min(72, totalStars),
      score: Math.max(0, this.score)
    };

    if (existingIndex >= 0) {
      playerEntry.score = Math.max(this.leaderboardData[existingIndex].score, playerEntry.score);
      playerEntry.level = Math.max(this.leaderboardData[existingIndex].level, playerEntry.level);
      playerEntry.stars = Math.max(this.leaderboardData[existingIndex].stars, playerEntry.stars);
      this.leaderboardData[existingIndex] = playerEntry;
    } else {
      this.leaderboardData.push(playerEntry);
    }

    this.leaderboardData.sort((a, b) => b.score - a.score);
    this.saveLeaderboard();
  }

  renderLeaderboard() {
    this.recordLeaderboardScore();

    const tbody = document.getElementById('leaderboard-tbody');
    if (!tbody) return;

    this.leaderboardData.sort((a, b) => b.score - a.score);

    const currentName = (this.playerName || "Devotee").toLowerCase();
    let playerRank = 1;
    const foundRankIdx = this.leaderboardData.findIndex(item => item.name.toLowerCase() === currentName);
    if (foundRankIdx >= 0) {
      playerRank = foundRankIdx + 1;
    }

    const rankDisplay = document.getElementById('player-rank-display');
    if (rankDisplay) rankDisplay.textContent = `#${playerRank}`;

    const scoreDisplay = document.getElementById('player-score-display');
    if (scoreDisplay) scoreDisplay.textContent = this.score.toLocaleString();

    const bannerAvatar = document.getElementById('banner-player-avatar');
    if (bannerAvatar) bannerAvatar.textContent = this.playerAvatar;

    const bannerName = document.getElementById('banner-player-name');
    if (bannerName) bannerName.textContent = this.playerName;

    const top10 = this.leaderboardData.slice(0, 10);
    tbody.innerHTML = '';

    top10.forEach((item, idx) => {
      const rank = idx + 1;
      let medal = '';
      if (rank === 1) medal = '🥇 ';
      else if (rank === 2) medal = '🥈 ';
      else if (rank === 3) medal = '🥉 ';

      const isCurrent = item.name.toLowerCase() === currentName;
      const tr = document.createElement('tr');
      if (isCurrent) tr.className = 'is-current-player';

      tr.innerHTML = `
        <td class="col-rank">${medal}${rank}</td>
        <td class="col-player">${item.avatar || '🐘'} ${item.name}</td>
        <td class="col-level">${item.level} / 24</td>
        <td class="col-stars">⭐ ${item.stars}</td>
        <td class="col-score">${item.score.toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ========================================================================
  // 🌌 EPIC WORLD TRANSFORMATION WOW MOMENT CONTROLLER
  // ========================================================================
  triggerWorldTransformation() {
    if (this.isTransforming) return;
    this.isTransforming = true;
    this.hasTriggeredTransformation = true;
    try {
      localStorage.setItem('ganesha_world_transformed', 'true');
    } catch (_) {}

    const overlay = document.getElementById('world-transformation-overlay');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    overlay.classList.remove('trans-darkening', 'trans-beacon-active', 'trans-flash-active', 'trans-banner-show');

    // 1. (0.0s - 0.6s): Environment becomes quiet, BGM gently ducks down
    if (sounds.masterGain && sounds.ctx) {
      const now = sounds.ctx.currentTime;
      sounds.masterGain.gain.linearRampToValueAtTime(0.12, now + 0.6);
    }

    // 2. (0.8s): Screen slowly darkens & camera shake begins with deep bell
    setTimeout(() => {
      overlay.classList.add('trans-darkening');
      this.screenShake = 8;
      this.triggerVibrate([40, 60, 40]);
      sounds.playDeepTempleBell();
      this.initTransformationParticles();
    }, 800);

    // 3. (2.0s): Golden particles swirl tightly and powerful divine beacon appears
    setTimeout(() => {
      overlay.classList.add('trans-beacon-active');
      sounds.playConchAmbience();
      this.screenShake = 12;
      this.triggerVibrate([60, 80, 100]);
    }, 2000);

    // 4. (3.4s): Screen flashes with radiant golden light & THE WORLD TRANSFORMS!
    setTimeout(() => {
      overlay.classList.add('trans-flash-active');
      sounds.playTitleImpact();
      this.screenShake = 18;
      this.triggerVibrate([100, 150, 200]);

      // Dramatic environment shift: unlock cosmic aurora & divine realm aesthetics!
      this.currentTheme = 'cosmic_journey';
      if (this.currentLevelData) {
        this.currentLevelData.theme = 'cosmic_journey';
      }

      // Restore and elevate music to majestic full volume
      if (sounds.masterGain && sounds.ctx) {
        const now = sounds.ctx.currentTime;
        sounds.masterGain.gain.linearRampToValueAtTime(1.0, now + 0.8);
      }
      sounds.playTrack('chapter3');
      sounds.playTitleChime();

      // Camera panoramic zoom reveal
      const gameCanvas = document.getElementById('gameCanvas');
      if (gameCanvas) {
        gameCanvas.classList.add('transformation-camera-zoom');
        setTimeout(() => {
          gameCanvas.classList.remove('transformation-camera-zoom');
        }, 3400);
      }
    }, 3400);

    // 5. (4.2s): Display Announcement Banner: “✨ DIVINE REALM AWAKENED ✨”
    setTimeout(() => {
      overlay.classList.add('trans-banner-show');
      sounds.playTempleBell(1174.66);
    }, 4200);

    // 6. (7.2s): Smoothly fade out overlay & return control to player with divine aura
    setTimeout(() => {
      overlay.classList.add('hidden');
      overlay.classList.remove('trans-darkening', 'trans-beacon-active', 'trans-flash-active', 'trans-banner-show');
      this.isTransforming = false;
      if (this.player) {
        this.player.divineAuraTimer = 600; // 10 seconds of sparkling gold aura around Ganesha
      }
      sounds.playCollect();
    }, 7200);
  }

  initTransformationParticles() {
    const canvas = document.getElementById('transformationCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#ffd700', '#fff9c4', '#ff9100', '#00e5ff', '#e040fb', '#ffffff'];
    const count = 90;

    for (let i = 0; i < count; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * 340 + 40,
        speed: (Math.random() * 0.035 + 0.015) * (Math.random() < 0.5 ? 1 : -1),
        radius: Math.random() * 3.5 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.85 + 0.15,
        pulse: Math.random() * Math.PI * 2
      });
    }

    const animate = () => {
      const overlay = document.getElementById('world-transformation-overlay');
      if (!overlay || overlay.classList.contains('hidden')) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (let p of particles) {
        p.angle += p.speed;
        p.dist = Math.max(10, p.dist - 0.4);
        p.pulse += 0.04;

        const px = cx + Math.cos(p.angle) * p.dist;
        const py = cy + Math.sin(p.angle) * (p.dist * 0.6) + Math.sin(p.pulse) * 10;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha * (0.6 + 0.4 * Math.sin(p.pulse)));
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (this.isTransforming) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  initWelcomeParticles() {
    if (this.welcomeParticlesInitialized) return;
    const canvas = document.getElementById('welcomeParticlesCanvas');
    if (!canvas) return;
    this.welcomeParticlesInitialized = true;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const colors = ['#ffd700', '#ffb300', '#ff8f00', '#fff9c4', '#ffffff', '#e040fb'];
    const count = 50;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2.8 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: -(Math.random() * 0.8 + 0.3),
        vx: (Math.random() - 0.5) * 0.6,
        alpha: Math.random() * 0.7 + 0.3,
        pulse: Math.random() * Math.PI * 2
      });
    }

    const animate = () => {
      const welcome = document.getElementById('welcome-screen');
      if (welcome && !welcome.classList.contains('hidden')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let p of particles) {
          p.y += p.vy;
          p.x += p.vx + Math.sin(p.pulse) * 0.35;
          p.pulse += 0.03;

          if (p.y < -10) {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
          }

          ctx.save();
          ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  initIntroParticles() {
    if (this.introParticlesInitialized) return;
    const canvas = document.getElementById('introParticlesCanvas');
    if (!canvas) return;
    this.introParticlesInitialized = true;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const colors = ['#ffd700', '#ffb300', '#ff8f00', '#fff9c4', '#ffffff', '#e040fb', '#00e5ff'];
    const count = 75;

    for (let i = 0; i < count; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * (Math.min(window.innerWidth, window.innerHeight) * 0.45) + 30,
        speed: (Math.random() * 0.015 + 0.008) * (Math.random() < 0.5 ? 1 : -1),
        radius: Math.random() * 2.8 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.85 + 0.15,
        pulse: Math.random() * Math.PI * 2,
        vy: -(Math.random() * 0.6 + 0.2)
      });
    }

    const animate = () => {
      const intro = document.getElementById('cinematic-intro-screen');
      if (intro && !intro.classList.contains('hidden') && !intro.classList.contains('reveal-fading')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height * 0.38;

        for (let p of particles) {
          p.angle += p.speed;
          p.pulse += 0.03;
          
          // Orbital motion around divine center with vertical drift
          const px = cx + Math.cos(p.angle) * p.dist;
          const py = cy + Math.sin(p.angle) * (p.dist * 0.65) + Math.sin(p.pulse) * 15;

          ctx.save();
          ctx.globalAlpha = p.alpha * (0.55 + 0.45 * Math.sin(p.pulse));
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(px, py, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      if (!this.introFinished) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  playCinematicTitleReveal() {
    const intro = document.getElementById('cinematic-intro-screen');
    if (!intro) return;

    // 1. Initial State: Screen completely dark
    // 2. 0.5s: Deep temple bell rings & subtle conch ambience
    this.introTimers.push(setTimeout(() => {
      if (intro && !this.introFinished) {
        sounds.playDeepTempleBell();
        sounds.playConchAmbience();
      }
    }, 500));

    // 3. 1.2s: Small golden point of light in center + warm temple background
    this.introTimers.push(setTimeout(() => {
      if (intro && !this.introFinished) {
        intro.classList.add('phase-temple-light');
        intro.classList.add('phase-spark');
      }
    }, 1200));

    // 4 & 5. 2.0s: Light expands into powerful golden divine aura with swirling golden particles
    this.introTimers.push(setTimeout(() => {
      if (intro && !this.introFinished) {
        intro.classList.add('phase-aura');
      }
    }, 2000));

    // 6 & 7. 3.0s: Subtle silhouette of Lord Vinayaka emerges with cinematic camera push-in
    this.introTimers.push(setTimeout(() => {
      if (intro && !this.introFinished) {
        intro.classList.add('phase-silhouette');
      }
    }, 3000));

    // 8, 9, 10. 4.4s: Dramatic golden light burst + VINAYAKA letter-by-letter metallic 3D reveal with impact
    this.introTimers.push(setTimeout(() => {
      if (intro && !this.introFinished) {
        intro.classList.add('phase-burst');
        intro.classList.add('phase-title');
        sounds.playTitleImpact();
        this.triggerVibrate(60);

        // Screen shake on major title impact
        intro.classList.add('screen-impact-shake');
        setTimeout(() => {
          if (intro) intro.classList.remove('screen-impact-shake');
        }, 400);
      }
    }, 4400));

    // 11. 5.6s: Golden light sweep shimmers across the VINAYAKA letters
    this.introTimers.push(setTimeout(() => {
      if (intro && !this.introFinished) {
        intro.classList.add('phase-sweep');
      }
    }, 5600));

    // 12 & 13. 6.4s: Reveal underneath: “THE DIVINE ADVENTURE” with gentle celestial chime
    this.introTimers.push(setTimeout(() => {
      if (intro && !this.introFinished) {
        intro.classList.add('phase-adventure');
        sounds.playTitleChime();
      }
    }, 6400));

    // 14 & 15. 7.6s: Soft particle burst + “A Divine Journey Begins…” + continuous devotional soundtrack starts
    this.introTimers.push(setTimeout(() => {
      if (intro && !this.introFinished) {
        intro.classList.add('phase-begins');
        sounds.ensureMusicPlaying();
      }
    }, 7600));

    // 16 & 17. 10.2s: Hold complete composition for 2.6s, then smoothly transition into Welcome screen
    this.introTimers.push(setTimeout(() => {
      this.finishCinematicTitleReveal();
    }, 10200));
  }

  finishCinematicTitleReveal() {
    if (this.introFinished) return;
    this.introFinished = true;
    for (const t of this.introTimers) clearTimeout(t);
    this.introTimers = [];

    sounds.init();
    sounds.ensureMusicPlaying();

    const intro = document.getElementById('cinematic-intro-screen');
    const welcomeScreen = document.getElementById('welcome-screen');

    if (intro) {
      intro.classList.add('reveal-fading');
      setTimeout(() => {
        intro.classList.add('hidden');
        if (welcomeScreen) {
          welcomeScreen.classList.remove('hidden');
        }
      }, 550);
    } else if (welcomeScreen) {
      welcomeScreen.classList.remove('hidden');
    }
  }

  bindUI() {
    // Cinematic Title Reveal Skip Button & Tap Anywhere to Enter Immediately
    const btnSkipIntro = document.getElementById('btn-skip-intro');
    if (btnSkipIntro) {
      btnSkipIntro.addEventListener('click', (e) => {
        e.stopPropagation();
        this.finishCinematicTitleReveal();
      });
    }

    const introScreen = document.getElementById('cinematic-intro-screen');
    if (introScreen) {
      introScreen.addEventListener('click', () => {
        this.finishCinematicTitleReveal();
      });
      introScreen.addEventListener('touchstart', () => {
        this.finishCinematicTitleReveal();
      }, { passive: true });
    }

    // Sound (SFX) Toggles
    const btnSound = document.getElementById('btn-sound');
    if (btnSound) {
      btnSound.addEventListener('click', () => sounds.toggleSound());
    }

    const btnPauseSound = document.getElementById('btn-pause-sound');
    if (btnPauseSound) {
      btnPauseSound.addEventListener('click', () => sounds.toggleSound());
    }

    // Music Toggles (HUD, Mobile Bar, Pause Menu)
    const btnMusic = document.getElementById('btn-music');
    if (btnMusic) {
      btnMusic.addEventListener('click', () => sounds.toggleMusic());
    }

    const touchMusic = document.getElementById('touch-music');
    if (touchMusic) {
      touchMusic.addEventListener('click', () => sounds.toggleMusic());
    }

    const btnPauseMusic = document.getElementById('btn-pause-music');
    if (btnPauseMusic) {
      btnPauseMusic.addEventListener('click', () => sounds.toggleMusic());
    }

    // Master Volume Sliders (HUD & Pause Menu)
    const volSlider = document.getElementById('volume-slider');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => sounds.setVolume(parseFloat(e.target.value) / 100));
    }

    const pauseVolSlider = document.getElementById('pause-volume-slider');
    if (pauseVolSlider) {
      pauseVolSlider.addEventListener('input', (e) => sounds.setVolume(parseFloat(e.target.value) / 100));
    }

    // Sync initial UI with loaded audio preferences
    sounds.updateUI();

    document.getElementById('btn-pause').addEventListener('click', () => this.togglePause());
    document.getElementById('btn-resume').addEventListener('click', () => this.togglePause());

    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) btnRestart.addEventListener('click', () => this.restartLevel());

    const touchRestart = document.getElementById('touch-restart');
    if (touchRestart) touchRestart.addEventListener('click', () => this.restartLevel());

    const touchPause = document.getElementById('touch-pause');
    if (touchPause) touchPause.addEventListener('click', () => this.togglePause());

    const btnDismissOrient = document.getElementById('btn-dismiss-orient');
    if (btnDismissOrient) {
      btnDismissOrient.addEventListener('click', () => {
        const orientHint = document.getElementById('orientation-hint');
        if (orientHint) orientHint.classList.add('hidden');
      });
    }

    document.getElementById('btn-story-action').addEventListener('click', () => {
      document.getElementById('story-modal').classList.add('hidden');
      this.inModal = false;
      sounds.init();

      // Launch situation-specific music
      const cfg = LEVEL_CONFIGS[this.currentLevelIndex];
      if (cfg.isRaceLevel || cfg.chapter === 3 || this.currentLevelIndex >= 16) {
        sounds.playTrack('chapter3');
      } else if (cfg.hasWisdomPuzzle) {
        sounds.playTrack('temple');
      } else if (cfg.chapter === 1 || this.currentLevelIndex < 8) {
        sounds.playTrack('chapter1');
      } else if (cfg.chapter === 2 || (this.currentLevelIndex >= 8 && this.currentLevelIndex < 16)) {
        sounds.playTrack('chapter2');
      } else {
        sounds.playTrack('gameplay');
      }

      if (cfg.hasCountdown) {
        this.startCountdown();
      }
    });

    document.getElementById('btn-next-level').addEventListener('click', () => {
      document.getElementById('level-complete-modal').classList.add('hidden');
      this.inModal = false;
      this.isPaused = false;
      if (this.currentLevelIndex + 1 < LEVEL_CONFIGS.length) {
        this.loadLevel(this.currentLevelIndex + 1);
      }
    });

    document.getElementById('btn-replay-level').addEventListener('click', () => {
      document.getElementById('level-complete-modal').classList.add('hidden');
      this.inModal = false;
      this.isPaused = false;
      this.loadLevel(this.currentLevelIndex);
    });

    document.getElementById('btn-restart-level').addEventListener('click', () => {
      document.getElementById('pause-modal').classList.add('hidden');
      this.inModal = false;
      this.isPaused = false;
      this.loadLevel(this.currentLevelIndex);
    });

    const btnRetry = document.getElementById('btn-retry');
    if (btnRetry) {
      btnRetry.addEventListener('click', () => {
        document.getElementById('game-over-modal').classList.add('hidden');
        this.inModal = false;
        this.isPaused = false;
        this.loadLevel(this.currentLevelIndex);
      });
    }

    const btnRestartFail = document.getElementById('btn-restart-from-fail');
    if (btnRestartFail) {
      btnRestartFail.addEventListener('click', () => {
        document.getElementById('game-over-modal').classList.add('hidden');
        this.inModal = false;
        this.isPaused = false;
        this.loadLevel(this.currentLevelIndex);
      });
    }

    const btnFailHome = document.getElementById('btn-fail-home');
    if (btnFailHome) {
      btnFailHome.addEventListener('click', () => {
        document.getElementById('game-over-modal').classList.add('hidden');
        this.inModal = false;
        this.isPaused = false;
        this.returnToMainMenu();
      });
    }

    // Level Select Modal
    const openLevelSelect = () => {
      sounds.playTrack('menu');
      this.renderLevelGrid();
      document.getElementById('pause-modal').classList.add('hidden');
      document.getElementById('game-over-modal').classList.add('hidden');
      document.getElementById('level-complete-modal').classList.add('hidden');
      document.getElementById('chapter3-complete-modal').classList.add('hidden');
      document.getElementById('level-select-modal').classList.remove('hidden');
      this.inModal = true;
    };
    document.getElementById('btn-level-select').addEventListener('click', openLevelSelect);
    document.getElementById('btn-open-levels-from-pause').addEventListener('click', openLevelSelect);
    document.getElementById('btn-open-levels-from-fail').addEventListener('click', openLevelSelect);
    const btnOpenFromComplete = document.getElementById('btn-open-levels-from-complete');
    if (btnOpenFromComplete) btnOpenFromComplete.addEventListener('click', openLevelSelect);
    const btnOpenFromC3 = document.getElementById('btn-open-levels-from-c3');
    if (btnOpenFromC3) btnOpenFromC3.addEventListener('click', openLevelSelect);

    document.getElementById('btn-close-level-select').addEventListener('click', () => {
      document.getElementById('level-select-modal').classList.add('hidden');
      this.inModal = false;
      this.isPaused = false;
      const cfg = LEVEL_CONFIGS[this.currentLevelIndex];
      if (cfg.isRaceLevel || cfg.chapter === 3 || this.currentLevelIndex >= 16) {
        sounds.playTrack('chapter3');
      } else if (cfg.hasWisdomPuzzle) {
        sounds.playTrack('temple');
      } else if (cfg.chapter === 1 || this.currentLevelIndex < 8) {
        sounds.playTrack('chapter1');
      } else if (cfg.chapter === 2 || (this.currentLevelIndex >= 8 && this.currentLevelIndex < 16)) {
        sounds.playTrack('chapter2');
      } else {
        sounds.playTrack('gameplay');
      }
    });

    // Chapter Tabs in Level Select
    document.getElementById('tab-chap-1').addEventListener('click', () => {
      this.activeChapterTab = 1;
      this.updateChapterTabClasses();
      this.renderLevelGrid();
    });

    document.getElementById('tab-chap-2').addEventListener('click', () => {
      this.activeChapterTab = 2;
      this.updateChapterTabClasses();
      this.renderLevelGrid();
    });

    const tab3 = document.getElementById('tab-chap-3');
    if (tab3) {
      tab3.addEventListener('click', () => {
        if (this.unlockedLevels < 17) {
          alert("Chapter 3 is locked! Complete Chapter 2 (Level 16) to unlock the Great Divine Race.");
          return;
        }
        this.activeChapterTab = 3;
        this.updateChapterTabClasses();
        this.renderLevelGrid();
      });
    }

    // Cutscene Modal Next Button
    document.getElementById('btn-cutscene-next').addEventListener('click', () => {
      document.getElementById('cutscene-modal').classList.add('hidden');
      this.inModal = false;
      this.isPaused = false;
      if (this.currentLevelIndex === 4 && this.boss && !this.boss.isAlive) {
        this.triggerLevelComplete();
      } else if (this.currentLevelIndex === 15 && this.boss && !this.boss.isAlive) {
        this.showChapter2Celebration();
      } else if (this.currentLevelIndex === 23) {
        this.showFinalVictoryScreen();
      } else {
        const cfg = LEVEL_CONFIGS[this.currentLevelIndex];
        if (cfg.isRaceLevel || cfg.chapter === 3 || this.currentLevelIndex >= 16) {
          sounds.playTrack('chapter3');
        } else if (cfg.hasWisdomPuzzle) {
          sounds.playTrack('temple');
        } else if (cfg.chapter === 1 || this.currentLevelIndex < 8) {
          sounds.playTrack('chapter1');
        } else if (cfg.chapter === 2 || (this.currentLevelIndex >= 8 && this.currentLevelIndex < 16)) {
          sounds.playTrack('chapter2');
        } else {
          sounds.playTrack('gameplay');
        }
      }
    });

    // Chapter 1 Celebration Buttons
    document.getElementById('btn-chapter-replay').addEventListener('click', () => {
      document.getElementById('chapter-complete-modal').classList.add('hidden');
      this.inModal = false;
      this.isPaused = false;
      this.loadLevel(0);
    });

    document.getElementById('btn-chapter-two').addEventListener('click', () => {
      document.getElementById('chapter-complete-modal').classList.add('hidden');
      this.inModal = false;
      this.isPaused = false;
      this.unlockedLevels = Math.max(this.unlockedLevels, 9);
      this.saveProgress();
      this.loadLevel(8);
    });

    // Chapter 2 Celebration Buttons
    const btnC2Replay = document.getElementById('btn-c2-replay');
    if (btnC2Replay) {
      btnC2Replay.addEventListener('click', () => {
        document.getElementById('chapter2-complete-modal').classList.add('hidden');
        this.inModal = false;
        this.isPaused = false;
        this.loadLevel(8);
      });
    }

    const btnC1Replay = document.getElementById('btn-c1-replay');
    if (btnC1Replay) {
      btnC1Replay.addEventListener('click', () => {
        document.getElementById('chapter2-complete-modal').classList.add('hidden');
        this.inModal = false;
        this.isPaused = false;
        this.loadLevel(0);
      });
    }

    const btnStartC3 = document.getElementById('btn-chapter-three');
    if (btnStartC3) {
      btnStartC3.addEventListener('click', () => {
        document.getElementById('chapter2-complete-modal').classList.add('hidden');
        this.inModal = false;
        this.isPaused = false;
        this.unlockedLevels = Math.max(this.unlockedLevels, 17);
        this.saveProgress();
        this.loadLevel(16); // Level 17 (index 16)
      });
    }

    // Chapter 3 Celebration Buttons
    const btnC3Replay = document.getElementById('btn-c3-replay');
    if (btnC3Replay) {
      btnC3Replay.addEventListener('click', () => {
        document.getElementById('chapter3-complete-modal').classList.add('hidden');
        this.inModal = false;
        this.isPaused = false;
        this.loadLevel(16);
      });
    }

    const btnC4 = document.getElementById('btn-chapter-four');
    if (btnC4) {
      btnC4.addEventListener('click', () => {
        alert("Chapter 4: The Sacred Epics (Coming Soon! You have mastered all 24 Levels of Chapters 1, 2, and 3!)");
      });
    }

    const btnOpenLevelsFromC3 = document.getElementById('btn-open-levels-from-c3');
    if (btnOpenLevelsFromC3) {
      btnOpenLevelsFromC3.addEventListener('click', () => {
        document.getElementById('chapter3-complete-modal').classList.add('hidden');
        document.getElementById('level-select-modal').classList.remove('hidden');
        this.inModal = true;
        this.activeChapterTab = 3;
        this.updateChapterTabClasses();
        this.renderLevelGrid();
      });
    }

    // ======================================================================
    // 🕉️ START SYSTEM: WELCOME SCREEN, DEVOTEE LOGIN & MENU BINDINGS
    // ======================================================================
    // 1. Welcome Screen Play Button & Tap Anywhere on Welcome Screen
    const btnWelcomePlay = document.getElementById('btn-welcome-play');
    const welcomeScreen = document.getElementById('welcome-screen');

    const handleWelcomeAdvance = () => {
      sounds.init();
      sounds.ensureMusicPlaying();
      this.triggerVibrate(30);

      if (welcomeScreen) welcomeScreen.classList.add('hidden');

      // Check if player has ever saved their name in localStorage
      const hasSavedName = localStorage.getItem('ganesha_player_name');
      if (!hasSavedName || hasSavedName === 'Devotee') {
        // First time player: show profile registration modal
        const profileModal = document.getElementById('player-profile-modal');
        if (profileModal) profileModal.classList.remove('hidden');
        const cancelBtn = document.getElementById('btn-profile-cancel');
        if (cancelBtn) cancelBtn.classList.add('hidden');
        const nameInput = document.getElementById('player-name-input');
        if (nameInput) {
          nameInput.focus();
          nameInput.select();
        }
      } else {
        // Returning player: go straight to Main Menu
        const mainMenu = document.getElementById('main-menu-overlay');
        if (mainMenu) mainMenu.classList.remove('hidden');
        sounds.playTrack('menu');
      }
    };

    if (btnWelcomePlay) {
      btnWelcomePlay.addEventListener('click', (e) => {
        e.stopPropagation();
        handleWelcomeAdvance();
      });
    }

    if (welcomeScreen) {
      welcomeScreen.addEventListener('click', () => {
        handleWelcomeAdvance();
      });
    }

    // Avatar Selection Chips in Profile Modal
    document.querySelectorAll('.avatar-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.avatar-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.playerAvatar = chip.getAttribute('data-avatar') || '🐘';
        sounds.playClick();
        this.triggerVibrate(20);
      });
    });

    // Devotee Profile Continue / Save Button
    const btnProfileContinue = document.getElementById('btn-profile-continue');
    if (btnProfileContinue) {
      btnProfileContinue.addEventListener('click', () => {
        sounds.init();
        this.triggerVibrate(35);
        const input = document.getElementById('player-name-input');
        const nameVal = input ? input.value.trim() : '';
        const activeChip = document.querySelector('.avatar-chip.active');
        const avatarVal = activeChip ? activeChip.getAttribute('data-avatar') : '🐘';

        const chosenName = nameVal || 'Devotee';
        this.saveProfile(chosenName, avatarVal);

        const profileModal = document.getElementById('player-profile-modal');
        if (profileModal) profileModal.classList.add('hidden');

        if (this.isInMainMenu) {
          const mainMenu = document.getElementById('main-menu-overlay');
          if (mainMenu) mainMenu.classList.remove('hidden');
          sounds.playTrack('menu');
        }
        sounds.playCollect();
      });
    }

    // Devotee Profile Cancel Button
    const btnProfileCancel = document.getElementById('btn-profile-cancel');
    if (btnProfileCancel) {
      btnProfileCancel.addEventListener('click', () => {
        sounds.playClick();
        document.getElementById('player-profile-modal').classList.add('hidden');
        if (this.isInMainMenu) {
          document.getElementById('main-menu-overlay').classList.remove('hidden');
        }
      });
    }

    const inputNameEl = document.getElementById('player-name-input');
    if (inputNameEl) {
      inputNameEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const btnCont = document.getElementById('btn-profile-continue');
          if (btnCont) btnCont.click();
        }
      });
    }

    // Edit Profile Modal Openers
    const openProfileEditor = () => {
      sounds.playClick();
      this.triggerVibrate(20);
      const input = document.getElementById('player-name-input');
      if (input) input.value = this.playerName;
      document.querySelectorAll('.avatar-chip').forEach(chip => {
        if (chip.getAttribute('data-avatar') === this.playerAvatar) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });
      const cancelBtn = document.getElementById('btn-profile-cancel');
      if (cancelBtn) cancelBtn.classList.remove('hidden');
      document.getElementById('settings-modal').classList.add('hidden');
      document.getElementById('profile-dashboard-modal').classList.add('hidden');
      const profileModal = document.getElementById('player-profile-modal');
      if (profileModal) profileModal.classList.remove('hidden');
      if (input) {
        input.focus();
        input.select();
      }
    };

    // Profile Dashboard Openers
    const btnEditProfile = document.getElementById('btn-edit-profile');
    if (btnEditProfile) btnEditProfile.addEventListener('click', () => this.openProfileDashboard());

    const menuPlayerBar = document.getElementById('menu-player-bar');
    if (menuPlayerBar) menuPlayerBar.addEventListener('click', () => this.openProfileDashboard());

    const hudPlayerTag = document.getElementById('hud-player-tag');
    if (hudPlayerTag) hudPlayerTag.addEventListener('click', () => this.openProfileDashboard());

    const btnSettingsViewProf = document.getElementById('btn-settings-view-profile');
    if (btnSettingsViewProf) btnSettingsViewProf.addEventListener('click', () => this.openProfileDashboard());

    const btnSettingsRename = document.getElementById('btn-settings-rename');
    if (btnSettingsRename) btnSettingsRename.addEventListener('click', openProfileEditor);

    const btnDashEditProfile = document.getElementById('btn-dash-edit-profile');
    if (btnDashEditProfile) btnDashEditProfile.addEventListener('click', openProfileEditor);

    const btnCloseProfileDash = document.getElementById('btn-close-profile-dash');
    if (btnCloseProfileDash) {
      btnCloseProfileDash.addEventListener('click', () => {
        sounds.playClick();
        document.getElementById('profile-dashboard-modal').classList.add('hidden');
        if (this.isInMainMenu) {
          document.getElementById('main-menu-overlay').classList.remove('hidden');
        }
        this.inModal = false;
      });
    }

    // Daily Divine Reward Modal Openers & Actions
    const btnMenuDailyReward = document.getElementById('btn-menu-daily-reward');
    if (btnMenuDailyReward) {
      btnMenuDailyReward.addEventListener('click', () => this.openDailyRewardModal());
    }

    const btnDashDailyReward = document.getElementById('btn-dash-daily-reward');
    if (btnDashDailyReward) {
      btnDashDailyReward.addEventListener('click', () => this.openDailyRewardModal());
    }

    const btnHudDailyReward = document.getElementById('btn-hud-daily-reward');
    if (btnHudDailyReward) {
      btnHudDailyReward.addEventListener('click', () => this.openDailyRewardModal());
    }

    const btnCloseDailyReward = document.getElementById('btn-close-daily-reward');
    if (btnCloseDailyReward) {
      btnCloseDailyReward.addEventListener('click', () => {
        sounds.playClick();
        document.getElementById('daily-reward-modal').classList.add('hidden');
        if (this.isInMainMenu) {
          document.getElementById('main-menu-overlay').classList.remove('hidden');
        }
        this.inModal = false;
      });
    }

    const btnClaimDailyReward = document.getElementById('btn-claim-daily-reward');
    if (btnClaimDailyReward) {
      btnClaimDailyReward.addEventListener('click', () => this.claimDailyReward());
    }

    // Direct card tap to claim active reward
    document.querySelectorAll('.daily-reward-item').forEach(item => {
      item.addEventListener('click', () => {
        const day = parseInt(item.getAttribute('data-day'), 10);
        if (day === this.getCurrentRewardDay() && this.isDailyRewardAvailable()) {
          this.claimDailyReward();
        } else {
          sounds.playClick();
          this.triggerVibrate(15);
        }
      });
    });

    const btnCollectRewardAck = document.getElementById('btn-collect-reward-ack');
    if (btnCollectRewardAck) {
      btnCollectRewardAck.addEventListener('click', () => {
        sounds.playClick();
        document.getElementById('reward-celebration-modal').classList.add('hidden');
      });
    }

    // Divine Avatars & Wardrobe Modal Bindings
    const btnMenuWardrobe = document.getElementById('btn-menu-wardrobe');
    if (btnMenuWardrobe) {
      btnMenuWardrobe.addEventListener('click', () => this.openWardrobeModal());
    }

    const btnDashWardrobe = document.getElementById('btn-dash-wardrobe');
    if (btnDashWardrobe) {
      btnDashWardrobe.addEventListener('click', () => this.openWardrobeModal());
    }

    const btnHudWardrobe = document.getElementById('btn-hud-wardrobe');
    if (btnHudWardrobe) {
      btnHudWardrobe.addEventListener('click', () => this.openWardrobeModal());
    }

    const btnPauseWardrobe = document.getElementById('btn-pause-wardrobe');
    if (btnPauseWardrobe) {
      btnPauseWardrobe.addEventListener('click', () => this.openWardrobeModal());
    }

    const btnSettingsWardrobe = document.getElementById('btn-settings-wardrobe');
    if (btnSettingsWardrobe) {
      btnSettingsWardrobe.addEventListener('click', () => this.openWardrobeModal());
    }

    const btnCloseWardrobe = document.getElementById('btn-close-wardrobe');
    if (btnCloseWardrobe) {
      btnCloseWardrobe.addEventListener('click', () => {
        sounds.playClick();
        const modal = document.getElementById('avatar-wardrobe-modal');
        if (modal) {
          modal.classList.add('hidden');
          modal.style.display = 'none';
        }
        if (this.isInMainMenu) {
          const menu = document.getElementById('main-menu-overlay');
          if (menu) {
            menu.classList.remove('hidden');
            menu.style.display = 'flex';
          }
        } else if (this.isPaused) {
          const pauseM = document.getElementById('pause-modal');
          if (pauseM) {
            pauseM.classList.remove('hidden');
            pauseM.style.display = 'flex';
          }
        }
        this.inModal = false;
      });
    }

    const btnWardrobeAction = document.getElementById('btn-wardrobe-action');
    if (btnWardrobeAction) {
      btnWardrobeAction.addEventListener('click', () => this.handleWardrobeAction());
    }

    document.querySelectorAll('.skin-card').forEach(card => {
      card.addEventListener('click', () => {
        const skinId = card.getAttribute('data-skin');
        if (skinId) this.selectWardrobeSkin(skinId);
      });
    });

    // Hero image & tap hint in main menu
    const tapHint = document.getElementById('menu-tap-hint');
    if (tapHint) {
      tapHint.addEventListener('click', () => {
        sounds.init();
        sounds.ensureMusicPlaying();
      });
    }

    const heroImg = document.getElementById('hero-ganesha-img');
    if (heroImg) {
      heroImg.addEventListener('click', () => {
        sounds.init();
        sounds.ensureMusicPlaying();
      });
    }

    // Launch Game From Main Menu (Continue Game)
    const launchGameFromMenu = () => {
      sounds.init();
      sounds.ensureMusicPlaying();
      this.triggerVibrate(30);
      this.isInMainMenu = false;
      this.isPaused = false;
      this.inModal = false;

      // Hide all overlays
      document.getElementById('main-menu-overlay').classList.add('hidden');
      document.getElementById('welcome-screen').classList.add('hidden');
      document.getElementById('player-profile-modal').classList.add('hidden');
      document.getElementById('profile-dashboard-modal').classList.add('hidden');
      document.getElementById('leaderboard-modal').classList.add('hidden');
      document.getElementById('settings-modal').classList.add('hidden');
      document.getElementById('reset-confirm-modal').classList.add('hidden');
      document.getElementById('chapters-index-modal').classList.add('hidden');
      document.getElementById('chapter-select-modal').classList.add('hidden');
      document.getElementById('level-select-modal').classList.add('hidden');
      document.getElementById('how-to-play-modal').classList.add('hidden');
      document.getElementById('game-rules-modal').classList.add('hidden');

      // Load active level
      const lvlIdx = this.currentLevelIndex || 0;
      this.loadLevel(lvlIdx);

      // Show story introduction for the active level
      const cfg = LEVEL_CONFIGS[lvlIdx];
      if (cfg && !cfg.hasPreCutscene) {
        this.showStoryPanel(cfg);
      }
    };

    const btnMenuContinue = document.getElementById('btn-menu-continue');
    if (btnMenuContinue) btnMenuContinue.addEventListener('click', launchGameFromMenu);
    const btnMenuStart = document.getElementById('btn-menu-start');
    if (btnMenuStart) btnMenuStart.addEventListener('click', launchGameFromMenu);

    // Leaderboard Modal Open & Close
    const btnMenuLeaderboard = document.getElementById('btn-menu-leaderboard');
    if (btnMenuLeaderboard) {
      btnMenuLeaderboard.addEventListener('click', () => {
        sounds.init();
        sounds.playClick();
        this.triggerVibrate(20);
        this.renderLeaderboard();
        document.getElementById('main-menu-overlay').classList.add('hidden');
        document.getElementById('leaderboard-modal').classList.remove('hidden');
        this.inModal = true;
      });
    }

    const btnCloseLeaderboard = document.getElementById('btn-close-leaderboard');
    if (btnCloseLeaderboard) {
      btnCloseLeaderboard.addEventListener('click', () => {
        sounds.playClick();
        document.getElementById('leaderboard-modal').classList.add('hidden');
        document.getElementById('main-menu-overlay').classList.remove('hidden');
        this.inModal = false;
      });
    }

    // Settings Modal Open, Close & Controls
    const updateSettingsModalUI = () => {
      const musicBtn = document.getElementById('settings-music-btn');
      if (musicBtn) {
        musicBtn.textContent = sounds.musicEnabled ? "🔊 ON" : "🔇 OFF";
        musicBtn.className = `settings-toggle-btn ${sounds.musicEnabled ? 'active' : 'inactive'}`;
      }
      const soundBtn = document.getElementById('settings-sound-btn');
      if (soundBtn) {
        soundBtn.textContent = sounds.sfxEnabled ? "🔔 ON" : "🔕 OFF";
        soundBtn.className = `settings-toggle-btn ${sounds.sfxEnabled ? 'active' : 'inactive'}`;
      }
      const volSlider = document.getElementById('settings-volume-slider');
      const volLabel = document.getElementById('settings-volume-label');
      if (volSlider) {
        const pct = Math.round(sounds.volume * 100);
        volSlider.value = pct;
        if (volLabel) volLabel.textContent = `Current: ${pct}%`;
      }
      const vibBtn = document.getElementById('settings-vibration-btn');
      if (vibBtn) {
        vibBtn.textContent = this.vibrationEnabled ? "📳 ON" : "📴 OFF";
        vibBtn.className = `settings-toggle-btn ${this.vibrationEnabled ? 'active' : 'inactive'}`;
      }
    };

    const btnMenuSettings = document.getElementById('btn-menu-settings');
    if (btnMenuSettings) {
      btnMenuSettings.addEventListener('click', () => {
        sounds.init();
        sounds.playClick();
        this.triggerVibrate(20);
        updateSettingsModalUI();
        document.getElementById('main-menu-overlay').classList.add('hidden');
        document.getElementById('settings-modal').classList.remove('hidden');
        this.inModal = true;
      });
    }

    const btnCloseSettings = document.getElementById('btn-close-settings');
    if (btnCloseSettings) {
      btnCloseSettings.addEventListener('click', () => {
        sounds.playClick();
        document.getElementById('settings-modal').classList.add('hidden');
        if (this.isInMainMenu) {
          document.getElementById('main-menu-overlay').classList.remove('hidden');
        }
        this.inModal = false;
      });
    }

    const settingsMusicBtn = document.getElementById('settings-music-btn');
    if (settingsMusicBtn) {
      settingsMusicBtn.addEventListener('click', () => {
        sounds.toggleMusic();
        this.triggerVibrate(20);
        updateSettingsModalUI();
      });
    }

    const settingsSoundBtn = document.getElementById('settings-sound-btn');
    if (settingsSoundBtn) {
      settingsSoundBtn.addEventListener('click', () => {
        sounds.toggleSound();
        this.triggerVibrate(20);
        updateSettingsModalUI();
      });
    }

    const settingsVibBtn = document.getElementById('settings-vibration-btn');
    if (settingsVibBtn) {
      settingsVibBtn.addEventListener('click', () => {
        this.vibrationEnabled = !this.vibrationEnabled;
        this.saveSettings();
        if (this.vibrationEnabled) {
          this.triggerVibrate([40, 30, 40]);
        }
        sounds.playClick();
        updateSettingsModalUI();
      });
    }

    const settingsVolSlider = document.getElementById('settings-volume-slider');
    if (settingsVolSlider) {
      settingsVolSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        sounds.setVolume(val);
        const volLabel = document.getElementById('settings-volume-label');
        if (volLabel) volLabel.textContent = `Current: ${Math.round(val * 100)}%`;
      });
    }

    // Reset Progress Modal Dialog
    const btnSettingsReset = document.getElementById('btn-settings-reset');
    if (btnSettingsReset) {
      btnSettingsReset.addEventListener('click', () => {
        sounds.playClick();
        this.triggerVibrate(40);
        document.getElementById('settings-modal').classList.add('hidden');
        document.getElementById('reset-confirm-modal').classList.remove('hidden');
      });
    }

    const btnCancelReset = document.getElementById('btn-cancel-reset');
    if (btnCancelReset) {
      btnCancelReset.addEventListener('click', () => {
        sounds.playClick();
        document.getElementById('reset-confirm-modal').classList.add('hidden');
        document.getElementById('settings-modal').classList.remove('hidden');
      });
    }

    const btnConfirmReset = document.getElementById('btn-confirm-reset');
    if (btnConfirmReset) {
      btnConfirmReset.addEventListener('click', () => {
        this.triggerVibrate([60, 40, 80]);
        try {
          localStorage.removeItem('ganesha_adventure_save');
          localStorage.removeItem('ganesha_adventure_completed');
        } catch (_) {}
        this.unlockedLevels = 1;
        this.score = 0;
        this.levelStars = {};
        this.saveProgress();
        this.recordLeaderboardScore();
        this.renderLeaderboard();
        this.updateProfileUI();
        this.updateProfileDashboardUI();
        this.loadLevel(0);

        document.getElementById('reset-confirm-modal').classList.add('hidden');
        document.getElementById('settings-modal').classList.add('hidden');
        document.getElementById('main-menu-overlay').classList.remove('hidden');
        this.isInMainMenu = true;
        this.inModal = false;
        alert("🙏 Your adventure has been reset to Level 1. Embark on the sacred path afresh!");
      });
    }

    const btnMenuHow = document.getElementById('btn-menu-how');
    if (btnMenuHow) {
      btnMenuHow.addEventListener('click', () => {
        sounds.init();
        sounds.playTrack('menu');
        document.getElementById('main-menu-overlay').classList.add('hidden');
        document.getElementById('how-to-play-modal').classList.remove('hidden');
        this.inModal = true;
      });
    }

    const btnMenuRules = document.getElementById('btn-menu-rules');
    if (btnMenuRules) {
      btnMenuRules.addEventListener('click', () => {
        sounds.init();
        sounds.playTrack('menu');
        document.getElementById('main-menu-overlay').classList.add('hidden');
        document.getElementById('game-rules-modal').classList.remove('hidden');
        this.inModal = true;
      });
    }

    const btnMenuChapters = document.getElementById('btn-menu-chapters');
    if (btnMenuChapters) {
      btnMenuChapters.addEventListener('click', () => {
        sounds.init();
        sounds.playTrack('menu');
        this.updateChaptersLockUI();
        document.getElementById('main-menu-overlay').classList.add('hidden');
        document.getElementById('chapters-index-modal').classList.remove('hidden');
        this.inModal = true;
        this.initChapterParticles();
      });
    }

    // Back to Chapters from Level Select Modal
    const btnBackToChapters = document.getElementById('btn-level-select-back-chapters');
    if (btnBackToChapters) {
      btnBackToChapters.addEventListener('click', () => {
        document.getElementById('level-select-modal').classList.add('hidden');
        this.updateChaptersLockUI();
        document.getElementById('chapters-index-modal').classList.remove('hidden');
        this.inModal = true;
        this.initChapterParticles();
      });
    }

    // Grand Final Victory Modal Buttons
    const btnVicPlayAgain = document.getElementById('btn-victory-play-again');
    if (btnVicPlayAgain) {
      btnVicPlayAgain.addEventListener('click', () => {
        document.getElementById('final-victory-modal').classList.add('hidden');
        this.inModal = false;
        this.loadLevel(0); // Restarts from Level 1, keeps unlockedLevels safe!
      });
    }

    const btnVicChapters = document.getElementById('btn-victory-chapters');
    if (btnVicChapters) {
      btnVicChapters.addEventListener('click', () => {
        document.getElementById('final-victory-modal').classList.add('hidden');
        this.updateChaptersLockUI();
        document.getElementById('chapters-index-modal').classList.remove('hidden');
        this.inModal = true;
        this.initChapterParticles();
      });
    }

    const btnVicMainMenu = document.getElementById('btn-victory-main-menu');
    if (btnVicMainMenu) {
      btnVicMainMenu.addEventListener('click', () => {
        document.getElementById('final-victory-modal').classList.add('hidden');
        this.returnToMainMenu();
      });
    }

    // Return to Main Menu from Any Modal or Screen
    ['btn-how-back', 'btn-rules-back', 'btn-chapters-back', 'btn-chapter-select-back', 'btn-hud-home', 'btn-pause-home', 'btn-level-select-home', 'btn-victory-main-menu'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => this.returnToMainMenu());
      }
    });

    // Start Game from How-To-Play & Rules
    ['btn-how-start', 'btn-rules-start'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          document.getElementById('how-to-play-modal').classList.add('hidden');
          document.getElementById('game-rules-modal').classList.add('hidden');
          this.openChapterSelect();
        });
      }
    });

    // Chapter 1 Selection (Levels 1–8)
    ['btn-select-chap-1', 'btn-index-chap-1'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          document.getElementById('chapter-select-modal').classList.add('hidden');
          document.getElementById('chapters-index-modal').classList.add('hidden');
          this.activeChapterTab = 1;
          this.updateChapterTabClasses();
          openLevelSelect();
        });
      }
    });

    // Chapter 2 Selection (Levels 9–16)
    ['btn-select-chap-2', 'btn-index-chap-2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          if (this.unlockedLevels < 9) {
            alert("Chapter 2 is locked! Complete Chapter 1 (Levels 1–8) to unlock.");
            return;
          }
          document.getElementById('chapter-select-modal').classList.add('hidden');
          document.getElementById('chapters-index-modal').classList.add('hidden');
          this.activeChapterTab = 2;
          this.updateChapterTabClasses();
          openLevelSelect();
        });
      }
    });

    // Chapter 3 Selection (Levels 17–24)
    ['btn-select-chap-3', 'btn-index-chap-3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          if (this.unlockedLevels < 17) {
            alert("Chapter 3 is locked! Complete Chapter 2 (Levels 9–16) to unlock.");
            return;
          }
          document.getElementById('chapter-select-modal').classList.add('hidden');
          document.getElementById('chapters-index-modal').classList.add('hidden');
          this.activeChapterTab = 3;
          this.updateChapterTabClasses();
          openLevelSelect();
        });
      }
    });

    // Direct Level Map Grid Buttons
    ['btn-chapter-select-open-grid', 'btn-chapters-open-select'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          document.getElementById('chapter-select-modal').classList.add('hidden');
          document.getElementById('chapters-index-modal').classList.add('hidden');
          openLevelSelect();
        });
      }
    });

    // Main Menu Audio Toggles
    const btnMenuMusic = document.getElementById('btn-menu-music');
    if (btnMenuMusic) {
      btnMenuMusic.addEventListener('click', () => {
        sounds.toggleMusic();
        const statusEl = document.getElementById('menu-music-status');
        if (statusEl) statusEl.textContent = sounds.musicEnabled ? "ON" : "OFF";
      });
    }

    const btnMenuSound = document.getElementById('btn-menu-sound');
    if (btnMenuSound) {
      btnMenuSound.addEventListener('click', () => {
        sounds.toggleSound();
        const statusEl = document.getElementById('menu-sound-status');
        if (statusEl) statusEl.textContent = sounds.sfxEnabled ? "ON" : "OFF";
      });
    }
  }

  // Chapter Selection & Lock Status Helper
  openChapterSelect() {
    this.updateChaptersLockUI();
    document.getElementById('how-to-play-modal').classList.add('hidden');
    document.getElementById('game-rules-modal').classList.add('hidden');
    document.getElementById('chapter-select-modal').classList.add('hidden');
    document.getElementById('level-select-modal').classList.add('hidden');
    document.getElementById('main-menu-overlay').classList.add('hidden');
    document.getElementById('chapters-index-modal').classList.remove('hidden');
    this.inModal = true;
    this.initChapterParticles();
    sounds.ensureMusicPlaying();
  }

  updateChaptersLockUI() {
    const c2Unlocked = this.unlockedLevels >= 9;
    const c3Unlocked = this.unlockedLevels >= 17;

    // Chapter 2 elements
    const chap2Card = document.getElementById('menu-chap-card-2');
    const chap2Status = document.getElementById('chap2-lock-status');
    const btnSelectC2 = document.getElementById('btn-select-chap-2');
    const indexCardC2 = document.getElementById('index-card-chap-2');
    const indexChap2Status = document.getElementById('index-chap2-lock-status');
    const btnIndexC2 = document.getElementById('btn-index-chap-2');

    if (c2Unlocked) {
      if (chap2Card) chap2Card.classList.add('unlocked');
      if (chap2Status) {
        chap2Status.textContent = "✓ UNLOCKED";
        chap2Status.className = "chap-status-pill status-unlocked";
      }
      if (btnSelectC2) btnSelectC2.className = "divine-btn select-chapter-action";
      if (indexCardC2) indexCardC2.classList.add('unlocked');
      if (indexChap2Status) {
        indexChap2Status.textContent = "✓ UNLOCKED";
        indexChap2Status.className = "chap-status-pill status-unlocked";
      }
      if (btnIndexC2) btnIndexC2.className = "divine-btn select-chapter-action";
    } else {
      if (chap2Card) chap2Card.classList.remove('unlocked');
      if (chap2Status) {
        chap2Status.textContent = "🔒 LOCKED (Reach L9)";
        chap2Status.className = "chap-status-pill status-locked";
      }
      if (btnSelectC2) btnSelectC2.className = "secondary-btn select-chapter-action";
      if (indexCardC2) indexCardC2.classList.remove('unlocked');
      if (indexChap2Status) {
        indexChap2Status.textContent = "🔒 LOCKED (Reach L9)";
        indexChap2Status.className = "chap-status-pill status-locked";
      }
      if (btnIndexC2) btnIndexC2.className = "secondary-btn select-chapter-action";
    }

    // Chapter 3 elements
    const chap3Card = document.getElementById('menu-chap-card-3');
    const chap3Status = document.getElementById('chap3-lock-status');
    const btnSelectC3 = document.getElementById('btn-select-chap-3');
    const indexCardC3 = document.getElementById('index-card-chap-3');
    const indexChap3Status = document.getElementById('index-chap3-lock-status');
    const btnIndexC3 = document.getElementById('btn-index-chap-3');

    if (c3Unlocked) {
      if (chap3Card) chap3Card.classList.add('unlocked');
      if (chap3Status) {
        chap3Status.textContent = "✓ UNLOCKED";
        chap3Status.className = "chap-status-pill status-unlocked";
      }
      if (btnSelectC3) btnSelectC3.className = "divine-btn select-chapter-action";
      if (indexCardC3) indexCardC3.classList.add('unlocked');
      if (indexChap3Status) {
        indexChap3Status.textContent = "✓ UNLOCKED";
        indexChap3Status.className = "chap-status-pill status-unlocked";
      }
      if (btnIndexC3) btnIndexC3.className = "divine-btn select-chapter-action";
    } else {
      if (chap3Card) chap3Card.classList.remove('unlocked');
      if (chap3Status) {
        chap3Status.textContent = "🔒 LOCKED (Reach L17)";
        chap3Status.className = "chap-status-pill status-locked";
      }
      if (btnSelectC3) btnSelectC3.className = "secondary-btn select-chapter-action";
      if (indexCardC3) indexCardC3.classList.remove('unlocked');
      if (indexChap3Status) {
        indexChap3Status.textContent = "🔒 LOCKED (Reach L17)";
        indexChap3Status.className = "chap-status-pill status-locked";
      }
      if (btnIndexC3) btnIndexC3.className = "secondary-btn select-chapter-action";
    }
  }

  returnToMainMenu() {
    sounds.playTrack('menu');
    document.getElementById('how-to-play-modal').classList.add('hidden');
    document.getElementById('game-rules-modal').classList.add('hidden');
    document.getElementById('chapters-index-modal').classList.add('hidden');
    document.getElementById('chapter-select-modal').classList.add('hidden');
    document.getElementById('level-select-modal').classList.add('hidden');
    document.getElementById('pause-modal').classList.add('hidden');
    document.getElementById('story-modal').classList.add('hidden');
    document.getElementById('cutscene-modal').classList.add('hidden');
    document.getElementById('game-over-modal').classList.add('hidden');
    document.getElementById('level-complete-modal').classList.add('hidden');
    const lbModal = document.getElementById('leaderboard-modal');
    if (lbModal) lbModal.classList.add('hidden');
    const setModal = document.getElementById('settings-modal');
    if (setModal) setModal.classList.add('hidden');
    const resetModal = document.getElementById('reset-confirm-modal');
    if (resetModal) resetModal.classList.add('hidden');
    const profDash = document.getElementById('profile-dashboard-modal');
    if (profDash) profDash.classList.add('hidden');
    const profModal = document.getElementById('player-profile-modal');
    if (profModal) profModal.classList.add('hidden');
    const welcModal = document.getElementById('welcome-screen');
    if (welcModal) welcModal.classList.add('hidden');
    const finalVic = document.getElementById('final-victory-modal');
    if (finalVic) finalVic.classList.add('hidden');
    const c1Comp = document.getElementById('chapter-complete-modal');
    if (c1Comp) c1Comp.classList.add('hidden');
    const c2Comp = document.getElementById('chapter2-complete-modal');
    if (c2Comp) c2Comp.classList.add('hidden');
    const c3Comp = document.getElementById('chapter3-complete-modal');
    if (c3Comp) c3Comp.classList.add('hidden');
    document.getElementById('main-menu-overlay').classList.remove('hidden');
    this.isInMainMenu = true;
    this.inModal = false;
    this.isPaused = true;
    this.updateProfileUI();
    this.updateProfileDashboardUI();
  }

  initChapterParticles() {
    if (this.chapterParticlesInitialized) return;
    const canvas = document.getElementById('chapterParticlesCanvas');
    if (!canvas) return;
    this.chapterParticlesInitialized = true;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const colors = ['#ffd700', '#ffb300', '#fff9c4', '#00e5ff', '#ffecb3'];
    const count = 35;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2.2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: -(Math.random() * 0.6 + 0.2),
        vx: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.7 + 0.3,
        pulse: Math.random() * Math.PI * 2
      });
    }

    const animate = () => {
      const modal = document.getElementById('chapters-index-modal');
      if (modal && !modal.classList.contains('hidden')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let p of particles) {
          p.y += p.vy;
          p.x += p.vx + Math.sin(p.pulse) * 0.25;
          p.pulse += 0.02;

          if (p.y < -10) {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
          }

          ctx.save();
          ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  initVictoryParticles() {
    if (this.victoryParticlesInitialized) return;
    const canvas = document.getElementById('victoryParticlesCanvas');
    if (!canvas) return;
    this.victoryParticlesInitialized = true;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const colors = ['#ffd700', '#ffb300', '#ff5252', '#00e5ff', '#ffffff', '#e040fb', '#76ff03'];
    const count = 55;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: Math.random() * 1.2 + 0.6,
        vx: (Math.random() - 0.5) * 1.2,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
        alpha: Math.random() * 0.8 + 0.2
      });
    }

    const animate = () => {
      const modal = document.getElementById('final-victory-modal');
      if (modal && !modal.classList.contains('hidden')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let p of particles) {
          p.y += p.vy;
          p.x += p.vx;
          p.rot += p.vRot;

          if (p.y > canvas.height + 10) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
          ctx.restore();
        }
      }
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  initMenuParticles() {
    const canvas = document.getElementById('menuParticlesCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const colors = ['#ffd700', '#ffb300', '#ff6f00', '#fff9c4', '#ffecb3'];
    const count = 45;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: -(Math.random() * 0.7 + 0.3),
        vx: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.7 + 0.3,
        pulse: Math.random() * Math.PI * 2
      });
    }

    const animate = () => {
      const menu = document.getElementById('main-menu-overlay');
      if (menu && !menu.classList.contains('hidden')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let p of particles) {
          p.y += p.vy;
          p.x += p.vx + Math.sin(p.pulse) * 0.3;
          p.pulse += 0.025;

          if (p.y < -10) {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
          }

          ctx.save();
          ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  updateChapterTabClasses() {
    ['tab-chap-1', 'tab-chap-2', 'tab-chap-3'].forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (this.activeChapterTab === i + 1) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
      if (id === 'tab-chap-3') {
        if (this.unlockedLevels < 17) el.classList.add('locked');
        else el.classList.remove('locked');
      }
    });
  }

  startCountdown() {
    this.isCountingDown = true;
    const overlay = document.getElementById('countdown-overlay');
    const textEl = document.getElementById('countdown-text');
    overlay.classList.remove('hidden');

    let count = 3;
    textEl.textContent = count;
    sounds.playCountdownBeep(false);

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        textEl.textContent = count;
        sounds.playCountdownBeep(false);
      } else if (count === 0) {
        textEl.textContent = "GO!";
        sounds.playCountdownBeep(true);
      } else {
        clearInterval(timer);
        overlay.classList.add('hidden');
        this.isCountingDown = false;
      }
    }, 800);
  }

  loadLevel(index) {
    this.currentLevelIndex = index;
    this.isPaused = false;
    this.inModal = false;
    const cfg = LEVEL_CONFIGS[index];

    this.levelScore = 0;
    this.lives = 3;
    this.updateLivesDisplay();
    this.levelStartTime = Date.now();
    this.enemiesDefeated = 0;
    this.modaksCollected = 0;
    this.lotusOrbsCollected = 0;
    this.starsCollected = 0;
    this.coinsCollected = 0;
    this.flowersCollected = 0;
    this.crystalsCollected = 0;
    this.wisdomCollectedCount = 0;
    this.bellsRungCount = 0;
    this.keysCollected = 0;
    this.divineSymbolsCollected = 0;
    this.lotusSwitchesActive = 0;
    this.isCountingDown = false;
    this.checkpoint = { x: 60, y: 380 };

    this.player = new Player(60, 380);
    this.platforms = [...cfg.platforms];
    this.movingPlatforms = cfg.movingPlatforms ? cfg.movingPlatforms.map(m => new MovingPlatform(m.x, m.y, m.width, m.height, m.moveX || 0, m.moveY || 0, m.speed || 0.03)) : [];
    this.rivers = cfg.rivers ? cfg.rivers.map(r => new SacredRiver(r.x, r.y, r.width, r.height, r.type)) : [];
    this.bells = cfg.bells ? cfg.bells.map(b => new TempleBell(b.x, b.y, b.id)) : [];
    this.clouds = cfg.clouds ? cfg.clouds.map(c => new CloudPlatform(c.x, c.y, c.width, c.height)) : [];
    this.keys = cfg.keys ? cfg.keys.map(k => new MagicalKey(k.x, k.y, k.id)) : [];
    this.divineSymbols = cfg.divineSymbols ? cfg.divineSymbols.map(s => new DivineSymbol(s.x, s.y, s.symbolId, s.label)) : [];
    this.traps = cfg.traps ? cfg.traps.map(t => new ObstacleTrap(t.x, t.y, t.width, t.height, t.type)) : [];
    this.elephantGuardian = cfg.elephantGuardian ? new ElephantGuardian(cfg.elephantGuardian.x, cfg.elephantGuardian.y) : null;
    this.enemies = cfg.enemies ? cfg.enemies.map(e => new Enemy(e.x, e.y, e.type, e.patrolMinX, e.patrolMaxX)) : [];

    if (cfg.boss) {
      if (cfg.bossType === 'asura_warlord') {
        this.boss = new AsuraWarlordBoss(cfg.boss.x, cfg.boss.y, cfg.boss.maxHp || 380);
      } else if (cfg.bossType === 'forest_guardian') {
        this.boss = new ForestGuardianBoss(cfg.boss.x, cfg.boss.y, cfg.boss.maxHp || 400);
      } else if (cfg.bossType && cfg.bossType.startsWith('vighnasura')) {
        this.boss = new VighnasuraBoss(cfg.boss.x, cfg.boss.y, cfg.boss.maxHp);
      } else {
        this.boss = new ShivaBoss(cfg.boss.x, cfg.boss.y);
      }
    } else {
      this.boss = null;
    }

    this.rival = cfg.rival ? new RivalRacer(cfg.rival.x, cfg.rival.y, cfg.rival.speed, cfg.goalX) : null;
    this.boostPads = cfg.boostPads ? cfg.boostPads.map(b => new SpeedBoostPad(b.x, b.y)) : [];
    this.fallingRocks = cfg.fallingRocks ? cfg.fallingRocks.map(r => new FallingRock(r.x, r.triggerX)) : [];
    this.wisdomSymbols = cfg.wisdomSymbols ? cfg.wisdomSymbols.map(s => new WisdomSymbol(s.x, s.y, s.symbolId, s.label)) : [];

    this.collectibles = cfg.collectibles ? cfg.collectibles.map(c => new Collectible(c.x, c.y, c.type)) : [];
    this.altars = cfg.altars ? cfg.altars.map(a => new ShrineAltar(a.x, a.y, a.isGoal)) : [];
    this.switches = cfg.switches ? cfg.switches.map(s => new PuzzleSwitch(s.x, s.y, s.targetGateId)) : [];
    this.gates = cfg.gates ? cfg.gates.map(g => new PuzzleGate(g.x, g.y, g.width, g.height, g.id)) : [];
    this.defenseTarget = cfg.defenseTarget ? new DefenseTarget(cfg.defenseTarget.x, cfg.defenseTarget.y, cfg.defenseTarget.type) : null;

    this.projectiles = [];
    this.particles.particles = [];

    // Update HUD
    document.getElementById('chapter-label').textContent = `Chapter ${cfg.chapter || 1}`;
    document.getElementById('level-title-display').textContent = `Level ${cfg.levelNum}: ${cfg.title}`;

    // Defense Meter
    const defMeter = document.getElementById('defense-meter');
    if (this.defenseTarget) {
      defMeter.classList.remove('hidden');
      document.getElementById('defense-icon').textContent = cfg.defenseType === 'crystal' ? '💎' : '🛡️';
    } else {
      defMeter.classList.add('hidden');
    }

    // Race Progress Bar
    const raceHud = document.getElementById('race-hud');
    if (cfg.isRaceLevel) {
      raceHud.classList.remove('hidden');
    } else {
      raceHud.classList.add('hidden');
    }

    // Wisdom Hint Box
    const wisdomHint = document.getElementById('wisdom-hint');
    if (cfg.hasWisdomPuzzle) {
      wisdomHint.classList.remove('hidden');
      wisdomHint.innerHTML = '<span class="wisdom-hint-text">Sacred Order: 1. ॐ (Truth) ➔ 2. 🔱 (Duty) ➔ 3. 🌺 (Wisdom)</span>';
    } else {
      wisdomHint.classList.add('hidden');
    }

    this.updateHUD();

    const banner = document.getElementById('tutorial-banner');
    if (cfg.tutorialText) {
      document.getElementById('tutorial-text').textContent = cfg.tutorialText;
      banner.classList.remove('hidden');
      setTimeout(() => banner.classList.add('hidden'), 6000);
    } else {
      banner.classList.add('hidden');
    }

    if (cfg.hasPreCutscene) {
      this.showCutscene("The Arrival at Kailash Gates", cfg.cutsceneDialogue, 'shiva_arrival');
    } else {
      this.showStoryPanel(cfg);
    }
  }

  showStoryPanel(cfg) {
    if (this.isInMainMenu) return;
    document.getElementById('story-level-title').textContent = `Level ${cfg.levelNum}: ${cfg.title}`;
    document.getElementById('story-speaker-name').textContent = cfg.speaker;
    document.getElementById('story-avatar').textContent = cfg.avatar;
    document.getElementById('story-description-text').textContent = cfg.story;
    document.getElementById('story-mission-text').textContent = cfg.mission;
    document.getElementById('btn-story-action').textContent = cfg.hasCountdown ? "Start Countdown" : "Start Level";
    document.getElementById('story-modal').classList.remove('hidden');
    this.inModal = true;
  }

  showCutscene(title, dialogue, sceneType) {
    if (this.isInMainMenu) return;
    document.getElementById('cutscene-title').textContent = title;
    document.getElementById('cutscene-text').textContent = `"${dialogue}"`;
    this.drawCutsceneCanvas(sceneType);
    document.getElementById('cutscene-modal').classList.remove('hidden');
    this.inModal = true;
  }

  drawCutsceneCanvas(sceneType) {
    const ctx = this.cutsceneCtx;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a0218');
    grad.addColorStop(0.6, '#280c45');
    grad.addColorStop(1, '#ff6f00');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    if (sceneType === 'shiva_arrival') {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(180, 140, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffb300';
      ctx.fillRect(166, 164, 28, 45);

      const aura = ctx.createRadialGradient(520, 130, 10, 520, 130, 80);
      aura.addColorStop(0, 'rgba(0, 229, 255, 0.7)');
      aura.addColorStop(1, 'transparent');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(520, 130, 80, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e0f7fa';
      ctx.beginPath();
      ctx.arc(520, 115, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(504, 141, 32, 50);

      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(560, 70);
      ctx.lineTo(560, 210);
      ctx.stroke();
    } else {
      const aura = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 180);
      aura.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      aura.addColorStop(0.4, 'rgba(255, 215, 0, 0.6)');
      aura.addColorStop(1, 'transparent');
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#ff8f00';
      ctx.font = '22px Cinzel Decorative, serif';
      ctx.textAlign = 'center';
      const label = sceneType === 'wisdom_climax' ? '“True wisdom is greater than speed.”' : 'Cosmic Harmony Restored';
      ctx.fillText(label, w / 2, h / 2 + 10);
    }
  }

  onCollectWisdomSymbol(symbol, particles) {
    const nextExpected = this.wisdomCollectedCount + 1;
    if (symbol.symbolId === nextExpected) {
      symbol.isCollected = true;
      this.wisdomCollectedCount++;
      sounds.playCollect();
      particles.emitSparks(symbol.x + 14, symbol.y + 14, 16, '#ffd700');

      const hintEl = document.getElementById('wisdom-hint');
      if (this.wisdomCollectedCount === 1) {
        hintEl.innerHTML = '<span class="wisdom-hint-text">1. ॐ [✓] ➔ Next: 2. 🔱 (Duty) ➔ 3. 🌺 (Wisdom)</span>';
      } else if (this.wisdomCollectedCount === 2) {
        hintEl.innerHTML = '<span class="wisdom-hint-text">1. ॐ [✓] ➔ 2. 🔱 [✓] ➔ Next: 3. 🌺 (Wisdom)</span>';
      } else if (this.wisdomCollectedCount === 3) {
        hintEl.innerHTML = '<span class="wisdom-hint-text" style="color: #ffd700;">✨ All 3 Wisdom Glyphs United! Gates Open! ✨</span>';
        this.openGate(99);
      }
    } else {
      // Out of order!
      sounds.playHit();
      const hintEl = document.getElementById('wisdom-hint');
      hintEl.innerHTML = '<span class="wisdom-hint-text" style="color: #ff5252;">⚠️ Collect in sacred order: 1. ॐ (Truth) ➔ 2. 🔱 ➔ 3. 🌺</span>';
    }
  }

  triggerDivineShockwave(x, y, radius) {
    for (const enemy of this.enemies) {
      if (enemy.isAlive) {
        const d = Math.hypot(enemy.x + enemy.width / 2 - x, enemy.y + enemy.height / 2 - y);
        if (d < radius) {
          enemy.takeHit(40, this.particles);
          enemy.vx = (enemy.x > x ? 1 : -1) * 6;
        }
      }
    }

    if (this.boss && this.boss.isAlive) {
      const d = Math.hypot(this.boss.x + this.boss.width / 2 - x, this.boss.y + this.boss.height / 2 - y);
      if (d < radius) {
        this.boss.takeHit(30, this.particles);
      }
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      const d = Math.hypot(proj.x - x, proj.y - y);
      if (d < radius) {
        proj.isAlive = false;
        this.particles.emitSparks(proj.x, proj.y, 6, '#ffd700');
      }
    }
  }

  triggerTrunkBlast(x, y, facing) {
    const beamLength = 800;
    const beamX = facing === 1 ? x : x - beamLength;
    const beamBox = { x: beamX, y: y - 16, width: beamLength, height: 32 };

    this.particles.emitSparks(x, y, 15, '#ffd700');
    this.particles.emitAuraRing(x, y, 60, '#00e5ff');

    for (const enemy of this.enemies) {
      if (enemy.isAlive && enemy.collidesWith(beamBox)) {
        enemy.takeHit(35, this.particles);
        enemy.vx = facing * 7;
      }
    }

    if (this.boss && this.boss.isAlive && this.boss.hitTimer <= 0) {
      if (
        beamBox.x < this.boss.x + this.boss.width &&
        beamBox.x + beamBox.width > this.boss.x &&
        beamBox.y < this.boss.y + this.boss.height &&
        beamBox.y + beamBox.height > this.boss.y
      ) {
        this.boss.takeHit(30, this.particles);
      }
    }

    this.projectiles.push(new Projectile(beamX, y - 6, 0, 0, 'beam', 0));
  }

  openGate(gateId) {
    for (const gate of this.gates) {
      if (gate.id === gateId) {
        gate.isOpen = true;
      }
    }
  }

  spawnTridentBeam(x, y, vx) {
    this.projectiles.push(new Projectile(x, y, vx, 0, 'beam', 16));
  }

  spawnShockwave(x, y, vx) {
    this.projectiles.push(new Projectile(x, y, vx, 0, 'shockwave', 14));
  }

  onEnemyDefeated(enemy) {
    this.enemiesDefeated++;
    let score = 80;
    let coins = 1;

    if (enemy.type === 'asura_grunt') {
      score = 80; coins = 1;
    } else if (enemy.type === 'asura_scout') {
      score = 100; coins = 2;
    } else if (enemy.type === 'asura_patrol') {
      score = 120; coins = 2;
    } else if (enemy.type === 'shadow_beast') {
      score = 150; coins = 3;
    } else if (enemy.type === 'corrupted_wisp') {
      score = 140; coins = 2;
    } else if (enemy.type === 'armored_asura') {
      score = 250; coins = 5;
    } else if (enemy.type === 'dark_sorcerer') {
      score = 300; coins = 5;
    } else if (enemy instanceof AsuraWarlordBoss || enemy.type === 'asura_warlord' || enemy.type === 'miniboss' || enemy.type === 'asura_chieftain') {
      score = 1000; coins = 20;
    }

    this.addScore(score);
    this.coinsCollected += coins;
    sounds.playCoin();

    // Floating text rewards
    const ex = enemy.x + (enemy.width ? enemy.width / 2 : 20);
    const ey = enemy.y;
    this.particles.emitFloatingText(ex, ey - 12, `+${score} ⭐`, '#ffd700', 14);
    this.particles.emitFloatingText(ex, ey + 8, `+${coins} 🪙`, '#ffb300', 13);
    this.updateHUD();

    // If Mini-Boss or Level 16 Boss is defeated, trigger Chapter 2 celebration
    if (enemy instanceof AsuraWarlordBoss || enemy.type === 'asura_warlord' || (this.currentLevelIndex === 15 && (enemy.type === 'miniboss' || this.boss === enemy))) {
      sounds.playVictory();
      this.unlockedLevels = Math.max(this.unlockedLevels, 17);
      this.saveProgress();
      setTimeout(() => {
        this.showChapter2Celebration();
      }, 1200);
    }
  }

  onShivaDuelComplete() {
    sounds.playVictory();
    this.showCutscene("Transcendent Harmony", LEVEL_CONFIGS[4].cutsceneDialogue, 'duel_climax');
  }

  onVighnasuraDefeated() {
    sounds.playVictory();
    if (this.currentLevelIndex === 15) {
      this.showCutscene("Vighnasura's Devotion", LEVEL_CONFIGS[15].cutsceneDialogue, 'c2_climax');
    } else {
      this.triggerLevelComplete();
    }
  }

  onForestGuardianSoothed() {
    sounds.playVictory();
    this.addScore(1500);
    this.triggerLevelComplete();
  }

  onBellRung(bellId) {
    this.bellsRungCount++;
    this.addScore(150);
    const cfg = LEVEL_CONFIGS[this.currentLevelIndex];
    if (cfg && cfg.requiredBells && this.bellsRungCount >= cfg.requiredBells) {
      this.openGate(99);
    }
  }

  onKeyCollected(keyId) {
    this.keysCollected++;
    this.addScore(200);
    this.openGate(keyId);
  }

  onDivineSymbolCollected(symbolId) {
    this.divineSymbolsCollected++;
    this.addScore(300);
    const cfg = LEVEL_CONFIGS[this.currentLevelIndex];
    if (cfg && cfg.requiredSymbols && this.divineSymbolsCollected >= cfg.requiredSymbols) {
      this.openGate(99);
    }
  }

  onDefenseTargetFailed() {
    this.onPlayerDefeated();
  }

  checkLevelGoalAchieved() {
    const cfg = LEVEL_CONFIGS[this.currentLevelIndex];

    if (cfg.requiredKills && this.enemiesDefeated < cfg.requiredKills) return;
    if (cfg.requiredOrbs && this.lotusOrbsCollected < cfg.requiredOrbs) return;
    if (cfg.requiredStars && this.starsCollected < cfg.requiredStars) return;
    if (cfg.requiredCoins && this.coinsCollected < cfg.requiredCoins) return;
    if (cfg.requiredBells && this.bellsRungCount < cfg.requiredBells) return;
    if (cfg.requiredKeys && this.keysCollected < cfg.requiredKeys) return;
    if (cfg.requiredSymbols && this.divineSymbolsCollected < cfg.requiredSymbols) return;

    if (cfg.hasWisdomPuzzle && this.wisdomCollectedCount < 3) return;

    if (this.currentLevelIndex === 23) {
      // Level 24 finale cutscene
      this.showCutscene("The Supreme Blessing", LEVEL_CONFIGS[23].cutsceneDialogue, 'wisdom_climax');
      return;
    }

    this.triggerLevelComplete();
  }

  triggerLevelComplete() {
    sounds.playVictory();
    sounds.playTrack('victory');
    const cfg = LEVEL_CONFIGS[this.currentLevelIndex];

    if (this.currentLevelIndex + 1 >= this.unlockedLevels) {
      this.unlockedLevels = Math.min(24, this.currentLevelIndex + 2);
    }

    // Calculate Stars (1 to 3 ⭐)
    let stars = 1;
    const totalCollectibles = (cfg.collectibles ? cfg.collectibles.length : 0);
    const collectedItems = this.modaksCollected + this.coinsCollected + this.flowersCollected + this.starsCollected + this.crystalsCollected;
    if (totalCollectibles > 0 && collectedItems >= Math.floor(totalCollectibles * 0.7)) {
      stars = 2;
    }
    if (this.lives === 3 && (totalCollectibles === 0 || collectedItems >= Math.floor(totalCollectibles * 0.9))) {
      stars = 3;
    }
    this.levelStars[this.currentLevelIndex] = Math.max(this.levelStars[this.currentLevelIndex] || 0, stars);
    this.saveProgress();
    this.recordLeaderboardScore();

    if (this.currentLevelIndex === 7) {
      this.showChapter1Celebration();
      return;
    }

    if (this.currentLevelIndex === 15) {
      this.showChapter2Celebration();
      return;
    }

    if (this.currentLevelIndex === 23) {
      this.showFinalVictoryScreen();
      return;
    }

    // Populate Level Complete Modal
    const starsEl = document.getElementById('complete-stars');
    if (starsEl) {
      starsEl.innerHTML = `
        <span class="star-icon ${stars >= 1 ? 'active' : ''}">⭐</span>
        <span class="star-icon ${stars >= 2 ? 'active' : ''}">⭐</span>
        <span class="star-icon ${stars >= 3 ? 'active' : ''}">⭐</span>
      `;
    }

    const elapsedSeconds = Math.max(1, Math.floor((Date.now() - this.levelStartTime) / 1000));
    const timeEl = document.getElementById('complete-time');
    if (timeEl) timeEl.textContent = `${elapsedSeconds}s`;

    const livesEl = document.getElementById('complete-lives');
    if (livesEl) livesEl.textContent = `${this.lives} / 3 ❤️`;

    const compModaks = document.getElementById('complete-modaks');
    if (compModaks) compModaks.textContent = this.modaksCollected;
    const compEnemies = document.getElementById('complete-enemies');
    if (compEnemies) compEnemies.textContent = this.enemiesDefeated;
    const compScore = document.getElementById('complete-score');
    if (compScore) compScore.textContent = this.levelScore;
    const compStory = document.getElementById('complete-story-text');
    if (compStory) compStory.textContent = cfg.completionStory;

    const badgesEl = document.getElementById('complete-badges');
    if (badgesEl) {
      let badgeList = [];
      if (this.lives === 3) badgeList.push('<span class="achievement-badge">🛡️ Flawless Protection</span>');
      if (this.modaksCollected >= 10 || (totalCollectibles > 0 && this.modaksCollected === totalCollectibles)) badgeList.push('<span class="achievement-badge">🍬 Modak Devotee</span>');
      if (stars === 3) badgeList.push('<span class="achievement-badge">🌟 Divine Mastery</span>');
      if (elapsedSeconds < 45) badgeList.push('<span class="achievement-badge">⚡ Swift Blessings</span>');
      badgesEl.innerHTML = badgeList.join('');
    }

    const unlAnnounce = document.getElementById('complete-unlocked-msg') || document.getElementById('unlocked-level-announcement');
    if (unlAnnounce) {
      if (this.currentLevelIndex + 1 < 24) {
        unlAnnounce.textContent = `🕉️ Level ${this.currentLevelIndex + 2} Unlocked!`;
        unlAnnounce.classList.remove('hidden');
      } else {
        unlAnnounce.textContent = `✨ All Divine Levels Mastered!`;
        unlAnnounce.classList.remove('hidden');
      }
    }

    document.getElementById('level-complete-modal').classList.remove('hidden');
    this.inModal = true;
  }

  showFinalVictoryScreen() {
    sounds.playVictory();
    sounds.playTrack('victory');
    this.isGameCompleted = true;
    try {
      localStorage.setItem('ganesha_adventure_completed', 'true');
    } catch (_) {}

    let totalStars = 0;
    for (let i = 0; i < 24; i++) {
      totalStars += (this.levelStars[i] || 3);
    }
    const finalStarsEl = document.getElementById('final-victory-stars') || document.getElementById('final-total-stars');
    if (finalStarsEl) finalStarsEl.textContent = `${Math.min(72, totalStars)} / 72`;

    const totalScoreEl = document.getElementById('final-victory-score');
    if (totalScoreEl) totalScoreEl.textContent = this.score.toLocaleString();

    const totalModaksEl = document.getElementById('final-victory-modaks') || document.getElementById('final-total-modaks');
    if (totalModaksEl) totalModaksEl.textContent = (this.modaksCollected + 144).toLocaleString();

    document.getElementById('level-complete-modal').classList.add('hidden');
    document.getElementById('chapter3-complete-modal').classList.add('hidden');
    document.getElementById('final-victory-modal').classList.remove('hidden');
    this.inModal = true;
    this.initVictoryParticles();
  }

  showChapter1Celebration() {
    sounds.playTrack('victory');
    document.getElementById('grand-total-score').textContent = this.score;
    this.drawGaneshaTransformation();
    document.getElementById('chapter-complete-modal').classList.remove('hidden');
    this.inModal = true;
  }

  showChapter2Celebration() {
    sounds.playTrack('victory');
    const totalScoreEl = document.getElementById('chapter2-total-score');
    if (totalScoreEl) totalScoreEl.textContent = this.score;
    this.drawChapter2Finale();
    document.getElementById('chapter2-complete-modal').classList.remove('hidden');
    this.inModal = true;
  }

  showChapter3Celebration() {
    this.showFinalVictoryScreen();
  }

  drawGaneshaTransformation() {
    const ctx = this.transformCtx;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, 160);
    bgGrad.addColorStop(0, '#ffd700');
    bgGrad.addColorStop(0.5, '#ff6f00');
    bgGrad.addColorStop(1, '#1b0833');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + Math.cos(a) * 200, h / 2 + Math.sin(a) * 200);
      ctx.stroke();
    }

    const cx = w / 2;
    const cy = h / 2 + 10;

    ctx.fillStyle = '#f48fb1';
    for (let p = -40; p <= 40; p += 20) {
      ctx.beginPath();
      ctx.ellipse(cx + p, cy + 60, 16, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(cx, cy + 20, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy - 35);
    ctx.lineTo(cx, cy - 65);
    ctx.lineTo(cx + 24, cy - 35);
    ctx.fill();

    ctx.fillStyle = '#ffecb3';
    ctx.beginPath();
    ctx.arc(cx, cy - 15, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(cx - 36, cy - 15, 14, 20, -0.2, 0, Math.PI * 2);
    ctx.ellipse(cx + 36, cy - 15, 14, 20, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffecb3';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6);
    ctx.quadraticCurveTo(cx - 12, cy + 18, cx - 22, cy + 6);
    ctx.stroke();

    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(cx - 24, cy + 4, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  drawChapter2Finale() {
    if (!this.c2Ctx) return;
    const ctx = this.c2Ctx;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#00e5ff');
    grad.addColorStop(0.5, '#ffd700');
    grad.addColorStop(1, '#0d021f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#fff';
    ctx.font = '22px Cinzel Decorative, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Lord Ganesha – The Supreme Protector', w / 2, h / 2);
  }

  drawChapter3Finale() {
    if (!this.c3Ctx) return;
    const ctx = this.c3Ctx;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#ffd700');
    grad.addColorStop(0.5, '#ff6f00');
    grad.addColorStop(1, '#1b0833');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Radiant sunbeams
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + Math.cos(a) * 220, h / 2 + Math.sin(a) * 220);
      ctx.stroke();
    }

    ctx.fillStyle = '#fff';
    ctx.font = '20px Cinzel Decorative, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Supreme Wisdom of Lord Ganesha', w / 2, h / 2 - 10);
    ctx.font = '14px Philosopher, sans-serif';
    ctx.fillStyle = '#fff9c4';
    ctx.fillText('“True wisdom is greater than speed.”', w / 2, h / 2 + 25);
  }

  initLevelGrid() {
    this.updateChapterTabClasses();
    this.renderLevelGrid();
  }

  renderLevelGrid() {
    const grid = document.getElementById('level-grid');
    if (!grid) return;
    grid.innerHTML = '';

    let startIdx = 0;
    let endIdx = 8;
    if (this.activeChapterTab === 2) {
      startIdx = 8; endIdx = 16;
    } else if (this.activeChapterTab === 3) {
      startIdx = 16; endIdx = 24;
    }

    const chapterSubtitles = {
      1: "Chapter 1: The Divine Awakening (Levels 1–8)",
      2: "Chapter 2: The Sacred Trials (Levels 9–16)",
      3: "Chapter 3: The Great Divine Race (Levels 17–24)"
    };
    const subTitleEl = document.getElementById('level-select-subtitle');
    if (subTitleEl) {
      subTitleEl.textContent = chapterSubtitles[this.activeChapterTab] || "Choose any unlocked divine trial to play";
    }

    const visibleConfigs = LEVEL_CONFIGS.slice(startIdx, endIdx);

    visibleConfigs.forEach((cfg, offset) => {
      const idx = startIdx + offset;
      const tile = document.createElement('div');
      const isUnlocked = idx < this.unlockedLevels;
      const isCompleted = (idx + 1 < this.unlockedLevels) || (this.unlockedLevels === 24 && this.isGameCompleted);
      const isCurrent = isUnlocked && !isCompleted;

      tile.className = `level-tile ${isUnlocked ? 'unlocked' : 'locked'}`;

      let badgeHtml = '';
      if (isCompleted) {
        badgeHtml = '<span class="tile-badge completed">✓ Done</span>';
      } else if (isCurrent) {
        badgeHtml = '<span class="tile-badge current">▶ Play</span>';
      } else {
        badgeHtml = '<span class="tile-badge locked">🔒 Locked</span>';
      }

      const starsForLevel = this.levelStars[idx] || (isCompleted ? 3 : 0);
      let starsHtml = '';
      if (isUnlocked && starsForLevel > 0) {
        starsHtml = `<div class="tile-stars" style="color: #ffd700; font-size: 13px; margin: 2px 0;">${'⭐'.repeat(starsForLevel)}</div>`;
      }

      tile.innerHTML = `
        <span class="tile-number">${isUnlocked ? '🕉️ Level ' + cfg.levelNum : '🔒 Level ' + cfg.levelNum}</span>
        <span class="tile-title">${cfg.title}</span>
        ${starsHtml}
        ${badgeHtml}
      `;

      if (isUnlocked) {
        tile.style.cursor = 'pointer';
        tile.addEventListener('click', () => {
          document.getElementById('level-select-modal').classList.add('hidden');
          this.inModal = false;
          this.loadLevel(idx);
        });
      }
      grid.appendChild(tile);
    });
  }

  setCheckpoint(x, y) {
    this.checkpoint = { x, y };
  }

  updateLivesDisplay() {
    const heartsEl = document.getElementById('lives-display') || document.getElementById('lives-hearts');
    if (!heartsEl) return;
    let heartsHtml = '';
    for (let i = 0; i < this.maxLives; i++) {
      if (i < this.lives) {
        heartsHtml += '<span class="heart-icon active">❤️</span>';
      } else {
        heartsHtml += '<span class="heart-icon lost">🖤</span>';
      }
    }
    heartsEl.innerHTML = heartsHtml;
  }

  respawnPlayer() {
    this.player.x = this.checkpoint.x;
    this.player.y = this.checkpoint.y;
    this.player.vx = 0;
    this.player.vy = 0;
  }

  loseLife(reason = "Hazard") {
    if (this.player.invulnerableTimer > 0) return;
    this.lives = Math.max(0, this.lives - 1);
    sounds.playHit();
    this.updateLivesDisplay();
    const heartsEl = document.getElementById('lives-display') || document.getElementById('lives-hearts');
    if (heartsEl) {
      heartsEl.classList.add('hurt');
      setTimeout(() => heartsEl.classList.remove('hurt'), 600);
    }
    this.particles.emitSparks(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 20, '#ff5252');

    if (this.lives <= 0) {
      this.onGameOver(reason);
    } else {
      this.respawnPlayer();
      this.player.invulnerableTimer = 90;
      this.player.health = this.player.maxHealth;
    }
  }

  onGameOver(reason = "Hazard") {
    sounds.playGameOver();
    sounds.playTrack('gameover');
    const descEl = document.getElementById('game-over-desc') || document.querySelector('#game-over-modal .fail-desc');
    if (descEl) {
      descEl.textContent = `Lord Ganesha encountered ${reason}. Keep your faith and try again!`;
    }
    document.getElementById('game-over-modal').classList.remove('hidden');
    this.inModal = true;
  }

  onPlayerDefeated() {
    this.loseLife("Trial Failed");
  }

  restartLevel() {
    document.getElementById('pause-modal').classList.add('hidden');
    document.getElementById('game-over-modal').classList.add('hidden');
    this.isPaused = false;
    this.inModal = false;
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) btnPause.textContent = 'II';
    const touchPause = document.getElementById('touch-pause');
    if (touchPause) touchPause.textContent = 'II';
    this.loadLevel(this.currentLevelIndex);
  }

  togglePause() {
    if (this.inModal && !this.isPaused) return;
    this.isPaused = !this.isPaused;
    const pauseModal = document.getElementById('pause-modal');
    const btnPause = document.getElementById('btn-pause');
    const touchPause = document.getElementById('touch-pause');
    if (this.isPaused) {
      pauseModal.classList.remove('hidden');
      this.inModal = true;
      if (btnPause) btnPause.textContent = '▶';
      if (touchPause) touchPause.textContent = '▶';
    } else {
      pauseModal.classList.add('hidden');
      this.inModal = false;
      if (btnPause) btnPause.textContent = 'II';
      if (touchPause) touchPause.textContent = 'II';
    }
  }

  addScore(pts) {
    this.score += pts;
    this.levelScore += pts;
    this.saveProgress();
    this.recordLeaderboardScore();
    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('health-bar').style.width = `${Math.max(0, (this.player.health / this.player.maxHealth) * 100)}%`;
    document.getElementById('health-text').textContent = `${Math.ceil(this.player.health)} / 100`;

    document.getElementById('energy-bar').style.width = `${Math.max(0, (this.player.energy / this.player.maxEnergy) * 100)}%`;
    document.getElementById('energy-text').textContent = `${Math.ceil(this.player.energy)} / 100`;

    if (this.defenseTarget) {
      const defPct = Math.max(0, (this.defenseTarget.health / this.defenseTarget.maxHealth) * 100);
      document.getElementById('defense-bar').style.width = `${defPct}%`;
      document.getElementById('defense-text').textContent = `${Math.ceil(this.defenseTarget.health)} / 100`;
    }

    const scoreEl = document.getElementById('score-text');
    if (scoreEl) scoreEl.textContent = this.score;

    const coinsEl = document.getElementById('coins-text');
    if (coinsEl) coinsEl.textContent = this.coinsCollected;

    const modaksEl = document.getElementById('modaks-text');
    if (modaksEl) modaksEl.textContent = this.modaksCollected;

    // Race HUD update
    const cfg = LEVEL_CONFIGS[this.currentLevelIndex];
    if (cfg && cfg.isRaceLevel && this.rival) {
      const trackLen = cfg.goalX || 2500;
      const ganeshaPct = Math.min(94, Math.max(5, (this.player.x / trackLen) * 94));
      const kartikeyaPct = Math.min(94, Math.max(5, (this.rival.x / trackLen) * 94));

      const ganeshaMarker = document.getElementById('racer-ganesha');
      const kartikeyaMarker = document.getElementById('racer-kartikeya');
      if (ganeshaMarker) ganeshaMarker.style.left = `${ganeshaPct}%`;
      if (kartikeyaMarker) kartikeyaMarker.style.left = `${kartikeyaPct}%`;
    }
  }

  loop(timestamp) {
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (!this.isPaused && !this.inModal) {
      this.update();
    }

    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  update() {
    // 1. Update moving platforms first so dx/dy are current
    for (const mp of this.movingPlatforms) {
      mp.update();
    }

    // 2. Combine active solid surfaces: platforms, moving platforms, cloud platforms, gates
    const activePlats = [...this.platforms, ...this.movingPlatforms, ...this.clouds, ...this.gates];
    this.player.update(this.input, activePlats, this.particles);

    // 3. Sacred River water hazards
    for (const river of this.rivers) {
      river.update(this.player, this.particles);
    }

    // 4. Cloud floating animation
    for (const cloud of this.clouds) {
      cloud.update();
    }

    // 5. Temple Bells
    for (const bell of this.bells) {
      bell.update(this.player, this.particles);
    }

    // 6. Magical Keys
    for (const key of this.keys) {
      key.update(this.player, this.particles);
    }

    // 7. Divine Symbols
    for (const sym of this.divineSymbols) {
      sym.update(this.player, this.particles);
    }

    // 8. Obstacle Traps
    for (const trap of this.traps) {
      trap.update(this.player, this.particles);
    }

    // 9. Friendly Elephant Guardian
    if (this.elephantGuardian) {
      this.elephantGuardian.update(this.player, this.particles);
    }

    // 10. Attack Hitbox Checks
    if (this.player.isAttacking) {
      const hb = this.player.attackHitbox;

      for (const enemy of this.enemies) {
        if (enemy.isAlive && !this.player.hitEnemiesThisSwing.has(enemy) && enemy.collidesWith(hb)) {
          enemy.takeHit(28, this.particles);
          enemy.vx = this.player.facing * 4;
          this.player.hitEnemiesThisSwing.add(enemy);
        }
      }

      if (this.boss && this.boss.isAlive && !this.player.hitEnemiesThisSwing.has(this.boss) && this.boss.hitTimer <= 0) {
        if (
          hb.x < this.boss.x + this.boss.width &&
          hb.x + hb.width > this.boss.x &&
          hb.y < this.boss.y + this.boss.height &&
          hb.y + hb.height > this.boss.y
        ) {
          this.boss.takeHit(18, this.particles);
          this.player.hitEnemiesThisSwing.add(this.boss);
        }
      }
    }

    for (const enemy of this.enemies) {
      enemy.update(this.player, activePlats, this.particles);
    }

    if (this.boss) {
      this.boss.update(this.player, this.particles);
    }

    if (this.rival) {
      this.rival.update(this.player);
    }

    for (const pad of this.boostPads) {
      pad.update(this.player, this.particles);
    }

    for (const rock of this.fallingRocks) {
      rock.update(this.player, this.particles);
    }

    for (const sym of this.wisdomSymbols) {
      sym.update(this.player, this.particles);
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(this.player, this.particles);
      if (!p.isAlive) this.projectiles.splice(i, 1);
    }

    for (const item of this.collectibles) {
      item.update(this.player, this.particles);
    }

    for (const altar of this.altars) {
      altar.update(this.player, this.particles);
    }

    // Auto goal completion when reaching end goal coordinate
    const currentCfg = LEVEL_CONFIGS[this.currentLevelIndex];
    if (currentCfg && currentCfg.goalX && this.player.x >= currentCfg.goalX && !this.inModal && !this.isCountingDown && !this.isInMainMenu) {
      this.checkLevelGoalAchieved();
    }

    for (const sw of this.switches) {
      sw.update(this.player, activePlats, this.particles);
    }
    for (const gate of this.gates) {
      gate.update();
    }

    this.particles.update();

    const targetCamX = this.player.x - 300;
    this.cameraX += (targetCamX - this.cameraX) * 0.1;
    if (this.cameraX < 0) this.cameraX = 0;

    this.updateHUD();
  }

  render() {
    const ctx = this.ctx;
    const cfg = LEVEL_CONFIGS[this.currentLevelIndex];

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Parallax Background
    this.bg.draw(ctx, this.cameraX, cfg.theme);

    // Sacred Rivers (rendered behind/under bridges & platforms)
    for (const river of this.rivers) {
      river.draw(ctx, this.cameraX);
    }

    // Platforms
    ctx.save();
    for (const plat of this.platforms) {
      const screenX = plat.x - this.cameraX;

      if (cfg.theme === 'palace' || cfg.theme === 'divine_kingdom' || cfg.theme === 'sacred_circle') {
        ctx.fillStyle = '#eceff1';
        ctx.fillRect(screenX, plat.y, plat.width, plat.height);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(screenX, plat.y, plat.width, 5);
      } else if (cfg.theme === 'kailash' || cfg.theme === 'mountain_trials') {
        ctx.fillStyle = '#37474f';
        ctx.fillRect(screenX, plat.y, plat.width, plat.height);
        ctx.fillStyle = '#e0f7fa';
        ctx.fillRect(screenX, plat.y, plat.width, 6);
      } else if (cfg.theme === 'peacock_realm') {
        ctx.fillStyle = '#004d40';
        ctx.fillRect(screenX, plat.y, plat.width, plat.height);
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(screenX, plat.y, plat.width, 5);
      } else if (cfg.theme === 'cosmic_journey') {
        ctx.fillStyle = '#311b92';
        ctx.fillRect(screenX, plat.y, plat.width, plat.height);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(screenX, plat.y, plat.width, 5);
      } else if (cfg.theme === 'divine_race_track') {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(screenX, plat.y, plat.width, plat.height);
        ctx.fillStyle = '#ff9100';
        ctx.fillRect(screenX, plat.y, plat.width, 6);
      } else if (cfg.theme === 'village') {
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(screenX, plat.y, plat.width, plat.height);
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(screenX, plat.y, plat.width, 5);
      } else if (cfg.theme === 'ancient_temple' || cfg.theme === 'wisdom_temple') {
        ctx.fillStyle = '#4e342e';
        ctx.fillRect(screenX, plat.y, plat.width, plat.height);
        ctx.fillStyle = '#ffb300';
        ctx.fillRect(screenX, plat.y, plat.width, 5);
      } else if (cfg.theme === 'fortress') {
        ctx.fillStyle = '#212121';
        ctx.fillRect(screenX, plat.y, plat.width, plat.height);
        ctx.fillStyle = '#b71c1c';
        ctx.fillRect(screenX, plat.y, plat.width, 5);
      } else {
        // Forest
        ctx.fillStyle = cfg.theme === 'corrupted_forest' ? '#4a148c' : '#2e7d32';
        ctx.fillRect(screenX, plat.y, plat.width, 6);
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(screenX, plat.y + 6, plat.width, plat.height - 6);
      }
    }
    ctx.restore();

    // Moving Platforms
    for (const mp of this.movingPlatforms) {
      mp.draw(ctx, this.cameraX, cfg.theme);
    }

    // Cloud Platforms
    for (const cloud of this.clouds) {
      cloud.draw(ctx, this.cameraX);
    }

    // Obstacle Traps (Spikes, Thorns, Chakras)
    for (const trap of this.traps) {
      trap.draw(ctx, this.cameraX);
    }

    // Speed Boost Pads
    for (const pad of this.boostPads) {
      pad.draw(ctx, this.cameraX);
    }

    // Falling Rocks
    for (const rock of this.fallingRocks) {
      rock.draw(ctx, this.cameraX);
    }

    // Wisdom Symbols
    for (const sym of this.wisdomSymbols) {
      sym.draw(ctx, this.cameraX);
    }

    // Puzzle Gates & Switches
    for (const gate of this.gates) {
      gate.draw(ctx, this.cameraX);
    }
    for (const sw of this.switches) {
      sw.draw(ctx, this.cameraX);
    }

    // Elephant Guardian (Friendly)
    if (this.elephantGuardian) {
      this.elephantGuardian.draw(ctx, this.cameraX);
    }

    // Temple Bells
    for (const bell of this.bells) {
      bell.draw(ctx, this.cameraX);
    }

    // Magical Keys
    for (const key of this.keys) {
      key.draw(ctx, this.cameraX);
    }

    // Divine Symbols (Level 23)
    for (const sym of this.divineSymbols) {
      sym.draw(ctx, this.cameraX);
    }

    // Defense Target
    if (this.defenseTarget) {
      this.defenseTarget.draw(ctx, this.cameraX);
    }

    // Altars & Shrines
    for (const altar of this.altars) {
      altar.draw(ctx, this.cameraX);
    }

    // Collectibles
    for (const item of this.collectibles) {
      item.draw(ctx, this.cameraX);
    }

    // Enemies
    for (const enemy of this.enemies) {
      enemy.draw(ctx, this.cameraX);
    }

    // Boss
    if (this.boss) {
      this.boss.draw(ctx, this.cameraX);
    }

    // Rival Racer (Kartikeya on Mayura)
    if (this.rival) {
      this.rival.draw(ctx, this.cameraX);
    }

    // Projectiles
    for (const proj of this.projectiles) {
      proj.draw(ctx, this.cameraX);
    }

    // Player (Cute Lord Ganesha)
    this.player.draw(ctx, this.cameraX);

    // Particle Effects
    this.particles.draw(ctx, this.cameraX);
  }
}

// ==========================================================================
// 8. LAUNCH GAME INSTANCE
// ==========================================================================
let game;
window.addEventListener('DOMContentLoaded', () => {
  game = new GameEngine();
});
