import { loanService } from '../services/loanService.js';
import { emailService } from '../services/emailService.js';
import { addDays, isBefore } from 'date-fns';

async function sendReturnReminders() {
  try {
    // Obtener todos los préstamos activos
    const loans = await loanService.getLoans();
    
    // Filtrar préstamos que están próximos a vencer (3 días antes)
    const today = new Date();
    const loansToRemind = loans.filter(loan => {
      if (loan.estado !== 'activo' && loan.estado !== 'renovado') return false;
      
      const returnDate = new Date(loan.fecha_devolucion_esperada);
      const threeDaysBefore = addDays(returnDate, -3);
      
      return isBefore(today, returnDate) && isBefore(threeDaysBefore, today);
    });

    console.log(`Encontrados ${loansToRemind.length} préstamos para recordar`);

    // Enviar recordatorios
    for (const loan of loansToRemind) {
      try {
        await emailService.sendReturnReminder({
          id: loan.id,
          book: {
            titulo: loan.book.titulo,
            autor: loan.book.autor
          },
          usuario: {
            email: loan.usuario.email,
            username: loan.usuario.username
          },
          fecha_prestamo: loan.fecha_prestamo,
          fecha_devolucion_esperada: loan.fecha_devolucion_esperada,
          estado: loan.estado
        });
        console.log(`Recordatorio enviado para el préstamo ${loan.id}`);
      } catch (error) {
        console.error(`Error al enviar recordatorio para el préstamo ${loan.id}:`, error);
      }
    }

    console.log('Proceso de envío de recordatorios completado');
  } catch (error) {
    console.error('Error en el proceso de envío de recordatorios:', error);
  }
}

// Ejecutar el script
sendReturnReminders(); 