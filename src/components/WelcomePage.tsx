import React, { useState, useMemo } from 'react';
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
  Heart,
  Gamepad2,
  Compass,
  Trophy,
  Zap,
  Layers,
  Brain,
  Rocket,
  Play,
  Flame,
  Check,
  Sliders,
  Disc,
  Flag,
  Smartphone,
  Users,
  Info,
  X,
} from 'lucide-react';
import { Bookmark, Game, GameCategory, HistoryItem, SearchEngine } from '../types/browser';
import { CURATED_SITES, getFaviconUrl } from '../utils/url';
import { ALL_GAMES, BUILT_IN_GAMES, GAME_PLATFORMS } from '../utils/games';

interface WelcomePageProps {
  recentHistory: HistoryItem[];
  bookmarks: Bookmark[];
  defaultSearchEngine: SearchEngine;
  favoriteGameIds?: string[];
  recentlyPlayedGameIds?: string[];
  onNavigate: (url: string) => void;
  onSearchEngineChange: (engine: SearchEngine) => void;
  onOpenSecurityInfo: () => void;
  onToggleFavoriteGame?: (gameId: string) => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  recentHistory,
  bookmarks,
  defaultSearchEngine,
  favoriteGameIds = ['game-snake', 'game-breakout'],
  recentlyPlayedGameIds = ['game-snake'],
  onNavigate,
  onSearchEngineChange,
  onOpenSecurityInfo,
  onToggleFavoriteGame,
}) => {
  const [activeHubView, setActiveHubView] = useState<'arcade' | 'navigator'>('arcade');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('All');
  const [gameSearch, setGameSearch] = useState('');
  const [webQuery, setWebQuery] = useState('');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [selectedGameForModal, setSelectedGameForModal] = useState<Game | null>(null);

  const featuredGames = BUILT_IN_GAMES;
  const currentFeatured = featuredGames[featuredIndex % featuredGames.length];

  const handleGameClick = (game: Game) => {
    if (game.isBuiltIn || game.embedSupported) {
      onNavigate(game.url);
    } else {
      setSelectedGameForModal(game);
    }
  };

  const handleWebSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (webQuery.trim()) {
      onNavigate(webQuery.trim());
    }
  };

  const categories: GameCategory[] = [
    'All',
    'Featured',
    'Touch-Friendly',
    'Built-in',
    'Arcade',
    'Puzzle',
    'Action',
    'Strategy',
    'Racing',
    'Sports',
    'Multiplayer',
    'Platformers',
    'Casual',
    'Brain Training',
    'Two-Player',
    'Favorites',
    'Recent',
  ];

  const filteredGames = useMemo(() => {
    return ALL_GAMES.filter((game) => {
      // Category filter
      if (selectedCategory === 'Featured') {
        const isFeatured = game.subCategories?.includes('Featured') || game.rating >= 4.85;
        if (!isFeatured) return false;
      } else if (selectedCategory === 'Touch-Friendly') {
        if (!game.isTouchFriendly) return false;
      } else if (selectedCategory === 'Built-in') {
        if (!game.isBuiltIn) return false;
      } else if (selectedCategory === 'Favorites') {
        if (!favoriteGameIds.includes(game.id)) return false;
      } else if (selectedCategory === 'Recent') {
        if (!recentlyPlayedGameIds.includes(game.id)) return false;
      } else if (selectedCategory === 'Two-Player') {
        const isTwoPlayer =
          game.subCategories?.includes('Two-Player') ||
          game.players?.includes('2') ||
          game.players?.toLowerCase().includes('multi');
        if (!isTwoPlayer) return false;
      } else if (selectedCategory !== 'All') {
        const matchMain = game.category === selectedCategory;
        const matchSub = game.subCategories?.some(
          (sub) => sub.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (!matchMain && !matchSub) return false;
      }

      // Text search
      if (gameSearch.trim()) {
        const query = gameSearch.toLowerCase();
        return (
          game.title.toLowerCase().includes(query) ||
          game.description.toLowerCase().includes(query) ||
          game.category.toLowerCase().includes(query) ||
          game.subCategories?.some((s) => s.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [selectedCategory, gameSearch, favoriteGameIds, recentlyPlayedGameIds]);

  const getGameIcon = (iconName: string) => {
    switch (iconName) {
      case 'snake':
        return <Zap className="w-5 h-5 text-sky-400" />;
      case 'breakout':
        return <Layers className="w-5 h-5 text-cyan-400" />;
      case 'grid':
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
      case 'rocket':
        return <Rocket className="w-5 h-5 text-amber-400" />;
      case 'matrix':
        return <Brain className="w-5 h-5 text-teal-400" />;
      case 'flag':
        return <Flag className="w-5 h-5 text-blue-400" />;
      case 'sliders':
        return <Sliders className="w-5 h-5 text-sky-400" />;
      case 'disc':
        return <Disc className="w-5 h-5 text-cyan-400" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-sky-400" />;
      case 'trophy':
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'brain':
        return <Brain className="w-5 h-5 text-blue-400" />;
      case 'atom':
        return <Atom className="w-5 h-5 text-sky-400" />;
      case 'map':
        return <MapPin className="w-5 h-5 text-teal-400" />;
      case 'code':
        return <Code className="w-5 h-5 text-indigo-400" />;
      default:
        return <Gamepad2 className="w-5 h-5 text-sky-400" />;
    }
  };

  const getSiteIcon = (iconName: string) => {
    switch (iconName) {
      case 'map':
        return <MapPin className="w-4 h-4 text-sky-400" />;
      case 'atom':
        return <Atom className="w-4 h-4 text-sky-400" />;
      case 'code':
        return <Code className="w-4 h-4 text-sky-400" />;
      case 'book':
      case 'book-open':
        return <BookOpen className="w-4 h-4 text-sky-400" />;
      default:
        return <Globe className="w-4 h-4 text-sky-400" />;
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
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:py-10 bg-[var(--bg-main)] text-[var(--text-primary)] relative">
      {/* Liquid Glass Ambient Blue Refraction Glows */}
      <div className="absolute top-10 left-1/3 w-[32rem] h-[32rem] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2" />
      <div className="absolute top-80 right-1/4 w-[28rem] h-[28rem] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        {/* Top Liquid Glass View Selector Capsule */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[var(--border-glass)] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  Portal Discovery
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  Liquid Glass 2.0
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Apple-inspired browser environment & high-performance game center
              </p>
            </div>
          </div>

          {/* Liquid Glass Segmented Pill Switcher */}
          <div className="flex items-center p-1 rounded-2xl glass-panel shadow-md">
            <button
              type="button"
              onClick={() => setActiveHubView('arcade')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeHubView === 'arcade'
                  ? 'bg-sky-500 text-slate-950 shadow-[0_0_16px_rgba(56,189,248,0.4)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.06]'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Portal Arcade</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/20 text-current font-bold">
                {ALL_GAMES.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveHubView('navigator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeHubView === 'navigator'
                  ? 'bg-sky-500 text-slate-950 shadow-[0_0_16px_rgba(56,189,248,0.4)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.06]'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Web Navigator</span>
            </button>
          </div>
        </div>

        {/* ----------------- VIEW 1: PORTAL ARCADE (GAMING DISCOVERY) ----------------- */}
        {activeHubView === 'arcade' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Liquid Glass Hero Featured Game Showcase */}
            <div className="relative rounded-3xl overflow-hidden glass-panel p-6 sm:p-8 border border-[var(--border-glass)] shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
              {/* Internal ambient color bloom */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${currentFeatured.gradient} opacity-35 blur-2xl pointer-events-none`}
              />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      <Flame className="w-3.5 h-3.5" /> Featured Spotlight
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white/[0.08] text-[var(--text-secondary)] border border-[var(--border-glass)]">
                      {currentFeatured.badge}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">
                    {currentFeatured.title}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {currentFeatured.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] pt-1">
                    <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-current" /> {currentFeatured.rating}
                    </span>
                    <span>•</span>
                    <span>{currentFeatured.category}</span>
                    <span>•</span>
                    <span>{currentFeatured.controls}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate(currentFeatured.url)}
                    className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-[0_0_24px_rgba(56,189,248,0.45)] transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play Now</span>
                  </button>

                  {/* Carousel navigation pills */}
                  <div className="flex items-center justify-center gap-1.5 pt-1">
                    {featuredGames.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFeaturedIndex(idx)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          idx === featuredIndex % featuredGames.length
                            ? 'w-6 bg-sky-400'
                            : 'w-2 bg-white/20 hover:bg-white/40'
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar & Category Pills */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search in games */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={gameSearch}
                    onChange={(e) => setGameSearch(e.target.value)}
                    placeholder="Search games, genres, or keywords..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-panel text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 transition-all"
                  />
                  {gameSearch && (
                    <button
                      type="button"
                      onClick={() => setGameSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 self-end sm:self-center">
                  <span>Showing</span>
                  <span className="font-bold text-[var(--text-primary)]">{filteredGames.length}</span>
                  <span>games</span>
                </div>
              </div>

              {/* Category Filter Pills (17 Categories) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500/20 text-sky-400 border-sky-500/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] text-[var(--text-secondary)] border-[var(--border-glass)]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredGames.map((game) => {
                const isFavorite = favoriteGameIds.includes(game.id);

                return (
                  <div
                    key={game.id}
                    className="group relative rounded-2xl glass-card p-5 flex flex-col justify-between overflow-hidden cursor-pointer"
                    onClick={() => handleGameClick(game)}
                  >
                    {/* Top ambient color reflection */}
                    <div
                      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${game.gradient} rounded-full blur-2xl opacity-35 group-hover:opacity-65 transition-opacity pointer-events-none`}
                    />

                    <div className="space-y-3 relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-white/[0.08] border border-[var(--border-glass)] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                          {getGameIcon(game.iconName)}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {game.isTouchFriendly && (
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/25 flex items-center gap-1"
                              title="Verified touch-friendly controls for iPad"
                            >
                              <Smartphone className="w-3 h-3" /> iPad
                            </span>
                          )}

                          {game.badge && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                              {game.badge}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGameForModal(game);
                            }}
                            className="p-1.5 rounded-lg border bg-white/[0.04] text-[var(--text-muted)] hover:text-sky-400 border-[var(--border-glass)] transition-all cursor-pointer"
                            title="Game details & launch options"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavoriteGame?.(game.id);
                            }}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isFavorite
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                : 'bg-white/[0.04] text-[var(--text-muted)] hover:text-[var(--text-primary)] border-[var(--border-glass)]'
                            }`}
                            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-sky-400 transition-colors">
                          {game.title}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                          {game.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-[var(--border-glass)] flex items-center justify-between text-xs relative z-10">
                      <div className="flex items-center gap-3 text-[var(--text-muted)] text-[11px]">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="w-3 h-3 fill-current" /> {game.rating}
                        </span>
                        <span>•</span>
                        <span>{game.category}</span>
                      </div>

                      <span className="text-[11px] font-semibold text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        {game.isBuiltIn ? 'Play Instant' : game.embedSupported ? 'Play In-Frame' : 'External Play ↗'}
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Verified Gaming Platforms & Web Portals */}
            <div className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-sky-400" />
                    Major Browser Gaming Platforms
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Curated hubs hosting thousands of HTML5, WebGL, and indie web games
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {GAME_PLATFORMS.map((platform) => (
                  <div
                    key={platform.id}
                    onClick={() => {
                      window.open(platform.url, '_blank', 'noopener,noreferrer');
                    }}
                    className="p-4 rounded-2xl glass-card border border-[var(--border-glass)] hover:border-sky-400/40 cursor-pointer space-y-2 group transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[var(--text-primary)] group-hover:text-sky-400 transition-colors">
                          {platform.name}
                        </span>
                        {platform.badge && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/25">
                            {platform.badge}
                          </span>
                        )}
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-sky-400 transition-colors" />
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                      {platform.description}
                    </p>

                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
                      {platform.categories.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-white/[0.05] text-[var(--text-muted)]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- VIEW 2: WEB NAVIGATOR (TRADITIONAL BROWSER HOME) ----------------- */}
        {activeHubView === 'navigator' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Search Bar Capsule */}
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-[var(--border-glass)] space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                  Explore the Web
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Instant search powered by {searchEngineLabels[defaultSearchEngine]}
                </p>
              </div>

              <form onSubmit={handleWebSearchSubmit} className="relative flex items-center">
                <Search className="w-5 h-5 text-[var(--text-muted)] absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={webQuery}
                  onChange={(e) => setWebQuery(e.target.value)}
                  placeholder="Enter web address or search query..."
                  className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-glass)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Quick Search Engine Selector */}
              <div className="flex items-center gap-2 pt-1 text-xs text-[var(--text-secondary)] overflow-x-auto no-scrollbar">
                <span className="text-[11px] shrink-0">Search with:</span>
                {(['duckduckgo', 'google', 'bing', 'ecosia', 'startpage'] as SearchEngine[]).map(
                  (eng) => (
                    <button
                      key={eng}
                      type="button"
                      onClick={() => onSearchEngineChange(eng)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        defaultSearchEngine === eng
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                          : 'bg-white/[0.04] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-transparent'
                      }`}
                    >
                      {searchEngineLabels[eng]}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Curated Verified Sites */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                Curated Web Destinations
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {CURATED_SITES.map((site) => (
                  <div
                    key={site.url}
                    onClick={() => onNavigate(site.url)}
                    className="p-4 rounded-2xl glass-card border border-[var(--border-glass)] hover:border-sky-400/40 cursor-pointer space-y-2 group transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-[var(--border-glass)] flex items-center justify-center">
                        {getSiteIcon(site.icon)}
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-sky-400 transition-colors" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="font-bold text-xs text-[var(--text-primary)] group-hover:text-sky-400 transition-colors">
                        {site.title}
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">
                        {site.description}
                      </p>
                    </div>

                    <div className="text-[10px] text-sky-400 font-medium pt-1">
                      {site.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bookmarks Quick Bar */}
            {bookmarks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  Saved Bookmarks
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {bookmarks.slice(0, 8).map((bm) => (
                    <button
                      key={bm.id}
                      type="button"
                      onClick={() => onNavigate(bm.url)}
                      className="flex items-center gap-2 p-3 rounded-xl glass-card text-left transition-all border border-[var(--border-glass)] hover:border-sky-400/30 cursor-pointer"
                    >
                      <img
                        src={bm.favicon || getFaviconUrl(bm.url)}
                        alt=""
                        className="w-4 h-4 rounded-sm object-contain shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                        {bm.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent History Quick Bar */}
            {recentHistory.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  Recent History
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recentHistory.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.url)}
                      className="flex items-center justify-between p-2.5 rounded-xl glass-panel text-left transition-all border border-[var(--border-glass)] hover:border-sky-400/30 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <Globe className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                        <span className="text-xs text-[var(--text-primary)] truncate font-medium">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] shrink-0 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Game Launch & Details Liquid Glass Modal */}
      {selectedGameForModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="game-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xl animate-in fade-in"
        >
          <div className="w-full max-w-lg glass-panel rounded-3xl flex flex-col text-[var(--text-primary)] shadow-2xl border border-[var(--border-glass)] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-glass)] bg-white/[0.04]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  {getGameIcon(selectedGameForModal.iconName)}
                </div>
                <div className="min-w-0">
                  <h3 id="game-modal-title" className="text-base font-bold text-[var(--text-primary)] truncate">
                    {selectedGameForModal.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Star className="w-3 h-3 fill-current" /> {selectedGameForModal.rating}
                    </span>
                    <span>•</span>
                    <span>{selectedGameForModal.category}</span>
                    <span>•</span>
                    <span>{selectedGameForModal.players}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGameForModal(null)}
                aria-label="Close game details modal"
                className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-[var(--text-secondary)]">
              <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                {selectedGameForModal.description}
              </p>

              {/* Controls & Specs Pill Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-glass)] space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">
                    Controls
                  </span>
                  <div className="font-medium text-[var(--text-primary)]">
                    {selectedGameForModal.controls}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-glass)] space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">
                    Compatibility
                  </span>
                  <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                    {selectedGameForModal.isTouchFriendly ? (
                      <span className="text-sky-400 flex items-center gap-1 font-semibold">
                        <Smartphone className="w-3.5 h-3.5" /> iPad & Touch Optimized
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">Desktop Pointer / Keyboard</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mode Explanatory Notice */}
              <div
                className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                  selectedGameForModal.embedSupported
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-200'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                  {selectedGameForModal.embedSupported ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-sky-300">In-Frame Sandboxed Play Supported</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-300">External Mode Recommended</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {selectedGameForModal.embedNotice ||
                    (selectedGameForModal.embedSupported
                      ? 'This game is confirmed embed-safe and plays directly within your sandboxed Portal tab.'
                      : 'The game server enforces HTTP security headers (X-Frame-Options/CSP). Launching on its official web page provides full security, audio, and GPU acceleration.')}
                </p>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 border-t border-[var(--border-glass)] bg-white/[0.03] flex flex-col sm:flex-row items-center justify-end gap-2.5">
              {selectedGameForModal.embedSupported ? (
                <>
                  {selectedGameForModal.originalUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        window.open(selectedGameForModal.originalUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-[var(--text-primary)] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Original Website</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(selectedGameForModal.url);
                      setSelectedGameForModal(null);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play in Portal</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(selectedGameForModal.url);
                      setSelectedGameForModal(null);
                    }}
                    className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[var(--text-secondary)] text-xs font-semibold transition-all cursor-pointer"
                  >
                    Try Embedded Frame
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.open(
                        selectedGameForModal.originalUrl || selectedGameForModal.url,
                        '_blank',
                        'noopener,noreferrer'
                      );
                      setSelectedGameForModal(null);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Launch on Official Website</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
