/********** Notification Center **********/
const notificationCenter = {
  isOpen: false,
  dndEnabled: false,
  notifications: [],
  stackedNotifications: [],
  
  elements: {
    center: document.getElementById('notificationCenter'),
    notificationsList: document.getElementById('notificationsList'),
    clearAllBtn: document.getElementById('clearAllNotifications'),
    dndSwitch: document.getElementById('dndSwitch'),
    banner: document.getElementById('notificationBanner'),
    notificationStack: document.getElementById('notificationStack'),
    stackContent: null,
    stackToggle: null,
    stackCount: null
  },
  
  init() {
    // Re-check elements
    this.elements.center = document.getElementById('notificationCenter');
    this.elements.notificationsList = document.getElementById('notificationsList');
    this.elements.clearAllBtn = document.getElementById('clearAllNotifications');
    this.elements.dndSwitch = document.getElementById('dndSwitch');
    this.elements.banner = document.getElementById('notificationBanner');
    this.elements.notificationStack = document.getElementById('notificationStack');
    
    if (!this.elements.center) {
      console.error('Notification Center element not found!');
      return;
    }
    
    this.elements.stackContent = this.elements.notificationStack.querySelector('.stack-content');
    this.elements.stackToggle = this.elements.notificationStack.querySelector('.stack-toggle');
    this.elements.stackCount = this.elements.notificationStack.querySelector('.stack-count');
    
    this.bindEvents();
    this.loadFromStorage();
    this.updateWidgets();
  },
  
  bindEvents() {
    // Toggle notification center - use direct query to avoid scope issues
    const clockWrapper = document.querySelector('.clock');
    if (clockWrapper) {
      clockWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }
    
    // Close notification center when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && this.elements.center && 
          !this.elements.center.contains(e.target) && 
          !clockWrapper.contains(e.target)) {
        this.close();
      }
    });
    
    // Clear all notifications
    this.elements.clearAllBtn.addEventListener('click', () => {
      this.clearAll();
    });
    
    // DND toggle
    this.elements.dndSwitch.addEventListener('change', (e) => {
      this.dndEnabled = e.target.checked;
      this.saveToStorage();
    });
    
    // Stack toggle
    this.elements.stackToggle.addEventListener('click', () => {
      this.toggleStack();
    });
    
    // Close individual notification
    this.elements.notificationsList.addEventListener('click', (e) => {
      if (e.target.classList.contains('notification-close')) {
        const notificationItem = e.target.closest('.notification-item');
        if (notificationItem) {
          this.removeNotification(notificationItem);
        }
      }
    });
    
    // Banner click to open notification center
    this.elements.banner.addEventListener('click', () => {
      this.elements.banner.style.display = 'none';
      this.open();
    });
  },
  
  toggle() {
    console.log('Toggle Notification Center, current state:', this.isOpen);
    this.isOpen ? this.close() : this.open();
  },
  
  open() {
    console.log('Opening Notification Center');
    if (this.elements.center) {
      this.elements.center.classList.add('open');
      this.isOpen = true;
      console.log('Notification Center opened');
    } else {
      console.error('Notification Center element not found!');
    }
  },
  
  close() {
    console.log('Closing Notification Center');
    if (this.elements.center) {
      this.elements.center.classList.remove('open');
      this.isOpen = false;
      console.log('Notification Center closed');
    }
  },
  
  addNotification(title, message, icon = '🔔', type = 'system') {
    if (this.dndEnabled) return;
    
    const notification = {
      id: Date.now(),
      title,
      message,
      icon,
      type,
      time: 'Just now'
    };
    
    this.notifications.push(notification);
    
    // Check if we need to stack
    if (this.notifications.length > 5) {
      this.stackedNotifications.push(this.notifications.shift());
      this.updateStack();
    }
    
    this.renderNotifications();
    this.showBanner(title, message, icon);
    this.saveToStorage();
  },
  
  removeNotification(element) {
    const index = Array.from(this.elements.notificationsList.children).indexOf(element);
    if (index > -1) {
      this.notifications.splice(index, 1);
      element.remove();
      this.saveToStorage();
    }
  },
  
  clearAll() {
    this.notifications = [];
    this.stackedNotifications = [];
    this.elements.notificationsList.innerHTML = '';
    this.elements.notificationStack.style.display = 'none';
    this.saveToStorage();
  },
  
  renderNotifications() {
    this.elements.notificationsList.innerHTML = this.notifications.map(notif => `
      <div class="notification-item ${notif.type}-notification" data-id="${notif.id}">
        <div class="notification-icon">${notif.icon}</div>
        <div class="notification-content">
          <div class="notification-title">${notif.title}</div>
          <div class="notification-message">${notif.message}</div>
          <div class="notification-time">${notif.time}</div>
        </div>
        <button class="notification-close">×</button>
      </div>
    `).join('');
  },
  
  updateStack() {
    if (this.stackedNotifications.length > 0) {
      this.elements.notificationStack.style.display = 'block';
      this.elements.stackCount.textContent = `${this.stackedNotifications.length} Notifications`;
      
      this.elements.stackContent.innerHTML = this.stackedNotifications.map(notif => `
        <div class="notification-item ${notif.type}-notification" data-id="${notif.id}">
          <div class="notification-icon">${notif.icon}</div>
          <div class="notification-content">
            <div class="notification-title">${notif.title}</div>
            <div class="notification-message">${notif.message}</div>
          </div>
        </div>
      `).join('');
    }
  },
  
  toggleStack() {
    const isOpen = this.elements.stackContent.classList.contains('open');
    if (isOpen) {
      this.elements.stackContent.classList.remove('open');
      this.elements.stackToggle.textContent = 'Show';
    } else {
      this.elements.stackContent.classList.add('open');
      this.elements.stackToggle.textContent = 'Hide';
    }
  },
  
  showBanner(title, message, icon = '📧') {
    const banner = this.elements.banner;
    banner.querySelector('.banner-title').textContent = title;
    banner.querySelector('.banner-message').textContent = message;
    banner.querySelector('.banner-icon').textContent = icon;
    banner.style.display = 'flex';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      banner.style.animation = 'bannerSlideOut 0.4s cubic-bezier(0.79, 0.14, 0.15, 0.86) forwards';
      setTimeout(() => {
        banner.style.display = 'none';
        banner.style.animation = '';
      }, 400);
    }, 5000);
  },
  
  updateWidgets() {
    this.updateCalendarWidget();
    this.updateClockWidget();
    this.updateWeatherWidget();
    this.updateStocksWidget();
    
    // Update every minute
    setInterval(() => {
      this.updateCalendarWidget();
      this.updateClockWidget();
    }, 60000);
  },
  
  updateCalendarWidget() {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    document.getElementById('cwDay').textContent = days[now.getDay()];
    document.getElementById('cwDate').textContent = now.getDate();
    
    // Update events from calendar app
    const events = calendarApp.getTodaysEvents();
    const eventsContainer = document.getElementById('cwEvents');
    
    if (events.length > 0) {
      eventsContainer.innerHTML = events.slice(0, 2).map(event => `
        <div class="cw-event">
          <span class="cw-event-time">${event.time}</span>
          <span class="cw-event-title">${event.title}</span>
        </div>
      `).join('');
    } else {
      eventsContainer.innerHTML = '<div class="cw-event" style="color: rgba(255,255,255,0.5); font-size: 11px;">No events today</div>';
    }
  },
  
  updateClockWidget() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    document.getElementById('digitalClock').textContent = `${hours}:${minutes}`;
    
    // Update analog clock
    const hourDeg = (now.getHours() % 12 + now.getMinutes() / 60) * 30;
    const minuteDeg = (now.getMinutes() + now.getSeconds() / 60) * 6;
    const secondDeg = now.getSeconds() * 6;
    
    document.getElementById('hourHand').style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    document.getElementById('minuteHand').style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
    document.getElementById('secondHand').style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;
  },
  
  updateWeatherWidget() {
    // Simulated weather data
    const conditions = ['☀️', '⛅', '☁️', '🌧️', '⛈️'];
    const conditionNames = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'];
    const randomIndex = Math.floor(Math.random() * conditions.length);
    const temp = Math.floor(Math.random() * 15) + 18;
    const high = temp + Math.floor(Math.random() * 5) + 3;
    const low = temp - Math.floor(Math.random() * 8) - 2;
    const humidity = Math.floor(Math.random() * 40) + 40;
    
    const widget = document.querySelector('.weather-widget');
    widget.querySelector('.ww-icon').textContent = conditions[randomIndex];
    widget.querySelector('.ww-current-temp').textContent = `${temp}°`;
    widget.querySelector('.ww-condition').textContent = conditionNames[randomIndex];
    widget.querySelector('.ww-details').innerHTML = `
      <span>H: ${high}° L: ${low}°</span>
      <span>Humidity: ${humidity}%</span>
    `;
  },
  
  updateStocksWidget() {
    const stocks = [
      { symbol: 'AAPL', base: 178.52 },
      { symbol: 'GOOGL', base: 141.23 },
      { symbol: 'MSFT', base: 378.91 }
    ];
    
    const stockItems = document.querySelectorAll('.stock-item');
    stockItems.forEach((item, index) => {
      const stock = stocks[index];
      const change = (Math.random() - 0.5) * 4;
      const price = (stock.base + change).toFixed(2);
      const changePercent = (change / stock.base * 100).toFixed(2);
      const isPositive = change >= 0;
      
      item.querySelector('.stock-price').textContent = `$${price}`;
      const changeElement = item.querySelector('.stock-change');
      changeElement.textContent = `${isPositive ? '+' : ''}${changePercent}%`;
      changeElement.className = `stock-change ${isPositive ? 'positive' : 'negative'}`;
    });
  },
  
  saveToStorage() {
    const data = {
      dndEnabled: this.dndEnabled,
      notifications: this.notifications,
      stackedNotifications: this.stackedNotifications
    };
    localStorage.setItem('notificationCenter', JSON.stringify(data));
  },
  
  loadFromStorage() {
    const data = localStorage.getItem('notificationCenter');
    if (data) {
      const parsed = JSON.parse(data);
      this.dndEnabled = parsed.dndEnabled || false;
      this.notifications = parsed.notifications || [];
      this.stackedNotifications = parsed.stackedNotifications || [];
      
      this.elements.dndSwitch.checked = this.dndEnabled;
      this.renderNotifications();
      this.updateStack();
    }
  }
};

