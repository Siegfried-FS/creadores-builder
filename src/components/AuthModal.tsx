import { useState, type FC, type FormEvent } from 'react';
import { X, LogIn, UserPlus, Mail, Lock, User, AtSign, Sparkles } from 'lucide-react';
import type { CreatorProfile } from '../types';
import { formatBuilderUrl, formatLinkedInUrl, formatInstagramUrl, cleanUsername } from '../utils/sanitizer';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: CreatorProfile) => void;
}

export const AuthModal: FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBuilder, setRegBuilder] = useState('');
  const [regLinkedin, setRegLinkedin] = useState('');
  const [regInstagram, setRegInstagram] = useState('');

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    // Comprobar si hay un usuario guardado previamente en localStorage
    const savedUserJson = localStorage.getItem('creadores_active_user');
    if (savedUserJson) {
      try {
        const savedUser: CreatorProfile = JSON.parse(savedUserJson);
        if (savedUser.email?.toLowerCase() === loginEmail.trim().toLowerCase()) {
          onLoginSuccess(savedUser);
          onClose();
          return;
        }
      } catch {
        // ignore
      }
    }

    // Si es Roberto o nuevo login de prueba en comunidad:
    const user: CreatorProfile = {
      id: `usr_${Date.now()}`,
      name: loginEmail.split('@')[0] || 'Creador AWS',
      email: loginEmail.trim(),
      bio: 'Creador en el Bootcamp AWS Builder Center',
      builderHandle: cleanUsername(loginEmail.split('@')[0]),
      builderUrl: formatBuilderUrl(loginEmail.split('@')[0]),
      avatarUrl: '/images/mascot_opt.png'
    };

    onLoginSuccess(user);
    onClose();
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Nombre, correo y contraseña son obligatorios.');
      return;
    }

    const cleanHandle = cleanUsername(regBuilder || regName);
    const newUser: CreatorProfile = {
      id: `usr_${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim(),
      bio: 'Creador en el Bootcamp AWS Builder Center',
      builderHandle: cleanHandle,
      builderUrl: formatBuilderUrl(regBuilder || cleanHandle),
      linkedinUrl: regLinkedin ? formatLinkedInUrl(regLinkedin) : undefined,
      instagramUrl: regInstagram ? formatInstagramUrl(regInstagram) : undefined,
      avatarUrl: '/images/mascot_opt.png'
    };

    onLoginSuccess(newUser);
    onClose();
  };

  // Acceso rápido para Roberto / Demo comunitario
  const handleQuickDemoLogin = () => {
    const demoUser: CreatorProfile = {
      id: 'usr_roberto',
      name: 'Roberto Flores',
      email: 'roberto.ciberseguridad@gmail.com',
      bio: 'Carpintero & Líder del AWS User Group Playa Vicente. Lead Auditor ISO 27001 y AWS Certified Cloud Practitioner.',
      builderHandle: 'siegfried_fs',
      builderUrl: 'https://community.aws/@siegfried_fs',
      linkedinUrl: 'https://www.linkedin.com/in/roberto-flores-carpintero',
      instagramUrl: 'https://www.instagram.com/siegfried_fs',
      avatarUrl: '/images/mascot_opt.png'
    };
    onLoginSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl glass-card border border-border p-6 shadow-2xl">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-muted hover:text-ink hover:bg-surface-hover transition-colors"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado con Logo Oficial */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <img src="/images/logo.svg" alt="AWSUG" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-ink">
              Acceso a la Comunidad
            </h2>
            <p className="text-xs text-muted">
              AWS UG Playa Vicente &middot; Hub de Creadores
            </p>
          </div>
        </div>

        {/* Tabs: Iniciar Sesión / Registro */}
        <div className="flex rounded-xl bg-surface-hover p-1 mb-5 border border-border">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              tab === 'login'
                ? 'bg-surface text-ink shadow-sm border border-border'
                : 'text-muted hover:text-ink'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              tab === 'register'
                ? 'bg-surface text-ink shadow-sm border border-border'
                : 'text-muted hover:text-ink'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Crear Cuenta</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
            {error}
          </div>
        )}

        {/* Formulario de Login */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-primary-gradient py-2.5 rounded-xl text-xs font-bold mt-2"
            >
              Entrar al Hub
            </button>

            {/* Acceso Rápido Roberto */}
            <div className="pt-3 border-t border-border">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-2 px-3 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/15 text-purple-400 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Entrar como Roberto Flores (Líder UG)</span>
              </button>
            </div>
          </form>
        ) : (
          /* Formulario de Registro */
          <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Nombre Completo o Alias *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ej. Roberto Flores"
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-[11px] font-bold text-ink mb-2">
                Tus Redes de Creador (puedes editarlas luego)
              </p>

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] text-muted mb-0.5">
                    Usuario de AWS Builder Center
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted" />
                    <input
                      type="text"
                      value={regBuilder}
                      onChange={(e) => setRegBuilder(e.target.value)}
                      placeholder="@siegfried_fs o URL completa"
                      className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-muted mb-0.5">
                    Perfil de LinkedIn
                  </label>
                  <input
                    type="text"
                    value={regLinkedin}
                    onChange={(e) => setRegLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/usuario"
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-muted mb-0.5">
                    Perfil de Instagram (Opcional)
                  </label>
                  <input
                    type="text"
                    value={regInstagram}
                    onChange={(e) => setRegInstagram(e.target.value)}
                    placeholder="@usuario o link"
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-primary-gradient py-2.5 rounded-xl text-xs font-bold mt-3"
            >
              Crear Perfil y Empezar
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
