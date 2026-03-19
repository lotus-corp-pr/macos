/* ==================== Notification Center ==================== */
const NotificationCenter = {
  center: null,
  openBtn: null,
  dndToggle: null,
  clearAllBtn: null,
  notificationsList: null,
  notificationBadge: null,
  bannersContainer: null,
  notifications: [],
  doNotDisturb: false,
  
  init() {
    this.center = document.getElementById('notificationCenter');
    this.openBtn = document.getElementById('openNotificationCenter');
    this.dndToggle = document.getElementById('dndToggle');
    this.clearAllBtn = document.getElementById('clearAllNotifications');
    this.notificationsList = document.getElementById('notificationsList');
    this.notificationBadge = document.getElementById('notificationBadge');
    this.bannersContainer = document.getElementById('notificationBanners');
    
    if (!this.center || !this.openBtn) {
      console.error('Notification Center elements not found');
      return;
    }
    
    this.loadNotifications();
    this.bindEvents();
    this.startWorldClock();
    this.initWidgetCalendar();
    this.addSampleNotifications();
  },
  
  bindEvents() {
    this.openBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggle(); });
    this.dndToggle.addEventListener('change', (e) => this.toggleDND(e.target.checked));
    this.clearAllBtn.addEventListener('click', () => this.clearAll());
    document.addEventListener('click', (e) => {
      if (this.center.classList.contains('open') && !this.center.contains(e.target) && !this.openBtn.contains(e.target)) {
        this.close();
      }
    });
  },
  
  toggle() {
    this.center.classList.toggle('open');
    if (this.center.classList.contains('open')) this.clearBadge();
  },
  
  open() {
    this.center.classList.add('open');
    this.clearBadge();
  },
  
  close() {
    this.center.classList.remove('open');
  },
  
  toggleDND(enabled) {
    this.doNotDisturb = enabled;
    localStorage.setItem('dndMode', enabled);
  },
  
  addNotification(notification) {
    const id = Date.now();
    const newNotification = { id, app: notification.app || 'System', title: notification.title, body: notification.body, time: new Date(), ...notification };
    this.notifications.unshift(newNotification);
    this.saveNotifications();
    this.renderNotifications();
    if (!this.doNotDisturb) {
      this.showBanner(newNotification);
      this.updateBadge();
    }
    return id;
  },
  
  removeNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
    this.renderNotifications();
    this.updateBadge();
  },
  
  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.renderNotifications();
    this.clearBadge();
  },
  
  renderNotifications() {
    if (!this.notificationsList) return;
    if (this.notifications.length === 0) {
      this.notificationsList.innerHTML = '<div class="no-notifications" style="text-align: center; padding: 40px;"><span class="material-icons" style="font-size: 48px; opacity: 0.3;">notifications_none</span><p style="color: rgba(255,255,255,0.5); margin-top: 10px;">No notifications</p></div>';
      return;
    }
    this.notificationsList.innerHTML = this.notifications.map((n, index) => '<div class="notification-item" data-id="' + n.id + '"><button class="notification-close" onclick="NotificationCenter.removeNotification(' + n.id + ')"><span class="material-icons" style="font-size: 16px;">close</span></button><div class="notification-header"><span class="notification-app">' + n.app + '</span><span class="notification-time">' + this.formatTime(n.time) + '</span></div><div class="notification-title">' + n.title + '</div>' + (n.body ? '<div class="notification-body">' + n.body + '</div>' : '') + '</div>').join('');
  },
  
  showBanner(notification) {
    if (!this.bannersContainer) return;
    const banner = document.createElement('div');
    banner.className = 'notification-banner';
    banner.innerHTML = '<div class="notification-header"><span class="notification-app">' + notification.app + '</span><span class="notification-time">now</span></div><div class="notification-title">' + notification.title + '</div>' + (notification.body ? '<div class="notification-body">' + notification.body + '</div>' : '');
    this.bannersContainer.prepend(banner);
    setTimeout(() => { banner.classList.add('hiding'); setTimeout(() => banner.remove(), 300); }, 4000);
  },
  
  updateBadge() {
    if (!this.notificationBadge) return;
    const count = this.notifications.length;
    if (count > 0) {
      this.notificationBadge.textContent = count > 9 ? '9+' : count;
      this.notificationBadge.style.display = 'flex';
    } else { this.clearBadge(); }
  },
  
  clearBadge() {
    if (this.notificationBadge) this.notificationBadge.style.display = 'none';
  },
  
  formatTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return minutes + 'm ago';
    if (minutes < 1440) return Math.floor(minutes / 60) + 'h ago';
    return new Date(date).toLocaleDateString();
  },
  
  saveNotifications() { localStorage.setItem('notifications', JSON.stringify(this.notifications)); },
  
  loadNotifications() {
    const saved = localStorage.getItem('notifications');
    if (saved) { this.notifications = JSON.parse(saved); this.renderNotifications(); this.updateBadge(); }
    const dnd = localStorage.getItem('dndMode');
    if (dnd === 'true' && this.dndToggle) { this.doNotDisturb = true; this.dndToggle.checked = true; }
  },
  
  addSampleNotifications() {
    if (this.notifications.length === 0) {
      this.addNotification({ app: 'Mail', title: 'New Message', body: 'You have received a new email from John Doe' });
      this.addNotification({ app: 'Calendar', title: 'Upcoming Event', body: 'Team Meeting in 30 minutes' });
      this.addNotification({ app: 'Messages', title: 'New Message', body: 'Hey! Are you free for lunch today?' });
    }
  },
  
  startWorldClock() {
    const updateClocks = () => {
      const now = new Date();
      const cities = [{ id: 'clockNewYork', offset: -5 }, { id: 'clockLondon', offset: 0 }, { id: 'clockTokyo', offset: 9 }, { id: 'clockSydney', offset: 11 }];
      cities.forEach(city => {
        const el = document.getElementById(city.id);
        if (el) {
          const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
          const cityTime = new Date(utc + (3600000 * city.offset));
          el.textContent = cityTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        }
      });
    };
    updateClocks();
    setInterval(updateClocks, 1000);
  },
  
  initWidgetCalendar() {
    const grid = document.getElementById('widgetCalendarGrid');
    const monthEl = document.getElementById('widgetMonth');
    if (!grid || !monthEl) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    monthEl.textContent = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let html = '';
    for (let i = 0; i < firstDay; i++) html += '<span class="day other-month"></span>';
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === now.getDate();
      html += '<span class="day ' + (isToday ? 'today' : '') + '">' + day + '</span>';
    }
    grid.innerHTML = html;
  }
};

