import { useState, useEffect, useRef, type FC, type FormEvent } from 'react';
import { X, User, Edit3, PlusCircle, AtSign, Check, ExternalLink, Camera, Image as ImageIcon, Trash2, AlertTriangle } from 'lucide-react';
import type { CreatorProfile } from '../types';
import { formatBuilderUrl, formatLinkedInUrl, formatInstagramUrl, formatGitHubUrl, cleanUsername } from '../utils/sanitizer';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CreatorProfile;
  onUpdateUser: (updatedUser: CreatorProfile) => void;
  onOpenPublishArticle: () => void;
  onDeleteAccount?: (userId: string) => void;
}

export const ProfileModal: FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onOpenPublishArticle,
  onDeleteAccount,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '/images/mascot_opt.png');
  const [builderHandle, setBuilderHandle] = useState(currentUser.builderHandle || '');
  const [linkedinUrl, setLinkedinUrl] = useState(currentUser.linkedinUrl || '');
  const [githubUrl, setGithubUrl] = useState(currentUser.githubUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(currentUser.instagramUrl || '');
  const [savedNotice, setSavedNotice] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar estado cuando se abre el modal o cambia el usuario
  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '');
      setBio(currentUser.bio || '');
      setAvatarUrl(currentUser.avatarUrl || '/images/mascot_opt.png');
      setBuilderHandle(currentUser.builderHandle || '');
      setLinkedinUrl(currentUser.linkedinUrl || '');
      setGithubUrl(currentUser.githubUrl || '');
      setInstagramUrl(currentUser.instagramUrl || '');
      setIsConfirmingDelete(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Manejo de carga de foto de perfil
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('La foto debe pesar menos de 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    const cleanHandle = cleanUsername(builderHandle || name);
    const updated: CreatorProfile = {
      ...currentUser,
      name: name.trim().slice(0, 50),
      bio: bio.trim().slice(0, 100),
      avatarUrl: avatarUrl || '/images/mascot_opt.png',
      builderHandle: cleanHandle,
      builderUrl: formatBuilderUrl(builderHandle || cleanHandle),
      linkedinUrl: linkedinUrl ? formatLinkedInUrl(linkedinUrl) : undefined,
      githubUrl: githubUrl ? formatGitHubUrl(githubUrl) : undefined,
      instagramUrl: instagramUrl ? formatInstagramUrl(instagramUrl) : undefined,
    };

    onUpdateUser(updated);
    setIsEditing(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl glass-card border border-border p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
        
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
          <div className="relative group shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-purple-500/10 border-2 border-purple-500/30 overflow-hidden shadow-md">
              <img
                src={avatarUrl}
                alt={name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/mascot_opt.png';
                }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Botón flotante para cambiar foto */}
            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition-transform hover:scale-110 border border-purple-400"
                title="Cambiar foto de perfil"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg sm:text-xl text-ink truncate">
                {name || currentUser.name}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full badge-accent uppercase tracking-wider">
                Creador
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5 line-clamp-2">
              {bio || currentUser.bio || 'Miembro del Bootcamp AWS Builder Center'}
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

        {/* Acción Principal: Publicar Artículo */}
        <div className="mb-6 p-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div>
            <h3 className="font-display font-bold text-sm text-ink flex items-center gap-1.5">
              <img src="/images/builder_center_icon.png" alt="Builder" className="w-4 h-4 object-contain" />
              <span>¿Escribiste un nuevo post en Builder Center?</span>
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Súmalo al Hub para que la comunidad te apoye con likes y reposts.
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
              <span>Mis Datos y Redes de Autor</span>
            </h3>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancelar Edición' : 'Editar Datos'}</span>
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              
              {/* Opciones de Foto de Perfil */}
              <div className="p-3 rounded-2xl bg-surface-hover border border-border">
                <label className="block text-[11px] font-bold text-ink mb-1 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-purple-400" />
                  <span>Foto de Perfil</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Subir Foto Nueva</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvatarUrl('/images/mascot_opt.png')}
                    className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-muted hover:text-ink text-xs font-medium transition-all"
                  >
                    Usar Iguana Oficial
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-muted">
                    Nombre Completo
                  </label>
                  <span className={`text-[10px] font-mono ${name.length > 40 ? 'text-amber-400 font-bold' : 'text-muted'}`}>
                    {name.length}/50
                  </span>
                </div>
                <input
                  type="text"
                  value={name}
                  maxLength={50}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-muted">
                    Biografía / Rol Comunitario
                  </label>
                  <span className={`text-[10px] font-mono ${bio.length > 85 ? 'text-amber-400 font-bold' : 'text-muted'}`}>
                    {bio.length}/100 máx
                  </span>
                </div>
                <textarea
                  value={bio}
                  maxLength={100}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="Ej. Carpintero & Líder de AWS UG Playa Vicente..."
                />
                <p className="text-[10px] text-muted mt-1">
                  Máximo 100 caracteres para lucir perfecto en la columna de autor.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted mb-1">
                  Usuario o Enlace de AWS Builder Center (Opcional)
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted" />
                  <input
                    type="text"
                    value={builderHandle}
                    onChange={(e) => setBuilderHandle(e.target.value)}
                    placeholder="@siegfried_fs o URL de builder.aws.com"
                    className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-ink focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted mb-1">
                  Perfil de LinkedIn (Opcional - Red Profesional)
                </label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/usuario"
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted mb-1">
                  Perfil de GitHub (Opcional - Código & Repositorios)
                </label>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="usuario o https://github.com/usuario"
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted mb-1">
                  Perfil de Instagram (Opcional - Comunidad & Red Social)
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
                    LinkedIn (Red Profesional)
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

              {currentUser.githubUrl && (
                <div className="p-3 rounded-xl bg-surface-hover border border-border flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-muted uppercase font-bold tracking-wider">
                      GitHub (Código & Repositorios)
                    </div>
                    <div className="text-xs font-semibold text-ink truncate max-w-[280px]">
                      {currentUser.githubUrl}
                    </div>
                  </div>
                  <a
                    href={currentUser.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-border hover:border-purple-500/50 text-muted hover:text-purple-400 transition-colors"
                    title="Ver GitHub"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

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

        {/* 🛡️ Privacidad & Derecho al Olvido (Eliminación de Cuenta) */}
        {onDeleteAccount && (
          <div className="mt-6 pt-5 border-t border-border">
            {isConfirmingDelete ? (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3 animate-fadeIn">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-red-400">
                      ¿Confirmas la eliminación permanente de tu cuenta?
                    </h4>
                    <p className="text-[11px] text-muted leading-relaxed mt-1">
                      Esta acción es irreversible: se borrarán tus datos de perfil, tu checklist de apoyos comunitarios y se retirarán todas tus publicaciones registradas en el Hub.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-3 py-1.5 rounded-xl border border-border text-xs text-muted hover:text-ink hover:bg-surface transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteAccount(currentUser.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sí, eliminar mi cuenta</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-ink">Privacidad y Gestión de Datos</h4>
                  <p className="text-[11px] text-muted">
                    Derecho al olvido: elimina tu perfil y retira tus publicaciones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
                  title="Eliminar mi cuenta definitivamente"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Cuenta</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
