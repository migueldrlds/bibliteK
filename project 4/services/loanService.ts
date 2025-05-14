import fetchAPI from '../lib/api';
import { formatISO } from 'date-fns';
import { bookService } from './bookService';

// Definir interfaces para los datos
export interface Book {
  id: number;
  documentId: string;
  id_libro: string;
  titulo: string;
  autor: string;
  clasificacion: string;
  unidad: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  Numcontrol: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  campus?: string;
  Carrera?: string;
  Genero?: string;
}

export interface Loan {
  id: number;
  documentId: string;
  fecha_prestamo: string;
  fecha_devolucion_esperada: string;
  fecha_devolucion_real: string | null;
  estado: 'activo' | 'renovado' | 'atrasado' | 'devuelto' | 'perdido';
  notas: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  campus_origen: string;
  multa?: number;
  renewalCount: number;
  dias_atraso: number;
  book: Book;
  usuario: User;
}

export interface LoanData {
  book: number | string;
  usuario: number | string;
  fecha_prestamo: string;
  fecha_devolucion_esperada: string;
  estado?: 'activo' | 'renovado' | 'atrasado' | 'devuelto' | 'perdido';
  notas?: string;
  fecha_devolucion_real?: string | null;
  campus_origen?: string;
  multa?: number;
  renewalCount?: number;
  dias_atraso?: number;
}

// Interfaz para el inventario
export interface Inventory {
  id: number;
  documentId: string;
  campus: string;
  Campus?: string;
  Cantidad: number;
  books: Book[];
}

