# CreatorRoadmap

CreatorRoadmap es una aplicación web moderna diseñada para ayudar a los creadores de contenido a planificar y gestionar su carrera. Construida con tecnologías modernas y una arquitectura robusta.

## 🚀 Características

- Interfaz de usuario moderna y responsiva
- Sistema de autenticación seguro
- Gestión de contenido y planificación
- Integración con servicios de pago (Stripe)
- Soporte multiidioma
- Animaciones fluidas y transiciones suaves
- Diseño adaptable a diferentes dispositivos

## 🛠️ Tecnologías Principales

- **Frontend:**

  - React 18
  - TypeScript
  - TailwindCSS
  - Radix UI
  - Framer Motion
  - GSAP
  - React Query

- **Backend:**

  - Express.js
  - TypeScript
  - Drizzle ORM
  - PostgreSQL (Neon Database)
  - WebSocket

- **Autenticación:**
  - Firebase
  - Passport.js

## 📦 Instalación

1. Clona el repositorio:

```bash
git clone [URL_DEL_REPOSITORIO]
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno:
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
DATABASE_URL=tu_url_de_base_de_datos
STRIPE_SECRET_KEY=tu_clave_secreta_de_stripe
FIREBASE_CONFIG=tu_configuracion_de_firebase
```

4. Inicia la base de datos:

```bash
npm run db:push
```

5. Inicia el servidor de desarrollo:

```bash
npm run dev
```

## 🚀 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia la aplicación en modo producción
- `npm run check` - Verifica los tipos de TypeScript
- `npm run db:push` - Actualiza la base de datos

## 📁 Estructura del Proyecto

```
├── client/          # Código del frontend
├── server/          # Código del backend
├── shared/          # Código compartido entre frontend y backend
├── public/          # Archivos estáticos
└── attached_assets/ # Recursos adjuntos
```

## 🤝 Contribución

1. Haz un Fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📧 Contacto

[Tu información de contacto]
