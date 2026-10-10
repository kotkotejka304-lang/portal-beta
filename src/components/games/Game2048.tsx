import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameContainer } from './GameContainer';
import { soundManager } from '../../utils/audio';
import { RotateCcw, Undo2, Award } from 'lucide-react';

type Board = (number | null)[][];

const BOARD_SIZE = 4;

export const Game2048: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [board, setBoard] = useState<Board>(() => getEmptyBoard());
  const [prevBoard, setPrevBoard] = useState<Board | null>(null);
  const [score, setScore] = useState(0);
  const [prevScore, setPrevScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('portal_2048_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  function getEmptyBoard(): Board {
    return Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null));
  }

  const addRandomTile = useCallback((currentBoard: Board): Board => {
    const emptyCells: { r: number; c: number }[] = [];
    currentBoard.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === null) emptyCells.push({ r, c });
      });
    });

    if (emptyCells.length === 0) return currentBoard;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const val = Math.random() < 0.9 ? 2 : 4;
    const newBoard = currentBoard.map((row) => [...row]);
    newBoard[randomCell.r][randomCell.c] = val;
    return newBoard;
  }, []);

  const handleStart = useCallback(() => {
    let newBoard = getEmptyBoard();
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setPrevBoard(null);
    setScore(0);
    setIsGameOver(false);
    setHasWon(false);
    soundManager.playScore();
  }, [addRandomTile]);

  useEffect(() => {
    handleStart();
  }, [handleStart]);

  // Check if board has valid moves
  const checkGameOver = (b: Board): boolean => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (b[r][c] === null) return false;
        if (c < BOARD_SIZE - 1 && b[r][c] === b[r][c + 1]) return false;
        if (r < BOARD_SIZE - 1 && b[r][c] === b[r + 1][c]) return false;
      }
    }
    return true;
  };

  // Move Logic
  const move = useCallback(
    (direction: 'left' | 'right' | 'up' | 'down') => {
      if (isGameOver) return;

      let changed = false;
      let pointsEarned = 0;
      const newBoard: Board = board.map((row) => [...row]);

      const slideAndCombine = (line: (number | null)[]): (number | null)[] => {
        const filtered = line.filter((v): v is number => v !== null);
        const result: (number | null)[] = [];
        let skip = false;

        for (let i = 0; i < filtered.length; i++) {
          if (skip) {
            skip = false;
            continue;
          }
          if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
            const merged = filtered[i] * 2;
            result.push(merged);
            pointsEarned += merged;
            if (merged === 2048) setHasWon(true);
            skip = true;
          } else {
            result.push(filtered[i]);
          }
        }

        while (result.length < BOARD_SIZE) {
          result.push(null);
        }
        return result;
      };

      if (direction === 'left') {
        for (let r = 0; r < BOARD_SIZE; r++) {
          const original = [...newBoard[r]];
          newBoard[r] = slideAndCombine(newBoard[r]);
          if (newBoard[r].some((v, idx) => v !== original[idx])) changed = true;
        }
      } else if (direction === 'right') {
        for (let r = 0; r < BOARD_SIZE; r++) {
          const original = [...newBoard[r]];
          const reversed = [...newBoard[r]].reverse();
          const combined = slideAndCombine(reversed).reverse();
          newBoard[r] = combined;
          if (newBoard[r].some((v, idx) => v !== original[idx])) changed = true;
        }
      } else if (direction === 'up') {
        for (let c = 0; c < BOARD_SIZE; c++) {
          const col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
          const combined = slideAndCombine(col);
          for (let r = 0; r < BOARD_SIZE; r++) {
            if (newBoard[r][c] !== combined[r]) changed = true;
            newBoard[r][c] = combined[r];
          }
        }
      } else if (direction === 'down') {
        for (let c = 0; c < BOARD_SIZE; c++) {
          const col = [newBoard[3][c], newBoard[2][c], newBoard[1][c], newBoard[0][c]];
          const combined = slideAndCombine(col);
          for (let r = 0; r < BOARD_SIZE; r++) {
            if (newBoard[3 - r][c] !== combined[r]) changed = true;
            newBoard[3 - r][c] = combined[r];
          }
        }
      }

      if (changed) {
        setPrevBoard(board);
        setPrevScore(score);
        const spawnedBoard = addRandomTile(newBoard);
        setBoard(spawnedBoard);

        const newScore = score + pointsEarned;
        setScore(newScore);
        if (newScore > highScore) {
          setHighScore(newScore);
          try {
            localStorage.setItem('portal_2048_highscore', newScore.toString());
          } catch {
            // Ignore
          }
        }

        if (pointsEarned > 0) {
          soundManager.playEat();
        } else {
          soundManager.playBounce(1.5);
        }

        if (checkGameOver(spawnedBoard)) {
          setIsGameOver(true);
          soundManager.playGameOver();
        }
      }
    },
    [board, isGameOver, score, highScore, addRandomTile]
  );

  const handleUndo = () => {
    if (prevBoard) {
      setBoard(prevBoard);
      setScore(prevScore);
      setPrevBoard(null);
      setIsGameOver(false);
      soundManager.playBounce(0.8);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          move('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          move('right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          move('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          move('down');
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // Touch Swipe for iPad
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 30) {
      if (absX > absY) {
        move(dx > 0 ? 'right' : 'left');
      } else {
        move(dy > 0 ? 'down' : 'up');
      }
    }
    touchStartRef.current = null;
  };

  // Apple Liquid Glass Tile Color Map
  const getTileStyle = (val: number | null) => {
    if (!val) return 'bg-white/[0.03] border-white/[0.05] text-transparent';

    switch (val) {
      case 2:
        return 'bg-gradient-to-br from-slate-700/60 to-slate-800/80 text-slate-100 border-white/20 shadow-md';
      case 4:
        return 'bg-gradient-to-br from-cyan-600/70 to-sky-700/80 text-white border-sky-400/40 shadow-sky-500/20 shadow-md';
      case 8:
        return 'bg-gradient-to-br from-sky-600/70 to-blue-700/80 text-white border-sky-400/40 shadow-sky-500/30 shadow-lg';
      case 16:
        return 'bg-gradient-to-br from-blue-600/70 to-indigo-700/80 text-white border-indigo-400/40 shadow-indigo-500/30 shadow-lg';
      case 32:
        return 'bg-gradient-to-br from-indigo-600/70 to-violet-700/80 text-white border-violet-400/40 shadow-violet-500/30 shadow-lg';
      case 64:
        return 'bg-gradient-to-br from-violet-600/70 to-purple-700/80 text-white border-purple-400/40 shadow-purple-500/40 shadow-xl';
      case 128:
        return 'bg-gradient-to-br from-fuchsia-600/70 to-pink-700/80 text-white border-pink-400/50 shadow-pink-500/40 shadow-xl';
      case 256:
        return 'bg-gradient-to-br from-amber-500/80 to-orange-600/85 text-slate-950 font-black border-amber-200/60 shadow-amber-500/50 shadow-2xl';
      case 512:
        return 'bg-gradient-to-br from-sky-400/85 to-blue-600/85 text-slate-950 font-black border-sky-300/60 shadow-sky-500/50 shadow-2xl';
      case 1024:
        return 'bg-gradient-to-br from-cyan-400/90 to-blue-600/90 text-slate-950 font-black border-cyan-200/70 shadow-cyan-400/60 shadow-2xl ring-2 ring-cyan-400/50';
      case 2048:
        return 'bg-gradient-to-br from-sky-300 via-cyan-300 to-blue-400 text-slate-950 font-black border-white shadow-sky-400/80 shadow-2xl ring-4 ring-sky-300/80';
      default:
        return 'bg-gradient-to-br from-sky-400 to-indigo-600 text-white font-black border-white shadow-2xl';
    }
  };

  return (
    <GameContainer
      title="Quantum 2048"
      badge="Liquid Puzzle"
      score={score}
      highScore={highScore}
      controlsInfo="Swipe in any direction or use Arrow Keys to slide tiles. When two identical quantum values touch, they merge into one!"
      isGameOver={isGameOver}
      onRestart={handleStart}
      onExit={onExit}
    >
      <div className="flex flex-col items-center justify-center max-w-sm w-full space-y-4">
        {/* Controls Toolbar */}
        <div className="flex items-center justify-between w-full px-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={!prevBoard}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                prevBoard
                  ? 'bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 border-white/[0.1]'
                  : 'bg-white/[0.02] text-slate-600 border-white/[0.04] cursor-not-allowed'
              }`}
            >
              <Undo2 className="w-3.5 h-3.5" />
              Undo
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 border border-white/[0.1] text-xs font-semibold transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Game
            </button>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Join to 2048</span>
        </div>

        {/* 4x4 Liquid Glass Grid Container */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] p-3 rounded-2xl backdrop-blur-2xl bg-[#11141c]/90 border border-white/[0.12] shadow-[0_12px_40px_rgba(0,0,0,0.6)] grid grid-cols-4 grid-rows-4 gap-2.5 select-none touch-none"
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={`relative flex items-center justify-center rounded-xl border font-bold text-lg sm:text-2xl transition-all duration-100 ${getTileStyle(
                  cell
                )}`}
              >
                {cell !== null && (
                  <span className="drop-shadow-sm select-none">{cell}</span>
                )}
              </div>
            ))
          )}

          {/* Game Over Screen */}
          {isGameOver && (
            <div className="absolute inset-0 backdrop-blur-md bg-black/75 rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-3 animate-fadeIn">
              <h2 className="text-2xl font-bold text-white">No Moves Left!</h2>
              <p className="text-xs text-slate-300">
                Score: <span className="font-mono text-emerald-400 font-bold">{score}</span>
              </p>
              <button
                type="button"
                onClick={handleStart}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Play Again
              </button>
            </div>
          )}

          {/* Victory Overlay */}
          {hasWon && (
            <div className="absolute inset-0 backdrop-blur-md bg-blue-950/85 rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-3">
              <Award className="w-10 h-10 text-sky-300" />
              <h2 className="text-2xl font-bold text-white">Quantum 2048!</h2>
              <p className="text-xs text-slate-200">
                You reached the quantum threshold! Continue for high score.
              </p>
              <button
                type="button"
                onClick={() => setHasWon(false)}
                className="px-5 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Keep Playing
              </button>
            </div>
          )}
        </div>
      </div>
    </GameContainer>
  );
};