export const loanService = {
  // Obtener todos los préstamos
  getLoans: async (): Promise<Loan[]> => {
    try {
      console.log("Solicitando lista de préstamos");
      
      // Usar populate más específico para asegurar que se obtienen todos los campos de usuario
      const response = await fetchAPI('/api/loans?populate[book][populate]=*&populate[usuario][populate]=*');
      
      console.log("Respuesta de préstamos:", response);
      
      // Procesar la respuesta para asegurar formato consistente
      let loans: Loan[] = [];
      if (response && response.data && Array.isArray(response.data)) {
        loans = response.data;
      } else if (Array.isArray(response)) {
        loans = response;
      }

      return loans;
    } catch (error) {
      console.error("Error obteniendo préstamos:", error);
      throw error;
    }
  },

  // Obtener un préstamo por ID
  getLoan: async (id: number | string, documentId?: string): Promise<Loan> => {
    try {
      // Si tenemos el documentId, usarlo en lugar del id numérico
      const idToUse = documentId || id;
      
      console.log(`Obteniendo préstamo ${documentId ? 'documentId' : 'ID'}: ${idToUse}`);
      const response = await fetchAPI(`/api/loans/${idToUse}?populate[0]=book&populate[1]=usuario`);
      
      // Compatibilidad con ambos formatos de respuesta
      if (response && response.data) {
        return response.data;
      } else if (response && response.id) {
        return response;
      } else {
        throw new Error("Préstamo no encontrado o formato de respuesta inesperado");
      }
    } catch (error) {
      console.error(`Error obteniendo préstamo ${documentId ? 'documentId' : 'ID'} ${id}:`, error);
      throw error;
    }
  },

  // Obtener préstamos por usuario ID
  getLoansByUser: async (userId: number | string): Promise<Loan[]> => {
    try {
      console.log(`Obteniendo préstamos para el usuario ID: ${userId}`);
      // Filtrar por ID de usuario y usar el formato URL-encoded de populate
      const response = await fetchAPI(`/api/loans?filters[usuario]=${userId}&populate[0]=book&populate[1]=usuario`);
      
      // Procesar la respuesta
      let loans: Loan[] = [];
      if (response && response.data && Array.isArray(response.data)) {
        loans = response.data;
      } else if (Array.isArray(response)) {
        loans = response;
      }
      
      return loans;
    } catch (error) {
      console.error(`Error obteniendo préstamos para usuario ID ${userId}:`, error);
      throw error;
    }
  },

  // Obtener inventario
  getInventories: async (): Promise<Inventory[]> => {
    try {
      console.log("Obteniendo inventarios");
      const response = await fetchAPI('/api/inventories?populate=*');
      
      let inventories: Inventory[] = [];
      if (response && response.data && Array.isArray(response.data)) {
        inventories = response.data;
      } else if (Array.isArray(response)) {
        inventories = response;
      }
      
      return inventories;
    } catch (error) {
      console.error("Error obteniendo inventarios:", error);
      throw error;
    }
  },
  
  // Actualizar cantidad en inventario
  updateInventoryQuantity: async (inventoryId: number | string, cantidad: number, documentId?: string): Promise<any> => {
    try {
      // SIEMPRE usar documentId si está disponible
      const idToUse = documentId || inventoryId;
      
      console.log(`Actualizando inventario con ID: ${idToUse} a cantidad: ${cantidad}`);
      
      // Imprimir la URL completa para depuración
      const url = `/api/inventories/${idToUse}`;
      console.log(`URL de actualización de inventario: ${url}`);
      
      try {
        const response = await fetchAPI(url, {
          method: 'PUT',
          body: JSON.stringify({
            data: { Cantidad: cantidad }
          }),
        });
        
        console.log("Inventario actualizado con éxito:", response);
        return response;
      } catch (error) {
        console.error(`Error al actualizar inventario con ID ${idToUse}:`, error);
        
        // Si el error es 404, intentar obtener el documentId correcto
        console.log("Intentando recuperarse del error 404...");
        
        // Obtener todos los inventarios para tratar de encontrar el correcto
        const inventoriesResponse = await loanService.getInventories();
        console.log(`Obtenidos ${inventoriesResponse.length} inventarios para buscar coincidencia`);
        
        // Buscar el inventario que coincida con el ID proporcionado
        const foundInventory = inventoriesResponse.find(inv => {
          const invId = String(inv.id);
          const invDocId = inv.documentId;
          const searchId = String(inventoryId);
          
          return invId === searchId || invDocId === documentId;
        });
        
        if (foundInventory) {
          // Si hemos encontrado un inventario que coincide, intentar con su documentId
          const inventoryDocumentId = foundInventory.documentId;
          
          if (inventoryDocumentId) {
            console.log(`Reintentando con documentId: ${inventoryDocumentId}`);
            const altResponse = await fetchAPI(`/api/inventories/${inventoryDocumentId}`, {
              method: 'PUT',
              body: JSON.stringify({
                data: { Cantidad: cantidad }
              }),
            });
            console.log("Inventario actualizado con éxito usando documentId:", altResponse);
            return altResponse;
          }
        }
        
        throw error;
      }
    } catch (error) {
      console.error(`Error al actualizar inventario ID ${inventoryId}:`, error);
      throw error;
    }
  },

  // Crear un préstamo con gestión de campus
  createLoan: async (loanData: any): Promise<any> => {
    try {
      console.log("=== INICIO DE CREACIÓN DE PRÉSTAMO ===");
      console.log("Datos recibidos para crear préstamo:", loanData);

      // Verificar disponibilidad del libro
      console.log("Verificando disponibilidad del libro ID:", loanData.book);
      const book = await bookService.getBook(loanData.book);
      
      if (!book) {
        throw new Error(`Libro con ID ${loanData.book} no encontrado`);
      }

      // Formatear datos para la API
      const formattedData = {
        data: {
          book: loanData.book,
          usuario: loanData.usuario,
          fecha_prestamo: loanData.fecha_prestamo,
          fecha_devolucion_esperada: loanData.fecha_devolucion_esperada,
          estado: loanData.estado,
          campus_origen: loanData.campus_origen,
          notas: loanData.notas || ''
        }
      };

      console.log("Datos formateados para crear préstamo:", formattedData);

      // Crear el préstamo
      const response = await fetchAPI('/api/loans', {
        method: 'POST',
        body: JSON.stringify(formattedData)
      });

      console.log("Préstamo creado con respuesta:", response);

      // Actualizar inventario usando bookService
      if (loanData.campus_origen) {
        try {
          console.log("Actualizando inventario con bookService");
          await bookService.updateBookInventory(
            loanData.book,
            loanData.campus_origen,
            -1 // Reducir en 1 la cantidad
          );
          console.log("Inventario actualizado correctamente con bookService");
        } catch (inventoryError) {
          console.error("Error al actualizar inventario con bookService:", inventoryError);
          // No lanzamos el error aquí para no interrumpir la creación del préstamo
          // pero registramos el error para seguimiento
        }
      } else {
        console.warn("No se especificó campus_origen, no se actualizará el inventario");
      }

      return response;
    } catch (error) {
      console.error("Error al crear préstamo:", error);
      throw error;
    } finally {
      console.log("=== FIN DE CREACIÓN DE PRÉSTAMO ===");
    }
  },

  // Actualizar un préstamo existente
  updateLoan: async (id: number | string, loanData: Partial<LoanData>, documentId?: string): Promise<any> => {
    try {
      const formattedData: { data: Partial<LoanData> } = {
        data: {}
      };

      // Solo incluir los campos que se quieren actualizar
      if (loanData.book !== undefined) formattedData.data.book = loanData.book;
      if (loanData.usuario !== undefined) formattedData.data.usuario = loanData.usuario;
      if (loanData.fecha_prestamo !== undefined) formattedData.data.fecha_prestamo = loanData.fecha_prestamo;
      if (loanData.fecha_devolucion_esperada !== undefined) formattedData.data.fecha_devolucion_esperada = loanData.fecha_devolucion_esperada;
      if (loanData.fecha_devolucion_real !== undefined) formattedData.data.fecha_devolucion_real = loanData.fecha_devolucion_real;
      if (loanData.estado !== undefined) formattedData.data.estado = loanData.estado;
      if (loanData.notas !== undefined) formattedData.data.notas = loanData.notas;
      if (loanData.campus_origen !== undefined) formattedData.data.campus_origen = loanData.campus_origen;

      // Si tenemos el documentId, usarlo en lugar del id numérico
      const idToUse = documentId || id;

      console.log(`Actualizando préstamo ${documentId ? 'documentId' : 'ID'}: ${idToUse} con datos:`, formattedData);
      const response = await fetchAPI(`/api/loans/${idToUse}`, {
        method: 'PUT',
        body: JSON.stringify(formattedData),
      });

      return response;
    } catch (error) {
      console.error(`Error al actualizar préstamo ID ${id}:`, error);
      throw error;
    }
  },

  // Renovar un préstamo (actualizar fecha y cambiar estado)
  renewLoan: async (id: number | string, newReturnDate: string, documentId?: string): Promise<any> => {
    try {
      console.log(`Renovando préstamo ${documentId ? 'documentId' : 'ID'}: ${id}`);
      
      // Preparar datos para la actualización
      const updateData = {
        fecha_devolucion_esperada: newReturnDate,
        estado: 'renovado' as 'renovado'
      };
      
      // Actualizar el préstamo
      const idToUse = documentId || id;
      const response = await fetchAPI(`/api/loans/${idToUse}`, {
        method: 'PUT',
        body: JSON.stringify({ data: updateData }),
      });
      
      console.log('Préstamo renovado:', response);
      return response;
    } catch (error) {
      console.error(`Error al renovar préstamo ID ${id}:`, error);
      throw error;
    }
  },
  
  // Marcar un préstamo como devuelto
  returnLoan: async (id: number | string, documentId?: string): Promise<any> => {
    try {
      console.log(`Marcando préstamo ${documentId ? 'documentId' : 'ID'}: ${id} como devuelto`);
      
      // Obtener información actual del préstamo
      const loan = await loanService.getLoan(id, documentId);
      
      // Preparar datos para la actualización
      const updateData: {
        estado: 'devuelto',
        fecha_devolucion_real: string,
        multa?: number,
        dias_atraso?: number
      } = {
        estado: 'devuelto',
        fecha_devolucion_real: formatISO(new Date())
      };
      
      // Si el préstamo estaba atrasado, calcular multa y días de atraso
      if (loan.estado === 'atrasado') {
        const dueDate = new Date(loan.fecha_devolucion_esperada);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - dueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Multa de $10 MXN por día de atraso
        const fine = diffDays * 10;
        updateData.multa = fine;
        updateData.dias_atraso = diffDays;
      }
      
      // Actualizar el préstamo
      const idToUse = documentId || id;
      const response = await fetchAPI(`/api/loans/${idToUse}`, {
        method: 'PUT',
        body: JSON.stringify({ data: updateData }),
      });
      
      // Si hay un campus de origen, actualizar el inventario
      if (loan.campus_origen) {
        try {
          // Primero intentar usar bookService que ahora funciona correctamente
          try {
            if (loan.book) {
              const bookIdToUse = loan.book.documentId || loan.book.id;
              await bookService.updateBookInventory(
                bookIdToUse,
                loan.campus_origen,
                1  // Incrementar en 1 la cantidad disponible
              );
              console.log(`Inventario de campus ${loan.campus_origen} actualizado correctamente usando bookService`);
              return response;
            }
          } catch (bookServiceError) {
            console.error("Error al actualizar con bookService, intentando método alternativo:", bookServiceError);
          }
          
          // Si falla bookService, continuamos con el método anterior
          // Obtener el inventario del campus
          const inventoriesResponse = await loanService.getInventories();
          const campusInventory = inventoriesResponse.find(inv => {
            // Comprobar si inv y sus propiedades están definidas antes de usarlas
            const invCampus = inv?.campus || inv?.Campus || '';
            const bookMatches = inv?.books && Array.isArray(inv.books) && 
              inv.books.some(book => String(book?.id) === String(loan.book?.id));
            
            return invCampus.toLowerCase() === (loan.campus_origen || '').toLowerCase() && bookMatches;
          });
          
          if (campusInventory) {
            try {
              // Usar un ID válido para actualizar
              const inventoryId = campusInventory.documentId || campusInventory.id;
              
              if (!inventoryId) {
                throw new Error("No se encontró un ID válido para el inventario");
              }
              
              // Incrementar la cantidad disponible
              await loanService.updateInventoryQuantity(
                inventoryId, 
                campusInventory.Cantidad + 1,
                typeof inventoryId === 'string' ? inventoryId : undefined
              );
              console.log(`Inventario de campus ${loan.campus_origen} incrementado a ${campusInventory.Cantidad + 1}`);
            } catch (updateError) {
              console.error("Error en primer intento de actualización de inventario en devolución:", updateError);
              
              // Intentar obtener todos los inventarios de nuevo para buscar el documentId correcto
              const refreshedInventories = await loanService.getInventories();
              const refreshedInventory = refreshedInventories.find(inv => {
                // Comprobar si inv y sus propiedades están definidas antes de usarlas
                const invCampus = inv?.campus || inv?.Campus || '';
                const bookMatches = inv?.books && Array.isArray(inv.books) && 
                  inv.books.some(book => String(book?.id) === String(loan.book?.id));
                
                return invCampus.toLowerCase() === (loan.campus_origen || '').toLowerCase() && bookMatches;
              });
              
              if (refreshedInventory) {
                const inventoryId = refreshedInventory.documentId || refreshedInventory.id;
                
                if (inventoryId) {
                  console.log(`Reintentando con ID encontrado: ${inventoryId}`);
                  await loanService.updateInventoryQuantity(
                    inventoryId,
                    refreshedInventory.Cantidad + 1,
                    typeof inventoryId === 'string' ? inventoryId : undefined
                  );
                  console.log(`Inventario actualizado en segundo intento con ID: ${inventoryId}`);
                } else {
                  throw new Error("No se pudo encontrar un ID válido para el inventario en devolución");
                }
              } else {
                throw new Error("No se pudo encontrar el inventario para el campus y libro");
              }
            }
          } else {
            console.warn(`No se encontró el inventario para el campus ${loan.campus_origen}`);
          }
        } catch (invError) {
          console.error("Error al actualizar inventario:", invError);
          // Continuamos con la devolución aún si hay error en inventario
        }
      }
      
      console.log('Préstamo marcado como devuelto:', response);
      return response;
    } catch (error) {
      console.error(`Error al devolver préstamo ID ${id}:`, error);
      throw error;
    }
  },

  // Función auxiliar para calcular solo días laborables (lunes a viernes) entre dos fechas
  calculateBusinessDays: (startDate: Date, endDate: Date): number => {
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
    
    console.log(`Días laborables entre ${start.toISOString().split('T')[0]} y ${end.toISOString().split('T')[0]}: ${businessDays}`);
    return businessDays;
  },

  // Calcular multa por atraso
  calculateFine: (returnDate: string, actualReturnDate: string | null, existingFine?: number, existingDaysLate?: number): { amount: number; daysLate: number } => {
    // Si ya existe una multa y días de atraso, podemos devolverla sin recalcular
    if (existingFine !== undefined && existingFine > 0 && existingDaysLate !== undefined && existingDaysLate > 0) {
      console.log(`Usando multa existente: $${existingFine} por ${existingDaysLate} días`);
      return {
        daysLate: existingDaysLate,
        amount: existingFine
      };
    }

    const today = actualReturnDate ? new Date(actualReturnDate) : new Date();
    const dueDate = new Date(returnDate);
    
    // Calcular días laborables (lunes a viernes) solamente
    const daysLate = loanService.calculateBusinessDays(dueDate, today);
    const amount = daysLate * 10; // $10 por día laborable de atraso
    
    console.log(`Calculando nueva multa: $${amount} por ${daysLate} días laborables`);
    return {
      daysLate,
      amount
    };
  },

  checkOverdueLoans: async (): Promise<number> => {
    try {
      console.log("Verificando préstamos atrasados");
      const loans = await loanService.getLoans();
      const now = new Date();
      let updatedCount = 0;
      
      // Filtrar préstamos activos o renovados con fecha de devolución vencida
      const overdueLoans = loans.filter(loan => 
        (loan.estado === 'activo' || loan.estado === 'renovado') && 
        new Date(loan.fecha_devolucion_esperada) < now
      );
      
      console.log(`Encontrados ${overdueLoans.length} préstamos atrasados`);
      
      // Actualizar cada préstamo a estado 'atrasado'
      for (const loan of overdueLoans) {
        const dueDate = new Date(loan.fecha_devolucion_esperada);
        
        // Calcular días laborables (lunes a viernes) solamente
        const diffDays = loanService.calculateBusinessDays(dueDate, now);
        
        // Multa de $10 MXN por día laborable de atraso
        const fine = diffDays * 10;
        
        const updateData = {
          estado: 'atrasado' as 'atrasado',
          dias_atraso: diffDays,
          multa: fine
        };
        
        await fetchAPI(`/api/loans/${loan.documentId || loan.id}`, {
          method: 'PUT',
          body: JSON.stringify({ data: updateData }),
        });
        
        updatedCount++;
      }
      
      console.log(`Se actualizaron ${updatedCount} préstamos a estado 'atrasado'`);
      return updatedCount;
    } catch (error) {
      console.error('Error al verificar préstamos atrasados:', error);
      throw error;
    }
  },

  // Marcar un préstamo como perdido
  markAsLost: async (id: number | string, documentId?: string): Promise<any> => {
    try {
      console.log(`Marcando préstamo ${documentId ? 'documentId' : 'ID'}: ${id} como perdido`);
      
      // Preparar datos para la actualización
      const updateData = {
        estado: 'perdido' as 'perdido',
        fecha_devolucion_real: formatISO(new Date())
      };
      
      // Actualizar el préstamo
      const idToUse = documentId || id;
      const response = await fetchAPI(`/api/loans/${idToUse}`, {
        method: 'PUT',
        body: JSON.stringify({ data: updateData }),
      });
      
      console.log('Préstamo marcado como perdido:', response);
      return response;
    } catch (error) {
      console.error(`Error al marcar préstamo ID ${id} como perdido:`, error);
      throw error;
    }
  },

  // Sincronizar multa con el backend para un préstamo
  syncFineWithBackend: async (loanId: number | string, documentId?: string, holidayDays: number = 0): Promise<{ multa: number; dias_atraso: number }> => {
    try {
      console.log(`Sincronizando multa para préstamo ${documentId ? 'documentId' : 'ID'}: ${loanId} (Días feriados: ${holidayDays})`);
      
      // Obtener información actual del préstamo
      const loan = await loanService.getLoan(loanId, documentId);
      
      // Si no está atrasado ni tiene fecha vencida, no aplica multa
      const today = new Date();
      const dueDate = new Date(loan.fecha_devolucion_esperada);
      
      // Revisar si está atrasado según la fecha, independientemente del estado en sistema
      const isOverdue = dueDate < today;
      
      // Si está atrasado, calculamos la multa y actualizamos el backend
      if (isOverdue) {
        // Calcular días laborables (lunes a viernes) de atraso
        const diffDays = loanService.calculateBusinessDays(dueDate, today);
        // Ajustar por días feriados
        const adjustedDiffDays = Math.max(0, diffDays - holidayDays);
        // Multa de $10 por día laborable de atraso
        const fine = adjustedDiffDays * 10; 
        
        console.log(`Calculando multa para préstamo atrasado: $${fine} por ${adjustedDiffDays} días laborables (${diffDays} - ${holidayDays} días feriados)`);
        
        // Preparar datos para actualizar
          const updateData = {
            estado: 'atrasado' as 'atrasado',
          dias_atraso: adjustedDiffDays,
            multa: fine
          };
          
        // Actualizar en backend - SIEMPRE actualizar si está atrasado
          const idToUse = documentId || loanId;
          await fetchAPI(`/api/loans/${idToUse}`, {
            method: 'PUT',
            body: JSON.stringify({ data: updateData }),
          });
          
          console.log(`Préstamo actualizado a estado 'atrasado' con multa: $${fine}`);
        
        return {
          multa: fine,
          dias_atraso: adjustedDiffDays
        };
      }
      
      // Si no está atrasado, no hay multa
      return {
        multa: 0,
        dias_atraso: 0
      };
    } catch (error) {
      console.error(`Error al sincronizar multa para préstamo ID ${loanId}:`, error);
      throw error;
    }
  },
}