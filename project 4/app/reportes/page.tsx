"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Calendar,
  Download,
  FileBarChart,
  LineChart,
  PieChart,
  BarChart,
  FileText,
  ArrowUpDown,
  ExternalLink,
  User,
  Mail,
  GraduationCap,
  BookMarked,
  BookOpenCheck,
  Clock,
  BookOpenText,
  ArrowLeft,
  CircleDashed,
  RotateCw,
  AlertTriangle,
  CircleCheck,
  CircleX,
  Bookmark,
  Loader2,
  BarChart3,
  BookOpen,
  Users,
  ChevronRight,
  Book,
  BookText,
  Settings2,
  FileDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
} from "recharts";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import { ReportFilters } from "@/components/reports/report-filters";
import { ReportExport } from "@/components/reports/report-export";
import { DateRange } from "react-day-picker";

// Importar loanService para obtener los datos de préstamos
import { loanService, Loan } from "@/services/loanService";
// Importar fetchAPI para obtener usuarios directamente
import fetchAPI from "@/lib/api";
// Importar useRouter para la navegación
import { useRouter } from 'next/navigation';
// Importar para formatear fecha relativa
import { formatDistanceToNow, parseISO, format, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
// Importar estilos para el efecto glow
import "@/styles/glow-card.css";
// Add these imports at the top
import { useUser } from "@/context/user-context";
import { saveAs } from "file-saver"; // Asegúrate de instalar file-saver
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

// Interfaz para los usuarios obtenidos directamente de la API
interface ApiUser {
  id: number;
  documentId: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  Numcontrol?: string;
  campus?: string;
  Genero?: string;
  Carrera?: string;
  Estado?: string;
  apellido?: string;
}

// Mock data for loan stats
const loanStatsData = [
  { name: "Ene", prestados: 65, devueltos: 45 },
  { name: "Feb", prestados: 59, devueltos: 50 },
  { name: "Mar", prestados: 80, devueltos: 70 },
  { name: "Abr", prestados: 81, devueltos: 60 },
  { name: "May", prestados: 56, devueltos: 45 },
  { name: "Jun", prestados: 55, devueltos: 48 },
  { name: "Jul", prestados: 72, devueltos: 60 },
];

// Nombres de los meses en español
const nombresMeses = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun", 
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

// Mock data for category distribution
const categoryData = [
  { name: "Ingeniería", value: 120 },
  { name: "Ciencias", value: 95 },
  { name: "Matemáticas", value: 75 },
  { name: "Literatura", value: 60 },
  { name: "Historia", value: 45 },
];

// Mock data for popular books
const popularBooksData = [
  { name: "Fundamentos de Programación", value: 42 },
  { name: "Álgebra Lineal", value: 36 },
  { name: "Redes de Computadoras", value: 31 },
  { name: "Cálculo Diferencial", value: 28 },
  { name: "Física para Ingenierías", value: 25 },
];

// Mock data for user activity
const userActivityData = [
  { name: "Lun", activos: 32 },
  { name: "Mar", activos: 40 },
  { name: "Mié", activos: 50 },
  { name: "Jue", activos: 45 },
  { name: "Vie", activos: 60 },
  { name: "Sáb", activos: 25 },
  { name: "Dom", activos: 15 },
];

// Nombres de los días de la semana en español
const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Colors for pie chart
const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 
                'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const CATEGORY_COLORS = ['#2563EB', '#60A8FB', '#3B86F7', '#90C7FE', '#BEDCFE'];

// Componente GlowCard para efecto de tarjeta con brillo
export function GlowCard({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    let angle = Math.atan2(mouseY, mouseX) * (180 / Math.PI);
    angle = (angle + 360) % 360;
    card.style.setProperty("--start", `${angle + 60}`);
  };

  return (
    <div
      ref={ref}
      className="glow-card"
      onMouseMove={handleMouseMove}
      {...props}
    >
      {children}
    </div>
  );
}

// Componente para el skeleton de préstamos
const LoanSkeleton = () => {
  return (
    <div className="flex items-start gap-4 rounded-lg border p-3 animate-pulse">
      <div className="bg-muted p-2 rounded-md">
        <div className="h-4 w-4"></div>
      </div>
      <div className="space-y-3 w-full">
        <div className="h-4 bg-muted rounded-md w-3/4"></div>
        <div className="h-3 bg-muted rounded-md w-2/4"></div>
      </div>
    </div>
  );
};

// Helper function para obtener el badge de estado consistente con la pantalla de préstamos
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

  // Usar el valor predeterminado si el estado no existe en el registro
  const safeStatus = status in styles ? status : "activo";

  return (
    <Badge className={styles[safeStatus]}>
      <div className="flex items-center">
        {icons[safeStatus]}
        {labels[safeStatus]}
      </div>
    </Badge>
  );
};

// Función utilitaria para traer todas las consultas de todas las páginas
async function fetchAllConsultas(): Promise<any[]> {
  let page = 1;
  const pageSize = 1000; // Puedes ajustar este número si tienes muchísimos registros
  let total = 0;
  let todas: any[] = [];

  do {
    const response = await fetchAPI(`/api/consultas?populate[0]=book&populate[1]=user&populate[2]=user.carrera&populate[3]=user.campus&pagination[page]=${page}&pagination[pageSize]=${pageSize}`);
    const data = response.data || [];
    if (page === 1) {
      total = response.meta?.pagination?.total || data.length;
    }
    todas = todas.concat(data);
    page++;
  } while (todas.length < total);

  return todas;
}

// Definir las columnas disponibles
const columnasDisponibles = [
  { id: "id", label: "ID", defaultSelected: true },
  { id: "documentId", label: "DocumentID", defaultSelected: true },
  { id: "fecha", label: "Fecha", defaultSelected: true },
  { id: "ip", label: "IP", defaultSelected: true },
  { id: "user_agent", label: "User Agent", defaultSelected: true },
  { id: "createdAt", label: "Creado", defaultSelected: true },
  { id: "updatedAt", label: "Actualizado", defaultSelected: true },
  { id: "publishedAt", label: "Publicado", defaultSelected: true },
  { id: "book_id", label: "Libro ID", defaultSelected: true },
  { id: "book_id_libro", label: "ID_Libro", defaultSelected: true },
  { id: "book_titulo", label: "Título", defaultSelected: true },
  { id: "book_autor", label: "Autor", defaultSelected: true },
  { id: "book_clasificacion", label: "Clasificación", defaultSelected: true },
  { id: "user_id", label: "Usuario ID", defaultSelected: true },
  { id: "user_username", label: "Nombre", defaultSelected: true },
  { id: "user_apellido", label: "Apellido", defaultSelected: true },
  { id: "user_email", label: "Email", defaultSelected: true },
  { id: "user_numcontrol", label: "Num Control", defaultSelected: true },
  { id: "user_genero", label: "Género", defaultSelected: true },
  { id: "user_carrera", label: "Carrera", defaultSelected: true },
  { id: "user_campus", label: "Campus", defaultSelected: true },
  { id: "user_estado", label: "Estado", defaultSelected: true },
  { id: "user_rol", label: "Rol", defaultSelected: true },
];

// Componente para selección de columnas
function ColumnSelector({ 
  selectedColumns, 
  onColumnsChange 
}: { 
  selectedColumns: string[], 
  onColumnsChange: (columns: string[]) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleColumn = (columnId: string) => {
    const newColumns = selectedColumns.includes(columnId)
      ? selectedColumns.filter(id => id !== columnId)
      : [...selectedColumns, columnId];
    onColumnsChange(newColumns);
  };

  const handleSelectAll = () => {
    onColumnsChange(columnasDisponibles.map(col => col.id));
  };

  const handleDeselectAll = () => {
    onColumnsChange([]);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Settings2 className="h-4 w-4" />
        Seleccionar Columnas
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 rounded-md border bg-background p-4 shadow-lg">
          <div className="mb-4 flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Seleccionar Todo
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll}>
              Deseleccionar Todo
            </Button>
          </div>
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {columnasDisponibles.map((column) => (
              <label
                key={column.id}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  checked={selectedColumns.includes(column.id)}
                  onCheckedChange={() => handleToggleColumn(column.id)}
                />
                <span>{column.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Modificar las funciones de exportación
async function descargarConsultasCSV(dateRange?: DateRange, selectedColumns: string[] = columnasDisponibles.map(col => col.id)) {
  try {
    console.log("Iniciando descarga de CSV...");
    
    // Obtener las consultas actuales del estado
    const consultasActuales = await fetchAllConsultas();
    
    // Filtrar por rango de fechas seleccionado
    const filteredConsultas = consultasActuales.filter((consulta: any) => {
      if (!dateRange?.from && !dateRange?.to) return true;
      const fecha = new Date(consulta.fecha || consulta.createdAt);
      const fechaLocal = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
      const fromLocal = dateRange?.from ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate()) : null;
      const toLocal = dateRange?.to ? new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate()) : null;
      
      if (fromLocal && fechaLocal < fromLocal) return false;
      if (toLocal && fechaLocal > toLocal) return false;
      return true;
    });

    // Función para formatear fechas
    const formatearFecha = (fechaStr: string) => {
      if (!fechaStr) return "";
      const fecha = new Date(fechaStr);
      return fecha.toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/Mexico_City'
      });
    };

    // Obtener los encabezados seleccionados
    const encabezados = columnasDisponibles
      .filter(col => selectedColumns.includes(col.id))
      .map(col => col.label);

    // Procesar los datos a CSV
    const filas = filteredConsultas.map((consulta: any) => {
      const book = consulta.book || {};
      const user = consulta.user || {};
      
      // Lógica para carrera y campus
      let carrera = "";
      if (user.carrera) {
        if (typeof user.carrera === 'object' && user.carrera !== null) {
          carrera = user.carrera.attributes?.Nombre || user.carrera.Nombre || '';
        } else if (typeof user.carrera === 'string') {
          carrera = user.carrera;
        }
      }

      let campus = "";
      if (user.campus) {
        if (typeof user.campus === 'object' && user.campus !== null) {
          campus = user.campus.attributes?.Nombre || user.campus.Nombre || '';
        } else if (typeof user.campus === 'string') {
          campus = user.campus;
        }
      }

      // Mapeo de valores según las columnas seleccionadas
      const valores: { [key: string]: string } = {
        id: consulta.id,
        documentId: consulta.documentId || "",
        fecha: formatearFecha(consulta.fecha || consulta.createdAt),
        ip: consulta.ip || "",
        user_agent: consulta.user_agent || "",
        createdAt: formatearFecha(consulta.createdAt),
        updatedAt: formatearFecha(consulta.updatedAt),
        publishedAt: formatearFecha(consulta.publishedAt),
        book_id: book.id || "",
        book_id_libro: book.id_libro || "",
        book_titulo: book.titulo || "",
        book_autor: book.autor || "",
        book_clasificacion: book.clasificacion || "",
        user_id: user.id || "",
        user_username: user.username || "",
        user_email: user.email || "",
        user_numcontrol: user.Numcontrol || "",
        user_genero: user.Genero || "",
        user_carrera: carrera,
        user_campus: campus,
        user_estado: user.Estado || "",
        user_rol: user.rol || "",
        user_apellido: user.apellido || ""
      };

      // Asegurar el orden correcto de las columnas seleccionadas
      return selectedColumns.map(colId => {
        // Buscar la definición de la columna para obtener el label correcto si es necesario
        const columna = columnasDisponibles.find(col => col.id === colId);
        // Usar el colId para obtener el valor del objeto valores
        return valores[colId];
      });
    });

    const csv = [encabezados, ...filas]
      .map((row) => row.map((val: any) => `"${val}"`).join(","))
      .join("\n");

    // Descargar el archivo
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const filenameDatePart = formatFilenameDateRange(dateRange);
    saveAs(blob, `reporte_${filenameDatePart}.csv`);
    console.log("CSV generado exitosamente");
  } catch (error: any) {
    console.error("Error al generar CSV:", error);
    let errorMessage = "Error al generar el archivo CSV.";
    if (error?.message) {
      errorMessage += ` ${error.message}`;
    }
    alert(errorMessage);
  }
}

// Modificar la función de exportación a Excel de manera similar
async function descargarConsultasExcel(dateRange?: DateRange, selectedColumns: string[] = columnasDisponibles.map(col => col.id)) {
  try {
    console.log("Iniciando descarga de Excel...");
    
    // Obtener las consultas actuales del estado
    const consultasActuales = await fetchAllConsultas();
    
    // Filtrar por rango de fechas seleccionado
    const filteredConsultas = consultasActuales.filter((consulta: any) => {
      if (!dateRange?.from && !dateRange?.to) return true;
      const fecha = new Date(consulta.fecha || consulta.createdAt);
      const fechaLocal = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
      const fromLocal = dateRange?.from ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate()) : null;
      const toLocal = dateRange?.to ? new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate()) : null;
      
      if (fromLocal && fechaLocal < fromLocal) return false;
      if (toLocal && fechaLocal > toLocal) return false;
      return true;
    });

    // Función para formatear fechas
    const formatearFecha = (fechaStr: string) => {
      if (!fechaStr) return "";
      const fecha = new Date(fechaStr);
      return fecha.toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/Mexico_City'
      });
    };
    
    // Obtener campus y carreras para referencia
    const campusRes = await fetch('http://localhost:1337/api/campuses?populate=*');
    const campusData = await campusRes.json();
    const campuses = campusData.data || campusData;
    
    const careerRes = await fetch('http://localhost:1337/api/carreras?populate=campus');
    const careerData = await careerRes.json();
    const careers = careerData.data || careerData;

    // Procesar los datos para Excel
    const filas = filteredConsultas.map((consulta: any) => {
      const book = consulta.book || {};
      const user = consulta.user || {};

      // Lógica para carrera y campus
      let carrera = "";
      if (user.carrera) {
        if (typeof user.carrera === 'object' && user.carrera !== null) {
          carrera = user.carrera.attributes?.Nombre || user.carrera.Nombre || '';
        } else if (typeof user.carrera === 'string') {
          carrera = user.carrera;
        }
      }

      let campus = "";
      if (user.campus) {
        if (typeof user.campus === 'object' && user.campus !== null) {
          campus = user.campus.attributes?.Nombre || user.campus.Nombre || '';
        } else if (typeof user.campus === 'string') {
          campus = user.campus;
        }
      }

      // Mapeo de valores según las columnas seleccionadas
      const valores: { [key: string]: string } = {
        id: consulta.id,
        documentId: consulta.documentId || "",
        fecha: formatearFecha(consulta.fecha || consulta.createdAt),
        ip: consulta.ip || "",
        user_agent: consulta.user_agent || "",
        createdAt: formatearFecha(consulta.createdAt),
        updatedAt: formatearFecha(consulta.updatedAt),
        publishedAt: formatearFecha(consulta.publishedAt),
        book_id: book.id || "",
        book_id_libro: book.id_libro || "",
        book_titulo: book.titulo || "",
        book_autor: book.autor || "",
        book_clasificacion: book.clasificacion || "",
        user_id: user.id || "",
        user_username: user.username || "",
        user_email: user.email || "",
        user_numcontrol: user.Numcontrol || "",
        user_genero: user.Genero || "",
        user_carrera: carrera,
        user_campus: campus,
        user_estado: user.Estado || "",
        user_rol: user.rol || "",
        user_apellido: user.apellido || ""
      };

      // Crear objeto solo con las columnas seleccionadas en el orden correcto
      const fila: { [key: string]: string } = {};
      selectedColumns.forEach(colId => {
        const columna = columnasDisponibles.find(col => col.id === colId);
        if (columna) {
          // Usar el label de la columna como clave y el valor del objeto valores
          fila[columna.label] = valores[colId];
        }
      });

      return fila;
    });

    // Crear el archivo Excel
    const worksheet = XLSX.utils.json_to_sheet(filas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Consultas");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const filenameDatePart = formatFilenameDateRange(dateRange);
    saveAs(blob, `reporte_${filenameDatePart}.xlsx`);
    console.log("Excel generado exitosamente");
  } catch (error: any) {
    console.error("Error al generar Excel:", error);
    let errorMessage = "Error al generar el archivo Excel.";
    if (error?.message) {
      errorMessage += ` ${error.message}`;
    }
    alert(errorMessage);
  }
}

