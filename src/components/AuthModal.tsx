import { useState, useEffect, useRef, type FC, type FormEvent } from 'react';
import { X, User, Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import type { CreatorProfile } from '../types';
import { cleanUsername, formatBuilderUrl } from '../utils/sanitizer';
import {
  GOOGLE_CLIENT_ID,
  createProfileFromGoogleCredential,
} from '../services/googleAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: CreatorProfile) => void;
}

export const AuthModal: FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  
  // Campos del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Inicializar botón oficial de Google Identity Services
  useEffect(() => {
    if (!isOpen) return;

    const setupGoogle = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response: { credential: string }) => {
              if (response.credential) {
                const user = createProfileFromGoogleCredential(response.credential);
                onLoginSuccess(user);
                onClose();
              }
            },
            cancel_on_tap_outside: true,
          });

          // Renderizar el botón oficial de Google
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: mode === 'register' ? 'signup_with' : 'signin_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 320,
            locale: 'es',
          });
        } catch (e) {
          console.error('Error inicializando Google Auth:', e);
        }
      }
    };

    setupGoogle();
    const timer = setTimeout(setupGoogle, 500);
    return () => clearTimeout(timer);
  }, [isOpen, mode, onLoginSuccess, onClose]);

  if (!isOpen) return null;

  // Registro manual de nuevo creador
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
    // Validación estricta de contraseña segura (8+ caracteres, mayúscula, minúscula, número y símbolo)
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasMinLength) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!hasUpper || !hasLower) {
      setError('La contraseña debe contener letras mayúsculas y minúsculas.');
      return;
    }
    if (!hasNumber) {
      setError('La contraseña debe incluir al menos un número.');
      return;
    }
    if (!hasSpecial) {
      setError('La contraseña debe incluir al menos un símbolo especial (!@#$%^&*...).');
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

  // Inicio de sesión manual
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

        {/* 🌟 BOTÓN OFICIAL DE GOOGLE IDENTITY SERVICES */}
        <div className="mb-4 flex flex-col items-center justify-center">
          <div ref={googleBtnRef} className="flex justify-center min-h-[44px]" />
          <p className="text-[11px] text-muted mt-1.5 text-center">
            Acceso instantáneo con tu cuenta de Google
          </p>
        </div>

        {/* Separador */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold">
            <span className="bg-surface px-2 text-muted">o con correo</span>
          </div>
        </div>

        {/* Selector de Pestaña: Registro / Login */}
        <div className="flex rounded-xl bg-surface-hover p-1 mb-4 border border-border">
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
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
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
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
        <form onSubmit={mode === 'register' ? handleRegister : handleLogin} className="space-y-3">
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
                placeholder="Mínimo 8 caracteres, números y símbolos"
                className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            {/* Checklist interactivo de Contraseña Segura en Registro */}
            {mode === 'register' && password.length > 0 && (
              <div className="mt-2 p-2.5 rounded-xl bg-surface-hover/80 border border-border text-[11px] space-y-1">
                <p className="font-bold text-muted text-[10px] uppercase tracking-wider">
                  Requisitos de Seguridad:
                </p>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <span className={password.length >= 8 ? 'text-emerald-400 font-medium' : 'text-muted'}>
                    {password.length >= 8 ? '✓' : '○'} Mínimo 8 caracteres
                  </span>
                  <span className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-emerald-400 font-medium' : 'text-muted'}>
                    {/[A-Z]/.test(password) && /[a-z]/.test(password) ? '✓' : '○'} Mayúscula y minúscula
                  </span>
                  <span className={/[0-9]/.test(password) ? 'text-emerald-400 font-medium' : 'text-muted'}>
                    {/[0-9]/.test(password) ? '✓' : '○'} Al menos un número
                  </span>
                  <span className={/[^A-Za-z0-9]/.test(password) ? 'text-emerald-400 font-medium' : 'text-muted'}>
                    {/[^A-Za-z0-9]/.test(password) ? '✓' : '○'} Símbolo (!@#$...)
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full btn-primary-gradient py-2.5 rounded-xl text-xs font-bold mt-2 shadow-md"
          >
            {mode === 'register' ? 'Crear mi Cuenta de Creador' : 'Entrar al Hub'}
          </button>
        </form>

        <p className="text-[11px] text-muted text-center mt-3">
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
