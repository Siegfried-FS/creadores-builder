/**
 * Sanitizador y formateador de URLs y nombres de usuario para redes sociales y AWS Builder Center.
 */

// Limpia caracteres no permitidos en nombres de usuario
export function cleanUsername(input: string): string {
  if (!input) return '';
  return input.trim().replace(/^@+/, '').replace(/\s+/g, '');
}

// Genera la URL oficial de AWS Builder Center / Community
export function formatBuilderUrl(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  
  // Si ya es una URL completa
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  const clean = cleanUsername(trimmed);
  return `https://community.aws/@${clean}`;
}

// Genera la URL de LinkedIn (admite handle o URL completa)
export function formatLinkedInUrl(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  const clean = cleanUsername(trimmed);
  return `https://www.linkedin.com/in/${clean}`;
}

// Genera la URL de Instagram (admite handle o URL completa)
export function formatInstagramUrl(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  const clean = cleanUsername(trimmed);
  return `https://www.instagram.com/${clean}`;
}

// Valida si una URL de artículo pertenece a un dominio legítimo de AWS
export function isValidAWSArticleUrl(url: string): { isValid: boolean; error?: string } {
  if (!url) {
    return { isValid: false, error: 'La URL del artículo es obligatoria' };
  }
  
  try {
    const parsed = new URL(url);
    const validHostnames = [
      'community.aws',
      'builder.aws.com',
      'aws.amazon.com',
      'dev.to',
      'medium.com'
    ];
    
    const isAllowed = validHostnames.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
    
    if (!isAllowed) {
      return { 
        isValid: false, 
        error: 'El link debe ser de community.aws, builder.aws.com o aws.amazon.com' 
      };
    }
    
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Formato de URL no válido (debe incluir https://)' };
  }
}

// Valida si un enlace de post de LinkedIn es válido (acepta linkedin.com y el acortador oficial lnkd.in)
export function isValidLinkedInPostUrl(url: string): { isValid: boolean; error?: string } {
  if (!url) return { isValid: true }; // Opcional
  
  try {
    const parsed = new URL(url);
    const isLinkedIn = parsed.hostname.includes('linkedin.com') || parsed.hostname.includes('lnkd.in');
    if (!isLinkedIn) {
      return { isValid: false, error: 'Debe ser un enlace de LinkedIn (linkedin.com o lnkd.in)' };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'URL de LinkedIn no válida (debe incluir https://)' };
  }
}

// Calcula la fecha de expiración para el primer día del mes siguiente (DynamoDB TTL)
export function getNextMonthFirstDay(): string {
  const now = new Date();
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
  return nextMonth.toISOString();
}

// Retorna los días restantes del ciclo actual
export function getDaysUntilNextMonth(): number {
  const now = new Date();
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
  const diffTime = nextMonth.getTime() - now.getTime();
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

// Retorna el nombre del ciclo actual (ej: "Octubre 2026")
export function getCurrentCycleName(): string {
  const now = new Date();
  return now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
}

