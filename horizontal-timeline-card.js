// =========================================
// HORIZONTAL TIMELINE CARD - SESIÓN 4 COMPLETA
// =========================================

class HorizontalTimelineCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._debounceTimers = {};
  }

  setConfig(config) {
    this._config = config;
    this.render();
  }

  get value() {
    return this._config;
  }

  render() {
    if (!this.shadowRoot) return;

    const entities = this._config.entities || (this._config.entity ? [this._config.entity] : []);
    const entitiesStr = entities.join(',');

    this.shadowRoot.innerHTML = `
      <style>
        .row { display: flex; align-items: center; margin-bottom: 12px; }
        .row label { width: 140px; margin-right: 12px; font-size: 14px; }
        .row .flex { flex-grow: 1; }
        .section-title { font-weight: bold; margin: 16px 0 8px 0; color: var(--primary-text-color); border-bottom: 1px solid var(--divider-color); padding-bottom: 4px; }
        input[type=color] { width: 40px; height: 28px; border: none; padding: 0; margin: 0; cursor: pointer; }
        .toggle-label { margin-left: 8px; }
        .help-text { font-size: 0.85em; color: var(--secondary-text-color); margin-top: 4px; font-style: italic; }
      </style>

      <div class="card-config">
        <div class="section-title">General Information</div>
        <div class="row">
          <label>Title:</label>
          <ha-textfield class="flex" value="${this._config.title || ''}" configValue="title"></ha-textfield>
        </div>
        <div class="row">
          <label>Description:</label>
          <ha-textfield class="flex" value="${this._config.description || ''}" configValue="description" placeholder="Optional description"></ha-textfield>
        </div>
        
        <div class="row">
          <label>Calendars:</label>
          <input type="text" class="flex" value="${entitiesStr}" configValue="entities" placeholder="calendar.one,calendar.two">
        </div>
        <div class="help-text" style="margin-left: 152px;">Separate multiple calendars with commas</div>

        <div class="row">
          <label>Start Date:</label>
          <input type="text" class="flex" value="${this._config.start_date || ''}" configValue="start_date" placeholder="YYYY-MM-DD">
        </div>
        <div class="row">
          <label>End Date:</label>
          <input type="text" class="flex" value="${this._config.end_date || ''}" configValue="end_date" placeholder="YYYY-MM-DD">
        </div>

        <div class="section-title">Display Options</div>
        <div class="row">
          <label>Marker Style:</label>
          <select class="flex" configValue="marker_style" style="padding: 8px; border-radius: 4px; border: 1px solid var(--divider-color);">
            <option value="circle" ${this._config.marker_style === 'circle' || !this._config.marker_style ? 'selected' : ''}>● Circle</option>
            <option value="square" ${this._config.marker_style === 'square' ? 'selected' : ''}>■ Square</option>
          </select>
        </div>

        <div class="row">
          <label>Fixed Names:</label>
          <ha-switch ${this._config.show_names ? 'checked' : ''} configValue="show_names"></ha-switch>
        </div>

        <div class="row">
          <label>Labels Position:</label>
          <ha-switch ${this._config.labels_position === 'top' ? 'checked' : ''} configValue="labels_position"></ha-switch>
          <span class="toggle-label" id="labels-text">${this._config.labels_position === 'top' ? 'Top' : 'Bottom'}</span>
        </div>

        <div class="row">
          <label>Intermediate Dates:</label>
          <ha-switch ${this._config.show_intermediate_dates !== false ? 'checked' : ''} configValue="show_intermediate_dates"></ha-switch>
        </div>

        <div class="row">
          <label>Group Events:</label>
          <ha-switch ${this._config.group_nearby_events !== false ? 'checked' : ''} configValue="group_nearby_events"></ha-switch>
        </div>

        <div class="section-title">Event List</div>
        <div class="row">
          <label>Show List:</label>
          <ha-switch ${this._config.show_event_list !== false ? 'checked' : ''} configValue="show_event_list"></ha-switch>
        </div>
        <div class="row">
          <label>List Collapsed:</label>
          <ha-switch ${this._config.event_list_collapsed ? 'checked' : ''} configValue="event_list_collapsed"></ha-switch>
        </div>
        <div class="row">
          <label>Show Description:</label>
          <ha-switch ${this._config.show_event_description !== false ? 'checked' : ''} configValue="show_event_description"></ha-switch>
        </div>
        <div class="row">
          <label>Days Counter:</label>
          <ha-switch ${this._config.show_countdown !== false ? 'checked' : ''} configValue="show_countdown"></ha-switch>
        </div>
        <div class="row">
          <label>Auto Colors:</label>
          <ha-switch ${this._config.auto_color_events !== false ? 'checked' : ''} configValue="auto_color_events"></ha-switch>
        </div>

        <div class="section-title">Filters and Statistics</div>
        <div class="row">
          <label>Calendar Filters:</label>
          <ha-switch ${this._config.show_calendar_filters !== false ? 'checked' : ''} configValue="show_calendar_filters"></ha-switch>
        </div>
        <div class="row">
          <label>Show Statistics:</label>
          <ha-switch ${this._config.show_statistics !== false ? 'checked' : ''} configValue="show_statistics"></ha-switch>
        </div>

        <div class="section-title">Automatic Icons</div>
        <div class="row">
          <label>Enable Auto-Icons:</label>
          <ha-switch ${this._config.auto_icons !== false ? 'checked' : ''} configValue="auto_icons"></ha-switch>
        </div>
        <div class="help-text" style="margin-left: 152px;">Keywords: birthday→🎂, meeting→👥, vacation→✈️, doctor→🏥, etc.</div>

        <div class="section-title">Custom Colors</div>
        <div class="row">
          <label>Line Color:</label>
          <input type="color" class="flex" value="${this._config.line_color || '#03a9f4'}" configValue="line_color">
        </div>
        <div class="row">
          <label>Dot Color:</label>
          <input type="color" class="flex" value="${this._config.dot_color || '#ff4081'}" configValue="dot_color">
        </div>
        <div class="row">
          <label>Today Color:</label>
          <input type="color" class="flex" value="${this._config.today_color || '#ff4081'}" configValue="today_color">
        </div>
      </div>
    `;

    this._setupEntityPicker();

    const labelsText = this.shadowRoot.getElementById('labels-text');

    this.shadowRoot.querySelectorAll('ha-textfield, ha-switch, ha-entity-picker, input[type=text], input[type=color], select').forEach(input => {
      input.addEventListener('input', e => this._debounceValueChanged(e, 300));
      input.addEventListener('change', e => {
        this._valueChanged(e);
        if (input.getAttribute('configValue') === 'labels_position') {
          labelsText.textContent = e.target.checked ? 'Top' : 'Bottom';
        }
      });
      input.addEventListener('value-changed', e => this._valueChanged(e));
    });
  }

  _setupEntityPicker() {
    if (this.shadowRoot && this._hass) {
      const entityPicker = this.shadowRoot.querySelector('ha-entity-picker');
      if (entityPicker) {
        entityPicker.hass = this._hass;
        entityPicker.includeDomains = ['calendar'];
      }
    }
  }

  _debounceValueChanged(e, delay) {
    const key = e.target.getAttribute('configValue');
    if (!key) return;
    clearTimeout(this._debounceTimers[key]);
    this._debounceTimers[key] = setTimeout(() => this._valueChanged(e), delay);
  }

  _valueChanged(e) {
    if (!this._config || !e.target) return;
    const target = e.target;
    const newConfig = { ...this._config };
    const key = target.getAttribute('configValue');
    if (!key) return;

    if (target.type === 'checkbox' || target.tagName === 'HA-SWITCH') {
      if (key === 'labels_position') {
        newConfig[key] = target.checked ? 'top' : 'bottom';
      } else {
        newConfig[key] = target.checked;
      }
    } else if (key === 'entities') {
      newConfig[key] = target.value.split(',').map(s => s.trim()).filter(s => s);
      delete newConfig.entity;
    } else {
      newConfig[key] = target.value;
    }

    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    }));
  }

  set hass(hass) {
    this._hass = hass;
    this._setupEntityPicker();
  }
}

