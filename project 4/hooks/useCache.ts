/**
 * Hook personalizado para administrar caché local con tiempo de expiración
 */

export function useLocalCache(key: string, ttl: number = 5 * 60 * 1000) { // 5 minutos por defecto
  const getItem = () => {
    try {
      const cached = localStorage.getItem(`bibliotech-cache-${key}`);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > ttl) {
        localStorage.removeItem(`bibliotech-cache-${key}`);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`Error al recuperar caché para ${key}:`, error);
      return null;
    }
  };
  
  const setItem = (data: any) => {
    try {
      localStorage.setItem(`bibliotech-cache-${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error(`Error al guardar en caché para ${key}:`, error);
    }
  };
  
  const clearItem = () => {
    try {
      localStorage.removeItem(`bibliotech-cache-${key}`);
    } catch (error) {
      console.error(`Error al limpiar caché para ${key}:`, error);
    }
  };
  
  return { getItem, setItem, clearItem };
}

/**
 * Funciones para administrar caché global (no dependiente de hooks)
 */
export const cacheService = {
  getItem: (key: string, ttl: number = 5 * 60 * 1000) => {
    try {
      const cached = localStorage.getItem(`bibliotech-cache-${key}`);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > ttl) {
        localStorage.removeItem(`bibliotech-cache-${key}`);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`Error al recuperar caché para ${key}:`, error);
      return null;
    }
  },
  
  setItem: (key: string, data: any) => {
    try {
      localStorage.setItem(`bibliotech-cache-${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error(`Error al guardar en caché para ${key}:`, error);
    }
  },
  
  clearItem: (key: string) => {
    try {
      localStorage.removeItem(`bibliotech-cache-${key}`);
    } catch (error) {
      console.error(`Error al limpiar caché para ${key}:`, error);
    }
  },
  
  clearAll: () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('bibliotech-cache-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error al limpiar toda la caché:', error);
    }
  }
}; 