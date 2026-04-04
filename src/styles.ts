export const styles = `
  :host {
    --arr-primary: #ff6600;
    --arr-secondary: #ffa500;
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

  /* Header: search + actions */
  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.1));
  }

  .search-container {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
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
    min-width: 0;
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
    flex-shrink: 0;
  }

  .search-clear:hover {
    color: var(--primary-text-color);
    background: rgba(255, 255, 255, 0.1);
  }

  .search-clear ha-icon {
    --mdc-icon-size: 18px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .count {
    font-size: 0.65em;
    padding: 3px 8px;
    background: transparent;
    color: var(--secondary-text-color);
    border: 1px solid var(--secondary-text-color);
    border-radius: 12px;
    font-weight: 600;
    white-space: nowrap;
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

  .refresh-btn.loading ha-icon {
    animation: spin 1s linear infinite;
  }

  /* Items container */
  .items-container {
    display: flex;
    flex-direction: column;
  }

  .media-item {
    display: flex;
    padding: 12px 16px;
    gap: 12px;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.05));
    background-size: cover;
    background-position: center right;
    transition: background-color 0.2s ease;
  }

  .media-item:last-child {
    border-bottom: none;
  }

  .media-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  /* Compact mode */
  .media-item.compact {
    padding: 6px 12px;
    gap: 10px;
  }

  .media-item.compact .item-poster {
    width: 32px;
    height: 48px;
  }

  .media-item.compact .item-info {
    gap: 4px;
  }

  .media-item.compact .item-title {
    font-size: 0.9em;
  }

  .media-item.compact .item-subtitle {
    font-size: 0.7em;
  }

  .media-item.compact .item-meta {
    gap: 6px;
  }

  .media-item.compact .status-badge {
    padding: 1px 6px;
    font-size: 0.7em;
  }

  .media-item.compact .status-badge ha-icon {
    --mdc-icon-size: 12px;
  }

  .media-item.compact .download-client,
  .media-item.compact .indexer {
    font-size: 0.65em;
  }

  .media-item.compact .download-client ha-icon,
  .media-item.compact .indexer ha-icon {
    --mdc-icon-size: 10px;
  }

  .media-item.compact .progress-bar {
    height: 4px;
  }

  /* Poster */
  .item-poster {
    width: 50px;
    height: 75px;
    flex-shrink: 0;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  .item-poster img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Info */
  .item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    min-width: 0;
  }

  .item-title {
    font-size: 1em;
    font-weight: 600;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-subtitle {
    font-size: 0.8em;
    color: var(--secondary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: -4px;
  }

  .item-meta {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

  /* Status badges */
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

  /* Meta info items */
  .file-size,
  .download-client,
  .indexer {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75em;
    color: var(--secondary-text-color);
  }

  .file-size ha-icon,
  .download-client ha-icon,
  .indexer ha-icon {
    --mdc-icon-size: 14px;
    flex-shrink: 0;
  }

  .indexer {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Progress */
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

  /* Empty / error states */
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

  /* Animations */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
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

  /* Sonarr series expand button */
  .expand-btn {
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
    flex-shrink: 0;
    align-self: center;
  }

  .expand-btn:hover {
    color: var(--primary-text-color);
    background: rgba(255, 255, 255, 0.1);
  }

  .expand-btn ha-icon {
    --mdc-icon-size: 20px;
  }

  /* Episodes meta tag */
  .episodes-info {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75em;
    color: var(--secondary-text-color);
  }

  .episodes-info ha-icon {
    --mdc-icon-size: 14px;
  }

  /* Episodes container (below expanded series row) */
  .episodes-container {
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.05));
    animation: slideDown 0.2s ease;
  }

  .episodes-loading,
  .episodes-empty {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    color: var(--secondary-text-color);
    font-size: 0.85em;
  }

  /* Season groups */
  .season-group {
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.05));
  }

  .season-group:last-child {
    border-bottom: none;
  }

  .season-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 12px 5px 16px;
    font-size: 0.7em;
    font-weight: 700;
    color: var(--arr-primary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.05));
    cursor: pointer;
    user-select: none;
    transition: background-color 0.15s ease;
  }

  .season-header:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .season-label {
    flex: 1;
  }

  .season-count {
    font-size: 1em;
    font-weight: 600;
    color: var(--secondary-text-color);
    opacity: 0.8;
  }

  .season-chevron {
    --mdc-icon-size: 16px;
    color: var(--secondary-text-color);
    opacity: 0.6;
    transition: transform 0.2s ease;
  }

  .season-episodes {
    animation: slideDown 0.18s ease;
  }

  /* Episode rows */
  .episode-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 16px 5px 24px;
    border-bottom: 1px solid var(--divider-color, rgba(255,255,255,0.03));
  }

  .episode-row:last-child {
    border-bottom: none;
  }

  .episode-row.unmonitored {
    opacity: 0.45;
  }

  .ep-identifier {
    font-size: 0.72em;
    font-weight: 600;
    color: var(--secondary-text-color);
    flex-shrink: 0;
    min-width: 52px;
  }

  .ep-title {
    flex: 1;
    font-size: 0.8em;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ep-status-icon {
    flex-shrink: 0;
    --mdc-icon-size: 16px;
  }

  .ep-available {
    color: var(--status-available);
  }

  .ep-missing {
    color: var(--secondary-text-color);
    opacity: 0.35;
  }
`;
