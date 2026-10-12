import { useState, type FC, type FormEvent } from 'react';
import { X, User, Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import type { CreatorProfile } from '../types';
import { cleanUsername, formatBuilderUrl } from '../utils/sanitizer';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: CreatorProfile) => void;
}

const GoogleIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
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
  const [mode, setMode] = useState<'login' | 'register'>('register');
  
  // Campos del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Registro de nuevo creador
  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor escribe tu nombre o alias.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const cleanHandle = cleanUsername(name);
    const newUser: CreatorProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      bio: 'Creador en el Bootcamp AWS Builder Center',
      builderHandle: cleanHandle,
      builderUrl: formatBuilderUrl(cleanHandle),
      avatarUrl: '/images/mascot_opt.png',
    };

    // Guardar en la lista de usuarios registrados en el navegador
    try {
      const existingUsers = JSON.parse(localStorage.getItem('creadores_registered_users') || '[]');
      const updated = existingUsers.filter((u: any) => u.email !== newUser.email);
      updated.push({ ...newUser, password });
      localStorage.setItem('creadores_registered_users', JSON.stringify(updated));
    } catch {
      // ignore
    }

    onLoginSuccess(newUser);
    onClose();
  };

  // Inicio de sesión de creador existente
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!password) {
      setError('Por favor ingresa tu contraseña.');
      return;
    }

    try {
      const existingUsers = JSON.parse(localStorage.getItem('creadores_registered_users') || '[]');
      const found = existingUsers.find((u: any) => u.email === email.trim().toLowerCase());

      if (found) {
        if (found.password && found.password !== password) {
          setError('Contraseña incorrecta.');
          return;
        }
        const { password: _, ...userProfile } = found;
        onLoginSuccess(userProfile);
        onClose();
        return;
      }
    } catch {
      // ignore
    }

    // Si es un inicio de sesión nuevo
    const cleanHandle = cleanUsername(email.split('@')[0]);
    const user: CreatorProfile = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email: email.trim().toLowerCase(),
      bio: 'Creador en el Bootcamp AWS Builder Center',
      builderHandle: cleanHandle,
      builderUrl: formatBuilderUrl(cleanHandle),
      avatarUrl: '/images/mascot_opt.png',
    };

    onLoginSuccess(user);
    onClose();
  };

  // Acceso con Google
  const handleGoogleAuth = () => {
    // Si ya existe sesión previa
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

    // Crear perfil rápido con Google
    const defaultName = mode === 'register' && name.trim() ? name.trim() : 'Creador de la Comunidad';
    const cleanHandle = cleanUsername(defaultName);
    const googleUser: CreatorProfile = {
      id: `usr_g_${Date.now()}`,
      name: defaultName,
      email: email.trim() || `${cleanHandle.toLowerCase()}@gmail.com`,
      bio: 'Creador en el Bootcamp AWS Builder Center',
      builderHandle: cleanHandle,
      builderUrl: formatBuilderUrl(cleanHandle),
      avatarUrl: '/images/mascot_opt.png',
    };

    onLoginSuccess(googleUser);
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
        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto mb-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center p-1 shadow-md">
            <img src="/images/mascot_opt.png" alt="AWSUG" className="w-full h-full object-contain" />
          </div>
          <h2 className="font-display font-bold text-xl text-ink">
            {mode === 'register' ? 'Crea tu Cuenta de Creador' : 'Inicia Sesión en el Hub'}
          </h2>
          <p className="text-xs text-muted mt-0.5">
            AWS User Group Playa Vicente &middot; Creadores Builder Center
          </p>
        </div>

        {/* Selector de Pestaña: Registro / Login */}
        <div className="flex rounded-xl bg-surface-hover p-1 mb-5 border border-border">
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-surface text-ink shadow-sm border border-border'
                : 'text-muted hover:text-ink'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Registrarme</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-surface text-ink shadow-sm border border-border'
                : 'text-muted hover:text-ink'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={mode === 'register' ? handleRegister : handleLogin} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Tu Nombre Completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Roberto Flores"
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted mb-1">
              Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary-gradient py-2.5 rounded-xl text-xs font-bold mt-2 shadow-md"
          >
            {mode === 'register' ? 'Crear mi Cuenta de Creador' : 'Entrar al Hub'}
          </button>
        </form>

        {/* Separador */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold">
            <span className="bg-surface px-2 text-muted">o continúa con</span>
          </div>
        </div>

        {/* Botón de Google */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full py-2.5 px-4 rounded-xl border border-border bg-surface hover:bg-surface-hover text-ink font-semibold text-xs flex items-center justify-center gap-2 transition-all hover:border-purple-400"
        >
          <GoogleIcon className="w-4 h-4" />
          <span>Continuar con Google</span>
        </button>

        <p className="text-[11px] text-muted text-center mt-4">
          {mode === 'register' ? (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="text-purple-400 hover:text-purple-300 font-bold"
              >
                Inicia sesión aquí
              </button>
            </>
          ) : (
            <>
              ¿Primera vez aquí?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className="text-purple-400 hover:text-purple-300 font-bold"
              >
                Crea tu cuenta aquí
              </button>
            </>
          )}
        </p>

      </div>
    </div>
  );
};
