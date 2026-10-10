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
  Clock,
  Settings as SettingsIcon,
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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const secondsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isInternal = activeTab.url.startsWith('portal://');
  const embedRestriction = !isInternal
    ? checkKnownEmbedRestrictions(activeTab.url)
    : { isLikelyBlocked: false };

  const timeoutDuration = (settings.loadTimeoutSeconds || 12) * 1000;

  // Reset restriction bypass and timeout when URL changes
  useEffect(() => {
    setUserBypassedRestriction(false);
    setLoadTimedOut(false);
    setElapsedSeconds(0);
  }, [activeTab.url]);

  // Handle iframe load detection, seconds counter, and configurable timeout
  useEffect(() => {
    if (isInternal) {
      setLoadTimedOut(false);
      setElapsedSeconds(0);
      return;
    }

    // If known blocked and user hasn't bypassed, don't spin endlessly
    if (embedRestriction.isLikelyBlocked && !userBypassedRestriction) {
      onUpdateTabState(activeTab.id, { isLoading: false });
      return;
    }

    setLoadTimedOut(false);
    setElapsedSeconds(0);
    onUpdateTabState(activeTab.id, { isLoading: true, hasError: false });

    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
    }
    if (secondsTimerRef.current) {
      clearInterval(secondsTimerRef.current);
    }

    // Second-by-second ticker for honest progress feedback
    secondsTimerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Configurable timeout to prevent endless spinner on slower devices/networks
    timeoutTimerRef.current = setTimeout(() => {
      if (secondsTimerRef.current) {
        clearInterval(secondsTimerRef.current);
      }
      setLoadTimedOut(true);
      onUpdateTabState(activeTab.id, { isLoading: false });
    }, timeoutDuration);

    return () => {
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
      if (secondsTimerRef.current) {
        clearInterval(secondsTimerRef.current);
      }
    };
  }, [
    activeTab.url,
    isInternal,
    activeTab.id,
    embedRestriction.isLikelyBlocked,
    userBypassedRestriction,
    timeoutDuration,
  ]);

  const handleIframeLoad = () => {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
    }
    if (secondsTimerRef.current) {
      clearInterval(secondsTimerRef.current);
    }
    setLoadTimedOut(false);
    // Conclude loading truthfully without claiming remote content verification
    onUpdateTabState(activeTab.id, { isLoading: false });
  };

  const handleIframeError = () => {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
    }
    if (secondsTimerRef.current) {
      clearInterval(secondsTimerRef.current);
    }
    setLoadTimedOut(true);
    onUpdateTabState(activeTab.id, { isLoading: false });
  };

  const handleRetry = () => {
    setLoadTimedOut(false);
    setUserBypassedRestriction(false);
    setElapsedSeconds(0);
    onReload();
  };

  const handleExtendTimeout = () => {
    setLoadTimedOut(false);
    onUpdateTabState(activeTab.id, { isLoading: true });

    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
    }

    // Extend wait by an extra 12 seconds
    timeoutTimerRef.current = setTimeout(() => {
      setLoadTimedOut(true);
      onUpdateTabState(activeTab.id, { isLoading: false });
    }, 12000);
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

  // 2. Unified Portal Error Screen Template
  const renderPortalErrorScreen = (config: {
    badgeText: string;
    title: string;
    subtitle: string;
    explanation: string;
    diagnosticPoints?: string[];
    headerDetails?: string[];
    showOpenExternal?: boolean;
    showExtendTimeout?: boolean;
    showBypass?: boolean;
  }) => {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#0f1115] text-slate-100 text-center z-10 overflow-y-auto">
        <div className="max-w-xl w-full p-6 sm:p-8 rounded-2xl bg-[#171a21] border border-white/[0.08] shadow-2xl space-y-6 text-left">
          {/* Header & Status Badge */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mb-1">
                <span>{config.badgeText}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {config.title}
              </h2>
              <p className="text-xs text-slate-400">
                {config.subtitle}
              </p>
            </div>
          </div>

          {/* Original URL Display Box */}
          <div className="space-y-1.5 bg-[#0e1014] p-3.5 rounded-xl border border-white/[0.06]">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-medium text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Original Destination Address
              </span>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Address'}</span>
              </button>
            </div>
            <div className="text-xs font-mono text-emerald-400 break-all select-all pt-0.5">
              {activeTab.url}
            </div>
          </div>

          {/* Explanation & Technical Breakdown */}
          <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed bg-[#12151c] p-4 rounded-xl border border-white/[0.06]">
            <p className="font-semibold text-slate-200">
              Diagnostic Analysis
            </p>
            <p className="text-slate-400">
              {config.explanation}
            </p>

            {config.diagnosticPoints && (
              <ul className="space-y-1.5 text-slate-300 text-[11px] pt-1">
                {config.diagnosticPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {config.headerDetails && (
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] space-y-1 font-mono text-[11px] mt-2">
                <div className="text-emerald-400 font-medium">Headers Enforced by Server:</div>
                {config.headerDetails.map((header) => (
                  <div key={header} className="text-slate-400">• {header}</div>
                ))}
              </div>
            )}
          </div>

          {/* Primary Action: Open in New Tab */}
          {config.showOpenExternal !== false && (
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleOpenExternal}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in New Tab</span>
              </button>
              <div className="flex items-start gap-1.5 px-1 text-[11px] text-slate-400">
                <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Notice:</strong> This uses the original URL ({extractDomain(activeTab.url)}) and opens it in a separate native browser window outside Portal where in-page iframe restrictions do not apply.
                </span>
              </div>
            </div>
          )}

          {/* Secondary Controls Bar (Retry, Back, Home, Extend Timeout, Bypass) */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={handleRetry}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Retry loading this page"
            >
              <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Retry</span>
            </button>

            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Go back to previous page"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={onHome}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Return to Portal Home"
            >
              <Home className="w-3.5 h-3.5 text-emerald-400" />
              <span>Home</span>
            </button>

            {config.showExtendTimeout && (
              <button
                type="button"
                onClick={handleExtendTimeout}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Wait an extra 12 seconds for slow servers"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Wait Longer (+12s)</span>
              </button>
            )}

            {config.showBypass && (
              <button
                type="button"
                onClick={() => setUserBypassedRestriction(true)}
                className="ml-auto text-[11px] text-slate-500 hover:text-slate-300 underline transition-colors"
                title="Attempts to mount the raw iframe in the DOM"
              >
                Try Frame Anyway
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 3. Known Blocked Site Screen (Discord, DuckDuckGo, Google, etc.)
  if (embedRestriction.isLikelyBlocked && !userBypassedRestriction) {
    return renderPortalErrorScreen({
      badgeText: 'Embedding Restricted by Server',
      title: `Cannot Display ${extractDomain(activeTab.url)} in Frame`,
      subtitle: `${extractDomain(activeTab.url)} blocks iframe embedding using X-Frame-Options or Content Security Policy.`,
      explanation:
        embedRestriction.reason ||
        'This website enforces HTTP security headers that strictly forbid browser embedding.',
      headerDetails: [
        'X-Frame-Options: SAMEORIGIN (or DENY)',
        "Content-Security-Policy: frame-ancestors 'self'",
      ],
      showOpenExternal: true,
      showExtendTimeout: false,
      showBypass: true,
    });
  }

  // 4. Invalid Address / Protocol Rejection Screen
  if (activeTab.hasError) {
    return renderPortalErrorScreen({
      badgeText: 'Invalid Web Address',
      title: 'Address Not Supported',
      subtitle: activeTab.errorMessage || 'Unable to open the requested web address.',
      explanation:
        'Portal allows only valid HTTP and HTTPS web addresses. Unsafe pseudo-protocols such as javascript:, file:, data:, or non-web schemes are strictly blocked for your device security.',
      showOpenExternal: false,
      showExtendTimeout: false,
      showBypass: false,
    });
  }

  // 5. Connection Timeout Screen (e.g. slow networks, latency, Cloudflare challenge, or slow DNS)
  if (loadTimedOut) {
    return renderPortalErrorScreen({
      badgeText: `Connection Timeout (${settings.loadTimeoutSeconds || 12}s)`,
      title: `Unable to Display ${extractDomain(activeTab.url)} in Frame`,
      subtitle: `The server took longer than ${settings.loadTimeoutSeconds || 12} seconds to complete loading.`,
      explanation:
        `Portal stopped waiting after ${settings.loadTimeoutSeconds || 12} seconds to prevent an endless loading state. This commonly occurs due to:`,
      diagnosticPoints: [
        'Network latency or slow DNS resolution on this specific device or Wi-Fi connection.',
        'Cloudflare verification challenges, interstitials, or redirect loops requiring user interaction.',
        'Strict browser privacy shields or school network filters blocking cross-origin embedded frames.',
        'The host server enforcing X-Frame-Options or CSP headers without notifying parent scripts.',
      ],
      showOpenExternal: true,
      showExtendTimeout: true,
      showBypass: false,
    });
  }

  // 6. Active External Sandboxed Iframe Container
  return (
    <div className="relative flex-1 w-full h-full flex flex-col bg-[#0f1115] overflow-hidden">
      {/* Top Animated Progress Bar */}
      {activeTab.isLoading && (
        <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/[0.05] overflow-hidden">
          <div className="h-full bg-emerald-400 animate-pulse w-3/4 transition-all duration-300" />
        </div>
      )}

      {/* Floating Loading Indicator with Elapsed Seconds */}
      {activeTab.isLoading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full bg-[#171a21]/95 backdrop-blur-md border border-white/[0.1] shadow-lg flex items-center gap-2 text-xs text-slate-300 animate-in fade-in">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          <span>
            Connecting to {extractDomain(activeTab.url)} ({elapsedSeconds}s)
          </span>
          {elapsedSeconds >= 4 && (
            <button
              type="button"
              onClick={handleOpenExternal}
              className="ml-1 text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open in New Tab</span>
            </button>
          )}
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

      {/* Bottom Embed Status & External Launch Bar */}
      <footer className="shrink-0 px-3 py-1.5 bg-[#13161c] border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 select-none">
        <div className="flex items-center gap-2 truncate pr-2">
          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate text-[11px]">
            Sandboxed Frame ({settings.loadTimeoutSeconds || 12}s timeout) · If content is blank or slow, use Open in New Tab.
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
            onClick={handleRetry}
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
