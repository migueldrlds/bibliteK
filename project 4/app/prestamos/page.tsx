"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/layout";
import { loanService, Loan, LoanData } from "@/services/loanService";
import { bookService, Book } from '@/services/bookService';
import { userService } from '@/services/userService';
import { Holiday, holidayService } from '@/services/holidayService';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  RefreshCw,
  BookCheck,
  Undo,
  Clock,
  BookOpen,
  User,
  Calendar as CalendarIcon,
  CalendarClock,
  CalendarX,
  CheckCircle2,
  Timer,
  CircleCheck,
  CircleDashed,
  AlertTriangle,
  CircleX,
  RotateCw,
  Building,
  MapPin,
  Map,
  Loader2,
  PlusCircle,
  Calculator,
  Plus,
  GraduationCap,
  School,
  ChevronLeft,
  ChevronRight,
  BadgeX,
  Info,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { format, addDays, isAfter, isBefore, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar"; 
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/user-context";
import { DayClickEventHandler, DayContent, DayContentProps } from "react-day-picker";

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    activo: "bg-emerald-500 hover:bg-emerald-600 text-xs px-2 py-0.5",
    renovado: "bg-blue-500 hover:bg-blue-600 text-xs px-2 py-0.5",
    atrasado: "bg-amber-600 hover:bg-amber-700 text-xs px-2 py-0.5 font-medium",
    devuelto: "bg-slate-500 hover:bg-slate-600 text-xs px-2 py-0.5",
    perdido: "bg-rose-500 hover:bg-rose-600 text-xs px-2 py-0.5",
  };

  const icons: Record<string, JSX.Element> = {
    activo: <CircleDashed className="h-3 w-3 mr-1" />,
    renovado: <RotateCw className="h-3 w-3 mr-1" />,
    atrasado: <AlertTriangle className="h-3 w-3 mr-1" />,
    devuelto: <CircleCheck className="h-3 w-3 mr-1" />,
    perdido: <CircleX className="h-3 w-3 mr-1" />,
  };

  const labels: Record<string, string> = {
    activo: "Activo",
    renovado: "Renovado",
    atrasado: "Atrasado",
    devuelto: "Devuelto",
    perdido: "Perdido",
  };

  return (
    <Badge className={styles[status]}>
      <div className="flex items-center">
        {icons[status]}
        {labels[status]}
      </div>
    </Badge>
  );
};

// Helper function to get return type badge
const getReturnTypeBadge = (returnType: string | null) => {
  if (!returnType) return null;

  const styles: Record<string, string> = {
    en_plazo: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-700 dark:border-green-400 text-[10px] px-1.5 py-0.5",
    renovado: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-700 dark:border-blue-400 text-[10px] px-1.5 py-0.5",
    atrasado: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-700 dark:border-amber-400 text-[10px] px-1.5 py-0.5",
  };

  const labels: Record<string, string> = {
    en_plazo: "En plazo",
    renovado: "Renovado",
    atrasado: "Atrasado",
  };

  return (
    <Badge variant="outline" className={styles[returnType]}>
      {labels[returnType]}
    </Badge>
  );
};

// Función para obtener el badge de campus
const getCampusBadge = (campus: string | undefined) => {
  if (!campus) return <span className="text-muted-foreground text-xs">Sin campus</span>;
  
  let bgColor = "";
  
  // Asignar color según el campus
  switch (campus.toLowerCase()) {
    case "otay":
      bgColor = "bg-purple-500 hover:bg-purple-600";
      break;
    case "tomas aquino":
      bgColor = "bg-teal-500 hover:bg-teal-600";
      break;
    default:
      bgColor = "bg-blue-500 hover:bg-blue-600";
  }
  
  return (
    <Badge className={`${bgColor} text-xs px-2 py-0.5`}>
      <div className="flex items-center">
        <MapPin className="h-3 w-3 mr-1" />
        {campus}
      </div>
    </Badge>
  );
};

// Interfaz para adaptar los datos de la API al formato esperado por la interfaz
interface UILoan {
  id: string | number;
  documentId?: string;
  formattedId?: string;
  book: string;
  bookId: string | number;
  user: string;
  userId?: string;
  userNumControl?: string;
  userCarrera?: string;
  loanDate: string;
  returnDate: string;
  status: string;
  renewalCount: number;
  actualReturnDate: string | null;
  returnType: string | null;
  campus_origen?: string;
  multa?: number;
  dias_atraso?: number;
}

// Definir interfaz para el formato de fecha
interface FormattedDate {
  date: string;
  time?: string;
}

// Interfaces adicionales para manejar el inventario por campus
interface BookInventory {
  campus: string;
  cantidad: number;
}

interface BookWithInventory extends Book {
  inventario?: BookInventory[];
}

// Función para procesar inventarios de libros
const procesarInventarioDeLibros = (booksData: Book[]): BookWithInventory[] => {
  return booksData.map(book => {
    // Array para almacenar el inventario procesado
    const inventarioProcesado: BookInventory[] = [];
    
    // Objeto para agrupar por campus
    const inventarioPorCampus: Record<string, number> = {};
    
    // Procesar inventarios si existen como array
    if (book.inventories && Array.isArray(book.inventories)) {
      // Procesar cada registro de inventario
      book.inventories.forEach(inv => {
        if (inv && inv.Campus && inv.Cantidad !== undefined) {
          // Agrupar por campus sumando cantidades
          const campus = inv.Campus;
          inventarioPorCampus[campus] = (inventarioPorCampus[campus] || 0) + inv.Cantidad;
        }
      });
    }
    // Comprobar si hay un solo inventario en el formato antiguo
    else if (book.inventory && book.inventory.Campus && book.inventory.Cantidad !== undefined) {
      const campus = book.inventory.Campus;
      inventarioPorCampus[campus] = (inventarioPorCampus[campus] || 0) + book.inventory.Cantidad;
    }
    // Si no hay inventario pero hay un campus general, usar ese con cantidad 1 (caso por defecto)
    else if (book.campus) {
      inventarioPorCampus[book.campus] = 1; // valor por defecto
    }
    
    // Convertir el objeto agrupado a array
    Object.entries(inventarioPorCampus).forEach(([campus, cantidad]) => {
      inventarioProcesado.push({
        campus,
        cantidad
      });
    });
    
    console.log(`Libro ${book.titulo} - Inventario procesado:`, inventarioProcesado);
    
    // Devolver libro con el inventario procesado
    return {
      ...book,
      inventario: inventarioProcesado
    };
  });
};

// Agregar después de las interfaces existentes

interface FineDetails {
  amount: number;
  daysLate: number;
}

// Función auxiliar para calcular días laborables entre dos fechas (lunes a viernes, excluyendo sábados y domingos)
const calculateBusinessDays = (startDate: Date, endDate: Date): number => {
  // Asegurarnos que las fechas están como Date
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Si la fecha de fin es anterior a la de inicio, devolver 0
  if (end < start) return 0;
  
  // Establecer inicio del día para ambas fechas para comparar días completos
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  // Contador de días laborables
  let businessDays = 0;
  const currentDate = new Date(start);
  
  // Iterar por cada día entre las fechas
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    // 0 es domingo, 6 es sábado - solo contar días 1 a 5 (lunes a viernes)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
    // Avanzar al siguiente día
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return businessDays;
};

