import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { soundManager } from '../../utils/audio';
import { Play, RotateCcw, Brain, CheckCircle2 } from 'lucide-react';

interface Pad {
  id: number;
  label: string;
  color: string;
  glow: string;
  activeColor: string;
}

const PADS: Pad[] = [
  {
    id: 0,
    label: 'Electric Alpha',
    color: 'bg-sky-500/20 border-sky-500/40 text-sky-300',
    glow: 'shadow-[0_0_30px_rgba(56,189,248,0.7)]',
    activeColor: 'bg-sky-400 text-slate-950 scale-98 border-white ring-4 ring-sky-300/80',
  },
  {
    id: 1,
    label: 'Cyan Beta',
    color: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
    glow: 'shadow-[0_0_30px_rgba(6,182,212,0.7)]',
    activeColor: 'bg-cyan-400 text-slate-950 scale-98 border-white ring-4 ring-cyan-300/80',
  },
  {
    id: 2,
    label: 'Violet Gamma',
    color: 'bg-violet-500/20 border-violet-500/40 text-violet-300',
    glow: 'shadow-[0_0_30px_rgba(139,92,246,0.7)]',
    activeColor: 'bg-violet-400 text-slate-950 scale-98 border-white ring-4 ring-violet-300/80',
  },
  {
    id: 3,
    label: 'Amber Delta',
    color: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.7)]',
    activeColor: 'bg-amber-400 text-slate-950 scale-98 border-white ring-4 ring-amber-300/80',
  },
];

export const ReflexGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('portal_reflex_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });

  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playSequence = useCallback((seq: number[]) => {
    setIsShowingSequence(true);
    let step = 0;

    const playNext = () => {
      if (step >= seq.length) {
        setIsShowingSequence(false);
        setActivePad(null);
        return;
      }

      const padId = seq[step];
      setActivePad(padId);
      soundManager.playNote(padId);

      showTimeoutRef.current = setTimeout(() => {
        setActivePad(null);
        step++;
        showTimeoutRef.current = setTimeout(playNext, 250);
      }, 450);
    };

    showTimeoutRef.current = setTimeout(playNext, 500);
  }, []);

  const handleStart = useCallback(() => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    const initial = [Math.floor(Math.random() * 4)];
    setSequence(initial);
    setPlayerStep(0);
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
    playSequence(initial);
  }, [playSequence]);

  const handlePadClick = (padId: number) => {
    if (!isPlaying || isShowingSequence || isGameOver) return;

    soundManager.playNote(padId);
    setActivePad(padId);
    setTimeout(() => setActivePad(null), 200);

    // Validate player choice
    if (sequence[playerStep] === padId) {
      const nextStep = playerStep + 1;
      if (nextStep === sequence.length) {
        // Round cleared!
        const nextScore = sequence.length * 10;
        setScore(nextScore);
        if (nextScore > highScore) {
          setHighScore(nextScore);
          try {
            localStorage.setItem('portal_reflex_highscore', nextScore.toString());
          } catch {
            // Ignore
          }
        }
        soundManager.playScore();

        // Add next note to sequence
        const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(nextSeq);
        setPlayerStep(0);
        setTimeout(() => playSequence(nextSeq), 700);
      } else {
        setPlayerStep(nextStep);
      }
    } else {
      // Mistake!
      soundManager.playGameOver();
      setIsGameOver(true);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    };
  }, []);

  return (
    <GameContainer
      title="Glass Reflex Matrix"
      badge="Cognitive Speed"
      score={score}
      highScore={highScore}
      controlsInfo="Watch and listen carefully to the musical sequence of glowing glass pads, then tap or click them in the exact same order."
      isGameOver={isGameOver}
      onRestart={handleStart}
      onExit={onExit}
    >
      <div className="flex flex-col items-center justify-center max-w-sm w-full space-y-4">
        {/* Status Capsule */}
        <div className="flex items-center justify-between w-full px-4 py-2 rounded-xl backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] text-xs">
          <span className="text-slate-400">
            {isShowingSequence ? (
              <span className="text-cyan-400 font-semibold animate-pulse flex items-center gap-1.5">
                Memorize the Pattern...
              </span>
            ) : isPlaying ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Your Turn ({playerStep}/{sequence.length})
              </span>
            ) : (
              'Ready to challenge your memory'
            )}
          </span>
          <span className="font-mono text-slate-300 font-bold">Round {sequence.length}</span>
        </div>

        {/* 2x2 Liquid Glass Pad Matrix */}
        <div className="relative w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] p-3 rounded-3xl backdrop-blur-2xl bg-[#0f121a]/90 border border-white/[0.12] shadow-[0_16px_48px_rgba(0,0,0,0.6)] grid grid-cols-2 grid-rows-2 gap-3.5 select-none">
          {PADS.map((pad) => {
            const isActive = activePad === pad.id;
            return (
              <button
                key={pad.id}
                type="button"
                onClick={() => handlePadClick(pad.id)}
                disabled={isShowingSequence}
                className={`relative rounded-2xl border transition-all duration-150 flex flex-col items-center justify-center p-4 cursor-pointer outline-none ${
                  isActive ? `${pad.activeColor} ${pad.glow}` : pad.color
                } hover:brightness-110 active:scale-95`}
              >
                {/* Specular glass reflection */}
                <div className="absolute top-2 left-3 right-3 h-1.5 rounded-full bg-white/20 pointer-events-none" />
                <span className="text-xs font-bold tracking-wider uppercase opacity-80">
                  {pad.label.split(' ')[0]}
                </span>
              </button>
            );
          })}

          {/* Start Screen Overlay */}
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 backdrop-blur-md bg-black/65 rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.3)]">
                <Brain className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">Reflex Matrix</h2>
                <p className="text-xs text-slate-300 max-w-xs">
                  Train mental recall. Repeat the glowing musical chords in exact sequence.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Challenge
              </button>
            </div>
          )}

          {/* Game Over Screen Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 backdrop-blur-lg bg-black/75 rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">Sequence Broken</h2>
                <p className="text-xs text-slate-300">
                  Reached Round: <span className="font-mono text-sky-400 font-bold text-sm">{sequence.length}</span> · Score: <span className="font-mono text-cyan-400 font-bold">{score}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry Matrix
              </button>
            </div>
          )}
        </div>
      </div>
    </GameContainer>
  );
};
