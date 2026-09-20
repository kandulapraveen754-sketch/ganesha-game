with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Enhance modal button bindings in bindUI with robust tap and click support
old_bindings = '''    const btnRetry = document.getElementById('btn-retry');
    if (btnRetry) {
      btnRetry.addEventListener('click', () => {
        const modal = document.getElementById('game-over-modal');
        if (modal) modal.classList.add('hidden');
        this.inModal = false;
        this.isPaused = false;
        this.lives = 3;
        this.updateLivesDisplay();
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
    }'''

new_bindings = '''    const addModalTap = (btnId, handler) => {
      const el = document.getElementById(btnId);
      if (!el) return;
      let lastTap = 0;
      const execute = (e) => {
        const now = Date.now();
        if (now - lastTap < 300) return;
        lastTap = now;
        handler(e);
      };
      el.addEventListener('click', execute);
      el.addEventListener('pointerdown', execute);
    };

    addModalTap('btn-retry', () => {
      const modal = document.getElementById('game-over-modal');
      if (modal) modal.classList.add('hidden');
      this.inModal = false;
      this.isPaused = false;
      this.lives = 3;
      this.updateLivesDisplay();
      this.loadLevel(this.currentLevelIndex);
    });

    addModalTap('btn-restart-from-fail', () => {
      const modal = document.getElementById('game-over-modal');
      if (modal) modal.classList.add('hidden');
      this.inModal = false;
      this.isPaused = false;
      this.loadLevel(this.currentLevelIndex);
    });

    addModalTap('btn-fail-home', () => {
      const modal = document.getElementById('game-over-modal');
      if (modal) modal.classList.add('hidden');
      this.inModal = false;
      this.isPaused = false;
      this.returnToMainMenu();
    });'''

if old_bindings in js:
    js = js.replace(old_bindings, new_bindings)
    print("Replaced modal button bindings with dual tap/click handlers")
else:
    print("Warning: old_bindings not found verbatim")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Saved script.js successfully")
