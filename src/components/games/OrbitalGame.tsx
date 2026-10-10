import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameContainer } from './GameContainer';
import { soundManager } from '../../utils/audio';
import { Play, RotateCcw, RotateCw, Crosshair, ChevronUp } from 'lucide-react';

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  points: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

export const OrbitalGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('portal_orbital_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [shields, setShields] = useState(3);

  const stateRef = useRef({
    shipX: 200,
    shipY: 200,
    angle: -Math.PI / 2,
    vx: 0,
    vy: 0,
    rotSpeed: 0,
    isThrusting: false,
    bullets: [] as Bullet[],
    asteroids: [] as Asteroid[],
    particles: [] as Particle[],
  });

  const spawnAsteroid = useCallback((x?: number, y?: number, radius = 24): Asteroid => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.0 + Math.random() * 1.5;
    return {
      x: x !== undefined ? x : Math.random() > 0.5 ? 0 : 400,
      y: y !== undefined ? y : Math.random() * 400,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius,
      points: radius > 18 ? 20 : 50,
    };
  }, []);

  const handleStart = useCallback(() => {
    stateRef.current.shipX = 200;
    stateRef.current.shipY = 200;
    stateRef.current.angle = -Math.PI / 2;
    stateRef.current.vx = 0;
    stateRef.current.vy = 0;
    stateRef.current.bullets = [];
    stateRef.current.particles = [];

    const initialAsteroids: Asteroid[] = [];
    for (let i = 0; i < 4; i++) {
      initialAsteroids.push(spawnAsteroid(Math.random() < 0.5 ? 30 : 370, Math.random() * 380));
    }
    stateRef.current.asteroids = initialAsteroids;

    setScore(0);
    setShields(3);
    setIsGameOver(false);
    setIsPlaying(true);
    soundManager.playScore();
  }, [spawnAsteroid]);

  const fireLaser = useCallback(() => {
    if (!isPlaying || isGameOver) return;
    const s = stateRef.current;
    const speed = 7.5;
    s.bullets.push({
      x: s.shipX + Math.cos(s.angle) * 12,
      y: s.shipY + Math.sin(s.angle) * 12,
      vx: Math.cos(s.angle) * speed + s.vx * 0.4,
      vy: Math.sin(s.angle) * speed + s.vy * 0.4,
      life: 45,
    });
    soundManager.playLaser();
  }, [isPlaying, isGameOver]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        s.rotSpeed = -0.09;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        s.rotSpeed = 0.09;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        s.isThrusting = true;
      }
      if (e.key === ' ') {
        e.preventDefault();
        if (!isPlaying || isGameOver) {
          handleStart();
        } else {
          fireLaser();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (
        (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') &&
        s.rotSpeed < 0
      ) {
        s.rotSpeed = 0;
      }
      if (
        (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') &&
        s.rotSpeed > 0
      ) {
        s.rotSpeed = 0;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        s.isThrusting = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isGameOver, handleStart, fireLaser]);

  // 60FPS Game Loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const s = stateRef.current;

      // Clear Canvas
      ctx.fillStyle = '#080a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 20; i++) {
        const sx = (i * 97) % canvas.width;
        const sy = (i * 123) % canvas.height;
        ctx.fillRect(sx, sy, 1, 1);
      }

      if (isPlaying && !isGameOver) {
        // Ship Rotation
        s.angle += s.rotSpeed;

        // Thrust
        if (s.isThrusting) {
          s.vx += Math.cos(s.angle) * 0.15;
          s.vy += Math.sin(s.angle) * 0.15;

          // Exhaust particles
          s.particles.push({
            x: s.shipX - Math.cos(s.angle) * 10,
            y: s.shipY - Math.sin(s.angle) * 10,
            vx: -Math.cos(s.angle) * 2 + (Math.random() - 0.5),
            vy: -Math.sin(s.angle) * 2 + (Math.random() - 0.5),
            color: '#38bdf8',
            life: 14,
          });
        }

        // Drag/Friction
        s.vx *= 0.985;
        s.vy *= 0.985;
        s.shipX += s.vx;
        s.shipY += s.vy;

        // Screen wrap for ship
        if (s.shipX < 0) s.shipX = canvas.width;
        if (s.shipX > canvas.width) s.shipX = 0;
        if (s.shipY < 0) s.shipY = canvas.height;
        if (s.shipY > canvas.height) s.shipY = 0;

        // Update Bullets
        s.bullets.forEach((b) => {
          b.x += b.vx;
          b.y += b.vy;
          b.life -= 1;
          if (b.x < 0) b.x = canvas.width;
          if (b.x > canvas.width) b.x = 0;
          if (b.y < 0) b.y = canvas.height;
          if (b.y > canvas.height) b.y = 0;
        });
        s.bullets = s.bullets.filter((b) => b.life > 0);

        // Update Asteroids & check bullet hits
        const nextAsteroids: Asteroid[] = [];
        for (const ast of s.asteroids) {
          ast.x += ast.vx;
          ast.y += ast.vy;
          if (ast.x < -20) ast.x = canvas.width + 20;
          if (ast.x > canvas.width + 20) ast.x = -20;
          if (ast.y < -20) ast.y = canvas.height + 20;
          if (ast.y > canvas.height + 20) ast.y = -20;

          let hitByBullet = false;
          for (let bIdx = 0; bIdx < s.bullets.length; bIdx++) {
            const b = s.bullets[bIdx];
            const dist = Math.hypot(b.x - ast.x, b.y - ast.y);
            if (dist < ast.radius) {
              hitByBullet = true;
              s.bullets.splice(bIdx, 1);
              soundManager.playBreak();

              // Spawn debris particles
              for (let p = 0; p < 8; p++) {
                s.particles.push({
                  x: ast.x,
                  y: ast.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  color: '#fbbf24',
                  life: 18,
                });
              }

              // Update score
              setScore((sc) => {
                const next = sc + ast.points;
                if (next > highScore) {
                  setHighScore(next);
                  try {
                    localStorage.setItem('portal_orbital_highscore', next.toString());
                  } catch {
                    // Ignore
                  }
                }
                return next;
              });

              // Split into smaller asteroids if large
              if (ast.radius > 16) {
                nextAsteroids.push(spawnAsteroid(ast.x, ast.y, 14));
                nextAsteroids.push(spawnAsteroid(ast.x, ast.y, 14));
              }
              break;
            }
          }

          if (!hitByBullet) {
            // Check ship collision
            const shipDist = Math.hypot(s.shipX - ast.x, s.shipY - ast.y);
            if (shipDist < ast.radius + 8) {
              soundManager.playGameOver();
              setShields((prev) => {
                const next = prev - 1;
                if (next <= 0) {
                  setIsGameOver(true);
                  setIsPlaying(false);
                } else {
                  // Safe bounce ship away
                  s.shipX = 200;
                  s.shipY = 200;
                  s.vx = 0;
                  s.vy = 0;
                }
                return next;
              });
            }
            nextAsteroids.push(ast);
          }
        }

        // Keep at least 3 asteroids roaming
        while (nextAsteroids.length < 3) {
          nextAsteroids.push(spawnAsteroid());
        }
        s.asteroids = nextAsteroids;

        // Update particles
        s.particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 1;
        });
        s.particles = s.particles.filter((p) => p.life > 0);
      }

      // Draw Asteroids (Neon Amber Crystal outlines)
      s.asteroids.forEach((ast) => {
        ctx.save();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ast.x, ast.y, ast.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // Draw Bullets (Glowing Cyan Beams)
      s.bullets.forEach((b) => {
        ctx.save();
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Particles
      s.particles.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 20;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Ship (Sleek Apple Liquid Glass Arrow Craft)
      ctx.save();
      ctx.translate(s.shipX, s.shipY);
      ctx.rotate(s.angle);

      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(14, 165, 233, 0.25)';

      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(-10, -7);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-10, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, spawnAsteroid, highScore]);

  return (
    <GameContainer
      title="Orbital Defender"
      badge="Arcade Action"
      score={score}
      highScore={highScore}
      controlsInfo="Rotate with Left/Right arrows or buttons. Thrust with Up arrow. Fire plasma with Spacebar or Fire button. Shatter space crystals!"
      isGameOver={isGameOver}
      onRestart={handleStart}
      onExit={onExit}
    >
      <div className="flex flex-col items-center justify-center max-w-lg w-full space-y-3">
        {/* Shield Counter Bar */}
        <div className="flex items-center justify-between w-[320px] sm:w-[400px] px-3 py-1.5 rounded-xl backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] text-xs">
          <span className="text-slate-400 font-medium">Hull Shields:</span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-all ${
                  s <= shields
                    ? 'bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Canvas Display */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl bg-[#080a0f]">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] block"
          />

          {/* Start Screen */}
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 backdrop-blur-md bg-black/60 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.3)]">
                <Crosshair className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">Orbital Defender</h2>
                <p className="text-xs text-slate-300 max-w-xs">
                  Zero-gravity interceptor physics. Blast hazardous orbital crystals before they impact.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Engage Thrusters
              </button>
            </div>
          )}

          {/* Game Over Screen */}
          {isGameOver && (
            <div className="absolute inset-0 backdrop-blur-lg bg-black/75 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <h2 className="text-2xl font-bold text-white">Shields Depleted!</h2>
              <p className="text-xs text-slate-300">
                Final Score: <span className="font-mono text-amber-400 font-bold">{score}</span>
              </p>
              <button
                type="button"
                onClick={handleStart}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* Touch Controls for iPad & Mobile */}
        <div className="flex items-center justify-between w-[300px] sm:w-[400px] pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={() => {
                stateRef.current.rotSpeed = -0.09;
              }}
              onPointerUp={() => {
                stateRef.current.rotSpeed = 0;
              }}
              className="w-12 h-11 rounded-xl backdrop-blur-xl bg-white/[0.08] hover:bg-white/[0.14] active:bg-amber-500/30 border border-white/[0.12] flex items-center justify-center text-slate-200 active:scale-95 transition-all shadow-md"
              aria-label="Rotate Left"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              type="button"
              onPointerDown={() => {
                stateRef.current.rotSpeed = 0.09;
              }}
              onPointerUp={() => {
                stateRef.current.rotSpeed = 0;
              }}
              className="w-12 h-11 rounded-xl backdrop-blur-xl bg-white/[0.08] hover:bg-white/[0.14] active:bg-amber-500/30 border border-white/[0.12] flex items-center justify-center text-slate-200 active:scale-95 transition-all shadow-md"
              aria-label="Rotate Right"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={() => {
                stateRef.current.isThrusting = true;
              }}
              onPointerUp={() => {
                stateRef.current.isThrusting = false;
              }}
              className="w-12 h-11 rounded-xl backdrop-blur-xl bg-white/[0.08] hover:bg-white/[0.14] active:bg-cyan-500/30 border border-white/[0.12] flex items-center justify-center text-cyan-300 active:scale-95 transition-all shadow-md font-bold text-xs"
              aria-label="Thrust"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={fireLaser}
              className="px-4 h-11 rounded-xl backdrop-blur-xl bg-amber-500/30 hover:bg-amber-500/40 active:bg-amber-500/60 border border-amber-400/40 flex items-center justify-center text-amber-200 active:scale-95 transition-all shadow-md font-bold text-xs"
            >
              FIRE
            </button>
          </div>
        </div>
      </div>
    </GameContainer>
  );
};