/********** Calendar App **********/
const calendarApp = {
  currentDate: new Date(),
  selectedDate: new Date(),
  currentView: 'month',
  events: [],
  
  elements: {
    app: null,
    window: document.querySelector('.calendar-app'),
    close: document.querySelector('.close-calendar'),
    backfull: document.querySelector('.backfull-calendar'),
    full: document.querySelector('.full-calendar'),
    point: document.getElementById('point-calendar'),
    opening: null,
    openingLaunchpad: null,
    prevMonth: document.getElementById('prevMonth'),
    nextMonth: document.getElementById('nextMonth'),
    currentMonth: document.getElementById('currentMonth'),
    viewBtns: document.querySelectorAll('.cal-view-btn'),
    addEventBtn: document.getElementById('addEventBtn'),
    calendarGrid: document.getElementById('calendarGrid'),
    monthView: document.getElementById('monthView'),
    weekView: document.getElementById('weekView'),
    dayView: document.getElementById('dayView'),
    eventModal: document.getElementById('eventModal'),
    eventForm: document.getElementById('eventForm'),
    closeModal: document.getElementById('closeModal'),
    cancelEvent: document.getElementById('cancelEvent'),
    weekDays: document.getElementById('weekDays'),
    weekViewContent: document.getElementById('weekViewContent'),
    dayViewHeader: document.getElementById('dayViewHeader'),
    dayViewContent: document.getElementById('dayViewContent')
  },
  
  init() {
    this.loadEvents();
    this.bindEvents();
    this.renderMonthView();
    this.updateLaunchpadIcons();
    
    // Make calendar draggable
    $(function() {
      $(".calendar-app").draggable();
    });
  },
  
  updateLaunchpadIcons() {
    this.elements.openingLaunchpad = document.querySelector('.child-launchpad[data-keywords="Calendar"]');
    if (this.elements.openingLaunchpad) {
      this.elements.openingLaunchpad.addEventListener('click', () => this.open());
    }
  },
  
  bindEvents() {
    // Navigation
    this.elements.prevMonth.addEventListener('click', () => this.navigateMonth(-1));
    this.elements.nextMonth.addEventListener('click', () => this.navigateMonth(1));
    
    // View switching
    this.elements.viewBtns.forEach(btn => {
      btn.addEventListener('click', () => this.switchView(btn.dataset.view));
    });
    
    // Add event
    this.elements.addEventBtn.addEventListener('click', () => this.openEventModal());
    
    // Modal
    this.elements.closeModal.addEventListener('click', () => this.closeEventModal());
    this.elements.cancelEvent.addEventListener('click', () => this.closeEventModal());
    this.elements.eventForm.addEventListener('submit', (e) => this.saveEvent(e));
    
    // Window controls
    this.elements.close.addEventListener('click', () => this.close());
    this.elements.full.addEventListener('click', () => this.maximize());
    this.elements.backfull.addEventListener('click', () => this.minimize());
  },
  
  open() {
    this.elements.window.style.display = 'block';
    launchpad.container.style.display = 'flex';
    launchpad.window.style.display = 'none';
    this.renderMonthView();
  },
  
  close() {
    this.elements.window.style.display = 'none';
  },
  
  maximize() {
    this.elements.window.style.maxWidth = '95%';
    this.elements.window.style.minWidth = '95%';
    this.elements.window.style.height = '90%';
  },
  
  minimize() {
    this.elements.window.style.maxWidth = '90%';
    this.elements.window.style.minWidth = '800px';
    this.elements.window.style.height = '600px';
  },
  
  navigateMonth(direction) {
    this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    this.renderMonthView();
  },
  
  switchView(view) {
    this.currentView = view;
    
    // Update button states
    this.elements.viewBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    // Show/hide views
    this.elements.monthView.style.display = view === 'month' ? 'flex' : 'none';
    this.elements.weekView.style.display = view === 'week' ? 'flex' : 'none';
    this.elements.dayView.style.display = view === 'day' ? 'flex' : 'none';
    
    // Render appropriate view
    if (view === 'month') this.renderMonthView();
    else if (view === 'week') this.renderWeekView();
    else if (view === 'day') this.renderDayView();
  },
  
  renderMonthView() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    this.elements.currentMonth.textContent = `${months[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    // Get previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    let html = '';
    let dayCount = 1;
    let nextMonthDay = 1;
    
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const cellIndex = week * 7 + day;
        
        if (cellIndex < startingDay) {
          // Previous month days
          const prevDay = prevMonthLastDay - startingDay + cellIndex + 1;
          html += this.createDayCell(prevDay, true);
        } else if (dayCount <= totalDays) {
          // Current month days
          html += this.createDayCell(dayCount, false);
          dayCount++;
        } else {
          // Next month days
          html += this.createDayCell(nextMonthDay, true);
          nextMonthDay++;
        }
      }
    }
    
    this.elements.calendarGrid.innerHTML = html;
    
    // Add click events to days
    this.elements.calendarGrid.querySelectorAll('.calendar-day').forEach(cell => {
      cell.addEventListener('click', () => {
        const day = cell.querySelector('.calendar-day-number').textContent;
        if (!cell.classList.contains('other-month')) {
          this.selectedDate = new Date(year, month, parseInt(day));
          this.highlightSelectedDay();
        }
      });
    });
  },
  
  createDayCell(day, isOtherMonth) {
    const today = new Date();
    const isToday = !isOtherMonth && 
                   day === today.getDate() && 
                   this.currentDate.getMonth() === today.getMonth() && 
                   this.currentDate.getFullYear() === today.getFullYear();
    
    // Get events for this day
    const cellDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
    const dayEvents = this.getEventsForDate(cellDate);
    
    let eventsHtml = '';
    if (dayEvents.length > 0) {
      eventsHtml = '<div class="calendar-day-events">';
      // Show dots for multiple events
      if (dayEvents.length <= 3) {
        dayEvents.slice(0, 3).forEach(event => {
          eventsHtml += `<div class="calendar-event-dot ${event.color}"></div>`;
        });
      } else {
        eventsHtml += `<div class="calendar-event-item ${dayEvents[0].color}">${dayEvents.length} events</div>`;
      }
      eventsHtml += '</div>';
    }
    
    return `
      <div class="calendar-day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}">
        <div class="calendar-day-number">${day}</div>
        ${eventsHtml}
      </div>
    `;
  },
  
  highlightSelectedDay() {
    this.elements.calendarGrid.querySelectorAll('.calendar-day').forEach(cell => {
      cell.classList.remove('selected');
      const day = cell.querySelector('.calendar-day-number').textContent;
      if (!cell.classList.contains('other-month') && 
          parseInt(day) === this.selectedDate.getDate()) {
        cell.classList.add('selected');
      }
    });
  },
  
  renderWeekView() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Render week header
    let headerHtml = '<div class="week-day-header"></div>';
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      const isToday = dayDate.toDateString() === today.toDateString();
      
      headerHtml += `
        <div class="week-day-header ${isToday ? 'today' : ''}">
          <div class="week-day-name">${days[i]}</div>
          <div class="week-day-number">${dayDate.getDate()}</div>
        </div>
      `;
    }
    this.elements.weekDays.innerHTML = headerHtml;
    
    // Render week content (hours)
    let contentHtml = '<div class="week-hours-column">';
    for (let hour = 0; hour < 24; hour++) {
      const timeStr = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
      contentHtml += `<div class="week-hour-cell">${timeStr}</div>`;
    }
    contentHtml += '</div><div class="week-days-container">';
    
    for (let day = 0; day < 7; day++) {
      contentHtml += '<div class="week-day-column-content">';
      for (let hour = 0; hour < 24; hour++) {
        contentHtml += '<div class="week-day-cell"></div>';
      }
      contentHtml += '</div>';
    }
    contentHtml += '</div>';
    
    this.elements.weekViewContent.innerHTML = contentHtml;
  },
  
  renderDayView() {
    const today = this.selectedDate;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Render header
    const dayEvents = this.getEventsForDate(today);
    this.elements.dayViewHeader.innerHTML = `
      <div class="day-view-date">${days[today.getDay()]}, ${months[today.getMonth()]} ${today.getDate()}</div>
      <div class="day-view-events-count">${dayEvents.length} events</div>
    `;
    
    // Render hours
    let contentHtml = '<div class="day-hours-column">';
    for (let hour = 0; hour < 24; hour++) {
      const timeStr = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
      contentHtml += `<div class="day-hour-cell">${timeStr}</div>`;
    }
    contentHtml += '</div><div class="day-events-column">';
    
    for (let hour = 0; hour < 24; hour++) {
      contentHtml += '<div class="day-event-cell"></div>';
    }
    contentHtml += '</div>';
    
    this.elements.dayViewContent.innerHTML = contentHtml;
  },
  
  openEventModal(date = null) {
    const eventDate = date || this.selectedDate;
    document.getElementById('eventDate').value = eventDate.toISOString().split('T')[0];
    document.getElementById('eventTime').value = '09:00';
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventReminder').value = 'none';
    document.querySelector('input[name="eventColor"][value="blue"]').checked = true;
    
    this.elements.eventModal.style.display = 'flex';
  },
  
  closeEventModal() {
    this.elements.eventModal.style.display = 'none';
  },
  
  saveEvent(e) {
    e.preventDefault();
    
    const event = {
      id: Date.now(),
      title: document.getElementById('eventTitle').value,
      date: document.getElementById('eventDate').value,
      time: document.getElementById('eventTime').value,
      reminder: document.getElementById('eventReminder').value,
      color: document.querySelector('input[name="eventColor"]:checked').value
    };
    
    this.events.push(event);
    this.saveEvents();
    this.closeEventModal();
    this.renderMonthView();
    
    // Show notification
    notificationCenter.addNotification(
      'Calendar',
      `Event "${event.title}" added for ${event.date} at ${event.time}`,
      '📅',
      'calendar'
    );
  },
  
  getEventsForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return this.events.filter(event => event.date === dateStr);
  },
  
  getTodaysEvents() {
    const today = new Date().toISOString().split('T')[0];
    return this.events.filter(event => event.date === today);
  },
  
  saveEvents() {
    localStorage.setItem('calendarEvents', JSON.stringify(this.events));
  },
  
  loadEvents() {
    const saved = localStorage.getItem('calendarEvents');
    if (saved) {
      this.events = JSON.parse(saved);
    }
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  notificationCenter.init();
  calendarApp.init();
  
  // Add calendar app to existing app management
  const calendarAppRef = {
    app_name: document.querySelector('#calendar-app-name') || document.createElement('li'),
    window: calendarApp.elements.window,
    full: calendarApp.elements.full,
    close: calendarApp.elements.close,
    backfull: calendarApp.elements.backfull,
    point: calendarApp.elements.point,
    opening: document.querySelector('.open-calendar') || document.createElement('button')
  };
  
  // Test notification after 2 seconds
  setTimeout(() => {
    notificationCenter.addNotification(
      'Welcome',
      'Notification Center is now active! Click the clock to open.',
      '🎉',
      'system'
    );
  }, 2000);
});

// Update clock widget every second for smooth animation
setInterval(() => {
  const now = new Date();
  const secondDeg = now.getSeconds() * 6;
  const minuteDeg = (now.getMinutes() + now.getSeconds() / 60) * 6;
  const hourDeg = (now.getHours() % 12 + now.getMinutes() / 60) * 30;
  
  const secondHand = document.getElementById('secondHand');
  const minuteHand = document.getElementById('minuteHand');
  const hourHand = document.getElementById('hourHand');
  
  if (secondHand) secondHand.style.transform = `translateX(-50%) rotate(${secondDeg}deg)`;
  if (minuteHand) minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
  if (hourHand) hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
}, 1000);
