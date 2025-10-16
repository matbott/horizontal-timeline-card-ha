// -------------------------
// Editor compatible
// -------------------------

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

    // Convertir entity antigua a entities si es necesario
    const entities = this._config.entities || (this._config.entity ? [this._config.entity] : []);
    const entitiesStr = entities.join(',');

    this.shadowRoot.innerHTML = `
      <style>
        .row { display: flex; align-items: center; margin-bottom: 12px; }
        .row label { width: 120px; margin-right: 12px; font-size: 14px; }
        .row .flex { flex-grow: 1; }
        .section-title { font-weight: bold; margin: 16px 0 8px 0; color: var(--primary-text-color); border-bottom: 1px solid var(--divider-color); padding-bottom: 4px; }
        input[type=color] { width: 40px; height: 28px; border: none; padding: 0; margin: 0; cursor: pointer; }
        .toggle-label { margin-left: 8px; }
        .help-text { font-size: 0.85em; color: var(--secondary-text-color); margin-top: 4px; font-style: italic; }
      </style>

      <div class="card-config">
        <div class="section-title">Información General</div>
        <div class="row">
          <label>Título:</label>
          <ha-textfield class="flex" value="${this._config.title || ''}" configValue="title"></ha-textfield>
        </div>
        <div class="row">
          <label>Descripción:</label>
          <ha-textfield class="flex" value="${this._config.description || ''}" configValue="description" placeholder="Descripción opcional"></ha-textfield>
        </div>
        
        <div class="row">
          <label>Calendarios:</label>
          <input type="text" class="flex" value="${entitiesStr}" configValue="entities" placeholder="calendar.uno,calendar.dos">
        </div>
        <div class="help-text" style="margin-left: 132px;">Separar múltiples calendarios con comas</div>

        <div class="row">
          <label>Fecha Inicio:</label>
          <input type="text" class="flex" value="${this._config.start_date || ''}" configValue="start_date" placeholder="YYYY-MM-DD">
        </div>
        <div class="row">
          <label>Fecha Fin:</label>
          <input type="text" class="flex" value="${this._config.end_date || ''}" configValue="end_date" placeholder="YYYY-MM-DD">
        </div>

        <div class="section-title">Opciones de Visualización</div>
        <div class="row">
          <label>Estilo Marcador:</label>
          <select class="flex" configValue="marker_style" style="padding: 8px; border-radius: 4px; border: 1px solid var(--divider-color);">
            <option value="circle" ${this._config.marker_style === 'circle' || !this._config.marker_style ? 'selected' : ''}>● Círculo</option>
            <option value="square" ${this._config.marker_style === 'square' ? 'selected' : ''}>■ Cuadrado</option>
          </select>
        </div>

        <div class="row">
          <label>Nombres Fijos:</label>
          <ha-switch ${this._config.show_names ? 'checked' : ''} configValue="show_names"></ha-switch>
        </div>

        <div class="row">
          <label>Pos. Etiquetas:</label>
          <ha-switch ${this._config.labels_position === 'top' ? 'checked' : ''} configValue="labels_position"></ha-switch>
          <span class="toggle-label" id="labels-text">${this._config.labels_position === 'top' ? 'Arriba' : 'Abajo'}</span>
        </div>

        <div class="row">
          <label>Fechas Intermedias:</label>
          <ha-switch ${this._config.show_intermediate_dates !== false ? 'checked' : ''} configValue="show_intermediate_dates"></ha-switch>
        </div>

        <div class="section-title">Lista de Eventos</div>
        <div class="row">
          <label>Mostrar Lista:</label>
          <ha-switch ${this._config.show_event_list !== false ? 'checked' : ''} configValue="show_event_list"></ha-switch>
        </div>
        <div class="row">
          <label>Lista Colapsada:</label>
          <ha-switch ${this._config.event_list_collapsed ? 'checked' : ''} configValue="event_list_collapsed"></ha-switch>
        </div>
        <div class="row">
          <label>Mostrar Descripción:</label>
          <ha-switch ${this._config.show_event_description !== false ? 'checked' : ''} configValue="show_event_description"></ha-switch>
        </div>
        <div class="row">
          <label>Colores Auto:</label>
          <ha-switch ${this._config.auto_color_events !== false ? 'checked' : ''} configValue="auto_color_events"></ha-switch>
        </div>

        <div class="section-title">Colores Personalizados</div>
        <div class="row">
          <label>Color Línea:</label>
          <input type="color" class="flex" value="${this._config.line_color || '#03a9f4'}" configValue="line_color">
        </div>
        <div class="row">
          <label>Color Puntos:</label>
          <input type="color" class="flex" value="${this._config.dot_color || '#ff4081'}" configValue="dot_color">
        </div>
        <div class="row">
          <label>Color Hoy:</label>
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
          labelsText.textContent = e.target.checked ? 'Arriba' : 'Abajo';
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
      // Convertir string separado por comas en array
      newConfig[key] = target.value.split(',').map(s => s.trim()).filter(s => s);
      // Eliminar entity antigua si existe
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


// ========================================
// CLASE PRINCIPAL DE LA TARJETA
// ========================================

class HorizontalTimelineCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._eventListExpanded = true;
    this._currentStartDate = null;
    this._currentEndDate = null;
  }

  setConfig(config) {
    // Compatibilidad: convertir entity antigua a entities
    if (config.entity && !config.entities) {
      config.entities = [config.entity];
    }
    
    if (!config.entities || config.entities.length === 0) {
      throw new Error("Por favor, define al menos un calendario en 'entities'.");
    }
    if (!config.start_date) throw new Error("Por favor, define una fecha de inicio (start_date).");

    this._config = {
      title: "Línea de Tiempo",
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
      auto_color_events: true,
      show_intermediate_dates: true,
      marker_style: "circle",
      ...config,
    };

    this.events = [];
    this._eventListExpanded = !this._config.event_list_collapsed;
    this._currentStartDate = this._config.start_date;
    this._currentEndDate = this._config.end_date;
  }

  static async getConfigElement() {
    return document.createElement("horizontal-timeline-card-editor");
  }

  static getStubConfig() {
    return {
      entities: ["calendar.cumpleanos"],
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10),
      title: "Mi Línea de Tiempo",
      description: "Descripción opcional de la línea de tiempo",
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

  // NUEVO: Obtener eventos de múltiples calendarios
  async getAllCalendarEvents() {
    const allEvents = [];
    
    // Ajustar las fechas para que sean inclusivas
    const startDate = new Date(this._currentStartDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(this._currentEndDate);
    endDate.setHours(23, 59, 59, 999);
    
    for (const entity of this._config.entities) {
      const url = `calendars/${entity}?start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
      try {
        const events = await this._hass.callApi("GET", url);
        // Agregar el calendar source a cada evento
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

  parseEvents(events) {
    const autoColors = this._config.auto_color_events ? this.generateColors(events.length) : null;
    return events.map((event, index) => {
      const parsed = {
        summary: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        color: autoColors ? autoColors[index] : this._config.dot_color,
        icon: this._config.icon,
        description: event.description || "",
        calendar: event.calendar || "",
      };
      if (event.description && !this._config.auto_color_events) {
        event.description.split("\n").forEach((line) => {
          if (line.startsWith("color:")) parsed.color = line.split(/:(.*)/s)[1].trim();
          if (line.startsWith("icon:")) parsed.icon = line.split(/:(.*)/s)[1].trim();
        });
      }
      return parsed;
    });
  }

  calculateEventLevels(events, totalDuration, startDate) {
    const calculatePosition = (dateStr) =>
      ((new Date(dateStr).getTime() - startDate.getTime()) / totalDuration) * 100;
    const eventPositions = events.map((event, index) => ({
      event,
      index,
      position: calculatePosition(event.start),
      level: 0,
    }));
    eventPositions.sort((a, b) => a.position - b.position);
    const minDistance = 8;
    const maxLevels = 3;
    eventPositions.forEach((current, i) => {
      if (i === 0) return;
      for (let level = 0; level < maxLevels; level++) {
        let canUseLevel = true;
        for (let j = i - 1; j >= 0; j--) {
          const prev = eventPositions[j];
          if (prev.level === level && Math.abs(current.position - prev.position) < minDistance) {
            canUseLevel = false;
            break;
          }
          if (current.position - prev.position > minDistance * 2) break;
        }
        if (canUseLevel) {
          current.level = level;
          break;
        }
      }
    });
    eventPositions.sort((a, b) => a.index - b.index);
    return eventPositions.map((ep) => ep.level);
  }

  // NUEVO: Calcular fechas intermedias según el rango
  calculateIntermediateDates(startDate, endDate) {
    const dates = [];
    const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    let step, format;
    if (totalDays <= 14) {
      // Diario (saltear primer y último día)
      step = 1;
      format = { month: 'short', day: 'numeric' };
    } else if (totalDays <= 60) {
      // Cada 3 días
      step = 3;
      format = { month: 'short', day: 'numeric' };
    } else if (totalDays <= 180) {
      // Semanal
      step = 7;
      format = { month: 'short', day: 'numeric' };
    } else if (totalDays <= 365) {
      // Mensual
      step = 30;
      format = { month: 'short' };
    } else {
      // Cada 2 meses
      step = 60;
      format = { month: 'short', year: 'numeric' };
    }

    // Empezar desde step días después del inicio y terminar step días antes del fin
    for (let i = step; i < totalDays - step; i += step) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      dates.push({ date, format });
    }

    return dates;
  }

  _toggleEventList() {
    this._eventListExpanded = !this._eventListExpanded;
    this._render();
  }

  // NUEVO: Generar forma del marcador según estilo
  _getMarkerShape(color, icon, style) {
    if (icon) {
      return `<ha-icon icon="${icon}" style="color:${color};"></ha-icon>`;
    }

    const shapes = {
      circle: `<div class="marker-circle" style="background-color: ${color};"></div>`,
      square: `<div class="marker-square" style="background-color: ${color};"></div>`,
      diamond: `<div class="marker-diamond" style="background-color: ${color};"></div>`,
      star: `<div class="marker-star" style="color: ${color};">★</div>`,
      triangle: `<div class="marker-triangle" style="border-bottom-color: ${color};"></div>`,
      hexagon: `<div class="marker-hexagon" style="background-color: ${color};"></div>`,
    };

    return shapes[style] || shapes.circle;
  }

  _render() {
    const startDate = new Date(this._currentStartDate);
    const endDate = new Date(this._currentEndDate);
    const today = new Date();
    const totalDuration = endDate.getTime() - startDate.getTime();
    if (totalDuration <= 0) return;

    const calculatePosition = (dateStr) =>
      ((new Date(dateStr).getTime() - startDate.getTime()) / totalDuration) * 100;
    const todayPosition =
      today >= startDate && today <= endDate ? calculatePosition(today) : -1;
    const labelPosClass =
      this._config.labels_position === "top" ? "labels-top" : "labels-bottom";
    const eventLevels = this.calculateEventLevels(this.events, totalDuration, startDate);

    // NUEVO: Calcular fechas intermedias
    const intermediateDates = this._config.show_intermediate_dates 
      ? this.calculateIntermediateDates(startDate, endDate) 
      : [];

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
        .card-description { font-size: 1.2em; color: var(--secondary-text-color); margin: -8px 0 16px 0; line-height: 1.4; }
        
        .card-wrapper.labels-bottom { margin: 50px auto 50px; }
        .card-wrapper.labels-top { margin: 50px auto 50px; }
        .timeline-wrapper { position: relative; width: 95%; height: 100%; display: flex; align-items: center; margin: 0 auto; padding: 0 50px; box-sizing: border-box !important; }
        .timeline-line { position: absolute; left: 0; width: 100%; height: 4px; background-color: var(--line-color); border-radius: 2px; z-index: 1; }
        
        /* Estilos para fechas intermedias */
        .intermediate-date {
          position: absolute;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
        }
        /* Labels BOTTOM: fechas intermedias ARRIBA de la línea */
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
        /* Labels TOP: fechas intermedias ABAJO de la línea */
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
        
        .timeline-event { position: absolute; transform: translateX(-50%); cursor: pointer; display: flex; flex-direction: column; align-items: center; transition: transform 0.2s ease; z-index: 8; }
        .timeline-event:hover { transform: translateX(-50%) scale(1.1); z-index: 10; }
        .labels-bottom .timeline-event.level-0 { top: 50%; }
        .labels-bottom .timeline-event.level-1 { top: calc(50% - 35px); }
        .labels-bottom .timeline-event.level-2 { top: calc(50% - 70px); }
        .labels-top .timeline-event.level-0 { bottom: 50%; }
        .labels-top .timeline-event.level-1 { bottom: calc(50% - 35px); }
        .labels-top .timeline-event.level-2 { bottom: calc(50% - 70px); }
        
        /* Estilos para diferentes formas de marcadores */
        .event-marker { 
          width: 14px; 
          height: 14px; 
          border: 2px solid var(--card-background-color); 
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marker-circle { width: 100%; height: 100%; border-radius: 50%; }
        .marker-square { width: 100%; height: 100%; border-radius: 2px; }
        .marker-diamond { 
          width: 10px; 
          height: 10px; 
          transform: rotate(45deg);
        }
        .marker-star {
          font-size: 16px;
          line-height: 1;
        }
        .marker-triangle {
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-bottom: 12px solid;
        }
        .marker-hexagon {
          width: 10px;
          height: 12px;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
        
        .labels-bottom .event-marker { transform: translateY(-50%); }
        .labels-top .event-marker { transform: translateY(50%); }
        .event-marker ha-icon { display: flex; }
        .event-label { font-size: 11px; white-space: nowrap; color: var(--primary-text-color); background-color: var(--card-background-color); padding: 3px 6px; border-radius: 4px; opacity: 0; transition: opacity 0.2s; position: absolute; box-shadow: 0 1px 3px rgba(0,0,0,0.2); max-width: 150px; overflow: hidden; text-overflow: ellipsis; }
        .labels-bottom .event-label { top: 18px; }
        .labels-top .event-label { bottom: 18px; }
        .timeline-event:hover .event-label, .show-names .event-label { opacity: 1; }
        
        /* Fechas inicio/fin */
        .timeline-label { position: absolute; font-size: 12px; color: var(--secondary-text-color); font-weight: 500; z-index: 2; }
        .timeline-label.start { left: 0; text-align: left; }
        .timeline-label.end { right: 0; text-align: right; }
        /* Labels BOTTOM: fechas inicio/fin ABAJO */
        .labels-bottom .timeline-label { top: calc(50% + 25px); }
        /* Labels TOP: fechas inicio/fin ARRIBA */
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
        .event-list { max-height: 400px; overflow-y: auto; margin-top: 8px; transition: max-height 0.3s ease, opacity 0.3s ease; }
        .event-list.collapsed { max-height: 0; opacity: 0; overflow: hidden; }
        .event-item { display: flex; align-items: flex-start; padding: 12px; border-radius: 4px; margin-bottom: 6px; background-color: var(--secondary-background-color); transition: background-color 0.2s; }
        .event-item:hover { background-color: var(--divider-color); }
        .event-dot { width: 12px; height: 12px; border-radius: 50%; margin-right: 12px; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.3); margin-top: 4px; }
        .event-info { flex-grow: 1; }
        .event-name { font-weight: 500; margin-bottom: 4px; }
        .event-date { font-size: 0.85em; color: var(--secondary-text-color); margin-bottom: 4px; }
        
        /* Estilos para descripción en lista */
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
          
          <div class="card-wrapper ${labelPosClass} ${this._config.show_names ? "show-names" : ""}">
            <div class="timeline-wrapper">
              <div class="timeline-line"></div>
              
              ${todayPosition > -1
                ? `<div class="timeline-today" style="left: ${todayPosition}%;" title="Hoy: ${today.toLocaleDateString(undefined, this._config.date_format)}"><div class="today-marker"></div></div>`
                : ""}
              
              ${intermediateDates.map(({date, format}) => `
                <div class="intermediate-date" style="left: ${calculatePosition(date)}%;">
                  <div class="intermediate-date-line"></div>
                  <div class="intermediate-date-label">${date.toLocaleDateString(undefined, format)}</div>
                </div>
              `).join('')}
              
              ${this.events
                .map(
                  (event, index) =>
                    `<div class="timeline-event level-0" style="left: ${calculatePosition(event.start)}%;" title="${event.summary}\n${new Date(event.start).toLocaleDateString(undefined, this._config.date_format)}">
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
            this._config.show_event_list && this.events.length > 0
              ? `<div class="event-list-container">
                <div class="event-list-header ${this._eventListExpanded ? "" : "collapsed"}" id="event-list-toggle">
                  <ha-icon icon="mdi:chevron-down"></ha-icon>
                  <span class="event-list-title">Lista de Eventos</span>
                  <span class="event-count">${this.events.length} evento${this.events.length !== 1 ? "s" : ""}</span>
                </div>
                <div class="event-list ${this._eventListExpanded ? "" : "collapsed"}">
                  ${this.events
                    .map((event, index) => ({ ...event, originalIndex: index }))
                    .sort((a, b) => new Date(a.start) - new Date(b.start))
                    .map(
                      (event) => {
                        const hasDescription = event.description && event.description.trim() && this._config.show_event_description;
                        const isTruncated = hasDescription && event.description.length > 120;
                        const displayDescription = isTruncated ? event.description.substring(0, 120) : event.description;
                        
                        return `<div class="event-item">
                          <div class="event-dot" style="background-color: ${event.color};"></div>
                          <div class="event-info">
                            <div class="event-name">
                              ${event.summary}
                              ${this._config.entities.length > 1 ? `<span class="event-calendar-badge">${event.calendar.replace('calendar.', '')}</span>` : ''}
                            </div>
                            <div class="event-date">${new Date(event.start).toLocaleDateString(undefined, this._config.date_format)}</div>
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
  }
}

// ========================================
// REGISTRO DE COMPONENTES
// ========================================
customElements.define("horizontal-timeline-card", HorizontalTimelineCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "horizontal-timeline-card",
  name: "Horizontal Timeline Card",
  description: "Una tarjeta de línea de tiempo para visualizar eventos de múltiples calendarios.",
  preview: true,
  documentationURL: "https://github.com/tu-usuario/horizontal-timeline-card-ha",
});

console.log(`%c HORIZONTAL-TIMELINE-CARD %c v1.3.1 (Sesión 3 - Fixed)`, "color: white; background: #03a9f4; font-weight: 700;", "color: #03a9f4; background: white; font-weight: 700;");
