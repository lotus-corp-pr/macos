/********** BLOCK BLAST GAME **********/
/*
 * Block Blast puzzle game: an 8x8 grid where the player drags block shapes
 * onto the board. Filling a full row or column clears it and scores points.
 * The game ends when none of the three available pieces can be placed.
 *
 * Best score is persisted per-device via localStorage.
 */
(function () {
  "use strict";

  const GRID_SIZE = 8;
  const STORAGE_KEY = "blockblast_best_score";

  // Block Blast-style vibrant solid colors with a paired "darker" shade
  // used for the bottom bevel to give blocks a 3D look.
  const COLORS = [
    { main: "#ff4757", dark: "#c0392b" }, // red
    { main: "#ffa502", dark: "#cc7a00" }, // orange
    { main: "#2ed573", dark: "#1e824c" }, // green
    { main: "#1e90ff", dark: "#1565c0" }, // blue
    { main: "#a55eea", dark: "#7d3c98" }, // purple
    { main: "#ff6b9d", dark: "#c2185b" }, // pink
    { main: "#00d2d3", dark: "#00838f" }, // teal
    { main: "#feca57", dark: "#cc9b00" }, // yellow
  ];

  // Shapes are defined as arrays of [row, col] offsets.
  const SHAPES = [
    [[0, 0]],
    [[0, 0], [0, 1]],
    [[0, 0], [1, 0]],
    [[0, 0], [0, 1], [0, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 0], [0, 1], [0, 2], [0, 3]],
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
    [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [1, 1], [1, 2]],
    [[0, 0], [0, 1], [1, 0], [2, 0]],
    [[0, 0], [0, 1], [0, 2], [1, 2]],
    [[0, 2], [1, 0], [1, 1], [1, 2]],
    [[0, 0], [1, 0], [2, 0], [2, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 0]],
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 1]],
    [[0, 1], [1, 0], [1, 1], [2, 1]],
    [[0, 1], [1, 0], [1, 1], [1, 2]],
    [[0, 0], [1, 0], [1, 1], [2, 0]],
    [[0, 1], [0, 2], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[0, 1], [1, 0], [1, 1], [2, 0]],
  ];

  let board = [];
  let pieces = [];
  let score = 0;
  let bestScore = 0;
  let dragState = null;
  let gameOverShown = false;
  let initialized = false;
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
    };
  }

  function emptyBoard() {
    const b = [];
    for (let r = 0; r < GRID_SIZE; r++) b.push(new Array(GRID_SIZE).fill(null));
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
    if (!hasAnyMove()) showGameOver();
  }

  function canPlace(piece, row, col) {
    for (const [dr, dc] of piece.shape) {
      const r = row + dr;
      const c = col + dc;
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
      if (board[r][c] !== null) return false;
    }
    return true;
  }

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
    let placedCells = 0;
    for (const [dr, dc] of piece.shape) {
      board[row + dr][col + dc] = piece.color;
      placedCells++;
    }
    piece.placed = true;
    score += placedCells;

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
      // Bonus grows sharply with the number of simultaneous clears.
      const bonus = totalLines * 10 + (totalLines - 1) * 15;
      score += bonus;
    }

    renderBoard();
    if (totalLines > 0) {
      flashClear(fullRows, fullCols);
      setTimeout(() => {
        for (const r of fullRows) {
          for (let c = 0; c < GRID_SIZE; c++) board[r][c] = null;
        }
        for (const c of fullCols) {
          for (let r = 0; r < GRID_SIZE; r++) board[r][c] = null;
        }
        renderBoard();
        afterPlace();
      }, 300);
    } else {
      afterPlace();
    }
  }

  function afterPlace() {
    updateScore();
    renderTray();
    if (pieces.every((p) => p.placed)) {
      setTimeout(refillPieces, 280);
    } else if (!hasAnyMove()) {
      setTimeout(showGameOver, 280);
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
      if (cell) cell.classList.add("bb__cell--clear");
    });
  }

  function updateScore() {
    if (score > bestScore) {
      bestScore = score;
      try {
        localStorage.setItem(STORAGE_KEY, String(bestScore));
      } catch (e) {
        /* localStorage unavailable; best score stays for the session */
      }
    }
    dom.scoreEl.textContent = score;
    dom.bestEl.textContent = bestScore;
  }

  function loadBestScore() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      bestScore = stored ? parseInt(stored, 10) || 0 : 0;
    } catch (e) {
      bestScore = 0;
    }
  }

  function showGameOver() {
    if (gameOverShown) return;
    gameOverShown = true;
    dom.overScoreEl.textContent = score;
    dom.overEl.classList.add("bb__gameover--show");
  }

  function hideGameOver() {
    gameOverShown = false;
    dom.overEl.classList.remove("bb__gameover--show");
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
        const v = board[r][c];
        if (v) {
          cell.style.background = v.main;
          cell.style.borderBottom = "3px solid " + v.dark;
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
    grid.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
    grid.style.gridTemplateRows = "repeat(" + rows + ", 1fr)";

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement("div");
        cell.className = "bb__piece-cell";
        const isFilled = shape.some((s) => s[0] === r && s[1] === c);
        if (isFilled) {
          cell.style.background = piece.color.main;
          cell.style.borderBottom = "3px solid " + piece.color.dark;
          cell.classList.add("bb__piece-cell--filled");
        }
        grid.appendChild(cell);
      }
    }
    wrap.appendChild(grid);
    attachPieceDrag(wrap, piece);
    return wrap;
  }

  /* ---------- Drag and drop (mouse + touch) ---------- */

  function attachPieceDrag(el, piece) {
    el.addEventListener("pointerdown", function (e) {
      if (piece.placed) return;
      e.preventDefault();
      startDrag(piece, el, e);
    });
  }

  // Build a ghost element whose cells are exactly the same size as a board
  // cell, so the ghost's geometry matches the drop target geometry 1:1.
  function buildGhost(piece, boardCellPx) {
    const shape = piece.shape;
    const maxRow = Math.max(...shape.map((s) => s[0]));
    const maxCol = Math.max(...shape.map((s) => s[1]));
    const rows = maxRow + 1;
    const cols = maxCol + 1;

    const grid = document.createElement("div");
    grid.className = "bb__piece-grid bb__piece--ghost";
    grid.style.position = "fixed";
    grid.style.left = "0px";
    grid.style.top = "0px";
    grid.style.pointerEvents = "none";
    grid.style.zIndex = "10000";
    grid.style.margin = "0";
    grid.style.gridTemplateColumns = "repeat(" + cols + ", " + boardCellPx + "px)";
    grid.style.gridTemplateRows = "repeat(" + rows + ", " + boardCellPx + "px)";
    grid.style.gap = "0";

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement("div");
        cell.className = "bb__piece-cell";
        const isFilled = shape.some((s) => s[0] === r && s[1] === c);
        if (isFilled) {
          cell.style.background = piece.color.main;
          cell.style.borderBottom = "3px solid " + piece.color.dark;
          cell.style.borderRadius = "6px";
          cell.style.boxShadow =
            "inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 0 rgba(0,0,0,0.15)";
        }
        grid.appendChild(cell);
      }
    }
    return grid;
  }

  function startDrag(piece, el, e) {
    const boardRect = dom.boardEl.getBoundingClientRect();
    const boardCellPx = boardRect.width / GRID_SIZE;

    const ghost = buildGhost(piece, boardCellPx);
    document.body.appendChild(ghost);

    // The ghost's top-left represents the [0,0] offset of the shape.
    // We anchor it so the shape's first filled cell sits under the pointer,
    // but offset slightly upward so the finger doesn't cover the piece.
    const filledCells = el.querySelectorAll(".bb__piece-cell--filled");
    const firstCellRect = filledCells[0].getBoundingClientRect();

    // Where within the source first cell did the user grab?
    const grabOffsetX = e.clientX - firstCellRect.left;
    const grabOffsetY = e.clientY - firstCellRect.top;

    // Lift the piece above the finger by ~1.5 cells so it's visible.
    const lift = boardCellPx * 1.5;

    dragState = {
      piece: piece,
      ghost: ghost,
      boardCellPx: boardCellPx,
      grabOffsetX: grabOffsetX,
      grabOffsetY: grabOffsetY,
      lift: lift,
    };

    moveGhost(e.clientX, e.clientY);
    el.classList.add("bb__piece--dragging");

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
  }

  function moveGhost(x, y) {
    if (!dragState) return;
    // The ghost's top-left (its shape [0,0]) should be positioned so that
    // the grabbed cell stays under the pointer, then lifted above the finger.
    const left = x - dragState.grabOffsetX;
    const top = y - dragState.grabOffsetY - dragState.lift;
    dragState.ghost.style.left = left + "px";
    dragState.ghost.style.top = top + "px";
  }

  // Returns the board cell [row, col] that the ghost's [0,0] block maps to.
  // Re-reads the board rect on every call so the target stays correct even
  // if the window was dragged to a new position since the drag started.
  function computeDropTarget(x, y) {
    // The ghost's [0,0] top-left position (same formula as moveGhost).
    const ghostLeft = x - dragState.grabOffsetX;
    const ghostTop = y - dragState.grabOffsetY - dragState.lift;

    const boardRect = dom.boardEl.getBoundingClientRect();
    const cellW = dragState.boardCellPx;

    const col = Math.round((ghostLeft - boardRect.left) / cellW);
    const row = Math.round((ghostTop - boardRect.top) / cellW);

    if (col < 0 || col >= GRID_SIZE || row < 0 || row >= GRID_SIZE) return null;
    return { row: row, col: col };
  }

  function previewPlacement(piece, row, col, valid) {
    const cells = dom.boardEl.querySelectorAll(".bb__cell");
    for (const [dr, dc] of piece.shape) {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        const cell = cells[r * GRID_SIZE + c];
        if (cell && board[r][c] === null) {
          if (valid) {
            cell.classList.add("bb__cell--preview");
            cell.style.background = piece.color.main;
          } else {
            cell.classList.add("bb__cell--preview-bad");
          }
        }
      }
    }
  }

  function clearPreview() {
    const cells = dom.boardEl.querySelectorAll(".bb__cell");
    cells.forEach((cell) => {
      cell.classList.remove("bb__cell--preview", "bb__cell--preview-bad");
      const r = parseInt(cell.dataset.row, 10);
      const c = parseInt(cell.dataset.col, 10);
      cell.style.background = board[r][c] ? board[r][c].main : "";
    });
  }

  function onPointerMove(e) {
    if (!dragState) return;
    // preventDefault stops touch scrolling while dragging.
    e.preventDefault();
    moveGhost(e.clientX, e.clientY);

    clearPreview();
    const target = computeDropTarget(e.clientX, e.clientY);
    if (target && canPlace(dragState.piece, target.row, target.col)) {
      previewPlacement(dragState.piece, target.row, target.col, true);
    } else if (target) {
      previewPlacement(dragState.piece, target.row, target.col, false);
    }
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
      const dragging = dom.trayEl.querySelectorAll(".bb__piece--dragging");
      dragging.forEach((s) => s.classList.remove("bb__piece--dragging"));
    }

    if (dragState.ghost && dragState.ghost.parentNode) {
      dragState.ghost.remove();
    }
    dragState = null;
  }

  /* ---------- Init ---------- */

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

  window.BlockBlast = { init: init };
})();
