"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, GraduationCap, Calendar, MoreHorizontal, PlusCircle, DoorOpen, BadgeCheck, XCircle, Search, Eye, Hash, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Datos de ejemplo para la tabla
type Entrada = {
  id: number;
  numControl: string;
  nombre: string;
  carrera: string;
  fechaHora: string;
  estado: 'registrada' | 'anulada';
};

// Agrega un tipo extendido para la entrada con más datos
type EntradaDetallada = Entrada & {
  genero?: string;
  bibliotecario?: string;
  historial?: Array<{
    fechaHora: string;
    estado: string;
  }>;
};

const mockEntradas: Entrada[] = [
  {
    id: 1,
    numControl: "A01234567",
    nombre: "Juan Pérez",
    carrera: "Ingeniería en Sistemas Computacionales",
    fechaHora: "2024-06-10 08:30",
    estado: "registrada"
  }
];

export default function EntradasPage() {
  const [entradas, setEntradas] = useState<Entrada[]>(mockEntradas);
  const [showDialog, setShowDialog] = useState(false);
  const [numControl, setNumControl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [detalleEntrada, setDetalleEntrada] = useState<EntradaDetallada | null>(null);
  const [tab, setTab] = useState("detalles");

  // Handler para registrar nueva entrada (solo visual)
  const handleRegistrarEntrada = () => {
    setShowDialog(true);
  };

  // Handler para confirmar registro (solo visual)
  const handleConfirmarRegistro = () => {
    // Aquí iría la lógica real
    setShowDialog(false);
    setNumControl("");
  };

  // Filtrado de entradas según el término de búsqueda
  const filteredEntradas = entradas.filter((entrada) => {
    const term = searchTerm.toLowerCase();
    return (
      entrada.numControl.toLowerCase().includes(term) ||
      entrada.nombre.toLowerCase().includes(term) ||
      entrada.carrera.toLowerCase().includes(term)
    );
  });

  // Handler para abrir modal de detalles
  const handleVerDetalles = (entrada: Entrada) => {
    setDetalleEntrada({
      ...entrada,
      genero: "Masculino",
      bibliotecario: "Lic. Ana Torres",
      historial: [
        { fechaHora: "2024-06-10 08:30", estado: "Registrada" },
        { fechaHora: "2024-06-09 09:10", estado: "Registrada" },
      ],
    });
    setTab("detalles");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Entradas</h2>
            <p className="text-muted-foreground">Registra y consulta las entradas de alumnos al sistema</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-end w-full sm:w-auto">
            <div className="relative w-full sm:w-64 order-2 sm:order-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por núm. control, nombre o carrera..."
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleRegistrarEntrada} className="gap-2 order-1 sm:order-2">
              <PlusCircle className="h-5 w-5" />
              Registrar entrada
            </Button>
          </div>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">ID</TableHead>
                  <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Núm. Control</TableHead>
                  <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Nombre</TableHead>
                  <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Carrera</TableHead>
                  <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Fecha/Hora</TableHead>
                  <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Estado</TableHead>
                  <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <DoorOpen className="h-8 w-8 text-muted-foreground" />
                        <span className="text-muted-foreground">No hay entradas registradas.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntradas.map((entrada: Entrada) => (
                    <TableRow key={entrada.id} className="group border-b border-border transition-colors">
                      <TableCell className="px-4 py-2 text-xs font-medium">{entrada.id}</TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-blue-500" />
                          <span>{entrada.numControl}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-500" />
                          <span>{entrada.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-green-500" />
                          <span>{entrada.carrera}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-amber-500" />
                          <span>{entrada.fechaHora}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <Badge className={cn("rounded-md", entrada.estado === "anulada" ? "bg-rose-500" : "bg-emerald-500")}>{entrada.estado === "anulada" ? <XCircle className="h-3 w-3 mr-1" /> : <BadgeCheck className="h-3 w-3 mr-1" />}{entrada.estado === "anulada" ? "Anulada" : "Registrada"}</Badge>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleVerDetalles(entrada)}>
                              <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <XCircle className="h-4 w-4 mr-2 text-rose-500" />
                              Anular entrada
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* Dialogo para registrar nueva entrada */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar nueva entrada</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Número de control del alumno"
                value={numControl}
                onChange={e => setNumControl(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmarRegistro} disabled={!numControl}>
                Registrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Modal de detalles de entrada */}
        <Dialog open={!!detalleEntrada} onOpenChange={() => setDetalleEntrada(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Detalles del usuario</DialogTitle>
              <p className="text-muted-foreground text-sm">Información completa del usuario seleccionado</p>
            </DialogHeader>
            {detalleEntrada && (
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="detalles">Detalles</TabsTrigger>
                  <TabsTrigger value="historial">Historial</TabsTrigger>
                </TabsList>
                <TabsContent value="detalles">
                  <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold leading-tight">{detalleEntrada.nombre}</span>
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded">Alumno</span>
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded">Activo</span>
                      </div>
                    </div>
                    <div className="border-b border-muted/30"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">ID/Número de control</span>
                        <span className="flex items-center gap-1 font-medium text-sm"><Hash className="h-3 w-3 text-blue-500" />{detalleEntrada.numControl}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Fecha de ingreso</span>
                        <span className="flex items-center gap-1 font-medium text-sm"><Calendar className="h-3 w-3 text-amber-500" />{detalleEntrada.fechaHora}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Género</span>
                        <span className="flex items-center gap-1 font-medium text-sm"><User className="h-3 w-3 text-primary" />{detalleEntrada.genero}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Carrera</span>
                        <span className="flex items-center gap-1 font-medium text-sm"><GraduationCap className="h-3 w-3 text-green-500" />{detalleEntrada.carrera}</span>
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <span className="text-xs text-muted-foreground">Bibliotecario que registró</span>
                        <span className="flex items-center gap-1 font-medium text-sm"><User className="h-3 w-3 text-slate-500" />{detalleEntrada.bibliotecario}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="historial">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="font-semibold mb-3">Actividad del usuario</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2"><DoorOpen className="h-4 w-4 text-blue-500" />Entradas totales <span className="font-bold">{detalleEntrada.historial?.length ?? 0}</span></div>
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-sm">Última entrada</span>
                          <span className="font-bold text-base leading-tight">{detalleEntrada.historial?.[0]?.fechaHora?.split(' ')[0] ?? '-'}</span>
                          <span className="text-xs text-muted-foreground leading-tight">{detalleEntrada.historial?.[0]?.fechaHora?.split(' ')[1] ?? ''}</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-muted/30 pt-2">
                      <p className="font-semibold mb-2">Historial de entradas</p>
                      <ul className="space-y-1">
                        {detalleEntrada.historial?.map((h, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-amber-500" />
                            <span>{h.fechaHora}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
} 