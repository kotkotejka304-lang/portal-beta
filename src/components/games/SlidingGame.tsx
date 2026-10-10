import React, { useState, useEffect, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { soundManager } from '../../utils/audio';
import { RotateCcw, Shuffle, Trophy, CheckCircle2 } from 'lucide-react';

export const SlidingGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('portal_sliding_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });

  // Check if puzzle is solvable
  const isSolvable = (arr: number[]): boolean => {
    let inversions = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] && arr[j] && arr[i] > arr[j]) {
          inversions++;
        }
      }
    }
    const emptyRowFromBottom = 4 - Math.floor(arr.indexOf(0) / 4);
    return emptyRowFromBottom % 2 === 0 ? inversions % 2 !== 0 : inversions % 2 === 0;
  };

  const handleShuffle = useCallback(() => {
    let shuffled: number[];
    do {
      shuffled = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0].sort(
        () => Math.random() - 0.5
      );
    } while (!isSolvable(shuffled) || isWinning(shuffled));

    setTiles(shuffled);
    setMoves(0);
    setSeconds(0);
    setHasWon(false);
    setIsPlaying(true);
    soundManager.playScore();
  }, []);

  const isWinning = (arr: number[]): boolean => {
    for (let i = 0; i < 15; i++) {
      if (arr[i] !== i + 1) return false;
    }
    return arr[15] === 0;
  };

  useEffect(() => {
    handleShuffle();
  }, [handleShuffle]);

  // Timer
  useEffect(() => {
    if (!isPlaying || hasWon) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, hasWon]);

  const handleTileClick = (index: number) => {
    if (hasWon) return;
    const emptyIndex = tiles.indexOf(0);

    const r = Math.floor(index / 4);
    const c = index % 4;
    const er = Math.floor(emptyIndex / 4);
    const ec = emptyIndex % 4;

    // Check adjacency
    const isAdjacent = (Math.abs(r - er) === 1 && c === ec) || (Math.abs(c - ec) === 1 && r === er);

    if (isAdjacent) {
      soundManager.playBounce(1.3);
      const nextTiles = [...tiles];
      nextTiles[emptyIndex] = tiles[index];
      nextTiles[index] = 0;
      setTiles(nextTiles);
      setMoves((m) => m + 1);

      if (isWinning(nextTiles)) {
        setHasWon(true);
        setIsPlaying(false);
        soundManager.playScore();

        const calculatedScore = Math.max(50, 1000 - moves * 5 - seconds * 3);
        if (calculatedScore > highScore) {
          setHighScore(calculatedScore);
          try {
            localStorage.setItem('portal_sliding_highscore', calculatedScore.toString());
          } catch {
            // Ignore
          }
        }
      }
    }
  };

  return (
    <GameContainer
      title="Liquid 15 Puzzle"
      badge="Sliding Logic"
      score={Math.max(0, 1000 - moves * 5 - seconds * 3)}
      highScore={highScore}
      controlsInfo="Tap any number adjacent to the empty slot to slide it. Arrange tiles sequentially from 1 to 15."
      isGameOver={false}
      onRestart={handleShuffle}
      onExit={onExit}
    >
      <div className="flex flex-col items-center justify-center max-w-sm w-full space-y-4">
        {/* HUD Bar */}
        <div className="flex items-center justify-between w-full px-4 py-2 rounded-2xl glass-panel text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-secondary)]">Moves:</span>
            <span className="font-mono font-bold text-sky-400">{moves}</span>
          </div>
          <button
            type="button"
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-[var(--border-glass)] text-xs font-semibold text-[var(--text-primary)] transition-all active:scale-95 cursor-pointer min-h-[36px]"
          >
            <Shuffle className="w-3.5 h-3.5 text-sky-400" />
            <span>Shuffle</span>
          </button>
          <div className="font-mono text-[var(--text-secondary)] font-bold">⏱ {seconds}s</div>
        </div>

        {/* 4x4 Liquid Glass Sliding Grid */}
        <div className="relative w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] p-3 rounded-3xl glass-panel shadow-2xl grid grid-cols-4 grid-rows-4 gap-2.5 select-none touch-manipulation">
          {tiles.map((num, idx) => {
            if (num === 0) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="rounded-xl border border-dashed border-white/[0.06] bg-transparent"
                />
              );
            }

            return (
              <button
                key={num}
                type="button"
                onClick={() => handleTileClick(idx)}
                className="relative flex items-center justify-center rounded-xl font-black font-mono text-lg sm:text-xl transition-all duration-150 active:scale-95 cursor-pointer border bg-gradient-to-br from-sky-500/25 via-blue-600/30 to-indigo-600/25 border-sky-400/40 text-[var(--text-primary)] shadow-md hover:border-sky-300/70"
              >
                {/* Specular line */}
                <div className="absolute top-1 left-2 right-2 h-1 rounded-full bg-white/25 pointer-events-none" />
                <span className="drop-shadow-sm select-none">{num}</span>
              </button>
            );
          })}

          {/* Victory Overlay */}
          {hasWon && (
            <div className="absolute inset-0 backdrop-blur-md bg-blue-950/85 rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-3 animate-fadeIn">
              <Trophy className="w-12 h-12 text-amber-300" />
              <h2 className="text-xl font-bold text-white">Puzzle Solved!</h2>
              <p className="text-xs text-slate-200">
                Completed in {moves} moves ({seconds}s).
              </p>
              <button
                type="button"
                onClick={handleShuffle}
                className="px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </GameContainer>
  );
};
