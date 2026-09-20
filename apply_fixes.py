import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update Player.takeDamage and hitHazard
old_takeDamage = '''  takeDamage(amount = 20, source = "Enemy") {
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
  }'''

new_takeDamage = '''  takeDamage(amount = 20, source = "Enemy") {
    if (this.invulnerableTimer > 0) return;
    this.health = Math.max(0, this.health - amount);
    this.invulnerableTimer = 40;
    
    // Knockback bounce to prevent player sticking inside enemy / villain hitbox
    this.vy = -4.0;
    this.vx = (this.facing > 0 ? -3.5 : 3.5);
    
    sounds.playHurt();
    particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 10, '#ff5252');
    if (typeof game !== 'undefined' && game.triggerVibrate) game.triggerVibrate(60);

    if (this.health <= 0) {
      if (typeof game !== 'undefined' && game.loseLife) {
        game.loseLife(source, true);
      }
    }
  }

  hitHazard(source = "Obstacle") {
    if (this.invulnerableTimer > 0) return;
    this.health = Math.max(0, this.health - 25);
    this.invulnerableTimer = 45;
    this.vy = -4.0;
    this.vx = (this.facing > 0 ? -3.5 : 3.5);
    sounds.playHurt();
    if (this.health <= 0) {
      if (typeof game !== 'undefined' && game.loseLife) {
        game.loseLife(source, true);
      }
    }
  }'''

if old_takeDamage in js:
    js = js.replace(old_takeDamage, new_takeDamage)
    print("Replaced Player.takeDamage and hitHazard successfully")
else:
    print("Warning: old_takeDamage not found verbatim, checking alternative...")

# 2. Update World Bounds abyss check in Player
old_abyss = '''    if (this.y > 640) {
      this.health = 0;
      game.loseLife("Fell into the abyss");
    }'''

new_abyss = '''    if (this.y > 640) {
      this.health = 0;
      if (typeof game !== 'undefined' && game.loseLife) {
        game.loseLife("Fell into the abyss", true);
      }
    }'''

if old_abyss in js:
    js = js.replace(old_abyss, new_abyss)
    print("Replaced World bounds abyss check successfully")

# 3. Update SacredRiver abyss/water touch
old_river = '''      particles.emitSparks(player.x + player.width / 2, this.y + 10, 14, this.type === 'light' ? '#00e5ff' : '#64b5f6');
      sounds.playWaterSplash();
      game.loseLife("Sacred River");'''

new_river = '''      particles.emitSparks(player.x + player.width / 2, this.y + 10, 14, this.type === 'light' ? '#00e5ff' : '#64b5f6');
      sounds.playWaterSplash();
      if (typeof game !== 'undefined' && game.loseLife) {
        game.loseLife("Sacred River", true);
      }'''

if old_river in js:
    js = js.replace(old_river, new_river)
    print("Replaced SacredRiver touch successfully")

# 4. Update ObstacleTrap damage
old_trap = '''    if (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    ) {
      if (player.invulnerableTimer <= 0) {
        player.takeDamage(1);
      }
    }'''

new_trap = '''    if (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    ) {
      if (player.invulnerableTimer <= 0) {
        player.takeDamage(18, "Spike Trap");
      }
    }'''

if old_trap in js:
    js = js.replace(old_trap, new_trap)
    print("Replaced ObstacleTrap successfully")

# 5. Update loseLife and respawnPlayer
old_loseLife = '''  respawnPlayer() {
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
  }'''

new_loseLife = '''  respawnPlayer() {
    if (!this.player) return;
    const spawnX = (this.checkpoint && Number.isFinite(this.checkpoint.x)) ? this.checkpoint.x : 60;
    const spawnY = (this.checkpoint && Number.isFinite(this.checkpoint.y)) ? this.checkpoint.y : 380;
    this.player.x = spawnX;
    this.player.y = spawnY;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isGrounded = false;
    this.player.standingPlatform = null;
    this.player.invulnerableTimer = 90;
    this.cameraX = Math.max(0, spawnX - 250);
  }

  loseLife(reason = "Hazard", force = false) {
    if (!force && this.player && this.player.invulnerableTimer > 0) return;
    this.lives = Math.max(0, this.lives - 1);
    sounds.playHit();
    this.updateLivesDisplay();
    const heartsEl = document.getElementById('lives-display') || document.getElementById('lives-hearts');
    if (heartsEl) {
      heartsEl.classList.add('hurt');
      setTimeout(() => heartsEl.classList.remove('hurt'), 600);
    }
    if (this.particles && this.player) {
      this.particles.emitSparks(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 20, '#ff5252');
    }

    if (this.lives <= 0) {
      this.onGameOver(reason);
    } else {
      this.respawnPlayer();
      if (this.player) {
        this.player.health = this.player.maxHealth;
        this.player.invulnerableTimer = 90;
      }
    }
  }'''

if old_loseLife in js:
    js = js.replace(old_loseLife, new_loseLife)
    print("Replaced loseLife and respawnPlayer successfully")

# 6. Update btnRetry in bindUI
old_btnRetry = '''    const btnRetry = document.getElementById('btn-retry');
    if (btnRetry) {
      btnRetry.addEventListener('click', () => {
        document.getElementById('game-over-modal').classList.add('hidden');
        this.inModal = false;
        this.isPaused = false;
        this.loadLevel(this.currentLevelIndex);
      });
    }'''

new_btnRetry = '''    const btnRetry = document.getElementById('btn-retry');
    if (btnRetry) {
      btnRetry.addEventListener('click', () => {
        document.getElementById('game-over-modal').classList.add('hidden');
        this.inModal = false;
        this.isPaused = false;
        this.lives = 3;
        this.updateLivesDisplay();
        this.respawnPlayer();
        if (this.player) {
          this.player.health = this.player.maxHealth;
          this.player.invulnerableTimer = 90;
        }
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
    }'''

if old_btnRetry in js:
    js = js.replace(old_btnRetry, new_btnRetry)
    print("Replaced btnRetry successfully")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Saved script.js successfully")
