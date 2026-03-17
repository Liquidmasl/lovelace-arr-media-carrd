import { HomeAssistant, LovelaceCardConfig } from './types';

interface ArrInstanceConfig {
  entry_id: string;
}

interface ArrQueueCardConfig extends LovelaceCardConfig {
  radarr?: ArrInstanceConfig;
  sonarr?: ArrInstanceConfig;
  view_mode?: 'queue' | 'library';
  max_items?: number;
  items_per_page?: number;
  show_fanart?: boolean;
  compact_mode?: boolean;
  refresh_interval?: number;
  show_count?: boolean;
  show_tracker?: boolean;
  show_download_client?: boolean;
  show_refresh_button?: boolean;
  show_search?: boolean;
}

interface ConfigEntry {
  entry_id: string;
  domain: string;
  title: string;
  state: string;
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
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .config-section-title .app-icon {
    width: 20px;
    height: 20px;
    border-radius: 4px;
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

  .loading-entries {
    color: var(--secondary-text-color);
    font-size: 0.85em;
    padding: 4px 0;
  }
`;

export class RadarrQueueCardEditor extends HTMLElement {
  private _config!: ArrQueueCardConfig;
  private _hass!: HomeAssistant;
  private _radarrEntries: ConfigEntry[] = [];
  private _sonarrEntries: ConfigEntry[] = [];
  private _entriesLoaded = false;

  set hass(hass: HomeAssistant) {
    const hadHass = !!this._hass;
    this._hass = hass;
    if (!hadHass && hass && !this._entriesLoaded) {
      this._loadConfigEntries();
    }
  }

  setConfig(config: ArrQueueCardConfig) {
    this._config = {
      view_mode: 'queue',
      max_items: 50,
      items_per_page: 5,
      show_fanart: true,
      compact_mode: false,
      refresh_interval: 60,
      show_count: false,
      show_tracker: true,
      show_download_client: true,
      show_refresh_button: false,
      ...config,
    };
    this._render();
  }

  private async _loadConfigEntries() {
    if (!this._hass) return;

    try {
      const entries: ConfigEntry[] = await this._hass.callWS({ type: 'config_entries/get' });
      this._radarrEntries = entries.filter((e) => e.domain === 'radarr' && e.state === 'loaded');
      this._sonarrEntries = entries.filter((e) => e.domain === 'sonarr' && e.state === 'loaded');
      this._entriesLoaded = true;
      this._render();
    } catch {
      this._entriesLoaded = true;
      this._render();
    }
  }

  private _renderAppOptions(app: 'radarr' | 'sonarr', entries: ConfigEntry[]): string {
    const currentEntryId = this._config[app]?.entry_id || '';
    const label = app.charAt(0).toUpperCase() + app.slice(1);

    let selectorHtml: string;

    if (!this._entriesLoaded) {
      selectorHtml = `<span class="loading-entries">Loading...</span>`;
    } else if (entries.length === 0) {
      selectorHtml = `<input type="text" id="${app}_entry_id" value="${currentEntryId}" placeholder="No ${label} found - enter ID" />`;
    } else {
      const options = entries.map((e) =>
        `<option value="${e.entry_id}" ${e.entry_id === currentEntryId ? 'selected' : ''}>${e.title}</option>`
      ).join('');

      selectorHtml = `
        <select id="${app}_entry_id">
          <option value="" ${!currentEntryId ? 'selected' : ''}>Disabled</option>
          ${options}
        </select>
      `;
    }

    return `
      <div class="config-row">
        <div class="config-label">
          <span class="config-label-text">${label} Instance</span>
          <span class="config-label-description">Select your ${label} integration</span>
        </div>
        <div class="config-input">
          ${selectorHtml}
        </div>
      </div>
    `;
  }

  private _render() {
    if (!this._config) return;

    this.innerHTML = `
      <style>${editorStyles}</style>
      <div class="card-config">
        <div class="config-section">
          <div class="config-section-title">Integrations</div>
          ${this._renderAppOptions('radarr', this._radarrEntries)}
          ${this._renderAppOptions('sonarr', this._sonarrEntries)}
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
                <option value="library" ${this._config.view_mode === 'library' ? 'selected' : ''}>Library</option>
              </select>
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
              <span class="config-label-description">Display fanart as background</span>
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
              <span class="config-label-text">Show Search Bar</span>
              <span class="config-label-description">Display the search input in the header</span>
            </div>
            <div class="config-input">
              <label class="toggle-switch">
                <input type="checkbox" id="show_search" ${this._config.show_search !== false ? 'checked' : ''} />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

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
        </div>

        <div class="config-section">
          <div class="config-section-title">Queue Options</div>

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
      </div>
    `;

    this._attachEventListeners();
  }

  private _attachEventListeners() {
    // App instance selectors (could be select or text input)
    ['radarr', 'sonarr'].forEach((app) => {
      const el = this.querySelector(`#${app}_entry_id`) as HTMLSelectElement | HTMLInputElement;
      if (el) {
        el.addEventListener('change', (e) => {
          const target = e.target as HTMLSelectElement | HTMLInputElement;
          const value = target.value;
          if (value) {
            this._updateConfig(app, { entry_id: value });
          } else {
            this._updateConfig(app, undefined);
          }
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
      'show_search',
      'show_count',
      'show_refresh_button',
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
    if (value === undefined) {
      const newConfig = { ...this._config };
      delete (newConfig as any)[key];
      this._config = newConfig;
    } else {
      this._config = {
        ...this._config,
        [key]: value,
      };
    }

    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define('arr-media-card-editor', RadarrQueueCardEditor);