// Función para calcular multas
const calculateFine = (returnDate: string, actualReturnDate: string | null, holidayDays: number = 0): FineDetails => {
  const today = actualReturnDate ? new Date(actualReturnDate) : new Date();
    const dueDate = new Date(returnDate);
  
  // Si la fecha de vencimiento no ha pasado aún, no hay multa
  if (dueDate >= today) {
    return {
      daysLate: 0,
      amount: 0
    };
  }

  // Calcular solo días laborables usando el servicio
  try {
    const daysLate = loanService.calculateBusinessDays(dueDate, today);
    // Ajustar por días feriados
    const adjustedDaysLate = Math.max(0, daysLate - holidayDays);
    const amount = adjustedDaysLate > 0 ? adjustedDaysLate * 10 : 0; // $10 por día laborable de atraso, solo si hay días
    
    console.log(`Calculando multa: días de atraso=${daysLate}, días feriados=${holidayDays}, días ajustados=${adjustedDaysLate}, monto=${amount}`);
  return {
      daysLate: adjustedDaysLate,
    amount
  };
  } catch (error) {
    console.error("Error al calcular días laborables:", error);
    // Fallback simple en caso de error
    const diffTime = Math.abs(today.getTime() - dueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const adjustedDiffDays = Math.max(0, diffDays - holidayDays);
    return {
      daysLate: adjustedDiffDays,
      amount: adjustedDiffDays * 10
    };
  }
};

function PrestamosContent(): JSX.Element | null {
  // Todos los hooks primero (useState, useContext, useEffect, etc.)
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("todos");
  const [loans, setLoans] = useState<UILoan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<UILoan | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showReplacementDialog, setShowReplacementDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("recientes");
  const [loading, setLoading] = useState(true);
  const [isUpdatingFines, setIsUpdatingFines] = useState(false);
  const [displayCount, setDisplayCount] = useState(50); // Número de préstamos a mostrar
  const { permissions, isAuthenticated, loading: userLoading } = useUser();
  const router = useRouter();
  // Estado para días feriados
  const [holidayDaysByLoan, setHolidayDaysByLoan] = useState<Record<string | number, number>>({});
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isHolidayUpdating, setIsHolidayUpdating] = useState(false);
  
  // Nuevo estado para trackear días específicos en proceso de carga
  const [loadingDates, setLoadingDates] = useState<{[key: string]: boolean}>({});
  
  // Estados para el modal de creación de préstamos
  const [isCreateLoanModalOpen, setIsCreateLoanModalOpen] = useState(false);
  const [newLoanBookId, setNewLoanBookId] = useState("");
  const [newLoanUserId, setNewLoanUserId] = useState("");
  const [newLoanDate, setNewLoanDate] = useState<Date>(new Date());
  const [newLoanReturnDate, setNewLoanReturnDate] = useState<Date>(addDays(new Date(), 14)); // 14 días por defecto
  const [newLoanCampus, setNewLoanCampus] = useState<string>("");
  const [newLoanNotes, setNewLoanNotes] = useState("");
  const [newLoanBookSearchTerm, setNewLoanBookSearchTerm] = useState("");
  const [newLoanUserSearchTerm, setNewLoanUserSearchTerm] = useState("");
  const [filteredNewLoanBooks, setFilteredNewLoanBooks] = useState<BookWithInventory[]>([]);
  const [filteredNewLoanUsers, setFilteredNewLoanUsers] = useState<any[]>([]);
  const [selectedNewLoanBook, setSelectedNewLoanBook] = useState<BookWithInventory | null>(null);
  const [selectedNewLoanUser, setSelectedNewLoanUser] = useState<any | null>(null);
  const [isCreatingLoan, setIsCreatingLoan] = useState(false);
  const [allBooks, setAllBooks] = useState<BookWithInventory[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [availableCampus, setAvailableCampus] = useState<BookInventory[]>([]);
  
  // Nuevo estado para el modal de renovación
  const [showRenewalDialog, setShowRenewalDialog] = useState(false);
  const [renewalDate, setRenewalDate] = useState<Date | null>(null);
  
  // Estados para la búsqueda avanzada de libros en el modal de creación de préstamos (similar a catálogo)
  const [bookSearchPage, setBookSearchPage] = useState(1);
  const [totalBookResults, setTotalBookResults] = useState(0);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [searchBookError, setSearchBookError] = useState<string | null>(null);

  // Función para normalizar texto (eliminar acentos)
  const normalizeString = (text: string | null | undefined): string => {
    if (!text) return "";
    // Convertir a minúsculas y eliminar acentos
    return text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Elimina todos los diacríticos (acentos, tildes, etc.)
  };

  // Función para cargar días feriados desde el backend con menos impacto en la UI
  const loadHolidays = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoadingHolidays(true);
      }
      
      console.log("Cargando días feriados...");
      
      // Llamar a getHolidays sin parámetros
      const response = await holidayService.getHolidays();
      console.log("Respuesta de días feriados:", response);
      
      // Manejar diferentes formatos de respuesta
      if (Array.isArray(response)) {
        // Si la respuesta es directamente un array de feriados
        console.log("Formato de respuesta: array directo");
        setHolidays(response);
      } else if (response && typeof response === 'object') {
        // Si la respuesta es un objeto con una propiedad data
        if ('data' in response && Array.isArray((response as any).data)) {
          console.log("Formato de respuesta: objeto con data[]");
          setHolidays((response as any).data);
        } else {
          console.error("Respuesta con formato inesperado:", response);
          setHolidays([]);
        }
      } else {
        console.error("Formato de datos de holidays inesperado:", response);
        setHolidays([]);
      }
    } catch (error) {
      console.error('Error al cargar días feriados:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los días feriados",
        variant: "destructive",
      });
    } finally {
      if (showLoadingState) {
        setLoadingHolidays(false);
      }
    }
  };

  // Función para calcular automáticamente los días feriados aplicables a un préstamo
  const calcularDiasFeriados = (loan: UILoan): number => {
    if (!loan) return 0;
    
    try {
      const dueDate = new Date(loan.returnDate);
      const today = new Date();
      
      // Si la fecha de vencimiento es posterior a hoy, no hay multa
      if (dueDate >= today) return 0;
      
      // Calcular días feriados entre fecha de devolución y hoy
      let holidayCount = 0;
      
      for (const holiday of holidays) {
        const holidayDate = new Date(holiday.date);
        // Normalizar las fechas para comparación (solo fecha, sin hora)
        holidayDate.setHours(0, 0, 0, 0);
        
        // Verificar si el día feriado está entre la fecha de devolución y hoy
        // y si es un día laborable (lunes a viernes)
        const isBusinessDay = holidayDate.getDay() !== 0 && holidayDate.getDay() !== 6;
        
        if (isBusinessDay && 
            holidayDate > dueDate && 
            holidayDate <= today) {
          holidayCount++;
        }
      }
      
      return holidayCount;
    } catch (error) {
      console.error("Error al calcular días feriados:", error);
      return 0;
    }
  };

  // Función para buscar libros usando la misma estructura que el catálogo
  const searchBooks = async (page = 1, searchTerm = newLoanBookSearchTerm) => {
    try {
      setIsLoadingBooks(true);
      setSearchBookError(null);

      // Construir filtros para búsqueda (mismo formato que en catálogo)
      const filters: any = {
        'pagination[page]': page,
        'pagination[pageSize]': 8,
      };

      // Filtros de búsqueda
      if (searchTerm) {
        filters['filters[$or][0][titulo][$containsi]'] = searchTerm;
        filters['filters[$or][1][autor][$containsi]'] = searchTerm;
        filters['filters[$or][2][id_libro][$containsi]'] = searchTerm;
        filters['filters[$or][3][clasificacion][$containsi]'] = searchTerm;
      }

      const response = await bookService.getBooks(filters);
      
      if (response && response.data) {
        const booksWithInventory = procesarInventarioDeLibros(response.data);
      setFilteredNewLoanBooks(booksWithInventory);
        setTotalBookResults(response.meta?.pagination?.total || response.data.length);
        setBookSearchPage(page);
      }
    } catch (err) {
      console.error("Error al buscar libros:", err);
      setSearchBookError("No se pudieron cargar los libros. Por favor, intenta de nuevo.");
    } finally {
      setIsLoadingBooks(false);
    }
  };

  // TODOS LOS USEEFFECT JUNTOS

  // Reemplazar el efecto de filtrado existente con la llamada a la API
  useEffect(() => {
    // Cancelar búsqueda previa si cambia el término de búsqueda
    const timeoutId = setTimeout(() => {
      if (isCreateLoanModalOpen) {
        searchBooks(1);
      }
    }, 300); // Debounce de 300ms para evitar muchas llamadas

    return () => clearTimeout(timeoutId);
  }, [newLoanBookSearchTerm, isCreateLoanModalOpen]);

  // Verificar permisos al cargar la página
  useEffect(() => {
    if (isAuthenticated && permissions && !permissions.canAccessPrestamos) {
      router.push('/catalogo');
    }
  }, [permissions, isAuthenticated, router]);

  // Cargar días feriados al inicio
  useEffect(() => {
    if (isAuthenticated && permissions?.canAccessPrestamos) {
      loadHolidays();
    }
  }, [isAuthenticated, permissions]);

  // Cargar datos de préstamos y libros
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        // No realizar la carga de datos si no tiene permisos o si los permisos aún se están cargando
        if (userLoading || !permissions || !permissions.canAccessPrestamos) {
          return;
        }
        
        setLoading(true);
        
        // Comprobar y actualizar préstamos atrasados
        try {
          const updatedCount = await loanService.checkOverdueLoans();
          if (updatedCount > 0) {
            toast({
              title: "Préstamos actualizados",
              description: `Se actualizaron ${updatedCount} préstamos a estado 'atrasado'`,
            });
          }
        } catch (error) {
          console.error("Error al verificar préstamos atrasados:", error);
        }
        
        // Cargar todos los préstamos
        const response = await loanService.getLoans();
        
        // Transformar los datos de la API al formato esperado por la UI
        const transformedLoans: UILoan[] = response.map((loan: Loan) => {
          // Determinar tipo de devolución
          let returnType = null;
          if (loan.estado === 'devuelto' && loan.fecha_devolucion_real) {
            const dueDate = new Date(loan.fecha_devolucion_esperada);
            const actualReturn = new Date(loan.fecha_devolucion_real);
            
            if (actualReturn <= dueDate) {
              returnType = 'en_plazo';
            } else {
              returnType = 'atrasado';
            }
          } else if (loan.estado === 'renovado') {
            returnType = 'renovado';
          }
          
          return {
            id: loan.id,
            documentId: loan.documentId,
            formattedId: `LOAN-${new Date().getFullYear()}-${String(loan.id).padStart(3, '0')}`,
            book: loan.book.titulo,
            bookId: loan.book.id_libro,
            user: loan.usuario.username,
            userId: loan.usuario.id.toString(),
            userNumControl: loan.usuario.Numcontrol,
            userCarrera: loan.usuario.Carrera,
            loanDate: loan.fecha_prestamo,
            returnDate: loan.fecha_devolucion_esperada,
            status: loan.estado,
            renewalCount: loan.renewalCount || 0,
            actualReturnDate: loan.fecha_devolucion_real,
            returnType,
            campus_origen: loan.campus_origen,
            multa: loan.multa || 0,
            dias_atraso: loan.dias_atraso || 0
          };
        });
        
        setLoans(transformedLoans);

        // Cargar datos para el modal de creación de préstamos
        try {
          const booksData = await bookService.getBooks();
          
          // Procesar los libros con su inventario
          const booksWithInventory = procesarInventarioDeLibros(booksData.data);
          
          setAllBooks(booksWithInventory);
          setFilteredNewLoanBooks(booksWithInventory);
          
          const usersData = await userService.getUsers();
          setAllUsers(usersData);
          setFilteredNewLoanUsers(usersData);
        } catch (error) {
          console.error("Error al cargar libros y usuarios:", error);
        }
        
      } catch (error) {
        console.error("Error al cargar préstamos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los préstamos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoans();
  }, [toast, permissions, userLoading]);

  // Calcular días feriados para cada préstamo cuando se cargan los préstamos y los días feriados
  useEffect(() => {
    // Solo ejecutar si tenemos préstamos y días feriados cargados
    if (loans.length > 0 && holidays.length > 0) {
      console.log("Calculando días feriados para todos los préstamos...");
      
      // Objeto temporal para almacenar los días feriados por préstamo
      const holidayDays: Record<string | number, number> = {};
      
      // Calcular para cada préstamo
      loans.forEach(loan => {
        if (loan.status === "atrasado" || (loan.status === "devuelto" && loan.multa && loan.multa > 0)) {
          const feriados = calcularDiasFeriados(loan);
          holidayDays[loan.id] = feriados;
        }
      });
      
      // Actualizar el estado
      setHolidayDaysByLoan(holidayDays);
      
      console.log("Días feriados calculados:", holidayDays);
    }
  }, [loans, holidays]);

  // Filtrar usuarios basados en el término de búsqueda
  useEffect(() => {
    if (!newLoanUserSearchTerm.trim() || !allUsers.length) {
      setFilteredNewLoanUsers(allUsers);
      return;
    }
    
    const normalizedSearchTerm = normalizeString(newLoanUserSearchTerm);
    const filtered = allUsers.filter(user => 
      normalizeString(user.username).includes(normalizedSearchTerm) || 
      normalizeString(user.email).includes(normalizedSearchTerm) ||
      normalizeString(user.Numcontrol).includes(normalizedSearchTerm)
    );
    
    setFilteredNewLoanUsers(filtered);
  }, [newLoanUserSearchTerm, allUsers]);

  // DESPUÉS de todos los hooks y useEffects, verificar y retornar condicionalmente

  // Mostrar loading mientras se cargan los permisos o redirigir si no tiene permisos
  if (!permissions) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirigir si no tiene permisos
  if (!permissions.canAccessPrestamos) {
    return null; // El useEffect ya maneja la redirección
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Préstamos</h2>
            <p className="text-muted-foreground">
              Cargando préstamos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleNewLoanBookSelect = (book: BookWithInventory) => {
    setSelectedNewLoanBook(book);
    setNewLoanBookId(book.id.toString());
    
    // Actualizar los campus disponibles para este libro
    if (book.inventario && book.inventario.length > 0) {
      // Filtrar solo campus con disponibilidad mayor a 0
      const campusDisponibles = book.inventario.filter(inv => inv.cantidad > 0);
      
      console.log("Campus disponibles para este libro:", campusDisponibles);
      
      setAvailableCampus(campusDisponibles);
      
      // Si hay campus disponibles, seleccionar el primero por defecto
      if (campusDisponibles.length > 0) {
        setNewLoanCampus(campusDisponibles[0].campus);
      } else {
        setNewLoanCampus("");
        toast({
          title: "Libro sin disponibilidad",
          description: "Este libro no tiene ejemplares disponibles en ningún campus",
          variant: "destructive",
        });
      }
    } else {
      console.log("El libro no tiene información de inventario por campus");
      setAvailableCampus([]);
      setNewLoanCampus("");
    }
  };

  const handleNewLoanUserSelect = (user: any) => {
    setSelectedNewLoanUser(user);
    setNewLoanUserId(user.id.toString());
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedNewLoanBook || !selectedNewLoanUser || !newLoanCampus) {
      toast({
        title: "Error",
        description: "Por favor selecciona un libro, un usuario y un campus",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsCreatingLoan(true);
      
      // Registrar información detallada del libro seleccionado para depuración
      console.log("INFORMACIÓN DETALLADA DEL LIBRO SELECCIONADO:", {
        id: selectedNewLoanBook.id,
        documentId: selectedNewLoanBook.documentId,
        id_libro: selectedNewLoanBook.id_libro,
        titulo: selectedNewLoanBook.titulo,
        campus: selectedNewLoanBook.campus,
        inventory: selectedNewLoanBook.inventory,
        inventories: selectedNewLoanBook.inventories,
        inventario: selectedNewLoanBook.inventario
      });
      
      // Determinar qué identificador usar (preferir documentId si existe)
      const bookId = selectedNewLoanBook.documentId || selectedNewLoanBook.id;
      
      // Preparar datos para el servicio
      const loanData = {
        book: bookId, // Usar el identificador apropiado
        usuario: selectedNewLoanUser.id,
        fecha_prestamo: newLoanDate.toISOString(),
        fecha_devolucion_esperada: newLoanReturnDate.toISOString(),
        estado: "activo" as "activo",
        notas: newLoanNotes,
        campus_origen: newLoanCampus
      };
      
      console.log("Datos de préstamo a crear (con ID de libro ajustado):", loanData);
      
      // Crear el préstamo
      const responseData = await loanService.createLoan(loanData);
      console.log("Préstamo creado con respuesta:", responseData);
      
      // El inventario ya se actualiza dentro de loanService.createLoan()
      // No es necesario actualizarlo nuevamente aquí
      
      toast({
        title: "Préstamo creado",
        description: "El préstamo se ha registrado correctamente",
      });
      
      // Cerrar el modal y resetear el formulario
      setIsCreateLoanModalOpen(false);
      setSelectedNewLoanBook(null);
      setSelectedNewLoanUser(null);
      setNewLoanBookId("");
      setNewLoanUserId("");
      setNewLoanBookSearchTerm("");
      setNewLoanUserSearchTerm("");
      setNewLoanDate(new Date());
      setNewLoanReturnDate(addDays(new Date(), 14));
      setNewLoanCampus("");
      setNewLoanNotes("");
      setAvailableCampus([]);
      
      // Actualizar la lista de préstamos y estados para reflejar el cambio de inventario
      try {
        // Recargar los libros para reflejar el cambio en el inventario
        await recargarLibrosConInventario();
      } catch (error) {
        console.error("Error al recargar libros después de actualizar inventario:", error);
      }
      
      // Actualizar la lista de préstamos
      const response = await loanService.getLoans();
      
      // Inicializar un array vacío para los préstamos transformados
      const transformedLoans: UILoan[] = [];
      
      // Transformar los datos de la API al formato esperado por la UI
      response.forEach((loan: Loan) => {
        // Determinar tipo de devolución
        let returnType = null;
        if (loan.estado === 'devuelto' && loan.fecha_devolucion_real) {
          const dueDate = new Date(loan.fecha_devolucion_esperada);
          const actualReturn = new Date(loan.fecha_devolucion_real);
          
          if (actualReturn <= dueDate) {
            returnType = 'en_plazo';
          } else {
            returnType = 'atrasado';
          }
        } else if (loan.estado === 'renovado') {
          returnType = 'renovado';
        }
        
        transformedLoans.push({
          id: loan.id,
          documentId: loan.documentId,
          formattedId: `#${loan.id}`,
          book: loan.book?.titulo || 'Sin título',
          bookId: loan.book?.id_libro || loan.book?.id || '',
          user: loan.usuario?.username || 'Sin usuario',
          userId: loan.usuario?.id?.toString(),
          userNumControl: loan.usuario?.Numcontrol || '',
          userCarrera: loan.usuario?.Carrera,
          loanDate: loan.fecha_prestamo,
          returnDate: loan.fecha_devolucion_esperada,
          status: loan.estado,
          renewalCount: 1, // Por ahora hardcodeado a 1
          actualReturnDate: loan.fecha_devolucion_real,
          returnType,
          campus_origen: loan.campus_origen
        });
      });
      
      setLoans(transformedLoans);
      
    } catch (error) {
      console.error("Error al crear préstamo:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el préstamo",
        variant: "destructive",
      });
    } finally {
      setIsCreatingLoan(false);
    }
  };

  // Filter and sort loans
  const filteredLoans = loans
    .filter(loan => {
      // Filter by tab
      if (activeTab !== "todos" && loan.status !== activeTab) {
        return false;
      }
      // Filter by search term
      if (searchTerm) {
        const normalizedSearchTerm = normalizeString(searchTerm);
        return (
          normalizeString(loan.book).includes(normalizedSearchTerm) ||
          normalizeString(loan.user).includes(normalizedSearchTerm) ||
          loan.id.toString().includes(normalizedSearchTerm) ||
          (loan.campus_origen && normalizeString(loan.campus_origen).includes(normalizedSearchTerm)) ||
          (loan.userNumControl && normalizeString(loan.userNumControl).includes(normalizedSearchTerm)) ||
          (loan.userCarrera && normalizeString(loan.userCarrera).includes(normalizedSearchTerm))
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by date
      if (sortOrder === "recientes") {
          return new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime();
      } else {
          return new Date(a.loanDate).getTime() - new Date(b.loanDate).getTime();
      }
    });

  const formatDate = (date: string, includeTime: boolean = false): FormattedDate => {
    if (!date) return { date: "N/A" };
    
    try {
      const dateObj = parseISO(date);
      if (includeTime) {
        // Para formato con hora (hh:mm a) - formato 12 horas
        // Primero obtenemos las partes por separado
        const day = format(dateObj, "dd", { locale: es });
        const month = format(dateObj, "MMM", { locale: es });
        const year = format(dateObj, "yyyy", { locale: es });
        // Capitalizamos el mes
        const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
        
        return {
          date: `${day} ${capitalizedMonth} ${year}`,
          time: format(dateObj, "hh:mm a", { locale: es }).toLowerCase()
        };
      } else {
        // Solo fecha
        // Primero obtenemos las partes por separado
        const day = format(dateObj, "dd", { locale: es });
        const month = format(dateObj, "MMM", { locale: es });
        const year = format(dateObj, "yyyy", { locale: es });
        // Capitalizamos el mes
        const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
        
        return {
          date: `${day} ${capitalizedMonth} ${year}`
        };
      }
    } catch (e) {
      console.error("Error formatting date:", e);
      return { date };
    }
  };

  const determineReturnType = (loan: UILoan) => {
    if (loan.status !== "devuelto" || !loan.actualReturnDate) {
      return null;
    }

    const dueDate = new Date(loan.returnDate);
    const returnDate = new Date(loan.actualReturnDate);

    if (returnDate <= dueDate) {
      return "en_plazo";
    } else {
      return "atrasado";
    }
  };

  const handleRenewal = async (loan: UILoan) => {
    try {
      console.log("Intentando renovar préstamo:", loan);
      // Verificar si ya alcanzó el límite de renovaciones según la clasificación del libro
      const bookInfo = allBooks.find(book => {
        // Comparación más segura de IDs
        const bookIdMatch = book.id?.toString() === loan.bookId?.toString();
        const bookIdLibroMatch = book.id_libro?.toString() === loan.bookId?.toString();
        return bookIdMatch || bookIdLibroMatch;
      });
      
      console.log("Libro encontrado para renovación:", bookInfo);
      
      // Determinar clasificación del libro y máximo de renovaciones
      const clasificacion = bookInfo?.clasificacion?.toLowerCase() || "";
      const esLiteratura = clasificacion.includes("literatura");
      const maxRenovaciones = esLiteratura ? 2 : 1;
      
      console.log("Clasificación:", clasificacion, "Es literatura:", esLiteratura, "Max renovaciones:", maxRenovaciones);
      console.log("Renovaciones actuales:", loan.renewalCount);
      
      if (loan.renewalCount >= maxRenovaciones) {
        toast({
          title: "Límite de renovaciones alcanzado",
          description: `No se pueden realizar más de ${maxRenovaciones} ${maxRenovaciones > 1 ? 'renovaciones' : 'renovación'} para este tipo de libro`,
          variant: "destructive",
        });
        return;
      }

      // Calcular nueva fecha de devolución (14 días a partir de hoy)
      const newDueDate = addDays(new Date(), 14);
      setRenewalDate(newDueDate);
      setSelectedLoan(loan);
      setShowRenewalDialog(true);
    } catch (error) {
      console.error("Error al preparar renovación:", error);
      toast({
        title: "Error",
        description: "No se pudo preparar la renovación del préstamo",
        variant: "destructive",
      });
    }
  };

  const confirmRenewal = async () => {
    if (!selectedLoan || !renewalDate) return;

    try {
      console.log("Confirmando renovación para préstamo:", selectedLoan);
      
      // Verificar nuevamente el límite de renovaciones según clasificación
      const bookInfo = allBooks.find(book => {
        // Comparación más segura de IDs
        const bookIdMatch = book.id?.toString() === selectedLoan.bookId?.toString();
        const bookIdLibroMatch = book.id_libro?.toString() === selectedLoan.bookId?.toString();
        return bookIdMatch || bookIdLibroMatch;
      });
      
      console.log("Libro encontrado para confirmación:", bookInfo);
      
      // Determinar clasificación del libro y máximo de renovaciones
      const clasificacion = bookInfo?.clasificacion?.toLowerCase() || "";
      const esLiteratura = clasificacion.includes("literatura");
      const maxRenovaciones = esLiteratura ? 2 : 1;
      
      console.log("Clasificación:", clasificacion, "Es literatura:", esLiteratura, "Max renovaciones:", maxRenovaciones);
      console.log("Renovaciones actuales:", selectedLoan.renewalCount);
      
      if (selectedLoan.renewalCount >= maxRenovaciones) {
        toast({
          title: "Límite de renovaciones alcanzado",
          description: `No se pueden realizar más de ${maxRenovaciones} ${maxRenovaciones > 1 ? 'renovaciones' : 'renovación'} para este tipo de libro`,
          variant: "destructive",
        });
        return;
      }

      await loanService.renewLoan(selectedLoan.id, renewalDate.toISOString().split('T')[0], selectedLoan.documentId);
      
      toast({
        title: "Préstamo renovado",
        description: `El préstamo ha sido renovado exitosamente (Renovación ${selectedLoan.renewalCount + 1} de ${maxRenovaciones})`,
      });
      
      // Actualizar la lista de préstamos
      setLoans(loans.map(l => 
        l.id === selectedLoan.id 
          ? { 
              ...l, 
              status: "renovado", 
              returnDate: renewalDate.toISOString(),
              renewalCount: l.renewalCount + 1 
            } 
          : l
      ));

      setShowRenewalDialog(false);
      setRenewalDate(null);
    } catch (error) {
      console.error("Error al renovar préstamo:", error);
      toast({
        title: "Error",
        description: "No se pudo renovar el préstamo",
        variant: "destructive",
      });
    }
  };

  const handleReturn = async (loan: UILoan) => {
    try {
      // Primero, sincronizar la multa con el backend para asegurar el cálculo correcto
      const fineDetails = await loanService.syncFineWithBackend(loan.id, loan.documentId);
      
      // Actualizar el préstamo con la información de multa correcta
      loan.multa = fineDetails.multa;
      loan.dias_atraso = fineDetails.dias_atraso;
      
      // Marcar el préstamo como devuelto en el sistema
      await loanService.returnLoan(loan.id, loan.documentId);
      
      const today = new Date().toISOString();
      const returnType = determineReturnType({
        ...loan,
        status: "devuelto",
        actualReturnDate: today
      });
      
      // Recargar los libros para reflejar el cambio en el inventario
      await recargarLibrosConInventario();
      
      // Mostrar mensaje apropiado según si hay multa o no
      if (fineDetails.multa > 0) {
        toast({
          title: "Préstamo devuelto con multa",
          description: `El libro ha sido devuelto con ${fineDetails.dias_atraso} días de atraso. Multa: $${fineDetails.multa}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Préstamo devuelto",
          description: "El libro ha sido marcado como devuelto",
        });
      }
      
      // Actualizar la lista de préstamos
      setLoans(loans.map(l => 
        l.id === loan.id 
          ? { 
              ...l,
              status: "devuelto",
              actualReturnDate: today,
              returnType,
              multa: fineDetails.multa,
              dias_atraso: fineDetails.dias_atraso
            } 
          : l
      ));
    } catch (error) {
      console.error("Error al devolver préstamo:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar la devolución del libro",
        variant: "destructive",
      });
    }
  };

  const handleRestore = async (loan: UILoan) => {
    try {
      // Restaurar préstamo (cambiarlo de perdido a activo)
      const updateData: Partial<LoanData> = {
        estado: 'activo' as 'activo',
        fecha_devolucion_real: null
      };
      
      await loanService.updateLoan(loan.id, updateData, loan.documentId);
      
      toast({
        title: "Préstamo restaurado",
        description: "El préstamo ha sido restaurado a estado activo",
      });
      
      // Actualizar la lista de préstamos
      setLoans(loans.map(l => 
        l.id === loan.id 
          ? { 
          ...l,
              status: "activo", 
              actualReturnDate: null,
              returnType: null
            } 
          : l
      ));
    } catch (error) {
      console.error("Error al restaurar préstamo:", error);
    toast({
        title: "Error",
        description: "No se pudo restaurar el préstamo",
        variant: "destructive",
      });
    }
  };

  const handleReplacement = async (loan: UILoan) => {
    try {
      await loanService.markAsLost(loan.id, loan.documentId);
      
      // No actualizamos el inventario al marcar como perdido, ya que se considera
      // una pérdida real del inventario
      
      toast({
        title: "Libro marcado como perdido",
        description: "El libro ha sido marcado como perdido exitosamente",
      });
      
      // Actualizar la lista de préstamos
      setLoans(loans.map(l => 
        l.id === loan.id 
          ? { 
          ...l,
              status: "perdido"
            } 
          : l
      ));
      
    setShowReplacementDialog(false);
    } catch (error) {
      console.error("Error al marcar como perdido:", error);
    toast({
        title: "Error",
        description: "No se pudo marcar el libro como perdido",
        variant: "destructive",
    });
    }
  };

  const renderDateInfo = (loan: UILoan) => {
    const formattedDate = formatDate(loan.loanDate, true);
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>{formattedDate.date}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formattedDate.time}</span>
        </div>
      </div>
    );
  };

  const renderReturnDateInfo = (loan: UILoan) => {
    // Calcular días de atraso y multa para préstamos atrasados si no tienen valores
    let displayMulta = loan.multa || 0;
    let displayDiasAtraso = loan.dias_atraso || 0;
    
    // Obtener los días feriados para este préstamo
    const holidayCount = holidayDaysByLoan[loan.id] || 0;
    
    // Para préstamos atrasados sin multa calculada, mostrar la multa estimada
    if (loan.status === "atrasado" && displayMulta === 0) {
      const today = new Date();
      const dueDate = new Date(loan.returnDate);
      
      if (dueDate < today) {
        try {
          // Calcular solo días laborables usando loanService directamente
          const daysLate = loanService.calculateBusinessDays(dueDate, today);
          // Aplicar descuento por días feriados
          displayDiasAtraso = Math.max(0, daysLate - holidayCount);
          // Solo aplicar multa si realmente hay días de atraso
          displayMulta = displayDiasAtraso > 0 ? displayDiasAtraso * 10 : 0; // $10 por día laborable de atraso
        } catch (error) {
          console.error("Error al calcular días laborables:", error);
          // Fallback simple en caso de error
        const diffTime = Math.abs(today.getTime() - dueDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          displayDiasAtraso = Math.max(0, diffDays - holidayCount);
          displayMulta = displayDiasAtraso * 10;
        }
      } else {
        // Si la fecha de vencimiento no ha pasado aún, no hay multa ni días de atraso
        displayDiasAtraso = 0;
        displayMulta = 0;
      }
    }
    
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {loan.status === "devuelto" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          {loan.status === "activo" && <CalendarClock className="h-4 w-4 text-blue-500" />}
          {loan.status === "atrasado" && <CalendarX className="h-4 w-4 text-amber-500" />}
          {loan.status === "perdido" && <Timer className="h-4 w-4 text-rose-500" />}
          <span>
            {loan.status === "devuelto" 
              ? formatDate(loan.actualReturnDate || "").date
              : formatDate(loan.returnDate).date}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {loan.status === "devuelto" && loan.actualReturnDate && (
            <>
              <Clock className="h-3 w-3" />
              <span>Devuelto: {formatDate(loan.actualReturnDate, true).time}</span>
            </>
          )}
          {loan.status === "activo" && <span>Fecha límite de entrega</span>}
          {loan.status === "atrasado" && (
            <span className="text-amber-500 font-medium">
              Vencido desde {formatDate(loan.returnDate).date}
            </span>
          )}
          {loan.status === "perdido" && <span className="text-rose-500">No devuelto</span>}
        </div>
        
        {/* Mostrar multa usando datos del backend o calculados */}
        {loan.status === "atrasado" && displayMulta && displayMulta > 0 && (
          <div className="mt-1">
            <Badge variant="destructive" className="bg-rose-500">
              Multa estimada: ${displayMulta} ({displayDiasAtraso} días hábiles de atraso)
            </Badge>
            {holidayCount > 0 && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {holidayCount} {holidayCount === 1 ? 'día feriado descontado' : 'días feriados descontados'}
              </div>
            )}
          </div>
        )}
        {loan.status === "devuelto" && loan.multa && loan.multa > 0 && (
          <div className="mt-1 text-xs">
            <Badge variant="destructive" className="bg-rose-500">
              Multa aplicada: ${loan.multa} ({loan.dias_atraso} días hábiles de atraso)
            </Badge>
            {holidayCount > 0 && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {holidayCount} {holidayCount === 1 ? 'día feriado descontado' : 'días feriados descontados'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderActionMenu = (loan: UILoan) => {
    return (
      <>
          {/* Ver detalles - Disponible para todos los estados */}
          <DropdownMenuItem onClick={() => {
            setSelectedLoan(loan);
            setShowDetailsDialog(true);
          }}>
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>
          
        {/* Renovar préstamo - Solo para activo */}
        {loan.status === "activo" && (
            <DropdownMenuItem onClick={() => handleRenewal(loan)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Renovar préstamo
            </DropdownMenuItem>
          )}
          
          {/* Marcar como devuelto - Para activo, renovado y atrasado */}
          {["activo", "renovado", "atrasado"].includes(loan.status) && (
            <DropdownMenuItem onClick={() => handleReturn(loan)}>
              <BookCheck className="mr-2 h-4 w-4" />
              Marcar como devuelto
            </DropdownMenuItem>
          )}
          
        {/* Marcar como perdido - Para activo, renovado o atrasado */}
        {["activo", "renovado", "atrasado"].includes(loan.status) && (
            <>
              <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-rose-500 dark:text-rose-400"
              onClick={() => {
                setSelectedLoan(loan);
                setShowReplacementDialog(true);
              }}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Marcar como perdido
            </DropdownMenuItem>
          </>
        )}
        
        {/* Acciones para perdido */}
        {loan.status === "perdido" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleRestore(loan)}>
                <Undo className="mr-2 h-4 w-4" />
                Restaurar a devuelto
              </DropdownMenuItem>
            </>
          )}
      </>
    );
  };

  // Función para calcular multas en lote
  const calculateAllFines = async () => {
      setIsUpdatingFines(true);
    try {
      // Obtener solo los préstamos atrasados
      const overdueLoans = loans.filter(loan => loan.status === "atrasado");
      if (overdueLoans.length === 0) {
        toast({
          description: "No hay préstamos atrasados para actualizar multas",
        });
        setIsUpdatingFines(false);
        return 0;
      }
      
      let updatedCount = 0;
      let totalHolidaysApplied = 0;
      const updatedLoans = [...loans];
      
      for (const loan of overdueLoans) {
        try {
          // Usar los días feriados específicos de este préstamo
          const loanHolidayDays = holidayDaysByLoan[loan.id] || 0;
          totalHolidaysApplied += loanHolidayDays;
          
          // Verificar la multa original para saber si hay cambios
          const originalFine = loan.multa || 0;
          const originalDaysLate = loan.dias_atraso || 0;
          
          // Llamar al backend para sincronizar las multas
          const { multa, dias_atraso } = await loanService.syncFineWithBackend(
            loan.id, 
            loan.documentId,
            loanHolidayDays
          );
          
          // Verificar si hubo cambios
          const hasChanged = multa !== originalFine || dias_atraso !== originalDaysLate;
          
          // Actualizar el préstamo en el array local
          const loanIndex = updatedLoans.findIndex(l => l.id === loan.id);
          if (loanIndex >= 0) {
            updatedLoans[loanIndex] = {
              ...updatedLoans[loanIndex],
              multa,
              dias_atraso
            };
            
            // Solo incrementar el contador si hubo cambios reales
            if (hasChanged) {
          updatedCount++;
            }
          }
        } catch (error) {
          console.error(`Error al actualizar multa para préstamo ${loan.id}:`, error);
        }
      }
      
      setLoans(updatedLoans);
      
      // Solo mostrar notificación si hubo cambios reales
      if (updatedCount > 0) {
      toast({
          description: `Multas actualizadas para ${updatedCount} préstamos${totalHolidaysApplied > 0 ? ` (${totalHolidaysApplied} días feriados descontados)` : ''}`,
      });
      }
      
      return updatedCount;
    } catch (error) {
      console.error("Error al actualizar multas:", error);
      toast({
        variant: "destructive",
        description: "Error al actualizar multas",
      });
      return 0;
    } finally {
      setIsUpdatingFines(false);
    }
  };

  // Función para recargar los libros con inventario actualizado
  const recargarLibrosConInventario = async () => {
    try {
      const booksData = await bookService.getBooks();
      const booksWithInventory = procesarInventarioDeLibros(booksData.data);
      setAllBooks(booksWithInventory);
      setFilteredNewLoanBooks(booksWithInventory);
      
      // Actualizar la búsqueda si estamos en el modal
      if (isCreateLoanModalOpen) {
        searchBooks(1);
      }
    } catch (error) {
      console.error("Error al recargar libros:", error);
    }
  };

  // Función para agregar un día feriado con enfoque optimista
  const addHoliday = async (date: Date) => {
    if (!date) return;

    try {
      // Normalizar fecha para identificación
      const dateString = date.toISOString().split('T')[0];
      
      // Marcar esta fecha específica como en proceso de carga
      setLoadingDates(prev => ({...prev, [dateString]: true}));
      
      // Actualización optimista (mostrar como feriado antes de confirmación)
      const tempHoliday = {
        id: `temp-${Date.now()}`,
        date: date.toISOString(),
        temporary: true
      };
      
      // Añadir a la lista local inmediatamente
      setHolidays(prev => [...prev, tempHoliday as Holiday]);
      
      // Asegurar que la fecha está en formato ISO completo
      const formattedDate = new Date(date);
      // Establecer la hora a las 7:00 am (para mantener consistencia con los datos de ejemplo)
      formattedDate.setHours(7, 0, 0, 0);
      
      console.log(`Intentando agregar feriado en fecha ISO: ${formattedDate.toISOString()}`);
      
      const newHoliday = await holidayService.addHoliday(formattedDate);
      if (newHoliday) {
        console.log("Día feriado agregado:", newHoliday);
        
        // Verificar que el holiday tiene un documentId válido
        if (!newHoliday.documentId || newHoliday.documentId === String(newHoliday.id)) {
          console.warn("El feriado se creó sin un documentId válido. Usando solo ID para operaciones futuras.");
        }
        
        // Actualizar el estado reemplazando el temporal por el real
        setHolidays(prev => prev.map(h => 
          (h.temporary && new Date(h.date).toISOString().split('T')[0] === dateString) 
            ? newHoliday 
            : h
        ));
        
        // No mostrar toast inmediatamente, esperar a ver si hay cambios en préstamos
        
        // Cargar en segundo plano sin mostrar estados de carga
        setTimeout(() => {
          loadHolidays(false);
          
          // Recalcular días feriados para los préstamos
          setTimeout(() => {
            // Recalcular los días feriados para cada préstamo
            const holidayDays: Record<string | number, number> = {};
            
            loans.forEach(loan => {
              if (loan.status === "atrasado" || (loan.status === "devuelto" && loan.multa && loan.multa > 0)) {
                const feriados = calcularDiasFeriados(loan);
                holidayDays[loan.id] = feriados;
              }
            });
            
            setHolidayDaysByLoan(holidayDays);
            
            // Actualizar inmediatamente las multas
            calculateAllFines().then((updatedCount) => {
              // Solo mostrar notificación si hay cambios en las multas
              if (updatedCount === 0) {
                toast({
                  description: `Día feriado agregado: ${format(date, 'dd/MM/yyyy')}`,
                });
              }
            });
          }, 300);
        }, 500);
      } else {
        // Si falla, eliminar el temporal
        setHolidays(prev => prev.filter(h => !h.temporary));
        toast({
          title: "Error",
          description: "No se pudo agregar el día feriado",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al agregar día feriado:', error);
      
      // Eliminar el temporal en caso de error
      setHolidays(prev => prev.filter(h => !h.temporary));
      
      toast({
        title: "Error",
        description: "No se pudo agregar el día feriado",
        variant: "destructive",
      });
    } finally {
      // Limpiar estado de carga para esta fecha
      const dateString = date.toISOString().split('T')[0];
      setLoadingDates(prev => {
        const updated = {...prev};
        delete updated[dateString];
        return updated;
      });
    }
  };

  // Función para eliminar un día feriado con enfoque optimista
  const deleteHoliday = async (holiday: Holiday) => {
    if (!holiday) return false;
    
    try {
      // Normalizar fecha para identificación
      const dateString = new Date(holiday.date).toISOString().split('T')[0];
      
      // Marcar esta fecha específica como en proceso de carga
      setLoadingDates(prev => ({...prev, [dateString]: true}));
      
      // Actualización optimista (quitar de la lista local inmediatamente)
      const originalHolidays = [...holidays];
      setHolidays(prev => prev.filter(h => h.id !== holiday.id));
      
      console.log('Intentando eliminar feriado:', holiday);
      
      // Verificar que tenemos la información necesaria para la eliminación
      if (!holiday.id && !holiday.documentId) {
        console.error('No se puede eliminar el feriado: faltan tanto ID como documentId');
        // Restaurar estado original
        setHolidays(originalHolidays);
        return false;
      }
      
      // Verificar que documentId sea válido (no sea igual al id numérico)
      const hasValidDocumentId = holiday.documentId && 
                               typeof holiday.documentId === 'string' && 
                               holiday.documentId.length > 10 &&
                               holiday.documentId !== String(holiday.id);
      
      if (hasValidDocumentId) {
        console.log(`Eliminando feriado usando documentId: ${holiday.documentId}`);
        // Usar directamente el holidayService con documentId primero
        const success = await holidayService.deleteHoliday(holiday.id, holiday.documentId);
        
        if (success) {
          // No mostrar toast inmediatamente, esperar a ver si hay cambios en préstamos
          
          // Cargar en segundo plano sin mostrar estados de carga
          setTimeout(() => {
            loadHolidays(false);
            
            // Recalcular días feriados para los préstamos
            setTimeout(() => {
              // Recalcular los días feriados para cada préstamo
              const holidayDays: Record<string | number, number> = {};
              
              loans.forEach(loan => {
                if (loan.status === "atrasado" || (loan.status === "devuelto" && loan.multa && loan.multa > 0)) {
                  const feriados = calcularDiasFeriados(loan);
                  holidayDays[loan.id] = feriados;
                }
              });
              
              setHolidayDaysByLoan(holidayDays);
              
              // Actualizar inmediatamente las multas
              calculateAllFines().then((updatedCount) => {
                // Solo mostrar notificación si no hay cambios en las multas
                if (updatedCount === 0) {
                  toast({
                    description: `Día feriado eliminado: ${format(parseISO(holiday.date), 'dd/MM/yyyy')}`,
                  });
                }
              });
            }, 300);
          }, 500);
          
          return true;
        }
      } else if (holiday.id) {
        // Si no tenemos documentId válido, intentar solo con ID
        console.log(`Eliminando feriado usando solo ID: ${holiday.id} (sin documentId válido)`);
        const success = await holidayService.deleteHoliday(holiday.id, undefined);
        
        if (success) {
          // No mostrar toast inmediatamente, esperar a ver si hay cambios en préstamos
          
          // Cargar en segundo plano sin mostrar estados de carga
          setTimeout(() => {
            loadHolidays(false);
            
            // Recalcular días feriados para los préstamos
            setTimeout(() => {
              // Recalcular los días feriados para cada préstamo
              const holidayDays: Record<string | number, number> = {};
              
              loans.forEach(loan => {
                if (loan.status === "atrasado" || (loan.status === "devuelto" && loan.multa && loan.multa > 0)) {
                  const feriados = calcularDiasFeriados(loan);
                  holidayDays[loan.id] = feriados;
                }
              });
              
              setHolidayDaysByLoan(holidayDays);
              
              // Actualizar inmediatamente las multas
              calculateAllFines().then((updatedCount) => {
                // Solo mostrar notificación si no hay cambios en las multas
                if (updatedCount === 0) {
                  toast({
                    description: `Día feriado eliminado: ${format(parseISO(holiday.date), 'dd/MM/yyyy')}`,
                  });
                }
              });
            }, 300);
          }, 500);
          
          return true;
        }
      }
      
      // Si llegamos aquí, falló la eliminación
      console.error('No se pudo eliminar el feriado a través de la API');
      
      // Verificar mediante carga si realmente se eliminó
      await loadHolidays(false);
      
      // Comprobar si el feriado sigue existiendo
      const stillExists = holidays.some(h => {
        try {
          return h.id === holiday.id || h.documentId === holiday.documentId;
        } catch (e) {
          return false;
        }
      });
      
      if (!stillExists) {
        console.log(`Verificación confirmó que el feriado ya no existe`);
        return true;
      }
      
      // Si aún existe, restaurar el estado original
      setHolidays(originalHolidays);
      
      // Mostrar error
      toast({
        title: "Error",
        description: "No se pudo eliminar el día feriado",
        variant: "destructive",
      });
      
      return false;
    } catch (error) {
      console.error('Error al eliminar día feriado:', error);
      
      // Restaurar el estado original en caso de error
      setHolidays(prev => [...holidays]);
      
      toast({
        title: "Error",
        description: "No se pudo eliminar el día feriado",
        variant: "destructive",
      });
      return false;
    } finally {
      // Limpiar estado de carga para esta fecha
      const dateString = new Date(holiday.date).toISOString().split('T')[0];
      setLoadingDates(prev => {
        const updated = {...prev};
        delete updated[dateString];
        return updated;
      });
    }
  };

  // Función para manejar el clic en una fecha del calendario
  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Normalizar la fecha a formato YYYY-MM-DD para comparación consistente
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0); 
    const selectedDateString = normalizedDate.toISOString().split('T')[0];
    
    // Si ya está cargando esta fecha, no hacer nada
    if (loadingDates[selectedDateString]) {
      console.log(`Fecha ${selectedDateString} ya está en proceso, ignorando clic`);
      return;
    }
    
    console.log(`Usuario hizo clic en fecha: ${selectedDateString}`);
    
    // Volcado de información de debug para los feriados actuales
    console.log("Todos los días feriados actuales:", holidays.map(h => ({
      id: h.id,
      documentId: h.documentId,
      date: h.date,
      dateFormatted: new Date(h.date).toISOString().split('T')[0]
    })));
    
    // Comprobar si la fecha ya existe como feriado (más robusto)
    const existingHoliday = holidays.find(h => {
      try {
        // Normalizar ambas fechas a formato YYYY-MM-DD para comparación
        const holidayDate = new Date(h.date);
        const holidayDateString = holidayDate.toISOString().split('T')[0];
        
        console.log(`Comparando: ${holidayDateString} con ${selectedDateString}`);
        return holidayDateString === selectedDateString;
      } catch (error) {
        console.error('Error al procesar fecha de holiday:', h);
        return false;
      }
    });
    
    console.log("¿Se encontró feriado existente?", existingHoliday ? "SÍ" : "NO");
    
    if (existingHoliday) {
      // Si ya existe, eliminarlo
      console.log(`Fecha ${selectedDateString} ya existe como feriado, intentando eliminar:`, existingHoliday);
      
      // Verificar que el holiday tiene toda la información necesaria
      if (!existingHoliday.documentId) {
        console.warn("El feriado no tiene documentId, se intentará eliminar solo con ID");
      }
      
      // Eliminar el feriado (la función deleteHoliday ya tiene enfoque optimista)
      deleteHoliday(existingHoliday);
      
    } else {
      // Si no existe, agregarlo
      console.log(`Fecha ${selectedDateString} no existe como feriado, intentando agregar`);
      addHoliday(date);
    }
  };

  // Función para renderizar el día en el calendario (para mostrar los feriados con estilo especial)
  const renderCalendarDay = (props: DayContentProps) => {
    const { date, ...dayProps } = props;
    if (!date) return <DayContent {...props} />;
    
    const dateString = date.toISOString().split('T')[0];
    const isLoading = loadingDates[dateString];
    const isHoliday = holidayService.isHoliday(date, holidays);

    return (
      <div className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full p-0",
        isHoliday && "bg-rose-100 dark:bg-rose-900/50",
        isHoliday && "after:absolute after:left-1/2 after:top-1/2 after:h-px after:w-6 after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:bg-rose-600 after:content-['']",
        isHoliday && "before:absolute before:left-1/2 before:top-1/2 before:h-6 before:w-px before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-45 before:bg-rose-600 before:content-['']"
      )}>
        <time
          dateTime={format(date, 'yyyy-MM-dd')}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isHoliday && "text-rose-700 dark:text-rose-400 font-medium",
            isLoading && "opacity-50"
          )}
        >
          {format(date, "d")}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
              <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          )}
        </time>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Préstamos</h2>
          <p className="text-muted-foreground">
            Gestiona los préstamos de libros activos y pasados
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por libro, usuario, numcontrol, carrera..." 
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          {activeTab === "atrasado" && (
            <Button 
              variant="outline" 
              size="sm"
              disabled={isUpdatingFines}
              onClick={calculateAllFines}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {isUpdatingFines ? "Actualizando..." : "Actualizar multas"}
            </Button>
          )}
          
          {/* Botón para gestionar días feriados */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowHolidayModal(true)}
          >
            <CalendarX className="mr-2 h-4 w-4" />
            Días feriados
          </Button>
          
          <Button 
            variant="default" 
            onClick={() => setIsCreateLoanModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo préstamo
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
                <DropdownMenuRadioItem value="recientes">Más recientes primero</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="antiguos">Más antiguos primero</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="vencimiento">Fecha de vencimiento</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="usuario">Nombre de usuario</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="libro">Título del libro</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="activo">Activos</TabsTrigger>
            <TabsTrigger value="renovado">Renovados</TabsTrigger>
            <TabsTrigger value="atrasado">Atrasados</TabsTrigger>
            <TabsTrigger value="devuelto">Devueltos</TabsTrigger>
            <TabsTrigger value="perdido">Perdidos</TabsTrigger>
        </TabsList>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={sortOrder === "recientes" ? "text-primary" : ""}
              onClick={() => setSortOrder("recientes")}
            >
              Más recientes
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={sortOrder === "antiguos" ? "text-primary" : ""}
              onClick={() => setSortOrder("antiguos")}
            >
              Más antiguos
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab || "todos"} className="mt-6">
          {filteredLoans.length === 0 ? (
            <div className="rounded-lg border bg-card text-card-foreground p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No hay préstamos</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {activeTab === "todos"
                  ? "No se encontraron préstamos en el sistema."
                  : `No hay préstamos con estado "${activeTab}" en este momento.`}
              </p>
              <Button 
                className="mt-6"
                onClick={() => setIsCreateLoanModalOpen(true)}
              >
                Crear nuevo préstamo
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="w-full border-collapse">
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent border-b border-border">
                      <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">ID</TableHead>
                      <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Libro</TableHead>
                      <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Usuario</TableHead>
                      <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Campus</TableHead>
                      <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Fecha préstamo</TableHead>
                      <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Fecha devolución</TableHead>
                      <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Estado</TableHead>
                      <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans
                      .slice(0, displayCount)
                  .map((loan) => (
                    <TableRow 
                      key={loan.id}
                      className={cn(
                            "group border-b border-border transition-colors",
                            loan.status === "atrasado" && "bg-rose-50/60 dark:bg-rose-950/20",
                            loan.status === "activo" && "hover:bg-blue-50/50 dark:hover:bg-blue-950/20",
                            loan.status === "renovado" && "hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20",
                            loan.status === "devuelto" && "hover:bg-slate-50 dark:hover:bg-slate-950/20 text-muted-foreground",
                            loan.status === "perdido" && "bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/30"
                      )}
                    >
                          <TableCell className="px-4 py-2 text-xs font-medium">
                            {loan.id}
                          </TableCell>
                          <TableCell className="px-4 py-2">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "p-1.5 rounded-md flex-shrink-0 mt-0.5",
                                loan.status === "atrasado" && "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
                                loan.status === "activo" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                loan.status === "renovado" && "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
                                loan.status === "devuelto" && "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
                                loan.status === "perdido" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                              )}>
                                <BookOpen className="h-4 w-4" />
                              </div>
                              <div className="space-y-1 min-w-0">
                                <p className="text-sm font-medium leading-none truncate max-w-[180px]" title={loan.book}>
                                  {loan.book}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  ID: {loan.bookId}
                                </p>
                                {/* Mostrar clasificación si existe en allBooks */}
                                {allBooks.find(book => 
                                  book.id.toString() === loan.bookId.toString() || 
                                  book.id_libro === loan.bookId.toString()
                                )?.clasificacion && (
                                  <p className="text-xs text-muted-foreground">
                                    Clasificación: {
                                      allBooks.find(book => 
                                        book.id.toString() === loan.bookId.toString() || 
                                        book.id_libro === loan.bookId.toString()
                                      )?.clasificacion
                                    }
                                  </p>
                                )}
                              </div>
                        </div>
                      </TableCell>
                          <TableCell className="px-4 py-2">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "p-1.5 rounded-md flex-shrink-0 mt-0.5",
                                "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
                              )}>
                                <User className="h-4 w-4" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">{loan.user}</p>
                            <p className="text-xs text-muted-foreground">{loan.userNumControl}</p>
                            {loan.userCarrera && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <GraduationCap className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">{loan.userCarrera}</span>
                                  </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                          <TableCell className="px-4 py-2">
                        <div className="flex items-center">
                          {getCampusBadge(loan.campus_origen)}
                        </div>
                      </TableCell>
                          <TableCell className="px-4 py-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs font-medium">{formatDate(loan.loanDate).date}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(loan.loanDate, true).time}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                {loan.status === "devuelto" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                                {loan.status === "activo" && <CalendarClock className="h-3.5 w-3.5 text-blue-500" />}
                                {loan.status === "atrasado" && <CalendarX className="h-3.5 w-3.5 text-rose-500" />}
                                {loan.status === "perdido" && <Timer className="h-3.5 w-3.5 text-amber-500" />}
                                {loan.status === "renovado" && <RotateCw className="h-3.5 w-3.5 text-indigo-500" />}
                                <span className="text-xs font-medium">
                                  {loan.status === "devuelto" 
                                    ? formatDate(loan.actualReturnDate || "").date
                                    : formatDate(loan.returnDate).date}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {loan.status === "devuelto" && loan.actualReturnDate && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                    <span>Devuelto: {formatDate(loan.actualReturnDate, true).time}</span>
                                  </div>
                                )}
                                {loan.status === "activo" && <span className="text-blue-500 text-[10px]">Fecha límite</span>}
                                {loan.status === "atrasado" && (
                                  <span className="text-rose-500 text-[10px] font-medium">
                                    Vencido
                                  </span>
                                )}
                                {loan.status === "perdido" && <span className="text-amber-500 text-[10px]">No devuelto</span>}
                                {loan.status === "renovado" && <span className="text-indigo-500 text-[10px]">Renovado</span>}
                              </div>
                              
                              {/* Mostrar multa usando datos del backend o calculados */}
                              {loan.status === "atrasado" && loan.multa && loan.multa > 0 && (
                                <div className="mt-1">
                                  <Badge variant="destructive" className="bg-rose-500 py-0 px-1.5 text-[10px]">
                                    ${loan.multa} ({loan.dias_atraso || 0} días)
                                  </Badge>
                                </div>
                              )}
                              {loan.status === "devuelto" && loan.multa && loan.multa > 0 && (
                                <div className="mt-1">
                                  <Badge variant="destructive" className="bg-rose-500 py-0 px-1.5 text-[10px]">
                                    ${loan.multa} ({loan.dias_atraso || 0} días)
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-2">
                            <div className="flex flex-col items-center gap-1">
                          {getStatusBadge(loan.status)}
                          {loan.status === "devuelto" && loan.returnType && getReturnTypeBadge(loan.returnType)}
                              {loan.status === "renovado" && (
                                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                                  <RotateCw className="h-2.5 w-2.5" />
                                  <span>{Math.max(1, loan.renewalCount)}/{
                                    // Obtener max renovaciones según clasificación
                                    (allBooks.find(book => 
                                      book.id.toString() === loan.bookId.toString() || 
                                      book.id_libro === loan.bookId.toString()
                                    )?.clasificacion || "").toLowerCase() === "literatura" ? "2" : "1"
                                  }</span>
                                </div>
                              )}
                        </div>
                      </TableCell>
                          <TableCell className="px-4 py-2">
                            <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                  >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                          {renderActionMenu(loan)}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
              </div>
              
              {/* Mostrar botón para cargar más resultados si hay más de los que se muestran */}
              {filteredLoans.length > displayCount && (
                <div className="flex justify-center p-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDisplayCount(prev => prev + 50)}
                    className="text-xs"
                  >
                    Cargar más resultados ({filteredLoans.length - displayCount} restantes)
                  </Button>
                </div>
              )}
          </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedLoan && (
        <>
      <Dialog open={showDetailsDialog} onOpenChange={(open) => {
        // Cuando se abre el modal, calcular automáticamente los días feriados
        if (open && selectedLoan) {
          const holidayCount = calcularDiasFeriados(selectedLoan);
          
          // Actualizar estado solo si es diferente al valor actual
          if (holidayDaysByLoan[selectedLoan.id] !== holidayCount) {
            // Actualizar los días feriados para este préstamo
            setHolidayDaysByLoan(prev => ({
              ...prev,
              [selectedLoan.id]: holidayCount
            }));
            
            // Recalcular multa
            const dueDate = new Date(selectedLoan.returnDate);
            const today = new Date();
            const daysLate = loanService.calculateBusinessDays(dueDate, today);
            const adjustedDaysLate = Math.max(0, daysLate - holidayCount);
            const fine = adjustedDaysLate * 10;
            
            // Actualizar el préstamo seleccionado con la nueva multa
            setSelectedLoan({
              ...selectedLoan,
              multa: fine,
              dias_atraso: adjustedDaysLate
            });
          }
        }
        
        setShowDetailsDialog(open);
      }}>
      <DialogContent className="sm:max-w-md">
          <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> 
            Detalles del préstamo
          </DialogTitle>
          </DialogHeader>
        <div className="space-y-4">
          {/* Información del libro y estado */}
          <div className="border-b pb-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-lg">{selectedLoan.book}</h3>
                  {getStatusBadge(selectedLoan.status)}
                </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> 
              <span>Clasificación: {
                // Buscar el libro por ID para obtener su clasificación
                allBooks.find(book => 
                  book.id.toString() === selectedLoan.bookId.toString() || 
                  book.id_libro === selectedLoan.bookId.toString()
                )?.clasificacion || "No disponible"
              }</span>
            </p>
                </div>

          {/* Información del préstamo */}
          <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
              <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                <User className="h-3 w-3" /> Usuario
              </p>
              <p className="font-medium">{selectedLoan.user}</p>
              <div className="flex items-center gap-1 mt-1">
                <GraduationCap className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs">{selectedLoan.userCarrera || "Sin carrera"}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{selectedLoan.userNumControl}</p>
              </div>
                <div>
              <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                <Building className="h-3 w-3" /> Campus
              </p>
              <div>{getCampusBadge(selectedLoan.campus_origen)}</div>
                  </div>
                  <div>
              <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" /> Fecha préstamo
              </p>
              <p>{formatDate(selectedLoan.loanDate, true).date}</p>
              </div>
                <div>
              <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                <CalendarClock className="h-3 w-3" /> Fecha devolución
              </p>
              <p>{formatDate(selectedLoan.returnDate).date}</p>
                  </div>
                </div>

          {/* Información sobre renovaciones si es un préstamo activo */}
          {selectedLoan.status === "activo" && (
            <div className="border rounded-md p-2 bg-blue-50 dark:bg-blue-900/10">
              <p className="text-xs flex items-center gap-1">
                <RotateCw className="h-3 w-3 text-blue-500" />
                <span className="font-medium text-blue-600">
                  Renovaciones: {selectedLoan.renewalCount} de 2
                </span>
                {selectedLoan.renewalCount < 2 ? (
                  <span className="text-muted-foreground ml-1">
                    (Disponible: {2 - selectedLoan.renewalCount})
                  </span>
                ) : (
                  <span className="text-rose-500 ml-1">(Límite alcanzado)</span>
                      )}
              </p>
                </div>
              )}

          {/* Información de multa */}
                {(selectedLoan.status === "atrasado" || (selectedLoan.status === "devuelto" && selectedLoan.multa && selectedLoan.multa > 0)) && (
            <div className="border rounded-md p-3 bg-rose-50 dark:bg-rose-900/10 mt-3">
              <div className="flex items-center mb-2">
                <h4 className="text-sm font-medium text-rose-600 dark:text-rose-400">
                      Información de multa
                    </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Días de atraso:</p>
                  <p className="text-sm">{selectedLoan.dias_atraso || 0} días hábiles</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Monto:</p>
                  <p className="text-sm">${selectedLoan.multa || 0} MXN</p>
                </div>
              </div>
              {holidayDaysByLoan[selectedLoan.id] > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {holidayDaysByLoan[selectedLoan.id]} {holidayDaysByLoan[selectedLoan.id] === 1 ? 'día feriado descontado' : 'días feriados descontados'} del cálculo
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {selectedLoan.status === "atrasado" 
                  ? "La multa se incrementará hasta la devolución del libro" 
                  : "Multa aplicada en la devolución"}
              </p>
                  </div>
                )}
            </div>
        <DialogFooter className="flex justify-between items-center border-t pt-3">
          <p className="text-xs text-muted-foreground">
            {selectedLoan.status === "renovado" && 
              `Renovaciones: ${selectedLoan.renewalCount} de 2`
            }
          </p>
          <div className="flex gap-2">
            {/* Botón de renovar (solo para préstamos activos y con renovaciones disponibles) */}
            {selectedLoan.status === "activo" && selectedLoan.renewalCount < 2 && (
              <Button 
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600"
                onClick={() => {
                  setShowDetailsDialog(false);
                  handleRenewal(selectedLoan);
                }}
              >
                <RotateCw className="mr-2 h-3.5 w-3.5" />
                Renovar
            </Button>
            )}
            
            {/* Botón de marcar como devuelto (para préstamos activos, renovados o atrasados) */}
            {(selectedLoan.status === "activo" || selectedLoan.status === "renovado" || selectedLoan.status === "atrasado") && (
              <Button 
                size="sm"
                onClick={() => {
                  setShowDetailsDialog(false);
                  handleReturn(selectedLoan);
                }}
              >
                <BookCheck className="mr-2 h-3.5 w-3.5" />
                Devolver
              </Button>
            )}
            
            {/* Botón de marcar como perdido (para préstamos activos, renovados o atrasados) */}
            {(selectedLoan.status === "activo" || selectedLoan.status === "renovado" || selectedLoan.status === "atrasado") && (
              <Button 
                variant="outline"
                size="sm"
                className="border-rose-200 text-rose-600"
                onClick={() => {
                  setShowDetailsDialog(false);
                  setSelectedLoan(selectedLoan);
                  setShowReplacementDialog(true);
                }}
              >
                <AlertTriangle className="mr-2 h-3.5 w-3.5" />
                Perdido
              </Button>
            )}
          </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          <AlertDialog
            open={showReplacementDialog}
            onOpenChange={setShowReplacementDialog}
          >
        <AlertDialogContent>
          <AlertDialogHeader>
                <AlertDialogTitle>Marcar libro como perdido</AlertDialogTitle>
            <AlertDialogDescription>
                  ¿Estás seguro de que deseas marcar este libro como perdido?
                  Esto afectará el inventario de la biblioteca.
            </AlertDialogDescription>
          </AlertDialogHeader>
              <div className="bg-muted rounded-md p-3 text-sm">
                <div className="flex flex-col gap-1">
                  <p>
                    <span className="font-medium">Libro:</span> {selectedLoan.book}
                  </p>
                  <p>
                    <span className="font-medium">Usuario:</span> {selectedLoan.user}
                  </p>
                  <p>
                    <span className="font-medium">Prestado:</span> {formatDate(selectedLoan.loanDate).date}
                  </p>
              </div>
              </div>
          <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
                  className="bg-rose-600 text-white hover:bg-rose-700"
                  onClick={() => handleReplacement(selectedLoan)}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </>
      )}

      {/* Modal para creación de préstamos */}
      <Dialog open={isCreateLoanModalOpen} onOpenChange={setIsCreateLoanModalOpen}>
        <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Crear Nuevo Préstamo
            </DialogTitle>
            <DialogDescription>
              Selecciona un libro y un usuario para registrar un nuevo préstamo
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateLoan} className="space-y-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Selección de libro */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">Libro</h3>
                  </div>
                  {isLoadingBooks && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título, autor, ID o clasificación..."
                    value={newLoanBookSearchTerm}
                    onChange={e => setNewLoanBookSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  {isLoadingBooks && filteredNewLoanBooks.length === 0 ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Buscando libros...</p>
                      </div>
                    </div>
                  ) : searchBookError ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-red-500">{searchBookError}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => searchBooks(1)}
                      >
                        Reintentar
                      </Button>
                    </div>
                  ) : filteredNewLoanBooks.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                      <p className="text-sm text-muted-foreground">No se encontraron libros</p>
                      {newLoanBookSearchTerm && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            setNewLoanBookSearchTerm("");
                            searchBooks(1, "");
                          }}
                        >
                          Limpiar búsqueda
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="max-h-[320px] overflow-y-auto">
                    <div className="divide-y">
                          {filteredNewLoanBooks.map(book => (
                        <div 
                          key={book.id}
                              className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${selectedNewLoanBook?.id === book.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                          onClick={() => handleNewLoanBookSelect(book)}
                        >
                              <div className="flex items-start gap-3">
                                <div className="bg-primary/10 rounded-md p-2 flex-shrink-0">
                                  <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm truncate max-w-[90%]">{book.titulo}</h4>
                                    {book.clasificacion?.toLowerCase() === "literatura" && (
                                      <Badge className="bg-blue-500 text-white text-[9px] h-4">Literatura</Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{book.autor}</div>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                                    <div className="flex items-center gap-1 text-xs">
                                      <span className="text-muted-foreground">ID:</span>
                                      <span className="font-medium">{book.id_libro}</span>
                                    </div>
                                    {book.clasificacion && (
                                      <div className="flex items-center gap-1 text-xs">
                                        <span className="text-muted-foreground">Clasificación:</span>
                                        <span className="font-medium">{book.clasificacion}</span>
                                      </div>
                                    )}
                                  </div>
                              {book.inventario && book.inventario.length > 0 && (
                                    <div className="text-xs mt-2 flex flex-wrap gap-1">
                                  {book.inventario.map(inv => (
                                    <Badge 
                                      key={inv.campus} 
                                          variant={inv.cantidad > 0 ? "outline" : "destructive"} 
                                          className={inv.cantidad > 0 
                                            ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 text-[10px] px-1.5 py-0" 
                                            : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] px-1.5 py-0"
                                          }
                                    >
                                      {inv.campus}: {inv.cantidad}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
                
                      {/* Paginación - igual que en catálogo */}
                      <div className="flex items-center justify-between p-2 border-t bg-muted/30">
                        <div className="text-xs text-muted-foreground">
                          Mostrando {((bookSearchPage - 1) * 8) + 1}-{Math.min(bookSearchPage * 8, totalBookResults)} de {totalBookResults}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline" 
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => searchBooks(bookSearchPage - 1)}
                            disabled={bookSearchPage <= 1 || isLoadingBooks}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => searchBooks(bookSearchPage + 1)}
                            disabled={bookSearchPage * 8 >= totalBookResults || isLoadingBooks}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                      </div>
                      </div>
                    </>
                  )}
                </div>
                
                {selectedNewLoanBook && (
                  <div className="bg-primary/5 p-3 rounded-md border border-primary/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <div className="text-sm font-medium">Libro seleccionado</div>
                      </div>
                    <div className="mt-1 text-sm font-semibold">{selectedNewLoanBook.titulo}</div>
                    <div className="text-xs text-muted-foreground">{selectedNewLoanBook.autor}</div>
                    <div className="flex items-center gap-1 mt-1 text-xs">
                      <span className="text-muted-foreground">Clasificación:</span>
                      <span className="font-medium">{selectedNewLoanBook.clasificacion || "No disponible"}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Selección de usuario */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Usuario</h3>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, matrícula o email..."
                    value={newLoanUserSearchTerm}
                    onChange={e => setNewLoanUserSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="border rounded-md max-h-[180px] overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center items-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : filteredNewLoanUsers.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No se encontraron usuarios
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredNewLoanUsers.slice(0, 8).map(user => (
                        <div 
                          key={user.id}
                          className={`p-2.5 cursor-pointer transition-colors hover:bg-muted ${selectedNewLoanUser?.id === user.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                          onClick={() => handleNewLoanUserSelect(user)}
                        >
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                              <div className="font-medium text-sm">{user.username}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                              {user.Numcontrol && (
                                <div className="flex items-center gap-1 mt-1 text-xs">
                                  <span className="text-muted-foreground">Matrícula:</span>
                                  <span className="font-medium">{user.Numcontrol}</span>
                                </div>
                              )}
                              {user.Carrera && (
                                <div className="flex items-center gap-1 text-xs">
                                  <GraduationCap className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-medium">{user.Carrera}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {selectedNewLoanUser && (
                  <div className="bg-primary/5 p-3 rounded-md border border-primary/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <div className="text-sm font-medium">Usuario seleccionado</div>
                    </div>
                    <div className="mt-1 text-sm font-semibold">{selectedNewLoanUser.username}</div>
                    {selectedNewLoanUser.Numcontrol && (
                      <div className="flex items-center gap-1 mt-1 text-xs">
                        <span className="text-muted-foreground">Matrícula:</span>
                        <span className="font-medium">{selectedNewLoanUser.Numcontrol}</span>
                      </div>
                    )}
                    {selectedNewLoanUser.Carrera && (
                      <div className="flex items-center gap-1 mt-1 text-xs">
                        <GraduationCap className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{selectedNewLoanUser.Carrera}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Detalles del préstamo */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Detalles del préstamo</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanDate" className="text-sm">Fecha de Préstamo</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newLoanDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newLoanDate ? format(newLoanDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newLoanDate}
                        onSelect={(date) => {
                          if (date) {
                            setNewLoanDate(date);
                            // Si la fecha de devolución es anterior a la nueva fecha de préstamo,
                            // actualizarla a 14 días después de la nueva fecha de préstamo
                            if (newLoanReturnDate && newLoanReturnDate < date) {
                              setNewLoanReturnDate(addDays(date, 14));
                            }
                          }
                        }}
                        initialFocus
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="returnDate" className="text-sm">Fecha de Devolución</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newLoanReturnDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newLoanReturnDate ? format(newLoanReturnDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newLoanReturnDate}
                        onSelect={(date) => {
                          if (date) {
                            setNewLoanReturnDate(date);
                          }
                        }}
                        initialFocus
                        disabled={(date) => {
                          if (!newLoanDate) return true;
                          const minDate = new Date(newLoanDate);
                          const maxDate = addDays(newLoanDate, 30);
                          return date < minDate || date > maxDate;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {newLoanDate && newLoanReturnDate && (
                    <p className="text-xs text-muted-foreground">
                      Duración del préstamo: <span className="font-medium">{Math.ceil((newLoanReturnDate.getTime() - newLoanDate.getTime()) / (1000 * 60 * 60 * 24))} días</span>
                    </p>
                  )}
              </div>
              
              <div className="space-y-2">
                  <Label htmlFor="campus" className="text-sm flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" /> Campus de Origen
                  </Label>
                <Select 
                  value={newLoanCampus} 
                  onValueChange={setNewLoanCampus}
                  disabled={availableCampus.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el campus" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCampus.length === 0 ? (
                      <SelectItem value="no_disponible" disabled>
                        No hay campus con disponibilidad
                      </SelectItem>
                    ) : (
                      availableCampus.map(campus => (
                        <SelectItem key={campus.campus} value={campus.campus}>
                          {campus.campus} - Disponibles: {campus.cantidad}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {availableCampus.length === 0 && selectedNewLoanBook && (
                    <p className="text-xs text-rose-500">
                    Este libro no tiene ejemplares disponibles
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Notas (opcional)
                  </Label>
                <Textarea
                  id="notes"
                  placeholder="Añade notas relevantes sobre este préstamo..."
                  value={newLoanNotes}
                  onChange={e => setNewLoanNotes(e.target.value)}
                    className="h-[80px] resize-none"
                />
                </div>
              </div>
            </div>
            
            {/* Acciones */}
            <div className="flex justify-end space-x-2 pt-3 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateLoanModalOpen(false)}
                disabled={isCreatingLoan}
                type="button"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!selectedNewLoanBook || !selectedNewLoanUser || !newLoanCampus || isCreatingLoan || availableCampus.length === 0}
                className="gap-2"
              >
                {isCreatingLoan ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <BookCheck className="h-4 w-4" />
                Crear Préstamo
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Renovación */}
      <Dialog open={showRenewalDialog} onOpenChange={setShowRenewalDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCw className="h-5 w-5 text-blue-500" />
              Renovar Préstamo
            </DialogTitle>
            <DialogDescription>
              Confirma la nueva fecha de devolución para extender el préstamo
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            {selectedLoan && (
              <div className="space-y-4">
                {/* Información del libro */}
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">{selectedLoan.book}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Clasificación: {
                          allBooks.find(book => 
                            book.id.toString() === selectedLoan.bookId.toString() || 
                            book.id_libro === selectedLoan.bookId.toString()
                          )?.clasificacion || "No disponible"
                        }
                      </p>
                </div>
                </div>
                </div>
                
                {/* Información del usuario */}
                <div className="bg-slate-50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">{selectedLoan.user}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        <GraduationCap className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{selectedLoan.userCarrera || "Sin carrera"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{selectedLoan.userNumControl}</p>
                    </div>
                  </div>
                </div>
                
                {/* Fechas */}
                <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label className="text-xs flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                      Fecha de devolución actual
                    </Label>
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-md p-2 flex items-center">
                  <p className="text-sm font-medium">{formatDate(selectedLoan.returnDate).date}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      Nueva fecha de devolución
                    </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal h-9",
                            !renewalDate && "text-muted-foreground",
                            renewalDate && "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                        )}
                      >
                          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {renewalDate ? format(renewalDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={renewalDate || undefined}
                        onSelect={(date) => date && setRenewalDate(date)}
                        initialFocus
                        disabled={(date) => {
                          if (!selectedLoan) return true;
                          const minDate = new Date();
                          const maxDate = addDays(new Date(), 30);
                          return date < minDate || date > maxDate;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                </div>
                
                {/* Resumen */}
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-md p-3">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium text-sm flex items-center gap-1">
                      <RefreshCw className="h-4 w-4 text-blue-500" />
                      Información de renovación
                    </p>
                    {/* Visualización del estado de renovaciones */}
                    <div className="flex items-center gap-1">
                      <div className={`h-2 w-2 rounded-full ${selectedLoan.renewalCount >= 1 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-2 w-2 rounded-full ${selectedLoan.renewalCount >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    </div>
                  </div>
                  
                  {/* Estado de renovaciones y reglas */}
                  <div className="space-y-2">
                    <p className="text-xs flex items-center gap-1">
                      <RotateCw className="h-3 w-3 text-blue-500" />
                      <span>
                        Renovaciones: <span className="font-medium">{selectedLoan.renewalCount} de {
                          // Libros con clasificación literatura tienen 2 renovaciones, el resto 1
                          (allBooks.find(book => 
                            book.id.toString() === selectedLoan.bookId.toString() || 
                            book.id_libro === selectedLoan.bookId.toString()
                          )?.clasificacion || "").toLowerCase() === "literatura" ? "2" : "1"
                        }</span>
                      </span>
                    </p>
                    
                    {/* Mensaje específico según la clasificación */}
                    {(allBooks.find(book => 
                      book.id.toString() === selectedLoan.bookId.toString() || 
                      book.id_libro === selectedLoan.bookId.toString()
                    )?.clasificacion || "").toLowerCase() === "literatura" ? (
                      selectedLoan.renewalCount === 0 ? (
                        <p className="text-xs text-blue-600">Primera renovación disponible</p>
                      ) : selectedLoan.renewalCount === 1 ? (
                        <p className="text-xs text-amber-600">Esta será la última renovación permitida</p>
                      ) : (
                        <p className="text-xs text-rose-600">No hay más renovaciones disponibles</p>
                      )
                    ) : (
                      selectedLoan.renewalCount === 0 ? (
                        <p className="text-xs text-amber-600">Esta será la única renovación permitida</p>
                      ) : (
                        <p className="text-xs text-rose-600">No hay más renovaciones disponibles</p>
                      )
                    )}
                    
                    {/* Tiempo extendido */}
                    {renewalDate && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {renewalDate && selectedLoan ? (
                          <span>
                            Tiempo extendido: <span className="font-medium">
                              {Math.ceil((renewalDate.getTime() - new Date(selectedLoan.returnDate).getTime()) / (1000 * 60 * 60 * 24))} días
                            </span>
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRenewalDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmRenewal}
              disabled={!renewalDate || (selectedLoan ? (() => {
                // Buscar el libro de manera más segura
                const bookInfo = allBooks.find(book => {
                  const bookIdMatch = book.id?.toString() === selectedLoan.bookId?.toString();
                  const bookIdLibroMatch = book.id_libro?.toString() === selectedLoan.bookId?.toString();
                  return bookIdMatch || bookIdLibroMatch;
                });
                
                // Determinar límite de renovaciones de manera más robusta
                const clasificacion = bookInfo?.clasificacion?.toLowerCase() || "";
                const esLiteratura = clasificacion.includes("literatura");
                const maxRenovaciones = esLiteratura ? 2 : 1;
                
                // Verificar si ya alcanzó el límite
                return (selectedLoan.renewalCount || 0) >= maxRenovaciones;
              })() : true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RotateCw className="mr-2 h-4 w-4" />
              Confirmar Renovación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Gestión de días feriados */}
      <Dialog open={showHolidayModal} onOpenChange={(open) => {
        // Si se está cerrando el modal (estaba abierto y ahora se cierra)
        if (!open && showHolidayModal && selectedLoan) {
          // Calcular los días feriados aplicables al préstamo seleccionado
          const holidayCount = calcularDiasFeriados(selectedLoan);
          
          // Verificar si hay cambios
          const originalHolidayCount = holidayDaysByLoan[selectedLoan.id] || 0;
          const hasHolidayChanged = holidayCount !== originalHolidayCount;
          
          // Actualizar el estado local solo si hay cambios
          if (hasHolidayChanged) {
            setHolidayDaysByLoan(prev => ({
              ...prev,
              [selectedLoan.id]: holidayCount
            }));
            
            // Recalcular la multa
            const dueDate = new Date(selectedLoan.returnDate);
            const today = new Date();
            const daysLate = loanService.calculateBusinessDays(dueDate, today);
            const adjustedDaysLate = Math.max(0, daysLate - holidayCount);
            const fine = adjustedDaysLate * 10;
            
            // Verificar si la multa ha cambiado
            const originalFine = selectedLoan.multa || 0;
            const originalDaysLate = selectedLoan.dias_atraso || 0;
            const hasFineChanged = fine !== originalFine || adjustedDaysLate !== originalDaysLate;
            
            if (hasFineChanged) {
              // Actualizar el préstamo seleccionado
              setSelectedLoan({
                ...selectedLoan,
                multa: fine,
                dias_atraso: adjustedDaysLate
              });
              
              // Actualizar también la lista principal de préstamos
              setLoans(prevLoans => 
                prevLoans.map(loan => 
                  loan.id === selectedLoan.id 
                    ? { ...loan, multa: fine, dias_atraso: adjustedDaysLate }
                    : loan
                )
              );
              
              // Sincronizar con el backend
              loanService.syncFineWithBackend(
                selectedLoan.id,
                selectedLoan.documentId,
                holidayCount
              ).then(fineDetails => {
                // Solo notificar al usuario si hubo cambios
                toast({
                  description: `Se han aplicado ${holidayCount} días feriados al cálculo de multa.`,
                });
                
                // Actualizar todas las multas, pero no mostrar notificación adicional
                calculateAllFines().then(() => {});
              }).catch(error => {
                console.error("Error al sincronizar multa con el backend:", error);
              });
            }
          }
        } else if (!open && showHolidayModal) {
          // Si se cierra el modal pero no hay préstamo seleccionado, actualizar todas las multas
          calculateAllFines().then(() => {});
        }
        
        // Actualizar el estado del modal
        setShowHolidayModal(open);
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarX className="h-5 w-5 text-rose-500" />
              Días feriados y suspensiones
            </DialogTitle>
            <DialogDescription>
              Selecciona los días que son feriados o suspensiones. Estos se descontarán automáticamente del cálculo de multas.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loadingHolidays ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="mb-4 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Haz clic en una fecha para marcarla o desmarcarla como feriado
                  </p>
                </div>
                
                <div className="flex justify-center w-full">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleCalendarSelect}
                    className="rounded-md border"
                    components={{
                      DayContent: renderCalendarDay
                    }}
                    disabled={(date) => {
                      // Deshabilitar sábados (día 6) y domingos (día 0)
                      const dayOfWeek = date.getDay();
                      return isHolidayUpdating || dayOfWeek === 0 || dayOfWeek === 6;
                    }}
                    locale={es}
                    weekStartsOn={0} // 0 = domingo, 1 = lunes (por defecto)
                    formatters={{
                      formatCaption: (date, options) => {
                        const month = format(date, 'LLLL', { locale: es });
                        const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
                        return `${capitalizedMonth} ${format(date, 'yyyy')}`;
                      }
                    }}
                  />
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <BadgeX className="h-4 w-4 text-rose-500" />
                    <span>Días feriados marcados: {holidays.length}</span>
                  </div>
                  
                  {holidays.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>Las multas se calcularán excluyendo automáticamente estos días.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowHolidayModal(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PrestamosPage() {
  const [isMounted, setIsMounted] = useState(false);

  // Evitar el error de hidratación usando useEffect para renderizar después de montado
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Si el componente no está montado, devolver un div vacío para evitar errores de hidratación
  if (!isMounted) {
    return <div className="min-h-screen"></div>;
  }

  return (
    <DashboardLayout>
      <PrestamosContent />
    </DashboardLayout>
  );
}