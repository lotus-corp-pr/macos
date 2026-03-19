/********** ELEMENTS **********/
const elements = {
  body: document.querySelector("body"),
  navbar: document.querySelector(".navbar"),
  open_spotlight: document.querySelector(".open_Search"),
  spotlight_search: document.querySelector(".spotlight_serach"),
  brightness_range: document.getElementById("brightness"),
  sound_range: document.getElementById("sound"),
  clockElement: document.getElementById("clock"),
  clockWrapper: document.querySelector(".clock"),
  widgetsPanel: document.querySelector(".widgets-panel"),
  batteryButton: document.querySelector(".battery"),
  batteryText: document.querySelector(".battery__text"),
  batteryPopup: document.querySelector(".battery__popup"),
  batteryPopupText: document.querySelector(".battery__popup header span"),
  batteryProgress: document.querySelector(".battery__progress"),
  batteryIsChargingLogo: document.querySelector(".is-charging"),
  powerSource: document.querySelector(".power-source"),
  notificationCenter: document.getElementById("notificationCenter"),
  notificationBadge: document.querySelector(".notification-badge"),
  openNotification: document.querySelector(".open_notification"),
};

// Calculator App
const calculatorApp = {
  app_name: document.querySelector("#calculator"),
  window: document.querySelector(".calculator"),
  full: document.querySelector(".full"),
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
  full: document.querySelector(".full-note"),
  close: document.querySelector(".close-note"),
  backfull: document.querySelector(".backfull-note"),
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
  full: document.querySelector(".full"),
  close: document.querySelector(".close"),
  backfull: document.querySelector(".backfull"),
  point: document.querySelector("#point-terminal"),
  content: document.querySelector(".terminal .terminal_content"),
  taskbar: document.querySelector(".terminal .window__taskbar"),
  opening: document.querySelector(".open-terminal"),
};

// VScode App

/*  Can't connect to the github.dev or vscode.dev 
const vscodeApp = {
  app_name: document.querySelector("#VScode"),
  window: document.querySelector(".Vscode"),
  close: document.querySelector(".close-Vscode"),
  backfull: document.querySelector(".backfull-Vscode"),
  full: document.querySelector(".full-Vscode"),
  point: document.querySelector("#point-vscode"),
  opening: document.querySelector(".open-vscode")
};
*/

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

