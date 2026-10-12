export const COGNITO_CONFIG = {
  region: import.meta.env.VITE_COGNITO_REGION || 'us-east-1',
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_5oIhdYrO6',
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '6ucs9kl5f7air49njjmhgsdogm',
  endpoint: `https://cognito-idp.${import.meta.env.VITE_COGNITO_REGION || 'us-east-1'}.amazonaws.com`,
};
