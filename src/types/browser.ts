export type SearchEngine = 'duckduckgo' | 'google' | 'bing' | 'ecosia' | 'startpage';

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
