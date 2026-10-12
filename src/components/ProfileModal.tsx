import { useState, type FC, type FormEvent } from 'react';
import { X, User, Edit3, PlusCircle, AtSign, Check, ExternalLink } from 'lucide-react';
import type { CreatorProfile } from '../types';
import { formatBuilderUrl, formatLinkedInUrl, formatInstagramUrl, cleanUsername } from '../utils/sanitizer';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CreatorProfile;
  onUpdateUser: (updatedUser: CreatorProfile) => void;
  onOpenPublishArticle: () => void;
}

export const ProfileModal: FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onOpenPublishArticle,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [builderHandle, setBuilderHandle] = useState(currentUser.builderHandle || '');
  const [linkedinUrl, setLinkedinUrl] = useState(currentUser.linkedinUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(currentUser.instagramUrl || '');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    const cleanHandle = cleanUsername(builderHandle || name);
    const updated: CreatorProfile = {
      ...currentUser,
      name: name.trim(),
      bio: bio.trim(),
      builderHandle: cleanHandle,
      builderUrl: formatBuilderUrl(builderHandle || cleanHandle),
      linkedinUrl: linkedinUrl ? formatLinkedInUrl(linkedinUrl) : undefined,
      instagramUrl: instagramUrl ? formatInstagramUrl(instagramUrl) : undefined,
    };

    onUpdateUser(updated);
    setIsEditing(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl glass-card border border-border p-6 shadow-2xl">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-muted hover:text-ink hover:bg-surface-hover transition-colors"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado del Perfil */}
        <div className="flex items-start gap-4 mb-6">
          <div className="relative w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 overflow-hidden shrink-0">
            <img
              src={currentUser.avatarUrl || '/images/mascot_opt.png'}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-ink truncate">
                {currentUser.name}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full badge-accent uppercase tracking-wider">
                Creador
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5 line-clamp-2">
              {currentUser.bio || 'Miembro del Bootcamp AWS Builder Center'}
            </p>
            {currentUser.email && (
              <p className="text-[11px] text-muted/80 font-mono mt-0.5">
                {currentUser.email}
              </p>
            )}
          </div>
        </div>

        {savedNotice && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Perfil actualizado exitosamente.</span>
          </div>
        )}

        {/* Acción Principal: Publicar Artículo desde su Perfil */}
        <div className="mb-6 p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-sm text-ink">
              ¿Escribiste un nuevo artículo?
            </h3>
            <p className="text-xs text-muted">
              Súmalo al Hub para que la comunidad te apoye en Builder Center y LinkedIn.
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenPublishArticle();
            }}
            className="btn-primary-gradient px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 flex items-center justify-center gap-2 shadow-lg"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publicar Artículo</span>
          </button>
        </div>

        {/* Datos y Redes Sociales */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-sm text-ink flex items-center gap-1.5">
              <User className="w-4 h-4 text-purple-400" />
              <span>Mis Redes y Enlaces de Autor</span>
            </h3>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancelar' : 'Editar Datos'}</span>
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-muted mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted mb-1">
                  Biografía / Rol Comunitario
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="Ej. Líder de AWS UG Playa Vicente, Carpintero..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted mb-1">
                  Perfil de AWS Builder Center (Handle o URL)
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted" />
                  <input
                    type="text"
                    value={builderHandle}
                    onChange={(e) => setBuilderHandle(e.target.value)}
                    placeholder="@siegfried_fs"
                    className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-ink focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted mb-1">
                  Perfil de LinkedIn (URL o handle)
                </label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/in/usuario"
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted mb-1">
                  Perfil de Instagram (Opcional)
                </label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="@usuario o link"
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl border border-border text-xs text-muted hover:text-ink transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary-gradient px-4 py-1.5 rounded-xl text-xs font-bold"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-surface-hover border border-border flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-muted uppercase font-bold tracking-wider">
                    AWS Builder Center
                  </div>
                  <div className="text-xs font-semibold text-ink">
                    {currentUser.builderHandle ? `@${currentUser.builderHandle}` : 'No configurado'}
                  </div>
                </div>
                {currentUser.builderUrl && (
                  <a
                    href={currentUser.builderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-border hover:border-purple-500/50 text-muted hover:text-purple-400 transition-colors"
                    title="Ver perfil en AWS"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="p-3 rounded-xl bg-surface-hover border border-border flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-muted uppercase font-bold tracking-wider">
                    LinkedIn
                  </div>
                  <div className="text-xs font-semibold text-ink truncate max-w-[280px]">
                    {currentUser.linkedinUrl || 'No configurado'}
                  </div>
                </div>
                {currentUser.linkedinUrl && (
                  <a
                    href={currentUser.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-border hover:border-purple-500/50 text-muted hover:text-purple-400 transition-colors"
                    title="Ver LinkedIn"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {currentUser.instagramUrl && (
                <div className="p-3 rounded-xl bg-surface-hover border border-border flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-muted uppercase font-bold tracking-wider">
                      Instagram
                    </div>
                    <div className="text-xs font-semibold text-ink truncate max-w-[280px]">
                      {currentUser.instagramUrl}
                    </div>
                  </div>
                  <a
                    href={currentUser.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-border hover:border-purple-500/50 text-muted hover:text-purple-400 transition-colors"
                    title="Ver Instagram"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
