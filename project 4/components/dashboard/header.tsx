"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Library, LayoutDashboard, BookText, BookMarked, Users, BarChart3, LogOut, User, LogIn } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/user-context";
import { useEffect, useState } from "react";

// Definir un tipo para los elementos de navegación
type NavigationItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  permissionKey: keyof typeof permissionMap | 'always'; // Siempre visible o requiere permiso específico
};

// Mapeo de rutas a permisos requeridos
const permissionMap = {
  dashboard: 'canAccessDashboard',
  catalogo: 'canAccessCatalogo',
  prestamos: 'canAccessPrestamos',
  usuarios: 'canAccessUsuarios',
  reportes: 'canAccessReportes',
};

const navigationItems: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, permissionKey: 'dashboard' },
  { href: "/catalogo", label: "Catálogo", icon: <BookText className="h-4 w-4" />, permissionKey: 'catalogo' },
  { href: "/prestamos", label: "Préstamos", icon: <BookMarked className="h-4 w-4" />, permissionKey: 'prestamos' },
  { href: "/usuarios", label: "Usuarios", icon: <Users className="h-4 w-4" />, permissionKey: 'usuarios' },
  { href: "/reportes", label: "Reportes", icon: <BarChart3 className="h-4 w-4" />, permissionKey: 'reportes' },
];

// Componente para el menú simplificado (solo catálogo para usuarios no autenticados)
const PublicNavigation = ({ pathname }: { pathname: string }) => (
  <nav className="hidden md:flex space-x-2">
    <Link
      href="/catalogo"
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out",
        pathname === "/catalogo"
          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <BookText className="h-4 w-4" />
      Catálogo
    </Link>
  </nav>
);

export function Header() {
  const pathname = usePathname();
  const { 
    user, 
    logout, 
    loading,
    isAuthenticated,
    isAdmin,
    permissions
  } = useUser();
  const [navbarReady, setNavbarReady] = useState(false);
  
  // Esperar a que el componente se monte en el cliente para evitar hidratación incorrecta
  useEffect(() => {
    setNavbarReady(true);
  }, []);
  
  // Añadir log para depuración del rol de usuario
  useEffect(() => {
    if (user) {
      console.log("Rol de usuario en Header:", user.role);
    } else {
      console.log("No hay usuario autenticado");
    }
  }, [user]);

  // Si el componente no está listo para renderizar
  if (!navbarReady) {
    return null; // No renderizar nada para evitar hidratación incorrecta
  }

  // Helper para verificar permisos
  const hasPermission = (permissionKey: string): boolean => {
    if (!permissions || !isAuthenticated) return false;
    if (isAdmin) return true; // El administrador tiene todos los permisos
    return permissionKey === 'always' || permissions[permissionKey as keyof typeof permissions];
  };

  // Renderizado base del header
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-10">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href={isAuthenticated ? (hasPermission('canAccessDashboard') ? "/dashboard" : "/catalogo") : "/"} className="flex items-center space-x-2">
              <Library className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-semibold">BiblioTeK</span>
            </Link>

            {/* Mostrar un placeholder o navegación pública durante el estado de carga */}
            {loading ? (
              <PublicNavigation pathname={pathname} />
            ) : !isAuthenticated ? (
              <PublicNavigation pathname={pathname} />
            ) : (
              <nav className="hidden md:flex space-x-2">
                {navigationItems.map((item) => {
                  // Solo mostrar el elemento si el usuario tiene el permiso específico
                  const permissionKey = item.permissionKey === 'always' 
                    ? 'always' 
                    : permissionMap[item.permissionKey];
                    
                  if (!hasPermission(permissionKey)) return null;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out",
                        pathname === item.href
                          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {loading ? (
              // Mostrar un botón de inicio de sesión neutral durante la carga
              <Button variant="ghost" size="sm" disabled>
                <span className="opacity-0">Cargando</span>
              </Button>
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-medium">
                        {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.role === 'authenticated' ? 'Alumno' : user?.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link href="/perfil" className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Iniciar sesión</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}