customElements.define("horizontal-timeline-card-editor", HorizontalTimelineCardEditor);


// =========================================
// CLASE PRINCIPAL DE LA TARJETA
// =========================================

class HorizontalTimelineCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._eventListExpanded = true;
    this._currentStartDate = null;
    this._currentEndDate = null;
    this._activeCalendars = new Set(); // Para filtros
    this._highlightedEventIndex = null; // Para highlight
  }

  setConfig(config) {
    if (config.entity && !config.entities) {
      config.entities = [config.entity];
    }
    
    if (!config.entities || config.entities.length === 0) {
      throw new Error("Please define at least one calendar in 'entities'.");
    }
    if (!config.start_date) throw new Error("Please define a start date (start_date).");

    this._config = {
      title: "Timeline",
      description: "",
      end_date: new Date().toISOString().slice(0, 10),
      show_names: false,
      labels_position: "bottom",
      line_color: "var(--primary-color)",
      dot_color: "var(--accent-color)",
      today_color: "var(--accent-color)",
      date_format: { year: "numeric", month: "2-digit", day: "2-digit" },
      show_event_list: true,
      event_list_collapsed: false,
      show_event_description: true,
      show_countdown: true,
      auto_color_events: true,
      show_intermediate_dates: true,
      show_calendar_filters: true,
      show_statistics: true,
      group_nearby_events: true,
      auto_icons: true,
      marker_style: "circle",
      icon_keywords: {
        'birthday': 'mdi:cake',
        'cumpleaños': 'mdi:cake',
        'meeting': 'mdi:account-group',
        'reunión': 'mdi:account-group',
        'vacation': 'mdi:airplane',
        'vacaciones': 'mdi:airplane',
        'doctor': 'mdi:hospital',
        'médico': 'mdi:hospital',
        'dentist': 'mdi:tooth',
        'dentista': 'mdi:tooth',
        'gym': 'mdi:dumbbell',
        'gimnasio': 'mdi:dumbbell',
        'work': 'mdi:briefcase',
        'trabajo': 'mdi:briefcase',
        'school': 'mdi:school',
        'escuela': 'mdi:school',
        'shopping': 'mdi:cart',
        'compras': 'mdi:cart',
      },
      ...config,
    };

    this.events = [];
    this._eventListExpanded = !this._config.event_list_collapsed;
    this._currentStartDate = this._config.start_date;
    this._currentEndDate = this._config.end_date;
    
    // Inicializar todos los calendarios como activos
    this._activeCalendars = new Set(this._config.entities);
  }

  static async getConfigElement() {
    return document.createElement("horizontal-timeline-card-editor");
  }

  static getStubConfig() {
    return {
      entities: ["calendar.birthdays"],
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10),
      title: "My Timeline",
      description: "Optional timeline description",
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (this.events.length === 0) {
      this.getAllCalendarEvents().then((events) => {
        this.events = this.parseEvents(events);
        this._render();
      });
    } else {
      this._render();
    }
  }

  async getAllCalendarEvents() {
    const allEvents = [];
    
    const startDate = new Date(this._currentStartDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(this._currentEndDate);
    endDate.setHours(23, 59, 59, 999);
    
    for (const entity of this._config.entities) {
      const url = `calendars/${entity}?start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
      try {
        const events = await this._hass.callApi("GET", url);
        allEvents.push(...events.map(e => ({ ...e, calendar: entity })));
      } catch (e) {
        console.error(`Error al obtener eventos de ${entity}:`, e);
      }
    }
    
    return allEvents;
  }

  generateColors(count) {
    const colors = [];
    const hueStep = 360 / count;
    for (let i = 0; i < count; i++) {
      const hue = (i * hueStep) % 360;
      const saturation = 65 + (i % 3) * 10;
      const lightness = 50 + (i % 2) * 10;
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
  }

  // NUEVO: Detectar icono automático por palabras clave
  _detectAutoIcon(summary) {
    if (!this._config.auto_icons) return null;
    
    const lowerSummary = summary.toLowerCase();
    for (const [keyword, icon] of Object.entries(this._config.icon_keywords)) {
      if (lowerSummary.includes(keyword.toLowerCase())) {
        return icon;
      }
    }
    return null;
  }

  parseEvents(events) {
    const autoColors = this._config.auto_color_events ? this.generateColors(events.length) : null;
    return events.map((event, index) => {
      const autoIcon = this._detectAutoIcon(event.summary);
      
      const parsed = {
        summary: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        color: autoColors ? autoColors[index] : this._config.dot_color,
        icon: autoIcon || this._config.icon,
        description: event.description || "",
        calendar: event.calendar || "",
      };
      
      if (event.description && !this._config.auto_color_events) {
        event.description.split("\n").forEach((line) => {
          if (line.startsWith("color:")) parsed.color = line.split(/:(.*)/s)[1].trim();
          if (line.startsWith("icon:") && !autoIcon) parsed.icon = line.split(/:(.*)/s)[1].trim();
        });
      }
      return parsed;
    });
  }

  calculateEventLevels(events, totalDuration, startDate) {
    // Siempre retornar nivel 0 para todos los eventos
    return events.map(() => 0);
  }

  // NUEVO: Detectar y agrupar eventos cercanos
  _groupNearbyEvents(events, totalDuration, startDate) {
    if (!this._config.group_nearby_events) return [];
    
    const calculatePosition = (dateStr) =>
      ((new Date(dateStr).getTime() - startDate.getTime()) / totalDuration) * 100;
    
    const groups = [];
    const sortedEvents = events.map((e, i) => ({ event: e, index: i, position: calculatePosition(e.start) }))
      .sort((a, b) => a.position - b.position);
    
    let currentGroup = null;
    const groupThreshold = 3; // eventos dentro de 3% se agrupan
    
    sortedEvents.forEach(item => {
      if (!currentGroup) {
        currentGroup = { events: [item], startPos: item.position };
      } else if (item.position - currentGroup.startPos < groupThreshold) {
        currentGroup.events.push(item);
      } else {
        if (currentGroup.events.length > 2) {
          groups.push(currentGroup);
        }
        currentGroup = { events: [item], startPos: item.position };
      }
    });
    
    if (currentGroup && currentGroup.events.length > 2) {
      groups.push(currentGroup);
    }
    
    return groups;
  }

  calculateIntermediateDates(startDate, endDate) {
    const dates = [];
    const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    let step, format;
    if (totalDays <= 14) {
      step = 1;
      format = { month: 'short', day: 'numeric' };
    } else if (totalDays <= 60) {
      step = 3;
      format = { month: 'short', day: 'numeric' };
    } else if (totalDays <= 180) {
      step = 7;
      format = { month: 'short', day: 'numeric' };
    } else if (totalDays <= 365) {
      step = 30;
      format = { month: 'short' };
    } else {
      step = 60;
      format = { month: 'short', year: 'numeric' };
    }

    for (let i = step; i < totalDays - step; i += step) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      dates.push({ date, format });
    }

    return dates;
  }

  // NUEVO: Calcular estadísticas
  _calculateStatistics(events) {
    const now = new Date();
    const startDate = new Date(this._currentStartDate);
    const endDate = new Date(this._currentEndDate);
    
    const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalMonths = Math.max(1, Math.floor(totalDays / 30));
    
    const pastEvents = events.filter(e => new Date(e.start) < now);
    const futureEvents = events.filter(e => new Date(e.start) >= now);
    const upcomingEvents = futureEvents.filter(e => {
      const daysUntil = Math.floor((new Date(e.start) - now) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7;
    });
    
    return {
      total: events.length,
      past: pastEvents.length,
      future: futureEvents.length,
      upcoming: upcomingEvents.length,
      avgPerMonth: (events.length / totalMonths).toFixed(1),
    };
  }

  // NUEVO: Calcular días hasta/desde evento
  _calculateDaysToEvent(eventDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);
    
    const diffTime = event - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `In ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffDays < 0) {
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
    } else {
      return 'Today!';
    }
  }

  _toggleEventList() {
    this._eventListExpanded = !this._eventListExpanded;
    this._render();
  }

  // NUEVO: Toggle filtro de calendario
  _toggleCalendarFilter(calendar) {
    if (this._activeCalendars.has(calendar)) {
      this._activeCalendars.delete(calendar);
    } else {
      this._activeCalendars.add(calendar);
    }
    this._render();
  }

  // NUEVO: Highlight evento desde lista
  _highlightEvent(index) {
    this._highlightedEventIndex = index;
    this._render();
    
    // Quitar highlight después de 1 segundo (animación más corta)
    setTimeout(() => {
      this._highlightedEventIndex = null;
      this._render();
    }, 1000);
  }

  _getMarkerShape(color, icon, style) {
    if (icon) {
      return `<ha-icon icon="${icon}" style="color:${color};"></ha-icon>`;
    }

    const shapes = {
      circle: `<div class="marker-circle" style="background-color: ${color};"></div>`,
      square: `<div class="marker-square" style="background-color: ${color};"></div>`,
    };

    return shapes[style] || shapes.circle;
  }

  _render() {
    const startDate = new Date(this._currentStartDate);
    const endDate = new Date(this._currentEndDate);
    const today = new Date();
    const totalDuration = endDate.getTime() - startDate.getTime();
    if (totalDuration <= 0) return;

    // Filtrar eventos por calendarios activos
    const filteredEvents = this.events.filter(e => this._activeCalendars.has(e.calendar));

    const calculatePosition = (dateStr) =>
      ((new Date(dateStr).getTime() - startDate.getTime()) / totalDuration) * 100;
    const todayPosition =
      today >= startDate && today <= endDate ? calculatePosition(today) : -1;
    const labelPosClass =
      this._config.labels_position === "top" ? "labels-top" : "labels-bottom";
    const eventLevels = this.calculateEventLevels(filteredEvents, totalDuration, startDate);

    const intermediateDates = this._config.show_intermediate_dates 
      ? this.calculateIntermediateDates(startDate, endDate) 
      : [];

    // NUEVO: Calcular grupos y estadísticas
    const eventGroups = this._groupNearbyEvents(filteredEvents, totalDuration, startDate);
    const statistics = this._config.show_statistics ? this._calculateStatistics(filteredEvents) : null;

    this.shadowRoot.innerHTML = `
      <style>
        :host { 
          --line-color: ${this._config.line_color}; 
          --today-marker-color: ${this._config.today_color}; 
          display: block; 
          position: relative;
          z-index: 0;
        }
        ha-card {
          position: relative;
          z-index: 0;
          overflow: visible;
        }
        .card-content { padding: 16px; position: relative; }
        .card-description { font-size: 0.9em; color: var(--secondary-text-color); margin: -8px 0 16px 0; line-height: 1.4; }
        
        /* NUEVO: Estilos para filtros de calendario */
        .calendar-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .calendar-filter-badge {
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 0.85em;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid var(--divider-color);
          background-color: var(--secondary-background-color);
        }
        .calendar-filter-badge.active {
          background-color: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        .calendar-filter-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        /* NUEVO: Estilos para estadísticas */
        .statistics-panel {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
          padding: 12px;
          background-color: var(--secondary-background-color);
          border-radius: 8px;
        }
        .stat-item {
          text-align: center;
        }
        .stat-value {
          font-size: 1.5em;
          font-weight: bold;
          color: var(--primary-color);
        }
        .stat-label {
          font-size: 0.75em;
          color: var(--secondary-text-color);
          margin-top: 4px;
        }
        
        .card-wrapper.labels-bottom { margin: 50px auto 50px; }
        .card-wrapper.labels-top { margin: 50px auto 50px; }
        .timeline-wrapper { position: relative; width: 95%; height: 100%; display: flex; align-items: center; margin: 0 auto; padding: 0 50px; box-sizing: border-box !important; }
        .timeline-line { position: absolute; left: 0; width: 100%; height: 4px; background-color: var(--line-color); border-radius: 2px; z-index: 1; }
        
        /* Fechas intermedias */
        .intermediate-date {
          position: absolute;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
        }
        .labels-bottom .intermediate-date {
          bottom: calc(50% + 2px);
        }
        .labels-bottom .intermediate-date-line {
          order: 2;
        }
        .labels-bottom .intermediate-date-label {
          order: 1;
          margin-bottom: 4px;
        }
        .labels-top .intermediate-date {
          top: calc(50% + 2px);
        }
        .labels-top .intermediate-date-line {
          order: 1;
        }
        .labels-top .intermediate-date-label {
          order: 2;
          margin-top: 4px;
        }
        .intermediate-date-line {
          width: 1px;
          height: 20px;
          background-color: var(--divider-color);
          opacity: 0.5;
        }
        .intermediate-date-label {
          font-size: 10px;
          color: var(--secondary-text-color);
          white-space: nowrap;
        }
        
        /* NUEVO: Estilos para agrupación de eventos */
        .event-group-badge {
          position: absolute;
          transform: translateX(-50%);
          background-color: var(--primary-color);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          z-index: 9;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .labels-bottom .event-group-badge {
          top: calc(50% - 30px);
        }
        .labels-top .event-group-badge {
          bottom: calc(50% - 30px);
        }
        .event-group-badge:hover {
          transform: translateX(-50%) scale(1.1);
        }
        
        .timeline-event { position: absolute; transform: translateX(-50%); cursor: pointer; display: flex; flex-direction: column; align-items: center; transition: transform 0.2s ease, box-shadow 0.2s ease; z-index: 8; }
        .timeline-event:hover { transform: translateX(-50%) scale(1.1); z-index: 10; }
        .timeline-event.highlighted { 
          animation: pulse 0.4s ease-in-out 2;
          z-index: 11;
        }
        @keyframes pulse {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.4); }
        }
        .labels-bottom .timeline-event.level-0 { top: 50%; }
        .labels-bottom .timeline-event.level-1 { top: calc(50% - 35px); }
        .labels-bottom .timeline-event.level-2 { top: calc(50% - 70px); }
        .labels-top .timeline-event.level-0 { bottom: 50%; }
        .labels-top .timeline-event.level-1 { bottom: calc(50% - 35px); }
        .labels-top .timeline-event.level-2 { bottom: calc(50% - 70px); }
        
        .event-marker { 
          width: 14px; 
          height: 14px; 
          border: 2px solid var(--card-background-color); 
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .timeline-event.highlighted .event-marker {
          box-shadow: 0 0 12px 4px var(--primary-color);
        }
        .marker-circle { width: 100%; height: 100%; border-radius: 50%; }
        .marker-square { width: 100%; height: 100%; border-radius: 2px; }
        
        .labels-bottom .event-marker { transform: translateY(-50%); }
        .labels-top .event-marker { transform: translateY(50%); }
        .event-marker ha-icon { display: flex; }
        .event-label { font-size: 11px; white-space: nowrap; color: var(--primary-text-color); background-color: var(--card-background-color); padding: 3px 6px; border-radius: 4px; opacity: 0; transition: opacity 0.2s; position: absolute; box-shadow: 0 1px 3px rgba(0,0,0,0.2); max-width: 150px; overflow: hidden; text-overflow: ellipsis; }
        .labels-bottom .event-label { top: 18px; }
        .labels-top .event-label { bottom: 18px; }
        .timeline-event:hover .event-label, .show-names .event-label, .timeline-event.highlighted .event-label { opacity: 1; }
        
        .timeline-label { position: absolute; font-size: 12px; color: var(--secondary-text-color); font-weight: 500; z-index: 2; }
        .timeline-label.start { left: 0; text-align: left; }
        .timeline-label.end { right: 0; text-align: right; }
        .labels-bottom .timeline-label { top: calc(50% + 25px); }
        .labels-top .timeline-label { bottom: calc(50% + 25px); }
        
        .timeline-today { position: absolute; height: calc(100% + 20px); top: 50%; transform: translate(-50%, -50%); z-index: 5; }
        .today-marker { width: 2px; height: 100%; background-color: var(--today-marker-color); border-radius: 1px; box-shadow: 0 0 4px var(--today-marker-color); }
        
        .event-list-container { margin-top: 25px; border-top: 1px solid var(--divider-color); padding-top: 12px; }
        .event-list-header { display: flex; align-items: center; cursor: pointer; padding: 8px; border-radius: 4px; transition: background-color 0.2s; }
        .event-list-header:hover { background-color: var(--secondary-background-color); }
        .event-list-header ha-icon { margin-right: 8px; transition: transform 0.3s; }
        .event-list-header.collapsed ha-icon { transform: rotate(-90deg); }
        .event-list-title { font-weight: 500; flex-grow: 1; }
        .event-count { font-size: 0.9em; color: var(--secondary-text-color); }
        .event-list { max-height: 400px; overflow-y: auto; margin-top: 8px; transition: max-height 0.3s ease, opacity 0.3s ease; overscroll-behavior: contain; }
        .event-list.collapsed { max-height: 0; opacity: 0; overflow: hidden; }
        .event-item { display: flex; align-items: flex-start; padding: 12px; border-radius: 4px; margin-bottom: 6px; background-color: var(--secondary-background-color); transition: background-color 0.2s; cursor: pointer; }
        .event-item:hover { background-color: var(--divider-color); }
        .event-dot { width: 12px; height: 12px; border-radius: 50%; margin-right: 12px; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.3); margin-top: 4px; }
        .event-info { flex-grow: 1; }
        .event-name { font-weight: 500; margin-bottom: 4px; }
        .event-date { font-size: 0.85em; color: var(--secondary-text-color); margin-bottom: 4px; }
        
        /* NUEVO: Contador de días */
        .event-countdown {
          font-size: 0.8em;
          color: var(--primary-color);
          font-weight: 500;
          margin-top: 2px;
        }
        
        .event-description {
          font-size: 0.85em;
          color: var(--secondary-text-color);
          line-height: 1.4;
          margin-top: 4px;
          max-height: 60px;
          overflow: hidden;
          position: relative;
        }
        .event-description.truncated {
          max-height: 40px;
        }
        .event-description.truncated::after {
          content: '...';
          position: absolute;
          bottom: 0;
          right: 0;
          padding-left: 20px;
          background: linear-gradient(to right, transparent, var(--secondary-background-color) 50%);
        }
        .event-calendar-badge {
          display: inline-block;
          font-size: 0.75em;
          padding: 2px 6px;
          border-radius: 3px;
          background-color: var(--divider-color);
          color: var(--secondary-text-color);
          margin-left: 8px;
        }
      </style>
      <ha-card header="${this._config.title}">
        <div class="card-content">
          ${this._config.description ? `<div class="card-description">${this._config.description}</div>` : ""}
          
          ${this._config.show_calendar_filters && this._config.entities.length > 1 ? `
            <div class="calendar-filters">
              ${this._config.entities.map(cal => `
                <div class="calendar-filter-badge ${this._activeCalendars.has(cal) ? 'active' : ''}" 
                     data-calendar="${cal}">
                  ${cal.replace('calendar.', '')}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${statistics ? `
            <div class="statistics-panel">
              <div class="stat-item">
                <div class="stat-value">${statistics.total}</div>
                <div class="stat-label">Total</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${statistics.upcoming}</div>
                <div class="stat-label">Next 7d</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${statistics.past}</div>
                <div class="stat-label">Past</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${statistics.future}</div>
                <div class="stat-label">Future</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${statistics.avgPerMonth}</div>
                <div class="stat-label">Avg/month</div>
              </div>
            </div>
          ` : ''}
          
          <div class="card-wrapper ${labelPosClass} ${this._config.show_names ? "show-names" : ""}">
            <div class="timeline-wrapper">
              <div class="timeline-line"></div>
              
              ${todayPosition > -1
                ? `<div class="timeline-today" style="left: ${todayPosition}%;" title="Today: ${today.toLocaleDateString(undefined, this._config.date_format)}"><div class="today-marker"></div></div>`
                : ""}
              
              ${intermediateDates.map(({date, format}) => `
                <div class="intermediate-date" style="left: ${calculatePosition(date)}%;">
                  <div class="intermediate-date-line"></div>
                  <div class="intermediate-date-label">${date.toLocaleDateString(undefined, format)}</div>
                </div>
              `).join('')}
              
              ${eventGroups.map(group => {
                const avgPos = group.events.reduce((sum, e) => sum + e.position, 0) / group.events.length;
                const eventNames = group.events.map(e => e.event.summary).join('\n');
                return `<div class="event-group-badge" style="left: ${avgPos}%;" title="${eventNames}" data-group-events="${group.events.map(e => e.index).join(',')}">${group.events.length} events</div>`;
              }).join('')}
              
              ${filteredEvents
                .map(
                  (event, index) =>
                    `<div class="timeline-event level-${eventLevels[index]} ${this._highlightedEventIndex === index ? 'highlighted' : ''}" 
                          style="left: ${calculatePosition(event.start)}%;" 
                          title="${event.summary}\n${new Date(event.start).toLocaleDateString(undefined, this._config.date_format)}"
                          data-event-index="${index}">
                      <div class="event-marker">
                        ${this._getMarkerShape(event.color, event.icon, this._config.marker_style)}
                      </div>
                      <div class="event-label">${event.summary}</div>
                    </div>`
                )
                .join("")}
              
              <div class="timeline-label start">${startDate.toLocaleDateString(undefined, this._config.date_format)}</div>
              <div class="timeline-label end">${endDate.toLocaleDateString(undefined, this._config.date_format)}</div>
            </div>
          </div>
          
          ${
            this._config.show_event_list && filteredEvents.length > 0
              ? `<div class="event-list-container">
                <div class="event-list-header ${this._eventListExpanded ? "" : "collapsed"}" id="event-list-toggle">
                  <ha-icon icon="mdi:chevron-down"></ha-icon>
                  <span class="event-list-title">Event List</span>
                  <span class="event-count">${filteredEvents.length} event${filteredEvents.length !== 1 ? "s" : ""}</span>
                </div>
                <div class="event-list ${this._eventListExpanded ? "" : "collapsed"}">
                  ${filteredEvents
                    .map((event, index) => ({ ...event, originalIndex: index }))
                    .sort((a, b) => new Date(b.start) - new Date(a.start))  // CAMBIO: Mayor a menor
                    .map(
                      (event) => {
                        const hasDescription = event.description && event.description.trim() && this._config.show_event_description;
                        const isTruncated = hasDescription && event.description.length > 120;
                        const displayDescription = isTruncated ? event.description.substring(0, 120) : event.description;
                        const countdown = this._config.show_countdown ? this._calculateDaysToEvent(event.start) : null;
                        
                        return `<div class="event-item" data-event-index="${event.originalIndex}">
                          <div class="event-dot" style="background-color: ${event.color};"></div>
                          <div class="event-info">
                            <div class="event-name">
                              ${event.icon ? `<ha-icon icon="${event.icon}" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"></ha-icon>` : ''}
                              ${event.summary}
                              ${this._config.entities.length > 1 ? `<span class="event-calendar-badge">${event.calendar.replace('calendar.', '')}</span>` : ''}
                            </div>
                            <div class="event-date">${new Date(event.start).toLocaleDateString(undefined, this._config.date_format)}</div>
                            ${countdown ? `<div class="event-countdown">${countdown}</div>` : ''}
                            ${hasDescription ? `<div class="event-description ${isTruncated ? 'truncated' : ''}">${displayDescription}</div>` : ''}
                          </div>
                        </div>`;
                      }
                    )
                    .join("")}
                </div>
              </div>`
              : ""
          }
        </div>
      </ha-card>
    `;

    // Event listeners
    const toggleButton = this.shadowRoot.getElementById("event-list-toggle");
    if (toggleButton) {
      toggleButton.addEventListener("click", () => this._toggleEventList());
    }

    // NUEVO: Event listeners para filtros de calendario
    if (this._config.show_calendar_filters) {
      this.shadowRoot.querySelectorAll('.calendar-filter-badge').forEach(badge => {
        badge.addEventListener('click', (e) => {
          const calendar = e.target.getAttribute('data-calendar');
          this._toggleCalendarFilter(calendar);
        });
      });
    }

    // NUEVO: Event listeners para highlight desde lista
    this.shadowRoot.querySelectorAll('.event-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevenir scroll hacia arriba
        const index = parseInt(e.currentTarget.getAttribute('data-event-index'));
        this._highlightEvent(index);
      });
    });

    // NUEVO: Event listeners para grupos de eventos
    this.shadowRoot.querySelectorAll('.event-group-badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventIndices = badge.getAttribute('data-group-events').split(',').map(i => parseInt(i));
        const eventNames = eventIndices.map(i => filteredEvents[i].summary).join('\n• ');
        alert(`Grouped events:\n\n• ${eventNames}`);
      });
    });
  }
}

// =========================================
// REGISTRO DE COMPONENTES
// =========================================
customElements.define("horizontal-timeline-card", HorizontalTimelineCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "horizontal-timeline-card",
  name: "Horizontal Timeline Card",
  description: "An advanced timeline card to visualize events from multiple calendars.",
  preview: true,
  documentationURL: "https://github.com/matbott/horizontal-timeline-card-ha"
});

console.log(`%c HORIZONTAL-TIMELINE-CARD %c v2.0 (Sesión 4 - Completa)`, "color: white; background: #03a9f4; font-weight: 700;", "color: #03a9f4; background: white; font-weight: 700;");
