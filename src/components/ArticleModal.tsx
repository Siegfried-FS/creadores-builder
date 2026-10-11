import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import { X, AlertCircle, Link as LinkIcon } from 'lucide-react';
import type { Article, AWSCategory, CreatorProfile } from '../types';
import { AWS_CATEGORIES } from '../data/categories';
import { isValidAWSArticleUrl, isValidLinkedInPostUrl } from '../utils/sanitizer';

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (articleData: Partial<Article>) => void;
  currentUser: CreatorProfile;
  initialArticle?: Article | null;
}

export const ArticleModal: FC<ArticleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  initialArticle,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AWSCategory>('Security, Identity & Compliance');
  const [builderUrl, setBuilderUrl] = useState('');
  const [linkedinPostUrl, setLinkedinPostUrl] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialArticle) {
      setTitle(initialArticle.title);
      setCategory(initialArticle.category);
      setBuilderUrl(initialArticle.builderUrl);
      setLinkedinPostUrl(initialArticle.linkedinPostUrl || '');
    } else {
      setTitle('');
      setCategory('Security, Identity & Compliance');
      setBuilderUrl('');
      setLinkedinPostUrl('');
    }
    setErrors({});
  }, [initialArticle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'El título del artículo es requerido';
    }

    const builderValidation = isValidAWSArticleUrl(builderUrl);
    if (!builderValidation.isValid) {
      newErrors.builderUrl = builderValidation.error || 'URL no válida';
    }

    if (linkedinPostUrl.trim()) {
      const liValidation = isValidLinkedInPostUrl(linkedinPostUrl);
      if (!liValidation.isValid) {
        newErrors.linkedinPostUrl = liValidation.error || 'URL no válida';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      id: initialArticle ? initialArticle.id : undefined,
      title: title.trim(),
      category,
      builderUrl: builderUrl.trim(),
      linkedinPostUrl: linkedinPostUrl.trim() || undefined,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorBuilderHandle: currentUser.builderHandle,
      authorAvatarUrl: currentUser.avatarUrl,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 border border-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden transition-all">
        
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-slate-50 dark:bg-gray-800/50">
          <div>
            <h2 className="font-display font-bold text-lg text-ink">
              {initialArticle ? 'Editar Publicación' : 'Subir Artículo de AWS Builder Center'}
            </h2>
            <p className="text-xs text-muted">
              Comparte tu contenido con la comunidad del bootcamp y recibe apoyo mutuo.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted hover:text-ink rounded-lg hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Título del Artículo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Implementando RAG Serverless con Amazon Bedrock"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-aws-orange/50 transition-all"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.title}
              </p>
            )}
          </div>

          {/* Categoría Oficial de AWS */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Categoría Oficial de AWS Community Builders <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AWSCategory)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-aws-orange/50 transition-all"
            >
              {AWS_CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* URL del Artículo de Builder Center */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Enlace de tu Artículo (AWS Builder Center) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={builderUrl}
                onChange={(e) => setBuilderUrl(e.target.value)}
                placeholder="https://community.aws/content/tu-articulo..."
                className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-aws-orange/50 transition-all font-mono"
              />
              <LinkIcon className="w-4 h-4 text-muted absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-muted mt-1">
              Debe ser la URL completa de <code className="bg-slate-100 dark:bg-gray-800 px-1 py-0.5 rounded">community.aws</code> o <code className="bg-slate-100 dark:bg-gray-800 px-1 py-0.5 rounded">builder.aws.com</code>.
            </p>
            {errors.builderUrl && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.builderUrl}
              </p>
            )}
          </div>

          {/* URL opcional del post de LinkedIn */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Enlace del Post en LinkedIn <span className="text-muted font-normal">(Opcional)</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={linkedinPostUrl}
                onChange={(e) => setLinkedinPostUrl(e.target.value)}
                placeholder="https://www.linkedin.com/posts/..."
                className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-aws-orange/50 transition-all font-mono"
              />
              <LinkIcon className="w-4 h-4 text-muted absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-muted mt-1">
              Pega el enlace si hiciste una publicación promocional para que los compañeros te dejen comentarios y reacciones.
            </p>
            {errors.linkedinPostUrl && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.linkedinPostUrl}
              </p>
            )}
          </div>

          {/* Preview del autor */}
          <div className="p-3 bg-slate-50 dark:bg-gray-800/40 rounded-xl border border-border/80 flex items-center justify-between text-xs">
            <span className="text-muted">Publicando como:</span>
            <span className="font-semibold text-ink flex items-center gap-1">
              {currentUser.name} <span className="font-mono text-muted text-[11px]">(@{currentUser.builderHandle})</span>
            </span>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-border hover:bg-slate-100 dark:hover:bg-gray-800 text-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-aws-orange hover:bg-amber-600 text-white shadow-md hover:shadow-lg transition-all"
            >
              {initialArticle ? 'Guardar Cambios' : 'Publicar Artículo'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
