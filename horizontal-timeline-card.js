// CLASE DEL EDITOR GRÁFICO
// Esta es una nueva clase que define cómo se verá el formulario de configuración.
class HorizontalTimelineCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  // Home Assistant llama a esta función y le pasa la configuración actual
  setConfig(config) {
    this._config = config;
    this.render();
  }

  // Dibuja el formulario
  render() {
    if (!this.shadowRoot) return;

    // Usamos los componentes de Home Assistant (ha-textfield, ha-switch)
    // para que el formulario se vea igual que el resto de la interfaz.
    this.shadowRoot.innerHTML = `
      <style>
        .row { display: flex; align-items: center; margin-bottom: 12px; }
        .row label { width: 100px; margin-right: 12px; }
        .row .flex { flex-grow: 1; }
      </style>
      <div class="card-config">
        <div class="row">
          <label>Título:</label>
          <ha-textfield class="flex" .value="${this._config.title || ''}" .configValue="${'title'}"></ha-textfield>
        </div>
        <div class="row">
          <label>Entidad:</label>
          <ha-entity-picker
            class="flex"
            .hass="${this._hass}"
            .value="${this._config.entity}"
            .configValue="${'entity'}"
            .includeDomains="${['calendar']}"
            allow-custom-entity
          ></ha-entity-picker>
        </div>
        <div class="row">
          <label>Fecha Inicio:</label>
          <ha-textfield type="date" class="flex" .value="${this._config.start_date || ''}" .configValue="${'start_date'}"></ha-textfield>
        </div>
        <div class="row">
          <label>Fecha Fin:</label>
          <ha-textfield type="date" class="flex" .value="${this._config.end_date || ''}" .configValue="${'end_date'}" placeholder="Hoy por defecto"></ha-textfield>
        </div>
        <div class="row">
          <label>Altura Tarjeta:</label>
          <ha-textfield class="flex" .value="${this._config.card_height || 'auto'}" .configValue="${'card_height'}" placeholder="auto"></ha-textfield>
        </div>
        <div class="row">
          <label>Nombres Fijos:</label>
          <ha-switch .checked="${this._config.show_names === true}" .configValue="${'show_names'}"></ha-switch>
        </div>
        <div class="row">
          <label>Pos. Etiquetas:</label>
          <ha-select class="flex" .value="${this._config.labels_position || 'bottom'}" .configValue="${'labels_position'}">
            <mwc-list-item value="bottom">Abajo</mwc-list-item>
            <mwc-list-item value="top">Arriba</mwc-list-item>
          </ha-select>
        </div>
        <div class="row">
          <label>Color Línea:</label>
          <ha-textfield class="flex" .value="${this._config.line_color || ''}" .configValue="${'line_color'}"></ha-textfield>
        </div>
        <div class="row">
          <label>Color Puntos:</label>
          <ha-textfield class="flex" .value="${this._config.dot_color || ''}" .configValue="${'dot_color'}"></ha-textfield>
        </div>
        <div class="row">
          <label>Color Hoy:</label>
          <ha-textfield class="flex" .value="${this._config.today_color || ''}" .configValue="${'today_color'}"></ha-textfield>
        </div>
      </div>
    `;

    // Añadimos un "listener" a cada campo del formulario.
    // Cuando un valor cambia, llamamos a _valueChanged.
    this.shadowRoot.querySelectorAll('ha-textfield, ha-switch, ha-select, ha-entity-picker').forEach(input => {
      input.addEventListener('change', this._valueChanged.bind(this));
      input.addEventListener('keyup', this._valueChanged.bind(this)); // para textfields
    });
  }

  // Esta función se activa cuando el usuario cambia algo en el formulario
  _valueChanged(e) {
    if (!this._config || !this._hass) return;
    
    const target = e.target;
    const newConfig = { ...this._config };
    const configValue = target.configValue;

    if (target.checked !== undefined) {
      newConfig[configValue] = target.checked;
    } else {
      newConfig[configValue] = target.value;
    }

    // Creamos y disparamos un evento que Home Assistant escucha
    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  set hass(hass) {
    this._hass = hass;
  }
}

// Registramos el nuevo elemento del editor
customElements.define('horizontal-timeline-card-editor', HorizontalTimelineCardEditor);


// ---------------------------------------------------------------- //
// CLASE PRINCIPAL DE LA TARJETA (con las nuevas funciones estáticas) //
// ---------------------------------------------------------------- //

class HorizontalTimelineCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entity) throw new Error('Por favor, define una entidad de calendario.');
    if (!config.start_date) throw new Error('Por favor, define una fecha de inicio (start_date).');
    this._config = {
      title: 'Línea de Tiempo',
      end_date: new Date().toISOString().slice(0, 10),
      show_names: false,
      labels_position: 'bottom',
      line_color: 'var(--primary-color)',
      dot_color: 'var(--accent-color)',
      today_color: 'var(--accent-color)',
      card_height: 'auto',
      date_format: { year: 'numeric', month: '2-digit', day: '2-digit' },
      ...config,
    };
    this.events = [];
  }

  // --- ¡NUEVO! Le dice a HA que tenemos un editor gráfico ---
  static async getConfigElement() {
    // Necesitamos importar el archivo para asegurarnos de que la clase del editor
    // (horizontal-timeline-card-editor) esté registrada antes de usarla.
    await import("/hacsfiles/horizontal-timeline-card-ha/horizontal-timeline-card.js");
    return document.createElement("horizontal-timeline-card-editor");
  }

  // --- ¡NUEVO! Provee una configuración de ejemplo para una tarjeta nueva ---
  static getStubConfig() {
    return {
      entity: "calendar.cumpleanos", // Un ejemplo
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10),
      title: "Mi Línea de Tiempo"
    };
  }

  // El resto del código de la tarjeta (set hass, render, etc.) es el mismo de antes.
  set hass(hass) {
    this._hass = hass;
    if (this.events.length === 0) {
      this.getCalendarEvents().then(events => {
        this.events = this.parseEvents(events);
        this._render();
      });
    } else {
      this._render();
    }
  }

  async getCalendarEvents() {
    const url = `calendars/${this._config.entity}?start=${new Date(this._config.start_date).toISOString()}&end=${new Date(this._config.end_date).toISOString()}`;
    try { return await this._hass.callApi('GET', url); } 
    catch (e) { console.error("Error al obtener eventos:", e); return []; }
  }

  parseEvents(events) {
    return events.map(event => {
      const parsed = {
        summary: event.summary, start: event.start.dateTime || event.start.date, end: event.end.dateTime || event.end.date,
        color: this._config.dot_color, icon: this._config.icon
      };
      if (event.description) {
        event.description.split('\n').forEach(line => {
          if (line.startsWith('color:')) parsed.color = line.split(/:(.*)/s)[1].trim();
          if (line.startsWith('icon:')) parsed.icon = line.split(/:(.*)/s)[1].trim();
        });
      }
      return parsed;
    });
  }

  _render() {
    // ... El código de _render no cambia en absoluto ...
    const startDate = new Date(this._config.start_date);
    const endDate = new Date(this._config.end_date);
    const today = new Date();
    const totalDuration = endDate.getTime() - startDate.getTime();
    if (totalDuration <= 0) return;
    const calculatePosition = dateStr => ((new Date(dateStr).getTime() - startDate.getTime()) / totalDuration) * 100;
    const todayPosition = (today >= startDate && today <= endDate) ? calculatePosition(today) : -1;
    const labelPosClass = this._config.labels_position === 'top' ? 'labels-top' : 'labels-bottom';

    this.shadowRoot.innerHTML = `
      <style>
        :host { --line-color: ${this._config.line_color}; --today-marker-color: ${this._config.today_color}; --card-height: ${this._config.card_height}; }
        .card-content { height: var(--card-height); }
        .card-wrapper.labels-bottom { margin: 20px auto 40px; }
        .card-wrapper.labels-top { margin: 40px auto 20px; }
        .timeline-wrapper { position: relative; width: 95%; height: 100%; display: flex; align-items: center; }
        .timeline-line { position: absolute; left: 0; width: 100%; height: 4px; background-color: var(--line-color); border-radius: 2px; }
        .timeline-event { position: absolute; transform: translateX(-50%); cursor: pointer; display: flex; flex-direction: column; align-items: center; }
        .labels-bottom .timeline-event { top: 50%; }
        .labels-top .timeline-event { bottom: 50%; }
        .event-marker { width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--card-background-color); }
        .labels-bottom .event-marker { transform: translateY(-50%); }
        .labels-top .event-marker { transform: translateY(50%); }
        .event-marker ha-icon { display: flex; }
        .event-label { font-size: 12px; white-space: nowrap; color: var(--primary-text-color); background-color: var(--card-background-color); padding: 2px 4px; border-radius: 4px; opacity: 0; transition: opacity 0.2s; position: absolute; }
        .labels-bottom .event-label { top: 15px; }
        .labels-top .event-label { bottom: 15px; }
        .timeline-event:hover .event-label, .show-names .event-label { opacity: 1; }
        .timeline-label { position: absolute; font-size: 12px; color: var(--secondary-text-color); width: 100%; }
        .timeline-label.start { left: 0; text-align: left; }
        .timeline-label.end { right: 0; text-align: right; }
        .labels-bottom .timeline-label { top: calc(50% + 15px); }
        .labels-top .timeline-label { bottom: calc(50% + 15px); }
        .timeline-today { position: absolute; height: calc(100% + 20px); top: 50%; transform: translate(-50%, -50%); }
        .today-marker { width: 2px; height: 100%; background-color: var(--today-marker-color); border-radius: 1px; }
      </style>
      <ha-card header="${this._config.title}">
        <div class="card-content">
          <div class="card-wrapper ${labelPosClass} ${this._config.show_names ? 'show-names' : ''}">
            <div class="timeline-wrapper">
              <div class="timeline-line"></div>
              ${todayPosition > -1 ? `<div class="timeline-today" style="left: ${todayPosition}%;" title="Hoy: ${today.toLocaleDateString(undefined, this._config.date_format)}"><div class="today-marker"></div></div>` : ''}
              ${this.events.map(event => `<div class="timeline-event" style="left: ${calculatePosition(event.start)}%;" title="${event.summary} \n${new Date(event.start).toLocaleDateString(undefined, this._config.date_format)}"><div class="event-marker" style="background-color: ${!event.icon ? event.color : 'transparent'};">${event.icon ? `<ha-icon icon="${event.icon}" style="color:${event.color};"></ha-icon>` : ''}</div><div class="event-label">${event.summary}</div></div>`).join('')}
              <div class="timeline-label start">${startDate.toLocaleDateString(undefined, this._config.date_format)}</div>
              <div class="timeline-label end">${endDate.toLocaleDateString(undefined, this._config.date_format)}</div>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }
}

customElements.define('horizontal-timeline-card', HorizontalTimelineCard);
