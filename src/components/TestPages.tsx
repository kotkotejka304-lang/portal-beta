import React from 'react';
import {
  ShieldAlert,
  CheckCircle,
  ArrowLeft,
  Home,
  Code2,
  Globe,
} from 'lucide-react';

interface TestPageProps {
  type: 'blocked' | 'embeddable';
  onNavigate: (url: string) => void;
  onBack: () => void;
}

export const TestPages: React.FC<TestPageProps> = ({
  type,
  onNavigate,
  onBack,
}) => {
  if (type === 'blocked') {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/30 shadow-2xl space-y-6 text-left">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-amber-500/15 text-amber-300 font-semibold mb-1">
                Controlled Embedding Denial Test
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Website Prohibits In-Page Embedding
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Simulated response for sites enforcing <code>X-Frame-Options: DENY</code> or <code>frame-ancestors &apos;none&apos;</code>.
              </p>
            </div>
          </div>

          {/* Technical Header Box */}
          <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-glass)] space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[11px] border-b border-[var(--border-glass)] pb-2">
              <Code2 className="w-4 h-4 text-sky-400" />
              <span>Simulated Server HTTP Response Headers</span>
            </div>
            <p className="text-sky-400">HTTP/1.1 200 OK</p>
            <p className="text-amber-400 font-semibold">X-Frame-Options: DENY</p>
            <p className="text-amber-400 font-semibold">Content-Security-Policy: frame-ancestors &apos;none&apos;</p>
            <p className="text-[var(--text-muted)]">X-Content-Type-Options: nosniff</p>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            <p>
              When a website sends these headers, the browser&apos;s security sandbox (Chrome, Safari, iPadOS) refuses to render the content within an iframe to defend against clickjacking and credential extraction.
            </p>
            <p className="text-[var(--text-muted)]">
              Parent web applications cannot bypass or disable these headers. Portal provides the truthful fallback below:
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('portal://welcome')}
              className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-[var(--text-primary)] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-sky-400" />
              Return Home
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-[var(--text-secondary)] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Go Back
            </button>
            <button
              type="button"
              onClick={() => onNavigate('https://discord.com')}
              className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/40 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              Test Real Discord URL
            </button>
            <button
              type="button"
              onClick={() => onNavigate('https://duckduckgo.com')}
              className="px-4 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              Test Real DuckDuckGo URL
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Embeddable test page
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl glass-panel border border-sky-500/30 shadow-2xl space-y-6 text-left">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-sky-500/15 text-sky-400 font-semibold mb-1">
              Controlled In-Frame Compatibility Test
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Website Permits Sandboxed Embedding
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Verified sites that do not set restrictive <code>X-Frame-Options</code> or <code>frame-ancestors</code> headers.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Select a verified embeddable service to test in-frame loading:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                onNavigate(
                  'https://www.openstreetmap.org/export/embed.html?bbox=-0.15%2C51.50%2C-0.10%2C51.52&layer=mapnik'
                )
              }
              className="p-3.5 rounded-2xl bg-[var(--bg-input)] hover:bg-white/[0.08] border border-[var(--border-glass)] hover:border-sky-500/40 text-left transition-all cursor-pointer"
            >
              <div className="font-semibold text-xs text-[var(--text-primary)]">OpenStreetMap Interactive</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">Full pan & zoom map embedding</div>
            </button>

            <button
              type="button"
              onClick={() =>
                onNavigate(
                  'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html'
                )
              }
              className="p-3.5 rounded-2xl bg-[var(--bg-input)] hover:bg-white/[0.08] border border-[var(--border-glass)] hover:border-sky-500/40 text-left transition-all cursor-pointer"
            >
              <div className="font-semibold text-xs text-[var(--text-primary)]">PhET Physics Simulator</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">HTML5 canvas scientific lab</div>
            </button>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-[var(--border-glass)]">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-[var(--text-secondary)] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>
          <button
            type="button"
            onClick={() => onNavigate('portal://welcome')}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
};
