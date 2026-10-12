import type { FC } from 'react';
import { ExternalLink, Heart, Share2, Trash2, Pencil, Clock } from 'lucide-react';
import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  isLikedByMe: boolean;
  onToggleLike: (articleId: string) => void;
  onEdit?: (article: Article) => void;
  canEdit?: boolean;
  onDelete?: (articleId: string) => void;
  canDelete?: boolean;
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

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const ArticleCard: FC<ArticleCardProps> = ({
  article,
  isLikedByMe,
  onToggleLike,
  onEdit,
  canEdit = false,
  onDelete,
  canDelete = false,
}) => {
  const hasSocials = Boolean(
    article.authorBuilderUrl || article.authorLinkedinUrl || article.authorGithubUrl || article.authorInstagramUrl
  );

  return (
    <article className="group relative rounded-2xl border border-border bg-surface glass-card transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md hover:border-purple-500/40">
      {/* Barra superior espectral del UG */}
      <div className="h-1 w-full bg-gradient-to-r from-purple-700 via-purple-500 to-indigo-500" />

      <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-5 items-stretch">
        
        {/* ── CUERPO PRINCIPAL DEL ARTÍCULO (Primero en móvil, derecha en desktop) ── */}
        <div className="flex-1 w-full flex flex-col justify-between min-w-0 order-1 md:order-2">
          <div>
            {/* Meta superior: Categoría, Vigencia y Controles de edición */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md badge-accent">
                  {article.category}
                </span>

                {/* Vigencia de 30 días (DynamoDB TTL) */}
                {(() => {
                  const createdTime = new Date(article.createdAt).getTime();
                  const now = Date.now();
                  const daysElapsed = Math.floor((now - createdTime) / (1000 * 60 * 60 * 24));
                  const daysRemaining = Math.max(1, 30 - daysElapsed);
                  return (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] text-muted font-medium px-2 py-0.5 rounded-full bg-surface border border-border"
                      title="Publicación activa por 30 días continuos con TTL automático en Amazon DynamoDB"
                    >
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span>{daysRemaining > 0 ? `${daysRemaining}d activo` : 'Por renovar'}</span>
                    </span>
                  );
                })()}
              </div>
              
              {/* Acciones del autor */}
              <div className="flex items-center gap-1">
                {canEdit && onEdit && (
                  <button
                    onClick={() => onEdit(article)}
                    className="text-muted hover:text-purple-400 p-2 rounded-lg hover:bg-purple-500/10 transition-colors"
                    title="Editar mi artículo"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}

                {canDelete && onDelete && (
                  <button
                    onClick={() => onDelete(article.id)}
                    className="text-muted hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Retirar mi artículo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Título del artículo: Grande, destacado y legible */}
            <h2 className="font-display font-bold text-lg sm:text-xl text-ink leading-snug group-hover:text-purple-400 transition-colors break-words">
              <a href={article.builderUrl} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>
            </h2>

            {/* Resumen / Aprendizaje */}
            {article.summary && (
              <p className="text-xs sm:text-sm text-muted mt-2.5 leading-relaxed line-clamp-3 break-words">
                {article.summary}
              </p>
            )}
          </div>

          {/* ── SECCIÓN DE DIFUSIÓN & BOTÓN DE APOYO (Compacto en 1 sola línea) ── */}
          <div className="mt-5 pt-3.5 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Botones de Difusión compactos */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-muted font-medium flex items-center gap-1 mr-1">
                <Share2 className="w-3.5 h-3.5 text-purple-400" />
                Difundido:
              </span>

              {article.builderUrl && (
                <a
                  href={article.builderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg btn-primary-gradient shadow-sm whitespace-nowrap"
                  title="Abrir artículo completo en AWS Builder Center"
                >
                  <img src="/images/builder_center_icon.png" alt="Builder" className="w-3.5 h-3.5 object-contain" />
                  <span>Leer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {article.linkedinPostUrl && (
                <a
                  href={article.linkedinPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border bg-surface-hover hover:border-blue-500/50 text-ink transition-colors whitespace-nowrap"
                  title="Ver post en LinkedIn para dar Like y Repost"
                >
                  <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Post</span>
                </a>
              )}

              {article.instagramPostUrl && (
                <a
                  href={article.instagramPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border bg-surface-hover hover:border-pink-500/50 text-ink transition-colors whitespace-nowrap"
                  title="Ver post en Instagram"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                  <span>IG Post</span>
                </a>
              )}
            </div>

            {/* Botón de apoyo comunitario */}
            <button
              onClick={() => onToggleLike(article.id)}
              className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isLikedByMe
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'bg-surface border border-border text-muted hover:text-purple-400 hover:border-purple-500/30 hover:bg-surface-hover'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLikedByMe ? 'fill-purple-400 text-purple-400' : ''}`} />
              <span>{isLikedByMe ? '¡Ya apoyé!' : 'Dar apoyo'}</span>
              <span className="ml-0.5 px-2 py-0.5 rounded-md bg-surface text-[11px] font-mono border border-border">
                {article.likesCount}
              </span>
            </button>
          </div>
        </div>

        {/* ── BLOQUE DE AUTOR / BUILDER (Segundo en móvil, izquierda en desktop) ── */}
        <div className="w-full md:w-60 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-r border-border/80 md:pr-5 flex flex-col justify-between order-2 md:order-1">
          <div className="flex flex-col items-center text-center gap-2.5">
            
            {/* Avatar del creador centrado */}
            <div className="relative shrink-0">
              <img
                src={article.authorAvatarUrl || '/images/mascot_opt.png'}
                alt={article.authorName}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/mascot_opt.png';
                }}
                className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl object-cover bg-purple-500/10 p-0.5 border-2 border-purple-500/30 shadow-sm"
                loading="lazy"
              />
              <span
                className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 ring-2 ring-surface"
                title="Creador de la comunidad"
              />
            </div>

            {/* Info del creador centrada */}
            <div className="w-full min-w-0">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
                Builder
              </span>
              <h3 className="font-display font-bold text-base sm:text-lg text-ink break-words leading-tight">
                {article.authorName}
              </h3>
              {article.authorBio && (
                <p
                  className="text-xs text-muted mt-1 leading-snug line-clamp-2 md:line-clamp-3 text-center"
                  title={article.authorBio}
                >
                  {article.authorBio}
                </p>
              )}
            </div>

          </div>

          {/* Redes sociales del creador centradas */}
          {hasSocials && (
            <div className="mt-3 pt-2.5 border-t border-border/70 w-full flex flex-col items-center">
              <span className="text-[11px] font-bold text-muted/90 uppercase tracking-wider mb-2 select-none text-center">
                Redes Sociales
              </span>
              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                {article.authorBuilderUrl && (
                  <a
                    href={article.authorBuilderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/25 flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                    title="Perfil oficial en AWS Builder Center"
                  >
                    <img src="/images/builder_center_icon.png" alt="AWS Builder Center" className="w-4 h-4 object-contain" />
                  </a>
                )}

                {article.authorLinkedinUrl && (
                  <a
                    href={article.authorLinkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25 flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                    title="Perfil profesional en LinkedIn"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                  </a>
                )}

                {article.authorGithubUrl && (
                  <a
                    href={article.authorGithubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-ink border border-border flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                    title="Perfil de código en GitHub"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>
                )}

                {article.authorInstagramUrl && (
                  <a
                    href={article.authorInstagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/25 flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                    title="Perfil personal en Instagram"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </article>
  );
};
