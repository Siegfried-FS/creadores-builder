import { useState, useEffect, type FC, type FormEvent } from 'react';
import { X, Sparkles, AlertCircle, Bookmark, Link as LinkIcon, Share2, Clock, Check } from 'lucide-react';
import type { Article, AWSCategory, CreatorProfile } from '../types';
import { AWS_CATEGORIES } from '../data/categories';
import { isValidAWSArticleUrl, isValidLinkedInPostUrl } from '../utils/sanitizer';

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
        setTitle(initialArticle.title || '');
        setSummary(initialArticle.summary || '');
        setCategory(initialArticle.category || 'Developer Tools');
        setBuilderUrl(initialArticle.builderUrl || '');
        setLinkedinPostUrl(initialArticle.linkedinPostUrl || '');
        setInstagramPostUrl(initialArticle.instagramPostUrl || '');
      } else {
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
      setValidationError('Por favor escribe el título del artículo.');
      return;
    }

    // Validar URL de AWS Builder Center
    const urlValidation = isValidAWSArticleUrl(builderUrl.trim());
    if (!urlValidation.isValid) {
      setValidationError(urlValidation.error || 'La URL del artículo no es válida');
      return;
    }

    // Validar URL de LinkedIn si se ingresó
    if (linkedinPostUrl.trim()) {
      const linkedInValidation = isValidLinkedInPostUrl(linkedinPostUrl.trim());
      if (!linkedInValidation.isValid) {
        setValidationError(linkedInValidation.error || 'URL de LinkedIn no válida');
        return;
      }
    }

    // Enviar artículo heredando automáticamente los datos del perfil del autor
    onSubmit({
      id: initialArticle?.id,
      title: title.trim().slice(0, 120),
      summary: summary.trim().slice(0, 220),
      category,
      builderUrl: builderUrl.trim(),
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
              {isEditing ? 'Editar Artículo en el Hub' : 'Publicar Artículo en el Hub'}
            </h2>
            <p className="text-xs text-muted">
              {isEditing
                ? 'Actualiza los enlaces o la información de tu publicación'
                : 'Comparte tu contenido técnico para recibir apoyo de la comunidad'}
            </p>
          </div>
        </div>

        {/* ⏱️ Aviso claro sobre los 30 días de vigencia (TTL deslizante) */}
        <div className="mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-xs text-muted leading-relaxed">
            <span className="font-bold text-ink">Vigencia de 30 días deslizantes: </span>
            Tu publicación estará activa en el Hub durante 30 días exactos para mantener el contenido siempre fresco y dinámico. Al cumplirse el plazo, se depura automáticamente mediante TTL en Amazon DynamoDB.
          </div>
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
          
          {/* Título del artículo */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-ink flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                <span>Título del Artículo *</span>
              </label>
              <span className={`text-[10px] font-mono ${title.length > 100 ? 'text-amber-400 font-semibold' : 'text-muted'}`}>
                {title.length}/120
              </span>
            </div>
            <input
              type="text"
              value={title}
              maxLength={120}
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

          {/* Resumen / Aprendizaje clave con límite de caracteres para no romper la retícula */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-ink">
                Resumen breve / ¿Qué aprenderá la comunidad?
              </label>
              <span className={`text-[10px] font-mono ${summary.length > 200 ? 'text-amber-400 font-bold' : 'text-muted'}`}>
                {summary.length}/220 máx
              </span>
            </div>
            <textarea
              value={summary}
              maxLength={220}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder="Explica en 2 líneas qué construiste, qué se rompió o qué aprendiste (máx. 220 caracteres)..."
              className="w-full bg-surface border border-border rounded-xl px-3.5 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
            <p className="text-[10px] text-muted mt-1">
              Mantén el resumen conciso para que se adapte perfectamente a la cuadrícula de lectura.
            </p>
          </div>

          {/* Enlace al Artículo en AWS Builder Center */}
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
            <p className="text-[10px] text-muted mt-1">
              Permite enlaces oficiales de <code className="text-purple-400">community.aws</code> o <code className="text-purple-400">builder.aws.com</code>.
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
                  Enlace del post en LinkedIn
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
                <span>Publicar Artículo</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
