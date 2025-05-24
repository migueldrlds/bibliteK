"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  User, 
  AtSign, 
  Lock, 
  ArrowLeft, 
  BadgeInfo,
  Eye,
  EyeOff,
  GraduationCap,
  Building
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Interfaces para tipar los datos de Strapi
interface StrapiResponseDataItem<T> {
  id: number;
  attributes: T;
}

interface StrapiPlainResponseDataItem {
  id: number;
  Nombre: string;
  campus?: {
    id: number;
    Nombre: string;
  };
}

type ApiCareer = StrapiPlainResponseDataItem;
type ApiCampus = StrapiResponseDataItem<ApiCampusAttributes>;

interface ApiCampusAttributes {
  Nombre: string;
}

const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  apellido: z
    .string()
    .min(3, { message: "El apellido debe tener al menos 3 caracteres" }),
  controlNumber: z
    .string()
    .min(1, { message: "El número de control es requerido" })
    .regex(/^\d+$/, { message: "Debe contener solo números" }),
  email: z
    .string()
    .min(1, { message: "El correo es requerido" })
    .email({ message: "Debe ser un correo electrónico válido" })
    .endsWith("tectijuana.edu.mx", { message: "Debe ser un correo institucional (@tectijuana.edu.mx)" }),
  career: z
    .string()
    .min(1, { message: "La carrera es requerida" }),
  gender: z
    .string()
    .min(1, { message: "El género es requerido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  confirmPassword: z
    .string()
    .min(1, { message: "La confirmación de contraseña es requerida" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export default function Register() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [careers, setCareers] = useState<ApiCareer[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string>("");
  const [selectedCampusName, setSelectedCampusName] = useState<string>("");
  const [emailUserPart, setEmailUserPart] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const emailDomain = "@tectijuana.edu.mx";

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      apellido: "",
      controlNumber: "",
      email: "",
      career: "",
      gender: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    async function fetchCareers() {
      try {
        const res = await fetch("http://localhost:1337/api/carreras?populate=campus");
        if (!res.ok) {
          throw new Error('Failed to fetch careers');
        }
        const data = await res.json();
        console.log("[DEBUG] Datos de carreras recibidos de la API:", data);
        if (data.data) {
          setCareers(data.data);
        } else {
          console.warn("[DEBUG] data.data no encontrado en la respuesta de la API de carreras, seteando careers a array vacío. Respuesta completa:", data);
          setCareers([]);
        }
      } catch (error) {
        console.error("[DEBUG] Error en fetchCareers:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las carreras.",
          variant: "destructive",
        });
      }
    }
    fetchCareers();
  }, [toast]);

  useEffect(() => {
    if (selectedCareerId) {
      const careerObj = careers.find(c => c.id.toString() === selectedCareerId);
      if (careerObj && careerObj.campus && careerObj.campus.Nombre) {
        setSelectedCampusName(careerObj.campus.Nombre);
      } else {
        if (careerObj && (!careerObj.campus || !careerObj.campus.Nombre)) {
          console.warn("[DEBUG] Selected career object found, but missing campus or campus name for display:", careerObj);
        }
        setSelectedCampusName("");
      }
    } else {
      setSelectedCampusName("");
    }
  }, [selectedCareerId, careers]);

  // Log 2: Ver el estado de careers antes de renderizar
  console.log("[DEBUG] Estado de 'careers' antes del render:", careers);
  console.log("[DEBUG] ID de carrera seleccionada:", selectedCareerId);
  console.log("[DEBUG] Nombre de campus seleccionado:", selectedCampusName);

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);

    const selectedCareerObject = careers.find(c => c.id.toString() === selectedCareerId);
    const campusId = selectedCareerObject?.campus?.id;

    let fullEmailForValidation = values.email;

    // Paso 1: Registro básico
    const basicPayload = {
      username: values.fullName,
      email: values.email,
      password: values.password,
    };

    console.log("[DEBUG] Payload básico a enviar a Strapi:", basicPayload);

    try {
      // 1. Registro básico
      const registerRes = await fetch("http://localhost:1337/api/auth/local/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basicPayload),
      });
      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        const errorMessageFromServer = registerData?.error?.message || "Ocurrió un error en el registro.";
        const err = new Error(errorMessageFromServer);
        (err as any).strapiErrorData = registerData;
        throw err;
      }

      // 2. Actualizar datos extra
      const userId = registerData.user.id;
      const jwt = registerData.jwt;
      const extraPayload = {
        apellido: values.apellido,
        Numcontrol: values.controlNumber,
        Genero: values.gender,
        carrera: selectedCareerId ? parseInt(selectedCareerId) : undefined,
        campus: campusId,
        rol: "Alumno",
        role: {
          connect: [{ id: 7 }],
          disconnect: []
        },
        Estado: "Activo",
      };
      console.log("[DEBUG] Payload extra a enviar a Strapi:", extraPayload);

      const updateRes = await fetch(`http://localhost:1337/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
        body: JSON.stringify(extraPayload),
      });
      const updateData = await updateRes.json();
      if (!updateRes.ok) {
        const errorMessageFromServer = updateData?.error?.message || "Ocurrió un error al actualizar los datos extra.";
        const err = new Error(errorMessageFromServer);
        (err as any).strapiErrorData = updateData;
        throw err;
      }

      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente.",
      });
      setShowSuccessModal(true);

    } catch (error: any) {
      let errorMessage = "No se pudo completar el registro.";
      let errorDetails = null;
      if (error.message) {
        errorMessage = error.message;
      }
      if (error.strapiErrorData) {
        console.error("[DEBUG] Datos del error de Strapi (desde la respuesta fetch):", error.strapiErrorData);
        errorMessage = error.strapiErrorData?.error?.message || errorMessage;
        errorDetails = error.strapiErrorData?.error?.details;
        if (errorDetails) {
          console.error("[DEBUG] Detalles del error de Strapi:", errorDetails);
        }
      }
      toast({
        title: "Error en el registro",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("[DEBUG] Error completo en onSubmit:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 border-b backdrop-blur-sm bg-background/80 fixed w-full z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <User className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-foreground">BiblioTeK</h1>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 pt-24">
        <div className="w-full max-w-lg space-y-8 py-8">
          <div className="text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Regresar al inicio
            </Link>
            <div className="flex justify-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight">
              Crear cuenta
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Completa el formulario para registrarte en el sistema
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre(s)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="Tu nombre"
                              className="pl-10"
                              disabled={isLoading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apellido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido(s)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="Tus apellidos"
                              className="pl-10"
                              disabled={isLoading}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="controlNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de control</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <BadgeInfo className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="12345678"
                            className="pl-10"
                            disabled={isLoading}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico institucional</FormLabel>
                      <FormControl>
                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                          <AtSign className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                          <Input
                            placeholder="tu.usuario"
                            className="flex-grow p-0 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-auto"
                            disabled={isLoading}
                            value={emailUserPart}
                            onChange={(e) => {
                              const rawValue = e.target.value;
                              let userTypedPart = rawValue;
                              let fullEmailForValidation = ``;

                              if (rawValue.endsWith(emailDomain)) {
                                // El usuario escribió el dominio completo.
                                // `emailUserPart` solo debe ser la parte ANTES del dominio.
                                userTypedPart = rawValue.substring(0, rawValue.length - emailDomain.length);
                                // El email para validación es lo que el usuario escribió, ya que es completo.
                                fullEmailForValidation = rawValue;
                              } else {
                                // El usuario no ha escrito (o no ha terminado de escribir) el dominio.
                                // `emailUserPart` es lo que el usuario ha escrito hasta ahora.
                                userTypedPart = rawValue;
                                // El email para validación es lo que el usuario ha escrito + el dominio.
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

                <FormField
                  control={form.control}
                  name="career"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carrera</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          setSelectedCareerId(value);
                          field.onChange(value);
                        }}
                        value={selectedCareerId}
                        disabled={isLoading || careers.length === 0}
                      >
                        <FormControl>
                          <div className="relative">
                            <SelectTrigger className="pl-10">
                              <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                              <SelectValue placeholder={careers.length === 0 ? "Cargando carreras..." : "Selecciona tu carrera"} />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          {careers.map((career) => {
                            console.log("[DEBUG] Renderizando SelectItem para carrera:", career);
                            if (!career || typeof career.id === 'undefined' || typeof career.Nombre === 'undefined') {
                              console.warn("[DEBUG] Career item con ID o Nombre faltantes, omitiendo:", career);
                              return null;
                            }
                            return (
                              <SelectItem key={career.id} value={career.id.toString()}>
                                {career.Nombre || "Nombre no disponible"}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Campus</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input 
                        value={selectedCampusName} 
                        disabled 
                        readOnly 
                        className="pl-10"
                        placeholder="El campus se asignará automáticamente"
                      />
                    </div>
                  </FormControl>
                </FormItem>

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Género</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu género" />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-10"
                              disabled={isLoading}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-10"
                              disabled={isLoading}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creando cuenta..." : "Registrarse"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">¿Ya tienes cuenta?</span>{" "}
                  <Link
                    href="/auth/login"
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Iniciar sesión
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>

      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¡Registro Exitoso!</AlertDialogTitle>
            <AlertDialogDescription>
              Tu cuenta ha sido creada con el rol de Alumno. 
              Este rol solo puede ser cambiado por un administrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowSuccessModal(false);
              router.push("/auth/login");
            }}>
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}