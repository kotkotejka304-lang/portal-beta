import React from 'react';
import { X, ShieldCheck, Lock, ExternalLink, AlertTriangle, BookOpen, CheckCircle, Info } from 'lucide-react';

interface SecurityInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityInfoModal: React.FC<SecurityInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="security-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl animate-in fade-in"
    >
      <div className="w-full max-w-2xl glass-panel rounded-3xl flex flex-col text-[var(--text-primary)] shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4.5 border-b border-[var(--border-glass)] bg-white/[0.04]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <h2 id="security-dialog-title" className="text-base font-bold text-[var(--text-primary)]">
              Security Architecture & Embed Diagnostics
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          {/* Section 1: How Portal Works */}
          <section className="space-y-2">
            <h3 className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-400" />
              1. Client-Side Sandboxed Browsing
            </h3>
            <p className="text-[var(--text-secondary)]">
              Portal is a client-side web application running completely in your browser. All bookmarks, history entries, and preferences are stored exclusively on your device inside <code>localStorage</code>. No telemetry, browsing tracking, or external server databases are used.
            </p>
          </section>

          {/* Section 2: Why Certain Websites Refuse Embedding */}
          <section className="space-y-2 bg-[var(--bg-input)] p-4 rounded-2xl border border-[var(--border-glass)]">
            <h3 className="font-semibold text-amber-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              2. Understanding X-Frame-Options & CSP Restrictions
            </h3>
            <p className="text-[var(--text-secondary)]">
              Major commercial platforms (including <strong>Discord</strong>, <strong>Google</strong>, <strong>Twitter/X</strong>, <strong>Netflix</strong>, and <strong>Reddit</strong>) explicitly send security headers preventing other web pages from rendering them in an iframe:
            </p>
            <div className="p-3 bg-black/20 rounded-xl font-mono text-[11px] text-[var(--text-muted)] space-y-1">
              <div>• <code>X-Frame-Options: SAMEORIGIN</code> or <code>DENY</code></div>
              <div>• <code>Content-Security-Policy: frame-ancestors &apos;self&apos;</code></div>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              These headers exist to protect user security against <em>Clickjacking</em> attacks. When a web server provides these headers, all compliant web browsers (including Safari on iPad, Chrome, Edge, and Firefox) automatically refuse to render the frame.
            </p>
          </section>

          {/* Section 3: Diagnostic Tests */}
          <section className="space-y-2.5">
            <h3 className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-sky-400" />
              3. Cross-Device Diagnostic Procedure
            </h3>
            <p className="text-[var(--text-secondary)]">
              If an address loads on one device but fails on another, perform these checks:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-[var(--border-glass)]">
                <span className="font-bold text-[var(--text-primary)]">Test A: Open in New Tab</span>
                <p className="text-[var(--text-secondary)] mt-0.5">
                  Click the <strong>Open in New Tab</strong> button. If the site opens natively, Portal is operating correctly and the failure inside the frame is caused by the server&apos;s embed headers.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-[var(--border-glass)]">
                <span className="font-bold text-[var(--text-primary)]">Test B: Network / Wi-Fi Inspection</span>
                <p className="text-[var(--text-secondary)] mt-0.5">
                  School, corporate, and cellular connections frequently filter ports, block WebSockets, or enforce strict DNS inspection that drops framed connections.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-[var(--border-glass)]">
                <span className="font-bold text-[var(--text-primary)]">Test C: Browser Privacy & Shields</span>
                <p className="text-[var(--text-secondary)] mt-0.5">
                  Aggressive browser extensions or privacy shields (e.g. Brave Shields, uBlock Origin, Safari Advanced Tracking Protection) can block cross-origin subframes.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Portal Commitments */}
          <section className="space-y-2 pt-2 border-t border-[var(--border-glass)] text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--text-secondary)]">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>Honest Browser Guarantees</span>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Portal never runs an unrestricted proxy or tampers with destination security headers.</li>
              <li>Portal never simulates false loading or leaves you on an infinite spinner.</li>
              <li>All game saves, high scores, bookmarks, and history remain strictly on your local device.</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-glass)] bg-white/[0.04] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
