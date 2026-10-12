import { useEffect, useState, type FC } from 'react';
import { ShieldAlert, ExternalLink, ArrowLeft, Terminal } from 'lucide-react';

export const SecurityHoneypotModal: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [triggeredPath, setTriggeredPath] = useState('');

  useEffect(() => {
    const inspectPath = () => {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const full = path + search + hash;

      const adminPatterns = /(\/admin|\/wp-admin|\/administrator|\/backend|\/phpmyadmin|\/config|\/\.env|\/root|\/api\/admin|\/panel)/i;
      const sqlPatterns = /(union\s+select|drop\s+table|or\s+1\s*=\s*1|'\s*or\s*'|--\s*$|;.*drop|select\s+.*from)/i;
      const xssPatterns = /(<script|javascript:|onerror|onload|alert\(|eval\(|%3cscript)/i;
      const traversalPatterns = /(\.\.\/)|(\.\.\\)|(\.\.%2f)/i;

      if (adminPatterns.test(full) || sqlPatterns.test(full) || xssPatterns.test(full) || traversalPatterns.test(full)) {
        setTriggeredPath(window.location.pathname || full);
        setIsOpen(true);
      }
    };

    inspectPath();
    window.addEventListener('popstate', inspectPath);
    window.addEventListener('hashchange', inspectPath);

    return () => {
      window.removeEventListener('popstate', inspectPath);
      window.removeEventListener('hashchange', inspectPath);
    };
  }, []);

  if (!isOpen) return null;

  const handleReturnHome = () => {
    window.history.pushState({}, '', '/');
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl glass-card border border-border p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        
        {/* Mascota y Shield */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center rounded-2xl bg-purple-500/10 border-2 border-purple-500/30 p-2 shadow-md">
          <img
            src="/images/mascot_opt.png"
            alt="AWS User Group Playa Vicente"
            className="w-full h-full object-contain filter drop-shadow"
          />
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-purple-600 text-white shadow-md">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        {/* Título Genérico Seguro (Sin revelar arquitectura interna) */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold badge-accent uppercase tracking-wider mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>Auditoría de Ruta · 404 No Encontrado</span>
          </span>
          <h2 className="font-display font-extrabold text-2xl text-ink">
            Página No Encontrada
          </h2>
          <p className="text-xs text-muted mt-1 font-mono break-all px-2">
            Ruta solicitada: <span className="text-ink font-bold">{triggeredPath}</span>
          </p>
        </div>

        {/* Mensaje Seguro de Comunidad (Estilo oficial de AWSUG Playa Vicente sin datos internos) */}
        <div className="p-4 rounded-2xl bg-surface-hover/80 border border-border text-left space-y-2.5 text-xs">
          <p className="text-muted leading-relaxed">
            Esta ruta no existe en la plataforma. Este sitio web opera como una aplicación estática desacoplada sin paneles administrativos, archivos de configuración ni endpoints expuestos.
          </p>

          <div className="pt-2 border-t border-border text-[11px] text-muted space-y-1">
            <p className="font-bold text-ink">💡 ¿Te interesa la ciberseguridad cloud y el desarrollo en AWS?</p>
            <p>En <strong>AWS User Group Playa Vicente</strong> organizamos talleres prácticos, laboratorios y charlas técnicas abiertas a la comunidad.</p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleReturnHome}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl btn-primary-gradient text-xs font-bold flex items-center justify-center gap-2 shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio del Hub</span>
          </button>

          <a
            href="https://awsugplayavicente.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-ink text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Conoce la Comunidad</span>
            <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
          </a>
        </div>

      </div>
    </div>
  );
};
