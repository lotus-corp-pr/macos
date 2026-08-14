/********** PADEL 3D GAME (Three.js) **********/
/*
 * A 3D padel game rendered with Three.js. Two paddles, a ball bouncing
 * off the back walls and paddles. First to 7 points wins.
 *
 * Modes:
 *   - 1 player: you control the left paddle (W/S), the right is an AI.
 *   - 2 players: left = W/S, right = ArrowUp/ArrowDown.
 *
 * Keyboard handlers are only attached to the game canvas host so they do
 * not interfere with the rest of the desktop while the game is closed.
 */
(function () {
  "use strict";

  let scene, camera, renderer, animId = null;
  let ball, paddle1, paddle2, net;
  let score1 = 0, score2 = 0;
  let running = false;
  let initialized = false;
  let disposed = false;
  let dom = null;

  // Physics state
  const FIELD = { w: 20, d: 40, wallH: 6 };
  const PADDLE = { w: 4, h: 3, d: 0.5 };
  const ballVel = { x: 0, y: 0, z: 0 };
  const SPEED = 0.35;
  let serving = true;

  // 1 player vs AI by default; toggle via the mode button.
  let twoPlayers = false;
  const AI_SPEED = SPEED * 1.3;
  const keys = {};
  const player1Y = { v: 0 };
  const player2Y = { v: 0 };

  function buildDomRefs() {
    const root = document.querySelector(".padel3d");
    dom = {
      root: root,
      canvasHost: root.querySelector(".padel3d__canvas"),
      score1El: root.querySelector(".padel3d__score1"),
      score2El: root.querySelector(".padel3d__score2"),
      msgEl: root.querySelector(".padel3d__msg"),
      restartBtn: root.querySelector(".padel3d__restart"),
      modeBtn: root.querySelector(".padel3d__mode"),
    };
  }

  function initScene() {
    if (scene) return; // already built
    const w = dom.canvasHost.clientWidth || 340;
    const h = dom.canvasHost.clientHeight || 300;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d2b3d);
    scene.fog = new THREE.Fog(0x0d2b3d, 40, 90);

    camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
    camera.position.set(0, 18, 28);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    dom.canvasHost.appendChild(renderer.domElement);

    setTimeout(onResize, 50);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 20, 10);
    scene.add(dir);

    // Court floor
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(FIELD.w, 0.4, FIELD.d),
      new THREE.MeshStandardMaterial({ color: 0x2d6a4f })
    );
    floor.position.y = -0.2;
    scene.add(floor);

    // Center line
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const centerLine = new THREE.Mesh(new THREE.BoxGeometry(FIELD.w, 0.02, 0.15), lineMat);
    centerLine.position.set(0, 0.01, 0);
    scene.add(centerLine);

    // Glass walls (shared material)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xaee1f9, transparent: true, opacity: 0.25,
    });
    const wallGeo = new THREE.BoxGeometry(0.3, FIELD.wallH, FIELD.d);
    const wallL = new THREE.Mesh(wallGeo, wallMat);
    wallL.position.set(-FIELD.w / 2, FIELD.wallH / 2, 0);
    scene.add(wallL);
    const wallR = new THREE.Mesh(wallGeo, wallMat);
    wallR.position.set(FIELD.w / 2, FIELD.wallH / 2, 0);
    scene.add(wallR);

    const backGeo = new THREE.BoxGeometry(FIELD.w, FIELD.wallH, 0.3);
    const backN = new THREE.Mesh(backGeo, wallMat);
    backN.position.set(0, FIELD.wallH / 2, -FIELD.d / 2);
    scene.add(backN);
    const backS = new THREE.Mesh(backGeo, wallMat);
    backS.position.set(0, FIELD.wallH / 2, FIELD.d / 2);
    scene.add(backS);

    // Net
    net = new THREE.Mesh(
      new THREE.BoxGeometry(FIELD.w, 1.2, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })
    );
    net.position.set(0, 0.6, 0);
    scene.add(net);

    // Paddles
    paddle1 = new THREE.Mesh(
      new THREE.BoxGeometry(PADDLE.w, PADDLE.h, PADDLE.d),
      new THREE.MeshStandardMaterial({ color: 0xff4757 })
    );
    paddle1.position.set(-FIELD.w / 2 + 1.5, PADDLE.h / 2, 0);
    scene.add(paddle1);
    paddle2 = new THREE.Mesh(
      new THREE.BoxGeometry(PADDLE.w, PADDLE.h, PADDLE.d),
      new THREE.MeshStandardMaterial({ color: 0x1e90ff })
    );
    paddle2.position.set(FIELD.w / 2 - 1.5, PADDLE.h / 2, 0);
    scene.add(paddle2);

    // Ball
    ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xfff95b })
    );
    ball.position.set(0, 1.2, 0);
    scene.add(ball);

    resetBall(Math.random() < 0.5 ? 1 : -1);
  }

  function resetBall(direction) {
    ball.position.set(0, 1.2, 0);
    serving = true;
    ballVel.x = (Math.random() - 0.5) * 0.15;
    ballVel.y = 0;
    ballVel.z = direction * SPEED;
  }

  function moveAI() {
    // The AI tracks the ball along Z, with a slight reaction lag.
    const target = ball.position.z;
    const diff = target - paddle2.position.z;
    const step = Math.sign(diff) * Math.min(Math.abs(diff), AI_SPEED);
    paddle2.position.z += step;
    const limit = FIELD.d / 2 - PADDLE.h / 2 - 1;
    paddle2.position.z = Math.max(-limit, Math.min(limit, paddle2.position.z));
  }

  function update() {
    if (!running) return;

    // Player 1 movement (W/S)
    if (keys["w"] || keys["W"]) player1Y.v = -SPEED * 1.6;
    else if (keys["s"] || keys["S"]) player1Y.v = SPEED * 1.6;
    else player1Y.v *= 0.8;

    paddle1.position.z += player1Y.v;
    const limit = FIELD.d / 2 - PADDLE.h / 2 - 1;
    paddle1.position.z = Math.max(-limit, Math.min(limit, paddle1.position.z));

    // Player 2 movement (arrows) in two-player mode; otherwise AI.
    if (twoPlayers) {
      if (keys["ArrowUp"]) player2Y.v = -SPEED * 1.6;
      else if (keys["ArrowDown"]) player2Y.v = SPEED * 1.6;
      else player2Y.v *= 0.8;
      paddle2.position.z += player2Y.v;
      paddle2.position.z = Math.max(-limit, Math.min(limit, paddle2.position.z));
    } else {
      moveAI();
    }

    // Move ball
    ball.position.x += ballVel.x;
    ball.position.z += ballVel.z;
    serving = false;

    // Side walls bounce
    const halfW = FIELD.w / 2 - 0.3;
    if (ball.position.x > halfW) { ball.position.x = halfW; ballVel.x *= -1; }
    if (ball.position.x < -halfW) { ball.position.x = -halfW; ballVel.x *= -1; }

    // Paddle collision (left paddle)
    if (
      ball.position.x <= paddle1.position.x + PADDLE.w / 2 + 0.4 &&
      ball.position.x > paddle1.position.x &&
      Math.abs(ball.position.z - paddle1.position.z) < PADDLE.h / 2 + 0.3 &&
      ballVel.x < 0
    ) {
      ballVel.x = Math.abs(ballVel.x) + 0.02;
      const offset = (ball.position.z - paddle1.position.z) / (PADDLE.h / 2);
      ballVel.z = offset * SPEED * 1.2;
    }
    // Paddle collision (right paddle)
    if (
      ball.position.x >= paddle2.position.x - PADDLE.w / 2 - 0.4 &&
      ball.position.x < paddle2.position.x &&
      Math.abs(ball.position.z - paddle2.position.z) < PADDLE.h / 2 + 0.3 &&
      ballVel.x > 0
    ) {
      ballVel.x = -Math.abs(ballVel.x) - 0.02;
      const offset = (ball.position.z - paddle2.position.z) / (PADDLE.h / 2);
      ballVel.z = offset * SPEED * 1.2;
    }

    // Scoring: ball passes a paddle on the X axis
    if (ball.position.x < paddle1.position.x - PADDLE.w) {
      score2++;
      updateScore();
      checkWin();
      if (running) resetBall(1);
    } else if (ball.position.x > paddle2.position.x + PADDLE.w) {
      score1++;
      updateScore();
      checkWin();
      if (running) resetBall(-1);
    }

    renderer.render(scene, camera);
  }

  function updateScore() {
    dom.score1El.textContent = score1;
    dom.score2El.textContent = score2;
  }

  function checkWin() {
    const WIN = 7;
    if (score1 >= WIN) {
      running = false;
      dom.msgEl.textContent = twoPlayers ? "\u00a1Jugador Rojo gana!" : "\u00a1Ganaste!";
      dom.msgEl.style.display = "block";
    } else if (score2 >= WIN) {
      running = false;
      dom.msgEl.textContent = twoPlayers ? "\u00a1Jugador Azul gana!" : "\u00a1Gana la m\u00e1quina!";
      dom.msgEl.style.display = "block";
    }
  }

  function animate() {
    animId = requestAnimationFrame(animate);
    update();
  }

  function start() {
    initScene();
    if (!running) {
      running = true;
      if (animId) cancelAnimationFrame(animId);
      animate();
    }
  }

  function reset() {
    score1 = 0;
    score2 = 0;
    updateScore();
    dom.msgEl.style.display = "none";
    resetBall(Math.random() < 0.5 ? 1 : -1);
    running = true;
    if (!animId) animate();
  }

  function onResize() {
    if (!renderer || !dom) return;
    const w = dom.canvasHost.clientWidth || 360;
    const h = dom.canvasHost.clientHeight || 380;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  // Keyboard listeners are scoped to the canvas host so they only react
  // while the game window has focus, instead of the whole document.
  function handleKey(e, isDown) {
    const k = e.key;
    if (["w", "W", "s", "S", "ArrowUp", "ArrowDown"].includes(k)) {
      keys[k] = isDown;
      e.preventDefault();
    }
  }

  function toggleMode() {
    twoPlayers = !twoPlayers;
    if (dom.modeBtn) {
      dom.modeBtn.textContent = twoPlayers ? "2 Jugadores" : "1 Jugador";
    }
    reset();
  }

  function init() {
    buildDomRefs();
    if (typeof THREE === "undefined") {
      dom.msgEl.textContent = "Error: Three.js no se pudo cargar. Revisa tu conexi\u00f3n.";
      dom.msgEl.style.display = "block";
      return;
    }
    if (!initialized) {
      initialized = true;
      dom.canvasHost.tabIndex = 0;
      dom.canvasHost.addEventListener("keydown", (e) => handleKey(e, true));
      dom.canvasHost.addEventListener("keyup", (e) => handleKey(e, false));
      window.addEventListener("resize", onResize);
      if (dom.restartBtn) dom.restartBtn.addEventListener("click", reset);
      if (dom.modeBtn) {
        dom.modeBtn.textContent = "1 Jugador";
        dom.modeBtn.addEventListener("click", toggleMode);
      }
    }
    disposed = false;
    // Make sure no stale animation loop is running before we (re)start.
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    running = false;
    start();
    updateScore();
    setTimeout(onResize, 60);
    // Give the canvas focus so keyboard controls work immediately.
    setTimeout(() => dom.canvasHost.focus(), 80);
  }

  // Expose dispose so the desktop can stop the loop when the window closes
  // (avoids rendering a hidden canvas and wasting battery).
  function dispose() {
    running = false;
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    disposed = true;
  }

  window.Padel3D = { init: init, dispose: dispose };
})();
