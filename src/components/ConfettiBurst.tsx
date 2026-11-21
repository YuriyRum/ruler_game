import React from 'react';

interface ConfettiBurstProps {
  triggerKey: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle';
  alpha: number;
}

const COLORS = ['#0284C7', '#F59E0B', '#10B981', '#EC4899', '#6366F1', '#EF4444'];

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ triggerKey }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (triggerKey <= 0) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const width = window.innerWidth;
    const height = window.innerHeight;

    const particles: Particle[] = Array.from({ length: 110 }, (_, idx) => {
      const fromLeft = idx % 2 === 0;
      return {
        x: fromLeft ? width * (0.2 + Math.random() * 0.25) : width * (0.55 + Math.random() * 0.25),
        y: height * 0.35 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 11,
        vy: -(5 + Math.random() * 9),
        size: 6 + Math.random() * 6,
        color: COLORS[idx % COLORS.length],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.22,
        shape: idx % 3 === 0 ? 'circle' : 'rect',
        alpha: 1,
      };
    });

    let animationId = 0;
    const startTime = performance.now();
    const duration = 3200;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28; // gravity
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;

        if (elapsed > duration * 0.65) {
          p.alpha = Math.max(0, 1 - (elapsed - duration * 0.65) / (duration * 0.35));
        }

        if (p.y < window.innerHeight + 40 && p.alpha > 0.01) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size * 0.35, p.size, p.size * 0.65);
          }
          ctx.restore();
        }
      }

      if (alive && elapsed < duration) {
        animationId = window.requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    animationId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [triggerKey]);

  if (triggerKey <= 0) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 w-full h-full"
    />
  );
};
