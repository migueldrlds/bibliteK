import { loanService } from '../services/loanService';
import { emailService } from '../services/emailService';
import { addDays, isBefore, isAfter, subDays } from 'date-fns';
import fs from 'fs';
import path from 'path';

// Interfaz para el registro de envíos
interface EmailLog {
  loanId: number;
  lastSent: string;
  nextReminderDate: string;
}

// Función para manejar el registro de correos enviados
const EMAIL_LOG_FILE = path.join(process.cwd(), 'email-log.json');

function loadEmailLog(): EmailLog[] {
  try {
    if (fs.existsSync(EMAIL_LOG_FILE)) {
      const data = fs.readFileSync(EMAIL_LOG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error al cargar el registro de correos:', error);
  }
  return [];
}

function saveEmailLog(log: EmailLog[]) {
  try {
    fs.writeFileSync(EMAIL_LOG_FILE, JSON.stringify(log, null, 2));
  } catch (error) {
    console.error('Error al guardar el registro de correos:', error);
  }
}

function canSendEmail(loanId: number, returnDate: Date, emailLog: EmailLog[]): boolean {
  const lastSent = emailLog.find(log => log.loanId === loanId);
  if (!lastSent) return true;

  const now = new Date();
  const nextReminderDate = new Date(lastSent.nextReminderDate);
  
  // Solo enviar si la fecha actual es posterior a la fecha del próximo recordatorio
  return now >= nextReminderDate;
}

function calculateNextReminderDate(returnDate: Date): Date {
  const now = new Date();
  const daysUntilReturn = Math.ceil((returnDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Si faltan más de 7 días, programar el siguiente recordatorio para 3 días antes
  if (daysUntilReturn > 7) {
    return addDays(returnDate, -3);
  }
  // Si faltan entre 3 y 7 días, programar para 1 día antes
  else if (daysUntilReturn > 3) {
    return addDays(returnDate, -1);
  }
  // Si faltan menos de 3 días, programar para el día siguiente
  else {
    return addDays(now, 1);
  }
}

function updateEmailLog(loanId: number, returnDate: Date, emailLog: EmailLog[]) {
  const nextReminderDate = calculateNextReminderDate(returnDate);
  const existingLog = emailLog.findIndex(log => log.loanId === loanId);
  
  if (existingLog !== -1) {
    emailLog[existingLog].lastSent = new Date().toISOString();
    emailLog[existingLog].nextReminderDate = nextReminderDate.toISOString();
  } else {
    emailLog.push({
      loanId,
      lastSent: new Date().toISOString(),
      nextReminderDate: nextReminderDate.toISOString()
    });
  }
  saveEmailLog(emailLog);
}

async function sendReturnReminders() {
  try {
    // Cargar registro de correos enviados
    const emailLog = loadEmailLog();
    
    // Obtener todos los préstamos activos
    const loans = await loanService.getLoans();
    
    // Filtrar préstamos que están próximos a vencer
    const today = new Date();
    const loansToRemind = loans.filter(loan => {
      if (loan.estado !== 'activo' && loan.estado !== 'renovado') return false;
      
      const returnDate = new Date(loan.fecha_devolucion_esperada);
      return isBefore(today, returnDate) && canSendEmail(loan.id, returnDate, emailLog);
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
        updateEmailLog(loan.id, new Date(loan.fecha_devolucion_esperada), emailLog);
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