/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Tab, Bookmark, HistoryItem, BrowserSettings, SearchEngine, ThemePreference } from './types/browser';
import {
  getSavedBookmarks,
  saveBookmarks,
  getSavedHistory,
  appendHistoryItem,
  clearSavedHistory,
  deleteSavedHistoryItem,
  getSavedSettings,
  saveSettings,
  getSavedTabs,
  saveTabsState,
  DEFAULT_SETTINGS,
} from './utils/storage';
import { resolveInputToUrl, extractDomain, getFaviconUrl } from './utils/url';
import { TabBar } from './components/TabBar';
import { NavigationToolbar } from './components/NavigationToolbar';
import { BookmarksBar } from './components/BookmarksBar';
import { WebView } from './components/WebView';
import { HistoryDrawer } from './components/HistoryDrawer';
import { BookmarksModal } from './components/BookmarksModal';
import { SettingsModal } from './components/SettingsModal';
import { SecurityInfoModal } from './components/SecurityInfoModal';

function createInitialTab(url = 'portal://welcome', title = 'Portal Home'): Tab {
  const id = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    title,
    url,
    displayUrl: url,
    history: [url],
    historyIndex: 0,
    isLoading: false,
    hasError: false,
    lastActive: Date.now(),
    favicon: getFaviconUrl(url),
  };
}

