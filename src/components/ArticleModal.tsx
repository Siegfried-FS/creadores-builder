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
  ShieldCheck,
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
    }
  }, [isOpen, initialArticle]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError('Por favor escribe un título.');
      return;
    }

    const trimmedUrl = builderUrl.trim();

    // Validar según el tipo de publicación
    if (itemType === 'wishlist') {
      const wishValidation = isValidWishlistUrl(trimmedUrl);
      if (!wishValidation.isValid) {
        setValidationError(wishValidation.error || 'La URL de la Wishlist no es válida');
        return;
      }
    } else if (itemType === 'comment') {
      const commentValidation = isValidCommentUrl(trimmedUrl);
      if (!commentValidation.isValid) {
        setValidationError(commentValidation.error || 'La URL del comentario no es válida');
        return;
      }
    } else {
      const urlValidation = isValidAWSArticleUrl(trimmedUrl);
      if (!urlValidation.isValid) {
        setValidationError(urlValidation.error || 'La URL del artículo no es válida');
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

    // Enviar publicación heredando automáticamente los datos del perfil del autor
    onSubmit({
      id: initialArticle?.id,
      itemType,
      title: title.trim().slice(0, 140),
      summary: summary.trim().slice(0, 300),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl glass-card border border-border p-5 sm:p-6 shadow-2xl">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-muted hover:text-ink hover:bg-surface-hover transition-colors"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-ink">
              {isEditing ? 'Editar Publicación' : 'Nueva Publicación en el Hub'}
            </h2>
            <p className="text-xs text-muted">
              {isEditing
                ? 'Actualiza los enlaces o información de tu publicación'
                : 'Impulsa las 21 misiones de AWS Builder Center con apoyo de la comunidad'}
            </p>
          </div>
        </div>

        {/* 🌟 Selector de Tipo: Artículo vs Wishlist vs Comentarios de Valor */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-ink mb-2">
            ¿Qué deseas compartir hoy en la comunidad?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setItemType('article')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                itemType === 'article'
                  ? 'border-purple-500 bg-purple-500/15 text-purple-400 shadow-sm'
                  : 'border-border bg-surface hover:bg-surface-hover text-muted'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0 text-purple-400" />
              <div>
                <div className="font-bold">Artículo</div>
                <div className="text-[10px] opacity-75">Tutorial / Guía</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setItemType('wishlist')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                itemType === 'wishlist'
                  ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-sm'
                  : 'border-border bg-surface hover:bg-surface-hover text-muted'
              }`}
            >
              <Lightbulb className="w-4 h-4 shrink-0 text-amber-400" />
              <div>
                <div className="font-bold">Wishlist</div>
                <div className="text-[10px] opacity-75">Propuesta AWS</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setItemType('comment')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                itemType === 'comment'
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-sm'
                  : 'border-border bg-surface hover:bg-surface-hover text-muted'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0 text-emerald-400" />
              <div>
                <div className="font-bold">Comentario</div>
                <div className="text-[10px] opacity-75">Feedback de valor</div>
              </div>
            </button>
          </div>
        </div>

        {/* 💡 Guía según el tipo seleccionado (Inspiración Del Toro / AWS Content Creator) */}
        {itemType === 'wishlist' && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-muted leading-relaxed">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-ink">Misión Wishlist (Idea Crafter): </span>
              Comparte tu propuesta en la lista de deseos de AWS Builder Center. La comunidad votará tu idea para que los ingenieros de producto de AWS escuchen las necesidades de LATAM.
            </div>
          </div>
        )}

        {itemType === 'comment' && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-muted leading-relaxed">
            <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-ink">Filosofía Del Toro (Cero comentarios vacíos): </span>
              Un simple <em>"nice post"</em> no ayuda a nadie a crecer. Comparte comentarios donde des feedback honesto, hagas preguntas de arquitectura o compartas qué falló en tu experiencia real para ganar likes legítimos.
            </div>
          </div>
        )}

        {/* Estado permanente */}
        <div className="mb-4 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2 text-[11px] text-muted">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
          <span>
            <strong className="text-ink">Publicación Permanente:</strong> Esta contribución permanecerá siempre visible en el Hub para apoyar tu historial en las 21 misiones.
          </span>
        </div>

        {/* Autor vinculado automáticamente */}
        <div className="mb-5 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center gap-3">
          <img
            src={author.avatarUrl || '/images/mascot_opt.png'}
            alt={author.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/mascot_opt.png';
            }}
            className="w-9 h-9 rounded-full object-cover border border-purple-500/30"
          />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-muted uppercase font-bold tracking-wider">
              {isEditing ? 'Editando como' : 'Publicando como'}
            </div>
            <div className="text-xs font-bold text-ink truncate">
              {author.name}
            </div>
            {author.builderHandle && (
              <div className="text-[11px] text-purple-400 font-mono truncate">
                @{author.builderHandle}
              </div>
            )}
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full badge-accent">
            Perfil Verificado
          </span>
        </div>

        {validationError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Título */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-ink flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  {itemType === 'wishlist'
                    ? 'Título de la Propuesta en Wishlist *'
                    : itemType === 'comment'
                    ? 'Tema del Debate o Artículo Comentado *'
                    : 'Título del Artículo *'}
                </span>
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
              placeholder={
                itemType === 'wishlist'
                  ? 'Ej. Offline SLM Bedrock model deployment and local inference on Greengrass'
                  : itemType === 'comment'
                  ? 'Ej. Feedback sobre migración de bases de datos a Aurora Serverless v2'
                  : 'Ej. ¿Ya tienes tu mes de Kiro Pro gratis? (Incluso un año...)'
              }
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
                {itemType === 'wishlist'
                  ? '¿Por qué AWS debería construir esto y qué problema resuelve?'
                  : itemType === 'comment'
                  ? 'Extracto de tu comentario o feedback aportado'
                  : 'Resumen breve / ¿Qué aprenderá la comunidad?'}
              </label>
              <span className={`text-[10px] font-mono ${summary.length > 270 ? 'text-amber-400 font-bold' : 'text-muted'}`}>
                {summary.length}/300 máx
              </span>
            </div>
            <textarea
              value={summary}
              maxLength={300}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder={
                itemType === 'wishlist'
                  ? 'Explica el caso de uso concreto, limitaciones actuales y por qué beneficia a desarrolladores en LATAM...'
                  : itemType === 'comment'
                  ? 'Comparte el núcleo de tu aporte o pregunta técnica para invitar a la comunidad a continuar el debate...'
                  : 'Explica en 2 líneas qué construiste, qué se rompió o qué aprendiste...'
              }
              className="w-full bg-surface border border-border rounded-xl px-3.5 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          {/* Enlace en AWS Builder Center */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>
                {itemType === 'wishlist'
                  ? 'Enlace al deseo en AWS Wishlist *'
                  : itemType === 'comment'
                  ? 'Enlace directo al comentario con ancla *'
                  : 'Enlace al artículo en AWS Builder Center / Community *'}
              </span>
            </label>
            <input
              type="url"
              value={builderUrl}
              onChange={(e) => setBuilderUrl(e.target.value)}
              placeholder={
                itemType === 'wishlist'
                  ? 'https://builder.aws.com/wishlist/3IOUvq66za4u348ILRaakYa5dhW_w/offline-slm-bedrock...'
                  : itemType === 'comment'
                  ? 'https://builder.aws.com/comment/3M55nfbgkkjc8d1Yc3rHogivOu3#comments'
                  : 'https://builder.aws.com/content/... o https://community.aws/@...'
              }
              className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 font-mono transition-colors"
              required
            />
            <p className="text-[10px] text-muted mt-1">
              {itemType === 'wishlist'
                ? 'Debe ser un enlace que comience con https://builder.aws.com/wishlist/'
                : itemType === 'comment'
                ? 'Debe ser un enlace directo a un comentario oficial en builder.aws.com'
                : 'Permite enlaces de community.aws o builder.aws.com.'}
            </p>
          </div>

          {/* Difusión en Redes */}
          <div className="pt-2 border-t border-border">
            <label className="block text-xs font-semibold text-ink mb-2 flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Enlaces de Difusión (Para dar likes y reposts)</span>
            </label>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-muted mb-1">
                  Enlace del post en LinkedIn (Opcional)
                </label>
                <input
                  type="url"
                  value={linkedinPostUrl}
                  onChange={(e) => setLinkedinPostUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/posts/... o https://lnkd.in/..."
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-muted mb-1">
                  Enlace del post en Instagram (Opcional)
                </label>
                <input
                  type="url"
                  value={instagramPostUrl}
                  onChange={(e) => setInstagramPostUrl(e.target.value)}
                  placeholder="https://www.instagram.com/p/..."
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 font-mono transition-colors"
                />
              </div>
            </div>
          </div>

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
              className="btn-primary-gradient px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              {isEditing ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </>
              ) : (
                <span>Publicar en el Hub</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
