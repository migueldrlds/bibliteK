const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337/api";

// Registrar una nueva entrada
export async function registrarEntrada({ tipo, usuarioId, bibliotecarioId, campusId, token }: {
  tipo: "Consulta" | "Login",
  usuarioId: number,
  bibliotecarioId?: number,
  campusId?: number,
  token: string
}) {
  const body: any = {
    Tipo: tipo,
    Usuario: usuarioId,
    Fecha: new Date().toISOString()
  };
  if (bibliotecarioId) body.Bibliotecario = bibliotecarioId;
  if (campusId) body.Campus = campusId;

  const res = await fetch(`${API_BASE_URL}/entradas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ data: body })
  });

  if (!res.ok) {
    throw new Error("Error al registrar la entrada");
  }
  return await res.json();
}

// Obtener historial de entradas
export async function obtenerEntradas({ token }: { token: string }) {
  const res = await fetch(`${API_BASE_URL}/entradas?populate[Usuario][fields][0]=Numcontrol&populate[Usuario][fields][1]=username&populate[Usuario][fields][2]=Genero&populate[Usuario][fields][3]=apellido&populate[Usuario][fields][4]=Estado&populate[Usuario][fields][5]=rol&populate[Usuario][populate][carrera][fields][0]=Nombre&populate[Usuario][populate][campus][fields][0]=Nombre&populate[Bibliotecario][fields][0]=username&populate[Campus][fields][0]=Nombre`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!res.ok) {
    throw new Error("Error al obtener el historial de entradas");
  }
  const data = await res.json();
  return data.data;
}

export async function obtenerHistorialPorUsuario({ usuarioId, token }: { usuarioId: number, token: string }) {
  const res = await fetch(`${API_BASE_URL}/entradas?filters[Usuario][id][$eq]=${usuarioId}&sort=Fecha:desc`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("Error al obtener el historial");
  const data = await res.json();
  return data.data;
} 