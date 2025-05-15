import fetchAPI from '../lib/api';
import { format, parseISO } from 'date-fns';

export interface Holiday {
  id: string;
  documentId?: string; // Añadir documentId como opcional
  date: string; // ISO date string
  temporary?: boolean; // Indicador para feriados temporales durante actualizaciones optimistas
}

// Obtener todos los días feriados
export const getHolidays = async (): Promise<Holiday[]> => {
  const url = '/api/holidays?sort=date:asc&pagination[limit]=100';
  try {
    const data = await fetchAPI(url);
    
    console.log('Respuesta completa de API para días feriados:', data);
    
    // Verificar si la respuesta es un objeto con estructura {data: [...]}
    if (data && data.data && Array.isArray(data.data)) {
      // Asegurarse de que se procesen correctamente los IDs y fechas
      const holidays = data.data.map((item: any) => {
        // Extraer el documentId del objeto, que debería ser una cadena alfanumérica
        const documentId = item.documentId || item.attributes?.documentId;
        
        return {
          id: item.id.toString(), // Convertir ID a string
          documentId: documentId, // Usar el documentId original de la API
          date: item.attributes?.date || item.date,
        };
      });
      
      console.log('Días feriados procesados:', holidays);
      return holidays;
    } else if (Array.isArray(data)) {
      // Si la respuesta es directamente un array
      const holidays = data.map((item: any) => ({
        id: item.id.toString(),
        documentId: item.documentId || null,
        date: item.date,
      }));
      
      console.log('Días feriados procesados (respuesta como array):', holidays);
      return holidays;
    }
    
    // Si la estructura no es reconocida
    console.error('Formato de respuesta no reconocido:', data);
    return [];
  } catch (error) {
    console.error('Error al obtener días feriados:', error);
    return [];
  }
};

// Agregar un nuevo día feriado
export const addHoliday = async (date: Date): Promise<Holiday | null> => {
  try {
    const formattedDate = date.toISOString();
    console.log(`Enviando solicitud para crear feriado con fecha: ${formattedDate}`);
    
    const data = await fetchAPI('/api/holidays', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          date: formattedDate,
        }
      }),
    });
    
    console.log('Respuesta al crear feriado:', data);
    
    // Procesar la respuesta según su estructura
    if (data && data.data) {
      // Si es una estructura {data: {...}}
      const newHoliday = {
        id: data.data.id?.toString() || '',
        documentId: data.data.documentId || data.data.attributes?.documentId || data.data.id?.toString(),
        date: data.data.attributes?.date || data.data.date,
      };
      console.log('Nuevo feriado procesado:', newHoliday);
      return newHoliday;
    } else if (data) {
      // Si es directamente el objeto
      const newHoliday = {
        id: data.id?.toString() || '',
        documentId: data.documentId || data.id?.toString(),
        date: data.date,
      };
      console.log('Nuevo feriado procesado (formato directo):', newHoliday);
      return newHoliday;
    }
    
    console.error('Formato de respuesta no reconocido al crear feriado:', data);
    return null;
  } catch (error) {
    console.error('Error al agregar día feriado:', error);
    return null;
  }
};

// Eliminar un día feriado
export const deleteHoliday = async (id: string, documentId?: string): Promise<boolean> => {
  try {
    // Asegurarse que el ID sea un formato válido
    if (!id && !documentId) {
      console.error('ID y documentId de día feriado no válidos');
      return false;
    }
    
    // CAMBIO: Intentar primero con documentId si está disponible
    if (documentId) {
      try {
        console.log(`Intentando eliminar feriado usando documentId: ${documentId}`);
        // IMPORTANTE: Asegurarse de que el documentId esté codificado para la URL
        const encodedDocId = encodeURIComponent(documentId);
        const response = await fetchAPI(`/api/holidays/${encodedDocId}`, {
          method: 'DELETE',
        });
        
        // La respuesta puede ser { success: true } para código 204
        if (response && (response.success || response.data)) {
          console.log('Feriado eliminado exitosamente con documentId');
          return true;
        }
      } catch (errorWithDocId) {
        console.error('Error al eliminar feriado con documentId:', errorWithDocId);
        // Si falla con documentId, continuamos con el ID numérico
      }
    }
    
    // Intentar con ID numérico simple como plan B
    console.log(`Intentando eliminar feriado con ID numérico: ${id}`);
    
    try {
      // IMPORTANTE: Asegurarse de que el ID esté codificado para la URL
      const encodedId = encodeURIComponent(id);
      const response = await fetchAPI(`/api/holidays/${encodedId}`, {
        method: 'DELETE',
      });
      
      // La respuesta puede ser { success: true } para código 204
      if (response && (response.success || response.data)) {
        console.log('Feriado eliminado exitosamente con ID numérico');
        return true;
      }
    } catch (errorWithId) {
      console.error('Error al eliminar feriado con ID numérico:', errorWithId);
      
      // Último intento: probar con una ruta API diferente
      try {
        console.log('Intentando con ruta API alternativa');
        const response = await fetchAPI(`/api/holidays/delete/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        
        // La respuesta puede ser { success: true } para código 204
        if (response && (response.success || response.data)) {
          console.log('Feriado eliminado exitosamente con ruta alternativa');
          return true;
        }
      } catch (finalError) {
        console.error('Todos los intentos de eliminación fallaron:', finalError);
        return false;
      }
    }
  } catch (error) {
    console.error('Error al eliminar día feriado:', error);
    return false;
  }
  
  // Si llegamos aquí, verificar en la carga si realmente se eliminó
  console.log('Verificando eliminación mediante recarga...');
  try {
    // Verificar si el feriado ya no existe mediante una carga
    const holidays = await getHolidays();
    const feriodoExiste = holidays.some(h => h.id === id || h.documentId === documentId);
    if (!feriodoExiste) {
      console.log('Verificación confirmó que el feriado ya no existe en la BD');
      return true;
    }
  } catch (verifyError) {
    console.error('Error al verificar eliminación:', verifyError);
  }
  
  return false;
};

// Comprobar si una fecha dada es un día feriado
export const isHoliday = (date: Date, holidays: Holiday[]): boolean => {
  // Normalizar a formato YYYY-MM-DD para comparación consistente
  const dateString = date.toISOString().split('T')[0];
  
  // Buscar coincidencias con cualquier feriado
  const found = holidays.some(holiday => {
    try {
      const holidayDate = new Date(holiday.date);
      const holidayDateString = holidayDate.toISOString().split('T')[0];
      
      return holidayDateString === dateString;
    } catch (error) {
      console.error('Error al comparar fechas para feriado:', holiday, error);
      return false;
    }
  });
  
  if (found) {
    console.log(`Fecha ${dateString} identificada como feriado`);
  }
  
  return found;
};

export const holidayService = {
  getHolidays,
  addHoliday,
  deleteHoliday,
  isHoliday,
}; 