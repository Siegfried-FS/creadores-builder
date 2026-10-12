import { useEffect, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { ShieldAlert, ExternalLink, ArrowLeft } from 'lucide-react';

interface SecurityShieldProps {
  children: ReactNode;
}

type ThreatType = 'admin' | 'sqli' | 'xss' | 'traversal' | 'env_probe' | null;

export const SecurityShield: FC<SecurityShieldProps> = ({ children }) => {
  const [threat, setThreat] = useState<ThreatType>(null);
  const [interceptedInput, setInterceptedInput] = useState('');

  useEffect(() => {
    const rawUrl = decodeURIComponent(window.location.pathname + window.location.search);

    // Patrones de ataque y escaneo
    const adminPatterns = /(admin|administrator|wp-admin|wp-login|cpanel|phpmyadmin|dashboard\/login)/i;
    const xssPatterns = /(<script|javascript:|onerror\s*=|onload\s*=|alert\(|eval\(|document\.cookie)/i;
    const sqliPatterns = /(union\s+select|drop\s+table|or\s+1\s*=\s*1|'\s*or\s*'|--|;\s*drop|select\s+.*from)/i;
    const traversalPatterns = /(\.\.\/|\.\.\\|\.\.%2f|\.\.%5c)/i;
    const envPatterns = /(\.env|\.git|\.aws|id_rsa|wp-config|config\.php)/i;

    let detected: ThreatType = null;

    if (xssPatterns.test(rawUrl)) {
      detected = 'xss';
    } else if (sqliPatterns.test(rawUrl)) {
      detected = 'sqli';
    } else if (traversalPatterns.test(rawUrl)) {
      detected = 'traversal';
    } else if (envPatterns.test(rawUrl)) {
      detected = 'env_probe';
    } else if (adminPatterns.test(rawUrl) && window.location.pathname !== '/') {
      detected = 'admin';
    }

    if (detected) {
      setThreat(detected);
      setInterceptedInput(rawUrl);

      // Mensajes en consola para curiosos y pentesters
      if (detected === 'xss') {
        console.warn(
          `%c🛡️ [ESCUDO ACTIVO - XSS INTERCEPTADO]\nBuen intento. Este sitio renderiza datos sanitizados bajo React y CSP estricto.\nSi quieres aprender XSS defensivo: https://portswigger.net/web-security/cross-site-scripting\nO súmate a la comunidad en Telegram: https://t.me/AUGPlayaVicente`,
          'color: #ef4444; font-size: 13px; font-weight: bold;'
        );
      } else if (detected === 'sqli') {
        console.warn(
          `%c🛡️ [ESCUDO ACTIVO - SQLi INTERCEPTADO]\nNo hay bases de datos relacionales ni motores SQL expuestos aquí. La persistencia es Serverless NoSQL (DynamoDB con IAM de privilegio mínimo).\nAprende más en: https://portswigger.net/web-security/sql-injection\nComunidad: https://t.me/AUGPlayaVicente`,
          'color: #ef4444; font-size: 13px; font-weight: bold;'
        );
      } else if (detected === 'admin') {
        console.info(
          `%c🦎 [HONEYPOT - PANEL ADMIN NO EXISTENTE]\nNo hay paneles de /admin ni backdoors en este servidor. La administración y control de autoría se gestiona 100% mediante tokens JWT con AWS Cognito.\n¿Te apasiona la ciberseguridad? Súmate a la comunidad en WhatsApp: https://chat.whatsapp.com/KXQYW7V00q12cSoeijob4h`,
          'color: #f97316; font-size: 13px; font-weight: bold;'
        );
      } else if (detected === 'env_probe' || detected === 'traversal') {
        console.warn(
          `%c🛡️ [ESCUDO ACTIVO - SONDEO DE ARCHIVOS SENSIBLES]\nNo hay archivos .env ni filesystem servido directamente en el cliente. Los secretos se custodian en AWS Secrets Manager y Parameter Store.\nSúmate en Telegram: https://t.me/AUGPlayaVicente`,
          'color: #ef4444; font-size: 13px; font-weight: bold;'
        );
      }
    }
  }, []);

  if (threat) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-lg w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          
          {/* Logo Mascota */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src="/images/mascot_opt.png"
                alt="Iguana Guardiana AWS UG Playa Vicente"
                className="w-28 h-28 object-contain mx-auto drop-shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 bg-red-500 p-1.5 rounded-full text-white shadow-lg">
                <ShieldAlert className="w-5 h-5" />
              </span>
            </div>
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/40 mb-2">
              Escudo de Seguridad Interceptado
            </span>
            <h1 className="font-display font-black text-2xl text-white">
              {threat === 'admin' && '¡No hay panel de Admin aquí!'}
              {threat === 'sqli' && 'Patrón SQLi Detectado'}
              {threat === 'xss' && 'Intento XSS Interceptado'}
              {threat === 'traversal' && 'Path Traversal Bloqueado'}
              {threat === 'env_probe' && 'Archivo Sensible No Accesible'}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1 break-all bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              {interceptedInput}
            </p>
          </div>

          <div className="text-sm text-slate-300 text-left bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 space-y-2.5">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <span>🦎 Seguridad Real en Comunidad:</span>
            </p>
            {threat === 'admin' ? (
              <p className="text-xs leading-relaxed text-slate-400">
                Esta aplicación no utiliza paneles de control tradicionales ni cuentas maestras compartidas. La identidad se delega a <strong>AWS Cognito</strong> y los permisos se validan en el backend con el identificador único (<code>sub</code>) del usuario.
              </p>
            ) : (
              <p className="text-xs leading-relaxed text-slate-400">
                Nuestra arquitectura es estática y serverless: no hay motores SQL relacionales vulnerables ni ejecución dinámica de scripts en el cliente.
              </p>
            )}
            <p className="text-xs text-amber-400 pt-1">
              ¿Te apasiona la seguridad ofensiva y defensiva? En AWS UG Playa Vicente realizamos laboratorios y talleres prácticos de ciberseguridad.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la App</span>
            </button>

            <a
              href="https://t.me/AUGPlayaVicente"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1b85b8] text-white text-xs font-semibold shadow-md transition-all"
            >
              <span>Grupo Telegram</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://chat.whatsapp.com/KXQYW7V00q12cSoeijob4h"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1faa4f] text-white text-xs font-semibold shadow-md transition-all"
            >
              <span>Grupo WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <p className="text-[11px] text-slate-500 font-mono">
            AWS User Group Playa Vicente &bull; creadores.awsugplayavicente.com
          </p>

        </div>
      </div>
    );
  }

  return <>{children}</>;
};
