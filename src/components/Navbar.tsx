import type { FC } from 'react';
import { Moon, Sun, LogIn, LogOut, Sparkles, ExternalLink } from 'lucide-react';
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
        
        {/* Identidad oficial: Mascota y Logo que llevan al inicio del Hub */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 group shrink-0 text-left cursor-pointer focus:outline-none"
            title="Volver al inicio del Hub"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600/25 to-purple-400/10 border-2 border-purple-500/40 group-hover:border-purple-400 p-1 transition-all shadow-md group-hover:shadow-[0_0_18px_rgba(168,85,247,0.45)]">
              <img
                src="/images/mascot_opt.png"
                alt="Mascota AWSUG Playa Vicente"
                className="w-full h-full object-contain group-hover:scale-110 transition-transform drop-shadow-md"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm sm:text-base spectrum-text whitespace-nowrap">
                  AWSUG Playa Vicente
                </span>
                <span className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full badge-accent">
                  Hub
                </span>
              </div>
              <p className="text-xs text-muted truncate hidden sm:block">
                Comunidad de Creadores AWS Builder Center
              </p>
            </div>
          </button>
        </div>

        {/* Acciones de Navegación y Sesión */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Enlace al sitio web oficial de la comunidad */}
          <a
            href="https://awsugplayavicente.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-muted hover:text-ink text-xs font-medium transition-colors"
            title="Ir al portal principal de la comunidad AWSUG Playa Vicente"
          >
            <span>Comunidad</span>
            <ExternalLink className="w-3 h-3 text-purple-400" />
          </a>

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
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/mascot_opt.png';
                  }}
                  className="w-6 h-6 rounded-full object-cover border border-purple-500/40"
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
