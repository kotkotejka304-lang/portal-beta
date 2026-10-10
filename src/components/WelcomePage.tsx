import React, { useState } from 'react';
import {
  Search,
  Globe,
  Clock,
  ExternalLink,
  ShieldCheck,
  Star,
  MapPin,
  Atom,
  BookOpen,
  Code,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Bookmark, HistoryItem, SearchEngine } from '../types/browser';
import { CURATED_SITES, extractDomain, getFaviconUrl } from '../utils/url';

interface WelcomePageProps {
  recentHistory: HistoryItem[];
  bookmarks: Bookmark[];
  defaultSearchEngine: SearchEngine;
  onNavigate: (url: string) => void;
  onSearchEngineChange: (engine: SearchEngine) => void;
  onOpenSecurityInfo: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  recentHistory,
  bookmarks,
  defaultSearchEngine,
  onNavigate,
  onSearchEngineChange,
  onOpenSecurityInfo,
}) => {
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onNavigate(query.trim());
    }
  };

  const getSiteIcon = (iconName: string) => {
    switch (iconName) {
      case 'map':
        return <MapPin className="w-5 h-5 text-emerald-400" />;
      case 'atom':
        return <Atom className="w-5 h-5 text-emerald-400" />;
      case 'code':
        return <Code className="w-5 h-5 text-emerald-400" />;
      case 'book':
      case 'book-open':
        return <BookOpen className="w-5 h-5 text-emerald-400" />;
      default:
        return <Globe className="w-5 h-5 text-emerald-400" />;
    }
  };

  const searchEngineLabels: Record<SearchEngine, string> = {
    duckduckgo: 'DuckDuckGo',
    google: 'Google',
    bing: 'Bing',
    ecosia: 'Ecosia',
    startpage: 'Startpage',
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 sm:py-12 bg-[#0f1115] text-slate-100">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Brand & Search Hero */}
        <div className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sandboxed Web Viewer · Safe Educational Browsing</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Portal Browser
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              Secure, multi-tab sandboxed web interface optimized for desktop and school-issued iPads.
            </p>
          </div>

          {/* Large Search / URL Omnibar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative max-w-2xl mx-auto"
          >
            <div className="relative flex items-center bg-[#171a21] border border-white/[0.12] hover:border-emerald-500/50 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/30 rounded-xl shadow-lg transition-all p-1.5 sm:p-2">
              <Search className="w-5 h-5 text-slate-400 ml-2.5 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the web or enter any web address (e.g. phet.colorado.edu)..."
                className="w-full bg-transparent px-3 py-2 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none font-sans"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-semibold text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>Navigate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Engine Selector */}
            <div className="flex items-center justify-center gap-3 mt-3 text-xs text-slate-400">
              <span className="text-slate-500">Search with:</span>
              {(['duckduckgo', 'google', 'bing', 'ecosia', 'startpage'] as SearchEngine[]).map(
                (engine) => (
                  <button
                    key={engine}
                    type="button"
                    onClick={() => onSearchEngineChange(engine)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      defaultSearchEngine === engine
                        ? 'text-emerald-400 bg-emerald-500/10 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {searchEngineLabels[engine]}
                  </button>
                )
              )}
            </div>
          </form>
        </div>

        {/* Curated Embeddable Sites Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Verified & Educational Sites
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Pre-tested for iframe sandboxing
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CURATED_SITES.map((site) => (
              <div
                key={site.url}
                role="button"
                tabIndex={0}
                onClick={() => onNavigate(site.url)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onNavigate(site.url);
                }}
                className="group p-3.5 rounded-xl bg-[#171a21] border border-white/[0.06] hover:border-emerald-500/40 hover:bg-[#1b1f28] transition-all cursor-pointer flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-white/[0.04] group-hover:bg-emerald-500/10 transition-colors">
                      {getSiteIcon(site.icon)}
                    </div>
                    {site.embedCompatibility === 'verified' && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-slate-100 group-hover:text-emerald-300 transition-colors">
                    {site.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {site.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-500">
                  <span>{extractDomain(site.url)}</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Bookmarks & Recent History Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Saved Bookmarks */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Bookmarks
                </h2>
              </div>
              <span className="text-xs text-slate-500">{bookmarks.length} saved</span>
            </div>

            {bookmarks.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#171a21]/50 border border-white/[0.04] text-center text-xs text-slate-500">
                No bookmarks saved yet. Star any site from the address bar to see it here.
              </div>
            ) : (
              <div className="space-y-1.5">
                {bookmarks.slice(0, 5).map((bm) => (
                  <button
                    key={bm.id}
                    type="button"
                    onClick={() => onNavigate(bm.url)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#171a21] hover:bg-[#1d212b] border border-white/[0.05] hover:border-emerald-500/30 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <img
                        src={bm.favicon || getFaviconUrl(bm.url)}
                        alt=""
                        className="w-4 h-4 rounded-sm object-contain shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="text-xs font-medium text-slate-200 group-hover:text-emerald-300 truncate">
                        {bm.title || extractDomain(bm.url)}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 shrink-0 font-mono">
                      {extractDomain(bm.url)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Recent History */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Recently Visited
                </h2>
              </div>
              <span className="text-xs text-slate-500">{recentHistory.length} total</span>
            </div>

            {recentHistory.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#171a21]/50 border border-white/[0.04] text-center text-xs text-slate-500">
                Your browsing history will show up here as you navigate.
              </div>
            ) : (
              <div className="space-y-1.5">
                {recentHistory.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.url)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#171a21] hover:bg-[#1d212b] border border-white/[0.05] hover:border-emerald-500/30 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <img
                        src={item.favicon || getFaviconUrl(item.url)}
                        alt=""
                        className="w-4 h-4 rounded-sm object-contain shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="text-xs font-medium text-slate-200 group-hover:text-emerald-300 truncate">
                        {item.title || extractDomain(item.url)}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Security & Honest Iframe Architecture Disclosure */}
        <section className="p-4 rounded-xl bg-[#13161c] border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-slate-200">
                Web Viewer Security & Embedding Notice
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Portal loads content in standard sandboxed iframes. Major consumer platforms (Discord, DuckDuckGo, Google, YouTube, GitHub) enforce strict HTTP headers (<code>X-Frame-Options: SAMEORIGIN/DENY</code> and CSP <code>frame-ancestors</code>) to prevent framing. When a site blocks framing, Portal detects it honestly and provides an external launch button.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenSecurityInfo}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30 whitespace-nowrap shrink-0 transition-colors"
          >
            Learn How It Works
          </button>
        </section>

        {/* Diagnostics & Controlled Test Suite */}
        <section className="p-4 rounded-xl bg-[#171a21] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Controlled Testing Suite
            </h3>
            <span className="text-[11px] text-slate-500">Verify embeddable vs blocked behavior</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('portal://test-embeddable')}
              className="p-2.5 rounded-lg bg-[#0e1014] hover:bg-[#1a1e27] border border-emerald-500/30 text-left transition-colors group"
            >
              <div className="text-xs font-semibold text-emerald-300 flex items-center justify-between">
                <span>Embeddable Test</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Test verified in-frame content</p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('portal://test-blocked')}
              className="p-2.5 rounded-lg bg-[#0e1014] hover:bg-[#1a1e27] border border-amber-500/30 text-left transition-colors group"
            >
              <div className="text-xs font-semibold text-amber-300 flex items-center justify-between">
                <span>Blocked Test</span>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Controlled X-Frame denial</p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('https://discord.com')}
              className="p-2.5 rounded-lg bg-[#0e1014] hover:bg-[#1a1e27] border border-white/[0.08] text-left transition-colors group"
            >
              <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>Test Discord</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Enforces X-Frame: DENY</p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('https://duckduckgo.com')}
              className="p-2.5 rounded-lg bg-[#0e1014] hover:bg-[#1a1e27] border border-white/[0.08] text-left transition-colors group"
            >
              <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>Test DuckDuckGo</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Enforces SAMEORIGIN</p>
            </button>
          </div>
        </section>

        {/* Keyboard Navigation Shortcuts Bar */}
        <div className="text-center text-xs text-slate-500 space-x-4 pb-4">
          <span><kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded border border-white/[0.1] text-slate-300 font-mono">Enter</kbd> Navigate</span>
          <span><kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded border border-white/[0.1] text-slate-300 font-mono">Alt + ← / →</kbd> Back / Forward</span>
          <span><kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded border border-white/[0.1] text-slate-300 font-mono">Ctrl/Cmd + R</kbd> Reload</span>
        </div>
      </div>
    </div>
  );
};
