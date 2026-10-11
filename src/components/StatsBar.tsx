import type { FC } from 'react';
import { CheckCircle2, Clock, Sparkles, BookOpen, Users, Heart, Calendar, RotateCcw } from 'lucide-react';
import { getCurrentCycleName, getDaysUntilNextMonth } from '../utils/sanitizer';

export type FilterStatus = 'all' | 'pending' | 'liked';

interface StatsBarProps {
  totalArticles: number;
  likedCount: number;
  uniqueCreatorsCount: number;
  totalCommunityLikes: number;
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
}

export const StatsBar: FC<StatsBarProps> = ({
  totalArticles,
  likedCount,
  uniqueCreatorsCount,
  totalCommunityLikes,
  filterStatus,
  onFilterChange,
}) => {
  const percentage = totalArticles > 0 ? Math.round((likedCount / totalArticles) * 100) : 0;
  const pendingCount = Math.max(0, totalArticles - likedCount);
  const cycleName = getCurrentCycleName();
  const daysLeft = getDaysUntilNextMonth();

  return (
    <div className="bg-white dark:bg-gray-900 border border-border rounded-2xl p-5 shadow-sm mb-8 transition-colors">
      
      {/* Banner de Ciclo Mensual y Auto-Renovación */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-border/80 text-xs">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-aws-orange/15 text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5 capitalize">
            <Calendar className="w-3.5 h-3.5" />
            <span>Ciclo: {cycleName}</span>
          </span>
          <span className="text-muted hidden sm:inline">&bull;</span>
          <span className="text-muted">
            Quedan <strong className="text-ink">{daysLeft} días</strong> para renovar lista y dar paso a nuevas publicaciones.
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-muted font-mono text-[11px] bg-slate-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
          <RotateCcw className="w-3 h-3 text-emerald-500" />
          <span>Renovación el día 1 (TTL $0)</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Progreso Personal / Gamificación del To-Do */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <h3 className="font-semibold text-sm text-ink">
                Tu Checklist de Apoyo Comunitario
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-muted">
              {likedCount} de {totalArticles} apoyados ({percentage}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-gray-800 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-xs text-muted mt-2">
            {pendingCount === 0 && totalArticles > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> ¡Misión cumplida! Has apoyado todos los artículos del bootcamp.
              </span>
            ) : (
              <span>
                Te faltan <strong className="text-ink">{pendingCount}</strong> artículos por leer y dejar tu apoyo en Builder Center y LinkedIn.
              </span>
            )}
          </p>
        </div>

        {/* Métricas Globales de Comunidad */}
        <div className="flex items-center gap-4 py-2 px-4 bg-slate-50 dark:bg-gray-800/50 rounded-xl border border-border/60">
          <div className="text-center">
            <div className="flex items-center justify-center text-xs text-muted mb-0.5">
              <BookOpen className="w-3.5 h-3.5 mr-1 text-aws-orange" /> Artículos
            </div>
            <span className="font-bold text-lg text-ink font-mono">{totalArticles}</span>
          </div>

          <div className="w-px h-8 bg-border" />

          <div className="text-center">
            <div className="flex items-center justify-center text-xs text-muted mb-0.5">
              <Users className="w-3.5 h-3.5 mr-1 text-blue-500" /> Creadores
            </div>
            <span className="font-bold text-lg text-ink font-mono">{uniqueCreatorsCount}</span>
          </div>

          <div className="w-px h-8 bg-border" />

          <div className="text-center">
            <div className="flex items-center justify-center text-xs text-muted mb-0.5">
              <Heart className="w-3.5 h-3.5 mr-1 text-red-500" /> Apoyos Dados
            </div>
            <span className="font-bold text-lg text-ink font-mono">{totalCommunityLikes}</span>
          </div>
        </div>

      </div>

      {/* Tabs / Filtros tipo To-Do */}
      <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-border/80">
        <span className="text-xs font-semibold text-muted mr-1">Filtrar vista:</span>
        <button
          onClick={() => onFilterChange('all')}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
            filterStatus === 'all'
              ? 'bg-ink text-white dark:bg-white dark:text-gray-900 shadow-sm'
              : 'bg-slate-100 dark:bg-gray-800 text-muted hover:text-ink'
          }`}
        >
          Todos ({totalArticles})
        </button>
        <button
          onClick={() => onFilterChange('pending')}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
            filterStatus === 'pending'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-gray-800 text-muted hover:text-ink'
          }`}
        >
          <Clock className="w-3 h-3 mr-1" />
          <span>Pendientes por apoyar ({pendingCount})</span>
        </button>
        <button
          onClick={() => onFilterChange('liked')}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
            filterStatus === 'liked'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-gray-800 text-muted hover:text-ink'
          }`}
        >
          <CheckCircle2 className="w-3 h-3 mr-1" />
          <span>Ya apoyados por mí ({likedCount})</span>
        </button>
      </div>
    </div>
  );
};
