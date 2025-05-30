# CreatorRoadmap

![CreatorRoadmap Logo](generated-icon.png)

CreatorRoadmap is a modern web application designed to help content creators plan and manage their careers. Built with modern technologies and a robust architecture.

## 🚀 Features

- Modern and responsive user interface
- Secure authentication system
- Content management and planning
- Payment service integration (Stripe)
- Multi-language support
- Smooth animations and transitions
- Responsive design for all devices

## 🛠️ Main Technologies

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

- **Authentication:**
  - Firebase
  - Passport.js

## 📦 Installation

1. Clone the repository:

```bash
git clone [URL_DEL_REPOSITORIO]
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   Create a `.env` file in the project root with the following variables:

```env
DATABASE_URL=tu_url_de_base_de_datos
STRIPE_SECRET_KEY=tu_clave_secreta_de_stripe
FIREBASE_CONFIG=tu_configuracion_de_firebase
```

4. Start the database:

```bash
npm run db:push
```

5. Start the development server:

```bash
npm run dev
```

## 🚀 Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the application for production
- `npm run start` - Starts the application in production mode
- `npm run check` - Checks TypeScript types
- `npm run db:push` - Updates the database

## 📁 Project Structure

```
├── client/          # Frontend code
├── server/          # Backend code
├── shared/          # Code shared between frontend and backend
├── public/          # Static files
└── attached_assets/ # Attached resources
```

## 🤝 Contribution

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

[Tu información de contacto]
