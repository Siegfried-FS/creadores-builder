import { useState, useEffect, type FC, type FormEvent } from 'react';
import {
  X,
  Sparkles,
  AlertCircle,
  Bookmark,
  Link as LinkIcon,
  Share2,
  Check,
  FileText,
  Lightbulb,
  MessageSquare,
  Copy,
} from 'lucide-react';
import type { Article, AWSCategory, CreatorProfile, ItemType } from '../types';
import { AWS_CATEGORIES } from '../data/categories';
import {
  isValidAWSArticleUrl,
  isValidLinkedInPostUrl,
  isValidWishlistUrl,
  isValidCommentUrl,
} from '../utils/sanitizer';

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  author: CreatorProfile;
  initialArticle?: Article | null;
  onSubmit: (articleData: Partial<Article>) => void;
}

export const ArticleModal: FC<ArticleModalProps> = ({
  isOpen,
  onClose,
  author,
  initialArticle,
  onSubmit,
}) => {
  const [itemType, setItemType] = useState<ItemType>('article');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<AWSCategory>('Developer Tools');
  const [builderUrl, setBuilderUrl] = useState('');
  const [linkedinPostUrl, setLinkedinPostUrl] = useState('');
  const [instagramPostUrl, setInstagramPostUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedIguana, setCopiedIguana] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialArticle) {
        setItemType(initialArticle.itemType || 'article');
        setTitle(initialArticle.title || '');
        setSummary(initialArticle.summary || '');
        setCategory(initialArticle.category || 'Developer Tools');
        setBuilderUrl(initialArticle.builderUrl || initialArticle.wishlistUrl || initialArticle.commentUrl || '');
        setLinkedinPostUrl(initialArticle.linkedinPostUrl || '');
        setInstagramPostUrl(initialArticle.instagramPostUrl || '');
      } else {
        setItemType('article');
        setTitle('');
        setSummary('');
        setCategory('Developer Tools');
        setBuilderUrl('');
        setLinkedinPostUrl('');
        setInstagramPostUrl('');
      }
      setValidationError(null);
      setCopiedIguana(false);
    }
  }, [isOpen, initialArticle]);

  if (!isOpen) return null;

  const handleCopyIguana = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('🦎');
      } else {
        const input = document.createElement('textarea');
        input.value = '🦎';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedIguana(true);
      setTimeout(() => setCopiedIguana(false), 2500);
    } catch {
      setCopiedIguana(true);
      setTimeout(() => setCopiedIguana(false), 2500);
    }
  };

  const isQuickLinkType = itemType === 'wishlist' || itemType === 'comment';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedUrl = builderUrl.trim();
    if (!trimmedUrl) {
      setValidationError('Por favor ingresa el enlace directo.');
      return;
    }

    let finalTitle = title.trim();

    // Validar y autogenerar títulos limpios para modos rápidos
    if (itemType === 'wishlist') {
      const wishValidation = isValidWishlistUrl(trimmedUrl);
      if (!wishValidation.isValid) {
        setValidationError(wishValidation.error || 'La URL de la Wishlist no es válida');
        return;
      }
      if (!finalTitle) {
        try {
          const pathSegments = new URL(trimmedUrl).pathname.split('/').filter(Boolean);
          const slug = pathSegments[pathSegments.length - 1];
          if (slug && slug !== 'wishlist') {
            finalTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          } else {
            finalTitle = 'Propuesta en AWS Wishlist';
          }
        } catch {
          finalTitle = 'Propuesta en AWS Wishlist';
        }
      }
    } else if (itemType === 'comment') {
      const commentValidation = isValidCommentUrl(trimmedUrl);
      if (!commentValidation.isValid) {
        setValidationError(commentValidation.error || 'La URL del comentario no es válida (debe ser de builder.aws.com)');
        return;
      }
      if (!finalTitle) {
        finalTitle = 'Comentario de Feedback en AWS Builder Center';
      }
    } else {
      const urlValidation = isValidAWSArticleUrl(trimmedUrl);
      if (!urlValidation.isValid) {
        setValidationError(urlValidation.error || 'La URL del artículo no es válida');
        return;
      }
      if (!finalTitle) {
        setValidationError('Por favor escribe un título para el artículo.');
        return;
      }
    }

    // Validar URL de LinkedIn si se ingresó
    if (linkedinPostUrl.trim()) {
      const linkedInValidation = isValidLinkedInPostUrl(linkedinPostUrl.trim());
      if (!linkedInValidation.isValid) {
        setValidationError(linkedInValidation.error || 'URL de LinkedIn no válida');
        return;
      }
    }

    const finalSummary =
      summary.trim() ||
      (itemType === 'wishlist'
        ? 'Propuesta en la lista de deseos de AWS Builder Center para votación comunitaria.'
        : itemType === 'comment'
        ? 'Comentario de apoyo y feedback constructivo para la comunidad.'
        : '');

    // Enviar publicación heredando automáticamente los datos del perfil del autor
    onSubmit({
      id: initialArticle?.id,
      itemType,
      title: finalTitle.slice(0, 140),
      summary: finalSummary.slice(0, 300),
      category,
      builderUrl: trimmedUrl,
      wishlistUrl: itemType === 'wishlist' ? trimmedUrl : undefined,
      commentUrl: itemType === 'comment' ? trimmedUrl : undefined,
      linkedinPostUrl: linkedinPostUrl.trim() || undefined,
      instagramPostUrl: instagramPostUrl.trim() || undefined,
      authorId: author.id,
      authorName: author.name,
      authorBio: author.bio,
      authorAvatarUrl: author.avatarUrl || '/images/mascot_opt.png',
      authorBuilderUrl: author.builderUrl,
      authorLinkedinUrl: author.linkedinUrl,
      authorInstagramUrl: author.instagramUrl,
    });

    onClose();
  };

  const isEditing = Boolean(initialArticle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl glass-card border border-border p-4 sm:p-6 shadow-2xl">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-muted hover:text-ink hover:bg-surface-hover transition-colors"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado Compacto */}
        <div className="flex items-center justify-between gap-3 mb-4 pr-8">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-base sm:text-lg text-ink truncate">
                {isEditing ? 'Editar Publicación' : 'Publicar en el Hub'}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-muted truncate">
                <span>Publicando como:</span>
                <span className="font-bold text-ink">{author.name}</span>
                {author.builderHandle && (
                  <span className="text-purple-400 font-mono hidden sm:inline">(@{author.builderHandle})</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selector de Tipo: Artículo vs Wishlist vs Comentarios */}
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setItemType('article')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all ${
                itemType === 'article'
                  ? 'border-purple-500 bg-purple-500/15 text-purple-400 shadow-sm'
                  : 'border-border bg-surface hover:bg-surface-hover text-muted'
              }`}
            >
              <FileText className="w-4 h-4 mb-0.5 text-purple-400" />
              <span>Artículo</span>
            </button>

            <button
              type="button"
              onClick={() => setItemType('wishlist')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all ${
                itemType === 'wishlist'
                  ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-sm'
                  : 'border-border bg-surface hover:bg-surface-hover text-muted'
              }`}
            >
              <Lightbulb className="w-4 h-4 mb-0.5 text-amber-400" />
              <span>Wishlist</span>
            </button>

            <button
              type="button"
              onClick={() => setItemType('comment')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all ${
                itemType === 'comment'
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-sm'
                  : 'border-border bg-surface hover:bg-surface-hover text-muted'
              }`}
            >
              <MessageSquare className="w-4 h-4 mb-0.5 text-emerald-400" />
              <span>Comentario</span>
            </button>
          </div>
        </div>

        {/* 🦎 Banner Comunitario: Filosofía de Dar para Recibir & Tip de la Iguana */}
        {itemType === 'comment' && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-ink space-y-2.5">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-ink">Comunidad: Dar para recibir. </span>
                <span className="text-muted">
                  Un like apoya, pero saber que tu artículo le sirvió a alguien y recibir feedback real es lo que hace crecer a un creador. Cuando leas el contenido de otro compañero, no te limites a pedir apoyo: tómate dos minutos para leer el suyo y dejar un comentario constructivo.
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-500/5 p-2 rounded-lg">
              <div className="text-[11px] text-muted">
                <span className="font-bold text-emerald-400">Sello de la iguana: </span>
                Deja una <strong className="text-ink">iguana 🦎</strong> al final de tu comentario en Builder Center para saber que llegaste desde este Hub.
              </div>
              <button
                type="button"
                onClick={handleCopyIguana}
                className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs transition-colors border border-emerald-500/30 self-start sm:self-auto cursor-pointer"
                title="Copiar emoji de iguana al portapapeles"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedIguana ? '¡Iguana copiada!' : 'Copiar 🦎'}</span>
              </button>
            </div>
          </div>
        )}

        {itemType === 'article' && (
          <div className="mb-4 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-muted flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-ink">Regla de oro de la comunidad: </span>
              Al publicar tu artículo, recuerda leer y dejar feedback en el de otro compañero. Una comunidad real es dar y recibir, no solo pedir.
            </div>
          </div>
        )}

        {itemType === 'wishlist' && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-muted flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-ink">Solo ingresa el enlace de tu deseo: </span>
              Pega la URL de tu propuesta en AWS Wishlist para que la comunidad vote y te ayude a llegar a oídos del equipo de AWS.
            </div>
          </div>
        )}

        {validationError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* MODO RÁPIDO: Wishlist y Comentarios (Solo el enlace directo) */}
          {isQuickLinkType ? (
            <>
              {/* Enlace directo como campo principal */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1 flex items-center gap-1">
                  <LinkIcon className={`w-3.5 h-3.5 ${itemType === 'wishlist' ? 'text-amber-400' : 'text-emerald-400'}`} />
                  <span>
                    {itemType === 'wishlist'
                      ? 'Enlace directo al deseo en AWS Wishlist *'
                      : 'Enlace al comentario en AWS Builder Center *'}
                  </span>
                </label>
                <input
                  type="url"
                  value={builderUrl}
                  onChange={(e) => setBuilderUrl(e.target.value)}
                  placeholder={
                    itemType === 'wishlist'
                      ? 'https://builder.aws.com/wishlist/3IOUvq66za4u348ILRaakYa5dhW_w/...'
                      : 'https://builder.aws.com/comment/... o enlace del artículo comentado'
                  }
                  className={`w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-ink placeholder:text-muted/60 font-mono transition-colors focus:outline-none ${
                    itemType === 'wishlist' ? 'focus:border-amber-500' : 'focus:border-emerald-500'
                  }`}
                  required
                  autoFocus
                />
                <p className="text-[10px] text-muted mt-1">
                  {itemType === 'wishlist'
                    ? 'Pega el enlace directo de tu propuesta en la Wishlist de AWS.'
                    : 'Pega el enlace donde comentaste para que la comunidad pueda leer tu feedback.'}
                </p>
              </div>

              {/* Opciones avanzadas opcionales (colapsadas) */}
              <details className="pt-1 text-xs text-muted group">
                <summary className={`cursor-pointer font-semibold text-ink transition-colors py-1 select-none ${
                  itemType === 'wishlist' ? 'hover:text-amber-400' : 'hover:text-emerald-400'
                }`}>
                  + Agregar título o notas adicionales (Opcional)
                </summary>
                <div className="space-y-3 pt-3 pl-2 border-l-2 border-border/60 mt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-ink mb-1">
                      {itemType === 'wishlist'
                        ? 'Título de la Propuesta (Opcional - se autoextrae de la URL)'
                        : 'Tema o nota breve (Opcional)'}
                    </label>
                    <input
                      type="text"
                      value={title}
                      maxLength={140}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={
                        itemType === 'wishlist'
                          ? 'Ej. Offline SLM Bedrock model deployment on Greengrass'
                          : 'Ej. Feedback sobre migración serverless'
                      }
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-ink mb-1">
                      {itemType === 'wishlist'
                        ? '¿Por qué AWS debería construir esto?'
                        : 'Extracto breve de tu comentario'}
                    </label>
                    <textarea
                      value={summary}
                      maxLength={300}
                      onChange={(e) => setSummary(e.target.value)}
                      rows={2}
                      placeholder={
                        itemType === 'wishlist'
                          ? 'Explica el problema o limitación actual...'
                          : 'Breve nota sobre qué te gustó o qué sugeriste...'
                      }
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink resize-none focus:outline-none"
                    />
                  </div>
                </div>
              </details>
            </>
          ) : (
            <>
              {/* Formulario completo para Artículos Técnicos */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-ink flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                    <span>Título del Artículo *</span>
                  </label>
                  <span className={`text-[10px] font-mono ${title.length > 120 ? 'text-amber-400 font-semibold' : 'text-muted'}`}>
                    {title.length}/140
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  maxLength={140}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. ¿Ya tienes tu mes de Kiro Pro gratis? (Incluso un año...)"
                  className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              {/* Categoría Oficial AWS */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Categoría Oficial de AWS *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AWSCategory)}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-purple-500 transition-colors"
                >
                  {AWS_CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resumen o Aprendizaje */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-ink">
                    Resumen breve / ¿Qué aprenderá la comunidad?
                  </label>
                  <span className={`text-[10px] font-mono ${summary.length > 270 ? 'text-amber-400 font-bold' : 'text-muted'}`}>
                    {summary.length}/300 máx
                  </span>
                </div>
                <textarea
                  value={summary}
                  maxLength={300}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  placeholder="Explica en 2 líneas qué construiste, qué se rompió o qué aprendiste..."
                  className="w-full bg-surface border border-border rounded-xl px-3.5 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              {/* Enlace en AWS Builder Center */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
                  <span>Enlace al artículo en AWS Builder Center / Community *</span>
                </label>
                <input
                  type="url"
                  value={builderUrl}
                  onChange={(e) => setBuilderUrl(e.target.value)}
                  placeholder="https://builder.aws.com/content/... o https://community.aws/@..."
                  className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 font-mono transition-colors"
                  required
                />
              </div>

              {/* Difusión en Redes */}
              <div className="pt-2 border-t border-border">
                <label className="block text-xs font-semibold text-ink mb-2 flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Enlaces de Difusión (Opcionales para likes y reposts)</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="url"
                    value={linkedinPostUrl}
                    onChange={(e) => setLinkedinPostUrl(e.target.value)}
                    placeholder="URL LinkedIn (opcional)"
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 font-mono transition-colors"
                  />
                  <input
                    type="url"
                    value={instagramPostUrl}
                    onChange={(e) => setInstagramPostUrl(e.target.value)}
                    placeholder="URL Instagram (opcional)"
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 font-mono transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {/* Acciones */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border text-muted hover:text-ink hover:bg-surface-hover transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
                itemType === 'wishlist'
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  : itemType === 'comment'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'btn-primary-gradient text-white'
              }`}
            >
              {isEditing ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </>
              ) : (
                <span>
                  {itemType === 'wishlist'
                    ? 'Publicar Wishlist'
                    : itemType === 'comment'
                    ? 'Publicar Comentario'
                    : 'Publicar Artículo'}
                </span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
