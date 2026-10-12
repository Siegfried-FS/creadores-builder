import type { FC } from 'react';
import { Moon, Sun, LogIn, LogOut, Sparkles } from 'lucide-react';
import type { CreatorProfile } from '../types';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser: CreatorProfile | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const Navbar: FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full pt-2 pb-2 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto rounded-2xl glass-pill px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        
        {/* Identidad oficial: Logo SVG de AWSUG Playa Vicente */}
        <div className="flex items-center gap-3 min-w-0">
          <a
            href="https://awsugplayavicente.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 group shrink-0"
            title="Ir al portal principal de AWSUG Playa Vicente"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:border-purple-500/50 transition-colors">
              <img
                src="/images/logo.svg"
                alt="Logo AWSUG Playa Vicente"
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain group-hover:scale-110 transition-transform"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xs sm:text-sm spectrum-text whitespace-nowrap">
                  AWSUG Playa Vicente
                </span>
                <span className="inline-flex items-center text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full badge-accent">
                  Hub
                </span>
              </div>
              <p className="text-[10px] text-muted truncate hidden sm:block">
                Comunidad de Creadores AWS Builder Center
              </p>
            </div>
          </a>
        </div>

        {/* Acciones de Navegación y Sesión */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Toggle de Modo Diurno / Espectral */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl border border-border bg-surface hover:bg-surface-hover text-muted hover:text-ink transition-colors"
            title={darkMode ? 'Modo Diurno ☀️' : 'Modo Espectral 🌙'}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-purple-300" />
            ) : (
              <Moon className="w-4 h-4 text-purple-700" />
            )}
          </button>

          {/* Estado de Autenticación */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-ink text-xs font-semibold transition-all group"
                title="Ver mi perfil y publicar artículos"
              >
                <img
                  src={currentUser.avatarUrl || '/images/mascot_opt.png'}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-purple-500/40"
                />
                <span className="max-w-[100px] sm:max-w-[130px] truncate">
                  {currentUser.name}
                </span>
                <Sparkles className="w-3 h-3 text-purple-400 group-hover:rotate-12 transition-transform" />
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl border border-border bg-surface hover:bg-red-500/10 hover:border-red-500/30 text-muted hover:text-red-400 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 btn-primary-gradient text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-xl"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
