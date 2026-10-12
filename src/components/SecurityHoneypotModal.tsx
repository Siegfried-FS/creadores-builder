import { useEffect, useState, type FC } from 'react';
import { ShieldAlert, ExternalLink, ArrowLeft, Terminal, Lock } from 'lucide-react';

export const SecurityHoneypotModal: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [triggeredPath, setTriggeredPath] = useState('');
  const [attackType, setAttackType] = useState<'admin' | 'sqli' | 'xss' | 'traversal'>('admin');

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

      if (adminPatterns.test(full)) {
        setAttackType('admin');
        setTriggeredPath(window.location.pathname);
        setIsOpen(true);
      } else if (sqlPatterns.test(full)) {
        setAttackType('sqli');
        setTriggeredPath(full);
        setIsOpen(true);
      } else if (xssPatterns.test(full)) {
        setAttackType('xss');
        setTriggeredPath(full);
        setIsOpen(true);
      } else if (traversalPatterns.test(full)) {
        setAttackType('traversal');
        setTriggeredPath(full);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl glass-card border border-red-500/40 p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        
        {/* Mascota y Shield */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center rounded-2xl bg-red-500/15 border-2 border-red-500/40 p-2 shadow-lg">
          <img
            src="/images/mascot_opt.png"
            alt="AWS User Group Playa Vicente"
            className="w-full h-full object-contain filter drop-shadow"
          />
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-red-600 text-white shadow-md">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        {/* Título de Detección */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wider mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>Auditoría DevSecOps · Honeypot Activo</span>
          </span>
          <h2 className="font-display font-extrabold text-2xl text-ink">
            {attackType === 'admin' ? '¿Buscando el Panel /admin?' : '¡Buen intento de auditoría!'}
          </h2>
          <p className="text-xs text-muted mt-1 font-mono break-all px-2">
            Ruta interceptada: <span className="text-red-400 font-bold">{triggeredPath}</span>
          </p>
        </div>

        {/* Explicación Técnica (Estilo auténtico Playa Vicente) */}
        <div className="p-4 rounded-2xl bg-surface-hover/80 border border-border text-left space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-ink font-bold">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Arquitectura 100% Serverless & Decoupled</span>
          </div>
          
          {attackType === 'admin' ? (
            <p className="text-muted leading-relaxed">
              En el <strong>Hub Comunitario de Creadores</strong> no existen servidores WordPress, paneles PHPMyAdmin ni rutas <code className="text-purple-300 font-mono">/admin</code> expuestas. El frontend es estático en Amazon CloudFront / S3, la base de datos es <strong>Amazon DynamoDB NoSQL</strong> y la autenticación se realiza con tokens federados con principio de mínimo privilegio.
            </p>
          ) : (
            <p className="text-muted leading-relaxed">
              Tu intento de explotación (<code className="text-red-400 font-mono">{attackType.toUpperCase()}</code>) fue interceptado por los controles de sanitización del cliente. Aquí no hay motores SQL relacionales ni comandos ejecutables en el servidor.
            </p>
          )}

          <div className="pt-2 border-t border-border/80 text-[11px] text-muted space-y-1">
            <p>💡 <strong>¿Te apasiona la ciberseguridad cloud?</strong></p>
            <p>En AWS User Group Playa Vicente practicamos DevSecOps, auditorías ISO 27001 y arquitecturas seguras sin humo comercial.</p>
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
            <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
          </a>
        </div>

      </div>
    </div>
  );
};
