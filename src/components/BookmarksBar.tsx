import React from 'react';
import { Globe, Plus, Trash2, ExternalLink } from 'lucide-react';
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
      className="flex items-center gap-1 px-3 py-1 bg-[#13161c] border-b border-white/[0.05] overflow-x-auto no-scrollbar text-xs select-none"
    >
      <div className="flex items-center gap-1 flex-1 min-w-0">
        {bookmarks.length === 0 ? (
          <span className="text-slate-500 italic text-[11px] px-2 py-0.5">
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
                className="group relative flex items-center gap-1.5 h-6 px-2 rounded hover:bg-white/[0.06] text-slate-300 hover:text-slate-100 cursor-pointer transition-colors shrink-0 max-w-[180px] focus-visible:ring-1 focus-visible:ring-emerald-500 outline-none"
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
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
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
          className="flex items-center gap-1 h-6 px-2 rounded hover:bg-white/[0.06] text-slate-400 hover:text-emerald-400 transition-colors text-[11px]"
          title="Add current page to bookmarks"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden md:inline">Add Bookmark</span>
        </button>

        <button
          type="button"
          onClick={onManageBookmarks}
          aria-label="Manage all bookmarks"
          className="h-6 px-1.5 rounded hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors text-[11px]"
          title="All Bookmarks Manager"
        >
          Manage
        </button>
      </div>
    </div>
  );
};
