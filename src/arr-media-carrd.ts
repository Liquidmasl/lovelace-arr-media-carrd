import { HomeAssistant, LovelaceCard, LovelaceCardConfig } from './types';
import { styles } from './styles';
import './editor';

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

interface QueueItem {
  id: number;
  title: string;
  download_title: string;
  progress: string;
  size: number;
  size_left: number;
  status: string;
  tracked_download_status: string;
  tracked_download_state: string;
  download_client: string;
  indexer: string;
  protocol: string;
  images: {
    poster: string;
    fanart: string;
  };
  // Sonarr-specific
  episode_identifier?: string;
  episode_title?: string;
  season_number?: number;
  episode_number?: number;
  quality?: string;
  is_season_pack?: boolean;
  episode_count?: number;
  episode_range?: string;
  // Source tracking
  _source?: 'radarr' | 'sonarr';
}

interface LibraryItem {
  id: number;
  title: string;
  year: number;
  status: string;
  monitored: boolean;
  // Radarr-specific
  has_file?: boolean;
  size_on_disk?: number | null;
  path?: string;
  // Sonarr-specific
  episode_file_count?: number;
  episode_count?: number;
  episodes_info?: string;
  images: {
    poster: string;
    fanart: string;
  };
  _source?: 'radarr' | 'sonarr';
  _entry_id?: string;
}

interface EpisodeItem {
  id: number;
  series_id: number;
  season_number: number;
  episode_number: number;
  episode_identifier: string;
  title: string;
  has_file: boolean;
  monitored: boolean;
  runtime: number;
  air_date: string;
}

type MediaItem = QueueItem | LibraryItem;

const SERVICE_MAP: Record<string, Record<string, string>> = {
  radarr: { queue: 'radarr.get_queue', library: 'radarr.get_movies' },
  sonarr: { queue: 'sonarr.get_queue', library: 'sonarr.get_series' },
};

const RESPONSE_KEY_MAP: Record<string, Record<string, string>> = {
  radarr: { queue: 'movies', library: 'movies' },
  sonarr: { queue: 'shows', library: 'shows' },
};


class RadarrQueueCard extends HTMLElement implements LovelaceCard {
  private _config!: ArrQueueCardConfig;
  private _hass!: HomeAssistant;
  private _content!: HTMLDivElement;
  private _items: MediaItem[] = [];
  private _loading = true;
  private _error: string | null = null;
  private _refreshInterval: number | null = null;
  private _lastFetch = 0;
  private _rendered = false;
  private _currentPage = 0;
  private _searchQuery = '';
  private _expandedSeries = new Set<number>();
  private _seriesEpisodes = new Map<number, EpisodeItem[]>();
  private _loadingEpisodes = new Set<number>();
  private _expandedSeasons = new Map<number, Set<number>>();

  static getConfigElement() {
    return document.createElement('arr-media-carrd-editor');
  }

  static getStubConfig() {
    return {
      view_mode: 'queue',
      max_items: 500,
      items_per_page: 5,
      show_fanart: true,
      compact_mode: false,
      refresh_interval: 60,
      show_count: false,
      show_tracker: true,
      show_download_client: true,
      show_refresh_button: false,
    };
  }

