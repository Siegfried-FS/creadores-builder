import type { FC } from 'react';
import { ExternalLink, Check, Heart, Edit2, Trash2, Globe } from 'lucide-react';
import type { Article, CreatorProfile } from '../types';
import { getCategoryMeta } from '../data/categories';
import { formatBuilderUrl } from '../utils/sanitizer';

interface ArticleCardProps {
  article: Article;
  currentUser: CreatorProfile;
  isLikedByMe: boolean;
  onToggleLike: (articleId: string) => void;
  onEdit: (article: Article) => void;
  onDelete: (articleId: string) => void;
}

export const ArticleCard: FC<ArticleCardProps> = ({
  article,
  currentUser,
  isLikedByMe,
  onToggleLike,
  onEdit,
  onDelete,
}) => {
  const meta = getCategoryMeta(article.category);
  const isAuthor = currentUser.id === article.authorId;

  const formattedDate = new Date(article.createdAt).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl p-5 border transition-all duration-200 ${
        isLikedByMe
          ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-300 dark:border-emerald-800/80 shadow-sm'
          : 'bg-white dark:bg-gray-900 border-border hover:border-slate-300 dark:hover:border-gray-700 shadow-sm hover:shadow-md'
      }`}
    >
      <div>
        {/* Encabezado: Categoría Oficial & Acciones de Autor */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg border ${meta.badgeBg} ${meta.badgeColor} ${meta.borderCol}`}
          >
            {article.category}
          </span>

          <div className="flex items-center space-x-1">
            {isAuthor && (
              <>
                <button
                  onClick={() => onEdit(article)}
                  className="p-1.5 text-muted hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                  title="Editar mi artículo"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(article.id)}
                  className="p-1.5 text-muted hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                  title="Eliminar mi publicación"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Título del Artículo */}
        <h3 className="font-display font-bold text-base sm:text-lg text-ink leading-snug mb-3 hover:text-aws-orange transition-colors">
          <a href={article.builderUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-1.5">
            <span>{article.title}</span>
            <ExternalLink className="w-4 h-4 shrink-0 text-muted mt-1 opacity-70" />
          </a>
        </h3>

        {/* Autor e Información del Perfil */}
        <div className="flex items-center justify-between py-2 border-y border-border/60 my-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center font-bold text-[10px] text-muted overflow-hidden">
              {article.authorAvatarUrl ? (
                <img src={article.authorAvatarUrl} alt={article.authorName} className="w-full h-full object-cover" />
              ) : (
                article.authorName.charAt(0)
              )}
            </div>
            <div>
              <div className="font-semibold text-ink leading-tight">{article.authorName}</div>
              <a
                href={formatBuilderUrl(article.authorBuilderHandle)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-muted hover:text-aws-blue font-mono"
              >
                @{article.authorBuilderHandle}
              </a>
            </div>
          </div>

          <span className="text-[11px] text-muted font-mono">{formattedDate}</span>
        </div>
      </div>

      {/* Acciones de Apoyo y Enlaces */}
      <div className="pt-3 flex flex-col gap-2.5">
        
        {/* Botones de Links a Plataformas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Builder Center Link */}
          <a
            href={article.builderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1.5 bg-aws-squid/90 hover:bg-aws-squid text-white text-xs font-semibold py-2 px-3 rounded-xl transition-colors text-center shadow-sm"
          >
            <span>Builder Center</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* LinkedIn Post Link (si existe) */}
          {article.linkedinPostUrl ? (
            <a
              href={article.linkedinPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-1.5 bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold py-2 px-3 rounded-xl transition-colors text-center shadow-sm"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74V9.93H5.06v8.57h2.8z"/>
              </svg>
              <span>Post LinkedIn</span>
            </a>
          ) : (
            <div className="flex items-center justify-center space-x-1 text-xs text-muted/70 py-2 px-3 rounded-xl border border-dashed border-border bg-slate-50/50 dark:bg-gray-800/20">
              <Globe className="w-3 h-3 opacity-60" />
              <span>Sin post en LinkedIn</span>
            </div>
          )}
        </div>

        {/* To-Do Checklist Button (Ya apoyé / Apoyar) */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => onToggleLike(article.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all duration-200 ${
              isLikedByMe
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-ink'
            }`}
          >
            {isLikedByMe ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>✅ Ya apoyé este artículo</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 text-red-500" />
                <span>Dar apoyo / Marcar como leído</span>
              </>
            )}
          </button>

          <div className="ml-3 text-xs font-mono font-bold text-muted flex items-center space-x-1" title="Apoyos de la comunidad">
            <Heart className={`w-3.5 h-3.5 ${isLikedByMe ? 'fill-red-500 text-red-500' : 'text-muted'}`} />
            <span>{article.likesCount}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
