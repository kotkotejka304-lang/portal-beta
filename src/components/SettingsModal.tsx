import React, { useState } from 'react';
import {
  X,
  Settings,
  Shield,
  Search,
  Trash2,
  Check,
  RotateCcw,
  Smartphone,
  Monitor,
  Clock,
  Sun,
  Moon,
} from 'lucide-react';
import { BrowserSettings, SearchEngine, ThemePreference } from '../types/browser';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl animate-in fade-in"
    >
      <div className="w-full max-w-xl glass-panel rounded-3xl flex flex-col text-[var(--text-primary)] shadow-2xl overflow-hidden max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4.5 border-b border-[var(--border-glass)] bg-white/[0.04]">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-400" />
            <h2 id="settings-dialog-title" className="text-base font-bold text-[var(--text-primary)]">
              Browser Settings & Preferences
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Theme Appearance Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-sky-400" />
              Appearance & Theme
            </label>
            <p className="text-xs text-[var(--text-muted)]">
              Choose your preferred Liquid Glass appearance or follow device system settings.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {(
                [
                  { id: 'light', label: 'Light', desc: 'Pearl white glass', icon: Sun },
                  { id: 'dark', label: 'Dark', desc: 'Ocean smoked glass', icon: Moon },
                  { id: 'system', label: 'System', desc: 'Follows iPadOS / OS', icon: Monitor },
                ] as const
              ).map((mode) => {
                const isSelected = settings.theme === mode.id;
                const IconComponent = mode.icon;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => onUpdateSettings({ theme: mode.id as ThemePreference })}
                    className={`p-3 rounded-2xl border text-left text-xs transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                        : 'bg-white/[0.04] border-[var(--border-glass)] text-[var(--text-secondary)] hover:border-white/[0.2]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full font-bold">
                      <span className="flex items-center gap-1.5">
                        <IconComponent className="w-3.5 h-3.5" />
                        {mode.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] mt-1">{mode.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Engine Selection */}
          <div className="space-y-2 py-3 border-t border-[var(--border-glass)]">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-sky-400" />
              Default Omnibox Search Engine
            </label>
            <p className="text-xs text-[var(--text-muted)]">
              When entering plain text in the address bar, Portal redirects to this provider.
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
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                    settings.defaultSearchEngine === engine.id
                      ? 'bg-sky-500/15 border-sky-500 text-sky-400'
                      : 'bg-white/[0.04] border-[var(--border-glass)] text-[var(--text-secondary)] hover:border-white/[0.2]'
                  }`}
                >
                  <span>{engine.name}</span>
                  {settings.defaultSearchEngine === engine.id && (
                    <Check className="w-3.5 h-3.5 text-sky-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bookmarks Bar Toggle */}
          <div className="flex items-center justify-between py-3 border-t border-[var(--border-glass)]">
            <div className="space-y-0.5 pr-4">
              <div className="text-xs font-semibold text-[var(--text-primary)]">
                Show Bookmarks Bar
              </div>
              <p className="text-xs text-[var(--text-muted)]">
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
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                settings.showBookmarksBar ? 'bg-sky-500' : 'bg-white/10'
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
          <div className="flex items-center justify-between py-3 border-t border-[var(--border-glass)]">
            <div className="space-y-0.5 pr-4">
              <div className="text-xs font-semibold text-[var(--text-primary)]">
                Automatic HTTPS Upgrade
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Automatically prepends <code>https://</code> when typing domain names without a scheme.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.autoHttps}
              onClick={() => onUpdateSettings({ autoHttps: !settings.autoHttps })}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                settings.autoHttps ? 'bg-sky-500' : 'bg-white/10'
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
          <div className="space-y-2 py-3 border-t border-[var(--border-glass)]">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Frame Connection Timeout Duration
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                How long Portal waits before showing the connection timeout screen.
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
                    className={`p-2 rounded-xl border text-left text-xs transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500 text-sky-400'
                        : 'bg-white/[0.04] border-[var(--border-glass)] text-[var(--text-secondary)] hover:border-white/[0.2]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full font-semibold">
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3 h-3 text-sky-400" />}
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] mt-1">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Device Layout Mode (Desktop vs iPad emulation) */}
          <div className="flex items-center justify-between py-3 border-t border-[var(--border-glass)]">
            <div className="space-y-0.5 pr-4">
              <div className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                {isIpadMode ? (
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <Monitor className="w-3.5 h-3.5 text-sky-400" />
                )}
                iPad Touch Shell Emulation
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Simulates standard 11-inch iPad tablet frame dimensions for testing layout and touch targets.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isIpadMode}
              onClick={onToggleIpadMode}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                isIpadMode ? 'bg-sky-500' : 'bg-white/10'
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
          <div className="space-y-3 py-3 border-t border-[var(--border-glass)]">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                Iframe Security Sandbox Controls
              </div>
              <p className="text-xs text-[var(--text-muted)]">
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
                    className="p-3 rounded-xl bg-white/[0.04] border border-[var(--border-glass)] flex items-center justify-between"
                  >
                    <div className="pr-2">
                      <div className="font-medium text-[var(--text-primary)] text-xs">
                        {directive.label}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">{directive.desc}</div>
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
                      className={`w-9 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                        currentVal ? 'bg-sky-500' : 'bg-white/10'
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
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
              <Trash2 className="w-4 h-4" />
              Reset Stored Browser Data
            </div>
            <p className="text-xs text-[var(--text-muted)]">
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
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Yes, Erase All Data
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-[var(--text-secondary)] text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Browser Storage
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[var(--border-glass)] bg-white/[0.04] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
