const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337/api";

export async function obtenerCampus({ token }: { token: string }) {
  const res = await fetch(`${API_BASE_URL}/campuses`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("Error al obtener campus");
  const data = await res.json();
  return data.data;
} 