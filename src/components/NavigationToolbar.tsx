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
  Search,
  HelpCircle,
} from 'lucide-react';
import { Tab } from '../types/browser';
import { extractDomain } from '../utils/url';

interface NavigationToolbarProps {
  activeTab: Tab;
  canGoBack: boolean;
  canGoForward: boolean;
  isBookmarked: boolean;
  showBookmarksBar: boolean;
  onNavigate: (input: string) => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  onToggleBookmark: () => void;
  onToggleBookmarksBar: () => void;
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
  onNavigate,
  onBack,
  onForward,
  onReload,
  onHome,
  onToggleBookmark,
  onToggleBookmarksBar,
  onOpenHistory,
  onOpenSettings,
  onOpenSecurityInfo,
  onOpenExternal,
}) => {
  const [inputValue, setInputValue] = useState(activeTab.url);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync address input when active tab changes, unless currently editing
  useEffect(() => {
    if (!isFocused) {
      if (activeTab.url === 'portal://welcome') {
        setInputValue('');
      } else {
        setInputValue(activeTab.url);
      }
    }
  }, [activeTab.url, isFocused]);

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
  const isHttps = activeTab.url.startsWith('https://');

  return (
    <header className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-[#171a21] border-b border-white/[0.08] select-none text-slate-200">
      {/* Navigation Buttons (Back, Forward, Reload, Home) */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          aria-label="Back"
          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.07] disabled:text-slate-600 disabled:hover:bg-transparent transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500"
          title="Back (Alt+Left)"
        >
          <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        <button
          type="button"
          onClick={onForward}
          disabled={!canGoForward}
          aria-label="Forward"
          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.07] disabled:text-slate-600 disabled:hover:bg-transparent transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500"
          title="Forward (Alt+Right)"
        >
          <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        <button
          type="button"
          onClick={onReload}
          aria-label="Reload page"
          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.07] transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500"
          title="Reload (Ctrl+R / Cmd+R)"
        >
          <RotateCw
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform ${
              activeTab.isLoading ? 'animate-spin text-emerald-400' : ''
            }`}
          />
        </button>

        <button
          type="button"
          onClick={onHome}
          aria-label="Home page"
          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.07] transition-colors focus-visible:ring-1 focus-visible:ring-emerald-500"
          title="Portal Home"
        >
          <Home className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>
      </div>

      {/* Omnibox / URL Address Input */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 min-w-0 flex items-center h-8 sm:h-9 px-2.5 rounded-lg bg-[#0e1014] border border-white/[0.1] focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all shadow-inner"
      >
        {/* Security / Scheme Icon */}
        <div className="flex items-center mr-2 shrink-0">
          {isInternal ? (
            <span
              title="Portal Internal Page"
              className="flex items-center text-emerald-400 cursor-pointer"
              onClick={onOpenSecurityInfo}
            >
              <Compass className="w-3.5 h-3.5" />
            </span>
          ) : isHttps ? (
            <span
              title="Secure Connection (HTTPS)"
              className="flex items-center text-emerald-400 cursor-pointer"
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
          placeholder="Search with DuckDuckGo or enter web address"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none truncate font-mono"
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
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
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
            className={`p-1 ml-1 rounded transition-colors ${
              isBookmarked
                ? 'text-emerald-400 hover:text-emerald-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                isBookmarked ? 'fill-emerald-400 text-emerald-400' : ''
              }`}
            />
          </button>
        )}

        {/* Go Submit Button (shows when focused or typed) */}
        {isFocused && (
          <button
            type="submit"
            aria-label="Navigate"
            className="ml-1 px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors shrink-0"
          >
            Go
          </button>
        )}
      </form>

      {/* Auxiliary Action Controls */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        {/* Bookmarks Bar Toggle */}
        <button
          type="button"
          onClick={onToggleBookmarksBar}
          aria-label="Toggle Bookmarks Bar"
          aria-pressed={showBookmarksBar}
          className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg transition-colors ${
            showBookmarksBar
              ? 'text-emerald-400 bg-white/[0.05]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
          }`}
          title="Toggle Bookmarks Bar (Ctrl+B)"
        >
          <BookmarkIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* History Button */}
        <button
          type="button"
          onClick={onOpenHistory}
          aria-label="Open Browsing History"
          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors"
          title="History (Ctrl+H)"
        >
          <History className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Open in External Tab (fallback for sites with strict CSP / X-Frame-Options) */}
        {!isInternal && (
          <button
            type="button"
            onClick={onOpenExternal}
            aria-label="Open in external browser window"
            className="hidden sm:flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/[0.05] transition-colors"
            title="Open in external browser window"
          >
            <ExternalLink className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        )}

        {/* Security & Sandbox Info */}
        <button
          type="button"
          onClick={onOpenSecurityInfo}
          aria-label="Security and Sandbox Information"
          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/[0.05] transition-colors"
          title="Sandbox Security & Embed Diagnostics"
        >
          <ShieldCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Browser Settings"
          className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>
      </div>
    </header>
  );
};
