import React, { useState, useRef, useEffect } from 'react';
import { GameContainer } from './GameContainer';
import { soundManager } from '../../utils/audio';
import { Zap, Timer, RotateCcw, Award } from 'lucide-react';

type GameState = 'idle' | 'waiting' | 'ready' | 'early' | 'result';

export const ReactionGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [bestTime, setBestTime] = useState(() => {
    try {
      return parseInt(localStorage.getItem('portal_reaction_best') || '999', 10);
    } catch {
      return 999;
    }
  });

  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startRound = () => {
    setGameState('waiting');
    setReactionTime(null);

    const randomDelay = Math.floor(Math.random() * 3000) + 1500; // 1.5 - 4.5 seconds

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      startTimeRef.current = performance.now();
      soundManager.playBeep?.(800, 'sine', 0.05);
    }, randomDelay);
  };

  const handleClick = () => {
    if (gameState === 'idle') {
      startRound();
    } else if (gameState === 'waiting') {
      // Too early!
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState('early');
      soundManager.playGameOver();
    } else if (gameState === 'ready') {
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setReactionTime(elapsed);
      setGameState('result');
      soundManager.playScore();

      const newHistory = [elapsed, ...history].slice(0, 5);
      setHistory(newHistory);

      if (elapsed < bestTime) {
        setBestTime(elapsed);
        try {
          localStorage.setItem('portal_reaction_best', elapsed.toString());
        } catch {
          // Ignore
        }
      }
    } else if (gameState === 'early' || gameState === 'result') {
      startRound();
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getTier = (ms: number) => {
    if (ms < 200) return { title: 'Godlike Reflexes', color: 'text-cyan-400' };
    if (ms < 240) return { title: 'Pro Esports Level', color: 'text-sky-400' };
    if (ms < 280) return { title: 'Great Speed', color: 'text-sky-400' };
    if (ms < 350) return { title: 'Good Reflexes', color: 'text-amber-400' };
    return { title: 'Average Human', color: 'text-slate-400' };
  };

  const avgTime =
    history.length > 0 ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) : null;

  return (
    <GameContainer
      title="Chrono Reaction"
      badge="Reflex Speed"
      score={reactionTime ? Math.max(0, 1000 - reactionTime) : 0}
      highScore={bestTime < 999 ? Math.max(0, 1000 - bestTime) : 0}
      controlsInfo="Tap the screen when it turns Electric Blue as fast as you can. Avoid jumping the gun on the red waiting screen."
      isGameOver={false}
      onRestart={startRound}
      onExit={onExit}
    >
      <div className="flex flex-col items-center justify-center max-w-sm w-full space-y-4">
        {/* Reaction Touch Surface */}
        <div
          onClick={handleClick}
          className={`w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 select-none border shadow-2xl active:scale-98 ${
            gameState === 'idle'
              ? 'glass-panel hover:border-sky-400/50'
              : gameState === 'waiting'
              ? 'bg-rose-950/70 border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.3)]'
              : gameState === 'ready'
              ? 'bg-sky-500 border-white text-slate-950 shadow-[0_0_50px_rgba(56,189,248,0.9)] animate-pulse'
              : gameState === 'early'
              ? 'glass-panel border-amber-500/50'
              : 'glass-panel border-sky-400/50'
          }`}
        >
          {gameState === 'idle' && (
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center mx-auto text-sky-400 shadow-md">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Chrono Reaction</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Tap anywhere on this glass tile to start testing your reaction speed.
              </p>
            </div>
          )}

          {gameState === 'waiting' && (
            <div className="space-y-2">
              <div className="w-3 h-3 rounded-full bg-rose-400 animate-ping mx-auto" />
              <h3 className="text-xl font-bold text-rose-300">Wait for Blue Signal...</h3>
              <p className="text-xs text-rose-200/70">Do not tap yet!</p>
            </div>
          )}

          {gameState === 'ready' && (
            <div className="space-y-2 text-slate-950">
              <Zap className="w-12 h-12 mx-auto fill-current" />
              <h3 className="text-3xl font-black tracking-tight uppercase">TAP NOW!</h3>
            </div>
          )}

          {gameState === 'early' && (
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-amber-300">Too Early!</h3>
              <p className="text-xs text-[var(--text-secondary)]">You tapped before the blue flash.</p>
              <span className="text-xs font-semibold text-sky-400">Tap to Try Again</span>
            </div>
          )}

          {gameState === 'result' && reactionTime !== null && (
            <div className="space-y-3">
              <Timer className="w-8 h-8 text-sky-400 mx-auto" />
              <div className="font-mono text-4xl font-black text-sky-400">{reactionTime} ms</div>
              <p className={`text-xs font-bold ${getTier(reactionTime).color}`}>
                {getTier(reactionTime).title}
              </p>
              <span className="text-xs text-[var(--text-secondary)]">Tap to Try Again</span>
            </div>
          )}
        </div>

        {/* Stats Summary Bar */}
        <div className="flex items-center justify-between w-full px-4 py-2.5 rounded-2xl glass-panel text-xs">
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Best:</span>
            <span className="font-mono font-bold text-amber-400">
              {bestTime < 999 ? `${bestTime}ms` : '—'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            <span>Avg (5):</span>
            <span className="font-mono font-bold text-sky-400">
              {avgTime ? `${avgTime}ms` : '—'}
            </span>
          </div>
        </div>
      </div>
    </GameContainer>
  );
};
