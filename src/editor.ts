import { HomeAssistant, LovelaceCardConfig } from './types';

interface RadarrQueueCardConfig extends LovelaceCardConfig {
  service?: string;
  entry_id?: string;
  title?: string;
  max_items?: number;
  items_per_page?: number;
  show_fanart?: boolean;
  compact_mode?: boolean;
  refresh_interval?: number;
  show_count?: boolean;
  show_tracker?: boolean;
  show_download_client?: boolean;
  show_refresh_button?: boolean;
  view_mode?: 'queue' | 'library';
  show_search?: boolean;
}

const editorStyles = `
  .card-config {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .config-section {
    background: var(--ha-card-background, var(--card-background-color));
    border-radius: 8px;
    padding: 16px;
    border: 1px solid var(--divider-color);
  }

  .config-section-title {
    font-weight: 500;
    margin-bottom: 12px;
    color: var(--primary-text-color);
    font-size: 1.1em;
  }

  .config-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--divider-color);
  }

  .config-row:last-child {
    border-bottom: none;
  }

  .config-label {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .config-label-text {
    color: var(--primary-text-color);
    font-weight: 500;
  }

  .config-label-description {
    color: var(--secondary-text-color);
    font-size: 0.85em;
  }

  .config-input {
    display: flex;
    align-items: center;
  }

  input[type="text"],
  input[type="number"],
  select {
    background: var(--input-fill-color, var(--secondary-background-color));
    border: 1px solid var(--input-ink-color, var(--divider-color));
    border-radius: 4px;
    padding: 8px 12px;
    color: var(--primary-text-color);
    font-size: 14px;
    min-width: 150px;
  }

  input[type="text"]:focus,
  input[type="number"]:focus,
  select:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  select {
    cursor: pointer;
  }

  .toggle-switch {
    position: relative;
    width: 48px;
    height: 24px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--switch-unchecked-track-color, #ccc);
    transition: 0.3s;
    border-radius: 24px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }

  input:checked + .toggle-slider {
    background-color: var(--primary-color, #03a9f4);
  }

  input:checked + .toggle-slider:before {
    transform: translateX(24px);
  }
`;

export class RadarrQueueCardEditor extends HTMLElement {
  private _config!: RadarrQueueCardConfig;
  private _hass!: HomeAssistant;

  set hass(hass: HomeAssistant) {
    this._hass = hass;
  }

  setConfig(config: RadarrQueueCardConfig) {
    this._config = {
      view_mode: 'queue',
      title: 'Radarr Queue',
      max_items: 50,
      items_per_page: 5,
      show_fanart: true,
      compact_mode: false,
      refresh_interval: 60,
      show_count: false,
      show_tracker: true,
      show_download_client: true,
      show_refresh_button: false,
      show_search: false,
      ...config,
    };
    this._render();
  }