const formatFilenameDateRange = (dateRange?: DateRange) => {
  const from = dateRange?.from;
  const to = dateRange?.to;

  const formatDatePart = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  };

  if (from && to) {
    return `${formatDatePart(from)}_a_${formatDatePart(to)}`;
  } else if (from) {
    return `Desde_${formatDatePart(from)}`;
  } else if (to) {
    return `Hasta_${formatDatePart(to)}`;
  } else {
    return 'completo';
  }
};

// Función para generar informe oficial
async function generarInformeOficial(dateRange?: DateRange) {
  try {
    console.log('Iniciando generación de informe...');
    // Obtener datos de consultas
    const response = await fetchAPI('/api/consultas?populate=*');
    const consultas = response.data || [];

    // Obtener datos de libros
    const librosResponse = await fetchAPI('/api/books?populate=inventories');
    const libros = librosResponse.data || [];
    const totalLibrosCatalogo = librosResponse.meta?.pagination?.total || libros.length;

    // Obtener datos de usuarios
    const usuariosResponse = await fetchAPI('/api/users');
    const usuarios = Array.isArray(usuariosResponse.data) && usuariosResponse.data.length > 0
      ? usuariosResponse.data
      : (Array.isArray(usuariosResponse) ? usuariosResponse : []);

    // Obtener datos de préstamos
    const prestamosResponse = await fetchAPI('/api/loans?populate=*');
    const prestamos = prestamosResponse.data || [];

    // Cálculo de estadísticas
    const librosSet = new Set();
    const usuariosSet = new Set();
    let hombres = 0;
    let mujeres = 0;
    let fechas: Date[] = [];
    let librosPerdidos = 0;

    // Calcular libros perdidos
    prestamos.forEach((prestamo: any) => {
      if (prestamo.estado === 'perdido') {
        librosPerdidos++;
      }
    });

    // Calcular usuarios activos
    const usuariosActivos = usuarios.filter((user: any) => {
      const estado = (user.Estado || user.attributes?.Estado || '').toLowerCase();
      return estado === 'activo';
    });
    
    const porcentajeUsuariosActivos = usuarios.length > 0 
      ? Math.round((usuariosActivos.length / usuarios.length) * 100) 
      : 0;

    consultas.forEach((consulta: any) => {
      // Libro único
      const libro = consulta.attributes?.book?.data?.id ||
                    consulta.attributes?.book?.data?.attributes?.id ||
                    consulta.book?.id || consulta.book;
      if (libro) librosSet.add(libro);

      // Usuario único
      const usuario = consulta.attributes?.user?.data?.id ||
                      consulta.attributes?.user?.data?.attributes?.id ||
                      consulta.user?.id || consulta.user;
      if (usuario) usuariosSet.add(usuario);

      // Género
      const genero = consulta.attributes?.user?.data?.attributes?.genero ||
                     consulta.user?.genero || consulta.user?.Genero || '';
      if (typeof genero === 'string') {
        if (genero.toLowerCase().includes('hombre') || genero.toLowerCase().includes('masculino')) hombres++;
        if (genero.toLowerCase().includes('mujer') || genero.toLowerCase().includes('femenino')) mujeres++;
      }

      // Fechas
      const fecha = consulta.attributes?.createdAt || consulta.createdAt;
      if (fecha) {
        const f = new Date(fecha);
        if (!isNaN(f.getTime())) fechas.push(f);
      }
    });

    // Fechas de primera y última consulta
    let fechaPrimera = 'N/A';
    let fechaUltima = 'N/A';
    if (fechas.length > 0) {
      const primera = fechas.reduce((a, b) => a < b ? a : b);
      const ultima = fechas.reduce((a, b) => a > b ? a : b);
      fechaPrimera = primera.toLocaleDateString('es-MX');
      fechaUltima = ultima.toLocaleDateString('es-MX');
    }

    // Obtener nombre del usuario autenticado
    let nombreUsuario = '';
    try {
      const userStr = localStorage.getItem('bibliotech-user');
      if (userStr) {
        const user = JSON.parse(userStr);
        nombreUsuario = user.username || user.name || '';
      }
    } catch {}

    // Crear el documento
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;

    // Encabezado institucional
    doc.addImage('https://i.ibb.co/kggfMBJ2/ECD.png', 'PNG', margin, margin, pageWidth - (margin * 2), 30);

    // Encabezado superior derecho: Instituto Tecnológico de Tijuana y bloque de fecha/asunto
    doc.setFontSize(11);
    const instText = 'Instituto Tecnológico de Tijuana';
    const instTextWidth = doc.getTextWidth(instText);
    let yEncabezado = 48;
    doc.setFont('helvetica', 'italic');
    doc.text(instText, pageWidth - margin - instTextWidth, yEncabezado);
    yEncabezado += 10;

    // Fecha actual en formato largo
    const fechaActual = new Date();
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const fechaTexto = `Tijuana, Baja California,`;
    const fechaResaltada = `${fechaActual.getDate()}/${meses[fechaActual.getMonth()]}/${fechaActual.getFullYear()}`;
    const fechaTextoWidth = doc.getTextWidth(fechaTexto + ' ');
    const fechaResaltadaWidth = doc.getTextWidth(fechaResaltada);
    // Imprimir 'Tijuana, Baja California,'
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0,0,0);
    doc.text(fechaTexto, pageWidth - margin - fechaTextoWidth - fechaResaltadaWidth - 2, yEncabezado);
    // Imprimir la fecha resaltada en recuadro negro
    doc.setFillColor(0,0,0);
    doc.setTextColor(255,255,255);
    doc.rect(pageWidth - margin - fechaResaltadaWidth, yEncabezado - 4, fechaResaltadaWidth + 4, 6, 'F');
    doc.text(fechaResaltada, pageWidth - margin - fechaResaltadaWidth + 2, yEncabezado);
    doc.setTextColor(0,0,0);
    yEncabezado += 6;

    // Asunto: normal + asunto resaltado
    const asuntoLabel = 'Asunto:';
    const asuntoTexto = 'Informe de Estadísticas del Centro de Información';
    const asuntoLabelWidth = doc.getTextWidth(asuntoLabel + ' ');
    const asuntoTextoWidth = doc.getTextWidth(asuntoTexto);
    // Imprimir 'Asunto:'
    doc.text(asuntoLabel, pageWidth - margin - asuntoLabelWidth - asuntoTextoWidth - 2, yEncabezado);
    // Imprimir asunto resaltado en recuadro negro
    doc.setFillColor(0,0,0);
    doc.setTextColor(255,255,255);
    doc.rect(pageWidth - margin - asuntoTextoWidth, yEncabezado - 4, asuntoTextoWidth + 4, 6, 'F');
    doc.text(asuntoTexto, pageWidth - margin - asuntoTextoWidth + 2, yEncabezado);
    doc.setTextColor(0,0,0);
    yEncabezado += 6;

    // Bloque de destinatario en negritas
    let yDestinatario = yEncabezado + 6;
    doc.setFont('helvetica', 'bold');
    doc.text('JOSÉ ANTONIO AMADOR', margin, yDestinatario);
    yDestinatario += 7;
    doc.text('JEFE DEL ÁREA DE CENTROS DE INFORMACIÓN', margin, yDestinatario);
    yDestinatario += 7;
    doc.text('PRESENTE', margin, yDestinatario);
    yDestinatario += 10;

    // Cuerpo del oficio
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Sirva la presente para enviarle un cordial saludo y para presentar las estadísticas actualizadas del Centro de Información, mismas que a continuación enlisto.', margin, yDestinatario, {maxWidth: pageWidth - margin*2});

    // Estadísticas (formato claro)
    let y = yDestinatario + 20;
    const labelX = margin;
    const valueX = margin + 100;
    const salto = 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Cantidad total de libros impresos:', labelX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${totalLibrosCatalogo.toLocaleString('es-MX')}`, valueX, y);
    y += salto;
    doc.setFont('helvetica', 'bold');
    doc.text('Total de libros consultados:', labelX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${librosSet.size}`, valueX, y);
    y += salto;
    doc.setFont('helvetica', 'bold');
    doc.text('Total de visitas a la biblioteca digital:', labelX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${consultas.length}`, valueX, y);
    y += salto;
    doc.setFont('helvetica', 'bold');
    doc.text('Total de libros perdidos:', labelX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${librosPerdidos}`, valueX, y);
    y += salto;
    doc.setFont('helvetica', 'bold');
    doc.text('Porcentaje de usuarios activos:', labelX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${porcentajeUsuariosActivos}%`, valueX, y);
    y += salto;
    doc.setFont('helvetica', 'bold');
    doc.text('Cantidad total de consultas:', labelX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${consultas.length}`, valueX, y);
    y += salto;
    doc.setFont('helvetica', 'bold');
    doc.text('Cantidad de usuarios que realizaron consultas:', labelX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${usuariosSet.size}`, valueX, y);
    y += salto;
    doc.setFont('helvetica', 'bold');
    doc.text('Cantidad de usuarios hombres:', labelX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${hombres}`, valueX, y);
    y += salto;
    doc.setFont('helvetica', 'bold');
    doc.text('Cantidad de usuarios mujeres:', labelX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${mujeres}`, valueX, y);
    y += salto;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha de primera consulta:', labelX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${fechaPrimera}`, valueX, y);
    y += salto;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha de última consulta:', labelX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${fechaUltima}`, valueX, y);
    y += 2 * salto;

    // Agregar línea sobre el rango del informe
    const rangoInformeTexto = `Este informe abarca el período: ${formatDisplayDateRange(dateRange)}.`;
    doc.text(rangoInformeTexto, margin, y, {maxWidth: pageWidth - margin * 2});
    y += salto;
    
    // Párrafo de cierre
    doc.text('Sin más por el momento, quedo de usted para cualquier duda o aclaración.', margin, y, {maxWidth: pageWidth - margin * 2});
    y += 2 * salto;

    // Firma institucional alineada a la izquierda y con formato de referencia
    doc.setFont('helvetica', 'bold');
    doc.text('A T E N T A M E N T E', margin, y);
    y += salto;
    doc.setFont('helvetica', 'italic');
    doc.text('Excelencia en Educación Tecnológica®', margin, y);
    y += salto;
    doc.text('Por una Juventud Integrada al Desarrollo de México®', margin, y);
    // No sumar salto aquí para que la siguiente línea quede pegada
    doc.setFont('helvetica', 'bold');
    doc.text('CONSUELO FABIOLA FRAUSTO TRUJILLO', margin, y + salto);
    y += salto * 2;
    doc.text('JEFA DE DEPARTAMENTO DE CENTRO DE INFORMACIÓN', margin, y);
    y += salto;

    // Pie de página institucional
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.addImage('https://i.ibb.co/S4v1RCdx/PDP.png', 'PNG', margin, pageHeight - 30, pageWidth - (margin * 2), 30);

    // Guardar el documento
    doc.save('informe_consultas.pdf');
    console.log('Informe generado exitosamente');
  } catch (error) {
    console.error('Error al generar el informe:', error);
    alert('Error al generar el informe. Por favor, intente nuevamente.');
  }
}

