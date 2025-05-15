import { apiService } from './apiService';

// Interfaz para representar los datos de usuario
export interface User {
  id: number;
  username: string;
  email: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: string;
  createdAt: string;
  updatedAt: string;
  Numcontrol?: string;
  numcontrol?: string;
  Carrera?: string;
  Genero?: string;
  campus?: string;
  documentId?: string;
  Estado?: string;
  rol?: string;
}

// Interfaz para datos a enviar al crear usuario
export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  Numcontrol?: string;
  campus?: string;
  Genero?: string;
  Carrera?: string;
  Estado?: string;
  rol?: string;
  confirmed?: boolean;
}

export const userService = {
  // Obtener todos los usuarios
  async getUsers(): Promise<User[]> {
    try {
      // Llamar al API con el método GET
      const response = await apiService.get('/api/users', { 
        params: { 'populate': '*' } 
      });
      
      // Si la respuesta es un array, devolverlo directamente
      if (Array.isArray(response)) {
        return response;
      }
      
      // Si la respuesta tiene una propiedad 'data', extraer los datos
      if (response && typeof response === 'object' && 'data' in response) {
        if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      
      // Si no se ajusta a ninguno de los formatos esperados, devolver un array vacío
      console.error('Formato de respuesta inesperado al obtener usuarios:', response);
      return [];
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },
  
  // Obtener un usuario por ID
  async getUserById(id: number | string): Promise<User | null> {
    try {
      const response = await apiService.get(`/api/users/${id}`, { 
        params: { 'populate': '*' } 
      });
      
      if (response && typeof response === 'object') {
        return response;
      }
      
      return null;
    } catch (error) {
      console.error(`Error al obtener usuario con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo usuario
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      console.log('Creando usuario con datos:', userData);
      
      // En Strapi v4, hay que enviar los datos dentro de un objeto 'data'
      const response = await apiService.post('/api/users', userData);
      
      console.log('Respuesta al crear usuario:', response);
      
      // Devolver los datos del usuario creado
      return response;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },

  // Actualizar un usuario existente
  async updateUser(id: number | string, userData: Partial<User>): Promise<User> {
    try {
      const response = await apiService.put(`/api/users/${id}`, userData);
      return response;
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un usuario
  async deleteUser(id: number | string): Promise<void> {
    try {
      await apiService.delete(`/api/users/${id}`);
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error);
      throw error;
    }
  }
}; 