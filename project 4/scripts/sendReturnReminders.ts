import { loanService } from '../services/loanService';
import { emailService } from '../services/emailService';
import { addDays, isBefore, isAfter, subDays } from 'date-fns';
import fs from 'fs';
import path from 'path';

// Interfaz para el registro de envíos
interface EmailLog {
  loanId: number;
  lastSent: string;
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

function canSendEmail(loanId: number, emailLog: EmailLog[]): boolean {
  const lastSent = emailLog.find(log => log.loanId === loanId);
  if (!lastSent) return true;

  const lastSentDate = new Date(lastSent.lastSent);
  const oneDayAgo = subDays(new Date(), 1);
  
  return isBefore(lastSentDate, oneDayAgo);
}

function updateEmailLog(loanId: number, emailLog: EmailLog[]) {
  const existingLog = emailLog.findIndex(log => log.loanId === loanId);
  if (existingLog !== -1) {
    emailLog[existingLog].lastSent = new Date().toISOString();
  } else {
    emailLog.push({
      loanId,
      lastSent: new Date().toISOString()
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
    
    // Filtrar préstamos que están próximos a vencer (3 días antes)
    const today = new Date();
    const loansToRemind = loans.filter(loan => {
      if (loan.estado !== 'activo' && loan.estado !== 'renovado') return false;
      
      const returnDate = new Date(loan.fecha_devolucion_esperada);
      const threeDaysBefore = addDays(returnDate, -3);
      
      return isBefore(today, returnDate) && isBefore(threeDaysBefore, today);
    });

    console.log(`Encontrados ${loansToRemind.length} préstamos para recordar`);

    // Enviar recordatorios solo si no se ha enviado en las últimas 24 horas
    for (const loan of loansToRemind) {
      if (!canSendEmail(loan.id, emailLog)) {
        console.log(`Omitiendo envío para préstamo ${loan.id} - Ya se envió un correo en las últimas 24 horas`);
        continue;
      }

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
        updateEmailLog(loan.id, emailLog);
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