/********** BLOCK BLAST GAME **********/
/*
 * Block Blast puzzle game: an 8x8 grid where the player drags block shapes
 * onto the board. Filling a full row or column clears it and scores points.
 * The game ends when none of the three available pieces can be placed.
 */
(function () {
  "use strict";

  const GRID_SIZE = 8;
  const CELL_PX = 38; // size of a board cell in px (kept in sync with CSS)

  // Color palette for the block pieces.
  const COLORS = ["#ff5f56", "#ffbd2e", "#27c93f", "#2d9cf5", "#b061ff", "#ff61c3"];

  // Shapes are defined as arrays of [row, col] offsets.
  const SHAPES = [
    // single
    [[0, 0]],
    // 2-blocks
    [[0, 0], [0, 1]],
    [[0, 0], [1, 0]],
    // 3-line
    [[0, 0], [0, 1], [0, 2]],
    [[0, 0], [1, 0], [2, 0]],
    // 4-line
    [[0, 0], [0, 1], [0, 2], [0, 3]],
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    // 5-line
    [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
    [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
    // 2x2 square
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    // 3x3 square
    [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
    // L-shapes (4 rotations)
    [[0, 0], [1, 0], [1, 1], [1, 2]],
    [[0, 0], [0, 1], [1, 0], [2, 0]],
    [[0, 0], [0, 1], [0, 2], [1, 2]],
    [[0, 2], [1, 0], [1, 1], [1, 2]],
    [[0, 0], [1, 0], [2, 0], [2, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 0]],
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    // T-shapes
    [[0, 0], [0, 1], [0, 2], [1, 1]],
    [[0, 1], [1, 0], [1, 1], [2, 1]],
    [[0, 1], [1, 0], [1, 1], [1, 2]],
    [[0, 0], [1, 0], [1, 1], [2, 0]],
    // S/Z shapes
    [[0, 1], [0, 2], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[0, 1], [1, 0], [1, 1], [2, 0]],
  ];

  let board = [];        // 2D array of color strings (or null)
  let pieces = [];       // current 3 available pieces
  let score = 0;
  let bestScore = 0;
  let dragState = null;   // active drag info
  let gameOverShown = false;

  // DOM references (resolved lazily once the window exists in the DOM)
  let dom = null;

  function buildDomRefs() {
    const root = document.querySelector(".blockblast");
    dom = {
      root: root,
      boardEl: root.querySelector(".bb__board"),
      trayEl: root.querySelector(".bb__tray"),
      scoreEl: root.querySelector(".bb__score-value"),
      bestEl: root.querySelector(".bb__best-value"),
      overEl: root.querySelector(".bb__gameover"),
      overScoreEl: root.querySelector(".bb__gameover-score"),
      restartBtn: root.querySelector(".bb__restart"),
      clearHintEl: root.querySelector(".bb__clearhint"),
    };
  }

  function emptyBoard() {
    const b = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      b.push(new Array(GRID_SIZE).fill(null));
    }
    return b;
  }

  function makePiece() {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return { shape, color, placed: false, el: null };
  }

  function refillPieces() {
    pieces = [makePiece(), makePiece(), makePiece()];
    renderTray();
    if (!hasAnyMove()) {
      showGameOver();
    }
  }

  // Returns true if a piece can be placed at (row, col).
  function canPlace(piece, row, col) {
    for (const [dr, dc] of piece.shape) {
      const r = row + dr;
      const c = col + dc;
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
      if (board[r][c] !== null) return false;
    }
    return true;
  }

  // Returns true if at least one of the unplaced pieces has a valid move.
  function hasAnyMove() {
    for (const piece of pieces) {
      if (piece.placed) continue;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (canPlace(piece, r, c)) return true;
        }
      }
    }
    return false;
  }

  function placePiece(piece, row, col) {
    let cleared = 0;
    for (const [dr, dc] of piece.shape) {
      board[row + dr][col + dc] = piece.color;
      cleared++;
    }
    piece.placed = true;
    score += cleared * 2;

    // Detect full rows and columns to clear.
    const fullRows = [];
    const fullCols = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      if (board[r].every((cell) => cell !== null)) fullRows.push(r);
    }
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board.every((row) => row[c] !== null)) fullCols.push(c);
    }

    const totalLines = fullRows.length + fullCols.length;
    if (totalLines > 0) {
      // Bonus grows with the number of lines cleared at once.
      const bonus = totalLines * 10 + (totalLines >= 2 ? (totalLines - 1) * 15 : 0);
      score += bonus;
    }

    // Render the board with the piece placed (and lines flagged for flash).
    renderBoard();
    if (totalLines > 0) {
      flashClear(fullRows, fullCols);
      // Remove cleared cells after the flash animation, then re-render.
      setTimeout(() => {
        for (const r of fullRows) {
          for (let c = 0; c < GRID_SIZE; c++) board[r][c] = null;
        }
        for (const c of fullCols) {
          for (let r = 0; r < GRID_SIZE; r++) board[r][c] = null;
        }
        renderBoard();
      }, 280);
    }

    updateScore();
    renderTray();

    // Refill when all three pieces have been used.
    if (pieces.every((p) => p.placed)) {
      setTimeout(refillPieces, 300);
    } else if (!hasAnyMove()) {
      setTimeout(showGameOver, 350);
    }
  }

  function flashClear(rows, cols) {
    const cells = dom.boardEl.querySelectorAll(".bb__cell");
    const toFlash = new Set();
    for (const r of rows) {
      for (let c = 0; c < GRID_SIZE; c++) toFlash.add(r * GRID_SIZE + c);
    }
    for (const c of cols) {
      for (let r = 0; r < GRID_SIZE; r++) toFlash.add(r * GRID_SIZE + c);
    }
    toFlash.forEach((idx) => {
      const cell = cells[idx];
      if (cell) {
        cell.classList.add("bb__cell--clear");
      }
    });
  }

  function updateScore() {
    if (score > bestScore) {
      bestScore = score;
      try {
        localStorage.setItem("bb_best_score", String(bestScore));
      } catch (e) {
        /* localStorage may be unavailable; ignore */
      }
    }
    dom.scoreEl.textContent = score;
    dom.bestEl.textContent = bestScore;
  }

  function loadBestScore() {
    try {
      const stored = localStorage.getItem("bb_best_score");
      bestScore = stored ? parseInt(stored, 10) || 0 : 0;
    } catch (e) {
      bestScore = 0;
    }
  }

  function showGameOver() {
    if (gameOverShown) return;
    gameOverShown = true;
    dom.overScoreEl.textContent = score;
    dom.overEl.style.display = "flex";
  }

  function hideGameOver() {
    gameOverShown = false;
    dom.overEl.style.display = "none";
  }

  function newGame() {
    board = emptyBoard();
    score = 0;
    gameOverShown = false;
    hideGameOver();
    updateScore();
    renderBoard();
    refillPieces();
  }

  /* ---------- Rendering ---------- */

  function renderBoard() {
    dom.boardEl.innerHTML = "";
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = document.createElement("div");
        cell.className = "bb__cell";
        cell.dataset.row = r;
        cell.dataset.col = c;
        if (board[r][c]) {
          cell.style.background = board[r][c];
          cell.classList.add("bb__cell--filled");
        }
        dom.boardEl.appendChild(cell);
      }
    }
  }

  function renderTray() {
    dom.trayEl.innerHTML = "";
    pieces.forEach((piece, idx) => {
      const slot = document.createElement("div");
      slot.className = "bb__piece-slot";
      slot.dataset.pieceIndex = idx;
      if (piece.placed) {
        slot.classList.add("bb__piece-slot--empty");
      } else {
        slot.appendChild(buildPieceEl(piece));
      }
      dom.trayEl.appendChild(slot);
    });
  }

  // Build the visual representation of a piece, centered in its slot.
  function buildPieceEl(piece) {
    const wrap = document.createElement("div");
    wrap.className = "bb__piece";
    wrap.dataset.pieceIndex = pieces.indexOf(piece);

    const shape = piece.shape;
    const maxRow = Math.max(...shape.map((s) => s[0]));
    const maxCol = Math.max(...shape.map((s) => s[1]));
    const rows = maxRow + 1;
    const cols = maxCol + 1;

    const grid = document.createElement("div");
    grid.className = "bb__piece-grid";
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement("div");
        cell.className = "bb__piece-cell";
        const isFilled = shape.some((s) => s[0] === r && s[1] === c);
        if (isFilled) {
          cell.style.background = piece.color;
          cell.classList.add("bb__piece-cell--filled");
        }
        grid.appendChild(cell);
      }
    }
    wrap.appendChild(grid);

    attachPieceDrag(wrap, piece);
    return wrap;
  }

  /* ---------- Drag and drop ---------- */

  function attachPieceDrag(el, piece) {
    el.addEventListener("pointerdown", (e) => {
      if (piece.placed) return;
      e.preventDefault();
      startDrag(piece, el, e);
    });
  }

  function startDrag(piece, el, e) {
    // Build a floating ghost that follows the pointer.
    const ghost = el.cloneNode(true);
    ghost.classList.add("bb__piece--ghost");
    ghost.style.position = "fixed";
    ghost.style.pointerEvents = "none";
    ghost.style.zIndex = "10000";
    document.body.appendChild(ghost);

    // Compute piece footprint so the anchor sits at the top-left block.
    const rect = el.getBoundingClientRect();
    const filledCells = el.querySelectorAll(".bb__piece-cell--filled");
    const firstCellRect = filledCells[0].getBoundingClientRect();
    const cellPx = firstCellRect.width;

    const anchorOffsetX = firstCellRect.left - rect.left;
    const anchorOffsetY = firstCellRect.top - rect.top;

    dragState = {
      piece,
      ghost,
      cellPx,
      anchorOffsetX,
      anchorOffsetY,
    };

    moveGhost(e.clientX, e.clientY);
    el.classList.add("bb__piece--dragging");

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
  }

  function moveGhost(x, y) {
    if (!dragState) return;
    // Position ghost so its anchor block sits under the pointer.
    dragState.ghost.style.left = x - dragState.anchorOffsetX - 4 + "px";
    dragState.ghost.style.top = y - dragState.anchorOffsetY - 4 + "px";
  }

  function onPointerMove(e) {
    if (!dragState) return;
    moveGhost(e.clientX, e.clientY);

    const target = computeDropTarget(e.clientX, e.clientY);
    clearPreview();
    if (target) {
      previewPlacement(dragState.piece, target.row, target.col, true);
    } else {
      // Show invalid preview when over the board but off-grid.
      const overBoard = pointOverBoard(e.clientX, e.clientY);
      if (overBoard) {
        previewPlacement(dragState.piece, overBoard.row, overBoard.col, false);
      }
    }
  }

  function pointOverBoard(x, y) {
    const boardRect = dom.boardEl.getBoundingClientRect();
    if (
      x < boardRect.left ||
      x > boardRect.right ||
      y < boardRect.top ||
      y > boardRect.bottom
    ) {
      return null;
    }
    const col = Math.floor((x - boardRect.left) / boardRect.width * GRID_SIZE);
    const row = Math.floor((y - boardRect.top) / boardRect.height * GRID_SIZE);
    return { row, col };
  }

  // Snap the pointer to a board cell anchor and validate placement.
  function computeDropTarget(x, y) {
    const boardRect = dom.boardEl.getBoundingClientRect();
    const cellW = boardRect.width / GRID_SIZE;
    const cellH = boardRect.height / GRID_SIZE;

    // Pointer maps to an anchor cell (top-left block of the piece).
    const col = Math.round((x - boardRect.left) / cellW);
    const row = Math.round((y - boardRect.top) / cellH);

    if (col < 0 || col >= GRID_SIZE || row < 0 || row >= GRID_SIZE) return null;
    return { row, col };
  }

  function previewPlacement(piece, row, col, valid) {
    const cells = dom.boardEl.querySelectorAll(".bb__cell");
    for (const [dr, dc] of piece.shape) {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        const cell = cells[r * GRID_SIZE + c];
        if (cell && board[r][c] === null) {
          cell.classList.add(valid ? "bb__cell--preview" : "bb__cell--preview-bad");
        }
      }
    }
  }

  function clearPreview() {
    const cells = dom.boardEl.querySelectorAll(".bb__cell");
    cells.forEach((cell) => {
      cell.classList.remove("bb__cell--preview", "bb__cell--preview-bad");
    });
  }

  function onPointerUp(e) {
    if (!dragState) return;

    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerUp);

    const target = computeDropTarget(e.clientX, e.clientY);
    clearPreview();

    if (target && canPlace(dragState.piece, target.row, target.col)) {
      placePiece(dragState.piece, target.row, target.col);
    } else {
      // Return the piece to the tray.
      const slots = dom.trayEl.querySelectorAll(".bb__piece--dragging");
      slots.forEach((s) => s.classList.remove("bb__piece--dragging"));
    }

    if (dragState.ghost && dragState.ghost.parentNode) {
      dragState.ghost.remove();
    }
    dragState = null;
  }

  /* ---------- Init ---------- */

  let initialized = false;

  // Expose init so the host app can start the game when the window opens.
  // Idempotent: a new game starts only on the first open; later opens resume.
  function init() {
    buildDomRefs();
    loadBestScore();
    if (!initialized) {
      newGame();
      initialized = true;
      if (dom.restartBtn) {
        dom.restartBtn.addEventListener("click", newGame);
      }
    } else {
      updateScore();
    }
  }

  window.BlockBlast = { init };
})();
