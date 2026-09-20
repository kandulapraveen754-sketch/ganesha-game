import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update Player constructor
player_constr_old = '''    this.skillCooldown = 0;
    this.invulnerableTimer = 0;
    this.walkCycle = 0;
    this.boostTimer = 0;
    this.divineAuraTimer = 0;
    this.standingPlatform = null;'''

player_constr_new = '''    this.skillCooldown = 0;
    this.invulnerableTimer = 0;
    this.isInvulnerable = false;
    this.hitCooldown = 0;
    this.collisionCooldown = 0;
    this.walkCycle = 0;
    this.boostTimer = 0;
    this.divineAuraTimer = 0;
    this.standingPlatform = null;'''

if player_constr_old in js:
    js = js.replace(player_constr_old, player_constr_new)
    print("1. Updated Player constructor flags successfully")
else:
    print("1. Notice: player constructor flags might already be updated or structured differently")

# 2. Update Player.update timer logic
player_update_timer_old = '''    if (this.skillCooldown > 0) this.skillCooldown--;
    if (this.invulnerableTimer > 0) this.invulnerableTimer--;
    if (this.boostTimer > 0) this.boostTimer--;'''

player_update_timer_new = '''    if (this.skillCooldown > 0) this.skillCooldown--;
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer--;
      this.isInvulnerable = true;
    } else {
      this.isInvulnerable = false;
    }
    if (this.hitCooldown > 0) this.hitCooldown--;
    if (this.collisionCooldown > 0) this.collisionCooldown--;
    if (this.boostTimer > 0) this.boostTimer--;'''

if player_update_timer_old in js:
    js = js.replace(player_update_timer_old, player_update_timer_new)
    print("2. Updated Player update timers successfully")
else:
    print("2. Notice: player update timers not found verbatim")

# 3. Update Player.takeDamage and hitHazard
player_damage_pattern = re.compile(r'  takeDamage\(amount = 20, source = "Enemy"[\s\S]*?  hitHazard\(source = "Obstacle"[\s\S]*?  \}', re.DOTALL)

player_damage_replacement = '''  takeDamage(amount = 20, source = "Enemy", fromX = null) {
    if (this.isInvulnerable || this.invulnerableTimer > 0 || this.hitCooldown > 0) return false;
    this.health = Math.max(0, this.health - amount);
    this.invulnerableTimer = 55; // ~0.9s invulnerability at 60fps
    this.isInvulnerable = true;
    this.hitCooldown = 55;

    // Smooth knockback and safe separation away from damage source
    const centerSourceX = (fromX !== null && Number.isFinite(fromX)) ? fromX : (this.facing > 0 ? this.x + this.width + 10 : this.x - 10);
    const pushDir = (this.x + this.width / 2 < centerSourceX) ? -1 : 1;
    this.vx = pushDir * 5.2;
    this.vy = -4.5;
    this.x += pushDir * 10; // Instantly separate bounding boxes

    sounds.playHurt();
    particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 12, '#ff5252');
    if (typeof game !== 'undefined' && game && game.triggerVibrate) game.triggerVibrate(60);

    if (this.health <= 0) {
      if (typeof game !== 'undefined' && game && game.loseLife) {
        game.loseLife(source, true);
      }
    }
    return true;
  }

  hitHazard(source = "Obstacle", fromX = null) {
    if (this.isInvulnerable || this.invulnerableTimer > 0 || this.hitCooldown > 0) return false;
    this.health = Math.max(0, this.health - 25);
    this.invulnerableTimer = 55;
    this.isInvulnerable = true;
    this.hitCooldown = 55;

    const centerSourceX = (fromX !== null && Number.isFinite(fromX)) ? fromX : (this.facing > 0 ? this.x + this.width + 10 : this.x - 10);
    const pushDir = (this.x + this.width / 2 < centerSourceX) ? -1 : 1;
    this.vx = pushDir * 5.2;
    this.vy = -4.5;
    this.x += pushDir * 10;

    sounds.playHurt();
    particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 12, '#ff5252');

    if (this.health <= 0) {
      if (typeof game !== 'undefined' && game && game.loseLife) {
        game.loseLife(source, true);
      }
    }
    return true;
  }'''

if player_damage_pattern.search(js):
    js = player_damage_pattern.sub(player_damage_replacement, js, count=1)
    print("3. Replaced Player.takeDamage and hitHazard with safe separation")
else:
    print("3. Warning: Player takeDamage pattern not matched")

# 4. Update Enemy.update player touch damage and separation
enemy_touch_old = '''    // 2. Player Touch Damage
    if (this.collidesWith(player) && this.attackCooldown <= 0) {
      player.takeDamage(this.damage);
      this.attackCooldown = 40;
      particles.emitSparks(player.x + player.width / 2, player.y + player.height / 2, 8, '#ff1744');
    }'''

enemy_touch_new = '''    // 2. Player Touch Damage & Safe Separation
    if (this.collidesWith(player)) {
      if (this.attackCooldown <= 0 && !player.isInvulnerable && player.invulnerableTimer <= 0) {
        player.takeDamage(this.damage, this.type || "Enemy", this.x + this.width / 2);
        this.attackCooldown = 55; // 0.9s attack cooldown
        particles.emitSparks(player.x + player.width / 2, player.y + player.height / 2, 8, '#ff1744');
      } else {
        // Safe spatial separation if overlapping during invulnerability
        const pMid = player.x + player.width / 2;
        const eMid = this.x + this.width / 2;
        if (pMid < eMid) {
          player.x = Math.max(0, this.x - player.width - 2);
        } else {
          player.x = this.x + this.width + 2;
        }
      }
    }'''