/* ==================== Calendar App ==================== */
const CalendarApp = {
  app: null,
  modal: null,
  form: null,
  titleEl: null,
  monthViewDays: null,
  miniCalendarGrid: null,
  miniMonth: null,
  weekViewHeader: null,
  weekViewGrid: null,
  dayViewHeader: null,
  dayViewGrid: null,
  currentDate: new Date(),
  selectedDate: new Date(),
  currentView: 'month',
  events: [],
  appNameEl: null,
  
  init() {
    this.app = document.getElementById('calendarApp');
    this.modal = document.getElementById('eventModal');
    this.form = document.getElementById('eventForm');
    this.titleEl = document.getElementById('calendarTitle');
    this.monthViewDays = document.getElementById('monthViewDays');
    this.miniCalendarGrid = document.getElementById('miniCalendarGrid');
    this.miniMonth = document.getElementById('miniMonth');
    this.weekViewHeader = document.getElementById('weekViewHeader');
    this.weekViewGrid = document.getElementById('weekViewGrid');
    this.dayViewHeader = document.getElementById('dayViewHeader');
    this.dayViewGrid = document.getElementById('dayViewGrid');
    
    if (!this.app) {
      console.error('Calendar App element not found');
      return;
    }
    
    this.appNameEl = document.createElement('li');
    this.appNameEl.className = 'leftLi app_name';
    this.appNameEl.id = 'Calendar';
    this.appNameEl.innerHTML = '<p>Calendar</p>';
    this.appNameEl.style.display = 'none';
    document.querySelector('.navbar ul').appendChild(this.appNameEl);
    
    this.loadEvents();
    this.bindEvents();
    this.render();
  },
  
  bindEvents() {
    document.querySelectorAll('.view-toggle').forEach(btn => { btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view)); });
    document.getElementById('calPrev')?.addEventListener('click', () => this.navigate(-1));
    document.getElementById('calNext')?.addEventListener('click', () => this.navigate(1));
    document.getElementById('miniPrev')?.addEventListener('click', () => this.navigate(-1));
    document.getElementById('miniNext')?.addEventListener('click', () => this.navigate(1));
    document.getElementById('todayBtn')?.addEventListener('click', () => this.goToToday());
    document.getElementById('addEventBtn')?.addEventListener('click', () => this.openModal());
    document.getElementById('closeEventModal')?.addEventListener('click', () => this.closeModal());
    document.getElementById('cancelEvent')?.addEventListener('click', () => this.closeModal());
    this.form?.addEventListener('submit', (e) => this.saveEvent(e));
    this.modal?.addEventListener('click', (e) => { if (e.target === this.modal) this.closeModal(); });
    document.querySelector('.close-calendar-app')?.addEventListener('click', () => this.closeApp());
    document.querySelector('.backfull-calendar-app')?.addEventListener('click', () => this.minimizeApp());
    document.querySelector('.full-calendar-app')?.addEventListener('click', () => this.maximizeApp());
    document.querySelectorAll('.color-filter input').forEach(checkbox => { checkbox.addEventListener('change', () => this.render()); });
    const calendarLaunchpad = document.querySelector('.child-launchpad[data-keywords="Calendar"]');
    if (calendarLaunchpad) { calendarLaunchpad.style.cursor = 'pointer'; calendarLaunchpad.addEventListener('click', () => this.openApp()); }
  },
  
  openApp() {
    this.app.style.display = 'block';
    this.appNameEl.style.display = 'block';
    document.querySelector('.container__Window').style.display = 'flex';
    document.querySelector('.launchpad').style.display = 'none';
    document.querySelector('.navbar').style.display = 'flex';
  },
  
  closeApp() { this.app.style.display = 'none'; this.appNameEl.style.display = 'none'; },
  minimizeApp() { this.app.style.maxWidth = '80%'; this.app.style.minWidth = '900px'; this.app.style.height = '500px'; },
  maximizeApp() { this.app.style.maxWidth = '95%'; this.app.style.minWidth = '95%'; this.app.style.height = '90%'; },
  
  switchView(view) {
    this.currentView = view;
    document.querySelectorAll('.view-toggle').forEach(btn => { btn.classList.toggle('active', btn.dataset.view === view); });
    document.querySelectorAll('.calendar-view').forEach(v => { v.classList.toggle('active', v.id === view + 'View'); });
    this.render();
  },
  
  navigate(direction) {
    if (this.currentView === 'month') this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    else if (this.currentView === 'week') this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
    else this.currentDate.setDate(this.currentDate.getDate() + direction);
    this.render();
  },
  
  goToToday() { this.currentDate = new Date(); this.selectedDate = new Date(); this.render(); },
  
  render() { this.renderTitle(); this.renderMiniCalendar(); if (this.currentView === 'month') this.renderMonthView(); else if (this.currentView === 'week') this.renderWeekView(); else this.renderDayView(); },
  
  renderTitle() {
    const options = this.currentView === 'day' ? { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' } : { month: 'long', year: 'numeric' };
    this.titleEl.textContent = this.currentDate.toLocaleDateString('en-US', options);
  },
  
  renderMiniCalendar() {
    if (!this.miniCalendarGrid || !this.miniMonth) return;
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    this.miniMonth.textContent = this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const today = new Date();
    let html = '';
    for (let i = firstDay - 1; i >= 0; i--) html += '<span class="day other-month">' + (prevMonthDays - i) + '</span>';
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      const isSelected = day === this.selectedDate.getDate() && month === this.selectedDate.getMonth() && year === this.selectedDate.getFullYear();
      html += '<span class="day ' + (isToday ? 'today' : '') + ' ' + (isSelected ? 'selected' : '') + '" data-day="' + day + '">' + day + '</span>';
    }
    const totalCells = firstDay + daysInMonth;
    const remainingCells = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
    for (let i = 1; i <= remainingCells; i++) html += '<span class="day other-month">' + i + '</span>';
    this.miniCalendarGrid.innerHTML = html;
    this.miniCalendarGrid.querySelectorAll('.day:not(.other-month)').forEach(dayEl => {
      dayEl.addEventListener('click', () => { this.selectedDate = new Date(year, month, parseInt(dayEl.dataset.day)); this.currentDate = new Date(year, month, parseInt(dayEl.dataset.day)); this.render(); });
    });
  },
  
  renderMonthView() {
    if (!this.monthViewDays) return;
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const today = new Date();
    let html = '';
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      html += this.renderDayCell(day, prevMonth, prevYear, true);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      html += this.renderDayCell(day, month, year, false, isToday);
    }
    const totalCells = firstDay + daysInMonth;
    const remainingCells = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      html += this.renderDayCell(i, nextMonth, nextYear, true);
    }
    this.monthViewDays.innerHTML = html;
    this.monthViewDays.querySelectorAll('.day-cell').forEach(cell => {
      cell.addEventListener('click', (e) => { if (!e.target.classList.contains('event-chip')) { this.selectedDate = new Date(cell.dataset.date); this.openModal(); } });
    });
  },
  
  renderDayCell(day, month, year, isOtherMonth, isToday = false) {
    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const dayEvents = this.getEventsForDate(dateStr);
    const enabledColors = this.getEnabledColors();
    const eventsHtml = dayEvents.filter(e => enabledColors.includes(e.color)).slice(0, 3).map(e => '<div class="event-chip ' + e.color + '">' + e.title + '</div>').join('');
    return '<div class="day-cell ' + (isOtherMonth ? 'other-month' : '') + ' ' + (isToday ? 'today' : '') + '" data-date="' + dateStr + '"><span class="day-number">' + day + '</span><div class="day-events">' + eventsHtml + '</div></div>';
  },
  
  renderWeekView() {
    if (!this.weekViewHeader || !this.weekViewGrid) return;
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let headerHtml = '<div class="header-cell"></div>';
    let gridHtml = '<div class="time-column">';
    for (let hour = 0; hour < 24; hour++) {
      const timeStr = hour === 0 ? '12 AM' : hour < 12 ? hour + ' AM' : hour === 12 ? '12 PM' : (hour - 12) + ' PM';
      gridHtml += '<div class="time-slot">' + timeStr + '</div>';
    }
    gridHtml += '</div>';
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      const isToday = date.toDateString() === today.toDateString();
      headerHtml += '<div class="header-cell ' + (isToday ? 'today' : '') + '"><div class="day-name">' + dayNames[i] + '</div><div class="day-number">' + date.getDate() + '</div></div>';
      gridHtml += '<div class="day-column">';
      for (let hour = 0; hour < 24; hour++) gridHtml += '<div class="hour-slot"></div>';
      gridHtml += '</div>';
    }
    this.weekViewHeader.innerHTML = headerHtml;
    this.weekViewGrid.innerHTML = gridHtml;
  },
  
  renderDayView() {
    if (!this.dayViewHeader || !this.dayViewGrid) return;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.dayViewHeader.innerHTML = '<div class="day-name">' + dayNames[this.currentDate.getDay()] + '</div><div class="day-number">' + this.currentDate.getDate() + '</div>';
    let gridHtml = '<div class="time-column">';
    for (let hour = 0; hour < 24; hour++) {
      const timeStr = hour === 0 ? '12 AM' : hour < 12 ? hour + ' AM' : hour === 12 ? '12 PM' : (hour - 12) + ' PM';
      gridHtml += '<div class="time-slot">' + timeStr + '</div>';
    }
    gridHtml += '</div><div class="day-slots">';
    for (let hour = 0; hour < 24; hour++) gridHtml += '<div class="hour-slot"></div>';
    gridHtml += '</div>';
    this.dayViewGrid.innerHTML = gridHtml;
  },
  
  openModal(date = null) {
    if (!this.modal) return;
    this.modal.classList.add('open');
    const eventStart = document.getElementById('eventStart');
    const eventEnd = document.getElementById('eventEnd');
    if (date) {
      const dateStr = date.toISOString().slice(0, 16);
      eventStart.value = dateStr;
      const endDate = new Date(date);
      endDate.setHours(endDate.getHours() + 1);
      eventEnd.value = endDate.toISOString().slice(0, 16);
    } else {
      const now = new Date();
      now.setMinutes(0);
      eventStart.value = now.toISOString().slice(0, 16);
      now.setHours(now.getHours() + 1);
      eventEnd.value = now.toISOString().slice(0, 16);
    }
  },
  
  closeModal() { 
    if (this.modal) this.modal.classList.remove('open'); 
    if (this.form) this.form.reset(); 
  },
  
  saveEvent(e) {
    e.preventDefault();
    const title = document.getElementById('eventTitle').value;
    const start = document.getElementById('eventStart').value;
    const end = document.getElementById('eventEnd').value;
    const color = document.querySelector('input[name="eventColor"]:checked').value;
    const reminder = document.getElementById('eventReminder').value;
    const notes = document.getElementById('eventNotes').value;
    const event = { id: Date.now(), title, start, end, color, reminder, notes };
    this.events.push(event);
    this.saveEvents();
    this.render();
    this.closeModal();
    NotificationCenter.addNotification({ app: 'Calendar', title: 'Event Created', body: title + ' has been added to your calendar' });
  },
  
  getEventsForDate(dateStr) { return this.events.filter(e => e.start.startsWith(dateStr)); },
  
  getEnabledColors() {
    const colors = [];
    document.querySelectorAll('.color-filter input:checked').forEach(cb => colors.push(cb.dataset.color));
    return colors;
  },
  
  saveEvents() { localStorage.setItem('calendarEvents', JSON.stringify(this.events)); },
  
  loadEvents() {
    const saved = localStorage.getItem('calendarEvents');
    if (saved) this.events = JSON.parse(saved);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { NotificationCenter.init(); CalendarApp.init(); });
} else {
  NotificationCenter.init();
  CalendarApp.init();
}
