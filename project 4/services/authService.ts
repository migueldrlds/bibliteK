import fetchAPI from '../lib/api';

export const authService = {
  // Iniciar sesión usando la API de autenticación de Strapi
  login: async (email: string, password: string) => {
    console.log("Intentando login con:", { email, password });
    
    try {
      // Usar el endpoint de autenticación de Strapi
      console.log("Llamando a la API en:", '/api/auth/local');
      const response = await fetchAPI('/api/auth/local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
          password: password
        }),
      });
      
      console.log("Respuesta completa de la API:", response);
      
      if (!response.jwt) {
        console.error("No se recibió token JWT en la respuesta");
        throw new Error('Credenciales inválidas');
      }
      
      // Guardar el token y el rol del usuario en localStorage
      // Verificar primero el campo rol, luego el campo role.type como fallback
      const userRole = response.user.rol || response.user.role?.type || 'authenticated';
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('bibliotech-token', response.jwt);
        localStorage.setItem('bibliotech-role', userRole);
        console.log(`Token y rol guardados en localStorage: ${userRole}`);
      }
      
      // Retornar el usuario y token directamente desde la respuesta de Strapi
      return {
        jwt: response.jwt,
        user: {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          role: userRole,
          numcontrol: response.user.Numcontrol || '',
          createdAt: response.user.createdAt
        }
      };
    } catch (error: any) {
      console.error("Error detallado en login:", error);
      if (error.message.includes('timeout') || error.message.includes('Failed to fetch')) {
        throw new Error('No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.');
      }
      throw error;
    }
  },

  // Registrar usuario usando la API de Strapi
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    numcontrol?: string;
  }) => {
    try {
      // Preparar datos básicos para el registro
      const registrationData = {
        username: userData.username,
        email: userData.email,
        password: userData.password
      };

      console.log("Intentando registrar usuario con datos:", JSON.stringify(registrationData, null, 2));
      
      // Llamar al endpoint de registro
      const response = await fetchAPI('/api/auth/local/register', {
        method: 'POST',
        body: JSON.stringify(registrationData),
      });
      
      console.log("Respuesta al registro:", JSON.stringify(response, null, 2));
      
      if (!response.jwt) {
        throw new Error('No se recibió token de autenticación en la respuesta');
      }
      
      // Guardar el token y el rol del usuario en localStorage
      // Por defecto, los usuarios nuevos tienen rol "Alumno"
      const initialRole = 'Alumno';
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('bibliotech-token', response.jwt);
        localStorage.setItem('bibliotech-role', initialRole);
        console.log(`Token y rol guardados en localStorage: ${initialRole}`);
      }
      
      // Si el registro fue exitoso y tenemos numcontrol, actualizar el usuario
      if (userData.numcontrol) {
        try {
          console.log(`Actualizando numcontrol (${userData.numcontrol}) para usuario ID:`, response.user.id);
          
          await fetchAPI(`/api/users/${response.user.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${response.jwt}`
            },
            body: JSON.stringify({
              numcontrol: userData.numcontrol,
              rol: initialRole // Asegurarnos de asignar el rol inicial
            })
          });
          
          // Actualizar el usuario en la respuesta local
          response.user = {...response.user, numcontrol: userData.numcontrol, rol: initialRole};
        } catch (updateError) {
          console.error("Error al actualizar numcontrol:", updateError);
        }
      }
      
      return {
        jwt: response.jwt,
        user: {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          numcontrol: userData.numcontrol || '',
          role: initialRole,
          createdAt: response.user.createdAt
        }
      };
    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    }
  },

  // Cerrar sesión
  logout: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('bibliotech-token');
      localStorage.removeItem('bibliotech-role');
    }
  },

  // Obtener el usuario actual
  getMe: async (token: string) => {
    try {
      const response = await fetchAPI('/api/users/me?populate=role', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response) {
        throw new Error('No se pudo obtener la información del usuario');
      }
      
      // Comprobar primero el campo rol, luego el campo role.type como fallback
      const userRole = response.rol || response.role?.type || 'authenticated';
      
      // Actualizar el role en localStorage por si ha cambiado
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('bibliotech-role', userRole);
      }
      
      return {
        id: response.id,
        username: response.username,
        email: response.email,
        role: userRole,
        numcontrol: response.Numcontrol || '',
        createdAt: response.createdAt
      };
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      throw error;
    }
  }
}; 