if enemy_touch_old in js:
    js = js.replace(enemy_touch_old, enemy_touch_new)
    print("4. Updated Enemy.update player touch & separation")
else:
    print("4. Notice: enemy_touch_old not found verbatim")

# 5. Update AsuraWarlordBoss touch damage & separation
boss1_touch_old = '''    // Player touch collision
    if (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    ) {
      player.takeDamage(this.damage);
    }'''

boss1_touch_new = '''    // Player touch collision & safe separation
    if (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    ) {
      if (this.attackCooldown <= 0 && !player.isInvulnerable && player.invulnerableTimer <= 0) {
        player.takeDamage(this.damage, "Asura Warlord Boss", this.x + this.width / 2);
        this.attackCooldown = 55;
      } else {
        const pMid = player.x + player.width / 2;
        const bMid = this.x + this.width / 2;
        if (pMid < bMid) {
          player.x = Math.max(0, this.x - player.width - 3);
        } else {
          player.x = this.x + this.width + 3;
        }
      }
    }'''

if boss1_touch_old in js:
    js = js.replace(boss1_touch_old, boss1_touch_new)
    print("5. Updated AsuraWarlordBoss touch & separation")
else:
    print("5. Notice: boss1_touch_old not found verbatim")

# 6. Update ShivaBoss attack touch
shiva_touch_old = '''      if (Math.hypot(player.x - this.x, player.y - this.y) < 140) {
        player.takeDamage(15);
      }'''

shiva_touch_new = '''      if (Math.hypot(player.x - this.x, player.y - this.y) < 140) {
        if (!player.isInvulnerable && player.invulnerableTimer <= 0) {
          player.takeDamage(15, "Trident Pulse", this.x + this.width / 2);
        }
      }'''

if shiva_touch_old in js:
    js = js.replace(shiva_touch_old, shiva_touch_new)
    print("6. Updated ShivaBoss attack check")
else:
    print("6. Notice: shiva_touch_old not found verbatim")

# 7. Update FallingRock damage check
falling_rock_old = '''        player.takeDamage(20);
        this.isShattered = true;
        particles.emitSparks(this.x + 15, this.y + 15, 12, '#8d6e63');'''

falling_rock_new = '''        player.takeDamage(20, "Falling Rock", this.x + 15);
        this.isShattered = true;
        particles.emitSparks(this.x + 15, this.y + 15, 12, '#8d6e63');'''

if falling_rock_old in js:
    js = js.replace(falling_rock_old, falling_rock_new)
    print("7. Updated FallingRock damage check")
else:
    print("7. Notice: falling_rock_old not found verbatim")

# 8. Update Projectile damage check
projectile_old = '''    if (
      this.x < player.x + player.width &&
      this.x + this.width > player.x &&
      this.y < player.y + player.height &&
      this.y + this.height > player.y
    ) {
      player.takeDamage(this.damage);
      this.isAlive = false;
      particles.emitSparks(this.x, this.y, 6, '#00e5ff');
    }'''

projectile_new = '''    if (
      this.x < player.x + player.width &&
      this.x + this.width > player.x &&
      this.y < player.y + player.height &&
      this.y + this.height > player.y
    ) {
      if (!player.isInvulnerable && player.invulnerableTimer <= 0) {
        player.takeDamage(this.damage, this.type || "Energy Bolt", this.x);
      }
      this.isAlive = false;
      particles.emitSparks(this.x, this.y, 6, '#00e5ff');
    }'''

if projectile_old in js:
    js = js.replace(projectile_old, projectile_new)
    print("8. Updated Projectile damage check")
else:
    print("8. Notice: projectile_old not found verbatim")

# 9. Update GameEngine.prototype.loop with try-catch safety guards
loop_old = '''  loop(timestamp) {
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (!this.isPaused && !this.inModal) {
      this.update();
    }

    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }'''

loop_new = '''  loop(timestamp) {
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    try {
      if (!this.isPaused && !this.inModal) {
        this.update();
      }
    } catch (err) {
      console.error("Safety guard caught error during game.update:", err);
    }

    try {
      this.render();
    } catch (err) {
      console.error("Safety guard caught error during game.render:", err);
    }

    requestAnimationFrame((t) => this.loop(t));
  }'''

if loop_old in js:
    js = js.replace(loop_old, loop_new)
    print("9. Updated loop with global safety catch")
else:
    print("9. Notice: loop_old not found verbatim")

# 10. Update loseLife with anti-recursion flag
lose_life_old = '''  loseLife(reason = "Hazard", force = false) {
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

lose_life_new = '''  loseLife(reason = "Hazard", force = false) {
    if (this.isProcessingLifeLoss) return; // Prevent recursive calls
    if (!force && this.player && (this.player.isInvulnerable || this.player.invulnerableTimer > 0)) return;

    this.isProcessingLifeLoss = true;
    try {
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
          this.player.isInvulnerable = true;
        }
      }
    } finally {
      this.isProcessingLifeLoss = false;
    }
  }'''

if lose_life_old in js:
    js = js.replace(lose_life_old, lose_life_new)
    print("10. Updated loseLife with anti-recursion and try-finally")
else:
    print("10. Notice: lose_life_old not found verbatim")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Saved script.js successfully")
