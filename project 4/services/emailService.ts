// Interfaz para los datos del préstamo
interface LoanData {
  id: number;
  book: {
    titulo: string;
    autor: string;
    clasificacion?: string;
    categoria?: string;
  };
  usuario: {
    email: string;
    username: string;
  };
  fecha_prestamo: string;
  fecha_devolucion_esperada: string;
  estado: string;
}

const API_URL = 'http://localhost:3000';

export const emailService = {
  // Enviar correo de notificación de préstamo
  sendLoanNotification: async (loanData: LoanData) => {
    try {
      const response = await fetch(`${API_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: loanData.usuario.email,
          subject: 'Confirmación de préstamo bibliográfico – BiblioteK',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #2c3e50; text-align: center;">📩 Confirmación de Préstamo Activo</h2>
              
              <p>Estimado/a ${loanData.usuario.username}:</p>
              
              <p>Te informamos que se ha registrado correctamente el préstamo del siguiente material bibliográfico a través del sistema BiblioteK del Instituto Tecnológico de Tijuana:</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">📚 Detalles del préstamo</h3>
                <ul style="list-style-type: none; padding-left: 0;">
                  <li>• Título: ${loanData.book.titulo}</li>
                  <li>• Autor: ${loanData.book.autor}</li>
                  ${loanData.book.clasificacion ? `<li>• Clasificación LCC: ${loanData.book.clasificacion}</li>` : ''}
                  ${loanData.book.categoria ? `<li>• Categoría: ${loanData.book.categoria}</li>` : ''}
                  <li>• Fecha de préstamo: ${new Date(loanData.fecha_prestamo).toLocaleDateString()}</li>
                  <li>• Fecha límite de devolución: ${new Date(loanData.fecha_devolucion_esperada).toLocaleDateString()}</li>
                </ul>
              </div>
              
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">📌 Importante</h3>
                <ul style="list-style-type: none; padding-left: 0;">
                  <li>• La devolución del ejemplar debe realizarse personalmente en la biblioteca antes de la fecha indicada.</li>
                  <li>• Si necesitas renovar el préstamo, deberás acudir a la biblioteca antes del vencimiento.</li>
                  <li>• El incumplimiento en la devolución puede conllevar sanciones conforme al reglamento bibliotecario.</li>
                </ul>
              </div>
              
              <p>Para cualquier duda o aclaración, el personal de biblioteca estará disponible durante el horario de atención.</p>
              
              <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                <p style="margin: 0;">Atentamente,<br>
                <strong>Equipo BiblioteK</strong><br>
                Sistema de Gestión Bibliotecaria<br>
                Instituto Tecnológico de Tijuana</p>
              </div>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar correo de notificación');
      }

      console.log('Correo de notificación enviado exitosamente');
      return true;
    } catch (error) {
      console.error('Error al enviar correo de notificación:', error);
      throw error;
    }
  },

  // Enviar correo de recordatorio de devolución
  sendReturnReminder: async (loanData: LoanData) => {
    try {
      const response = await fetch(`${API_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: loanData.usuario.email,
          subject: 'Recordatorio de vencimiento de préstamo – BiblioteK',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #2c3e50; text-align: center;">📩 Recordatorio de Préstamo por Vencer</h2>
              
              <p>Estimado/a ${loanData.usuario.username}:</p>
              
              <p>Te recordamos que el siguiente préstamo realizado a tu nombre en BiblioteK está próximo a vencer. Agradecemos tu atención para evitar retrasos en la devolución:</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">📚 Detalles del préstamo</h3>
                <ul style="list-style-type: none; padding-left: 0;">
                  <li>• Título: ${loanData.book.titulo}</li>
                  <li>• Autor: ${loanData.book.autor}</li>
                  ${loanData.book.clasificacion ? `<li>• Clasificación LCC: ${loanData.book.clasificacion}</li>` : ''}
                  ${loanData.book.categoria ? `<li>• Categoría: ${loanData.book.categoria}</li>` : ''}
                  <li>• Fecha límite de devolución: ${new Date(loanData.fecha_devolucion_esperada).toLocaleDateString()}</li>
                </ul>
              </div>
              
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">🔔 Recomendaciones</h3>
                <ul style="list-style-type: none; padding-left: 0;">
                  <li>• Entrega el ejemplar directamente en la biblioteca antes de la fecha señalada.</li>
                  <li>• Si requieres renovar el préstamo, puedes solicitarlo personalmente en el área de préstamos, siempre que aún se encuentre vigente.</li>
                  <li>• Recuerda que los retrasos pueden generar restricciones en futuros préstamos.</li>
                </ul>
              </div>
              
              <p>Tu responsabilidad con el acervo bibliográfico es esencial para el beneficio de toda la comunidad académica.</p>
              
              <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                <p style="margin: 0;">Atentamente,<br>
                <strong>Equipo BiblioteK</strong><br>
                Sistema de Gestión Bibliotecaria<br>
                Instituto Tecnológico de Tijuana</p>
              </div>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar correo de recordatorio');
      }

      console.log('Correo de recordatorio enviado exitosamente');
      return true;
    } catch (error) {
      console.error('Error al enviar correo de recordatorio:', error);
      throw error;
    }
  },
}; 