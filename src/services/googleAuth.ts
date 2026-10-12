import type { CreatorProfile } from '../types';
import { cleanUsername, formatBuilderUrl } from '../utils/sanitizer';

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '580534439118-64h777puf0v0hadj0bim58vhh52jq1n3.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string | number;
              locale?: string;
            }
          ) => void;
          prompt: (moment?: (notification: any) => void) => void;
        };
      };
    };
  }
}

// Decodificador seguro de JWT de Google
export function parseGoogleJwt(token: string): {
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  picture?: string;
} {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

// Convertir credencial de Google en CreatorProfile de la app
export function createProfileFromGoogleCredential(credential: string): CreatorProfile {
  const payload = parseGoogleJwt(credential);
  const name = payload.name || payload.given_name || 'Creador AWS';
  const email = payload.email || '';
  const cleanHandle = cleanUsername(name);

  // Recuperar datos previos si existían
  let bio = 'Creador en el Bootcamp AWS Builder Center';
  let builderUrl = formatBuilderUrl(cleanHandle);
  let linkedinUrl: string | undefined;
  let instagramUrl: string | undefined;

  let existingId: string | undefined;

  // Buscar en usuarios registrados previamente para vincular cuenta
  try {
    const registered = JSON.parse(localStorage.getItem('creadores_registered_users') || '[]');
    const match = registered.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    if (match) {
      existingId = match.id;
      bio = match.bio || bio;
      builderUrl = match.builderUrl || builderUrl;
      linkedinUrl = match.linkedinUrl;
      instagramUrl = match.instagramUrl;
    }
  } catch {}

  const savedUserJson = localStorage.getItem('creadores_active_user');
  if (savedUserJson) {
    try {
      const saved = JSON.parse(savedUserJson);
      if (saved.email?.toLowerCase() === email.toLowerCase()) {
        existingId = existingId || saved.id;
        bio = saved.bio || bio;
        builderUrl = saved.builderUrl || builderUrl;
        linkedinUrl = saved.linkedinUrl;
        instagramUrl = saved.instagramUrl;
      }
    } catch {
      // ignore
    }
  }

  // Generar ID consistente determinista basado en el correo para evitar fragmentación
  const normalizedId = existingId || `usr_${btoa(email.toLowerCase()).replace(/=/g, '').slice(0, 16)}`;

  return {
    id: normalizedId,
    name,
    email,
    bio,
    builderHandle: cleanHandle,
    builderUrl,
    linkedinUrl,
    instagramUrl,
    avatarUrl: payload.picture || '/images/mascot_opt.png',
  };
}
