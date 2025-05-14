"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/dashboard/header";
import { FloatingActionButton } from "@/components/dashboard/floating-action-button";
import { useUser } from "@/context/user-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

// Mapeo de rutas a permisos requeridos
const routePermissions: Record<string, string> = {
  "/dashboard": "canAccessDashboard",
  "/catalogo": "canAccessCatalogo",
  "/prestamos": "canAccessPrestamos",
  "/usuarios": "canAccessUsuarios", 
  "/reportes": "canAccessReportes",
};

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const { isAuthenticated, loading, permissions, isAdmin } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Determinar qué permiso se requiere para la ruta actual
  const getRequiredPermission = (path: string): string | null => {
    // Obtener la ruta base (primer segmento)
    const basePath = '/' + path.split('/')[1];
    return routePermissions[basePath] || null;
  };

  // Verificar si el usuario tiene permisos para acceder a la ruta actual
  const hasPermissionForRoute = (): boolean => {
    if (isAdmin) return true; // Administradores tienen acceso completo
    
    // Verificar permisos específicos
    const requiredPermission = getRequiredPermission(pathname);
    if (!requiredPermission) return true; // Si no hay permiso definido, permitir acceso
    
    return permissions ? permissions[requiredPermission as keyof typeof permissions] : false;
  };

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Redirigir a login si no está autenticado
        router.push('/auth/login');
      } else if (!hasPermissionForRoute()) {
        // Redirigir al catálogo si no tiene permisos para la ruta actual
        console.log(`Usuario no tiene permiso para: ${pathname}, redirigiendo a catálogo`);
        router.push('/catalogo');
      }
    }
  }, [isAuthenticated, loading, pathname, permissions, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !hasPermissionForRoute()) {
    return null; // El useEffect ya maneja la redirección
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={cn("flex-1 pt-6 px-10 pb-16", className)}>
        <div className="container mx-auto">
          {children}
        </div>
        <FloatingActionButton />
      </main>
    </div>
  );
}