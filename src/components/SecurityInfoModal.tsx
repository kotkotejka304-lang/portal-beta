import React from 'react';
import { X, ShieldCheck, Lock, ExternalLink, AlertTriangle, BookOpen, CheckCircle } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-2xl bg-[#13161c] border border-white/[0.1] rounded-2xl flex flex-col text-slate-100 shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-[#171a21]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 id="security-dialog-title" className="text-base font-bold text-white">
              Security Architecture & Embed Diagnostics
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Section 1: How Portal Works */}
          <section className="space-y-2">
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              1. Client-Side Sandboxed Browsing
            </h3>
            <p className="text-slate-400">
              Portal is a client-side web application running completely in your browser. All bookmarks, history entries, and preferences are stored exclusively on your device inside <code>localStorage</code>. No telemetry, browsing tracking, or external server databases are used.
            </p>
          </section>

          {/* Section 2: Why Certain Websites Refuse Embedding */}
          <section className="space-y-2 bg-[#171a21] p-4 rounded-xl border border-white/[0.06]">
            <h3 className="font-semibold text-amber-300 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              2. Understanding X-Frame-Options & CSP Restrictions
            </h3>
            <p className="text-slate-400">
              When you visit popular websites such as Google, YouTube, GitHub, Twitter, or banking institutions, you will notice they block iframe embedding. Here is why:
            </p>
            <div className="space-y-2 pl-2 border-l-2 border-amber-500/40 text-slate-300">
              <p>
                <strong>Clickjacking Protection:</strong> To prevent malicious sites from overlaying invisible buttons over authenticated accounts, the web standard specifies the <code>X-Frame-Options: SAMEORIGIN</code> and <code>Content-Security-Policy: frame-ancestors &apos;self&apos;</code> HTTP headers.
              </p>
              <p>
                <strong>Cross-Origin Security:</strong> By design, modern web browsers enforce these headers and reject embedding. Portal detects these restrictions and provides an immediate <strong>&ldquo;Open in New Tab&rdquo;</strong> button so you can seamlessly continue browsing.
              </p>
            </div>
          </section>

          {/* Section 3: Safe for School-Issued iPads and Chromebooks */}
          <section className="space-y-2">
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              3. School Device & Network Filter Compliance
            </h3>
            <p className="text-slate-400">
              Portal is designed for legitimate educational workflows. It does <strong>not</strong> operate an open proxy or URL-fetching relay server, and does not attempt to bypass local device policies, school Wi-Fi filters, or Mobile Device Management (MDM) configurations. All HTTP/HTTPS requests are initiated directly by the local browser agent.
            </p>
          </section>

          {/* Section 4: Verified Embed-Friendly Educational Platforms */}
          <section className="space-y-2 bg-[#171a21] p-4 rounded-xl border border-white/[0.06]">
            <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              4. Recommended Platforms for In-Frame Viewing
            </h3>
            <p className="text-slate-400">
              The following educational and open knowledge systems permit standard web embedding:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
              <li><strong>OpenStreetMap:</strong> Global collaborative mapping.</li>
              <li><strong>PhET Interactive Simulations:</strong> University of Colorado physics, chemistry, and math labs.</li>
              <li><strong>Project Gutenberg:</strong> Public domain literature.</li>
              <li><strong>NASA APOD:</strong> Daily astronomy image and archive.</li>
              <li><strong>W3Schools & MDN Web Docs:</strong> Code examples and reference manuals.</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#171a21] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs sm:text-sm transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
