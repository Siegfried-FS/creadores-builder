import { useState, type FC, type FormEvent } from 'react';
import { X, Sparkles, User, Mail, ArrowRight } from 'lucide-react';
import type { CreatorProfile } from '../types';
import { cleanUsername, formatBuilderUrl } from '../utils/sanitizer';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: CreatorProfile) => void;
}

const GoogleIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const AuthModal: FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [showManualForm, setShowManualForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  // Acceso 1-clic con Google (Menos fricción mero)
  const handleGoogleLogin = () => {
    // Si ya hay una sesión guardada con Google, la recuperamos
    const savedUserJson = localStorage.getItem('creadores_active_user');
    if (savedUserJson) {
      try {
        const saved = JSON.parse(savedUserJson);
        if (saved && saved.name) {
          onLoginSuccess(saved);
          onClose();
          return;
        }
      } catch {
        // ignore
      }
    }

    // Perfil inmediato de Google para el creador
    const promptName = prompt('¿Cuál es tu nombre para tu perfil de creador?', 'Creador AWS');
    if (!promptName) return;

    const cleanHandle = cleanUsername(promptName);
    const googleUser: CreatorProfile = {
      id: `usr_g_${Date.now()}`,
      name: promptName.trim(),
      email: `${cleanHandle.toLowerCase()}@gmail.com`,
      bio: 'Creador en el Bootcamp AWS Builder Center',
      builderHandle: cleanHandle,
      builderUrl: formatBuilderUrl(cleanHandle),
      avatarUrl: '/images/mascot_opt.png',
    };

    onLoginSuccess(googleUser);
    onClose();
  };

  // Acceso directo con Nombre y Correo (sin contraseñas)
  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanHandle = cleanUsername(name);
    const newUser: CreatorProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${cleanHandle.toLowerCase()}@comunidad.aws`,
      bio: 'Creador en el Bootcamp AWS Builder Center',
      builderHandle: cleanHandle,
      builderUrl: formatBuilderUrl(cleanHandle),
      avatarUrl: '/images/mascot_opt.png',
    };

    onLoginSuccess(newUser);
    onClose();
  };

  // Acceso directo para Roberto
  const handleRobertoLogin = () => {
    const robertoUser: CreatorProfile = {
      id: 'usr_roberto',
      name: 'Roberto Flores',
      email: 'roberto.ciberseguridad@gmail.com',
      bio: 'Carpintero & Líder del AWS User Group Playa Vicente. Lead Auditor ISO 27001 y AWS Certified Cloud Practitioner.',
      builderHandle: 'siegfried_fs',
      builderUrl: 'https://community.aws/@siegfried_fs',
      linkedinUrl: 'https://www.linkedin.com/in/roberto-flores-carpintero',
      instagramUrl: 'https://www.instagram.com/siegfried_fs',
      avatarUrl: '/images/mascot_opt.png',
    };
    onLoginSuccess(robertoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl glass-card border border-border p-6 sm:p-7 shadow-2xl">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-muted hover:text-ink hover:bg-surface-hover transition-colors"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado con Mascota */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center p-1.5 shadow-md">
            <img src="/images/mascot_opt.png" alt="AWSUG" className="w-full h-full object-contain" />
          </div>
          <h2 className="font-display font-bold text-xl text-ink">
            Bienvenido al Hub de Creadores
          </h2>
          <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
            Entra con un clic para publicar tus artículos de <strong className="text-purple-400">AWS Builder Center</strong> y recibir apoyo de la comunidad.
          </p>
        </div>

        <div className="space-y-3">
          {/* 🌟 BOTÓN PRINCIPAL: CONTINUAR CON GOOGLE */}
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-2xl border border-border bg-surface hover:bg-surface-hover text-ink font-bold text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.01] shadow-md hover:border-purple-400 group"
          >
            <GoogleIcon className="w-5 h-5 shrink-0" />
            <span>Continuar con Google</span>
          </button>

          {/* Acceso Rápido Líder UG */}
          <button
            onClick={handleRobertoLogin}
            className="w-full py-2.5 px-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Entrar como Roberto Flores (Líder UG)</span>
          </button>
        </div>

        {/* Alternativa sin contraseñas */}
        <div className="mt-5 pt-4 border-t border-border">
          {!showManualForm ? (
            <button
              onClick={() => setShowManualForm(true)}
              className="w-full text-center text-xs text-muted hover:text-purple-400 transition-colors py-1 font-medium"
            >
              ¿Prefieres entrar solo con tu Nombre? Haz clic aquí &rarr;
            </button>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-3 animate-fadeIn">
              <p className="text-xs font-semibold text-ink mb-1">
                Entrada rápida (Cero contraseñas)
              </p>
              
              <div>
                <label className="block text-[11px] text-muted mb-1">Tu Nombre o Alias *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Roberto Flores"
                    className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-muted mb-1">Correo Electrónico (Opcional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="px-3 py-2 rounded-xl border border-border text-xs text-muted hover:text-ink"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary-gradient py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <span>Entrar al Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Nota de cero fricción */}
        <p className="text-[11px] text-muted/70 text-center mt-5">
          Tus redes sociales son 100% opcionales y podrás añadirlas desde tu perfil cuando quieras.
        </p>

      </div>
    </div>
  );
};
