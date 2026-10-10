import { Bookmark, BrowserSettings, HistoryItem, Tab } from '../types/browser';

const STORAGE_KEYS = {
  BOOKMARKS: 'portal_bookmarks_v1',
  HISTORY: 'portal_history_v1',
  SETTINGS: 'portal_settings_v1',
  SAVED_TABS: 'portal_saved_tabs_v1',
  ACTIVE_TAB_ID: 'portal_active_tab_id_v1',
};

export const DEFAULT_SETTINGS: BrowserSettings = {
  defaultSearchEngine: 'duckduckgo',
  showBookmarksBar: true,
  sandboxPermissions: {
    allowScripts: true,
    allowSameOrigin: true,
    allowForms: true,
    allowPopups: true,
    allowDownloads: true,
  },
  autoHttps: true,
  newTabBehavior: 'welcome',
  enableDiagnostics: true,
  loadTimeoutSeconds: 12,
  theme: 'dark',
  favoriteGameIds: ['game-snake', 'game-breakout'],
  recentlyPlayedGameIds: ['game-snake'],
};

const DEFAULT_BOOKMARKS: Bookmark[] = [
  {
    id: 'bm-osm',
    title: 'OpenStreetMap Explorer',
    url: 'https://www.openstreetmap.org/export/embed.html?bbox=-0.15%2C51.50%2C-0.10%2C51.52&layer=mapnik',
    category: 'Reference',
    createdAt: Date.now() - 500000,
  },
  {
    id: 'bm-phet',
    title: 'PhET Physics: Forces & Motion',
    url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html',
    category: 'Science',
    createdAt: Date.now() - 400000,
  },
  {
    id: 'bm-wiki',
    title: 'Wikipedia Portal',
    url: 'https://en.wikipedia.org/wiki/Portal:Contents',
    category: 'Reference',
    createdAt: Date.now() - 300000,
  },
  {
    id: 'bm-nasa',
    title: 'NASA Astronomy APOD',
    url: 'https://apod.nasa.gov/apod/astropix.html',
    category: 'Science',
    createdAt: Date.now() - 200000,
  },
  {
    id: 'bm-gutenberg',
    title: 'Project Gutenberg eBooks',
    url: 'https://www.gutenberg.org/',
    category: 'Educational',
    createdAt: Date.now() - 100000,
  },
];

// Bookmarks helpers
export function getSavedBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (!raw) {
      // Seed default bookmarks
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(DEFAULT_BOOKMARKS));
      return DEFAULT_BOOKMARKS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading bookmarks from localStorage', err);
    return DEFAULT_BOOKMARKS;
  }
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  } catch (err) {
    console.error('Failed saving bookmarks to localStorage', err);
  }
}

// History helpers
export function getSavedHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading history from localStorage', err);
    return [];
  }
}

export function appendHistoryItem(item: Omit<HistoryItem, 'id'>): HistoryItem[] {
  if (!item.url || item.url.startsWith('portal://')) return getSavedHistory();

  try {
    const current = getSavedHistory();
    // Avoid duplicate rapid visits to the exact same URL within 30 seconds
    const filtered = current.filter(
      (h) => !(h.url === item.url && Math.abs(h.timestamp - item.timestamp) < 30000)
    );

    const newItem: HistoryItem = {
      ...item,
      id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };

    // Keep max 200 items in history
    const updated = [newItem, ...filtered].slice(0, 200);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed saving history item', err);
    return getSavedHistory();
  }
}

export function clearSavedHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (err) {
    console.error('Failed clearing history', err);
  }
}

export function deleteSavedHistoryItem(id: string): HistoryItem[] {
  try {
    const current = getSavedHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed deleting history item', err);
    return getSavedHistory();
  }
}

// Settings helpers
export function getSavedSettings(): BrowserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: BrowserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed saving settings', err);
  }
}

// Session tabs helpers
export function getSavedTabs(): { tabs: Tab[]; activeTabId: string } | null {
  try {
    const rawTabs = localStorage.getItem(STORAGE_KEYS.SAVED_TABS);
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB_ID);
    if (!rawTabs) return null;
    const tabs: Tab[] = JSON.parse(rawTabs);
    if (tabs.length === 0) return null;
    return { tabs, activeTabId: activeId || tabs[0].id };
  } catch {
    return null;
  }
}

export function saveTabsState(tabs: Tab[], activeTabId: string): void {
  try {
    // Sanitize tabs (don't save loading states)
    const sanitized = tabs.map((t) => ({
      ...t,
      isLoading: false,
      hasError: false,
    }));
    localStorage.setItem(STORAGE_KEYS.SAVED_TABS, JSON.stringify(sanitized));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB_ID, activeTabId);
  } catch (err) {
    console.error('Failed saving tabs state', err);
  }
}
