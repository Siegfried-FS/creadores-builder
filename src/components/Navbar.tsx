import type { FC } from 'react';
import { PlusCircle, User, Moon, Sun } from 'lucide-react';
import type { CreatorProfile } from '../types';

interface NavbarProps {
  currentUser: CreatorProfile;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenNewArticle: () => void;
  onOpenProfile: () => void;
}

export const Navbar: FC<NavbarProps> = ({
  currentUser,
  darkMode,
  onToggleDarkMode,
  onOpenNewArticle,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/90 dark:bg-gray-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo & Branding */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center">
            <img
              src="/images/mascot_opt.png"
              alt="Mascota Iguana AWS UG Playa Vicente"
              className="h-12 w-12 object-contain drop-shadow-sm transform hover:scale-110 transition-transform"
            />
            <div className="hidden sm:block ml-3">
              <div className="flex items-center space-x-2">
                <span className="font-display font-black text-xl text-ink tracking-tight">
                  Creadores
                </span>
                <span className="bg-aws-orange/15 text-amber-700 dark:text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                  Bootcamp LATAM
                </span>
              </div>
              <div className="text-xs text-muted flex items-center space-x-1 font-mono">
                <span>creadores.awsugplayavicente.com</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Botón Publicar Artículo */}
          <button
            onClick={onOpenNewArticle}
            className="flex items-center space-x-2 bg-gradient-to-r from-aws-orange to-amber-500 hover:from-amber-500 hover:to-aws-orange text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Subir mi Artículo</span>
            <span className="sm:hidden">Subir</span>
          </button>

          {/* Perfil del Creador */}
          <button
            onClick={onOpenProfile}
            className="flex items-center space-x-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-border bg-surface hover:bg-surface-hover text-ink transition-colors"
            title="Mi Perfil de Creador"
          >
            <div className="w-8 h-8 rounded-lg bg-aws-squid/10 dark:bg-aws-squid flex items-center justify-center font-bold text-xs text-aws-squid dark:text-aws-orange overflow-hidden">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold leading-none">{currentUser.name}</div>
              <div className="text-[11px] text-muted font-mono leading-tight">@{currentUser.builderHandle}</div>
            </div>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-muted hover:text-ink transition-colors"
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

      </div>
    </header>
  );
};
