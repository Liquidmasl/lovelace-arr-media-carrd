import { HomeAssistant, LovelaceCard, LovelaceCardConfig } from './types';
import { styles } from './styles';
import './editor';

interface RadarrQueueCardConfig extends LovelaceCardConfig {
  service?: string;
  entry_id?: string;
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

interface MovieQueue {
  id: number;
  movie_id: number;
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
}

interface MovieLibrary {
  id: number;
  title: string;
  year: number;
  tmdb_id: number;
  imdb_id: string;
  status: string;
  monitored: boolean;
  has_file: boolean;
  size_on_disk: number;
  path: string;
  movie_file_count: number;
  images: {
    poster: string;
    fanart: string;
  };
}

type MediaItem = MovieQueue | MovieLibrary;


class RadarrQueueCard extends HTMLElement implements LovelaceCard {
  private _config!: RadarrQueueCardConfig;
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

  static getConfigElement() {
    return document.createElement('radarr-queue-card-editor');
  }

  static getStubConfig() {
    return {
      entry_id: '',
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
      show_search: false,
    };
  }

  set hass(hass: HomeAssistant) {
    const oldHass = this._hass;
    this._hass = hass;

    // Initial fetch or if hass just became available
    if (!oldHass && hass) {
      this._fetchData();
    }

    // Only render once initially, then let _fetchData handle updates
    if (!this._rendered) {
      this._render();
    }
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
      show_title: false,
      show_count: false,
      show_tracker: true,
      show_download_client: true,
      show_refresh_button: false,
      show_search: false,
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

    // Start refresh interval
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

  private _getServiceForViewMode(): string {
    if (this._config.service) {
      return this._config.service;
    }
    return this._config.view_mode === 'library' ? 'radarr.get_movies' : 'radarr.get_queue';
  }

  private async _fetchData() {
    if (!this._hass || !this._config) {
      return;
    }

    // Throttle requests (minimum 5 seconds between fetches)
    const now = Date.now();
    if (now - this._lastFetch < 5000) {
      return;
    }
    this._lastFetch = now;

    const serviceName = this._getServiceForViewMode();
    const [domain, service] = serviceName.split('.');

    try {
      this._loading = true;
      this._error = null;
      this._render();

      // callService with 6th parameter true to get response
      const response = await this._hass.callService(
        domain,
        service,
        { entry_id: this._config.entry_id },
        undefined,  // target
        undefined,  // notifyOnError
        true        // returnResponse
      );

      // Response is wrapped: { context: {...}, response: { movies: {...} } }
      const movies = response?.response?.movies;
      if (movies) {
        this._items = Object.values(movies).slice(0, this._config.max_items) as MediaItem[];
      } else {
        this._items = [];
      }

      this._loading = false;
      this._error = null;
    } catch (err) {
      this._loading = false;
      this._error = err instanceof Error ? err.message : 'Failed to fetch queue';
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
    if (downloadState === 'downloading') return 'status-downloading';
    if (downloadState === 'importPending') return 'status-importing';
    return 'status-unknown';
  }

  private _getStatusIcon(status: string, downloadState: string): string {
    if (status === 'paused') return 'mdi:pause-circle';
    if (downloadState === 'downloading') return 'mdi:download';
    if (downloadState === 'importPending') return 'mdi:import';
    return 'mdi:help-circle';
  }

  private _parseProgress(progress: string): number {
    return parseFloat(progress.replace('%', ''));
  }

  private _handleRefreshClick() {
    this._fetchData();
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
      const title = item.title.toLowerCase();
      if (title.includes(query)) return true;

      // For library items, also search by year
      if (!this._isQueueItem(item)) {
        const libraryItem = item as MovieLibrary;
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

  private _isQueueItem(item: MediaItem): item is MovieQueue {
    return 'progress' in item && 'download_client' in item;
  }

  private _handleSearchInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const cursorPosition = input.selectionStart;
    this._searchQuery = input.value;
    this._currentPage = 0; // Reset to first page when searching
    this._render();

    // Restore focus and cursor position after render
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

  private _render() {
    if (!this._hass || !this._config || !this._content) {
      return;
    }
    this._rendered = true;

    // Loading state
    if (this._loading && this._items.length === 0) {
      this._content.innerHTML = `
        <ha-card>
          <div class="card-header">
          </div>
          <div class="empty-state">
            <ha-icon icon="mdi:loading" class="spin"></ha-icon>
            <span>Loading queue...</span>
          </div>
        </ha-card>
      `;
      return;
    }

    // Error state
    if (this._error) {
      this._content.innerHTML = `
        <ha-card>
          <div class="card-header">
            <button class="refresh-btn" title="Refresh">
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
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
    const isLibraryMode = this._config.view_mode === 'library';
    const emptyMessage = isLibraryMode ? 'No movies in library' : 'No movies in queue';
    const emptyIcon = isLibraryMode ? 'mdi:movie-open' : 'mdi:movie-check';

    if (this._items.length === 0) {
      this._content.innerHTML = `
        <ha-card>
          <div class="card-header">
            
            <button class="refresh-btn" title="Refresh">
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
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

    // Get current page of items
    const pagedItems = this._getPagedItems();

    // Render items
    const itemsHtml = pagedItems.map((item) => {
      const isCompact = this._config.compact_mode;

      const backgroundStyle = this._config.show_fanart && item.images?.fanart
        ? `background-image: linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.4) 100%), url('${item.images.fanart}');`
        : '';

      if (this._isQueueItem(item)) {
        // Queue item rendering
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

        return `
          <div class="movie-item ${isCompact ? 'compact' : ''}" style="${backgroundStyle}">
            <div class="movie-poster">
              <img src="${item.images?.poster || ''}" alt="${item.title}" loading="lazy" />
            </div>
            <div class="movie-info">
              <div class="movie-title">${item.title}</div>
              <div class="movie-meta">
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
        // Library item rendering
        const libraryItem = item as MovieLibrary;
        const statusClass = libraryItem.has_file ? 'status-available' : (libraryItem.monitored ? 'status-monitored' : 'status-unmonitored');
        const statusIcon = libraryItem.has_file ? 'mdi:check-circle' : (libraryItem.monitored ? 'mdi:eye' : 'mdi:eye-off');
        const statusText = libraryItem.has_file ? 'Available' : (libraryItem.monitored ? 'Monitored' : 'Unmonitored');

        return `
          <div class="movie-item ${isCompact ? 'compact' : ''}" style="${backgroundStyle}">
            <div class="movie-poster">
              <img src="${libraryItem.images?.poster || ''}" alt="${libraryItem.title}" loading="lazy" />
            </div>
            <div class="movie-info">
              <div class="movie-title">${libraryItem.title} ${libraryItem.year ? `(${libraryItem.year})` : ''}</div>
              <div class="movie-meta">
                <span class="status-badge ${statusClass}">
                  <ha-icon icon="${statusIcon}"></ha-icon>
                  ${statusText}
                </span>
                ${libraryItem.size_on_disk > 0 ? `
                  <span class="file-size">
                    <ha-icon icon="mdi:harddisk"></ha-icon>
                    ${this._formatSize(libraryItem.size_on_disk)}
                  </span>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }
    }).join('');

    const showHeader = this._config.show_search || this._config.show_count || this._config.show_refresh_button;

    const refreshBtnHtml = this._config.show_refresh_button ? `
      <button class="refresh-btn ${this._loading ? 'loading' : ''}" title="Refresh">
        <ha-icon icon="mdi:refresh"></ha-icon>
      </button>
    ` : '';

    let headerHtml = '';
    if (showHeader) {
      if (this._config.show_search || this._config.show_count || this._config.show_refresh_button) {
        headerHtml = `
          <div class="card-header">
            ${this._config.show_search ? `
            <div class="search-container">
              <ha-icon icon="mdi:magnify" class="search-icon"></ha-icon>
              <input type="text" class="search-input" placeholder="Search..." value="${this._searchQuery}" />
                ${this._searchQuery ? `
                <button class="search-clear" title="Clear">
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              ` : ''}
      </div>` : '<span></span>'}
            ${this._config.show_count ? `<span class="count">${this._items.length} item${this._items.length !== 1 ? 's' : ''}</span>` : ''}
            ${refreshBtnHtml}
          </div>
        `;
      }
    }



    // Pagination controls (only show if more than one page)
    const filteredItems = this._getFilteredItems();
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

    // No results message
    const noResultsHtml = this._searchQuery && filteredItems.length === 0 ? `
      <div class="empty-state">
        <ha-icon icon="mdi:movie-search"></ha-icon>
        <span>No matches for "${this._searchQuery}"</span>
      </div>
    ` : '';

    this._content.innerHTML = `
      <ha-card>
        ${headerHtml}
        <div class="movies-container">
          ${noResultsHtml || itemsHtml}
        </div>
        ${paginationHtml}
      </ha-card>
    `;
    this._attachEventHandlers();
  }

  private _attachEventHandlers() {
    if (this._config.show_refresh_button) {
      const refreshBtn = this._content.querySelector('.refresh-btn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => this._handleRefreshClick());
      }
    }

    const prevBtn = this._content.querySelector('.prev-btn');
    const nextBtn = this._content.querySelector('.next-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this._handlePrevPage());
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this._handleNextPage());
    }

    // Search handlers
    if (this._config.show_search) {
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
  }

  private _attachRefreshHandler() {
    const refreshBtn = this._content.querySelector('.refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this._handleRefreshClick());
    }
  }
}

customElements.define('radarr-queue-card', RadarrQueueCard);

// Register card for the card picker
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'radarr-queue-card',
  name: 'Radarr Queue Card',
  description: 'A custom card to display your Radarr download queue',
  preview: true,
});

console.info(
  '%c RADARR-QUEUE-CARD %c v1.0.0 ',
  'color: white; background: #ff6600; font-weight: bold;',
  'color: #ff6600; background: white; font-weight: bold;'
);
