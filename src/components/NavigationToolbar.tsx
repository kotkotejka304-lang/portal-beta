import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Lock,
  Compass,
  Star,
  ExternalLink,
  History,
  Bookmark as BookmarkIcon,
  Settings,
  ShieldAlert,
  ShieldCheck,
  X,
  Gamepad2,
  Sun,
  Moon,
  Monitor,
  Check,
} from 'lucide-react';
import { Tab, ThemePreference } from '../types/browser';

interface NavigationToolbarProps {
  activeTab: Tab;
  canGoBack: boolean;
  canGoForward: boolean;
  isBookmarked: boolean;
  showBookmarksBar: boolean;
  theme: ThemePreference;
  onNavigate: (input: string) => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  onToggleBookmark: () => void;
  onToggleBookmarksBar: () => void;
  onSetTheme: (theme: ThemePreference) => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenSecurityInfo: () => void;
  onOpenExternal: () => void;
}

export const NavigationToolbar: React.FC<NavigationToolbarProps> = ({
  activeTab,
  canGoBack,
  canGoForward,
  isBookmarked,
  showBookmarksBar,
  theme,
  onNavigate,
  onBack,
  onForward,
  onReload,
  onHome,
  onToggleBookmark,
  onToggleBookmarksBar,
  onSetTheme,
  onOpenHistory,
  onOpenSettings,
  onOpenSecurityInfo,
  onOpenExternal,
}) => {
  const [inputValue, setInputValue] = useState(activeTab.url);
  const [isFocused, setIsFocused] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Sync address input when active tab changes, unless currently editing
  useEffect(() => {
    if (!isFocused) {
      if (activeTab.url === 'portal://welcome' || activeTab.url === 'portal://home') {
        setInputValue('');
      } else {
        setInputValue(activeTab.url);
      }
    }
  }, [activeTab.url, isFocused]);

  // Close theme menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    if (isThemeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isThemeMenuOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onNavigate(inputValue);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setInputValue('');
    inputRef.current?.focus();
  };

  const isInternal = activeTab.url.startsWith('portal://');
  const isGame = activeTab.url.includes('portal://game') || activeTab.url === 'portal://games';
  const isHttps = activeTab.url.startsWith('https://');

  return (
    <header className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 glass-toolbar border-b border-[var(--border-glass)] select-none text-[var(--text-primary)] relative z-30">
      {/* Navigation Controls (Back, Forward, Reload, Home, Arcade) */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          aria-label="Back"
          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] disabled:opacity-30 disabled:hover:bg-transparent transition-all border border-transparent hover:border-[var(--border-glass)] active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          title="Back (Alt+Left)"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onForward}
          disabled={!canGoForward}
          aria-label="Forward"
          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] disabled:opacity-30 disabled:hover:bg-transparent transition-all border border-transparent hover:border-[var(--border-glass)] active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          title="Forward (Alt+Right)"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onReload}
          aria-label="Reload page"
          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] transition-all border border-transparent hover:border-[var(--border-glass)] active:scale-95 cursor-pointer"
          title="Reload (Ctrl+R / Cmd+R)"
        >
          <RotateCw
            className={`w-4 h-4 transition-transform ${
              activeTab.isLoading ? 'animate-spin text-sky-400' : ''
            }`}
          />
        </button>

        <button
          type="button"
          onClick={onHome}
          aria-label="Home page"
          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] transition-all border border-transparent hover:border-[var(--border-glass)] active:scale-95 cursor-pointer"
          title="Portal Home"
        >
          <Home className="w-4 h-4" />
        </button>

        {/* Portal Arcade Quick Hub Button */}
        <button
          type="button"
          onClick={() => onNavigate('portal://games')}
          aria-label="Portal Arcade & Gaming Discovery"
          className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl transition-all border active:scale-95 cursor-pointer ${
            isGame
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-[0_0_14px_rgba(56,189,248,0.35)]'
              : 'text-[var(--text-secondary)] hover:text-sky-400 hover:bg-white/[0.08] border-transparent hover:border-[var(--border-glass)]'
          }`}
          title="Portal Arcade Games"
        >
          <Gamepad2 className="w-4 h-4 text-sky-400" />
        </button>
      </div>

      {/* Apple Liquid Glass Omnibox / URL Capsule */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 min-w-0 flex items-center h-8 sm:h-9 px-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-glass)] focus-within:border-sky-500/70 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all shadow-[inset_0_1px_0_var(--specular-line)] backdrop-blur-xl"
      >
        {/* Security / Scheme Icon */}
        <div className="flex items-center mr-2 shrink-0">
          {isInternal ? (
            <span
              title="Portal Internal Page"
              className="flex items-center text-sky-400 cursor-pointer"
              onClick={onOpenSecurityInfo}
            >
              {isGame ? <Gamepad2 className="w-3.5 h-3.5" /> : <Compass className="w-3.5 h-3.5" />}
            </span>
          ) : isHttps ? (
            <span
              title="Secure Encrypted Connection (HTTPS)"
              className="flex items-center text-sky-400 cursor-pointer"
              onClick={onOpenSecurityInfo}
            >
              <Lock className="w-3.5 h-3.5" />
            </span>
          ) : (
            <span
              title="Insecure Connection (HTTP)"
              className="flex items-center text-amber-400 cursor-pointer"
              onClick={onOpenSecurityInfo}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            inputRef.current?.select();
          }}
          onBlur={() => setIsFocused(false)}
          placeholder="Search or enter web address / portal://games"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="w-full bg-transparent text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none truncate font-mono"
        />

        {/* Clear Button */}
        {inputValue && isFocused && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleClear();
            }}
            aria-label="Clear address input"
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Bookmark Star Button */}
        {!isInternal && (
          <button
            type="button"
            onClick={onToggleBookmark}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
            className={`p-1 ml-1 rounded-lg transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-amber-400 hover:text-amber-300'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                isBookmarked ? 'fill-amber-400 text-amber-400' : ''
              }`}
            />
          </button>
        )}

        {/* Go Submit Button (shows when focused or typed) */}
        {isFocused && (
          <button
            type="submit"
            aria-label="Navigate"
            className="ml-1 px-2.5 py-0.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer shadow-sm"
          >
            Go
          </button>
        )}
      </form>

      {/* Auxiliary Action Controls */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Real Theme Switcher (Light / Dark / System) */}
        <div className="relative" ref={themeMenuRef}>
          <button
            type="button"
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            aria-label={`Appearance Theme: currently ${theme}. Click to switch.`}
            aria-expanded={isThemeMenuOpen}
            className={`flex items-center justify-center gap-1 w-8 h-8 sm:w-9 sm:h-9 rounded-xl transition-all border border-transparent hover:border-[var(--border-glass)] active:scale-95 cursor-pointer ${
              theme === 'light'
                ? 'text-amber-500 hover:bg-amber-500/10'
                : theme === 'dark'
                ? 'text-sky-400 hover:bg-sky-500/10'
                : 'text-[var(--text-secondary)] hover:text-sky-400 hover:bg-white/[0.08]'
            }`}
            title={`Theme: ${theme.toUpperCase()} (Click to toggle)`}
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : theme === 'dark' ? (
              <Moon className="w-4 h-4 text-sky-400" />
            ) : (
              <Monitor className="w-4 h-4 text-sky-400" />
            )}
          </button>

          {/* Liquid Glass Theme Dropdown Menu */}
          {isThemeMenuOpen && (
            <div className="absolute right-0 top-11 z-50 w-38 p-1.5 rounded-2xl glass-panel shadow-2xl space-y-1 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Appearance
              </div>
              {(
                [
                  { id: 'light', label: 'Light', icon: Sun, color: 'text-amber-500' },
                  { id: 'dark', label: 'Dark', icon: Moon, color: 'text-sky-400' },
                  { id: 'system', label: 'System', icon: Monitor, color: 'text-blue-400' },
                ] as const
              ).map((mode) => {
                const IconComponent = mode.icon;
                const isSelected = theme === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      onSetTheme(mode.id);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/30'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <IconComponent className={`w-3.5 h-3.5 ${mode.color}`} />
                      <span>{mode.label}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bookmarks Bar Toggle */}
        <button
          type="button"
          onClick={onToggleBookmarksBar}
          aria-label="Toggle Bookmarks Bar"
          aria-pressed={showBookmarksBar}
          className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl transition-all border border-transparent hover:border-[var(--border-glass)] active:scale-95 cursor-pointer ${
            showBookmarksBar
              ? 'text-sky-400 bg-sky-500/15 border-sky-500/30'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.06]'
          }`}
          title="Toggle Bookmarks Bar (Ctrl+B)"
        >
          <BookmarkIcon className="w-4 h-4" />
        </button>

        {/* History Button */}
        <button
          type="button"
          onClick={onOpenHistory}
          aria-label="Open Browsing History"
          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] transition-all border border-transparent hover:border-[var(--border-glass)] active:scale-95 cursor-pointer"
          title="History (Ctrl+H)"
        >
          <History className="w-4 h-4" />
        </button>

        {/* Open in External Tab */}
        {!isInternal && (
          <button
            type="button"
            onClick={onOpenExternal}
            aria-label="Open in external browser window"
            className="hidden sm:flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-[var(--text-secondary)] hover:text-sky-400 hover:bg-white/[0.06] transition-all border border-transparent hover:border-[var(--border-glass)] active:scale-95 cursor-pointer"
            title="Open in external browser window"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}

        {/* Security & Embed Diagnostics Info */}
        <button
          type="button"
          onClick={onOpenSecurityInfo}
          aria-label="Security and Sandbox Information"
          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-[var(--text-secondary)] hover:text-sky-400 hover:bg-white/[0.06] transition-all border border-transparent hover:border-[var(--border-glass)] active:scale-95 cursor-pointer"
          title="Sandbox Security & Embed Diagnostics"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Browser Settings"
          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] transition-all border border-transparent hover:border-[var(--border-glass)] active:scale-95 cursor-pointer"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
