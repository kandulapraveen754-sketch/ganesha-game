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
// 1. AUDIO ENGINE (Multi-Track Background Music + Procedural SFX)
// ==========================================================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.droneGain = null;
    this.isDronePlaying = false;

    // Preferences with LocalStorage persistence
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.volume = 0.7; // Default 70%

    // Dedicated audio tracks for all situations
    this.trackUrls = {
      menu: 'audio/menu-music.mp3',
      chapter1: 'audio/divine-beginning.mp3',
      chapter2: 'audio/sacred-challenge.mp3',
      chapter3: 'audio/divine-race.mp3',
      gameplay: 'audio/sacred-challenge.mp3',
      race: 'audio/divine-race.mp3',
      temple: 'audio/temple-music.mp3',
      victory: 'audio/victory-music.mp3',
      gameover: 'audio/game-over-music.mp3'
    };

    // Current playing background audio
    this.currentTrackType = 'menu';
    this.bgm = null;
    this.currentAudio = null;
    this.pendingTrack = 'menu';
    this.isUnlocked = false;

    this.loadAudioPreferences();
  }

  getBgmPlayer() {
    if (!this.bgm) {
      this.bgm = document.getElementById('bg-music-player');
      if (!this.bgm) {
        this.bgm = new Audio();
        this.bgm.loop = true;
      }
      this.bgm.volume = this.volume;
      this.currentAudio = this.bgm;
    }
    return this.bgm;
  }

  loadAudioPreferences() {
    try {
      const savedMusic = localStorage.getItem('ganesha_music_enabled');
      if (savedMusic !== null) this.musicEnabled = (savedMusic === 'true');

      const savedSound = localStorage.getItem('ganesha_sfx_enabled');
      if (savedSound !== null) this.soundEnabled = (savedSound === 'true');

      const savedVol = localStorage.getItem('ganesha_audio_volume');
      if (savedVol !== null) this.volume = Math.max(0, Math.min(1, parseFloat(savedVol)));
    } catch (_) {}
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
    this.isUnlocked = true;
    this.updateUI();
  }

  unlock() {
    this.init();
    if (this.musicEnabled) {
      const track = this.currentTrackType || this.pendingTrack || 'menu';
      this.playTrack(track, false);
    }
  }

  playTrack(type, forceRestart = false) {
    const player = this.getBgmPlayer();

    // If already playing this exact track type and not paused, do not cut off/restart!
    if (!forceRestart && this.currentTrackType === type && !player.paused) {
      return;
    }

    this.currentTrackType = type;

    // If music is disabled, stop current audio and record intent
    if (!this.musicEnabled) {
      this.stopCurrentMusic();
      return;
    }

    const url = this.trackUrls[type] || this.trackUrls.gameplay;
    const isLooping = (type !== 'victory' && type !== 'gameover');

    try {
      player.loop = isLooping;
      player.volume = this.volume;

      // Only update src if different, avoiding reload stutter
      if (!player.src || !player.src.endsWith(url)) {
        player.src = url;
      }

      const playPromise = player.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.pendingTrack = null;
          const hint = document.getElementById('menu-tap-hint');
          if (hint) {
            hint.style.opacity = '0';
            hint.style.pointerEvents = 'none';
          }
        }).catch(() => {
          // Autoplay was blocked on mobile until user gesture
          this.pendingTrack = type;
        });
      }

      this.currentAudio = player;
    } catch (e) {
      console.warn("Could not play audio track:", e);
      this.startAmbientDrone();
    }
  }

  stopCurrentMusic() {
    if (this.bgm) {
      try {
        this.bgm.pause();
        this.bgm.currentTime = 0;
      } catch (_) {}
    }
    if (this.isDronePlaying) {
      this.stopAmbientDrone();
    }
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    try {
      localStorage.setItem('ganesha_music_enabled', this.musicEnabled);
    } catch (_) {}

    if (this.musicEnabled) {
      const track = this.currentTrackType || this.pendingTrack || 'menu';
      this.playTrack(track, true);
    } else {
      this.stopCurrentMusic();
    }

    this.updateUI();
    return this.musicEnabled;
  }

  toggleSound() {
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

    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.soundEnabled ? this.volume : 0, this.ctx.currentTime);
    }

    this.updateUI();
  }

  updateUI() {
    // Sync HUD Music buttons
    const btnMusic = document.getElementById('btn-music');
    if (btnMusic) btnMusic.textContent = this.musicEnabled ? '🎵' : '🔇';

    const touchMusic = document.getElementById('touch-music');
    if (touchMusic) touchMusic.textContent = this.musicEnabled ? '🎵' : '🔇';

    const pauseMusicStatus = document.getElementById('pause-music-status');
    if (pauseMusicStatus) pauseMusicStatus.textContent = this.musicEnabled ? 'ON 🎵' : 'OFF 🔇';

    // Sync HUD Sound buttons
    const btnSound = document.getElementById('btn-sound');
    if (btnSound) btnSound.textContent = this.soundEnabled ? '🔊' : '🔇';

    const pauseSoundStatus = document.getElementById('pause-sound-status');
    if (pauseSoundStatus) pauseSoundStatus.textContent = this.soundEnabled ? 'ON 🔊' : 'OFF 🔇';

    // Sync volume sliders
    const pct = Math.round(this.volume * 100);
    const volSlider = document.getElementById('volume-slider');
    if (volSlider) volSlider.value = pct;

    const pauseVolSlider = document.getElementById('pause-volume-slider');
    if (pauseVolSlider) pauseVolSlider.value = pct;

    const volDisplay = document.getElementById('volume-val-display');
    if (volDisplay) volDisplay.textContent = `${pct}%`;
  }

  startAmbientDrone() {
    if (!this.ctx || this.isDronePlaying) return;
    try {
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(136.1, this.ctx.currentTime);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(204.15, this.ctx.currentTime);

      this.droneGain.gain.setValueAtTime((this.soundEnabled && this.musicEnabled) ? 0.03 * this.volume : 0, this.ctx.currentTime);

      osc.connect(this.droneGain);
      osc2.connect(this.droneGain);
      this.droneGain.connect(this.masterGain || this.ctx.destination);

      osc.start();
      osc2.start();
      this.isDronePlaying = true;
    } catch (e) {
      console.warn("Audio drone couldn't start automatically:", e);
    }
  }

  stopAmbientDrone() {
    if (this.droneGain && this.ctx) {
      try {
        this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch (_) {}
    }
    this.isDronePlaying = false;
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
}

const sounds = new SoundEngine();

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
          game.togglePause();
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
    this.attackHitbox = { x: 0, y: 0, width: 46, height: 46 };

    this.skillCooldown = 0;
    this.invulnerableTimer = 0;
    this.walkCycle = 0;
    this.boostTimer = 0;
  }

  update(input, platforms, particles) {
    if (game && game.isCountingDown) return;

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

    if (input.keys.jump && this.isGrounded) {
      this.vy = isRide ? -12.5 : this.jumpForce;
      this.isGrounded = false;
      sounds.playJump();
      particles.emitSparks(this.x + this.width / 2, this.y + this.height, 6, '#ffd700');
    }

    // Normal Attack (Staff / Battle Axe Strike)
    if (input.keys.attack && !this.isAttacking) {
      this.isAttacking = true;
      this.attackTimer = this.attackDuration;
      this.hasHitCurrentAttack = false;
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

    // New Divine Attack: Vakratunda Trunk Blast ('L')
    if (input.keys.beam && this.skillCooldown <= 0 && this.energy >= 40) {
      this.energy -= 40;
      this.skillCooldown = 50;
      sounds.playTrunkBlast();
      game.triggerTrunkBlast(this.x + (this.facing === 1 ? this.width : 0), this.y + 18, this.facing);
    }

    // Gravity
    this.vy += 0.55;
    if (this.vy > 14) this.vy = 14;

    this.x += this.vx;
    this.checkHorizontalCollisions(platforms);

    this.y += this.vy;
    this.isGrounded = false;
    this.checkVerticalCollisions(platforms);

    if (this.x < 0) this.x = 0;
    if (this.y > 600) {
      this.takeDamage(35);
      game.respawnPlayer();
    }
  }

  checkHorizontalCollisions(platforms) {
    for (const plat of platforms) {
      if (plat.isOpen) continue;
      const box = plat.getCollisionBox ? plat.getCollisionBox() : plat;
      if (this.collidesWith(box)) {
        if (this.vx > 0) this.x = box.x - this.width;
        else if (this.vx < 0) this.x = box.x + box.width;
        this.vx = 0;
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
        } else if (this.vy < 0) {
          this.y = box.y + box.height;
          this.vy = 0;
        }
      }
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

  takeDamage(amt) {
    if (this.invulnerableTimer > 0) return;
    this.health = Math.max(0, this.health - amt);
    this.invulnerableTimer = 35;
    sounds.playHit();
    game.particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 8, '#ff5252');
    if (this.health <= 0) {
      game.onPlayerDefeated();
    }
  }

  draw(ctx, cameraX) {
    const screenX = this.x - cameraX;
    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) return;

    ctx.save();
    ctx.translate(screenX + this.width / 2, this.y + this.height / 2);
    if (this.facing === -1) ctx.scale(-1, 1);

    const isChapter2Or3 = game && game.currentLevelIndex >= 8;
    const isRide = game && (game.currentLevelIndex === 10 || game.currentLevelIndex === 17 || game.currentLevelIndex === 22);

    // Divine Aura
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fillStyle = this.boostTimer > 0 ? 'rgba(0, 229, 255, 0.35)' : 'rgba(255, 215, 0, 0.18)';
    ctx.fill();

    if (isRide) {
      // Mushika the Mouse Vahana
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

    if (isChapter2Or3) {
      // Lord Ganesha Sprite
      const legOffset = Math.sin(this.walkCycle) * 4;
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.arc(0, 10, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffb300';
      ctx.fillRect(-10, 14, 9, 16 + (this.isGrounded ? legOffset : 0));
      ctx.fillRect(1, 14, 9, 16 - (this.isGrounded ? legOffset : 0));

      // Head & Countenance
      ctx.fillStyle = '#ffe082';
      ctx.beginPath();
      ctx.arc(0, -10, 15, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      ctx.beginPath();
      ctx.ellipse(-16, -10, 8, 12, -0.2, 0, Math.PI * 2);
      ctx.ellipse(16, -10, 8, 12, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Trunk & Modak
      ctx.strokeStyle = '#ffe082';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.quadraticCurveTo(8, 8, 14, 2);
      ctx.stroke();
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(14, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      // Golden Mukuta Crown
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-12, -22);
      ctx.lineTo(0, -38);
      ctx.lineTo(12, -22);
      ctx.fill();
      ctx.fillStyle = '#ff1744';
      ctx.beginPath();
      ctx.arc(0, -26, 3, 0, Math.PI * 2);
      ctx.fill();

      // Battle Axe (Parashu)
      ctx.save();
      const swing = this.isAttacking ? (this.attackTimer / this.attackDuration) * 1.5 - 0.75 : 0.2;
      ctx.rotate(swing);
      ctx.strokeStyle = '#795548';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(10, 14);
      ctx.lineTo(16, -24);
      ctx.stroke();
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(18, -20, 9, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
      ctx.restore();

    } else {
      // Young Guardian (Chapter 1)
      const legOffset = Math.sin(this.walkCycle) * 5;
      ctx.fillStyle = '#ffb300';
      ctx.fillRect(-10, 6, 9, 22 + (this.isGrounded ? legOffset : 0));
      ctx.fillRect(1, 6, 9, 22 - (this.isGrounded ? legOffset : 0));

      ctx.fillStyle = '#ffcc80';
      ctx.fillRect(-9, -12, 18, 20);

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-7, -12);
      ctx.lineTo(8, 6);
      ctx.stroke();

      ctx.fillStyle = '#d84315';
      ctx.fillRect(-9, 4, 18, 5);

      ctx.fillStyle = '#ffcc80';
      ctx.beginPath();
      ctx.arc(0, -20, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff1744';
      ctx.fillRect(1, -25, 3, 5);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-2, -23, 7, 2);

      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-6, -30);
      ctx.lineTo(0, -36);
      ctx.lineTo(6, -30);
      ctx.fill();

      // Lotus Staff
      ctx.save();
      const staffSwingAngle = this.isAttacking ? (this.attackTimer / this.attackDuration) * 1.5 - 0.75 : 0.2;
      ctx.rotate(staffSwingAngle);
      ctx.strokeStyle = '#8d6e63';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(8, 16);
      ctx.lineTo(14, -28);
      ctx.stroke();
      ctx.fillStyle = '#f48fb1';
      ctx.beginPath();
      ctx.arc(14, -30, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (this.isAttacking) {
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(14, 0, 36, -0.6, 0.8);
      ctx.stroke();
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
  constructor(x, y, type = 'wisp') {
    this.x = x;
    this.y = y;
    this.type = type;
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

    if (type === 'wisp') {
      this.maxHealth = 20; this.health = 20; this.damage = 8; this.width = 28; this.height = 28;
    } else if (type === 'raider') {
      this.maxHealth = 35; this.health = 35; this.damage = 14; this.vx = -1.5;
    } else if (type === 'gana') {
      this.maxHealth = 45; this.health = 45; this.damage = 16; this.width = 38; this.height = 48;
    } else if (type === 'miniboss') {
      this.maxHealth = 130; this.health = 130; this.damage = 22; this.width = 52; this.height = 64; this.vx = -1.0;
    } else if (type === 'corrupted_asura') {
      this.maxHealth = 42; this.health = 42; this.damage = 16; this.vx = -1.8;
    } else if (type === 'shadow_beast') {
      this.maxHealth = 30; this.health = 30; this.damage = 14; this.vx = -2.2;
    } else if (type === 'asura_chieftain') {
      this.maxHealth = 170; this.health = 170; this.damage = 24; this.width = 54; this.height = 66; this.vx = -1.0;
    } else if (type === 'temple_golem') {
      this.maxHealth = 140; this.health = 140; this.damage = 20; this.width = 48; this.height = 60; this.vx = -0.9;
    } else if (type === 'dark_sorcerer') {
      this.maxHealth = 50; this.health = 50; this.damage = 18; this.vx = -1.2;
    }
  }

  update(player, platforms, particles) {
    if (!this.isAlive) return;
    if (this.hitTimer > 0) this.hitTimer--;
    if (this.attackCooldown > 0) this.attackCooldown--;

    const distToPlayer = player.x - this.x;
    if (Math.abs(distToPlayer) < 340) {
      this.vx = distToPlayer > 0 ? 1.4 : -1.4;
      if (this.type === 'miniboss' || this.type === 'asura_chieftain') this.vx *= 0.8;
      if (this.type === 'shadow_beast') this.vx *= 1.4;
    }

    if (this.type === 'dark_sorcerer' && this.attackCooldown <= 0 && Math.abs(distToPlayer) < 280) {
      this.attackCooldown = 130;
      game.spawnShockwave(this.x + (distToPlayer > 0 ? this.width : -20), this.y + 15, distToPlayer > 0 ? 4 : -4);
    }

    if (this.type !== 'wisp') {
      this.vy += 0.5;
      if (this.vy > 12) this.vy = 12;
      this.x += this.vx;
      this.checkHorizontalCollisions(platforms);
      this.y += this.vy;
      this.checkVerticalCollisions(platforms);
    } else {
      this.x += this.vx;
      this.y += Math.sin(Date.now() * 0.005 + this.x) * 1.2;
    }

    if (this.collidesWith(player) && this.attackCooldown <= 0) {
      player.takeDamage(this.damage);
      this.attackCooldown = 40;
    }

    if (game.defenseTarget && this.collidesWith(game.defenseTarget) && this.attackCooldown <= 0) {
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
    this.health -= damage;
    this.hitTimer = 10;
    sounds.playHit();
    particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 8, '#ffd700');

    if (this.health <= 0) {
      this.isAlive = false;
      particles.emitLotusPetals(this.x + this.width / 2, this.y + this.height / 2, 8);
      particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 14, '#ffd700');
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

    if (this.type === 'wisp') {
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#00e5ff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 15;
      ctx.fill();
    } else if (this.type === 'raider' || this.type === 'corrupted_asura') {
      ctx.fillStyle = this.type === 'corrupted_asura' ? '#4a148c' : '#311b92';
      ctx.fillRect(-12, -18, 24, 36);
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(-6, -10, 4, 4);
      ctx.fillRect(2, -10, 4, 4);
    } else if (this.type === 'gana') {
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(-14, -20, 28, 42);
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(-6, -16, 12, 3);
    } else if (this.type === 'miniboss' || this.type === 'asura_chieftain') {
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(-22, -28, 44, 56);
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-16, -28);
      ctx.lineTo(0, -40);
      ctx.lineTo(16, -28);
      ctx.fill();
    } else if (this.type === 'temple_golem') {
      ctx.fillStyle = '#78909c';
      ctx.fillRect(-18, -24, 36, 48);
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(-6, -14, 12, 4);
    } else if (this.type === 'dark_sorcerer') {
      ctx.fillStyle = '#311b92';
      ctx.fillRect(-12, -20, 24, 40);
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.arc(0, -22, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'shadow_beast') {
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(4, -4, 3, 3);
    }

    ctx.restore();

    if (this.health < this.maxHealth) {
      const barW = this.width;
      const barH = 5;
      const hpPct = Math.max(0, this.health / this.maxHealth);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(screenX, this.y - 12, barW, barH);
      ctx.fillStyle = '#ff5252';
      ctx.fillRect(screenX, this.y - 12, barW * hpPct, barH);
    }
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
      game.openGate(this.targetGateId);
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

      if (this.type === 'modak' || this.type === 'coin') {
        player.health = Math.min(player.maxHealth, player.health + 20);
        game.addScore(50);
        game.modaksCollected++;
      } else if (this.type === 'lotus_orb') {
        player.energy = player.maxEnergy;
        game.addScore(100);
        game.lotusOrbsCollected++;
      } else if (this.type === 'star') {
        player.energy = player.maxEnergy;
        game.addScore(75);
        game.starsCollected++;
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
  // --- CHAPTER 1: THE BIRTH OF GANESHA ---
  {
    levelNum: 1, chapter: 1, title: "The Divine Creation", theme: "palace",
    speaker: "Goddess Parvati", avatar: "🌺",
    story: "Mother Parvati gently crafts a radiant young guardian with purest devotion and sandalwood paste. 'Stand guard at my sanctum,' she smiles lovingly. 'Let none enter until I finish my holy rites.'",
    mission: "Learn the controls: Move with [A]/[D], Jump with [W]/[Space], and test your sacred staff with [J] against the playful spirits.",
    tutorialText: "Use [A]/[D] to move, [W]/[Space] to jump, [J] to strike!",
    platforms: [
      { x: 0, y: 460, width: 1400, height: 80 },
      { x: 260, y: 370, width: 140, height: 20 },
      { x: 500, y: 310, width: 160, height: 20 },
      { x: 760, y: 380, width: 140, height: 20 },
      { x: 1020, y: 340, width: 150, height: 20 }
    ],
    enemies: [
      { x: 420, y: 420, type: 'wisp' }, { x: 680, y: 420, type: 'wisp' }, { x: 920, y: 420, type: 'wisp' }
    ],
    collectibles: [
      { x: 310, y: 330, type: 'modak' }, { x: 560, y: 270, type: 'modak' }, { x: 1080, y: 300, type: 'modak' }
    ],
    altars: [{ x: 600, y: 406, isGoal: false }, { x: 1300, y: 406, isGoal: true }],
    goalX: 1300, requiredKills: 2,
    completionStory: "You have embraced your duty with grace. Mother Parvati smiles from within her sanctum as your inner strength blossoms."
  },
  {
    levelNum: 2, chapter: 1, title: "The Palace Guardian", theme: "palace",
    speaker: "Palace Sentinel", avatar: "🛡️",
    story: "Envious shadow raiders approach Parvati's grand palace gates, seeking to disrupt the divine rites! The young guardian plants his feet firmly upon the holy threshold.",
    mission: "Protect the sacred palace! Defeat all shadow invaders trying to breach the inner courtyard.",
    tutorialText: "Defeat all raiders! Use [K] for Divine Aura Shockwave when surrounded.",
    platforms: [
      { x: 0, y: 460, width: 1600, height: 80 },
      { x: 220, y: 360, width: 160, height: 20 },
      { x: 480, y: 290, width: 180, height: 20 },
      { x: 780, y: 350, width: 180, height: 20 },
      { x: 1100, y: 300, width: 180, height: 20 },
      { x: 1340, y: 380, width: 140, height: 20 }
    ],
    enemies: [
      { x: 340, y: 410, type: 'raider' }, { x: 540, y: 240, type: 'raider' },
      { x: 720, y: 410, type: 'raider' }, { x: 950, y: 410, type: 'raider' }, { x: 1200, y: 410, type: 'raider' }
    ],
    collectibles: [
      { x: 280, y: 320, type: 'modak' }, { x: 840, y: 310, type: 'modak' }, { x: 1160, y: 260, type: 'modak' }
    ],
    altars: [{ x: 740, y: 406, isGoal: false }, { x: 1500, y: 406, isGoal: true }],
    goalX: 1500, requiredKills: 4,
    completionStory: "The gates remain steadfast. The intruders are scattered harmlessly into the mist. You have proven yourself a true protector."
  },
  {
    levelNum: 3, chapter: 1, title: "The Arrival of Shiva", theme: "kailash",
    speaker: "Lord Shiva", avatar: "🔱", hasPreCutscene: true,
    cutsceneDialogue: "Lord Shiva returns to Mount Kailash. The young guardian steps forward respectfully: 'Halt, revered Lord! By my mother's sacred command, none shall enter!' Shiva is intrigued by this fearless youth.",
    story: "Lord Shiva has arrived at the gates. Though he is the supreme ascetic, the guardian stands unwavering in his promise to his mother. Shiva commands his scouts to test the youth's devotion.",
    mission: "Stand firm against Shiva's vanguard scouts and advance through the snowy Kailash path.",
    tutorialText: "Navigate the icy platforms and defeat Shiva's vanguard!",
    platforms: [
      { x: 0, y: 460, width: 1700, height: 80 },
      { x: 200, y: 370, width: 130, height: 20 },
      { x: 400, y: 300, width: 140, height: 20 },
      { x: 620, y: 380, width: 160, height: 20 },
      { x: 860, y: 290, width: 160, height: 20 },
      { x: 1120, y: 360, width: 140, height: 20 },
      { x: 1360, y: 300, width: 150, height: 20 }
    ],
    enemies: [
      { x: 460, y: 250, type: 'gana' }, { x: 700, y: 410, type: 'gana' },
      { x: 940, y: 240, type: 'gana' }, { x: 1220, y: 410, type: 'gana' }
    ],
    collectibles: [
      { x: 450, y: 260, type: 'modak' }, { x: 910, y: 250, type: 'modak' }, { x: 1400, y: 260, type: 'modak' }
    ],
    altars: [{ x: 800, y: 406, isGoal: false }, { x: 1620, y: 406, isGoal: true }],
    goalX: 1620, requiredKills: 3,
    completionStory: "Shiva watches from afar, admiring the boy's fearless loyalty. 'This child possesses rare courage,' whispers the Mahadeva."
  },
  {
    levelNum: 4, chapter: 1, title: "The Guardian's Challenge", theme: "kailash",
    speaker: "Gana Commander", avatar: "⚔️",
    story: "The Ganas of Shiva cannot believe a lone boy blocks their passage. Their mighty commander steps forward with a golden club to challenge your resolve!",
    mission: "Defeat the waves of Gana protectors and overcome the mighty Gana Commander mini-boss!",
    tutorialText: "Watch out for the Commander's ground shockwaves! Jump to avoid them.",
    platforms: [
      { x: 0, y: 460, width: 1600, height: 80 },
      { x: 260, y: 360, width: 160, height: 20 },
      { x: 520, y: 280, width: 220, height: 20 },
      { x: 840, y: 350, width: 180, height: 20 },
      { x: 1100, y: 290, width: 200, height: 20 }
    ],
    enemies: [
      { x: 360, y: 410, type: 'gana' }, { x: 600, y: 230, type: 'gana' },
      { x: 880, y: 410, type: 'gana' }, { x: 1240, y: 390, type: 'miniboss' }
    ],
    collectibles: [{ x: 580, y: 240, type: 'modak' }, { x: 1180, y: 250, type: 'modak' }],
    altars: [{ x: 700, y: 406, isGoal: false }, { x: 1520, y: 406, isGoal: true }],
    goalX: 1520, requiredKills: 3,
    completionStory: "The Gana Commander bows in respect. 'Never have we seen such filial devotion,' he declares as the mountain echoes his praise."
  },
  {
    levelNum: 5, chapter: 1, title: "The Divine Duel", theme: "kailash",
    speaker: "Lord Shiva", avatar: "🕉️", isBossLevel: true,
    story: "Lord Shiva himself steps into the arena. This is not a battle of anger, but a cosmic trial of dharma and boundless courage. Test your spirit against the Lord of Cosmic Dance!",
    mission: "Dodge Lord Shiva's divine energy rays and cosmic rings. Strike respectfully during openings to fulfill your sacred duty!",
    tutorialText: "Dodge Shiva's trident beams! Strike when he lands to wear down his trial meter.",
    platforms: [
      { x: 0, y: 460, width: 1100, height: 80 },
      { x: 140, y: 360, width: 140, height: 20 },
      { x: 380, y: 280, width: 200, height: 20 },
      { x: 680, y: 360, width: 140, height: 20 }
    ],
    boss: { x: 760, y: 220 }, enemies: [],
    collectibles: [{ x: 200, y: 320, type: 'modak' }, { x: 740, y: 320, type: 'modak' }],
    altars: [], goalX: 9999, hasPostCutscene: true,
    cutsceneDialogue: "At the height of their divine clash, cosmic destiny intervenes. Shiva recognizes the boy's immortal soul and transcendent purpose. The battle resolves into radiant golden light.",
    completionStory: "The supreme trial is complete. Shiva looks upon the fallen youth with profound compassion and prepares the ultimate blessing."
  },
  {
    levelNum: 6, chapter: 1, title: "Parvati's Divine Power", theme: "palace",
    speaker: "Goddess Parvati", avatar: "🌺",
    story: "Mother Parvati's divine motherly aura envelops Mount Kailash. To restore balance and prepare the sacred ritual, gather 5 Golden Lotus Orbs from the sanctum grounds.",
    mission: "Collect all 5 Sacred Lotus Orbs while purifying the lingering illusions in the palace gardens.",
    tutorialText: "Gather all 5 Sacred Lotus Orbs to awaken Parvati's full grace!",
    platforms: [
      { x: 0, y: 460, width: 1700, height: 80 },
      { x: 200, y: 370, width: 140, height: 20 },
      { x: 420, y: 290, width: 160, height: 20 },
      { x: 680, y: 370, width: 160, height: 20 },
      { x: 940, y: 280, width: 180, height: 20 },
      { x: 1200, y: 360, width: 150, height: 20 },
      { x: 1420, y: 270, width: 160, height: 20 }
    ],
    enemies: [
      { x: 480, y: 240, type: 'raider' }, { x: 760, y: 410, type: 'raider' },
      { x: 1020, y: 230, type: 'raider' }, { x: 1300, y: 410, type: 'raider' }
    ],
    collectibles: [
      { x: 260, y: 330, type: 'lotus_orb' }, { x: 480, y: 250, type: 'lotus_orb' },
      { x: 750, y: 330, type: 'lotus_orb' }, { x: 1010, y: 240, type: 'lotus_orb' }, { x: 1480, y: 230, type: 'lotus_orb' }
    ],
    altars: [{ x: 800, y: 406, isGoal: false }, { x: 1620, y: 406, isGoal: true }],
    goalX: 1620, requiredOrbs: 5,
    completionStory: "The 5 Sacred Lotus Orbs resonate together! Mother Parvati's radiance heals the land as she awaits the final chapter of destiny."
  },
  {
    levelNum: 7, chapter: 1, title: "The Search for the Elephant", theme: "forest",
    speaker: "Celestial Sage", avatar: "🐘",
    story: "Shiva sends his emissaries north through the enchanted Himalayan forest to seek the noble elephant Gajasura, whose wisdom shall complete the divine child.",
    mission: "Journey across the mystical canopy, avoid dangerous brambles, and reach the Golden Sun Gate!",
    tutorialText: "Master your jumps across floating forest platforms to reach the Golden Gate!",
    platforms: [
      { x: 0, y: 460, width: 600, height: 80 }, { x: 680, y: 460, width: 500, height: 80 },
      { x: 1260, y: 460, width: 600, height: 80 }, { x: 220, y: 360, width: 140, height: 20 },
      { x: 440, y: 280, width: 150, height: 20 }, { x: 660, y: 340, width: 150, height: 20 },
      { x: 880, y: 270, width: 160, height: 20 }, { x: 1140, y: 350, width: 140, height: 20 },
      { x: 1380, y: 280, width: 160, height: 20 }
    ],
    enemies: [
      { x: 300, y: 410, type: 'wisp' }, { x: 740, y: 410, type: 'gana' },
      { x: 940, y: 220, type: 'wisp' }, { x: 1420, y: 230, type: 'gana' }
    ],
    collectibles: [{ x: 490, y: 240, type: 'modak' }, { x: 930, y: 230, type: 'modak' }, { x: 1440, y: 240, type: 'modak' }],
    altars: [{ x: 800, y: 406, isGoal: false }, { x: 1720, y: 406, isGoal: true }],
    goalX: 1720, requiredKills: 2,
    completionStory: "Through the sacred canopy, the wise celestial elephant offers his eternal blessing. The stage is set for divine ascension!"
  },
  {
    levelNum: 8, chapter: 1, title: "The Birth of Ganesha", theme: "palace",
    speaker: "Trimurti & Devas", avatar: "🕉️",
    story: "At the grand altar of Kailash, the Devas gather in reverence. Defeat the final echoes of cosmic doubt and ascend to your eternal divine identity!",
    mission: "Defend the sacred altar from the final celestial wave to awaken the glorious form of Lord Ganesha!",
    tutorialText: "Hold the sacred ground! Defeat the final wave to trigger the Divine Transformation!",
    platforms: [
      { x: 0, y: 460, width: 1500, height: 80 },
      { x: 240, y: 360, width: 160, height: 20 },
      { x: 500, y: 290, width: 220, height: 20 },
      { x: 820, y: 360, width: 180, height: 20 },
      { x: 1100, y: 300, width: 180, height: 20 }
    ],
    enemies: [
      { x: 380, y: 410, type: 'raider' }, { x: 580, y: 240, type: 'gana' },
      { x: 900, y: 410, type: 'raider' }, { x: 1200, y: 390, type: 'miniboss' }
    ],
    collectibles: [{ x: 590, y: 250, type: 'modak' }, { x: 1180, y: 260, type: 'modak' }],
    altars: [{ x: 700, y: 406, isGoal: false }, { x: 1400, y: 406, isGoal: true }],
    goalX: 1400, requiredKills: 3,
    completionStory: "Om Shri Ganeshaya Namaha! The heavens rain golden blossoms upon the beloved Lord of all Beginnings!"
  },

  // --- CHAPTER 2: THE REMOVER OF OBSTACLES ---
  {
    levelNum: 9, chapter: 2, title: "The New Beginning", theme: "palace",
    speaker: "Lord Shiva & Parvati", avatar: "🐘",
    story: "Awakened in his resplendent form as Lord Ganesha, you receive the divine Parashu (Axe) and blessings from both parents. A celestial training sentinel steps forward to hone your new divine powers.",
    mission: "Practice Ganesha's abilities! Use [L] to unleash the piercing Vakratunda Trunk Blast and defeat the training sentinel.",
    tutorialText: "Press [L] for Trunk Blast! Defeat the training sentinel to begin your quest.",
    platforms: [
      { x: 0, y: 460, width: 1300, height: 80 },
      { x: 250, y: 360, width: 160, height: 20 },
      { x: 550, y: 290, width: 180, height: 20 },
      { x: 850, y: 360, width: 160, height: 20 }
    ],
    enemies: [
      { x: 400, y: 410, type: 'wisp' }, { x: 620, y: 240, type: 'wisp' },
      { x: 920, y: 390, type: 'temple_golem' }
    ],
    collectibles: [{ x: 290, y: 320, type: 'modak' }, { x: 590, y: 250, type: 'modak' }],
    altars: [{ x: 600, y: 406, isGoal: false }, { x: 1200, y: 406, isGoal: true }],
    goalX: 1200, requiredKills: 2,
    completionStory: "Your divine radiance shines brightly! Shiva smiles in approval as dark omens stir from the forest realms below."
  },
  {
    levelNum: 10, chapter: 2, title: "Forest of Obstacles", theme: "corrupted_forest",
    speaker: "Forest Guardian", avatar: "🌲",
    story: "The demon Vighnasura has corrupted the sacred forest with dark thorny vines and shadow miasma. Gather 10 Divine Energy Orbs to purify the sacred groves.",
    mission: "Collect all 10 Divine Energy Orbs scattered across the corrupted canopy while fending off Asura minions!",
    tutorialText: "Collect 10 Divine Energy Orbs to purify the forest temple!",
    platforms: [
      { x: 0, y: 460, width: 1900, height: 80 },
      { x: 200, y: 370, width: 140, height: 20 }, { x: 420, y: 290, width: 160, height: 20 },
      { x: 680, y: 360, width: 150, height: 20 }, { x: 920, y: 280, width: 160, height: 20 },
      { x: 1180, y: 350, width: 140, height: 20 }, { x: 1420, y: 270, width: 160, height: 20 },
      { x: 1660, y: 350, width: 140, height: 20 }
    ],
    enemies: [
      { x: 480, y: 240, type: 'corrupted_asura' }, { x: 740, y: 410, type: 'corrupted_asura' },
      { x: 1000, y: 230, type: 'corrupted_asura' }, { x: 1300, y: 410, type: 'corrupted_asura' },
      { x: 1540, y: 220, type: 'corrupted_asura' }
    ],
    collectibles: [
      { x: 240, y: 330, type: 'lotus_orb' }, { x: 460, y: 250, type: 'lotus_orb' },
      { x: 720, y: 320, type: 'lotus_orb' }, { x: 800, y: 410, type: 'lotus_orb' },
      { x: 960, y: 240, type: 'lotus_orb' }, { x: 1100, y: 410, type: 'lotus_orb' },
      { x: 1220, y: 310, type: 'lotus_orb' }, { x: 1460, y: 230, type: 'lotus_orb' },
      { x: 1580, y: 410, type: 'lotus_orb' }, { x: 1700, y: 310, type: 'lotus_orb' }
    ],
    altars: [{ x: 850, y: 406, isGoal: false }, { x: 1800, y: 406, isGoal: true }],
    goalX: 1800, requiredOrbs: 10,
    completionStory: "The golden orbs blaze with sacred light, cleansing the corrupted vines! Ahead, a small rustling creature approaches."
  },
  {
    levelNum: 11, chapter: 2, title: "The Ride of Mushika", theme: "village",
    speaker: "Mushika", avatar: "🐭", isRide: true,
    story: "A noble celestial mouse named Mushika pledges his eternal loyalty to Lord Ganesha! Leaping onto Mushika's back, Ganesha dashes through the outer valleys to warn the village.",
    mission: "High-speed ride! Dash across the valley, jump over obstacles, collect 12 Divine Stars, and outrun the pursuing shadow beasts!",
    tutorialText: "Fast Ride Mode! Jump over rocks and spikes, collect 12 Stars to reach the village!",
    platforms: [
      { x: 0, y: 460, width: 2200, height: 80 },
      { x: 260, y: 360, width: 140, height: 20 }, { x: 540, y: 320, width: 150, height: 20 },
      { x: 840, y: 360, width: 160, height: 20 }, { x: 1140, y: 310, width: 150, height: 20 },
      { x: 1460, y: 350, width: 160, height: 20 }, { x: 1760, y: 310, width: 150, height: 20 }
    ],
    enemies: [
      { x: 600, y: 410, type: 'shadow_beast' }, { x: 920, y: 410, type: 'shadow_beast' },
      { x: 1260, y: 410, type: 'shadow_beast' }, { x: 1600, y: 410, type: 'shadow_beast' }
    ],
    collectibles: [
      { x: 180, y: 400, type: 'star' }, { x: 300, y: 310, type: 'star' },
      { x: 440, y: 400, type: 'star' }, { x: 590, y: 270, type: 'star' },
      { x: 740, y: 400, type: 'star' }, { x: 890, y: 310, type: 'star' },
      { x: 1040, y: 400, type: 'star' }, { x: 1190, y: 260, type: 'star' },
      { x: 1340, y: 400, type: 'star' }, { x: 1510, y: 300, type: 'star' },
      { x: 1680, y: 400, type: 'star' }, { x: 1810, y: 260, type: 'star' }
    ],
    altars: [{ x: 1000, y: 406, isGoal: false }, { x: 2100, y: 406, isGoal: true }],
    goalX: 2100, requiredStars: 12,
    completionStory: "Mushika's lightning speed carries you safely to the village gates just as war horns echo in the hills!"
  },
  {
    levelNum: 12, chapter: 2, title: "The Demon Invasion", theme: "village",
    speaker: "Village Elder", avatar: "🛡️", hasDefenseTarget: true, defenseType: "village",
    story: "Vighnasura's raiding vanguard arrives to plunder the peaceful village shrine. Ganesha plants his sacred axe at the gate, refusing to let harm touch the innocent.",
    mission: "Protect the Village Gate! Defeat all waves of Asura invaders before the Village Defense Meter drops to zero!",
    tutorialText: "Defend the Village Gate! Stop enemies before they damage the village!",
    platforms: [
      { x: 0, y: 460, width: 1600, height: 80 },
      { x: 260, y: 350, width: 160, height: 20 }, { x: 540, y: 280, width: 200, height: 20 },
      { x: 860, y: 350, width: 180, height: 20 }, { x: 1140, y: 290, width: 180, height: 20 }
    ],
    defenseTarget: { x: 140, y: 370, type: 'village' },
    enemies: [
      { x: 420, y: 410, type: 'corrupted_asura' }, { x: 620, y: 230, type: 'corrupted_asura' },
      { x: 880, y: 410, type: 'corrupted_asura' }, { x: 1100, y: 410, type: 'corrupted_asura' },
      { x: 1340, y: 390, type: 'asura_chieftain' }
    ],
    collectibles: [{ x: 300, y: 310, type: 'modak' }, { x: 600, y: 240, type: 'modak' }, { x: 920, y: 310, type: 'modak' }],
    altars: [{ x: 800, y: 406, isGoal: false }, { x: 1520, y: 406, isGoal: true }],
    goalX: 1520, requiredKills: 4,
    completionStory: "The village is saved! The grateful villagers offer sweet golden modaks in joy and prayer."
  },
  {
    levelNum: 13, chapter: 2, title: "Temple of Wisdom", theme: "ancient_temple",
    speaker: "Temple Sage", avatar: "📜", hasPuzzles: true,
    story: "Inside the ancient subterranean temple lies the sacred Yantra of Wisdom. Heavy stone gates bar the way; only one with sharp mind and pure courage can unlock them.",
    mission: "Step on the glowing pressure switches to lower the stone gates, defeat the Temple Golems, and claim the divine relic!",
    tutorialText: "Step on the glowing floor switches to open the stone gates!",
    platforms: [
      { x: 0, y: 460, width: 1700, height: 80 },
      { x: 240, y: 360, width: 140, height: 20 }, { x: 460, y: 290, width: 160, height: 20 },
      { x: 740, y: 360, width: 160, height: 20 }, { x: 1040, y: 290, width: 160, height: 20 },
      { x: 1320, y: 360, width: 150, height: 20 }
    ],
    switches: [
      { x: 300, y: 348, targetGateId: 1 },
      { x: 820, y: 348, targetGateId: 2 }
    ],
    gates: [
      { x: 640, y: 340, width: 24, height: 120, id: 1 },
      { x: 1240, y: 340, width: 24, height: 120, id: 2 }
    ],
    enemies: [
      { x: 520, y: 240, type: 'corrupted_asura' }, { x: 920, y: 410, type: 'temple_golem' },
      { x: 1400, y: 410, type: 'temple_golem' }
    ],
    collectibles: [{ x: 500, y: 250, type: 'modak' }, { x: 1100, y: 250, type: 'modak' }],
    altars: [{ x: 700, y: 406, isGoal: false }, { x: 1620, y: 406, isGoal: true }],
    goalX: 1620, requiredKills: 2,
    completionStory: "The ancient Yantra dissolves into Ganesha's crown, granting supreme intellect and insight into Vighnasura's weakness."
  },
  {
    levelNum: 14, chapter: 2, title: "Battle of the Divine Kingdom", theme: "divine_kingdom",
    speaker: "Indra & Devas", avatar: "💎", hasDefenseTarget: true, defenseType: "crystal",
    story: "Vighnasura's demonic legion converges upon the celestial divine kingdom, aiming to shatter the Central Prana Crystal sustaining the heavens.",
    mission: "Defend the Central Divine Crystal! Repel 3 fierce waves of dark sorcerers and elite asuras to secure the kingdom.",
    tutorialText: "Protect the Central Crystal! Use Trunk Blast [L] to wipe out incoming waves.",
    platforms: [
      { x: 0, y: 460, width: 1600, height: 80 },
      { x: 260, y: 360, width: 160, height: 20 }, { x: 520, y: 280, width: 220, height: 20 },
      { x: 860, y: 350, width: 180, height: 20 }, { x: 1140, y: 290, width: 200, height: 20 }
    ],
    defenseTarget: { x: 600, y: 200, type: 'crystal' },
    enemies: [
      { x: 380, y: 410, type: 'dark_sorcerer' }, { x: 740, y: 410, type: 'corrupted_asura' },
      { x: 960, y: 300, type: 'dark_sorcerer' }, { x: 1240, y: 390, type: 'asura_chieftain' }
    ],
    collectibles: [{ x: 320, y: 320, type: 'modak' }, { x: 1200, y: 250, type: 'modak' }],
    altars: [{ x: 700, y: 406, isGoal: false }, { x: 1500, y: 406, isGoal: true }],
    goalX: 1500, requiredKills: 3,
    completionStory: "The celestial crystal pulses with blinding brilliance, scattering the invaders! The path to Vighnasura's fortress lies open."
  },
  {
    levelNum: 15, chapter: 2, title: "Vighnasura's Fortress", theme: "fortress",
    speaker: "Vighnasura", avatar: "👹", isBossLevel: true, bossType: "vighnasura",
    story: "You breach the volcanic obsidian fortress of Vighnasura. The demon king towers before you, boasting that no living being can overcome his trials.",
    mission: "Defeat Vighnasura! Dodge his dark obstacle shockwaves and survive Phase 2 when his rage unleashes at 50% health!",
    tutorialText: "Vighnasura Boss Fight! At 50% HP, he enters Phase 2 with dark vortexes!",
    platforms: [
      { x: 0, y: 460, width: 1200, height: 80 },
      { x: 180, y: 360, width: 140, height: 20 }, { x: 420, y: 280, width: 200, height: 20 },
      { x: 740, y: 360, width: 150, height: 20 }
    ],
    boss: { x: 820, y: 375, maxHp: 320 }, enemies: [],
    collectibles: [{ x: 220, y: 320, type: 'modak' }, { x: 780, y: 320, type: 'modak' }],
    altars: [], goalX: 9999,
    completionStory: "Wounded and reeling, Vighnasura retreats to his inner sanctum for the final confrontation of destiny!"
  },
  {
    levelNum: 16, chapter: 2, title: "The Remover of Obstacles", theme: "fortress",
    speaker: "Lord Ganesha", avatar: "🐘", isBossLevel: true, bossType: "vighnasura_final",
    story: "At the cosmic nexus of the universe, Vighnasura unleashes all forbidden obstacle magic. Lord Ganesha raises his divine hands not in hatred, but to fulfill his divine purpose as the supreme Remover of Obstacles.",
    mission: "Overcome Vighnasura's final empowered form using all abilities learned throughout your sacred journey!",
    tutorialText: "Final Showdown! Combine Staff Strikes, Prana Shockwaves [K], and Trunk Blasts [L]!",
    platforms: [
      { x: 0, y: 460, width: 1200, height: 80 },
      { x: 160, y: 360, width: 140, height: 20 }, { x: 400, y: 270, width: 240, height: 20 },
      { x: 760, y: 360, width: 140, height: 20 }
    ],
    boss: { x: 800, y: 375, maxHp: 440 }, enemies: [],
    collectibles: [{ x: 200, y: 320, type: 'modak' }, { x: 800, y: 320, type: 'modak' }],
    altars: [], goalX: 9999, hasPostCutscene: true,
    cutsceneDialogue: "As Lord Ganesha unleashes supreme divine radiance, Vighnasura falls to his knees in awe. 'Forgive me, O Lord of Beginnings! Henceforth, I shall serve you, and only create obstacles for those who stray from righteousness.' Peace and harmony return to all worlds.",
    completionStory: "🐘 GANESHA — THE REMOVER OF OBSTACLES! Chapter 2 is gloriously complete!"
  },

  // --- CHAPTER 3: THE GREAT DIVINE RACE ---
  {
    levelNum: 17, chapter: 3, title: "The Divine Challenge", theme: "palace",
    speaker: "Lord Shiva", avatar: "🔱", hasCountdown: true,
    story: "Lord Shiva gathers Lord Ganesha and his elder brother Lord Kartikeya. 'A fruit of supreme divine wisdom shall be awarded to whoever circles the entire world first!' A sacred starting altar awaits.",
    mission: "Listen to the sacred countdown: 3, 2, 1, GO! Reach the sacred starting archway and complete the inaugural trial.",
    tutorialText: "Listen to the countdown! Reach the sacred starting altar to commence the race.",
    platforms: [
      { x: 0, y: 460, width: 1400, height: 80 },
      { x: 240, y: 370, width: 150, height: 20 },
      { x: 520, y: 300, width: 180, height: 20 },
      { x: 820, y: 360, width: 160, height: 20 },
      { x: 1100, y: 320, width: 160, height: 20 }
    ],
    enemies: [
      { x: 440, y: 410, type: 'wisp' }, { x: 740, y: 410, type: 'wisp' }
    ],
    collectibles: [
      { x: 300, y: 330, type: 'coin' }, { x: 600, y: 260, type: 'coin' }, { x: 900, y: 320, type: 'coin' }
    ],
    altars: [{ x: 650, y: 406, isGoal: false }, { x: 1300, y: 406, isGoal: true }],
    goalX: 1300, requiredKills: 1,
    completionStory: "The divine challenge is officially begun! Kartikeya mounts his swift peacock Mayura and shoots into the eastern skies like a sapphire bolt."
  },
  {
    levelNum: 18, chapter: 3, title: "The Mouse Rider", theme: "village",
    speaker: "Mushika", avatar: "🐭", isRide: true,
    story: "Mushika scurries proudly to Ganesha's side. 'Hop on, my Lord! My paws may be small, but our devotion is boundless!' Ride across the valley, hitting golden speed pads!",
    mission: "Ride Mushika across the winding roads! Dash through speed boost pads, jump over rocks, and collect 12 Divine Coins!",
    tutorialText: "Step on cyan speed pads to get super speed bursts! Collect 12 Coins.",
    platforms: [
      { x: 0, y: 460, width: 2300, height: 80 },
      { x: 260, y: 360, width: 140, height: 20 }, { x: 560, y: 320, width: 160, height: 20 },
      { x: 880, y: 350, width: 150, height: 20 }, { x: 1200, y: 300, width: 160, height: 20 },
      { x: 1540, y: 350, width: 160, height: 20 }, { x: 1860, y: 310, width: 150, height: 20 }
    ],
    boostPads: [
      { x: 220, y: 450 }, { x: 700, y: 450 }, { x: 1380, y: 450 }, { x: 1740, y: 450 }
    ],
    enemies: [
      { x: 650, y: 410, type: 'shadow_beast' }, { x: 1100, y: 410, type: 'shadow_beast' },
      { x: 1650, y: 410, type: 'shadow_beast' }
    ],
    collectibles: [
      { x: 180, y: 400, type: 'coin' }, { x: 320, y: 310, type: 'coin' },
      { x: 480, y: 400, type: 'coin' }, { x: 620, y: 270, type: 'coin' },
      { x: 800, y: 400, type: 'coin' }, { x: 940, y: 300, type: 'coin' },
      { x: 1120, y: 400, type: 'coin' }, { x: 1260, y: 250, type: 'coin' },
      { x: 1440, y: 400, type: 'coin' }, { x: 1600, y: 300, type: 'coin' },
      { x: 1780, y: 400, type: 'coin' }, { x: 1920, y: 260, type: 'coin' }
    ],
    altars: [{ x: 1000, y: 406, isGoal: false }, { x: 2200, y: 406, isGoal: true }],
    goalX: 2200, requiredCoins: 12,
    completionStory: "Mushika darts with tremendous enthusiasm! Ahead, magnificent peacock cries ring out from the emerald highlands."
  },
  {
    levelNum: 19, chapter: 3, title: "The Peacock Warrior", theme: "peacock_realm",
    speaker: "Lord Kartikeya", avatar: "🦚", isRaceLevel: true,
    story: "Lord Kartikeya swoops overhead aboard Mayura, his iridescent feathers sparkling with celestial starlight. 'Greeting, brother Ganesha! Let us test our pace across the Peacock Valleys!'",
    mission: "Race alongside Lord Kartikeya! Leap across peacock feather platforms and reach the checkpoint shrine together.",
    tutorialText: "Kartikeya flies ahead on Mayura! Keep pace across the emerald platforms.",
    platforms: [
      { x: 0, y: 460, width: 2200, height: 80 },
      { x: 240, y: 360, width: 150, height: 20 }, { x: 480, y: 290, width: 180, height: 20 },
      { x: 780, y: 360, width: 160, height: 20 }, { x: 1080, y: 290, width: 170, height: 20 },
      { x: 1380, y: 350, width: 160, height: 20 }, { x: 1680, y: 280, width: 180, height: 20 }
    ],
    rival: { x: 80, y: 330, speed: 5.0 },
    boostPads: [{ x: 380, y: 450 }, { x: 960, y: 450 }, { x: 1540, y: 450 }],
    enemies: [
      { x: 600, y: 410, type: 'wisp' }, { x: 1200, y: 410, type: 'wisp' }, { x: 1800, y: 410, type: 'wisp' }
    ],
    collectibles: [
      { x: 300, y: 310, type: 'modak' }, { x: 840, y: 310, type: 'modak' },
      { x: 1440, y: 300, type: 'modak' }, { x: 1980, y: 410, type: 'modak' }
    ],
    altars: [{ x: 900, y: 406, isGoal: false }, { x: 2100, y: 406, isGoal: true }],
    goalX: 2100, requiredKills: 1,
    completionStory: "Kartikeya salutes with his sacred Vel: 'You ride with great heart, Ganesha! Up ahead lies the treacherous Mountain of Trials!'"
  },
  {
    levelNum: 20, chapter: 3, title: "The Mountain of Trials", theme: "mountain_trials",
    speaker: "Mountain Hermit", avatar: "🏔️", hasFallingRocks: true,
    story: "Towering crags reach into storm clouds. Legend says loose rocks crash down from the peaks, testing the agility and reflexes of all who seek the summit.",
    mission: "Climb the Mountain of Trials! Watch for [⚠️] falling rock warnings, dodge the tumbling boulders, and reach the peak altar.",
    tutorialText: "Watch out for ⚠️ falling rock warnings! Jump or dash to avoid falling boulders.",
    platforms: [
      { x: 0, y: 460, width: 1800, height: 80 },
      { x: 200, y: 370, width: 140, height: 20 }, { x: 420, y: 300, width: 150, height: 20 },
      { x: 680, y: 360, width: 160, height: 20 }, { x: 940, y: 280, width: 180, height: 20 },
      { x: 1220, y: 350, width: 150, height: 20 }, { x: 1460, y: 270, width: 160, height: 20 }
    ],
    fallingRocks: [
      { x: 350, triggerX: 250 }, { x: 620, triggerX: 500 },
      { x: 860, triggerX: 750 }, { x: 1140, triggerX: 1000 },
      { x: 1400, triggerX: 1280 }
    ],
    enemies: [
      { x: 500, y: 250, type: 'gana' }, { x: 1020, y: 230, type: 'gana' }, { x: 1360, y: 410, type: 'gana' }
    ],
    collectibles: [
      { x: 260, y: 320, type: 'modak' }, { x: 740, y: 310, type: 'modak' }, { x: 1280, y: 300, type: 'modak' }
    ],
    altars: [{ x: 800, y: 406, isGoal: false }, { x: 1700, y: 406, isGoal: true }],
    goalX: 1700, requiredKills: 2,
    completionStory: "You stand atop the high mountain crest as fresh golden sunlight warms the peaks. An ancient entrance to the Temple of Wisdom appears."
  },
  {
    levelNum: 21, chapter: 3, title: "The Temple of Wisdom", theme: "wisdom_temple",
    speaker: "Sage of Eternity", avatar: "📜", hasWisdomPuzzle: true,
    story: "In this sacred subterranean sanctuary, speed alone cannot open the sanctum doors. The Sage of Eternity declares: 'Only by honoring Truth, Duty, and Wisdom in their sacred order shall the holy gates yield.'",
    mission: "Collect the 3 Sacred Wisdom Glyphs in strict order: 1. ॐ (Truth) ➔ 2. 🔱 (Duty) ➔ 3. 🌺 (Wisdom) to open the final golden gate!",
    tutorialText: "Collect symbols in exact order: 1. ॐ (Truth) ➔ 2. 🔱 (Duty) ➔ 3. 🌺 (Wisdom)!",
    platforms: [
      { x: 0, y: 460, width: 1800, height: 80 },
      { x: 220, y: 360, width: 150, height: 20 }, { x: 480, y: 290, width: 160, height: 20 },
      { x: 760, y: 360, width: 160, height: 20 }, { x: 1060, y: 290, width: 160, height: 20 },
      { x: 1360, y: 350, width: 160, height: 20 }
    ],
    wisdomSymbols: [
      { x: 280, y: 310, symbolId: 1, label: 'ॐ' },
      { x: 840, y: 310, symbolId: 2, label: '🔱' },
      { x: 1420, y: 300, symbolId: 3, label: '🌺' }
    ],
    gates: [{ x: 1580, y: 340, width: 24, height: 120, id: 99 }],
    enemies: [
      { x: 540, y: 240, type: 'temple_golem' }, { x: 1120, y: 240, type: 'temple_golem' }
    ],
    collectibles: [{ x: 520, y: 250, type: 'modak' }, { x: 1100, y: 250, type: 'modak' }],
    altars: [{ x: 700, y: 406, isGoal: false }, { x: 1720, y: 406, isGoal: true }],
    goalX: 1720, requiredKills: 1,
    completionStory: "The 3 symbols ignite with eternal light! The final gate glides into the earth as cosmic starlight envelops the world."
  },
  {
    levelNum: 22, chapter: 3, title: "The Cosmic Journey", theme: "cosmic_journey",
    speaker: "Celestial Guide", avatar: "✨",
    story: "Kartikeya's peacock soars through planetary orbits across the cosmos. Ganesha looks out upon galaxies and nebulae, contemplating the true nature of space, time, and divine family.",
    mission: "Traverse floating cosmic platforms, avoid slow cosmic obstacles, collect 8 Celestial Stars, and reach the Grand Race Track!",
    tutorialText: "Leap across cosmic starlight platforms and gather 8 Celestial Stars!",
    platforms: [
      { x: 0, y: 460, width: 1900, height: 80 },
      { x: 220, y: 360, width: 130, height: 20 }, { x: 440, y: 280, width: 150, height: 20 },
      { x: 700, y: 350, width: 140, height: 20 }, { x: 940, y: 270, width: 160, height: 20 },
      { x: 1200, y: 340, width: 140, height: 20 }, { x: 1460, y: 260, width: 160, height: 20 },
      { x: 1700, y: 340, width: 140, height: 20 }
    ],
    enemies: [
      { x: 500, y: 230, type: 'wisp' }, { x: 1000, y: 220, type: 'wisp' }, { x: 1520, y: 210, type: 'wisp' }
    ],
    collectibles: [
      { x: 260, y: 310, type: 'star' }, { x: 480, y: 230, type: 'star' },
      { x: 740, y: 300, type: 'star' }, { x: 860, y: 410, type: 'star' },
      { x: 1000, y: 220, type: 'star' }, { x: 1240, y: 290, type: 'star' },
      { x: 1500, y: 210, type: 'star' }, { x: 1740, y: 290, type: 'star' }
    ],
    altars: [{ x: 800, y: 406, isGoal: false }, { x: 1820, y: 406, isGoal: true }],
    goalX: 1820, requiredStars: 8,
    completionStory: "Starlight crystalizes into Ganesha's heart. A profound realization dawns: all this vast universe is contained within one sacred bond."
  },
  {
    levelNum: 23, chapter: 3, title: "The Final Race", theme: "divine_race_track",
    speaker: "The Devas", avatar: "🏁", isRaceLevel: true, isRide: true, hasCountdown: true,
    story: "The ultimate race track opens across the heavens! Kartikeya aboard Mayura and Ganesha atop Mushika take their positions side-by-side. The Devas blow golden conches!",
    mission: "Win the Final Race! Dash across the celestial track, use speed boost rings, outpace Kartikeya, and cross the Golden Finish Line!",
    tutorialText: "Final Race! Dash through speed boost pads and cross the finish line first!",
    platforms: [
      { x: 0, y: 460, width: 2800, height: 80 },
      { x: 260, y: 360, width: 160, height: 20 }, { x: 560, y: 300, width: 180, height: 20 },
      { x: 920, y: 350, width: 180, height: 20 }, { x: 1260, y: 290, width: 200, height: 20 },
      { x: 1620, y: 350, width: 180, height: 20 }, { x: 1980, y: 290, width: 200, height: 20 },
      { x: 2320, y: 350, width: 180, height: 20 }
    ],
    rival: { x: 60, y: 340, speed: 5.4 },
    boostPads: [
      { x: 200, y: 450 }, { x: 780, y: 450 }, { x: 1460, y: 450 }, { x: 2160, y: 450 }
    ],
    enemies: [
      { x: 700, y: 410, type: 'wisp' }, { x: 1400, y: 410, type: 'wisp' }, { x: 2100, y: 410, type: 'wisp' }
    ],
    collectibles: [
      { x: 320, y: 310, type: 'coin' }, { x: 620, y: 250, type: 'coin' },
      { x: 1000, y: 300, type: 'coin' }, { x: 1340, y: 240, type: 'coin' },
      { x: 1700, y: 300, type: 'coin' }, { x: 2060, y: 240, type: 'coin' }
    ],
    altars: [{ x: 1200, y: 406, isGoal: false }, { x: 2700, y: 406, isGoal: true }],
    goalX: 2700,
    completionStory: "Ganesha and Mushika surge across the finish line amid thunderous celestial cheers! Yet the greatest test of all is not physical speed..."
  },
  {
    levelNum: 24, chapter: 3, title: "The Power of Wisdom", theme: "sacred_circle",
    speaker: "Lord Shiva & Parvati", avatar: "🕉️", hasPostCutscene: true,
    story: "Ganesha stands before Lord Shiva and Goddess Parvati on Mount Kailash. Rather than circling the outer globe again, Ganesha walks in a slow, loving, sacred circle around his beloved parents.",
    mission: "Walk with devotion around the holy thrones of Shiva and Parvati to complete the sacred circumambulation (Pradakshina).",
    tutorialText: "Walk forward with reverence to complete the sacred Pradakshina!",
    platforms: [
      { x: 0, y: 460, width: 1200, height: 80 },
      { x: 220, y: 370, width: 160, height: 20 },
      { x: 500, y: 310, width: 220, height: 20 },
      { x: 800, y: 370, width: 160, height: 20 }
    ],
    enemies: [],
    collectibles: [
      { x: 280, y: 320, type: 'modak' }, { x: 590, y: 260, type: 'modak' }, { x: 860, y: 320, type: 'modak' }
    ],
    altars: [{ x: 1050, y: 406, isGoal: true }],
    goalX: 1050,
    cutsceneDialogue: "Lord Shiva asks: 'Ganesha, my son, why have you circled only us?' Ganesha smiles gently with folded hands: 'My beloved parents, the Vedas declare that one's parents are the source of all existence. In circling you, I have circled the entire cosmos.' Hearing this, Kartikeya bows in profound respect: 'Brother, your wisdom exceeds all physical speed!'",
    completionStory: "🐘 GANESHA — THE GREAT DIVINE RACE COMPLETE! “True wisdom is greater than speed.”"
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
    this.enemiesDefeated = 0;
    this.modaksCollected = 0;
    this.lotusOrbsCollected = 0;
    this.starsCollected = 0;
    this.coinsCollected = 0;

    // Wisdom puzzle tracking
    this.wisdomCollectedCount = 0;

    // Countdown state
    this.isCountingDown = false;

    this.cameraX = 0;
    this.checkpoint = { x: 60, y: 380 };
    this.isInMainMenu = true;
    this.isPaused = true;
    this.inModal = false;

    this.player = new Player(60, 380);
    this.platforms = [];
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

    // Load persisted progress if any
    this.loadProgress();

    this.bindUI();
    this.initLevelGrid();
    this.initMenuParticles();
    this.loadLevel(0);

    // Keep story-modal hidden on first boot and show main menu
    const storyModal = document.getElementById('story-modal');
    if (storyModal) storyModal.classList.add('hidden');
    const mainMenu = document.getElementById('main-menu-overlay');
    if (mainMenu) mainMenu.classList.remove('hidden');

    sounds.playTrack('menu');

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  // LocalStorage Persistence
  saveProgress() {
    try {
      const data = {
        unlockedLevels: this.unlockedLevels,
        score: this.score
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
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
  }

  bindUI() {
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
      if (this.currentLevelIndex + 1 < LEVEL_CONFIGS.length) {
        this.loadLevel(this.currentLevelIndex + 1);
      }
    });

    document.getElementById('btn-replay-level').addEventListener('click', () => {
      document.getElementById('level-complete-modal').classList.add('hidden');
      this.loadLevel(this.currentLevelIndex);
    });

    document.getElementById('btn-restart-level').addEventListener('click', () => {
      document.getElementById('pause-modal').classList.add('hidden');
      this.isPaused = false;
      this.loadLevel(this.currentLevelIndex);
    });

    document.getElementById('btn-retry').addEventListener('click', () => {
      document.getElementById('game-over-modal').classList.add('hidden');
      this.inModal = false;
      this.loadLevel(this.currentLevelIndex);
    });

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
      this.loadLevel(0);
    });

    document.getElementById('btn-chapter-two').addEventListener('click', () => {
      document.getElementById('chapter-complete-modal').classList.add('hidden');
      this.unlockedLevels = Math.max(this.unlockedLevels, 9);
      this.saveProgress();
      this.loadLevel(8);
    });

    // Chapter 2 Celebration Buttons
    const btnC2Replay = document.getElementById('btn-c2-replay');
    if (btnC2Replay) {
      btnC2Replay.addEventListener('click', () => {
        document.getElementById('chapter2-complete-modal').classList.add('hidden');
        this.loadLevel(8);
      });
    }

    const btnC1Replay = document.getElementById('btn-c1-replay');
    if (btnC1Replay) {
      btnC1Replay.addEventListener('click', () => {
        document.getElementById('chapter2-complete-modal').classList.add('hidden');
        this.loadLevel(0);
      });
    }

    const btnStartC3 = document.getElementById('btn-chapter-three');
    if (btnStartC3) {
      btnStartC3.addEventListener('click', () => {
        document.getElementById('chapter2-complete-modal').classList.add('hidden');
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
    // MAIN MENU & NAVIGATION FLOW BINDINGS
    // ======================================================================
    const btnMenuStart = document.getElementById('btn-menu-start');
    if (btnMenuStart) {
      btnMenuStart.addEventListener('click', () => {
        sounds.init();
        this.isInMainMenu = false;
        this.openChapterSelect();
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
    sounds.playTrack('menu');
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
    const cfg = LEVEL_CONFIGS[index];

    this.levelScore = 0;
    this.enemiesDefeated = 0;
    this.modaksCollected = 0;
    this.lotusOrbsCollected = 0;
    this.starsCollected = 0;
    this.coinsCollected = 0;
    this.wisdomCollectedCount = 0;
    this.isCountingDown = false;
    this.checkpoint = { x: 60, y: 380 };

    this.player = new Player(60, 380);
    this.platforms = [...cfg.platforms];
    this.enemies = cfg.enemies ? cfg.enemies.map(e => new Enemy(e.x, e.y, e.type)) : [];

    if (cfg.boss) {
      if (cfg.bossType && cfg.bossType.startsWith('vighnasura')) {
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
    const bonus = (enemy.type === 'miniboss' || enemy.type === 'asura_chieftain') ? 300 : 75;
    this.addScore(bonus);
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

  onDefenseTargetFailed() {
    this.onPlayerDefeated();
  }

  checkLevelGoalAchieved() {
    const cfg = LEVEL_CONFIGS[this.currentLevelIndex];

    if (cfg.requiredKills && this.enemiesDefeated < cfg.requiredKills) return;
    if (cfg.requiredOrbs && this.lotusOrbsCollected < cfg.requiredOrbs) return;
    if (cfg.requiredStars && this.starsCollected < cfg.requiredStars) return;
    if (cfg.requiredCoins && this.coinsCollected < cfg.requiredCoins) return;

    if (cfg.hasWisdomPuzzle && this.wisdomCollectedCount < 3) return;

    if (this.currentLevelIndex === 23) {
      // Level 24 finale cutscene
      this.showCutscene("The Power of Wisdom", LEVEL_CONFIGS[23].cutsceneDialogue, 'wisdom_climax');
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
      this.saveProgress();
    }

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

    document.getElementById('complete-modaks').textContent = this.modaksCollected;
    document.getElementById('complete-enemies').textContent = this.enemiesDefeated;
    document.getElementById('complete-score').textContent = this.levelScore;
    document.getElementById('complete-story-text').textContent = cfg.completionStory;

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

    const totalScoreEl = document.getElementById('final-victory-score');
    if (totalScoreEl) totalScoreEl.textContent = this.score.toLocaleString();

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

      tile.innerHTML = `
        <span class="tile-number">${isUnlocked ? '🕉️ Level ' + cfg.levelNum : '🔒 Level ' + cfg.levelNum}</span>
        <span class="tile-title">${cfg.title}</span>
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

  respawnPlayer() {
    this.player.x = this.checkpoint.x;
    this.player.y = this.checkpoint.y;
    this.player.vx = 0;
    this.player.vy = 0;
  }

  onPlayerDefeated() {
    sounds.playHit();
    sounds.playTrack('gameover');
    document.getElementById('game-over-modal').classList.remove('hidden');
    this.inModal = true;
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

    document.getElementById('score-text').textContent = this.score;

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
    const activePlats = [...this.platforms, ...this.gates];
    this.player.update(this.input, activePlats, this.particles);

    if (this.player.isAttacking && !this.player.hasHitCurrentAttack) {
      const hb = this.player.attackHitbox;

      for (const enemy of this.enemies) {
        if (enemy.isAlive && enemy.collidesWith(hb)) {
          enemy.takeHit(24, this.particles);
          enemy.vx = this.player.facing * 4;
          this.player.hasHitCurrentAttack = true;
        }
      }

      if (this.boss && this.boss.isAlive && this.boss.hitTimer <= 0) {
        if (
          hb.x < this.boss.x + this.boss.width &&
          hb.x + hb.width > this.boss.x &&
          hb.y < this.boss.y + this.boss.height &&
          hb.y + hb.height > this.boss.y
        ) {
          this.boss.takeHit(18, this.particles);
          this.player.hasHitCurrentAttack = true;
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

    // Player
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
