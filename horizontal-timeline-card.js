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
      today_color: 'var(--accent-color)', // <-- Nueva opción para el marcador de hoy
      date_format: { year: 'numeric', month: '2-digit', day: '2-digit' },
      ...config,
    };
    this.events = []; // Resetea los eventos si la config cambia
  }

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
    try {
      return await this._hass.callApi('GET', url);
    } catch (e) {
      console.error("Error al obtener eventos:", e);
      return [];
    }
  }

  parseEvents(events) {
    return events.map(event => {
      const parsed = {
        summary: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        color: this._config.dot_color,
        icon: this._config.icon
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
        :host {
          --line-color: ${this._config.line_color};
          --today-marker-color: ${this._config.today_color};
        }
        .card-wrapper.labels-bottom { margin: 20px auto 40px; }
        .card-wrapper.labels-top { margin: 40px auto 20px; }
        .timeline-wrapper { position: relative; width: 95%; height: 20px; }
        .timeline-line { position: absolute; left: 0; width: 100%; height: 4px; background-color: var(--line-color); border-radius: 2px; }
        .labels-bottom .timeline-line { top: 0; }
        .labels-top .timeline-line { bottom: 0; }

        .timeline-event { position: absolute; transform: translateX(-50%); cursor: pointer; display: flex; flex-direction: column; align-items: center; }
        .labels-bottom .timeline-event { top: 0; }
        .labels-top .timeline-event { bottom: 0; }

        .event-marker { width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--card-background-color); transform: translateY(-50%); }
        .labels-bottom .event-marker { top: 2px; }
        .labels-top .event-marker { bottom: -2px; }
        .event-marker ha-icon { display: flex; }

        .event-label { font-size: 12px; white-space: nowrap; color: var(--primary-text-color); background-color: var(--card-background-color); padding: 2px 4px; border-radius: 4px; opacity: 0; transition: opacity 0.2s; }
        .labels-bottom .event-label { margin-top: 12px; }
        .labels-top .event-label { margin-bottom: 12px; order: -1; }
        .timeline-event:hover .event-label, .show-names .event-label { opacity: 1; }

        .timeline-label { position: absolute; font-size: 12px; color: var(--secondary-text-color); }
        .labels-bottom .timeline-label { top: 15px; }
        .labels-top .timeline-label { bottom: 15px; }
        .timeline-label.start { left: 0; }
        .timeline-label.end { right: 0; }

        /* --- Estilo mejorado para el marcador de HOY --- */
        .timeline-today { position: absolute; height: 100%; top: -10px; transform: translateX(-50%); }
        .today-marker { width: 2px; height: 24px; background-color: var(--today-marker-color); border-radius: 1px; }
        .labels-bottom .timeline-today { top: -10px; }
        .labels-top .timeline-today { bottom: -10px; }
      </style>
      <ha-card header="${this._config.title}">
        <div class="card-content">
          <div class="card-wrapper ${labelPosClass} ${this._config.show_names ? 'show-names' : ''}">
            <div class="timeline-wrapper">
              <div class="timeline-line"></div>
              ${todayPosition > -1 ? `
                <div class="timeline-today" style="left: ${todayPosition}%;" title="Hoy: ${today.toLocaleDateString(undefined, this._config.date_format)}">
                  <div class="today-marker"></div>
                </div>
              ` : ''}
              ${this.events.map(event => `
                <div class="timeline-event" style="left: ${calculatePosition(event.start)}%;" title="${event.summary} \n${new Date(event.start).toLocaleDateString(undefined, this._config.date_format)}">
                  <div class="event-marker" style="background-color: ${!event.icon ? event.color : 'transparent'};">
                    ${event.icon ? `<ha-icon icon="${event.icon}" style="color:${event.color};"></ha-icon>` : ''}
                  </div>
                  <div class="event-label">${event.summary}</div>
                </div>
              `).join('')}
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
