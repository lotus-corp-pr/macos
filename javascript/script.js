/********** MAC OS DESKTOP - CORE SCRIPT **********/
/*
 * Desktop shell logic: navbar, dock, launchpad, window management,
 * spotlight, clock, battery, terminal, calculator and notes.
 *
 * Windows are made draggable via Pointer Events (no jQuery UI), which
 * keeps the dependency surface small and works on touch devices.
 */
(function () {
  "use strict";

  /********** ELEMENTS **********/
  const elements = {
    body: document.querySelector("body"),
    navbar: document.querySelector(".navbar"),
    open_spotlight: document.querySelector(".open_Search"),
    spotlight_search: document.querySelector(".spotlight_serach"),
    brightness_range: document.getElementById("brightness"),
    sound_range: document.getElementById("sound"),
    clockElement: document.getElementById("clock"),
    dateElement: document.getElementById("date"),
    clockWrapper: document.querySelector(".clock"),
    widgetsPanel: document.querySelector(".widgets-panel"),
    batteryButton: document.querySelector(".battery"),
    batteryText: document.querySelector(".battery__text"),
    batteryPopup: document.querySelector(".battery__popup"),
    batteryPopupText: document.querySelector(".battery__popup header span"),
    batteryProgress: document.querySelector(".battery__progress"),
    batteryIsChargingLogo: document.querySelector(".is-charging"),
    powerSource: document.querySelector(".power-source"),
  };

  // Calculator App
  const calculatorApp = {
    app_name: document.querySelector("#calculator"),
    window: document.querySelector(".calculator"),
    close: document.querySelector(".close-cal"),
    backfull: document.querySelector(".min-cal"),
    point: document.querySelector("#point-cal"),
    opening: document.querySelector(".open-cal"),
    opening_l: document.querySelector(".open-cal-lunching"),
  };

  // Notes App
  const notesApp = {
    app_name: document.querySelector("#Notes"),
    window: document.querySelector(".note"),
    close: document.querySelector(".close-note"),
    backfull: document.querySelector(".backfull-note"),
    full: document.querySelector(".full-note"),
    point: document.querySelector("#point-note"),
    adding: document.querySelector(".adding"),
    deleting: document.querySelector(".deleting"),
    content_typing: document.querySelector(".content__typing"),
    opening: document.querySelector(".open-note"),
    notes: document.querySelector(".content__sidebar--notes"),
  };

  // Terminal App
  const terminalApp = {
    app_name: document.querySelector("#Terminal"),
    window: document.querySelector(".terminal"),
    full: document.querySelector(".terminal .full"),
    close: document.querySelector(".close"),
    point: document.querySelector("#point-terminal"),
    content: document.querySelector(".terminal .terminal_content"),
    opening: document.querySelector(".open-terminal"),
  };

  // Maps App
  const mapsApp = {
    app_name: document.querySelector("#map"),
    window: document.querySelector(".maps"),
    full: document.querySelector(".full-map"),
    close: document.querySelector(".close-map"),
    backfull: document.querySelector(".backfull-map"),
    point: document.querySelector("#point-maps"),
    opening: document.querySelector(".open-map"),
  };

  // Block Blast App
  const blockblastApp = {
    app_name: document.querySelector("#blockblast"),
    window: document.querySelector(".blockblast"),
    close: document.querySelector(".close-blockblast"),
    point: document.querySelector("#point-blockblast"),
    opening: document.querySelector(".open-blockblast"),
    opening_l: document.querySelector(".open-blockblast-lunching"),
  };

  // Padel 3D App
  const padelApp = {
    app_name: document.querySelector("#padel"),
    window: document.querySelector(".padel3d"),
    full: document.querySelector(".full-padel"),
    close: document.querySelector(".close-padel"),
    backfull: document.querySelector(".backfull-padel"),
    point: document.querySelector("#point-padel"),
    opening: document.querySelector(".open-padel"),
    opening_l: document.querySelector(".open-padel-lunching"),
  };

  // Games App (MonkeyGG2 portal)
  const gamesApp = {
    app_name: document.querySelector("#games"),
    window: document.querySelector(".games"),
    full: document.querySelector(".full-games"),
    close: document.querySelector(".close-games"),
    backfull: document.querySelector(".backfull-games"),
    point: document.querySelector("#point-games"),
    opening: document.querySelector(".open-games"),
    opening_l: document.querySelector(".open-games-lunching"),
  };

  // Launchpad
  const launchpad = {
    container: document.querySelector(".container__Window"),
    window: document.querySelector(".launchpad"),
    searchbox: document.querySelector(".launchpad .searchbox"),
    app_container: document.querySelector(".Apps-container"),
    point: document.querySelector("#point-launchpad"),
    opening: document.querySelector(".open-lunchpad"),
  };

  /********** Z-INDEX MANAGEMENT (focus window on top) **********/
  let topZ = 10;
  function focusWindow(win) {
    if (!win) return;
    if (!win.classList.contains("window") && !win.classList.contains("calculator")) return;
    topZ += 1;
    win.style.zIndex = String(topZ);
  }

  /********** WINDOW ACTIONS **********/
  function handleMinimize(win) {
    win.style.maxWidth = "80%";
    win.style.minWidth = "70%";
    win.style.height = "430px";
  }

  function handleFullScreen(win) {
    win.style.maxWidth = "95%";
    win.style.minWidth = "95%";
    win.style.height = "90%";
  }

  function close_window(close, point, appName) {
    close.style.display = "none";
    point.style.display = "none";
    appName.style.display = "none";
  }

  function open_window(open, point, appName) {
    elements.navbar.style.display = "flex";
    open.style.display = "block";
    launchpad.container.style.display = "flex";
    launchpad.window.style.display = "none";
    launchpad.point.style.display = "none";
    appName.style.display = "block";
    point.style.display = "block";
    focusWindow(open);
    // If the window was dragged before (absolute positioned), reset it
    // back to its centered flow layout for a clean reopen.
    resetWindowTransform(open);
  }

  function resetWindowTransform(win) {
    if (!win) return;
    // Only reset windows that were converted to absolute by dragging.
    if (win.style.position === "absolute") {
      win.style.position = "";
      win.style.left = "";
      win.style.top = "";
      win.style.margin = "";
      win.style.transform = "";
    }
  }

  /********** SPOTLIGHT **********/
  function handleSpotlight() {
    const isShown = elements.spotlight_search.style.display === "flex";
    elements.spotlight_search.style.display = isShown ? "none" : "flex";
    if (!isShown) {
      const input = elements.spotlight_search.querySelector("input");
      if (input) input.focus();
    }
  }

  /********** NOTES APP **********/
  function handleAdding() {
    const wrap = document.createElement("div");
    wrap.className = "content__sidebar--note-item";
    const create_input = document.createElement("input");
    create_input.placeholder = "Note name";
    create_input.type = "text";
    const removeBtn = document.createElement("button");
    removeBtn.className = "note-item__remove";
    removeBtn.textContent = "×";
    removeBtn.setAttribute("aria-label", "Remove note");
    removeBtn.addEventListener("click", function () {
      wrap.remove();
      if (!notesApp.notes.children.length) {
        notesApp.content_typing.style.display = "none";
      }
    });
    wrap.appendChild(create_input);
    wrap.appendChild(removeBtn);
    notesApp.notes.appendChild(wrap);
    create_input.focus();
  }

  function handleDeleting() {
    const last = notesApp.notes.lastElementChild;
    if (last) last.remove();
    if (!notesApp.notes.children.length) {
      notesApp.content_typing.style.display = "none";
    }
  }

  function handleNotes() {
    notesApp.content_typing.style.display = "block";
  }

  /********** LAUNCHPAD **********/
  function handleOpenLaunching() {
    if (launchpad.window.style.display === "none" || !launchpad.window.style.display) {
      launchpad.window.style.display = "block";
      elements.navbar.style.display = "none";
      launchpad.point.style.display = "block";
      // Hide spotlight so it doesn't overlap the launchpad overlay.
      elements.spotlight_search.style.display = "none";
    } else {
      launchpad.window.style.display = "none";
      elements.navbar.style.display = "flex";
      launchpad.point.style.display = "none";
    }
    launchpad.container.style.display = "none";
  }

  function handleLaunchpadSearch(e) {
    const term = (e.target.value || "").toLowerCase().trim();
    for (const app of launchpad.app_container.children) {
      if (!term) {
        app.style.display = "flex";
        continue;
      }
      const keywords = (app.dataset.keywords || "").toLowerCase();
      const name = (app.querySelector("strong")?.textContent || "").toLowerCase();
      app.style.display = keywords.includes(term) || name.includes(term) ? "flex" : "none";
    }
  }

  function openFromLaunchpad(win, point, appName) {
    launchpad.container.style.display = "flex";
    elements.navbar.style.display = "flex";
    launchpad.window.style.display = "none";
    launchpad.point.style.display = "none";
    win.style.display = "block";
    appName.style.display = "block";
    point.style.display = "block";
    focusWindow(win);
    resetWindowTransform(win);
  }

  /********** EVENT WIRING **********/
  launchpad.opening.addEventListener("click", handleOpenLaunching);

  calculatorApp.backfull.addEventListener("click", () =>
    handleMinimize(calculatorApp.window)
  );
  notesApp.backfull.addEventListener("click", () =>
    handleMinimize(notesApp.window)
  );
  terminalApp.close.addEventListener("click", () =>
    close_window(terminalApp.window, terminalApp.point, terminalApp.app_name)
  );
  notesApp.close.addEventListener("click", () =>
    close_window(notesApp.window, notesApp.point, notesApp.app_name)
  );
  mapsApp.close.addEventListener("click", () =>
    close_window(mapsApp.window, mapsApp.point, mapsApp.app_name)
  );
  notesApp.adding.addEventListener("click", handleAdding);
  notesApp.deleting.addEventListener("click", handleDeleting);
  terminalApp.full.addEventListener("click", () =>
    handleFullScreen(terminalApp.window)
  );
  notesApp.full.addEventListener("click", () =>
    handleFullScreen(notesApp.window)
  );
  mapsApp.full.addEventListener("click", () => handleFullScreen(mapsApp.window));
  notesApp.window.addEventListener("click", handleNotes);
  terminalApp.opening.addEventListener("click", () =>
    open_window(terminalApp.window, terminalApp.point, terminalApp.app_name)
  );
  notesApp.opening.addEventListener("click", () =>
    open_window(notesApp.window, notesApp.point, notesApp.app_name)
  );
  calculatorApp.opening.addEventListener("click", () =>
    open_window(calculatorApp.window, calculatorApp.point, calculatorApp.app_name)
  );
  mapsApp.opening.addEventListener("click", () =>
    open_window(mapsApp.window, mapsApp.point, mapsApp.app_name)
  );
  mapsApp.backfull.addEventListener("click", () =>
    handleMinimize(mapsApp.window)
  );
  calculatorApp.close.addEventListener("click", () =>
    close_window(
      calculatorApp.window,
      calculatorApp.point,
      calculatorApp.app_name
    )
  );
  calculatorApp.opening_l.addEventListener("click", () =>
    openFromLaunchpad(calculatorApp.window, calculatorApp.point, calculatorApp.app_name)
  );

  // Focus windows on click (bring to front).
  document.querySelectorAll(".window, .calculator").forEach((win) => {
    win.addEventListener("pointerdown", () => focusWindow(win), true);
  });

  // Block Blast app listeners
  function safeInitBlockBlast() {
    try {
      if (window.BlockBlast) window.BlockBlast.init();
    } catch (e) {
      console.error("BlockBlast init failed:", e);
    }
  }
  function handleOpenBlockBlast_lunchpad() {
    openFromLaunchpad(blockblastApp.window, blockblastApp.point, blockblastApp.app_name);
    blockblastApp.window.style.display = "flex";
    safeInitBlockBlast();
  }
  blockblastApp.opening.addEventListener("click", () => {
    open_window(blockblastApp.window, blockblastApp.point, blockblastApp.app_name);
    blockblastApp.window.style.display = "flex";
    safeInitBlockBlast();
  });
  blockblastApp.opening_l.addEventListener("click", handleOpenBlockBlast_lunchpad);
  blockblastApp.close.addEventListener("click", () =>
    close_window(blockblastApp.window, blockblastApp.point, blockblastApp.app_name)
  );

  // Padel 3D app listeners
  function safeInitPadel() {
    try {
      if (window.Padel3D) window.Padel3D.init();
    } catch (e) {
      console.error("Padel3D init failed:", e);
    }
  }
  function handleOpenPadel_lunchpad() {
    openFromLaunchpad(padelApp.window, padelApp.point, padelApp.app_name);
    safeInitPadel();
  }
  padelApp.opening.addEventListener("click", () => {
    open_window(padelApp.window, padelApp.point, padelApp.app_name);
    safeInitPadel();
  });
  padelApp.opening_l.addEventListener("click", handleOpenPadel_lunchpad);
  padelApp.close.addEventListener("click", () => {
    close_window(padelApp.window, padelApp.point, padelApp.app_name);
    // Stop the render loop while the window is hidden to save battery.
    try { if (window.Padel3D && window.Padel3D.dispose) window.Padel3D.dispose(); } catch (e) { /* noop */ }
  });
  padelApp.full.addEventListener("click", () =>
    handleFullScreen(padelApp.window)
  );
  padelApp.backfull.addEventListener("click", () =>
    handleMinimize(padelApp.window)
  );

  // Games app listeners
  gamesApp.opening.addEventListener("click", () =>
    open_window(gamesApp.window, gamesApp.point, gamesApp.app_name)
  );
  gamesApp.opening_l.addEventListener("click", () =>
    openFromLaunchpad(gamesApp.window, gamesApp.point, gamesApp.app_name)
  );
  gamesApp.close.addEventListener("click", () =>
    close_window(gamesApp.window, gamesApp.point, gamesApp.app_name)
  );
  gamesApp.full.addEventListener("click", () =>
    handleFullScreen(gamesApp.window)
  );
  gamesApp.backfull.addEventListener("click", () =>
    handleMinimize(gamesApp.window)
  );

  elements.open_spotlight.addEventListener("click", handleSpotlight);
  launchpad.searchbox.addEventListener("input", handleLaunchpadSearch);
  elements.clockWrapper.addEventListener("click", () => {
    elements.widgetsPanel.classList.toggle("open");
  });

  // Esc closes spotlight / launchpad / context menu.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    elements.spotlight_search.style.display = "none";
    if (launchpad.window.style.display === "block") handleOpenLaunching();
    hideMenu();
  });

  /********** CALCULATOR **********/
  const calculatorButtons = document.querySelectorAll(".input button");
  const calculatorDisplay = document.querySelector(".display");

  function lastNumber(value) {
    return value.split(/[+\-*/%]/).pop();
  }

  // Safe arithmetic evaluator: only digits, operators, parentheses and dot.
  function safeEval(expr) {
    if (!/^[0-9+\-*/%.()\s]+$/.test(expr)) return "Error";
    try {
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict";return (' + expr + ")")();
      if (result === undefined || result === null || Number.isNaN(result)) return "Error";
      // Limit precision to avoid float noise like 0.1+0.2.
      return String(Math.round(result * 1e10) / 1e10);
    } catch (e) {
      return "Error";
    }
  }

  const operators = ["+", "-", "*", "/", "%"];

  function calculate(value, display) {
    const latestChar = display.value[display.value.length - 1];
    const isEmpty = display.value === "0" || display.value === "Error";
    const isDecimalLastOperand = lastNumber(display.value).includes(".");
    const isNumber = /^[0-9]$/.test(value);

    if (isEmpty && isNumber) {
      display.value = value;
      return;
    }
    if (isEmpty && !isNumber && value !== "C") {
      // Don't append operators onto an Error / fresh zero state.
      return;
    }

    switch (value) {
      case "=":
        if (display.value && display.value !== "Error") {
          display.value = safeEval(display.value);
        }
        return;
      case ".":
        if (!isDecimalLastOperand) display.value += ".";
        return;
      case "C":
        display.value = "0";
        return;
      case "+/-":
        if (
          !operators.some((operator) =>
            display.value.replace(/^-/, "").includes(operator)
          )
        ) {
          display.value = String(-1 * parseFloat(display.value));
        }
        return;
      case "*":
      case "/":
      case "-":
      case "+":
      case "%":
        if (operators.includes(latestChar)) {
          display.value = display.value.slice(0, -1) + value;
          return;
        }
        display.value += value;
        return;
      default:
        display.value += value;
    }
  }

  calculatorButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      calculate(event.target.value, calculatorDisplay);
    });
  });

  // Keyboard support for the calculator when its window is visible.
  document.addEventListener("keydown", (e) => {
    if (calculatorApp.window.style.display !== "block") return;
    // Avoid hijacking typing in inputs/contenteditable.
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
    const key = e.key;
    const map = {
      Enter: "=", "=": "=", Escape: "C",
      Backspace: "Backspace", "+": "+", "-": "-", "*": "*", "/": "/", "%": "%", ".": ".",
    };
    let val = null;
    if (/^[0-9]$/.test(key)) val = key;
    else if (map[key]) val = map[key];
    if (val === "Backspace") {
      calculatorDisplay.value = calculatorDisplay.value.slice(0, -1) || "0";
      e.preventDefault();
      return;
    }
    if (val) {
      calculate(val, calculatorDisplay);
      e.preventDefault();
    }
  });

  /********** WINDOW DRAGGING (Pointer Events, no jQuery UI) **********/
  function makeDraggable(el, handle) {
    const dragHandle = handle || el;
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    dragHandle.addEventListener("pointerdown", (e) => {
      // Don't start a drag from interactive controls (buttons/inputs/links).
      const tag = (e.target.tagName || "").toLowerCase();
      if (["button", "input", "textarea", "a", "select"].includes(tag)) return;
      if (e.target.isContentEditable) return;
      dragging = true;
      const rect = el.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      el.style.position = "absolute";
      // Switch from centered flow to absolute positioning at current spot.
      el.style.left = rect.left + "px";
      el.style.top = rect.top + "px";
      el.style.margin = "0";
      el.style.transform = "none";
      dragHandle.setPointerCapture(e.pointerId);
      focusWindow(el);
    });

    dragHandle.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      el.style.left = e.clientX - offsetX + "px";
      el.style.top = e.clientY - offsetY + "px";
    });

    const endDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      try { dragHandle.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
    };
    dragHandle.addEventListener("pointerup", endDrag);
    dragHandle.addEventListener("pointercancel", endDrag);
  }

  // Apply dragging. Use taskbar as the handle for window apps so inner
  // content (terminal, textarea, canvas) stays interactive.
  makeDraggable(document.querySelector(".terminal"), document.querySelector(".terminal .window__taskbar"));
  makeDraggable(document.querySelector(".note"), document.querySelector(".note .window__taskbar"));
  makeDraggable(document.querySelector(".maps"), document.querySelector(".maps .window__taskbar"));
  makeDraggable(document.querySelector(".padel3d"), document.querySelector(".padel3d .window__taskbar"));
  makeDraggable(document.querySelector(".games"), document.querySelector(".games .window__taskbar"));
  makeDraggable(document.querySelector(".spotlight_serach"));
  // Calculator and Block Blast have their own header/handle.
  const calcTop = document.querySelector(".calculator__top");
  if (calcTop) makeDraggable(document.querySelector(".calculator"), calcTop);
  makeDraggable(document.querySelector(".blockblast"), document.querySelector(".bb__header"));

  /********** CLOCK & DATE **********/
  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function digi() {
    const date = new Date();
    let hour = date.getHours();
    const minute = pad2(date.getMinutes());

    const ampm = hour >= 12 ? "PM" : "AM";
    // Convert to 12-hour. 0 -> 12 AM, 12 -> 12 PM, 13 -> 1 PM.
    hour = hour % 12;
    if (hour === 0) hour = 12;

    elements.clockElement.textContent = hour + ":" + minute + " " + ampm;
    if (elements.dateElement) {
      elements.dateElement.textContent = date.toDateString();
    }
  }

  // Update the clock every second so the minute never lags.
  setInterval(digi, 1000);
  digi();

  /********** TERMINAL (mini shell) **********/
  let path = "~";
  let dirName;
  let dirs = ["Desktop", "Downloads", "Music", "Documents"];
  const TERMINAL_HELP = [
    "Available commands:",
    "  help        Show this help",
    "  ls          List directory contents",
    "  pwd         Print working directory",
    "  cd <dir>    Change directory",
    "  mkdir <dir> Create a directory",
    "  rmdir       Remove the last created directory",
    "  ps -aux     Show fake process stats",
    "  cat <file>  Print a file",
    "  echo <txt>  Print text",
    "  date        Show current date",
    "  whoami      Show current user",
    "  clear       Clear the terminal",
  ];

  function newPrompt() {
    const line = document.createElement("div");
    line.className = "terminal_line";
    line.innerHTML =
      '<p><span class="color_green">\u279c</span>&nbsp;&nbsp;<span class="color_blue">' +
      escapeHtml(path) +
      '</span>&nbsp;<span contenteditable="true" class="cursor"></span></p>';
    terminalApp.content.appendChild(line);
    const cursor = line.querySelector(".cursor");
    placeCaretAtEnd(cursor);
    bindTerminalLine(cursor);
    terminalApp.content.scrollTop = terminalApp.content.scrollHeight;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function runCommand(command) {
    command = command.trim();
    if (!command) {
      newPrompt();
      return;
    }
    let output = "";

    if (command === "help" || command === "?") {
      output = TERMINAL_HELP.join("<br>");
    } else if (command === "clear" || command === "cls") {
      terminalApp.content.innerHTML = "";
      newPrompt();
      return;
    } else if (command === "ls") {
      output = dirs.join("&nbsp;&nbsp;&nbsp;");
    } else if (command === "pwd") {
      output = path + "/";
    } else if (command.startsWith("cd ")) {
      const target = command.substring(3).trim();
      if (target === ".." || target === "") {
        path = "~";
      } else if (target === "~") {
        path = "~";
      } else if (dirs.includes(target)) {
        path = target;
      } else {
        output = "zsh: no such directory: " + escapeHtml(target);
        path = "~";
      }
    } else if (command.startsWith("mkdir ")) {
      dirName = command.substring(6).trim();
      if (dirName) {
        dirs.push(dirName);
        output = "";
      } else {
        output = "mkdir: missing operand";
      }
    } else if (command === "rmdir") {
      if (dirs.length > 4) dirs.pop();
      output = "";
    } else if (command === "ps -aux") {
      output = "CPU = 56% <br> MEMORY = 25% <br> DISK = 34%";
    } else if (command.startsWith("cat ")) {
      output =
        "Lorem ipsum dolor sit amet consectetur adipisicing elit.<br>Fugiat nihil totam expedita sint necessitatibus quos ducimus.";
    } else if (command.startsWith("echo ")) {
      output = escapeHtml(command.substring(5));
    } else if (command === "date") {
      output = new Date().toString();
    } else if (command === "whoami") {
      output = "guest";
    } else {
      output = "zsh: command not found: " + escapeHtml(command) + "<br>Type 'help' for available commands.";
    }

    terminalApp.content.appendChild(document.createTextNode("\n"));
    if (output) {
      const out = document.createElement("p");
      out.innerHTML = output;
      terminalApp.content.appendChild(out);
    }
    newPrompt();
  }

  function bindTerminalLine(cursor) {
    cursor.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.keyCode === 13) {
        e.preventDefault();
        const command = this.textContent;
        this.removeAttribute("contenteditable");
        this.classList.remove("cursor");
        runCommand(command);
      }
    });
  }

  function placeCaretAtEnd(el) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // Initialize the first editable prompt.
  const firstCursor = document.querySelector(".cursor");
  if (firstCursor) bindTerminalLine(firstCursor);
  terminalApp.content.addEventListener("click", function () {
    const cursor = document.querySelector(".cursor");
    if (cursor) placeCaretAtEnd(cursor);
  });

  /********** CONTEXT MENU (right click) **********/
  const contextMenu = document.getElementById("contextMenu");

  function hideMenu() {
    if (contextMenu) contextMenu.style.opacity = "0";
  }

  function rightClick(e) {
    e.preventDefault();
    if (!contextMenu) return;
    const isOpen = contextMenu.style.opacity === "1";
    if (isOpen) {
      hideMenu();
      return;
    }
    contextMenu.style.opacity = "1";
    // Keep the menu inside the viewport.
    const menuW = contextMenu.offsetWidth || 200;
    const menuH = contextMenu.offsetHeight || 160;
    let left = e.pageX;
    let top = e.pageY;
    if (left + menuW > window.innerWidth) left = window.innerWidth - menuW - 8;
    if (top + menuH > window.innerHeight) top = window.innerHeight - menuH - 8;
    contextMenu.style.left = left + "px";
    contextMenu.style.top = top + "px";
  }

  document.addEventListener("click", hideMenu);
  document.addEventListener("contextmenu", rightClick);

  /********** BATTERY **********/
  const calculateBattery = () => {
    let number = Math.floor(Math.random() * 100) + 1;
    let batteryIsCharging = false;

    if (navigator.getBattery) {
      navigator
        .getBattery()
        .then(function (battery) {
          function refresh() {
            number = Math.round(battery.level * 100);
            batteryIsCharging = battery.charging;
            renderBattery(number, batteryIsCharging);
          }
          refresh();
          battery.addEventListener("levelchange", refresh);
          battery.addEventListener("chargingchange", refresh);
        })
        .catch(() => renderBattery(number, batteryIsCharging));
    } else {
      renderBattery(number, batteryIsCharging);
    }
  };

  function renderBattery(number, charging) {
    elements.batteryText.textContent = number + "%";
    elements.batteryProgress.style.width = number + "%";
    elements.batteryPopupText.textContent = number + "%";

    elements.batteryProgress.classList.remove("battery__low", "battery__high");
    elements.batteryIsChargingLogo.classList.remove("is-charging-visibel");
    elements.powerSource.textContent = "Battery";

    if (number <= 20) {
      elements.batteryProgress.classList.add("battery__low");
    }
    if (charging) {
      elements.batteryProgress.classList.add("battery__high");
      elements.batteryIsChargingLogo.classList.add("is-charging-visibel");
      elements.powerSource.textContent = "Power Adapter";
    }
  }

  elements.batteryButton.addEventListener("click", (e) => {
    e.stopPropagation();
    elements.batteryPopup.classList.toggle("opened");
    elements.batteryButton.classList.toggle("selected");
  });
  // Close battery popup when clicking elsewhere.
  document.addEventListener("click", (e) => {
    if (!elements.batteryButton.contains(e.target) && !elements.batteryPopup.contains(e.target)) {
      elements.batteryPopup.classList.remove("opened");
      elements.batteryButton.classList.remove("selected");
    }
  });

  /********** INIT **********/
  calculateBattery();
  // Spotlight starts hidden; navbar starts visible (matches HTML state).
  elements.spotlight_search.style.display = "none";
})();
