import type { FC } from 'react';
import { ExternalLink, Heart, Globe, Share2, Trash2 } from 'lucide-react';
import type { Article } from '../types';
import { getCategoryMeta } from '../data/categories';

interface ArticleCardProps {
  article: Article;
  isLikedByMe: boolean;
  onToggleLike: (articleId: string) => void;
  onDelete?: (articleId: string) => void;
}

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export const ArticleCard: FC<ArticleCardProps> = ({
  article,
  isLikedByMe,
  onToggleLike,
  onDelete
}) => {
  const meta = getCategoryMeta(article.category);

  return (
    <article className="group relative rounded-2xl border border-border bg-surface shadow-[var(--card-shadow)] hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 overflow-hidden">
      {/* Barra superior de acento con color temático de la categoría de AWS */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

      <div className="p-5 sm:p-6 flex flex-col md:flex-row gap-6 items-start">
        
        {/* ── COLUMNA 1: EL CREADOR (En móvil arriba, en desktop lateral) ── */}
        <div className="w-full md:w-64 shrink-0 flex md:flex-col items-center md:items-start gap-4 pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-border/80 md:pr-6">
          <div className="relative shrink-0">
            <img
              src={article.authorAvatarUrl || '/images/mascot_opt.png'}
              alt={article.authorName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 p-1 border-2 border-border shadow-sm"
              loading="lazy"
            />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-surface" title="Creador activo" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base sm:text-lg text-ink truncate">
              {article.authorName}
            </h3>
            {article.authorBio && (
              <p className="text-xs text-muted line-clamp-2 mt-0.5 leading-relaxed">
                {article.authorBio}
              </p>
            )}

            {/* Redes sociales del creador para conectar con él */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {article.authorBuilderUrl && (
                <a
                  href={article.authorBuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 font-medium transition-colors"
                  title="Perfil en AWS Builder Center"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Builder</span>
                </a>
              )}

              {article.authorLinkedinUrl && (
                <a
                  href={article.authorLinkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 font-medium transition-colors"
                  title="Perfil en LinkedIn"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              )}

              {article.authorInstagramUrl && (
                <a
                  href={article.authorInstagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 font-medium transition-colors"
                  title="Perfil en Instagram"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>IG</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── COLUMNA 2: SU ARTÍCULO Y ENLACES DE DIFUSIÓN ── */}
        <div className="flex-1 w-full flex flex-col justify-between h-full min-w-0">
          <div>
            {/* Categoría y botón borrar opcional */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md border ${meta.badgeBg} ${meta.badgeColor} ${meta.borderCol}`}>
                {article.category}
              </span>
              
              {onDelete && (
                <button
                  onClick={() => onDelete(article.id)}
                  className="text-muted hover:text-red-500 p-1 rounded transition-colors"
                  title="Eliminar artículo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Título del artículo */}
            <h2 className="font-display font-bold text-lg sm:text-xl text-ink leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              <a href={article.builderUrl} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>
            </h2>

            {/* Resumen */}
            {article.summary && (
              <p className="text-sm text-muted mt-2 leading-relaxed">
                {article.summary}
              </p>
            )}
          </div>

          {/* Dónde se posteó + Botón de apoyo comunitario */}
          <div className="mt-5 pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Enlaces de difusión */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted font-medium flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5" />
                Difundido en:
              </span>

              {article.builderUrl && (
                <a
                  href={article.builderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
                >
                  <span>Leer artículo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {article.linkedinPostUrl && (
                <a
                  href={article.linkedinPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-surface-hover hover:border-blue-500/50 text-ink transition-colors"
                >
                  <LinkedinIcon className="w-3.5 h-3.5 text-blue-500" />
                  <span>Post LinkedIn</span>
                </a>
              )}

              {article.instagramPostUrl && (
                <a
                  href={article.instagramPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-surface-hover hover:border-pink-500/50 text-ink transition-colors"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                  <span>Post IG</span>
                </a>
              )}
            </div>

            {/* Botón de apoyo To-Do mutuo */}
            <button
              onClick={() => onToggleLike(article.id)}
              className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isLikedByMe
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-surface border border-border text-muted hover:text-amber-500 hover:border-amber-500/40 hover:bg-surface-hover'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLikedByMe ? 'fill-emerald-500 text-emerald-500' : ''}`} />
              <span>{isLikedByMe ? '¡Ya apoyé!' : 'Dar apoyo'}</span>
              <span className="ml-0.5 px-1.5 py-0.5 rounded-md bg-surface text-[11px] font-mono border border-border">
                {article.likesCount}
              </span>
            </button>
          </div>
        </div>

      </div>
    </article>
  );
};
