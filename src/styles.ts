export const styles = `
  :host {
    --radarr-primary: #ff6600;
    --radarr-secondary: #ffa500;
    --status-downloading: #4caf50;
    --status-paused: #ff9800;
    --status-importing: #2196f3;
    --status-unknown: #9e9e9e;
    --status-available: #4caf50;
    --status-monitored: #2196f3;
    --status-unmonitored: #9e9e9e;
  }

  ha-card {
    background: var(--ha-card-background, var(--card-background-color, #1c1c1c));
    border-radius: var(--ha-card-border-radius, 12px);
    overflow: hidden;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.2em;
    font-weight: 500;
    color: var(--primary-text-color);
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.1));
    gap: 12px;
  }

  .card-header .title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-header .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-header.minimal {
    justify-content: flex-end;
    padding: 8px 12px;
    border-bottom: none;
  }

  .card-header .count {
    font-size: 0.75em;
    padding: 4px 10px;
    background: var(--radarr-primary);
    color: white;
    border-radius: 12px;
    font-weight: 600;
    text-wrap: nowrap;
  }

  .refresh-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--secondary-text-color);
    transition: color 0.2s ease, background-color 0.2s ease;
  }

  .refresh-btn:hover {
    color: var(--primary-text-color);
    background: rgba(255, 255, 255, 0.1);
  }

  .refresh-btn ha-icon {
    --mdc-icon-size: 20px;
  }

  .search-container {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.1));
  }

  .search-icon {
    color: var(--secondary-text-color);
    --mdc-icon-size: 20px;
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--primary-text-color);
    font-size: 0.95em;
    font-family: inherit;
  }

  .search-input::placeholder {
    color: var(--secondary-text-color);
    opacity: 0.7;
  }

  .search-clear {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--secondary-text-color);
    transition: color 0.2s ease, background-color 0.2s ease;
  }

  .search-clear:hover {
    color: var(--primary-text-color);
    background: rgba(255, 255, 255, 0.1);
  }

  .search-clear ha-icon {
    --mdc-icon-size: 18px;
  }

  .refresh-btn.loading ha-icon {
    animation: spin 1s linear infinite;
  }

  .movies-container {
    display: flex;
    flex-direction: column;
  }

  .movie-item {
    display: flex;
    padding: 12px 16px;
    gap: 12px;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.05));
    background-size: cover;
    background-position: center right;
    transition: background-color 0.2s ease;
  }

  .movie-item:last-child {
    border-bottom: none;
  }

  .movie-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .movie-item.compact {
    padding: 6px 12px;
    gap: 10px;
  }

  .movie-item.compact .movie-poster {
    width: 32px;
    height: 48px;
  }

  .movie-item.compact .movie-info {
    gap: 4px;
  }

  .movie-item.compact .movie-title {
    font-size: 0.9em;
  }

  .movie-item.compact .movie-meta {
    gap: 6px;
  }

  .movie-item.compact .status-badge {
    padding: 1px 6px;
    font-size: 0.7em;
  }

  .movie-item.compact .status-badge ha-icon {
    --mdc-icon-size: 12px;
  }

  .movie-item.compact .download-client,
  .movie-item.compact .indexer {
    font-size: 0.65em;
  }

  .movie-item.compact .download-client ha-icon,
  .movie-item.compact .indexer ha-icon {
    --mdc-icon-size: 10px;
  }

  .movie-item.compact .progress-bar {
    height: 4px;
  }

  .movie-poster {
    width: 50px;
    height: 75px;
    flex-shrink: 0;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  .movie-poster img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .movie-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    min-width: 0;
  }

  .movie-title {
    font-size: 1em;
    font-weight: 600;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .movie-meta {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75em;
    font-weight: 500;
    text-transform: capitalize;
  }

  .status-badge ha-icon {
    --mdc-icon-size: 14px;
  }

  .status-downloading {
    background: rgba(76, 175, 80, 0.2);
    color: var(--status-downloading);
  }

  .status-paused {
    background: rgba(255, 152, 0, 0.2);
    color: var(--status-paused);
  }

  .status-importing {
    background: rgba(33, 150, 243, 0.2);
    color: var(--status-importing);
  }

  .status-unknown {
    background: rgba(158, 158, 158, 0.2);
    color: var(--status-unknown);
  }

  .status-available {
    background: rgba(76, 175, 80, 0.2);
    color: var(--status-available);
  }

  .status-monitored {
    background: rgba(33, 150, 243, 0.2);
    color: var(--status-monitored);
  }

  .status-unmonitored {
    background: rgba(158, 158, 158, 0.2);
    color: var(--status-unmonitored);
  }

  .file-size {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75em;
    color: var(--secondary-text-color);
  }

  .file-size ha-icon {
    --mdc-icon-size: 14px;
  }

  .download-client {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75em;
    color: var(--secondary-text-color);
  }

  .download-client ha-icon {
    --mdc-icon-size: 14px;
  }

  .progress-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .progress-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .progress-fill.status-downloading {
    background: linear-gradient(90deg, var(--status-downloading), #81c784);
  }

  .progress-fill.status-paused {
    background: linear-gradient(90deg, var(--status-paused), #ffb74d);
  }

  .progress-fill.status-importing {
    background: linear-gradient(90deg, var(--status-importing), #64b5f6);
  }

  .progress-fill.status-unknown {
    background: var(--status-unknown);
  }

  .progress-text {
    display: flex;
    justify-content: space-between;
    font-size: 0.7em;
    color: var(--secondary-text-color);
  }

  .movie-details {
    display: flex;
    gap: 12px;
    margin-top: 2px;
  }

  .indexer {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75em;
    color: var(--secondary-text-color);
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .indexer ha-icon {
    --mdc-icon-size: 14px;
    flex-shrink: 0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 12px;
    color: var(--secondary-text-color);
  }

  .empty-state ha-icon {
    --mdc-icon-size: 48px;
    opacity: 0.5;
  }

  .empty-state.error {
    color: var(--error-color, #f44336);
  }

  .empty-state.error ha-icon {
    opacity: 1;
  }

  /* Animation for downloading items */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  .status-downloading .progress-fill {
    animation: pulse 2s ease-in-out infinite;
  }

  /* Pagination */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    border-top: 1px solid var(--divider-color, rgba(255,255,255,0.1));
  }

  .pagination-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-text-color);
    transition: background-color 0.2s ease, opacity 0.2s ease;
  }

  .pagination-btn:hover:not([disabled]) {
    background: rgba(255, 255, 255, 0.1);
  }

  .pagination-btn[disabled] {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .pagination-btn ha-icon {
    --mdc-icon-size: 24px;
  }

  .pagination-info {
    font-size: 0.85em;
    color: var(--secondary-text-color);
    min-width: 50px;
    text-align: center;
  }
`;
