import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { soundManager } from '../../utils/audio';
import { Play, RotateCcw, Trophy, Layers } from 'lucide-react';

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: number;
  alive: boolean;
}

export const BreakoutGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('portal_breakout_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [lives, setLives] = useState(3);

  // Game state stored in refs for buttery-smooth 60fps canvas rendering
  const stateRef = useRef({
    paddleX: 180,
    paddleWidth: 90,
    paddleHeight: 12,
    ballX: 220,
    ballY: 340,
    ballVx: 3.5,
    ballVy: -4.5,
    ballRadius: 6,
    bricks: [] as Brick[],
    leftPressed: false,
    rightPressed: false,
  });

  const initBricks = useCallback(() => {
    const rows = 5;
    const cols = 8;
    const brickWidth = 46;
    const brickHeight = 16;
    const padding = 6;
    const offsetTop = 40;
    const offsetLeft = 14;

    const colors = [
      { color: '#ec4899', points: 50 }, // Pink
      { color: '#8b5cf6', points: 40 }, // Violet
      { color: '#3b82f6', points: 30 }, // Blue
      { color: '#06b6d4', points: 20 }, // Cyan
      { color: '#f59e0b', points: 10 }, // Amber
    ];

    const bricks: Brick[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: c * (brickWidth + padding) + offsetLeft,
          y: r * (brickHeight + padding) + offsetTop,
          width: brickWidth,
          height: brickHeight,
          color: colors[r].color,
          points: colors[r].points,
          alive: true,
        });
      }
    }
    return bricks;
  }, []);

  const handleStart = () => {
    stateRef.current.paddleX = 175;
    stateRef.current.ballX = 220;
    stateRef.current.ballY = 320;
    stateRef.current.ballVx = 3.5 * (Math.random() > 0.5 ? 1 : -1);
    stateRef.current.ballVy = -4.5;
    stateRef.current.bricks = initBricks();
    setScore(0);
    setLives(3);
    setIsGameOver(false);
    setIsVictory(false);
    setIsPlaying(true);
    soundManager.playScore();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.leftPressed = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.rightPressed = true;
      }
      if (e.key === ' ' && (!isPlaying || isGameOver || isVictory)) {
        e.preventDefault();
        handleStart();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.leftPressed = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.rightPressed = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isGameOver, isVictory]);

  // Touch and mouse drag paddle control
  const handlePointerMove = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const scale = canvas.width / rect.width;
    const canvasX = relativeX * scale;
    const newPaddleX = Math.max(
      0,
      Math.min(canvas.width - stateRef.current.paddleWidth, canvasX - stateRef.current.paddleWidth / 2)
    );
    stateRef.current.paddleX = newPaddleX;
  };

  // Main 60fps Game Loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const s = stateRef.current;

      // Clear Canvas
      ctx.fillStyle = '#0b0e14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      if (isPlaying && !isGameOver && !isVictory) {
        // Paddle movement via keys
        if (s.leftPressed) {
          s.paddleX = Math.max(0, s.paddleX - 6);
        }
        if (s.rightPressed) {
          s.paddleX = Math.min(canvas.width - s.paddleWidth, s.paddleX + 6);
        }

        // Ball movement
        s.ballX += s.ballVx;
        s.ballY += s.ballVy;

        // Wall collisions
        if (s.ballX - s.ballRadius <= 0) {
          s.ballX = s.ballRadius;
          s.ballVx = Math.abs(s.ballVx);
          soundManager.playBounce(1.2);
        } else if (s.ballX + s.ballRadius >= canvas.width) {
          s.ballX = canvas.width - s.ballRadius;
          s.ballVx = -Math.abs(s.ballVx);
          soundManager.playBounce(1.2);
        }

        if (s.ballY - s.ballRadius <= 0) {
          s.ballY = s.ballRadius;
          s.ballVy = Math.abs(s.ballVy);
          soundManager.playBounce(1.4);
        }

        // Paddle collision
        const paddleY = canvas.height - 35;
        if (
          s.ballY + s.ballRadius >= paddleY &&
          s.ballY - s.ballRadius <= paddleY + s.paddleHeight &&
          s.ballX >= s.paddleX &&
          s.ballX <= s.paddleX + s.paddleWidth
        ) {
          // Add spin based on where ball hits paddle
          const hitOffset = (s.ballX - (s.paddleX + s.paddleWidth / 2)) / (s.paddleWidth / 2);
          s.ballVx = hitOffset * 5.5;
          s.ballVy = -Math.abs(s.ballVy);
          soundManager.playBounce(1.0);
        }

        // Brick collision
        let aliveCount = 0;
        for (const brick of s.bricks) {
          if (!brick.alive) continue;
          aliveCount++;

          if (
            s.ballX + s.ballRadius > brick.x &&
            s.ballX - s.ballRadius < brick.x + brick.width &&
            s.ballY + s.ballRadius > brick.y &&
            s.ballY - s.ballRadius < brick.y + brick.height
          ) {
            brick.alive = false;
            s.ballVy = -s.ballVy;
            soundManager.playBreak();

            setScore((prev) => {
              const next = prev + brick.points;
              if (next > highScore) {
                setHighScore(next);
                try {
                  localStorage.setItem('portal_breakout_highscore', next.toString());
                } catch {
                  // Ignore
                }
              }
              return next;
            });
            break;
          }
        }

        // Check victory
        if (aliveCount === 0) {
          setIsVictory(true);
          setIsPlaying(false);
          soundManager.playScore();
        }

        // Bottom pit fall
        if (s.ballY + s.ballRadius > canvas.height) {
          setLives((l) => {
            const next = l - 1;
            if (next <= 0) {
              setIsGameOver(true);
              setIsPlaying(false);
              soundManager.playGameOver();
            } else {
              // Reset ball on paddle
              s.ballX = s.paddleX + s.paddleWidth / 2;
              s.ballY = paddleY - 15;
              s.ballVx = 3.5 * (Math.random() > 0.5 ? 1 : -1);
              s.ballVy = -4.5;
              soundManager.playBounce(0.8);
            }
            return next;
          });
        }
      }

      // Render Bricks with Liquid Glass Glow
      for (const brick of s.bricks) {
        if (!brick.alive) continue;
        ctx.save();
        ctx.shadowColor = brick.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = brick.color;
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
        ctx.fill();

        // Inner specular reflection line
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(brick.x + 2, brick.y + 2, brick.width - 4, 2);
        ctx.restore();
      }

      // Render Paddle
      const paddleY = canvas.height - 35;
      ctx.save();
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(s.paddleX, paddleY, s.paddleWidth, s.paddleHeight, 6);
      ctx.fill();

      // Top specular highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(s.paddleX + 4, paddleY + 1, s.paddleWidth - 8, 2);
      ctx.restore();

      // Render Ball
      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, s.ballRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, isVictory, highScore]);

  return (
    <GameContainer
      title="Liquid Breakout"
      badge="Action Physics"
      score={score}
      highScore={highScore}
      controlsInfo="Drag the paddle with your finger or mouse, or use Arrow Left/Right. Angle your bounces using paddle velocity. Clear all frosted bricks."
      isGameOver={isGameOver}
      onRestart={handleStart}
      onExit={onExit}
    >
      <div className="flex flex-col items-center justify-center max-w-lg w-full space-y-3">
        {/* Lives Counter Bar */}
        <div className="flex items-center justify-between w-[320px] sm:w-[440px] px-3 py-1.5 rounded-xl backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] text-xs">
          <span className="text-slate-400 font-medium">Lives Remaining:</span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((l) => (
              <div
                key={l}
                className={`w-3 h-3 rounded-full transition-all ${
                  l <= lives
                    ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Canvas Screen */}
        <div
          className="relative rounded-2xl overflow-hidden border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl bg-[#0b0e14] touch-none"
          onMouseMove={(e) => handlePointerMove(e.clientX)}
          onTouchMove={(e) => {
            if (e.touches.length > 0) handlePointerMove(e.touches[0].clientX);
          }}
        >
          <canvas
            ref={canvasRef}
            width={440}
            height={440}
            className="w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] block cursor-pointer"
          />

          {/* Start Screen Overlay */}
          {!isPlaying && !isGameOver && !isVictory && (
            <div className="absolute inset-0 backdrop-blur-md bg-black/60 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.3)]">
                <Layers className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">Liquid Breakout</h2>
                <p className="text-xs text-slate-300 max-w-xs">
                  Shatter all frosted quantum bricks with fluid paddle spin physics.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Launch Ball
              </button>
            </div>
          )}

          {/* Game Over Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 backdrop-blur-lg bg-black/75 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_24px_rgba(244,63,94,0.3)]">
                <RotateCcw className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">Ball Depleted</h2>
                <p className="text-xs text-slate-300">
                  Final Score: <span className="font-mono text-cyan-400 font-bold text-sm">{score}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Try Again
              </button>
            </div>
          )}

          {/* Victory Overlay */}
          {isVictory && (
            <div className="absolute inset-0 backdrop-blur-lg bg-blue-950/85 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.3)]">
                <Trophy className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">Stage Cleared!</h2>
                <p className="text-xs text-slate-300">
                  Brilliant play! Score: <span className="font-mono text-sky-400 font-bold text-sm">{score}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Play Next Match
              </button>
            </div>
          )}
        </div>
      </div>
    </GameContainer>
  );
};
