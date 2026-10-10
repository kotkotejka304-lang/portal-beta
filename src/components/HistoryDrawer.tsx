import React, { useState, useMemo } from 'react';
import {
  X,
  Trash2,
  Search,
  ExternalLink,
  Clock,
  Calendar,
  AlertCircle,
  Globe,
} from 'lucide-react';
import { HistoryItem } from '../types/browser';
import { extractDomain, getFaviconUrl } from '../utils/url';

interface HistoryDrawerProps {
  isOpen: boolean;
  history: HistoryItem[];
  onClose: () => void;
  onNavigate: (url: string) => void;
  onOpenInNewTab: (url: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  history,
  onClose,
  onNavigate,
  onOpenInNewTab,
  onDeleteItem,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Group and filter history
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  const groupedHistory = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: {
      today: HistoryItem[];
      yesterday: HistoryItem[];
      earlier: HistoryItem[];
    } = {
      today: [],
      yesterday: [],
      earlier: [],
    };

    for (const item of filteredHistory) {
      const date = new Date(item.timestamp);
      if (date >= today) {
        groups.today.push(item);
      } else if (date >= yesterday) {
        groups.yesterday.push(item);
      } else {
        groups.earlier.push(item);
      }
    }

    return groups;
  }, [filteredHistory]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-heading"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-md h-full bg-[#13161c] border-l border-white/[0.08] flex flex-col text-slate-100 shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-[#171a21]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h2 id="history-heading" className="text-base font-bold text-white">
              Browsing History
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close history drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-white/[0.06] bg-[#171a21]/50">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0e1014] border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-0.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* History List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {history.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Clock className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
              <p className="text-sm">No browsing history yet.</p>
              <p className="text-xs">Web pages you visit will be logged here.</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching pages found for &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            <>
              {/* Today Group */}
              {groupedHistory.today.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Today
                  </h3>
                  <div className="space-y-1">
                    {groupedHistory.today.map((item) => (
                      <HistoryItemRow
                        key={item.id}
                        item={item}
                        onNavigate={onNavigate}
                        onOpenInNewTab={onOpenInNewTab}
                        onDeleteItem={onDeleteItem}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Yesterday Group */}
              {groupedHistory.yesterday.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Yesterday
                  </h3>
                  <div className="space-y-1">
                    {groupedHistory.yesterday.map((item) => (
                      <HistoryItemRow
                        key={item.id}
                        item={item}
                        onNavigate={onNavigate}
                        onOpenInNewTab={onOpenInNewTab}
                        onDeleteItem={onDeleteItem}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Earlier Group */}
              {groupedHistory.earlier.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Earlier
                  </h3>
                  <div className="space-y-1">
                    {groupedHistory.earlier.map((item) => (
                      <HistoryItemRow
                        key={item.id}
                        item={item}
                        onNavigate={onNavigate}
                        onOpenInNewTab={onOpenInNewTab}
                        onDeleteItem={onDeleteItem}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with Clear All */}
        {history.length > 0 && (
          <div className="p-3 border-t border-white/[0.08] bg-[#171a21] flex items-center justify-between">
            {showConfirmClear ? (
              <div className="flex items-center justify-between w-full gap-2">
                <span className="text-xs text-rose-300 font-medium">Clear all records?</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setShowConfirmClear(false);
                    }}
                    className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmClear(false)}
                    className="px-2.5 py-1 rounded bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-xs text-slate-500">
                  {history.length} {history.length === 1 ? 'item' : 'items'} stored locally
                </span>
                <button
                  type="button"
                  onClick={() => setShowConfirmClear(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All History
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const HistoryItemRow: React.FC<{
  item: HistoryItem;
  onNavigate: (url: string) => void;
  onOpenInNewTab: (url: string) => void;
  onDeleteItem: (id: string) => void;
}> = ({ item, onNavigate, onOpenInNewTab, onDeleteItem }) => {
  const favicon = item.favicon || getFaviconUrl(item.url);
  const timeString = new Date(item.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="group flex items-center justify-between p-2 rounded-lg bg-[#171a21] hover:bg-[#1f232c] border border-white/[0.04] transition-colors text-left">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onNavigate(item.url)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onNavigate(item.url);
        }}
        className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer pr-2"
      >
        <div className="w-4 h-4 shrink-0 flex items-center justify-center">
          {favicon ? (
            <img
              src={favicon}
              alt=""
              className="w-4 h-4 rounded-sm object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Globe className="w-4 h-4 text-slate-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-slate-200 group-hover:text-emerald-300 truncate">
            {item.title || extractDomain(item.url)}
          </div>
          <div className="text-[11px] text-slate-500 truncate font-mono">
            {item.url}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[10px] text-slate-500 tabular-nums mr-1">
          {timeString}
        </span>
        <button
          type="button"
          onClick={() => onOpenInNewTab(item.url)}
          aria-label="Open in new tab"
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-emerald-400 transition-opacity"
          title="Open in new tab"
        >
          <ExternalLink className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => onDeleteItem(item.id)}
          aria-label="Delete entry"
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-400 transition-opacity"
          title="Delete from history"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
