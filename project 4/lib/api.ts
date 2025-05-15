import API_CONFIG from '../config/api.config';

// Función auxiliar para esperar
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Función para manejar reintentos
const fetchWithRetry = async (url: string, options: RequestInit, attempts = API_CONFIG.RETRY_ATTEMPTS): Promise<any> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    console.log("Intentando conectar a:", url);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 403) {
        // Limpiar tokens si hay error de autorización
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('bibliotech-token');
          localStorage.removeItem('bibliotech-role');
        }
        throw new Error('Sesión expirada');
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }

    // Verificar si es una respuesta 204 (No Content) antes de intentar procesar JSON
    if (response.status === 204) {
      console.log("Operación exitosa (204 No Content)");
      return { success: true, message: "Operación completada correctamente" };
    }

    // Solo procesar como JSON si la respuesta tiene contenido
    const data = await response.json();
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (attempts > 0) {
      console.log(`Reintentando llamada a ${url}. Intentos restantes: ${attempts - 1}`);
      await sleep(API_CONFIG.RETRY_DELAY);
      return fetchWithRetry(url, options, attempts - 1);
    }
    
    console.error(`Error al conectar con ${url}:`, error);
    throw error;
  }
};

// Función principal para hacer llamadas a la API
const fetchAPI = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('bibliotech-token') : null;
  
  // Construir la URL completa
  const url = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetchWithRetry(url, {
      ...options,
      headers
    });
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('La solicitud ha excedido el tiempo de espera');
    }
    throw error;
  }
};

export default fetchAPI; 