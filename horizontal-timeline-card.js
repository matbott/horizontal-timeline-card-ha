// -------------------------
// Editor compatible
// -------------------------

// -------------------------
// Editor compatible (sin Lit, sin re-render)
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

    this.shadowRoot.innerHTML = `
      <style>
        .row { display: flex; align-items: center; margin-bottom: 12px; }
        .row label { width: 120px; margin-right: 12px; font-size: 14px; }
        .row .flex { flex-grow: 1; }
        .section-title { font-weight: bold; margin: 16px 0 8px 0; color: var(--primary-text-color); border-bottom: 1px solid var(--divider-color); padding-bottom: 4px; }
        input[type=color] { width: 40px; height: 28px; border: none; padding: 0; margin: 0; cursor: pointer; }
        .toggle-label { margin-left: 8px; }
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
          <label>Entidad:</label>
          <ha-entity-picker class="flex" value="${this._config.entity || ''}" configValue="entity" allow-custom-entity></ha-entity-picker>
        </div>

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
          <label>Altura Tarjeta:</label>
          <ha-textfield class="flex" value="${this._config.card_height || 'auto'}" configValue="card_height" placeholder="auto"></ha-textfield>
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

    // Intentamos configurar el selector de entidades tan pronto como se renderiza el HTML
    this._setupEntityPicker();

    const labelsText = this.shadowRoot.getElementById('labels-text');

    this.shadowRoot.querySelectorAll('ha-textfield, ha-switch, ha-entity-picker, input[type=text], input[type=color]').forEach(input => {
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

  // NUEVA FUNCIÓN para configurar el selector de entidades de forma segura
  _setupEntityPicker() {
    // Nos aseguramos de que tanto el shadowRoot como el objeto hass existan
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
    // Volvemos a intentar configurar el selector cada vez que el objeto hass se actualiza
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
  }

  setConfig(config) {
    if (!config.entity) throw new Error("Por favor, define una entidad de calendario.");
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
      card_height: "auto",
      date_format: { year: "numeric", month: "2-digit", day: "2-digit" },
      show_event_list: true,
      event_list_collapsed: false,
      auto_color_events: true,
      ...config,
    };

    this.events = [];
    this._eventListExpanded = !this._config.event_list_collapsed;
  }

  static async getConfigElement() {
    return document.createElement("horizontal-timeline-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "calendar.cumpleanos",
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10),
      title: "Mi Línea de Tiempo",
      description: "Descripción opcional de la línea de tiempo",
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (this.events.length === 0) {
      this.getCalendarEvents().then((events) => {
        this.events = this.parseEvents(events);
        this._render();
      });
    } else {
      this._render();
    }
  }

  async getCalendarEvents() {
    const url = `calendars/${this._config.entity}?start=${new Date(this._config.start_date).toISOString()}&end=${new Date(this._config.end_date).toISOString()}`;
    try {
      return await this._hass.callApi("GET", url);
    } catch (e) {
      console.error("Error al obtener eventos:", e);
      return [];
    }
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

  _toggleEventList() {
    this._eventListExpanded = !this._eventListExpanded;
    this._render();
  }

  _render() {
    const startDate = new Date(this._config.start_date);
    const endDate = new Date(this._config.end_date);
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

    this.shadowRoot.innerHTML = `
      <style>
        :host { --line-color: ${this._config.line_color}; --today-marker-color: ${this._config.today_color}; --card-height: ${this._config.card_height}; }
        .card-content { height: var(--card-height); padding: 16px; }
        .card-description { font-size: 0.9em; color: var(--secondary-text-color); margin: -8px 0 16px 0; line-height: 1.4; }
        .card-wrapper.labels-bottom { margin: 20px auto 40px; }
        .card-wrapper.labels-top { margin: 60px auto 20px; }
        .timeline-wrapper { position: relative; width: 95%; height: 100%; display: flex; align-items: center; margin: 0 auto; }
        .timeline-line { position: absolute; left: 0; width: 100%; height: 4px; background-color: var(--line-color); border-radius: 2px; }
        .timeline-event { position: absolute; transform: translateX(-50%); cursor: pointer; display: flex; flex-direction: column; align-items: center; transition: transform 0.2s ease; }
        .timeline-event:hover { transform: translateX(-50%) scale(1.1); z-index: 10; }
        .labels-bottom .timeline-event.level-0 { top: 50%; }
        .labels-bottom .timeline-event.level-1 { top: calc(50% - 35px); }
        .labels-bottom .timeline-event.level-2 { top: calc(50% - 70px); }
        .labels-top .timeline-event.level-0 { bottom: 50%; }
        .labels-top .timeline-event.level-1 { bottom: calc(50% - 35px); }
        .labels-top .timeline-event.level-2 { bottom: calc(50% - 70px); }
        .event-marker { width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--card-background-color); box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .labels-bottom .event-marker { transform: translateY(-50%); }
        .labels-top .event-marker { transform: translateY(50%); }
        .event-marker ha-icon { display: flex; }
        .event-label { font-size: 11px; white-space: nowrap; color: var(--primary-text-color); background-color: var(--card-background-color); padding: 3px 6px; border-radius: 4px; opacity: 0; transition: opacity 0.2s; position: absolute; box-shadow: 0 1px 3px rgba(0,0,0,0.2); max-width: 150px; overflow: hidden; text-overflow: ellipsis; }
        .labels-bottom .event-label { top: 18px; }
        .labels-top .event-label { bottom: 18px; }
        .timeline-event:hover .event-label, .show-names .event-label { opacity: 1; }
        .timeline-label { position: absolute; font-size: 12px; color: var(--secondary-text-color); width: 100%; }
        .timeline-label.start { left: 0; text-align: left; }
        .timeline-label.end { right: 0; text-align: right; }
        .labels-bottom .timeline-label { top: calc(50% + 15px); }
        .labels-top .timeline-label { bottom: calc(50% + 15px); }
        .timeline-today { position: absolute; height: calc(100% + 20px); top: 50%; transform: translate(-50%, -50%); z-index: 5; }
        .today-marker { width: 2px; height: 100%; background-color: var(--today-marker-color); border-radius: 1px; box-shadow: 0 0 4px var(--today-marker-color); }
        .event-list-container { margin-top: 20px; border-top: 1px solid var(--divider-color); padding-top: 12px; }
        .event-list-header { display: flex; align-items: center; cursor: pointer; padding: 8px; border-radius: 4px; transition: background-color 0.2s; }
        .event-list-header:hover { background-color: var(--secondary-background-color); }
        .event-list-header ha-icon { margin-right: 8px; transition: transform 0.3s; }
        .event-list-header.collapsed ha-icon { transform: rotate(-90deg); }
        .event-list-title { font-weight: 500; flex-grow: 1; }
        .event-count { font-size: 0.9em; color: var(--secondary-text-color); }
        .event-list { max-height: 300px; overflow-y: auto; margin-top: 8px; transition: max-height 0.3s ease, opacity 0.3s ease; }
        .event-list.collapsed { max-height: 0; opacity: 0; overflow: hidden; }
        .event-item { display: flex; align-items: center; padding: 10px; border-radius: 4px; margin-bottom: 6px; background-color: var(--secondary-background-color); transition: background-color 0.2s; }
        .event-item:hover { background-color: var(--divider-color); }
        .event-dot { width: 12px; height: 12px; border-radius: 50%; margin-right: 12px; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
        .event-info { flex-grow: 1; }
        .event-name { font-weight: 500; margin-bottom: 2px; }
        .event-date { font-size: 0.85em; color: var(--secondary-text-color); }
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
              ${this.events
                .map(
                  (event, index) =>
                    `<div class="timeline-event level-0" style="left: ${calculatePosition(event.start)}%;" title="${event.summary}\n${new Date(event.start).toLocaleDateString(undefined, this._config.date_format)}"><div class="event-marker" style="background-color: ${!event.icon ? event.color : "transparent"};">${event.icon ? `<ha-icon icon="${event.icon}" style="color:${event.color};"></ha-icon>` : ""}</div><div class="event-label">${event.summary}</div></div>`
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
                      (event) =>
                        `<div class="event-item"><div class="event-dot" style="background-color: ${event.color};"></div><div class="event-info"><div class="event-name">${event.summary}</div><div class="event-date">${new Date(event.start).toLocaleDateString(undefined, this._config.date_format)}</div></div></div>`
                    )
                    .join("")}
                </div>
              </div>`
              : ""
          }
        </div>
      </ha-card>
    `;

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
  description: "Una tarjeta de línea de tiempo para visualizar eventos de un calendario.",
  preview: true,
  documentationURL: "https://github.com/tu-usuario/horizontal-timeline-card-ha",
});

console.log(`%c HORIZONTAL-TIMELINE-CARD %c v1.1 (fixed editor)`, "color: white; background: #03a9f4; font-weight: 700;", "color: #03a9f4; background: white; font-weight: 700;");
