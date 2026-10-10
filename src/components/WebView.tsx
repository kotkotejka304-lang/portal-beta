import React, { useState, useEffect, useRef } from 'react';
import {
  ExternalLink,
  ShieldAlert,
  RotateCw,
  Copy,
  Check,
  AlertTriangle,
  ArrowLeft,
  Info,
  Globe,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Bookmark, BrowserSettings, HistoryItem, SearchEngine, Tab } from '../types/browser';
import { checkKnownEmbedRestrictions, extractDomain } from '../utils/url';
import { WelcomePage } from './WelcomePage';

interface WebViewProps {
  activeTab: Tab;
  settings: BrowserSettings;
  recentHistory: HistoryItem[];
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onBack: () => void;
  onReload: () => void;
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
  onSearchEngineChange,
  onOpenSecurityInfo,
  onUpdateTabState,
}) => {
  const [copied, setCopied] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isInternal = activeTab.url.startsWith('portal://');
  const embedRestriction = !isInternal ? checkKnownEmbedRestrictions(activeTab.url) : { isLikelyBlocked: false };

  // Handle iframe load detection and graceful timeout
  useEffect(() => {
    if (isInternal) {
      setLoadTimedOut(false);
      return;
    }

    setLoadTimedOut(false);
    onUpdateTabState(activeTab.id, { isLoading: true, hasError: false });

    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
    }

    // Set a sensible 7-second grace timer. Never display an endless spinner!
    timeoutTimerRef.current = setTimeout(() => {
      setLoadTimedOut(true);
      onUpdateTabState(activeTab.id, { isLoading: false });
    }, 7000);

    return () => {
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
    };
  }, [activeTab.url, isInternal, activeTab.id]);

  const handleIframeLoad = () => {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
    }
    setLoadTimedOut(false);
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

  // Internal Welcome Page view
  if (activeTab.url === 'portal://welcome' || isInternal) {
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

  // Error screen for invalid URL or scheme rejection
  if (activeTab.hasError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0f1115] text-slate-100 text-center">
        <div className="max-w-md w-full p-6 rounded-2xl bg-[#171a21] border border-rose-500/30 shadow-xl space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Navigation Blocked</h2>
            <p className="text-xs text-rose-300">
              {activeTab.errorMessage || 'Unable to open requested resource.'}
            </p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Portal validates all addresses against unsafe schemes (like <code>javascript:</code>, <code>file:</code>, and <code>data:</code>) to keep your device secure.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
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
              onClick={() => onNavigate('portal://welcome')}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active External URL View with sandboxed iframe
  return (
    <div className="relative flex-1 w-full h-full flex flex-col bg-[#0f1115] overflow-hidden">
      {/* Loading Progress Bar */}
      {activeTab.isLoading && (
        <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-white/[0.05] overflow-hidden">
          <div className="h-full bg-emerald-400 animate-pulse w-2/3" />
        </div>
      )}

      {/* Known Blocked Site Screen (e.g. Google, YouTube, GitHub, Twitter) */}
      {embedRestriction.isLikelyBlocked ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0f1115] text-slate-100 text-center z-10 overflow-y-auto">
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-2xl bg-[#171a21] border border-amber-500/30 shadow-2xl space-y-5 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Embedding Prohibited by {extractDomain(activeTab.url)}
                </h2>
                <span className="inline-block text-[11px] font-mono text-amber-400/90 break-all">
                  {activeTab.url}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed bg-[#111318] p-3.5 rounded-xl border border-white/[0.06]">
              <p className="font-medium text-slate-200">
                Why isn&apos;t this website showing inside Portal?
              </p>
              <p className="text-slate-400">
                Modern high-profile websites (including Google, YouTube, GitHub, and social media) send strict HTTP security headers:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono text-[11px] pl-1">
                <li><code>X-Frame-Options: SAMEORIGIN</code></li>
                <li><code>Content-Security-Policy: frame-ancestors &apos;self&apos;</code></li>
              </ul>
              <p className="text-slate-400 pt-1">
                These headers instruct web browsers (Chrome, Safari, iPadOS) to block embedding to prevent clickjacking and session spoofing. This is standard web architecture.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenExternal}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in New Browser Tab</span>
              </button>

              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3.5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-slate-200 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Address'}</span>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs sm:text-sm font-medium transition-colors"
              >
                Go Back
              </button>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
              <span>Looking for verified embeddable sites?</span>
              <button
                type="button"
                onClick={() => onNavigate('portal://welcome')}
                className="text-emerald-400 hover:underline"
              >
                View Curated Sites
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Normal Embeddable Iframe Container */
        <div className="relative flex-1 w-full h-full bg-[#111318]">
          {/* Timeout or Potential Block Diagnostic Toast */}
          {loadTimedOut && (
            <div className="absolute top-2 left-4 right-4 sm:left-auto sm:right-4 z-30 max-w-md p-3 rounded-xl bg-[#171a21]/95 border border-amber-500/40 backdrop-blur-md shadow-2xl text-xs space-y-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-slate-200">
                    Site taking long or blank screen?
                  </p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    If this website appears blank or refuses to connect, its server likely enforces <code>X-Frame-Options</code> or <code>frame-ancestors</code> restrictions.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 pl-6">
                <button
                  type="button"
                  onClick={handleOpenExternal}
                  className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open in New Tab
                </button>
                <button
                  type="button"
                  onClick={() => setLoadTimedOut(false)}
                  className="px-2 py-1 rounded text-slate-400 hover:text-slate-200 text-[11px]"
                >
                  Dismiss
                </button>
              </div>
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
            className="w-full h-full border-0 bg-white"
          />

          {/* Floating View Controls (Bottom Right) */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 p-1 rounded-lg bg-[#171a21]/80 backdrop-blur-md border border-white/[0.08] text-slate-400 text-xs">
            <button
              type="button"
              onClick={handleOpenExternal}
              title="Open current page in native browser tab"
              className="p-1.5 rounded hover:text-emerald-400 hover:bg-white/[0.08] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onReload}
              title="Reload Frame"
              className="p-1.5 rounded hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