export default function App() {
  // Load persistent state from localStorage
  const [settings, setSettings] = useState<BrowserSettings>(() => getSavedSettings());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => getSavedBookmarks());
  const [history, setHistory] = useState<HistoryItem[]>(() => getSavedHistory());

  // Initialize tabs from saved session or default
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const saved = getSavedTabs();
    if (saved && saved.tabs.length > 0) {
      return saved.tabs;
    }
    return [createInitialTab()];
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const saved = getSavedTabs();
    if (saved && saved.activeTabId) {
      return saved.activeTabId;
    }
    return tabs[0]?.id || 'initial-tab';
  });

  // Modal & Drawer UI states
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBookmarksModalOpen, setIsBookmarksModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSecurityInfoOpen, setIsSecurityInfoOpen] = useState(false);
  const [isIpadEmulation, setIsIpadEmulation] = useState(false);

  // Active Tab object
  const activeTab = useMemo(() => {
    return tabs.find((t) => t.id === activeTabId) || tabs[0] || createInitialTab();
  }, [tabs, activeTabId]);

  // Sync state to localStorage
  useEffect(() => {
    saveTabsState(tabs, activeTabId);
  }, [tabs, activeTabId]);

  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Real-time Theme Management (Light / Dark / System mode reactivity)
  useEffect(() => {
    const applyTheme = () => {
      let resolved: 'light' | 'dark' = 'dark';
      if (settings.theme === 'light') {
        resolved = 'light';
      } else if (settings.theme === 'dark') {
        resolved = 'dark';
      } else {
        // System preference
        resolved = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      }

      document.documentElement.setAttribute('data-theme', resolved);
      if (resolved === 'light') {
        document.documentElement.classList.add('theme-light');
        document.documentElement.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
        document.body.classList.remove('theme-dark');
      } else {
        document.documentElement.classList.add('theme-dark');
        document.documentElement.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
        document.body.classList.remove('theme-light');
      }
    };

    applyTheme();

    if (settings.theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: light)');
      const listener = () => applyTheme();
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  // Navigation logic
  const handleNavigate = useCallback(
    (input: string) => {
      const resolved = resolveInputToUrl(input, settings.defaultSearchEngine);

      setTabs((prevTabs) =>
        prevTabs.map((tab) => {
          if (tab.id !== activeTabId) return tab;

          if (resolved.error) {
            return {
              ...tab,
              hasError: true,
              errorMessage: resolved.error,
              isLoading: false,
            };
          }

          const targetUrl = resolved.url;
          const targetTitle = extractDomain(targetUrl);
          const newHistory = [...tab.history.slice(0, tab.historyIndex + 1), targetUrl];

          // Log in history if external URL
          if (!resolved.isInternal) {
            setHistory((prev) =>
              appendHistoryItem({
                title: targetTitle,
                url: targetUrl,
                timestamp: Date.now(),
                favicon: getFaviconUrl(targetUrl),
              })
            );
          }

          // Track game in recently played
          if (targetUrl.includes('portal://game/')) {
            const gamePart = targetUrl.split('portal://game/')[1];
            const gameId = `game-${gamePart}`;
            setSettings((prev) => {
              const recents = (prev.recentlyPlayedGameIds || []).filter((id) => id !== gameId);
              return { ...prev, recentlyPlayedGameIds: [gameId, ...recents].slice(0, 10) };
            });
          }

          return {
            ...tab,
            url: targetUrl,
            displayUrl: targetUrl,
            title: targetTitle,
            favicon: getFaviconUrl(targetUrl),
            history: newHistory,
            historyIndex: newHistory.length - 1,
            isLoading: !resolved.isInternal,
            hasError: false,
            errorMessage: undefined,
            lastActive: Date.now(),
          };
        })
      );
    },
    [activeTabId, settings.defaultSearchEngine]
  );

  // Tab management
  const handleNewTab = useCallback((url = 'portal://welcome') => {
    const newTab = createInitialTab(url, extractDomain(url));
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const handleCloseTab = useCallback(
    (tabIdToClose: string, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }

      setTabs((prevTabs) => {
        if (prevTabs.length <= 1) {
          const resetTab = createInitialTab();
          setActiveTabId(resetTab.id);
          return [resetTab];
        }

        const remaining = prevTabs.filter((t) => t.id !== tabIdToClose);

        if (tabIdToClose === activeTabId) {
          const closedIndex = prevTabs.findIndex((t) => t.id === tabIdToClose);
          const nextIndex = Math.max(0, closedIndex - 1);
          setActiveTabId(remaining[nextIndex].id);
        }

        return remaining;
      });
    },
    [activeTabId]
  );

  const handleSelectTab = useCallback((id: string) => {
    setActiveTabId(id);
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, lastActive: Date.now() } : t))
    );
  }, []);

  // History Stack Navigation for active tab
  const handleBack = useCallback(() => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id !== activeTabId || tab.historyIndex <= 0) return tab;
        const newIndex = tab.historyIndex - 1;
        const prevUrl = tab.history[newIndex];
        return {
          ...tab,
          url: prevUrl,
          displayUrl: prevUrl,
          title: extractDomain(prevUrl),
          favicon: getFaviconUrl(prevUrl),
          historyIndex: newIndex,
          isLoading: !prevUrl.startsWith('portal://'),
          hasError: false,
        };
      })
    );
  }, [activeTabId]);

  const handleForward = useCallback(() => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id !== activeTabId || tab.historyIndex >= tab.history.length - 1)
          return tab;
        const newIndex = tab.historyIndex + 1;
        const nextUrl = tab.history[newIndex];
        return {
          ...tab,
          url: nextUrl,
          displayUrl: nextUrl,
          title: extractDomain(nextUrl),
          favicon: getFaviconUrl(nextUrl),
          historyIndex: newIndex,
          isLoading: !nextUrl.startsWith('portal://'),
          hasError: false,
        };
      })
    );
  }, [activeTabId]);

  const handleReload = useCallback(() => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id !== activeTabId) return tab;
        return {
          ...tab,
          isLoading: !tab.url.startsWith('portal://'),
          hasError: false,
        };
      })
    );
  }, [activeTabId]);

  const handleHome = useCallback(() => {
    handleNavigate('portal://welcome');
  }, [handleNavigate]);

  const handleUpdateTabState = useCallback(
    (tabId: string, updates: Partial<Tab>) => {
      setTabs((prev) =>
        prev.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab))
      );
    },
    []
  );

  // Bookmark management
  const isCurrentBookmarked = useMemo(() => {
    if (!activeTab.url || activeTab.url.startsWith('portal://')) return false;
    return bookmarks.some((b) => b.url === activeTab.url);
  }, [bookmarks, activeTab.url]);

  const handleToggleBookmark = useCallback(() => {
    if (!activeTab.url || activeTab.url.startsWith('portal://')) return;

    if (isCurrentBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.url !== activeTab.url));
    } else {
      const newBm: Bookmark = {
        id: `bm-${Date.now()}`,
        title: activeTab.title || extractDomain(activeTab.url),
        url: activeTab.url,
        favicon: getFaviconUrl(activeTab.url),
        createdAt: Date.now(),
      };
      setBookmarks((prev) => [newBm, ...prev]);
    }
  }, [activeTab.url, activeTab.title, isCurrentBookmarked]);

  const handleAddBookmark = useCallback(
    (bm: Omit<Bookmark, 'id' | 'createdAt'>) => {
      const newBm: Bookmark = {
        ...bm,
        id: `bm-${Date.now()}`,
        createdAt: Date.now(),
      };
      setBookmarks((prev) => [newBm, ...prev]);
    },
    []
  );

  const handleUpdateBookmark = useCallback(
    (id: string, updates: Partial<Bookmark>) => {
      setBookmarks((prev) =>
        prev.map((bm) => (bm.id === id ? { ...bm, ...updates } : bm))
      );
    },
    []
  );

  const handleDeleteBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleToggleFavoriteGame = useCallback((gameId: string) => {
    setSettings((prev) => {
      const favorites = prev.favoriteGameIds || [];
      const updated = favorites.includes(gameId)
        ? favorites.filter((id) => id !== gameId)
        : [...favorites, gameId];
      return { ...prev, favoriteGameIds: updated };
    });
  }, []);

  // History drawer handlers
  const handleDeleteHistoryItem = useCallback((id: string) => {
    setHistory((prev) => deleteSavedHistoryItem(id));
  }, []);

  const handleClearAllHistory = useCallback(() => {
    clearSavedHistory();
    setHistory([]);
  }, []);

  // Settings handlers
  const handleUpdateSettings = useCallback((updates: Partial<BrowserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleResetAllData = useCallback(() => {
    localStorage.clear();
    setBookmarks([]);
    setHistory([]);
    setSettings(DEFAULT_SETTINGS);
    const freshTab = createInitialTab();
    setTabs([freshTab]);
    setActiveTabId(freshTab.id);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        handleNewTab();
      } else if (cmdOrCtrl && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        handleCloseTab(activeTabId);
      } else if (cmdOrCtrl && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        handleReload();
      } else if (cmdOrCtrl && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        setIsHistoryOpen((prev) => !prev);
      } else if (cmdOrCtrl && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        handleUpdateSettings({ showBookmarksBar: !settings.showBookmarksBar });
      } else if (e.altKey && e.key === 'ArrowLeft' && !isInput) {
        e.preventDefault();
        handleBack();
      } else if (e.altKey && e.key === 'ArrowRight' && !isInput) {
        e.preventDefault();
        handleForward();
      } else if (e.key === 'Escape') {
        setIsHistoryOpen(false);
        setIsBookmarksModalOpen(false);
        setIsSettingsOpen(false);
        setIsSecurityInfoOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTabId,
    handleNewTab,
    handleCloseTab,
    handleReload,
    handleBack,
    handleForward,
    handleUpdateSettings,
    settings.showBookmarksBar,
  ]);

  const canGoBack = activeTab.historyIndex > 0;
  const canGoForward = activeTab.historyIndex < activeTab.history.length - 1;

  return (
    <div
      className={`w-screen h-screen overflow-hidden flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-250 ${
        isIpadEmulation ? 'p-3 sm:p-6 bg-black/70 flex items-center justify-center' : ''
      }`}
    >
      {/* Outer Shell container (supports 11-inch iPad mockup mode) */}
      <div
        className={`w-full h-full flex flex-col overflow-hidden bg-[var(--bg-main)] ${
          isIpadEmulation
            ? 'max-w-[1194px] max-h-[834px] rounded-3xl border-8 border-slate-700/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative'
            : ''
        }`}
      >
        {/* Tab Strip */}
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={handleSelectTab}
          onCloseTab={handleCloseTab}
          onNewTab={() => handleNewTab()}
        />

        {/* Navigation & Omnibox Toolbar with Real Theme Switcher */}
        <NavigationToolbar
          activeTab={activeTab}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          isBookmarked={isCurrentBookmarked}
          showBookmarksBar={settings.showBookmarksBar}
          theme={settings.theme}
          onNavigate={handleNavigate}
          onBack={handleBack}
          onForward={handleForward}
          onReload={handleReload}
          onHome={handleHome}
          onToggleBookmark={handleToggleBookmark}
          onToggleBookmarksBar={() =>
            handleUpdateSettings({ showBookmarksBar: !settings.showBookmarksBar })
          }
          onSetTheme={(themePreference: ThemePreference) =>
            handleUpdateSettings({ theme: themePreference })
          }
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSecurityInfo={() => setIsSecurityInfoOpen(true)}
          onOpenExternal={() => {
            if (activeTab.url && !activeTab.url.startsWith('portal://')) {
              window.open(activeTab.url, '_blank', 'noopener,noreferrer');
            }
          }}
        />

        {/* Bookmarks Bar */}
        {settings.showBookmarksBar && (
          <BookmarksBar
            bookmarks={bookmarks}
            onNavigate={handleNavigate}
            onRemoveBookmark={(id, e) => {
              e.stopPropagation();
              handleDeleteBookmark(id);
            }}
            onAddCurrentPage={handleToggleBookmark}
            onManageBookmarks={() => setIsBookmarksModalOpen(true)}
          />
        )}

        {/* Main Viewport Container */}
        <main className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
          <WebView
            activeTab={activeTab}
            settings={settings}
            recentHistory={history}
            bookmarks={bookmarks}
            onNavigate={handleNavigate}
            onBack={handleBack}
            onReload={handleReload}
            onHome={handleHome}
            onSearchEngineChange={(engine: SearchEngine) =>
              handleUpdateSettings({ defaultSearchEngine: engine })
            }
            onOpenSecurityInfo={() => setIsSecurityInfoOpen(true)}
            onUpdateTabState={handleUpdateTabState}
            onToggleFavoriteGame={handleToggleFavoriteGame}
          />
        </main>
      </div>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        history={history}
        onClose={() => setIsHistoryOpen(false)}
        onNavigate={(url) => {
          handleNavigate(url);
          setIsHistoryOpen(false);
        }}
        onOpenInNewTab={(url) => {
          handleNewTab(url);
          setIsHistoryOpen(false);
        }}
        onDeleteItem={handleDeleteHistoryItem}
        onClearAll={handleClearAllHistory}
      />

      {/* Bookmarks Modal */}
      <BookmarksModal
        isOpen={isBookmarksModalOpen}
        bookmarks={bookmarks}
        onClose={() => setIsBookmarksModalOpen(false)}
        onNavigate={(url) => {
          handleNavigate(url);
          setIsBookmarksModalOpen(false);
        }}
        onAddBookmark={handleAddBookmark}
        onUpdateBookmark={handleUpdateBookmark}
        onDeleteBookmark={handleDeleteBookmark}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={handleUpdateSettings}
        onResetAllData={handleResetAllData}
        isIpadMode={isIpadEmulation}
        onToggleIpadMode={() => setIsIpadEmulation(!isIpadEmulation)}
      />

      {/* Security & Embed Diagnostics Modal */}
      <SecurityInfoModal
        isOpen={isSecurityInfoOpen}
        onClose={() => setIsSecurityInfoOpen(false)}
      />
    </div>
  );
}
