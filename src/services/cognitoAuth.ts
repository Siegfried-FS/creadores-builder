import { COGNITO_CONFIG } from '../config/cognito';
import type { CreatorProfile } from '../types';
import { cleanUsername, formatBuilderUrl } from '../utils/sanitizer';

// Decodificador seguro de JWT en navegador sin dependencias externas
function parseJwtPayload(token: string): Record<string, unknown> {
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

async function callCognitoApi(target: string, body: Record<string, unknown>): Promise<any> {
  const response = await fetch(COGNITO_CONFIG.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorType = data.__type || 'CognitoError';
    const message = data.message || 'Error al conectar con Amazon Cognito';
    throw new Error(formatCognitoError(errorType, message));
  }

  return data;
}

function formatCognitoError(errorType: string, rawMessage: string): string {
  if (errorType.includes('NotAuthorizedException')) {
    return 'Correo o contraseña incorrectos.';
  }
  if (errorType.includes('UserNotFoundException')) {
    return 'No existe un usuario con este correo electrónico.';
  }
  if (errorType.includes('UsernameExistsException')) {
    return 'Ya existe una cuenta con este correo. Por favor inicia sesión.';
  }
  if (errorType.includes('InvalidPasswordException')) {
    return 'La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas y números.';
  }
  if (errorType.includes('CodeMismatchException')) {
    return 'El código de verificación es incorrecto.';
  }
  if (errorType.includes('ExpiredCodeException')) {
    return 'El código de verificación ha expirado. Solicita uno nuevo.';
  }
  if (errorType.includes('UserNotConfirmedException')) {
    return 'Tu cuenta aún no está confirmada. Ingresa el código enviado a tu correo.';
  }
  return rawMessage;
}

export interface CognitoSignInResult {
  user: CreatorProfile;
  idToken: string;
  accessToken: string;
  refreshToken?: string;
}

export async function signInWithCognito(
  email: string,
  password: string
): Promise<CognitoSignInResult> {
  const result = await callCognitoApi('InitiateAuth', {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: COGNITO_CONFIG.clientId,
    AuthParameters: {
      USERNAME: email.trim(),
      PASSWORD: password,
    },
  });

  const authResult = result.AuthenticationResult;
  if (!authResult) {
    throw new Error('Respuesta de autenticación incompleta.');
  }

  const payload = parseJwtPayload(authResult.IdToken);
  const sub = (payload.sub as string) || `usr_${Date.now()}`;
  const name = (payload.name as string) || email.split('@')[0];
  const cleanHandle = cleanUsername(email.split('@')[0]);

  // Recuperar datos adicionales de perfil si existían en localStorage
  let bio = 'Creador del Bootcamp AWS Builder Center';
  let builderUrl = formatBuilderUrl(cleanHandle);
  let linkedinUrl: string | undefined;
  let instagramUrl: string | undefined;

  const savedUserJson = localStorage.getItem('creadores_active_user');
  if (savedUserJson) {
    try {
      const saved = JSON.parse(savedUserJson);
      if (saved.email === email.trim()) {
        bio = saved.bio || bio;
        builderUrl = saved.builderUrl || builderUrl;
        linkedinUrl = saved.linkedinUrl;
        instagramUrl = saved.instagramUrl;
      }
    } catch {
      // ignore
    }
  }

  const user: CreatorProfile = {
    id: sub,
    name,
    email: email.trim(),
    bio,
    builderHandle: cleanHandle,
    builderUrl,
    linkedinUrl,
    instagramUrl,
    avatarUrl: '/images/mascot_opt.png',
  };

  // Guardar tokens y usuario
  localStorage.setItem('creadores_id_token', authResult.IdToken);
  localStorage.setItem('creadores_access_token', authResult.AccessToken);
  if (authResult.RefreshToken) {
    localStorage.setItem('creadores_refresh_token', authResult.RefreshToken);
  }

  return {
    user,
    idToken: authResult.IdToken,
    accessToken: authResult.AccessToken,
    refreshToken: authResult.RefreshToken,
  };
}

export async function signUpWithCognito(
  email: string,
  password: string,
  name: string
): Promise<{ userSub: string; isConfirmed: boolean }> {
  const result = await callCognitoApi('SignUp', {
    ClientId: COGNITO_CONFIG.clientId,
    Username: email.trim(),
    Password: password,
    UserAttributes: [
      { Name: 'name', Value: name.trim() },
    ],
  });

  return {
    userSub: result.UserSub,
    isConfirmed: result.UserConfirmed,
  };
}

export async function confirmSignUpWithCognito(
  email: string,
  code: string
): Promise<boolean> {
  await callCognitoApi('ConfirmSignUp', {
    ClientId: COGNITO_CONFIG.clientId,
    Username: email.trim(),
    ConfirmationCode: code.trim(),
  });
  return true;
}

export async function resendConfirmationCodeWithCognito(email: string): Promise<void> {
  await callCognitoApi('ResendConfirmationCode', {
    ClientId: COGNITO_CONFIG.clientId,
    Username: email.trim(),
  });
}
