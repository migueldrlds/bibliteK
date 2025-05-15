"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  Building,
  Calendar,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock,
  Copy,
  Fingerprint,
  Gauge,
  GraduationCap,
  Key,
  Layers3,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  School,
  Search,
  Shield,
  ShieldAlert,
  SquareUser,
  Trash2,
  User,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { userService, User as UserType } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/user-context";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

// Interfaz para la UI de usuario con datos adicionales
interface UIUser extends UserType {
  fullName: string;
  career?: string;
  gender?: string;
  status: string;
  Estado?: string; // Campo Estado de la API
  stats: {
    totalLoans: number;
    activeLoans: number;
    overdueLoans: number;
    lastActivity: string;
  };
}

// Definir el esquema de validación para el formulario de creación de usuario
const createUserSchema = z.object({
  username: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres",
  }),
  email: z.string().email({
    message: "Ingrese un correo electrónico válido",
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres",
  }),
  rol: z.string(),
  Estado: z.string().default("Activo"),
  Numcontrol: z.string().optional(),
  Genero: z.string().optional(),
  campus: z.string().optional(),
  Carrera: z.string().optional(),
});

// Schema para editar usuario (sin contraseña obligatoria)
const editUserSchema = z.object({
  username: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Debe ser un correo electrónico válido"),
  password: z.string()
    .refine(val => val === '' || val.length >= 6, {
      message: "La contraseña debe tener al menos 6 caracteres"
    })
    .optional(),
  Numcontrol: z.string().optional(),
  campus: z.string().optional(),
  Genero: z.string().optional(),
  Carrera: z.string().optional(),
  Estado: z.string().default("Activo"),
  rol: z.string(),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type EditUserFormValues = z.infer<typeof editUserSchema>;

// Función para normalizar texto (eliminar acentos)
const normalizeString = (text: string | null | undefined): string => {
  if (!text) return "";
  // Convertir a minúsculas y eliminar acentos
  return text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Elimina todos los diacríticos (acentos, tildes, etc.)
};

export default function UsuariosPage() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<UIUser | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [users, setUsers] = useState<UIUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const { permissions, isAuthenticated, loading: permissionsLoading } = useUser();
  const router = useRouter();
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);

  // Configurar el formulario de creación de usuario con React Hook Form
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      Numcontrol: "",
      campus: undefined,
      Genero: undefined,
      Carrera: undefined,
      Estado: "Activo",
      rol: "Alumno",
    },
  });

  // Configurar el formulario de edición de usuario
  const editForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      rol: "Alumno",
      Estado: "Activo",
      Numcontrol: "",
      Genero: "",
      campus: "",
      Carrera: "",
    },
  });

  // Cargar los datos del usuario seleccionado en el formulario de edición
  useEffect(() => {
    if (selectedUser && showEditDialog) {
      editForm.reset({
        username: selectedUser.fullName || "",
        email: selectedUser.email || "",
        password: "", // Contraseña vacía por defecto
        rol: selectedUser.rol || "Alumno",
        Estado: selectedUser.status || "Activo",
        Numcontrol: selectedUser.numcontrol?.toString() || "",
        Genero: selectedUser.gender || "",
        campus: selectedUser.campus || "",
        Carrera: selectedUser.career || "",
      });
    }
  }, [selectedUser, showEditDialog, editForm]);

  // Función para crear un nuevo usuario
  const onCreateUser = async (data: CreateUserFormValues) => {
    try {
      setIsCreatingUser(true);
      console.log("Datos del formulario:", data);

      // Adaptar los datos al formato esperado por la API
      const userData = {
        username: data.username,
        email: data.email,
        password: data.password,
        Numcontrol: data.Numcontrol,
        campus: data.campus,
        Genero: data.Genero,
        Carrera: data.Carrera,
        Estado: data.Estado,
        rol: data.rol,
        confirmed: true, // Confirmar usuario automáticamente
      };

      // Llamar al servicio para crear el usuario
      const newUser = await userService.createUser(userData);
      console.log("Usuario creado:", newUser);

      // Mostrar notificación de éxito
      toast({
        title: "Usuario creado",
        description: `Se ha creado el usuario ${data.username} correctamente`,
      });

      // Actualizar la lista de usuarios
      const response = await userService.getUsers();
      const transformedUsers: UIUser[] = response.map((user: any) => {
        let status = "activo";
        if (user.Estado) {
          status = user.Estado.toLowerCase();
        } else if (user.blocked) {
          status = "inactivo";
        } else if (!user.confirmed) {
          status = "pendiente";
        }
        
        return {
          ...user,
          fullName: user.username || 'Sin nombre',
          status,
          Estado: user.Estado,
          // Asegurar que el número de control esté disponible (puede estar en Numcontrol o numcontrol)
          numcontrol: user.Numcontrol || user.numcontrol || '',
          career: user.Carrera || (user.rol === 'Alumno' ? "Ingeniería en Sistemas Computacionales" : undefined),
          gender: user.Genero?.toLowerCase() || (Math.random() > 0.5 ? "masculino" : "femenino"),
          stats: {
            totalLoans: Math.floor(Math.random() * 15),
            activeLoans: Math.floor(Math.random() * 3),
            overdueLoans: Math.floor(Math.random() * 2),
            lastActivity: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          }
        };
      });
      
      setUsers(transformedUsers);

      // Cerrar el diálogo y reiniciar el formulario
      setShowCreateUserDialog(false);
      form.reset();
    } catch (error) {
      console.error("Error al crear usuario:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el usuario",
        variant: "destructive",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Verificar permisos al cargar la página
  useEffect(() => {
    if (!permissionsLoading && isAuthenticated && permissions && !permissions.canAccessUsuarios) {
      router.push('/catalogo');
    }
  }, [permissions, isAuthenticated, permissionsLoading, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      // Solo cargar datos si tiene permisos
      if (permissionsLoading || !permissions || !permissions.canAccessUsuarios) {
        return;
      }
      
      try {
        setDataLoading(true);
        const response = await userService.getUsers();
        
        // Log para depuración
        console.log("Datos de usuarios recibidos:", response);
        
        // Transformar los datos de la API al formato esperado por la UI
        const transformedUsers: UIUser[] = response.map((user: any) => {
          // Determinar estado basado en el campo Estado de la API, o blocked y confirmed como fallback
          let status = "activo";
          
          // Usar el campo Estado de la API si existe
          if (user.Estado) {
            // Normalizar a minúsculas para consistencia
            status = user.Estado.toLowerCase();
          } else if (user.blocked) {
            status = "inactivo";
          } else if (!user.confirmed) {
            status = "pendiente";
          }
          
          // Para debugging
          console.log("Usuario procesado:", user.username, "Rol:", user.rol, "NumControl:", user.Numcontrol || user.numcontrol);
          
          return {
            ...user,
            fullName: user.username || 'Sin nombre',
            status,
            Estado: user.Estado, // Mantener el campo original
            // Asegurar que el número de control esté disponible (puede estar en Numcontrol o numcontrol)
            numcontrol: user.Numcontrol || user.numcontrol || '',
            // Datos ficticios para mantener consistencia con el diseño original
            career: user.Carrera || (user.rol === 'Alumno' ? "Ingeniería en Sistemas Computacionales" : undefined),
            gender: user.Genero?.toLowerCase() || (Math.random() > 0.5 ? "masculino" : "femenino"),
            stats: {
              totalLoans: Math.floor(Math.random() * 15),
              activeLoans: Math.floor(Math.random() * 3),
              overdueLoans: Math.floor(Math.random() * 2),
              lastActivity: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            }
          };
        });
        
        setUsers(transformedUsers);
        setLoading(false); // Establecer loading a false cuando los datos se han cargado
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive",
        });
        setLoading(false); // Establecer loading a false incluso en caso de error
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchUsers();
  }, [toast, permissions, permissionsLoading]);

  // Mostrar loading mientras se cargan los permisos
  if (permissionsLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Verificando permisos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Redirigir si no tiene permisos
  if (isAuthenticated && permissions && !permissions.canAccessUsuarios) {
    router.push('/catalogo');
    return null;
  }

  // Mostrar loading mientras se cargan los datos
  if (dataLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Cargando usuarios...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Filtrar usuarios basados en término de búsqueda y filtros
  const filteredUsers = users.filter(user => {
    // Normalizar el término de búsqueda para hacerlo insensible a acentos
    const normalizedSearchTerm = normalizeString(searchTerm);
    
    const matchesSearch = 
      normalizeString(user.fullName).includes(normalizedSearchTerm) ||
      (user.numcontrol && normalizeString(user.numcontrol.toString()).includes(normalizedSearchTerm)) ||
      normalizeString(user.email).includes(normalizedSearchTerm);

    // Comparar los roles de manera insensible a mayúsculas/minúsculas
    const matchesRole = 
      roleFilter === "todos" || 
      (user.rol && user.rol.toLowerCase() === roleFilter.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string | undefined) => {
    // Convertir todo a minúsculas para consistencia
    const roleToLower = role?.toLowerCase() || "";
    
    const styles: Record<string, string> = {
      alumno: "bg-emerald-500 hover:bg-emerald-600",
      administrador: "bg-rose-500 hover:bg-rose-600",
      interno: "bg-blue-500 hover:bg-blue-600",
      authenticated: "bg-gray-500 hover:bg-gray-600",
    };

    const labels: Record<string, string> = {
      alumno: "Alumno",
      administrador: "Administrador",
      interno: "Interno",
      authenticated: "Usuario",
    };

    // Buscar la coincidencia en minúsculas
    const roleKey = roleToLower in styles ? roleToLower : "authenticated";

    // Para debugging
    console.log("Role original:", role, "Role procesado:", roleToLower, "Key usada:", roleKey);

    return (
      <Badge className={styles[roleKey]}>
        {labels[roleKey]}
      </Badge>
    );
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return (
      <Badge variant="outline" className="text-gray-600 border-gray-600">
        Desconocido
      </Badge>
    );
    
    switch (status.toLowerCase()) {
      case "activo":
      return (
        <Badge variant="outline" className="text-green-600 border-green-600">
          Activo
        </Badge>
      );
      case "pendiente":
      return (
        <Badge variant="outline" className="text-orange-600 border-orange-600">
          Pendiente
        </Badge>
      );
      case "inactivo":
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-600">
          Inactivo
        </Badge>
      );
      case "baja":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            Baja
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-600">
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
          </Badge>
        );
    }
  };

  const handleDeleteUser = () => {
    // Here would go the logic to delete the user
    setShowDeleteDialog(false);
    setSelectedUser(null);
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd MMM yyyy", { locale: es });
    } catch (e) {
      return date;
    }
  };

  // Función para guardar los cambios al editar un usuario
  const onEditUser = async (data: EditUserFormValues) => {
    if (!selectedUser) return;
    
    try {
      setIsEditingUser(true);
      console.log("Datos de edición:", data);

      // Adaptar los datos al formato esperado por la API
      const userData = {
        ...data,
        id: selectedUser.id
      };
      
      // Solo incluir contraseña si se ha proporcionado una nueva
      if (!userData.password || userData.password.trim() === "") {
        delete userData.password;
      }
      
      // Llamar al servicio para actualizar el usuario
      await userService.updateUser(selectedUser.id, userData);
      
      // Mostrar notificación de éxito
      toast({
        title: "Usuario actualizado",
        description: `Se ha actualizado el usuario ${data.username} correctamente`,
      });
      
      // Actualizar la lista de usuarios
      const response = await userService.getUsers();
      const transformedUsers: UIUser[] = response.map((user: any) => {
        let status = "activo";
        if (user.Estado) {
          status = user.Estado.toLowerCase();
        } else if (user.blocked) {
          status = "inactivo";
        } else if (!user.confirmed) {
          status = "pendiente";
        }
        
        return {
          ...user,
          fullName: user.username || 'Sin nombre',
          status,
          Estado: user.Estado,
          career: user.Carrera || (user.rol === 'Alumno' ? "Ingeniería en Sistemas Computacionales" : undefined),
          gender: user.Genero?.toLowerCase() || (Math.random() > 0.5 ? "masculino" : "femenino"),
          stats: {
            totalLoans: Math.floor(Math.random() * 15),
            activeLoans: Math.floor(Math.random() * 3),
            overdueLoans: Math.floor(Math.random() * 2),
            lastActivity: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          }
        };
      });
      
      setUsers(transformedUsers);

      // Cerrar diálogo
      setShowEditDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    } finally {
      setIsEditingUser(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
            <p className="text-muted-foreground">
              Gestiona los usuarios registrados en el sistema
            </p>
          </div>
          
          <Button onClick={() => setShowCreateUserDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        <Tabs value={roleFilter} onValueChange={setRoleFilter} className="w-auto">
          <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
            <TabsTrigger value="todos" className="rounded-md px-3 py-1 text-sm font-medium">
              Todos
            </TabsTrigger>
            <TabsTrigger value="Alumno" className="rounded-md px-3 py-1 text-sm font-medium">
              Alumnos
            </TabsTrigger>
            <TabsTrigger value="Interno" className="rounded-md px-3 py-1 text-sm font-medium">
              Internos
            </TabsTrigger>
            <TabsTrigger value="Administrador" className="rounded-md px-3 py-1 text-sm font-medium">
              Administradores
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-auto mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, ID o correo..."
            className="pl-9 w-full min-w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Número de control</TableHead>
                <TableHead>Correo electrónico</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de registro</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.numcontrol || '-'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.career || "-"}</TableCell>
                  <TableCell>{getRoleBadge(user.rol)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditDialog(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Diálogo de creación de usuario - Diseño compacto */}
        <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-2 border-b">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-primary/10">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg">Crear Nuevo Usuario</DialogTitle>
                  <DialogDescription className="text-xs">
                    Complete la información para registrar un nuevo usuario
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateUser)} className="space-y-4 py-3">
                {/* Sección: Información Personal y Acceso */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-primary">
                    <User className="h-3.5 w-3.5" />
                    <h3 className="font-medium text-xs">Información Personal y Acceso</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Nombre y Número de control */}
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">
                            Nombre completo <span className="text-rose-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre completo" {...field} className="h-8 text-sm" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="Numcontrol"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Número de control</FormLabel>
                          <FormControl>
                            <Input placeholder="Matrícula o ID" {...field} className="h-8 text-sm" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Email y Contraseña */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            Correo electrónico <span className="text-rose-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="correo@ejemplo.com" {...field} className="h-8 text-sm" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-muted-foreground" />
                            Contraseña <span className="text-rose-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Mínimo 6 caracteres" {...field} className="h-8 text-sm" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Sección: Rol y Estado */}
                <div className="pt-2 border-t space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Rol */}
                    <FormField
                      control={form.control}
                      name="rol"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">
                            Rol <span className="text-rose-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Seleccionar rol" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Alumno">
                                <div className="flex items-center gap-1">
                                  <School className="h-3 w-3 text-emerald-500" />
                                  <span className="text-sm">Alumno</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="Interno">
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3 text-blue-500" />
                                  <span className="text-sm">Interno</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="Administrador">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-rose-500" />
                                  <span className="text-sm">Administrador</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-[10px]">
                            Determina los permisos en el sistema
                          </FormDescription>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Estado */}
                    <FormField
                      control={form.control}
                      name="Estado"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Estado</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Seleccionar estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Activo">
                                <div className="flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  <span className="text-sm">Activo</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="Inactivo">
                                <div className="flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3 text-amber-500" />
                                  <span className="text-sm">Inactivo</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="Baja">
                                <div className="flex items-center gap-1">
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                  <span className="text-sm">Baja</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-[10px]">
                            Usuarios activos pueden acceder al sistema
                          </FormDescription>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Sección: Información Adicional */}
                <div className="pt-2 border-t space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {/* Campus, Género y Carrera */}
                    <FormField
                      control={form.control}
                      name="campus"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Campus</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Campus" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Tomas Aquino">Tomas Aquino</SelectItem>
                              <SelectItem value="Otay">Otay</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="Genero"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Género</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Género" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Hombre">Hombre</SelectItem>
                              <SelectItem value="Mujer">Mujer</SelectItem>
                              <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="Carrera"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Carrera</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Carrera" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sistemas">Sistemas</SelectItem>
                              <SelectItem value="Arquitectura">Arquitectura</SelectItem>
                              <SelectItem value="Aeronautica">Aeronautica</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex items-center text-xs text-amber-600 p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                  <AlertTriangle className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                  <p>Los campos con <span className="text-rose-500">*</span> son obligatorios. Los usuarios podrán iniciar sesión inmediatamente.</p>
                </div>

                <DialogFooter className="pt-2 border-t flex items-center justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateUserDialog(false);
                      form.reset();
                    }}
                    disabled={isCreatingUser}
                    className="h-8 text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isCreatingUser} className="h-8 text-xs gap-1">
                    {isCreatingUser ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3" />
                        Crear Usuario
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {selectedUser && (
          <>
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Detalles del usuario</DialogTitle>
                  <DialogDescription>
                    Información completa del usuario seleccionado
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold">{selectedUser.fullName}</h3>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(selectedUser.rol)}
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">ID/Número de control</p>
                      <p className="font-medium">{selectedUser.numcontrol || selectedUser.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de registro</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Correo electrónico</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                  </div>

                  {selectedUser.career && (
                    <div>
                      <p className="text-sm text-muted-foreground">Carrera</p>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{selectedUser.career}</p>
                      </div>
                    </div>
                  )}

                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h4 className="font-medium mb-3">Actividad del usuario</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Préstamos totales</p>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <p className="font-medium">{selectedUser.stats.totalLoans}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Préstamos activos</p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-emerald-500" />
                          <p className="font-medium">{selectedUser.stats.activeLoans}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Préstamos atrasados</p>
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <p className="font-medium">{selectedUser.stats.overdueLoans}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Última actividad</p>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{formatDate(selectedUser.stats.lastActivity)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente
                    la cuenta de usuario y todos los datos asociados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <div className="font-medium">{selectedUser.fullName}</div>
                  <div className="text-muted-foreground">{selectedUser.email}</div>
                  <div className="text-muted-foreground">ID: {selectedUser.numcontrol || selectedUser.id}</div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDeleteUser}
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Modal de edición de usuario */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Pencil className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl">Editar Usuario</DialogTitle>
                      <DialogDescription>
                        Actualice la información del usuario seleccionado
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(onEditUser)} className="space-y-6 py-4">
                    {/* Sección: Información Personal */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <User className="h-4 w-4" />
                        <h3 className="font-medium text-sm">Información Personal</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nombre de usuario */}
                        <FormField
                          control={editForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm flex items-center gap-1">
                                Nombre completo <span className="text-rose-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre completo" {...field} className="h-9" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Número de control */}
                        <FormField
                          control={editForm.control}
                          name="Numcontrol"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Número de control</FormLabel>
                              <FormControl>
                                <Input placeholder="Matrícula o ID" {...field} className="h-9" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Correo electrónico */}
                        <FormField
                          control={editForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                Correo electrónico <span className="text-rose-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="correo@ejemplo.com" {...field} className="h-9" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Contraseña (opcional) */}
                        <FormField
                          control={editForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                Nueva contraseña (opcional)
                              </FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Dejar vacío para mantener la contraseña actual" {...field} className="h-9" />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Dejar vacío para mantener la contraseña actual
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      {/* Sección: Rol y Estado */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                          <GraduationCap className="h-4 w-4" />
                          <h3 className="font-medium text-sm">Rol y Estado</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Rol */}
                          <FormField
                            control={editForm.control}
                            name="rol"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm flex items-center gap-1">
                                  Rol <span className="text-rose-500">*</span>
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="Seleccionar rol" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Alumno">
                                      <div className="flex items-center gap-2">
                                        <School className="h-3.5 w-3.5 text-emerald-500" />
                                        <span>Alumno</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="Interno">
                                      <div className="flex items-center gap-2">
                                        <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                                        <span>Interno</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="Administrador">
                                      <div className="flex items-center gap-2">
                                        <User className="h-3.5 w-3.5 text-rose-500" />
                                        <span>Administrador</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription className="text-xs">
                                  Determina los permisos en el sistema
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Estado */}
                          <FormField
                            control={editForm.control}
                            name="Estado"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Estado</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Activo">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                        <span>Activo</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="Inactivo">
                                      <div className="flex items-center gap-2">
                                        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                        <span>Inactivo</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="Baja">
                                      <div className="flex items-center gap-2">
                                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                        <span>Baja</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription className="text-xs">
                                  Usuarios activos pueden acceder al sistema
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      {/* Sección: Información Adicional */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                          <MapPin className="h-4 w-4" />
                          <h3 className="font-medium text-sm">Información Adicional</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Campus */}
                          <FormField
                            control={editForm.control}
                            name="campus"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Campus</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="Seleccionar campus" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Tomas Aquino">
                                      <div className="flex items-center gap-2">
                                        <Building className="h-3.5 w-3.5 text-teal-500" />
                                        <span>Tomas Aquino</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="Otay">
                                      <div className="flex items-center gap-2">
                                        <Building className="h-3.5 w-3.5 text-purple-500" />
                                        <span>Otay</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Género */}
                          <FormField
                            control={editForm.control}
                            name="Genero"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Género</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="Seleccionar género" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Hombre">Hombre</SelectItem>
                                    <SelectItem value="Mujer">Mujer</SelectItem>
                                    <SelectItem value="Otro">Otro</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Carrera */}
                          <FormField
                            control={editForm.control}
                            name="Carrera"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Carrera</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="Seleccionar carrera" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Sistemas">Sistemas</SelectItem>
                                    <SelectItem value="Arquitectura">Arquitectura</SelectItem>
                                    <SelectItem value="Aeronautica">Aeronautica</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="pt-2 border-t flex items-center justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setShowEditDialog(false);
                          setSelectedUser(null);
                        }}
                        disabled={isEditingUser}
                        className="gap-2"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isEditingUser} className="gap-2 bg-blue-600 hover:bg-blue-700">
                        {isEditingUser ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Guardando cambios...
                          </>
                        ) : (
                          <>
                            <Pencil className="h-4 w-4" />
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}