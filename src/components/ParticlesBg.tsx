import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

const PALETTE = ['#6d28d9', '#8b5cf6', '#a855f7', '#64748b', '#94a3b8'];

export function ParticlesBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const count = Math.min(50, Math.max(22, Math.floor((w * h) / 25000)));
      if (particles.current.length === 0 || Math.abs(particles.current.length - count) > 15) {
        particles.current = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          size: Math.random() * 2 + 1,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        }));
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleLeave = () => {
      mouse.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseout', handleLeave);
    window.addEventListener('touchend', handleLeave);

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      const pts = particles.current;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > w) { p.x = w; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > h) { p.y = h; p.vy *= -1; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.5;
        ctx.fill();

        // Líneas entre partículas
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 125) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = pts[i].color;
            ctx.globalAlpha = 0.15 * (1 - dist / 125);
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        // Conexión interactiva con el mouse/touch
        const mx = mouse.current.x;
        const my = mouse.current.y;
        const dxm = p.x - mx;
        const dym = p.y - my;
        const distm = Math.sqrt(dxm * dxm + dym * dym);

        if (distm < 140) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mx, my);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = 0.35 * (1 - distm / 140);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseout', handleLeave);
      window.removeEventListener('touchend', handleLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen pointer-events-none opacity-75 z-0"
      aria-hidden="true"
    />
  );
}
