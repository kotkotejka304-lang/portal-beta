import React, { useState, useMemo } from 'react';
import {
  X,
  Star,
  Plus,
  Trash2,
  Search,
  ExternalLink,
  Edit2,
  Globe,
  Check,
} from 'lucide-react';
import { Bookmark } from '../types/browser';
import { extractDomain, getFaviconUrl } from '../utils/url';

interface BookmarksModalProps {
  isOpen: boolean;
  bookmarks: Bookmark[];
  onClose: () => void;
  onNavigate: (url: string) => void;
  onAddBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  onUpdateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  onDeleteBookmark: (id: string) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  bookmarks,
  onClose,
  onNavigate,
  onAddBookmark,
  onUpdateBookmark,
  onDeleteBookmark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks;
    const q = searchQuery.toLowerCase();
    return bookmarks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q) ||
        (b.category && b.category.toLowerCase().includes(q))
    );
  }, [bookmarks, searchQuery]);

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    let finalUrl = newUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    onAddBookmark({
      title: newTitle.trim() || extractDomain(finalUrl),
      url: finalUrl,
      category: newCategory.trim() || 'General',
      favicon: getFaviconUrl(finalUrl),
    });

    setNewTitle('');
    setNewUrl('');
    setIsAdding(false);
  };

  const handleStartEdit = (b: Bookmark) => {
    setEditingId(b.id);
    setEditTitle(b.title);
    setEditUrl(b.url);
  };

  const handleSaveEdit = (id: string) => {
    if (!editUrl.trim()) return;
    onUpdateBookmark(id, {
      title: editTitle.trim(),
      url: editUrl.trim(),
      favicon: getFaviconUrl(editUrl.trim()),
    });
    setEditingId(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bookmarks-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl animate-in fade-in"
    >
      <div className="w-full max-w-xl glass-panel rounded-3xl flex flex-col text-[var(--text-primary)] shadow-2xl overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4.5 border-b border-[var(--border-glass)] bg-white/[0.04]">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            <h2 id="bookmarks-dialog-title" className="text-base font-bold text-[var(--text-primary)]">
              Bookmarks Library
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bookmarks library"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar (Search & Add) */}
        <div className="p-3.5 border-b border-[var(--border-glass)] flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved bookmarks..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-glass)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500/70 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 text-xs font-semibold transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bookmark</span>
          </button>
        </div>

        {/* Add Bookmark Drawer form */}
        {isAdding && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-4 bg-[var(--bg-input)] border-b border-[var(--border-glass)] space-y-3 animate-in fade-in"
          >
            <div className="text-xs font-bold text-[var(--text-primary)]">Add New Bookmark</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Title (optional)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] border border-[var(--border-glass)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500"
              />
              <input
                type="text"
                placeholder="https://example.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                required
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] border border-[var(--border-glass)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredBookmarks.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-[var(--text-muted)] space-y-2">
              <Star className="w-8 h-8 opacity-40 text-amber-400" />
              <p className="text-xs">No bookmarks found</p>
            </div>
          ) : (
            filteredBookmarks.map((bm) => {
              const favicon = bm.favicon || getFaviconUrl(bm.url);
              const domain = extractDomain(bm.url);
              const isEditing = editingId === bm.id;

              if (isEditing) {
                return (
                  <div
                    key={bm.id}
                    className="p-3 rounded-2xl bg-[var(--bg-input)] border border-sky-500/40 space-y-2"
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded-lg bg-white/[0.06] border border-[var(--border-glass)] text-[var(--text-primary)] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded-lg bg-white/[0.06] border border-[var(--border-glass)] text-[var(--text-primary)] focus:outline-none font-mono"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-2 py-0.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(bm.id)}
                        className="px-3 py-0.5 text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={bm.id}
                  className="group flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/[0.06] border border-transparent hover:border-[var(--border-glass)] transition-colors"
                >
                  <div
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-2"
                    onClick={() => {
                      onNavigate(bm.url);
                      onClose();
                    }}
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
                        {bm.title || domain}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] truncate font-mono">
                        {bm.url}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(bm)}
                      className="p-1 text-[var(--text-muted)] hover:text-sky-400 rounded cursor-pointer"
                      title="Edit bookmark"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.open(bm.url, '_blank', 'noopener,noreferrer');
                      }}
                      className="p-1 text-[var(--text-muted)] hover:text-sky-400 rounded cursor-pointer"
                      title="Open in new native tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteBookmark(bm.id)}
                      className="p-1 text-[var(--text-muted)] hover:text-rose-400 rounded cursor-pointer"
                      title="Delete bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border-glass)] bg-white/[0.04] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
