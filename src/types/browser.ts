export type SearchEngine = 'duckduckgo' | 'google' | 'bing' | 'ecosia' | 'startpage';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ActiveTheme = 'light' | 'dark';

export interface Tab {
  id: string;
  title: string;
  url: string;
  displayUrl: string;
  favicon?: string;
  history: string[];
  historyIndex: number;
  isLoading: boolean;
  loadStartTime?: number;
  hasError: boolean;
  errorMessage?: string;
  embedStatus?: 'unknown' | 'compatible' | 'likely_blocked' | 'blocked' | 'loaded';
  lastActive: number;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  category?: string;
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  timestamp: number;
}

export interface SandboxPermissions {
  allowScripts: boolean;
  allowSameOrigin: boolean;
  allowForms: boolean;
  allowPopups: boolean;
  allowDownloads: boolean;
}

export interface BrowserSettings {
  defaultSearchEngine: SearchEngine;
  showBookmarksBar: boolean;
  sandboxPermissions: SandboxPermissions;
  autoHttps: boolean;
  newTabBehavior: 'welcome' | 'blank';
  enableDiagnostics: boolean;
  loadTimeoutSeconds: number;
  theme: ThemePreference;
  favoriteGameIds: string[];
  recentlyPlayedGameIds: string[];
}

export type GameCategory =
  | 'All'
  | 'Featured'
  | 'Touch-Friendly'
  | 'Built-in'
  | 'Puzzle'
  | 'Strategy'
  | 'Action'
  | 'Arcade'
  | 'Racing'
  | 'Sports'
  | 'Multiplayer'
  | 'Platformers'
  | 'Casual'
  | 'Brain Training'
  | 'Two-Player'
  | 'Favorites'
  | 'Recent';

export interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  subCategories?: string[];
  url: string;
  isBuiltIn: boolean;
  isTouchFriendly?: boolean;
  embedSupported?: boolean; // Set to true only when embedding is confirmed by the provider; otherwise use external mode
  originalUrl?: string; // Official original destination URL for external mode
  gradient: string;
  iconName: string;
  badge?: string;
  rating: number;
  players?: string;
  controls: string;
  embedNotice?: string;
}

export interface GamePlatform {
  id: string;
  name: string;
  description: string;
  url: string;
  categories: string[];
  gradient: string;
  iconName: string;
  embedNotice?: string;
  badge?: string;
}

export interface CuratedSite {
  title: string;
  url: string;
  description: string;
  category: 'Educational' | 'Reference' | 'Science & Math' | 'Tools & News';
  icon: string;
  embedCompatibility: 'verified' | 'likely' | 'external_fallback';
  embedNote?: string;
}
