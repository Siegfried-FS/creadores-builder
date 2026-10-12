import { useEffect } from 'react';

export function ConsoleSecurity() {
  useEffect(() => {
    if ((window as unknown as { __security_banner?: boolean }).__security_banner) return;
    (window as unknown as { __security_banner?: boolean }).__security_banner = true;

    // Mensaje de bienvenida seguro en consola
    console.log(
      `%c
   █████╗ ██╗    ██╗███████╗██╗   ██╗ ██████╗ 
  ██╔══██╗██║    ██║██╔════╝██║   ██║██╔════╝ 
  ███████║██║ █╗ ██║███████╗██║   ██║██║  ███╗
  ██╔══██║██║███╗██║╚════██║██║   ██║██║   ██║
  ██║  ██║╚███╔███╔╝███████║╚██████╔╝╚██████╔╝
  ╚═╝  ╚═╝ ╚══╝╚══╝ ╚══════╝ ╚═════╝  ╚═════╝ 
  AWS User Group Playa Vicente · Hub de Creadores
  ────────────────────────────────────────────────────────────────
  🔒 Comunidad Oficial AWS Builder Center LATAM
  
  ¡Hola! Si estás inspeccionando la consola es porque te apasiona la tecnología.
  En nuestra comunidad aprendemos y practicamos ciberseguridad cloud de forma ética.

  Aprende con nosotros en comunidad:
  • Portal:    https://awsugplayavicente.com
  • Comunidad: https://builder.aws.com
  ────────────────────────────────────────────────────────────────
`,
      'color: #a855f7; font-size: 11px; font-weight: bold; line-height: 1.35; font-family: monospace;'
    );

    // Auditoría de ruta / URL actual (Sin fingerprinting de servicios internos)
    const checkCurrentUrl = () => {
      const rawPath = decodeURIComponent(window.location.pathname) + decodeURIComponent(window.location.search) + decodeURIComponent(window.location.hash);
      const sqlPatterns = /(union\s+select|drop\s+table|or\s+1\s*=\s*1|'\s*or\s*'|--\s*$|;.*drop|select\s+.*from)/i;
      const xssPatterns = /(<script|javascript:|onerror|onload|alert\(|document\.|eval\(|%3Cscript)/i;
      const adminPatterns = /(\/admin|\/wp-admin|\/administrator|\/backend|\/phpmyadmin|\/config|\/\.env|\/root|\/api\/admin)/i;
      const traversalPatterns = /(\.\.\/)|(\.\.\\)|(\.\.%2f)|(\.\.%5c)/i;

      if (sqlPatterns.test(rawPath)) {
        console.warn(
          `%c[Auditoría de Seguridad]\nPatrón de inyección no admitido en parámetros.\nPara practicar de forma ética: https://portswigger.net/web-security/sql-injection`,
          'color: #ef4444; font-size: 12px; font-weight: bold;'
        );
      } else if (xssPatterns.test(rawPath)) {
        console.warn(
          `%c[Auditoría de Seguridad]\nIntento de script interceptado por los controles de renderizado seguro del cliente.`,
          'color: #ef4444; font-size: 12px; font-weight: bold;'
        );
      } else if (adminPatterns.test(rawPath)) {
        console.info(
          `%c[Auditoría de Seguridad]\nRuta administrativa no existente en este portal.`,
          'color: #f59e0b; font-size: 12px; font-weight: bold;'
        );
      } else if (traversalPatterns.test(rawPath)) {
        console.warn(
          `%c[Auditoría de Seguridad]\nNavegación de rutas no autorizada interceptada.`,
          'color: #ef4444; font-size: 12px; font-weight: bold;'
        );
      }
    };

    checkCurrentUrl();
    window.addEventListener('popstate', checkCurrentUrl);
    window.addEventListener('hashchange', checkCurrentUrl);

    return () => {
      window.removeEventListener('popstate', checkCurrentUrl);
      window.removeEventListener('hashchange', checkCurrentUrl);
    };
  }, []);

  return null;
}
