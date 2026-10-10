import React from 'react';
import { Globe, Plus, Trash2 } from 'lucide-react';
import { Bookmark } from '../types/browser';
import { extractDomain, getFaviconUrl } from '../utils/url';

interface BookmarksBarProps {
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onRemoveBookmark: (id: string, e: React.MouseEvent) => void;
  onAddCurrentPage: () => void;
  onManageBookmarks: () => void;
}

export const BookmarksBar: React.FC<BookmarksBarProps> = ({
  bookmarks,
  onNavigate,
  onRemoveBookmark,
  onAddCurrentPage,
  onManageBookmarks,
}) => {
  return (
    <div
      aria-label="Bookmarks bar"
      className="flex items-center gap-1.5 px-3 py-1 glass-toolbar border-b border-[var(--border-glass)] overflow-x-auto no-scrollbar text-xs select-none relative z-10"
    >
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {bookmarks.length === 0 ? (
          <span className="text-[var(--text-muted)] italic text-[11px] px-2 py-0.5">
            No bookmarks saved yet. Star a page or click &ldquo;+&rdquo; to add.
          </span>
        ) : (
          bookmarks.map((bm) => {
            const domain = extractDomain(bm.url);
            const favicon = bm.favicon || getFaviconUrl(bm.url);

            return (
              <div
                key={bm.id}
                role="button"
                tabIndex={0}
                onClick={() => onNavigate(bm.url)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onNavigate(bm.url);
                }}
                title={`${bm.title}\n${bm.url}`}
                className="group relative flex items-center gap-1.5 h-6 px-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-[var(--border-glass)] hover:border-sky-400/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-all shrink-0 max-w-[190px] outline-none shadow-xs"
              >
                {/* Favicon */}
                <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                  {favicon ? (
                    <img
                      src={favicon}
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
                <span className="truncate text-[11px] font-medium">{bm.title || domain}</span>

                {/* Quick Delete on hover */}
                <button
                  type="button"
                  aria-label={`Remove bookmark ${bm.title}`}
                  onClick={(e) => onRemoveBookmark(bm.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 rounded transition-opacity"
                  title="Remove bookmark"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Add and Manage */}
      <div className="flex items-center gap-1 shrink-0 ml-1">
        <button
          type="button"
          onClick={onAddCurrentPage}
          aria-label="Add current page to bookmarks"
          className="flex items-center gap-1 h-6 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-[var(--text-secondary)] hover:text-sky-400 border border-[var(--border-glass)] transition-colors text-[11px] cursor-pointer"
          title="Add current page to bookmarks"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden md:inline">Add Bookmark</span>
        </button>

        <button
          type="button"
          onClick={onManageBookmarks}
          aria-label="Manage all bookmarks"
          className="h-6 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-glass)] transition-colors text-[11px] cursor-pointer"
          title="Manage Bookmarks"
        >
          Manage
        </button>
      </div>
    </div>
  );
};
