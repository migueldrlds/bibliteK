"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, User } from "lucide-react";
import { useUser } from "@/context/user-context";
import { useRouter } from "next/navigation";

export default function EntradasPage() {
  const { user, permissions, loading } = useUser();
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [entradas, setEntradas] = useState([]);
  const [registrando, setRegistrando] = useState(false);
  const [error, setError] = useState("");

  // Redirigir si no tiene permisos
  useEffect(() => {
    if (!loading && user && permissions) {
      const rol = user.role?.toLowerCase();
      if (rol !== "administrador" && rol !== "bibliotecario") {
        router.push("/catalogo");
      }
    }
  }, [user, permissions, loading, router]);

  // Cargar historial de entradas (simulado)
  useEffect(() => {
    // Aquí deberías hacer fetch a tu API de entradas
    setEntradas([]); // Inicialmente vacío
  }, []);

  const handleRegistrarEntrada = async () => {
    setError("");
    if (!userId) {
      setError("Ingresa un ID de usuario válido");
      return;
    }
    setRegistrando(true);
    try {
      // Aquí deberías hacer la petición a tu API para registrar la entrada
      // await api.registrarEntrada({ usuario: userId, bibliotecario: user.id, tipo: "Consulta" })
      setEntradas(prev => [
        { id: Date.now(), usuario: userId, bibliotecario: user.username, tipo: "Consulta", fecha: new Date().toISOString() },
        ...prev
      ]);
      setUserId("");
    } catch (e) {
      setError("Error al registrar la entrada");
    } finally {
      setRegistrando(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-blue-600" /> Entradas
        </h2>
        <div className="flex gap-2 items-end">
          <Input
            placeholder="ID de usuario"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            className="w-64"
          />
          <Button onClick={handleRegistrarEntrada} disabled={registrando || !userId}>
            Registrar entrada
          </Button>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Historial de entradas</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Bibliotecario</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No hay registros</TableCell>
                </TableRow>
              ) : (
                entradas.map((entrada: any) => (
                  <TableRow key={entrada.id}>
                    <TableCell>{entrada.id}</TableCell>
                    <TableCell>{entrada.usuario}</TableCell>
                    <TableCell>{entrada.bibliotecario}</TableCell>
                    <TableCell>{entrada.tipo}</TableCell>
                    <TableCell>{new Date(entrada.fecha).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
} 