import type { FC } from 'react';
import { PlusCircle, Moon, Sun, ExternalLink } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenNewArticle: () => void;
}

export const Navbar: FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenNewArticle,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/85 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Identidad de la comunidad (Mascota + Título oficial) */}
        <div className="flex items-center gap-3 min-w-0">
          <a
            href="https://awsugplayavicente.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group shrink-0"
            title="Ir a AWS User Group Playa Vicente"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/10 p-1 border border-border group-hover:border-amber-500/50 transition-colors">
              <img
                src="/images/mascot_opt.png"
                alt="AWS UG Playa Vicente"
                className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base sm:text-lg text-ink tracking-tight truncate">
                  Creadores AWS
                </span>
                <span className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  LATAM
                </span>
              </div>
              <div className="text-[11px] text-muted flex items-center gap-1 font-mono truncate">
                <span>AWS UG Playa Vicente</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </div>
            </div>
          </a>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Botón Sumar mi Artículo */}
          <button
            onClick={onOpenNewArticle}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Sumar mi artículo</span>
          </button>

          {/* Toggle de Modo Oscuro / Claro */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 sm:p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-muted hover:text-ink transition-colors"
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

      </div>
    </header>
  );
};
