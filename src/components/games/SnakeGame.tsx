import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { soundManager } from '../../utils/audio';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, RotateCcw, Trophy, Zap } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

const GRID_SIZE = 22;
const INITIAL_SPEED = 110; // ms per tick

export const SnakeGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 });
  const [nextDirection, setNextDirection] = useState<Point>({ x: 0, y: -1 });
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [bonusFood, setBonusFood] = useState<Point | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('portal_snake_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [particles, setParticles] = useState<{ x: number; y: number; color: string; life: number }[]>([]);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate random food not on snake
  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    let isOnSnake = true;
    while (isOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isOnSnake = currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y);
    }
    return newFood!;
  }, []);

  const handleStart = () => {
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initialSnake);
    setDirection({ x: 0, y: -1 });
    setNextDirection({ x: 0, y: -1 });
    setFood(generateFood(initialSnake));
    setBonusFood(null);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsGameOver(false);
    setIsPlaying(true);
    soundManager.playScore();
  };

  // Direction changes with reverse check
  const changeDirection = useCallback(
    (newDir: Point) => {
      if (!isPlaying || isGameOver) return;
      // Prevent 180-degree instant reversal
      if (direction.x + newDir.x === 0 && direction.y + newDir.y === 0) return;
      setNextDirection(newDir);
    },
    [direction, isPlaying, isGameOver]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection({ x: 1, y: 0 });
          break;
        case ' ':
          e.preventDefault();
          if (!isPlaying || isGameOver) handleStart();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, isPlaying, isGameOver]);

  // Main game tick
  useEffect(() => {
    if (!isPlaying || isGameOver) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    gameLoopRef.current = setInterval(() => {
      setSnake((prevSnake) => {
        setDirection(nextDirection);
        const head = prevSnake[0];
        const newHead: Point = {
          x: head.x + nextDirection.x,
          y: head.y + nextDirection.y,
        };

        // Wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setIsGameOver(true);
          setIsPlaying(false);
          soundManager.playGameOver();
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setIsGameOver(true);
          setIsPlaying(false);
          soundManager.playGameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Regular food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          soundManager.playEat();
          setScore((s) => {
            const next = s + 10;
            if (next > highScore) {
              setHighScore(next);
              try {
                localStorage.setItem('portal_snake_highscore', next.toString());
              } catch {
                // Ignore
              }
            }
            return next;
          });

          // Spawn particles
          setParticles((p) => [
            ...p,
            { x: food.x, y: food.y, color: '#38bdf8', life: 10 },
            { x: food.x, y: food.y, color: '#0ea5e9', life: 8 },
            { x: food.x, y: food.y, color: '#7dd3fc', life: 6 },
          ]);

          setFood(generateFood(newSnake));

          // Occasional bonus food spawn (20% chance)
          if (Math.random() < 0.25 && !bonusFood) {
            setBonusFood(generateFood(newSnake));
          }

          // Progressive speedup
          setSpeed((sp) => Math.max(60, sp - 1.5));
        } else if (bonusFood && newHead.x === bonusFood.x && newHead.y === bonusFood.y) {
          // Bonus food eaten!
          soundManager.playScore();
          setScore((s) => {
            const next = s + 35;
            if (next > highScore) {
              setHighScore(next);
              try {
                localStorage.setItem('portal_snake_highscore', next.toString());
              } catch {
                // Ignore
              }
            }
            return next;
          });
          setBonusFood(null);
        } else {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });

      // Update particle decay
      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, life: p.life - 1 }))
          .filter((p) => p.life > 0)
      );
    }, speed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, isGameOver, nextDirection, food, bonusFood, speed, highScore, generateFood]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / GRID_SIZE;

    // Clear board with dark background
    ctx.fillStyle = '#0b0e14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle neon grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Render food with glow
    ctx.save();
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 2.6,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    // Render bonus food if active
    if (bonusFood) {
      ctx.save();
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(
        bonusFood.x * cellSize + cellSize / 2,
        bonusFood.y * cellSize + cellSize / 2,
        cellSize / 2.2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }

    // Render snake
    snake.forEach((segment, index) => {
      ctx.save();
      const isHead = index === 0;

      if (isHead) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#38bdf8';
      } else {
        // Gradient fade towards tail
        const ratio = 1 - (index / snake.length) * 0.5;
        ctx.fillStyle = `rgba(14, 165, 233, ${ratio})`;
      }

      const padding = 2;
      const x = segment.x * cellSize + padding;
      const y = segment.y * cellSize + padding;
      const size = cellSize - padding * 2;
      const radius = isHead ? 6 : 4;

      ctx.beginPath();
      ctx.roundRect(x, y, size, size, radius);
      ctx.fill();

      // Eyes on head
      if (isHead) {
        ctx.fillStyle = '#0f172a';
        const eyeOffset = cellSize / 3.5;
        const eyeSize = 2.5;
        ctx.beginPath();
        ctx.arc(x + eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.arc(x + size - eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    // Render particles
    particles.forEach((p) => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / 10;
      ctx.beginPath();
      ctx.arc(
        p.x * cellSize + cellSize / 2 + (Math.random() - 0.5) * cellSize,
        p.y * cellSize + cellSize / 2 + (Math.random() - 0.5) * cellSize,
        (p.life / 10) * 3,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    });
  }, [snake, food, bonusFood, particles]);

  return (
    <GameContainer
      title="Cyber Snake"
      badge="Instant Play"
      score={score}
      highScore={highScore}
      controlsInfo="Navigate with Arrow Keys or WASD. On touch devices, use the on-screen D-Pad. Eat neon orbs to grow. Avoid walls and self-collision."
      isGameOver={isGameOver}
      onRestart={handleStart}
      onExit={onExit}
    >
      <div className="flex flex-col items-center justify-center max-w-lg w-full space-y-4">
        {/* Canvas Game Surface */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl bg-[#0f131c]">
          <canvas
            ref={canvasRef}
            width={440}
            height={440}
            className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] block"
          />

          {/* Start Screen Overlay */}
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 backdrop-blur-md bg-black/60 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.3)]">
                <Zap className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">Cyber Snake</h2>
                <p className="text-xs text-slate-300 max-w-xs">
                  Guide the cyber serpent, harvest plasma nodes, and shatter the high score.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Game
              </button>
            </div>
          )}

          {/* Game Over Liquid Glass Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 backdrop-blur-lg bg-black/75 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_24px_rgba(244,63,94,0.3)]">
                <Trophy className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-semibold text-rose-400 uppercase tracking-widest">
                  Signal Lost
                </span>
                <h2 className="text-2xl font-bold text-white">Game Over</h2>
                <p className="text-xs text-slate-300">
                  Final Score: <span className="font-mono text-sky-400 font-bold text-sm">{score}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleStart}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Play Again
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 text-xs font-semibold transition-all border border-white/[0.1]"
                >
                  Exit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Touch D-Pad for iPad & Mobile */}
        <div className="flex flex-col items-center gap-1.5 pt-1 select-none">
          <button
            type="button"
            onClick={() => changeDirection({ x: 0, y: -1 })}
            className="w-12 h-11 rounded-xl backdrop-blur-xl bg-white/[0.08] hover:bg-white/[0.16] active:bg-sky-500/30 border border-white/[0.12] flex items-center justify-center text-slate-200 active:scale-95 transition-all shadow-md"
            aria-label="Up"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => changeDirection({ x: -1, y: 0 })}
              className="w-12 h-11 rounded-xl backdrop-blur-xl bg-white/[0.08] hover:bg-white/[0.16] active:bg-sky-500/30 border border-white/[0.12] flex items-center justify-center text-slate-200 active:scale-95 transition-all shadow-md"
              aria-label="Left"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => changeDirection({ x: 0, y: 1 })}
              className="w-12 h-11 rounded-xl backdrop-blur-xl bg-white/[0.08] hover:bg-white/[0.16] active:bg-sky-500/30 border border-white/[0.12] flex items-center justify-center text-slate-200 active:scale-95 transition-all shadow-md"
              aria-label="Down"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => changeDirection({ x: 1, y: 0 })}
              className="w-12 h-11 rounded-xl backdrop-blur-xl bg-white/[0.08] hover:bg-white/[0.16] active:bg-sky-500/30 border border-white/[0.12] flex items-center justify-center text-slate-200 active:scale-95 transition-all shadow-md"
              aria-label="Right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </GameContainer>
  );
};
