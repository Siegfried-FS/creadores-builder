import { useEffect } from 'react';

export function ConsoleSecurity() {
  useEffect(() => {
    if ((window as unknown as { __security_banner?: boolean }).__security_banner) return;
    (window as unknown as { __security_banner?: boolean }).__security_banner = true;

    // Mensaje de bienvenida en consola (Estilo oficial AWS UG Playa Vicente)
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
  
  ¡Hola! Si estás inspeccionando la consola es porque te apasiona explorar.
  A nosotros también: aprendemos y practicamos ciberseguridad cloud.

  Arquitectura & Controles de Seguridad:
  • Persistencia: Amazon DynamoDB NoSQL (Serverless, decoupled).
  • Zero Server: Sin instancias EC2 ni puertos backend expuestos.
  • Content Security: Protegido contra inyecciones y clickjacking.
  • Principio de Privilegio Mínimo: Autenticación federada oficial.

  Si encuentras algo interesante o quieres dar una charla técnica:
  • Comunidad: https://awsugplayavicente.com
  • Telegram:  https://t.me/AUGPlayaVicente
  • WhatsApp:  https://chat.whatsapp.com/KXQYW7V00q12cSoeijob4h
  ────────────────────────────────────────────────────────────────
`,
      'color: #a855f7; font-size: 11px; font-weight: bold; line-height: 1.35; font-family: monospace;'
    );

    // Auditoría de ruta / URL actual
    const checkCurrentUrl = () => {
      const rawPath = decodeURIComponent(window.location.pathname) + decodeURIComponent(window.location.search) + decodeURIComponent(window.location.hash);
      const sqlPatterns = /(union\s+select|drop\s+table|or\s+1\s*=\s*1|'\s*or\s*'|--\s*$|;.*drop|select\s+.*from)/i;
      const xssPatterns = /(<script|javascript:|onerror|onload|alert\(|document\.|eval\(|%3Cscript)/i;
      const adminPatterns = /(\/admin|\/wp-admin|\/administrator|\/backend|\/phpmyadmin|\/config|\/\.env|\/root|\/api\/admin)/i;
      const traversalPatterns = /(\.\.\/)|(\.\.\\)|(\.\.%2f)|(\.\.%5c)/i;

      if (sqlPatterns.test(rawPath)) {
        console.warn(
          `%c[Auditoría de Seguridad - SQLi Detectado en URL]\nBuen intento. La persistencia es Amazon DynamoDB (NoSQL nativo sin tablas relacionales ni intérprete SQL).\nPara practicar de forma ética: https://portswigger.net/web-security/sql-injection`,
          'color: #ef4444; font-size: 12px; font-weight: bold;'
        );
      } else if (xssPatterns.test(rawPath)) {
        console.warn(
          `%c[Auditoría de Seguridad - XSS Detectado en URL]\nIntento de ejecución de script interceptado. React sanitiza el renderizado del DOM automáticamente.\nPara practicar: https://portswigger.net/web-security/cross-site-scripting`,
          'color: #ef4444; font-size: 12px; font-weight: bold;'
        );
      } else if (adminPatterns.test(rawPath)) {
        console.info(
          `%c[Auditoría de Seguridad - Admin Scanning]\nBuscando paneles administrativos... Este proyecto es una Single Page Application Serverless desacoplada en AWS.\nNo existen paneles /admin, ni WordPress, ni endpoints PHP ocultos.`,
          'color: #f59e0b; font-size: 12px; font-weight: bold;'
        );
      } else if (traversalPatterns.test(rawPath)) {
        console.warn(
          `%c[Auditoría de Seguridad - Path Traversal Detectado]\nNo hay filesystem local de servidor expuesto. Es almacenamiento y CDN estático con S3/CloudFront.`,
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

// Analizador en tiempo real de entradas de texto (Buscador y formularios)
export function checkInputSecurity(input: string) {
  if (!input || input.trim().length === 0) return;

  const sqlPatterns = /(union\s+select|drop\s+table|or\s+1\s*=\s*1|'\s*or\s*'|--\s*$|;.*drop|select\s+.*from|insert\s+into)/i;
  const xssPatterns = /(<script|javascript:|onerror\s*=|onload\s*=|alert\(|<img|<svg|document\.cookie|eval\()/i;
  const adminPatterns = /^(admin|root|administrator|wp-admin|config|payload|\.env|etc\/passwd|sudo|su)$/i;
  const devPatterns = /^(dev|developer|developer tools|devtools|debug)$/i;
  const traversalPatterns = /(\.\.\/|\.\.\\)/i;

  if (sqlPatterns.test(input)) {
    console.warn(
      `%c[Auditoría de Seguridad - SQLi Detectado en Búsqueda]\nEntrada interceptada: "${input}"\n💡 En AWS UG Playa Vicente practicamos DevSecOps: DynamoDB utiliza modelos de clave-valor sin motor SQL interpretable.`,
      'color: #ef4444; font-size: 12px; font-weight: bold;'
    );
  } else if (xssPatterns.test(input)) {
    console.warn(
      `%c[Auditoría de Seguridad - XSS Detectado en Búsqueda]\nEntrada interceptada: "${input}"\n💡 El árbol de componentes React escapa todas las cadenas automáticamente antes de inyectarlas en el DOM.`,
      'color: #ef4444; font-size: 12px; font-weight: bold;'
    );
  } else if (adminPatterns.test(input)) {
    console.info(
      `%c[Auditoría de Seguridad - Búsqueda de Privilegios Root/Admin]\nTérmino ingresado: "${input}"\n💡 No hay paneles de administración central ni accesos directos /admin. Todo se gestiona mediante arquitecturas Serverless y tokens OIDC autenticados.`,
      'color: #a855f7; font-size: 12px; font-weight: bold;'
    );
  } else if (devPatterns.test(input.trim())) {
    console.info(
      `%c[Auditoría de Seguridad - Developer Tools & Debug Mode]\nTérmino ingresado: "${input}"\n🛠️ Modo desarrollador comunitario: Filtrando por Developer Tools, Serverless y Cloud Architecture en AWS. ¡Bienvenido/a builder!`,
      'color: #38bdf8; font-size: 12px; font-weight: bold;'
    );
  } else if (traversalPatterns.test(input)) {
    console.warn(
      `%c[Auditoría de Seguridad - Path Traversal]\nIntento de navegación de directorios detectado: "${input}".`,
      'color: #ef4444; font-size: 12px; font-weight: bold;'
    );
  }
}
