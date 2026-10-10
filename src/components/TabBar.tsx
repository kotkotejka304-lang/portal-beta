import React from 'react';
import { Plus, X, Globe, Compass, Loader2, Gamepad2 } from 'lucide-react';
import { Tab } from '../types/browser';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}) => {
  return (
    <div
      role="tablist"
      aria-label="Browser Tabs"
      className="flex items-center gap-1.5 px-3 pt-2.5 pb-1.5 glass-toolbar border-b border-[var(--border-glass)] select-none overflow-x-auto no-scrollbar relative z-20"
    >
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isInternal = tab.url.startsWith('portal://');
          const isGame = tab.url.includes('portal://game') || tab.url === 'portal://games';

          return (
            <div
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onClick={() => onSelectTab(tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTab(tab.id);
                }
              }}
              className={`group relative flex items-center min-w-[130px] max-w-[230px] flex-1 h-9 px-3 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 outline-none ${
                isActive
                  ? 'bg-white/[0.12] dark:bg-white/[0.1] text-[var(--text-primary)] shadow-[0_4px_16px_rgba(0,0,0,0.15),inset_0_1px_0_var(--specular-line)] border border-[var(--border-glass-shine)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              {/* Active Tab Blue Glow Edge */}
              {isActive && (
                <div className="absolute -bottom-1.5 left-3 right-3 h-[2px] bg-sky-400 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
              )}

              {/* Favicon or Icon */}
              <div className="mr-2 shrink-0 flex items-center justify-center w-4 h-4 text-[var(--text-muted)]">
                {tab.isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                ) : isGame ? (
                  <Gamepad2 className="w-3.5 h-3.5 text-sky-400" />
                ) : isInternal ? (
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                ) : tab.favicon ? (
                  <img
                    src={tab.favicon}
                    alt=""
                    className="w-3.5 h-3.5 rounded-sm object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                )}
              </div>

              {/* Title */}
              <span className="truncate flex-1 text-left select-none pr-1">
                {tab.title || (tab.url.startsWith('portal://') ? 'Portal Home' : 'Untitled')}
              </span>

              {/* Close Button */}
              <button
                type="button"
                aria-label={`Close tab ${tab.title}`}
                onClick={(e) => onCloseTab(tab.id, e)}
                className={`p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-colors shrink-0 ${
                  isActive ? 'opacity-90' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* New Tab Button */}
      <button
        type="button"
        aria-label="Open New Tab (Cmd+T / Ctrl+T)"
        onClick={onNewTab}
        className="flex items-center justify-center w-8 h-8 rounded-xl text-[var(--text-secondary)] hover:text-sky-400 hover:bg-white/[0.08] active:scale-95 transition-all shrink-0 ml-1 border border-[var(--border-glass)] shadow-sm cursor-pointer"
        title="New Tab (Ctrl+T / Cmd+T)"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
