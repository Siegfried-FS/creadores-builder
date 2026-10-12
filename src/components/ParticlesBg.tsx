import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

const THEME_PALETTES: Record<string, string[]> = {
  light: ['#3b82f6', '#6366f1', '#0ea5e9', '#8b5cf6', '#cbd5e1'],
  dark: ['#a855f7', '#7c3aed', '#c084fc', '#38bdf8', '#818cf8'],
  tropical: ['#10b981', '#059669', '#d97706', '#34d399', '#f59e0b'],
};

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

    const getTheme = () => {
      const cls = document.documentElement.className;
      if (cls.includes('tropical')) return 'tropical';
      if (cls.includes('light')) return 'light';
      return 'dark';
    };

    let currentPalette = THEME_PALETTES[getTheme()] || THEME_PALETTES.dark;

    const updatePalette = () => {
      currentPalette = THEME_PALETTES[getTheme()] || THEME_PALETTES.dark;
      particles.current.forEach((p) => {
        p.color = currentPalette[Math.floor(Math.random() * currentPalette.length)];
      });
    };

    // Observar cambios de clase en <html>
    const observer = new MutationObserver(() => {
      updatePalette();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.offsetWidth : window.innerWidth;
      const h = parent ? parent.offsetHeight : window.innerHeight;

      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const count = Math.min(48, Math.max(18, Math.floor((w * h) / 22000)));
      if (particles.current.length === 0 || Math.abs(particles.current.length - count) > 12) {
        particles.current = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2.2 + 1,
          color: currentPalette[Math.floor(Math.random() * currentPalette.length)],
        }));
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouse.current = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
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
      const parent = canvas.parentElement;
      const w = parent ? parent.offsetWidth : window.innerWidth;
      const h = parent ? parent.offsetHeight : window.innerHeight;

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
        ctx.globalAlpha = 0.55;
        ctx.fill();

        // Líneas entre partículas
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = pts[i].color;
            ctx.globalAlpha = 0.14 * (1 - dist / 120);
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

        if (distm < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mx, my);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = 0.35 * (1 - distm / 130);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
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
      className="absolute inset-0 w-full h-full pointer-events-none opacity-80 z-0"
      aria-hidden="true"
    />
  );
}
