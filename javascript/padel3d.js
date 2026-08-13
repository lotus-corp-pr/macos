/********** PADEL 3D GAME (Three.js) **********/
/*
 * A 3D padel game rendered with Three.js. Two players control paddles,
 * a ball bounces off the back walls and paddles. First to 7 points wins.
 * Controls:
 *   Player 1 (left): W = up, S = down
 *   Player 2 (right): ArrowUp / ArrowDown
 */
(function () {
  "use strict";

  let scene, camera, renderer, animId = null;
  let ball, paddle1, paddle2, net;
  let score1 = 0, score2 = 0;
  let running = false;
  let initialized = false;
  let dom = null;

  // Physics state
  const FIELD = { w: 20, d: 40, wallH: 6 };
  const PADDLE = { w: 4, h: 3, d: 0.5 };
  const ballVel = { x: 0, y: 0, z: 0 };
  const SPEED = 0.35;
  let serving = true;

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
    };
  }

  function initScene() {
    if (scene) return; // already built
    // Use real dimensions; fall back to sensible defaults if still hidden.
    const w = dom.canvasHost.clientWidth || 340;
    const h = dom.canvasHost.clientHeight || 300;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d2b3d);

    camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
    camera.position.set(0, 18, 28);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    dom.canvasHost.appendChild(renderer.domElement);

    // Re-fit to the real container size once the layout settles.
    setTimeout(onResize, 50);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 20, 10);
    scene.add(dir);

    // Court floor
    const floorGeo = new THREE.BoxGeometry(FIELD.w, 0.4, FIELD.d);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.2;
    scene.add(floor);

    // Line markings (simple white stripes along the court)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const centerLineGeo = new THREE.BoxGeometry(FIELD.w, 0.02, 0.15);
    const centerLine = new THREE.Mesh(centerLineGeo, lineMat);
    centerLine.position.set(0, 0.01, 0);
    scene.add(centerLine);

    // Glass side walls
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

    // Back walls (where points are scored)
    const backGeo = new THREE.BoxGeometry(FIELD.w, FIELD.wallH, 0.3);
    const backN = new THREE.Mesh(backGeo, wallMat);
    backN.position.set(0, FIELD.wallH / 2, -FIELD.d / 2);
    scene.add(backN);
    const backS = new THREE.Mesh(backGeo, wallMat);
    backS.position.set(0, FIELD.wallH / 2, FIELD.d / 2);
    scene.add(backS);

    // Net in the middle
    const netGeo = new THREE.BoxGeometry(FIELD.w, 1.2, 0.1);
    const netMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
    net = new THREE.Mesh(netGeo, netMat);
    net.position.set(0, 0.6, 0);
    scene.add(net);

    // Paddles
    const paddleGeo = new THREE.BoxGeometry(PADDLE.w, PADDLE.h, PADDLE.d);
    const paddleMat1 = new THREE.MeshStandardMaterial({ color: 0xff4757 });
    const paddleMat2 = new THREE.MeshStandardMaterial({ color: 0x1e90ff });
    paddle1 = new THREE.Mesh(paddleGeo, paddleMat1);
    paddle1.position.set(-FIELD.w / 2 + 1.5, PADDLE.h / 2, 0);
    scene.add(paddle1);
    paddle2 = new THREE.Mesh(paddleGeo, paddleMat2);
    paddle2.position.set(FIELD.w / 2 - 1.5, PADDLE.h / 2, 0);
    scene.add(paddle2);

    // Ball
    const ballGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xfff95b });
    ball = new THREE.Mesh(ballGeo, ballMat);
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

  function update() {
    if (!running) return;

    // Player 1 movement (W/S)
    if (keys["w"] || keys["W"]) player1Y.v = -SPEED * 1.6;
    else if (keys["s"] || keys["S"]) player1Y.v = SPEED * 1.6;
    else player1Y.v *= 0.8;

    // Player 2 movement (arrows)
    if (keys["ArrowUp"]) player2Y.v = -SPEED * 1.6;
    else if (keys["ArrowDown"]) player2Y.v = SPEED * 1.6;
    else player2Y.v *= 0.8;

    paddle1.position.z += player1Y.v;
    paddle2.position.z += player2Y.v;

    // Clamp paddles within the court depth
    const limit = FIELD.d / 2 - PADDLE.h / 2 - 1;
    paddle1.position.z = Math.max(-limit, Math.min(limit, paddle1.position.z));
    paddle2.position.z = Math.max(-limit, Math.min(limit, paddle2.position.z));

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
      // Steer the ball based on where it hit the paddle
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
      dom.msgEl.textContent = "¡Jugador Rojo gana!";
      dom.msgEl.style.display = "block";
    } else if (score2 >= WIN) {
      running = false;
      dom.msgEl.textContent = "¡Jugador Azul gana!";
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

  function handleKey(e, isDown) {
    const k = e.key;
    if (["w", "W", "s", "S", "ArrowUp", "ArrowDown"].includes(k)) {
      keys[k] = isDown;
      e.preventDefault();
    }
  }

  function init() {
    buildDomRefs();
    if (!initialized) {
      initialized = true;
      window.addEventListener("keydown", (e) => handleKey(e, true));
      window.addEventListener("keyup", (e) => handleKey(e, false));
      window.addEventListener("resize", onResize);
      if (dom.restartBtn) {
        dom.restartBtn.addEventListener("click", reset);
      }
    }
    // Check that Three.js is available before starting.
    if (typeof THREE === "undefined") {
      dom.msgEl.textContent = "Error: Three.js no se pudo cargar. Revisa tu conexión.";
      dom.msgEl.style.display = "block";
      return;
    }
    // Always (re)start the scene when the window is opened, so the canvas
    // picks up the real dimensions after becoming visible.
    start();
    updateScore();
    // Force a resize shortly after to catch the final layout.
    setTimeout(onResize, 60);
  }

  window.Padel3D = { init: init };
})();
