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

  const startEdit = (bm: Bookmark) => {
    setEditingId(bm.id);
    setEditTitle(bm.title);
    setEditUrl(bm.url);
  };

  const handleEditSave = (id: string) => {
    if (!editUrl.trim()) return;
    let finalUrl = editUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    onUpdateBookmark(id, {
      title: editTitle.trim() || extractDomain(finalUrl),
      url: finalUrl,
      favicon: getFaviconUrl(finalUrl),
    });
    setEditingId(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bookmarks-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-2xl bg-[#13161c] border border-white/[0.1] rounded-2xl flex flex-col text-slate-100 shadow-2xl overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-[#171a21]">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-emerald-400 fill-emerald-400" />
            <h2 id="bookmarks-modal-title" className="text-base font-bold text-white">
              Bookmarks Manager
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bookmark</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close bookmarks modal"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Bookmark Accordion */}
        {isAdding && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-4 bg-[#1a1e27] border-b border-white/[0.08] space-y-3"
          >
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Add New Bookmark
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. OpenStreetMap Explorer"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0e1014] border border-white/[0.1] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Web Address (URL) *</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.org"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0e1014] border border-white/[0.1] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Search */}
        <div className="p-3 border-b border-white/[0.06] bg-[#171a21]/50">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved bookmarks..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0e1014] border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredBookmarks.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-2">
              <Star className="w-6 h-6 mx-auto opacity-30 text-slate-400" />
              <p>No bookmarks found.</p>
            </div>
          ) : (
            filteredBookmarks.map((bm) => {
              const isEditing = editingId === bm.id;
              const favicon = bm.favicon || getFaviconUrl(bm.url);

              if (isEditing) {
                return (
                  <div
                    key={bm.id}
                    className="p-3 rounded-xl bg-[#1b1f28] border border-emerald-500/40 space-y-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="px-2 py-1 rounded bg-[#0e1014] border border-white/[0.1] text-xs text-white"
                        placeholder="Title"
                      />
                      <input
                        type="text"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="px-2 py-1 rounded bg-[#0e1014] border border-white/[0.1] text-xs text-white font-mono"
                        placeholder="URL"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-0.5 rounded text-xs bg-white/[0.06] text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditSave(bm.id)}
                        className="px-2.5 py-0.5 rounded text-xs bg-emerald-500 text-slate-950 font-semibold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={bm.id}
                  className="group flex items-center justify-between p-3 rounded-xl bg-[#171a21] hover:bg-[#1b1f28] border border-white/[0.05] hover:border-emerald-500/30 transition-all text-left"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      onNavigate(bm.url);
                      onClose();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onNavigate(bm.url);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-3"
                  >
                    <div className="w-5 h-5 shrink-0 flex items-center justify-center">
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
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 truncate">
                        {bm.title || extractDomain(bm.url)}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate font-mono">
                        {bm.url}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(bm)}
                      aria-label="Edit bookmark"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] transition-colors"
                      title="Edit Bookmark"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteBookmark(bm.id)}
                      aria-label="Delete bookmark"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Bookmark"
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
        <div className="p-3 border-t border-white/[0.08] bg-[#171a21] text-xs text-slate-500 flex items-center justify-between">
          <span>{bookmarks.length} saved bookmarks</span>
          <span>Click any item to navigate</span>
        </div>
      </div>
    </div>
  );
};