// Calendar App
const calendarApp = {
  app_name: document.querySelector("#Calendar"),
  window: document.getElementById("calendarApp"),
  full: document.querySelector(".full-calendar"),
  close: document.querySelector(".close-calendar"),
  backfull: document.querySelector(".backfull-calendar"),
  point: document.getElementById("point-calendar"),
  opening_dock: document.querySelector(".open-calendar-dock"),
  opening_launchpad: document.querySelector(".open-calendar-app"),
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

/********** LISTENERS **********/

/* 
Now it's not good cause when i set this, the default blur will be remove of everywhere.

function change_brightness() {
  var brightnessVal = elements.brightness_range.value;

  elements.body.style.filter = `brightness(${brightnessVal + '%'})`;
  elements.body.style.backdropFilter = `brightness(${brightnessVal + '%'})`;
}
*/

// Spotlight
function handleopen_spotlight() {
  if (elements.spotlight_search.style.display === "none") {
    elements.spotlight_search.style.display = "flex";
  } else {
    elements.spotlight_search.style.display = "none";
  }
}

// Notes app function start
function handleAdding() {
  const create_input = document.createElement("input");
  create_input.placeholder = "Writing name";
  notesApp.notes.appendChild(create_input);
}

function handleDeleting() {
  const inputChild = document.querySelector(".content__sidebar--notes input");
  inputChild.remove();
  notesApp.content_typing.style.display = "none";
}

function handleNotes() {
  notesApp.content_typing.style.display = "block";
}

// Notes app function end

function handleMinimize(Minimize) {
  Minimize.style.maxWidth = "80%";
  Minimize.style.minWidth = "70%";
  Minimize.style.height = "430px";
}

function handleFullScreen(maximize) {
  maximize.style.maxWidth = "95%";
  maximize.style.minWidth = "95%";
  maximize.style.height = "90%";
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
}

// Launchpad function start
launchpad.opening.addEventListener("click", handleOpenLaunching);

function handleOpenLaunching() {
  if (launchpad.window.style.display === "none") {
    launchpad.window.style.display = "block";
    elements.navbar.style.display = "none";
    launchpad.point.style.display = "block";
  } else {
    launchpad.window.style.display = "none";
    elements.navbar.style.display = "flex";
    launchpad.point.style.display = "none";
  }
  launchpad.container.style.display = "none";
}

function handleLaunchpadSearch(e) {
  for (let app of launchpad.app_container.children) {
    if (e.target.value) {
      app.style.display = "none";
      if (app.dataset.keywords.includes(e.target.value)) {
        app.style.display = "flex";
      }
    } else app.style.display = "flex";
  }
}
// Launchpad function end

// Calculator app start
function handleOpenCal_lunchpad() {
  calculatorApp.window.style.display = "block";
  calculatorApp.app_name.style.display = "block";
  launchpad.container.style.display = "flex";
  elements.navbar.style.display = "flex";
  launchpad.window.style.display = "none";
  calculatorApp.point.style.display = "block";
  launchpad.point.style.display = "none";
}
// Calculator app end

handleopen_spotlight();
handleOpenLaunching();
notesApp.adding.addEventListener("click", handleAdding);
calculatorApp.backfull.addEventListener("click", () =>
  handleMinimize(terminalApp.window)
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
notesApp.deleting.addEventListener("click", handleDeleting);
terminalApp.full.addEventListener("click", () =>
  handleFullScreen(terminalApp.window)
);
notesApp.full.addEventListener("click", () =>
  handleFullScreen(notesApp.window)
);
/*
vscodeApp.full.addEventListener("click", () =>
  handleFullScreen(vscodeApp.window)
);
*/
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
/*
vscodeApp.opening.addEventListener("click", () =>
  open_window(vscodeApp.window, vscodeApp.point, vscodeApp.app_name)
);
*/
mapsApp.opening.addEventListener("click", () =>
  open_window(mapsApp.window, mapsApp.point, mapsApp.app_name)
);
/*
vscodeApp.close.addEventListener("click", () =>
  close_window(vscodeApp.window, vscodeApp.point, vscodeApp.app_name)
);
vscodeApp.backfull.addEventListener("click", () =>
  handleMinimize(vscodeApp.window)
);
*/
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
calculatorApp.opening_l.addEventListener("click", handleOpenCal_lunchpad);
elements.open_spotlight.addEventListener("click", handleopen_spotlight);
launchpad.searchbox.addEventListener("input", handleLaunchpadSearch);
elements.clockWrapper.addEventListener("click", () => {
  elements.widgetsPanel.classList.toggle("open");
});

// Calculator code
// select all the buttons
const calculatorButtons = document.querySelectorAll(".input button");
// select the <input type="text" class="display" disabled> element
const calculatorDisplay = document.querySelector(".display");

// add eventListener to each button
calculatorButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    calculate(event.target.value, calculatorDisplay);
    console.log("btn");
  });
});

function lastNumber(value) {
  return value.split(/[\+\-\*\/\%]/).pop();
}

const operators = ["+", "-", "*", "/", "%"];

function calculate(value, display) {
  const latestChar = display.value[display.value.length - 1];

  const isEmpty = display.value === "0";
  const isDecimalLastOperand = lastNumber(display.value).includes(".");
  const isNumber = /^[0-9]$/.test(value);

  if (isEmpty && isNumber) {
    return (display.value = value);
  }

  switch (value) {
    case "=":
      if (!isEmpty) display.value = eval(display.value);
      return;
    case ".":
      if (!isDecimalLastOperand) display.value += ".";
      return;
    case "C":
      return (display.value = "0");
    case "+/-":
      if (
        !operators.some((operator) =>
          display.value.replace(/^-/, "").includes(operator)
        )
      )
        display.value = -1 * parseFloat(display.value);
      return;
    case "*":
    case "/":
    case "-":
    case "+":
    case "%":
      if (operators.includes(latestChar)) {
        return (display.value = display.value.slice(0, -1) + value);
      }
    // Fall through to default case
    default:
      display.value += value;
  }
}

// App draggable
$(function () {
  $(".terminal").draggable();
  $(".note").draggable();
  $(".calculator").draggable();
  $(".Vscode").draggable();
  $(".spotlight_serach").draggable();
  $(".maps").draggable();
  $(".calendar-app").draggable();
});

// Date and time
const dateElement = document.getElementById("date");
const currentDate = new Date();
dateElement.innerHTML = currentDate.toDateString();

