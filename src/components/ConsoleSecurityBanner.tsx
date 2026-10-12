import { useEffect } from 'react';
import type { FC } from 'react';

export const ConsoleSecurityBanner: FC = () => {
  useEffect(() => {
    const win = window as unknown as { __ug_security_banner?: boolean };
    if (win.__ug_security_banner) return;
    win.__ug_security_banner = true;

    // Mensaje de bienvenida de la comunidad
    console.log(
      `%c
   █████╗ ██╗    ██╗███████╗    ██╗   ██╗ ██████╗ 
  ██╔══██╗██║    ██║██╔════╝    ██║   ██║██╔════╝ 
  ███████║██║ █╗ ██║███████╗    ██║   ██║██║  ███╗
  ██╔══██║██║███╗██║╚════██║    ██║   ██║██║   ██║
  ██║  ██║╚███╔███╔╝███████║    ╚██████╔╝╚██████╔╝
  ╚═╝  ╚═╝ ╚══╝╚══╝ ╚══════╝     ╚═════╝  ╚═════╝ 
  Playa Vicente 🦎 Creadores Bootcamp
  ─────────────────────────────────────────────────────────────
  Bienvenido a creadores.awsugplayavicente.com
  
  ¿Inspeccionando el código? ¡Nos encanta la curiosidad técnica!
  Construimos aplicaciones serverless seguras y enseñamos
  seguridad cloud en comunidad.
  
  Súmate a la comunidad en Telegram y WhatsApp:
  Telegram: https://t.me/AUGPlayaVicente
  WhatsApp: https://chat.whatsapp.com/KXQYW7V00q12cSoeijob4h
  ─────────────────────────────────────────────────────────────`,
      'color: #f97316; font-family: monospace; font-size: 11px; font-weight: bold; line-height: 1.4;'
    );

    // Advertencia de Seguridad Anti-Self-XSS
    console.log(
      `%c⚠️ ¡DETENTE! (Self-XSS Warning)
Si alguien te dijo que copies y pegues código aquí para "obtener permisos de admin" o "desbloquear funciones", es una trampa para robar tus credenciales.
Este sitio no contiene claves privadas en el cliente ni paneles ocultos.`,
      'background: #7f1d1d; color: #fecaca; font-size: 13px; font-weight: bold; padding: 6px 10px; border-radius: 6px;'
    );
  }, []);

  return null;
};
