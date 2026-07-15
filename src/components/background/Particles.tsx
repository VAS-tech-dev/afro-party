'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface Particle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  opacity: number;
  phase: number;
}

/**
 * Lightweight canvas "gold dust" field — slow-rising luminous particles that
 * evoke a high-end night. Fully disabled under prefers-reduced-motion and
 * paused when the tab is hidden. Pointer-events are off; purely decorative.
 */
export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const seed = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.4,
      speed: Math.random() * 0.25 + 0.05,
      drift: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.5 + 0.1,
      phase: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Density scales with area but is capped for performance.
      const count = Math.min(Math.round((width * height) / 14000), 90);
      particles = Array.from({ length: count }, seed);
    };

    const render = () => {
      if (!running) return;
      frame += 1;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift + Math.sin(frame * 0.005 + p.phase) * 0.15;

        if (p.y < -5) {
          p.y = height + 5;
          p.x = Math.random() * width;
        }

        const twinkle = p.opacity * (0.6 + 0.4 * Math.sin(frame * 0.02 + p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(233, 193, 88, ${twinkle})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(245, 216, 138, 0.6)';
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      requestAnimationFrame(render);
    };

    const onVisibility = () => {
      running = document.visibilityState === 'visible';
      if (running) requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [prefersReduced]);

  if (prefersReduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
