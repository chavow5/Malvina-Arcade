/**
 * ==============================================================
 * 🎮 MALVINAS ARCADE — PARTE DE JUEGO E INTERFAZ (juego.js)
 * ==============================================================
 * Este archivo maneja la interacción con el jugador:
 * - Bucle principal (gameLoop) y estados del juego
 * - Transición limpia de pantallas (Inicio, Carga Retro, Juego)
 * - Pantalla de carga con Analía haciendo sus poses en el escenario
 * - Controles de teclado PC y botones táctiles de celular
 * - Modales de Salón de la Fama, Opciones y Registro de Cupones
 * - Detección de celular horizontal y aviso de rotación
 * ==============================================================
 */

/**************************************************************
     * 6. CONTROLES (TECLADO PC + BOTONES TÁCTILES CELULAR)
     **************************************************************/
    window.addEventListener('keydown', (e) => {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      if (document.querySelector('.modal-overlay.active')) return;
      if (typeof gameState !== 'undefined' && gameState !== 'PLAYING') return;

      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = true;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        keys.jump = true;
        if (e.code === 'Space') e.preventDefault();
      }
      if (['KeyX', 'KeyZ', 'KeyC', 'KeyF', 'ShiftLeft', 'ShiftRight', 'KeyE'].includes(e.code)) {
        if (!e.repeat) {
          keys.shoot = true;
          shootIceBall();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = false;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) keys.jump = false;
      if (['KeyX', 'KeyZ', 'KeyC', 'KeyF', 'ShiftLeft', 'ShiftRight', 'KeyE'].includes(e.code)) keys.shoot = false;
    });

    function bindTouchButton(btnId, keyName) {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      const start = (e) => {
        e.preventDefault();
        keys[keyName] = true;
        btn.classList.add('active');
        if (keyName === 'shoot') shootIceBall();
      };
      const end = (e) => {
        e.preventDefault();
        keys[keyName] = false;
        btn.classList.remove('active');
      };
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
      btn.addEventListener('mouseleave', end);
      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
      btn.addEventListener('touchcancel', end, { passive: false });
    }

    // D-Pad táctil con deslizamiento fluido del pulgar entre ◀ y ▶ (multitouch real para celular)
    (function bindSlidingDpad() {
      const dpad = document.querySelector('.dpad');
      const btnLeft = document.getElementById('btnLeft');
      const btnRight = document.getElementById('btnRight');
      if (!dpad || !btnLeft || !btnRight) {
        bindTouchButton('btnLeft', 'left');
        bindTouchButton('btnRight', 'right');
        return;
      }

      const setDpadState = (leftActive, rightActive) => {
        keys.left = leftActive;
        keys.right = rightActive;
        btnLeft.classList.toggle('active', leftActive);
        btnRight.classList.toggle('active', rightActive);
      };

      const updateDpadFromTouches = (e) => {
        e.preventDefault();
        const leftRect = btnLeft.getBoundingClientRect();
        const rightRect = btnRight.getBoundingClientRect();
        const pad = 16; // Margen generoso alrededor del pulgar al deslizar
        let leftActive = false;
        let rightActive = false;

        for (let i = 0; i < e.touches.length; i++) {
          const t = e.touches[i];
          const x = t.clientX;
          const y = t.clientY;
          if (y >= Math.min(leftRect.top, rightRect.top) - pad && y <= Math.max(leftRect.bottom, rightRect.bottom) + pad) {
            if (x >= leftRect.left - pad && x <= leftRect.right + 6) {
              leftActive = true;
            } else if (x >= rightRect.left - 6 && x <= rightRect.right + pad) {
              rightActive = true;
            }
          }
        }
        setDpadState(leftActive, rightActive);
      };

      dpad.addEventListener('touchstart', updateDpadFromTouches, { passive: false });
      dpad.addEventListener('touchmove', updateDpadFromTouches, { passive: false });
      dpad.addEventListener('touchend', updateDpadFromTouches, { passive: false });
      dpad.addEventListener('touchcancel', () => setDpadState(false, false), { passive: false });

      // Soporte de mouse para pruebas en PC
      btnLeft.addEventListener('mousedown', (e) => { e.preventDefault(); setDpadState(true, false); });
      btnRight.addEventListener('mousedown', (e) => { e.preventDefault(); setDpadState(false, true); });
      ['mouseup', 'mouseleave'].forEach(ev => {
        btnLeft.addEventListener(ev, () => { if (keys.left) setDpadState(false, keys.right); });
        btnRight.addEventListener(ev, () => { if (keys.right) setDpadState(keys.left, false); });
      });
    })();

    bindTouchButton('btnJump', 'jump');
    bindTouchButton('btnShoot', 'shoot');

    /**************************************************************
     * 7. MODALES: REGISTRO DE PUNTAJE, CUPÓN Y PANEL ADMIN
     **************************************************************/
    const registerModal = document.getElementById('registerModal');
    const adminModal = document.getElementById('adminModal');

    function openEndModal(isVictory) {
      document.getElementById('modalTitle').textContent = isVictory
        ? '🏆 ¡Completaste MALVINAS ARCADE!'
        : '🍨 ¡Fin de la Partida!';
      document.getElementById('finalScoreText').textContent = score + ' pts';

      const couponBox = document.getElementById('couponBox');
      const couponBadge = document.getElementById('couponBadge');
      const couponDesc = document.getElementById('couponDescText');

      const msgCfg = (typeof CONFIG_MENSAJE_FIN_PARTIDA !== 'undefined') ? CONFIG_MENSAJE_FIN_PARTIDA : {
        titulo: '🏆 ¡CARGÁ TUS PUNTOS SEMANALES!',
        descripcion: 'Podés cargar tus puntos de la semana para participar y ganar increíbles premios solo por jugar.'
      };
      if (couponBadge) couponBadge.textContent = msgCfg.titulo;
      if (couponDesc) couponDesc.textContent = msgCfg.descripcion;
      if (couponBox) couponBox.classList.add('visible');

      const nameInput = document.getElementById('playerName');
      const contactInput = document.getElementById('playerContact');
      if (nameInput) nameInput.value = '';
      if (contactInput) contactInput.value = '';

      registerModal.classList.add('active');

      setTimeout(() => {
        if (nameInput) {
          nameInput.focus();
        }
      }, 60);
    }

    function restartFullGame() {
      if (registerModal) registerModal.classList.remove('active');
      ensureFullscreen();
      startOfficialGame(1);
    }

    document.getElementById('closeRegisterBtn').addEventListener('click', restartFullGame);

    const btnEndHome = document.getElementById('btnEndHome');
    if (btnEndHome) {
      btnEndHome.addEventListener('click', () => {
        if (registerModal) registerModal.classList.remove('active');
        showArcadeScreen('title');
      });
    }

    document.getElementById('manualRegisterBtn').addEventListener('click', () => {
      gameState = 'GAMEOVER';
      openEndModal(false);
    });

    document.getElementById('scoreForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('playerName').value.trim();
      const contact = document.getElementById('playerContact').value.trim();
      if (name && contact) {
        saveScoreToRanking(name, contact, score);
        document.getElementById('playerName').value = '';
        document.getElementById('playerContact').value = '';
        restartFullGame();
      }
    });

    // PANEL DE ADMINISTRADOR / DUEÑO
    document.getElementById('openAdminBtn').addEventListener('click', () => {
      renderRanking();
      adminModal.classList.add('active');
    });
    document.getElementById('closeAdminBtn').addEventListener('click', () => {
      adminModal.classList.remove('active');
    });

    // Exportar Clientes a Excel (CSV)
    document.getElementById('exportCsvBtn').addEventListener('click', () => {
      const list = getRanking();
      let csv = 'Posicion,Nombre,WhatsApp_o_Instagram,Puntaje,Estado\n';
      list.forEach((item, idx) => {
        csv += `${idx + 1},"${item.name.replace(/"/g, '""')}","${item.contact.replace(/"/g, '""')}",${item.score},Verificado\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'clientes_sorteo_heladeria_malvinas.csv';
      a.click();
      URL.revokeObjectURL(url);
    });

    // Reiniciar Ranking para nuevo sorteo
    document.getElementById('resetRankingBtn').addEventListener('click', () => {
      if (confirm('¿Reiniciar la tabla de posiciones para comenzar un nuevo sorteo semanal?')) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RANKING));
        renderRanking();
      }
    });

            /**************************************************************
     * 8. SISTEMA DE PANTALLAS ARCADE, PANTALLA COMPLETA & MODALES
     **************************************************************/
    const arcadeTitleScreen = document.getElementById('arcadeTitleScreen');
    const arcadeLoadingScreen = document.getElementById('arcadeLoadingScreen');
    const arcadeGameScreen = document.getElementById('arcadeGameScreen');
    const rankingModal = document.getElementById('rankingModal');
    const configModal = document.getElementById('configModal');
    const pauseModal = document.getElementById('pauseModal');

    let loadingTimerId = null;
    let loadingIntervalId = null;
    let intentionalFsToggle = false;

    function pauseGame() {
      if (!arcadeGameScreen || arcadeGameScreen.style.display === 'none') return;
      if (typeof gameState === 'undefined' || gameState !== 'PLAYING') return;
      if (document.querySelector('.modal-overlay.active')) return;

      gameState = 'PAUSED';
      if (typeof keys !== 'undefined') {
        keys.left = false;
        keys.right = false;
        keys.jump = false;
        keys.shoot = false;
      }
      if (typeof BGM !== 'undefined' && BGM.stop) BGM.stop();
      if (soundEnabled && typeof SFX !== 'undefined' && SFX.blip) SFX.blip();
      if (pauseModal) pauseModal.classList.add('active');
    }

    function resumeGame() {
      if (typeof gameState === 'undefined' || gameState !== 'PAUSED') return;
      if (pauseModal) pauseModal.classList.remove('active');
      if (typeof lastFrameTime !== 'undefined') lastFrameTime = 0;
      if (typeof frameAccumulator !== 'undefined') frameAccumulator = 0;
      gameState = 'PLAYING';
      if (soundEnabled && typeof SFX !== 'undefined' && SFX.blip) SFX.blip();
      if (soundEnabled && typeof BGM !== 'undefined' && BGM.start) BGM.start();
    }

    // Cambiar entre Pantalla de Inicio (Title Screen), Carga y Juego
    function showArcadeScreen(view) {
      if (view === 'game') {
        if (arcadeTitleScreen) arcadeTitleScreen.style.display = 'none';
        if (arcadeLoadingScreen) arcadeLoadingScreen.style.display = 'none';
        if (arcadeGameScreen) arcadeGameScreen.style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (view === 'loading') {
        if (arcadeTitleScreen) arcadeTitleScreen.style.display = 'none';
        if (arcadeGameScreen) arcadeGameScreen.style.display = 'none';
        if (arcadeLoadingScreen) arcadeLoadingScreen.style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        if (loadingTimerId) { clearTimeout(loadingTimerId); loadingTimerId = null; }
        if (loadingIntervalId) { clearInterval(loadingIntervalId); loadingIntervalId = null; }
        if (pauseModal) pauseModal.classList.remove('active');
        if (arcadeTitleScreen) arcadeTitleScreen.style.display = 'block';
        if (arcadeGameScreen) arcadeGameScreen.style.display = 'none';
        if (arcadeLoadingScreen) arcadeLoadingScreen.style.display = 'none';
        BGM.stop();
        renderRanking();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          if (typeof updateMenuSelection === 'function') {
            updateMenuSelection(currentTitleMenuIdx, false);
          }
        }, 60);
      }
    }

    // PANTALLA COMPLETA NATIVA (FULLSCREEN API)
    function toggleFullscreen() {
      intentionalFsToggle = true;
      setTimeout(() => { intentionalFsToggle = false; }, 450);
      const target = document.documentElement || document.getElementById('arcadeStage');
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const req = target.requestFullscreen || target.webkitRequestFullscreen || target.mozRequestFullScreen || target.msRequestFullscreen;
        if (req) {
          req.call(target).catch(() => {
            const stage = document.getElementById('arcadeStage');
            if (stage && stage.requestFullscreen) stage.requestFullscreen().catch(() => {});
          });
        }
      } else {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exit) {
          exit.call(document).catch(() => {});
        }
      }
    }

    // Activar Pantalla Completa automáticamente para todos los niveles
    async function ensureFullscreen() {
      try {
        const target = document.documentElement || document.getElementById('arcadeStage');
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          const req = target.requestFullscreen || target.webkitRequestFullscreen || target.mozRequestFullScreen || target.msRequestFullscreen;
          if (req) {
            await req.call(target).catch(() => {
              const stage = document.getElementById('arcadeStage');
              if (stage && stage.requestFullscreen) return stage.requestFullscreen().catch(() => {});
            });
          }
        }
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape').catch(() => {});
        }
      } catch (e) {}
    }
    window.ensureFullscreen = ensureFullscreen;

    function updateFsButtons() {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      const label = isFs ? '🗗 Salir Pantalla Completa' : '⛶ Pantalla Completa';
      const btns = [
        document.getElementById('quickFsBtn'),
        document.getElementById('btnGameFs'),
        document.getElementById('cfgFsToggle')
      ];
      btns.forEach(b => {
        if (b) b.textContent = label;
      });
    }

    function handleFullscreenChange() {
      updateFsButtons();
      // En navegadores, presionar ESC en pantalla completa sale del fullscreen sin disparar keydown:
      // pausamos automáticamente para que ESC siempre pause al primer toque.
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isFs && !intentionalFsToggle && typeof gameState !== 'undefined' && gameState === 'PLAYING') {
        pauseGame();
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    // Conectar botones de Pantalla Completa
    ['quickFsBtn', 'btnGameFs', 'cfgFsToggle'].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.addEventListener('click', toggleFullscreen);
    });

    // Asegurar resolución pura 16:9 sin distorsión
    try {
      localStorage.removeItem('malvinas_arcade_stretch');
      if (arcadeGameScreen) arcadeGameScreen.classList.remove('mode-full-width');
    } catch(e) {}

    const LEVEL_DATA = {
      1: { title: 'NIVEL 1', subtitle: 'DIQUE LOS SAUCES & COSTANERA' },
      2: { title: 'NIVEL 2', subtitle: 'PARQUE DE LA CIUDAD & SUPERDOMO' },
      3: { title: 'NIVEL 3', subtitle: 'MICROCENTRO & JEFE TRAMONTANA' }
    };

    // Iniciar Juego Oficial con Pantalla de Carga Retro y Poses de Analía (Aplica Pantalla Completa)
    function startOfficialGame(levelNum = 1, keepState = false) {
      ensureFullscreen();
      if (loadingTimerId) { clearTimeout(loadingTimerId); loadingTimerId = null; }
      if (loadingIntervalId) { clearInterval(loadingIntervalId); loadingIntervalId = null; }

      currentLevel = levelNum;
      if (!keepState) {
        score = (levelNum - 1) * 600;
        conesCollected = 0;
        lives = 3;
      }
      player.superMode = false;
      gameState = 'LOADING';
      buildLevel(levelNum);

      // Mostrar pantalla de carga retro arcade
      showArcadeScreen('loading');

      const lvlInfo = LEVEL_DATA[levelNum] || { title: `NIVEL ${levelNum}`, subtitle: 'AVENTURA ARTESANAL' };
      const loadingLevelTitle = document.getElementById('loadingLevelTitle');
      const loadingLevelSubtitle = document.getElementById('loadingLevelSubtitle');
      const loadingAnaliaImg = document.getElementById('loadingAnaliaImg');
      const loadingBarFill = document.getElementById('loadingBarFill');
      if (loadingLevelTitle) loadingLevelTitle.textContent = lvlInfo.title;
      if (loadingLevelSubtitle) loadingLevelSubtitle.textContent = lvlInfo.subtitle;

      // Sonido de inicio retro
      if (soundEnabled) SFX.powerup();

      // Poses de Analía durante la carga
      const poses = [
        'sprites/analia_quieto.png',
        'sprites/analia_correr_1.png',
        'sprites/analia_correr_2.png',
        'sprites/analia_salto.png',
        'sprites/analia_disparo.png',
        'sprites/analia_victoria.png',
        'sprites/analia_correr_1.png',
        'sprites/analia_victoria.png'
      ];

      let poseIdx = 0;
      const stepMs = 630; // ~5.04 segundos (2 segundos más que antes)
      const totalSteps = poses.length;
      const totalDuration = totalSteps * stepMs; // ~5.04s

      const applyPose = (idx) => {
        const spriteSrc = poses[idx % poses.length];
        if (loadingAnaliaImg) {
          loadingAnaliaImg.src = spriteSrc;
          loadingAnaliaImg.classList.remove('pulse-swap');
          void loadingAnaliaImg.offsetWidth;
          loadingAnaliaImg.classList.add('pulse-swap');
        }

        const progressPercent = Math.min(100, Math.round(((idx + 1) / totalSteps) * 100));
        if (loadingBarFill) loadingBarFill.style.width = progressPercent + '%';

        if (soundEnabled && idx > 0 && idx < totalSteps - 1) {
          playTone(340 + idx * 45, 'triangle', 0.05, 0.04);
        }
      };

      // Iniciar primera pose
      applyPose(0);

      loadingIntervalId = setInterval(() => {
        poseIdx++;
        if (poseIdx < totalSteps) {
          applyPose(poseIdx);
        }
      }, stepMs);

      // Concluir la carga tras ~5 segundos e ingresar a la partida
      loadingTimerId = setTimeout(() => {
        if (loadingIntervalId) { clearInterval(loadingIntervalId); loadingIntervalId = null; }
        loadingTimerId = null;

        if (loadingBarFill) loadingBarFill.style.width = '100%';
        setTimeout(() => {
          showArcadeScreen('game');
          gameState = 'PLAYING';
          if (soundEnabled) { SFX.cone(); BGM.start(); }
        }, 160);
      }, totalDuration);
    }
    window.startOfficialGame = startOfficialGame;

    // BOTONES EN EL FONDO PIXEL ART (HITBOXES)
    const btnTitlePlay = document.getElementById('btnTitlePlay');
    if (btnTitlePlay) {
      btnTitlePlay.addEventListener('click', () => {
        attemptLockLandscape();
        startOfficialGame(1);
      });
    }

    const btnTitleOptions = document.getElementById('btnTitleOptions');
    if (btnTitleOptions) {
      btnTitleOptions.addEventListener('click', () => {
        if (soundEnabled) SFX.blip();
        if (configModal) configModal.classList.add('active');
      });
    }

    const btnTitleExit = document.getElementById('btnTitleExit');
    if (btnTitleExit) {
      btnTitleExit.addEventListener('click', () => {
        if (soundEnabled) SFX.blip();
        renderRanking();
        if (rankingModal) rankingModal.classList.add('active');
      });
    }

    // BOTONES RÁPIDOS SUPERIORES EN TITLE SCREEN
    const quickRankingBtn = document.getElementById('quickRankingBtn');
    if (quickRankingBtn) {
      quickRankingBtn.addEventListener('click', () => {
        if (soundEnabled) SFX.blip();
        renderRanking();
        if (rankingModal) rankingModal.classList.add('active');
      });
    }

    const quickSoundBtn = document.getElementById('quickSoundBtn');
    function updateSoundUi() {
      const text = soundEnabled ? '🔊 Sonido: ON' : '🔇 Sonido: OFF';
      if (quickSoundBtn) quickSoundBtn.textContent = text;
      const cfgBtn = document.getElementById('cfgSoundToggle');
      if (cfgBtn) cfgBtn.textContent = soundEnabled ? 'Sonido: ON' : 'Sonido: OFF';
      if (!soundEnabled) {
        BGM.stop();
      } else if (gameState === 'PLAYING') {
        BGM.start();
      }
    }

    if (quickSoundBtn) {
      quickSoundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        updateSoundUi();
        if (soundEnabled) SFX.cone();
      });
    }
    const cfgSoundToggle = document.getElementById('cfgSoundToggle');
    if (cfgSoundToggle) {
      cfgSoundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        updateSoundUi();
        if (soundEnabled) SFX.cone();
      });
    }

    // Botones del juego para pausar, volver o configurar
    const btnGamePause = document.getElementById('btnGamePause');
    if (btnGamePause) {
      btnGamePause.addEventListener('click', () => {
        if (gameState === 'PAUSED') resumeGame();
        else pauseGame();
      });
    }

    const btnResumeGame = document.getElementById('btnResumeGame');
    if (btnResumeGame) {
      btnResumeGame.addEventListener('click', resumeGame);
    }

    const btnPauseRestart = document.getElementById('btnPauseRestart');
    if (btnPauseRestart) {
      btnPauseRestart.addEventListener('click', () => {
        if (pauseModal) pauseModal.classList.remove('active');
        startOfficialGame(currentLevel);
      });
    }

    const btnPauseHome = document.getElementById('btnPauseHome');
    if (btnPauseHome) {
      btnPauseHome.addEventListener('click', () => {
        if (pauseModal) pauseModal.classList.remove('active');
        gameState = 'TITLE';
        showArcadeScreen('title');
      });
    }

    const btnGameHome = document.getElementById('btnGameHome');
    if (btnGameHome) {
      btnGameHome.addEventListener('click', () => showArcadeScreen('title'));
    }

    const btnGameConfig = document.getElementById('btnGameConfig');
    if (btnGameConfig) {
      btnGameConfig.addEventListener('click', () => {
        if (configModal) configModal.classList.add('active');
      });
    }

    // ==============================================================
    // SISTEMA DE NAVEGACIÓN RETRO POR TECLADO EN PANTALLA DE INICIO
    // ==============================================================
    const titleMenuCursor = document.getElementById('titleMenuCursor');
    const titleNavTicker = document.getElementById('titleNavTicker');
    let currentTitleMenuIdx = 0;

    const titleMenuItems = [
      {
        id: 'btnTitlePlay',
        name: 'JUGAR',
        ticker: '🍦 ▶ JUGAR — ¡Iniciá la aventura de Analía y Malvi para salvar la heladería!',
        action: () => {
          attemptLockLandscape();
          startOfficialGame(1);
        }
      },
      {
        id: 'btnTitleOptions',
        name: 'OPCIONES',
        ticker: '⚙️ ▶ OPCIONES — Configurá sonido retro, pantalla completa y elegí los Niveles 1, 2 o 3',
        action: () => {
          if (soundEnabled && typeof SFX !== 'undefined' && SFX.blip) SFX.blip();
          if (configModal) configModal.classList.add('active');
        }
      },
      {
        id: 'btnTitleExit',
        name: 'SALÓN DE LA FAMA',
        ticker: '🏆 ▶ SALÓN DE LA FAMA — Mirá el Top 10 semanal y cargá tus puntos para ganar increíbles premios',
        action: () => {
          if (soundEnabled && typeof SFX !== 'undefined' && SFX.blip) SFX.blip();
          renderRanking();
          if (rankingModal) rankingModal.classList.add('active');
        }
      },
      {
        id: 'quickQrBtn',
        name: 'CARTEL MESAS',
        ticker: '📲 ▶ CARTEL MESAS — Mirá e imprimí el código QR del juego para las mesas',
        action: () => {
          if (soundEnabled && typeof SFX !== 'undefined' && SFX.blip) SFX.blip();
          const qModal = document.getElementById('qrModal');
          if (qModal) qModal.classList.add('active');
        }
      },
      {
        id: 'quickRankingBtn',
        name: 'RÉCORDS TOP 10',
        ticker: '🏆 ▶ RÉCORDS TOP 10 — Ranking semanal: cargá tus puntos y ganá increíbles premios por jugar',
        action: () => {
          if (soundEnabled && typeof SFX !== 'undefined' && SFX.blip) SFX.blip();
          renderRanking();
          if (rankingModal) rankingModal.classList.add('active');
        }
      },
      {
        id: 'quickFsBtn',
        name: 'PANTALLA COMPLETA',
        ticker: '⛶ ▶ PANTALLA COMPLETA — Alternar modo pantalla completa panorámica inmersiva',
        action: () => {
          if (soundEnabled && typeof SFX !== 'undefined' && SFX.blip) SFX.blip();
          toggleFullscreen();
        }
      },
      {
        id: 'quickSoundBtn',
        name: 'SONIDO ON / OFF',
        ticker: '🔊 ▶ SONIDO — Activar o silenciar música retro chiptune y efectos de sonido',
        action: () => {
          soundEnabled = !soundEnabled;
          updateSoundUi();
          if (soundEnabled && typeof SFX !== 'undefined' && SFX.cone) SFX.cone();
        }
      }
    ];

    function updateMenuSelection(idx, playSound = false) {
      if (!arcadeTitleScreen || arcadeTitleScreen.style.display === 'none') return;
      currentTitleMenuIdx = (idx + titleMenuItems.length) % titleMenuItems.length;
      const item = titleMenuItems[currentTitleMenuIdx];
      if (!item) return;

      // Quitar clase seleccionada a todos los botones
      titleMenuItems.forEach(m => {
        const el = document.getElementById(m.id);
        if (el) el.classList.remove('menu-selected');
      });

      const activeEl = document.getElementById(item.id);
      if (activeEl) {
        activeEl.classList.add('menu-selected');

        // Posicionar el cursor retro alineado con el botón seleccionado
        if (titleMenuCursor) {
          titleMenuCursor.style.display = 'flex';
          const rect = activeEl.getBoundingClientRect();
          const parentRect = arcadeTitleScreen.getBoundingClientRect();

          const isTopBar = currentTitleMenuIdx >= 3;
          const offsetX = isTopBar ? 38 : 52;
          const left = Math.max(8, rect.left - parentRect.left - offsetX);
          const top = rect.top - parentRect.top + (rect.height / 2) - 18;

          titleMenuCursor.style.transform = `translate3d(${left}px, ${top}px, 0)`;
        }
      }

      // Actualizar texto explicativo inferior en tiempo real
      if (titleNavTicker && item.ticker) {
        titleNavTicker.textContent = item.ticker;
      }

      // Efecto de sonido retro al cambiar de opción
      if (playSound && soundEnabled && typeof SFX !== 'undefined' && SFX.cursor) {
        SFX.cursor();
      }
    }

    // Sincronizar hover del mouse para que mueva el cursor automáticamente
    titleMenuItems.forEach((item, i) => {
      const el = document.getElementById(item.id);
      if (el) {
        el.addEventListener('mouseenter', () => updateMenuSelection(i, false));
      }
    });

    // Reajustar posición del cursor cuando la ventana cambia de tamaño o entra a pantalla completa
    window.addEventListener('resize', () => {
      if (arcadeTitleScreen && arcadeTitleScreen.style.display !== 'none') {
        updateMenuSelection(currentTitleMenuIdx, false);
      }
    });

    // Navegación fluida por teclado para el Modal de Fin de Partida / Registro
    function handleRegisterModalKeys(e) {
      const nameInput = document.getElementById('playerName');
      const contactInput = document.getElementById('playerContact');
      const btnRestart = document.getElementById('closeRegisterBtn');
      const btnSave = document.getElementById('btnSaveScore');
      const btnHome = document.getElementById('btnEndHome');

      const isInput = (document.activeElement && document.activeElement.tagName === 'INPUT');
      const activeEl = document.activeElement;

      // ESCAPE -> Reiniciar partida rápido
      if (e.key === 'Escape' || e.code === 'Escape') {
        e.preventDefault();
        restartFullGame();
        return;
      }

      // FLECHA ABAJO / S (solo cuando no escribe en input de texto)
      if (e.key === 'ArrowDown' || (!isInput && e.code === 'KeyS')) {
        e.preventDefault();
        if (activeEl === nameInput) {
          if (contactInput) contactInput.focus();
        } else if (activeEl === contactInput) {
          if (btnRestart) btnRestart.focus();
        } else if ([btnRestart, btnSave, btnHome].includes(activeEl)) {
          if (nameInput) nameInput.focus();
        } else {
          if (nameInput) nameInput.focus();
        }
        if (soundEnabled && typeof SFX !== 'undefined' && SFX.cursor) SFX.cursor();
        return;
      }

      // FLECHA ARRIBA / W (solo cuando no escribe en input de texto)
      if (e.key === 'ArrowUp' || (!isInput && e.code === 'KeyW')) {
        e.preventDefault();
        if (activeEl === nameInput) {
          if (btnRestart) btnRestart.focus();
        } else if (activeEl === contactInput) {
          if (nameInput) nameInput.focus();
        } else if ([btnRestart, btnSave, btnHome].includes(activeEl)) {
          if (contactInput) contactInput.focus();
        } else {
          if (contactInput) contactInput.focus();
        }
        if (soundEnabled && typeof SFX !== 'undefined' && SFX.cursor) SFX.cursor();
        return;
      }

      // FLECHA DERECHA / D (solo cuando no está en input, cambia entre botones)
      if (!isInput && (e.key === 'ArrowRight' || e.code === 'KeyD')) {
        e.preventDefault();
        if (activeEl === btnRestart) {
          if (btnSave) btnSave.focus();
        } else if (activeEl === btnSave) {
          if (btnHome) btnHome.focus();
        } else if (activeEl === btnHome) {
          if (btnRestart) btnRestart.focus();
        } else {
          if (btnRestart) btnRestart.focus();
        }
        if (soundEnabled && typeof SFX !== 'undefined' && SFX.cursor) SFX.cursor();
        return;
      }

      // FLECHA IZQUIERDA / A (solo cuando no está en input, cambia entre botones)
      if (!isInput && (e.key === 'ArrowLeft' || e.code === 'KeyA')) {
        e.preventDefault();
        if (activeEl === btnRestart) {
          if (btnHome) btnHome.focus();
        } else if (activeEl === btnSave) {
          if (btnRestart) btnRestart.focus();
        } else if (activeEl === btnHome) {
          if (btnSave) btnSave.focus();
        } else {
          if (btnRestart) btnRestart.focus();
        }
        if (soundEnabled && typeof SFX !== 'undefined' && SFX.cursor) SFX.cursor();
        return;
      }

      // ENTER
      if (e.key === 'Enter' || e.code === 'Enter') {
        if (activeEl === nameInput) {
          e.preventDefault();
          if (contactInput) contactInput.focus();
          if (soundEnabled && typeof SFX !== 'undefined' && SFX.select) SFX.select();
          return;
        }
        if (activeEl === contactInput) {
          e.preventDefault();
          const nameVal = nameInput ? nameInput.value.trim() : '';
          const contactVal = contactInput ? contactInput.value.trim() : '';
          if (nameVal && contactVal) {
            if (btnSave) btnSave.click();
          } else if (!nameVal && nameInput) {
            nameInput.focus();
          } else if (btnSave) {
            btnSave.focus();
          }
          if (soundEnabled && typeof SFX !== 'undefined' && SFX.select) SFX.select();
          return;
        }
        if (activeEl === btnRestart) {
          e.preventDefault();
          restartFullGame();
          return;
        }
        if (activeEl === btnHome) {
          e.preventDefault();
          if (registerModal) registerModal.classList.remove('active');
          showArcadeScreen('title');
          return;
        }
        if (activeEl === btnSave) {
          return;
        }
        e.preventDefault();
        if (btnRestart) btnRestart.click();
        return;
      }
    }

    // Control por Teclado: Flechas, WASD, Enter, Espacio y Escape
    window.addEventListener('keydown', (e) => {
      // 1. Si hay un modal abierto
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) {
        if (activeModal.id === 'pauseModal') {
          if (e.key === 'Escape' || e.code === 'Escape' || e.code === 'KeyP' || e.key === 'Enter' || e.code === 'Enter') {
            e.preventDefault();
            resumeGame();
          }
          return;
        }
        if (activeModal.id === 'registerModal') {
          handleRegisterModalKeys(e);
          return;
        }

        if (e.key === 'Escape' || e.code === 'Escape') {
          e.preventDefault();
          activeModal.classList.remove('active');
          if (soundEnabled && typeof SFX !== 'undefined' && SFX.blip) SFX.blip();
          updateMenuSelection(currentTitleMenuIdx, false);
          return;
        }
        if ((e.key === 'Enter' || e.code === 'Enter') && document.activeElement && document.activeElement.tagName !== 'INPUT') {
          const closeBtn = activeModal.querySelector('#closeRankingBtn, #closeConfigBtn, #btnCloseQrModal, #closeAdminBtn, #closeRegisterBtn');
          if (closeBtn) {
            e.preventDefault();
            closeBtn.click();
            return;
          }
        }
        return; // No procesar navegación del menú si hay un modal abierto
      }

      // 1.5 Si estamos jugando, ESC o P pausa la partida
      if (arcadeGameScreen && arcadeGameScreen.style.display !== 'none' && typeof gameState !== 'undefined' && gameState === 'PLAYING') {
        if (e.key === 'Escape' || e.code === 'Escape' || e.code === 'KeyP') {
          e.preventDefault();
          pauseGame();
          return;
        }
      }

      // 2. Si estamos en la pantalla de inicio (arcadeTitleScreen)
      if (arcadeTitleScreen && arcadeTitleScreen.style.display !== 'none') {
        // Flecha ABAJO / S
        if (e.key === 'ArrowDown' || e.code === 'KeyS') {
          e.preventDefault();
          if (currentTitleMenuIdx === 0) updateMenuSelection(1, true);
          else if (currentTitleMenuIdx === 1) updateMenuSelection(2, true);
          else if (currentTitleMenuIdx === 2) updateMenuSelection(3, true);
          else if (currentTitleMenuIdx >= 3) updateMenuSelection(0, true);
          return;
        }

        // Flecha ARRIBA / W
        if (e.key === 'ArrowUp' || e.code === 'KeyW') {
          e.preventDefault();
          if (currentTitleMenuIdx === 0) updateMenuSelection(3, true);
          else if (currentTitleMenuIdx === 1) updateMenuSelection(0, true);
          else if (currentTitleMenuIdx === 2) updateMenuSelection(1, true);
          else if (currentTitleMenuIdx >= 3) updateMenuSelection(2, true);
          return;
        }

        // Flecha DERECHA / D (salta a los botones rápidos superiores)
        if (e.key === 'ArrowRight' || e.code === 'KeyD') {
          e.preventDefault();
          if (currentTitleMenuIdx < 3) {
            updateMenuSelection(3, true); // Salta a Cartel Mesas
          } else {
            const nextIdx = currentTitleMenuIdx < 6 ? currentTitleMenuIdx + 1 : 3;
            updateMenuSelection(nextIdx, true);
          }
          return;
        }

        // Flecha IZQUIERDA / A (vuelve a la columna principal izquierda)
        if (e.key === 'ArrowLeft' || e.code === 'KeyA') {
          e.preventDefault();
          if (currentTitleMenuIdx >= 3) {
            if (currentTitleMenuIdx === 3) updateMenuSelection(0, true);
            else updateMenuSelection(currentTitleMenuIdx - 1, true);
          } else {
            updateMenuSelection(0, true);
          }
          return;
        }

        // ENTER o BARRA ESPACIADORA (seleccionar / ver / entrar)
        if (e.key === 'Enter' || e.code === 'Enter' || e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          const item = titleMenuItems[currentTitleMenuIdx];
          if (item) {
            if (soundEnabled && typeof SFX !== 'undefined' && SFX.select) {
              SFX.select();
            }
            item.action();
          }
          return;
        }
      }
    });

    // CERRAR MODALES
    const closeRankingBtn = document.getElementById('closeRankingBtn');
    if (closeRankingBtn) {
      closeRankingBtn.addEventListener('click', () => {
        if (rankingModal) rankingModal.classList.remove('active');
      });
    }

    const closeConfigBtn = document.getElementById('closeConfigBtn');
    if (closeConfigBtn) {
      closeConfigBtn.addEventListener('click', () => {
        if (configModal) configModal.classList.remove('active');
      });
    }

    // SELECTOR DE NIVEL EN MODAL (APLICA PANTALLA COMPLETA A TODOS LOS NIVELES)
    document.querySelectorAll('.btnPlayLevel').forEach(btn => {
      btn.addEventListener('click', () => {
        const lvl = parseInt(btn.getAttribute('data-level'), 10) || 1;
        if (configModal) configModal.classList.remove('active');
        ensureFullscreen();
        startOfficialGame(lvl);
      });
    });

    // PANEL ADMIN
    const openAdminBtn = document.getElementById('openAdminBtn');
    if (openAdminBtn) {
      openAdminBtn.addEventListener('click', () => {
        if (rankingModal) rankingModal.classList.remove('active');
        renderRanking();
        if (adminModal) adminModal.classList.add('active');
      });
    }

    // CERRAR MODALES AL HACER CLIC AFUERA
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          if (modal.id === 'pauseModal') {
            resumeGame();
          } else {
            modal.classList.remove('active');
          }
        }
      });
    });

    /**************************************************************
     * 9. GESTIÓN DE ORIENTACIÓN HORIZONTAL Y NOTIFICACIÓN MOBILE
     **************************************************************/
    const orientationOverlay = document.getElementById('orientationNoticeOverlay');
    const btnLockLandscape = document.getElementById('btnLockLandscape');
    const btnDismissOrientation = document.getElementById('btnDismissOrientation');
    const experienceToast = document.getElementById('arcadeExperienceToast');
    const btnCloseToast = document.getElementById('btnCloseToast');
    let toastTimeout = null;

    function showExperienceToast(msg, duration = 4800) {
      if (!experienceToast) return;
      if (toastTimeout) clearTimeout(toastTimeout);
      if (msg) {
        const textEl = experienceToast.querySelector('.toast-text');
        if (textEl) textEl.innerHTML = msg;
      }
      experienceToast.classList.add('show');
      toastTimeout = setTimeout(() => {
        experienceToast.classList.remove('show');
      }, duration);
    }

    if (btnCloseToast) {
      btnCloseToast.addEventListener('click', () => {
        if (experienceToast) experienceToast.classList.remove('show');
      });
    }

    async function attemptLockLandscape() {
      await ensureFullscreen();
    }

    if (btnLockLandscape) {
      btnLockLandscape.addEventListener('click', async () => {
        await attemptLockLandscape();
        document.body.classList.add('ignore-orientation');
        if (orientationOverlay) orientationOverlay.style.display = 'none';
        showExperienceToast('🎮 ¡Modo horizontal activado! Disfrutá de la mejor experiencia.', 4000);
      });
    }

    if (btnDismissOrientation) {
      btnDismissOrientation.addEventListener('click', () => {
        document.body.classList.add('ignore-orientation');
        if (orientationOverlay) orientationOverlay.style.display = 'none';
        showExperienceToast('💡 Recordá: En horizontal tenés una mejor experiencia de juego.', 4500);
      });
    }

    function checkDeviceOrientation() {
      const isPortrait = window.matchMedia('(orientation: portrait)').matches || (window.innerHeight > window.innerWidth);
      const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1024);

      if (isMobile && isPortrait && !document.body.classList.contains('ignore-orientation')) {
        if (orientationOverlay) orientationOverlay.style.display = 'flex';
      } else {
        if (orientationOverlay) orientationOverlay.style.display = 'none';
      }
    }

    window.addEventListener('resize', checkDeviceOrientation);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkDeviceOrientation, 250);
    });

    // Auto-notificación en móvil al cargar o girar a horizontal
    const isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1024);
    if (isMobileDevice) {
      setTimeout(() => {
        const isPortrait = window.matchMedia('(orientation: portrait)').matches || (window.innerHeight > window.innerWidth);
        if (!isPortrait) {
          showExperienceToast('📱 Para una mejor experiencia de juego, jugá en <strong>modo horizontal</strong>.', 5000);
        }
      }, 1400);
    }

    
    // ============================================================
    // RECOMENDACIÓN 2: CONTROLADOR DEL CARTEL QR IMPRIMIBLE
    // ============================================================
    const qrModal = document.getElementById('qrModal');
    const quickQrBtn = document.getElementById('quickQrBtn');
    const adminQrBtn = document.getElementById('adminQrBtn');
    const btnCloseQrModal = document.getElementById('btnCloseQrModal');
    const btnPrintQrFlyer = document.getElementById('btnPrintQrFlyer');

    function openQrModal() {
      if (qrModal) qrModal.classList.add('active');
    }

    if (quickQrBtn) quickQrBtn.addEventListener('click', openQrModal);
    if (adminQrBtn) adminQrBtn.addEventListener('click', openQrModal);
    if (btnCloseQrModal) {
      btnCloseQrModal.addEventListener('click', () => {
        if (qrModal) qrModal.classList.remove('active');
      });
    }
    if (btnPrintQrFlyer) {
      btnPrintQrFlyer.addEventListener('click', () => {
        window.print();
      });
    }

    // INICIAR EN LA PANTALLA DE INICIO ARCADE PIXEL ART
    checkDeviceOrientation();
    renderRanking();
    buildLevel(1);
    showArcadeScreen('title');
    if (typeof updateMenuSelection === 'function') updateMenuSelection(0, false);
    gameLoop();