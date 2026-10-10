import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize2,
  Minimize2,
  ArrowLeft,
  HelpCircle,
  Trophy,
  Gamepad2,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface GameContainerProps {
  title: string;
  badge: string;
  score: number;
  highScore: number;
  controlsInfo: string;
  isGameOver: boolean;
  onRestart: () => void;
  onExit: () => void;
  children: React.ReactNode;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  title,
  badge,
  score,
  highScore,
  controlsInfo,
  isGameOver: _isGameOver,
  onRestart,
  onExit,
  children,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const handleToggleSound = () => {
    const muted = soundManager.toggleMuted();
    setIsMuted(muted);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`flex flex-col h-full bg-[var(--bg-main)] text-[var(--text-primary)] select-none overflow-hidden relative ${
        isFullscreen ? 'fixed inset-0 z-50' : 'flex-1'
      }`}
    >
      {/* Background Liquid Glass Ambient Blue Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />

      {/* Apple Liquid Glass Game Bar */}
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-2.5 backdrop-blur-2xl glass-toolbar shadow-md min-h-[52px]">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-[var(--text-primary)] transition-all active:scale-95 border border-[var(--border-glass)] cursor-pointer min-h-[40px]"
            title="Return to Arcade Hub"
          >
            <ArrowLeft className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Arcade Hub</span>
          </button>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-bold tracking-tight text-[var(--text-primary)]">{title}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 hidden md:inline">
                  {badge}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Score & High Score Apple Glass Capsule */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl glass-panel shadow-inner text-xs">
            <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[11px]">Score:</span>
              <span className="font-mono font-bold text-[var(--text-primary)] text-xs sm:text-sm">{score}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1.5 text-amber-400">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] hidden sm:inline">Best:</span>
              <span className="font-mono font-bold text-amber-400 text-xs sm:text-sm">{highScore}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleSound}
              className={`p-2.5 rounded-xl transition-all border cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center ${
                isMuted
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-white/[0.08] hover:bg-white/[0.15] text-[var(--text-primary)] border-[var(--border-glass)]'
              }`}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
            </button>

            <button
              type="button"
              onClick={onRestart}
              className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-[var(--text-primary)] border border-[var(--border-glass)] transition-all active:scale-95 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Restart Game"
            >
              <RotateCcw className="w-4 h-4 text-sky-400" />
            </button>

            <button
              type="button"
              onClick={() => setShowControls(!showControls)}
              className={`p-2.5 rounded-xl transition-all border cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center ${
                showControls
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-white/[0.08] hover:bg-white/[0.15] text-[var(--text-primary)] border-[var(--border-glass)]'
              }`}
              title="Controls Info"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-[var(--text-primary)] border border-[var(--border-glass)] transition-all hidden sm:flex items-center justify-center cursor-pointer min-h-[40px] min-w-[40px]"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Play'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Controls Info Dropdown Toast */}
      {showControls && (
        <div className="absolute top-16 right-4 z-30 max-w-sm p-4 rounded-2xl glass-panel shadow-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sky-400 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4" /> How to Play
            </span>
            <button
              type="button"
              onClick={() => setShowControls(false)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
            >
              ✕
            </button>
          </div>
          <p className="text-[var(--text-secondary)] text-[12px] leading-relaxed">{controlsInfo}</p>
        </div>
      )}

      {/* Main Game Surface */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 relative z-10 overflow-hidden safe-bottom">
        {children}
      </div>
    </div>
  );
};
