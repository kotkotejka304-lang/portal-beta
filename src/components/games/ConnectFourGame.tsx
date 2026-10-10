import React, { useState, useEffect, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { soundManager } from '../../utils/audio';
import { RotateCcw, Bot, Users, Trophy } from 'lucide-react';

type CellValue = 0 | 1 | 2; // 0 = empty, 1 = Player 1 (Blue), 2 = Player 2/AI (Coral)

const ROWS = 6;
const COLS = 7;

export const ConnectFourGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [board, setBoard] = useState<CellValue[][]>(() =>
    Array(ROWS)
      .fill(0)
      .map(() => Array(COLS).fill(0))
  );
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [vsAI, setVsAI] = useState(true);
  const [winner, setWinner] = useState<0 | 1 | 2 | 'draw'>(0);
  const [winningCells, setWinningCells] = useState<{ r: number; c: number }[]>([]);
  const [p1Wins, setP1Wins] = useState(0);
  const [p2Wins, setP2Wins] = useState(0);

  const resetGame = useCallback(() => {
    setBoard(
      Array(ROWS)
        .fill(0)
        .map(() => Array(COLS).fill(0))
    );
    setCurrentPlayer(1);
    setWinner(0);
    setWinningCells([]);
  }, []);

  // Check 4 in a row
  const checkWin = (b: CellValue[][]): { winner: 1 | 2 | 'draw' | 0; cells: { r: number; c: number }[] } => {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const val = b[r][c];
        if (val !== 0 && val === b[r][c + 1] && val === b[r][c + 2] && val === b[r][c + 3]) {
          return {
            winner: val,
            cells: [
              { r, c },
              { r, c: c + 1 },
              { r, c: c + 2 },
              { r, c: c + 3 },
            ],
          };
        }
      }
    }

    // Vertical
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c < COLS; c++) {
        const val = b[r][c];
        if (val !== 0 && val === b[r + 1][c] && val === b[r + 2][c] && val === b[r + 3][c]) {
          return {
            winner: val,
            cells: [
              { r, c },
              { r: r + 1, c },
              { r: r + 2, c },
              { r: r + 3, c },
            ],
          };
        }
      }
    }

    // Diagonal down-right
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const val = b[r][c];
        if (val !== 0 && val === b[r + 1][c + 1] && val === b[r + 2][c + 2] && val === b[r + 3][c + 3]) {
          return {
            winner: val,
            cells: [
              { r, c },
              { r: r + 1, c: c + 1 },
              { r: r + 2, c: c + 2 },
              { r: r + 3, c: c + 3 },
            ],
          };
        }
      }
    }

    // Diagonal up-right
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const val = b[r][c];
        if (val !== 0 && val === b[r - 1][c + 1] && val === b[r - 2][c + 2] && val === b[r - 3][c + 3]) {
          return {
            winner: val,
            cells: [
              { r, c },
              { r: r - 1, c: c + 1 },
              { r: r - 2, c: c + 2 },
              { r: r - 3, c: c + 3 },
            ],
          };
        }
      }
    }

    // Check draw
    const isFull = b.every((row) => row.every((c) => c !== 0));
    if (isFull) return { winner: 'draw', cells: [] };

    return { winner: 0, cells: [] };
  };

  const dropChip = useCallback(
    (col: number, player: 1 | 2) => {
      if (winner !== 0) return false;

      // Find lowest empty slot in column
      let targetRow = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
          targetRow = r;
          break;
        }
      }

      if (targetRow === -1) return false; // Column is full

      soundManager.playBounce(player === 1 ? 1.0 : 0.8);
      const nextBoard = board.map((row) => [...row]);
      nextBoard[targetRow][col] = player;
      setBoard(nextBoard);

      const check = checkWin(nextBoard);
      if (check.winner !== 0) {
        setWinner(check.winner);
        setWinningCells(check.cells);
        if (check.winner === 1) {
          soundManager.playScore();
          setP1Wins((w) => w + 1);
        } else if (check.winner === 2) {
          soundManager.playGameOver();
          setP2Wins((w) => w + 1);
        }
      } else {
        setCurrentPlayer(player === 1 ? 2 : 1);
      }
      return true;
    },
    [board, winner]
  );

  // AI Turn (Quantum Bot)
  useEffect(() => {
    if (vsAI && currentPlayer === 2 && winner === 0) {
      const timer = setTimeout(() => {
        // AI Strategy: 1. Win if possible, 2. Block P1 from winning, 3. Center preference, 4. Random
        const validCols: number[] = [];
        for (let c = 0; c < COLS; c++) {
          if (board[0][c] === 0) validCols.push(c);
        }
        if (validCols.length === 0) return;

        // Try win
        for (const c of validCols) {
          const temp = board.map((r) => [...r]);
          for (let r = ROWS - 1; r >= 0; r--) {
            if (temp[r][c] === 0) {
              temp[r][c] = 2;
              break;
            }
          }
          if (checkWin(temp).winner === 2) {
            dropChip(c, 2);
            return;
          }
        }

        // Try block P1
        for (const c of validCols) {
          const temp = board.map((r) => [...r]);
          for (let r = ROWS - 1; r >= 0; r--) {
            if (temp[r][c] === 0) {
              temp[r][c] = 1;
              break;
            }
          }
          if (checkWin(temp).winner === 1) {
            dropChip(c, 2);
            return;
          }
        }

        // Center bias
        const preferred = [3, 2, 4, 1, 5, 0, 6];
        const chosen = preferred.find((col) => validCols.includes(col)) ?? validCols[0];
        dropChip(chosen, 2);
      }, 450);

      return () => clearTimeout(timer);
    }
  }, [vsAI, currentPlayer, winner, board, dropChip]);

  return (
    <GameContainer
      title="Quantum Four"
      badge="2-Player Strategy"
      score={p1Wins * 100}
      highScore={p1Wins * 100}
      controlsInfo="Tap any of the 7 columns to drop your quantum chip. Connect 4 matching chips horizontally, vertically, or diagonally."
      isGameOver={winner !== 0}
      onRestart={resetGame}
      onExit={onExit}
    >
      <div className="flex flex-col items-center justify-center max-w-md w-full space-y-4">
        {/* Match Header Bar */}
        <div className="flex items-center justify-between w-full px-4 py-2 rounded-2xl glass-panel text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setVsAI(!vsAI);
                resetGame();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-[var(--border-glass)] text-xs font-semibold text-[var(--text-primary)] transition-all cursor-pointer min-h-[36px]"
            >
              {vsAI ? <Bot className="w-3.5 h-3.5 text-sky-400" /> : <Users className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{vsAI ? 'vs Quantum AI' : 'Pass & Play'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              Blue: {p1Wins}
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
              {vsAI ? 'AI' : 'P2'}: {p2Wins}
            </span>
          </div>
        </div>

        {/* Connect Four Vertical Board */}
        <div className="relative p-3 rounded-3xl glass-panel shadow-2xl border border-sky-500/30">
          <div className="grid grid-cols-7 gap-2 sm:gap-2.5 p-2 bg-[#090f1d]/80 rounded-2xl">
            {Array.from({ length: COLS }).map((_, colIdx) => (
              <button
                key={`col-${colIdx}`}
                type="button"
                onClick={() => {
                  if (!vsAI || currentPlayer === 1) {
                    dropChip(colIdx, currentPlayer);
                  }
                }}
                disabled={winner !== 0 || (vsAI && currentPlayer === 2)}
                className="flex flex-col gap-2 sm:gap-2.5 cursor-pointer group focus:outline-none p-1 rounded-xl hover:bg-white/[0.04] transition-colors"
                title={`Drop chip in Column ${colIdx + 1}`}
              >
                {Array.from({ length: ROWS }).map((_, rowIdx) => {
                  const val = board[rowIdx][colIdx];
                  const isWinningChip = winningCells.some((c) => c.r === rowIdx && c.c === colIdx);

                  return (
                    <div
                      key={`cell-${rowIdx}-${colIdx}`}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border transition-all duration-200 flex items-center justify-center ${
                        val === 1
                          ? `bg-sky-400 border-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.7)] ${
                              isWinningChip ? 'ring-4 ring-white animate-pulse' : ''
                            }`
                          : val === 2
                          ? `bg-rose-500 border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.7)] ${
                              isWinningChip ? 'ring-4 ring-white animate-pulse' : ''
                            }`
                          : 'bg-black/40 border-white/[0.08] shadow-inner'
                      }`}
                    >
                      {/* Specular inner highlight */}
                      {val !== 0 && (
                        <div className="w-3 h-3 rounded-full bg-white/40 -translate-y-1 -translate-x-1" />
                      )}
                    </div>
                  );
                })}
              </button>
            ))}
          </div>

          {/* Winner Overlay */}
          {winner !== 0 && (
            <div className="absolute inset-0 backdrop-blur-md bg-black/75 rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-3 animate-fadeIn">
              <Trophy className="w-12 h-12 text-amber-300" />
              <h2 className="text-xl font-bold text-white">
                {winner === 1 ? 'Blue Victorious!' : winner === 2 ? (vsAI ? 'Quantum Bot Won!' : 'Red Victorious!') : 'Stalemate Draw!'}
              </h2>
              <button
                type="button"
                onClick={resetGame}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Next Match
              </button>
            </div>
          )}
        </div>
      </div>
    </GameContainer>
  );
};
