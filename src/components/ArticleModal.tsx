import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import { X, Sparkles, Globe, FileText } from 'lucide-react';
import type { Article, AWSCategory } from '../types';
import { AWS_CATEGORIES } from '../data/categories';

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (articleData: Partial<Article>) => void;
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

export const ArticleModal: FC<ArticleModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  // Datos del creador
  const [authorName, setAuthorName] = useState('Roberto Flores');
  const [authorBio, setAuthorBio] = useState('Carpintero & Líder AWS UG Playa Vicente');
  const [authorBuilderUrl, setAuthorBuilderUrl] = useState('https://community.aws/@siegfried_fs');
  const [authorLinkedinUrl, setAuthorLinkedinUrl] = useState('https://www.linkedin.com/in/roberto-flores-carpintero');
  const [authorInstagramUrl, setAuthorInstagramUrl] = useState('');

  // Datos del artículo
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<AWSCategory>('Developer Tools');
  const [builderUrl, setBuilderUrl] = useState('');
  const [linkedinPostUrl, setLinkedinPostUrl] = useState('');
  const [instagramPostUrl, setInstagramPostUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      const savedCreator = localStorage.getItem('creador_info');
      if (savedCreator) {
        try {
          const parsed = JSON.parse(savedCreator);
          if (parsed.authorName) setAuthorName(parsed.authorName);
          if (parsed.authorBio) setAuthorBio(parsed.authorBio);
          if (parsed.authorBuilderUrl) setAuthorBuilderUrl(parsed.authorBuilderUrl);
          if (parsed.authorLinkedinUrl) setAuthorLinkedinUrl(parsed.authorLinkedinUrl);
          if (parsed.authorInstagramUrl) setAuthorInstagramUrl(parsed.authorInstagramUrl);
        } catch {
          // ignore
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !builderUrl.trim() || !authorName.trim()) {
      alert('Por favor completa al menos tu nombre, el título y el enlace a tu artículo en AWS.');
      return;
    }

    localStorage.setItem(
      'creador_info',
      JSON.stringify({
        authorName,
        authorBio,
        authorBuilderUrl,
        authorLinkedinUrl,
        authorInstagramUrl
      })
    );

    onSubmit({
      title: title.trim(),
      summary: summary.trim(),
      category,
      builderUrl: builderUrl.trim(),
      linkedinPostUrl: linkedinPostUrl.trim() || undefined,
      instagramPostUrl: instagramPostUrl.trim() || undefined,
      authorName: authorName.trim(),
      authorBio: authorBio.trim() || undefined,
      authorAvatarUrl: '/images/mascot_opt.png',
      authorBuilderUrl: authorBuilderUrl.trim() || builderUrl.trim(),
      authorLinkedinUrl: authorLinkedinUrl.trim() || undefined,
      authorInstagramUrl: authorInstagramUrl.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Cabecera del Modal */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-surface-hover/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-ink">
                Sumar Artículo al Hub de Creadores
              </h2>
              <p className="text-xs text-muted">
                Comparte tu contenido técnico para que la comunidad lo lea y apoye.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-ink hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* SECCIÓN 1: DATOS DEL CREADOR */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block mb-3">
              1. Tus Datos como Creador
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-ink mb-1">Nombre completo *</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Ej: Roberto Flores"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-border bg-background text-ink focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">Rol / Bio breve</label>
                <input
                  type="text"
                  value={authorBio}
                  onChange={(e) => setAuthorBio(e.target.value)}
                  placeholder="Ej: Líder AWS UG Playa Vicente | Builder"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-border bg-background text-ink focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-orange-500" />
                  Perfil AWS Builder Center
                </label>
                <input
                  type="url"
                  value={authorBuilderUrl}
                  onChange={(e) => setAuthorBuilderUrl(e.target.value)}
                  placeholder="https://community.aws/@tu_usuario"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-border bg-background text-ink focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1">
                  <LinkedinIcon className="w-3.5 h-3.5 text-blue-500" />
                  Perfil de LinkedIn
                </label>
                <input
                  type="url"
                  value={authorLinkedinUrl}
                  onChange={(e) => setAuthorLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/tu_usuario"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-border bg-background text-ink focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            {/* SECCIÓN 2: DATOS DEL ARTÍCULO */}
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block mb-3">
              2. Tu Artículo y Redes de Difusión
            </span>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  Título del artículo *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Cómo configurar IAM Identity Center sin gastar de tu bolsillo"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-border bg-background text-ink focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">Categoría oficial AWS</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AWSCategory)}
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-border bg-background text-ink focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    {AWS_CATEGORIES.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-orange-500" />
                    Enlace al artículo (AWS Builder Center) *
                  </label>
                  <input
                    type="url"
                    required
                    value={builderUrl}
                    onChange={(e) => setBuilderUrl(e.target.value)}
                    placeholder="https://community.aws/content/..."
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-border bg-background text-ink focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1">Resumen breve (de qué trata)</label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Explica en 1 o 2 líneas el problema real que solucionas..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-border bg-background text-ink focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1">
                    <LinkedinIcon className="w-3.5 h-3.5 text-blue-500" />
                    Enlace al post en LinkedIn (para apoyarte con like)
                  </label>
                  <input
                    type="url"
                    value={linkedinPostUrl}
                    onChange={(e) => setLinkedinPostUrl(e.target.value)}
                    placeholder="https://linkedin.com/feed/update/..."
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-border bg-background text-ink focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1 flex items-center gap-1">
                    <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                    Enlace al post en Instagram (opcional)
                  </label>
                  <input
                    type="url"
                    value={instagramPostUrl}
                    onChange={(e) => setInstagramPostUrl(e.target.value)}
                    placeholder="https://instagram.com/p/..."
                    className="w-full text-sm px-3.5 py-2 rounded-xl border border-border bg-background text-ink focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted hover:text-ink transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-md"
            >
              Publicar en el Hub
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
