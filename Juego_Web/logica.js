/**
 * ==============================================================
 * ⚙️ MALVINAS ARCADE — PARTE DE LÓGICA Y MOTOR (logica.js)
 * ==============================================================
 * Este archivo contiene la lógica matemática y visual del juego:
 * - Sintetizador de audio retro (SFX Web Audio API)
 * - Carga de imágenes y sprites de Analía
 * - Motor de física, gravedad, salto, velocidad y colisiones
 * - Generador de los 3 niveles y sus obstáculos
 * - Inteligencia artificial de enemigos y Jefe Final (Boss)
 * - Renderizado en Canvas 2D (montañas, mostrador, heladeras, efectos)
 * ==============================================================
 */

/**************************************************************
     * 1. SISTEMA DE SONIDO RETRO (Web Audio API - Sin archivos externos)
     **************************************************************/
    let soundEnabled = true;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function playTone(freq, type, duration, vol = 0.12, slideFreq = null) {
      if (!soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        if (slideFreq) {
          osc.frequency.exponentialRampToValueAtTime(slideFreq, audioCtx.currentTime + duration);
        }
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) {}
    }

    const SFX = {
      jump: () => playTone(260, 'square', 0.16, 0.1, 580),
      cone: () => {
        playTone(987, 'square', 0.07, 0.1);
        setTimeout(() => playTone(1318, 'square', 0.18, 0.1), 70);
      },
      powerup: () => {
        [330, 392, 659, 523, 587, 784].forEach((f, i) => {
          setTimeout(() => playTone(f, 'triangle', 0.1, 0.14), i * 65);
        });
      },
      stomp: () => playTone(420, 'sawtooth', 0.12, 0.12, 140),
      shoot: () => playTone(750, 'square', 0.1, 0.09, 280),
      hurt: () => playTone(220, 'sawtooth', 0.28, 0.15, 90),
      win: () => {
        [523, 659, 784, 1046, 784, 1046].forEach((f, i) => {
          setTimeout(() => playTone(f, 'square', 0.14, 0.12), i * 110);
        });
      },
      blip: () => playTone(680, 'square', 0.05, 0.08),
      cursor: () => playTone(740, 'triangle', 0.04, 0.08, 920),
      select: () => {
        playTone(523, 'triangle', 0.07, 0.1);
        setTimeout(() => playTone(784, 'triangle', 0.12, 0.1), 60);
      }
    };

    
    // ============================================================
    // RECOMENDACIÓN 1: MÚSICA CHIPTUNE DE FONDO (8-BIT BGM NATIVA)
    // ============================================================
    const BGM = {
      isPlaying: false,
      step: 0,
      tempo: 138,
      timerId: null,
      leadVol: 0.035,
      bassVol: 0.045,

      // Melodía alegre y pegadiza estilo arcade
      melody: [
        523.25, 0, 659.25, 0, 783.99, 0, 1046.50, 0,
        880.00, 0, 783.99, 0, 659.25, 0, 587.33, 0,
        523.25, 0, 587.33, 0, 659.25, 659.25, 587.33, 0,
        523.25, 0, 392.00, 0, 523.25, 0, 0, 0,
        659.25, 0, 783.99, 0, 880.00, 0, 987.77, 0,
        1046.50, 0, 880.00, 0, 783.99, 0, 659.25, 0,
        698.46, 0, 659.25, 0, 587.33, 0, 523.25, 0,
        587.33, 0, 783.99, 0, 1046.50, 0, 0, 0
      ],

      // Línea de bajo triangular con ritmo marcado
      bass: [
        261.63, 261.63, 329.63, 329.63, 392.00, 392.00, 329.63, 329.63,
        220.00, 220.00, 261.63, 261.63, 329.63, 329.63, 293.66, 293.66,
        261.63, 261.63, 293.66, 293.66, 329.63, 329.63, 293.66, 293.66,
        261.63, 261.63, 196.00, 196.00, 261.63, 261.63, 261.63, 0,
        329.63, 329.63, 392.00, 392.00, 440.00, 440.00, 493.88, 493.88,
        523.25, 523.25, 440.00, 440.00, 392.00, 392.00, 329.63, 329.63,
        349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63, 261.63,
        293.66, 293.66, 392.00, 392.00, 523.25, 523.25, 523.25, 0
      ],

      tick() {
        if (!this.isPlaying || !soundEnabled) return;
        try {
          if (!audioCtx) audioCtx = new AudioCtx();
          if (audioCtx.state === 'suspended') audioCtx.resume();

          const now = audioCtx.currentTime;
          const stepIdx = this.step % this.melody.length;
          const leadFreq = this.melody[stepIdx];
          const bassFreq = this.bass[stepIdx];
          const stepSec = 60 / (this.tempo * 2);

          if (leadFreq > 0) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(leadFreq, now);
            gain.gain.setValueAtTime(this.leadVol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + stepSec * 0.82);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + stepSec * 0.85);
          }

          if (bassFreq > 0) {
            const bassOsc = audioCtx.createOscillator();
            const bassGain = audioCtx.createGain();
            bassOsc.type = 'triangle';
            bassOsc.frequency.setValueAtTime(bassFreq, now);
            bassGain.gain.setValueAtTime(this.bassVol, now);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + stepSec * 0.88);
            bassOsc.connect(bassGain);
            bassGain.connect(audioCtx.destination);
            bassOsc.start(now);
            bassOsc.stop(now + stepSec * 0.9);
          }

          this.step++;
          const nextMs = (60 / (this.tempo * 2)) * 1000;
          this.timerId = setTimeout(() => this.tick(), nextMs);
        } catch (e) {}
      },

      start() {
        if (this.isPlaying || !soundEnabled) return;
        this.isPlaying = true;
        this.step = 0;
        this.tempo = (typeof CONFIG_MUSICA !== 'undefined' ? CONFIG_MUSICA.tempoNormal : 140);
        this.tick();
      },

      stop() {
        this.isPlaying = false;
        if (this.timerId) {
          clearTimeout(this.timerId);
          this.timerId = null;
        }
      },

      setSuperMode(isSuper) {
        if (!this.isPlaying) return;
        this.tempo = isSuper
          ? (typeof CONFIG_MUSICA !== 'undefined' ? CONFIG_MUSICA.tempoSuperModo : 185)
          : (typeof CONFIG_MUSICA !== 'undefined' ? CONFIG_MUSICA.tempoNormal : 140);
      }
    };
    window.BGM = BGM;
    window.SFX = SFX;


    const soundToggleBtn = document.getElementById('soundToggleBtn');
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', (e) => {
        soundEnabled = !soundEnabled;
        e.target.textContent = soundEnabled ? '🔊 Sonido: ON' : '🔇 Sonido: OFF';
      });
    }

    /**************************************************************
     * 2. SISTEMA DE RANKING Y BASE DE DATOS EN VIVO (Firebase Firestore)
     **************************************************************/
    function getRanking() {
      if (window.MalvinasDB && typeof window.MalvinasDB.getPublicRanking === 'function') {
        return window.MalvinasDB.getPublicRanking();
      }
      return [];
    }

    function getAdminRanking() {
      if (window.MalvinasDB && typeof window.MalvinasDB.getAdminRanking === 'function') {
        return window.MalvinasDB.getAdminRanking();
      }
      return [];
    }

    async function saveScoreToRanking(name, contact, score) {
      if (!window.MalvinasDB || typeof window.MalvinasDB.submitScore !== 'function') {
        throw new Error('Conectando con la base de datos. Esperá un segundo e intentá de nuevo.');
      }
      return await window.MalvinasDB.submitScore(name, contact, score);
    }

    function maskContact(contact) {
      if (window.MalvinasDB && typeof window.MalvinasDB.maskContactForPublic === 'function') {
        return window.MalvinasDB.maskContactForPublic(contact);
      }
      const clean = String(contact || '').trim();
      if (!clean) return '••••';
      if (clean.startsWith('@')) return '@' + clean.slice(1, 3) + '••••';
      if (clean.length >= 4) return '••••' + clean.slice(-2);
      return '••••';
    }

    function renderRanking() {
      const db = window.MalvinasDB;
      const list = getRanking();
      const ul = document.getElementById('rankingList');

      if (ul) {
        ul.innerHTML = '';
        if (!db || !db.isPublicLoaded()) {
          ul.innerHTML = '<li class="ranking-empty-state">⏳ Cargando Salón de la Fama en vivo...</li>';
        } else if (db.getConnectionError() && list.length === 0) {
          ul.innerHTML = `<li class="ranking-empty-state">⚠️ ${escapeHtml(db.getConnectionError())}</li>`;
        } else if (list.length === 0) {
          ul.innerHTML = '<li class="ranking-empty-state">🍦 ¡Todavía no hay puntajes esta semana! Jugá y sé el primero en subir tu récord.</li>';
        } else {
          list.slice(0, 10).forEach((item, idx) => {
            const li = document.createElement('li');
            li.className = `ranking-item ${idx === 0 ? 'top-1' : idx === 1 ? 'top-2' : idx === 2 ? 'top-3' : ''}`;
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
            li.innerHTML = `
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="rank-pos">${medal}</span>
                <span class="rank-name">${escapeHtml(item.name)}</span>
              </div>
              <span class="rank-score">${item.score} pts</span>
            `;
            ul.appendChild(li);
          });
        }
      }

      // Actualizar tabla Admin (solo cuando el administrador inició sesión)
      const tbody = document.getElementById('adminTableBody');
      if (tbody) {
        tbody.innerHTML = '';
        if (!db || !db.isAdminLoggedIn()) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:18px;">🔐 Iniciá sesión como administrador para ver los participantes.</td></tr>';
          const totalEl = document.getElementById('adminTotalPlayers');
          const topEl = document.getElementById('adminTopScore');
          if (totalEl) totalEl.textContent = '0';
          if (topEl) topEl.textContent = '0 pts';
          return;
        }

        const adminList = getAdminRanking();
        if (!db.isAdminLoaded()) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:18px;">⏳ Cargando participantes...</td></tr>';
        } else if (adminList.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:18px;">🍦 Aún no hay participantes registrados en este sorteo.</td></tr>';
        } else {
          adminList.forEach((item, idx) => {
            const tr = document.createElement('tr');
            const statusHtml = item.verified
              ? '<span class="badge-ok">✔ Verificado</span>'
              : '<span class="badge-warn">⚠️ Revisar</span>';
            tr.innerHTML = `
              <td><strong>#${idx + 1}</strong></td>
              <td>${escapeHtml(item.name)}</td>
              <td>${escapeHtml(item.contact)}</td>
              <td><strong style="color:#facc15">${item.score}</strong></td>
              <td>${statusHtml}</td>
              <td><button type="button" class="btn-delete-row" data-entry-id="${escapeHtml(item.id)}" title="Eliminar registro">🗑️</button></td>
            `;
            tbody.appendChild(tr);
          });
        }
        const totalEl = document.getElementById('adminTotalPlayers');
        const topEl = document.getElementById('adminTopScore');
        if (totalEl) totalEl.textContent = adminList.length;
        if (topEl) topEl.textContent = adminList.length ? adminList[0].score + ' pts' : '0 pts';
      }
    }
    window.renderRanking = renderRanking;

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
    }

    /**************************************************************
     * 3. CARGA DE PERSONAJE PERSONALIZADO (PNG SPRITE)
     **************************************************************/
    const DEFAULT_MAESTRA_B64 = "data:image/png;base64,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";
    const defaultMaestraImg = new Image();
    defaultMaestraImg.src = "personaje_heladera_malvinas.png";
    defaultMaestraImg.onerror = () => {
      defaultMaestraImg.src = DEFAULT_MAESTRA_B64;
    };

    /**************************************************************
     * LOGO OFICIAL HELADERÍA MALVINAS (Para tachos de helado y carteles)
     **************************************************************/
    const DEFAULT_LOGO_B64 = "data:image/png;base64,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";
    const logoMalvinasImg = new Image();
    logoMalvinasImg.src = "logo_heladeria_malvinas.png";
    logoMalvinasImg.onerror = () => {
      logoMalvinasImg.src = DEFAULT_LOGO_B64;
    };

    /**************************************************************
     * FUNCIÓN PARA GENERAR FONDOS HORIZONTALMENTE CONTINUOS (SEAMLESS)
     * Elimina el corte/salto visible cuando el fondo se repite en scroll
     **************************************************************/
    function makeSeamless(img, blendWidth = 220) {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (!w || !h) return img;
      const bw = Math.min(blendWidth, Math.floor(w * 0.25));
      const outW = w - bw;

      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      // 1. Dibujar la imagen base completa en el lienzo de ancho outW
      ctx.drawImage(img, 0, 0);

      // 2. Extraer la tira del extremo derecho [w - bw, w] y aplicarle máscara con gradiente lineal de opacidad (1 a 0)
      const strip = document.createElement('canvas');
      strip.width = bw;
      strip.height = h;
      const sctx = strip.getContext('2d');
      sctx.drawImage(img, w - bw, 0, bw, h, 0, 0, bw, h);
      sctx.globalCompositeOperation = 'destination-in';
      const grad = sctx.createLinearGradient(0, 0, bw, 0);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, bw, h);

      // 3. Fundir la tira sobre el borde izquierdo [0, bw] para que el inicio y el final de la imagen coincidan exactamente
      ctx.drawImage(strip, 0, 0);

      return canvas;
    }

    /**************************************************************
     * FONDOS OFICIALES PIXEL ART: NIVELES 1 Y 2
     **************************************************************/
    const bgDiqueSauces = new Image();
    bgDiqueSauces.src = "fondo_dique_los_sauces.jpg";
    let bgDiqueSaucesLoaded = false;
    let bgDiqueSaucesSeamless = null;
    bgDiqueSauces.onload = () => {
      bgDiqueSaucesLoaded = true;
      try {
        bgDiqueSaucesSeamless = makeSeamless(bgDiqueSauces, 220);
      } catch (e) {
        console.warn('Seamless fallback Dique:', e);
      }
    };

    const bgParqueCiudad = new Image();
    bgParqueCiudad.src = "fondo_parque_de_la_ciudad.jpg";
    let bgParqueCiudadLoaded = false;
    let bgParqueCiudadSeamless = null;
    bgParqueCiudad.onload = () => {
      bgParqueCiudadLoaded = true;
      try {
        bgParqueCiudadSeamless = makeSeamless(bgParqueCiudad, 220);
      } catch (e) {
        console.warn('Seamless fallback Parque:', e);
      }
    };

    let useHdSprite = true;
    let customPlayerImg = defaultMaestraImg;
    const spriteUpload = document.getElementById('spriteUpload');
    const resetSpriteBtn = document.getElementById('resetSpriteBtn');
    const toggleStyleBtn = document.getElementById('toggleStyleBtn');

    // ============================================================
    // CONTROLADOR DE SPRITES Y ANIMACIONES INDIVIDUALES DE ANALÍA
    // ============================================================
    const analiaSprites = {
      idle: new Image(),
      run1: new Image(),
      run2: new Image(),
      jump: new Image(),
      shoot: new Image(),
      victory: new Image(),
      loaded: { idle: false, run1: false, run2: false, jump: false, shoot: false, victory: false }
    };

    function loadAnaliaSprite(key, path) {
      analiaSprites[key].onload = () => { analiaSprites.loaded[key] = true; };
      analiaSprites[key].onerror = () => { analiaSprites.loaded[key] = false; };
      analiaSprites[key].src = path;
    }

    // Carga de poses individuales transparentes en alta definición
    loadAnaliaSprite('idle', 'sprites/analia_quieto.png');
    loadAnaliaSprite('run1', 'sprites/analia_correr_1.png');
    loadAnaliaSprite('run2', 'sprites/analia_correr_2.png');
    loadAnaliaSprite('jump', 'sprites/analia_salto.png');
    loadAnaliaSprite('shoot', 'sprites/analia_disparo.png');
    loadAnaliaSprite('victory', 'sprites/analia_victoria.png');

    // ============================================================
    // SPRITE OFICIAL DE MALVI (EL CUCURUCHO CON LENTES DE SOL)
    // ============================================================
    const malviSprite = new Image();
    malviSprite.src = 'sprites/malvi_dibujo.png';
    let malviLoaded = false;
    malviSprite.onload = () => { malviLoaded = true; };
    malviSprite.onerror = () => { malviLoaded = false; };

    function getAnaliaCurrentSprite() {
      // Si el usuario subió una imagen personalizada propia por el botón
      if (customPlayerImg && customPlayerImg !== defaultMaestraImg) {
        return customPlayerImg;
      }
      // Estado 1: Victoria en la meta
      if (gameState === 'VICTORY' || (goalFlag && goalFlag.reached)) {
        if (analiaSprites.loaded.victory) return analiaSprites.victory;
      }
      // Estado 2: Disparo de copos de nieve (Poder Malvi)
      if (player.shootCooldown > 0) {
        if (analiaSprites.loaded.shoot) return analiaSprites.shoot;
      }
      // Estado 3: En el aire (Salto acrobático)
      if (!player.grounded) {
        if (analiaSprites.loaded.jump) return analiaSprites.jump;
      }
      // Estado 4: Corriendo en el piso (Ciclo de carrera de 2 pasos)
      const isMoving = Math.abs(player.vx) > 0.25;
      if (isMoving && player.grounded) {
        const step = Math.floor(frameCount / 8) % 2;
        if (step === 0 && analiaSprites.loaded.run1) return analiaSprites.run1;
        if (step === 1 && analiaSprites.loaded.run2) return analiaSprites.run2;
        if (analiaSprites.loaded.run1) return analiaSprites.run1;
        if (analiaSprites.loaded.run2) return analiaSprites.run2;
      }
      // Estado 5: Quieto / Idle en reposo
      if (analiaSprites.loaded.idle) return analiaSprites.idle;
      return defaultMaestraImg;
    }

    if (toggleStyleBtn) {
      toggleStyleBtn.addEventListener('click', () => {
        useHdSprite = !useHdSprite;
        customPlayerImg = useHdSprite ? defaultMaestraImg : null;
        toggleStyleBtn.textContent = useHdSprite ? '🎭 Estilo: Sprite HD' : '🎭 Estilo: Pixel 2D';
      });
    }

    if (spriteUpload) {
      spriteUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            customPlayerImg = img;
            if (resetSpriteBtn) resetSpriteBtn.style.display = 'inline-flex';
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    if (resetSpriteBtn) {
      resetSpriteBtn.addEventListener('click', () => {
        customPlayerImg = useHdSprite ? defaultMaestraImg : null;
        if (spriteUpload) spriteUpload.value = '';
        resetSpriteBtn.style.display = 'none';
      });
    }

    /**************************************************************
     * 4. MOTOR DEL JUEGO OFICIAL (3 NIVELES + BATALLA FINAL)
     **************************************************************/
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const GAME_W = 800;
    const GAME_H = 450;
    const IS_MOBILE_RENDER = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 960 && window.innerHeight <= 520);
    // PC: Full HD (1920x1080) | Celular: 1400x788 (súper nítido en pantalla chica y fluido a 60 FPS)
    const RENDER_SCALE = IS_MOBILE_RENDER ? 1.75 : 2.4;
    canvas.width = Math.round(GAME_W * RENDER_SCALE);
    canvas.height = Math.round(GAME_H * RENDER_SCALE);

    // Fuentes Retro Pixel Art para el Canvas
    const PIXEL_FONT = "'Press Start 2P', monospace";
    const PIXEL_FONT_READABLE = "'Silkscreen', 'Press Start 2P', monospace";

    // Si la fuente de Google tarda unos milisegundos en descargar, forzar re-render al completarse
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (gameState === 'PLAYING') drawGame();
      }).catch(() => {});
    }

    const keys = { left: false, right: false, jump: false, shoot: false };
    let gameState = 'PLAYING'; // 'PLAYING' | 'LEVEL_TRANSITION' | 'GAMEOVER' | 'VICTORY'
    let currentLevel = 1;
    let score = 0;
    let conesCollected = 0;
    let lives = 3;
    let cameraX = 0;
    let frameCount = 0;
    let floatingTexts = [];
    let particles = [];
    let iceBalls = [];

    // Boss del Nivel 3 (Maestro Heladero Industrial)
    let boss = null;
    let bossProjectiles = [];

    const player = {
      x: 80,
      y: 260,
      w: 36,
      h: 44,
      vx: 0,
      vy: 0,
      speed: (typeof CONFIG_JUGADOR !== 'undefined' && CONFIG_JUGADOR.velocidadMovimiento) ? CONFIG_JUGADOR.velocidadMovimiento : 4.0,
      jumpPower: (typeof CONFIG_JUGADOR !== 'undefined' && CONFIG_JUGADOR.fuerzaSalto) ? CONFIG_JUGADOR.fuerzaSalto : -10.8,
      grounded: false,
      facing: 1,
      superMode: false,
      superTimer: 0,
      superShotsLeft: 0,
      invincibleTimer: 0,
      shootCooldown: 0
    };

    let platforms = [];
    let mysteryBlocks = [];
    let cones = [];
    let powerups = [];
    let enemies = [];
    let goalFlag = { x: 2450, y: 110, w: 20, h: 270, reached: false };

    function buildLevel(lvl) {
      platforms = [];
      mysteryBlocks = [];
      cones = [];
      powerups = [];
      enemies = [];
      iceBalls = [];
      floatingTexts = [];
      cameraX = 0;

      player.x = 70;
      player.y = 260;
      player.vx = 0;
      player.vy = 0;

      if (lvl === 1) {
        // NIVEL 1: Dique Los Sauces & Costanera (Sabor 1: Frutilla a la Reina)
        addFloatingText('🍓 ¡NIVEL 1: Dique Los Sauces! Recuperá Frutilla a la Reina', 90, 210, '#f472b6');
        addFloatingText('❄️ Presioná [TIRO] o tecla X para disparar el Poder Malvi', 90, 235, '#67e8f9');

        // Costanera de piedra del Dique Los Sauces con saltos estilo Mario (recorrido extendido)
        platforms.push({ x: 0, y: 380, w: 920, h: 70, type: 'ground' });
        platforms.push({ x: 1020, y: 380, w: 760, h: 70, type: 'ground' });
        platforms.push({ x: 1880, y: 380, w: 900, h: 70, type: 'ground' });
        platforms.push({ x: 2880, y: 380, w: 870, h: 70, type: 'ground' });

        // Piedras y rocas naturales de montaña (Dique Los Sauces)
        platforms.push({ x: 420, y: 310, w: 54, h: 70, type: 'pipe' });
        platforms.push({ x: 760, y: 290, w: 54, h: 90, type: 'pipe' });
        platforms.push({ x: 1580, y: 300, w: 54, h: 80, type: 'pipe' });
        platforms.push({ x: 2390, y: 300, w: 54, h: 80, type: 'pipe' }); // Roca para subir y volverse hacia el rectángulo alto

        // Plataformas de ladrillos
        platforms.push({ x: 220, y: 275, w: 40, h: 36, type: 'brick' });
        platforms.push({ x: 300, y: 275, w: 40, h: 36, type: 'brick' });
        platforms.push({ x: 560, y: 268, w: 120, h: 32, type: 'brick' });
        platforms.push({ x: 1120, y: 270, w: 120, h: 32, type: 'brick' });
        platforms.push({ x: 1320, y: 195, w: 140, h: 32, type: 'brick' });

        // Zona de retorno: rectángulo alto (x: 2010) inaccesible de izquierda a derecha;
        // hay que avanzar a la roca (x: 2390), subir al escalón (x: 2235) y volverse hacia la izquierda
        platforms.push({ x: 2010, y: 175, w: 180, h: 32, type: 'brick' });
        platforms.push({ x: 2235, y: 235, w: 110, h: 32, type: 'brick' });

        // Tramo final extendido hacia la meta
        platforms.push({ x: 2560, y: 270, w: 120, h: 32, type: 'brick' });
        platforms.push({ x: 2970, y: 285, w: 110, h: 32, type: 'brick' });
        platforms.push({ x: 3110, y: 220, w: 110, h: 32, type: 'brick' });

        // Bloques [?] Misteriosos (Heladeras Sorpresa — cada uno lanza un premio visible)
        mysteryBlocks.push({ x: 260, y: 275, w: 40, h: 36, used: false, reward: 'powerup', bounce: 0 });
        mysteryBlocks.push({ x: 600, y: 165, w: 40, h: 36, used: false, reward: 'cone', bounce: 0 });
        mysteryBlocks.push({ x: 1160, y: 165, w: 40, h: 36, used: false, reward: 'powerup', bounce: 0 });
        mysteryBlocks.push({ x: 1680, y: 275, w: 40, h: 36, used: false, reward: 'cone', dropDir: -1, bounce: 0 });
        mysteryBlocks.push({ x: 2080, y: 74, w: 40, h: 36, used: false, reward: 'powerup', bounce: 0 }); // Premio secreto del rectángulo alto
        mysteryBlocks.push({ x: 3145, y: 120, w: 40, h: 36, used: false, reward: 'cone', bounce: 0 });

        // Cucuruchos recolectables (alineados con cada plataforma y bloque)
        const conePositions = [
          [180, 330], [280, 228], [345, 330], [580, 224], [660, 224],
          [850, 330], [970, 265], [1140, 226], [1220, 226], [1355, 150], [1425, 150],
          [1510, 330], [2040, 132], [2160, 132], [2290, 192],
          [2590, 226], [2650, 226], [2830, 265], [3025, 242], [3128, 178], [3202, 178], [3300, 330]
        ];
        conePositions.forEach(([cx, cy]) => cones.push({ x: cx, y: cy, r: 14, collected: false }));
        // Helado Secreto Oculto (+800 pts): bien arriba del bloque [?] del rectángulo alto (solo al subirse encima y saltar)
        cones.push({ x: 2100, y: -38, r: 16, collected: false, hidden: true, secret: true, points: 800 });

        // Enemigos: Solcitos de Calor Riojano (45°C)
        enemies.push({ x: 520, y: 344, w: 36, h: 36, vx: 1.2, minX: 485, maxX: 740, alive: true, type: 'sun' });
        enemies.push({ x: 1150, y: 344, w: 36, h: 36, vx: -1.4, minX: 1030, maxX: 1550, alive: true, type: 'sun' });
        enemies.push({ x: 1420, y: 344, w: 36, h: 36, vx: 1.45, minX: 1030, maxX: 1550, alive: true, type: 'sun' });
        enemies.push({ x: 2080, y: 344, w: 36, h: 36, vx: -1.4, minX: 1920, maxX: 2360, alive: true, type: 'sun' });
        enemies.push({ x: 2550, y: 344, w: 36, h: 36, vx: 1.5, minX: 2460, maxX: 2740, alive: true, type: 'sun' });
        enemies.push({ x: 3040, y: 344, w: 36, h: 36, vx: -1.55, minX: 2910, maxX: 3340, alive: true, type: 'sun' });

        boss = null;
        bossProjectiles = [];
        goalFlag = { x: 3450, y: 120, w: 16, h: 260, reached: false };
      } else if (lvl === 2) {
        // NIVEL 2: Parque de la Ciudad & Superdomo (Sabor 2: Dulce de Leche Granizado)
        addFloatingText('🍮 ¡NIVEL 2: Parque de la Ciudad! Recuperá Dulce de Leche', 90, 210, '#facc15');

        platforms.push({ x: 0, y: 380, w: 680, h: 70, type: 'ground' });
        platforms.push({ x: 800, y: 380, w: 650, h: 70, type: 'ground' });
        platforms.push({ x: 1580, y: 380, w: 1050, h: 70, type: 'ground' });

        // Plataformas flotantes y tubos
        platforms.push({ x: 350, y: 300, w: 54, h: 80, type: 'pipe' });
        platforms.push({ x: 520, y: 240, w: 130, h: 30, type: 'brick' });
        platforms.push({ x: 690, y: 290, w: 100, h: 26, type: 'ice' });
        platforms.push({ x: 960, y: 265, w: 150, h: 30, type: 'brick' });
        platforms.push({ x: 1180, y: 195, w: 150, h: 30, type: 'brick' });
        platforms.push({ x: 1460, y: 280, w: 110, h: 26, type: 'ice' });
        platforms.push({ x: 1850, y: 280, w: 120, h: 30, type: 'brick' });
        platforms.push({ x: 2030, y: 215, w: 120, h: 30, type: 'brick' });

        mysteryBlocks.push({ x: 230, y: 265, w: 40, h: 36, used: false, reward: 'powerup', bounce: 0 });
        mysteryBlocks.push({ x: 1015, y: 165, w: 40, h: 36, used: false, reward: 'cone', bounce: 0 });
        mysteryBlocks.push({ x: 1890, y: 175, w: 40, h: 36, used: false, reward: 'powerup', bounce: 0 });

        const conePositions2 = [
          [230, 215], [550, 195], [600, 195], [735, 240], [890, 330],
          [1000, 220], [1220, 150], [1275, 150], [1505, 230],
          [1720, 330], [1890, 235], [2070, 170], [2220, 330], [2300, 330]
        ];
        conePositions2.forEach(([cx, cy]) => cones.push({ x: cx, y: cy, r: 14, collected: false }));

        enemies.push({ x: 450, y: 344, w: 36, h: 36, vx: 1.7, minX: 415, maxX: 640, alive: true, type: 'flame' });
        enemies.push({ x: 920, y: 344, w: 36, h: 36, vx: -1.9, minX: 815, maxX: 1410, alive: true, type: 'sun' });
        enemies.push({ x: 1280, y: 344, w: 36, h: 36, vx: 2.0, minX: 815, maxX: 1410, alive: true, type: 'flame' });
        enemies.push({ x: 1750, y: 344, w: 36, h: 36, vx: -1.9, minX: 1600, maxX: 2320, alive: true, type: 'sun' });
        enemies.push({ x: 2150, y: 344, w: 36, h: 36, vx: 2.1, minX: 1600, maxX: 2320, alive: true, type: 'flame' });

        boss = null;
        bossProjectiles = [];
        goalFlag = { x: 2450, y: 120, w: 16, h: 260, reached: false };
      } else {
        // NIVEL 3: Microcentro Riojano (Sabor 3: Chocolate Malvinas & Boss Fight)
        addFloatingText('🍫 ¡NIVEL 3: Microcentro! Saltá y pegale EN LA CABEZA al Robot', 90, 210, '#facc15');

        // Suelo inicial + tramo final 100% PLANO Y SIN POZOS para la batalla con el Robot
        platforms.push({ x: 0, y: 380, w: 750, h: 70, type: 'ground' });
        platforms.push({ x: 880, y: 380, w: 2420, h: 70, type: 'ground' }); // Todo plano hasta la meta, imposible caerse!

        // Tachos helados y marquesinas del recorrido previo
        platforms.push({ x: 380, y: 300, w: 54, h: 80, type: 'pipe' });
        platforms.push({ x: 580, y: 250, w: 130, h: 30, type: 'brick' });
        platforms.push({ x: 760, y: 220, w: 100, h: 26, type: 'ice' });
        platforms.push({ x: 1020, y: 265, w: 140, h: 30, type: 'brick' });
        platforms.push({ x: 1240, y: 195, w: 150, h: 30, type: 'brick' });
        platforms.push({ x: 1460, y: 280, w: 120, h: 30, type: 'brick' });

        // Rectángulos tácticos a lo largo de toda la arena plana (el Robot retrocede por debajo)
        platforms.push({ x: 1740, y: 266, w: 110, h: 18, type: 'brick' });
        platforms.push({ x: 1900, y: 186, w: 120, h: 20, type: 'ice' });
        platforms.push({ x: 2140, y: 266, w: 110, h: 18, type: 'brick' });
        platforms.push({ x: 2300, y: 186, w: 120, h: 20, type: 'ice' });
        platforms.push({ x: 2540, y: 266, w: 110, h: 18, type: 'brick' });
        platforms.push({ x: 2700, y: 186, w: 120, h: 20, type: 'ice' });

        // Bloques [?] Misteriosos
        mysteryBlocks.push({ x: 260, y: 265, w: 40, h: 36, used: false, reward: 'powerup', bounce: 0 });
        mysteryBlocks.push({ x: 1080, y: 165, w: 40, h: 36, used: false, reward: 'cone', bounce: 0 });
        mysteryBlocks.push({ x: 1500, y: 180, w: 40, h: 36, used: false, reward: 'powerup', bounce: 0 });
        mysteryBlocks.push({ x: 2340, y: 92, w: 40, h: 36, used: false, reward: 'powerup', bounce: 0 }); // Súper 1KG en la arena

        // Cucuruchos
        const conePositions3 = [
          [200, 330], [260, 215], [600, 200], [660, 200], [790, 170],
          [950, 330], [1050, 220], [1280, 150], [1340, 150], [1520, 230],
          [1795, 224], [1960, 144], [2195, 224], [2360, 144], [2595, 224], [2760, 144]
        ];
        conePositions3.forEach(([cx, cy]) => cones.push({ x: cx, y: cy, r: 14, collected: false }));

        // Enemigos previos al Boss
        enemies.push({ x: 500, y: 344, w: 36, h: 36, vx: 1.8, minX: 440, maxX: 700, alive: true, type: 'sun' });
        enemies.push({ x: 1100, y: 344, w: 36, h: 36, vx: -2.0, minX: 920, maxX: 1500, alive: true, type: 'flame' });
        enemies.push({ x: 1350, y: 344, w: 36, h: 36, vx: 1.9, minX: 920, maxX: 1500, alive: true, type: 'sun' });

        // BOSS FINAL: Maestro Heladero Industrial (Arena plana, retrocede al pelear, punto débil en CABEZA)
        const bossHp = (typeof CONFIG_ENEMIGOS !== 'undefined' && CONFIG_ENEMIGOS.vidaBoss) ? CONFIG_ENEMIGOS.vidaBoss : 12;
        boss = {
          x: 1960,
          y: 286,
          baseY: 286,
          w: 78,
          h: 94,
          vx: 1.75,
          vy: 0,
          minX: 1820,
          maxX: 2860,
          arenaMaxX: 2860,
          hp: bossHp,
          maxHp: bossHp,
          alive: true,
          hitTimer: 0,
          retreatTimer: 0,
          shootTimer: 50,
          jumpTimer: 90,
          sideHits: 0,
          enraged: false
        };
        bossProjectiles = [];

        goalFlag = { x: 2980, y: 120, w: 16, h: 260, reached: false };
      }

      // Asignar vida a todos los enemigos (3 golpes de copos de nieve para congelarlos)
      const enemyHp = (typeof CONFIG_ENEMIGOS !== 'undefined' && CONFIG_ENEMIGOS.vidaEnemigo) ? CONFIG_ENEMIGOS.vidaEnemigo : 3;
      for (const en of enemies) {
        en.hp = enemyHp;
        en.maxHp = enemyHp;
        en.hitTimer = 0;
      }

      updateHud();
    }

    function addFloatingText(text, x, y, color = '#facc15') {
      floatingTexts.push({ text, x, y, color, life: 50 });
    }

    function updateHud() {
      let lvlName = 'NIVEL 1: DIQUE LOS SAUCES';
      if (currentLevel === 2) lvlName = 'NIVEL 2: PARQUE DE LA CIUDAD';
      if (currentLevel === 3) lvlName = 'NIVEL 3: MICROCENTRO (BOSS)';
      document.getElementById('hudLevel').textContent = lvlName;
      document.getElementById('hudScore').textContent = String(score).padStart(5, '0');
      document.getElementById('hudCones').textContent = `🍦 x${conesCollected}`;
      if (player.superMode) {
        const secLeft = Math.max(1, Math.ceil(player.superTimer / 60));
        document.getElementById('hudPower').textContent = `⭐ SÚPER 1KG (${player.superShotsLeft}❄️ • ${secLeft}s)`;
      } else {
        document.getElementById('hudPower').textContent = '❄️ PODER MALVI';
      }
      document.getElementById('hudPower').style.color = player.superMode ? '#f472b6' : '#67e8f9';
      document.getElementById('hudLives').textContent = '❤️'.repeat(Math.max(0, lives)) || '💔';
    }

    function rectIntersect(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function shootIceBall() {
      const isSuper = player.superMode && player.superShotsLeft > 0;
      // Modo normal: 1 copo de nieve por vez. Súper Modo 1KG: hasta 4 ráfagas locas en poco tiempo!
      if (player.shootCooldown > 0 || (!isSuper && iceBalls.length >= 1) || gameState !== 'PLAYING') return;
      SFX.shoot();
      const normalCooldown = (typeof CONFIG_JUGADOR !== 'undefined' && CONFIG_JUGADOR.cooldownDisparo) ? CONFIG_JUGADOR.cooldownDisparo : 12;
      player.shootCooldown = isSuper ? 10 : normalCooldown;

      // Copo de nieve principal (mismo daño en ambos modos, más veloz)
      iceBalls.push({
        x: player.facing === 1 ? player.x + player.w : player.x - 14,
        y: player.y + 16,
        vx: player.facing * (isSuper ? 10.2 : 8.8),
        vy: -1.2,
        r: isSuper ? 10.5 : 8.5,
        angle: 0,
        rotSpeed: (player.facing || 1) * (isSuper ? 0.26 : 0.22),
        isSuper: isSuper,
        life: isSuper ? 80 : 62
      });

      // En Súper Modo 1KG dispara en abanico rápido (máximo 4 tiros locos) con el mismo daño por copo
      if (isSuper) {
        iceBalls.push({
          x: player.facing === 1 ? player.x + player.w : player.x - 14,
          y: player.y + 10,
          vx: player.facing * 9.2,
          vy: -3.2,
          r: 9.5,
          angle: 0.7,
          rotSpeed: (player.facing || 1) * -0.24,
          isSuper: true,
          life: 75
        });

        player.superShotsLeft--;
        if (player.superShotsLeft <= 0) {
          player.superMode = false;
          player.superTimer = 0;
          BGM.setSuperMode(false);
          addFloatingText('❄️ ¡4/4 Tiros Súper Usados!', player.x - 15, player.y - 16, '#94a3b8');
        }
        updateHud();
      }

      // Destellos de escarcha en las manos al disparar
      for (let p = 0; p < 6; p++) {
        particles.push({
          x: player.facing === 1 ? player.x + player.w : player.x,
          y: player.y + 16,
          vx: (player.facing * 2.0) + (Math.random() - 0.5) * 1.8,
          vy: (Math.random() - 0.5) * 1.8,
          color: isSuper ? '#f472b6' : '#bae6fd',
          r: Math.random() * 2.2 + 1,
          life: 14,
          maxLife: 14
        });
      }
    }

    function hurtPlayer() {
      if (player.invincibleTimer > 0) return;
      SFX.hurt();
      if (player.superMode) {
        player.superMode = false;
        player.superTimer = 0;
        player.superShotsLeft = 0;
        BGM.setSuperMode(false);
        player.invincibleTimer = 70;
        addFloatingText('¡Escudo Helado!', player.x, player.y - 10, '#67e8f9');
        updateHud();
      } else {
        lives--;
        updateHud();
        if (lives <= 0) {
          gameState = 'GAMEOVER';
          if (typeof BGM !== 'undefined' && BGM.stop) BGM.stop();
          openEndModal(false);
        } else {
          player.invincibleTimer = 80;
          player.x = Math.max(60, player.x - 120);
          player.y = 180;
          player.vx = 0;
          player.vy = -5;
        }
      }
    }

    let levelCompleteTimer = 0;
    function updateGame() {
      if (gameState === 'LEVEL_COMPLETE') {
        frameCount++;
        levelCompleteTimer++;
        // Analía y Malvi caminan automáticamente con orgullo hacia la puerta del local
        const doorX = goalFlag.x + 130;
        if (player.x < doorX) {
          player.vx = 1.9;
          player.facing = 1;
          player.x += player.vx;
          player.grounded = true;
        } else {
          player.vx = 0;
        }
        // Actualizar partículas de confeti
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.12; // gravedad de confeti
          p.life--;
          if (p.life <= 0) particles.splice(i, 1);
        }
        return;
      }
      if (gameState !== 'PLAYING') return;
      frameCount++;

      if (player.invincibleTimer > 0) player.invincibleTimer--;
      if (player.shootCooldown > 0) player.shootCooldown--;

      // Movimiento horizontal
      if (keys.left) {
        player.vx = -player.speed;
        player.facing = -1;
      } else if (keys.right) {
        player.vx = player.speed;
        player.facing = 1;
      } else {
        player.vx *= 0.78;
        if (Math.abs(player.vx) < 0.1) player.vx = 0;
      }

      // Salto
      if (keys.jump && player.grounded) {
        player.vy = player.jumpPower;
        player.grounded = false;
        SFX.jump();
      }

      // Súper Modo: Cuenta regresiva corta (6s / 4 tiros locos), música y estela dorada
      if (player.superMode) {
        player.superTimer--;
        if (player.superTimer % 30 === 0) updateHud();
        // Estela mágica de estrellas y destellos dorados
        if (frameCount % 3 === 0) {
          particles.push({
            x: player.x + Math.random() * player.w,
            y: player.y + Math.random() * player.h,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -Math.random() * 2 - 0.5,
            r: Math.random() * 2.5 + 1.5,
            color: ['#facc15', '#f472b6', '#38bdf8', '#ffffff'][Math.floor(Math.random() * 4)],
            life: 25,
            maxLife: 25
          });
        }
        if (player.superTimer <= 0 || player.superShotsLeft <= 0) {
          player.superMode = false;
          player.superTimer = 0;
          player.superShotsLeft = 0;
          BGM.setSuperMode(false);
          addFloatingText('Súper Modo Terminado', player.x, player.y - 10, '#94a3b8');
          updateHud();
        }
      }

      // Disparo continuo en ráfaga ("a lo loco") únicamente durante el Súper Modo 1KG
      if (keys.shoot && player.superMode) {
        shootIceBall();
      }

      // Gravedad (ajustada para ritmo de velocidad 4.0 y misma altura de salto)
      const gravity = (typeof CONFIG_JUGADOR !== 'undefined' && CONFIG_JUGADOR.gravedad) ? CONFIG_JUGADOR.gravedad : 0.48;
      player.vy += gravity;
      if (player.vy > 11) player.vy = 11;

      // Aplicar X y colisionar
      player.x += player.vx;
      if (player.x < 0) player.x = 0;

      const allSolids = [...platforms, ...mysteryBlocks];
      for (const plat of allSolids) {
        if (rectIntersect(player, plat)) {
          if (player.vx > 0) player.x = plat.x - player.w;
          else if (player.vx < 0) player.x = plat.x + plat.w;
        }
      }

      // Aplicar Y y colisionar
      player.y += player.vy;
      player.grounded = false;

      // Actualizar animación de rebote de bloques misteriosos [?]
      for (const mb of mysteryBlocks) {
        if (mb.bounce > 0) mb.bounce--;
      }

      // Priorizar golpe desde abajo a Bloques Misteriosos [?] antes que ladrillos vecinos
      if (player.vy < 0) {
        let bestMb = null;
        let bestOverlap = 0;
        for (const mb of mysteryBlocks) {
          if (rectIntersect(player, mb)) {
            const overlapX = Math.min(player.x + player.w, mb.x + mb.w) - Math.max(player.x, mb.x);
            if (overlapX > bestOverlap) {
              bestOverlap = overlapX;
              bestMb = mb;
            }
          }
        }
        if (bestMb && bestOverlap >= 4) {
          player.y = bestMb.y + bestMb.h;
          player.vy = 1.4;
          if (!bestMb.used) {
            bestMb.used = true;
            bestMb.bounce = 10;
            const dropDir = bestMb.dropDir || 1;
            if (bestMb.reward === 'powerup') {
              SFX.powerup();
              powerups.push({
                x: bestMb.x + 4,
                y: bestMb.y - 34,
                w: 32,
                h: 32,
                vx: dropDir * 1.15,
                vy: -3.2,
                type: 'super1kg'
              });
              addFloatingText('⭐ ¡Súper Pote 1Kg!', bestMb.x - 16, bestMb.y - 24, '#f472b6');
            } else {
              SFX.powerup();
              powerups.push({
                x: bestMb.x + 6,
                y: bestMb.y - 30,
                w: 28,
                h: 30,
                vx: dropDir * 1.05,
                vy: -4.4,
                type: 'bonusCone'
              });
              addFloatingText('🍦 ¡Cucurucho Sorpresa!', bestMb.x - 24, bestMb.y - 24, '#facc15');
            }
            // Destellos dorados al abrir el bloque [?]
            for (let p = 0; p < 10; p++) {
              particles.push({
                x: bestMb.x + bestMb.w / 2,
                y: bestMb.y,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3.5 - 1,
                color: p % 2 === 0 ? '#facc15' : '#ffffff',
                r: Math.random() * 2.5 + 1.2,
                life: 20,
                maxLife: 20
              });
            }
          }
        }
      }

      for (const plat of platforms) {
        if (rectIntersect(player, plat)) {
          if (player.vy > 0) {
            player.y = plat.y - player.h;
            player.vy = 0;
            player.grounded = true;
          } else if (player.vy < 0) {
            player.y = plat.y + plat.h;
            player.vy = 0;
          }
        }
      }

      // Colisión superior al pisar Bloques Misteriosos [?]
      for (const mb of mysteryBlocks) {
        if (rectIntersect(player, mb)) {
          if (player.vy > 0) {
            player.y = mb.y - player.h;
            player.vy = 0;
            player.grounded = true;
          } else if (player.vy < 0) {
            player.y = mb.y + mb.h;
            player.vy = 1.4;
          }
        }
      }

      // Caída al vacío
      if (player.y > GAME_H + 60) {
        player.superMode = false;
        hurtPlayer();
      }

      // Cámara sigue al jugador suavemente adaptándose al largo de cada nivel
      const maxCam = Math.max(1850, goalFlag.x - 540);
      const targetCam = Math.max(0, Math.min(player.x - 240, maxCam));
      cameraX += (targetCam - cameraX) * 0.11;

      // Recolección de Cucuruchos (incluye Helado Secreto Oculto de +800 pts)
      for (const c of cones) {
        if (!c.collected) {
          const dx = (player.x + player.w / 2) - c.x;
          const dy = (player.y + player.h / 2) - c.y;
          const pickupR = c.secret ? 34 : 28;
          if (Math.hypot(dx, dy) < pickupR) {
            c.collected = true;
            const pts = c.points || 150;
            score += pts;
            conesCollected++;
            if (c.secret) {
              SFX.win();
              addFloatingText(`🌟 ¡HELADO SECRETO! +${pts} 🍦`, c.x - 95, Math.max(58, c.y + 92), '#facc15');
              for (let p = 0; p < 24; p++) {
                particles.push({
                  x: c.x + (Math.random() - 0.5) * 36,
                  y: Math.max(8, c.y + 48),
                  vx: (Math.random() - 0.5) * 6,
                  vy: Math.random() * 4 + 1,
                  color: ['#facc15', '#ec4899', '#38bdf8', '#ffffff'][p % 4],
                  r: Math.random() * 3.2 + 1.5,
                  life: 36,
                  maxLife: 36
                });
              }
            } else {
              SFX.cone();
              addFloatingText(`+${pts}`, c.x, c.y - 10, '#facc15');
            }
            updateHud();
          }
        }
      }

      // Movimiento y recolección de premios de bloques [?] (Súper Pote 1Kg y Cucurucho Sorpresa)
      for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        p.vy += 0.30;
        if (p.vy > 7.5) p.vy = 7.5;

        // Movimiento horizontal con rebote en paredes/rocas
        p.x += p.vx;
        for (const plat of allSolids) {
          if (rectIntersect(p, plat)) {
            if (p.vx > 0) p.x = plat.x - p.w;
            else if (p.vx < 0) p.x = plat.x + plat.w;
            p.vx *= -1;
          }
        }

        // Movimiento vertical con aterrizaje suave
        p.y += p.vy;
        for (const plat of allSolids) {
          if (rectIntersect(p, plat)) {
            if (p.vy > 0) {
              p.y = plat.y - p.h;
              if (p.type === 'bonusCone') {
                // El Cucurucho Sorpresa rebota suavemente y se frena para que no caiga a pozos
                p.vy = Math.abs(p.vy) > 1.8 ? -p.vy * 0.42 : 0;
                p.vx *= 0.72;
                if (Math.abs(p.vx) < 0.08) p.vx = 0;
              } else {
                p.vy = 0;
              }
            } else if (p.vy < 0) {
              p.y = plat.y + plat.h;
              p.vy = 0;
            }
          }
        }

        // Destellos dorados suaves en el Cucurucho Sorpresa
        if (p.type === 'bonusCone' && frameCount % 8 === 0) {
          particles.push({
            x: p.x + Math.random() * p.w,
            y: p.y + Math.random() * p.h,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -Math.random() * 0.8 - 0.2,
            color: '#facc15',
            r: 1.8,
            life: 16,
            maxLife: 16
          });
        }

        // Eliminar si cae fuera del mapa
        if (p.y > GAME_H + 60) {
          powerups.splice(i, 1);
          continue;
        }

        if (rectIntersect(player, p)) {
          powerups.splice(i, 1);
          if (p.type === 'bonusCone') {
            score += 200;
            conesCollected++;
            SFX.cone();
            addFloatingText('+200 🍦', player.x, player.y - 18, '#facc15');
            updateHud();
          } else {
            player.superMode = true;
            player.superTimer = (typeof CONFIG_JUGADOR !== 'undefined' && CONFIG_JUGADOR.duracionSuperPoder) ? CONFIG_JUGADOR.duracionSuperPoder : 360;
            player.superShotsLeft = (typeof CONFIG_JUGADOR !== 'undefined' && CONFIG_JUGADOR.tirosSuperPoder) ? CONFIG_JUGADOR.tirosSuperPoder : 4;
            const pts1kg = (typeof CONFIG_PUNTOS !== 'undefined' ? CONFIG_PUNTOS.superPote1KG : 500);
            score += pts1kg;
            SFX.powerup();
            BGM.setSuperMode(true);
            addFloatingText(`⭐ ¡SÚPER 1KG: ${player.superShotsLeft} TIROS LOCOS! +${pts1kg}`, player.x - 45, player.y - 25, '#facc15');
            updateHud();
          }
        }
      }

      // Proyectiles de Copos de Nieve (1 activo por vez)
      for (let i = iceBalls.length - 1; i >= 0; i--) {
        const b = iceBalls[i];
        const prevY = b.y;
        b.x += b.vx;
        b.y += b.vy;
        b.vy += 0.19; // Gravedad suave para el copo
        b.life--;
        b.angle = (b.angle || 0) + (b.rotSpeed || 0.16);

        // Desaparecer si sale de la pantalla visible para liberar el siguiente disparo
        if (b.x < cameraX - 24 || b.x > cameraX + GAME_W + 24 || b.y > GAME_H + 20) {
          b.life = 0;
        }

        // Estela de partículas de escarcha y brillo
        if (b.life > 0 && frameCount % 3 === 0) {
          particles.push({
            x: b.x + (Math.random() - 0.5) * 4,
            y: b.y + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 0.7,
            vy: (Math.random() - 0.5) * 0.7,
            color: b.isSuper ? '#f472b6' : '#e0f2fe',
            r: Math.random() * 2 + 1,
            life: 14,
            maxLife: 14
          });
        }

        // Rebote suave en pisos o estallido de escarcha si choca de frente contra una roca/pared
        if (b.life > 0) {
          for (const plat of allSolids) {
            if (b.x + b.r > plat.x && b.x - b.r < plat.x + plat.w && b.y + b.r > plat.y && b.y - b.r < plat.y + plat.h) {
              if (prevY + b.r <= plat.y + 8 && b.vy >= 0) {
                b.vy = -3.1;
                b.y = plat.y - b.r;
              } else {
                b.life = 0;
                for (let p = 0; p < 6; p++) {
                  particles.push({
                    x: b.x,
                    y: b.y,
                    vx: (Math.random() - 0.5) * 3.5,
                    vy: (Math.random() - 0.5) * 3.5,
                    color: b.isSuper ? '#f472b6' : '#bae6fd',
                    r: Math.random() * 2 + 1,
                    life: 14,
                    maxLife: 14
                  });
                }
                break;
              }
            }
          }
        }

        // Colisión copo de nieve con enemigos (Solcitos 45°C y Llamitas — requieren 3 impactos)
        if (b.life > 0) {
          for (const en of enemies) {
            if (en.alive && b.x > en.x - 6 && b.x < en.x + en.w + 6 && b.y > en.y - 6 && b.y < en.y + en.h + 6) {
              b.life = 0;
              en.hp = (typeof en.hp === 'number' ? en.hp : 3) - 1;
              en.hitTimer = 14;

              if (en.hp > 0) {
                playTone(540, 'triangle', 0.08, 0.09, 360);
                const tempLeft = Math.max(15, Math.round((en.hp / (en.maxHp || 3)) * 45));
                addFloatingText(`❄️ ${tempLeft}°C (${en.hp}/${en.maxHp || 3})`, en.x - 10, en.y - 12, '#bae6fd');

                // Pequeño destello de escarcha al enfriar al enemigo
                for (let p = 0; p < 6; p++) {
                  particles.push({
                    x: en.x + en.w / 2,
                    y: en.y + en.h / 2,
                    vx: (Math.random() - 0.5) * 4.2,
                    vy: (Math.random() - 0.5) * 4.2 - 1,
                    color: p % 2 === 0 ? '#ffffff' : '#67e8f9',
                    r: Math.random() * 2.2 + 1,
                    life: 15,
                    maxLife: 15
                  });
                }
              } else {
                en.alive = false;
                score += 300;
                SFX.stomp();
                addFloatingText('❄️ ¡Congelado! +300', en.x, en.y - 12, '#67e8f9');
                updateHud();

                // Estallido de cristales de hielo brillante al derrotarlo
                for (let p = 0; p < 14; p++) {
                  particles.push({
                    x: en.x + en.w / 2,
                    y: en.y + en.h / 2,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6 - 1.5,
                    color: Math.random() > 0.5 ? '#ffffff' : (b.isSuper ? '#f472b6' : '#67e8f9'),
                    r: Math.random() * 3 + 1.5,
                    life: 22,
                    maxLife: 22
                  });
                }
              }
              break;
            }
          }
        }

        // Colisión copo de nieve con Boss Final (Cabeza = daño fuerte -2 | Costados = blindado, apenas hace daño)
        if (b.life > 0 && currentLevel === 3 && boss && boss.alive) {
          if (b.x > boss.x - 6 && b.x < boss.x + boss.w + 6 && b.y > boss.y - 10 && b.y < boss.y + boss.h + 6) {
            b.life = 0;
            const isHeadHit = b.y <= boss.y + 34;

            if (isHeadHit) {
              boss.hp = Math.max(0, boss.hp - 2);
              boss.hitTimer = 22;
              boss.retreatTimer = 40; // Retrocede hacia atrás al recibir golpe en la cabeza
              SFX.stomp();
              for (let p = 0; p < 10; p++) {
                particles.push({
                  x: b.x,
                  y: boss.y + 12,
                  vx: (Math.random() - 0.5) * 6,
                  vy: -Math.random() * 4 - 1,
                  color: p % 2 === 0 ? '#facc15' : '#67e8f9',
                  r: Math.random() * 2.8 + 1.4,
                  life: 20,
                  maxLife: 20
                });
              }
              if (boss.hp > 0) {
                addFloatingText(`🎯 ¡EN LA CABEZA! -2 (${boss.hp}/${boss.maxHp})`, boss.x - 20, boss.y - 18, '#67e8f9');
              }
            } else {
              // Costados blindados: hace muy poco daño (recién 1 punto cada 3 impactos laterales)
              boss.sideHits = (boss.sideHits || 0) + 1;
              playTone(190, 'square', 0.06, 0.07, 130);
              for (let p = 0; p < 5; p++) {
                particles.push({
                  x: b.x,
                  y: b.y,
                  vx: (b.vx > 0 ? -1 : 1) * (Math.random() * 3 + 1),
                  vy: (Math.random() - 0.5) * 3,
                  color: '#cbd5e1',
                  r: 1.8,
                  life: 12,
                  maxLife: 12
                });
              }
              if (boss.sideHits >= 3) {
                boss.sideHits = 0;
                boss.hp = Math.max(0, boss.hp - 1);
                boss.hitTimer = 10;
                if (boss.hp > 0) {
                  addFloatingText(`🛡️ Rasguño -1 (¡Apuntá a la CABEZA!)`, boss.x - 35, boss.y - 16, '#cbd5e1');
                }
              } else {
                addFloatingText('🛡️ ¡BLINDADO! Pegale en la CABEZA', boss.x - 35, boss.y + 35, '#94a3b8');
              }
            }

            // Activar Modo Furia cuando baja a la mitad de la vida
            if (boss.hp > 0 && !boss.enraged && boss.hp <= Math.ceil(boss.maxHp / 2)) {
              boss.enraged = true;
              boss.vx = boss.vx > 0 ? 2.4 : -2.4;
              addFloatingText('🔥 ¡ROBOT EN MODO FURIA!', boss.x - 25, boss.y - 40, '#ef4444');
            }

            if (boss.hp <= 0) {
              boss.alive = false;
              bossProjectiles = [];
              score += 1000;
              SFX.win();
              addFloatingText('💥 ¡MAESTRO INDUSTRIAL DERROTADO! +1000', boss.x - 40, boss.y - 20, '#facc15');
              addFloatingText('🍫 ¡SABOR RECUPERADO: CHOCOLATE MALVINAS!', boss.x - 50, boss.y - 45, '#4ade80');
              for (let p = 0; p < 34; p++) {
                particles.push({
                  x: boss.x + boss.w / 2,
                  y: boss.y + boss.h / 2,
                  vx: (Math.random() - 0.5) * 9,
                  vy: (Math.random() - 0.5) * 9 - 2,
                  color: ['#ec4899', '#38bdf8', '#facc15', '#ffffff'][Math.floor(Math.random() * 4)],
                  r: Math.random() * 4 + 2,
                  life: 35,
                  maxLife: 35
                });
              }
            }
            updateHud();
          }
        }
        if (b.life <= 0) iceBalls.splice(i, 1);
      }

      // Actualizar Boss Final en Nivel 3 (Retrocede hacia atrás en la arena plana, salta y ataca en 2 Fases)
      if (currentLevel === 3 && boss && boss.alive) {
        const arenaActive = player.x >= 1580;
        const bossSpeed = boss.enraged ? 2.4 : 1.75;
        const arenaLimitRight = boss.arenaMaxX || 2860;
        // A medida que pierde vida, su zona de combate se va corriendo hacia atrás (derecha)
        const dmgTaken = Math.max(0, boss.maxHp - boss.hp);
        const dynamicMinX = Math.min(arenaLimitRight - 280, 1820 + dmgTaken * 68);
        boss.minX = dynamicMinX;

        if (boss.retreatTimer > 0) {
          boss.retreatTimer--;
          // Retroceso rápido hacia atrás tras recibir daño en la cabeza
          if (boss.x + boss.w < arenaLimitRight) {
            boss.vx = boss.enraged ? 3.2 : 2.7;
          } else {
            boss.vx = -bossSpeed;
          }
        } else if (arenaActive && (boss.x - player.x) < 175 && (boss.x - player.x) > -20 && (boss.x + boss.w) < arenaLimitRight - 20) {
          // Si Analía se acerca de frente, el Robot va reculando hacia atrás mientras dispara
          boss.vx = bossSpeed * 0.95;
        } else {
          boss.vx = (boss.vx >= 0 ? 1 : -1) * bossSpeed;
        }

        boss.x += boss.vx;
        if (boss.x < boss.minX) {
          boss.x = boss.minX;
          boss.vx = bossSpeed;
        } else if (boss.x + boss.w > arenaLimitRight) {
          boss.x = arenaLimitRight - boss.w;
          boss.vx = -bossSpeed;
        }
        if (boss.hitTimer > 0) boss.hitTimer--;

        // Salto periódico del Robot para dificultar la pelea
        if (arenaActive) {
          boss.jumpTimer = (boss.jumpTimer || 0) + 1;
          const jumpInterval = boss.enraged ? 125 : 165;
          if (boss.jumpTimer >= jumpInterval && boss.y >= (boss.baseY || 286)) {
            boss.jumpTimer = 0;
            boss.vy = boss.enraged ? -9.2 : -8.2;
          }
        }
        if (boss.vy !== 0 || boss.y < (boss.baseY || 286)) {
          boss.y += boss.vy;
          boss.vy += 0.42;
          if (boss.y >= (boss.baseY || 286)) {
            boss.y = boss.baseY || 286;
            boss.vy = 0;
            // Polvo al aterrizar
            for (let p = 0; p < 6; p++) {
              particles.push({
                x: boss.x + Math.random() * boss.w,
                y: boss.y + boss.h,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 2,
                color: '#94a3b8',
                r: 2.5,
                life: 16,
                maxLife: 16
              });
            }
          }
        }

        // Boss dispara proyectiles hacia Analía (en Fase 2 dispara ráfaga doble cubriendo plataformas!)
        if (arenaActive) {
          boss.shootTimer++;
          const shootInterval = boss.enraged ? 88 : 112;
          if (boss.shootTimer >= shootInterval) {
            boss.shootTimer = 0;
            const dir = (player.x + player.w / 2) < (boss.x + boss.w / 2) ? -1 : 1;
            const playerIsHigh = player.y < boss.y + 10;
            bossProjectiles.push({
              x: boss.x + (dir === -1 ? -8 : boss.w + 8),
              y: boss.y + 38,
              vx: dir * (boss.enraged ? 3.5 : 3.0),
              vy: playerIsHigh ? -3.4 : -1.5,
              r: 9,
              life: 155
            });
            if (boss.enraged) {
              bossProjectiles.push({
                x: boss.x + (dir === -1 ? -8 : boss.w + 8),
                y: boss.y + 24,
                vx: dir * 2.8,
                vy: playerIsHigh ? -1.4 : -3.8,
                r: 8.5,
                life: 160
              });
            }
          }
        }

        // Colisión cuerpo a cuerpo con Boss (Saltar ARRIBA de su cabeza le hace GRAN daño!)
        if (rectIntersect(player, boss)) {
          const isStompOnHead = player.vy > 0 && (player.y + player.h - player.vy) <= boss.y + 30;
          if (isStompOnHead) {
            const bounceDir = (player.x + player.w / 2) < (boss.x + boss.w / 2) ? -1 : 1;
            player.y = boss.y - player.h - 2;
            player.vy = -10.5;
            player.vx = bounceDir * 3.8;
            if (boss.hitTimer <= 0) {
              boss.hp = Math.max(0, boss.hp - 3);
              boss.hitTimer = 28;
              boss.retreatTimer = 46; // Retrocede hacia atrás al recibir pisotón en la cabeza
              SFX.stomp();
              for (let p = 0; p < 14; p++) {
                particles.push({
                  x: boss.x + boss.w / 2,
                  y: boss.y + 8,
                  vx: (Math.random() - 0.5) * 7,
                  vy: -Math.random() * 5 - 1,
                  color: p % 2 === 0 ? '#facc15' : '#ec4899',
                  r: Math.random() * 3 + 1.5,
                  life: 24,
                  maxLife: 24
                });
              }
              if (boss.hp > 0 && !boss.enraged && boss.hp <= Math.ceil(boss.maxHp / 2)) {
                boss.enraged = true;
                addFloatingText('🔥 ¡ROBOT EN MODO FURIA!', boss.x - 25, boss.y - 42, '#ef4444');
              }
              if (boss.hp > 0) {
                addFloatingText(`💥 ¡PISOTÓN EN LA CABEZA! -3 (${boss.hp}/${boss.maxHp})`, boss.x - 35, boss.y - 20, '#facc15');
              } else {
                boss.alive = false;
                bossProjectiles = [];
                score += 1000;
                SFX.win();
                addFloatingText('💥 ¡MAESTRO INDUSTRIAL DERROTADO! +1000', boss.x - 40, boss.y - 20, '#facc15');
                addFloatingText('🍫 ¡SABOR RECUPERADO: CHOCOLATE MALVINAS!', boss.x - 50, boss.y - 45, '#4ade80');
                for (let p = 0; p < 34; p++) {
                  particles.push({
                    x: boss.x + boss.w / 2,
                    y: boss.y + boss.h / 2,
                    vx: (Math.random() - 0.5) * 9,
                    vy: (Math.random() - 0.5) * 9 - 2,
                    color: ['#ec4899', '#38bdf8', '#facc15', '#ffffff'][Math.floor(Math.random() * 4)],
                    r: Math.random() * 4 + 2,
                    life: 35,
                    maxLife: 35
                  });
                }
              }
              updateHud();
            }
          } else {
            hurtPlayer();
          }
        }
      }

      // Proyectiles del Boss Industrial
      for (let i = bossProjectiles.length - 1; i >= 0; i--) {
        const bp = bossProjectiles[i];
        bp.x += bp.vx;
        bp.y += bp.vy;
        bp.vy += 0.06;
        bp.life--;

        // Colisión con jugador
        const dist = Math.hypot(bp.x - (player.x + player.w / 2), bp.y - (player.y + player.h / 2));
        if (dist < bp.r + 14) {
          hurtPlayer();
          bossProjectiles.splice(i, 1);
          continue;
        }
        if (bp.life <= 0 || bp.y > 450) {
          bossProjectiles.splice(i, 1);
        }
      }

      // Enemigos (Solcitos 45°C y Llamitas — 2 pisotones o 3 copos de nieve)
      for (const en of enemies) {
        if (!en.alive) continue;
        if (en.hitTimer > 0) en.hitTimer--;
        if (en.stompGrace > 0) en.stompGrace--;
        en.x += en.vx;
        if (en.x < en.minX || en.x + en.w > en.maxX) {
          en.vx *= -1;
        }
        if (rectIntersect(player, en)) {
          // Si cae encima como Mario Bros -> saca la mitad de la vida (2 pisotones para derrotarlo)
          if (player.vy > 0 && player.y + player.h - player.vy <= en.y + 18) {
            player.y = en.y - player.h - 2;
            player.vy = -8.6;
            const maxHp = en.maxHp || 3;
            const stompDamage = maxHp / 2; // 1.5 HP sobre 3 -> 2 saltos encima lo derrotan (y se combina con los copos!)
            en.hp = Math.max(0, (typeof en.hp === 'number' ? en.hp : maxHp) - stompDamage);
            en.hitTimer = 16;
            en.stompGrace = 14;
            SFX.stomp();

            if (en.hp > 0) {
              const tempLeft = Math.max(10, Math.round((en.hp / maxHp) * 45));
              addFloatingText(`❄️ ¡Pisotón! ${tempLeft}°C`, en.x - 10, en.y - 12, '#67e8f9');
              for (let p = 0; p < 7; p++) {
                particles.push({
                  x: en.x + en.w / 2,
                  y: en.y + 6,
                  vx: (Math.random() - 0.5) * 4.5,
                  vy: -Math.random() * 3.2 - 0.8,
                  color: p % 2 === 0 ? '#ffffff' : '#67e8f9',
                  r: Math.random() * 2.4 + 1,
                  life: 16,
                  maxLife: 16
                });
              }
            } else {
              en.alive = false;
              score += 250;
              addFloatingText('+250 ¡Fresco!', en.x, en.y - 12, '#4ade80');
              for (let p = 0; p < 14; p++) {
                particles.push({
                  x: en.x + en.w / 2,
                  y: en.y + en.h / 2,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6 - 1.5,
                  color: p % 2 === 0 ? '#ffffff' : '#4ade80',
                  r: Math.random() * 3 + 1.5,
                  life: 22,
                  maxLife: 22
                });
              }
              updateHud();
            }
          } else if (!(en.stompGrace > 0)) {
            hurtPlayer();
          }
        }
      }

      // Meta: Mástil y Sucursal de Heladería Malvinas
      if (!goalFlag.reached && player.x + player.w >= goalFlag.x) {
        if (currentLevel === 3 && boss && boss.alive) {
          player.x = goalFlag.x - player.w - 8;
          addFloatingText('⚠️ ¡Derrotá al Robot Industrial para cruzar la meta!', player.x - 90, player.y - 25, '#ef4444');
        } else {
          goalFlag.reached = true;
          SFX.win();
          const heightBonus = Math.max(200, Math.floor((380 - player.y) * 3));
          score += heightBonus;
          addFloatingText(`¡META MALVINAS! +${heightBonus}`, goalFlag.x - 40, player.y - 20, '#4ade80');
          updateHud();

          // Entrada Triunfal a la Heladería
          gameState = 'LEVEL_COMPLETE';
          BGM.stop();
          SFX.win();
          levelCompleteTimer = 0;
          // Lluvia de confeti festivo
          for (let k = 0; k < 60; k++) {
            particles.push({
              x: goalFlag.x + 80 + Math.random() * 80,
              y: 200 + Math.random() * 50,
              vx: (Math.random() - 0.5) * 6,
              vy: -Math.random() * 5 - 2,
              size: Math.random() * 5 + 3,
              color: ['#ec4899', '#f472b6', '#67e8f9', '#facc15', '#a855f7', '#ffffff'][Math.floor(Math.random() * 6)],
              alpha: 1,
              life: 120
            });
          }

          setTimeout(() => {
            if (currentLevel === 1) {
              if (typeof startOfficialGame === 'function') {
                startOfficialGame(2, true);
              } else {
                currentLevel = 2;
                gameState = 'PLAYING';
                buildLevel(2);
                if (typeof ensureFullscreen === 'function') ensureFullscreen();
                if (soundEnabled) BGM.start();
              }
            } else if (currentLevel === 2) {
              if (typeof startOfficialGame === 'function') {
                startOfficialGame(3, true);
              } else {
                currentLevel = 3;
                gameState = 'PLAYING';
                buildLevel(3);
                if (typeof ensureFullscreen === 'function') ensureFullscreen();
                if (soundEnabled) BGM.start();
              }
            } else {
              gameState = 'VICTORY';
              openEndModal(true);
            }
          }, 2800);
        }
      }

      // Textos flotantes
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        floatingTexts[i].y -= 1;
        floatingTexts[i].life--;
        if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
      }

      // Partículas activas (escarcha, destellos)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
      }
    }

    /**************************************************************
     * 5. RENDERIZADO VISUAL (CANVAS PIXEL-ART / 2D)
     **************************************************************/
    function drawGame() {
      ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (currentLevel === 1) {
        // ==============================================================
        // NIVEL 1: DIQUE DE LOS SAUCES (LA RIOJA) — PIXEL ART PANORÁMICO
        // Textura continua y suave (sin corte vertical visible al repetir)
        // ==============================================================
        const bgImg = bgDiqueSaucesSeamless || (bgDiqueSaucesLoaded ? bgDiqueSauces : null);
        if (bgImg && (bgImg.width || bgImg.naturalWidth) > 0) {
          const origW = bgImg.width || bgImg.naturalWidth;
          const origH = bgImg.height || bgImg.naturalHeight;
          const bgH = GAME_H;
          const bgW = (origW / origH) * bgH;
          const pxOffset = (cameraX * 0.28) % bgW;
          ctx.drawImage(bgImg, -pxOffset, 0, bgW, bgH);
          ctx.drawImage(bgImg, -pxOffset + bgW, 0, bgW, bgH);
          if (-pxOffset + bgW < GAME_W) {
            ctx.drawImage(bgImg, -pxOffset + bgW * 2, 0, bgW, bgH);
          }
        } else {
          // Fallback con degradado de cielo y cerros del dique
          const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_H);
          skyGrad.addColorStop(0, '#38bdf8');
          skyGrad.addColorStop(0.48, '#0284c7');
          skyGrad.addColorStop(0.85, '#0369a1');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, GAME_W, GAME_H);
        }
      } else if (currentLevel === 2) {
        // ==============================================================
        // NIVEL 2: PARQUE DE LA CIUDAD & SUPERDOMO (LA RIOJA)
        // Fondo oficial nocturno con el Superdomo, cerros y luminarias
        // Textura continua y suave (sin corte vertical visible al repetir)
        // ==============================================================
        const bgImg = bgParqueCiudadSeamless || (bgParqueCiudadLoaded ? bgParqueCiudad : null);
        if (bgImg && (bgImg.width || bgImg.naturalWidth) > 0) {
          const origW = bgImg.width || bgImg.naturalWidth;
          const origH = bgImg.height || bgImg.naturalHeight;
          const bgH = GAME_H;
          const bgW = (origW / origH) * bgH;
          const pxOffset = (cameraX * 0.28) % bgW;
          ctx.drawImage(bgImg, -pxOffset, 0, bgW, bgH);
          ctx.drawImage(bgImg, -pxOffset + bgW, 0, bgW, bgH);
          if (-pxOffset + bgW < GAME_W) {
            ctx.drawImage(bgImg, -pxOffset + bgW * 2, 0, bgW, bgH);
          }
        } else {
          // Fallback con degradado nocturno
          const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_H);
          skyGrad.addColorStop(0, '#0f172a');
          skyGrad.addColorStop(0.6, '#1e1b4b');
          skyGrad.addColorStop(1, '#312e81');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, GAME_W, GAME_H);
        }
      } else {
        // ==============================================================
        // NIVEL 3: MICROCENTRO RIOJANO (ATARDECER/NOCHE, CIUDAD Y MARQUESINAS)
        // ==============================================================
        const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_H);
        skyGrad.addColorStop(0, '#020617');
        skyGrad.addColorStop(0.55, '#1e1b4b');
        skyGrad.addColorStop(0.85, '#431407');
        skyGrad.addColorStop(1, '#701a75');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        // Estrellas
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 25; i++) {
          const sx = ((i * 113) % 800);
          const sy = ((i * 47) % 180);
          ctx.fillRect(sx, sy, 2, 2);
        }

        // Silueta de Edificios del Microcentro Riojano con ventanas iluminadas
        for (let i = 0; i < 20; i++) {
          const bx = i * 155 - (cameraX * 0.3);
          const bw = 135;
          const bh = 150 + (i % 6) * 26;
          const by = 380 - bh;
          ctx.fillStyle = i % 2 === 0 ? '#1e293b' : '#0f172a';
          ctx.fillRect(bx, by, bw, bh);

          // Antenas y detalles
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bx + bw / 2, by);
          ctx.lineTo(bx + bw / 2, by - 16);
          ctx.stroke();

          // Ventanas
          for (let wy = by + 14; wy < 380 - 20; wy += 22) {
            for (let wx = bx + 12; wx < bx + bw - 12; wx += 22) {
              ctx.fillStyle = (i + wx + wy) % 4 === 0 ? '#fef08a' : '#334155';
              ctx.fillRect(wx, wy, 11, 13);
            }
          }
        }

        // Gran Marquesina Neón de Heladería Las Malvinas sobre los edificios
        for (let i = 0; i < 4; i++) {
          const signX = (i * 900 + 400) - (cameraX * 0.45);
          if (signX > -250 && signX < GAME_W + 100) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(signX, 100, 240, 48);
            ctx.strokeStyle = frameCount % 30 < 15 ? '#ec4899' : '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(signX, 100, 240, 48);
            ctx.fillStyle = '#fff';
            ctx.font = '9.5px ' + PIXEL_FONT;
            ctx.textAlign = 'center';
            ctx.fillText('🍦 HELADERÍA LAS MALVINAS', signX + 120, 122);
            ctx.fillStyle = '#f472b6';
            ctx.font = '7px ' + PIXEL_FONT;
            ctx.fillText('CASA CENTRAL — LA RIOJA', signX + 120, 137);
            ctx.textAlign = 'left';
          }
        }
      }

      ctx.save();
      ctx.translate(-cameraX, 0);

      // Señalética al Inicio del Nivel
      if (currentLevel === 1) {
        // Cartel del Dique Los Sauces - Heladería Las Malvinas
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(25, 290, 6, 90);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(10, 262, 185, 34);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(12, 264, 181, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = '7.5px ' + PIXEL_FONT;
        ctx.fillText('📍 DIQUE LOS SAUCES — LA RIOJA', 18, 277);
        ctx.fillStyle = '#fef08a';
        ctx.font = '6px ' + PIXEL_FONT;
        ctx.fillText('HELADERÍA LAS MALVINAS — ¡CORRÉ Y DISPARÁ ❄️!', 18, 288);
      } else if (currentLevel === 2) {
        // Cartel vial Parque de la Ciudad - Superdomo
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(25, 290, 6, 90);
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(10, 262, 195, 34);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(12, 264, 191, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = '7.5px ' + PIXEL_FONT;
        ctx.fillText('📍 PARQUE DE LA CIUDAD — SUPERDOMO', 18, 277);
        ctx.fillStyle = '#fef08a';
        ctx.font = '6px ' + PIXEL_FONT;
        ctx.fillText('LA RIOJA NOCTURNA — ¡SALVÁ EL DULCE DE LECHE!', 18, 288);
      } else {
        // Cartel vial urbano clásico argentino (Nivel 3)
        ctx.fillStyle = '#334155';
        ctx.fillRect(25, 295, 5, 85);
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(10, 270, 160, 30);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(12, 272, 156, 26);
        ctx.fillStyle = '#fff';
        ctx.font = '7.5px ' + PIXEL_FONT;
        ctx.fillText('📍 CALLE MALVINAS', 20, 286);
        ctx.fillStyle = '#fef08a';
        ctx.font = '6px ' + PIXEL_FONT;
        ctx.fillText('RUTA HELADERA — CORRÉ AL LOCAL', 20, 296);
      }

      // ==============================================================
      // RENDERIZADO VISUAL DE POZOS Y CAÍDAS AL VACÍO (INEQUÍVOCO)
      // Detecta huecos entre plataformas de suelo y dibuja abismo, púas,
      // franjas reflectivas de seguridad y conos con balizas titilantes.
      // ==============================================================
      const groundPlats = platforms.filter(p => p.type === 'ground').sort((a, b) => a.x - b.x);
      for (let i = 0; i < groundPlats.length - 1; i++) {
        const g1 = groundPlats[i];
        const g2 = groundPlats[i + 1];
        if (g2.x > g1.x + g1.w) {
          const pitX = g1.x + g1.w;
          const pitEndX = g2.x;
          const pitW = pitEndX - pitX;
          const pitY = g1.y;

          // 1. Fondo de abismo oscuro con degradado hacia peligro rojo
          const pitGrad = ctx.createLinearGradient(0, pitY, 0, GAME_H);
          pitGrad.addColorStop(0, '#05070e');
          pitGrad.addColorStop(0.35, '#180308');
          pitGrad.addColorStop(0.8, '#450a0a');
          pitGrad.addColorStop(1, '#7f1d1d');
          ctx.fillStyle = pitGrad;
          ctx.fillRect(pitX, pitY, pitW, GAME_H - pitY + 40);

          // Líneas verticales luminosas de corte lateral
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(pitX - 2, pitY, 3, GAME_H - pitY);
          ctx.fillRect(pitEndX - 1, pitY, 3, GAME_H - pitY);

          // 2. Púas de peligro puntiagudas en el fondo del pozo
          const spikeW = 12;
          const spikeCount = Math.floor(pitW / spikeW);
          ctx.fillStyle = '#ef4444';
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 1;
          for (let s = 0; s < spikeCount; s++) {
            const sx = pitX + s * spikeW;
            ctx.beginPath();
            ctx.moveTo(sx, GAME_H);
            ctx.lineTo(sx + spikeW / 2, GAME_H - 18);
            ctx.lineTo(sx + spikeW, GAME_H);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

          // 3. Franjas diagonales de peligro reflectivas amarillo y negro en el filo antes de caer
          const stripeW = 40;
          ctx.save();
          ctx.beginPath();
          ctx.rect(pitX - stripeW, pitY, stripeW, 16);
          ctx.clip();
          for (let sx = pitX - stripeW - 20; sx < pitX + 20; sx += 12) {
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.moveTo(sx, pitY + 16);
            ctx.lineTo(sx + 6, pitY + 16);
            ctx.lineTo(sx + 16, pitY);
            ctx.lineTo(sx + 10, pitY);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#090d16';
            ctx.beginPath();
            ctx.moveTo(sx + 6, pitY + 16);
            ctx.lineTo(sx + 12, pitY + 16);
            ctx.lineTo(sx + 22, pitY);
            ctx.lineTo(sx + 16, pitY);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();

          // Franjas en el borde receptor (después del pozo)
          ctx.save();
          ctx.beginPath();
          ctx.rect(pitEndX, pitY, stripeW, 16);
          ctx.clip();
          for (let sx = pitEndX - 20; sx < pitEndX + stripeW + 20; sx += 12) {
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.moveTo(sx, pitY + 16);
            ctx.lineTo(sx + 6, pitY + 16);
            ctx.lineTo(sx + 16, pitY);
            ctx.lineTo(sx + 10, pitY);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#090d16';
            ctx.beginPath();
            ctx.moveTo(sx + 6, pitY + 16);
            ctx.lineTo(sx + 12, pitY + 16);
            ctx.lineTo(sx + 22, pitY);
            ctx.lineTo(sx + 16, pitY);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();

          // 5. Conos de seguridad vial naranjas con balizas luminosas titilantes
          const blink = Math.floor(frameCount / 12) % 2 === 0;
          const drawSafetyCone = (cx, cy) => {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(cx - 3, cy + 22, 18, 4);
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(cx, cy + 22);
            ctx.lineTo(cx + 6, cy + 4);
            ctx.lineTo(cx + 12, cy + 22);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(cx + 2, cy + 15);
            ctx.lineTo(cx + 4, cy + 10);
            ctx.lineTo(cx + 8, cy + 10);
            ctx.lineTo(cx + 10, cy + 15);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = blink ? '#ef4444' : '#facc15';
            ctx.beginPath();
            ctx.arc(cx + 6, cy + 3, 3.5, 0, Math.PI * 2);
            ctx.fill();
            if (blink) {
              ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          };
          drawSafetyCone(pitX - 18, pitY - 24);
          drawSafetyCone(pitEndX + 6, pitY - 24);
        }
      }

      // Dibujar Plataformas (Mostrador Heladero en Nivel 1 o Asfalto en Nivel 2) y Tachos
      for (const plat of platforms) {
        if (plat.type === 'ground') {
          const gx = plat.x;
          const gy = plat.y;
          const gw = plat.w;
          const gh = plat.h;

          if (currentLevel === 1) {
            // ==============================================================
            // COSTANERA DEL DIQUE DE LOS SAUCES (PASEO PEATONAL DE PIEDRA)
            // Lajas de granito riojano, cordón de contención y muro lacustre
            // ==============================================================

            // 1. SUPERFICIE SUPERIOR PEATONAL (Lajas de piedra clara: gy a gy + 16)
            const stoneWalkGrad = ctx.createLinearGradient(0, gy, 0, gy + 16);
            stoneWalkGrad.addColorStop(0, '#e7d9c6');    // Tono piedra arena soleada
            stoneWalkGrad.addColorStop(0.4, '#d8c5ad');
            stoneWalkGrad.addColorStop(1, '#bba589');    // Base de la laja
            ctx.fillStyle = stoneWalkGrad;
            ctx.fillRect(gx, gy, gw, 16);

            // Juntas de baldosas de piedra / lajas cada 48px
            ctx.strokeStyle = 'rgba(120, 95, 70, 0.45)';
            ctx.lineWidth = 1.2;
            for (let bx = gx + 24; bx < gx + gw; bx += 48) {
              ctx.beginPath();
              ctx.moveTo(bx, gy);
              ctx.lineTo(bx, gy + 15);
              ctx.stroke();
            }

            // Borde biselado de remate de piedra
            ctx.fillStyle = '#9c8366';
            ctx.fillRect(gx, gy + 14, gw, 2);
            ctx.fillStyle = '#f5ede2';
            ctx.fillRect(gx, gy + 1, gw, 1.2); // Brillo de sol en el canto superior

            // 2. CORDÓN DE CONTENCIÓN DEL PASEO (12px: gy + 16 a gy + 28)
            const curbGrad = ctx.createLinearGradient(0, gy + 16, 0, gy + 28);
            curbGrad.addColorStop(0, '#8c765c');
            curbGrad.addColorStop(1, '#675540');
            ctx.fillStyle = curbGrad;
            ctx.fillRect(gx, gy + 16, gw, 12);

            // 3. MURO DE CANTERÍA / PIRCAS DEL DIQUE (gy + 28 a gy + gh)
            const wallGrad = ctx.createLinearGradient(0, gy + 28, 0, gy + gh);
            wallGrad.addColorStop(0, '#594939');
            wallGrad.addColorStop(0.6, '#3d3226');
            wallGrad.addColorStop(1, '#241e17');
            ctx.fillStyle = wallGrad;
            ctx.fillRect(gx, gy + 28, gw, gh - 28);

            // Bloques de piedra pirca trabados
            ctx.strokeStyle = 'rgba(25, 20, 15, 0.55)';
            ctx.lineWidth = 1.5;
            for (let row = 0; row < 2; row++) {
              const ry = gy + 28 + row * 18;
              ctx.beginPath();
              ctx.moveTo(gx, ry);
              ctx.lineTo(gx + gw, ry);
              ctx.stroke();
              const offset = (row % 2) * 36;
              for (let rx = gx + offset; rx < gx + gw; rx += 72) {
                ctx.beginPath();
                ctx.moveTo(rx, ry);
                ctx.lineTo(rx, ry + 18);
                ctx.stroke();
              }
            }

            // Musgo y brotes verdes naturales entre las lajas de piedra del Dique
            ctx.fillStyle = '#16a34a';
            for (let mx = gx + 35; mx < gx + gw; mx += 140) {
              ctx.fillRect(mx, gy + 13, 8, 3);
              ctx.fillRect(mx + 2, gy + 11, 4, 2);
            }

            // Detalle costanera: Bolardos / farolitos náuticos bajos cada 320px
            for (let bx = gx + 110; bx < gx + gw - 60; bx += 320) {
              ctx.fillStyle = '#1e293b';
              ctx.fillRect(bx, gy - 18, 8, 18);
              ctx.fillStyle = '#334155';
              ctx.fillRect(bx - 2, gy - 21, 12, 3);
              ctx.fillStyle = '#fef08a';
              ctx.fillRect(bx + 1, gy - 16, 6, 7);
            }
          } else if (currentLevel === 2) {
            // ==============================================================
            // NIVEL 2: PASEO PEATONAL DEL PARQUE DE LA CIUDAD / SUPERDOMO
            // Baldosas modernas de parque urbano, cordón de hormigón y césped
            // ==============================================================
            const parkWalkGrad = ctx.createLinearGradient(0, gy, 0, gy + 16);
            parkWalkGrad.addColorStop(0, '#64748b');    // Cemento claro de parque
            parkWalkGrad.addColorStop(0.4, '#475569');
            parkWalkGrad.addColorStop(1, '#334155');
            ctx.fillStyle = parkWalkGrad;
            ctx.fillRect(gx, gy, gw, 16);

            // Juntas de baldosones cuadrados del parque cada 36px
            ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
            ctx.lineWidth = 1.2;
            for (let bx = gx + 18; bx < gx + gw; bx += 36) {
              ctx.beginPath();
              ctx.moveTo(bx, gy);
              ctx.lineTo(bx, gy + 15);
              ctx.stroke();
            }

            // Borde biselado superior
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(gx, gy + 1, gw, 1.2);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(gx, gy + 15, gw, 2);

            // Cimientos del parque
            const curbParkGrad = ctx.createLinearGradient(0, gy + 17, 0, gy + gh);
            curbParkGrad.addColorStop(0, '#1e293b');
            curbParkGrad.addColorStop(0.5, '#0f172a');
            curbParkGrad.addColorStop(1, '#020617');
            ctx.fillStyle = curbParkGrad;
            ctx.fillRect(gx, gy + 17, gw, gh - 17);

            // Césped verde del Parque de la Ciudad
            ctx.fillStyle = '#16a34a';
            for (let px = gx + 10; px < gx + gw - 10; px += 45) {
              ctx.fillRect(px, gy + 13, 8, 3);
              ctx.fillRect(px + 2, gy + 11, 4, 2);
            }

            // Luminarias baliza de parque LED bajas cada 280px
            for (let lx = gx + 90; lx < gx + gw - 60; lx += 280) {
              ctx.fillStyle = '#334155';
              ctx.fillRect(lx, gy - 16, 6, 16);
              ctx.fillStyle = '#cbd5e1';
              ctx.fillRect(lx - 2, gy - 18, 10, 3);
              ctx.fillStyle = '#fef08a';
              ctx.fillRect(lx + 1, gy - 14, 4, 6);
            }
          } else {
            // ==============================================================
            // NIVEL 3: CALLE URBANA NOCTURNA: Vereda + Cordón + Asfalto Vial
            // ==============================================================
            const sidewalkGrad = ctx.createLinearGradient(0, gy, 0, gy + 16);
            sidewalkGrad.addColorStop(0, '#334155');
            sidewalkGrad.addColorStop(1, '#1e293b');
            ctx.fillStyle = sidewalkGrad;
            ctx.fillRect(gx, gy, gw, 16);

            ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
            ctx.lineWidth = 1;
            for (let bx = gx + 16; bx < gx + gw; bx += 16) {
              ctx.beginPath();
              ctx.moveTo(bx, gy);
              ctx.lineTo(bx, gy + 14);
              ctx.stroke();
            }

            ctx.fillStyle = '#475569';
            ctx.fillRect(gx, gy + 14, gw, 4);
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(gx, gy + 17, gw, 1);

            const curbStripes = 40;
            for (let k = 0; k < curbStripes; k += 10) {
              ctx.fillStyle = (k / 10) % 2 === 0 ? '#facc15' : '#0f172a';
              ctx.fillRect(gx + k, gy + 14, 10, 4);
              ctx.fillRect(gx + gw - curbStripes + k, gy + 14, 10, 4);
            }

            const roadGrad = ctx.createLinearGradient(0, gy + 18, 0, gy + gh);
            roadGrad.addColorStop(0, '#090d16');
            roadGrad.addColorStop(1, '#020617');
            ctx.fillStyle = roadGrad;
            ctx.fillRect(gx, gy + 18, gw, gh - 18);

            const zebraW = 55;
            ctx.fillStyle = '#ffffff';
            for (let zx = gx + 6; zx < gx + zebraW; zx += 12) {
              ctx.fillRect(zx, gy + 20, 7, 24);
            }
            for (let zx = gx + gw - zebraW; zx < gx + gw - 6; zx += 12) {
              ctx.fillRect(zx, gy + 20, 7, 24);
            }

            ctx.fillStyle = '#facc15';
            for (let lx = gx + zebraW + 12; lx < gx + gw - zebraW - 12; lx += 48) {
              ctx.fillRect(lx, gy + 42, 28, 3.5);
            }

            for (let mx = gx + 150; mx < gx + gw - 150; mx += 360) {
              ctx.fillStyle = '#475569';
              ctx.beginPath();
              ctx.arc(mx, gy + 42, 12, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#64748b';
              ctx.lineWidth = 1.5;
              ctx.stroke();
              ctx.fillStyle = '#94a3b8';
              ctx.font = '5px ' + PIXEL_FONT;
              ctx.fillText('AGUA', mx - 7, gy + 44);
            }
          }

        } else if (plat.type === 'pipe') {
          const tx = plat.x;
          const ty = plat.y;
          const tw = plat.w;
          const th = plat.h;

          if (currentLevel === 1) {
            // ==============================================================
            // NIVEL 1: PIEDRA NATURAL / ROCA DE MONTAÑA (DIQUE LOS SAUCES)
            // Reemplaza los tachos por grandes rocas de granito riojano
            // ==============================================================

            // 1. Sombra suave en la base de la roca sobre la costanera
            ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
            ctx.beginPath();
            ctx.ellipse(tx + tw / 2, ty + th + 1, tw / 2 + 7, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // 2. Silueta base y cuerpo de la roca (polígono rocoso facetado)
            ctx.save();
            ctx.beginPath();
            // Laja superior plana para soporte firme del jugador
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx + tw, ty);
            // Lado derecho angular
            ctx.lineTo(tx + tw + 4, ty + 18);
            ctx.lineTo(tx + tw + 2, ty + th * 0.55);
            ctx.lineTo(tx + tw + 5, ty + th - 10);
            ctx.lineTo(tx + tw - 2, ty + th);
            // Base
            ctx.lineTo(tx + 2, ty + th);
            // Lado izquierdo angular
            ctx.lineTo(tx - 4, ty + th - 12);
            ctx.lineTo(tx - 3, ty + th * 0.45);
            ctx.lineTo(tx - 5, ty + 16);
            ctx.closePath();

            // Degradado principal de roca de granito (sol desde arriba a la izquierda)
            const rockGrad = ctx.createLinearGradient(tx, ty, tx + tw, ty + th);
            rockGrad.addColorStop(0, '#78716c');    // Mineral cálido iluminado
            rockGrad.addColorStop(0.35, '#57534e'); // Granito medio
            rockGrad.addColorStop(0.75, '#44403c'); // Sombra de piedra
            rockGrad.addColorStop(1, '#292524');    // Base en sombra
            ctx.fillStyle = rockGrad;
            ctx.fill();

            // Contorno oscuro natural de la roca
            ctx.strokeStyle = '#1c1917';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 3. Facetas angulares de corte de cantera (luz y sombra 3D)
            // Faceta iluminada superior izquierda
            ctx.fillStyle = '#a8a29e';
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx + tw * 0.45, ty);
            ctx.lineTo(tx + tw * 0.35, ty + 24);
            ctx.lineTo(tx - 3, ty + 18);
            ctx.closePath();
            ctx.fill();

            // Faceta clara central
            ctx.fillStyle = '#857d77';
            ctx.beginPath();
            ctx.moveTo(tx + tw * 0.45, ty);
            ctx.lineTo(tx + tw, ty);
            ctx.lineTo(tx + tw * 0.7, ty + 28);
            ctx.lineTo(tx + tw * 0.35, ty + 24);
            ctx.closePath();
            ctx.fill();

            // Faceta en sombra derecha
            ctx.fillStyle = '#292524';
            ctx.beginPath();
            ctx.moveTo(tx + tw, ty);
            ctx.lineTo(tx + tw + 4, ty + 18);
            ctx.lineTo(tx + tw + 2, ty + th * 0.55);
            ctx.lineTo(tx + tw * 0.65, ty + th * 0.5);
            ctx.lineTo(tx + tw * 0.7, ty + 28);
            ctx.closePath();
            ctx.fill();

            // Grietas / fisuras profundas en la roca
            ctx.strokeStyle = '#1c1917';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(tx + tw * 0.35, ty + 24);
            ctx.lineTo(tx + tw * 0.48, ty + th * 0.52);
            ctx.lineTo(tx + tw * 0.32, ty + th * 0.76);
            ctx.lineTo(tx + tw * 0.5, ty + th - 8);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(tx + tw * 0.7, ty + 28);
            ctx.lineTo(tx + tw * 0.62, ty + th * 0.45);
            ctx.stroke();

            // 4. Borde superior pisable (Laja superior plana para el salto de Analía)
            const ledgeGrad = ctx.createLinearGradient(tx, ty, tx, ty + 7);
            ledgeGrad.addColorStop(0, '#d6d3d1');
            ledgeGrad.addColorStop(1, '#a8a29e');
            ctx.fillStyle = ledgeGrad;
            ctx.fillRect(tx, ty, tw, 6);
            ctx.fillStyle = '#f5f5f4';
            ctx.fillRect(tx + 2, ty, tw - 4, 1.5); // Brillo solar superior

            // 5. Manchas de musgo verde natural del lago
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.ellipse(tx + 8, ty + 5, 8, 3, 0, 0, Math.PI * 2);
            ctx.ellipse(tx + 20, ty + 6, 6, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Musgo en fisura media
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(tx + tw * 0.36, ty + th * 0.50, 6, 4);
            ctx.fillRect(tx + tw * 0.34, ty + th * 0.53, 9, 3);
            ctx.fillStyle = '#86efac';
            ctx.fillRect(tx + tw * 0.37, ty + th * 0.51, 3, 2);

            // Musgo en la base húmeda junto al suelo
            ctx.fillStyle = '#166534';
            ctx.beginPath();
            ctx.ellipse(tx + tw * 0.3, ty + th - 3, 10, 3, 0, 0, Math.PI * 2);
            ctx.ellipse(tx + tw * 0.75, ty + th - 4, 8, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // 6. Pequeño destello de escarcha / hielo en la cima
            ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
            const sparkle = Math.sin(frameCount * 0.08 + tx) * 2;
            ctx.fillRect(tx + tw * 0.65 + sparkle, ty - 2, 2.5, 2.5);

            ctx.restore();
          } else {
            // ==============================================================
            // NIVELES 2 Y 3: TACHO BLANCO DE HELADOS CON LOGO "LAS MALVINAS"
            // ==============================================================
            // 1. Sombra suave elíptica sobre el asfalto
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.beginPath();
            ctx.ellipse(tx + tw / 2, ty + th + 1, tw / 2 + 5, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // 2. Cuerpo del tacho blanco de helado (cilindro térmico satinado)
            const tubGrad = ctx.createLinearGradient(tx, 0, tx + tw, 0);
            tubGrad.addColorStop(0, '#e2e8f0');       // Sombra izquierda
            tubGrad.addColorStop(0.18, '#ffffff');    // Brillo blanco satinado
            tubGrad.addColorStop(0.65, '#f8fafc');     // Blanco cuerpo
            tubGrad.addColorStop(0.9, '#e2e8f0');     // Transición
            tubGrad.addColorStop(1, '#94a3b8');       // Sombra derecha
            ctx.fillStyle = tubGrad;

            // Cuerpo cilíndrico con base ligeramente redondeada
            ctx.beginPath();
            ctx.roundRect(tx + 2, ty + 16, tw - 4, th - 16, [0, 0, 6, 6]);
            ctx.fill();
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 3. Nervaduras / anillos de refuerzo horizontales del tacho
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.65)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(tx + 3, ty + 28);
            ctx.lineTo(tx + tw - 3, ty + 28);
            ctx.moveTo(tx + 3, ty + th - 12);
            ctx.lineTo(tx + tw - 3, ty + th - 12);
            ctx.stroke();

            // 4. Borde superior / Tapa del tacho (donde pisa el jugador)
            const rimGrad = ctx.createLinearGradient(tx, 0, tx + tw, 0);
            rimGrad.addColorStop(0, '#e2e8f0');
            rimGrad.addColorStop(0.25, '#ffffff');
            rimGrad.addColorStop(1, '#cbd5e1');
            ctx.fillStyle = rimGrad;
            ctx.beginPath();
            ctx.roundRect(tx - 3, ty, tw + 6, 16, [5, 5, 3, 3]);
            ctx.fill();
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Detalle fucsia distintivo en la tapa
            ctx.fillStyle = '#ec4899';
            ctx.fillRect(tx + 1, ty + 4, tw - 2, 3.5);

            // Manijas laterales metálicas de balde
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(tx + 1, ty + 23, 4.5, Math.PI * 0.5, Math.PI * 1.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(tx + tw - 1, ty + 23, 4.5, -Math.PI * 0.5, Math.PI * 0.5);
            ctx.stroke();

            // 5. ETIQUETA / LOGO OFICIAL "LAS MALVINAS" EN EL FRENTE DEL TACHO
            const logoSize = Math.min(36, th - 36);
            const logoX = tx + (tw - logoSize) / 2;
            const logoY = ty + 33;

            // Placa fucsia cuadrada como el logo subido por el cliente
            ctx.fillStyle = '#e6007e';
            ctx.beginPath();
            ctx.roundRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4, 4);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Dibujar el logo oficial (imagen PNG o fallback vectorial)
            if (logoMalvinasImg && logoMalvinasImg.complete && logoMalvinasImg.naturalWidth > 0) {
              ctx.drawImage(logoMalvinasImg, logoX, logoY, logoSize, logoSize);
            } else {
              // Fallback vectorial idéntico
              ctx.fillStyle = '#fff';
              // Remolino de helado
              ctx.beginPath();
              ctx.arc(logoX + 7, logoY + logoSize / 2, 4, 0, Math.PI * 2);
              ctx.fill();
              // Texto
              ctx.font = '6px ' + PIXEL_FONT;
              ctx.fillText('Las', logoX + 13, logoY + 12);
              ctx.fillText('Malvinas', logoX + 12, logoY + 22);
            }

            // 6. Vapor / frío escarchado que sale del tacho de helado
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            const steamOff = Math.sin(frameCount * 0.08 + tx) * 3;
            ctx.beginPath();
            ctx.arc(tx + tw * 0.35 + steamOff, ty - 5, 3, 0, Math.PI * 2);
            ctx.arc(tx + tw * 0.65 - steamOff, ty - 7, 4, 0, Math.PI * 2);
            ctx.fill();
          }

        } else if (plat.type === 'brick') {
          // Plataforma urbana de ladrillos / marquesina
          ctx.fillStyle = '#be185d';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
          ctx.strokeStyle = '#fbcfe8';
          ctx.lineWidth = 2;
          ctx.strokeRect(plat.x + 1, plat.y + 1, plat.w - 2, plat.h - 2);
          // Toldo mini
          ctx.fillStyle = '#f472b6';
          ctx.fillRect(plat.x, plat.y, plat.w, 4);
        } else if (plat.type === 'ice') {
          // Plataforma de freezer / hielo
          ctx.fillStyle = '#67e8f9';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(plat.x + 1, plat.y + 1, plat.w - 2, plat.h - 2);
        }
      }

      // Dibujar Bloques Misteriosos [?]
      for (const mb of mysteryBlocks) {
        const by = mb.y - mb.bounce;
        ctx.fillStyle = mb.used ? '#64748b' : '#eab308';
        ctx.fillRect(mb.x, by, mb.w, mb.h);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.strokeRect(mb.x + 2, by + 2, mb.w - 4, mb.h - 4);
        if (!mb.used) {
          ctx.fillStyle = '#0f172a';
          ctx.font = '16px ' + PIXEL_FONT;
          ctx.fillText('?', mb.x + 13, by + 25);
        }
      }

      // Dibujar Cucuruchos Recolectables
      for (const c of cones) {
        if (c.collected || c.hidden) continue;
        const bob = Math.sin(frameCount * 0.1 + c.x) * 4;
        // Cono
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.moveTo(c.x - 8, c.y + bob);
        ctx.lineTo(c.x + 8, c.y + bob);
        ctx.lineTo(c.x, c.y + 16 + bob);
        ctx.closePath();
        ctx.fill();
        // Bocha de helado rosa/celeste
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(c.x, c.y - 4 + bob, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(c.x - 3, c.y - 7 + bob, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dibujar Premios de Bloques [?] (Súper Pote 1Kg y Cucurucho Sorpresa Dorado)
      for (const p of powerups) {
        if (p.type === 'bonusCone') {
          const cx = p.x + p.w / 2;
          const cy = p.y + p.h / 2;
          // Halo brillante dorado
          ctx.save();
          ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
          ctx.beginPath();
          ctx.arc(cx, cy - 2, 16 + Math.sin(frameCount * 0.18) * 2, 0, Math.PI * 2);
          ctx.fill();
          // Cono dorado
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.moveTo(cx - 9, cy + 1);
          ctx.lineTo(cx + 9, cy + 1);
          ctx.lineTo(cx, cy + 16);
          ctx.closePath();
          ctx.fill();
          // Doble bocha artesanal (frutilla + crema dorada)
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.arc(cx - 4, cy - 2, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(cx + 4, cy - 2, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(cx, cy - 9, 6.5, 0, Math.PI * 2);
          ctx.fill();
          // Brillo superior
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx - 2, cy - 11, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.fillStyle = '#ec4899';
          ctx.fillRect(p.x, p.y + 8, p.w, p.h - 8);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(p.x - 2, p.y, p.w + 4, 10);
          ctx.fillStyle = '#fff';
          ctx.font = '7.5px ' + PIXEL_FONT;
          ctx.fillText('1KG', p.x + 5, p.y + 24);
        }
      }

      // Dibujar Enemigos: Solcitos de Calor Riojano (45°C -> 30°C -> 15°C al recibir copos)
      for (const en of enemies) {
        if (!en.alive) continue;
        const cx = en.x + en.w / 2;
        const cy = en.y + en.h / 2;
        const maxHp = en.maxHp || 3;
        const curHp = typeof en.hp === 'number' ? en.hp : maxHp;
        const isHit = en.hitTimer > 0;

        // Rayos / Aura de calor (se vuelve helada al recibir impactos)
        if (isHit) {
          ctx.fillStyle = '#67e8f9';
        } else if (curHp <= maxHp / 2) {
          ctx.fillStyle = '#38bdf8';
        } else {
          ctx.fillStyle = en.type === 'flame' ? '#ef4444' : '#f97316';
        }
        ctx.beginPath();
        ctx.arc(cx, cy, 19 + Math.sin(frameCount * 0.2) * 2, 0, Math.PI * 2);
        ctx.fill();

        // Cara del solcito
        ctx.fillStyle = isHit ? '#e0f2fe' : (curHp <= maxHp / 2 ? '#bae6fd' : '#facc15');
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();

        // Ojos enojados
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx - 7, cy - 4, 4, 4);
        ctx.fillRect(cx + 3, cy - 4, 4, 4);

        // Barra pequeña de vida cuando ya recibió daño
        if (curHp < maxHp) {
          const barW = 30;
          const barX = cx - barW / 2;
          const barY = en.y - 16;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
          ctx.fillRect(barX - 1, barY - 1, barW + 2, 6);
          ctx.fillStyle = curHp <= maxHp / 2 ? '#38bdf8' : '#facc15';
          ctx.fillRect(barX, barY, Math.round((curHp / maxHp) * barW), 4);
        }

        // Etiqueta de temperatura que baja con cada copo o pisotón
        const tempLabel = Math.max(10, Math.round((curHp / maxHp) * 45)) + '°C';
        ctx.fillStyle = curHp < maxHp ? '#bae6fd' : '#fff';
        ctx.font = '7px ' + PIXEL_FONT;
        ctx.fillText(tempLabel, en.x + 7, en.y - 4);
      }

      // Dibujar Copos de Nieve Giratorios ❄️
      for (const b of iceBalls) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle || 0);

        // Brillo / Halo de escarcha exterior
        const glowR = b.isSuper ? b.r * 1.8 : b.r * 1.4;
        const frostGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, glowR);
        frostGrad.addColorStop(0, b.isSuper ? 'rgba(244, 114, 182, 0.85)' : 'rgba(103, 232, 249, 0.85)');
        frostGrad.addColorStop(0.55, b.isSuper ? 'rgba(236, 72, 153, 0.45)' : 'rgba(56, 189, 248, 0.45)');
        frostGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = frostGrad;
        ctx.beginPath();
        ctx.arc(0, 0, glowR, 0, Math.PI * 2);
        ctx.fill();

        // 6 Brazos de cristal del copo de nieve a 60°
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = b.isSuper ? 2.4 : 1.8;
        ctx.lineCap = 'round';

        for (let a = 0; a < 6; a++) {
          const armAng = (a * Math.PI) / 3;
          const cosA = Math.cos(armAng);
          const sinA = Math.sin(armAng);
          const len = b.r;

          // Brazo principal
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(cosA * len, sinA * len);
          ctx.stroke();

          // Cristales secundarios (ramificaciones en V)
          const barbDist = len * 0.62;
          const barbLen = len * 0.42;
          const bAng1 = armAng + Math.PI / 4;
          const bAng2 = armAng - Math.PI / 4;

          ctx.beginPath();
          ctx.moveTo(cosA * barbDist, sinA * barbDist);
          ctx.lineTo(cosA * barbDist + Math.cos(bAng1) * barbLen, sinA * barbDist + Math.sin(bAng1) * barbLen);
          ctx.moveTo(cosA * barbDist, sinA * barbDist);
          ctx.lineTo(cosA * barbDist + Math.cos(bAng2) * barbLen, sinA * barbDist + Math.sin(bAng2) * barbLen);
          ctx.stroke();
        }

        // Núcleo central brillante (gema de hielo)
        ctx.fillStyle = b.isSuper ? '#f472b6' : '#bae6fd';
        ctx.beginPath();
        ctx.arc(0, 0, b.isSuper ? 4.5 : 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Dibujar Meta: Mástil + Local de Heladería Malvinas
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(goalFlag.x, goalFlag.y, 6, goalFlag.h);
      // Banderín Malvinas
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(goalFlag.x + 6, goalFlag.y + 10);
      ctx.lineTo(goalFlag.x + 66, goalFlag.y + 28);
      ctx.lineTo(goalFlag.x + 6, goalFlag.y + 46);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '7.5px ' + PIXEL_FONT;
      ctx.fillText('META', goalFlag.x + 12, goalFlag.y + 32);

      // Edificio de Sucursal Heladería Malvinas al final de la calle
      const shopX = goalFlag.x + 75;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(shopX, 215, 185, 165);

      // Marquesina luminosa fucsia con el logo oficial
      ctx.fillStyle = '#e6007e';
      ctx.fillRect(shopX - 4, 182, 193, 36);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(shopX - 2, 184, 189, 32);

      // Dibujar logo oficial en la marquesina
      if (logoMalvinasImg && logoMalvinasImg.complete && logoMalvinasImg.naturalWidth > 0) {
        ctx.drawImage(logoMalvinasImg, shopX + 6, 186, 28, 28);
      }
      ctx.fillStyle = '#fff';
      ctx.font = '9px ' + PIXEL_FONT;
      ctx.fillText('HELADERÍA MALVINAS', shopX + 38, 201);
      ctx.font = '6.5px ' + PIXEL_FONT;
      ctx.fillStyle = '#fef08a';
      ctx.fillText('🍦 SUCURSAL OFICIAL — LA RIOJA', shopX + 38, 211);

      // Toldo clásico de heladería (rayas rosas y celestes)
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#ec4899' : '#38bdf8';
        ctx.fillRect(shopX - 6 + i * 22, 218, 22, 22);
      }

      // Vidriera con potes de helado exhibidos
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.fillRect(shopX + 15, 275, 75, 75);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(shopX + 15, 275, 75, 75);

      // Potes de helado exhibidos en la vidriera
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(shopX + 22, 325, 20, 18);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(shopX + 46, 325, 20, 18);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(shopX + 66, 325, 18, 18);

      // Puerta vidriada de entrada a la heladería
      ctx.fillStyle = 'rgba(244, 114, 182, 0.35)';
      ctx.fillRect(shopX + 105, 265, 55, 115);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(shopX + 105, 265, 55, 115);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(shopX + 110, 320, 4, 18); // Manija
      ctx.fillStyle = '#fff';
      ctx.font = '6.5px ' + PIXEL_FONT;
      ctx.fillText('ABIERTO', shopX + 114, 285);

      // DIBUJAR FINAL BOSS EN NIVEL 3 (Maestro Heladero Industrial)
      if (currentLevel === 3 && boss && boss.alive) {
        ctx.save();
        const bx = boss.x;
        const by = boss.y;
        const isHit = boss.hitTimer > 0;

        // Barra de salud superior del Boss
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(bx - 18, by - 36, boss.w + 36, 16);
        ctx.strokeStyle = boss.enraged ? '#f97316' : '#ef4444';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(bx - 18, by - 36, boss.w + 36, 16);

        const healthPct = Math.max(0, boss.hp / boss.maxHp);
        ctx.fillStyle = healthPct > 0.6 ? '#22c55e' : (healthPct > 0.3 ? '#facc15' : '#ef4444');
        ctx.fillRect(bx - 16, by - 34, (boss.w + 32) * healthPct, 12);

        ctx.fillStyle = '#ffffff';
        ctx.font = '6.5px ' + PIXEL_FONT;
        ctx.textAlign = 'center';
        ctx.fillText(`ROBOT HP: ${boss.hp}/${boss.maxHp}`, bx + boss.w / 2, by - 25);

        // Indicador brillante del punto débil arriba de la cabeza
        const bobArrow = Math.sin(frameCount * 0.2) * 2.5;
        ctx.fillStyle = '#facc15';
        ctx.font = '6px ' + PIXEL_FONT;
        ctx.fillText('▼ CABEZA ▼', bx + boss.w / 2, by - 9 + bobArrow);
        ctx.textAlign = 'left';

        // Cuerpo robótico mecánico BLINDADO (costados metálicos reforzados)
        if (boss.enraged) {
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
        }
        ctx.fillStyle = isHit ? '#fca5a5' : (boss.enraged ? '#475569' : '#64748b');
        ctx.beginPath();
        ctx.roundRect(bx, by + 28, boss.w, boss.h - 28, 8);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Placas metálicas laterales (indican que los costados están blindados)
        ctx.fillStyle = '#334155';
        ctx.fillRect(bx + 3, by + 36, 10, boss.h - 46);
        ctx.fillRect(bx + boss.w - 13, by + 36, 10, boss.h - 46);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(bx + 6, by + 42, 4, 4);
        ctx.fillRect(bx + 6, by + boss.h - 20, 4, 4);
        ctx.fillRect(bx + boss.w - 10, by + 42, 4, 4);
        ctx.fillRect(bx + boss.w - 10, by + boss.h - 20, 4, 4);

        // Cabeza robótica (PUNTO DÉBIL con cúpula brillante arriba)
        ctx.fillStyle = isHit ? '#ffffff' : (boss.enraged ? '#dc2626' : '#f59e0b');
        ctx.beginPath();
        ctx.arc(bx + boss.w / 2, by + 4, 15, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = isHit ? '#f87171' : '#475569';
        ctx.fillRect(bx + 12, by + 4, boss.w - 24, 24);
        // Visor luminoso
        ctx.fillStyle = isHit ? '#ffffff' : (frameCount % 14 < 7 ? '#ef4444' : '#f97316');
        ctx.fillRect(bx + 18, by + 11, boss.w - 36, 9);

        // Chimenea con humo industrial
        ctx.fillStyle = '#334155';
        ctx.fillRect(bx + boss.w - 18, by - 15, 12, 16);
        if (frameCount % 5 === 0) {
          particles.push({
            x: bx + boss.w - 12,
            y: by - 16,
            vx: (Math.random() - 0.5) * 0.9,
            vy: -1.4,
            color: 'rgba(148, 163, 184, 0.6)',
            r: Math.random() * 4 + 3,
            life: 26,
            maxLife: 26
          });
        }

        // Panel de control
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(bx + 12, by + 42, boss.w - 24, 30);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '7px ' + PIXEL_FONT;
        ctx.fillText('IND-GEL 3.0', bx + 14, by + 60);

        // Dispensadores de helado gris industrial en los costados
        ctx.fillStyle = '#334155';
        ctx.fillRect(bx - 10, by + 36, 10, 36);
        ctx.fillRect(bx + boss.w, by + 36, 10, 36);
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(bx - 5, by + 74, 8, 0, Math.PI * 2);
        ctx.arc(bx + boss.w + 5, by + 74, 8, 0, Math.PI * 2);
        ctx.fill();

        // Orugas inferiores
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(bx + 4, by + boss.h - 12, 28, 12);
        ctx.fillRect(bx + boss.w - 32, by + boss.h - 12, 28, 12);

        ctx.restore();
      }

      // Proyectiles del Boss
      for (const bp of bossProjectiles) {
        ctx.save();
        ctx.fillStyle = '#64748b';
        ctx.shadowColor = '#475569';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, bp.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(bp.x - 2, bp.y - 2, bp.r * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // DIBUJAR JUGADOR (Analía — Maestra Heladera con Malvi a su lado)
      if (player.invincibleTimer % 4 < 2) {
        ctx.save();
        const activeSprite = getAnaliaCurrentSprite();
        if (useHdSprite && activeSprite && activeSprite.complete) {
          // Renderizado animado del Sprite HD de Analía (Full HD, nítido y luminoso)
          const isMoving = Math.abs(player.vx) > 0.25;
          const bobY = isMoving && player.grounded
            ? Math.abs(Math.sin(frameCount * 0.42)) * 2.6
            : Math.sin(frameCount * 0.12) * 1.2;
          const tilt = !player.grounded ? (player.vy * 0.011) : (isMoving ? Math.sin(frameCount * 0.42) * 0.035 : 0);

          const drawH = 74;
          const aspect = (activeSprite.naturalWidth && activeSprite.naturalHeight)
            ? (activeSprite.naturalWidth / activeSprite.naturalHeight)
            : 0.72;
          const drawW = Math.round(drawH * aspect);
          const cx = player.x + player.w / 2;
          const cy = player.y + player.h - drawH / 2 - bobY + 2;

          // Sombra suave de contacto en el suelo para destacar mejor a Analía
          if (player.grounded) {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
            ctx.beginPath();
            ctx.ellipse(cx, player.y + player.h + 1, 18, 4.5, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.translate(cx, cy);
          if (player.facing === -1) ctx.scale(-1, 1);
          ctx.rotate(tilt);

          // 1. DIBUJAR A MALVI DETRÁS DE ANALÍA (separado del hombro para no tapar su silueta)
          ctx.save();
          const malviBob = Math.sin(frameCount * 0.16) * 3.5;
          const malviX = -27;
          const malviY = -17 + malviBob;
          ctx.translate(malviX, malviY);

          ctx.shadowColor = player.shootCooldown > 0 ? '#38bdf8' : '#ec4899';
          ctx.shadowBlur = player.shootCooldown > 0 ? 12 : 6;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          if (malviLoaded && malviSprite.complete && malviSprite.naturalWidth > 0) {
            const mW = 13;
            const mH = (malviSprite.naturalHeight / malviSprite.naturalWidth) * mW;
            ctx.drawImage(malviSprite, -mW / 2, -mH / 2, mW, mH);
          } else {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.moveTo(0, 10);
            ctx.lineTo(-4, -1);
            ctx.lineTo(4, -1);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#78350f';
            ctx.beginPath();
            ctx.arc(0, -2, 4.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f472b6';
            ctx.beginPath();
            ctx.arc(0, -7, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-4.5, -8, 9, 2.5);
          }

          // Destellos / copos de nieve flotando alrededor de Malvi
          ctx.fillStyle = '#67e8f9';
          const sparkAngle = frameCount * 0.09;
          ctx.fillRect(Math.cos(sparkAngle) * 11, Math.sin(sparkAngle) * 10, 2.2, 2.2);
          ctx.fillRect(Math.cos(sparkAngle + Math.PI) * 10, Math.sin(sparkAngle + Math.PI) * 9, 1.8, 1.8);
          ctx.restore();

          // 2. DIBUJAR A ANALÍA EN PRIMER PLANO CON ALTA CLARIDAD, BRILLO Y CONTORNO LUMINOSO
          ctx.save();
          if (player.superMode) {
            ctx.shadowColor = frameCount % 10 < 5 ? '#f472b6' : '#67e8f9';
            ctx.shadowBlur = IS_MOBILE_RENDER ? 10 : 14;
            if (!IS_MOBILE_RENDER) ctx.filter = 'brightness(1.18) contrast(1.06)';
          } else {
            // Sutil aura clara para que el uniforme oscuro y rostro resalten con máxima nitidez sobre cualquier fondo
            ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
            ctx.shadowBlur = 5;
            if (!IS_MOBILE_RENDER) ctx.filter = 'brightness(1.14) contrast(1.06)';
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(activeSprite, -drawW / 2, -drawH / 2, drawW, drawH);
          if (!IS_MOBILE_RENDER) ctx.filter = 'none';
          ctx.shadowBlur = 0;
          ctx.restore();
        } else {
          // Renderizado 2D detallado de la Maestra Heladera Malvinas (basado en la foto)
          const cx = player.x + player.w / 2;
          const py = player.y - 4; // Ajuste visual para altura de 48px
          const isMoving = Math.abs(player.vx) > 0.25;
          const walkCycle = isMoving ? Math.sin(frameCount * 0.38) : 0;
          const bobY = isMoving && player.grounded ? Math.abs(Math.sin(frameCount * 0.38)) * 2 : 0;

          ctx.translate(cx, py + bobY);
          if (player.facing === -1) {
            ctx.scale(-1, 1);
          }

          // Aura brillante cuando tiene el Súper Pote 1Kg activo
          if (player.superMode) {
            ctx.save();
            ctx.strokeStyle = frameCount % 10 < 5 ? '#f472b6' : '#67e8f9';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.roundRect(-22, -2, 44, 52, 12);
            ctx.stroke();
            ctx.restore();
          }

          // 1. COLITA / RODETE DE PELO OSCURO ATRÁS (se mueve al correr/saltar)
          const hairBounce = !player.grounded ? -3 : walkCycle * 2;
          ctx.fillStyle = '#1c1917';
          ctx.beginPath();
          ctx.ellipse(-13, 14 + hairBounce * 0.4, 5, 6, -0.3, 0, Math.PI * 2);
          ctx.fill();
          // Mechones laterales junto a la oreja
          ctx.fillRect(-10, 10, 4, 8);

          // 2. PIERNAS Y ZAPATILLAS (con animación de correr)
          const legStep = walkCycle * 5;
          // Pierna trasera
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-7 - legStep * 0.6, 37, 6, 7);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-8 - legStep * 0.6, 43, 9, 4);
          // Pierna delantera
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(1 + legStep * 0.6, 37, 6, 7);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0 + legStep * 0.6, 43, 9, 4);
          // Detalle suela blanca
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(-8 - legStep * 0.6, 46, 9, 1.5);
          ctx.fillRect(0 + legStep * 0.6, 46, 9, 1.5);

          // 3. CHAQUETILLA NEGRA DE MAESTRA HELADERA
          ctx.fillStyle = '#111827';
          ctx.beginPath();
          ctx.roundRect(-12, 20, 24, 19, 4);
          ctx.fill();

          // Panel de hombro izquierdo y mangas con ESTAMPADO DE HOJAS BLANCAS (como la foto)
          ctx.fillStyle = '#18181b';
          ctx.fillRect(-14, 21, 7, 11); // Manga trasera
          ctx.fillRect(8, 21, 7, 11);   // Manga delantera
          // Hojitas blancas del estampado en hombro y mangas
          ctx.strokeStyle = '#f8fafc';
          ctx.lineWidth = 1.2;
          const leafCoords = [[-12, 23], [-10, 27], [-12, 30], [3, 22], [6, 24], [10, 24], [12, 28], [9, 30]];
          for (const [lx, ly] of leafCoords) {
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(lx + 2.5, ly - 1.5);
            ctx.moveTo(lx, ly);
            ctx.lineTo(lx + 2, ly + 1.5);
            ctx.stroke();
          }

          // Cuello Mao y Vivo Blanco Diagonal Cruzado de la chaquetilla
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          // Cuello mao abierto en V
          ctx.moveTo(-4, 19);
          ctx.lineTo(0, 23);
          ctx.lineTo(4, 19);
          // Línea diagonal cruzada hacia la derecha y abajo
          ctx.moveTo(0, 23);
          ctx.lineTo(9, 27);
          ctx.lineTo(8, 38);
          ctx.stroke();

          // Logo Zigzag Vertical Rosa y Blanco en el pecho derecho
          ctx.strokeStyle = '#f472b6';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-5, 25);
          ctx.lineTo(-3, 26.5);
          ctx.lineTo(-5, 28);
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(-5, 28.5);
          ctx.lineTo(-3, 30);
          ctx.lineTo(-5, 31.5);
          ctx.stroke();

          // 4. ROSTRO Y EXPRESIÓN SIMPÁTICA
          ctx.fillStyle = '#f5cba7'; // Tono de piel cálido
          ctx.beginPath();
          ctx.roundRect(-9, 7, 19, 14, 5);
          ctx.fill();

          // Cejas oscuras expresivas
          ctx.fillStyle = '#27272a';
          ctx.fillRect(-3, 10, 4, 1.3);
          ctx.fillRect(4, 10, 4, 1.3);

          // Ojos marrones oscuros con brillo
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(-2, 12, 3, 3.2);
          ctx.fillRect(5, 12, 3, 3.2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-1, 12.3, 1.2, 1.2);
          ctx.fillRect(6, 12.3, 1.2, 1.2);

          // Mejillas suaves y sonrisa
          ctx.fillStyle = 'rgba(244, 114, 182, 0.35)';
          ctx.beginPath();
          ctx.arc(-4, 16.5, 2.2, 0, Math.PI * 2);
          ctx.arc(8, 16.5, 2.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#be123c';
          ctx.beginPath();
          ctx.arc(2.5, 17.2, 2, 0, Math.PI);
          ctx.fill();

          // 5. GORRA NEGRA CON BORDE GRIS/BLANCO Y LOGO ZIGZAG ROSA/BLANCO
          ctx.fillStyle = '#111827';
          ctx.beginPath();
          ctx.roundRect(-10, -1, 20, 10, [7, 7, 1, 1]);
          ctx.fill();

          // Visera negra con vivo gris claro/blanco en el borde
          ctx.fillStyle = '#111827';
          ctx.beginPath();
          ctx.roundRect(-6, 6, 21, 3.5, 2);
          ctx.fill();
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(-4, 8.8);
          ctx.lineTo(15, 8.8);
          ctx.stroke();

          // Logo vertical en zigzag Rosa y Blanco en el frente de la gorra
          ctx.strokeStyle = '#f472b6';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(1, 0.5);
          ctx.lineTo(3.5, 2);
          ctx.lineTo(1, 3.5);
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(1, 3.8);
          ctx.lineTo(3.5, 5.2);
          ctx.lineTo(1, 6.5);
          ctx.stroke();

          // 6. MANOS CON GUANTES NEGROS + BOCHERO Y CUCURUCHO CON SERVILLETA FUCSIA
          // Mano trasera (Guante negro con Bochero/Cuchara de helado plateada)
          const armSwing = walkCycle * 3;
          ctx.fillStyle = '#090d16'; // Guante negro
          ctx.beginPath();
          ctx.arc(-13, 32 - armSwing * 0.4, 3.5, 0, Math.PI * 2);
          ctx.fill();
          // Bochero metálico
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-14, 32 - armSwing * 0.4);
          ctx.lineTo(-19, 28 - armSwing * 0.4);
          ctx.stroke();

          // Mano delantera (Guante negro sosteniendo el Cucurucho con servilleta rosa/fucsia)
          const coneX = 14;
          const coneY = 30 + armSwing * 0.4;
          // Servilleta fucsia/rosa envolviendo la base del cucurucho (igual que en la foto)
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.moveTo(coneX - 3, coneY);
          ctx.lineTo(coneX + 4, coneY);
          ctx.lineTo(coneX + 1, coneY + 7);
          ctx.closePath();
          ctx.fill();
          // Waffle de cucurucho dorado arriba de la servilleta
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.arc(coneX + 0.5, coneY - 2, 4, 0, Math.PI * 2);
          ctx.fill();
          // Si tiene el modo Súper 1Kg activo, el cucurucho lleva una súper bocha brillante
          if (player.superMode) {
            ctx.fillStyle = '#67e8f9';
            ctx.beginPath();
            ctx.arc(coneX + 0.5, coneY - 6, 4.2, 0, Math.PI * 2);
            ctx.fill();
          }
          // Guante negro sosteniendo el cucurucho
          ctx.fillStyle = '#090d16';
          ctx.beginPath();
          ctx.arc(coneX - 1, coneY + 3, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Dibujar partículas (estelas de copos de nieve, escarcha, destellos)
      for (const p of particles) {
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Textos flotantes de puntos
      for (const ft of floatingTexts) {
        ctx.fillStyle = ft.color;
        ctx.font = '10px ' + PIXEL_FONT;
        ctx.fillText(ft.text, ft.x, ft.y);
      }

      ctx.restore();

      // Cartel cinematográfico triunfal al llegar a la Meta
      if (gameState === 'LEVEL_COMPLETE' || gameState === 'LEVEL_TRANSITION') {
        ctx.save();
        // Resplandor superior
        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        ctx.fillRect(0, 0, GAME_W, 110);

        ctx.textAlign = 'center';
        ctx.font = '14px ' + PIXEL_FONT;
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;

        if (currentLevel === 1) {
          ctx.fillText('🍓 ¡SABOR 1 RECUPERADO: FRUTILLA A LA REINA! 🍓', GAME_W / 2, 45);
          ctx.font = '8.5px ' + PIXEL_FONT_READABLE;
          ctx.fillStyle = '#67e8f9';
          ctx.shadowBlur = 8;
          ctx.fillText('¡Analía y Malvi entraron a la sucursal del Dique Los Sauces!', GAME_W / 2, 72);
        } else if (currentLevel === 2) {
          ctx.fillText('🍮 ¡SABOR 2 RECUPERADO: DULCE DE LECHE! 🍮', GAME_W / 2, 45);
          ctx.font = '8.5px ' + PIXEL_FONT_READABLE;
          ctx.fillStyle = '#67e8f9';
          ctx.shadowBlur = 8;
          ctx.fillText('¡Avanzando a la Batalla Final en el Microcentro Riojano!', GAME_W / 2, 72);
        } else {
          ctx.fillText('🍫 ¡VICTORIA TOTAL: CHOCOLATE MALVINAS SALVADO! 🍫', GAME_W / 2, 45);
          ctx.font = '8.5px ' + PIXEL_FONT_READABLE;
          ctx.fillStyle = '#4ade80';
          ctx.shadowBlur = 8;
          ctx.fillText('¡El Maestro Industrial fue vencido y la heladería salvada!', GAME_W / 2, 72);
        }
        ctx.restore();
      }
    }

    let lastFrameTime = 0;
    let frameAccumulator = 0;
    const FIXED_STEP_MS = 1000 / 60; // Ritmo estable de 60 FPS incluso en pantallas de 120Hz/144Hz

    function gameLoop(timestamp) {
      const now = timestamp || performance.now();
      if (!lastFrameTime) lastFrameTime = now;
      const delta = Math.min(now - lastFrameTime, 100);
      lastFrameTime = now;
      frameAccumulator += delta;

      while (frameAccumulator >= FIXED_STEP_MS) {
        updateGame();
        frameAccumulator -= FIXED_STEP_MS;
      }

      drawGame();
      requestAnimationFrame(gameLoop);
    }