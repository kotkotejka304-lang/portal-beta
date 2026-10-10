import React, { useState, useMemo } from 'react';
import {
  X,
  Trash2,
  Search,
  ExternalLink,
  Clock,
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
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xl animate-in fade-in"
    >
      <div className="w-full max-w-md h-full glass-panel border-l border-[var(--border-glass)] flex flex-col text-[var(--text-primary)] shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-glass)] bg-white/[0.04]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-400" />
            <h2 id="history-heading" className="text-base font-bold text-[var(--text-primary)]">
              Browsing History
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close history drawer"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-3 border-b border-[var(--border-glass)]">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-glass)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500/70 transition-colors"
            />
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {filteredHistory.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-[var(--text-muted)] space-y-2">
              <Clock className="w-8 h-8 opacity-40 text-sky-400" />
              <p className="text-xs">No browsing history found</p>
            </div>
          ) : (
            <>
              {groupedHistory.today.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Today
                  </h3>
                  <div className="space-y-1">
                    {groupedHistory.today.map((item) => (
                      <HistoryItemRow
                        key={item.id}
                        item={item}
                        onNavigate={onNavigate}
                        onOpenInNewTab={onOpenInNewTab}
                        onDelete={onDeleteItem}
                      />
                    ))}
                  </div>
                </div>
              )}

              {groupedHistory.yesterday.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Yesterday
                  </h3>
                  <div className="space-y-1">
                    {groupedHistory.yesterday.map((item) => (
                      <HistoryItemRow
                        key={item.id}
                        item={item}
                        onNavigate={onNavigate}
                        onOpenInNewTab={onOpenInNewTab}
                        onDelete={onDeleteItem}
                      />
                    ))}
                  </div>
                </div>
              )}

              {groupedHistory.earlier.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Earlier
                  </h3>
                  <div className="space-y-1">
                    {groupedHistory.earlier.map((item) => (
                      <HistoryItemRow
                        key={item.id}
                        item={item}
                        onNavigate={onNavigate}
                        onOpenInNewTab={onOpenInNewTab}
                        onDelete={onDeleteItem}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Clear All Footer */}
        {history.length > 0 && (
          <div className="p-3 border-t border-[var(--border-glass)] bg-white/[0.02]">
            {showConfirmClear ? (
              <div className="flex items-center justify-between text-xs">
                <span className="text-rose-400 font-medium">Clear all history?</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setShowConfirmClear(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmClear(false)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-[var(--text-secondary)] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All History</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface HistoryItemRowProps {
  item: HistoryItem;
  onNavigate: (url: string) => void;
  onOpenInNewTab: (url: string) => void;
  onDelete: (id: string) => void;
}

const HistoryItemRow: React.FC<HistoryItemRowProps> = ({
  item,
  onNavigate,
  onOpenInNewTab,
  onDelete,
}) => {
  const domain = extractDomain(item.url);
  const favicon = item.favicon || getFaviconUrl(item.url);

  return (
    <div className="group flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-[var(--border-glass)] transition-colors">
      <div
        className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer pr-2"
        onClick={() => onNavigate(item.url)}
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
            <Globe className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-[var(--text-primary)] truncate group-hover:text-sky-400 transition-colors">
            {item.title || domain}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] truncate font-mono">
            {domain}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onOpenInNewTab(item.url)}
          className="p-1 text-[var(--text-muted)] hover:text-sky-400 rounded cursor-pointer"
          title="Open in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="p-1 text-[var(--text-muted)] hover:text-rose-400 rounded cursor-pointer"
          title="Delete history entry"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
