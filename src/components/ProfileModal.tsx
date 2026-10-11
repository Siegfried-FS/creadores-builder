import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { X, CheckCircle } from 'lucide-react';
import type { CreatorProfile } from '../types';
import { cleanUsername, formatBuilderUrl, formatLinkedInUrl, formatInstagramUrl } from '../utils/sanitizer';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CreatorProfile;
  onSaveProfile: (updatedProfile: CreatorProfile) => void;
}

export const ProfileModal: FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [builderHandle, setBuilderHandle] = useState(currentUser.builderHandle);
  const [linkedinHandle, setLinkedinHandle] = useState(currentUser.linkedinHandle || '');
  const [instagramHandle, setInstagramHandle] = useState(currentUser.instagramHandle || '');

  if (!isOpen) return null;

  const handleSave = (e: FormEvent) => {
    e.preventDefault();

    const sanitizedBuilder = cleanUsername(builderHandle);
    const sanitizedLinkedin = cleanUsername(linkedinHandle);
    const sanitizedInstagram = cleanUsername(instagramHandle);

    const updated: CreatorProfile = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      builderHandle: sanitizedBuilder || currentUser.builderHandle,
      builderUrl: formatBuilderUrl(sanitizedBuilder),
      linkedinHandle: sanitizedLinkedin,
      linkedinUrl: formatLinkedInUrl(sanitizedLinkedin),
      instagramHandle: sanitizedInstagram,
      instagramUrl: formatInstagramUrl(sanitizedInstagram),
    };

    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-slate-50 dark:bg-gray-800/50">
          <div>
            <h2 className="font-display font-bold text-lg text-ink">
              Mi Perfil de Creador
            </h2>
            <p className="text-xs text-muted">
              Solo ingresa tu usuario; el sistema sanitiza y autocompleta los enlaces oficiales.
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
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {/* Nombre completo */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Nombre o Alias en la Comunidad
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-aws-orange/50"
            />
          </div>

          {/* Builder Center Handle */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Usuario de AWS Builder Center / Community
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-muted font-mono text-sm">@</span>
              <input
                type="text"
                value={builderHandle}
                onChange={(e) => setBuilderHandle(e.target.value)}
                placeholder="siegfried_fs"
                className="w-full text-sm pl-8 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink font-mono focus:outline-none focus:ring-2 focus:ring-aws-orange/50"
              />
            </div>
            {builderHandle && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <CheckCircle className="w-3 h-3" />
                <span>URL generada: {formatBuilderUrl(builderHandle)}</span>
              </p>
            )}
          </div>

          {/* LinkedIn Handle */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Usuario o Slug de LinkedIn
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-muted font-mono text-xs">in/</span>
              <input
                type="text"
                value={linkedinHandle}
                onChange={(e) => setLinkedinHandle(e.target.value)}
                placeholder="roberto-flores-carpintero"
                className="w-full text-sm pl-8 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink font-mono focus:outline-none focus:ring-2 focus:ring-aws-orange/50"
              />
            </div>
            {linkedinHandle && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <CheckCircle className="w-3 h-3" />
                <span>URL generada: {formatLinkedInUrl(linkedinHandle)}</span>
              </p>
            )}
          </div>

          {/* Instagram Handle */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Usuario de Instagram
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-muted font-mono text-sm">@</span>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="siegfried_fs"
                className="w-full text-sm pl-8 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-ink font-mono focus:outline-none focus:ring-2 focus:ring-aws-orange/50"
              />
            </div>
            {instagramHandle && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <CheckCircle className="w-3 h-3" />
                <span>URL generada: {formatInstagramUrl(instagramHandle)}</span>
              </p>
            )}
          </div>

          {/* Actions */}
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
              Guardar Perfil
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