function digi() {
  const date = new Date();
  let hour = date.getHours();
  let minute = checkTime(date.getMinutes());

  function checkTime(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

  if (hour > 12) {
    hour = hour - 12;
    if (hour === 12) {
      hour = checkTime(hour);
      elements.clockElement.innerHTML = hour + ":" + minute + " AM";
    } else {
      hour = checkTime(hour);
      elements.clockElement.innerHTML = hour + ":" + minute + " PM";
    }
  } else {
    elements.clockElement.innerHTML = hour + ":" + minute + " AM";
  }
}

let terminal_line_html = document.querySelector(".terminal_line").outerHTML;
let path = "~";
let dirName;
let dirs = ["Desktop", "Downloads", "Music", "Documents"];

function init_terminal_line() {
  $(".cursor").keydown(function (e) {
    if (e.keyCode === 13) {
      console.log("hello");
      e.preventDefault();
      let command = $(this).text().trim(); // Use .text() for contenteditable elements
      if (!command) return;

      let command_output = "zsh: command not found: " + command + "<br>";

      if (command.startsWith("cd ")) {
        path = command.substring(3);
        command_output = "";
      } else if (command === "ls") {
        command_output = dirs.join("\t");
      } else if (command === "pwd") {
        command_output = path + "/";
      } else if (command.startsWith("mkdir ")) {
        dirName = command.substring(6);
        dirs.push(dirName);
        command_output = "";
      } else if (command === "rmdir") {
        dirs.pop();
        command_output = "";
      } else if (command === "ps -aux") {
        command_output = "CPU = 56% <br> MEMORY = 25% <br> DISK = 34%";
      } else if (command.startsWith("cat ")) {
        command_output =
          "Lorem ipsum dolor sit amet consectetur adipisicing elit.<br> Fugiat nihil totam expedita sint necessitatibus quos ducimus.";
      } else if (command.startsWith("du -hs ")) {
        command_output = Math.floor(Math.random() * 100) + "GB";
      }

      $(this).removeAttr("contenteditable");
      $(this).removeClass("cursor");
      terminalApp.content.innerHTML += command_output; // Use .innerHTML to append string content
      let new_terminal_line_html = terminal_line_html.replace("~", path);
      terminalApp.content.innerHTML += new_terminal_line_html;
      placeCaretAtEnd(document.querySelector(".cursor"));
      init_terminal_line();
    }
  });
}

init_terminal_line();
terminalApp.content.addEventListener("click", function () {
  placeCaretAtEnd(document.querySelector(".cursor"));
});

function placeCaretAtEnd(el) {
  el.focus();
  var range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

// Right click to desktop
document.onclick = hideMenu;
document.oncontextmenu = rightClick;

function hideMenu() {
  document.getElementById("contextMenu").style.opacity = "0";
}

function rightClick(e) {
  e.preventDefault();

  if (document.getElementById("contextMenu").style.opacity == "1") hideMenu();
  else {
    var menu = document.getElementById("contextMenu");

    menu.style.opacity = "1";
    menu.style.left = e.pageX + "px";
    menu.style.top = e.pageY + "px";
  }
}

// Loading
// const load = document.getElementById("loading");
// function lockload() {
//   load.style.display = "none";
// }

/********** Start Battery **********/
const calculateBattery = () => {
  let number = Math.floor(Math.random() * 100); // If there is any error, it will be the random default battery level
  let batteryIsCharging = false; // Charging status

  navigator
    .getBattery()
    .then(function (battery) {
      number = battery.level * 100;

      batteryIsCharging = battery.charging;
      battery.addEventListener("chargingchange", function () {
        batteryIsCharging = battery.charging;
      });
    })
    .finally(() => {
      elements.batteryText.textContent = `${number}%`;
      elements.batteryProgress.style.width = `${number}%`;
      elements.batteryPopupText.textContent = `${number}%`;

      if (number <= 20) {
        elements.batteryProgress.classList.add("battery__low");
      } else if ((number > 90 && batteryIsCharging) || batteryIsCharging) {
        elements.batteryProgress.classList.add("battery__high");
        elements.batteryIsChargingLogo.classList.add("is-charging-visibel");
        elements.powerSource.textContent = "Power Adapter";
      }
    });
};

elements.batteryButton.addEventListener("click", () => {
  elements.batteryPopup.classList.toggle("opened");
  elements.batteryButton.classList.toggle("selected");
});
/********** End Battery **********/

/********** Notification Center **********/
let notifications = [];
let dndMode = false;

function toggleNotificationCenter() {
  elements.notificationCenter.classList.toggle("open");
}

function updateNotificationBadge() {
  const unreadCount = notifications.filter(n => !n.read).length;
  if (unreadCount > 0) {
    elements.notificationBadge.textContent = unreadCount;
    elements.notificationBadge.classList.remove("hidden");
  } else {
    elements.notificationBadge.classList.add("hidden");
  }
}

function addNotification(notification) {
  if (dndMode) return;
  
  notification.id = Date.now();
  notification.time = new Date();
  notifications.unshift(notification);
  
  renderNotifications();
  updateNotificationBadge();
  showNotificationBanner(notification);
}

function showNotificationBanner(notification) {
  if (dndMode) return;
  
  const banner = document.createElement("div");
  banner.className = "notification-banner";
  banner.innerHTML = `
    <div class="notification-banner__header">
      <div class="notification-banner__icon" style="background: ${notification.iconBg || '#007aff'}">
        ${notification.icon || '🔔'}
      </div>
      <span class="notification-banner__app">${notification.app}</span>
      <span class="notification-banner__time">刚刚</span>
    </div>
    <div class="notification-banner__title">${notification.title}</div>
    <div class="notification-banner__message">${notification.message}</div>
  `;
  
  document.getElementById("notificationBanners").appendChild(banner);
  
  setTimeout(() => {
    banner.classList.add("removing");
    setTimeout(() => banner.remove(), 300);
  }, 5000);
}

function renderNotifications() {
  const container = document.getElementById("todayNotifications");
  container.innerHTML = "";
  
  const todayNotifications = notifications.filter(n => {
    const notifDate = new Date(n.time);
    const today = new Date();
    return notifDate.toDateString() === today.toDateString();
  });
  
  document.querySelector(".notification-count").textContent = todayNotifications.length;
  
  todayNotifications.forEach(notification => {
    const item = document.createElement("div");
    item.className = "notification-item";
    item.innerHTML = `
      <div class="notification-item__header">
        <div class="notification-item__icon" style="background: ${notification.iconBg || '#007aff'}">
          ${notification.icon || '🔔'}
        </div>
        <span class="notification-item__app">${notification.app}</span>
        <span class="notification-item__time">${formatTime(notification.time)}</span>
      </div>
      <div class="notification-item__title">${notification.title}</div>
      <div class="notification-item__message">${notification.message}</div>
    `;
    container.appendChild(item);
  });
}

function formatTime(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return new Date(date).toLocaleDateString();
}

function clearAllNotifications() {
  notifications = [];
  renderNotifications();
  updateNotificationBadge();
}

function toggleDND() {
  dndMode = !dndMode;
  const btn = document.getElementById("dndToggle");
  btn.classList.toggle("active", dndMode);
  
  if (dndMode) {
    showNotificationBanner({
      app: "系统",
      title: "勿扰模式已开启",
      message: "通知将不会显示",
      icon: "🌙",
      iconBg: "#ff9500"
    });
  }
}

// Widget Clock
function updateWidgetClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("widgetClock").textContent = `${hours}:${minutes}`;
  
  const days = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  document.getElementById("widgetDate").textContent = `${months[now.getMonth()]}${now.getDate()}日 ${days[now.getDay()]}`;
}

// Calendar Widget
function updateCalendarWidget() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  document.getElementById("widgetMonth").textContent = `${month + 1}月`;
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const container = document.getElementById("widgetCalendarDays");
  container.innerHTML = "";
  
  const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
  dayNames.forEach(day => {
    const dayEl = document.createElement("div");
    dayEl.className = "calendar-widget__day";
    dayEl.style.color = "rgba(255,255,255,0.5)";
    dayEl.textContent = day;
    container.appendChild(dayEl);
  });
  
  for (let i = 0; i < firstDay; i++) {
    container.appendChild(document.createElement("div"));
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEl = document.createElement("div");
    dayEl.className = "calendar-widget__day";
    dayEl.textContent = day;
    if (day === now.getDate()) {
      dayEl.classList.add("today");
    }
    container.appendChild(dayEl);
  }
}