  set hass(hass: HomeAssistant) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!oldHass && hass) {
      this._fetchData();
    }

    if (!this._rendered) {
      this._render();
    }
  }

  setConfig(config: ArrQueueCardConfig) {
    this._config = {
      view_mode: 'queue',
      max_items: 500,
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
  }

  getCardSize() {
    return 3;
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = styles;
      this.shadowRoot!.appendChild(style);

      this._content = document.createElement('div');
      this._content.className = 'card-content';
      this.shadowRoot!.appendChild(this._content);
    }

    this._startRefreshInterval();
  }

  disconnectedCallback() {
    this._stopRefreshInterval();
  }

  private _startRefreshInterval() {
    this._stopRefreshInterval();
    const interval = (this._config?.refresh_interval || 60) * 1000;
    this._refreshInterval = window.setInterval(() => {
      this._fetchData();
    }, interval);
  }

  private _stopRefreshInterval() {
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
      this._refreshInterval = null;
    }
  }

  private _getEnabledApps(): Array<{ app: 'radarr' | 'sonarr'; entry_id: string }> {
    const apps: Array<{ app: 'radarr' | 'sonarr'; entry_id: string }> = [];
    if (this._config.radarr?.entry_id) {
      apps.push({ app: 'radarr', entry_id: this._config.radarr.entry_id });
    }
    if (this._config.sonarr?.entry_id) {
      apps.push({ app: 'sonarr', entry_id: this._config.sonarr.entry_id });
    }
    return apps;
  }

  private async _fetchFromApp(app: 'radarr' | 'sonarr', entryId: string): Promise<MediaItem[]> {
    const viewMode = this._config.view_mode || 'queue';
    const serviceName = SERVICE_MAP[app]?.[viewMode];
    if (!serviceName) return [];

    const [domain, service] = serviceName.split('.');
    const responseKey = RESPONSE_KEY_MAP[app]?.[viewMode];

    const response = await this._hass.callService(
      domain,
      service,
      { entry_id: entryId },
      undefined,
      undefined,
      true
    );

    const data = response?.response?.[responseKey];
    if (!data) return [];

    const items = Object.entries(data).map(([key, value]) => {
      const item = value as any;
      if (!item.title) item.title = key;
      item._source = app;
      item._entry_id = entryId;
      return item as MediaItem;
    });
    return items;
  }

  private async _fetchData() {
    if (!this._hass || !this._config) {
      return;
    }

    const now = Date.now();
    if (now - this._lastFetch < 5000) {
      return;
    }
    this._lastFetch = now;

    const apps = this._getEnabledApps();
    if (apps.length === 0) {
      this._loading = false;
      this._error = 'No Radarr or Sonarr instance configured';
      this._items = [];
      this._render();
      return;
    }

    try {
      this._loading = true;
      this._error = null;
      this._render();

      // Fetch from all enabled apps in parallel
      const results = await Promise.all(
        apps.map(({ app, entry_id }) => this._fetchFromApp(app, entry_id))
      );

      // Merge with per-source limit so one source can't crowd out the other
      const maxPerSource = Math.ceil((this._config.max_items || 50) / apps.length);
      this._items = results.map(r => r.slice(0, maxPerSource)).flat() as MediaItem[];
      this._loading = false;
      this._error = null;
    } catch (err) {
      this._loading = false;
      this._error = err instanceof Error ? err.message : 'Failed to fetch data';
      this._items = [];
    }

    this._render();
  }

  private _formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  private _getStatusClass(status: string, downloadState: string): string {
    if (status === 'paused') return 'status-paused';
    if (status === 'warning') return 'status-paused';
    if (downloadState === 'downloading') return 'status-downloading';
    if (downloadState === 'importPending') return 'status-importing';
    return 'status-unknown';
  }

  private _getStatusIcon(status: string, downloadState: string): string {
    if (status === 'paused') return 'mdi:pause-circle';
    if (status === 'warning') return 'mdi:alert';
    if (downloadState === 'downloading') return 'mdi:download';
    if (downloadState === 'importPending') return 'mdi:import';
    return 'mdi:help-circle';
  }

  private _parseProgress(progress: string): number {
    return parseFloat(progress.replace('%', ''));
  }

  private _handleRefreshClick() {
    this._lastFetch = 0; // Reset throttle so refresh works immediately
    this._fetchData();
  }

  private async _fetchEpisodes(entryId: string, seriesId: number): Promise<EpisodeItem[]> {
    const response = await this._hass.callService(
      'sonarr',
      'get_episodes',
      { entry_id: entryId, series_id: seriesId },
      undefined,
      undefined,
      true
    );
    const data = response?.response?.['episodes'];
    if (!data) return [];
    return Object.values(data) as EpisodeItem[];
  }

  private async _handleSeriesExpand(seriesId: number, entryId: string) {
    const btn = this._content.querySelector(`.expand-btn[data-series-id="${seriesId}"]`) as HTMLElement;
    const mediaItem = btn?.closest('.media-item') as HTMLElement;

    if (this._expandedSeries.has(seriesId)) {
      this._expandedSeries.delete(seriesId);
      this._content.querySelector(`.episodes-container[data-series-id="${seriesId}"]`)?.remove();
      btn?.querySelector('ha-icon')?.setAttribute('icon', 'mdi:chevron-down');
      return;
    }

    this._expandedSeries.add(seriesId);
    btn?.querySelector('ha-icon')?.setAttribute('icon', 'mdi:chevron-up');

    if (!this._seriesEpisodes.has(seriesId)) {
      this._loadingEpisodes.add(seriesId);
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'episodes-container';
      loadingDiv.dataset.seriesId = String(seriesId);
      loadingDiv.innerHTML = `<div class="episodes-loading"><ha-icon icon="mdi:loading" class="spin"></ha-icon><span>Loading episodes...</span></div>`;
      mediaItem?.insertAdjacentElement('afterend', loadingDiv);

      try {
        const episodes = await this._fetchEpisodes(entryId, seriesId);
        this._seriesEpisodes.set(seriesId, episodes);
        const seasonNums = new Set(episodes.map(ep => ep.season_number));
        const expanded = new Set<number>();
        if (seasonNums.size <= 1) seasonNums.forEach(s => expanded.add(s));
        this._expandedSeasons.set(seriesId, expanded);
        const container = this._content.querySelector(`.episodes-container[data-series-id="${seriesId}"]`);
        if (container) {
          container.innerHTML = this._renderEpisodesBySeason(episodes, seriesId);
          this._attachSeasonHandlers(container);
        }
      } catch {
        this._seriesEpisodes.set(seriesId, []);
        const container = this._content.querySelector(`.episodes-container[data-series-id="${seriesId}"]`);
        if (container) container.innerHTML = `<div class="episodes-empty">Failed to load episodes</div>`;
      } finally {
        this._loadingEpisodes.delete(seriesId);
      }
    } else {
      const container = document.createElement('div');
      container.className = 'episodes-container';
      container.dataset.seriesId = String(seriesId);
      container.innerHTML = this._renderEpisodesBySeason(this._seriesEpisodes.get(seriesId)!, seriesId);
      mediaItem?.insertAdjacentElement('afterend', container);
      this._attachSeasonHandlers(container);
    }
  }

  private _attachSeasonHandlers(container: Element) {
    container.querySelectorAll('.season-header').forEach(header => {
      header.addEventListener('click', () => {
        const el = header as HTMLElement;
        const seriesId = parseInt(el.dataset.seriesId || '');
        const seasonNum = parseInt(el.dataset.seasonNum ?? '');
        if (!isNaN(seriesId) && !isNaN(seasonNum)) this._handleSeasonToggle(seriesId, seasonNum);
      });
    });
  }

  private _handlePrevPage() {
    if (this._currentPage > 0) {
      this._currentPage--;
      this._render();
    }
  }

  private _handleNextPage() {
    const totalPages = this._getTotalPages();
    if (this._currentPage < totalPages - 1) {
      this._currentPage++;
      this._render();
    }
  }

  private _getFilteredItems(): MediaItem[] {
    if (!this._searchQuery.trim()) {
      return this._items;
    }
    const query = this._searchQuery.toLowerCase().trim();
    return this._items.filter((item) => {
      if (item.title.toLowerCase().includes(query)) return true;

      if (this._isQueueItem(item)) {
        if (item.episode_title?.toLowerCase().includes(query)) return true;
        if (item.episode_identifier?.toLowerCase().includes(query)) return true;
        if (item.episode_range?.toLowerCase().includes(query)) return true;
      } else {
        const libraryItem = item as LibraryItem;
        if (libraryItem.year && libraryItem.year.toString().includes(query)) return true;
      }
      return false;
    });
  }

  private _getTotalPages(): number {
    const itemsPerPage = this._config.items_per_page || 5;
    const filteredItems = this._getFilteredItems();
    return Math.ceil(filteredItems.length / itemsPerPage);
  }

  private _getPagedItems(): MediaItem[] {
    const itemsPerPage = this._config.items_per_page || 5;
    const filteredItems = this._getFilteredItems();
    const start = this._currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredItems.slice(start, end);
  }

  private _isQueueItem(item: MediaItem): item is QueueItem {
    return 'progress' in item && 'download_client' in item;
  }

  private _renderSonarrSeriesItem(item: LibraryItem, isCompact: boolean | undefined, backgroundStyle: string): string {
    const isExpanded = this._expandedSeries.has(item.id);
    const isLoadingEps = this._loadingEpisodes.has(item.id);
    const episodes = this._seriesEpisodes.get(item.id);

    const seriesStatusClass = item.status === 'continuing' ? 'status-downloading' : 'status-available';
    const seriesStatusIcon = item.status === 'continuing' ? 'mdi:television-play' : 'mdi:check-circle';
    const monitoredClass = item.monitored ? 'status-monitored' : 'status-unmonitored';
    const monitoredIcon = item.monitored ? 'mdi:eye' : 'mdi:eye-off';

    let episodesContent = '';
    if (isExpanded) {
      if (isLoadingEps) {
        episodesContent = `
          <div class="episodes-container" data-series-id="${item.id}">
            <div class="episodes-loading">
              <ha-icon icon="mdi:loading" class="spin"></ha-icon>
              <span>Loading episodes...</span>
            </div>
          </div>`;
      } else if (episodes) {
        episodesContent = `<div class="episodes-container" data-series-id="${item.id}">${this._renderEpisodesBySeason(episodes, item.id)}</div>`;
      }
    }

    return `
      <div class="media-item ${isCompact ? 'compact' : ''}" style="${backgroundStyle}">
        <div class="item-poster">
          <img src="${item.images?.poster || ''}" alt="${item.title}" loading="lazy" />
        </div>
        <div class="item-info">
          <div class="item-title">${item.title} ${item.year ? `(${item.year})` : ''}</div>
          <div class="item-meta">
            <span class="status-badge ${seriesStatusClass}">
              <ha-icon icon="${seriesStatusIcon}"></ha-icon>
              ${item.status}
            </span>
            <span class="status-badge ${monitoredClass}">
              <ha-icon icon="${monitoredIcon}"></ha-icon>
              ${item.monitored ? 'Monitored' : 'Unmonitored'}
            </span>
            ${item.episodes_info ? `
              <span class="episodes-info">
                <ha-icon icon="mdi:television"></ha-icon>
                ${item.episodes_info}
              </span>` : ''}
          </div>
        </div>
        <button class="expand-btn" data-series-id="${item.id}" data-entry-id="${item._entry_id}" title="${isExpanded ? 'Collapse' : 'Expand episodes'}">
          <ha-icon icon="mdi:chevron-${isExpanded ? 'up' : 'down'}"></ha-icon>
        </button>
      </div>
      ${episodesContent}
    `;
  }

  private _renderEpisodesBySeason(episodes: EpisodeItem[], seriesId: number): string {
    if (episodes.length === 0) {
      return `<div class="episodes-empty">No episodes found</div>`;
    }

    const seasons = new Map<number, EpisodeItem[]>();
    for (const ep of episodes) {
      if (!seasons.has(ep.season_number)) seasons.set(ep.season_number, []);
      seasons.get(ep.season_number)!.push(ep);
    }

    const expandedSeasons = this._expandedSeasons.get(seriesId) ?? new Set<number>();

    return [...seasons.entries()]
      .sort(([a], [b]) => a - b)
      .map(([seasonNum, eps]) => {
        const isSeasonExpanded = expandedSeasons.has(seasonNum);
        const seasonLabel = seasonNum === 0 ? 'Specials' : `Season ${seasonNum}`;
        const available = eps.filter(ep => ep.has_file).length;
        const total = eps.length;

        const epRows = isSeasonExpanded ? [...eps]
          .sort((a, b) => a.episode_number - b.episode_number)
          .map(ep => `
            <div class="episode-row ${!ep.monitored ? 'unmonitored' : ''}">
              <span class="ep-identifier">${ep.episode_identifier}</span>
              <span class="ep-title">${ep.title}</span>
              <ha-icon icon="${ep.has_file ? 'mdi:check-circle' : 'mdi:circle-outline'}" class="ep-status-icon ${ep.has_file ? 'ep-available' : 'ep-missing'}"></ha-icon>
            </div>
          `).join('') : '';

        return `
          <div class="season-group">
            <div class="season-header" data-series-id="${seriesId}" data-season-num="${seasonNum}">
              <span class="season-label">${seasonLabel}</span>
              <span class="season-count">${available}/${total}</span>
              <ha-icon icon="mdi:chevron-${isSeasonExpanded ? 'up' : 'down'}" class="season-chevron"></ha-icon>
            </div>
            ${isSeasonExpanded ? `<div class="season-episodes">${epRows}</div>` : ''}
          </div>`;
      }).join('');
  }

  private _handleSeasonToggle(seriesId: number, seasonNum: number) {
    if (!this._expandedSeasons.has(seriesId)) {
      this._expandedSeasons.set(seriesId, new Set());
    }
    const expanded = this._expandedSeasons.get(seriesId)!;

    const header = this._content.querySelector(
      `.season-header[data-series-id="${seriesId}"][data-season-num="${seasonNum}"]`
    ) as HTMLElement;
    if (!header) return;

    const seasonGroup = header.parentElement!;
    const chevron = header.querySelector('.season-chevron') as HTMLElement;

    if (expanded.has(seasonNum)) {
      expanded.delete(seasonNum);
      seasonGroup.querySelector('.season-episodes')?.remove();
      chevron?.setAttribute('icon', 'mdi:chevron-down');
    } else {
      expanded.add(seasonNum);
      const episodes = this._seriesEpisodes.get(seriesId) ?? [];
      const div = document.createElement('div');
      div.className = 'season-episodes';
      div.innerHTML = [...episodes.filter(ep => ep.season_number === seasonNum)]
        .sort((a, b) => a.episode_number - b.episode_number)
        .map(ep => `
          <div class="episode-row ${!ep.monitored ? 'unmonitored' : ''}">
            <span class="ep-identifier">${ep.episode_identifier}</span>
            <span class="ep-title">${ep.title}</span>
            <ha-icon icon="${ep.has_file ? 'mdi:check-circle' : 'mdi:circle-outline'}" class="ep-status-icon ${ep.has_file ? 'ep-available' : 'ep-missing'}"></ha-icon>
          </div>
        `).join('');
      seasonGroup.appendChild(div);
      chevron?.setAttribute('icon', 'mdi:chevron-up');
    }
  }

  private _handleSearchInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const cursorPosition = input.selectionStart;
    this._searchQuery = input.value;
    this._currentPage = 0;
    this._render();

    requestAnimationFrame(() => {
      const newInput = this._content.querySelector('.search-input') as HTMLInputElement;
      if (newInput) {
        newInput.focus();
        if (cursorPosition !== null) {
          newInput.setSelectionRange(cursorPosition, cursorPosition);
        }
      }
    });
  }

  private _renderHeader(disabled = false): string {
    const countHtml = this._config.show_count
      ? `<span class="count">${this._getFilteredItems().length} item${this._getFilteredItems().length !== 1 ? 's' : ''}</span>`
      : '';

    const refreshBtnHtml = this._config.show_refresh_button
      ? `<button class="refresh-btn ${this._loading ? 'loading' : ''}" title="Refresh"><ha-icon icon="mdi:refresh"></ha-icon></button>`
      : '';

    const showSearch = this._config.show_search !== false;
    const hasActions = this._config.show_count || this._config.show_refresh_button;

    if (!showSearch && !hasActions) return '';

    const searchHtml = showSearch ? `
        <div class="search-container">
          <ha-icon icon="mdi:magnify" class="search-icon"></ha-icon>
          <input type="text" class="search-input" placeholder="Search..." value="${this._searchQuery}" ${disabled ? 'disabled' : ''} />
          ${this._searchQuery ? `
            <button class="search-clear" title="Clear">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          ` : ''}
        </div>` : '';

    return `
      <div class="card-header">
        ${searchHtml}
        ${hasActions ? `
          <div class="header-actions">
            ${countHtml}
            ${refreshBtnHtml}
          </div>
        ` : ''}
      </div>
    `;
  }

  private _render() {
    if (!this._hass || !this._config || !this._content) {
      return;
    }
    this._rendered = true;

    // Loading state
    if (this._loading && this._items.length === 0) {
      this._content.innerHTML = `
        <ha-card>
          ${this._renderHeader(true)}
          <div class="empty-state">
            <ha-icon icon="mdi:loading" class="spin"></ha-icon>
            <span>Loading...</span>
          </div>
        </ha-card>
      `;
      return;
    }

    // Error state
    if (this._error) {
      this._content.innerHTML = `
        <ha-card>
          ${this._renderHeader(true)}
          <div class="empty-state error">
            <ha-icon icon="mdi:alert-circle"></ha-icon>
            <span>${this._error}</span>
          </div>
        </ha-card>
      `;
      this._attachRefreshHandler();
      return;
    }

    // Empty state
    if (this._items.length === 0) {
      const isLibraryMode = this._config.view_mode === 'library';
      const emptyMessage = isLibraryMode ? 'No items in library' : 'No items in queue';
      const emptyIcon = isLibraryMode ? 'mdi:movie-open' : 'mdi:movie-check';

      this._content.innerHTML = `
        <ha-card>
          ${this._renderHeader(true)}
          <div class="empty-state">
            <ha-icon icon="${emptyIcon}"></ha-icon>
            <span>${emptyMessage}</span>
          </div>
        </ha-card>
      `;
      this._attachRefreshHandler();
      return;
    }

    // Reset page if out of bounds
    const totalPages = this._getTotalPages();
    if (this._currentPage >= totalPages && totalPages > 0) {
      this._currentPage = totalPages - 1;
    }

    const pagedItems = this._getPagedItems();
    const filteredItems = this._getFilteredItems();

    // Render items
    const itemsHtml = pagedItems.map((item) => {
      const isCompact = this._config.compact_mode;

      const backgroundStyle = this._config.show_fanart && item.images?.fanart
        ? `background-image: linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.4) 100%), url('${item.images.fanart}');`
        : '';

      if (this._isQueueItem(item)) {
        const progress = this._parseProgress(item.progress);
        const statusClass = this._getStatusClass(item.status, item.tracked_download_state);
        const statusIcon = this._getStatusIcon(item.status, item.tracked_download_state);
        const sizeDownloaded = item.size - item.size_left;

        const downloadClientHtml = this._config.show_download_client ? `
          <span class="download-client">
            <ha-icon icon="mdi:server"></ha-icon>
            ${item.download_client}
          </span>
        ` : '';

        const trackerHtml = this._config.show_tracker ? `
          <span class="indexer" title="${item.indexer}">
            <ha-icon icon="mdi:web"></ha-icon>
            ${item.indexer.split(' ')[0]}
          </span>
        ` : '';

        // Episode subtitle for sonarr items
        let subtitleHtml = '';
        if (item.episode_identifier) {
          if (item.is_season_pack) {
            // Season pack: show identifier (e.g. "S02 (24 episodes)") without individual episode title
            subtitleHtml = `<div class="item-subtitle">${item.episode_identifier}</div>`;
          } else {
            // Individual episode: show identifier + episode title
            subtitleHtml = `<div class="item-subtitle">${item.episode_identifier}${item.episode_title ? ` · ${item.episode_title}` : ''}</div>`;
          }
        }

        return `
          <div class="media-item ${isCompact ? 'compact' : ''}" style="${backgroundStyle}">
            <div class="item-poster">
              <img src="${item.images?.poster || ''}" alt="${item.title}" loading="lazy" />
            </div>
            <div class="item-info">
              <div class="item-title">${item.title}</div>
              ${subtitleHtml}
              <div class="item-meta">
                <span class="status-badge ${statusClass}">
                  <ha-icon icon="${statusIcon}"></ha-icon>
                  ${item.status}
                </span>
                ${downloadClientHtml}
                ${trackerHtml}
              </div>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill ${statusClass}" style="width: ${progress}%"></div>
                </div>
                ${!isCompact ? `
                  <div class="progress-text">
                    <span>${item.progress}</span>
                    <span>${this._formatSize(sizeDownloaded)} / ${this._formatSize(item.size)}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      } else {
        const libraryItem = item as LibraryItem;

        if (libraryItem._source === 'sonarr') {
          return this._renderSonarrSeriesItem(libraryItem, isCompact, backgroundStyle);
        }

        const statusClass = libraryItem.has_file ? 'status-available' : (libraryItem.monitored ? 'status-monitored' : 'status-unmonitored');
        const statusIcon = libraryItem.has_file ? 'mdi:check-circle' : (libraryItem.monitored ? 'mdi:eye' : 'mdi:eye-off');
        const statusText = libraryItem.has_file ? 'Available' : (libraryItem.monitored ? 'Monitored' : 'Unmonitored');

        return `
          <div class="media-item ${isCompact ? 'compact' : ''}" style="${backgroundStyle}">
            <div class="item-poster">
              <img src="${libraryItem.images?.poster || ''}" alt="${libraryItem.title}" loading="lazy" />
            </div>
            <div class="item-info">
              <div class="item-title">${libraryItem.title} ${libraryItem.year ? `(${libraryItem.year})` : ''}</div>
              <div class="item-meta">
                <span class="status-badge ${statusClass}">
                  <ha-icon icon="${statusIcon}"></ha-icon>
                  ${statusText}
                </span>
                ${libraryItem.size_on_disk ? `
                  <span class="file-size">
                    <ha-icon icon="mdi:harddisk"></ha-icon>
                    ${this._formatSize(libraryItem.size_on_disk!)}
                  </span>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }
    }).join('');

    // Pagination
    const showPagination = totalPages > 1;
    const paginationHtml = showPagination ? `
      <div class="pagination">
        <button class="pagination-btn prev-btn" ${this._currentPage === 0 ? 'disabled' : ''} title="Previous">
          <ha-icon icon="mdi:chevron-left"></ha-icon>
        </button>
        <span class="pagination-info">${this._currentPage + 1} / ${totalPages}</span>
        <button class="pagination-btn next-btn" ${this._currentPage >= totalPages - 1 ? 'disabled' : ''} title="Next">
          <ha-icon icon="mdi:chevron-right"></ha-icon>
        </button>
      </div>
    ` : '';

    // No results
    const noResultsHtml = this._searchQuery && filteredItems.length === 0 ? `
      <div class="empty-state">
        <ha-icon icon="mdi:magnify-close"></ha-icon>
        <span>No matches for "${this._searchQuery}"</span>
      </div>
    ` : '';

    this._content.innerHTML = `
      <ha-card>
        ${this._renderHeader()}
        <div class="items-container">
          ${noResultsHtml || itemsHtml}
        </div>
        ${paginationHtml}
      </ha-card>
    `;
    this._attachEventHandlers();
  }

  private _attachEventHandlers() {
    const refreshBtn = this._content.querySelector('.refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this._handleRefreshClick());
    }

    const prevBtn = this._content.querySelector('.prev-btn');
    const nextBtn = this._content.querySelector('.next-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this._handlePrevPage());
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this._handleNextPage());
    }

    this._attachSeasonHandlers(this._content);

    this._content.querySelectorAll('.expand-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const el = btn as HTMLElement;
        const seriesId = parseInt(el.dataset.seriesId || '0');
        const entryId = el.dataset.entryId || '';
        if (seriesId) this._handleSeriesExpand(seriesId, entryId);
      });
    });

    const searchInput = this._content.querySelector('.search-input') as HTMLInputElement;
    const searchClear = this._content.querySelector('.search-clear');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => this._handleSearchInput(e));
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        this._searchQuery = '';
        this._currentPage = 0;
        this._render();
      });
    }
  }

  private _attachRefreshHandler() {
    const refreshBtn = this._content.querySelector('.refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this._handleRefreshClick());
    }
  }
}

customElements.define('arr-media-carrd', RadarrQueueCard);

// Deprecated alias — kept for backward compatibility, will be removed in a future major version
if (!customElements.get('arr-media-card')) {
  customElements.define('arr-media-card', class extends RadarrQueueCard {
    connectedCallback() {
      super.connectedCallback();
      console.warn(
        '[arr-media-carrd] ⚠️ Ahoy! You\'re using "arr-media-card" (one r) — the old name.\n' +
        'Yes, we added an extra "r". Yes, it\'s intentional. Yes, it\'s a pirate thing.\n' +
        'Please update your dashboard config: "arr-media-card" → "arr-media-carrd" (spot the extra r before the d).\n' +
        'The old name will walk the plank in a future major version.'
      );
    }
  });
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'arr-media-carrd',
  name: 'Arr Media Carrd',
  description: 'Display your Radarr/Sonarr download queue or library',
  preview: true,
});

console.info(
  '%c ARR-MEDIA-CARD %c v__VERSION__ ',
  'color: white; background: #ff6600; font-weight: bold;',
  'color: #ff6600; background: white; font-weight: bold;'
);
