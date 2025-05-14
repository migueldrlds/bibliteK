"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}

/**
 * Componente de protección para páginas que requieren autenticación o roles específicos
 * @param children - Contenido a mostrar si el usuario está autenticado y tiene los roles requeridos
 * @param requiredRoles - Roles requeridos para acceder (si no se especifica, solo se requiere autenticación)
 * @param redirectTo - Ruta a la que redirigir si no se tiene acceso (por defecto: /auth/login)
 */
export function AuthGuard({ 
  children, 
  requiredRoles = [], 
  redirectTo = "/auth/login" 
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, hasRole, loading } = useUser();

  useEffect(() => {
    // Esperar a que se complete la verificación de autenticación
    if (loading) return;
    
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }
    
    // Si hay roles requeridos, verificar si el usuario tiene alguno
    if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, loading, requiredRoles, router, redirectTo, hasRole]);

  // Si está cargando o no está autenticado, no mostrar nada
  if (loading || !isAuthenticated) {
    return null;
  }
  
  // Si hay roles requeridos y no tiene ninguno, no mostrar nada
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return null;
  }

  // Si está autenticado y tiene los roles requeridos, mostrar el contenido
  return <>{children}</>;
}

/**
 * Componente de protección para páginas que requieren un rol de administrador
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRoles={["admin", "administrador"]} redirectTo="/unauthorized">
      {children}
    </AuthGuard>
  );
}

/**
 * Componente de redirección para usuarios autenticados
 * Útil para páginas de login o registro que no deberían ser accesibles si ya hay sesión
 */
export function AuthRedirect({ 
  children, 
  redirectTo = "/dashboard" 
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { isAuthenticated, loading } = useUser();
  
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, router, redirectTo]);
  
  // No mostrar contenido si está autenticado
  if (loading || isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
} 