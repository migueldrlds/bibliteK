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
  fecha_devolucion_real?: string;
  estado: string;
  dias_atraso?: number;
  campus_origen?: string;
  renewalCount?: number;
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
              <h2 style="color: #2c3e50; text-align: center;">Confirmación de Préstamo Activo</h2>
              
              <p>Estimado/a ${loanData.usuario.username}:</p>
              
              <p>Te informamos que se ha registrado correctamente el préstamo del siguiente material bibliográfico a través del sistema BiblioteK del Instituto Tecnológico de Tijuana:</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Detalles del préstamo</h3>
                <ul style="list-style-type: none; padding-left: 0;">
                  <li>• Título: ${loanData.book.titulo}</li>
                  <li>• Autor: ${loanData.book.autor}</li>
                  ${loanData.book.clasificacion ? `<li>• Clasificación LCC: ${loanData.book.clasificacion}</li>` : ''}
                  ${loanData.book.categoria ? `<li>• Categoría: ${loanData.book.categoria}</li>` : ''}
                  <li>• Campus de origen: ${loanData.campus_origen || 'No especificado'}</li>
                  <li>• Fecha de préstamo: ${new Date(loanData.fecha_prestamo).toLocaleDateString()}</li>
                  <li>• Fecha límite de devolución: ${new Date(loanData.fecha_devolucion_esperada).toLocaleDateString()}</li>
                </ul>
              </div>
              
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">Importante</h3>
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
              <h2 style="color: #2c3e50; text-align: center;">Recordatorio de Préstamo por Vencer</h2>
              
              <p>Estimado/a ${loanData.usuario.username}:</p>
              
              <p>Te recordamos que el siguiente préstamo realizado a tu nombre en BiblioteK está próximo a vencer. Agradecemos tu atención para evitar retrasos en la devolución:</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Detalles del préstamo</h3>
                <ul style="list-style-type: none; padding-left: 0;">
                  <li>• Título: ${loanData.book.titulo}</li>
                  <li>• Autor: ${loanData.book.autor}</li>
                  ${loanData.book.clasificacion ? `<li>• Clasificación LCC: ${loanData.book.clasificacion}</li>` : ''}
                  ${loanData.book.categoria ? `<li>• Categoría: ${loanData.book.categoria}</li>` : ''}
                  <li>• Campus de origen: ${loanData.campus_origen || 'No especificado'}</li>
                  <li>• Fecha límite de devolución: ${new Date(loanData.fecha_devolucion_esperada).toLocaleDateString()}</li>
                </ul>
              </div>
              
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">Recomendaciones</h3>
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

  // Enviar correo de confirmación de devolución
  sendReturnConfirmation: async (loanData: LoanData) => {
    try {
      console.log('Valor de campus_origen en sendReturnConfirmation:', loanData.campus_origen);
      const isLate = loanData.dias_atraso && loanData.dias_atraso > 0;
      const returnStatus = isLate ? 'Fuera de plazo' : 'En plazo';

      const response = await fetch(`${API_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: loanData.usuario.email,
          subject: 'Confirmación de devolución – ¡Gracias por utilizar BiblioteK!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #2c3e50; text-align: center;">Confirmación de Devolución de Libro</h2>
              
              <p>Estimado/a ${loanData.usuario.username}:</p>
              
              <p>Te informamos que hemos recibido correctamente la devolución del siguiente material bibliográfico en el sistema BiblioteK del Instituto Tecnológico de Tijuana:</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Detalles del ejemplar devuelto</h3>
                <ul style="list-style-type: none; padding-left: 0;">
                  <li>• Título: ${loanData.book.titulo}</li>
                  <li>• Autor: ${loanData.book.autor}</li>
                  ${loanData.book.clasificacion ? `<li>• Clasificación LCC: ${loanData.book.clasificacion}</li>` : ''}
                  ${loanData.book.categoria ? `<li>• Categoría: ${loanData.book.categoria}</li>` : ''}
                  <li>• Campus de origen: ${loanData.campus_origen || 'No especificado'}</li>
                  <li>• Fecha de devolución: ${new Date(loanData.fecha_devolucion_real!).toLocaleDateString()}</li>
                  <li>• Estado de devolución: ${returnStatus}</li>
                </ul>
              </div>
              
              <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Gracias por utilizar nuestros servicios</h3>
                <p>Agradecemos tu compromiso con el reglamento bibliotecario y tu participación activa en el uso responsable de los recursos del Instituto. Cada devolución a tiempo permite que más estudiantes puedan acceder al mismo material.</p>
              </div>
              
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">Recuerda</h3>
                <ul style="list-style-type: none; padding-left: 0;">
                  <li>• Puedes consultar tu historial y próximos préstamos en tu cuenta de usuario de BiblioteK.</li>
                  <li>• Para futuras consultas o renovaciones, te invitamos a visitar nuevamente la biblioteca.</li>
                </ul>
              </div>
              
              <p>Si tienes alguna duda, el personal de biblioteca está disponible para apoyarte durante el horario de atención.</p>
              
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
        throw new Error('Error al enviar correo de confirmación de devolución');
      }

      console.log('Correo de confirmación de devolución enviado exitosamente');
      return true;
    } catch (error) {
      console.error('Error al enviar correo de confirmación de devolución:', error);
      throw error;
    }
  },

  // Enviar correo de notificación de devolución tardía
  sendLateReturnNotification: async (loanData: LoanData) => {
    try {
      const response = await fetch(`${API_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: loanData.usuario.email,
          subject: 'Aviso de devolución tardía – Material bibliográfico BiblioteK',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #2c3e50; text-align: center;">Notificación de Devolución Tardía</h2>
              
              <p>Estimado/a ${loanData.usuario.username}:</p>
              
              <p>Te informamos que el siguiente material bibliográfico fue devuelto fuera del plazo establecido, según el registro del sistema BiblioteK del Instituto Tecnológico de Tijuana:</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Detalles del ejemplar devuelto</h3>
                <ul style="list-style-type: none; padding-left: 0;">
                  <li>• Título: ${loanData.book.titulo}</li>
                  <li>• Autor: ${loanData.book.autor}</li>
                  ${loanData.book.clasificacion ? `<li>• Clasificación LCC: ${loanData.book.clasificacion}</li>` : ''}
                  ${loanData.book.categoria ? `<li>• Categoría: ${loanData.book.categoria}</li>` : ''}
                  <li>• Campus de origen: ${loanData.campus_origen || 'No especificado'}</li>
                  <li>• Fecha límite de devolución: ${new Date(loanData.fecha_devolucion_esperada).toLocaleDateString()}</li>
                  <li>• Fecha de devolución: ${new Date(loanData.fecha_devolucion_real!).toLocaleDateString()}</li>
                  <li>• Días de atraso: ${loanData.dias_atraso} días hábiles</li>
                </ul>
              </div>
              
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">Importante</h3>
                <p>De acuerdo con el reglamento bibliotecario, se genera automáticamente una multa de $10.00 MXN por cada día hábil de atraso. Esta penalización no considera fines de semana, días festivos ni suspensiones académicas, y es calculada utilizando el calendario oficial del Instituto.</p>
              </div>
              
              <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">¿Qué sigue?</h3>
                <ul style="list-style-type: none; padding-left: 0;">
                  <li>• Puedes consultar el detalle de tu multa y tu historial en tu cuenta de usuario de BiblioteK.</li>
                  <li>• Te recomendamos acudir a la biblioteca para regularizar tu situación.</li>
                  <li>• En caso de acumulación de sanciones o reincidencia, podría restringirse temporalmente el uso del servicio.</li>
                </ul>
              </div>
              
              <p>Nuestro objetivo es brindarte acceso eficiente a los recursos académicos. Agradecemos tu atención y comprensión en este proceso.</p>
              
              <p>Para cualquier duda o aclaración, el personal de biblioteca está disponible para apoyarte durante el horario de atención.</p>
              
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
        throw new Error('Error al enviar correo de notificación de devolución tardía');
      }

      console.log('Correo de notificación de devolución tardía enviado exitosamente');
      return true;
    } catch (error) {
      console.error('Error al enviar correo de notificación de devolución tardía:', error);
      throw error;
    }
  },

  // Enviar correo de confirmación de renovación
  sendRenewalConfirmation: async (loanData: LoanData) => {
    try {
      const isLiterature = loanData.book.categoria?.toLowerCase() === 'literatura';
      const maxRenewals = isLiterature ? 2 : 1;
      const remainingRenewals = maxRenewals - (loanData.renewalCount || 0);

      const response = await fetch(`${API_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: loanData.usuario.email,
          subject: 'Renovación confirmada – Material bibliográfico BiblioteK',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #2c3e50; text-align: center;">Renovación Confirmada</h2>
              
              <p>Estimado/a ${loanData.usuario.username}:</p>
              
              <p>Te confirmamos que se ha registrado exitosamente la renovación del siguiente material bibliográfico a través del sistema BiblioteK del Instituto Tecnológico de Tijuana:</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Detalles del préstamo renovado</h3>
                <ul style="list-style-type: none; padding-left: 0;">
                  <li>• Título: ${loanData.book.titulo}</li>
                  <li>• Autor: ${loanData.book.autor}</li>
                  ${loanData.book.clasificacion ? `<li>• Clasificación LCC: ${loanData.book.clasificacion}</li>` : ''}
                  ${loanData.book.categoria ? `<li>• Categoría: ${loanData.book.categoria}</li>` : ''}
                  <li>• Campus de origen: ${loanData.campus_origen || 'No especificado'}</li>
                  <li>• Fecha de renovación: ${new Date().toLocaleDateString()}</li>
                  <li>• Nueva fecha límite de devolución: ${new Date(loanData.fecha_devolucion_esperada).toLocaleDateString()}</li>
                  <li>• Renovaciones utilizadas: ${loanData.renewalCount || 0} / ${maxRenewals}</li>
                </ul>
              </div>
              
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">Información importante</h3>
                ${isLiterature && loanData.renewalCount === 2 ? 
                  `<p>Este es el límite máximo de renovaciones permitido para libros de Literatura. A partir de ahora, deberás devolver el ejemplar a más tardar en la fecha indicada para evitar sanciones.</p>` :
                  isLiterature && loanData.renewalCount === 1 ?
                  `<p>Aún puedes realizar una renovación más para este ejemplar de Literatura antes del vencimiento.</p>` :
                  `<p>Este material ya no puede renovarse nuevamente, ya que solo se permite una renovación para libros de esta categoría. La devolución deberá realizarse antes de la nueva fecha límite.</p>`
                }
              </div>
              
              <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Recuerda</h3>
                <ul style="list-style-type: none; padding-left: 0;">
                  <li>• El incumplimiento en la devolución generará una multa de $10.00 MXN por cada día hábil de atraso.</li>
                  <li>• No se cuentan fines de semana ni días festivos; la multa se calcula usando el calendario institucional.</li>
                  <li>• Puedes verificar tu historial de préstamos y renovaciones en tu cuenta de usuario en BiblioteK.</li>
                </ul>
              </div>
              
              <p>Gracias por utilizar nuestros servicios y por fomentar el uso responsable del acervo bibliográfico.</p>
              
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
        throw new Error('Error al enviar correo de confirmación de renovación');
      }

      console.log('Correo de confirmación de renovación enviado exitosamente');
      return true;
    } catch (error) {
      console.error('Error al enviar correo de confirmación de renovación:', error);
      throw error;
    }
  },
}; 