// 1. Inventario Completo
async function descargarInventarioCompleto() {
  try {
    let page = 1;
    const pageSize = 1000;
    let total = 0;
    let libros: any[] = [];
    do {
      const response = await fetchAPI(`/api/books?populate=inventories&pagination[page]=${page}&pagination[pageSize]=${pageSize}`);
      const data = response.data || [];
      if (page === 1) {
        total = response.meta?.pagination?.total || data.length;
      }
      libros = libros.concat(data);
      page++;
    } while (libros.length < total);

    const filas: any[] = [];
    libros.forEach((libro: any) => {
      const attrs = libro.attributes || libro;
      const inventarios = attrs.inventories?.data || attrs.inventories || [];
      if (inventarios.length === 0) {
        filas.push({
          "ID": libro.id || attrs.id || '',
          "ID_Libro": attrs.id_libro || '',
          "Título": attrs.titulo || '',
          "Autor": attrs.autor || '',
          "Clasificación": attrs.clasificacion || '',
          "Campus": '',
          "Cantidad": '',
          "Creado": attrs.createdAt || '',
          "Actualizado": attrs.updatedAt || '',
          "Publicado": attrs.publishedAt || ''
        });
      } else {
        inventarios.forEach((inv: any) => {
          const invAttrs = inv.attributes || inv;
          filas.push({
            "ID": libro.id || attrs.id || '',
            "ID_Libro": attrs.id_libro || '',
            "Título": attrs.titulo || '',
            "Autor": attrs.autor || '',
            "Clasificación": attrs.clasificacion || '',
            "Campus": invAttrs.Campus || '',
            "Cantidad": invAttrs.Cantidad || '',
            "Creado": attrs.createdAt || '',
            "Actualizado": attrs.updatedAt || '',
            "Publicado": attrs.publishedAt || ''
          });
        });
      }
    });
    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "inventario_completo.xlsx");
  } catch (error) {
    alert("Error al descargar el inventario");
  }
}

// 2. Préstamos Mensuales
async function descargarPrestamosMensuales(tipo: 'csv' | 'excel', dateRange?: DateRange, selectedColumns: string[] = columnasDisponibles.map(col => col.id)) {
  try {
    // Usar populate para usuario, usuario.carrera, usuario.campus
    const response = await fetchAPI('/api/loans?populate[0]=usuario&populate[1]=usuario.carrera&populate[2]=usuario.campus&populate[3]=book');
    const loans = response.data || [];
    // Filtrar por rango de fechas seleccionado
    const from = dateRange?.from ? new Date(dateRange.from) : null;
    const to = dateRange?.to ? new Date(dateRange.to) : null;
    const prestamosFiltrados = loans.filter((loan: any) => {
      const fecha = new Date(loan.fecha_prestamo || loan.attributes?.fecha_prestamo);
      if (from && to) {
        return fecha >= from && fecha <= to;
      }
      return true;
    });
    // Obtener campus y carreras para referencia
    const campusRes = await fetch('http://localhost:1337/api/campuses?populate=*');
    const campusData = await campusRes.json();
    const campuses = campusData.data || campusData;
    const careerRes = await fetch('http://localhost:1337/api/carreras?populate=campus');
    const careerData = await careerRes.json();
    const careers = careerData.data || careerData;
    // Procesar los datos según las columnas seleccionadas
    const filas = prestamosFiltrados.map((loan: any) => {
      const attrs = loan.attributes || loan;
      const book = attrs.book?.data?.attributes || attrs.book || {};
      const user = attrs.usuario?.data?.attributes || attrs.usuario || {};
      // Lógica para carrera y campus
      let carrera = "";
      if (user.carrera) {
        if (typeof user.carrera === 'object' && user.carrera !== null) {
          carrera = user.carrera.attributes?.Nombre || user.carrera.Nombre || '';
        } else if (typeof user.carrera === 'string' || typeof user.carrera === 'number') {
          const careerObj = careers.find((c: any) => {
            const careerId = c.id?.toString() || c.attributes?.id?.toString();
            return careerId === user.carrera.toString();
          });
          carrera = careerObj?.attributes?.Nombre || careerObj?.Nombre || user.carrera;
        }
      }
      let campus = "";
      if (user.campus) {
        if (typeof user.campus === 'object' && user.campus !== null) {
          campus = user.campus.attributes?.Nombre || user.campus.Nombre || '';
        } else if (typeof user.campus === 'string' || typeof user.campus === 'number') {
          const campusObj = campuses.find((c: any) => {
            const campusId = c.id?.toString() || c.attributes?.id?.toString();
            return campusId === user.campus.toString();
          });
          campus = campusObj?.attributes?.Nombre || campusObj?.Nombre || user.campus;
        }
      }
      // Extraer género, estado y rol
      const genero = user.Genero || user.genero || '';
      const estado = user.Estado || user.estado || '';
      const rol = user.rol || '';
      // Mapeo de valores según las columnas seleccionadas
      const valores: { [key: string]: string } = {
        id: loan.id || attrs.id || '',
        documentId: attrs.book?.data?.id || book.id || '',
        fecha: attrs.fecha_prestamo || '',
        book_titulo: book.titulo || '',
        book_autor: book.autor || '',
        book_clasificacion: book.clasificacion || '',
        user_username: user.username || '',
        user_apellido: user.apellido || '',
        user_numcontrol: user.Numcontrol || '',
        user_carrera: carrera,
        user_campus: campus,
        user_genero: genero,
        user_estado: estado,
        user_rol: rol,
        estado: attrs.estado || '',
        createdAt: attrs.createdAt || '',
        updatedAt: attrs.updatedAt || '',
        publishedAt: attrs.publishedAt || '',
        fecha_devolucion_esperada: attrs.fecha_devolucion_esperada || '',
        fecha_devolucion_real: attrs.fecha_devolucion_real || '',
        notas: attrs.notas || ''
      };
      // Crear objeto solo con las columnas seleccionadas en el orden correcto
      const fila: { [key: string]: string } = {};
      selectedColumns.forEach(colId => {
        const columna = columnasDisponibles.find(col => col.id === colId);
        if (columna) {
          fila[columna.label] = valores[colId];
        }
      });
      return fila;
    });
    if (tipo === 'csv') {
      // Exportar CSV
      const encabezados = columnasDisponibles.filter(col => selectedColumns.includes(col.id)).map(col => col.label);
      const csv = [encabezados, ...filas.map((fila: any) => encabezados.map(label => `"${fila[label] || ''}"`))]
        .map(row => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      saveAs(blob, `prestamos_mensuales.csv`);
    } else {
      // Exportar Excel
      const worksheet = XLSX.utils.json_to_sheet(filas);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "PréstamosMensuales");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, `prestamos_mensuales.xlsx`);
    }
  } catch (error) {
    alert("Error al descargar préstamos mensuales");
  }
}

// 3. Usuarios por Carrera
async function descargarUsuariosPorCarrera() {
  try {
    // Obtener todos los usuarios con paginación
    let page = 1;
    const pageSize = 1000;
    let usuarios: any[] = [];
    let data: any[] = [];
    do {
      const response = await fetchAPI(`/api/users?populate[0]=carrera&populate[1]=campus&pagination[page]=${page}&pagination[pageSize]=${pageSize}`);
      data = response || [];
      usuarios = usuarios.concat(data);
      page++;
    } while (data.length === pageSize);
    // Obtener campus y carreras para referencia
    const campusRes = await fetch('http://localhost:1337/api/campuses?populate=*');
    const campusData = await campusRes.json();
    const campuses = campusData.data || campusData;
    const careerRes = await fetch('http://localhost:1337/api/carreras?populate=campus');
    const careerData = await careerRes.json();
    const careers = careerData.data || careerData;
    const filas = usuarios.map((user: any) => {
      // Lógica mejorada para carrera
      let carrera = "";
      if (user.carrera) {
        if (typeof user.carrera === 'object' && user.carrera !== null) {
          carrera = user.carrera.attributes?.Nombre || 
                   user.carrera.Nombre || 
                   user.carrera.data?.attributes?.Nombre ||
                   user.carrera.data?.Nombre || '';
        } else if (typeof user.carrera === 'string' || typeof user.carrera === 'number') {
          const careerObj = careers.find((c: any) => {
            const careerId = c.id?.toString() || c.attributes?.id?.toString();
            return careerId === user.carrera.toString();
          });
          carrera = careerObj?.attributes?.Nombre || 
                   careerObj?.Nombre || 
                   careerObj?.data?.attributes?.Nombre ||
                   careerObj?.data?.Nombre || 
                   user.carrera;
        }
      }
      // Lógica mejorada para campus
      let campus = "";
      if (user.campus) {
        if (typeof user.campus === 'object' && user.campus !== null) {
          campus = user.campus.attributes?.Nombre || 
                  user.campus.Nombre || 
                  user.campus.data?.attributes?.Nombre ||
                  user.campus.data?.Nombre || '';
        } else if (typeof user.campus === 'string' || typeof user.campus === 'number') {
          const campusObj = campuses.find((c: any) => {
            const campusId = c.id?.toString() || c.attributes?.id?.toString();
            return campusId === user.campus.toString();
          });
          campus = campusObj?.attributes?.Nombre || 
                  campusObj?.Nombre || 
                  campusObj?.data?.attributes?.Nombre ||
                  campusObj?.data?.Nombre || 
                  user.campus;
        }
      }
      return {
        "ID": user.id,
        "Username": user.username,
        "Apellidos": user.apellido || '',
        "Email": user.email,
        "Num Control": user.Numcontrol || '',
        "Carrera": carrera,
        "Campus": campus,
        "Estado": user.Estado || '',
        "Rol": user.rol || '',
        "Creado": user.createdAt || '',
        "Actualizado": user.updatedAt || '',
        "Publicado": user.publishedAt || ''
      };
    });
    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "UsuariosCarrera");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "usuarios_por_carrera.xlsx");
  } catch (error) {
    alert("Error al descargar usuarios por carrera");
  }
}

// 4. Devoluciones Pendientes
async function descargarDevolucionesPendientes() {
  try {
    const response = await fetchAPI('/api/loans?populate[0]=book&populate[1]=usuario&populate[2]=usuario.carrera&populate[3]=usuario.campus');
    const loans = response.data || [];
    const pendientes = loans.filter((loan: any) => {
      const estado = loan.estado || loan.attributes?.estado;
      return estado === 'atrasado';
    });

    // Obtener campus y carreras para referencia
    const campusRes = await fetch('http://localhost:1337/api/campuses?populate=*');
    const campusData = await campusRes.json();
    const campuses = campusData.data || campusData;
    
    const careerRes = await fetch('http://localhost:1337/api/carreras?populate=campus');
    const careerData = await careerRes.json();
    const careers = careerData.data || careerData;

    const filas = pendientes.map((loan: any) => {
      const attrs = loan.attributes || loan;
      const book = attrs.book?.data?.attributes || attrs.book || {};
      const user = attrs.usuario?.data?.attributes || attrs.usuario || {};

      // Lógica mejorada para carrera
      let carrera = "";
      if (user.carrera) {
        if (typeof user.carrera === 'object' && user.carrera !== null) {
          carrera = user.carrera.attributes?.Nombre || 
                   user.carrera.Nombre || 
                   user.carrera.data?.attributes?.Nombre ||
                   user.carrera.data?.Nombre || '';
        } else if (typeof user.carrera === 'string' || typeof user.carrera === 'number') {
          const careerObj = careers.find((c: any) => {
            const careerId = c.id?.toString() || c.attributes?.id?.toString();
            return careerId === user.carrera.toString();
          });
          carrera = careerObj?.attributes?.Nombre || 
                   careerObj?.Nombre || 
                   careerObj?.data?.attributes?.Nombre ||
                   careerObj?.data?.Nombre || 
                   user.carrera;
        }
      }

      // Lógica mejorada para campus
      let campus = "";
      if (user.campus) {
        if (typeof user.campus === 'object' && user.campus !== null) {
          campus = user.campus.attributes?.Nombre || 
                  user.campus.Nombre || 
                  user.campus.data?.attributes?.Nombre ||
                  user.campus.data?.Nombre || '';
        } else if (typeof user.campus === 'string' || typeof user.campus === 'number') {
          const campusObj = campuses.find((c: any) => {
            const campusId = c.id?.toString() || c.attributes?.id?.toString();
            return campusId === user.campus.toString();
          });
          campus = campusObj?.attributes?.Nombre || 
                  campusObj?.Nombre || 
                  campusObj?.data?.attributes?.Nombre ||
                  campusObj?.data?.Nombre || 
                  user.campus;
        }
      }

      return {
        "ID Préstamo": loan.id || attrs.id || '',
        "ID Libro": attrs.book?.data?.id || book.id || '',
        "Título": book.titulo || '',
        "Autor": book.autor || '',
        "Clasificación": book.clasificacion || '',
        "Usuario": user.username || '',
        "Apellidos": user.apellido || '',
        "Num Control": user.Numcontrol || '',
        "Carrera": carrera,
        "Campus": campus,
        "Fecha Préstamo": attrs.fecha_prestamo || '',
        "Fecha Devolución Esperada": attrs.fecha_devolucion_esperada || '',
        "Fecha Devolución Real": attrs.fecha_devolucion_real || '',
        "Estado": attrs.estado || '',
        "Notas": attrs.notas || ''
      };
    });
    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DevolucionesPendientes");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "devoluciones_pendientes.xlsx");
  } catch (error) {
    alert("Error al descargar devoluciones pendientes");
  }
}

