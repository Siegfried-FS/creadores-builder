import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

// Paletas más vibrantes y notorias según el tema
const PALETTES = {
  light: ['#6d28d9', '#7c3aed', '#8b5cf6', '#2563eb', '#3b82f6', '#475569'],
  dark: ['#c084fc', '#a855f7', '#7c3aed', '#38bdf8', '#818cf8', '#ec4899'],
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

    const getTheme = (): 'light' | 'dark' => {
      return document.documentElement.classList.contains('light') ? 'light' : 'dark';
    };

    let currentTheme = getTheme();
    let currentPalette = PALETTES[currentTheme];

    const updateThemePalette = () => {
      currentTheme = getTheme();
      currentPalette = PALETTES[currentTheme];
      particles.current.forEach((p) => {
        p.color = currentPalette[Math.floor(Math.random() * currentPalette.length)];
      });
    };

    const observer = new MutationObserver(updateThemePalette);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Mayor densidad de partículas para que sean bien notorias
      const count = Math.min(65, Math.max(30, Math.floor((w * h) / 18000)));
      if (particles.current.length === 0 || Math.abs(particles.current.length - count) > 15) {
        particles.current = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.55,
          vy: (Math.random() - 0.5) * 0.55,
          size: Math.random() * 2.5 + 1.2, // Tamaño más visible
          color: currentPalette[Math.floor(Math.random() * currentPalette.length)],
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
      const isLight = currentTheme === 'light';

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
        // Mayor opacidad para que resalten claramente
        ctx.globalAlpha = isLight ? 0.75 : 0.85;
        ctx.fill();

        // Líneas entre partículas
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 135) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = pts[i].color;
            ctx.globalAlpha = isLight
              ? 0.28 * (1 - dist / 135)
              : 0.32 * (1 - dist / 135);
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }

        // Conexión interactiva con el mouse/touch
        const mx = mouse.current.x;
        const my = mouse.current.y;
        const dxm = p.x - mx;
        const dym = p.y - my;
        const distm = Math.sqrt(dxm * dxm + dym * dym);

        if (distm < 150) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mx, my);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = 0.55 * (1 - distm / 150);
          ctx.lineWidth = 1.4;
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
      className="fixed inset-0 w-screen h-screen pointer-events-none opacity-90 z-0"
      aria-hidden="true"
    />
  );
}
