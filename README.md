# BiblioTeK 📚

BiblioTeK es un sistema de gestión de biblioteca moderno desarrollado para el Tecnológico de Tijuana, construido con Next.js y Strapi.

## Características Principales 🌟

- 🔐 Autenticación de usuarios con roles específicos
- 👥 Sistema de registro para alumnos con validación de correo institucional
- 🏫 Integración con carreras y campus del Tecnológico
- 🌓 Modo claro/oscuro
- 📱 Diseño responsivo
- 🔒 Validación de formularios con Zod
- 🎨 Interfaz moderna construida con Tailwind CSS y shadcn/ui

## Tecnologías Utilizadas 🛠️

- **Frontend:**
  - Next.js 14
  - React
  - TypeScript
  - Tailwind CSS
  - shadcn/ui
  - React Hook Form
  - Zod

- **Backend:**
  - Strapi
  - JWT Authentication

## Requisitos Previos 📋

- Node.js (versión 18 o superior)
- npm o yarn
- Strapi instalado localmente

## Instalación 🚀

1. Clona el repositorio:
   ```bash
   git clone https://github.com/migueldrlds/bibliteK.git
   cd bibliteK
   ```

2. Instala las dependencias:
   ```bash
   npm install
   # o
   yarn install
   ```

3. Configura las variables de entorno:
   Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:
   ```
   NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   # o
   yarn dev
   ```

## Estructura del Proyecto 📁

```
bibliteK/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   └── ...
├── components/
│   └── ui/
├── hooks/
└── ...
```

## Contribución 🤝

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz un Fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia 📄

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.


## Agradecimientos 🙏

- Tecnológico de Tijuana
- Comunidad de Next.js
- Comunidad de Strapi 