  private _render() {
    if (!this._config) return;

    this.innerHTML = `
      <style>${editorStyles}</style>
      <div class="card-config">
        <div class="config-section">
          <div class="config-section-title">Required</div>

          <div class="config-row">
            <div class="config-label">
              <span class="config-label-text">Entry ID</span>
              <span class="config-label-description">Radarr integration entry ID</span>
            </div>
            <div class="config-input">
              <input type="text" id="entry_id" value="${this._config.entry_id || ''}" placeholder="e.g., abc123..." />
            </div>
          </div>
        </div>

        <div class="config-section">
          <div class="config-section-title">Display Mode</div>

          <div class="config-row">
            <div class="config-label">
              <span class="config-label-text">View Mode</span>
              <span class="config-label-description">What to display</span>
            </div>
            <div class="config-input">
              <select id="view_mode">
                <option value="queue" ${this._config.view_mode === 'queue' ? 'selected' : ''}>Download Queue</option>
                <option value="library" ${this._config.view_mode === 'library' ? 'selected' : ''}>Movie Library</option>
              </select>
            </div>
          </div>

          <div class="config-row">
            <div class="config-label">
              <span class="config-label-text">Title</span>
              <span class="config-label-description">Card title text</span>
            </div>
            <div class="config-input">
              <input type="text" id="title" value="${this._config.title || ''}" placeholder="Radarr Queue" />
            </div>
          </div>
        </div>

        <div class="config-section">
          <div class="config-section-title">Layout</div>

          <div class="config-row">
            <div class="config-label">
              <span class="config-label-text">Items Per Page</span>
              <span class="config-label-description">Number of items shown per page</span>
            </div>
            <div class="config-input">
              <input type="number" id="items_per_page" value="${this._config.items_per_page || 5}" min="1" max="50" />
            </div>
          </div>

          <div class="config-row">
            <div class="config-label">
              <span class="config-label-text">Max Items</span>
              <span class="config-label-description">Maximum items to fetch</span>
            </div>
            <div class="config-input">
              <input type="number" id="max_items" value="${this._config.max_items || 50}" min="1" max="500" />
            </div>
          </div>

          <div class="config-row">
            <div class="config-label">
              <span class="config-label-text">Refresh Interval</span>
              <span class="config-label-description">Seconds between auto-refresh</span>
            </div>
            <div class="config-input">
              <input type="number" id="refresh_interval" value="${this._config.refresh_interval || 60}" min="10" max="3600" />
            </div>
          </div>

          <div class="config-row">
            <div class="config-label">
              <span class="config-label-text">Compact Mode</span>
              <span class="config-label-description">Use smaller layout</span>
            </div>
            <div class="config-input">
              <label class="toggle-switch">
                <input type="checkbox" id="compact_mode" ${this._config.compact_mode ? 'checked' : ''} />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="config-row">
            <div class="config-label">
              <span class="config-label-text">Show Fanart</span>
              <span class="config-label-description">Display movie fanart as background</span>
            </div>
            <div class="config-input">
              <label class="toggle-switch">
                <input type="checkbox" id="show_fanart" ${this._config.show_fanart ? 'checked' : ''} />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="config-section">
          <div class="config-section-title">Header Options</div>


          <div class="config-row">
            <div class="config-label">
              <span class="config-label-text">Show Count</span>
              <span class="config-label-description">Display item count badge</span>
            </div>
            <div class="config-input">
              <label class="toggle-switch">
                <input type="checkbox" id="show_count" ${this._config.show_count ? 'checked' : ''} />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="config-row">
            <div class="config-label">
              <span class="config-label-text">Show Refresh Button</span>
              <span class="config-label-description">Display manual refresh button</span>
            </div>
            <div class="config-input">
              <label class="toggle-switch">
                <input type="checkbox" id="show_refresh_button" ${this._config.show_refresh_button ? 'checked' : ''} />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="config-row">
            <div class="config-label">
              <span class="config-label-text">Show Search</span>
              <span class="config-label-description">Display search bar to filter items</span>
            </div>
            <div class="config-input">
              <label class="toggle-switch">
                <input type="checkbox" id="show_search" ${this._config.show_search ? 'checked' : ''} />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="config-section">
          <div class="config-section-title">Queue Mode Options</div>

          <div class="config-row">
            <div class="config-label">
              <span class="config-label-text">Show Tracker</span>
              <span class="config-label-description">Display indexer/tracker name</span>
            </div>
            <div class="config-input">
              <label class="toggle-switch">
                <input type="checkbox" id="show_tracker" ${this._config.show_tracker ? 'checked' : ''} />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="config-row">
            <div class="config-label">
              <span class="config-label-text">Show Download Client</span>
              <span class="config-label-description">Display download client name</span>
            </div>
            <div class="config-input">
              <label class="toggle-switch">
                <input type="checkbox" id="show_download_client" ${this._config.show_download_client ? 'checked' : ''} />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="config-section">
          <div class="config-section-title">Advanced</div>

          <div class="config-row">
            <div class="config-label">
              <span class="config-label-text">Service Override</span>
              <span class="config-label-description">Custom service (leave empty for auto)</span>
            </div>
            <div class="config-input">
              <input type="text" id="service" value="${this._config.service || ''}" placeholder="radarr.get_queue" />
            </div>
          </div>
        </div>
      </div>
    `;

    this._attachEventListeners();
  }

  private _attachEventListeners() {
    // Text inputs
    const textInputs = ['entry_id', 'title', 'service'];
    textInputs.forEach((id) => {
      const input = this.querySelector(`#${id}`) as HTMLInputElement;
      if (input) {
        input.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement;
          this._updateConfig(id, target.value || undefined);
        });
      }
    });

    // Number inputs
    const numberInputs = ['items_per_page', 'max_items', 'refresh_interval'];
    numberInputs.forEach((id) => {
      const input = this.querySelector(`#${id}`) as HTMLInputElement;
      if (input) {
        input.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement;
          this._updateConfig(id, parseInt(target.value, 10));
        });
      }
    });

    // Select inputs
    const viewModeSelect = this.querySelector('#view_mode') as HTMLSelectElement;
    if (viewModeSelect) {
      viewModeSelect.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        this._updateConfig('view_mode', target.value);
      });
    }

    // Checkbox inputs
    const checkboxInputs = [
      'compact_mode',
      'show_fanart',
      'show_count',
      'show_refresh_button',
      'show_search',
      'show_tracker',
      'show_download_client',
    ];
    checkboxInputs.forEach((id) => {
      const input = this.querySelector(`#${id}`) as HTMLInputElement;
      if (input) {
        input.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement;
          this._updateConfig(id, target.checked);
        });
      }
    });
  }

  private _updateConfig(key: string, value: any) {
    if (value === undefined || value === '') {
      const newConfig = { ...this._config };
      delete (newConfig as any)[key];
      this._config = newConfig;
    } else {
      this._config = {
        ...this._config,
        [key]: value,
      };
    }

    // Dispatch config change event
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define('radarr-queue-card-editor', RadarrQueueCardEditor);
