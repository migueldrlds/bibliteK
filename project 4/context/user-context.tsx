"use client";

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  numcontrol?: string;
  createdAt: string;
}

// Define los permisos específicos para cada rol
interface Permissions {
  canAccessDashboard: boolean;
  canAccessCatalogo: boolean;
  canAccessPrestamos: boolean;
  canAccessReportes: boolean;
  canAccessUsuarios: boolean;
  canCreateLoans: boolean;
  canUpdateLoans: boolean;
  canDeleteLoans: boolean;
  canManageUsers: boolean;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { username: string; email: string; password: string; numcontrol?: string }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasRole: (role: string | string[]) => boolean;
  checkPermission: (requiredRoles: string[], hideForRoles?: string[]) => boolean;
  permissions: Permissions | null;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Función para generar permisos basados en el rol
const generatePermissionsByRole = (role: string): Permissions => {
  // Rol en minúsculas para comparaciones
  const roleLower = role.toLowerCase();
  
  // Permiso base para todos los usuarios autenticados
  const basePermissions: Permissions = {
    canAccessDashboard: false,
    canAccessCatalogo: true, // Todos pueden acceder al catálogo
    canAccessPrestamos: false,
    canAccessReportes: false,
    canAccessUsuarios: false,
    canCreateLoans: false,
    canUpdateLoans: false,
    canDeleteLoans: false,
    canManageUsers: false
  };
  
  // Permisos para administradores (acceso completo)
  if (roleLower === 'administrador' || roleLower === 'admin') {
    return {
      canAccessDashboard: true,
      canAccessCatalogo: true,
      canAccessPrestamos: true,
      canAccessReportes: true,
      canAccessUsuarios: true,
      canCreateLoans: true,
      canUpdateLoans: true,
      canDeleteLoans: true,
      canManageUsers: true
    };
  }
  
  // Permisos para internos
  if (roleLower === 'interno') {
    return {
      canAccessDashboard: true,
      canAccessCatalogo: true,
      canAccessPrestamos: true,
      canAccessReportes: true,
      canAccessUsuarios: false,
      canCreateLoans: true,
      canUpdateLoans: true,
      canDeleteLoans: true,
      canManageUsers: false
    };
  }
  
  // Permisos para alumnos
  if (roleLower === 'alumno') {
    return {
      canAccessDashboard: false,
      canAccessCatalogo: true,
      canAccessPrestamos: false,
      canAccessReportes: false,
      canAccessUsuarios: false,
      canCreateLoans: false,
      canUpdateLoans: false,
      canDeleteLoans: false,
      canManageUsers: false
    };
  }
  
  // Para cualquier otro rol, retornamos los permisos base
  return basePermissions;
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const router = useRouter();
  
  // Añadir referencias para controlar el estado de las solicitudes
  const isRequestPending = useRef(false);
  const lastRequestTime = useRef<number>(0);
  const cacheExpiryTime = 60000; // 1 minuto de caché

  const clearError = () => setError(null);
  
  const isAuthenticated = !!user;
  const isAdmin = user?.role?.toLowerCase() === 'administrador' || user?.role?.toLowerCase() === 'admin';
  
  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    
    const userRoleLower = user.role.toLowerCase();
    
    if (userRoleLower === 'administrador' || userRoleLower === 'admin') {
      return true;
    }
    
    if (typeof role === 'string') {
      return userRoleLower === role.toLowerCase();
    }
    
    return role.some(r => userRoleLower === r.toLowerCase());
  };
  
  const checkPermission = (requiredRoles: string[] = [], hideForRoles: string[] = []): boolean => {
    if (!user) return false;
    
    if (isAdmin) return true;
    
    if (hideForRoles.length > 0) {
      const userRoleLower = user.role.toLowerCase();
      if (hideForRoles.some(role => userRoleLower === role.toLowerCase())) {
        return false;
      }
    }
    
    if (requiredRoles.length > 0) {
      return hasRole(requiredRoles);
    }
    
    return true;
  };

  // Actualizar permisos cuando cambia el usuario
  useEffect(() => {
    if (user) {
      const newPermissions = generatePermissionsByRole(user.role);
      setPermissions(newPermissions);
      console.log(`Permisos actualizados para rol ${user.role}:`, newPermissions);
    } else {
      setPermissions(null);
    }
  }, [user]);
  
  // Función para refrescar datos del usuario
  const refreshUserData = async () => {
    const token = localStorage.getItem('bibliotech-token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    // Verificar si ya hay una solicitud en curso o si la caché aún es válida
    const currentTime = Date.now();
    if (isRequestPending.current || (currentTime - lastRequestTime.current < cacheExpiryTime && user)) {
      console.log("Solicitud de datos de usuario omitida: ya hay una solicitud en curso o la caché es válida");
      return;
    }
    
    try {
      setLoading(true);
      isRequestPending.current = true;
      
      const response = await authService.getMe(token);
      setUser(response);
      setError(null);
      
      // Actualizar el tiempo de la última solicitud exitosa
      lastRequestTime.current = Date.now();
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setError('Error al verificar la sesión. Por favor, inicia sesión nuevamente.');
      localStorage.removeItem('bibliotech-token');
      localStorage.removeItem('bibliotech-role');
      setUser(null);
    } finally {
      setLoading(false);
      isRequestPending.current = false;
    }
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("Iniciando proceso de login...");
      setLoading(true);
      setError(null);
      const response = await authService.login(email, password);
      console.log("Login exitoso, respuesta:", response);
      setUser(response.user);
      
      // Actualizar el tiempo de la última solicitud exitosa
      lastRequestTime.current = Date.now();
      
      console.log("Usuario y permisos establecidos en el contexto");
      console.log("Redirigiendo a dashboard...");
      
      // Verificar el rol para redirigir correctamente
      const userRole = response.user.role.toLowerCase();
      if (userRole === 'alumno') {
        router.push('/catalogo'); // Los alumnos van directo a catálogo
      } else {
        router.push('/dashboard'); // Los demás roles van al dashboard
      }
    } catch (error: any) {
      console.error('Error detallado en login:', error);
      const errorMessage = error.message || 'Error al iniciar sesión';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { username: string; email: string; password: string; numcontrol?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      setUser(response.user);
      
      // Actualizar el tiempo de la última solicitud exitosa
      lastRequestTime.current = Date.now();
      
      router.push('/catalogo'); // Los nuevos usuarios son alumnos por defecto
    } catch (error) {
      console.error('Error en registro:', error);
      setError('Error al registrar usuario. Por favor, intenta nuevamente.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setPermissions(null);
    setError(null);
    lastRequestTime.current = 0;
    router.push('/auth/login');
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        isAuthenticated,
        isAdmin,
        hasRole,
        checkPermission,
        permissions,
        refreshUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
} 