// 5. Top Libros del Semestre
async function descargarTopLibrosSemestre(dateRange?: DateRange) {
  try {
    const response = await fetchAPI('/api/loans?populate=*');
    const loans = response.data || [];
    // Filtrar por rango de fechas seleccionado
    let prestamosFiltrados = loans;
    if (dateRange?.from && dateRange?.to) {
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      prestamosFiltrados = loans.filter((loan: any) => {
      const fecha = new Date(loan.fecha_prestamo || loan.attributes?.fecha_prestamo);
        return fecha >= from && fecha <= to;
    });
    }
    // Contar préstamos por libro
    const prestamosPorLibro = new Map();
    prestamosFiltrados.forEach((loan: any) => {
      const book = loan.book?.data?.attributes || loan.book || {};
      const bookId = book.id || loan.book?.data?.id;
      if (bookId) {
        const count = prestamosPorLibro.get(bookId) || 0;
        prestamosPorLibro.set(bookId, count + 1);
      }
    });
    // Convertir a array y ordenar por cantidad de préstamos
    const librosOrdenados = Array.from(prestamosPorLibro.entries())
      .map(([bookId, count]) => {
        const loan = prestamosFiltrados.find((l: any) => 
          (l.book?.data?.id || l.book?.id) === bookId
        );
        const book = loan?.book?.data?.attributes || loan?.book || {};
        return {
          "ID Libro": bookId,
          "Título": book.titulo || '',
          "Autor": book.autor || '',
          "Clasificación": book.clasificacion || '',
          "Préstamos": count
        };
      })
      .sort((a, b) => b["Préstamos"] - a["Préstamos"])
      .slice(0, 50); // Top 50 libros
    const ws = XLSX.utils.json_to_sheet(librosOrdenados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TopLibros");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "top_libros_periodo.xlsx");
  } catch (error) {
    alert("Error al descargar top libros del periodo");
  }
}

// 6. Historial de Devoluciones
async function descargarHistorialDevoluciones(dateRange?: DateRange) {
  try {
    const response = await fetchAPI('/api/loans?populate[0]=book&populate[1]=usuario&populate[2]=usuario.carrera&populate[3]=usuario.campus');
    const loans = response.data || [];
    // Filtrar solo devoluciones y por rango de fechas
    let devoluciones = loans.filter((loan: any) => {
      const estado = loan.estado || loan.attributes?.estado;
      return estado === 'devuelto';
    });
    if (dateRange?.from && dateRange?.to) {
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      devoluciones = devoluciones.filter((loan: any) => {
        const fecha = new Date(loan.fecha_devolucion_real || loan.attributes?.fecha_devolucion_real);
        return fecha >= from && fecha <= to;
      });
    }
    // Obtener campus y carreras para referencia
    const campusRes = await fetch('http://localhost:1337/api/campuses?populate=*');
    const campusData = await campusRes.json();
    const campuses = campusData.data || campusData;
    const careerRes = await fetch('http://localhost:1337/api/carreras?populate=campus');
    const careerData = await careerRes.json();
    const careers = careerData.data || careerData;
    const filas = devoluciones.map((loan: any) => {
      const attrs = loan.attributes || loan;
      const book = attrs.book?.data?.attributes || attrs.book || {};
      const user = attrs.usuario?.data?.attributes || attrs.usuario || {};
      // Lógica mejorada para carrera
      let carrera = "";
      if (user.carrera) {
        if (typeof user.carrera === 'object' && user.carrera !== null) {
          carrera = user.carrera.attributes?.Nombre || 
                   user.carrera.Nombre || 
                   user.carrera.data?.attributes?.Nombre ||
                   user.carrera.data?.Nombre || '';
        } else if (typeof user.carrera === 'string' || typeof user.carrera === 'number') {
          const careerObj = careers.find((c: any) => {
            const careerId = c.id?.toString() || c.attributes?.id?.toString();
            return careerId === user.carrera.toString();
          });
          carrera = careerObj?.attributes?.Nombre || 
                   careerObj?.Nombre || 
                   careerObj?.data?.attributes?.Nombre ||
                   careerObj?.data?.Nombre || 
                   user.carrera;
        }
      }
      // Lógica mejorada para campus del usuario
      let campus = "";
      if (user.campus) {
        if (typeof user.campus === 'object' && user.campus !== null) {
          campus = user.campus.attributes?.Nombre || 
                  user.campus.Nombre || 
                  user.campus.data?.attributes?.Nombre ||
                  user.campus.data?.Nombre || '';
        } else if (typeof user.campus === 'string' || typeof user.campus === 'number') {
          const campusObj = campuses.find((c: any) => {
            const campusId = c.id?.toString() || c.attributes?.id?.toString();
            return campusId === user.campus.toString();
          });
          campus = campusObj?.attributes?.Nombre || 
                  campusObj?.Nombre || 
                  campusObj?.data?.attributes?.Nombre ||
                  campusObj?.data?.Nombre || 
                  user.campus;
        }
      }
      // Campus del libro/inventario
      let campusLibro = "";
      if (book.inventories && Array.isArray(book.inventories.data) && book.inventories.data.length > 0) {
        // Si hay varios inventarios, concatenar los campus
        campusLibro = book.inventories.data.map((inv: any) => {
          const invAttrs = inv.attributes || inv;
          return invAttrs.Campus || invAttrs.campus || '';
        }).filter(Boolean).join(", ");
      } else if (book.Campus || book.campus) {
        campusLibro = book.Campus || book.campus;
      }
      return {
        "ID Préstamo": loan.id || attrs.id || '',
        "ID Libro": attrs.book?.data?.id || book.id || '',
        "Título": book.titulo || '',
        "Autor": book.autor || '',
        "Clasificación": book.clasificacion || '',
        "Usuario": user.username || '',
        "Apellidos": user.apellido || '',
        "Num Control": user.Numcontrol || '',
        "Carrera": carrera,
        "Campus": campus,
        "Campus del Libro": campusLibro,
        "Fecha Préstamo": attrs.fecha_prestamo || '',
        "Fecha Devolución Esperada": attrs.fecha_devolucion_esperada || '',
        "Fecha Devolución Real": attrs.fecha_devolucion_real || '',
        "Estado": attrs.estado || '',
        "Notas": attrs.notas || ''
      };
    });
    console.log('Filas para historial de devoluciones:', filas);
    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "HistorialDevoluciones");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "historial_devoluciones.xlsx");
  } catch (error) {
    alert("Error al descargar historial de devoluciones");
  }
}

// Función para transformar usuario igual que en la tabla de usuarios
function transformarUsuarioParaTabla(user: any) {
  let status = "activo";
  if (user.Estado) {
    status = user.Estado.toLowerCase();
  } else if (user.blocked) {
    status = "inactivo";
  } else if (!user.confirmed) {
    status = "pendiente";
  }
  return {
    id: user.id,
    fullName: user.username || 'Sin nombre',
    apellido: user.apellido || '',
    campus: user.campus || undefined,
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
  };
}

// Función para descargar todos los usuarios en Excel (igual que la tabla de usuarios)
async function descargarUsuariosExcel() {
  try {
    const response = await fetchAPI('/api/users?populate=*');
    const users = response.data || [];
    const filas = users.map((user: any) => {
      const attrs = user.attributes || user;
      return {
        "ID": user.id || attrs.id || '',
        "Username": attrs.username || '',
        "Apellido": attrs.apellido || '',
        "Email": attrs.email || '',
        "Numcontrol": attrs.Numcontrol || '',
        "Genero": attrs.Genero || '',
        "Estado": attrs.Estado || '',
        "Rol": attrs.rol || '',
        "Carrera": attrs.carrera?.data?.attributes?.Nombre || attrs.carrera?.Nombre || '',
        "Campus": attrs.campus?.data?.attributes?.Nombre || attrs.campus?.Nombre || '',
        "Creado": attrs.createdAt ? new Date(attrs.createdAt).toLocaleString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Mexico_City' }) : '',
        "Actualizado": attrs.updatedAt ? new Date(attrs.updatedAt).toLocaleString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Mexico_City' }) : '',
        "Publicado": attrs.publishedAt ? new Date(attrs.publishedAt).toLocaleString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Mexico_City' }) : '',
        "Confirmado": attrs.confirmed || false,
        "Bloqueado": attrs.blocked || false,
        "Provider": attrs.provider || '',
        "Reset Password Token": attrs.resetPasswordToken || '',
        "Confirmation Token": attrs.confirmationToken || '',
        "Loans": attrs.loans?.data?.length || 0,
        "Consultas": attrs.consultas?.data?.length || 0,
        "Entradas": attrs.entradas?.data?.length || 0
      };
    });
    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "usuarios_completos.xlsx");
    console.log("Excel de usuarios generado exitosamente");
  } catch (error) {
    alert("Error al descargar usuarios");
  }
}

// Helper function to format date range for display
const formatDisplayDateRange = (dateRange?: DateRange) => {
  const from = dateRange?.from;
  const to = dateRange?.to;

  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };

  if (from && to) {
    // Check if both dates are the same day
    if (from.toDateString() === to.toDateString()) {
      return from.toLocaleDateString('es-MX', options);
    } else {
      return `${from.toLocaleDateString('es-MX', options)} - ${to.toLocaleDateString('es-MX', options)}`;
    }
  } else if (from) {
    return `Desde ${from.toLocaleDateString('es-MX', options)}`;
  } else if (to) {
    return `Hasta ${to.toLocaleDateString('es-MX', options)}`;
  } else {
    return 'Rango Completo';
  }
};

// 7. Entradas (Logins y Consultas Presenciales)
async function descargarEntradasExcel(dateRange?: DateRange) {
  try {
    let page = 1;
    const pageSize = 1000;
    let total = 0;
    let entradas: any[] = [];
    do {
      const response = await fetchAPI(`/api/entradas?populate[0]=Usuario&populate[1]=Bibliotecario&populate[2]=Campus&populate[3]=Usuario.carrera&populate[4]=Usuario.campus&populate[5]=Bibliotecario.carrera&populate[6]=Bibliotecario.campus&pagination[page]=${page}&pagination[pageSize]=${pageSize}`);
      const data = response.data || [];
      if (page === 1) {
        total = response.meta?.pagination?.total || data.length;
      }
      entradas = entradas.concat(data);
      page++;
    } while (entradas.length < total);

    // Filtrar por rango de fechas
    const filteredEntradas = entradas.filter((entrada: any) => {
      const fecha = new Date(entrada.Fecha || entrada.attributes?.Fecha);
      if (!dateRange?.from && !dateRange?.to) return true;
      const from = dateRange?.from ? new Date(dateRange.from) : null;
      const to = dateRange?.to ? new Date(dateRange.to) : null;
      if (from && fecha < from) return false;
      if (to && fecha > to) return false;
      return true;
    });

    const filas = filteredEntradas.map((entrada: any) => {
      const attrs = entrada.attributes || entrada;
      // Usuario
      const usuario = attrs.Usuario?.data?.attributes || attrs.Usuario || {};
      // Bibliotecario
      const bibliotecario = attrs.Bibliotecario?.data?.attributes || attrs.Bibliotecario || {};
      // Campus
      let campus = attrs.Campus?.data?.attributes?.Nombre || attrs.Campus?.Nombre || '';
      return {
        "ID": entrada.id || attrs.id || '',
        "Tipo": attrs.Tipo || '',
        "Usuario": usuario.username || '',
        "ID Usuario": attrs.Usuario?.data?.id || usuario.id || '',
        "Email Usuario": usuario.email || '',
        "Apellido Usuario": usuario.apellido || '',
        "Numcontrol Usuario": usuario.Numcontrol || '',
        "Genero Usuario": usuario.Genero || '',
        "Estado Usuario": usuario.Estado || '',
        "Rol Usuario": usuario.rol || '',
        "Carrera Usuario": usuario.carrera?.data?.attributes?.Nombre || usuario.carrera?.Nombre || '',
        "Campus Usuario": usuario.campus?.data?.attributes?.Nombre || usuario.campus?.Nombre || '',
        "Bibliotecario": bibliotecario.username || '',
        "ID Bibliotecario": attrs.Bibliotecario?.data?.id || bibliotecario.id || '',
        "Email Bibliotecario": bibliotecario.email || '',
        "Apellido Bibliotecario": bibliotecario.apellido || '',
        "Numcontrol Bibliotecario": bibliotecario.Numcontrol || '',
        "Genero Bibliotecario": bibliotecario.Genero || '',
        "Estado Bibliotecario": bibliotecario.Estado || '',
        "Rol Bibliotecario": bibliotecario.rol || '',
        "Carrera Bibliotecario": bibliotecario.carrera?.data?.attributes?.Nombre || bibliotecario.carrera?.Nombre || '',
        "Campus Bibliotecario": bibliotecario.campus?.data?.attributes?.Nombre || bibliotecario.campus?.Nombre || '',
        "Fecha": attrs.Fecha ? new Date(attrs.Fecha).toLocaleString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Mexico_City' }) : '',
        "Campus": campus
      };
    });
    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Entradas");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const filenameDatePart = formatFilenameDateRange(dateRange);
    saveAs(blob, `entradas_${filenameDatePart}.xlsx`);
    console.log("Excel de entradas generado exitosamente");
  } catch (error) {
    alert("Error al descargar entradas");
  }
}

