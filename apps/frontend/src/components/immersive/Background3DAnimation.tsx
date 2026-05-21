'use client';

import { useEffect, useRef } from 'react';

interface Background3DAnimationProps {
  className?: string;
  /** Lighter / fewer elements on inner pages */
  variant?: 'hero' | 'subtle';
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  type: 'orb' | 'box' | 'dot';
  rot: number;
  rotSpeed: number;
}

function project(
  p: Particle3D,
  cx: number,
  cy: number,
  fov: number,
  mouseX: number,
  mouseY: number,
): { sx: number; sy: number; scale: number } {
  const parallaxX = mouseX * 0.08;
  const parallaxY = mouseY * 0.06;
  const z = p.z + 200;
  const scale = fov / (fov + z);
  return {
    sx: cx + (p.x + parallaxX) * scale,
    sy: cy + (p.y + parallaxY) * scale,
    scale,
  };
}

export default function Background3DAnimation({
  className = '',
  variant = 'hero',
}: Background3DAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const count = variant === 'hero' ? 28 : 14;
    const particles: Particle3D[] = Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * 900,
      y: (Math.random() - 0.5) * 500,
      z: Math.random() * 400 - 100,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.25,
      vz: (Math.random() - 0.5) * 0.4,
      size: 12 + Math.random() * 36,
      type: i % 5 === 0 ? 'box' : i % 3 === 0 ? 'orb' : 'dot',
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.012,
    }));

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 120,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 80,
      };
    };

    window.addEventListener('mousemove', onMouse, { passive: true });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    const fov = 420;
    let gridOffset = 0;

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h * 0.42;

      ctx.clearRect(0, 0, w, h);

      if (!prefersReduced) {
        gridOffset += 0.6;
      }

      // Perspective floor grid
      const horizon = h * 0.52;
      ctx.save();
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.12)';
      ctx.lineWidth = 1;
      const lines = 18;
      for (let i = 0; i < lines; i++) {
        const t = i / lines;
        const y = horizon + t * t * (h - horizon) * 0.95;
        const spread = 80 + t * w * 0.85;
        ctx.beginPath();
        ctx.moveTo(cx - spread, y);
        ctx.lineTo(cx + spread, y);
        ctx.stroke();
      }
      for (let i = -12; i <= 12; i++) {
        const xOff = i * 55 + ((gridOffset * 0.4) % 55);
        ctx.beginPath();
        ctx.moveTo(cx + xOff, horizon);
        ctx.lineTo(cx + xOff * 2.2, h + 20);
        ctx.stroke();
      }
      ctx.restore();

      // Sort by depth (far first)
      const sorted = [...particles].sort((a, b) => b.z - a.z);

      for (const p of sorted) {
        if (!prefersReduced) {
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
          p.rot += p.rotSpeed;

          if (p.x > 500) p.x = -500;
          if (p.x < -500) p.x = 500;
          if (p.y > 280) p.y = -280;
          if (p.y < -280) p.y = 280;
          if (p.z > 180) p.z = -120;
          if (p.z < -120) p.z = 180;
        }

        const { sx, sy, scale } = project(p, cx, cy, fov, mouseRef.current.x, mouseRef.current.y);
        const alpha = Math.min(0.55, 0.15 + scale * 0.5);
        const r = p.size * scale;

        if (p.type === 'orb') {
          const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
          grad.addColorStop(0, `rgba(125, 211, 252, ${alpha * 0.9})`);
          grad.addColorStop(0.5, `rgba(14, 165, 233, ${alpha * 0.35})`);
          grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'box') {
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(p.rot);
          ctx.strokeStyle = `rgba(14, 165, 233, ${alpha * 0.7})`;
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.25})`;
          ctx.lineWidth = 1.2 * scale;
          const s = r * 1.1;
          ctx.fillRect(-s / 2, -s / 2, s, s);
          ctx.strokeRect(-s / 2, -s / 2, s, s);
          ctx.restore();
        } else {
          ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(1.5, r * 0.2), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      frameRef.current += 1;
      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, [variant]);

  return (
    <div className={`bg-3d-wrap ${className}`} aria-hidden>
      <div className="bg-3d-aurora bg-3d-aurora--1" />
      <div className="bg-3d-aurora bg-3d-aurora--2" />
      <div className="bg-3d-aurora bg-3d-aurora--3" />
      <canvas ref={canvasRef} className="bg-3d-canvas" />
      <div className="bg-3d-shine" />
    </div>
  );
}
