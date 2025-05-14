/**
 * Configuración de conexión con la API de Strapi
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337',
  API_TOKEN: process.env.NEXT_PUBLIC_API_TOKEN || '',
  TIMEOUT: 15000, // 15 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/local',
      REGISTER: '/api/auth/local/register',
      USER: '/api/users/me'
    },
    BOOKS: '/api/books',
    LOANS: '/api/loans',
    INVENTORY: '/api/inventories',
    USERS: '/api/users'
  }
};

export default API_CONFIG; 