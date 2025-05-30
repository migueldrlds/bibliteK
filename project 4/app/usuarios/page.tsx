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
  AtSign,
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
interface UIUser {
  id: number;
  fullName: string;
  apellido?: string;
  campus?: any; // { id: number; Nombre: string }
  career?: string;
  careerId?: string;
  gender?: string;
  status: string;
  Estado?: string;
  Genero?: string;
  numcontrol?: string;
  email: string;
  rol: string;
  createdAt: string;
  stats: {
    totalLoans: number;
    activeLoans: number;
    overdueLoans: number;
    lastActivity: string;
  };
  carrera?: any; // <-- Agregado para evitar error de linter
}

// Definir el esquema de validación para el formulario de creación de usuario
const createUserSchema = z.object({
  username: z.string().min(1, { message: "El nombre de usuario es obligatorio" }),
  apellido: z.string().min(1, { message: "El apellido es obligatorio" }),
  email: z.string().email({ message: "Correo electrónico inválido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  Numcontrol: z.string().min(1, { message: "La matrícula es obligatoria" }),
  Genero: z.string().optional(),
  rol: z.string().min(1, { message: "El rol es obligatorio" }),
  Carrera: z.string().min(1, { message: "La carrera es obligatoria" }),
  campus: z.string().optional(),
});

// Schema para editar usuario (sin contraseña obligatoria)
const editUserSchema = z.object({
  username: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  apellido: z.string().optional(),
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
  const { permissions, isAuthenticated, loading: permissionsLoading, user } = useUser();
  const router = useRouter();
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [careers, setCareers] = useState<any[]>([]);
  const [selectedEditCareerId, setSelectedEditCareerId] = useState<string>("");
  const [showPermanentDeleteDialog, setShowPermanentDeleteDialog] = useState(false);
  const [emailUserPart, setEmailUserPart] = useState("");
  const emailDomain = "@tectijuana.edu.mx";

  // Configurar el formulario de creación de usuario con React Hook Form
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      apellido: "",
      email: "",
      password: "",
      Numcontrol: "",
      campus: undefined,
      Genero: undefined,
      Carrera: undefined,
    },
  });

  // Configurar el formulario de edición de usuario
  const editForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: "",
      apellido: "",
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
    if (selectedUser && showEditDialog && careers.length > 0) {
      // Obtener el ID de la carrera como string
      let careerId = (selectedUser.carrera?.id ?? selectedUser.careerId ?? "").toString();
      // Fallback: si el ID no existe en el array de carreras, buscar por nombre
      if (!careers.some(c => c.id.toString() === careerId)) {
        const found = careers.find(c => c.Nombre === selectedUser.carrera?.Nombre || c.Nombre === selectedUser.career);
        if (found) {
          careerId = found.id.toString();
        }
      }
      setSelectedEditCareerId(careerId);
      // NOTA: Es importante que los datos de los usuarios estén sincronizados con los IDs reales de las carreras

      // Estado
      let userStatus = "Activo";
      if (selectedUser.Estado) {
        userStatus = selectedUser.Estado;
      } else if (selectedUser.status) {
        userStatus = selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1);
      }

      editForm.reset({
        username: selectedUser.fullName || "",
        apellido: selectedUser.apellido || "",
        email: selectedUser.email || "",
        password: "",
        rol: selectedUser.rol || "Alumno",
        Estado: userStatus,
        Numcontrol: selectedUser.numcontrol?.toString() || "",
        Genero: selectedUser.Genero || "",
        campus: selectedUser.campus?.id?.toString() || "",
        Carrera: careerId,
      });
    }
  }, [selectedUser, showEditDialog, editForm, careers]);

  // Cuando cambia la carrera seleccionada en el modal de edición, actualizar el campus automáticamente
  useEffect(() => {
    if (selectedEditCareerId && careers.length > 0) {
      // Buscar la carrera por ID (ambos como string)
      const selectedCareer = careers.find(
        c => c.id.toString() === selectedEditCareerId.toString()
      );
      const campusId =
        selectedCareer?.campus?.id?.toString() ||
        selectedCareer?.attributes?.campus?.data?.id?.toString() ||
        "";

      // Actualizar el valor de campus en el formulario
      editForm.setValue("campus", campusId);
    }
  }, [selectedEditCareerId, careers, editForm]);

  // Cuando cambia la carrera seleccionada en el modal de creación, actualizar el campus automáticamente
  useEffect(() => {
    const selectedCareerId = form.getValues("Carrera");
    if (selectedCareerId && careers.length > 0) {
      const selectedCareer = careers.find(
        c => c.id.toString() === selectedCareerId.toString()
      );
      const campusId =
        selectedCareer?.campus?.id?.toString() ||
        selectedCareer?.attributes?.campus?.data?.id?.toString() ||
        "";
      // Actualizar el valor de campus en el formulario de creación
      form.setValue("campus", campusId);
    }
  }, [form.watch("Carrera"), careers, form]);

  // Función para crear un nuevo usuario
  const onCreateUser = async (data: CreateUserFormValues) => {
    try {
      setIsCreatingUser(true);
      console.log("Datos del formulario:", data);

      // Validar que se haya seleccionado una carrera
      if (!data.Carrera) {
        toast({
          title: "Error",
          description: "Debe seleccionar una carrera",
          variant: "destructive",
        });
        return;
      }

      // Mapeo de rol a ID de la colección de roles de Strapi
      const roleMap = {
        Alumno: "7",
        Administrador: "5",
        Interno: "6",
        Bibliotecario: "8"
      };

      // Adaptar los datos al formato esperado por la API
      const userData = {
        username: data.username,
        apellido: data.apellido,
        email: data.email,
        password: data.password,
        Numcontrol: data.Numcontrol,
        Genero: data.Genero,
        Estado: "Activo",
        rol: data.rol,
        role: roleMap[data.rol as keyof typeof roleMap],
        confirmed: true,
        carrera: Number(data.Carrera),
        campus: data.campus ? Number(data.campus) : undefined,
      };

      console.log("Datos a enviar:", userData);

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
          apellido: user.apellido || '',
          campus: user.campus || undefined,
          carrera: user.carrera || undefined,
          careerId: typeof user.carrera === 'object' && user.carrera !== null
            ? user.carrera.id?.toString() || ''
            : user.carrera?.toString() || '',
          status,
          Estado: user.Estado,
          numcontrol: user.Numcontrol || user.numcontrol || '',
          career: typeof user.carrera === 'object' && user.carrera !== null
            ? user.carrera.Nombre || ''
            : '',
          gender: user.Genero?.toLowerCase() || (Math.random() > 0.5 ? "masculino" : "femenino"),
          Genero: user.Genero || '',
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
    // Solo redirigir si los permisos ya se han cargado y el usuario está autenticado
    if (!permissionsLoading && isAuthenticated && permissions) {
      if (!permissions.canAccessUsuarios) {
        console.log("Usuario no tiene permiso para acceder a usuarios, redirigiendo a catálogo");
        router.push('/catalogo');
      }
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
            id: user.id,
            fullName: user.username || 'Sin nombre',
            apellido: user.apellido || '',
            campus: user.campus || undefined,
            carrera: user.carrera || undefined,
            careerId: typeof user.carrera === 'object' && user.carrera !== null
              ? user.carrera.id?.toString() || ''
              : user.carrera?.toString() || '',
            status,
            Estado: user.Estado,
            numcontrol: user.Numcontrol || user.numcontrol || '',
            email: user.email || '',
            rol: user.rol || '',
            createdAt: user.createdAt || '',
            career: typeof user.carrera === 'object' && user.carrera !== null
              ? user.carrera.Nombre || ''
              : '',
            gender: user.Genero?.toLowerCase() || (Math.random() > 0.5 ? "masculino" : "femenino"),
            Genero: user.Genero || '',
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

  useEffect(() => {
    async function fetchData() {
      try {
        const campusRes = await fetch('http://localhost:1337/api/campuses');
        const campusData = await campusRes.json();
        setCampuses(campusData.data || campusData); // Soporta ambos formatos

        // Usar populate=campus para que cada carrera tenga el campus anidado
        const careerRes = await fetch('http://localhost:1337/api/carreras?populate=campus');
        const careerData = await careerRes.json();
        setCareers(careerData.data || careerData);
      } catch (err) {
        console.error("Error al cargar campus o carreras:", err);
      }
    }
    fetchData();
  }, []);

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

  // No redirigir si aún se están cargando los permisos
  if (permissionsLoading) {
    return null;
  }

  // Solo redirigir si los permisos están cargados y el usuario no tiene acceso
  if (!permissionsLoading && isAuthenticated && permissions && !permissions.canAccessUsuarios) {
    return null; // El useEffect ya maneja la redirección
  }

  // Filtrar usuarios basados en término de búsqueda y filtros
  const filteredUsers = users.filter(user => {
    // Normalizar el término de búsqueda para hacerlo insensible a acentos
    const normalizedSearchTerm = normalizeString(searchTerm);
    
    // Crear el nombre completo para la búsqueda
    const fullNameComplete = `${user.fullName} ${user.apellido || ''}`.trim();
    
    const matchesSearch = 
      normalizeString(fullNameComplete).includes(normalizedSearchTerm) ||
      (user.numcontrol && normalizeString(user.numcontrol.toString()).includes(normalizedSearchTerm)) ||
      normalizeString(user.email).includes(normalizedSearchTerm) ||
      normalizeString(user.career || '').includes(normalizedSearchTerm) ||
      normalizeString(user.campus?.Nombre || '').includes(normalizedSearchTerm) ||
      normalizeString(user.Genero || '').includes(normalizedSearchTerm) ||
      normalizeString(user.rol || '').includes(normalizedSearchTerm);

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
      alumno: "bg-blue-500 hover:bg-blue-600",
      administrador: "bg-rose-500 hover:bg-rose-600",
      interno: "bg-emerald-500 hover:bg-emerald-600",
      bibliotecario: "bg-yellow-500 hover:bg-yellow-600",
      authenticated: "bg-gray-500 hover:bg-gray-600",
    };

    const labels: Record<string, string> = {
      alumno: "Alumno",
      administrador: "Administrador",
      interno: "Interno",
      bibliotecario: "Bibliotecario",
      authenticated: "Usuario",
    };

    // Buscar la coincidencia en minúsculas
    const roleKey = roleToLower in styles ? roleToLower : "authenticated";

    // Para debugging
    console.log("Role original:", role, "Role procesado:", roleToLower, "Key usada:", roleKey);

    return (
      <Badge className={styles[roleKey] + " rounded-md"}>
        {labels[roleKey]}
      </Badge>
    );
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return (
      <Badge variant="outline" className="text-gray-600 border-gray-600 rounded-md">
        Desconocido
      </Badge>
    );
    
    switch (status.toLowerCase()) {
      case "activo":
      return (
        <Badge variant="outline" className="text-green-600 border-green-600 rounded-md">
          Activo
        </Badge>
      );
      case "pendiente":
      return (
        <Badge variant="outline" className="text-orange-600 border-orange-600 rounded-md">
          Pendiente
        </Badge>
      );
      case "inactivo":
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-600 rounded-md">
          Inactivo
        </Badge>
      );
      case "baja":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600 rounded-md">
            Baja
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-600 rounded-md">
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
          </Badge>
        );
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Si el usuario está dado de baja, lo reactivamos
      if (selectedUser.status === "baja") {
        await userService.updateUser(selectedUser.id, {
          Estado: "Activo",
          blocked: false
        });
        
        toast({
          title: "Usuario reactivado",
          description: `El usuario ${selectedUser.fullName} ha sido reactivado correctamente`,
        });
      } else {
        // Si el usuario está activo, lo damos de baja
        await userService.updateUser(selectedUser.id, {
          Estado: "Baja",
          blocked: true
        });
        
        toast({
          title: "Usuario dado de baja",
          description: `El usuario ${selectedUser.fullName} ha sido dado de baja correctamente`,
        });
      }
      
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
          apellido: user.apellido || '',
          campus: user.campus || undefined,
          carrera: user.carrera || undefined,
          careerId: typeof user.carrera === 'object' && user.carrera !== null
            ? user.carrera.id?.toString() || ''
            : user.carrera?.toString() || '',
          status,
          Estado: user.Estado,
          numcontrol: user.Numcontrol || user.numcontrol || '',
          email: user.email || '',
          rol: user.rol || '',
          createdAt: user.createdAt || '',
          career: typeof user.carrera === 'object' && user.carrera !== null
            ? user.carrera.Nombre || ''
            : '',
          gender: user.Genero?.toLowerCase() || (Math.random() > 0.5 ? "masculino" : "femenino"),
          Genero: user.Genero || '',
          stats: {
            totalLoans: Math.floor(Math.random() * 15),
            activeLoans: Math.floor(Math.random() * 3),
            overdueLoans: Math.floor(Math.random() * 2),
            lastActivity: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          }
        };
      });
      
      setUsers(transformedUsers);
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error al cambiar el estado del usuario:", error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del usuario",
        variant: "destructive",
      });
    }
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

      // Mapeo de rol a ID de la colección de roles de Strapi
      const roleMap = {
        Alumno: "7",
        Administrador: "5",
        Interno: "6",
        Bibliotecario: "8"
      };

      // Adaptar los datos al formato esperado por la API
      const userData = {
        ...data,
        id: selectedUser.id,
        username: data.username,
        apellido: data.apellido,
        rol: data.rol,
        role: roleMap[data.rol as keyof typeof roleMap],
        blocked: data.Estado === "Baja",
        carrera: data.Carrera ? Number(data.Carrera) : null,
        campus: data.campus ? Number(data.campus) : null,
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
        description: `Se ha actualizado el usuario ${data.username} ${data.apellido || ''} correctamente`,
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
          apellido: user.apellido || '',
          campus: user.campus || undefined,
          carrera: user.carrera || undefined,
          careerId: typeof user.carrera === 'object' && user.carrera !== null
            ? user.carrera.id?.toString() || ''
            : user.carrera?.toString() || '',
          status,
          Estado: user.Estado,
          numcontrol: user.Numcontrol || user.numcontrol || '',
          email: user.email || '',
          rol: user.rol || '',
          createdAt: user.createdAt || '',
          career: typeof user.carrera === 'object' && user.carrera !== null
            ? user.carrera.Nombre || ''
            : '',
          gender: user.Genero?.toLowerCase() || (Math.random() > 0.5 ? "masculino" : "femenino"),
          Genero: user.Genero || '',
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

  // Justo antes del renderizado del select de carrera
  console.log("careers:", careers);
  console.log("Valor Carrera en form:", editForm.getValues("Carrera"));

  // Función para eliminar usuario permanentemente
  const handlePermanentDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await userService.deleteUser(selectedUser.id);
      toast({
        title: "Usuario eliminado",
        description: `El usuario ${selectedUser.fullName} ha sido eliminado permanentemente`,
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
          apellido: user.apellido || '',
          campus: user.campus || undefined,
          carrera: user.carrera || undefined,
          careerId: typeof user.carrera === 'object' && user.carrera !== null
            ? user.carrera.id?.toString() || ''
            : user.carrera?.toString() || '',
          status,
          Estado: user.Estado,
          numcontrol: user.Numcontrol || user.numcontrol || '',
          email: user.email || '',
          rol: user.rol || '',
          createdAt: user.createdAt || '',
          career: typeof user.carrera === 'object' && user.carrera !== null
            ? user.carrera.Nombre || ''
            : '',
          gender: user.Genero?.toLowerCase() || (Math.random() > 0.5 ? "masculino" : "femenino"),
          Genero: user.Genero || '',
          stats: {
            totalLoans: Math.floor(Math.random() * 15),
            activeLoans: Math.floor(Math.random() * 3),
            overdueLoans: Math.floor(Math.random() * 2),
            lastActivity: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          }
        };
      });
      setUsers(transformedUsers);
      setShowPermanentDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      });
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

        {/* Agrupar filtros y barra de búsqueda en la misma fila */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
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
              <TabsTrigger value="Bibliotecario" className="rounded-md px-3 py-1 text-sm font-medium">
                Bibliotecarios
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-auto md:w-[350px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, ID o correo..."
              className="pl-9 w-full min-w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre completo</TableHead>
                <TableHead>Género</TableHead>
                <TableHead>Número de control</TableHead>
                <TableHead>Correo electrónico</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Campus</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de registro</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((rowUser) => (
                <TableRow key={rowUser.id}>
                  <TableCell className="font-medium">{rowUser.id}</TableCell>
                  <TableCell>{rowUser.fullName} {rowUser.apellido || ''}</TableCell>
                  <TableCell>{rowUser.Genero || '-'}</TableCell>
                  <TableCell>{rowUser.numcontrol || '-'}</TableCell>
                  <TableCell>{rowUser.email}</TableCell>
                  <TableCell>{rowUser.career || "-"}</TableCell>
                  <TableCell>{rowUser.campus?.Nombre || '-'}</TableCell>
                  <TableCell>{getRoleBadge(rowUser.rol)}</TableCell>
                  <TableCell>{getStatusBadge(rowUser.status)}</TableCell>
                  <TableCell>{formatDate(rowUser.createdAt)}</TableCell>
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
                            setSelectedUser(rowUser);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(rowUser);
                            setShowEditDialog(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {rowUser.status === "baja" ? (
                          <DropdownMenuItem
                            className="text-emerald-600 focus:text-emerald-600"
                            onClick={() => {
                              setSelectedUser(rowUser);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reactivar
                          </DropdownMenuItem>
                        ) : (
                          <>
                            {(user?.role?.toLowerCase() === "administrador" || user?.role?.toLowerCase() === "bibliotecario") && (
                              <DropdownMenuItem 
                                className="text-amber-600 focus:text-amber-600"
                                onSelect={(e) => e.preventDefault()}
                                onClick={() => {
                                  setSelectedUser(rowUser);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Dar de baja
                              </DropdownMenuItem>
                            )}
                            {user?.role?.toLowerCase() === "administrador" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600"
                                  onSelect={(e) => e.preventDefault()}
                                  onClick={() => {
                                    setSelectedUser(rowUser);
                                    setShowPermanentDeleteDialog(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar permanentemente
                                </DropdownMenuItem>
                              </>
                            )}
                          </>
                        )}
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
            <DialogHeader className="pb-4 border-b">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Crear Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Complete la información para registrar un nuevo usuario
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateUser)} className="space-y-6 py-4">
                {/* Sección: Información Personal */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <User className="h-4 w-4" />
                    <h3 className="font-medium text-sm">Información Personal</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm flex items-center gap-1">
                            Nombre <span className="text-rose-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre(s)" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Apellido */}
                    <FormField
                      control={form.control}
                      name="apellido"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm flex items-center gap-1">
                            Apellido <span className="text-rose-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Apellido(s)" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Matrícula */}
                    <FormField
                      control={form.control}
                      name="Numcontrol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm flex items-center gap-1">
                            <Fingerprint className="h-3.5 w-3.5 text-muted-foreground" />
                            Matrícula <span className="text-rose-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Número de control" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            Correo electrónico <span className="text-rose-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                              <AtSign className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                              <Input
                                placeholder="tu.usuario"
                                className="flex-grow p-0 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-auto"
                                value={emailUserPart}
                                onChange={(e) => {
                                  const rawValue = e.target.value;
                                  let userTypedPart = rawValue;
                                  let fullEmailForValidation = "";
                                  if (rawValue.endsWith(emailDomain)) {
                                    userTypedPart = rawValue.substring(0, rawValue.length - emailDomain.length);
                                    fullEmailForValidation = rawValue;
                                  } else {
                                    userTypedPart = rawValue;
                                    fullEmailForValidation = `${rawValue}${emailDomain}`;
                                  }
                                  setEmailUserPart(userTypedPart);
                                  field.onChange(fullEmailForValidation);
                                }}
                              />
                              <span className="text-muted-foreground whitespace-nowrap pl-1 flex-shrink-0">
                                {emailDomain}
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contraseña */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm flex items-center gap-1">
                            <Key className="h-3.5 w-3.5 text-muted-foreground" />
                            Contraseña <span className="text-rose-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Mínimo 6 caracteres" {...field} className="h-9" />
                          </FormControl>
                          <FormDescription className="text-xs">
                            La contraseña debe tener al menos 6 caracteres
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* Sección: Rol y Género */}
                <div className="border-t pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <GraduationCap className="h-4 w-4" />
                      <h3 className="font-medium text-sm">Rol y Género</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Rol */}
                      <FormField
                        control={form.control}
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
                                    <span>Interno (Maestros/Administrativos)</span>
                                  </div>
                                </SelectItem>
                                {user?.role?.toLowerCase() === 'administrador' && (
                                  <SelectItem value="Administrador">
                                    <div className="flex items-center gap-2">
                                      <User className="h-3.5 w-3.5 text-rose-500" />
                                      <span>Administrador</span>
                                    </div>
                                  </SelectItem>
                                )}
                                <SelectItem value="Bibliotecario">
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="h-3.5 w-3.5 text-yellow-500" />
                                    <span>Bibliotecario</span>
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
                      {/* Género */}
                      <FormField
                        control={form.control}
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
                    </div>
                  </div>
                </div>
                {/* Sección: Información Adicional */}
                <div className="border-t pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      <h3 className="font-medium text-sm">Información Adicional</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Carrera */}
                      <FormField
                        control={form.control}
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
                                {careers.map((career) => (
                                  <SelectItem key={career.id} value={career.id.toString()}>
                                    {career.attributes?.Nombre || career.Nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Campus */}
                      <FormField
                        control={form.control}
                        name="campus"
                        render={({ field }) => {
                          // Buscar el campus de la carrera seleccionada en el formulario de creación
                          const selectedCareerId = form.getValues("Carrera");
                          const selectedCareer = careers.find(
                            c => c.id.toString() === selectedCareerId?.toString()
                          );
                          const campusName =
                            selectedCareer?.campus?.Nombre ||
                            selectedCareer?.attributes?.campus?.data?.attributes?.Nombre ||
                            "Sin unidad";
                          return (
                            <FormItem>
                              <FormLabel className="text-sm">Campus</FormLabel>
                              <FormControl>
                                <Input
                                  value={campusName}
                                  disabled
                                  readOnly
                                  className="h-9"
                                  placeholder="El campus se asigna automáticamente"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                  </div>
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
                    className="gap-2"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isCreatingUser} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    {isCreatingUser ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
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
                    <h3 className="text-xl font-semibold">{selectedUser.fullName} {selectedUser.apellido || ''}</h3>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Correo electrónico</p>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Género</p>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{selectedUser.Genero || 'No especificado'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Carrera</p>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{selectedUser.career || 'No especificada'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Campus</p>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{selectedUser.campus?.Nombre || 'No especificado'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Actividad del usuario
                    </h4>
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
                  <AlertDialogTitle>
                    {selectedUser?.status === "baja" ? "¿Reactivar usuario?" : "¿Dar de baja al usuario?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {selectedUser?.status === "baja" 
                      ? "Esta acción cambiará el estado del usuario a 'Activo'. El usuario podrá acceder al sistema nuevamente."
                      : "Esta acción cambiará el estado del usuario a 'Baja'. El usuario no podrá acceder al sistema pero sus datos se mantendrán en el sistema por motivos de registro."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <div className="font-medium">{selectedUser?.fullName}</div>
                  <div className="text-muted-foreground">{selectedUser?.email}</div>
                  <div className="text-muted-foreground">ID: {selectedUser?.numcontrol || selectedUser?.id}</div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className={selectedUser?.status === "baja" 
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-amber-600 text-white hover:bg-amber-700"}
                    onClick={handleDeleteUser}
                  >
                    {selectedUser?.status === "baja" ? "Reactivar" : "Dar de baja"}
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
                        {/* Nombre */}
                        <FormField
                          control={editForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm flex items-center gap-1">
                                Nombre <span className="text-rose-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Nombre" {...field} className="h-9" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Apellido */}
                        <FormField
                          control={editForm.control}
                          name="apellido"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">Apellido</FormLabel>
                              <FormControl>
                                <Input placeholder="Apellido" {...field} className="h-9" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <div className="flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                  <AtSign className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                                  <Input
                                    placeholder="tu.usuario"
                                    className="flex-grow p-0 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-auto"
                                    value={emailUserPart}
                                    onChange={(e) => {
                                      const rawValue = e.target.value;
                                      let userTypedPart = rawValue;
                                      let fullEmailForValidation = "";
                                      if (rawValue.endsWith(emailDomain)) {
                                        userTypedPart = rawValue.substring(0, rawValue.length - emailDomain.length);
                                        fullEmailForValidation = rawValue;
                                      } else {
                                        userTypedPart = rawValue;
                                        fullEmailForValidation = `${rawValue}${emailDomain}`;
                                      }
                                      setEmailUserPart(userTypedPart);
                                      field.onChange(fullEmailForValidation);
                                    }}
                                  />
                                  <span className="text-muted-foreground whitespace-nowrap pl-1 flex-shrink-0">
                                    {emailDomain}
                                  </span>
                                </div>
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
                                        <span>Interno (Maestros/Administrativos)</span>
                                      </div>
                                    </SelectItem>
                                    {user?.role?.toLowerCase() === 'administrador' && (
                                      <SelectItem value="Administrador">
                                        <div className="flex items-center gap-2">
                                          <User className="h-3.5 w-3.5 text-rose-500" />
                                          <span>Administrador</span>
                                        </div>
                                      </SelectItem>
                                    )}
                                    <SelectItem value="Bibliotecario">
                                      <div className="flex items-center gap-2">
                                        <BookOpen className="h-3.5 w-3.5 text-yellow-500" />
                                        <span>Bibliotecario</span>
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Carrera */}
                          <FormField
                            control={editForm.control}
                            name="Carrera"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Carrera</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    setSelectedEditCareerId(value);
                                    field.onChange(value);
                                  }}
                                  value={field.value || "34"}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="Seleccionar carrera" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {careers.map((career) => (
                                      <SelectItem key={career.id} value={career.id.toString()}>
                                        {career.attributes?.Nombre || career.Nombre}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Campus (readonly, se actualiza automáticamente) */}
                          <FormField
                            control={editForm.control}
                            name="campus"
                            render={({ field }) => {
                              // Buscar el campus de la carrera seleccionada
                              const selectedCareer = careers.find(
                                c => c.id.toString() === selectedEditCareerId.toString()
                              );
                              const campusName =
                                selectedCareer?.campus?.Nombre ||
                                selectedCareer?.attributes?.campus?.data?.attributes?.Nombre ||
                                "Sin unidad";
                              return (
                                <FormItem>
                                  <FormLabel className="text-sm">Campus</FormLabel>
                                  <FormControl>
                                    <Input
                                      value={campusName}
                                      disabled
                                      readOnly
                                      className="h-9"
                                      placeholder="El campus se asigna automáticamente"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
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

            {/* Diálogo de confirmación para eliminación permanente */}
            <AlertDialog open={showPermanentDeleteDialog} onOpenChange={setShowPermanentDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Eliminación permanente de usuario
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará al usuario de forma definitiva de la base de datos. Esta operación no se puede deshacer y todos los datos asociados al usuario se perderán permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <div className="font-medium text-lg">{selectedUser?.fullName}</div>
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {selectedUser?.email}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Fingerprint className="h-4 w-4" />
                    ID: {selectedUser?.numcontrol || selectedUser?.id}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    {selectedUser?.career || 'Sin carrera asignada'}
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={handlePermanentDeleteUser}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar permanentemente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}