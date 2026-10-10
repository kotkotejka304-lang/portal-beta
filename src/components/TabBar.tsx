import React from 'react';
import { Plus, X, Globe, Compass, Loader2 } from 'lucide-react';
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
      className="flex items-center gap-1 px-2 pt-2 bg-[#0d0f13] border-b border-white/[0.06] select-none overflow-x-auto no-scrollbar"
    >
      <div className="flex items-center gap-1 flex-1 min-w-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isInternal = tab.url.startsWith('portal://');

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
              className={`group relative flex items-center min-w-[120px] max-w-[220px] flex-1 h-9 px-3 rounded-t-lg text-xs font-medium cursor-pointer transition-all duration-150 outline-none ${
                isActive
                  ? 'bg-[#171a21] text-slate-100 shadow-[0_-2px_10px_rgba(0,0,0,0.25)] border-t border-x border-white/[0.08]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              {/* Tab active accent indicator */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500 rounded-t" />
              )}

              {/* Favicon or Icon */}
              <div className="mr-2 shrink-0 flex items-center justify-center w-4 h-4 text-slate-400">
                {tab.isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                ) : isInternal ? (
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
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
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>

              {/* Title */}
              <span className="truncate flex-1 text-left select-none pr-1">
                {tab.title || (tab.url.startsWith('portal://') ? 'Portal Home' : 'Untitled')}
              </span>

              {/* Close Button (iPad & Touch friendly >= 24px inner target) */}
              <button
                type="button"
                aria-label={`Close tab ${tab.title}`}
                onClick={(e) => onCloseTab(tab.id, e)}
                className={`p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors shrink-0 ${
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
        className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/[0.05] active:scale-95 transition-all shrink-0 ml-1 mb-1 focus-visible:ring-1 focus-visible:ring-emerald-500"
        title="New Tab (Ctrl+T / Cmd+T)"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