/********** Calendar App **********/
let calendarEvents = JSON.parse(localStorage.getItem("calendarEvents") || "[]");
let currentCalendarDate = new Date();
let currentCalendarView = "month";
let selectedEventColor = "blue";

function initCalendar() {
  renderCalendar();
  setupCalendarEventListeners();
  loadCalendarEvents();
}

function renderCalendar() {
  const view = document.getElementById("calendarView");
  view.innerHTML = "";
  
  if (currentCalendarView === "month") {
    renderMonthView();
  } else if (currentCalendarView === "week") {
    renderWeekView();
  } else if (currentCalendarView === "day") {
    renderDayView();
  }
  
  updateCalendarTitle();
}

function renderMonthView() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  const view = document.getElementById("calendarView");
  view.className = "calendar-view month-view";
  
  const dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  dayNames.forEach(day => {
    const header = document.createElement("div");
    header.className = "day-header";
    header.textContent = day;
    view.appendChild(header);
  });
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  for (let i = firstDay - 1; i >= 0; i--) {
    const cell = createDayCell(daysInPrevMonth - i, true, year, month - 1);
    view.appendChild(cell);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = createDayCell(day, false, year, month);
    view.appendChild(cell);
  }
  
  const remainingCells = 42 - (firstDay + daysInMonth);
  for (let day = 1; day <= remainingCells; day++) {
    const cell = createDayCell(day, true, year, month + 1);
    view.appendChild(cell);
  }
}

