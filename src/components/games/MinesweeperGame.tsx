import React, { useState, useEffect, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { soundManager } from '../../utils/audio';
import { Flag, Eye, Play, RotateCcw, Trophy, ShieldAlert, Sparkles } from 'lucide-react';

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
  neighborMines: number;
}

export const MinesweeperGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [gridSize, setGridSize] = useState<8 | 10>(8);
  const totalMines = gridSize === 8 ? 10 : 16;

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [flagMode, setFlagMode] = useState(false); // iPad touch friendly flag toggle
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('portal_minesweeper_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });

  const initGrid = useCallback(() => {
    const size = gridSize;
    const newGrid: Cell[][] = [];

    // Create empty grid
    for (let r = 0; r < size; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < size; c++) {
        row.push({
          r,
          c,
          isMine: false,
          revealed: false,
          flagged: false,
          neighborMines: 0,
        });
      }
      newGrid.push(row);
    }

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < totalMines) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mine numbers
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < size && nc >= 0 && nc < size && newGrid[nr][nc].isMine) {
                count++;
              }
            }
          }
          newGrid[r][c].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
    setIsGameOver(false);
    setHasWon(false);
    setSeconds(0);
    setScore(0);
    setIsPlaying(true);
  }, [gridSize, totalMines]);

  useEffect(() => {
    initGrid();
  }, [initGrid]);

  // Timer
  useEffect(() => {
    if (!isPlaying || isGameOver || hasWon) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, hasWon]);

  // Reveal Cell and automatic flood fill for zero neighbors
  const revealCell = (r: number, c: number) => {
    if (!isPlaying || isGameOver || hasWon) return;

    setGrid((prevGrid) => {
      const cell = prevGrid[r][c];
      if (cell.revealed || cell.flagged) return prevGrid;

      // Mine hit!
      if (cell.isMine) {
        soundManager.playGameOver();
        setIsGameOver(true);
        setIsPlaying(false);

        // Reveal all mines
        return prevGrid.map((row) =>
          row.map((cl) => (cl.isMine ? { ...cl, revealed: true } : cl))
        );
      }

      // Safe reveal
      soundManager.playBounce(1.2);
      const nextGrid = prevGrid.map((row) => row.map((cl) => ({ ...cl })));

      const flood = (cr: number, cc: number) => {
        if (cr < 0 || cr >= gridSize || cc < 0 || cc >= gridSize) return;
        const target = nextGrid[cr][cc];
        if (target.revealed || target.flagged || target.isMine) return;

        target.revealed = true;

        if (target.neighborMines === 0) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr !== 0 || dc !== 0) {
                flood(cr + dr, cc + dc);
              }
            }
          }
        }
      };

      flood(r, c);

      // Check win condition: all non-mine cells revealed
      let unrevealedSafe = 0;
      let revealedCount = 0;
      nextGrid.forEach((row) =>
        row.forEach((cl) => {
          if (!cl.isMine && !cl.revealed) unrevealedSafe++;
          if (cl.revealed && !cl.isMine) revealedCount++;
        })
      );

      const calculatedScore = revealedCount * 15;
      setScore(calculatedScore);

      if (unrevealedSafe === 0) {
        setHasWon(true);
        setIsPlaying(false);
        soundManager.playScore();

        const finalScore = calculatedScore + Math.max(0, 500 - seconds * 5);
        setScore(finalScore);
        if (finalScore > highScore) {
          setHighScore(finalScore);
          try {
            localStorage.setItem('portal_minesweeper_highscore', finalScore.toString());
          } catch {
            // Ignore
          }
        }
      }

      return nextGrid;
    });
  };

  const toggleFlag = (r: number, c: number, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!isPlaying || isGameOver || hasWon) return;

    setGrid((prevGrid) => {
      const cell = prevGrid[r][c];
      if (cell.revealed) return prevGrid;

      soundManager.playBounce(0.8);
      return prevGrid.map((row, rowIdx) =>
        row.map((cl, colIdx) =>
          rowIdx === r && colIdx === c ? { ...cl, flagged: !cl.flagged } : cl
        )
      );
    });
  };

  const handleCellClick = (r: number, c: number) => {
    if (flagMode) {
      toggleFlag(r, c);
    } else {
      revealCell(r, c);
    }
  };

  const flagsPlaced = grid.reduce(
    (sum, row) => sum + row.filter((cell) => cell.flagged).length,
    0
  );

  return (
    <GameContainer
      title="Neon Minesweeper"
      badge="Logic Strategy"
      score={score}
      highScore={highScore}
      controlsInfo="Tap to reveal cells. Toggle Flag Mode or right-click to mark potential mines. Reveal all safe cells to clear the minefield."
      isGameOver={isGameOver}
      onRestart={initGrid}
      onExit={onExit}
    >
      <div className="flex flex-col items-center justify-center max-w-lg w-full space-y-4">
        {/* Minesweeper HUD Bar */}
        <div className="flex items-center justify-between w-full max-w-[360px] sm:max-w-[420px] px-4 py-2.5 rounded-2xl glass-panel shadow-md text-xs">
          <div className="flex items-center gap-1.5 text-sky-400 font-semibold font-mono">
            <Flag className="w-4 h-4 text-sky-400" />
            <span>Mines: {totalMines - flagsPlaced}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setGridSize(gridSize === 8 ? 10 : 8);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-[var(--border-glass)] text-[11px] font-semibold text-[var(--text-primary)] transition-all cursor-pointer"
            >
              {gridSize}x{gridSize}
            </button>

            {/* iPad Touch Flag / Reveal Mode Switcher */}
            <button
              type="button"
              onClick={() => setFlagMode(!flagMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all active:scale-95 cursor-pointer min-h-[38px] ${
                flagMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/50'
              }`}
              title="Toggle Tap Mode"
            >
              {flagMode ? <Flag className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{flagMode ? 'Flag Mode' : 'Reveal Mode'}</span>
            </button>
          </div>

          <div className="font-mono text-[var(--text-secondary)] font-bold text-xs">
            ⏱ {seconds}s
          </div>
        </div>

        {/* Minesweeper Glass Grid Surface */}
        <div className="relative p-3 rounded-3xl glass-panel shadow-2xl border border-[var(--border-glass)]">
          <div
            className="grid gap-1.5 select-none touch-manipulation"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const getNumberColor = (num: number) => {
                  switch (num) {
                    case 1:
                      return 'text-sky-400';
                    case 2:
                      return 'text-cyan-400';
                    case 3:
                      return 'text-amber-400';
                    case 4:
                      return 'text-indigo-400';
                    default:
                      return 'text-rose-400';
                  }
                };

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleCellClick(r, c)}
                    onContextMenu={(e) => toggleFlag(r, c, e)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black font-mono text-sm sm:text-base transition-all duration-150 cursor-pointer active:scale-95 border ${
                      cell.revealed
                        ? cell.isMine
                          ? 'bg-rose-500/30 border-rose-500/60 text-rose-300'
                          : 'bg-white/[0.04] border-white/[0.06] text-[var(--text-primary)] shadow-inner'
                        : cell.flagged
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm'
                        : 'bg-white/[0.08] hover:bg-white/[0.16] border-[var(--border-glass)] text-transparent shadow-md'
                    }`}
                  >
                    {cell.revealed ? (
                      cell.isMine ? (
                        '💣'
                      ) : cell.neighborMines > 0 ? (
                        <span className={getNumberColor(cell.neighborMines)}>
                          {cell.neighborMines}
                        </span>
                      ) : (
                        ''
                      )
                    ) : cell.flagged ? (
                      '🚩'
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

          {/* Game Over Screen */}
          {isGameOver && (
            <div className="absolute inset-0 backdrop-blur-md bg-black/75 rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-3 animate-fadeIn">
              <ShieldAlert className="w-12 h-12 text-rose-400" />
              <h2 className="text-xl font-bold text-white">Detonation Triggered!</h2>
              <p className="text-xs text-slate-300">A hidden mine was triggered.</p>
              <button
                type="button"
                onClick={initGrid}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Victory Screen */}
          {hasWon && (
            <div className="absolute inset-0 backdrop-blur-md bg-blue-950/85 rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-3 animate-fadeIn">
              <Trophy className="w-12 h-12 text-amber-300" />
              <h2 className="text-xl font-bold text-white">Minefield Cleared!</h2>
              <p className="text-xs text-slate-200">
                Cleared in {seconds} seconds. Score: <span className="font-mono text-sky-400 font-bold">{score}</span>
              </p>
              <button
                type="button"
                onClick={initGrid}
                className="px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Play Next Grid
              </button>
            </div>
          )}
        </div>
      </div>
    </GameContainer>
  );
};