export default function ReportesPage() {
  // Todos los hooks primero en un orden consistente
  const router = useRouter();
  const { permissions, isAuthenticated, loading: userLoading } = useUser();
  
  // Añadir nuevo estado para las consultas
  const [consultas, setConsultas] = useState<any[]>([]);
  const [isLoadingConsultas, setIsLoadingConsultas] = useState(true);
  
  // Estados para estadísticas y datos de gráficos
  const [prestamoStats, setPrestamoStats] = useState({
    total: 0,
    incremento: "0%"
  });
  const [librosPrestadosStats, setLibrosPrestadosStats] = useState({
    total: 0,
    incremento: "0%"
  });
  const [usuariosActivosStats, setUsuariosActivosStats] = useState({
    total: 0,
    incremento: "0%"
  });
  const [tasaDevolucionStats, setTasaDevolucionStats] = useState({
    porcentaje: 0,
    incremento: "0%"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loanStatsChartData, setLoanStatsChartData] = useState(loanStatsData);
  const [topActiveUsers, setTopActiveUsers] = useState<{ 
    name: string; 
    id: string; 
    career: string; 
    loans: number; 
    lastLoan: string;
    userId: number | string;
  }[]>([]);
  const [userActivityChartData, setUserActivityChartData] = useState(userActivityData);
  
  // Estados para el modal de total préstamos
  const [showTotalPrestamosModal, setShowTotalPrestamosModal] = useState(false);
  const [prestamosMes, setPrestamosMes] = useState<Loan[]>([]);
  const [isLoadingPrestamosMes, setIsLoadingPrestamosMes] = useState(false);
  const [selectedPrestamoMes, setSelectedPrestamoMes] = useState<Loan | null>(null);
  
  // Estados para el modal de libros prestados
  const [showLibrosPrestadosModal, setShowLibrosPrestadosModal] = useState(false);
  const [librosPrestados, setLibrosPrestados] = useState<Loan[]>([]);
  const [isLoadingLibros, setIsLoadingLibros] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Loan | null>(null);
  
  // Estados para el modal de usuarios activos
  const [showUsuariosActivosModal, setShowUsuariosActivosModal] = useState(false);
  const [usuariosActivos, setUsuariosActivos] = useState<ApiUser[]>([]);
  
  // Estados para el usuario seleccionado y sus préstamos
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [selectedUserLoans, setSelectedUserLoans] = useState<Loan[]>([]);
  const [isLoadingLoans, setIsLoadingLoans] = useState(false);
  const [showInventarioModal, setShowInventarioModal] = useState(false);
  const [descargandoInventario, setDescargandoInventario] = useState(false);
  const [showTasaModal, setShowTasaModal] = useState(false);

  // Calcular los totales para el resumen de la tasa de devolución
  const [prestamosDevueltos, setPrestamosDevueltos] = useState(0);
  const [prestamosTotales, setPrestamosTotales] = useState(0);

  // Añadir nuevo estado para el rango de fechas
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: firstDayOfMonth,
    to: lastDayOfMonth,
  });
  // Estado global para los préstamos
  const [loans, setLoans] = useState<Loan[]>([]);
  // Estado para el tipo de rango seleccionado
  const [quickSelect, setQuickSelect] = useState<string>("month");

  // Añadir estado para las columnas seleccionadas
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columnasDisponibles.filter(col => col.defaultSelected).map(col => col.id)
  );

  // Cargar los préstamos una sola vez y guardarlos en loans
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const data = await loanService.getLoans();
        setLoans(data);
        // También puedes calcular aquí los devueltos si quieres
        const devueltos = data.filter((loan: Loan) => loan.estado === 'devuelto').length;
        setPrestamosDevueltos(devueltos);
        setPrestamosTotales(data.length);
      } catch {}
    };
    fetchLoans();
  }, []);

  // Efecto para verificación de permisos
  useEffect(() => {
    if (!userLoading && isAuthenticated && permissions && !permissions.canAccessReportes) {
      router.push('/catalogo');
    }
  }, [permissions, isAuthenticated, userLoading, router]);
  
  // Efecto para animación de fade-in
  useEffect(() => {
    // Añadir la animación de fade-in al CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-fade-in {
        animation: fadeIn 0.5s ease-in-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Efecto para cargar las consultas al inicio
  useEffect(() => {
    const cargarConsultas = async () => {
      try {
        setIsLoadingConsultas(true);
        const consultasData = await fetchAllConsultas();
        setConsultas(consultasData);
      } catch (error) {
        console.error("Error al cargar consultas:", error);
      } finally {
        setIsLoadingConsultas(false);
      }
    };

    if (!userLoading && permissions?.canAccessReportes) {
      cargarConsultas();
    }
  }, [userLoading, permissions]);

  // Efecto para cargar los datos y estadísticas
  useEffect(() => {
    const obtenerEstadisticas = async () => {
      try {
        if (userLoading || !permissions || !permissions.canAccessReportes) {
          return;
        }
        setIsLoading(true);
        // Filtrar préstamos por el rango de fechas seleccionado
        const filteredLoans = loans.filter((loan: Loan) => {
          const fechaPrestamo = new Date(loan.fecha_prestamo);
          return dateRange?.from && dateRange?.to
            ? fechaPrestamo >= dateRange.from && fechaPrestamo <= dateRange.to
            : true;
        });

        // Usar filteredLoans en lugar de loans para todos los cálculos
        const totalPrestamos = filteredLoans.length;
        
        // Calcular el incremento de préstamos (comparar con el mes anterior)
        const mesActual = new Date().getMonth();
        const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
        
        const prestamosEsteMes = filteredLoans.filter(loan => {
          const fechaPrestamo = new Date(loan.fecha_prestamo);
          return fechaPrestamo.getMonth() === mesActual;
        }).length;
        
        const prestamosMesAnterior = filteredLoans.filter(loan => {
          const fechaPrestamo = new Date(loan.fecha_prestamo);
          return fechaPrestamo.getMonth() === mesAnterior;
        }).length;
        
        // Calcular el porcentaje de incremento
        let incrementoPorcentaje = 0;
        if (prestamosMesAnterior > 0) {
          incrementoPorcentaje = Math.round(((prestamosEsteMes - prestamosMesAnterior) / prestamosMesAnterior) * 100);
        }
        
        // Actualizar el estado con los datos calculados
        setPrestamoStats({
          total: totalPrestamos,
          incremento: `${incrementoPorcentaje}`
        });

        // SEGUNDA TARJETA: Libros prestados actualmente
        const librosPrestados = filteredLoans.filter(loan => loan.estado === 'activo').length;
        
        // Calcular el incremento semanal
        const hoy = new Date();
        const unaSemanaAtras = new Date(hoy);
        unaSemanaAtras.setDate(hoy.getDate() - 7);

        const dosSemanaAtras = new Date(hoy);
        dosSemanaAtras.setDate(hoy.getDate() - 14);
        
        const prestamosEstaSemana = filteredLoans.filter(loan => {
          const fechaPrestamo = new Date(loan.fecha_prestamo);
          return fechaPrestamo >= unaSemanaAtras && fechaPrestamo <= hoy && loan.estado === 'activo';
        }).length;
        
        const prestamosSemanaAnterior = filteredLoans.filter(loan => {
          const fechaPrestamo = new Date(loan.fecha_prestamo);
          return fechaPrestamo >= dosSemanaAtras && fechaPrestamo < unaSemanaAtras && loan.estado === 'activo';
        }).length;
        
        let incrementoSemanal = 0;
        if (prestamosSemanaAnterior > 0) {
          incrementoSemanal = Math.round(((prestamosEstaSemana - prestamosSemanaAnterior) / prestamosSemanaAnterior) * 100);
        }
        
        setLibrosPrestadosStats({
          total: librosPrestados,
          incremento: `${incrementoSemanal}`
        });

        // TERCERA TARJETA: Usuarios activos
        try {
          // Obtener usuarios directamente desde la API
          const usuarios: ApiUser[] = await fetchAPI('/api/users');
          
          // Filtrar usuarios con estado "Activo"
          const usuariosActivosList = usuarios.filter((user: ApiUser) => 
            user.Estado === 'Activo'
          );
          
          setUsuariosActivos(usuariosActivosList);
          
          const usuariosActivosCount = usuariosActivosList.length;
          
          // Obtener usuarios creados este mes vs mes anterior para calcular incremento
          const usuariosEsteMes = usuarios.filter((user: ApiUser) => {
            const fechaCreacion = new Date(user.createdAt);
            return fechaCreacion.getMonth() === mesActual && 
                   fechaCreacion.getFullYear() === new Date().getFullYear() &&
                   user.Estado === 'Activo';
          }).length;
          
          const usuariosMesAnterior = usuarios.filter((user: ApiUser) => {
            const fechaCreacion = new Date(user.createdAt);
            return fechaCreacion.getMonth() === mesAnterior && 
                   fechaCreacion.getFullYear() === 
                   (mesAnterior === 11 ? new Date().getFullYear() - 1 : new Date().getFullYear()) &&
                   user.Estado === 'Activo';
          }).length;
          
          // Calcular incremento
          let incrementoUsuarios = 0;
          if (usuariosMesAnterior > 0) {
            incrementoUsuarios = Math.round(((usuariosEsteMes - usuariosMesAnterior) / usuariosMesAnterior) * 100);
          }
          
          setUsuariosActivosStats({
            total: usuariosActivosCount,
            incremento: `${incrementoUsuarios}`
          });
        } catch (userError) {
          console.error("Error al obtener usuarios:", userError);
        }
        
        // CUARTA TARJETA: Tasa de devolución
        // Calcular el porcentaje de préstamos devueltos respecto al total
        const prestamosDevueltos = filteredLoans.filter(loan => loan.estado === 'devuelto').length;
        const prestamosTotales = filteredLoans.length;
        const tasaDevolucion = prestamosTotales > 0 
          ? Math.round((prestamosDevueltos / prestamosTotales) * 100) 
          : 0;
        
        // Calcular la tasa del mes anterior para la comparación
        const prestamosDevueltosMesAnterior = filteredLoans.filter(loan => {
          const fechaDevolucion = new Date(loan.fecha_devolucion_real || loan.updatedAt);
          return fechaDevolucion.getMonth() === mesAnterior && loan.estado === 'devuelto';
        }).length;
        
        const prestamosTotalesMesAnterior = filteredLoans.filter(loan => {
          const fechaPrestamo = new Date(loan.fecha_prestamo);
          return fechaPrestamo.getMonth() === mesAnterior;
        }).length;
        
        const tasaDevolucionMesAnterior = prestamosTotalesMesAnterior > 0 
          ? Math.round((prestamosDevueltosMesAnterior / prestamosTotalesMesAnterior) * 100) 
          : 0;
        
        // Calcular el incremento en la tasa de devolución
        let incrementoTasaDevolucion = 0;
        if (tasaDevolucionMesAnterior > 0) {
          incrementoTasaDevolucion = tasaDevolucion - tasaDevolucionMesAnterior;
        }
        
        setTasaDevolucionStats({
          porcentaje: tasaDevolucion,
          incremento: `${incrementoTasaDevolucion}`
        });
        
        // Procesar datos para el gráfico de préstamos vs devoluciones
        // Si el rango es de 31 días o menos, agrupar por día; si es mayor, agrupar por mes
        let datosGrafico: { name: string; prestados: number; devueltos: number }[] = [];
        if (dateRange?.from && dateRange?.to) {
          let start = new Date(dateRange.from);
          let end = new Date(dateRange.to);
          // Si el rango es solo hoy, incluir también el día anterior
          const isOnlyToday = start.toDateString() === end.toDateString() && start.toDateString() === new Date().toDateString();
          if (isOnlyToday) {
            // Ajustar el rango para incluir ayer y hoy
            start.setDate(start.getDate() - 1);
          }
          // Incluir ambos extremos del rango
          const diffTime = endOfDay(end).getTime() - startOfDay(start).getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
          if (diffDays <= 31) {
            // Agrupar por día
            const datosPorDia: Record<string, { prestados: number, devueltos: number }> = {};
            let current = new Date(start);
            while (current <= end) {
              const key = current.toISOString().slice(0, 10); // yyyy-mm-dd
              datosPorDia[key] = { prestados: 0, devueltos: 0 };
              current.setDate(current.getDate() + 1);
            }
        filteredLoans.forEach((loan: Loan) => {
          const fechaPrestamo = new Date(loan.fecha_prestamo);
              const keyPrestamo = fechaPrestamo.toISOString().slice(0, 10);
              if (datosPorDia[keyPrestamo]) {
                datosPorDia[keyPrestamo].prestados += 1;
              }
          if (loan.estado === 'devuelto' && loan.fecha_devolucion_real) {
            const fechaDevolucion = new Date(loan.fecha_devolucion_real);
                const keyDevolucion = fechaDevolucion.toISOString().slice(0, 10);
                if (datosPorDia[keyDevolucion]) {
                  datosPorDia[keyDevolucion].devueltos += 1;
                }
              }
            });
            datosGrafico = Object.keys(datosPorDia)
              .sort()
              .map(key => {
                const [year, month, day] = key.split('-');
                const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
                const diasCortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                const nombreDia = diasCortos[dateObj.getDay()];
                return {
                  name: `${nombreDia} ${day}/${month}`,
                  prestados: datosPorDia[key].prestados,
                  devueltos: datosPorDia[key].devueltos
                };
              });
              } else {
            // Agrupar por mes (incluyendo el mes anterior)
            const datosPorMes: Record<string, { prestados: number, devueltos: number }> = {};
            // Agregar el mes anterior al inicio del rango
            const prevMonth = new Date(start);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
            const prevKey = `${prevMonth.getFullYear()}-${prevMonth.getMonth()}`;
            datosPorMes[prevKey] = { prestados: 0, devueltos: 0 };
            // Generar todos los meses entre start y end
            let current = new Date(start);
            while (current <= end) {
              const key = `${current.getFullYear()}-${current.getMonth()}`;
              datosPorMes[key] = { prestados: 0, devueltos: 0 };
              current.setMonth(current.getMonth() + 1);
            }
            filteredLoans.forEach((loan: Loan) => {
              const fechaPrestamo = new Date(loan.fecha_prestamo);
              const keyPrestamo = `${fechaPrestamo.getFullYear()}-${fechaPrestamo.getMonth()}`;
              if (datosPorMes[keyPrestamo]) {
                datosPorMes[keyPrestamo].prestados += 1;
              }
              if (loan.estado === 'devuelto' && loan.fecha_devolucion_real) {
                const fechaDevolucion = new Date(loan.fecha_devolucion_real);
                const keyDevolucion = `${fechaDevolucion.getFullYear()}-${fechaDevolucion.getMonth()}`;
                if (datosPorMes[keyDevolucion]) {
                  datosPorMes[keyDevolucion].devueltos += 1;
            }
          }
        });
            datosGrafico = Object.keys(datosPorMes)
              .sort((a, b) => {
                const [ay, am] = a.split('-').map(Number);
                const [by, bm] = b.split('-').map(Number);
                return ay !== by ? ay - by : am - bm;
              })
              .map(key => {
                const [year, month] = key.split('-').map(Number);
                return {
                  name: `${nombresMeses[month]} ${year}`,
                  prestados: datosPorMes[key].prestados,
                  devueltos: datosPorMes[key].devoluciones,
                  activos: datosPorMes[key].prestados + datosPorMes[key].devoluciones
                };
            });
          }
        }
        setLoanStatsChartData(datosGrafico);
        
        // Calcular los usuarios más activos
        try {
          // Crear un mapa para contar los préstamos por usuario
          const userLoanMap: Record<string, { 
            name: string; 
            id: string; 
            career: string; 
            loans: number; 
            lastLoan: Date | null;
            userId: number | string;
          }> = {};
          
          // Procesar todos los préstamos
          filteredLoans.forEach(loan => {
            if (!loan.usuario) return;
            
            const userId = loan.usuario.id?.toString() || '';
            const userName = loan.usuario.username || 'Usuario Desconocido';
            const userApellido = loan.usuario.apellido || '';
            const userFullName = userApellido ? `${userName} ${userApellido}` : userName;
            const userMatricula = loan.usuario.Numcontrol || userId;
            // Obtener carrera correctamente
            let userCareer = '';
            const carrera = loan.usuario.carrera;
            if (typeof carrera === 'object' && carrera !== null) {
              userCareer = carrera.Nombre || carrera.attributes?.Nombre || carrera.data?.attributes?.Nombre || '';
            } else if (typeof carrera === 'string') {
              userCareer = carrera;
            }
            if (!userCareer) userCareer = 'No especificada';
            const loanDate = new Date(loan.fecha_prestamo);
            
            if (!userLoanMap[userId]) {
              userLoanMap[userId] = {
                name: userFullName,
                id: userMatricula,
                career: userCareer,
                loans: 0,
                lastLoan: null,
                userId: loan.usuario.id
              };
            }
            
            // Incrementar el contador de préstamos
            userLoanMap[userId].loans += 1;
            
            // Actualizar la fecha del último préstamo
            if (!userLoanMap[userId].lastLoan || loanDate > userLoanMap[userId].lastLoan) {
              userLoanMap[userId].lastLoan = loanDate;
            }
          });
          
          // Convertir el mapa a un array y ordenar por número de préstamos
          const sortedUsers = Object.values(userLoanMap)
            .sort((a, b) => b.loans - a.loans)
            .map(user => ({
              ...user,
              lastLoan: user.lastLoan ? formatDate(user.lastLoan.toISOString()) : 'N/A'
            }))
            .slice(0, 10); // Obtener solo los 10 primeros
          
          setTopActiveUsers(sortedUsers);
          
        } catch (error) {
          console.error("Error al procesar usuarios más activos:", error);
        }
        
        // Procesar los datos de actividad por día de la semana o por mes
        try {
          const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
          let datosGraficoActividad: { name: string; prestamos: number; devoluciones: number; activos: number }[] = [];
          if (dateRange?.from && dateRange?.to) {
            let start = new Date(dateRange.from);
            let end = new Date(dateRange.to);
            // Si el rango es solo hoy, incluir también el día anterior
            const isOnlyToday = start.toDateString() === end.toDateString() && start.toDateString() === new Date().toDateString();
            if (isOnlyToday) {
              start.setDate(start.getDate() - 1);
            }
            // Incluir ambos extremos del rango
            const diffTime = endOfDay(end).getTime() - startOfDay(start).getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
            // Agrupar por día si el rango es de 31 días o menos, o si cubre exactamente un mes natural
            const isFullMonth = start.getDate() === 1 &&
              (end.getMonth() === start.getMonth()) &&
              (end.getDate() === new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate());
            if (diffDays <= 31 || isFullMonth) {
              // Agrupar por día (mostrar todos los días del rango)
              const actividadPorDia: Record<string, { prestamos: number, devoluciones: number }> = {};
              let current = new Date(start);
              while (current <= end) {
                const key = current.toISOString().slice(0, 10); // yyyy-mm-dd
                actividadPorDia[key] = { prestamos: 0, devoluciones: 0 };
                current.setDate(current.getDate() + 1);
              }
              filteredLoans.forEach(loan => {
                const fechaPrestamo = new Date(loan.fecha_prestamo);
                const keyPrestamo = fechaPrestamo.toISOString().slice(0, 10);
                if (actividadPorDia[keyPrestamo]) {
                  actividadPorDia[keyPrestamo].prestamos += 1;
                }
                if (loan.estado === 'devuelto' && loan.fecha_devolucion_real) {
                  const fechaDevolucion = new Date(loan.fecha_devolucion_real);
                  const keyDevolucion = fechaDevolucion.toISOString().slice(0, 10);
                  if (actividadPorDia[keyDevolucion]) {
                    actividadPorDia[keyDevolucion].devoluciones += 1;
                  }
                }
              });
              datosGraficoActividad = Object.keys(actividadPorDia)
                .sort()
                .map(key => {
                  const [year, month, day] = key.split('-');
                  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
                  const diasCortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                  const nombreDia = diasCortos[dateObj.getDay()];
                  return {
                    name: `${nombreDia} ${day}/${month}`,
                    prestamos: actividadPorDia[key].prestamos,
                    devoluciones: actividadPorDia[key].devoluciones,
                    activos: actividadPorDia[key].prestamos + actividadPorDia[key].devoluciones
                  };
                });
            } else {
              // Agrupar por mes
              const actividadPorMes: Record<string, { prestamos: number, devoluciones: number }> = {};
              // Generar todos los meses entre start y end
              let current = new Date(start.getFullYear(), start.getMonth(), 1);
              const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
              while (current <= endMonth) {
                const key = `${current.getFullYear()}-${current.getMonth()}`;
                actividadPorMes[key] = { prestamos: 0, devoluciones: 0 };
                current.setMonth(current.getMonth() + 1);
              }
          filteredLoans.forEach(loan => {
            const fechaPrestamo = new Date(loan.fecha_prestamo);
                const keyPrestamo = `${fechaPrestamo.getFullYear()}-${fechaPrestamo.getMonth()}`;
                if (actividadPorMes[keyPrestamo]) {
                  actividadPorMes[keyPrestamo].prestamos += 1;
                }
            if (loan.estado === 'devuelto' && loan.fecha_devolucion_real) {
              const fechaDevolucion = new Date(loan.fecha_devolucion_real);
                  const keyDevolucion = `${fechaDevolucion.getFullYear()}-${fechaDevolucion.getMonth()}`;
                  if (actividadPorMes[keyDevolucion]) {
                    actividadPorMes[keyDevolucion].devoluciones += 1;
                  }
                }
              });
              datosGraficoActividad = Object.keys(actividadPorMes)
                .sort((a, b) => {
                  const [ay, am] = a.split('-').map(Number);
                  const [by, bm] = b.split('-').map(Number);
                  return ay !== by ? ay - by : am - bm;
                })
                .map(key => {
                  const [year, month] = key.split('-').map(Number);
                  return {
                    name: `${nombresMeses[month]} ${year}`,
                    prestados: actividadPorMes[key].prestamos,
                    devueltos: actividadPorMes[key].devoluciones,
                    activos: actividadPorMes[key].prestamos + actividadPorMes[key].devoluciones
                  };
                });
            }
          }
          setUserActivityChartData(datosGraficoActividad);
        } catch (error) {
          console.error("Error al procesar datos de actividad por día:", error);
        }
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        // En caso de error, mantener los valores por defecto
      } finally {
        setIsLoading(false);
      }
    };
    
    obtenerEstadisticas();
  }, [userLoading, permissions, dateRange, loans]); // Añadir dateRange como dependencia

  // Resto de funciones del componente (sin cambios)
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleUserClick = async (userId: string | number, userName: string) => {
    try {
      setSelectedUserName(userName);
      setIsLoadingLoans(true);
      
      // Obtener todos los préstamos
      const loans = await loanService.getLoans();
      
      // Filtrar los préstamos del usuario seleccionado
      const userLoans = loans.filter(loan => {
        if (!loan.usuario) return false;
        
        const userIdStr = userId.toString();
        const loanUserId = typeof loan.usuario.id === 'number' || typeof loan.usuario.id === 'string' 
          ? loan.usuario.id.toString() 
          : '';
        const loanNumcontrol = loan.usuario.Numcontrol ? loan.usuario.Numcontrol.toString() : '';
        
        return loanUserId === userIdStr || loanNumcontrol === userIdStr;
      });
      
      setSelectedUserLoans(userLoans);
    } catch (error) {
      console.error("Error al obtener préstamos del usuario:", error);
    } finally {
      setIsLoadingLoans(false);
    }
  };

  const clearSelectedUser = () => {
    setSelectedUserName(null);
    setSelectedUserLoans([]);
  };

  const loadLibrosPrestados = async () => {
    try {
      setIsLoadingLibros(true);
      
      // Obtener préstamos desde el servicio
      const loans = await loanService.getLoans();
      
      // Filtrar solo los préstamos activos
      const activoLoans = loans.filter(loan => loan.estado === 'activo');
      
      setLibrosPrestados(activoLoans);
      setShowLibrosPrestadosModal(true);
    } catch (error) {
      console.error("Error al cargar libros prestados:", error);
    } finally {
      setIsLoadingLibros(false);
    }
  };

  const showBookDetails = (loan: Loan) => {
    setSelectedBook(loan);
  };

  const clearSelectedBook = () => {
    setSelectedBook(null);
  };

  const loadPrestamosMes = async () => {
    try {
      setIsLoadingPrestamosMes(true);
      
      // Obtener todos los préstamos
      const loans = await loanService.getLoans();
      
      // Filtrar préstamos del mes actual
      const hoy = new Date();
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      
      const prestamosDelMes = loans.filter(loan => {
        const fechaPrestamo = new Date(loan.fecha_prestamo);
        return fechaPrestamo >= primerDiaMes && fechaPrestamo <= ultimoDiaMes;
      });
      
      // Ordenar por fecha, más recientes primero
      prestamosDelMes.sort((a, b) => 
        new Date(b.fecha_prestamo).getTime() - new Date(a.fecha_prestamo).getTime()
      );
      
      setPrestamosMes(prestamosDelMes);
      setShowTotalPrestamosModal(true);
    } catch (error) {
      console.error("Error al cargar préstamos del mes:", error);
    } finally {
      setIsLoadingPrestamosMes(false);
    }
  };

  const showPrestamoMesDetails = (loan: Loan) => {
    setSelectedPrestamoMes(loan);
  };

  const clearSelectedPrestamoMes = () => {
    setSelectedPrestamoMes(null);
  };

  // Handler para el botón del inventario
  const handleDescargarInventario = async () => {
    setShowInventarioModal(false);
    setDescargandoInventario(true);
    await descargarInventarioCompleto();
    setDescargandoInventario(false);
  };

  // Crear función para obtener el texto de comparación según quickSelect
  const getComparativeText = (type: string) => {
    switch (type) {
      case "today":
        return "desde ayer";
      case "week":
        return "desde la semana pasada";
      case "month":
        return "desde el mes pasado";
      case "custom":
        return "comparado con el período anterior";
      default:
        return "";
    }
  };

  // Renderizado condicional DESPUÉS de todos los hooks
  if (userLoading || !permissions) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reportes</h2>
          <p className="text-muted-foreground">
            Visualiza estadísticas y reportes del sistema
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            onDateRangeChange={setDateRange}
            onQuickSelectChange={setQuickSelect}
          />
          <ColumnSelector
            selectedColumns={selectedColumns}
            onColumnsChange={setSelectedColumns}
          />
          <Button
            onClick={() => descargarConsultasCSV(dateRange, selectedColumns)}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Exportar CSV
            </Button>
          <Button
            onClick={() => descargarConsultasExcel(dateRange, selectedColumns)}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Exportar Excel
            </Button>
          <Button 
            onClick={() => generarInformeOficial(dateRange)} 
            className="flex items-center gap-2"
          >
              <FileText className="mr-2 h-4 w-4" />
              Generar Informe ({formatDisplayDateRange(dateRange)})
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlowCard
          onClick={loadPrestamosMes}
          tabIndex={0}
          role="button"
          aria-label="Ver préstamos del mes actual"
          style={{ cursor: 'pointer' }}
        >
          <Card className="bg-transparent shadow-none border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Préstamos</CardTitle>
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "Cargando..." : prestamoStats.total}
              </div>
            <p className="text-xs text-muted-foreground">
                {isLoading ? "Calculando..." : `${prestamoStats.incremento.startsWith('-') ? '' : '+'}${prestamoStats.incremento}% ${getComparativeText(quickSelect)}`}
            </p>
          </CardContent>
        </Card>
        </GlowCard>
        
        <GlowCard
          onClick={loadLibrosPrestados}
          tabIndex={0}
          role="button"
          aria-label="Ver libros prestados actualmente"
          style={{ cursor: 'pointer' }}
        >
          <Card className="bg-transparent shadow-none border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Libros Prestados</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "Cargando..." : librosPrestadosStats.total}
              </div>
            <p className="text-xs text-muted-foreground">
                {isLoading ? "Calculando..." : `${librosPrestadosStats.incremento.startsWith('-') ? '' : '+'}${librosPrestadosStats.incremento}% ${getComparativeText(quickSelect)}`}
            </p>
          </CardContent>
        </Card>
        </GlowCard>
        
        <GlowCard
          onClick={() => setShowUsuariosActivosModal(true)}
          tabIndex={0}
          role="button"
          aria-label="Ver detalles de usuarios activos"
          style={{ cursor: 'pointer' }}
        >
          <Card className="bg-transparent shadow-none border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "Cargando..." : usuariosActivosStats.total}
              </div>
            <p className="text-xs text-muted-foreground">
                {isLoading ? "Calculando..." : `${usuariosActivosStats.incremento.startsWith('-') ? '' : '+'}${usuariosActivosStats.incremento}% ${getComparativeText(quickSelect)}`}
            </p>
          </CardContent>
        </Card>
        </GlowCard>
        
        <GlowCard
          onClick={() => setShowTasaModal(true)}
          tabIndex={0}
          role="button"
          aria-label="Ver préstamos devueltos"
          style={{ cursor: 'pointer' }}
        >
          <Card className="bg-transparent shadow-none border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Devolución</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "Cargando..." : `${tasaDevolucionStats.porcentaje}%`}
              </div>
            <p className="text-xs text-muted-foreground">
                {isLoading ? "Calculando..." : `${tasaDevolucionStats.incremento.startsWith('-') ? '' : '+'}${tasaDevolucionStats.incremento}% ${getComparativeText(quickSelect)}`}
            </p>
          </CardContent>
        </Card>
        </GlowCard>
      </div>

      {/* Modal de resumen de tasa de devolución */}
      <Dialog open={showTasaModal} onOpenChange={setShowTasaModal}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <div className="flex flex-col items-center gap-2">
              <BarChart className="h-10 w-10 text-green-500 mb-2" />
              <DialogTitle className="text-2xl font-bold">Tasa de Devolución</DialogTitle>
              <DialogDescription>
                Porcentaje de préstamos devueltos respecto al total de préstamos.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className={`text-4xl font-extrabold ${tasaDevolucionStats.porcentaje >= 70 ? 'text-green-500' : 'text-amber-500'}`}> 
              {tasaDevolucionStats.porcentaje}%
            </div>
            <div className="flex justify-center gap-6">
              <div>
                <div className="text-xs text-muted-foreground">Devueltos</div>
                <div className="font-semibold">{prestamosDevueltos}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Totales</div>
                <div className="font-semibold">{prestamosTotales}</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setShowTasaModal(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 mb-4">
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Préstamos vs Devoluciones
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-sm">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {formatDisplayDateRange(dateRange)}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    <LineChart className="h-3.5 w-3.5 mr-1" />
                    Tendencias
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {isLoading ? (
                      <div className="flex h-full w-full items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                    <AreaChart
                        data={loanStatsChartData}
                      margin={{
                        top: 5,
                        right: 20,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <defs>
                        <linearGradient id="colorPrestados" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorDevueltos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="name" 
                        className="text-xs" 
                        stroke="hsl(var(--muted-foreground))" 
                      />
                      <YAxis 
                        className="text-xs" 
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        labelStyle={{
                          color: "hsl(var(--card-foreground))",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="prestados"
                        name="Préstamos"
                        stroke="hsl(var(--chart-1))"
                        fillOpacity={1}
                        fill="url(#colorPrestados)"
                      />
                      <Area
                        type="monotone"
                        dataKey="devueltos"
                        name="Devoluciones"
                        stroke="hsl(var(--chart-2))"
                        fillOpacity={1}
                        fill="url(#colorDevueltos)"
                      />
                    </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Actividad de Usuarios</CardTitle>
                <CardDescription>
                  {(() => {
                    if (dateRange?.from && dateRange?.to) {
                      const start = new Date(dateRange.from);
                      const end = new Date(dateRange.to);
                      const diffTime = endOfDay(end).getTime() - startOfDay(start).getTime();
                      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
                      const isFullMonth = start.getDate() === 1 &&
                        (end.getMonth() === start.getMonth()) &&
                        (end.getDate() === new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate());
                      // Detectar si es una semana exacta
                      const isFullWeek = diffDays === 7 && start.getDay() === 1 && end.getDay() === 0;
                      if (isFullWeek) {
                        return 'Actividad total (préstamos + devoluciones) por día (vista semanal)';
                      } else if (isFullMonth) {
                        return 'Actividad total (préstamos + devoluciones) por día (vista mensual)';
                      } else if (diffDays <= 31) {
                        return 'Actividad total (préstamos + devoluciones) por día (vista personalizada)';
                      } else {
                        return 'Actividad total (préstamos + devoluciones) por mes';
                      }
                    }
                    return 'Actividad total (préstamos + devoluciones)';
                  })()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {isLoading ? (
                      <div className="flex h-full w-full items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                    <RechartsLineChart
                        data={userActivityChartData}
                      margin={{
                        top: 5,
                        right: 20,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="name" 
                        className="text-xs" 
                        stroke="hsl(var(--muted-foreground))" 
                      />
                      <YAxis 
                        className="text-xs" 
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        labelStyle={{
                          color: "hsl(var(--card-foreground))",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="activos"
                          name="Actividad Total"
                        stroke="hsl(var(--chart-3))"
                        activeDot={{ r: 8 }}
                      />
                    </RechartsLineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios más Activos</CardTitle>
              <CardDescription>
                Top 10 usuarios con mayor actividad de préstamos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <div className="flex items-center space-x-1">
                          <span>Usuario</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <div className="flex items-center space-x-1">
                          <span>ID</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <div className="flex items-center space-x-1">
                          <span>Carrera</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <div className="flex items-center space-x-1">
                          <span>Préstamos</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <div className="flex items-center space-x-1">
                          <span>Último Préstamo</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="h-6 w-28 bg-muted rounded animate-pulse"></div>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="h-4 w-8 bg-muted rounded animate-pulse"></div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                          </td>
                        </tr>
                      ))
                    ) : topActiveUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                          No se encontraron datos de usuarios
                        </td>
                      </tr>
                    ) : (
                      topActiveUsers.map((user, i) => (
                        <tr 
                          key={i} 
                          className="border-b transition-colors hover:bg-muted/50 cursor-pointer" 
                          onClick={() => {
                            setShowUsuariosActivosModal(true);
                            handleUserClick(user.userId, user.name);
                          }}
                        >
                        <td className="p-4 align-middle">{user.name}</td>
                        <td className="p-4 align-middle">{user.id}</td>
                        <td className="p-4 align-middle">{user.career}</td>
                        <td className="p-4 align-middle">
                          <Badge variant="outline">{user.loans}</Badge>
                        </td>
                        <td className="p-4 align-middle">{user.lastLoan}</td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Reportes Predefinidos</CardTitle>
          <CardDescription>
            Reportes comunes para descargar e imprimir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Inventario Completo", description: "Lista completa de todos los libros en el sistema", icon: <FileText className="h-5 w-5" />, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400", onClick: () => setShowInventarioModal(true) },
              { title: `Préstamos en el periodo`, description: `Reporte de préstamos de ${formatDisplayDateRange(dateRange)}`, icon: <FileBarChart className="h-5 w-5" />, color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400", onClick: () => descargarPrestamosMensuales('excel', dateRange, selectedColumns) },
              { title: "Usuarios por Carrera", description: "Distribución de usuarios por carrera", icon: <PieChart className="h-5 w-5" />, color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400", onClick: descargarUsuariosPorCarrera },
              { title: "Devoluciones Pendientes", description: "Préstamos con devolución pendiente", icon: <FileText className="h-5 w-5" />, color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400", onClick: descargarDevolucionesPendientes },
              { title: `Top Libros del periodo`, description: `Libros más prestados en ${formatDisplayDateRange(dateRange)}`, icon: <BarChart className="h-5 w-5" />, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400", onClick: () => descargarTopLibrosSemestre(dateRange) },
              { title: `Historial de Devoluciones`, description: `Devoluciones registradas en ${formatDisplayDateRange(dateRange)}`, icon: <LineChart className="h-5 w-5" />, color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400", onClick: () => descargarHistorialDevoluciones(dateRange) },
              { title: "Usuarios (Excel)", description: "Exporta todos los usuarios como se ven en la tabla", icon: <Users className="h-5 w-5" />, color: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400", onClick: descargarUsuariosExcel },
              { title: "Entradas (Logins y Consultas Presenciales)", description: `Entradas registradas en ${formatDisplayDateRange(dateRange)}`, icon: <FileText className="h-5 w-5" />, color: "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400", onClick: () => descargarEntradasExcel(dateRange) },
            ].map((report, i) => (
              <div key={i} className="flex flex-col border rounded-lg overflow-hidden transition-all hover:shadow-md">
                <div className="p-4 flex items-start gap-4">
                  <div className={`${report.color} p-2 rounded-md`}>
                    {report.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                </div>
                <div className="mt-auto p-4 pt-0 flex justify-end">
                  <Button variant="outline" size="sm" onClick={report.onClick} disabled={descargandoInventario && i === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    {descargandoInventario && i === 0 ? "Descargando..." : "Descargar"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Total Préstamos (Préstamos del mes) */}
      <Dialog open={showTotalPrestamosModal} onOpenChange={(isOpen) => {
        setShowTotalPrestamosModal(isOpen);
        if (!isOpen) clearSelectedPrestamoMes();
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPrestamoMes ? `Detalles del préstamo` : "Préstamos del Mes Actual"}
            </DialogTitle>
            <DialogDescription>
              {selectedPrestamoMes 
                ? "Información detallada del préstamo" 
                : `Libros prestados durante ${new Date().toLocaleString('es-MX', { month: 'long', year: 'numeric' })}`}
            </DialogDescription>
          </DialogHeader>
          
          {/* Vista de lista de préstamos del mes */}
          {!selectedPrestamoMes && (
            <div className="space-y-4 mt-4">
              {isLoadingPrestamosMes ? (
                <>
                  <LoanSkeleton />
                  <LoanSkeleton />
                  <LoanSkeleton />
                </>
              ) : prestamosMes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay préstamos registrados este mes
                </p>
              ) : (
                <div className="animate-fade-in space-y-4">
                  {prestamosMes.map((loan, index) => {
                    // Definir iconos y colores según el estado
                    let IconComponent = BookMarked;
                    let iconColor = 'text-blue-600 dark:text-blue-400';
                    
                    switch (loan.estado) {
                      case 'devuelto':
                        IconComponent = BookOpenCheck;
                        iconColor = 'text-green-600 dark:text-green-400';
                        break;
                      case 'atrasado':
                        IconComponent = Clock;
                        iconColor = 'text-orange-600 dark:text-orange-400';
                        break;
                      case 'perdido':
                        IconComponent = BookOpenText;
                        iconColor = 'text-red-600 dark:text-red-400';
                        break;
                      case 'renovado':
                        IconComponent = RotateCw;
                        iconColor = 'text-blue-600 dark:text-blue-400';
                        break;
                      default:
                        IconComponent = BookMarked;
                        iconColor = 'text-blue-600 dark:text-blue-400';
                    }
                    
                    return (
                      <Card 
                        key={index} 
                        className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                        onClick={() => showPrestamoMesDetails(loan)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <IconComponent className={`h-5 w-5 ${iconColor}`} />
    </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium leading-none">
                                  {loan.book?.titulo || 'Sin título'}
                                </p>
                                {getStatusBadge(loan.estado)}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {loan.book?.autor || 'Autor desconocido'}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">
                                    {loan.usuario?.username || 'Usuario desconocido'}
                                  </p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(loan.fecha_prestamo)}
                                </p>
                              </div>
                              
                              {/* Información adicional del usuario */}
                              {loan.usuario && (
                                <div className="mt-2 space-y-1">
                                  {loan.usuario.Numcontrol && (
                                    <div className="flex items-center gap-1">
                                      <Bookmark className="h-3 w-3 text-muted-foreground" />
                                      <p className="text-xs text-muted-foreground">
                                        Matrícula: {loan.usuario.Numcontrol}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {loan.usuario.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3 text-muted-foreground" />
                                      <p className="text-xs text-muted-foreground">
                                        {loan.usuario.email}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {loan.usuario.Carrera && (
                                    <div className="flex items-center gap-1">
                                      <GraduationCap className="h-3 w-3 text-muted-foreground" />
                                      <p className="text-xs text-muted-foreground">
                                        {loan.usuario.Carrera}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              
              <DialogFooter>
                <Button 
                  onClick={() => {
                    setShowTotalPrestamosModal(false);
                    router.push('/prestamos');
                  }}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver en "Préstamos"
                </Button>
              </DialogFooter>
            </div>
          )}
          
          {/* Vista de detalles del préstamo */}
          {selectedPrestamoMes && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearSelectedPrestamoMes}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a la lista
                </Button>
              </div>
              
              <div className="space-y-4 animate-fade-in">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {selectedPrestamoMes.book?.titulo || 'Sin título'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedPrestamoMes.book?.autor || 'Autor desconocido'}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Usuario
                          </h4>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <p className="text-sm font-medium">
                              {selectedPrestamoMes.usuario?.username || 'Usuario desconocido'}
                            </p>
                          </div>
                          {selectedPrestamoMes.usuario?.Numcontrol && (
                            <p className="text-xs text-muted-foreground pl-6">
                              ID: {selectedPrestamoMes.usuario.Numcontrol}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Estado
                          </h4>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(selectedPrestamoMes.estado)}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Fecha de préstamo
                          </h4>
                          <p className="text-sm">{formatDate(selectedPrestamoMes.fecha_prestamo)}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Fecha de devolución esperada
                          </h4>
                          <p className="text-sm">{formatDate(selectedPrestamoMes.fecha_devolucion_esperada)}</p>
                        </div>
                        
                        {selectedPrestamoMes.estado === 'devuelto' && selectedPrestamoMes.fecha_devolucion_real && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Fecha de devolución real
                            </h4>
                            <p className="text-sm">{formatDate(selectedPrestamoMes.fecha_devolucion_real)}</p>
                          </div>
                        )}
                      </div>
                      
                      {selectedPrestamoMes.notas && (
                        <div className="pt-2">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Notas
                          </h4>
                          <p className="text-sm p-3 bg-muted rounded-md">
                            {selectedPrestamoMes.notas}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => {
                      router.push(`/prestamos/${selectedPrestamoMes.id}`);
                      setShowTotalPrestamosModal(false);
                    }}
                    variant="outline"
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver detalles completos
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Libros Prestados */}
      <Dialog open={showLibrosPrestadosModal} onOpenChange={(isOpen) => {
        setShowLibrosPrestadosModal(isOpen);
        if (!isOpen) clearSelectedBook();
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBook ? `Detalles del préstamo` : "Libros Prestados"}
            </DialogTitle>
            <DialogDescription>
              {selectedBook 
                ? "Información detallada del préstamo" 
                : "Lista de libros actualmente en préstamo"}
            </DialogDescription>
          </DialogHeader>
          
          {/* Vista de lista de libros prestados */}
          {!selectedBook && (
            <div className="space-y-4 mt-4">
              {isLoadingLibros ? (
                <>
                  <LoanSkeleton />
                  <LoanSkeleton />
                  <LoanSkeleton />
                </>
              ) : librosPrestados.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay libros prestados actualmente
                </p>
              ) : (
                <div className="animate-fade-in space-y-4">
                  {librosPrestados.map((loan, index) => {
                    // Definir iconos y colores según el estado
                    let IconComponent = BookMarked;
                    let iconColor = 'text-blue-600 dark:text-blue-400';
                    
                    switch (loan.estado) {
                      case 'devuelto':
                        IconComponent = BookOpenCheck;
                        iconColor = 'text-green-600 dark:text-green-400';
                        break;
                      case 'atrasado':
                        IconComponent = Clock;
                        iconColor = 'text-orange-600 dark:text-orange-400';
                        break;
                      case 'perdido':
                        IconComponent = BookOpenText;
                        iconColor = 'text-red-600 dark:text-red-400';
                        break;
                      case 'renovado':
                        IconComponent = RotateCw;
                        iconColor = 'text-blue-600 dark:text-blue-400';
                        break;
                      default:
                        IconComponent = BookMarked;
                        iconColor = 'text-blue-600 dark:text-blue-400';
                    }
                    
                    return (
                      <Card 
                        key={index} 
                        className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                        onClick={() => showBookDetails(loan)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                              <IconComponent className={`h-5 w-5 ${iconColor}`} />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium leading-none">
                                  {loan.book?.titulo || 'Sin título'}
                                </p>
                                {getStatusBadge(loan.estado)}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {loan.book?.autor || 'Autor desconocido'}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">
                                    {loan.usuario?.username || 'Usuario desconocido'}
                                  </p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Desde: {formatDate(loan.fecha_prestamo)}
                                </p>
                              </div>
                              
                              {/* Información adicional del usuario */}
                              {loan.usuario && (
                                <div className="mt-2 space-y-1">
                                  {loan.usuario.Numcontrol && (
                                    <div className="flex items-center gap-1">
                                      <Bookmark className="h-3 w-3 text-muted-foreground" />
                                      <p className="text-xs text-muted-foreground">
                                        Matrícula: {loan.usuario.Numcontrol}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {loan.usuario.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3 text-muted-foreground" />
                                      <p className="text-xs text-muted-foreground">
                                        {loan.usuario.email}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {loan.usuario.Carrera && (
                                    <div className="flex items-center gap-1">
                                      <GraduationCap className="h-3 w-3 text-muted-foreground" />
                                      <p className="text-xs text-muted-foreground">
                                        {loan.usuario.Carrera}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              
              <DialogFooter>
                <Button 
                  onClick={() => {
                    setShowLibrosPrestadosModal(false);
                    router.push('/prestamos?estado=activo');
                  }}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver en "Préstamos"
                </Button>
              </DialogFooter>
            </div>
          )}
          
          {/* Vista de detalles del préstamo */}
          {selectedBook && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearSelectedBook}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a la lista
                </Button>
              </div>
              
              <div className="space-y-4 animate-fade-in">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {selectedBook.book?.titulo || 'Sin título'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedBook.book?.autor || 'Autor desconocido'}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Usuario
                          </h4>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <p className="text-sm font-medium">
                              {selectedBook.usuario?.username || 'Usuario desconocido'}
                            </p>
                          </div>
                          {selectedBook.usuario?.Numcontrol && (
                            <p className="text-xs text-muted-foreground pl-6">
                              ID: {selectedBook.usuario.Numcontrol}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Estado
                          </h4>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(selectedBook.estado)}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Fecha de préstamo
                          </h4>
                          <p className="text-sm">{formatDate(selectedBook.fecha_prestamo)}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Fecha de devolución esperada
                          </h4>
                          <p className="text-sm">{formatDate(selectedBook.fecha_devolucion_esperada)}</p>
                        </div>
                      </div>
                      
                      {selectedBook.notas && (
                        <div className="pt-2">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Notas
                          </h4>
                          <p className="text-sm p-3 bg-muted rounded-md">
                            {selectedBook.notas}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => {
                      router.push(`/prestamos/${selectedBook.id}`);
                      setShowLibrosPrestadosModal(false);
                    }}
                    variant="outline"
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver detalles completos
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Usuarios Activos */}
      <Dialog open={showUsuariosActivosModal} onOpenChange={(isOpen) => {
        setShowUsuariosActivosModal(isOpen);
        if (!isOpen) clearSelectedUser();
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedUserName ? `Préstamos de ${selectedUserName}` : "Usuarios Activos"}
            </DialogTitle>
            <DialogDescription>
              {selectedUserName 
                ? "Historial de préstamos realizados por el usuario" 
                : "Lista de usuarios con estado \"Activo\" en el sistema"}
            </DialogDescription>
          </DialogHeader>
          
          {/* Vista de lista de usuarios */}
          {!selectedUserName && (
            <div className="space-y-4 mt-4">
              {usuariosActivos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isLoading ? "Cargando usuarios..." : "No hay usuarios activos en el sistema"}
                </p>
              ) : (
                usuariosActivos.map((user) => (
                  <Card 
                    key={user.id} 
                    className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => handleUserClick(user.Numcontrol || user.id, user.username)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <span className="text-base font-medium text-blue-600 dark:text-blue-400">
                            {user.username.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">
                              {user.username}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {user.Numcontrol || user.id}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Registro: {formatDate(user.createdAt)}
                            </p>
                          </div>
                          {user.Carrera && (
                            <div className="flex items-center gap-1 mt-1">
                              <GraduationCap className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">{user.Carrera}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              
              <DialogFooter>
                <Button 
                  onClick={() => {
                    setShowUsuariosActivosModal(false);
                    router.push('/usuarios?estado=Activo');
                  }}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir en "Usuarios"
                </Button>
              </DialogFooter>
            </div>
          )}
          
          {/* Vista de préstamos del usuario */}
          {selectedUserName && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearSelectedUser}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a usuarios
                </Button>
              </div>
              
              <div className="space-y-4">
                {isLoadingLoans ? (
                  // Mostrar skeletons durante la carga
                  <>
                    <LoanSkeleton />
                    <LoanSkeleton />
                    <LoanSkeleton />
                  </>
                ) : selectedUserLoans.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No se encontraron préstamos para este usuario
                  </p>
                ) : (
                  <div className="animate-fade-in space-y-4">
                    {selectedUserLoans.map((loan, index) => {
                      let tipo = '';
                      let IconComponent = BookMarked;
                      let color = 'text-blue-600 dark:text-blue-400';
                      
                      switch (loan.estado) {
                        case 'devuelto':
                          tipo = 'Devolución';
                          IconComponent = BookOpenCheck;
                          color = 'text-green-600 dark:text-green-400';
                          break;
                        case 'atrasado':
                          tipo = 'Atrasado';
                          IconComponent = Clock;
                          color = 'text-orange-600 dark:text-orange-400';
                          break;
                        case 'perdido':
                          tipo = 'Perdido';
                          IconComponent = BookOpenText;
                          color = 'text-red-600 dark:text-red-400';
                          break;
                        default:
                          tipo = 'Préstamo';
                          IconComponent = BookMarked;
                          color = 'text-blue-600 dark:text-blue-400';
                      }

                      return (
                        <div key={index} className="flex items-start gap-4 rounded-lg border p-3">
                          <div className="bg-primary/10 p-2 rounded-md">
                            <IconComponent className={`h-4 w-4 ${color}`} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {loan.book?.titulo || 'Sin título'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tipo} • {formatDistanceToNow(parseISO(loan.fecha_prestamo), { addSuffix: true, locale: es })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}