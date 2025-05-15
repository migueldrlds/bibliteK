import axios, { AxiosRequestConfig } from 'axios';

// API base URL - Ajustar según el entorno
const API_URL = 'http://localhost:1337';

// Crear una instancia de axios con la configuración base
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el token JWT en cada solicitud
axiosInstance.interceptors.request.use((config) => {
  // Si hay un token en localStorage, añadirlo a las cabeceras
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Método GET
  async get(url: string, config?: AxiosRequestConfig) {
    try {
      const response = await axiosInstance.get(url, config);
      return response.data;
    } catch (error) {
      console.error('Error en solicitud GET:', error);
      throw error;
    }
  },

  // Método POST
  async post(url: string, data: any, config?: AxiosRequestConfig) {
    try {
      const response = await axiosInstance.post(url, data, config);
      return response.data;
    } catch (error) {
      console.error('Error en solicitud POST:', error);
      throw error;
    }
  },

  // Método PUT
  async put(url: string, data: any, config?: AxiosRequestConfig) {
    try {
      const response = await axiosInstance.put(url, data, config);
      return response.data;
    } catch (error) {
      console.error('Error en solicitud PUT:', error);
      throw error;
    }
  },

  // Método DELETE
  async delete(url: string, config?: AxiosRequestConfig) {
    try {
      const response = await axiosInstance.delete(url, config);
      return response.data;
    } catch (error) {
      console.error('Error en solicitud DELETE:', error);
      throw error;
    }
  },

  // Método para autenticación
  async login(identifier: string, password: string) {
    try {
      const response = await this.post('/api/auth/local', {
        identifier,
        password,
      });
      
      // Guardar token JWT en localStorage
      if (response.jwt) {
        localStorage.setItem('token', response.jwt);
      }
      
      return response;
    } catch (error) {
      console.error('Error de autenticación:', error);
      throw error;
    }
  },

  // Método para cerrar sesión
  logout() {
    localStorage.removeItem('token');
  },
}; 