import React, { useState } from 'react';
import {
  X,
  Settings,
  Shield,
  Search,
  Bookmark,
  Trash2,
  Check,
  RotateCcw,
  Smartphone,
  Monitor,
  Clock,
} from 'lucide-react';
import { BrowserSettings, SearchEngine } from '../types/browser';

interface SettingsModalProps {
  isOpen: boolean;
  settings: BrowserSettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<BrowserSettings>) => void;
  onResetAllData: () => void;
  isIpadMode: boolean;
  onToggleIpadMode: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
  onResetAllData,
  isIpadMode,
  onToggleIpadMode,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-xl bg-[#13161c] border border-white/[0.1] rounded-2xl flex flex-col text-slate-100 shadow-2xl overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-[#171a21]">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h2 id="settings-dialog-title" className="text-base font-bold text-white">
              Browser Settings & Preferences
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Search Engine Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              Default Omnibox Search Engine
            </label>
            <p className="text-xs text-slate-400">
              When entering plain text or search queries in the address bar, Portal redirects to this provider.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {(
                [
                  { id: 'duckduckgo', name: 'DuckDuckGo (Privacy)' },
                  { id: 'google', name: 'Google' },
                  { id: 'bing', name: 'Bing' },
                  { id: 'ecosia', name: 'Ecosia (Eco)' },
                  { id: 'startpage', name: 'Startpage' },
                ] as const
              ).map((engine) => (
                <button
                  key={engine.id}
                  type="button"
                  onClick={() => onUpdateSettings({ defaultSearchEngine: engine.id })}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                    settings.defaultSearchEngine === engine.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                      : 'bg-[#171a21] border-white/[0.06] text-slate-300 hover:border-white/[0.2]'
                  }`}
                >
                  <span>{engine.name}</span>
                  {settings.defaultSearchEngine === engine.id && (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bookmarks Bar Toggle */}
          <div className="flex items-center justify-between py-3 border-t border-white/[0.06]">
            <div className="space-y-0.5 pr-4">
              <div className="text-xs font-semibold text-slate-200">
                Show Bookmarks Bar
              </div>
              <p className="text-xs text-slate-400">
                Display the quick access bookmarks row directly under the address bar.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.showBookmarksBar}
              onClick={() =>
                onUpdateSettings({ showBookmarksBar: !settings.showBookmarksBar })
              }
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                settings.showBookmarksBar ? 'bg-emerald-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 ${
                  settings.showBookmarksBar ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Auto HTTPS */}
          <div className="flex items-center justify-between py-3 border-t border-white/[0.06]">
            <div className="space-y-0.5 pr-4">
              <div className="text-xs font-semibold text-slate-200">
                Automatic HTTPS Upgrade
              </div>
              <p className="text-xs text-slate-400">
                Automatically prepends <code>https://</code> when typing domain names without a scheme.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.autoHttps}
              onClick={() => onUpdateSettings({ autoHttps: !settings.autoHttps })}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                settings.autoHttps ? 'bg-emerald-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 ${
                  settings.autoHttps ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Loading Timeout Duration */}
          <div className="space-y-2 py-3 border-t border-white/[0.06]">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Frame Connection Timeout Duration
              </div>
              <p className="text-xs text-slate-400">
                How long Portal waits for an embedded site before displaying the connection timeout screen. Adjust higher for slower networks or complex redirects.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                { sec: 8, label: '8 seconds', desc: 'Fast networks' },
                { sec: 12, label: '12 seconds', desc: 'Balanced (Default)' },
                { sec: 18, label: '18 seconds', desc: 'Slow / Mobile' },
                { sec: 25, label: '25 seconds', desc: 'High latency' },
              ].map((opt) => {
                const currentTimeout = settings.loadTimeoutSeconds || 12;
                const isSelected = currentTimeout === opt.sec;
                return (
                  <button
                    key={opt.sec}
                    type="button"
                    onClick={() => onUpdateSettings({ loadTimeoutSeconds: opt.sec })}
                    className={`p-2 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                        : 'bg-[#171a21] border-white/[0.06] text-slate-300 hover:border-white/[0.2]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full font-semibold">
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Device Layout Mode (Desktop vs iPad Safari touch frame) */}
          <div className="flex items-center justify-between py-3 border-t border-white/[0.06]">
            <div className="space-y-0.5 pr-4">
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                {isIpadMode ? <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> : <Monitor className="w-3.5 h-3.5 text-emerald-400" />}
                iPad Touch Shell Emulation
              </div>
              <p className="text-xs text-slate-400">
                Simulates standard 4:3 iPad tablet frame dimensions and larger touch targets for classroom testing.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isIpadMode}
              onClick={onToggleIpadMode}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                isIpadMode ? 'bg-emerald-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 ${
                  isIpadMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sandbox Directives Configuration */}
          <div className="space-y-3 py-3 border-t border-white/[0.06]">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Iframe Security Sandbox Controls
              </div>
              <p className="text-xs text-slate-400">
                Configure browser security sandbox policies applied to embedded web pages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                {
                  key: 'allowScripts',
                  label: 'Allow JavaScript (allow-scripts)',
                  desc: 'Required for interactive applications',
                },
                {
                  key: 'allowSameOrigin',
                  label: 'Allow Origin Access (allow-same-origin)',
                  desc: 'Maintains page origin context',
                },
                {
                  key: 'allowForms',
                  label: 'Allow Form Submission (allow-forms)',
                  desc: 'Enables interactive forms and logins',
                },
                {
                  key: 'allowPopups',
                  label: 'Allow Popups (allow-popups)',
                  desc: 'Permits new tab links within pages',
                },
              ].map((directive) => {
                const currentVal =
                  settings.sandboxPermissions[
                    directive.key as keyof typeof settings.sandboxPermissions
                  ];

                return (
                  <div
                    key={directive.key}
                    className="p-3 rounded-xl bg-[#171a21] border border-white/[0.05] flex items-center justify-between"
                  >
                    <div className="pr-2">
                      <div className="font-medium text-slate-200 text-xs">
                        {directive.label}
                      </div>
                      <div className="text-[11px] text-slate-500">{directive.desc}</div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={currentVal}
                      onClick={() =>
                        onUpdateSettings({
                          sandboxPermissions: {
                            ...settings.sandboxPermissions,
                            [directive.key]: !currentVal,
                          },
                        })
                      }
                      className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                        currentVal ? 'bg-emerald-500' : 'bg-white/10'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 ${
                          currentVal ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset All Browser Data */}
          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
              <Trash2 className="w-4 h-4" />
              Reset Stored Browser Data
            </div>
            <p className="text-xs text-slate-400">
              Permanently clears bookmarks, browsing history, saved tabs, and resets settings to initial defaults in <code>localStorage</code>.
            </p>
            {confirmReset ? (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onResetAllData();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
                >
                  Yes, Erase All Data
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-slate-300 text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Browser Storage
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-white/[0.08] bg-[#171a21] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
