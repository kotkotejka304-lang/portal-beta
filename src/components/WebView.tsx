import React, { useState, useEffect, useRef } from 'react';
import {
  ExternalLink,
  ShieldAlert,
  RotateCw,
  Copy,
  Check,
  AlertTriangle,
  ArrowLeft,
  Home,
  Loader2,
  Info,
  Globe,
} from 'lucide-react';
import { Bookmark, BrowserSettings, HistoryItem, SearchEngine, Tab } from '../types/browser';
import { checkKnownEmbedRestrictions, extractDomain } from '../utils/url';
import { WelcomePage } from './WelcomePage';
import { TestPages } from './TestPages';

interface WebViewProps {
  activeTab: Tab;
  settings: BrowserSettings;
  recentHistory: HistoryItem[];
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onBack: () => void;
  onReload: () => void;
  onHome: () => void;
  onSearchEngineChange: (engine: SearchEngine) => void;
  onOpenSecurityInfo: () => void;
  onUpdateTabState: (tabId: string, updates: Partial<Tab>) => void;
}

export const WebView: React.FC<WebViewProps> = ({
  activeTab,
  settings,
  recentHistory,
  bookmarks,
  onNavigate,
  onBack,
  onReload,
  onHome,
  onSearchEngineChange,
  onOpenSecurityInfo,
  onUpdateTabState,
}) => {
  const [copied, setCopied] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [userBypassedRestriction, setUserBypassedRestriction] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isInternal = activeTab.url.startsWith('portal://');
  const embedRestriction = !isInternal
    ? checkKnownEmbedRestrictions(activeTab.url)
    : { isLikelyBlocked: false };

  // Reset restriction bypass when URL changes
  useEffect(() => {
    setUserBypassedRestriction(false);
    setLoadTimedOut(false);
  }, [activeTab.url]);

  // Handle iframe load detection and graceful timeout
  useEffect(() => {
    if (isInternal) {
      setLoadTimedOut(false);
      return;
    }

    // If known blocked and user hasn't bypassed, don't set loading timers
    if (embedRestriction.isLikelyBlocked && !userBypassedRestriction) {
      onUpdateTabState(activeTab.id, { isLoading: false });
      return;
    }

    setLoadTimedOut(false);
    onUpdateTabState(activeTab.id, { isLoading: true, hasError: false });

    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
    }

    // 6-second timeout timer to prevent endless spinning
    timeoutTimerRef.current = setTimeout(() => {
      setLoadTimedOut(true);
      onUpdateTabState(activeTab.id, { isLoading: false });
    }, 6000);

    return () => {
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
    };
  }, [
    activeTab.url,
    isInternal,
    activeTab.id,
    embedRestriction.isLikelyBlocked,
    userBypassedRestriction,
  ]);

  const handleIframeLoad = () => {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
    }
    // Note: Due to cross-origin security restrictions, parent JS cannot read iframe DOM.
    // We conclude the loading cycle truthfully without claiming remote verification.
    onUpdateTabState(activeTab.id, { isLoading: false });
  };

  const handleIframeError = () => {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
    }
    setLoadTimedOut(true);
    onUpdateTabState(activeTab.id, { isLoading: false });
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(activeTab.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleOpenExternal = () => {
    if (activeTab.url && !activeTab.url.startsWith('portal://')) {
      window.open(activeTab.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Build sandbox permissions string from settings
  const sandboxDirectives = [
    settings.sandboxPermissions.allowScripts ? 'allow-scripts' : '',
    settings.sandboxPermissions.allowSameOrigin ? 'allow-same-origin' : '',
    settings.sandboxPermissions.allowForms ? 'allow-forms' : '',
    settings.sandboxPermissions.allowPopups ? 'allow-popups' : '',
    settings.sandboxPermissions.allowDownloads ? 'allow-downloads' : '',
    'allow-modals',
  ]
    .filter(Boolean)
    .join(' ');

  // 1. Internal Pages Routing
  if (activeTab.url === 'portal://welcome' || activeTab.url === 'portal://home') {
    return (
      <WelcomePage
        recentHistory={recentHistory}
        bookmarks={bookmarks}
        defaultSearchEngine={settings.defaultSearchEngine}
        onNavigate={onNavigate}
        onSearchEngineChange={onSearchEngineChange}
        onOpenSecurityInfo={onOpenSecurityInfo}
      />
    );
  }

  if (activeTab.url === 'portal://test-blocked') {
    return (
      <TestPages
        type="blocked"
        onNavigate={onNavigate}
        onBack={onBack}
      />
    );
  }

  if (activeTab.url === 'portal://test-embeddable') {
    return (
      <TestPages
        type="embeddable"
        onNavigate={onNavigate}
        onBack={onBack}
      />
    );
  }

  // 2. Error Screen for Invalid URL or Scheme Rejection
  if (activeTab.hasError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0f1115] text-slate-100 text-center">
        <div className="max-w-md w-full p-6 rounded-2xl bg-[#171a21] border border-rose-500/30 shadow-xl space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Address Not Supported</h2>
            <p className="text-xs text-rose-300">
              {activeTab.errorMessage || 'Unable to load the requested web address.'}
            </p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Portal only permits valid HTTP and HTTPS web addresses. Unsafe pseudo-protocols (like <code>javascript:</code>, <code>file:</code>, and <code>data:</code>) are strictly blocked.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Go Back
            </button>
            <button
              type="button"
              onClick={onReload}
              className="px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Retry
            </button>
            <button
              type="button"
              onClick={onHome}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              Portal Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Known Blocked Site Screen (e.g. Discord, DuckDuckGo, Google, YouTube, etc.)
  if (embedRestriction.isLikelyBlocked && !userBypassedRestriction) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0f1115] text-slate-100 text-center z-10 overflow-y-auto">
        <div className="max-w-lg w-full p-6 sm:p-8 rounded-2xl bg-[#171a21] border border-amber-500/30 shadow-2xl space-y-5 text-left">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">
                Embedding Prohibited by {extractDomain(activeTab.url)}
              </h2>
              <span className="inline-block text-[11px] font-mono text-amber-400/90 break-all">
                {activeTab.url}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed bg-[#111318] p-4 rounded-xl border border-white/[0.06]">
            <p className="font-semibold text-slate-200">
              Why does this website refuse to connect inside Portal?
            </p>
            <p className="text-slate-400">
              {embedRestriction.reason ||
                'This website enforces HTTP security headers that strictly forbid browser embedding.'}
            </p>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] space-y-1 font-mono text-[11px]">
              <div className="text-amber-300 font-medium">Headers Enforced by Server:</div>
              <div className="text-slate-400">• X-Frame-Options: SAMEORIGIN (or DENY)</div>
              <div className="text-slate-400">• Content-Security-Policy: frame-ancestors &apos;self&apos;</div>
            </div>
            <p className="text-slate-400 text-[11px]">
              These security rules are enforced by modern browser engines (Chrome, Safari, iPadOS) to protect your accounts against clickjacking. They cannot be bypassed from within an in-page frame.
            </p>
          </div>

          {/* Primary Action: Open in New Tab (outside Portal) */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleOpenExternal}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in New Tab (outside Portal)</span>
            </button>
            <p className="text-[11px] text-center text-slate-500">
              Launches the website in a full browser tab where embedding restrictions do not apply.
            </p>
          </div>

          {/* Secondary Controls (Retry, Back, Home, Copy, Try anyway) */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go Back</span>
            </button>

            <button
              type="button"
              onClick={onHome}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Portal Home</span>
            </button>

            <button
              type="button"
              onClick={onReload}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>

            <button
              type="button"
              onClick={handleCopyUrl}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy URL'}</span>
            </button>

            <button
              type="button"
              onClick={() => setUserBypassedRestriction(true)}
              className="ml-auto text-[11px] text-slate-500 hover:text-slate-300 underline transition-colors"
            >
              Try Frame Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Connection Timeout / Generic Embedding Failure Screen
  if (loadTimedOut) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0f1115] text-slate-100 text-center z-10 overflow-y-auto">
        <div className="max-w-lg w-full p-6 sm:p-8 rounded-2xl bg-[#171a21] border border-amber-500/30 shadow-2xl space-y-5 text-left">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">
                Unable to Display {extractDomain(activeTab.url)} in Frame
              </h2>
              <span className="inline-block text-[11px] font-mono text-amber-400/90 break-all">
                {activeTab.url}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300 leading-relaxed bg-[#111318] p-4 rounded-xl border border-white/[0.06]">
            <p className="font-semibold text-slate-200">
              Embedding Timeout / Refused Connection
            </p>
            <p className="text-slate-400">
              The target website took too long to load, or its server rejected in-frame embedding through <code>X-Frame-Options</code> or Content Security Policy (CSP).
            </p>
            <p className="text-slate-400 text-[11px]">
              Due to browser cross-origin boundaries, parent web applications cannot inspect cross-origin error bodies. You can open the destination directly in a separate browser tab below.
            </p>
          </div>

          {/* Primary Action */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleOpenExternal}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in New Tab (outside Portal)</span>
            </button>
            <p className="text-[11px] text-center text-slate-500">
              Opens the destination directly in your native browser.
            </p>
          </div>

          {/* Secondary Controls */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onReload}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>

            <button
              type="button"
              onClick={onBack}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go Back</span>
            </button>

            <button
              type="button"
              onClick={onHome}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Portal Home</span>
            </button>

            <button
              type="button"
              onClick={handleCopyUrl}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy URL'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Active External Sandboxed Iframe Container
  return (
    <div className="relative flex-1 w-full h-full flex flex-col bg-[#0f1115] overflow-hidden">
      {/* Top Animated Progress Bar */}
      {activeTab.isLoading && (
        <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/[0.05] overflow-hidden">
          <div className="h-full bg-emerald-400 animate-pulse w-3/4 transition-all duration-300" />
        </div>
      )}

      {/* Floating Loading Pill */}
      {activeTab.isLoading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-[#171a21]/90 backdrop-blur-md border border-white/[0.1] shadow-lg flex items-center gap-2 text-xs text-slate-300 animate-in fade-in">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          <span>Connecting to {extractDomain(activeTab.url)}...</span>
        </div>
      )}

      {/* Sandboxed iframe */}
      <iframe
        ref={iframeRef}
        src={activeTab.url}
        title={activeTab.title || 'Web Frame'}
        sandbox={sandboxDirectives}
        allow="fullscreen; accelerometer; gyroscope; encrypted-media; picture-in-picture"
        loading="lazy"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        className="w-full h-full border-0 bg-white"
      />

      {/* Persistent Bottom Embed Information & External Action Bar */}
      <footer className="shrink-0 px-3 py-1.5 bg-[#13161c] border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 select-none">
        <div className="flex items-center gap-2 truncate pr-2">
          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate text-[11px]">
            Sandboxed Frame · If content is blank or refused to connect, the host prohibits embedding.
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleOpenExternal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-colors"
            title="Open destination in native browser tab outside Portal"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open in New Tab</span>
          </button>
          <button
            type="button"
            onClick={onReload}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Reload Frame"
          >
            <RotateCw className="w-3 h-3" />
          </button>
        </div>
      </footer>
    </div>
  );
};