function createDayCell(day, isOtherMonth, year, month) {
  const cell = document.createElement("div");
  cell.className = "day-cell";
  if (isOtherMonth) cell.classList.add("other-month");
  
  const actualYear = month < 0 ? year - 1 : month > 11 ? year + 1 : year;
  const actualMonth = month < 0 ? 11 : month > 11 ? 0 : month;
  
  const today = new Date();
  if (!isOtherMonth && day === today.getDate() && actualMonth === today.getMonth() && actualYear === today.getFullYear()) {
    cell.classList.add("today");
  }
  
  const dayNum = document.createElement("div");
  dayNum.className = "day-number";
  dayNum.textContent = day;
  cell.appendChild(dayNum);
  
  const eventsContainer = document.createElement("div");
  eventsContainer.className = "day-events";
  
  const dateStr = `${actualYear}-${String(actualMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const dayEvents = calendarEvents.filter(e => e.date === dateStr);
  
  dayEvents.forEach(event => {
    const eventEl = document.createElement("div");
    eventEl.className = `day-event ${event.color}`;
    eventEl.textContent = `${event.startTime} ${event.title}`;
    eventsContainer.appendChild(eventEl);
  });
  
  cell.appendChild(eventsContainer);
  
  cell.addEventListener("click", () => openEventModal(dateStr));
  
  return cell;
}

function renderWeekView() {
  const view = document.getElementById("calendarView");
  view.className = "calendar-view week-view";
  
  view.appendChild(document.createElement("div"));
  
  const startOfWeek = new Date(currentCalendarDate);
  startOfWeek.setDate(currentCalendarDate.getDate() - currentCalendarDate.getDay());
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    
    const header = document.createElement("div");
    header.className = "week-day-header";
    if (day.toDateString() === new Date().toDateString()) {
      header.classList.add("today");
    }
    header.textContent = `${["周日", "周一", "周二", "周三", "周四", "周五", "周六"][i]} ${day.getDate()}`;
    view.appendChild(header);
  }
  
  for (let hour = 0; hour < 24; hour++) {
    const timeSlot = document.createElement("div");
    timeSlot.className = "time-slot";
    timeSlot.textContent = `${hour}:00`;
    view.appendChild(timeSlot);
    
    for (let i = 0; i < 7; i++) {
      const cell = document.createElement("div");
      cell.className = "week-cell";
      view.appendChild(cell);
    }
  }
}

function renderDayView() {
  const view = document.getElementById("calendarView");
  view.className = "calendar-view day-view";
  
  for (let hour = 0; hour < 24; hour++) {
    const timeSlot = document.createElement("div");
    timeSlot.className = "time-slot";
    timeSlot.textContent = `${hour}:00`;
    view.appendChild(timeSlot);
    
    const cell = document.createElement("div");
    cell.className = "day-cell";
    view.appendChild(cell);
  }
}

function updateCalendarTitle() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  if (currentCalendarView === "month") {
    document.getElementById("calendarTitle").textContent = `${year}年${month + 1}月`;
  } else if (currentCalendarView === "week") {
    document.getElementById("calendarTitle").textContent = `${year}年 第${getWeekNumber(currentCalendarDate)}周`;
  } else {
    document.getElementById("calendarTitle").textContent = `${year}年${month + 1}月${currentCalendarDate.getDate()}日`;
  }
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function setupCalendarEventListeners() {
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCalendarView = btn.dataset.view;
      renderCalendar();
    });
  });
  
  document.getElementById("prevMonth").addEventListener("click", () => {
    if (currentCalendarView === "month") {
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    } else if (currentCalendarView === "week") {
      currentCalendarDate.setDate(currentCalendarDate.getDate() - 7);
    } else {
      currentCalendarDate.setDate(currentCalendarDate.getDate() - 1);
    }
    renderCalendar();
  });
  
  document.getElementById("nextMonth").addEventListener("click", () => {
    if (currentCalendarView === "month") {
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    } else if (currentCalendarView === "week") {
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 7);
    } else {
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
    }
    renderCalendar();
  });
  
  document.getElementById("goToToday").addEventListener("click", () => {
    currentCalendarDate = new Date();
    renderCalendar();
  });
  
  document.getElementById("addEventBtn").addEventListener("click", () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    openEventModal(dateStr);
  });
  
  document.querySelectorAll(".color-option").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".color-option").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedEventColor = btn.dataset.color;
    });
  });
  
  document.getElementById("eventForm").addEventListener("submit", saveEvent);
  document.getElementById("cancelEvent").addEventListener("click", closeEventModal);
  document.getElementById("closeEventModal").addEventListener("click", closeEventModal);
  
  calendarApp.close.addEventListener("click", () => close_window(calendarApp.window, calendarApp.point, calendarApp.app_name));
  calendarApp.backfull.addEventListener("click", () => handleMinimize(calendarApp.window));
  calendarApp.full.addEventListener("click", () => handleFullScreen(calendarApp.window));
  
  if (calendarApp.opening_dock) {
    calendarApp.opening_dock.addEventListener("click", () => open_window(calendarApp.window, calendarApp.point, calendarApp.app_name));
  }
  if (calendarApp.opening_launchpad) {
    calendarApp.opening_launchpad.addEventListener("click", () => {
      open_window(calendarApp.window, calendarApp.point, calendarApp.app_name);
      launchpad.window.style.display = "none";
      launchpad.point.style.display = "none";
    });
  }
}

function openEventModal(dateStr) {
  document.getElementById("eventModal").classList.add("open");
  document.getElementById("eventDate").value = dateStr;
  document.getElementById("eventStartTime").value = "09:00";
  document.getElementById("eventEndTime").value = "10:00";
}

function closeEventModal() {
  document.getElementById("eventModal").classList.remove("open");
  document.getElementById("eventForm").reset();
}

function saveEvent(e) {
  e.preventDefault();
  
  const event = {
    id: Date.now(),
    title: document.getElementById("eventTitle").value,
    date: document.getElementById("eventDate").value,
    startTime: document.getElementById("eventStartTime").value,
    endTime: document.getElementById("eventEndTime").value,
    reminder: document.getElementById("eventReminder").value,
    color: selectedEventColor
  };
  
  calendarEvents.push(event);
  localStorage.setItem("calendarEvents", JSON.stringify(calendarEvents));
  
  renderCalendar();
  closeEventModal();
  
  addNotification({
    app: "日历",
    title: "事件已创建",
    message: `"${event.title}" 已添加到日历`,
    icon: "📅",
    iconBg: "#007aff"
  });
}

function loadCalendarEvents() {
  calendarEvents = JSON.parse(localStorage.getItem("calendarEvents") || "[]");
  renderCalendar();
}

/********** End Calendar App **********/

// Call the functions
calculateBattery();
digi();
updateWidgetClock();
updateCalendarWidget();
initCalendar();

// Update clocks every minute
setInterval(() => {
  digi();
  updateWidgetClock();
}, 60000);

// Event Listeners
elements.openNotification.addEventListener("click", toggleNotificationCenter);
document.getElementById("clearAllNotifications").addEventListener("click", clearAllNotifications);
document.getElementById("dndToggle").addEventListener("click", toggleDND);

// Sample notifications
setTimeout(() => {
  addNotification({
    app: "信息",
    title: "新消息",
    message: "你好！今天过得怎么样？",
    icon: "💬",
    iconBg: "#34c759"
  });
}, 2000);

setTimeout(() => {
  addNotification({
    app: "邮件",
    title: "新邮件",
    message: "来自张三的邮件：项目更新",
    icon: "✉️",
    iconBg: "#007aff"
  });
}, 4000);

setTimeout(() => {
  addNotification({
    app: "日历",
    title: "即将到来的事件",
    message: "15分钟后：团队会议",
    icon: "📅",
    iconBg: "#ff9500"
  });
}, 6000);
